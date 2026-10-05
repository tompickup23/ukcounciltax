import type {APIRoute} from 'astro';
import {taxSources} from '../../lib/tax-view-data';
import {localBills} from '../../lib/local-bill-data';
import {national} from '../../lib/national-data';
import {devolved} from '../../lib/devolved';
export const GET:APIRoute=()=>new Response(JSON.stringify({england:taxSources(),national:national.sources,devolved,localBills},null,2),{headers:{'Content-Type':'application/json'}});
