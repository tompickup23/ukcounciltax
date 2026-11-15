/** Towns dataset: full Band D for every parish area and unparished area in England,
 * 2026/27, with region, county, council and Westminster constituency.
 * Writes data/towns/england-2026-27.json. Rules and evidence: docs/TOWNS-SOURCE-NOTES.md.
 *
 * Inputs (all pinned by sha256):
 *   data/national/england.json      MHCLG parish return and Table 10 (scripts/import-national.mjs)
 *   data/council-tax/england-2026-27.json  region and class per council (MHCLG Tables 1 to 9)
 *   data/registry/councils.json     council slug and display name
 *   data/raw/ons/*.csv              ONS lookups (data/towns/sources.json); fetched when absent
 *   data/towns/constituencies.json  constituency slugs copied from UK Places
 *   data/towns/overrides.json       reviewed name matches, row by row
 *   data/towns/schedules/*.json     councils' own published schedules
 *
 *   node scripts/import-towns.mjs            write the dataset
 *   node scripts/import-towns.mjs --review   print the rows that need a reviewed override
 */
import {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readCsv, base, matchName, keys} from './lib/towns-match.mjs';

const fail = message => { throw new Error(message); };
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const REVIEW = process.argv.includes('--review');
const YEAR = '2026-27', PREVIOUS = '2025-26';
const LARGER_PLACE_TAX_BASE = 2000; // decision T3, 15 November 2026
const UNPARISHED_MIN_TAX_BASE = 1; // fully parished councils differ by rounding only (under 1 Band D equivalent)

const national = read('data/national/england.json');
const ctax = read('data/council-tax/england-2026-27.json');
const registry = new Map(Object.values(read('data/registry/councils.json').councils).map(c => [c.gss, c]));
const sources = read('data/towns/sources.json');
const constituencyFile = read('data/towns/constituencies.json');
const overrides = read('data/towns/overrides.json');

// ONS lookups: the portal's own CSV downloads, pinned by hash.
mkdirSync('data/raw/ons', {recursive: true});
const ons = {};
for (const [key, source] of Object.entries(sources)) {
  const path = `data/raw/${source.file}`;
  if (!existsSync(path)) {
    const response = await fetch(source.downloadUrl);
    if (!response.ok) fail(`${key}: HTTP ${response.status}`);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  if (sha(path) !== source.sha256) fail(`${key}: ONS file changed; review before importing`);
  ons[key] = readCsv(readFileSync(path, 'utf8'));
}

const y = p => p.years[YEAR];
const published = national.parishes.filter(p => y(p).status === 'published');
if (published.length !== 10241) fail(`Expected 10,241 published parish rows, found ${published.length}`);
const kindOf = type => ({'precepting parish': 'parish', 'non-precepting parish': 'parish', 'group': 'group', 'charter trustee': 'charter trustees', 'temple': 'temple'})[type.toLowerCase()] ?? fail(`Unknown parish type ${type}`);

// ONS parishes by council, ward and constituency.
const onsParish = new Map(), onsByLad = new Map(), parishWards = new Map(), ladWards = new Map(), wardPcon = new Map(), pconName = new Map();
for (const r of ons.parishWard) {
  if (!r.PAR25CD.startsWith('E04')) continue;
  if (!onsParish.has(r.PAR25CD)) {
    const entry = {code: r.PAR25CD, name: r.PAR25NM, lad: r.LAD25CD, k: keys(r.PAR25NM)[0]};
    onsParish.set(r.PAR25CD, entry);
    onsByLad.set(r.LAD25CD, [...(onsByLad.get(r.LAD25CD) ?? []), entry]);
  }
  parishWards.set(r.PAR25CD, new Set([...(parishWards.get(r.PAR25CD) ?? []), r.WD25CD]));
}
const splitWards = new Set();
for (const r of ons.wardConstituency) {
  if (!r.WD25CD.startsWith('E05')) continue;
  wardPcon.set(r.WD25CD, new Set([...(wardPcon.get(r.WD25CD) ?? []), r.PCON24CD]));
  ladWards.set(r.LAD25CD, new Set([...(ladWards.get(r.LAD25CD) ?? []), r.WD25CD]));
  pconName.set(r.PCON24CD, r.PCON24NM);
  if (/^(yes|true)$/i.test(r.SPLIT_WARD)) splitWards.add(r.WD25CD);
}
const constituencies = constituencyFile.constituencies, caseDiffers = [];
for (const [code, name] of pconName) {
  if (!code.startsWith('E14')) continue;
  const c = constituencies[code] ?? fail(`Constituency ${code} ${name} has no estate slug`);
  if (c.name.toLowerCase() !== name.toLowerCase()) fail(`Constituency name differs: ONS ${name}, UK Places ${c.name}`);
  if (c.name !== name) caseDiffers.push(`${code} ONS "${name}", UK Places "${c.name}"`);
}
// Names as ONS prints them; slugs from UK Places.
const pconRef = code => ({code, name: pconName.get(code), slug: constituencies[code].slug});
function constituenciesOf(onsCodes) {
  const wards = new Set(onsCodes.flatMap(c => [...(parishWards.get(c) ?? fail(`No ward for ${c}`))]));
  const pcons = new Set([...wards].flatMap(w => [...(wardPcon.get(w) ?? [])]));
  return {codes: [...pcons].sort(), splitWard: [...wards].some(w => splitWards.has(w))};
}

// County: ONS LAD to County (December 2024) for districts; the unitary itself otherwise.
const ladCounty = new Map(ons.ladCounty.map(r => [r.LAD24CD, r.CTY24NM]));
const countyCorroborated = [];
function countyOf(gss) {
  const a = ctax.authorities[gss], reg = registry.get(gss);
  if (a.classCode === 'UA') return {county: reg.name, countyKind: 'unitary'};
  // London: ONS and MHCLG differ on Inner or Outer London for some boroughs, so both are held as Greater London.
  if (a.classCode === 'ILB' || a.classCode === 'OLB') return {county: 'Greater London', countyKind: 'london'};
  const onsName = ladCounty.get(gss);
  if (onsName && a.area && onsName !== a.area) fail(`County differs for ${gss}: ONS ${onsName}, MHCLG ${a.area}`);
  const county = onsName ?? a.area ?? fail(`No county for ${gss}`);
  if (!onsName) countyCorroborated.push(gss);
  return {county, countyKind: a.classCode === 'SD' ? 'shire county' : a.classCode === 'MD' ? 'metropolitan county' : 'london'};
}

const slugify = text => text.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const place = name => name.replace(/\s*\(\s*grouped\b.*$/i, '').replace(/\s*\(removed\)\s*$/i, '').trim();

// Name matching, then reviewed overrides.
const overrideBy = new Map(overrides.accepted.map(o => [o.mhclgCode, o]));
const rejectedBy = new Map(overrides.rejected.map(o => [o.mhclgCode, o]));
const matches = new Map(), review = [];
for (const p of published) {
  const kind = kindOf(p.type);
  if (kind === 'charter trustees' || kind === 'temple') { matches.set(p.code, {how: kind === 'temple' ? 'no-ons-parish' : 'charter-trustees', codes: []}); continue; }
  const o = overrideBy.get(p.code);
  if (o) {
    if (o.councilGss !== p.gss || o.name !== p.name) fail(`Override ${p.code} does not match the source row`);
    for (const c of o.ons) if (onsParish.get(c.code)?.lad !== p.gss || onsParish.get(c.code).name !== c.name) fail(`Override ${p.code}: ${c.code} is not ${c.name} in ${p.gss}`);
    matches.set(p.code, {how: 'override', codes: o.ons.map(c => c.code)});
    continue;
  }
  const m = matchName(p.name, onsByLad.get(p.gss) ?? []);
  if (m.how.startsWith('review') || m.how === 'same-name-twice') {
    if (!rejectedBy.has(p.code)) review.push({code: p.code, gss: p.gss, council: registry.get(p.gss).name, name: p.name, type: p.type, how: m.how, suggestion: (m.suggestion ?? m.codes).map(c => `${c} ${onsParish.get(c).name}`), score: m.score});
    matches.set(p.code, {how: rejectedBy.has(p.code) ? 'unmatched' : m.how, codes: []});
  } else matches.set(p.code, m);
}
for (const o of overrides.accepted) if (!matches.has(o.mhclgCode)) fail(`Override ${o.mhclgCode} is not a published row`);
if (REVIEW) { for (const r of review) console.log(JSON.stringify(r)); console.log(`${review.length} rows need review`); process.exit(0); }
if (review.length) fail(`${review.length} rows need a reviewed override or rejection; run with --review`);

// Councils' own schedules (session 3 adds special expense councils in this shape).
const schedules = new Map(), scheduleSources = {};
if (existsSync('data/towns/schedules')) for (const file of readdirSync('data/towns/schedules').filter(f => f.endsWith(`-${YEAR}.json`)).sort()) {
  const s = read(`data/towns/schedules/${file}`);
  if (s.year !== YEAR || !national.components[s.council.gss]) fail(`Schedule ${file}: wrong year or council`);
  schedules.set(s.council.gss, s);
  scheduleSources[s.council.gss] = {...s.source, schedule: `data/towns/schedules/${file}`, scheduleSha256: sha(`data/towns/schedules/${file}`)};
}

// Group members with no tax base take the carrying row's figure only when the
// "(grouped with ...)" text resolves to exactly one carrying row in the council.
const norm = s => ` ${s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()} `;
const bracketOf = s => s.includes('(') ? norm(s.slice(s.indexOf('('))) : '';
function carrierOf(member) {
  const m = /\(\s*grouped with\s*(.*?)\)?\s*$/i.exec(member.name);
  if (!m) return null;
  const W = norm(m[1]), M = norm(place(member.name));
  const candidates = published.filter(c => c.gss === member.gss && c !== member && y(c).taxBase > 0 && !['charter trustees', 'temple'].includes(kindOf(c.type)));
  let hit = candidates.filter(c => bracketOf(c.name).includes(M));
  if (hit.length !== 1) { hit = candidates.filter(c => W.includes(norm(place(c.name)))); hit = hit.filter(h => !hit.some(o => o !== h && norm(place(o.name)).includes(norm(place(h.name))))); }
  if (hit.length !== 1) hit = candidates.filter(c => norm(place(c.name)).includes(M));
  return hit.length === 1 ? hit[0] : null;
}

const NOTES = {
  calculated: 'Calculated from published MHCLG figures: the council\'s Band D excluding local precepts (Table 10, line 9), plus the parish Band D (parish return), plus the Band D precepts of the county council or GLA, police, fire and combined authority (Table 10, line 16). Exact to the billed penny where the council charges no special expenses, apart from possible 1p rounding in the parish Band D as reported (MHCLG note h).',
  groupMember: 'This parish is grouped with others for precepting purposes (MHCLG note f) and has no tax base of its own. It takes the Band D of the one row in the council that carries the group\'s precept and tax base.',
  groupUnresolved: 'This parish is grouped with others for precepting purposes (MHCLG note f) and has no tax base of its own. The return does not identify one row that carries its group, so it is listed under its group and not put in order.',
  specialExpenses: 'This council charges special expenses in parts of its area. The national tables spread them across the whole council, so they cannot give the bill in each parish or unparished area. Per area totals are published by the council only.',
  schedule: 'The council\'s own published schedule of council tax by area, quoted as printed.',
  unparished: 'The part of the council area with no parish council: the council\'s Band D excluding local precepts (Table 10, line 9) plus the major precepts. Its tax base is calculated as the council\'s tax base (Table 10, line 7) less the sum of the parish tax bases.',
  unparishedTrustee: 'The part of the council area with no parish council, which charter trustees cover in full (their tax base equals the unparished tax base). The trustees\' Band D is added.',
  trusteeInUnparished: 'Charter trustees cover the whole unparished area of this council. Their Band D is included in the unparished area\'s figure, so it is not shown as a separate place.',
  trusteeInSchedule: 'The council\'s own schedule marks each parish and unparished area that the charter trustees cover, and its figures include their Band D, so they are not shown as a separate place.',
  partialTrustee: 'Charter trustees cover only part of the unparished area of this council, so it has more than one Band D and the national tables cannot say which applies where.',
  negative: 'A negative precept as published: the council returns rental income from parish land to residents as a reduction on their council tax (MHCLG note i).',
  rounding: 'Parish Band D amounts are as reported by councils and billed, so they may differ by 1p from the precept divided by the tax base (MHCLG note h). They are used as published.',
  constituencySplit: 'The wards this area touches lie in more than one constituency (ONS ward to constituency lookup). It is listed under each and never apportioned.',
  constituencyUnmatched: 'Not matched to an ONS parish code by name, so no constituency is given.',
  constituencyNone: 'Charter trustee and Temple areas have no ONS parish code, so no constituency is given.',
  constituencyUnparished: 'Constituencies of the council\'s wards that contain no parish (ONS lookups). Wards that are partly parished are not counted, so the list may be incomplete.',
  constituencyNoWard: 'Every ward in this council contains a parish, so the unparished area cannot be placed in a constituency from the ONS lookups.',
  noComparison: 'Not comparable: a full bill change needs 2025/26 Table 10 components, which this dataset does not hold. The parish part change is from the same row of the parish return.',
};
const STATUS = {
  calculated: 'Calculated from published MHCLG figures',
  'calculated-group-member': 'Calculated from published MHCLG figures (group)',
  'council-schedule': 'Published by the council',
  'special-expenses': 'Published by the council only',
  'group-member-unresolved': 'Listed under its group',
  'charter-trustees-included': 'Included in the areas it covers',
  'partial-charter-trustee-cover': 'Not available: partial charter trustee cover',
};
const WITH_FIGURE = new Set(['calculated', 'calculated-group-member', 'council-schedule']);

const rows = [];
const councils = {};
const parishesBy = new Map();
for (const p of published) parishesBy.set(p.gss, [...(parishesBy.get(p.gss) ?? []), p]);

for (const [gss, c] of Object.entries(national.components)) {
  const a = ctax.authorities[gss], reg = registry.get(gss) ?? fail(`No registry row for ${gss}`);
  const {county, countyKind} = countyOf(gss);
  const majors = Object.fromEntries(c.parts.map(p => [p.kind, p.bandDPence]));
  if (c.parts.some(p => p.bandDPence === null) || c.ownExcludingParishPence === null) fail(`Incomplete components ${gss}`);
  const majorsTotal = c.parts.reduce((s, p) => s + p.bandDPence, 0);
  const special = c.specialExpensesPounds > 0;
  const schedule = schedules.get(gss);
  const scheduleBy = new Map((schedule?.areas ?? []).filter(x => x.mhclgCode).map(x => [x.mhclgCode, x]));
  councils[gss] = {name: reg.name, slug: reg.slug, mhclgName: a.name, region: a.region, regionCode: a.regionCode, classCode: a.classCode, county, countyKind,
    ownExcludingParishPence: c.ownExcludingParishPence, parts: c.parts.map(p => ({kind: p.kind, name: p.name && p.name.replace(/\s+[-\u2013\u2014]\s+/g, ', '), bandDPence: p.bandDPence})), // house style: the MHCLG spaced hyphen in body names becomes a comma
    specialExpensesPounds: c.specialExpensesPounds, taxBase: c.taxBase, schedule: schedule ? scheduleSources[gss].schedule : null};
  const common = {councilGss: gss, councilName: reg.name, councilSlug: reg.slug, region: a.region, regionCode: a.regionCode, county, countyKind};
  const ps = parishesBy.get(gss) ?? [];
  const trustees = ps.filter(p => kindOf(p.type) === 'charter trustees');
  const parishBase = ps.filter(p => !['charter trustees', 'temple'].includes(kindOf(p.type))).reduce((s, p) => s + y(p).taxBase, 0);
  const unparishedBase = Math.round((c.taxBase - parishBase) * 100) / 100;
  const fullTrustee = trustees.length === 1 && Math.abs(y(trustees[0]).taxBase - unparishedBase) < 0.1 ? trustees[0] : null;

  for (const p of ps) {
    const yr = y(p), kind = kindOf(p.type), m = matches.get(p.code);
    const row = {code: p.code, slug: '', name: p.name, place: place(p.name), label: `${place(p.name)}, ${reg.name}`, kind, type: p.type.replace(/^Precepting Parish$/, 'Precepting parish'), ...common,
      constituencies: [], constituencySplit: false, constituencyNote: null, match: {how: m.how, ons: m.codes.map(code => ({code, name: onsParish.get(code).name}))},
      fullBandDPence: null, status: '', noteIds: [], parts: null, parishChangePence: null, fullChange: 'Not comparable',
      taxBase: yr.taxBase, taxBaseBasis: 'published', largerPlace: yr.taxBase >= LARGER_PLACE_TAX_BASE, groupCarrier: null, groupLabel: null, mhclgNotes: p.notes.map(n => n.id)};
    const before = p.years[PREVIOUS];
    if (before.status === 'published' && before.bandDPence !== null && yr.bandDPence !== null) row.parishChangePence = yr.bandDPence - before.bandDPence;
    if (m.codes.length) {
      const pc = constituenciesOf(m.codes);
      row.constituencies = pc.codes.map(pconRef); row.constituencySplit = pc.codes.length > 1;
      if (row.constituencySplit) row.constituencyNote = 'constituencySplit';
    } else row.constituencyNote = kind === 'charter trustees' || kind === 'temple' ? 'constituencyNone' : 'constituencyUnmatched';
    if (yr.bandDPence < 0) row.noteIds.push('negative');

    let parishPence = yr.bandDPence, status;
    if (kind === 'group' && !(yr.taxBase > 0)) {
      const carrier = carrierOf(p);
      if (carrier) { row.groupCarrier = carrier.code; parishPence = y(carrier).bandDPence; status = 'calculated-group-member'; row.noteIds.push('groupMember'); }
      else { status = 'group-member-unresolved'; const label = /\(([^)]*)\)?/.exec(p.name.replace(/\(\s*grouped with/i, '(')); row.groupLabel = label ? label[1].trim() : null; row.noteIds.push('groupUnresolved'); }
    } else status = 'calculated';
    if (kind === 'charter trustees') status = special && !schedule ? 'special-expenses' : fullTrustee === p || schedule?.areas.some(x => x.includesCharterTrustee) ? 'charter-trustees-included' : 'partial-charter-trustee-cover';
    if (kind === 'temple') status = 'special-expenses';
    const fromSchedule = scheduleBy.get(p.code) ?? (row.groupCarrier ? scheduleBy.get(row.groupCarrier) : null);
    if (schedule && status !== 'group-member-unresolved' && kind !== 'charter trustees') {
      if (fromSchedule) { status = 'council-schedule'; row.fullBandDPence = fromSchedule.bandDPence; row.schedule = {name: fromSchedule.name, quoted: fromSchedule.quoted, includesCharterTrustee: fromSchedule.includesCharterTrustee}; row.noteIds.push('schedule'); }
      else if (special || kind === 'temple') status = 'special-expenses';
      else fail(`${p.code} ${p.name}: council schedule held but the row is not in it`);
    } else if (special && status !== 'group-member-unresolved' && kind !== 'charter trustees') status = 'special-expenses';
    if (status === 'special-expenses') row.noteIds.push('specialExpenses');
    if (status === 'calculated' || status === 'calculated-group-member') {
      row.parts = {ownPence: c.ownExcludingParishPence, parishPence, charterTrusteesPence: 0, countyPence: majors.county, policePence: majors.police, firePence: majors.fire, combinedPence: majors.combined};
      row.fullBandDPence = c.ownExcludingParishPence + parishPence + majorsTotal;
      row.noteIds.push('calculated', 'rounding');
    }
    if (status === 'charter-trustees-included') row.noteIds.push(fullTrustee === p ? 'trusteeInUnparished' : 'trusteeInSchedule');
    if (status === 'partial-charter-trustee-cover') row.noteIds.push('partialTrustee');
    row.status = status;
    rows.push(row);
  }

  // Unparished areas.
  if (unparishedBase <= UNPARISHED_MIN_TAX_BASE) continue;
  const onsParishWards = new Set((onsByLad.get(gss) ?? []).flatMap(o => [...parishWards.get(o.code)]));
  const freeWards = [...(ladWards.get(gss) ?? [])].filter(w => !onsParishWards.has(w));
  const pcons = [...new Set(freeWards.flatMap(w => [...wardPcon.get(w)]))].sort();
  const unparished = (suffix, name, extra) => ({code: `${a.ecode}U${suffix}`, slug: '', name, place: name, label: `${name}, ${reg.name}`, kind: 'unparished', type: 'Unparished area', ...common,
    constituencies: pcons.map(pconRef), constituencySplit: pcons.length > 1, constituencyNote: pcons.length ? 'constituencyUnparished' : 'constituencyNoWard', match: {how: 'unparished', ons: []},
    fullBandDPence: null, status: '', noteIds: [], parts: null, parishChangePence: null, fullChange: 'Not comparable',
    taxBase: unparishedBase, taxBaseBasis: 'calculated', largerPlace: unparishedBase >= LARGER_PLACE_TAX_BASE, groupCarrier: null, groupLabel: null, mhclgNotes: [], ...extra});
  const areas = schedule?.areas.filter(x => x.kind === 'unparished') ?? [];
  if (schedule && areas.length) {
    areas.forEach((x, i) => rows.push(unparished(areas.length > 1 ? String(i + 1) : '', `${reg.name} ${x.name.replace(/^Unparished Areas?/i, 'unparished area').replace(/^City excluding Temples$/, 'unparished area')}`.replace(/ unparished area in the /, ' unparished area, '), {
      status: 'council-schedule', fullBandDPence: x.bandDPence, schedule: {name: x.name, quoted: x.quoted, includesCharterTrustee: x.includesCharterTrustee}, noteIds: ['schedule'],
      taxBase: areas.length > 1 ? null : unparishedBase, taxBaseBasis: areas.length > 1 ? 'not published by area' : 'calculated', largerPlace: areas.length > 1 ? false : unparishedBase >= LARGER_PLACE_TAX_BASE})));
    continue;
  }
  const row = unparished('', `${reg.name} unparished area`, {});
  if (special) { row.status = 'special-expenses'; row.noteIds.push('specialExpenses'); }
  else if (trustees.length && !fullTrustee) { row.status = 'partial-charter-trustee-cover'; row.noteIds.push('partialTrustee'); }
  else {
    const trusteePence = fullTrustee ? y(fullTrustee).bandDPence : 0;
    row.status = 'calculated';
    row.parts = {ownPence: c.ownExcludingParishPence, parishPence: 0, charterTrusteesPence: trusteePence, countyPence: majors.county, policePence: majors.police, firePence: majors.fire, combinedPence: majors.combined};
    row.fullBandDPence = c.ownExcludingParishPence + trusteePence + majorsTotal;
    row.noteIds.push(fullTrustee ? 'unparishedTrustee' : 'unparished');
    if (fullTrustee) row.charterTrustees = fullTrustee.code;
  }
  rows.push(row);
}

// Slugs: place plus council; a repeat within a council takes the former district from its override, then the code.
const seen = new Map();
for (const r of rows) {
  const o = overrideBy.get(r.code);
  r.slug = slugify(r.kind === 'unparished' ? r.place : `${r.place} ${r.councilSlug}`);
  if (r.kind === 'unparished') r.label = r.place;
  if (o?.formerDistrict) { r.slug = slugify(`${r.place} ${o.formerDistrict} ${r.councilSlug}`); r.label = `${r.place} (former ${o.formerDistrict} district), ${r.councilName}`; }
  seen.set(r.slug, (seen.get(r.slug) ?? 0) + 1);
}
for (const r of rows) if (seen.get(r.slug) > 1) r.slug = slugify(`${r.place} ${r.councilSlug} ${r.code}`);
if (new Set(rows.map(r => r.slug)).size !== rows.length || new Set(rows.map(r => r.code)).size !== rows.length) fail('Duplicate slug or code');

// Checks.
for (const r of rows) {
  if (!STATUS[r.status]) fail(`Unknown status ${r.status} on ${r.code}`);
  if (WITH_FIGURE.has(r.status) !== (r.fullBandDPence !== null)) fail(`Figure and status disagree on ${r.code}`);
}
const partial = [...new Set(rows.filter(r => r.status === 'partial-charter-trustee-cover').map(r => r.councilGss))].sort();
if (partial.join() !== ['E07000171', 'E07000174'].join()) fail(`Unexpected partial charter trustee councils: ${partial}`);
const count = f => rows.filter(f).length;
const counts = {
  rows: rows.length, publishedParishRows: published.length, unparishedRows: count(r => r.kind === 'unparished'),
  withFigure: count(r => r.fullBandDPence !== null), withoutFigure: count(r => r.fullBandDPence === null),
  byStatus: Object.fromEntries(Object.keys(STATUS).map(s => [s, count(r => r.status === s)])),
  byKind: Object.fromEntries(['parish', 'group', 'unparished', 'charter trustees', 'temple'].map(k => [k, count(r => r.kind === k)])),
  largerPlaces: count(r => r.largerPlace), largerPlacesWithFigure: count(r => r.largerPlace && r.fullBandDPence !== null),
  match: Object.fromEntries([...new Set(rows.map(r => r.match.how))].sort().map(h => [h, count(r => r.match.how === h)])),
  withConstituency: count(r => r.constituencies.length > 0), constituencySplit: count(r => r.constituencySplit),
  constituencies: new Set(rows.flatMap(r => r.constituencies.map(c => c.code))).size,
  overridesAccepted: overrides.accepted.length, overridesRejected: overrides.rejected.length,
  councilsWithSpecialExpensesAndParishes: Object.entries(national.components).filter(([g, c]) => c.specialExpensesPounds > 0 && parishesBy.has(g)).length,
};
if (counts.publishedParishRows + counts.unparishedRows !== counts.rows) fail('Rows not accounted for');

// Compact rows: council detail lives in councils, constituency names in constituencies.
function compact(r) {
  const out = {code: r.code, slug: r.slug, name: r.name, place: r.place, label: r.label, kind: r.kind, type: r.type,
    councilGss: r.councilGss, councilName: r.councilName, region: r.region, county: r.county,
    constituencies: r.constituencies.map(c => c.code), constituencySplit: r.constituencySplit, constituencyNote: r.constituencyNote,
    match: {how: r.match.how, ons: r.match.ons.map(o => o.code)},
    fullBandDPence: r.fullBandDPence, status: r.status, noteIds: r.noteIds,
    // Own, county or GLA, police, fire and combined parts are the council's (councils[gss]); the loader joins them.
    parts: r.parts && {parish: r.parts.parishPence, trustees: r.parts.charterTrusteesPence},
    parishChangePence: r.parishChangePence, taxBase: r.taxBase, taxBaseBasis: r.taxBaseBasis, largerPlace: r.largerPlace, mhclgNotes: r.mhclgNotes};
  for (const k of ['groupCarrier', 'groupLabel', 'schedule', 'charterTrustees']) if (r[k] != null) out[k] = r[k];
  // Defaults the loader restores (src/lib/towns.ts): place = name; label = place, council; no notes.
  if (out.place === out.name) delete out.place;
  if (out.label === (r.kind === 'unparished' ? r.place : `${r.place}, ${r.councilName}`)) delete out.label;
  if (!out.mhclgNotes.length) delete out.mhclgNotes;
  if (out.constituencyNote === null) delete out.constituencyNote;
  if (out.taxBaseBasis === 'published') delete out.taxBaseBasis;
  if (!out.constituencySplit) delete out.constituencySplit;
  if (!out.largerPlace) delete out.largerPlace;
  // Rows calculated by rule 1 carry the two standard notes; the loader restores them.
  if (out.noteIds.join() === 'calculated,rounding') delete out.noteIds;
  return out;
}
const nsrc = national.sources;
const output = {
  schemaVersion: 1, year: YEAR,
  title: 'Full Band D council tax by parish and unparished area, England, 2026/27',
  method: {formula: 'Full Band D = Table 10 line 9 (council Band D excluding local precepts) + parish Band D + county or GLA, police, fire and combined authority Band D (Table 10 line 16)',
    label: 'A calculation from published MHCLG figures, except rows with status "council-schedule", which are the council\'s own published figures',
    largerPlaceTaxBase: LARGER_PLACE_TAX_BASE, largerPlaceLabel: 'Tax base of 2,000 Band D equivalents or more, as published; a tax base, not a population',
    unparishedMinimumTaxBase: UNPARISHED_MIN_TAX_BASE, positions: 'Standard competition ranking over rows with a figure only; ties share a position', notes: 'docs/TOWNS-SOURCE-NOTES.md'},
  sources: {
    parishes: {...nsrc.parishes}, components: {...nsrc.components},
    councilTax: {publisher: ctax.source?.publisher ?? 'MHCLG', title: ctax.source?.title ?? null, use: 'region, class and area per council', file: 'data/council-tax/england-2026-27.json', sha256: sha('data/council-tax/england-2026-27.json')},
    nationalImport: {file: 'data/national/england.json', sha256: sha('data/national/england.json')},
    ...Object.fromEntries(Object.entries(sources).map(([k, s]) => [k, s])),
    constituencySlugs: {...constituencyFile.source, file: 'data/towns/constituencies.json', fileSha256: sha('data/towns/constituencies.json')},
    overrides: {file: 'data/towns/overrides.json', sha256: sha('data/towns/overrides.json')},
    councilSchedules: scheduleSources,
    constituencyNameCase: caseDiffers.length ? `Constituency names follow ONS; UK Places differs in letter case only for: ${caseDiffers.join('; ')}` : null,
    countyFallback: countyCorroborated.length ? `Not in the ONS December 2024 lookup, county taken from MHCLG Table 9 area: ${countyCorroborated.join(', ')}` : null,
  },
  fullChange: 'Not comparable', fullChangeNote: 'noComparison',
  notes: NOTES, statusLabels: STATUS, statusesWithFigure: [...WITH_FIGURE], counts, councils,
  constituencies: Object.fromEntries([...new Set(rows.flatMap(r => r.constituencies.map(c => c.code)))].sort().map(code => [code, {name: pconName.get(code), slug: constituencies[code].slug}])),
  rows: rows.map(compact),
};
mkdirSync('data/towns', {recursive: true});
const json = JSON.stringify(output, null, 0).replace(/,"rows":\[/, ',"rows":[\n').replace(/\},\{"code"/g, '},\n{"code"');
writeFileSync('data/towns/england-2026-27.json', json + '\n');
console.log(JSON.stringify(counts, null, 1));
