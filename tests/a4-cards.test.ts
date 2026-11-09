import {existsSync,readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {rankingPaths,parishPages,parishPath} from '../src/lib/paths';
import {absoluteUrl} from '../src/lib/site';
import {hubCardPath} from '../src/lib/og';

it.skipIf(!existsSync('dist/precepts/parishes/index.html'))('uses the existing default card for all 221 new pages',()=>{
 const paths=['/council-tax/ranked/',...rankingPaths(),'/precepts/parishes/',...parishPages().map(parishPath)];
 expect(paths).toHaveLength(221);
 for(const path of paths) {
  const html=readFileSync(`dist${path}index.html`,'utf8');
  const image=html.match(/<meta property="og:image" content="([^"]+)"/)!;
  expect(image[1]).toBe(absoluteUrl(hubCardPath('home')));
 }
});
