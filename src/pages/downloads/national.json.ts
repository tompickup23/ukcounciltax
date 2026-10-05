import type {APIRoute} from 'astro';
import {national} from '../../lib/national-data';
export const GET:APIRoute=()=>new Response(JSON.stringify(national),{headers:{'Content-Type':'application/json'}});
