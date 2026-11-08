import {orderScore, readScores, reserveBand, reserveDirection, scoreLink, shares, SIZE_BANDS, splitScore, type GameData, type GameRound, type GameSource} from '../lib/budget-game';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text: string, action: () => void, secondary = true): HTMLButtonElement {
  const node = element('button', text, `button${secondary ? ' secondary' : ''}`);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
function sourceLine(source: GameSource): HTMLElement {
  const p = element('p', 'Source: ', 'source-line');
  const link = element('a', `${source.publisher}, ${source.title}`);
  link.href = source.url;
  p.append(link, document.createTextNode(`. ${source.table ?? ''}. ${source.date ? `Published ${new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${source.date}T00:00:00Z`))}.` : ''}`));
  return p;
}
const pounds = (thousands: number) => new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP', maximumFractionDigits: 0}).format(thousands * 1000);
const directionLabel: Record<string, string> = {draw: 'Draw on reserves', add: 'Add to reserves', neither: 'Neither'};
interface Distance {label: string; detail: string; distance: number; source: GameSource}

for (const root of document.querySelectorAll<HTMLElement>('[data-budget-game]')) {
  const data = JSON.parse(root.querySelector('[data-budget-game-data]')!.textContent!) as GameData;
  const stage = root.querySelector<HTMLElement>('[data-game-stage]')!;
  const controls = root.querySelector<HTMLElement>('[data-game-controls]')!;
  controls.hidden = false;
  let index = 0;
  let scores: (number | null)[] = [];
  let distances: Distance[] = [];
  function heading(text: string) {
    const h = element('h3', text);
    h.id = 'game-round-heading';
    h.tabIndex = -1;
    stage.append(h);
    h.focus();
  }
  function sourceNotes(round: GameRound, parent: HTMLElement) {
    for (const note of round.notes) parent.append(element('p', note));
    parent.append(sourceLine(round.source));
    for (const context of round.context ?? []) parent.append(element('p', context.text), sourceLine(context.source));
  }
  function summary(restored = false) {
    controls.hidden = true;
    stage.replaceChildren();
    heading(restored ? 'Shared game scores' : 'Your game summary');
    stage.append(element('p', restored ? 'These scores were supplied in the link and are not verified results. Guesses are not shared, so the furthest answers cannot be restored.' : 'Scores describe how close your answers were to the published figures. They do not judge a council’s choices.'));
    const list = element('ul');
    data.rounds.forEach((round, i) => list.append(element('li', `${round.title}: ${scores[i] === null ? 'skipped' : `${scores[i]} out of 100`}`)));
    stage.append(list, element('p', 'Game scoring: split rounds use 100 minus half the sum of absolute differences in pence, rounded to a whole score and bounded from 0 to 100. Funding uses the percentage of correctly ordered unequal pairs. Reserves awards 50 for the direction and 50 for the size band. Skipped rounds have no score.', 'small'));
    if (!restored) {
      stage.append(element('h4', 'Answers furthest from the published figures'));
      const furthest = [...distances].sort((a, b) => b.distance - a.distance).slice(0, 3);
      if (!furthest.length) stage.append(element('p', 'No scored answers to compare. Skipped rounds are left out.'));
      for (const item of furthest) {
        const card = element('div', '', 'game-result');
        card.append(element('strong', item.label), element('p', item.detail), sourceLine(item.source));
        stage.append(card);
      }
      stage.append(element('p', 'The comparison uses absolute pence differences for splits, the percentage of incorrectly ordered pairs involving each funding item, and 0 or 100 for each reserve answer. These are game measures on a common 0 to 100 scale.', 'small'));
    }
    const link = element('a', 'Open this score link', 'game-share');
    link.href = scoreLink(location.origin, data.slug, scores);
    link.dataset.gameShare = '';
    const status = element('p');
    status.setAttribute('role', 'status');
    const actions = element('div', '', 'game-actions');
    actions.append(button('Copy score link', async () => {
      try {await navigator.clipboard.writeText(link.href); status.textContent = 'Score link copied.';}
      catch {status.textContent = 'Copy the address from the score link below.'; link.focus();}
    }), button('Play again', start));
    stage.append(actions, link, status);
  }
  function start() {
    index = 0; scores = []; distances = [];
    controls.hidden = true;
    if (location.hash.startsWith('#scores=')) history.replaceState(null, '', `${location.pathname}${location.search}`);
    showRound();
  }
  function showRound() {
    const round = data.rounds[index];
    stage.replaceChildren();
    heading(round.title);
    stage.append(element('p', `Round ${index + 1} of ${data.rounds.length}`, 'eyebrow'), element('p', round.explanation));
    const form = element('form');
    const rows = element('ol', '', 'game-rows');
    const status = element('p', '', 'game-status');
    status.setAttribute('role', 'status');
    const guesses: HTMLInputElement[] = [];
    const order = round.items.map((_, i) => i);
    let direction: HTMLSelectElement, size: HTMLSelectElement;
    if (round.kind === 'split' || round.kind === 'bill') {
      const total = element('p', 'Allocated: 0p of 100p', 'game-status');
      total.setAttribute('aria-live', 'polite');
      const updateTotal = () => {total.textContent = `Allocated: ${guesses.reduce((sum, input) => sum + (Number(input.value) || 0), 0)}p of 100p`;};
      round.items.forEach((item, i) => {
        const row = element('li', '', 'game-row');
        const input = element('input');
        input.type = 'number'; input.min = '0'; input.max = '100'; input.step = '1'; input.value = '0'; input.required = true;
        input.id = `game-${index}-${i}`;
        const label = element('label', `${item.label} (pence)`); label.htmlFor = input.id;
        const stepper = element('div', '', 'game-stepper');
        const adjust = (change: number) => {input.value = String(Math.max(0, Math.min(100, (Number(input.value) || 0) + change))); updateTotal();};
        const minus = button('−', () => adjust(-1)); minus.setAttribute('aria-label', `Decrease ${item.label}`);
        const plus = button('+', () => adjust(1)); plus.setAttribute('aria-label', `Increase ${item.label}`);
        guesses.push(input); input.addEventListener('input', updateTotal);
        stepper.append(minus, input, plus); row.append(label, stepper); rows.append(row);
      });
      form.append(rows, total);
      stage.append(element('p', 'Scoring compares your whole-pence guesses with unrounded calculated shares. Displayed answers are rounded to two decimal places.', 'small'));
      // Negative service totals are never offered as guess inputs.
      if (round.kind === 'split' && round.notes.length) {
        const income = element('div');
        income.append(element('h4', 'Net income headings, outside the guess'));
        sourceNotes(round, income); form.append(income);
      }
    } else if (round.kind === 'funding') {
      const redraw = (focusItem?: number, action?: 'up' | 'down') => {
        rows.replaceChildren();
        order.forEach((itemIndex, position) => {
          const item = round.items[itemIndex];
          const row = element('li', '', 'game-row');
          row.append(element('strong', `${position + 1}. ${item.label}`));
          const move = (change: number) => {
            const target = position + change;
            if (target < 0 || target >= order.length) return;
            [order[position], order[target]] = [order[target], order[position]];
            redraw(itemIndex, change < 0 ? 'up' : 'down');
            status.textContent = `${item.label} moved to position ${target + 1}.`;
          };
          const actions = element('div', '', 'game-actions');
          for (const [name, change] of [['up', -1], ['down', 1]] as const) {
            const control = button(`Move ${name}`, () => move(change));
            control.setAttribute('aria-label', `Move ${name}: ${item.label}`);
            control.setAttribute('aria-disabled', String(position + change < 0 || position + change >= order.length));
            actions.append(control);
            if (focusItem === itemIndex && action === name) queueMicrotask(() => control.focus());
          }
          row.append(actions); rows.append(row);
        });
      };
      redraw(); form.append(rows);
    } else {
      const group = element('fieldset'); group.append(element('legend', 'Your reserve answers'));
      direction = element('select'); direction.id = 'game-direction'; direction.required = true;
      const dLabel = element('label', 'Direction'); dLabel.htmlFor = direction.id;
      for (const [value, label] of [['', 'Choose a direction'], ...Object.entries(directionLabel)]) {const option = element('option', label); option.value = value; direction.append(option);}
      size = element('select'); size.id = 'game-size'; size.required = true;
      const sLabel = element('label', 'Size of the change'); sLabel.htmlFor = size.id;
      ['', ...SIZE_BANDS].forEach((label, i) => {const option = element('option', label || 'Choose a size band'); option.value = i === 0 ? '' : String(i - 1); size.append(option);});
      group.append(dLabel, direction, sLabel, size); form.append(group);
    }
    const actions = element('div', '', 'game-actions');
    const submit = element('button', 'Reveal answer', 'button'); submit.type = 'submit';
    actions.append(submit, button('Skip and reveal', () => reveal(true)));
    form.append(status, actions); stage.append(form);
    form.addEventListener('submit', event => {event.preventDefault(); reveal(false);});

    function reveal(skipped: boolean) {
      const answer = element('div', '', 'game-result');
      const answerList = element('ul');
      const details: Distance[] = [];
      let score: number | null = null;
      try {
        if (round.kind === 'split' || round.kind === 'bill') {
          const actual = shares(round.items, round.base!);
          if (!skipped) score = splitScore(guesses.map(input => Number(input.value)), actual);
          round.items.forEach((item, i) => {
            const detail = `${skipped ? '' : `Your guess: ${guesses[i].value}p. `}Calculated share: ${actual[i].toFixed(2)}p per 100p. ${item.detail}.`;
            answerList.append(element('li', `${item.label}: ${detail}`));
            if (!skipped) details.push({label: `${round.title}: ${item.label}`, detail, distance: Math.abs(Number(guesses[i].value) - actual[i]), source: round.source});
          });
          if (round.kind === 'split') answer.append(element('p', `Calculated positive-service base: ${pounds(round.base!)}. This is the sum of the positive service totals only.`));
        } else if (round.kind === 'funding') {
          if (!skipped) score = orderScore(order, round.items);
          const sorted = [...order].sort((a, b) => Math.abs(round.items[b].value) - Math.abs(round.items[a].value));
          sorted.forEach((itemIndex, i) => {
            const item = round.items[itemIndex];
            const detail = `${item.detail}${skipped ? '' : ` Your position: ${order.indexOf(itemIndex) + 1}.`} Answer position: ${i + 1}; equal magnitudes are interchangeable.`;
            answerList.append(element('li', `${item.label}: ${detail}`));
            const unequal = order.filter(other => Math.abs(round.items[other].value) !== Math.abs(item.value));
            const wrong = unequal.filter(other => (order.indexOf(other) < order.indexOf(itemIndex)) !== (Math.abs(round.items[other].value) > Math.abs(item.value))).length;
            if (!skipped) details.push({label: item.label, detail, distance: unequal.length ? wrong / unequal.length * 100 : 0, source: round.source});
          });
        } else {
          const change = round.items[1].value - round.items[0].value;
          const d = reserveDirection(change), b = reserveBand(change);
          if (!skipped && (!direction.value || !size.value)) throw new Error('Choose a direction and a size band.');
          if (!skipped) score = (direction.value === d ? 50 : 0) + (Number(size.value) === b ? 50 : 0);
          for (const item of round.items) answerList.append(element('li', `${item.label}: ${item.detail}`));
          answerList.append(element('li', `Calculated change, end minus start: ${pounds(change)}. ${directionLabel[d]}; ${SIZE_BANDS[b]}.`));
          if (!skipped) {
            details.push({label: `${round.title}: direction`, detail: `Your answer: ${directionLabel[direction.value]}. Published balances imply: ${directionLabel[d]}. Change: ${pounds(change)}, end minus start of the sum of RA Part 2 lines 1015 and 1016.`, distance: direction.value === d ? 0 : 100, source: round.source});
            details.push({label: `${round.title}: size`, detail: `Your answer: ${SIZE_BANDS[Number(size.value)]}. Calculated change: ${pounds(change)}, end minus start of the sum of RA Part 2 lines 1015 and 1016. Answer band: ${SIZE_BANDS[b]}.`, distance: Number(size.value) === b ? 0 : 100, source: round.source});
          }
        }
      } catch (error) {status.textContent = (error as Error).message; return;}
      scores.push(score); distances.push(...details);
      stage.replaceChildren();
      heading(`${round.title}: published answer`);
      stage.append(element('p', skipped ? 'Round skipped. No score recorded.' : `Your score: ${score} out of 100.`, 'game-status'), element('p', round.explanation));
      answer.append(answerList); sourceNotes(round, answer); stage.append(answer);
      stage.append(button(index === data.rounds.length - 1 ? 'Show summary' : 'Next round', () => {index++; index === data.rounds.length ? summary() : showRound();}, false));
    }
  }
  root.querySelector('[data-game-start]')!.addEventListener('click', start);
  const restored = readScores(location.hash, data.rounds.length);
  if (restored) {scores = restored; summary(true);}
}
