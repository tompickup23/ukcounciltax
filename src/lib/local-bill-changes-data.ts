import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import type {BillChanges} from './local-bill-changes';
const dir=join(process.cwd(),'data/local-bills/changes');
export const billChanges:BillChanges[]=existsSync(dir)?readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(join(dir,f),'utf8'))):[];
