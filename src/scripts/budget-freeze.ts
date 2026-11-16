import { FREEZE_YEAR_TEXT, calculateFreeze, freezeSummary, initialFreezeInputs, inputPounds, money, parsePence, type FreezeInputs } from '../lib/budget-freeze';
import type { FreezePilot } from '../lib/budget-freeze-data';
import { formatMoney } from '../lib/money';

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

/**
 * W3 board amounts (plan 11.8): £ million to one decimal through the site's one
 * money formatter, so a gap of £22,600,898.51 reads £22.6m and the exact pounds
 * sit one click away. An exact zero is "£0". A difference that is not zero but
 * under a pound keeps its pennies, so it can never read as balanced.
 */
export function boardMoney(units: bigint): string {
  if (units === 0n) return '£0';
  const absolute = units < 0n ? -units : units;
  if (absolute < 100n) return 'less than £0.01';
  const pounds = Number(units) / 10000;
  return formatMoney(pounds, {style: absolute < 10000n ? 'exact' : 'compact'});
}
/** A service card's change chip: signed, compact, and plain words at an exact zero. */
export function changeText(units: bigint): string {
  return units === 0n ? 'No change' : `${units > 0n ? '+' : ''}${boardMoney(units)} change`;
}
export function stateWord(status: 'balanced' | 'shortfall' | 'surplus'): string {
  return status === 'balanced' ? 'Balanced' : status === 'shortfall' ? 'Shortfall' : 'Surplus';
}
export function stateSentence(status: 'balanced' | 'shortfall' | 'surplus'): string {
  return status === 'balanced' ? 'The arithmetic balances under these assumptions.' : status === 'shortfall' ? 'Shortfall under these assumptions.' : 'Surplus under these assumptions.';
}
/**
 * The gap bar's full width: the larger of the freeze starting gap and the gap
 * the 5% service preset makes (5% of the editable published services). Both
 * are amounts the page already offers, so the bar has no invented scale.
 */
export function gapScale(pilot: FreezePilot): bigint {
  const start = calculateFreeze(pilot, initialFreezeInputs(pilot)).remaining;
  const editable = pilot.services.filter(s => s.editable).reduce((sum, s) => sum + BigInt(s.pence), 0n);
  const preset = editable * 5n;
  const absolute = start < 0n ? -start : start;
  return absolute > preset ? absolute : preset;
}
/** Share of half the bar, 0 to 100, measured from the target line at the centre. */
export function gapShare(remaining: bigint, scale: bigint): number {
  if (remaining === 0n || scale <= 0n) return 0;
  const absolute = remaining < 0n ? -remaining : remaining;
  return absolute >= scale ? 100 : Number(absolute * 1000n / scale) / 10;
}
/** The copied and printed scenario: the exact summary with its label, model version, assumptions and sources. */
export function scenarioText(pilot: FreezePilot, inputs: FreezeInputs, sources: string[]): string {
  return freezeSummary(pilot, inputs, sources);
}

const root = typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('[data-freeze-pilot]');
if (root) {
  const pilot = JSON.parse(root.dataset.pilot!) as FreezePilot;
  const sources = JSON.parse(root.dataset.sources ?? '[]') as string[];
  const scale = gapScale(pilot);
  const get = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const all = <T extends HTMLElement>(selector: string) => [...root.querySelectorAll<T>(selector)];
  const own = get<HTMLInputElement>('[data-own]');
  const ownRange = get<HTMLInputElement>('[data-own-range]');
  const services = all<HTMLInputElement>('[data-service]');
  const result = get<HTMLElement>('[data-result-status]');
  const details = get<HTMLElement>('[data-result-details]');
  const exact = get<HTMLElement>('[data-result-exact]');
  const error = get<HTMLElement>('[data-error]');
  const ruleResult = get<HTMLElement>('[data-rule-result]');
  const mobileResult = get<HTMLElement>('[data-mobile-result]');
  const scenario = get<HTMLElement>('[data-scenario-text]');
  const copy = get<HTMLButtonElement>('[data-copy]');
  const copyStatus = get<HTMLElement>('[data-copy-status]');
  let valid = true;
  let resultVisible = true;
  const resultObserver = new IntersectionObserver(([entry]) => {
    resultVisible = entry.isIntersecting;
    mobileResult.hidden = resultVisible || !valid;
  });
  resultObserver.observe(root.querySelector('[data-scenario-board]') ?? result);
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
  const setText = (selector: string, text: string) => { for (const node of all<HTMLElement>(selector)) node.textContent = text; };
  function syncService(service: HTMLInputElement) {
    const range = get<HTMLInputElement>(`[data-service-range="${service.dataset.service}"]`);
    const published = pilot.services.find(s => s.id === service.dataset.service)!;
    try {
      const pence = parsePence(service.value);
      range.value = range.hasAttribute('data-percentage') ? String(Number(pence * 200n / BigInt(published.pence)) / 2) : service.value;
      range.setAttribute('aria-valuetext', money(pence * 100n));
      const label = root!.querySelector<HTMLElement>(`[data-service-value="${service.dataset.service}"]`);
      if (label) label.textContent = boardMoney(pence * 100n);
    } catch { range.setAttribute('aria-valuetext', 'Invalid amount; check the exact pounds entry'); }
  }
  function drawGap(remaining: bigint) {
    const share = gapShare(remaining, scale);
    for (const bar of all<HTMLElement>('[data-gap-bar]')) {
      bar.dataset.side = remaining === 0n ? 'none' : remaining > 0n ? 'shortfall' : 'surplus';
      bar.style.setProperty('--gap', `${share / 2}%`);
    }
  }
  function update() {
    for (const delta of all<HTMLElement>('[data-service-delta]')) delta.textContent = '';
    try {
      for (const service of services) syncService(service);
      const inputs = read();
      const calculated = calculateFreeze(pilot, inputs);
      valid = true;
      ownRange.setAttribute('aria-valuetext', money(parsePence(own.value) * 100n));
      const ownValue = root!.querySelector<HTMLElement>('[data-own-value]');
      if (ownValue) ownValue.textContent = money(parsePence(own.value) * 100n);
      root!.dataset.status = calculated.status;
      setText('[data-remaining]', boardMoney(calculated.remaining));
      setText('[data-mobile-amount]', boardMoney(calculated.remaining));
      setText('[data-state-word]', stateWord(calculated.status));
      setText('[data-mobile-state]', stateWord(calculated.status));
      get<HTMLElement>('[data-state]').textContent = stateSentence(calculated.status);
      get<HTMLElement>('[data-stamp]').hidden = calculated.status !== 'balanced';
      drawGap(calculated.remaining);
      mobileResult.hidden = resultVisible;
      setText('[data-spending]', boardMoney(calculated.spendingChange));
      setText('[data-financing]', boardMoney(calculated.financingChange));
      setText('[data-remaining-exact]', money(calculated.remaining));
      setText('[data-spending-exact]', money(calculated.spendingChange));
      setText('[data-financing-exact]', money(calculated.financingChange));
      ruleResult.textContent = calculated.referendum
        ? `A referendum would be required for this charge under the ${FREEZE_YEAR_TEXT} rule.`
        : `This charge is below the rise that would need a referendum in ${FREEZE_YEAR_TEXT}. This does not establish legal feasibility.`;
      for (const change of calculated.changes) {
        const row = root!.querySelector<HTMLElement>(`[data-service-delta="${change.id}"]`);
        if (row) row.textContent = changeText(change.deltaUnits);
      }
      scenario.textContent = scenarioText(pilot, inputs, sources);
      copy.disabled = false;
      get<HTMLElement>('[data-state]').hidden = false;
      result.hidden = false; details.hidden = false; exact.hidden = false; error.hidden = true;
      announce(`User requested scenario. ${boardMoney(calculated.remaining)}. ${get<HTMLElement>('[data-state]').textContent} ${ruleResult.textContent}`);
    } catch (cause) {
      valid = false;
      delete root!.dataset.status;
      get<HTMLElement>('[data-state]').hidden = true;
      result.hidden = true; details.hidden = true; exact.hidden = true;
      mobileResult.hidden=true;
      ruleResult.textContent = '';
      scenario.textContent = '';
      copy.disabled = true;
      error.textContent = `Scenario not calculated. ${cause instanceof Error ? cause.message : 'Check your inputs.'}`;
      error.hidden = false;
      announce(error.textContent!);
    }
    copyStatus.textContent = '';
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
  for (const button of all<HTMLButtonElement>('[data-service-step], [data-service-percent]')) {
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
  // The clipboard only: no download, no link, no storage and no request.
  copy.addEventListener('click', async () => {
    const text = scenario.textContent ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = 'Scenario copied, with its assumptions, model version and sources.';
    } catch {
      copyStatus.textContent = 'This browser did not allow copying. Print the page to keep the scenario.';
    }
  });
  get<HTMLButtonElement>('[data-theme-toggle]').addEventListener('click',()=>{
    const html=document.documentElement;
    const dark=html.dataset.theme==='dark' || (!html.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    html.dataset.theme=dark ? 'light' : 'dark';
  });
  get<HTMLElement>('[data-controls]').hidden=false;
  get<HTMLButtonElement>('[data-theme-toggle]').hidden=false;
  copy.hidden=false;
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
