import {readOds, table} from '../../scripts/lib/ods.mjs';
const wb=readOds('data/raw/table-10-2026-27.ods');
const s=wb.find(s=>s.name==='Data_Billing');
const t=table(s,['ONS Code','Authority']);
t.header.forEach((h,i)=>console.log(i, JSON.stringify(h)));
const n=wb.find(s=>s.name==='Notes'); n.rows.slice(0,40).forEach(r=>console.log(JSON.stringify(r).slice(0,600)));
// cover sheets
for (const x of wb) console.log('SHEET',x.name, x.rows.length);
const c=wb[0]; c.rows.slice(0,40).forEach(r=>console.log(JSON.stringify(r).slice(0,500)));
