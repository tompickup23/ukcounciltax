import type {APIRoute} from 'astro';
import {parishCsv} from '../../lib/national-export';
export const GET:APIRoute=()=>new Response(parishCsv(),{headers:{'Content-Type':'text/csv; charset=utf-8'}});
