import { h } from '../lib/dom';
import { STATUS, STATUS_ORDER } from '../lib/classification';
import { ENTRIES, EVENTS, LINKS, MIGRATIONS, QUESTIONS, SOURCES } from '../data';
import { badge } from './ui';

export class AboutView {
  readonly el = h('div', { class: 'about' });
  constructor() {
    const p = (...c: (string | Node)[]) => h('p', null, ...c);
    this.el.append(h('article', null,
      h('h1', null, 'Human History'),
      h('p', { class: 'lead' }, 'A dynamic evidence map of the human past. It follows the evidence and the logic wherever they lead, in the mainstream, in the alternatives, and in the gaps, and it is built so that no explanation can quietly turn into a fact.'),
      h('div', { class: 'warn' }, h('b', null, 'Data honesty. '), 'This is the first build. The ', String(ENTRIES.length), ' records, ', String(SOURCES.length), ' bibliography entries and ', String(LINKS.length), ' graph links were written from recall to seed the system, not copied from the originals. Dates, coordinates and citations are leads that must be checked against the primary report before anything is relied on. Records marked “unverified” or “citation to locate” say so, and entries flagged with approximate coordinates need a survey check. Corrections are the point of the ledger.'),
      h('h2', null, 'How to read the map'),
      h('ul', null,
        h('li', null, 'Move the time slider (or press Space to play). Markers appear when their date range begins, stay bright while it lasts, and fade to ghosts afterwards. Uncertain dates are ranges, and competing chronologies are shown together on the timeline when a record is selected.'),
        h('li', null, 'The slider is not linear: each of the eleven intervals gets the same width so that the last 3,000 years do not vanish.'),
        h('li', null, 'The sand-coloured shelf is a ', h('b', null, 'schematic'), ' of exposed continental shelf: the 200 m isobath tinted in proportion to global sea level. It shows where land was lost, not a reconstruction of ancient coastlines. Regional relative sea level differs by tens of metres.'),
        h('li', null, 'Migration routes are schematic polylines. They show order, direction and competing models, not surveyed paths. Contradicted models are drawn so that you can see what the evidence rules out.'),
        h('li', null, 'Select a record to see its two classifications, dating, evidence, every interpretation, what supports and what contradicts it, what would settle it, its connections and its sources. Compare lets you swipe between two moments.')),
      h('h2', null, 'Two classifications, always separate'),
      p('Every record has the reliability of the underlying evidence and the reliability of the proposed interpretation. Göbekli Tepe is an established site (E1) while the claim that it is the work of a lost advanced civilization is unsupported (E7). The ledger scale:'),
      h('div', { class: 'scale' }, STATUS_ORDER.map(s => h('div', null, badge(s), h('span', null, STATUS[s].desc)))),
      h('h2', null, 'The audit: tables that check each other'),
      h('p', null, 'The Audit tab runs algorithms over the whole dataset. Declared evidence statuses are compared with the independent sources and lines of evidence behind them (a triangulation score). Relations in the graph are tested against dates, geography and each other (a record cannot “predate” something earlier than itself, “correlate” across 20,000 years, or “independently corroborate” with the same two sources). Hypotheses are checked against their own evidence lists and the records they cite. Migration routes must be anchored by records, and dates along a route must run in its direction. Coordinates are tested against land polygons. Coverage is mapped by region and era. Each record also shows its progress through the ten research-workflow phases. These are prompts for review, not verdicts.'),
      h('h2', null, 'Standing rules'),
      h('ul', null,
        h('li', null, 'No record is excluded for being controversial, and none is promoted for being interesting. Unconventional sources are treated as sources of hypotheses and leads, never as independent verification.'),
        h('li', null, 'A claim of advanced technology needs positive evidence of the technology, not an inability to explain an object.'),
        h('li', null, 'Correlation is not causation, similarity is not contact, chronological overlap is not interaction. The evidence graph repeats this on every edge.'),
        h('li', null, 'Government acknowledgement that UAP reports exist is not evidence of their origin. An ancient text describing a flying object is evidence that the description exists.'),
        h('li', null, 'Genetic ancestry is not culture, language or nationality. Indigenous knowledge is cited with its context, not extracted from it.'),
        h('li', null, 'E1 or E2 records must name sources. The data validator (', h('code', null, 'npm run validate'), ') fails the build otherwise.')),
      h('h2', null, 'What is in this release'),
      h('ul', null, h('li', null, `${ENTRIES.length} ledger records across 14 categories`), h('li', null, `${EVENTS.length} environmental events`), h('li', null, `${MIGRATIONS.length} migration and exchange models, including competing ones`), h('li', null, `${QUESTIONS.length} open questions with ${QUESTIONS.reduce((n, q) => n + q.options.length, 0)} competing explanations`), h('li', null, 'A research queue of ledger subjects not yet built')),
      h('h2', null, 'Shortcuts'),
      h('ul', null, h('li', null, h('kbd', null, 'Space'), ' play or pause'), h('li', null, h('kbd', null, '←'), ' ', h('kbd', null, '→'), ' nudge time'), h('li', null, h('kbd', null, '/'), ' or ', h('kbd', null, 'Ctrl/⌘ K'), ' search'), h('li', null, h('kbd', null, 'Esc'), ' close panel')),
      h('h2', null, 'Sources of the base map'),
      p('Land: Natural Earth via world-atlas (public domain). Continental shelf: Natural Earth bathymetry, 0 m and 200 m isobaths (public domain), simplified.'),
      h('h2', null, 'Roadmap'),
      h('ul', null,
        h('li', null, 'Replace the schematic shelf with regional sea-level reconstructions and real bathymetry (GEBCO), and add ice-sheet extents.'),
        h('li', null, 'Move the data into a PostGIS database with a document ingestion pipeline that preserves provenance; add vector search for the research assistant.'),
        h('li', null, 'Add the research assistant, restricted to retrievable sources and never able to fabricate citations.'),
        h('li', null, 'Populate the queue: work through the P1 subjects first.'))));
  }
}
