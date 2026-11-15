/** Councils' own published 2026/27 charge schedules for the towns dataset, where the
 * national tables cannot give an exact full Band D (docs/TOWNS-SOURCE-NOTES.md).
 * Raw pages are kept under data/raw/schedules/ (not committed); each JSON written
 * here pins the raw file by sha256 and quotes the printed row text.
 * Session 3 (data/special-expense-schedules) adds the special expense councils in
 * the same shape.
 */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {base} from './lib/towns-match.mjs';

const fail = message => { throw new Error(message); };
const national = JSON.parse(readFileSync('data/national/england.json', 'utf8'));
const BANDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const pence = text => { const m = /^-?[\d,]+\.\d{2}$/.exec(text.replace(/£/g, '').trim()); if (!m) fail(`Not a money cell: ${text}`); return Math.round(Number(m[0].replace(/,/g, '')) * 100); };
const cellText = html => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/​/g, '').replace(/\s+/g, ' ').trim();
const tables = html => [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(t => [...t[0].matchAll(/<tr[\s\S]*?<\/tr>/g)].map(r => [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => cellText(c[1]))));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const y = p => p.years['2026-27'];

function mapToMhclg(gss, areas, manual) {
  const rows = national.parishes.filter(p => p.gss === gss && y(p).status === 'published');
  const byKey = new Map();
  for (const p of rows) { const k = base(p.name.replace(/\s*\(.*$/, '')); byKey.set(k, [...(byKey.get(k) ?? []), p]); }
  const unmapped = [];
  for (const area of areas) {
    if (area.kind !== 'parish') { area.mhclgCode = null; continue; }
    const code = manual[area.name] ?? (byKey.get(base(area.name)) ?? []).map(p => p.code);
    const codes = Array.isArray(code) ? code : [code];
    if (codes.length !== 1) { unmapped.push(`${area.name} (${codes.length})`); continue; }
    area.mhclgCode = codes[0];
  }
  if (unmapped.length) fail(`${gss}: unmapped schedule areas: ${unmapped.join('; ')}\nMHCLG rows: ${rows.map(p => p.name).join('; ')}`);
  const used = new Set(areas.map(a => a.mhclgCode).filter(Boolean));
  if (used.size !== areas.filter(a => a.mhclgCode).length) fail(`${gss}: an MHCLG row is mapped twice`);
  return rows.filter(p => !/Charter|Temple/.test(p.type) && !used.has(p.code)).map(p => ({code: p.code, name: p.name}));
}

mkdirSync('data/towns/schedules', {recursive: true});

// Durham County Council, "Council Tax bands and how much you pay".
{
  const file = 'data/raw/schedules/durham-2026-27.html', gss = 'E06000047';
  const html = readFileSync(file, 'utf8');
  const table = tables(html).find(t => t[0]?.[0]?.startsWith('Town/Parish')) ?? fail('Durham: table not found');
  const header = table[0].slice(1).map(h => h.replace(/\(£\)/, '').trim());
  if (header.join('') !== BANDS.join('')) fail('Durham: band header changed');
  const areas = table.slice(1).map(cells => {
    const printed = cells[0], trustee = printed.endsWith('*'), name = printed.replace(/\*$/, '').trim();
    const bands = Object.fromEntries(BANDS.map((b, i) => [b, pence(cells[i + 1])]));
    const kind = /^Charter Trustees/.test(name) ? 'charter-trustee-precept' : /^Unparished Areas/.test(name) ? 'unparished' : 'parish';
    return {name, kind, includesCharterTrustee: trustee, quoted: cells.join(' | '), bandDPence: bands.D, bandsPence: bands};
  }).filter(a => a.kind !== 'charter-trustee-precept');
  // Names printed differently from the MHCLG return. Each is confirmed by the
  // arithmetic check below: printed Band D less the majors and line 9 (and the
  // trustee's 2.70 where starred) equals that MHCLG row's parish Band D.
  const missing = mapToMhclg(gss, areas, {
    'Bradbury': 'E1302P012', 'Gainford and Langton': 'E1302P043', 'Hutton Henry and Station Town': 'E1302P061',
    'Middleton-in-Teesdale & Newbiggin-in-Teesdale': 'E1302P077', 'Rokeby, Brignall and Eggleston Abbey': 'E1302P093',
    'Sherburn': 'E1302P103', 'Stainton and Streatlam': 'E1302P114', 'Stanley Town Council': 'E1302P112',
    'West Rainton and Leamside': 'E1302P123', 'Whorlton and Westwick': 'E1302P126',
  });
  const c = national.components[gss], majors = c.parts.reduce((s, p) => s + p.bandDPence, 0);
  const trustee = y(national.parishes.find(p => p.gss === gss && p.type === 'Charter Trustee')).bandDPence;
  const checks = areas.map(a => {
    const parish = a.mhclgCode ? y(national.parishes.find(p => p.code === a.mhclgCode)).bandDPence : 0;
    const expected = c.ownExcludingParishPence + parish + majors + (a.includesCharterTrustee ? trustee : 0);
    a.check = {calculatedPence: expected, differencePence: a.bandDPence - expected};
    return a.check.differencePence;
  });
  const off = areas.filter(a => a.check.differencePence !== 0);
  if (off.some(a => Math.abs(a.check.differencePence) > 1)) fail(`Durham: check fails: ${off.map(a => a.name + ' ' + a.check.differencePence).join('; ')}`);
  const precepts = tables(html).find(t => t[0]?.[0] === 'Band' && /County Council Precept/.test(t[0][1] ?? '')) ?? fail('Durham: precept table not found');
  const countyD = pence(precepts.find(r => r[0] === 'D')[1]);
  const own = national.components[gss].ownExcludingParishPence;
  if (countyD !== own) fail(`Durham: county precept ${countyD} is not Table 10 line 9 ${own}; not the 2026/27 page`);
  writeFileSync(`data/towns/schedules/durham-2026-27.json`, JSON.stringify({
    council: {gss, name: 'County Durham'}, year: '2026-27',
    source: {publisher: 'Durham County Council', title: 'Council Tax bands and how much you pay', table: 'Total Council Tax by town/parish area', url: 'https://www.durham.gov.uk/counciltaxbands', file: 'durham-2026-27.html', sha256: sha(file), retrieved: '2026-11-15', licence: 'Published by the council; figures quoted as printed'},
    yearCheck: `The page prints no year. Its Band D county precept, ${(countyD / 100).toFixed(2)}, equals Table 10 2026/27 line 9 for Durham, and its Peterlee total equals the MHCLG 2026/27 calculation, so the page is the 2026/27 schedule.`,
    marker: '* includes a precept for the Charter Trustees for the City of Durham',
    areas, mhclgRowsNotInSchedule: missing,
  }, null, 1) + '\n');
  console.log(`Durham: ${areas.length} areas, ${missing.length} MHCLG rows not in the schedule (${missing.map(m => m.name).join('; ')}); 1p differences: ${off.map(a => a.name).join('; ') || 'none'}`);
}

// City of London Corporation, "Council tax bands and charges".
{
  const file = 'data/raw/schedules/city-of-london-2026-27.html', gss = 'E09000001';
  const html = readFileSync(file, 'utf8');
  if (!/2026\/2027 council tax amounts/.test(cellText(html))) fail('City of London: 2026/2027 heading not found');
  const table = tables(html).find(t => t.some(r => r.some(c => /City excluding Temples/.test(c)))) ?? fail('City of London: table not found');
  const headIndex = table.findIndex(r => r.some(c => /City excluding Temples/.test(c))), head = table[headIndex];
  const columns = [['Inner Temple', 'temple'], ['Middle Temple', 'temple'], ['City excluding Temples', 'unparished']].map(([label, kind]) => ({label, kind, index: head.findIndex(h => h.startsWith(label))}));
  if (columns.some(c => c.index < 0)) fail('City of London: column missing');
  const bandRows = Object.fromEntries(table.slice(headIndex + 1).map(r => [r[0].trim(), r]));
  if (BANDS.some(b => !bandRows[b])) fail('City of London: band row missing');
  const areas = columns.map(c => {
    const bands = Object.fromEntries(BANDS.map(b => [b, pence(bandRows[b][c.index])]));
    return {name: c.label, kind: c.kind, includesCharterTrustee: false, quoted: `D | ${bandRows.D[c.index]} (column "${c.label}"; the value range column is omitted)`, bandDPence: bands.D, bandsPence: bands};
  });
  const temples = national.parishes.filter(p => p.gss === gss && p.type === 'Temple');
  const areaD = Math.round(JSON.parse(readFileSync('data/council-tax/england-2026-27.json', 'utf8')).authorities[gss].bands.D * 100);
  if (areas.some(a => a.bandDPence !== areaD)) fail('City of London: Band D differs from Table 9');
  for (const area of areas) area.mhclgCode = area.kind === 'temple' ? (temples.find(t => t.name === area.name) ?? fail(`City of London: ${area.name} not in MHCLG`)).code : null;
  writeFileSync(`data/towns/schedules/city-of-london-2026-27.json`, JSON.stringify({
    council: {gss, name: 'City of London'}, year: '2026-27',
    source: {publisher: 'City of London Corporation', title: 'Council tax bands and charges', table: '2026/2027 council tax amounts', url: 'https://www.cityoflondon.gov.uk/services/council-tax/council-tax-bands-and-charges', file: 'city-of-london-2026-27.html', sha256: sha(file), retrieved: '2026-11-15', licence: 'Published by the council; figures quoted as printed'},
    yearCheck: 'The table is headed "2026/2027 council tax amounts". Its Band D in every column equals the City\'s Table 9 area Band D for 2026/27.',
    marker: null, areas, mhclgRowsNotInSchedule: [],
  }, null, 1) + '\n');
  console.log(`City of London: ${areas.length} areas`);
}
