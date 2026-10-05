import type {APIRoute} from 'astro';
import {componentCsv} from '../../lib/national-export';
export const GET:APIRoute=()=>new Response(componentCsv(),{headers:{'Content-Type':'text/csv; charset=utf-8'}});
