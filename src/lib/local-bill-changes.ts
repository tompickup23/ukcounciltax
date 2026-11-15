/** Band D changes on an imported local bill since the previous year. Browser safe. */
import type {ChargeKind} from './local-bill';
export interface ChangeRow {name:string;previousPence:number;currentPence:number}
export interface BillChanges {schemaVersion:1;gss:string;slug:string;band:'D';previousYear:string;currentYear:string;
 sources:{previousBodies:{publisher:string;title:string;url:string;fileUrl:string;sha256:string;retrieved:string};currentBodies:{publisher:string;title:string;url:string;sha256:string;retrieved:string};parishes:{publisher:string;title:string;url:string;sha256:string;retrieved:string}};
 bodies:(ChangeRow&{componentId:string;kind:ChargeKind})[];parishes:(ChangeRow&{localityId:string;code:string})[]}
/** Change in pence and per cent to two decimal places, from the two published Band D figures. */
export function change(row:ChangeRow){
 if(!Number.isSafeInteger(row.previousPence)||!Number.isSafeInteger(row.currentPence)||row.previousPence<=0)throw new Error('A published Band D figure is missing.');
 const pence=row.currentPence-row.previousPence;
 return {pence,percent:Math.round((pence/row.previousPence)*10000)/100};
}
/** The rows for one locality: every body, then that locality's parish if it has one. */
export function localityChanges(c:BillChanges,localityId:string){
 const parish=c.parishes.find(p=>p.localityId===localityId);
 const rows=[...c.bodies.map(b=>({name:b.name,kind:b.kind as ChargeKind,previousPence:b.previousPence,currentPence:b.currentPence})),...(parish?[{name:`${parish.name} (parish or town council)`,kind:'parish' as ChargeKind,previousPence:parish.previousPence,currentPence:parish.currentPence}]:[])];
 const previousPence=rows.reduce((s,r)=>s+r.previousPence,0),currentPence=rows.reduce((s,r)=>s+r.currentPence,0);
 return {rows:rows.map(r=>({...r,...change(r)})),total:{previousPence,currentPence,...change({name:'total',previousPence,currentPence})}};
}
