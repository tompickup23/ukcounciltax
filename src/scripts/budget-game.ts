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
  function rail() {
    const list=root.querySelector<HTMLOListElement>('[data-game-rail]')!;list.hidden=false;
    [...list.children].forEach((node,i)=>{
      node.removeAttribute('aria-current');node.classList.toggle('done',scores[i] !== undefined);
      if(i === index && scores.length < data.rounds.length)node.setAttribute('aria-current','step');
      node.querySelector('[data-step-status]')!.textContent=scores[i]===null?'skipped':'';
    });
  }
  function heading(text: string) {
    const h = element('h3', text);
    h.id = 'game-round-heading';
    h.tabIndex = -1;
    stage.append(h);
    h.focus({preventScroll:true});
    queueMicrotask(()=>root.querySelector('[data-game-rail]')?.scrollIntoView({block:'start'}));
  }
  function sourceNotes(round: GameRound, parent: HTMLElement) {
    for (const note of round.notes) parent.append(element('p', note));
    parent.append(sourceLine(round.source));
    for (const context of round.context ?? []) parent.append(element('p', context.text), sourceLine(context.source));
  }
  function summary(restored = false) {
    rail();
    controls.hidden = true;
    stage.replaceChildren();
    heading(restored ? 'Shared game scores' : 'Your game summary');
    stage.append(element('p', restored ? 'These scores were supplied in the link and are not verified results. Guesses are not shared, so the furthest answers cannot be restored.' : 'Scores describe how close your answers were to the published figures. They do not judge a council’s choices.'));
    const total=scores.reduce<number>((sum,score)=>sum+(score??0),0);
    const maximum=scores.filter(score=>score!==null).length*100;
    const card=element('div','','game-score-card');card.dataset.gameScoreCard='';
    card.append(element('p',`Your score, ${root.dataset.councilName} budget game`),element('p',`${total} out of ${maximum}`,'game-score'));
    stage.append(card);
    const list = element('ul','','game-summary-rows');
    data.rounds.forEach((round, i) => {
      const row=element('li', `${round.title}: ${scores[i] === null ? 'skipped' : `${scores[i]} out of 100`}`);
      const track=element('span','','game-score-track');track.setAttribute('aria-hidden','true');
      const fill=element('span','','game-score-fill');fill.style.width=`${scores[i]??0}%`;track.append(fill);row.append(track);list.append(row);
    });
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
    }), button('Save score as PNG', async () => {
      try {
        status.textContent='Preparing your score image.';
        const svg=root.querySelector<HTMLTemplateElement>('[data-game-score]')!.content.firstElementChild!.cloneNode(true) as SVGSVGElement;
        const scoreText=svg.querySelector('.ek-score-total')!;scoreText.textContent=String(total);
        scoreText.nextElementSibling!.textContent=`of ${maximum}`;
        scoreText.nextElementSibling!.nextElementSibling!.textContent=`${maximum/100} of ${scores.length} rounds played.`;
        const plot=svg.querySelector('.ek-scores')!;plot.setAttribute('data-ek-total',String(total));plot.setAttribute('data-ek-out-of',String(maximum));
        plot.querySelectorAll('[data-ek-score]').forEach((bar,i)=>{
          bar.setAttribute('width',String(Number(bar.previousElementSibling!.getAttribute('width'))*(scores[i]??0)/100));
          bar.setAttribute('data-value',String(scores[i]??0));bar.nextElementSibling!.textContent=scores[i]===null?'Skipped':String(scores[i]);
        });
        svg.setAttribute('aria-label',`Your score: ${total} out of ${maximum}`);
        const styles=document.createElementNS('http://www.w3.org/2000/svg','style');
        const fonts=[...document.querySelectorAll<HTMLLinkElement>('link[rel=preload][as=font]')].filter(link=>/latin-(?:400|600)-normal/.test(link.href));
        styles.textContent=(await Promise.all(fonts.map(async link=>{
          const bytes=new Uint8Array(await (await fetch(link.href)).arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
          const family=link.href.includes('source-serif-4')?'Source Serif 4':'Source Sans 3';
          return `@font-face{font-family:'${family}';font-weight:${link.href.includes('-600-')?'600':'400'};src:url(data:font/woff2;base64,${btoa(binary)})}`;
        }))).join('');svg.prepend(styles);
        const img=new Image();img.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;await img.decode();
        const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=Math.round(Number(svg.getAttribute('height'))*2);
        canvas.getContext('2d')!.drawImage(img,0,0,canvas.width,canvas.height);
        const save=element('a','Save your score image');save.href=canvas.toDataURL('image/png');save.download=`${data.slug}-budget-game-score.png`;save.click();
        status.textContent='Score image saved. Your answers stay in this browser.';
      } catch {status.textContent='The browser could not save the image. Your score link is still available below.';}
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
    rail();
    const round = data.rounds[index];
    stage.replaceChildren();
    heading(round.title);
    stage.append(element('p', `Round ${index + 1} of ${data.rounds.length}`, 'eyebrow'), element('p', round.explanation));
    const form = element('form');
    const rows = element('ol', '', 'game-rows');
    const status = element('p', '', 'game-status');
    status.setAttribute('role', 'status');
    const guesses: HTMLInputElement[] = [];
    let updateSplit = () => {};
    let placed = 0;
    const submit = element('button', 'Reveal answer', 'button'); submit.type = 'submit';
    const checkTotal = element('p', '0p of 100p');
    const reason = element('p', '', 'game-check-reason');
    const order = round.items.map((_, i) => i);
    let directionValue = '';
    let size: HTMLSelectElement;
    if (round.kind === 'split' || round.kind === 'bill') {
      const total = element('p', '0p of 100p', 'game-placed');
      total.setAttribute('aria-live', 'polite');
      const meter = element('progress', '0p of 100p', 'game-meter'); meter.max = 100; meter.value = 0; meter.setAttribute('aria-label', 'Pence placed');
      const grid = (root.querySelector<HTMLTemplateElement>(`[data-game-grid="${index}"]`)!.content.firstElementChild!.cloneNode(true)) as HTMLElement;
      grid.dataset.playerGrid = '';
      const panel = element('div', '', 'game-grid-panel');panel.append(element('p', 'Placed', 'eyebrow'), total, meter, grid);
      const split = element('div', '', 'game-split');split.append(panel, rows);
      const ranges: HTMLInputElement[] = [];
      updateSplit = () => {
        placed = guesses.reduce((sum, input) => sum + Number(input.value || 0), 0);
        total.textContent = checkTotal.textContent = `${placed}p of 100p`;
        meter.value = placed;
        submit.setAttribute('aria-disabled', String(placed !== 100));
        reason.textContent = placed === 100 ? '100p placed. Check your split.' : `${placed}p of 100p placed. Place ${100 - placed}p more to check your split.`;
        const counts = squaresFor([...guesses.map(input => Number(input.value || 0)), 100 - placed]);
        let square = 0;
        const nodes = grid.querySelectorAll('[data-ek-square]');
        counts.forEach((count, part) => {for(let n = 0; n < count; n++) nodes[square++].setAttribute('class', `ek-sq ${part === guesses.length ? 'sq-empty' : `sq-p${part}`}`);});
        grid.querySelector('[data-ek-filled]')!.setAttribute('data-ek-filled', String(placed));
      };
      round.items.forEach((item, i) => {
        const row = element('li', '', 'game-row');
        const input = element('input');
        input.type = 'number'; input.min = '0'; input.max = '100'; input.step = '1'; input.value = '0'; input.required = true;
        input.id = `game-${index}-${i}`;
        const label = element('label', `${item.label} (pence)`); label.htmlFor = input.id;
        const swatch = element('span', '', `game-swatch hatch-${Math.floor(i / 4)}`);swatch.style.setProperty('--part-paint', `var(--series-${i % 4 + 1})`);swatch.setAttribute('aria-hidden', 'true');label.prepend(swatch);
        const range = element('input');range.type = 'range';range.min = '0';range.max = '100';range.step = '1';range.value = '0';range.setAttribute('aria-label', `${item.label} pence slider`);
        const stepper = element('div', '', 'game-stepper');
        const change = (value: number) => {
          const remaining = 100 - guesses.reduce((sum, other) => sum + (other === input ? 0 : Number(other.value || 0)), 0);
          const next = Math.max(0, Math.min(remaining, Math.trunc(Number.isFinite(value) ? value : 0)));
          input.value = range.value = String(next);
          status.textContent = value > remaining ? `Only ${remaining}p available for ${item.label}. Lower another service to place more here.` : '';
          updateSplit();
        };
        const minus = button('−', () => change(Number(input.value) - 1));minus.setAttribute('aria-label', `Decrease ${item.label}`);
        const plus = button('+', () => change(Number(input.value) + 1));plus.setAttribute('aria-label', `Increase ${item.label}`);
        guesses.push(input);ranges.push(range);
        input.addEventListener('input', () => change(Number(input.value)));
        range.addEventListener('input', () => change(Number(range.value)));
        stepper.append(minus, range, plus, input);row.append(label, stepper);rows.append(row);
      });
      form.append(split);
      updateSplit();
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
          if (!skipped && (!directionValue || !size.value)) throw new Error('Choose a direction and a size band.');
          if (!skipped) score = (directionValue === d ? 50 : 0) + (Number(size.value) === b ? 50 : 0);
          for (const item of round.items) answerList.append(element('li', `${item.label}: ${item.detail}`));
          answerList.append(element('li', `Calculated change, end minus start: ${pounds(change)}. ${directionLabel[d]}; ${SIZE_BANDS[b]}.`));
          if (!skipped) {
            details.push({label: `${round.title}: direction`, detail: `Your answer: ${directionLabel[directionValue]}. Published balances imply: ${directionLabel[d]}. Change: ${pounds(change)}, end minus start of the sum of RA Part 2 lines 1015 and 1016.`, distance: directionValue === d ? 0 : 100, source: round.source});
            details.push({label: `${round.title}: size`, detail: `Your answer: ${SIZE_BANDS[Number(size.value)]}. Calculated change: ${pounds(change)}, end minus start of the sum of RA Part 2 lines 1015 and 1016. Answer band: ${SIZE_BANDS[b]}.`, distance: Number(size.value) === b ? 0 : 100, source: round.source});
          }
        }
      } catch (error) {status.textContent = (error as Error).message; return;}
      scores.push(score); distances.push(...details);
      rail();
      stage.replaceChildren();
      heading(`${round.title}: published answer`);
      stage.append(element('p', skipped ? 'Round skipped. No score recorded.' : `Your score: ${score} out of 100.`, 'game-score'), element('p', round.explanation));
      if (round.kind === 'split' || round.kind === 'bill') {
        if (!skipped) stage.append(element('p', 'Your score: add up the gaps below, halve the total and take it from 100.'));
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
          const gaps = element('div', '', 'game-gaps');gaps.setAttribute('aria-label', 'Your pence less the published share');
          const actual = shares(round.items, round.base!);
          round.items.forEach((item,i) => {
            const gap = Number(guesses[i].value)-actual[i];
            const row = element('div', '', 'game-gap-row');
            row.append(element('p', `${item.label}: ${Math.abs(gap)<0.05 ? '0.0p' : `${Math.abs(gap).toFixed(1)}p ${gap>0?'over':'under'}`}`));
            const drawing = root.querySelector<HTMLTemplateElement>('[data-game-gap]')!.content.firstElementChild!.cloneNode(true) as HTMLElement;
            const bar = drawing.querySelector('[data-game-gap-bar]')!;
            const zero = Number(bar.getAttribute('data-game-zero'));
            bar.setAttribute('transform', `translate(${zero} 0) scale(${-gap/100} 1) translate(${-zero} 0)`);
            row.append(drawing);gaps.append(row);
          });
          stage.append(gaps,element('p', round.kind === 'bill' ? 'Gap: your pence less the published share. Each printed component is divided by the published Band D area average, times 100.' : `Gap: your pence less the published share. The published share is each service's amount over the ${round.items.length} services' total, times 100.`, 'small'));
        }
        const counts=squaresFor(shares(round.items,round.base!));
        counts.forEach((count,i)=>{if(count===0)answer.append(element('p', `${round.items[i].label}: under half a square. The published amount is retained in the table.`));});
      }
      if (round.kind === 'funding') {
        const drawing = root.querySelector<HTMLTemplateElement>(`[data-game-published="${index}"]`)!.content.cloneNode(true) as DocumentFragment;
        const sorted = round.items.map((_, i) => i).sort((a,b)=>Math.abs(round.items[b].value)-Math.abs(round.items[a].value));
        const ordinal = (n: number) => `${n}${n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}`;
        drawing.querySelectorAll('[data-player-position]').forEach((slot,i)=>{slot.textContent=skipped?'Round skipped':`You placed it ${ordinal(order.indexOf(sorted[i])+1)}`;});
        stage.append(drawing);
      }
      if (round.kind === 'reserves') stage.append(root.querySelector<HTMLTemplateElement>(`[data-game-published="${index}"]`)!.content.cloneNode(true));
      answer.append(answerList); sourceNotes(round, answer); stage.append(answer);
      document.dispatchEvent(new Event('budget:reveal'));
      stage.append(button(index === data.rounds.length - 1 ? 'Show summary' : 'Next round', () => {index++; index === data.rounds.length ? summary() : showRound();}, false));
    }
  }
  root.querySelector('[data-game-start]')!.addEventListener('click', start);
  const restore = () => {
    const restored = readScores(location.hash, data.rounds.length);
    if (restored) {scores = restored; summary(true);}
  };
  window.addEventListener('hashchange', restore);
  restore();
}
