import {absoluteUrl} from './site';

const PARENTS: Record<string, string> = {
  councils: 'Councils',
  'council-tax': 'Council tax',
  tools: 'Tools',
  scotland: 'Scotland',
  wales: 'Wales',
  findings: 'Findings',
};

export function breadcrumbList(path: string, title: string) {
  const parts = path.split('/').filter(Boolean);
  const trail = [{name:'Home', item:absoluteUrl('/')}];
  if (parts.length > 1 && PARENTS[parts[0]]) {
    trail.push({name:PARENTS[parts[0]],item:absoluteUrl(`/${parts[0]}/`)});
  }
  // The towns pages sit one level deeper: Home, Council tax, the towns hub, the page.
  if (parts[0] === 'council-tax' && parts[1] === 'towns' && parts.length > 2) {
    trail.push({name:'Parish and unparished areas',item:absoluteUrl('/council-tax/towns/')});
  }
  if (parts.length) trail.push({name:title,item:absoluteUrl(path)});
  return {
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:trail.map((item, index) => ({'@type':'ListItem',position:index+1,...item})),
  };
}
