<script lang="ts">
  import { ENTRIES, EVENTS, LINKS, MIGRATIONS, QUESTIONS, SOURCES } from '#data';
  import { STATUS, STATUS_ORDER } from '$lib/classification';
  import Badge from '$lib/components/Badge.svelte';
  const options = QUESTIONS.reduce((n, q) => n + q.options.length, 0);
</script>
<svelte:head><title>Method · Human History</title></svelte:head>
<section class="view v-about">
<div class="about"><article>
  <h1>Human History</h1>
  <p class="lead">A dynamic evidence map of the human past. It follows the evidence and the logic wherever they lead, in the mainstream, in the alternatives, and in the gaps, and it is built so that no explanation can quietly turn into a fact.</p>
  <div class="warn"><b>Data honesty. </b>This is the first build. The {ENTRIES.length} records, {SOURCES.length} bibliography entries and {LINKS.length} graph links were written from recall to seed the system, not copied from the originals. Dates, coordinates and citations are leads that must be checked against the primary report before anything is relied on. Records marked “unverified” or “citation to locate” say so, and entries flagged with approximate coordinates need a survey check. Corrections are the point of the ledger.</div>
  <h2>How to read the map</h2>
  <ul>
    <li>Move the time slider (or press Space to play). Markers appear when their date range begins, stay bright while it lasts, and fade to ghosts afterwards. Uncertain dates are ranges, and competing chronologies are shown together on the timeline when a record is selected.</li>
    <li>The slider is not linear: each of the eleven intervals gets the same width so that the last 3,000 years do not vanish.</li>
    <li>The sand-coloured shelf is a <b>schematic</b> of exposed continental shelf: the 200 m isobath tinted in proportion to global sea level. It shows where land was lost, not a reconstruction of ancient coastlines. Regional relative sea level differs by tens of metres.</li>
    <li>Migration routes are schematic polylines. They show order, direction and competing models, not surveyed paths. Contradicted models are drawn so that you can see what the evidence rules out.</li>
    <li>Select a record to see its two classifications, dating, evidence, every interpretation, what supports and what contradicts it, what would settle it, its connections and its sources. Compare lets you swipe between two moments.</li>
  </ul>
  <h2>Two classifications, always separate</h2>
  <p>Every record has the reliability of the underlying evidence and the reliability of the proposed interpretation. Göbekli Tepe is an established site (E1) while the claim that it is the work of a lost advanced civilization is unsupported (E7). The ledger scale:</p>
  <div class="scale">{#each STATUS_ORDER as s}<div><Badge code={s} /><span>{STATUS[s].desc}</span></div>{/each}</div>
  <h2>The audit: tables that check each other</h2>
  <p>The Audit tab runs algorithms over the whole dataset. Declared evidence statuses are compared with the independent sources and lines of evidence behind them (a triangulation score). Relations in the graph are tested against dates, geography and each other (a record cannot “predate” something earlier than itself, “correlate” across 20,000 years, or “independently corroborate” with the same two sources). Hypotheses are checked against their own evidence lists and the records they cite. Migration routes must be anchored by records, and dates along a route must run in its direction. Coordinates are tested against land polygons. Coverage is mapped by region and era. Each record also shows its progress through the ten research-workflow phases. These are prompts for review, not verdicts.</p>
  <h2>Standing rules</h2>
  <ul>
    <li>No record is excluded for being controversial, and none is promoted for being interesting. Unconventional sources are treated as sources of hypotheses and leads, never as independent verification.</li>
    <li>A claim of advanced technology needs positive evidence of the technology, not an inability to explain an object.</li>
    <li>Correlation is not causation, similarity is not contact, chronological overlap is not interaction. The evidence graph repeats this on every edge.</li>
    <li>Government acknowledgement that UAP reports exist is not evidence of their origin. An ancient text describing a flying object is evidence that the description exists.</li>
    <li>Genetic ancestry is not culture, language or nationality. Indigenous knowledge is cited with its context, not extracted from it.</li>
    <li>E1 or E2 records must name sources. The data validator (<code>npm run validate</code>) fails the build otherwise.</li>
  </ul>
  <h2>What is in this release</h2>
  <ul>
    <li>{ENTRIES.length} ledger records across 14 categories</li><li>{EVENTS.length} environmental events</li>
    <li>{MIGRATIONS.length} migration and exchange models, including competing ones</li>
    <li>{QUESTIONS.length} open questions with {options} competing explanations</li>
    <li>A research queue of ledger subjects not yet built</li>
  </ul>
  <h2>Shortcuts</h2>
  <ul><li><kbd>Space</kbd> play or pause</li><li><kbd>←</kbd> <kbd>→</kbd> nudge time</li><li><kbd>/</kbd> or <kbd>Ctrl/⌘ K</kbd> search</li><li><kbd>Esc</kbd> close panel</li></ul>
  <h2>Sources of the base map</h2>
  <p>Land: Natural Earth via world-atlas (public domain). Continental shelf: Natural Earth bathymetry, 0 m and 200 m isobaths (public domain), simplified.</p>
  <h2>Roadmap</h2>
  <ul>
    <li>Replace the schematic shelf with regional sea-level reconstructions and real bathymetry (GEBCO), and add ice-sheet extents.</li>
    <li>Move the data into a PostGIS database with a document ingestion pipeline that preserves provenance; add vector search for the research assistant.</li>
    <li>Add the research assistant, restricted to retrievable sources and never able to fabricate citations.</li>
    <li>Populate the queue: work through the P1 subjects first.</li>
  </ul>
</article></div>
</section>
