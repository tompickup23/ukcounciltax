import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
const national = JSON.parse(readFileSync('data/national/england.json', 'utf8'));
const registry = JSON.parse(readFileSync('data/registry/councils.json', 'utf8'));
const bySlug = Object.fromEntries(Object.values(registry.councils).map(council => [council.slug, council]));

const dom = new JSDOM('');

/** Checks the complete static answer, independently of the band selector. */
export function profileProblems(html, slug) {
  const doc = dom.window.document;
  doc.documentElement.innerHTML = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  const problems = [];
  const text = element => element?.textContent.replace(/\s+/g, ' ').trim() ?? '';
  const section = doc.querySelector('#council-tax');
  const tables = section?.querySelectorAll('table[data-band-table]') ?? [];
  if (tables.length !== 1) problems.push('one published band table is required');
  else {
    const table = tables[0];
    if (JSON.stringify([...table.querySelectorAll('thead th')].map(text)) !== JSON.stringify(['Band', 'Yearly charge', 'Divided by 10', 'Divided by 12'])) problems.push('band table headings differ');
    const rows = [...table.querySelectorAll('tbody tr')];
    if (rows.map(row => text(row.querySelector('th'))).join('') !== 'ABCDEFGH') problems.push('band rows must be A to H');
    if (!section.querySelector('.band-selector') || !(table.compareDocumentPosition(section.querySelector('.band-selector')) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING)) problems.push('band table must precede the selector');
    if (slug === 'burnley') for (const [band, values] of [['D', ['£2,549.42','£254.94','£212.45']], ['H', ['£5,098.84','£509.88','£424.90']]]) {
      const row = rows.find(row => text(row.querySelector('th')) === band);
      if (JSON.stringify([...row?.querySelectorAll('td') ?? []].map(text)) !== JSON.stringify(values)) problems.push(`Burnley band ${band} differs`);
    }
  }
  if (section?.querySelectorAll('#band-bars svg.ek-chart').length !== 1 || section?.querySelectorAll('#band-bars g.ek-bar').length !== 8 || section?.querySelectorAll('#band-bars [data-ek-focus="D"]').length !== 1) problems.push('eight band bars with D marked are required');
  if (text(doc.body).includes('a month over ten instalments')) problems.push('compact profile retains monthly panel text');
  if (slug === 'lewes' && (text(section).match(/pending approval subject to a full council decision on 26 March 2026/g) ?? []).length !== 1) problems.push('Lewes note must appear once in the band answer');
  if (doc.querySelectorAll('[data-parish-caveat]').length !== 1 || !section?.querySelector('[data-parish-caveat]')) problems.push('one parish caveat must sit in the band answer');
  if (text(doc.body).includes('A home in a parish with its own precept pays a different amount')) problems.push('the old parish caveat remains');
  const history = doc.querySelector('#history');
  if (doc.querySelectorAll('[data-band-d-line]').length !== 1 || history?.querySelectorAll('details.data-drawer').length !== 1) problems.push('one history chart and drawer are required');
  if (doc.querySelector('.band-d-line-table, #all-band-history, #long-history')) problems.push('duplicate history remains');
  const gss = bySlug[slug]?.gss;
  if (gss && history?.querySelectorAll('tbody tr').length !== Object.values(national.history[gss].area.values).filter(value => value !== null).length) problems.push('history rows differ from the published values');
  if (gss) {
    const published = Object.entries(national.history[gss].area.values).filter(([, value]) => value !== null).map(([year, value]) => [year.replace('-', '/'), new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP', minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2}).format(value)]);
    const displayed = [...history?.querySelectorAll('tbody tr') ?? []].map(row => [...row.querySelectorAll('th,td')].map(text));
    if (JSON.stringify(displayed) !== JSON.stringify(published)) problems.push('history amounts differ from their published precision');
  }
  if (slug === 'burnley' && (!text(history).includes('1993/94') || !text(history).includes('£628') || history?.querySelectorAll('tbody tr').length !== 34)) problems.push('Burnley history anchors differ');
  const bill = doc.querySelector('#precept-breakdown');
  if (bill?.querySelectorAll('svg.ek-chart').length !== 1) problems.push('one bill chart is required');
  if (text(doc.body).includes('County or GLA')) problems.push('generic county label remains');
  const rowHeaders = [...bill?.querySelectorAll('table.data tbody th[scope="row"]') ?? []].map(text);
  if (slug === 'manchester' && rowHeaders.some(label => ['County council','Greater London Authority'].includes(label))) problems.push('Manchester has an inapplicable county row');
  if (slug === 'camden' && rowHeaders.some(label => ['Police','Fire','Combined authority'].includes(label))) problems.push('Camden has an inapplicable separate row');
  if (slug === 'burnley' && JSON.stringify(rowHeaders.slice(1)) !== JSON.stringify(['County council','Police','Fire','Combined authority'])) problems.push('Burnley component rows differ');
  const position = doc.querySelector('#compared #class-position-chart');
  if (position?.querySelectorAll('svg.ek-chart').length !== 1) problems.push('one class position strip is required');
  if (slug === 'burnley') for (const value of ['£2,549.42','£2,255.21','£2,446.43','£2,609.31','£2,756.17']) {
    if (!text(position?.querySelector('details table')).includes(value)) problems.push(`Burnley position strip lacks ${value}`);
  }
  const map = doc.querySelector('#map');
  if (map?.querySelectorAll('svg.ek-chart').length !== 1 || (gss && map.querySelector(`[data-ek-focus="${gss}"]`) === null)) problems.push('one locator map must mark the council');
  if (doc.querySelector('[data-boundary-map]')) problems.push('the mini map remains');
  const payment = doc.querySelector('#discounts-and-paying');
  if (!payment) problems.push('discounts and payment section is missing');
  for (const id of ['check-discounts-and-reductions','if-paying-is-difficult','check-the-payment-schedule']) if (!payment?.querySelector(`a[href="/help/#${id}"]`)) problems.push(`payment section lacks ${id}`);
  if (slug === 'burnley' && !payment?.querySelector('a[href="https://burnley.gov.uk/counciltax/paying-your-council-tax/"]')) problems.push('Burnley payment URL differs');
  if (slug === 'camden' && !text(payment).includes("We do not hold a checked link to Camden's own council tax page.")) problems.push('Camden absence wording differs');
  const strip = doc.querySelector('#more [data-network-strip]');
  if (!strip) problems.push('network strip is missing');
  if (slug === 'burnley' && (strip?.children.length !== 5 || !text(strip).includes('100,946') || !text(strip).includes('2027'))) problems.push('Burnley network lines differ');
  const nav = doc.querySelector('main nav.page-contents');
  const navIds = [...nav?.querySelectorAll('a[href^="#"]') ?? []].map(link => link.getAttribute('href').slice(1));
  const sectionIds = [...doc.querySelectorAll('main section[id]')].filter(section => nav && (nav.compareDocumentPosition(section) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING)).map(section => section.id);
  if (!nav || JSON.stringify(navIds) !== JSON.stringify(sectionIds)) problems.push('page contents differ from document section order');
  if (doc.querySelectorAll('.action-links a').length !== 3) problems.push('the action row must hold three links');
  doc.documentElement.innerHTML = '';
  return problems;
}
