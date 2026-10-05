import {national} from './national-data';
import {loadYear} from './council-tax';
import {csvCell} from './tax-export';
const name=(gss:string)=>loadYear('2026-27').authorities[gss].name;
const csv=(rows:(string|number|null)[][])=>'\uFEFF'+rows.map(row=>row.map(v=>csvCell(v??'')).join(',')).join('\r\n')+'\r\n';
const gbp=(p:number|null)=>p===null?null:p/100;
export function parishCsv(){const source=national.sources.parishes;return csv([
 ['mhclg_parish_code','billing_gss','billing_authority','parish','type','year','band_d_gbp','status','precept_gbp','tax_base_band_d_equivalents','notes','basis','source_url','source_sha256'],
 ...national.parishes.flatMap(p=>Object.entries(p.years).map(([year,y])=>[p.code,p.gss,name(p.gss),p.name,p.type,year,gbp(y.bandDPence),y.status,y.preceptPounds,y.taxBase,p.notes.map(n=>n.text).join(' | '),'Local precept only; not a full bill; overlapping areas must not be summed',source.fileUrl,source.sha256]))
]);}
export function componentCsv(){const source=national.sources.components;return csv([
 ['billing_gss','billing_authority','year','component','body','body_code','band_d_gbp','basis','source_url','source_sha256'],
 ...Object.entries(national.components).flatMap(([gss,c])=>[
 [gss,name(gss),national.year,'council_including_average_local_precepts',name(gss),gss,gbp(c.ownWithParishPence),'Area average; includes average local precepts and adult social care',source.fileUrl,source.sha256],
 ...c.parts.map(p=>[gss,name(gss),national.year,p.kind,p.name??'',p.code??'',gbp(p.bandDPence),'Published area-average component; bundled services are not extra charges',source.fileUrl,source.sha256]),
 [gss,name(gss),national.year,'area_total',name(gss),gss,gbp(c.areaPence),'Published total; not an extra component',source.fileUrl,source.sha256]
 ])
]);}
export function historyCsv(){const source=national.sources.history;return csv([
 ['billing_gss','billing_authority','year','measure','published_gbp','source_notes','basis','source_url','source_sha256'],
 ...Object.entries(national.history).flatMap(([gss,series])=>Object.entries(series).flatMap(([measure,s])=>Object.entries(s.values).map(([year,pounds])=>[gss,name(gss),year,measure,pounds,s.notes,'Displayed source precision; nominal; source geography and gaps retained',source.fileUrl,source.sha256])))
]);}
