# Human History

A dynamic **evidence map** of human history: sites, fossils, ancient DNA localities, monuments, texts,
artifacts, migrations, environmental events and open hypotheses, placed on a map you can move through time.
It is built from [`design/master-prompt.md`](design/master-prompt.md) and [`design/ledger.md`](design/ledger.md),
and it is designed around one rule: **nothing is allowed to quietly turn into a fact.**

## What it does

| View | What you get |
|---|---|
| **Map** | Canvas map (flat or globe) with a non-linear time slider from 3.5 Ma to today. Records appear when their date range starts, stay bright while it lasts and fade afterwards. A schematic shelf tint follows global sea level. Schematic migration routes, environmental events, evidence links of the selection, a compare curtain between two moments, playback, jump-to-next-discovery. |
| **Evidence graph** | Force graph of records and events. Every edge has a relation type (supports, contradicts, correlates with, predates, derived from, shares characteristics with, potentially influenced, …), a confidence, a note and sources, with the standing cautions repeated. |
| **Hypothesis lab** | Open questions with competing explanations side by side: evidence for and against, assumptions, testable predictions, weaknesses, what would falsify each, and how confidence has changed. No option is chosen for you. |
| **Ledger** | Built records and the research queue, with depth (stub / partial / full), filters, and JSON and CSV export. |
| **Audit** | Cross-table checks: status vs sourcing (triangulation score), relation vs dates/geography, hypothesis vs its evidence and cited records, route anchoring and direction, sea-coordinate typos, coverage heat map by region and era, per-record research-workflow completeness. `npm run audit` runs the same checks in CI. |
| **Method** | The classification scale, standing rules and the data-honesty notice. |

Selecting a record opens the **evidence explorer**: two separate classifications (evidence and interpretation, E1 to E8),
measured, estimated or claimed dates with competing chronologies, mainstream and alternative readings, what
supports and contradicts each, unresolved questions, what would prove or disprove it, connections and sources.
“Copy ledger YAML” exports a record in the ledger template, and “Export report (.md)” writes the 16-section research report from the ledger (§19).

## Data honesty

The first release seeds the system with 100+ records, 150+ bibliography entries and 100+ graph links written from
recall. **They are leads, not verified citations.** Dates, coordinates and references must be checked against the primary
report before being relied on. Sources are tagged `unverified` or `citation to locate` in the UI, and records with
approximate coordinates carry a `geoNote`. Fixing these is the work the ledger exists for.

The sea-level shelf and the migration routes are **schematic** and are labelled as such.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run validate     # data integrity + the evidence rules (also runs in CI)
npm run build        # type-check and production build to dist/
```

`npm run audit` runs the cross-table checks (exit 1 on errors, `--strict` also on warnings, `--all` lists notes).

`npm run validate` enforces, among other things, that **a record classified E1 or E2 names its sources**, that every
link, source and hypothesis reference resolves, and that every question has at least two competing options.

## Adding to the ledger

Records live in `src/data/`:

- `entries-*.ts`: ledger records (`entry({...})`, see `src/types.ts` for the template fields)
- `sources.ts`: bibliography (mark anything unchecked as `unverified` by leaving it in the default state, or `placeholder` if it does not yet identify a publication)
- `relations.ts`: evidence-graph edges
- `events.ts`, `migrations.ts`: environmental events and routes
- `hypotheses.ts`: open questions and competing explanations
- `queue.ts`: ledger subjects not yet built

Dates are signed calendar years (BCE negative); use the `bp()`, `bce()`, `ka()` and `Ma()` helpers from `src/lib/time.ts`.
Add a record to the ledger **before** building any narrative on it.

## Stack and architecture

TypeScript, Vite and D3 (d3-geo canvas rendering, d3-force, d3-zoom). No framework and no runtime services: the app is a static
site and deploys to GitHub Pages (`.github/workflows/pages.yml`). The master prompt’s suggested Next.js, PostGIS and vector-search
stack is the intended destination as the dataset grows. The data layer is already shaped as typed records so it can be moved
into a database; the current choice keeps the map fast, offline-capable and reviewable in diffs.

Base map data (Natural Earth land and 0/200 m bathymetry, public domain) is committed in `public/data/`; see `scripts/build-geo.sh`.

## Roadmap

- Real regional sea-level reconstructions and bathymetry in place of the schematic shelf; ice-sheet extents
- PostGIS and a document-ingestion pipeline that preserves provenance; vector search
- A research assistant restricted to retrievable sources, unable to fabricate citations
- Work through the P1 queue in the Ledger first

## Threads

The **Threads** page draws what one culture passed to another (languages, scripts, religions, ideas, technologies, crops, people) as ribbons between culture lanes over time, with the evidence for and against each transfer. Line style shows how direct the evidence is: solid = documented, dashed = debated, dotted = inferred from resemblance. Status (E1–E8) grades the evidence for the transfer itself, not for either culture.

Strands that rest on ancient texts also show the **primary passages** themselves: the quoted words, their locator, and three dates kept apart (composition with its basis, earliest witness, edition read). Every strand comes from a source opened by the [RDADA](https://github.com/SolutionsAsService/RDADA) research agent and re-checked by a separate verifier (`rdada_runs/`). `scripts/candidates-to-sources.py` turns verified candidates into `src/data/extra/g.ts`; strands in `src/data/threads.ts` are written by hand from those passages. A resemblance noticed by an editor is not a strand, and `npm run validate` refuses a strand with no source, an unknown culture, or a debated strand that records nothing against it.

