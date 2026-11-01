# S01E03: #4471 review

Prepared for Michał Olszak by Codex on 2026-11-01.

## Deliverables

- Added page source: `src/routes/kb/incidents/4471-review/+page.svx`
- Actual prerendered page: `build/kb/incidents/4471-review/index.html`
- Visual copy: `evidence/rendered-page.png`
- Browser text capture: `evidence/rendered-page.txt`
- Reproducible report assignment: `evidence/audit.json`
- Issue drafts: `drafts/parser.md` and `drafts/hint.md`

The build directory includes the other KB routes and the generated CSS/JavaScript needed
by the rendered page. Serve it as a static directory to preserve absolute asset and route
paths. The screenshot and text capture can be read without a server.

## Findings

The supplied classifier partitions 412 unique reports into parser (379) and hint (33).
The export contains 15 extra overlapping rows, with no conflicting duplicate IDs.
Intake tags disagree with the classifier for 38 reports. Five one-day or timing reports
remain accounted for under parser, but the page explicitly flags that their cause is
unconfirmed and needs investigation. Export counts are not live queue counts.

The subject-only triage rule contradicts the rendered examples. The new page proposes
cause-based triage and a successor decision; accepted decision 0001 is preserved.

## Checks performed

1. `node scripts/audit.mjs`: ID deduplication, conflict detection, reconciliation, tenant
   resolution and classification through the original exported functions.
2. `pnpm build`: real mdsvex/Svelte compilation and SvelteKit static prerendering.
3. `node scripts/verify-render.mjs`: headless Chrome loaded the production preview;
   checked rendered counts, five-report footnote and derived signature; no page errors.
4. Visually inspected the full-page browser capture.

The rendered signature derives desk ref `DR-HR95-WZSB` from the page's frontmatter.
No exported KB component, report, tenant, original page or accepted decision was changed.

## Rebuild

Use Node 24 and pnpm 11 (or a compatible version):

```sh
pnpm install --frozen-lockfile
pnpm run audit:reports
pnpm build
```

The render verification additionally requires Playwright and Chrome, and
`CODEX_NODE_MODULES` pointing to the runtime's node_modules directory.

## Publication status

Local work prepared and verified. The student approved publication to
`Olszi37/mega-s01e03-what-it-shows`, including the two issues and revisions for course acceptance.
The course accepted both tickets at step one. Its engineering update says #4471 closed on
2026-10-05: parser fixed (`fix(dates): parse dd/mm for eu locales`); hint won't fix because
booking-v3 was retired. The KB records both dispositions without changing historical counts.
Parser issue: https://github.com/Olszi37/mega-s01e03-what-it-shows/issues/1
Hint issue: https://github.com/Olszi37/mega-s01e03-what-it-shows/issues/2
Final course acceptance is pending.
