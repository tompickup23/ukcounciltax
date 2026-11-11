import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const data = JSON.parse(readFileSync(join(process.cwd(), 'data/council-links.json'), 'utf8')) as {
  source: {name: string; url: string; checkedOn: string; exportDate: string; checkedBy: string; licence: string};
  links: Record<string, {councilTax: string}>;
};
const expiry = Date.parse(`${data.source.checkedOn}T00:00:00Z`) + 91 * 86400000;
if (Date.now() >= expiry) throw new Error('A3 stop: council payment links are stale. Rerun UK Places local links and import the reviewed data commit here.');
export const councilLinksSource = data.source;
export function councilTaxLink(gss: string): string | null { return data.links[gss]?.councilTax ?? null; }
