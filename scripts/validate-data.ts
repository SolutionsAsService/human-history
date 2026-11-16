// Data integrity checks. Run: npm run validate
// Enforces the ledger rule "do not assign a high confidence classification without identifying the supporting sources",
// referential integrity across entries/sources/links/hypotheses, and basic geographic and temporal sanity.
import { CULTURES, PASSAGE_BY_ID, PASSAGES, STRANDS, THREADS } from '../src/data/threads';
import { ENTRIES, ENTRY_BY_ID, EVENTS, EVENT_BY_ID, LINKS, MIGRATIONS, QUESTIONS, SOURCE_BY_ID, SOURCES } from '../src/data/index';

const errors: string[] = [];
const warns: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warns.push(m);
const dupes = (ids: string[], what: string) => { const s = new Set<string>(); for (const i of ids) { if (s.has(i)) err(`duplicate ${what} id: ${i}`); s.add(i); } };

dupes(ENTRIES.map(e => e.id), 'entry'); dupes(EVENTS.map(e => e.id), 'event'); dupes(SOURCES.map(s => s.id), 'source');
dupes(MIGRATIONS.map(e => e.id), 'migration'); dupes(QUESTIONS.map(e => e.id), 'question');
for (const e of ENTRIES) if (EVENT_BY_ID[e.id]) err(`id used by both an entry and an event: ${e.id}`);

const checkSrc = (where: string, ids: string[]) => { for (const i of ids) if (!SOURCE_BY_ID[i]) err(`${where}: unknown source "${i}"`); };
const high = (s: string) => s === 'E1' || s === 'E2';

for (const e of ENTRIES) {
  checkSrc(`entry ${e.id}`, e.sources);
  if (e.lat < -90 || e.lat > 90 || e.lon < -180 || e.lon > 180) err(`entry ${e.id}: coordinates out of range`);
  if (e.end < e.start) err(`entry ${e.id}: end before start`);
  if ((high(e.ev) || high(e.interp)) && e.sources.length === 0) err(`entry ${e.id}: E1/E2 classification without sources`);
  if (e.dateKind === 'claimed' && high(e.ev) && e.ev === 'E1') warn(`entry ${e.id}: claimed date with E1 evidence — check the two are not conflated`);
  for (const a of e.altChron ?? []) if (a.source && !SOURCE_BY_ID[a.source]) err(`entry ${e.id}: altChron source "${a.source}" unknown`);
  if (!e.summary || e.summary.length < 40) err(`entry ${e.id}: summary missing or too short`);
}
for (const v of EVENTS) { checkSrc(`event ${v.id}`, v.sources); if (v.end < v.start) err(`event ${v.id}: end before start`); if (high(v.ev) && !v.sources.length) err(`event ${v.id}: E1/E2 without sources`); }
for (const m of MIGRATIONS) {
  checkSrc(`migration ${m.id}`, m.sources);
  if (m.end < m.start) err(`migration ${m.id}: end before start`);
  if (m.path.length < 2) err(`migration ${m.id}: path needs ≥ 2 points`);
  for (const [lon, lat] of m.path) if (lat < -90 || lat > 90 || lon < -180 || lon > 180) err(`migration ${m.id}: coordinate out of range`);
  if ((high(m.ev) || high(m.interp)) && !m.sources.length) err(`migration ${m.id}: E1/E2 without sources`);
}
const node = (id: string) => ENTRY_BY_ID[id] || EVENT_BY_ID[id];
LINKS.forEach((l, i) => {
  if (!node(l.a)) err(`link #${i}: unknown node a="${l.a}"`);
  if (!node(l.b)) err(`link #${i}: unknown node b="${l.b}"`);
  if (l.a === l.b) err(`link #${i}: self link`);
  checkSrc(`link ${l.a}→${l.b}`, l.src);
  if (l.conf === 'high' && l.src.length === 0 && ['supports', 'contradicts', 'independently_corroborates', 'derived_from'].includes(l.rel)) warn(`link ${l.a}→${l.b} (${l.rel}) is high confidence without sources`);
});
for (const q of QUESTIONS) {
  dupes(q.options.map(o => o.id), `option in ${q.id}`);
  if (q.options.length < 2) err(`question ${q.id}: needs at least two competing options`);
  for (const o of q.options) {
    checkSrc(`option ${o.id}`, o.sources);
    for (const en of o.entries ?? []) if (!ENTRY_BY_ID[en]) err(`option ${o.id}: unknown entry "${en}"`);
    if (high(o.status) && !o.sources.length) err(`option ${o.id}: E1/E2 without sources`);
  }
}
// Threads: every strand needs a source, a known culture at each end, and an honest directness.
dupes(CULTURES.map(c => c.id), 'culture'); dupes(STRANDS.map(s => s.id), 'strand'); dupes(THREADS.map(s => s.id), 'thread');
const CUL = new Set(CULTURES.map(c => c.id)), THR = new Set(THREADS.map(t => t.id));
for (const s of STRANDS) {
  checkSrc(`strand ${s.id}`, s.src);
  if (!CUL.has(s.from)) err(`strand ${s.id}: unknown culture from="${s.from}"`);
  if (!CUL.has(s.to)) err(`strand ${s.id}: unknown culture to="${s.to}"`);
  if (s.from === s.to) err(`strand ${s.id}: from and to are the same culture`);
  if (!THR.has(s.thread)) err(`strand ${s.id}: unknown thread "${s.thread}"`);
  if (s.end < s.start) err(`strand ${s.id}: end before start`);
  if (!s.src.length) err(`strand ${s.id}: no source — a resemblance is not a strand`);
  if (s.directness === 'documented' && s.src.length < 1) err(`strand ${s.id}: documented without a source`);
  if (s.directness === 'debated' && !s.against.length) err(`strand ${s.id}: debated but records nothing against`);
  if (s.directness === 'documented' && (s.status === 'E5' || s.status === 'E6' || s.status === 'E7' || s.status === 'E8')) warn(`strand ${s.id}: documented, but graded ${s.status} — check the two agree`);
  if (s.directness === 'inferred' && (s.status === 'E1')) warn(`strand ${s.id}: inferred but graded E1`);
  for (const en of s.entries ?? []) if (!ENTRY_BY_ID[en]) err(`strand ${s.id}: unknown entry "${en}"`);
  for (const pid of s.passages ?? []) if (!PASSAGE_BY_ID[pid]) err(`strand ${s.id}: unknown passage "${pid}"`);
}
for (const p of PASSAGES) { if (!SOURCE_BY_ID[p.src]) err(`passage ${p.id}: unknown source "${p.src}"`); if (!p.compBasis) err(`passage ${p.id}: composition date has no basis`); }
for (const c of CULTURES) { if (c.end < c.start) err(`culture ${c.id}: end before start`); for (const en of c.entries ?? []) if (!ENTRY_BY_ID[en]) err(`culture ${c.id}: unknown entry "${en}"`); }
const idle = CULTURES.filter(c => !STRANDS.some(s => s.from === c.id || s.to === c.id)).map(c => c.id);
if (idle.length) warn(`cultures with no strands: ${idle.join(', ')}`);
// Isolated entries are a smell for a graph that is meant to connect disciplines.
const linked = new Set<string>(); LINKS.forEach(l => { linked.add(l.a); linked.add(l.b); });
const orphans = ENTRIES.filter(e => !linked.has(e.id)).map(e => e.id);
if (orphans.length) warn(`${orphans.length} entries have no graph links yet: ${orphans.join(', ')}`);
const unused = SOURCES.filter(s => !ENTRIES.some(e => e.sources.includes(s.id)) && !EVENTS.some(e => e.sources.includes(s.id)) && !MIGRATIONS.some(e => e.sources.includes(s.id)) && !STRANDS.some(x => x.src.includes(s.id)) && !QUESTIONS.some(q => q.options.some(o => o.sources.includes(s.id))) && !LINKS.some(l => l.src.includes(s.id)));
if (unused.length) warn(`unused sources: ${unused.map(s => s.id).join(', ')}`);

console.log(`cultures ${CULTURES.length} · threads ${THREADS.length} · strands ${STRANDS.length}`);
console.log(`entries ${ENTRIES.length} · events ${EVENTS.length} · migrations ${MIGRATIONS.length} · links ${LINKS.length} · questions ${QUESTIONS.length} · sources ${SOURCES.length}`);
for (const w of warns) console.log('WARN ', w);
for (const e of errors) console.log('ERROR', e);
if (errors.length) { console.log(`\n${errors.length} error(s)`); process.exit(1); }
console.log('\nvalidation passed');
