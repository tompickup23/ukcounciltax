import {execFileSync} from 'node:child_process';
import {readFileSync, mkdirSync} from 'node:fs';
import {buildBudget} from '../import-ra-budget.mjs';
import {referendumData} from './c2-referendum.mjs';
import {withinRaPrecision, withinTable10Precision, withinTaxJoinPrecision, assertOwnPrecision} from './c2-precision.mjs';
const assert = (ok, text) => {if (!ok) throw new Error(text);};
const normal = s => s.replace(/\s+/g,' ').trim();
const decimal = s => {
  const t = s.replaceAll(',','');
  if (!/^-?\d+(\.\d{1,2})?$/.test(t)) return null;
  const sign = t.startsWith('-') ? -1n : 1n;
  const [w,f=''] = t.replace('-','').split('.');
  return sign*(BigInt(w)*100n+BigInt(f.padEnd(2,'0')));
};
function letters(index) {let s='';for(let n=index+1;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;}
export function buildCohort({budget,current,prior,national,rawSources,referendum,sourceHashes}) {
  const rebuilt = buildBudget();
  assert(JSON.stringify(rebuilt)===JSON.stringify(budget),'Held RA JSON differs from raw reconstruction');
  const raw = JSON.parse(execFileSync('python3',['scripts/c2-raw-cells.py',...rawSources.filter(s=>s.file.endsWith('.ods')).map(s=>`data/raw/${s.file}`)],{maxBuffer:64*1024*1024,encoding:'utf8'}));
  mkdirSync('.ops',{recursive:true});
  execFileSync('pdftotext',['-layout',`data/raw/${referendum.file}`,'.ops/c2-referendum.txt']);
  const rules = referendumData(readFileSync('.ops/c2-referendum.txt','utf8'),current.authorities,national.components,referendum);
  const file1=budget.sources.raPart1.file, file2=budget.sources.raPart2.file, fileSg=budget.sources.raGrants.file;
  const file10=national.sources.components.file, fileNow=current.source.files[0].file, fileBefore=prior.source.files[0].file;
  const raName='RA_LA_Data_2026-27', sgName='SG_LA_Data_2026-27';
  const rows=(file,sheet)=>raw[file][sheet];
  const header=(file,sheet)=>rows(file,sheet).find(r=>r.cells.includes('ONS Code')).cells;
  const find=(file,sheet,gss)=>{
    const h=header(file,sheet), hits=rows(file,sheet).filter(r=>r.cells[h.indexOf('ONS Code')]===gss);
    assert(hits.length===1,`Ambiguous raw authority: ${file} ${sheet} ${gss}`);return hits[0];
  };
  const ref=(file,sheet,row,column)=>({file,sheet,row:row.row,column:letters(column),printed:row.cells[column]??''});
  const findColumn=(file,sheet,pattern)=>{
    const cols=header(file,sheet).flatMap((s,i)=>pattern.test(normal(s))?[i]:[]);
    assert(cols.length===1,`Ambiguous column ${file} ${sheet} ${pattern}`);return cols[0];
  };
  const raIds=rows(file1,raName).find(r=>r.cells.includes('ctrtot')).cells;
  const tCols={total:findColumn(file10,'Data_Billing',/^1\. Council Tax Requirement.*\(current year\)$/),
    parish:findColumn(file10,'Data_Billing',/^2\. Parish precepts.*\(current year\)$/),
    own:findColumn(file10,'Data_Billing',/^3\. Council Tax Requirement.*\(current year\)$/),
    base:findColumn(file10,'Data_Billing',/^7\. Council tax base.*\(current year\)$/),
    current:findColumn(file10,'Data_Billing',/^9\. Average.*\(current year\)$/),
    prior:findColumn(file10,'Data_Billing',/^9\. Average.*\(previous year\)$/)};
  const structure=rows(file10,'Data_Billing').find(r=>r.cells.some(s=>s.includes('No authorities are reorganising in 2026-27.')));
  assert(structure,'No held structure comparability statement');
  const structureRef=ref(file10,'Data_Billing',structure,0);
  const registry=JSON.parse(readFileSync('data/registry/councils.json','utf8')).councils;
  const reasonsText={
    'missing-return':'The council did not supply a 2026/27 budget return in time for this publication.',
    'ra-note-4':'The source says the council tax figures in the two returns disagree, without an explanation.',
    'total-difference':'The total council tax requirement differs between the budget and tax returns by more than the published precision can explain.',
    'parish-difference':'The parish amounts in the budget and tax returns do not reconcile within the published precision.',
    'meaning-note':'An official source note changes the meaning or status of a funding figure used by this exercise.',
    'tax-join':'The held own-charge or tax-base cells do not provide matching, comparable inputs for both years.',
    'unmapped-rule':'The held referendum report does not establish a unique category for this council.',
  };
  function notesFor(file,sheet,row) {
    const notesColumn=header(file,sheet).findIndex(s=>/^Notes(?:\s|$)/.test(s));
    const marker=row.cells[notesColumn]??'';
    if(!marker.trim())return [];
    const tokens=marker.match(/\[note [^\]]+\]|\[r\]|\bM\b/g)??[];
    assert(tokens.length && tokens.join('').replace(/\s/g,'')===marker.replace(/[\s,]/g,''),`Unread note marker ${marker}`);
    return tokens.map(id=>{
      const note=rows(file,'Notes').find(r=>r.cells[0]===id);
      assert(note,`Missing note ${file} ${id}`);
      const textColumn=file===file10?3:[fileNow,fileBefore].includes(file)?2:1;
      const text=note.cells[textColumn];
      let decision='reviewed', explanation;
      if(id==='M'){decision='excluded';explanation=reasonsText['missing-return'];}
      else if(file===file1 && id==='[note 4]'){decision='excluded';explanation=reasonsText['ra-note-4'];}
      else if(file===file1 && id==='[note 8]'){decision='excluded';explanation='The retained business rates entry includes a collection fund deficit. The model uses that signed funding entry.';}
      else if(file===fileSg && id==='[note 3]'){decision='excluded';explanation='The source reports double counted grant allocations. Held grant financing cannot be treated as an unqualified baseline.';}
      else if((file===file10 && id==='[note j]') || (file===fileNow && id==='[note x]')){decision='excluded';explanation='Approval of the current parish and total requirements was still pending in this source edition.';}
      else if(file===file2 && ['[note 1]','[note 2]'].includes(id))explanation='This note concerns reserve stock levels. The pilot does not use reserve stocks or offer reserve controls; signed RA Part 1 movements remain fixed.';
      else if([file10,fileNow].includes(file) && /could increase their council tax/.test(text))explanation='The note describes a named referendum exception, not a different charge basis. The exact inclusive trigger is taken from the final report, not the summary wording in this note.';
      else if(file===fileNow && ['[note s]','[note w]'].includes(id))explanation='The note concerns a rounded percentage display. The model does not use that percentage; it compares the printed own charges in exact pence.';
      else if(id==='[r]')explanation='The prior figures were revised. Both held annual own-charge cells are checked against the current Table 10 prior and current own cells. A disagreement excludes the council.';
      else throw new Error(`Note needs a recorded decision: ${file} ${id}`);
      return {id,text,decision,explanation,marker:ref(file,sheet,row,notesColumn),citation:ref(file,'Notes',note,textColumn)};
    });
  }
  const councils=Object.keys(current.authorities).sort().map(gss=>{
    const a=current.authorities[gss], before=prior.authorities[gss], b=budget.councils[gss];
    const ra=find(file1,raName,gss), part2=find(file2,raName,gss), sg=find(fileSg,sgName,gss), t=find(file10,'Data_Billing',gss);
    const now=find(fileNow,a.own.table,gss), old=find(fileBefore,before.own.table,gss);
    const nowCol=findColumn(fileNow,a.own.table,/excluding parish precepts.*£$/),oldCol=findColumn(fileBefore,before.own.table,/excluding parish precepts.*£$/);
    const evidence={raTotal:ref(file1,raName,ra,raIds.indexOf('ctrtot')),raParish:ref(file1,raName,ra,raIds.indexOf('parishaggprecept')),
      ...Object.fromEntries(Object.entries(tCols).map(([key,col])=>[`table10${key[0].toUpperCase()+key.slice(1)}`,ref(file10,'Data_Billing',t,col)])),
      annualCurrent:ref(fileNow,a.own.table,now,nowCol),annualPrior:ref(fileBefore,before.own.table,old,oldCol)};
    const reviewedNotes=[...notesFor(file1,raName,ra),...notesFor(file2,raName,part2),...notesFor(fileSg,sgName,sg),...notesFor(file10,'Data_Billing',t),...notesFor(fileNow,a.own.table,now),...notesFor(fileBefore,before.own.table,old)];
    const codes=[]; const add=code=>{if(!codes.includes(code))codes.push(code);};
    if(b.status!=='available')add('missing-return');
    if(b.notes.raPart1.includes('[note 4]'))add('ra-note-4');
    if(reviewedNotes.some(n=>n.decision==='excluded' && !['M','[note 4]'].includes(n.id)))add('meaning-note');
    const own=decimal(evidence.annualCurrent.printed), priorOwn=decimal(evidence.annualPrior.printed), base=decimal(evidence.table10Base.printed);
    if(own===null || priorOwn===null || own!==decimal(evidence.table10Current.printed) || priorOwn!==decimal(evidence.table10Prior.printed) || base===null || base<=0n || a.classCode!==before.classCode)add('tax-join');
    const comparisons={};
    if(b.status==='available') {
      const raTotal=decimal(evidence.raTotal.printed),raParish=decimal(evidence.raParish.printed);
      const total=decimal(evidence.table10Total.printed),parish=decimal(evidence.table10Parish.printed), ownRequirement=decimal(evidence.table10Own.printed);
      comparisons.table10IdentityDifferencePence=String(total-parish-ownRequirement);
      if(!withinTable10Precision(total-parish-ownRequirement))add('tax-join');
      comparisons.totalDifferencePence=raTotal===null?null:String(raTotal*1000n-total);
      comparisons.parishDifferencePence=raParish===null?null:String(raParish*1000n-parish);
      comparisons.ownDifferencePence=raTotal===null||raParish===null?null:String((raTotal-raParish)*1000n-ownRequirement);
      for(const [key,code] of [['totalDifferencePence','total-difference'],['parishDifferencePence','parish-difference']])if(comparisons[key]===null || !withinRaPrecision(BigInt(comparisons[key])))add(code);
      if(raTotal!==null && raParish!==null)assertOwnPrecision(BigInt(comparisons.totalDifferencePence),BigInt(comparisons.parishDifferencePence),BigInt(comparisons.ownDifferencePence),gss);
      if(own!==null && base!==null && !withinTaxJoinPrecision(own*base-ownRequirement*100n,base))add('tax-join');
    }
    if(!rules.mappings[gss])add('unmapped-rule');
    const specialCheck=gss==='E09000001'?'City of London is explicitly in Annex B, page 11. Its own charge includes its police function; no separate police precept is added. The annual Table 8d note d confirms that the police element is not distinguishable. The same own-charge basis is used in both years.':gss==='E06000053'?'Isles of Scilly is explicitly included by Annex A paragraph 1(1)(b), page 6, and named in Annex B, page 14. Both annual own-charge cells and the Table 10 prior cell are checked.':null;
    const match=Object.values(registry).filter(c=>c.gss===gss);assert(match.length===1,`Registry join ${gss}`);
    return {gss,name:a.name,slug:match[0].slug,classCode:a.classCode,eligible:codes.length===0,
      reason:codes.length?codes.map(c=>reasonsText[c]).join(' '):'The held source cells reconcile within their printed precision, the source notes have been reviewed and the referendum category is established.',
      reasons:codes.map(code=>({code,text:reasonsText[code]})),principle:codes.length?null:rules.mappings[gss],reviewedPrinciple:rules.mappings[gss]??null,
      evidence,comparisons,reviewedNotes,comparability:{statement:structureRef,priorMatchesCurrentReturn:priorOwn===decimal(evidence.table10Prior.printed),sameClass:a.classCode===before.classCode,specialCheck},
      review:{resolution:codes.some(c=>['total-difference','parish-difference'].includes(c))?'No cell or note in the held six workbooks explains the out-of-precision component differences. Neither figure is changed.':'Total and parish use closed half thousand pound bounds; own share is asserted against their sum plus half a pound for its whole pound printing. Compatibility does not prove rounding caused the difference.',
        raPart2:{file:file2,sheet:raName,row:part2.row},specificGrants:{file:fileSg,sheet:sgName,row:sg.row}}};
  });
  const eligible=councils.filter(c=>c.eligible);
  // Only authorities that pass the source gates enter the executable GSS mapping.
  rules.mappings=Object.fromEntries(eligible.map(c=>[c.gss,rules.mappings[c.gss]]));
  rules.byEdition = {[rules.edition]: rules.mappings};
  delete rules.mappings;
  const classes=[...new Set(councils.map(c=>c.classCode))].sort();
  const manifest={edition:current.year,model:'budget-freeze 0.2',reviewedOn:'2026-11-15',sourceHashes,
    total:councils.length,eligible:eligible.length,excluded:councils.length-eligible.length,
    byClass:Object.fromEntries(classes.map(k=>[k,{eligible:eligible.filter(c=>c.classCode===k).length,total:councils.filter(c=>c.classCode===k).length}])),
    exclusionCounts:Object.fromEntries(Object.keys(reasonsText).map(code=>[code,councils.filter(c=>c.reasons.some(r=>r.code===code)).length])),
    principleCounts:Object.fromEntries(Object.keys(rules.principles).map(k=>[k,eligible.filter(c=>c.principle.principle===k).length])),councils};
  return {manifest,rules,pilots:eligible.map(c=>({gss:c.gss,slug:c.slug,rule:c.principle.principle,classCode:c.classCode,
    ruleLocation:`Annex A, paragraph ${c.principle.citation.paragraph}, printed page ${c.principle.citation.page}; category ${c.principle.category}`,
    reviewedNotes:c.reviewedNotes,evidence:c.evidence}))};
}
