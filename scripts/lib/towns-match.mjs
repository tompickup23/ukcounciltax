/** Name matching of MHCLG parish rows to ONS parish codes within one council.
 * Ported from docs/towns-research/match2.py (15 November 2026). Tiers, in order:
 * exact normalised name, exact after removing brackets, combined unit. Prefix and
 * spelling candidates are reported for review and are only ever accepted through
 * data/towns/overrides.json.
 */

/** Minimal RFC 4180 CSV reader: quoted fields, doubled quotes, CRLF, BOM. */
export function readCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

export function base(s) {
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  s = s.replace(/&/g, ' and ').replace(/[-‐‑]/g, ' ').replace(/['’]/g, '').replace(/,/g, ' ');
  s = s.replace(/\bst\.?(?=\s)/g, 'st').replace(/\bsaint\b/g, 'st');
  s = s.replace(/[^a-z0-9() ]/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}
export const stripBrackets = s => s.replace(/\s*\(.*$/, '').trim();
export function clean(s) {
  s = s.replace(/\b(?:(?:town|parish|city|village|community|neighbourhood) )?(?:council|meeting|charter trustees?)\b/g, ' ');
  s = s.replace(/\b(?:grouped|group)\b.*$/, ' ');
  s = s.trim().replace(/\s(?:town|parish)$/, '');
  return s.replace(/\s+/g, ' ').trim();
}
export function keys(name) {
  const b = base(name);
  return [...new Set([clean(b), clean(stripBrackets(b))])].filter(Boolean);
}

const PAIRED = 'great|little|east|west|north|south|upper|lower|high|nether|over|long|old|new';
const PAIR = new RegExp(`^(${PAIRED}) and (${PAIRED}) (.+)$`);

/** Edit-distance ratio in the manner of difflib's quick comparison (2M / T). */
function ratio(a, b) {
  const m = a.length, n = b.length; if (!m && !n) return 1;
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return 2 * dp[m][n] / (m + n);
}

/** candidates: [{code, name, k}] for the council. Returns {codes, how}. */
export function matchName(name, candidates) {
  if (!candidates.length) return {codes: [], how: 'council-not-in-ons-list'};
  const ks = keys(name);
  for (let i = 0; i < ks.length; i++) {
    const hit = candidates.filter(c => c.k === ks[i]);
    if (hit.length > 1) return {codes: hit.map(c => c.code), how: 'same-name-twice'};
    if (hit.length === 1) return {codes: [hit[0].code], how: i === 0 ? 'exact' : 'exact-after-brackets'};
  }
  const k = ks.at(-1);
  const m = PAIR.exec(k);
  const parts = m ? [`${m[1]} ${m[3]}`, `${m[2]} ${m[3]}`] : k.split(/ and | with /).map(x => x.trim()).filter(Boolean);
  if (parts.length > 1) {
    const hit = parts.flatMap(part => candidates.filter(c => c.k === part));
    if (hit.length === parts.length) return {codes: hit.map(c => c.code), how: 'combined-unit'};
  }
  const prefix = candidates.filter(c => c.k.startsWith(k + ' ') || k.startsWith(c.k + ' and '));
  if (prefix.length === 1) return {codes: [], how: 'review-prefix', suggestion: prefix.map(c => c.code)};
  let best = null, score = 0;
  for (const c of candidates) { const r = ratio(k, c.k); if (r > score) { score = r; best = c; } }
  if (best && score >= 0.88) return {codes: [], how: 'review-spelling', suggestion: [best.code], score};
  return {codes: [], how: 'unmatched'};
}
