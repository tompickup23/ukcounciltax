import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import type {LocalBill} from './local-bill';
const dir=join(process.cwd(),'data/local-bills');
export const localBills:LocalBill[]=readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(join(dir,f),'utf8')));
