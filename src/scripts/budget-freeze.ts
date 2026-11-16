import { FREEZE_YEAR_TEXT, calculateFreeze, initialFreezeInputs, inputPounds, money, parsePence, type FreezeInputs } from '../lib/budget-freeze';
import type { FreezePilot } from '../lib/budget-freeze-data';

import rules from '../../data/pilots/budget-freeze-principles.json';
import type { FreezeBaseline } from '../lib/budget-freeze';

/** First selectable penny satisfying the held rule, never an estimated limit. */
export function referendumTriggerPence(pilot: Pick<FreezeBaseline, 'rule' | 'priorOwnPence'>): bigint | null {
  const rule = rules.principles[pilot.rule];
  if (!rule || rule.percentageComparison !== 'greater-than-or-equal') return null;
  const prior = BigInt(pilot.priorOwnPence);
  if (prior <= 0n) return null;
  let rise = (prior * BigInt(rule.percentageBasisPoints) + 9999n) / 10000n;
  if (rule.join === 'AND') {
    if (rule.poundComparison !== 'greater-than' || rule.poundPence === null) return null;
    const strictRise = BigInt(rule.poundPence) + 1n;
    if (strictRise > rise) rise = strictRise;
  } else if (rule.join !== 'single') return null;
  return prior + rise;
}

/** Half-percentage ticks use integer arithmetic, rounded once to the penny. */
export function serviceAtTick(publishedPence: string, tick: number): string {
  if (!Number.isInteger(tick) || tick < 0 || tick > 400) throw new Error('Choose a service percentage between zero and twice the published amount.');
  return inputPounds((BigInt(publishedPence) * BigInt(tick) + 100n) / 200n);
}

export function stepService(publishedPence: string, selectedPounds: string, direction: -1 | 1): string {
  const published = BigInt(publishedPence);
  const step = (published + 100n) / 200n;
  const selected = parsePence(selectedPounds) + step * BigInt(direction);
  return inputPounds(selected < 0n ? 0n : selected > published * 2n ? published * 2n : selected);
}

const root = typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('[data-freeze-pilot]');
if (root) {
  const pilot = JSON.parse(root.dataset.pilot!) as FreezePilot;
  const get = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const own = get<HTMLInputElement>('[data-own]');
  const ownRange = get<HTMLInputElement>('[data-own-range]');
  const services = [...root.querySelectorAll<HTMLInputElement>('[data-service]')];
  const result = get<HTMLElement>('[data-result-status]');
  const details = get<HTMLElement>('[data-result-details]');
  const error = get<HTMLElement>('[data-error]');
  const ruleResult = get<HTMLElement>('[data-rule-result]');
  const mobileResult = get<HTMLElement>('[data-mobile-result]');
  let resultVisible = true;
  const resultObserver = new IntersectionObserver(([entry]) => {
    resultVisible = entry.isIntersecting;
    mobileResult.hidden = resultVisible || result.hidden;
  });
  resultObserver.observe(root.querySelector('.scenario-result') ?? result);
  const read = (): FreezeInputs => ({
    ownPounds:own.value,
    servicePounds:Object.fromEntries(services.map(input=>[input.dataset.service!,input.value])),
  });
  let announcementTimer: ReturnType<typeof setTimeout>;
  function announce(text: string) {
    const region = root!.querySelector<HTMLElement>('[data-announcement]');
    if (!region) return;
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => { region.textContent = text; }, 250);
  }
  function syncService(service: HTMLInputElement) {
    const range = get<HTMLInputElement>(`[data-service-range="${service.dataset.service}"]`);
    const published = pilot.services.find(s => s.id === service.dataset.service)!;
    try {
      const pence = parsePence(service.value);
      range.value = range.hasAttribute('data-percentage') ? String(Number(pence * 200n / BigInt(published.pence)) / 2) : service.value;
      range.setAttribute('aria-valuetext', money(pence * 100n));
      const label = root!.querySelector<HTMLElement>(`[data-service-value="${service.dataset.service}"]`);
      if (label) label.textContent = money(pence * 100n);
    } catch { range.setAttribute('aria-valuetext', 'Invalid amount; check the exact pounds entry'); }
  }
  function update() {
    for (const delta of root!.querySelectorAll<HTMLElement>('[data-service-delta]')) delta.textContent = '';
    try {
      for (const service of services) syncService(service);
      const inputs = read();
      const calculated = calculateFreeze(pilot, inputs);
      ownRange.setAttribute('aria-valuetext', money(parsePence(own.value) * 100n));
      const ownValue = root!.querySelector<HTMLElement>('[data-own-value]');
      if (ownValue) ownValue.textContent = money(parsePence(own.value) * 100n);
      get<HTMLElement>('[data-remaining]').textContent = money(calculated.remaining);
      get<HTMLElement>('[data-mobile-amount]').textContent = money(calculated.remaining);
      get<HTMLElement>('[data-mobile-state]').textContent = calculated.status === 'balanced' ? 'Arithmetic balances' : calculated.status === 'shortfall' ? 'Shortfall under assumptions' : 'Surplus under assumptions';
      mobileResult.hidden=resultVisible;
      get<HTMLElement>('[data-state]').textContent = calculated.status === 'balanced'
        ? 'The arithmetic balances under these assumptions.'
        : calculated.status === 'shortfall'
          ? 'Shortfall under these assumptions.'
          : 'Surplus under these assumptions.';
      get<HTMLElement>('[data-spending]').textContent = money(calculated.spendingChange);
      get<HTMLElement>('[data-financing]').textContent = money(calculated.financingChange);
      ruleResult.textContent = calculated.referendum
        ? `A referendum would be required for this choice under the mapped ${FREEZE_YEAR_TEXT} principle.`
        : `This choice is below the mapped referendum trigger for ${FREEZE_YEAR_TEXT}. This does not establish legal feasibility.`;
      for (const change of calculated.changes) {
        const row = root!.querySelector<HTMLElement>(`[data-service-delta="${change.id}"]`);
        if (row) row.textContent = `${money(change.deltaUnits)} change`;
      }
      get<HTMLElement>('[data-state]').hidden = false;
      result.hidden = false; details.hidden = false; error.hidden = true;
      announce(`User requested scenario. ${money(calculated.remaining)}. ${get<HTMLElement>('[data-state]').textContent} ${ruleResult.textContent}`);
    } catch (cause) {
      get<HTMLElement>('[data-state]').hidden = true;
      result.hidden = true; details.hidden = true;
      mobileResult.hidden=true;
      ruleResult.textContent = '';
      error.textContent = `Scenario not calculated. ${cause instanceof Error ? cause.message : 'Check your inputs.'}`;
      error.hidden = false;
      announce(error.textContent!);
    }
  }
  function wire(number: HTMLInputElement, range: HTMLInputElement) {
    range.addEventListener('input',()=>{
      number.value = range.hasAttribute('data-percentage')
        ? serviceAtTick(pilot.services.find(s => s.id === number.dataset.service)!.pence, Math.round(Number(range.value) * 2))
        : range.value;
      update();
    });
    number.addEventListener('input',()=>{
      try {
        const value=parsePence(number.value);
        if (value <= parsePence(number.max) && !range.hasAttribute('data-percentage')) range.value=number.value;
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
      syncService(service);
    }
    update();
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-service-step], [data-service-percent]')) {
    button.addEventListener('click', () => {
      const id = button.dataset.serviceStep ?? button.dataset.servicePercent!;
      const input = services.find(s => s.dataset.service === id)!;
      const published = pilot.services.find(s => s.id === id)!;
      try {
        input.value = button.dataset.percent !== undefined
          ? serviceAtTick(published.pence, Number(button.dataset.percent) * 2)
          : stepService(published.pence, input.value, Number(button.dataset.step) as -1 | 1);
      } catch { /* Keep invalid exact entries visible until corrected or reset. */ }
      update();
    });
  }
  root.querySelector<HTMLButtonElement>('[data-trigger-preset]')?.addEventListener('click', () => {
    const trigger = referendumTriggerPence(pilot);
    if (trigger === null) return;
    reset(false);
    own.value = inputPounds(trigger); ownRange.value = own.value;
    update();
  });
  root.querySelector<HTMLButtonElement>('[data-service-preset]')?.addEventListener('click', () => {
    reset(true);
    for (const service of services) service.value = serviceAtTick(pilot.services.find(s => s.id === service.dataset.service)!.pence, 190);
    update();
  });
  get<HTMLButtonElement>('[data-freeze-reset]').addEventListener('click',()=>reset(true));
  get<HTMLButtonElement>('[data-published-reset]').addEventListener('click',()=>reset(false));
  get<HTMLButtonElement>('[data-theme-toggle]').addEventListener('click',()=>{
    const html=document.documentElement;
    const dark=html.dataset.theme==='dark' || (!html.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    html.dataset.theme=dark ? 'light' : 'dark';
  });
  get<HTMLElement>('[data-controls]').hidden=false;
  get<HTMLButtonElement>('[data-theme-toggle]').hidden=false;
  function revealAnchor() {
    if(location.hash==='#reconciliation') get<HTMLDetailsElement>('#reconciliation').open=true;
    if(location.hash==='#preset-note') {
      const note = root!.querySelector<HTMLElement>('#preset-note');
      for (let parent = note?.parentElement; parent && parent !== root; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement) parent.open = true;
      }
      note?.scrollIntoView();
    }
  }
  addEventListener('hashchange',revealAnchor);
  revealAnchor();
  update();
}
