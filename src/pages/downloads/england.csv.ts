import type {APIRoute} from 'astro';
import {taxRows,taxSources} from '../../lib/tax-view-data';
import {YEARS,BANDS} from '../../lib/council-tax';
const cell=(v:unknown)=>`"${String(v??'').replaceAll('"','""')}"`;
export const GET:APIRoute=()=>{const sources=taxSources();const rows:unknown[][]=[['gss','council','region','council_type','financial_year','band','annual_pounds','basis','source_url','table']];for(const r of taxRows())for(const y of YEARS)for(const b of BANDS)rows.push([r.gss,r.name,r.region,r.classLabel,y,b,r.years[y][b]===undefined?'':(r.years[y][b]!/100).toFixed(2),'Area average including average parish precepts',sources[y].url,sources[y].table]);return new Response(rows.map(r=>r.map(cell).join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8'}});};
