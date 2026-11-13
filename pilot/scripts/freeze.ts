import { calculateFreeze, initialFreezeInputs, money, freezeSummary, parsePence, type FreezeInputs } from '../../src/lib/budget-freeze';
import type { FreezePilot } from '../../src/lib/budget-freeze-data';

const root = document.querySelector<HTMLElement>('[data-freeze-pilot]');
if (root) {
  const pilot = JSON.parse(root.dataset.pilot!) as FreezePilot;
  const get = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const own = get<HTMLInputElement>('[data-own]');
  const ownRange = get<HTMLInputElement>('[data-own-range]');
  const services = [...root.querySelectorAll<HTMLInputElement>('[data-service]')];
  const result = get<HTMLElement>('[data-result-status]');
  const details = get<HTMLElement>('[data-result-details]');
  const error = get<HTMLElement>('[data-error]');
  const copy = get<HTMLButtonElement>('[data-copy]');
  const summary = get<HTMLTextAreaElement>('[data-summary]');
  const copyStatus = get<HTMLElement>('[data-copy-status]');
  const ruleResult = get<HTMLElement>('[data-rule-result]');
  const mobileResult = get<HTMLElement>('[data-mobile-result]');
  let currentSummary = '';
  const read = (): FreezeInputs => ({
    ownPounds:own.value,
    servicePounds:Object.fromEntries(services.map(input=>[input.dataset.service!,input.value])),
  });
  function update() {
    currentSummary = '';
    summary.hidden = true;
    summary.value = '';
    copyStatus.textContent = '';
    for (const delta of root!.querySelectorAll<HTMLElement>('[data-service-delta]')) delta.textContent = '';
    try {
      const inputs = read();
      const calculated = calculateFreeze(pilot, inputs);
      get<HTMLElement>('[data-remaining]').textContent = money(calculated.remaining);
      get<HTMLElement>('[data-mobile-amount]').textContent = money(calculated.remaining);
      get<HTMLElement>('[data-mobile-state]').textContent = calculated.status === 'balanced' ? 'Arithmetic balances' : calculated.status === 'shortfall' ? 'Shortfall under assumptions' : 'Surplus under assumptions';
      mobileResult.hidden=false;
      get<HTMLElement>('[data-state]').textContent = calculated.status === 'balanced'
        ? 'The arithmetic balances under these assumptions. This does not establish a deliverable or legally compliant budget.'
        : calculated.status === 'shortfall'
          ? 'Additional financing or lower net spending needed under these assumptions.'
          : 'Financing exceeds spending under these assumptions.';
      get<HTMLElement>('[data-spending]').textContent = money(calculated.spendingChange);
      get<HTMLElement>('[data-financing]').textContent = money(calculated.financingChange);
      ruleResult.textContent = calculated.referendum
        ? 'This choice reaches the mapped referendum trigger for 2026/27.'
        : 'This choice is below the mapped referendum trigger for 2026/27. This does not establish legal feasibility.';
      for (const change of calculated.changes) {
        const row = root!.querySelector<HTMLElement>(`[data-service-delta="${change.id}"]`);
        if (row) row.textContent = `User requested scenario: change from published spending ${money(change.deltaUnits)}.`;
      }
      currentSummary = freezeSummary(pilot,inputs,pilot.sources.map(s=>`${s.title}: ${s.url}`));
      result.hidden = false; details.hidden = false; error.hidden = true;
      copy.hidden = false; copy.disabled = false;
    } catch (cause) {
      result.hidden = true; details.hidden = true; copy.disabled = true;
      mobileResult.hidden=true;
      ruleResult.textContent = '';
      error.textContent = `Scenario not calculated. ${cause instanceof Error ? cause.message : 'Check your inputs.'}`;
      error.hidden = false;
    }
  }
  function wire(number: HTMLInputElement, range: HTMLInputElement) {
    range.addEventListener('input',()=>{number.value=range.value;update();});
    number.addEventListener('input',()=>{
      try {
        const value=parsePence(number.value);
        if (value <= parsePence(number.max)) range.value=number.value;
      } catch { /* Keep invalid text visible and withdraw the result. */ }
      update();
    });
  }
  wire(own,ownRange);
  for (const service of services) wire(service,get<HTMLInputElement>(`[data-service-range="${service.dataset.service}"]`));
  function reset(frozen: boolean) {
    const values=initialFreezeInputs(pilot,frozen);
    own.value=values.ownPounds;ownRange.value=own.value;
    for (const service of services) {
      service.value=values.servicePounds[service.dataset.service!];
      get<HTMLInputElement>(`[data-service-range="${service.dataset.service}"]`).value=service.value;
    }
    update();
  }
  get<HTMLButtonElement>('[data-freeze-reset]').addEventListener('click',()=>reset(true));
  get<HTMLButtonElement>('[data-published-reset]').addEventListener('click',()=>reset(false));
  copy.addEventListener('click', async()=>{
    if (!currentSummary) return;
    const copied=currentSummary;
    try {
      await navigator.clipboard.writeText(copied);
      if (currentSummary===copied) copyStatus.textContent='Scenario summary copied with its assumptions and sources.';
    } catch {
      if (currentSummary!==copied) return;
      summary.value=copied;summary.hidden=false;summary.focus();summary.select();
      copyStatus.textContent='Copy the selected summary below.';
    }
  });
  get<HTMLButtonElement>('[data-theme-toggle]').addEventListener('click',()=>{
    const html=document.documentElement;
    const dark=html.dataset.theme==='dark' || (!html.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    html.dataset.theme=dark ? 'light' : 'dark';
  });
  get<HTMLElement>('[data-controls]').hidden=false;
  get<HTMLButtonElement>('[data-theme-toggle]').hidden=false;
  function revealAnchor() {
    if(location.hash==='#reconciliation') get<HTMLDetailsElement>('#reconciliation').open=true;
  }
  addEventListener('hashchange',revealAnchor);
  revealAnchor();
  update();
}
