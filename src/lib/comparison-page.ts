import {compareTax, comparisonQuery, compareGroup, groupLabel, heldYear, normaliseState, moneyPence, type TaxRow, type ComparisonState} from './tax-view';
import {matchesCouncil, matchingRegion, normalise, rankCouncils} from './council-search';
import {shareView} from './share';

type ComparisonSource = {publisher: string; table?: string; url: string; date?: string | null};
type SearchRow = TaxRow & {search: string};
type Side = 'a' | 'b';
const sides: Side[] = ['a', 'b'];
const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/;
const PAGE_SIZE = 12;
const root = document.querySelector<HTMLElement>('[data-tax-compare]')!;
const data = JSON.parse(root.querySelector('[data-comparison-data]')!.textContent!) as {site: string; rows: SearchRow[]; years: string[]; currentYear: string; sources: Record<string, ComparisonSource>};
const form = root.querySelector<HTMLFormElement>('form')!;
const fields = root.querySelector<HTMLFieldSetElement>('fieldset')!;
const status = root.querySelector<HTMLElement>('[data-comparison-status]')!;
const result = root.querySelector<HTMLElement>('[data-comparison-results]')!;
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
  root.querySelector(`[data-chosen="${side}"]`)!.textContent = row ? `Selected: ${row.name} (${row.classLabel}).` : 'No council selected.';
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
  years(); result.hidden = true; status.textContent = 'Choose Compare to update the result.';
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
function sourceLine(target: Element, year: string, calculated = false) {
  const source = data.sources[year];
  const a = document.createElement('a'); a.href = source.url; a.textContent = `${source.publisher}, ${source.table}, ${year.replace('-', '/')}`;
  target.replaceChildren(document.createTextNode(calculated ? 'Calculated from published area charges. Source: ' : 'Source: '), a, document.createTextNode(source.date ? `, published ${source.date}.` : '.'));
}
function years() {
  const chosen = sides.map(side => data.rows.find(row => row.slug === control(side).value));
  for (const option of control('year').options) option.disabled = !chosen.every(row => heldYear(row, option.value));
}
function show(value: ComparisonState, focus = false) {
  const checked = compareTax(data.rows, value, data.years);
  result.hidden = !checked.ok;
  if (!checked.ok) {status.textContent = checked.message; return;}
  status.textContent = 'Comparison ready.';
  root.querySelector('[data-comparison-heading]')!.textContent = `Band ${checked.band}, ${checked.year.replace('-', '/')}`;
  const difference = Math.abs(checked.differencePence);
  const lower = Math.min(checked.aPence, checked.bPence);
  const higherName = checked.differencePence > 0 ? checked.b.name : checked.a.name;
  const lowerName = checked.differencePence > 0 ? checked.a.name : checked.b.name;
  const percent = (difference / lower * 100).toFixed(2);
  const month = moneyPence(Math.round(difference / 12));
  root.querySelector('[data-result-difference]')!.textContent = difference === 0 ? 'Both areas have the same published annual charge.' : `${higherName} is ${moneyPence(difference)} more a year than ${lowerName}.`;
  sourceLine(root.querySelector('[data-difference-source]')!, checked.year, true);
  root.querySelector('[data-result-percentage]')!.textContent = `${percent}% of the lower annual charge`;
  root.querySelector('[data-percentage-calculation]')!.textContent = `Calculation: ${moneyPence(difference)} ÷ ${moneyPence(lower)} × 100, rounded to two decimal places.`;
  root.querySelector('[data-result-monthly-difference]')!.textContent = `${month} a month, spread over 12 months`;
  root.querySelector('[data-monthly-calculation]')!.textContent = `Calculation: ${moneyPence(difference)} ÷ 12, rounded to the nearest penny. A budgeting equivalent; councils set their own instalment plans.`;
  for (const [side, row, amount] of [['a', checked.a, checked.aPence], ['b', checked.b, checked.bPence]] as const) {
    const card = root.querySelector(`[data-result-side="${side}"]`)!;
    const link = card.querySelector<HTMLAnchorElement>('[data-result-name]')!;
    link.textContent = row.name; link.href = `/councils/${row.slug}/#band-${checked.band}`;
    link.title = `Open ${row.name}'s current council tax page`;
    card.querySelector('[data-result-label]')!.textContent = `${row.classLabel} · annual area charge`;
    card.querySelector('[data-result-annual]')!.textContent = moneyPence(amount);
    sourceLine(card.querySelector('[data-result-source]')!, checked.year);
  }
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
  else {result.hidden = true; status.textContent = 'Choose two councils to see their published charges.';}
}
const share = root.querySelector<HTMLButtonElement>('[data-share-view]')!;
share.disabled = false;
share.addEventListener('click', () => {
  const value = state(); if (!compareTax(data.rows, value, data.years).ok || result.hidden) return;
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
    const value = state(); history.replaceState(null, '', `/compare/?${comparisonQuery(value)}`); show(value);
  }
});
form.addEventListener('submit', event => {
  event.preventDefault(); invalidate(); const value = state();
  history.pushState(null, '', `/compare/?${comparisonQuery(value)}`); show(value, true);
});
root.querySelector('[data-swap]')!.addEventListener('click', () => {
  invalidate(); const value = state(); const checked = compareTax(data.rows, value, data.years);
  if (!checked.ok) {show(value); return;}
  history.pushState(null, '', `/compare/?${comparisonQuery({...value, a: value.b, b: value.a})}`); restore();
});
window.addEventListener('popstate', restore);

// Reveal the initial answer and controls together, without moving visible content.
root.dataset.comparisonReady = '';
