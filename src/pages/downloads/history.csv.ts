import type {APIRoute} from 'astro';
import {historyCsv} from '../../lib/national-export';
export const GET:APIRoute=()=>new Response(historyCsv(),{headers:{'Content-Type':'text/csv; charset=utf-8'}});
