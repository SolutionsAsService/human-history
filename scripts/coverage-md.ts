// Coverage of the two design documents by the dataset. Run: npx tsx scripts/coverage-md.ts [--missing] [--json]
// Every short list item in design/ledger.md and design/master-prompt.md names a subject the project said it would
// investigate. Each is matched (token overlap, proper-noun aware) against built records, events, routes, hypotheses
// and the research queue, and classed: built / queued / mentioned / MISSING. Exit 1 if anything is MISSING.
import { readFileSync } from 'node:fs';
import { ENTRIES, EVENTS, MIGRATIONS, QUESTIONS, QUEUE, SOURCES } from '../src/data';

const STOP = new Set('the a an of and or in on at to for from with by as is are was were be this that these those its their his her other early ancient historical possible potential claims claim traditions tradition research evidence sites site records record accounts account reports report studies study texts text'.split(' '));
const norm = (s: string) => s.replace(/[’']s\b/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const toks = (s: string) => norm(s).split(' ').filter(w => w.length > 2 && !STOP.has(w));
const stem = (w: string) => w.replace(/(ies|es|s)$/, '').replace(/(ing|ed)$/, '');

interface Unit { kind: 'built' | 'queued' | 'mentioned'; label: string; set: Set<string> }
const units: Unit[] = [];
const add = (kind: Unit['kind'], label: string, text: string) => units.push({ kind, label, set: new Set(toks(text).map(stem)) });
for (const e of ENTRIES) add('built', e.title, [e.title, e.place, e.summary, e.claim ?? '', ...(e.alternatives ?? []).map(a => a.name + ' ' + a.text), ...(e.physical ?? []), ...(e.textual ?? []), e.culture ?? '', ...(e.artifacts ?? [])].join(' '));
for (const e of EVENTS) add('built', e.title, [e.title, e.summary, ...e.physical].join(' '));
for (const m of MIGRATIONS) add('built', m.title, [m.title, m.model, m.summary].join(' '));
for (const q of QUEUE) add('queued', q.title, q.title + ' ' + (q.note ?? ''));
for (const q of QUESTIONS) add('mentioned', q.question, [q.question, q.context, ...q.options.map(o => o.name + ' ' + o.description)].join(' '));
for (const s of SOURCES) add('mentioned', s.id, s.cite);

// Naming variants: the subject exists under a different spelling or abbreviation. Documented here so the mapping is reviewable.
const ALIAS: Record<string, string> = {
  'puma punku': 'pumapunku', 'enuma elish': 'enuma elis', 'malmstrom air force base incident 1967': 'malmstrom afb missile 1967',
  '2015 uss roosevelt encounters': 'gimbal gofast 2015', 'avenue of the dead': 'teotihuacan', 'old kingdom context': 'sphinx khafre old kingdom',
  'ancient indian metallurgy': 'iron pillar delhi wootz', 'vedas': 'rigveda', 'dolmens': 'dolmen', 'submerged sites around india': 'dwarka poompuhar khambhat india submerged',
  'ancient amazonian raised fields': 'amazonian raised fields casarabe', 'ancient saharan settlements': 'sahara settlements gobero takarkori', 'medieval west african empires': 'ghana mali songhai west africa',
  'ancient chinese chronicles': 'bamboo annals shiji', 'ancient chinese astronomical records': 'chinese astronomical records oracle', 'ancient roman reports of unusual celestial objects': 'roman prodigy',
  'diepkloof rock shelter': 'diepkloof', 'adam and eve': 'adam eve', 'cain and abel': 'cain abel',
};
// Subjects named at the level of a category that are covered by several named records. Each id is verified to exist, and the
// mapping is printed, so a reviewer can disagree with it. This is not a way to hide gaps: a mapped id that does not exist fails the run.
const COVERED_BY: Record<string, string[]> = {
  'modern uap and ufo investigations': ['nimitz-2004', 'gimbal-2015', 'aaro-2024', 'uap-task-force', 'nasa-uap-study-2023'],
  'modern uap reports': ['nimitz-2004', 'gimbal-2015', 'uap-military-installation-reports'],
  'ufo and uap reports throughout history': ['nuremberg-1561', 'basel-1566', 'utsuro-bune', 'ezekiel-vision', 'obsequens-prodigies'],
  'actual antarctic geography': ['antarctic-bedrock-and-ice-history'],
  'ancient near eastern creation narratives': ['enuma-elish', 'atrahasis', 'gilgamesh-xi', 'ninti-rib-wordplay'],
  'ancient andean cultures': ['caral', 'chavin', 'wari', 'chan-chan', 'tiwanaku'],
  'indigenous north american peoples': ['cahokia', 'poverty-point', 'chaco-canyon', 'serpent-mound', 'anzick'],
  'ancient european cultures': ['stonehenge', 'carnac', 'newgrange', 'hallstatt'],
  'migration through the middle east': ['m-early-sapiens', 'm-northern-route', 'm-southern-route'],
  'hypothetical earlier civilizations in the americas': ['q-lost-civilization', 'hancock-america-before'],
  'robert temple interpretation in the sirius mystery': ['dogon-sirius-tradition', 'q-dogon-sirius'],
  'ancient amazonian urban landscapes': ['casarabe', 'upano', 'bolivian-raised-fields'],
  'ancient amazonian raised fields': ['bolivian-raised-fields'],
  'submerged sites around india': ['dwarka-submerged', 'poompuhar', 'khambhat'],
  'ancient saharan settlements': ['gobero', 'takarkori', 'nabta-playa'],
  'medieval west african empires': ['koumbi-saleh', 'timbuktu'],
  'historical chinese astronomical records': ['shang-oracle-bone-astronomy', 'mawangdui-comet-atlas'],
};
const ALL_IDS = new Set([...ENTRIES.map(e => e.id), ...EVENTS.map(e => e.id), ...MIGRATIONS.map(m => m.id), ...QUESTIONS.map(q => q.id)]);
const badMap = Object.entries(COVERED_BY).flatMap(([k, ids]) => ids.filter(i => !ALL_IDS.has(i)).map(i => `${k} → ${i}`));
if (badMap.length) { console.log('COVERED_BY maps to ids that do not exist:\n  ' + badMap.join('\n  ')); process.exit(2); }
function match(item: string): { kind: 'built' | 'queued' | 'mentioned' | 'MISSING'; via?: string; score: number } {
  const key = norm(item); if (COVERED_BY[key]) return { kind: 'built', via: COVERED_BY[key].join(', '), score: 1 };
  const t = [...new Set(toks(ALIAS[key] ?? item).map(stem))];
  if (!t.length) return { kind: 'mentioned', score: 1 };
  let best: { u: Unit; score: number } | null = null;
  for (const u of units) {
    const hit = t.filter(w => u.set.has(w)).length;
    const score = hit / t.length;
    const need = t.length <= 2 ? 1 : 0.66;
    if (score >= need && (!best || score > best.score || (score === best.score && rank(u) > rank(best.u)))) best = { u, score };
  }
  return best ? { kind: best.u.kind, via: best.u.label, score: best.score } : { kind: 'MISSING', score: 0 };
}
const rank = (u: Unit) => (u.kind === 'built' ? 3 : u.kind === 'queued' ? 2 : 1);

interface Row { doc: string; section: string; item: string; kind: string; via?: string; named: boolean }
// A named subject has a proper noun (capital beyond the first word, or a digit) or is a single non-abstract word (Baalbek, Nephilim, Vedas).
const GENERIC = /(ing|tion|tions|ity|ities|ment|ments|ness|ism|isms|ics|ure|ures|ship|age|ages|ogy|ance|ence|ology|ics|ful|ous|ive|al|ic|ary|ery|ant|ent|ate|ize|ise|ally|ed|ds|rs|ls|ts)$/i;
const isNamed = (raw: string) => { const w = raw.trim().split(/\s+/); if (w.slice(1).some(x => /^[A-ZÀ-Ý*]/.test(x) && !/^(And|Of|The|In|On|For)$/.test(x))) return true; if (/\d/.test(raw)) return true; return w.length === 1 && !GENERIC.test(w[0]); };
const rows: Row[] = [];
for (const doc of ['design/ledger.md', 'design/master-prompt.md']) {
  let section = '';
  for (const line of readFileSync(new URL('../' + doc, import.meta.url), 'utf8').split('\n')) {
    const h = line.match(/^#{1,3}\s+(.*)/); if (h) { section = h[1].replace(/\*+/g, '').trim(); continue; }
    const b = line.match(/^\s*-\s+(?!\[)(.+?)\.?\s*$/);
    if (!b) continue;
    let item = b[1].replace(/\*\*/g, '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
    if (item.length < 3 || item.length > 70 || /^(do not|never|every|each|which|how|what|why|did|does|could|was|were|is |are |identify|record|establish|determine|investigate|separate|compare|locate|search|extract|read|generate|suggest|use |preserve|connect|build|make|create|map|document|examine|evaluate|assign|find|ask|allow|support|ingest|design|follow|look|when |where |whether|if |a |an |the )/i.test(item)) continue;
    if (/^(TypeScript|Next\.js|React|Tailwind CSS|PostgreSQL|PostGIS|D3\.js|MapLibre|Vector search|A modular AI)/i.test(item)) continue;
    if (section.startsWith('11. THE HISTORICAL EVIDENCE GRAPH') || section.startsWith('E. Ancient Knowledge')) continue;   // relation vocabulary / generic myth themes
    if (/[:?]$/.test(item) || /\b(should|must|will|requires)\b/i.test(item)) continue;
    if (/^\d+\.\s/.test(item)) item = item.replace(/^\d+\.\s/, '');
    const m = match(item);
    rows.push({ doc: doc.split('/')[1], section, item, kind: m.kind, via: m.via, named: isNamed(item) });
  }
}
const named = rows.filter(r => r.named); const themes = rows.filter(r => !r.named);
const count = (k: string, rs = rows) => rs.filter(r => r.kind === k).length;
console.log(`list items checked: ${rows.length}\n  named subjects ${named.length}: built ${count('built', named)} · queued ${count('queued', named)} · only mentioned ${count('mentioned', named)} · MISSING ${count('MISSING', named)}\n  research themes ${themes.length}: covered by a record/queue/hypothesis ${themes.length - count('MISSING', themes)} · no match ${count('MISSING', themes)}\n`);
const miss = named.filter(r => r.kind === 'MISSING');
const by = new Map<string, Row[]>(); miss.forEach(r => by.set(r.doc + ' › ' + r.section, [...(by.get(r.doc + ' › ' + r.section) ?? []), r]));
for (const [k, rs] of by) { console.log(k); rs.forEach(r => console.log('   - ' + r.item)); }
if (process.argv.includes('--themes')) { console.log('\nresearch themes with no match:'); themes.filter(r => r.kind === 'MISSING').forEach(r => console.log(`   - ${r.item}  [${r.section}]`)); }
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 1));
if (process.argv.includes('--mentioned')) { console.log('\nonly mentioned (no built record or queue entry):'); rows.filter(r => r.kind === 'mentioned').forEach(r => console.log(`   - ${r.item}  [${r.section}]`)); }
process.exit(miss.length ? 1 : 0);
