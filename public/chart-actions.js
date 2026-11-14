const initialised = new WeakSet();
function initialiseChartActions() {
  for (const actions of document.querySelectorAll("[data-chart-actions]")) {
    if (initialised.has(actions)) continue;
    initialised.add(actions);
    const fact = actions.closest("[data-fact]");
    const twin = fact?.querySelector("details.ek-twin");
    const table = twin?.querySelector("table");
    const status = actions.querySelector("[data-chart-status]");
    if (!twin || !table || !status) continue;
    const copy = actions.querySelector("[data-chart-copy]");
    if (!copy || !navigator.clipboard) continue;
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const rows = [...table.querySelectorAll("tr")].map((tr) =>
        [...tr.querySelectorAll("th, td")].map((cell) => (cell.textContent ?? "").trim()).join("\t"),
      );
      try {
        await navigator.clipboard.writeText(rows.join("\n"));
        status.textContent = "Table copied, with its source in the last row.";
      } catch {
        status.textContent = "The browser did not allow copying. Open the table and select it instead.";
      }
    });
  }
}
initialiseChartActions();
document.addEventListener('budget:reveal', initialiseChartActions);
