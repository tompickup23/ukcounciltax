/** Rules and membership are verified against the pinned pdftotext output. */
const normal = text => text.toLowerCase().replaceAll('&', 'and').replace(/[^a-z0-9]/g, '');
export function referendumData(text, authorities, components, source) {
  const pages = text.split('\f');
  const compact = page => pages[page-1].replace(/\s+/g, ' ').trim();
  const definitions = [
    ['ordinary-social-care', '2(a)', 7, '3', 500, 200, 300,
      'is 5% (comprising 2% for expenditure on adult social care, and 3% for other expenditure), or more than 5%'],
    ['district', '2(e)', 8, '7', 300, 0, 300,
      '3%, or more than 3%, greater than its relevant basic amount of council tax for 2025-26, and'],
    ['exception-7.5', '2(i)', 9, '11', 750, 200, 550,
      'is 7.5% (comprising 2% for expenditure on adult social care, and 5.5% for other expenditure), or more than 7.5%'],
    ['exception-9', '2(j)', 9, '12', 900, 200, 700,
      'is 9% (comprising 2% for expenditure on adult social care, and 7% for other expenditure), or more than 9%'],
    ['exception-6.75', '2(k)', 9, '13', 675, 200, 475,
      'is 6.75% (comprising 2% for expenditure on adult social care, and 4.75% for other expenditure), or more than 6.75%'],
  ];
  const principles = Object.fromEntries(definitions.map(([id, category, page, paragraph, percentageBasisPoints, ascBasisPoints, otherBasisPoints, quote]) => {
    if (!compact(page).includes(quote)) throw new Error(`Referendum quotation differs: ${id}`);
    const poundQuote = 'more than £5.00 greater than its relevant basic amount of council tax';
    if (id === 'district' && !compact(page).includes(poundQuote)) throw new Error('District pound quotation differs');
    return [id, {category, percentageBasisPoints, percentageComparison:'greater-than-or-equal',
      poundPence:id === 'district' ? '500' : null, poundComparison:id === 'district' ? 'greater-than' : null,
      join:id === 'district' ? 'AND' : 'single', ascBasisPoints, otherBasisPoints,
      citation:{file:source.file, url:source.url, page, annex:'A', paragraph, categoryPage:7, categoryParagraph:category},
      quotes:id === 'district' ? [quote, poundQuote] : [quote]}];
  }));
  const exceptions = {
    E08000009:['exception-7.5','Trafford Council'], E06000007:['exception-7.5','Warrington Borough Council'],
    E06000040:['exception-7.5','Royal Borough of Windsor and Maidenhead Council'],
    E06000024:['exception-9','North Somerset Council'], E06000051:['exception-9','Shropshire Council'],
    E06000058:['exception-6.75','Bournemouth, Christchurch and Poole Council'],
  };
  const annexNames = [];
  for (const page of [11,12,13,14]) for (const line of pages[page-1].split('\n')) {
    const name = line.trim();
    if (name && !/^\(|^\d+$/.test(name)) annexNames.push({name,page});
  }
  const mappings = {};
  for (const [gss, a] of Object.entries(authorities)) {
    let id, membership;
    if (exceptions[gss]) {
      const [rule, name] = exceptions[gss];
      if (!compact(7).includes(name)) throw new Error(`Named exception not found: ${gss}`);
      id = rule; membership = {page:7,annex:'A',paragraph:principles[rule].category,name};
    } else if (a.classCode === 'SD' && components[gss]?.parts.some(p=>p.kind==='county' && p.code?.startsWith('E10'))) {
      const quote = 'a shire district council” means a district council for an area for which there is a county council';
      if (!compact(6).includes(quote)) throw new Error('District definition differs');
      id = 'district'; membership = {page:6,annex:'A',paragraph:'1(1)',quote,countyGss:components[gss].parts.find(p=>p.kind==='county').code};
    } else {
      const match = annexNames.filter(n=>normal(n.name)===normal(a.name));
      if (match.length === 1) {id = 'ordinary-social-care'; membership = {...match[0],annex:'B',paragraph:'Authority list for Annex A 2(a)'};}
    }
    if (id) mappings[gss] = {principle:id,membership,...principles[id]};
  }
  return {edition:'2026-27',source,principles,mappings};
}
