/**
 * The find box over a ranked table (18 November 2026). Without script the table
 * reads in full and the jump links are plain anchors; with it, typing part of a
 * name hides the rows that do not match and a live line says how many show. The
 * order never changes and no row is removed from the page.
 */
export function enhanceLeagueFind(root: ParentNode = document): void {
  const panel = root.querySelector<HTMLElement>('[data-league-find]');
  const table = root.querySelector<HTMLTableElement>('[data-league-table]');
  const status = root.querySelector<HTMLElement>('[data-league-count]');
  const input = panel?.querySelector<HTMLInputElement>('[data-league-q]');
  if (!panel || !table || !status || !input) return;
  const rows = [...table.tBodies[0].rows];
  const names = new Map(rows.map(row => [row, (row.querySelector('th')?.firstChild?.textContent ?? '').trim().toLowerCase()]));
  const total = rows.length;
  panel.hidden = false;
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const ok = !query || names.get(row)!.includes(query);
      row.hidden = !ok;
      if (ok) shown++;
    }
    status.hidden = !query;
    status.textContent = `Showing ${shown} of ${total}.`;
  });
}
