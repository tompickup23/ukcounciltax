/** Browser-safe local charging model. Unknown is never zero; bundled services cannot overlap. */
export type ChargeKind='billing'|'county'|'police'|'fire'|'mayoral'|'parish'|'adult-social-care'|'special-expense';
export interface ChargeComponent {id:string;kind:ChargeKind;name:string;bandsPence:Record<string,number>;includes:ChargeKind[]}
export interface Locality {id:string;name:string;parishNames:string[];parishPence:Record<string,number>|null;totalsPence:Record<string,number>}
export interface LocalBill {gss:string;slug:string;name:string;year:string;source:{publisher:string;title:string;url:string;landingUrl:string;retrieved:string;sha256:string};components:ChargeComponent[];otherCharges:{kind:ChargeKind;status:string;note:string}[];localities:Locality[];status:string;boundaryRule:string}
export function resolveBill(bill:LocalBill,localityId:string,band:string){
 const locality=bill.localities.find(l=>l.id===localityId);
 if(!locality)throw new Error('Confirm a published locality before calculating.');
 const used=new Set<string>();
 const parts=bill.components.map(c=>{
  for(const service of c.includes){if(used.has(service))throw new Error('Overlapping charge components would count a service twice.');used.add(service);}
  const pence=c.bandsPence[band];if(!Number.isSafeInteger(pence)||pence<0)throw new Error('A component is unavailable for this band.');
  return {id:c.id,name:c.name,pence,kind:c.kind};
 });
 if(locality.parishPence){const pence=locality.parishPence[band];if(!Number.isSafeInteger(pence)||pence<0||used.has('parish'))throw new Error('Invalid or duplicate parish charge.');parts.push({id:'parish',name:locality.name,kind:'parish',pence});}
 const total=parts.reduce((sum,p)=>sum+p.pence,0);
 if(total!==locality.totalsPence[band])throw new Error('Published total and component sum do not reconcile.');
 return {locality,parts,total};
}
export function modelComponents(parts:{id:string;pence:number}[],rates:Record<string,number>,years:number){
 if(!Number.isInteger(years)||years<1||years>10)throw new Error('Choose one to ten years.');
 return parts.map(p=>{const rate=rates[p.id];if(!Number.isFinite(rate)||rate < -50||rate>50)throw new Error('Each annual change must be between -50% and 50%.');return {...p,projectedPence:Math.round(p.pence*Math.pow(1+rate/100,years))};});
}
