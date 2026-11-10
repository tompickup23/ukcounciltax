import {JSDOM} from 'jsdom';

/** Checks the complete static answer, independently of the band selector. */
export function profileProblems(html, slug) {
  const dom = new JSDOM(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ''));
  const doc = dom.window.document;
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
  dom.window.close();
  return problems;
}
