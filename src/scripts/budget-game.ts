import {formatMoney} from '../lib/money';
import {splitControls} from '../lib/budget-game-controls';
import {createScenario} from '../lib/budget-game-scenario-ui';
import type {ScenarioData} from '../lib/budget-game-scenario-data';
import {squaresFor, orderScore, readScores, reserveBand, reserveDirection, scoreLink, shares, SIZE_BANDS, splitScore, type GameData, type GameRound, type GameSource} from '../lib/budget-game';

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
const pounds = (thousands: number) => formatMoney(thousands, {unit: 'thousands'});
const directionLabel: Record<string, string> = {draw: 'Draw on reserves', add: 'Add to reserves', neither: 'Neither'};
interface Distance {label: string; detail: string; distance: number; source: GameSource; name: string; call: string}
const NS = 'http://www.w3.org/2000/svg';
function svg(tag: string, attrs: Record<string, string | number>, text = ''): SVGElement {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  node.textContent = text;
  return node;
}
/** Splits a line into lines of at most n characters at spaces, for SVG and canvas text. */
function wrap(text: string, n: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > n) {lines.push(line); line = word;} else line = line ? `${line} ${word}` : word;
  }
  return line ? [...lines, line] : lines;
}
const pence = (gap: number) => Math.abs(gap) < 0.05 ? '0.0p' : `${Math.abs(gap).toFixed(1)}p ${gap > 0 ? 'over' : 'under'}`;
// A game measure on the share of the points available in the rounds played. Not a judgement of a council.
const GRADES: [number, string, string][] = [[90, 'A', 'Very close'], [75, 'B', 'Close'], [60, 'C', 'Fair'], [40, 'D', 'Some way off'], [0, 'E', 'Far off']];
function table(caption: string, head: string[], rows: string[][]): HTMLElement {
  const box = element('details', '', 'game-twin');
  box.append(element('summary', 'The figures as a table'));
  const wrapBox = element('div', '', 'table-wrap');
  const t = element('table', '', 'data');
  t.append(element('caption', caption));
  const h = element('tr');
  head.forEach((cell, i) => {const th = element('th', cell, i ? 'num' : ''); th.scope = 'col'; h.append(th);});
  const body = element('tbody');
  for (const row of rows) {
    const tr = element('tr');
    row.forEach((cell, i) => {if (i) tr.append(element('td', cell, 'num')); else {const th = element('th', cell); th.scope = 'row'; tr.append(th);}});
    body.append(tr);
  }
  t.append(element('thead'), body);
  t.tHead!.append(h);
  wrapBox.append(t); box.append(wrapBox);
  return box;
}
/** Your guess and the calculated share for each part, on one pence scale, with its source inside the drawing. */
function dotPlot(items: {label: string}[], guesses: number[], actual: number[], source: GameSource, room: number): SVGElement {
  // Drawn at about 1.3 units a pixel, so its 20 unit text stays readable at 375 px.
  const W = Math.round(Math.min(600, Math.max(440, room * 1.3)));
  const top = Math.max(10, Math.ceil(Math.max(...guesses, ...actual) / 10) * 10);
  const left = 8, right = W - 40, x = (v: number) => left + (right - left) * v / top;
  const plot = svg('svg', {width: W, class: 'ek-chart game-dots', role: 'img'});
  let y = 30;
  plot.append(svg('circle', {cx: 14, cy: y-7, r: 8, class: 'game-dot-you'}), svg('text', {x: 30, y}, 'Your guess'),
    svg('circle', {cx: 174, cy: y-7, r: 8, class: 'game-dot-pub'}), svg('text', {x: 190, y}, 'Calculated share'));
  y += 22;
  items.forEach((item, i) => {
    for (const line of wrap(item.label, Math.floor(W / 11))) plot.append(svg('text', {x: left, y: y += 24}, line));
    y += 24;
    const a = x(guesses[i]), b = x(actual[i]);
    plot.append(svg('line', {x1: left, x2: right, y1: y, y2: y, class: 'game-dot-track'}), svg('line', {x1: a, x2: b, y1: y, y2: y, class: 'game-dot-gap'}),
      svg('circle', {cx: b, cy: y, r: 9, class: 'game-dot-pub'}), svg('circle', {cx: a, cy: y, r: 8, class: 'game-dot-you'}));
    y += 6;
  });
  plot.append(svg('text', {x: left, y: y += 30, 'text-anchor': 'start'}, '0p'), svg('text', {x: right, y, 'text-anchor': 'middle'}, `${top}p`));
  for (const line of wrap(`Source: ${source.publisher}, ${source.title}, ${source.table ?? ''}. Your guesses are your own, not published figures.`, Math.floor(W / 10))) plot.append(svg('text', {x: left, y: y += 26, class: 'game-dot-source'}, line));
  plot.setAttribute('viewBox', `0 0 ${W} ${y + 12}`);
  plot.setAttribute('height', String(y + 12));
  plot.setAttribute('aria-label', `Your guess and the calculated share, in pence per 100p: ${items.map((item, i) => `${item.label}, ${guesses[i]}p and ${actual[i].toFixed(2)}p`).join('; ')}.`);
  return plot;
}

for (const root of document.querySelectorAll<HTMLElement>('[data-budget-game]')) {
  const data = JSON.parse(root.querySelector('[data-budget-game-data]')!.textContent!) as GameData;
  const stage = root.querySelector<HTMLElement>('[data-game-stage]')!;
  let index = 0;
  let playing = false;
  let scores: (number | null)[] = [];
  let distances: Distance[] = [];
  let restoredSummary = false;
  const scenarioPayload = JSON.parse(root.querySelector('[data-budget-scenario-data]')!.textContent!) as ScenarioData;
  const scenario = createScenario(root, stage, scenarioPayload, () => summary(restoredSummary), start);
  const scenarioEntry = root.querySelector<HTMLButtonElement>('[data-scenario-entry]')!;
  scenarioEntry.addEventListener('click', () => scenario.start());
  function rail() {
    const list=root.querySelector<HTMLOListElement>('[data-game-rail]')!;list.hidden=false;
    [...list.children].forEach((node,i)=>{
      node.removeAttribute('aria-current');node.classList.toggle('done',scores[i] !== undefined);
      if(i === index && scores.length < data.rounds.length){node.setAttribute('aria-current','step');list.scrollLeft+=node.getBoundingClientRect().left-list.getBoundingClientRect().left-16;}
      node.querySelector('[data-step-status]')!.textContent=scores[i]===null?'skipped':'';
    });
  }
  // W4: one line per screen that says what to do next.
  function move(text: string) {
    const p = element('p', '', 'game-move');
    p.append(element('strong', 'Your move'), text);
    return p;
  }
  function heading(text: string) {
    const h = element('h3', text);
    h.id = 'game-round-heading';
    h.tabIndex = -1;
    stage.append(h);
    h.focus({preventScroll:true});
    queueMicrotask(()=>root.querySelector('[data-game-play]')?.scrollIntoView({block:'start'}));
  }
  function sourceNotes(round: GameRound, parent: HTMLElement) {
    for (const note of round.notes) parent.append(element('p', note));
    parent.append(sourceLine(round.source));
    for (const context of round.context ?? []) parent.append(element('p', context.text), sourceLine(context.source));
  }
  function summary(restored = false) {
    restoredSummary = restored;
    delete stage.dataset.scenarioStage;
    rail();
    playing = true;
    stage.replaceChildren();
    heading(restored ? 'Shared game scores' : 'Your game summary');
    stage.append(element('p', restored ? 'These scores were supplied in the link and are not verified results. Guesses are not shared, so the furthest answers cannot be restored.' : 'Scores describe how close your answers were to the published figures. They do not judge a council’s choices.'));
    const total=scores.reduce<number>((sum,score)=>sum+(score??0),0);
    const maximum=scores.filter(score=>score!==null).length*100;
    const name = root.dataset.councilName!;
    // W4 part two: the end card. Grade, the three closest and three furthest calls, a neutral stamp.
    const grade = maximum ? GRADES.find(([floor]) => total / maximum * 100 >= floor)! : null;
    const played = `${maximum / 100} of ${scores.length} rounds played`;
    const sorted = [...distances].sort((x, y) => x.distance - y.distance);
    // With fewer than six scored answers the two lists may share an answer, rather than leave one empty.
    const closest = sorted.slice(0, 3), furthest = (sorted.length < 6 ? [...sorted] : sorted.slice(3)).reverse().slice(0, 3);
    const stamp = restored ? 'Shared score, not verified' : 'Scored against published figures';
    const sourceText = `Published figures: ${[...new Set(data.rounds.map(round => `${round.source.publisher}, ${round.source.title}, ${round.source.table ?? ''}`))].join('; ')}, ${data.year}. Each calculated share is a part's published amount over the round's published total, times 100. Calls are ranked on the game's 0 to 100 measure: pence gaps for splits, wrongly ordered pairs for funding, 0 or 100 for reserves. Scores and grades are game measures, not a judgement of the council.`;
    const card=element('div','','game-end-card');card.dataset.gameScoreCard='';
    card.append(element('p',`Your score, ${name} budget game`,'game-end-kicker'));
    const head = element('div', '', 'game-end-head');
    const badge = element('p', '', 'game-end-grade');
    badge.append(element('span', 'Grade'), element('strong', grade?.[1] ?? 'None'));
    const totals = element('div');
    totals.append(element('p',`${total} out of ${maximum}`,'game-score'), element('p', `${grade ? `${grade[2]}. ` : ''}${played}.`));
    head.append(badge, totals);
    card.append(head);
    const calls = element('div', '', 'game-end-calls');
    for (const [title, list] of [['Closest calls', closest], ['Furthest calls', furthest]] as const) {
      const block = element('div');
      block.append(element('h4', title));
      const ol = element('ol');
      for (const item of list) {const li = element('li'); li.append(element('strong', item.name), element('span', item.call)); ol.append(li);}
      block.append(list.length ? ol : element('p', restored ? 'Guesses are not shared in a score link.' : 'No scored answers to show.'));
      calls.append(block);
    }
    card.append(calls, element('p', stamp, 'game-end-stamp'), element('p', sourceText, 'game-end-source'));
    const next = root.querySelector<HTMLTemplateElement>('[data-game-set-next]');
    if (next) card.append(next.content.cloneNode(true));
    stage.append(card);
    // The kit score card, round by round, with its table twin.
    const drawing=root.querySelector<HTMLTemplateElement>('[data-game-score]')!.content.firstElementChild!.cloneNode(true) as SVGSVGElement;
    const scoreText=drawing.querySelector('.ek-score-total')!;scoreText.textContent=String(total);
    scoreText.nextElementSibling!.textContent=`of ${maximum}`;
    scoreText.nextElementSibling!.nextElementSibling!.textContent=`${played}.`;
    drawing.querySelectorAll('[data-ek-score]').forEach((bar,i)=>{
      bar.setAttribute('width',String(Number(bar.previousElementSibling!.getAttribute('width'))*(scores[i]??0)/100));
      bar.setAttribute('data-value',String(scores[i]??0));bar.nextElementSibling!.textContent=scores[i]===null?'Skipped':String(scores[i]);
    });
    drawing.setAttribute('aria-label',`Your score: ${total} out of ${maximum}. ${data.rounds.map((round, i) => `${round.title}: ${scores[i] === null ? 'skipped' : scores[i]}`).join('; ')}.`);
    const figure = element('figure', '', 'game-figure game-figure-score');
    figure.append(element('h4', 'Round by round'), drawing);
    const list = element('ul','','game-summary-rows');
    data.rounds.forEach((round, i) => list.append(element('li', `${round.title}: ${scores[i] === null ? 'skipped' : `${scores[i]} out of 100`}`)));
    stage.append(figure, list, element('p', 'Game scoring: split rounds use 100 minus half the sum of absolute differences in pence, rounded to a whole score and bounded from 0 to 100. Funding uses the percentage of correctly ordered unequal pairs. Reserves awards 50 for the direction and 50 for the size band. Skipped rounds have no score.', 'small'),
      element('p', `Grade: the score as a share of the points available in the rounds played. ${GRADES.map(([floor, letter, label]) => `${letter}, ${label}, ${floor ? `${floor} per cent or more` : 'below 40 per cent'}`).join('; ')}.`, 'small'));
    if (!restored) {
      stage.append(element('h4', 'Answers furthest from the published figures'));
      const far = [...distances].sort((a, b) => b.distance - a.distance).slice(0, 3);
      if (!far.length) stage.append(element('p', 'No scored answers to compare. Skipped rounds are left out.'));
      for (const item of far) {
        const box = element('div', '', 'game-result');
        box.append(element('strong', item.label), element('p', item.detail), sourceLine(item.source));
        stage.append(box);
      }
      stage.append(element('p', 'The comparison uses absolute pence differences for splits, the percentage of incorrectly ordered pairs involving each funding item, and 0 or 100 for each reserve answer. These are game measures on a common 0 to 100 scale.', 'small'));
    }
    const link = element('a', 'Open this score link', 'game-share');
    link.href = scoreLink(location.origin, data.slug, scores);
    link.dataset.gameShare = '';
    const status = element('p');
    status.setAttribute('role', 'status');
    const actions = element('div', '', 'game-actions');
    actions.append(button('Save score as PNG', () => {
      // Drawn on a canvas in this browser from the card's own text and theme colours: no request, nothing stored.
      try {
        const look = getComputedStyle(card), ink = look.color, soft = getComputedStyle(card.querySelector('.game-end-source')!).color, accent = look.borderTopColor;
        const serif = getComputedStyle(card.querySelector('.game-score')!).fontFamily, sans = look.fontFamily;
        const W = 1200, pad = 72, canvas = document.createElement('canvas');
        const lines = (list: Distance[]) => list.length ? list.flatMap(item => [...wrap(item.name, 34).map(text => [text, 0] as const), ...wrap(item.call, 40).map(text => [text, 1] as const)]) : [[restored ? 'Guesses are not shared in a score link.' : 'No scored answers to show.', 1] as const];
        const left = lines(closest), right = lines(furthest), source = wrap(sourceText, 92);
        const height = (list: ReturnType<typeof lines>) => list.reduce((sum, [, n]) => sum + (n ? 34 : 50), 0);
        const head = wrap(`Your score, ${name} budget game | ${data.year}`, 56), extra = (head.length-1)*42;
        const stampY = 470 + Math.max(height(left), height(right)) + 90, sourceY = stampY + 60, H = sourceY + source.length * 30 + 90 + extra;
        canvas.width = W; canvas.height = H;
        const c = canvas.getContext('2d')!;
        const text = (value: string, x: number, y: number, font: string, colour = ink) => {c.font = font; c.fillStyle = colour; c.fillText(value, x, y);};
        c.fillStyle = look.backgroundColor; c.fillRect(0, 0, W, H);
        c.fillStyle = accent; c.fillRect(0, 0, W, 14);
        head.forEach((value, n) => text(value, pad, 104 + n * 42, `600 34px ${sans}`, soft));
        text(new URL(document.querySelector<HTMLLinkElement>('link[rel=canonical]')?.href ?? location.href).host, pad, H-40, `600 24px ${sans}`);
        c.translate(0, extra);
        c.strokeStyle = accent; c.lineWidth = 6; c.beginPath(); c.arc(pad + 90, 250, 84, 0, Math.PI * 2); c.stroke();
        c.textAlign = 'center'; text(grade?.[1] ?? 'None', pad + 90, grade ? 290 : 262, `600 ${grade ? 116 : 44}px ${serif}`); text('GRADE', pad + 90, 384, `600 22px ${sans}`, soft);
        c.textAlign = 'start'; text(`${total} out of ${maximum}`, pad + 230, 260, `600 92px ${serif}`); text(`${grade ? `${grade[2]}. ` : ''}${played}.`, pad + 234, 318, `400 34px ${sans}`, soft);
        [[left, 'Closest calls', pad], [right, 'Furthest calls', W / 2 + 12]].forEach(([list, title, x]) => {
          let y = 470; text(title as string, x as number, y, `600 36px ${serif}`);
          for (const [value, n] of list as ReturnType<typeof lines>) text(value, x as number, y += n ? 34 : 50, `${n ? 400 : 600} ${n ? 26 : 28}px ${sans}`, n ? soft : ink);
        });
        c.font = `600 22px ${sans}`;
        const label = stamp.toUpperCase(), wide = c.measureText(label).width + 48;
        c.save(); c.translate(pad + wide / 2, stampY - 16); c.rotate(-0.035); c.strokeStyle = accent; c.lineWidth = 4; c.strokeRect(-wide / 2, -30, wide, 56); c.textAlign = 'center'; text(label, 0, 6, c.font); c.restore();
        source.forEach((value, n) => text(value, pad, sourceY + n * 30, `400 22px ${sans}`, soft));
        const save = element('a', 'Save your score card');
        save.href = canvas.toDataURL('image/png'); save.download = `${data.slug}-budget-game-score.png`; save.click();
        status.textContent = 'Score card saved. Your answers stay in this browser.';
      } catch {status.textContent = 'The browser could not save the image. Your score link is still available below.';}
    }, false), button('Copy score link', async () => {
      try {await navigator.clipboard.writeText(link.href); status.textContent = 'Score link copied.';}
      catch {status.textContent = 'Copy the address from the score link below.'; link.focus();}
    }), button('Play again', start));
    const another = element('a', 'Play another council', 'button secondary');
    another.href = '/tools/budget/';
    actions.append(another);
    scenarioEntry.hidden = false;actions.append(scenarioEntry);
    stage.append(actions, link, status);
  }
  /** A score link that cannot be read: a designed message and a fresh start, never a broken board. */
  function unreadable() {
    playing = false;
    root.querySelector<HTMLOListElement>('[data-game-rail]')!.hidden = true;
    const box = element('div', '', 'game-unreadable');
    stage.replaceChildren();
    heading('This score link could not be read');
    const h = stage.lastElementChild as HTMLElement;
    box.append(h, element('p', 'Part of the link may be missing or changed. Scores in a link are never checked, so nothing from it is shown.'), button('Start a fresh game', start, false));
    stage.append(box); h.focus({preventScroll: true});
  }
  function start() {
    scenario.clear();delete stage.dataset.scenarioStage;
    index = 0; scores = []; distances = [];
    playing = true;
    if (location.hash.startsWith('#scores')) history.replaceState(null, '', `${location.pathname}${location.search}`);
    showRound();
  }
  function showRound() {
    rail();
    const round = data.rounds[index];
    stage.replaceChildren();
    heading(round.title);
    stage.append(element('p', `Round ${index + 1} of ${data.rounds.length}`, 'eyebrow'), move(
      round.kind === 'split' ? 'Share all 100p across the services, then press Reveal answer.'
      : round.kind === 'bill' ? 'Share all 100p between the charging bodies, then press Reveal answer.'
      : round.kind === 'funding' ? 'Order the funding groups from largest to smallest, then press Reveal answer.'
      : 'Choose a direction and a size band, then press Reveal answer.'), element('p', round.explanation));
    const form = element('form');
    const rows = element('ol', '', 'game-rows');
    const status = element('p', '', 'game-status');
    status.setAttribute('role', 'status');
    const guesses: HTMLInputElement[] = [];
    const submit = element('button', 'Reveal answer', 'button'); submit.type = 'submit';
    const checkTotal = element('p', '0p of 100p');
    const reason = element('p', '', 'game-check-reason');
    const order = round.items.map((_, i) => i);
    let directionValue = '';
    let size: HTMLSelectElement;
    if (round.kind === 'split' || round.kind === 'bill') {
      const shared = splitControls({items:round.items,id:`game-${index}`,template:root.querySelector<HTMLTemplateElement>(`[data-game-grid="${index}"]`)!,submit,reason,checkTotal,status});
      guesses.push(...shared.inputs);form.append(shared.split);
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
      const directionGroup = element('fieldset');directionGroup.append(element('legend','Direction'));
      const choices = element('div', '', 'game-direction');
      for (const [value, label] of Object.entries(directionLabel)) {
        const control=element('input');control.type='radio';control.name='game-direction';control.value=value;control.required=true;
        control.addEventListener('change',()=>{directionValue=value;});
        const choice=element('label',label);choice.prepend(control);choices.append(choice);
      }
      directionGroup.append(choices);
      size = element('select'); size.id = 'game-size'; size.required = true;
      const sLabel = element('label', 'Size of the change'); sLabel.htmlFor = size.id;
      ['', ...SIZE_BANDS].forEach((label, i) => {const option = element('option', label || 'Choose a size band'); option.value = i === 0 ? '' : String(i - 1); size.append(option);});
      group.append(directionGroup, sLabel, size); form.append(group);
    }
    const actions = element('div', '', 'game-actions');
    if (round.kind === 'split' || round.kind === 'bill') {
      const bar = element('div', '', 'game-check-bar');bar.append(submit, checkTotal);
      form.append(reason, bar);actions.append(button('Skip and reveal', () => reveal(true)));
    } else actions.append(submit, button('Skip and reveal', () => reveal(true)));
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
            if (!skipped) details.push({label: `${round.title}: ${item.label}`, detail, distance: Math.abs(Number(guesses[i].value) - actual[i]), source: round.source, name: item.label, call: `You: ${guesses[i].value}p. Calculated share: ${actual[i].toFixed(2)}p.`});
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
            if (!skipped) details.push({label: item.label, detail, distance: unequal.length ? wrong / unequal.length * 100 : 0, source: round.source, name: item.label, call: `Your position: ${order.indexOf(itemIndex) + 1}. Answer position: ${i + 1}.`});
          });
        } else {
          const change = round.items[1].value - round.items[0].value;
          const d = reserveDirection(change), b = reserveBand(change);
          if (!skipped && (!directionValue || !size.value)) throw new Error('Choose a direction and a size band.');
          if (!skipped) score = (directionValue === d ? 50 : 0) + (Number(size.value) === b ? 50 : 0);
          for (const item of round.items) answerList.append(element('li', `${item.label}: ${item.detail}`));
          answerList.append(element('li', `Calculated change, end minus start: ${pounds(change)}. ${directionLabel[d]}; ${SIZE_BANDS[b]}.`));
          if (!skipped) {
            details.push({label: `${round.title}: direction`, detail: `Your answer: ${directionLabel[directionValue]}. Published balances imply: ${directionLabel[d]}. Change: ${pounds(change)}, end minus start of the sum of RA Part 2 lines 1015 and 1016.`, distance: directionValue === d ? 0 : 100, source: round.source, name: 'Reserves direction', call: `You: ${directionLabel[directionValue]}. Answer: ${directionLabel[d]}.`});
            details.push({label: `${round.title}: size`, detail: `Your answer: ${SIZE_BANDS[Number(size.value)]}. Calculated change: ${pounds(change)}, end minus start of the sum of RA Part 2 lines 1015 and 1016. Answer band: ${SIZE_BANDS[b]}.`, distance: Number(size.value) === b ? 0 : 100, source: round.source, name: 'Reserves size', call: `You: ${SIZE_BANDS[Number(size.value)]}. Answer: ${SIZE_BANDS[b]}.`});
          }
        }
      } catch (error) {status.textContent = (error as Error).message; return;}
      scores.push(score); distances.push(...details);
      rail();
      stage.replaceChildren();
      const subject = round.kind === 'split' ? `${round.title.replace('Guess the split: ', '')}'s split`
        : round.kind === 'bill' ? `${root.dataset.councilName}'s Band D split`
        : `${root.dataset.councilName}'s ${round.kind}`;
      heading(`${subject}, published answer`);
      const panel = element('div', '', 'game-score-panel');
      panel.append(element('p', skipped ? 'Round skipped. No score recorded.' : `Your score: ${score} out of 100`, 'game-score'));
      if (!skipped && (round.kind === 'split' || round.kind === 'bill')) panel.append(element('p', 'Your score: add up the gaps below, halve the total and take it from 100.'));
      stage.append(panel, element('p', round.explanation));
      if (round.kind === 'split' || round.kind === 'bill') {
        const pair = element('div', '', 'game-reveal-waffles');
        if (!skipped) {
          const player = element('div');player.append(element('h4', 'Your split'));
          const grid = root.querySelector<HTMLTemplateElement>(`[data-game-grid="${index}"]`)!.content.firstElementChild!.cloneNode(true) as HTMLElement;
          let at = 0;const nodes = grid.querySelectorAll('[data-ek-square]');
          squaresFor(guesses.map(input => Number(input.value))).forEach((count, part) => {for(let n=0;n<count;n++)nodes[at++].setAttribute('class', `ek-sq sq-p${part}`);});
          grid.querySelector('[data-ek-filled]')!.setAttribute('data-ek-filled', '100');
          player.append(grid);pair.append(player);
        }
        pair.append(root.querySelector<HTMLTemplateElement>(`[data-game-published="${index}"]`)!.content.cloneNode(true));
        stage.append(pair);
        if (!skipped) {
          const actual = shares(round.items, round.base!), mine = guesses.map(input => Number(input.value));
          const dots = element('figure', '', 'game-figure');
          dots.append(element('h4', 'Your guess beside the calculated share'), dotPlot(round.items, mine, actual, round.source, stage.clientWidth));
          stage.append(dots, element('h4', 'The gap, part by part', 'game-gaps-title'));
          const gaps = element('div', '', 'game-gaps');gaps.setAttribute('aria-label', 'Your pence less the published share');
          round.items.forEach((item,i) => {
            const gap = Number(guesses[i].value)-actual[i];
            const row = element('div', '', 'game-gap-row');
            row.append(element('p', `${item.label}: ${pence(gap)}`));
            const drawing = root.querySelector<HTMLTemplateElement>('[data-game-gap]')!.content.firstElementChild!.cloneNode(true) as HTMLElement;
            const bar = drawing.querySelector('[data-game-gap-bar]')!;
            const zero = Number(bar.getAttribute('data-game-zero'));
            bar.setAttribute('transform', `translate(${zero} 0) scale(${-gap/100} 1) translate(${-zero} 0)`);
            row.append(drawing);gaps.append(row);
          });
          stage.append(gaps,element('p', round.kind === 'bill' ? 'Gap: your pence less the published share. Each printed component is divided by the published Band D area average, times 100.' : `Gap: your pence less the published share. The published share is each service's amount over the ${round.items.length} services' total, times 100.`, 'small'),
            table(`Your split and the calculated shares of ${subject.replace(/'s (Band D )?split$/, '')}'s published amounts, pence per 100p`, ['Part', 'Your guess', 'Calculated share', 'Gap'], round.items.map((item, i) => [item.label, `${mine[i]}p`, `${actual[i].toFixed(2)}p`, pence(mine[i] - actual[i])])));
        }
        const counts=squaresFor(shares(round.items,round.base!));
        counts.forEach((count,i)=>{if(count===0)answer.append(element('p', `${round.items[i].label}: under half a square. The published amount is retained in the table.`));});
      }
      if (round.kind === 'funding') {
        const drawing = root.querySelector<HTMLTemplateElement>(`[data-game-published="${index}"]`)!.content.cloneNode(true) as DocumentFragment;
        const sorted = round.items.map((_, i) => i).sort((a,b)=>Math.abs(round.items[b].value)-Math.abs(round.items[a].value));
        const ordinal = (n: number) => `${n}${n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}`;
        drawing.querySelectorAll('[data-player-position]').forEach((slot,i)=>{
          const value = round.items[sorted[i]].value;
          const direction = value < 0 ? 'Deducts from funding' : value > 0 ? 'Adds to funding' : 'No contribution to funding';
          slot.textContent = `${direction}; ${skipped ? 'round skipped' : `you placed it ${ordinal(order.indexOf(sorted[i])+1)}`}`;
        });
        stage.append(drawing);
      }
      if (round.kind === 'reserves') stage.append(root.querySelector<HTMLTemplateElement>(`[data-game-published="${index}"]`)!.content.cloneNode(true));
      answer.append(answerList); sourceNotes(round, answer); stage.append(answer);
      document.dispatchEvent(new Event('budget:reveal'));
      const last = index === data.rounds.length - 1;
      stage.append(move(`Read the answer and its source, then go on to ${last ? 'your summary' : 'the next round'}.`), button(last ? 'Show summary' : 'Next round', () => {index++; index === data.rounds.length ? summary() : showRound();}, false));
    }
  }
  // W1, W4: the Guess door is the one start control. Once the script is running it starts the game;
  // during play it jumps back to the round; without script the link still jumps to the game.
  root.querySelector('[data-budget-door="guess"]')?.addEventListener('click', event => {
    if (playing) return;
    event.preventDefault(); start();
  });
  const restore = () => {
    const restored = readScores(location.hash, data.rounds.length);
    if (restored) {scores = restored; distances = []; summary(true);}
    else if (location.hash.startsWith('#scores')) unreadable();
  };
  window.addEventListener('hashchange', restore);
  restore();
}
