# Prompts | Colour round, kit 0.6.5, the swap and the front doors | 16 November 2026

Written in Claude Code for `docs/PLAN-CURRENT.md` section 4. The diagnosis these answer is section 2 of that file. Each prompt below starts with "Preamble applies", meaning the standing preamble here, so later prompts need only their goal, scope and pages.

## Standing preamble (every UK Council Tax session)

```text
Repository tompickup23/ukcounciltax, in your own worktree from origin/main. Read CLAUDE.md, docs/STATE.md and docs/PLAN-CURRENT.md first. Before writing, list the worktrees and check no other session is on the same branch.

Local traps. Copy all of data/raw/ from ~/ukcounciltax/data/raw/ into the worktree before any test or build. A full build takes 15 to 20 minutes: use astro dev for layout work and build only for the gates. Start astro preview yourself on a free port, read the preview log for the port it actually took, run Playwright with E2E_BASE_URL, then stop the preview.

Gates, run once on the final head and reported in the PR body: npm test, npm run check, BUILD_OG=1 npm run build, npm run test:dist, npm run test:text, the full browser suite and the actual CSP suite. node scripts/diff-numbers.mjs against a clean build of the base, with "## Pages allowed to differ" as a fenced block and one sentence on what differs. /design-check at 390 and 1440, with "## Pages to capture" naming this PR's pages plus the eight in docs/design/reference-pages.txt, dark first then light, and the contact sheet result in the PR. Look at every chart label yourself at 375 and 1440 in both themes. No horizontal overflow at 375 px. No em dash, en dash or spaced hyphen anywhere, including copied or downloaded text.

Pushes. Fix review findings together and push once. A PR should cost two hosted runs, not five.

Colour. A page PR adds no colour value. If a page needs one, stop and say so: values arrive only through the kit and scripts/apply-brand.py.

Review and merge. When the gates are green, a separate reviewer session or agent that did not build the PR reads the diff against the data rules in CLAUDE.md; fix or record its findings in the PR. Merge only under the fast track in docs/DECISIONS-2026-11-16.md section 1, when all five conditions hold, as its own step after reading gh pr checks, with no deploy running. Tokens, navigation, data, new page families and anything a reviewer marks as a data rule breach are Tom's yes, in words. Replace docs/STATE.md and the changed rows of docs/PLAN-CURRENT.md inside the PR.
```

## C0: the colour round (Claude Code, one session, no site code changes)

```text
Preamble applies, except the gates: this PR is documents and images only.

Read docs/PLAN-CURRENT.md sections 2 and 4 (stage 1), "Design direction" in docs/DESIGN-AUDIT-2026-11-15.md, src/styles/global.css lines 1 to 165 and 480 to 520, and in ~/estate-kit: tokens/tokens.json (skins.sites.ukcounciltax), scripts/derive-desk.mjs, the colour functions under src/qa, and the 0.6.4 entry in CHANGELOG.md.

Goal: Tom chooses the UK Council Tax palette for both themes from pictures of the real site, not from prose. He has said the present colour theme is ugly. The site renders dark on his machine, so dark is drawn and judged first.

What is wrong now, to be fixed by every candidate:
1. In dark, --accent and --accent-bright are the same mint (#94d7b5), and it does every job.
2. The dark desk is mint at 26 per cent over near black: a grey sage. The homepage shows three different dark greens (postcode panel, budget band, map card).
3. Neutrals are cool blue greys beside a green accent and a warm light paper.
4. The bill bar is blue, orange, purple and magenta, unrelated to the site.

Build three candidates, each a complete set of token values for light and dark:
A. Deep green ledger. One hue: a green black ground in dark, a rich green desk from the kit ramp range, mint kept only for the second headline tone and focus, warmer neutrals.
B. Green and one warm colour. As A, plus one warm second colour for the primary action, the current step and the highlighted bar. It must not be confusable with the warning or critical state.
C. Ink and paper. Charcoal bands (not blue) and warm paper; green only for money: figures, the council's own share and the mark.
Each candidate gives the accent three roles (surface, text, highlight), one desk colour used by every dark panel, neutrals in the paper's temperature, and a bill bar where the billing council's share takes the accent and the other bodies take a related neutral ramp. State colours keep their meaning and their labels.

Method. No change to src/. Write each candidate as one CSS file of custom property overrides under docs/design/colour-round/ (candidate-a.css and so on, with [data-theme] and prefers-color-scheme blocks as the token block has). Create docs/design/reference-pages.txt with these eight paths: /, /tools/budget/, /tools/budget/trafford/, /tools/budget/trafford/set/, /councils/pendle/, /council-tax/, /council-tax/towns/, /compare/. With astro dev or a preview, capture each page at 1440 and 390 in dark then light, for the live colours and for each candidate, injecting the candidate file with Playwright's addStyleTag. Play one round of the Trafford game and move one set page control before capturing, so the stepper, a reveal chart and the shortfall state are on the sheet.

Check before showing. For every candidate and theme compute contrast with the kit's colour functions: body text and muted text on paper, on card and on desk at 4.5:1; links at 4.5:1; marks and neighbouring bill bar segments at 3:1; state colours on paper and on desk at 4.5:1; focus ring at 3:1. A candidate that fails is fixed or dropped, not shown with a caveat. Print the table.

Output. One contact sheet per candidate and one for the live colours (JPEG, each under 1,500 KB) in docs/design/colour-round/, and docs/design/COLOUR-ROUND-2026-11.md: the token values per candidate, the contrast table, what each changes in a sentence, and your recommendation with its reason. Open a docs PR. Also publish the four sheets as a private page for Tom if the session can. Do not touch the kit, global.css or any template. Stop there: the choice (decision C1) is Tom's.
```

## K2: Estate Kit 0.6.5 (Claude Code, after Tom's choice)

```text
Repository tompickup23/estate-kit, in your own worktree from origin/main. Read README.md ("The desk"), CHANGELOG.md 0.6.4, scripts/derive-desk.mjs, tests/k1-skins.test.ts and, in ukcounciltax, docs/design/COLOUR-ROUND-2026-11.md and Tom's choice recorded in docs/PLAN-CURRENT.md (C1).

Goal: the chosen palette becomes skins.sites.ukcounciltax in tokens.json, for both themes, by the kit's own rules. Nothing is hand edited in generated/.

Work: paper, ink and neutrals; the accent's three roles; the desk for both themes through derive-desk.mjs (change the rule if the choice needs it, and keep the test that holds tokens.json equal to the rule); the bill bar series as a skin override, with BillAnatomy's own share in the accent; the accent ramp regenerated. UK Councils and Council Intel output must be byte identical: show the diff of generated/ limited to ukcounciltax files. Regenerate the catalogue screens. Changelog entry for 0.6.5 naming every value as decided by Tom on its date.

Gates: kit CI; the colour gates in both themes including charts on the desk; golden files changed only where a UK Council Tax skin is drawn. Stop at an open PR. The merge and the tag are Tom's.
```

## W8: the swap on UK Council Tax (Claude Code, after 0.6.5 is tagged)

```text
Preamble applies. This PR changes every page, so it never runs beside a page session, and it is Tom's yes.

Goal: the site takes the 0.6.5 palette in both themes with no template change.

Work: vendor kit 0.6.5 with scripts/vendor.mjs. Extend scripts/apply-brand.py to splice the estate-skin block below the estate-tokens block, with the same refusals it has now and --check covering both blocks. Bring src/styles/palette.ts, tests/palette.test.ts and the share card into line. Replace the .desk colour mix in global.css with the kit's desk tokens. Check the Burnley scenario game: if its skin reads site tokens, capture it; if it is pinned by a served hash, leave it and say so. Delete nothing a later page PR relies on.

Gates as the preamble, plus: python3 scripts/apply-brand.py --check; node src/vendor/estate-kit/verify-vendor.mjs; diff-numbers shows no figure added, removed or changed on any page (list ** under "## Pages allowed to differ" for colour and class values only, and say so); the reference sheet before and after, side by side, dark first; axe colour contrast in the browser suite green in both themes; forced colours and print captures of one desk page. If any template needs editing to make a colour work, stop and report it: that is a finding about the palette, not a reason to widen this PR.
```

## Front doors: the budget hub and the homepage row (Claude Code, after W4 part two merges)

```text
Preamble applies. One PR, two entry pages. Layout only, so the fast track applies if it stays that way.

Read plan section 4 stage 2 and, in docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md section 11.4, the rows for the homepage and /tools/budget/.

/tools/budget/: the desk band first with the council picker inside it; each table row offers Guess and Set as two small pills, Set only where a set page exists; featured councils drawn as the round rail, not the share image. Homepage: the bill card trimmed to the bar, the legend and one record line, with the rest behind a details element and the in SVG source kept; the England average, its change and the line chart in one two column row; the map card thumb drawn from the real map outline. scripts/lib/face.mjs pins five homepage task links, the bill card and more: keep every pin green, or change an assertion in this PR with the reason stated.

Do not touch: the header, footer or navigation (W5), tokens, data, the game and set pages.

"## Pages allowed to differ": index.html, tools/index.html, tools/budget/index.html. "## Pages to capture": those three plus the reference eight.
```
