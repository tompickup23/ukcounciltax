/** Generate the local pilot from pinned public sources. Never alter national data. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readOds } from './lib/ods.mjs';

const load = path => JSON.parse(readFileSync(path, 'utf8'));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const check = (condition, message) => { if (!condition) throw new Error(message); };
const budget = load('data/national/budget.json');
const national = load('data/national/england.json');
const current = load('data/council-tax/england-2026-27.json');
const prior = load('data/council-tax/england-2025-26.json');
const referendum = {
  publisher: 'MHCLG',
  title: 'Council Tax Referendum Principles Report 2026/27',
  url: 'https://assets.publishing.service.gov.uk/media/6989c723d3f57710b50a9bb4/Council_Tax_Referendum_Principles_Report_2026-27.pdf',
  file: 'Council_Tax_Referendum_Principles_Report_2026-27.pdf',
  sha256: '128ea9300b33124e88474412be96e050ed210dddcc17cf4b7620bade53df3ac3',
  published: '2026-02-09', checked: '2026-11-13', licence: 'Open Government Licence v3.0',
};
const rawSources = [
  ...Object.values(budget.sources), national.sources.components,
  ...current.source.files, ...prior.source.files, referendum,
];
for (const source of rawSources) check(sha(`data/raw/${source.file}`) === source.sha256, `Source hash differs: ${source.file}`);
check(budget.year === current.year && national.year === current.year && prior.year === '2025-26', 'Editions differ');
const table10 = readOds(`data/raw/${national.sources.components.file}`).find(s => s.name === 'Data_Billing');
check(table10, 'Missing Table 10 Data_Billing');
const header = table10.rows.find(r => r.includes('ONS Code'));
const column = pattern => {
  const matches = header.map((label, i) => pattern.test(label.replace(/\s+/g, ' ')) ? i : -1).filter(i => i >= 0);
  check(matches.length === 1, `Ambiguous column: ${pattern}`); return matches[0];
};
const columns = {
  gss: column(/^ONS Code$/),
  total: column(/^1\. Council Tax Requirement.*\(current year\)$/),
  parish: column(/^2\. Parish precepts.*\(current year\)$/),
  own: column(/^3\. Council Tax Requirement.*\(current year\)$/),
  base: column(/^7\. Council tax base.*\(current year\)$/),
  ownBand: column(/^9\. Average.*\(current year\)$/),
  priorOwnBand: column(/^9\. Average.*\(previous year\)$/),
  notes: column(/^Notes /),
};
function decimal(value, digits = 2) {
  const text = String(value).replaceAll(',', '').trim();
  check(new RegExp(`^\\d+(?:\\.\\d{1,${digits}})?$`).test(text), `Invalid decimal: ${text}`);
  const [whole, fraction = ''] = text.split('.');
  return BigInt(whole) * 10n ** BigInt(digits) + BigInt(fraction.padEnd(digits, '0'));
}
const absolute = n => n < 0n ? -n : n;
const financing = ['grantinaef','trnsreorg','appressch','appresdsg','appresph','appresoth','appresunall','grantrsg','grantpol','retainnndr','colfunct','othinc'];
const pilots = [
  { gss: 'E07000117', slug: 'burnley', rule: 'district', classCode: 'SD', ruleLocation: 'Annex A, paragraphs 1, 2(e) and 7, printed pages 6 to 8' },
  { gss: 'E06000008', slug: 'blackburn-with-darwen', rule: 'ordinary-social-care', classCode: 'UA', ruleLocation: 'Annex A, paragraphs 1, 2(a) and 3; Annex B, printed page 13 names Blackburn with Darwen' },
];
const sourceHashes = Object.fromEntries(['data/national/budget.json','data/national/england.json','data/council-tax/england-2026-27.json','data/council-tax/england-2025-26.json'].map(path => [path, sha(path)]));
const raSheet = readOds(`data/raw/${budget.sources.raPart1.file}`).find(s=>s.name==='RA_LA_Data_2026-27');
const raIds = raSheet.rows.find(r=>r.includes('parishaggprecept'));
const output = pilots.map(pilot => {
  const b = budget.councils[pilot.gss], c = national.components[pilot.gss];
  const now = current.authorities[pilot.gss], before = prior.authorities[pilot.gss];
  check(b?.status === 'available' && c && now && before, `Missing pilot: ${pilot.gss}`);
  check(b.class === pilot.classCode && now.classCode === pilot.classCode, 'Rule category does not match');
  check(Object.values(b.notes).every(note => !note.trim()) && !c.notes.length && !now.own.notes.length && !before.own.notes.length, 'Unreviewed authority note');
  const rows = table10.rows.filter(row => row[columns.gss] === pilot.gss);
  check(rows.length === 1, 'Ambiguous Table 10 authority');
  const raw = rows[0]; check(!raw[columns.notes]?.trim(), 'Unreviewed Table 10 note');
  const own = decimal(now.own.bandD), old = decimal(before.own.bandD), base = decimal(c.taxBase);
  check(own === BigInt(c.ownExcludingParishPence) && own === decimal(raw[columns.ownBand]) && old === decimal(raw[columns.priorOwnBand]) && base === decimal(raw[columns.base]), 'Tax input disagreement');
  // Independently match each annual printed Table 8 row, including the table basis.
  for (const [edition, row] of [[current, now], [prior, before]]) {
    const sheet = readOds(`data/raw/${edition.source.files[0].file}`).find(s => s.name === row.own.table);
    check(sheet, 'Missing annual table');
    const h = sheet.rows.find(r => r.includes('ONS Code'));
    const ownColumns = h.map((label, i) => /excluding parish precepts/.test(label) && /£\s*$/.test(label) ? i : -1).filter(i => i >= 0);
    check(ownColumns.length === 1, 'Ambiguous own Band D column');
    const rows = sheet.rows.filter(r => r[h.indexOf('ONS Code')] === pilot.gss);
    check(rows.length === 1 && decimal(rows[0][ownColumns[0]]) === decimal(row.own.bandD), 'Annual printed cell differs');
  }
  const v = b.values;
  const raRow = raSheet.rows.find(row=>row.includes(pilot.gss));
  check(raRow, 'Missing original RA row');
  for (const id of [...budget.groups.map(g=>g.id),'servicetot','revenuetot',...financing,'ctrtot','parishaggprecept']) {
    check(Number(raRow[raIds.indexOf(id)].replaceAll(',',''))===v[id], `Raw RA cell differs: ${id}`);
  }
  for (const id of [...financing, 'revenuetot','ctrtot','servicetot','parishaggprecept', ...budget.groups.map(g=>g.id)]) check(Number.isSafeInteger(v[id]), `Missing or non-integer RA field: ${id}`);
  check(v.ctrtot === v.revenuetot + financing.reduce((sum,id)=>sum+v[id],0), 'Financing identity fails');
  check(v.servicetot === budget.groups.reduce((sum,g)=>sum+v[g.id],0), 'Service identity fails');
  for (const group of budget.groups.filter(g=>g.subLines.length)) check(group.subLines.every(id=>Number.isSafeInteger(v[id])) && group.subLines.reduce((sum,id)=>sum+v[id],0) === v[group.id], 'Service sublines fail');
  const totalPence = decimal(raw[columns.total]), parishPence = decimal(raw[columns.parish]), ownRequirementPence = decimal(raw[columns.own]);
  check(totalPence === parishPence + ownRequirementPence, 'Table 10 own plus parish fails');
  const raDifference = BigInt(v.ctrtot)*100000n-totalPence;
  const parishDifference = BigInt(v.parishaggprecept)*100000n-parishPence;
  const componentReviewRequired = absolute(parishDifference)>50000n;
  check(absolute(raDifference) <= 50000n, 'RA and Table 10 differ beyond half a published thousand pounds');
  // Printed Band D is rounded to pennies. Do not replace the published requirement.
  const bandYieldDifference = own*base-ownRequirementPence*100n;
  check(absolute(bandYieldDifference) <= base/2n+50n, 'Own Band D times base exceeds penny/whole-pound source rounding');
  const services = budget.groups.map(g=>({
    id:g.id, label:g.label, line:budget.fields[g.id].line, pence:String(BigInt(v[g.id])*100000n),
    editable:v[g.id]>0 && !['edutot','phtot'].includes(g.id),
    heldReason:v[g.id]<0 ? 'Net income stays fixed' : v[g.id]===0 ? 'Published zero stays fixed' : ['edutot','phtot'].includes(g.id) ? 'Held fixed because funding restrictions are not modelled' : null,
  }));
  return {
    ...pilot, name:now.name, year:current.year, ownPence:String(own), priorOwnPence:String(old), taxBaseHundredths:String(base), services,
    sourceWarnings:componentReviewRequired ? ['Source review outstanding: the RA parish component differs from Table 10 by more than half a printed thousand pounds. This pilot is not cleared for public release.'] : [],
    grantDsgThousands:v.grantindsg,
    ledger:[...budget.groups.map(g=>g.id),'servicetot','revenuetot',...financing,'ctrtot','parishaggprecept'].map(id=>({id,line:budget.fields[id].line,label:budget.fields[id].label,thousands:v[id]})),
    reconciliation:{table10TotalPence:String(totalPence),table10OwnPence:String(ownRequirementPence),table10ParishPence:String(parishPence),raTotalDifferencePence:String(raDifference),parishDifferencePence:String(parishDifference),componentReviewRequired,ownYieldDifferenceUnits:String(bandYieldDifference),freezeDifferenceUnits:String((own-old)*base)},
    sources:[
      {title:'RA Part 1, service lines, 799, 900 to 990 and 821, 11 June 2026',url:budget.sources.raPart1.fileUrl},
      {title:`Annual Table ${now.own.table.replace('Table_','')}, own Band D excluding parish, 2026/27`,url:current.source.files[0].url},
      {title:`Annual Table ${before.own.table.replace('Table_','')}, own Band D excluding parish, 2025/26`,url:prior.source.files[0].url},
      {title:'Table 10, Data_Billing, current tax base and own/parish requirements, 2026/27',url:national.sources.components.fileUrl},
      {title:`Referendum principles, 9 February 2026. ${pilot.ruleLocation}`,url:referendum.url},
    ],
  };
});
const result = {model:'budget-freeze 0.1',sourceHashes,rawSources:rawSources.map(s=>({file:s.file,url:s.fileUrl||s.url,sha256:s.sha256})),referendum,reviewedOn:'2026-11-13',pilots:output};
const coverage = Object.keys(current.authorities).sort().map(gss=>{
  const b=budget.councils[gss], c=national.components[gss];
  const rows=table10.rows.filter(row=>row[columns.gss]===gss);
  const reasons=[];
  if(b?.status!=='available') reasons.push('Missing RA return');
  if(b?.notes.raPart1.includes('[note 4]')) reasons.push('RA note 4 cross-return discrepancy');
  if(!c || !prior.authorities[gss]?.own || decimal(current.authorities[gss].own.bandD)!==BigInt(c.ownExcludingParishPence)) reasons.push('Tax join absent or different');
  if(rows.length!==1) reasons.push('Table 10 row absent or ambiguous');
  if(!reasons.length) {
    const raw=rows[0];
    if(absolute(BigInt(b.values.ctrtot)*100000n-decimal(raw[columns.total]))>50000n) reasons.push('RA total differs by more than half a thousand pounds');
    if(b.values.parishaggprecept===null || absolute(BigInt(b.values.parishaggprecept)*100000n-decimal(raw[columns.parish]))>50000n) reasons.push('RA parish component needs review');
    if(Object.values(b.notes).some(n=>n.trim()) || c.notes.length || current.authorities[gss].own.notes.length || prior.authorities[gss].own.notes.length || raw[columns.notes]?.trim()) reasons.push('Authority-specific notes need review');
  }
  return {gss,name:current.authorities[gss].name,arithmeticAndComponentScreenPassed:reasons.length===0,reasons};
});
const coverageResult={checkedOn:'2026-11-13',meaning:'Screen only. No national referendum mapping or release approval. Half-thousand tolerance checks compatibility with printed precision, not proof of an explanation.',sourceHashes,total:coverage.length,screenPassed:coverage.filter(r=>r.arithmeticAndComponentScreenPassed).length,reasonCounts:Object.fromEntries([...new Set(coverage.flatMap(r=>r.reasons))].map(reason=>[reason,coverage.filter(r=>r.reasons.includes(reason)).length])),councils:coverage};
mkdirSync('data/pilots',{recursive:true});
const path='data/pilots/budget-freeze.json';
const serialised=JSON.stringify(result,null,2)+'\n';
if (process.argv.includes('--check')) check(readFileSync(path,'utf8')===serialised,'Pilot snapshot drift');
else writeFileSync(path,serialised);
const coveragePath='docs/C2-COVERAGE-2026-11-13.json';
const coverageText=JSON.stringify(coverageResult,null,2)+'\n';
if(process.argv.includes('--check'))check(readFileSync(coveragePath,'utf8')===coverageText,'Coverage audit drift');
else writeFileSync(coveragePath,coverageText);
console.log(`Verified ${output.length} local pilots and seven raw hashes. ${output.filter(p=>p.reconciliation.componentReviewRequired).length} pilot component review remains. National arithmetic/component screen: ${coverageResult.screenPassed} of ${coverageResult.total}; none cleared for national release.`);
