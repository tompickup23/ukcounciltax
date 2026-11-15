/** What changed on an imported local bill since the previous year, at Band D.
 * Previous year: MHCLG Table 10 for that year (each body's Band D) and the MHCLG
 * parish return (each parish's Band D, both years, already in data/national/england.json).
 * Current year: the council's own complete schedule in data/local-bills/.
 * Nothing is derived for other bands. Parishes are joined by MHCLG code, never by name.
 */
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readOds, table, figure} from './lib/ods.mjs';
const fail = message => {throw new Error(message);};
const pence = (value, where) => {const n = figure(value, where); if (n === null) fail(`${where}: missing`); const p = n * 100; if (Math.abs(p - Math.round(p)) > 0.00001) fail(`${where}: unexpected precision`); return Math.round(p);};

const PREVIOUS = {
 year: '2025-26',
 publisher: 'Ministry of Housing, Communities and Local Government',
 title: 'Council Tax levels set by local authorities in England 2025 to 2026: Table 10 Local Authority Level Data (revised)',
 url: 'https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2025-to-2026',
 fileUrl: 'https://assets.publishing.service.gov.uk/media/6a02f143e71c4cdf4026ba48/Table_10_2025-26.ods',
 file: 'table-10-2025-26.ods',
 sha256: '79766eb7b591a4f49e1e9f95cb6b0a232c7a9165945de9acb076769c002e6e5c',
 retrieved: '2026-11-14',
 tables: ['Data_Billing'],
 licence: 'Open Government Licence v3.0',
};

// Reviewed by hand against the parish return: locality id in the council's schedule to MHCLG parish code.
const PARISH_CODES = {
 burnley: {
  'worsthorne-with-hurstwood': 'E2333P008', cliviger: 'E2333P002', padiham: 'E2333P007', 'habergham-eaves': 'E2333P004',
  briercliffe: 'E2333P001', hapton: 'E2333P005', ightenhill: 'E2333P006', dunnockshaw: 'E2333P003',
 },
};

mkdirSync('data/raw', {recursive: true});
const path = `data/raw/${PREVIOUS.file}`;
if (!existsSync(path)) {const r = await fetch(PREVIOUS.fileUrl); if (!r.ok) fail(`HTTP ${r.status}`); writeFileSync(path, Buffer.from(await r.arrayBuffer()));}
if (createHash('sha256').update(readFileSync(path)).digest('hex') !== PREVIOUS.sha256) fail('Table 10 2025/26 edition changed; review before importing');
const book = readOds(path);
const t = table(book.find(s => s.name === 'Data_Billing') ?? fail('Missing Data_Billing'), ['ONS Code', 'Authority']);
const col = {gss: t.column(/^ONS Code$/), own: t.column(/^9\..*current year/s), withParish: t.column(/^8\..*current year/s), area: t.column(/^17\./),
 county: t.column(/^16\..*\(county or GLA\)/s), police: t.column(/^16\..*\(police\)/s), fire: t.column(/^16\..*\(fire\)/s), combined: t.column(/^16\..*\(combined authorit/s)};

const national = JSON.parse(readFileSync('data/national/england.json', 'utf8'));
const billsDir = 'data/local-bills';
const outDir = `${billsDir}/changes`;
mkdirSync(outDir, {recursive: true});
for (const slug of Object.keys(PARISH_CODES)) {
 const bill = JSON.parse(readFileSync(`${billsDir}/${slug}-2026-27.json`, 'utf8'));
 const row = t.rows.find(r => r[col.gss] === bill.gss) ?? fail(`${bill.gss} not in Table 10 2025/26`);
 const prev = {billing: pence(row[col.own], 'own'), county: pence(row[col.county], 'county'), police: pence(row[col.police], 'police'), fire: pence(row[col.fire], 'fire')};
 if (pence(row[col.combined], 'combined') !== 0) fail('Unexpected combined authority charge');
 // The previous unparished Band D must reconcile: area average less the average parish element.
 const unparished = pence(row[col.area], 'area') - (pence(row[col.withParish], 'withParish') - prev.billing);
 if (Object.values(prev).reduce((a, b) => a + b, 0) !== unparished) fail('Previous year bodies do not reconcile to the unparished Band D');
 // The current schedule must match the current Table 10 already imported.
 const nat = national.components[bill.gss] ?? fail('No current components');
 const natPart = kind => nat.parts.find(p => p.kind === kind)?.bandDPence;
 const bodies = bill.components.map(c => {
  const current = c.bandsPence.D;
  const expected = c.kind === 'billing' ? nat.ownExcludingParishPence : natPart(c.kind);
  if (current !== expected) fail(`${c.id}: schedule ${current} differs from Table 10 2026/27 ${expected}`);
  if (!(c.kind in prev)) fail(`${c.id}: no previous year figure`);
  return {componentId: c.id, kind: c.kind, name: c.name, previousPence: prev[c.kind], currentPence: current};
 });
 const parishes = bill.localities.filter(l => l.parishPence).map(l => {
  const code = PARISH_CODES[slug][l.id] ?? fail(`No reviewed code for ${l.id}`);
  const p = national.parishes.find(x => x.code === code) ?? fail(`${code} not in the parish return`);
  if (p.gss !== bill.gss) fail(`${code} belongs to another council`);
  const cur = p.years['2026-27'], old = p.years['2025-26'];
  if (cur.status !== 'published' || old.status !== 'published') fail(`${code}: not published in both years`);
  if (cur.bandDPence !== l.parishPence.D) fail(`${l.id}: parish return ${cur.bandDPence} differs from schedule ${l.parishPence.D}`);
  return {localityId: l.id, name: l.name, code, previousPence: old.bandDPence, currentPence: cur.bandDPence};
 });
 if (parishes.length !== bill.localities.filter(l => l.parishPence).length) fail('Parish coverage incomplete');
 const out = {schemaVersion: 1, gss: bill.gss, slug, band: 'D', previousYear: PREVIOUS.year, currentYear: bill.year,
  sources: {previousBodies: PREVIOUS, currentBodies: {publisher: bill.source.publisher, title: bill.source.title, url: bill.source.url, sha256: bill.source.sha256, retrieved: bill.source.retrieved}, parishes: national.sources.parishes},
  bodies, parishes};
 writeFileSync(`${outDir}/${slug}-2026-27.json`, JSON.stringify(out, null, 1) + '\n');
 console.log(`${slug}: ${bodies.length} bodies and ${parishes.length} parishes, ${PREVIOUS.year} to ${bill.year}, reconciled.`);
}
