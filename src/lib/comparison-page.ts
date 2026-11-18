import {compareTax, comparisonQuery, comparisonWords, compareGroup, groupLabel, heldYear, normaliseState, moneyPence, validPence, type TaxBand, type TaxRow, type ComparisonState} from './tax-view';
import {allBandsHeld, bandChart, pairedBandsChart, type CompareSource} from './compare-charts';
import {matchesCouncil, matchingRegion, normalise, rankCouncils} from './council-search';
import {shareView} from './share';

type ComparisonSource = CompareSource;
type RecordRef = {publisher: string; short: string; url: string; full: string};
type SearchRow = TaxRow & {search: string};
type Side = 'a' | 'b';
const sides: Side[] = ['a', 'b'];
const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/;
const PAGE_SIZE = 12;
const root = document.querySelector<HTMLElement>('[data-tax-compare]')!;
const data = JSON.parse(root.querySelector('[data-comparison-data]')!.textContent!) as {site: string; rows: SearchRow[]; years: string[]; currentYear: string; sources: Record<string, ComparisonSource>; records: Record<string, RecordRef>; example: {a: string; b: string; band: string; year: string; png: Record<'band' | 'bands', string>}};
const form = root.querySelector<HTMLFormElement>('form')!;
const fields = root.querySelector<HTMLFieldSetElement>('fieldset')!;
const status = root.querySelector<HTMLElement>('[data-comparison-status]')!;
const result = root.querySelector<HTMLElement>('[data-comparison-results]')!;
const apart = root.querySelector<HTMLElement>('[data-comparison-apart]')!;
const exampleState: ComparisonState = {a: data.example.a, b: data.example.b, band: data.example.band, year: data.example.year};
const control = (name: string) => form.elements.namedItem(name) as HTMLSelectElement;
const state = (): ComparisonState => ({a: control('a').value, b: control('b').value, band: control('band').value, year: control('year').value});
const input = (side: Side) => root.querySelector<HTMLInputElement>(`[data-picker-filter="${side}"]`)!;
const list = (side: Side) => root.querySelector<HTMLUListElement>(`[data-chooser-matches="${side}"]`)!;
const say = (side: Side, text: string) => {root.querySelector(`[data-chooser-status="${side}"]`)!.textContent = text;};
const more = (side: Side) => root.querySelector<HTMLButtonElement>(`[data-chooser-more="${side}"]`)!;
const shown = {a: PAGE_SIZE, b: PAGE_SIZE};
// Any new query, selection or history change invalidates pending postcode replies.
let version = 0;
const requests: Partial<Record<Side, AbortController>> = {};
function invalidate() {
  version += 1;
  for (const side of sides) {
    const request = requests[side];
    if (request && !request.signal.aborted) {
      request.abort(); say(side, 'Postcode lookup cancelled. Choose Find to try again.');
    }
    delete requests[side];
  }
}
function eligible(side: Side): SearchRow[] {
  const first = data.rows.find(row => row.slug === control('a').value);
  return data.rows.filter(row => side === 'a' || (first && compareGroup(row.classCode) === compareGroup(first.classCode) && row.gss !== first.gss));
}
function options(side: Side, selected: string) {
  const choices = eligible(side);
  control(side).replaceChildren(new Option('Choose a council', ''), ...choices.map(row => new Option(row.name, row.slug)));
  control(side).value = choices.some(row => row.slug === selected) ? selected : '';
  const first = data.rows.find(row => row.slug === control('a').value);
  input(side).disabled = side === 'b' && !first;
  root.querySelector<HTMLButtonElement>(`[data-find="${side}"]`)!.disabled = input(side).disabled;
  const row = choices.find(row => row.slug === control(side).value);
  root.querySelector(`[data-chosen="${side}"]`)!.textContent = row ? `Selected: ${row.name} (${row.classLabel}).` : '';
  root.querySelector('[data-comparison-rule]')!.textContent = first ? `Choose another ${groupLabel(first)}. Other types of council are excluded.` : 'Choose the first council to see eligible comparisons.';
}
function matches(side: Side) {
  const query = input(side).value;
  const region = matchingRegion(query, data.rows.map(row => row.region));
  return rankCouncils(query, eligible(side).filter(row => matchesCouncil(query, row.search) && (!region || normalise(row.region) === region)));
}
function renderMatches(side: Side) {
  list(side).replaceChildren(); more(side).hidden = true;
  const query = input(side).value.trim();
  if (input(side).disabled) {say(side, 'Choose the first council before searching for the second.'); return;}
  if (!query) {say(side, 'Type a council, county or region, or enter a full postcode.'); return;}
  if (POSTCODE.test(query.toUpperCase())) {say(side, 'Choose Find to look up this postcode.'); return;}
  const rows = matches(side);
  say(side, rows.length ? `${rows.length} matching councils${rows.length > shown[side] ? ` (${shown[side]} listed)` : ''}.` : 'No matching eligible councils. Try a council name, county or region.');
  for (const row of rows.slice(0, shown[side])) {
    const li = document.createElement('li'); const button = document.createElement('button');
    button.type = 'button'; button.dataset.compareChoice = row.slug;
    button.append(document.createTextNode(row.name));
    const detail = document.createElement('span'); detail.textContent = `${row.classLabel} · ${row.region}`; button.append(detail);
    button.addEventListener('click', () => choose(side, row)); li.append(button); list(side).append(li);
  }
  more(side).hidden = rows.length <= shown[side];
}
function choose(side: Side, row: SearchRow) {
  invalidate();
  options(side, row.slug); input(side).value = row.name;
  list(side).replaceChildren(); more(side).hidden = true;
  say(side, `${row.name} selected.`);
  if (side === 'a') {
    options('b', control('b').value);
    input('b').value = ''; renderMatches('b');
  }
  years(); result.hidden = true; apart.hidden = true; status.textContent = 'Choose Compare to update the result.';
  // The result button disappears on selection, so return focus to its search box.
  input(side).focus();
}
async function find(side: Side) {
  if (input(side).disabled) return;
  const postcode = input(side).value.toUpperCase().replace(/\s+/g, ' ').trim();
  if (!POSTCODE.test(postcode)) {renderMatches(side); list(side).querySelector('button')?.focus(); return;}
  requests[side]?.abort();
  const request = new AbortController(); requests[side] = request;
  const current = version;
  const fresh = () => current === version && !request.signal.aborted;
  const timer = window.setTimeout(() => request.abort(), 10000);
  say(side, 'Finding the council for that postcode...');
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, {signal: request.signal});
    if (!fresh()) return;
    if (response.status === 404) {say(side, "postcodes.io does not know that postcode. Check it, or type the council's name."); return;}
    if (!response.ok) throw new Error('Postcode lookup unavailable');
    const body = await response.json() as {result?: {codes?: {admin_district?: string}}};
    if (!fresh()) return;
    const row = data.rows.find(row => row.gss === body.result?.codes?.admin_district);
    if (!row) {say(side, 'That postcode is not in an English council listed here. Choose a council by name.'); return;}
    if (!eligible(side).some(candidate => candidate.gss === row.gss)) {
      const checked = compareTax(data.rows, {...state(), [side]: row.slug}, data.years);
      say(side, checked.ok ? 'Choose another eligible council.' : checked.message); return;
    }
    choose(side, row);
  } catch {
    // Aborted old queries stay silent; a timeout on the current query is recoverable.
    if (current === version && requests[side] === request) say(side, "The postcode lookup did not answer. Try again, or type the council's name.");
  } finally {
    window.clearTimeout(timer);
    if (requests[side] === request) delete requests[side];
  }
}
/** The short record line, the same markup RecordLine.astro prints for the example. */
function recordLine(target: Element, year: string, method?: string) {
  const ref = data.records[year];
  const p = document.createElement('p'); p.className = 'source-line record-line';
  const publisher = document.createElement('span'); publisher.className = 'record-publisher'; publisher.textContent = ref.publisher;
  const doc = document.createElement('a'); doc.href = ref.url; doc.textContent = ref.short;
  const full = document.createElement('a'); full.className = 'record-full'; full.href = ref.full; full.textContent = 'Full reference';
  p.append(...(method ? [`${method}: `] : []), publisher, ' ', doc, '. ', full);
  target.replaceChildren(p);
}
function years() {
  const chosen = sides.map(side => data.rows.find(row => row.slug === control(side).value));
  for (const option of control('year').options) option.disabled = !chosen.every(row => heldYear(row, option.value));
}
const fragment = (html: string) => {const t = document.createElement('template'); t.innerHTML = html; return t.content;};
/** Puts a fresh drawing into a chart block, keeping the block, its table element and its actions. */
function draw(name: 'band' | 'bands', out: {svg: string; table: string; title?: string} | null, year: string, example: boolean) {
  const block = root.querySelector<HTMLElement>(`[data-compare-chart="${name}"]`)!;
  block.hidden = !out;
  if (!out) return;
  block.querySelector('[data-chart-title]')!.textContent = out.title ?? '';
  block.querySelector('svg.ek-chart')!.replaceWith(fragment(out.svg));
  // chart-actions.js holds the table element for Copy table, so its rows are replaced in place.
  const table = block.querySelector('details.ek-twin table')!;
  table.replaceChildren(...fragment(out.table).querySelector('table')!.childNodes);
  recordLine(block.querySelector('[data-chart-record]')!, year);
  // Only the example pair has a prebuilt PNG; a reader's own pair offers the table instead.
  const png = block.querySelector<HTMLAnchorElement>('[data-chart-png]');
  if (png) {png.closest('li')!.hidden = !example; png.href = data.example.png[name];}
}
const exampleShown = () => !result.hidden && !root.querySelector<HTMLElement>('[data-comparison-example]')!.hidden;
/** What the controls act on: the reader's choices, or the pair on screen while the example shows. */
const current = (): ComparisonState => exampleShown() ? {...exampleState, band: control('band').value, year: control('year').value} : state();
const isExample = (value: ComparisonState) => value.a === exampleState.a && value.b === exampleState.b && value.band === exampleState.band && value.year === exampleState.year;
/** Two councils that cannot share a scale: each figure on its own, or said to be unheld. */
function showApart(value: ComparisonState, message: string) {
  const pair = sides.map(side => data.rows.find(row => row.slug === value[side]));
  apart.hidden = !(pair[0] && pair[1] && pair[0].gss !== pair[1].gss && data.years.includes(value.year) && /^[A-H]$/.test(value.band));
  if (apart.hidden) return;
  root.querySelector('[data-apart-reason]')!.textContent = `Each council area's published Band ${value.band} area charge for ${value.year.replace('-', '/')} is shown below, apart and not on one scale.`;
  pair.forEach((row, i) => {
    const card = root.querySelector(`[data-apart-side="${sides[i]}"]`)!;
    const link = card.querySelector<HTMLAnchorElement>('[data-apart-name]')!;
    link.textContent = row!.name; link.href = `/councils/${row!.slug}/#band-${value.band}`;
    const pence = row!.years[value.year]?.[value.band as TaxBand];
    card.querySelector('[data-apart-label]')!.textContent = `${row!.classLabel} · Band ${value.band} annual area charge, ${value.year.replace('-', '/')}`;
    card.querySelector('[data-apart-annual]')!.textContent = validPence(pence) ? moneyPence(pence) : 'Not held';
    const source = card.querySelector('[data-apart-source]')!;
    if (validPence(pence)) recordLine(source, value.year);
    else {const p = document.createElement('p'); p.className = 'small'; p.textContent = `No published Band ${value.band} figure for ${value.year.replace('-', '/')} is held under the current authority code. It is not shown as zero.`; source.replaceChildren(p);}
  });
}
function show(value: ComparisonState, focus = false, example = false) {
  const checked = compareTax(data.rows, value, data.years);
  // Half a choice (one council so far) keeps the example on screen while it asks for the other.
  if (!checked.ok && (!value.a || !value.b) && exampleShown()) {status.textContent = checked.message; return;}
  result.hidden = !checked.ok;
  apart.hidden = true;
  if (!checked.ok) {status.textContent = checked.message; showApart(value, checked.message); return;}
  status.textContent = example ? 'Choose two councils to see their published charges.' : 'Comparison ready.';
  root.querySelector<HTMLElement>('[data-comparison-example]')!.hidden = !example;
  const words = comparisonWords(checked);
  root.querySelector('[data-comparison-heading]')!.textContent = words.heading;
  root.querySelector('[data-result-difference]')!.textContent = words.difference;
  recordLine(root.querySelector('[data-difference-source]')!, checked.year, 'Calculated from published area charges');
  root.querySelector('[data-result-percentage]')!.textContent = words.percentage;
  root.querySelector('[data-percentage-calculation]')!.textContent = words.percentageCalculation;
  root.querySelector('[data-result-monthly-difference]')!.textContent = words.monthly;
  root.querySelector('[data-monthly-calculation]')!.textContent = words.monthlyCalculation;
  for (const [side, row, amount] of [['a', checked.a, checked.aPence], ['b', checked.b, checked.bPence]] as const) {
    const card = root.querySelector(`[data-result-side="${side}"]`)!;
    const link = card.querySelector<HTMLAnchorElement>('[data-result-name]')!;
    link.textContent = row.name; link.href = `/councils/${row.slug}/#band-${checked.band}`;
    link.title = `Open ${row.name}'s current council tax page`;
    card.querySelector('[data-result-label]')!.textContent = `${row.classLabel} · annual area charge`;
    card.querySelector('[data-result-annual]')!.textContent = moneyPence(amount);
    recordLine(card.querySelector('[data-result-source]')!, checked.year);
  }
  const source = data.sources[checked.year];
  const shownExample = isExample(value);
  const full = allBandsHeld(checked.a, checked.b, checked.year);
  // Both drawings are made before either is shown, so a drawing the kit refuses never
  // leaves the previous pair's bars beside this pair's words.
  let drawn: {band: ReturnType<typeof bandChart> | null; bands: ReturnType<typeof bandChart> | null};
  try {drawn = {band: bandChart(checked.a, checked.b, checked.band, checked.year, source), bands: full ? pairedBandsChart(checked.a, checked.b, checked.year, source) : null};}
  catch {drawn = {band: null, bands: null};}
  draw('band', drawn.band, checked.year, shownExample);
  draw('bands', drawn.bands, checked.year, shownExample);
  const missing = root.querySelector<HTMLElement>('[data-bands-missing]')!;
  missing.hidden = Boolean(drawn.band) && full;
  missing.textContent = !drawn.band ? 'The drawings could not be made for this pair. The published charges and the calculations above stand.'
    : full ? '' : `Not every band from A to H is held for both councils in ${checked.year.replace('-', '/')}, so the bands are not drawn. No band is shown as zero.`;
  root.querySelector<HTMLAnchorElement>('[data-comparison-link]')!.href = `/compare/?${comparisonQuery(value)}`;
  if (focus) root.querySelector<HTMLElement>('[data-comparison-heading]')!.focus();
}
function restore() {
  invalidate();
  const params = new URLSearchParams(location.search);
  const value = normaliseState({a: params.get('a'), b: params.get('b'), band: params.get('band'), year: params.get('year')}, data.currentYear);
  options('a', value.a); options('b', value.b);
  for (const side of sides) {input(side).value = ''; shown[side] = PAGE_SIZE; renderMatches(side);}
  control('band').value = value.band; control('year').value = value.year;
  years();
  if (params.has('a') || params.has('b')) show(value);
  // No pair asked for: the worked example stays, labelled as one; the controls stay empty.
  else show(exampleState, false, true);
}
const share = root.querySelector<HTMLButtonElement>('[data-share-view]')!;
share.disabled = false;
share.addEventListener('click', () => {
  const value = current(); if (!compareTax(data.rows, value, data.years).ok || result.hidden) return;
  void shareView(new URL(`/compare/?${comparisonQuery(value)}`, data.site).href, 'Compare council tax', root.querySelector('[data-share-status]')!, root.querySelector('[data-share-fallback]')!);
});
fields.disabled = false; form.hidden = false; restore();
for (const side of sides) {
  input(side).addEventListener('input', () => {invalidate(); shown[side] = PAGE_SIZE; renderMatches(side);});
  input(side).addEventListener('keydown', event => {if (event.key === 'Enter') {event.preventDefault(); void find(side);}});
  root.querySelector(`[data-find="${side}"]`)!.addEventListener('click', () => {void find(side);});
  more(side).addEventListener('click', () => {
    const previous = shown[side]; shown[side] += PAGE_SIZE; renderMatches(side);
    list(side).querySelectorAll('button')[previous]?.focus();
  });
}
form.addEventListener('change', event => {
  invalidate(); years();
  // Updating the answer in place preserves the selected band, year and focus.
  if ((event.target === control('band') || event.target === control('year')) && !result.hidden) {
    // The example becomes the reader's pair: its councils go into the choosers, so a
    // further change of band or year keeps acting on the same two councils.
    if (exampleShown()) for (const side of sides) {const row = data.rows.find(r => r.slug === exampleState[side])!; options(side, row.slug); input(side).value = row.name;}
    const value = current(); history.replaceState(null, '', `/compare/?${comparisonQuery(value)}`); show(value);
  }
});
form.addEventListener('submit', event => {
  event.preventDefault(); invalidate(); const value = state();
  history.pushState(null, '', `/compare/?${comparisonQuery(value)}`); show(value, true);
});
root.querySelector('[data-swap]')!.addEventListener('click', () => {
  invalidate(); const value = current(); const checked = compareTax(data.rows, value, data.years);
  if (!checked.ok) {show(value); return;}
  history.pushState(null, '', `/compare/?${comparisonQuery({...value, a: value.b, b: value.a})}`); restore();
});
window.addEventListener('popstate', restore);

// Reveal the initial answer and controls together, without moving visible content.
root.dataset.comparisonReady = '';
