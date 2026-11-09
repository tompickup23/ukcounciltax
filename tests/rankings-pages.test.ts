import {existsSync, readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {rankingClasses} from '../src/lib/ranking-page';
const read = (path:string) => readFileSync(`dist${path}index.html`,'utf8');
const text = (html:string) => html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').replace(/&#39;|&#x27;/g,"'").replace(/&amp;/g,'&').trim();
const rows = (html:string) => [...(html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? '').matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(r=>r[0]);

describe.skipIf(!existsSync('dist/council-tax/ranked/index.html'))('built class ranking pages', () => {
  it('has six pages, exact class counts, one matching heading and resolving profile links', () => {
    for (const [index,cls] of rankingClasses.entries()) {
      const html=read(`/council-tax/ranked/${cls.slug}/`);
      expect(rows(html)).toHaveLength([164,63,36,33,21][index]);
      const headings=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]; expect(headings).toHaveLength(1);
      expect(text(headings[0][1])).toBe(text(html.match(/<title>(.*?)<\/title>/)![1]).replace(' | UK Council Tax',''));
      expect(text(html).toLowerCase()).not.toMatch(/\b(?:cheapest|most expensive|best|worst)\b/);
      for(const link of html.matchAll(/href="(\/councils\/[^"#]+\/)(?:#[^"]*)?"/g)) expect(existsSync(`dist${link[1]}index.html`)).toBe(true);
    }
    const index=read('/council-tax/ranked/'); expect(rows(index)).toHaveLength(5); expect([...index.matchAll(/<h1\b/g)]).toHaveLength(1);
  });
  it('prints unitary extremes, the tied positions and Lewes with its published note', () => {
    const unitary=rows(read('/council-tax/ranked/unitary-authorities/')).map(text);
    expect(unitary[0]).toMatch(/^1 Windsor and Maidenhead.*£1,952.62/);
    expect(unitary.at(-1)).toMatch(/^63 Dorset.*£2,765.02/);
    const shire=rows(read('/council-tax/ranked/shire-districts/')).map(text);
    expect(shire[20]).toMatch(/^21= Havant.*116=/); expect(shire[21]).toMatch(/^21= Rushmoor.*116=/); expect(shire[22]).toMatch(/^23 /);
    expect(shire.at(-1)).toContain('164 Lewes'); expect(shire.at(-1)).toContain('note ad');
    expect(shire.at(-1)).toContain('pending approval subject to a full council decision on 26 March 2026');
    for(const [index,cls] of rankingClasses.entries()) {
      const html=read(`/council-tax/ranked/${cls.slug}/`);
      const noted=new Set([...html.matchAll(/id="note-([^-]+)-[^" ]+"/g)].map(match=>match[1]));
      expect(noted.size).toBe([6,6,2,0,2][index]);
    }
  });
});
