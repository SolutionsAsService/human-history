// Cross-table evidence audit. Pure functions over the dataset: no DOM, runs in Node (scripts/audit.ts) and the browser.
//
// The point is to make the evidence tables check each other, in the spirit of the master prompt:
//   - an interpretation may not look stronger than the evidence under it (§2.3, ledger §2)
//   - high classifications need sources that are independent and of adequate quality (ledger §2)
//   - relations in the evidence graph must be consistent with dates, geography and each other (§11)
//   - hypotheses must be consistent with the entries they cite and with their own listed evidence (§12)
//   - migration routes must be anchored by records, and the order of dates along a route must make sense (§9)
//   - the research workflow phases (§14) are measured per record, not asserted
//   - gaps in coverage by region and era are reported (§10, §18)

import * as d3 from 'd3';
import type { Entry, EnvEvent, Link, Migration, Question, Source, Status } from '../types';
import { ENTRIES, ENTRY_BY_ID, EVENTS, EVENT_BY_ID, LINKS, MIGRATIONS, QUESTIONS, SOURCE_BY_ID } from '../data';
import { ANCHORS, TIME_MIN, yearToPos, seaLevel } from './time';

export type Severity = 'error' | 'warn' | 'info';
export interface Finding { id: string; rule: string; sev: Severity; ids: string[]; msg: string; fix?: string }

export const RULES: Record<string, { title: string; desc: string }> = {
  'status-order': { title: 'Interpretation stronger than its evidence', desc: 'The headline interpretation is classified better than the evidence it rests on.' },
  'overclaim': { title: 'Classification exceeds source support', desc: 'The triangulation score from independent, reliable sources is below what the declared status needs.' },
  'single-source': { title: 'High status resting on one source', desc: 'E1/E2 classifications should be supported by more than one independent source.' },
  'alt-only': { title: 'High status resting only on alternative or low-reliability sources', desc: 'Alternative sources are leads, not verification.' },
  'date-order': { title: 'Relation contradicts the dates', desc: 'predates/postdates/derived_from/potentially_influenced must respect the chronology of both ends.' },
  'date-gap': { title: 'Correlation across a large time gap', desc: 'correlates_with links should overlap or be close in time.' },
  'geo-distance': { title: 'Geographic association across a large distance', desc: 'geographically_associated_with should be local.' },
  'rel-conflict': { title: 'Conflicting relations between the same pair', desc: 'The same two records are linked by incompatible relations.' },
  'rel-duplicate': { title: 'Duplicate relation', desc: 'The same relation is listed more than once.' },
  'weak-support': { title: 'Support from an unsupported claim', desc: 'A claim classified E7/E8 is used as support for another record.' },
  'not-independent': { title: 'Corroboration is not independent', desc: 'Two records said to corroborate each other share most of their sources.' },
  'tension': { title: 'Two well-supported claims contradict', desc: 'Check which claim each end of the edge refers to.' },
  'hyp-status': { title: 'Hypothesis status vs its listed evidence', desc: 'The status of an option is out of line with the evidence listed for and against it.' },
  'hyp-falsifiable': { title: 'No falsifier recorded', desc: 'An option in the E3–E6 range has no way listed to test it.' },
  'cross-table': { title: 'Hypothesis vs entry disagreement', desc: 'An option and a record it cites are classified in opposite directions.' },
  'geo-sea': { title: 'Coordinates fall in the sea', desc: 'A land record has coordinates outside any land polygon: likely a typo.' },
  'geo-dup': { title: 'Identical coordinates', desc: 'Two records share exactly the same coordinates.' },
  'source-after': { title: 'Source published before the event', desc: 'A source dated earlier than the thing it is cited for.' },
  'claimed-high': { title: 'Claimed date but strong interpretation', desc: 'A date marked "claimed" with a headline interpretation of E1/E2.' },
  'contested-balance': { title: 'Contested record without a counter-view', desc: 'A record in the E5–E8 range lacks recorded contradicting evidence.' },
  'route-anchor': { title: 'Route not anchored by any record', desc: 'A migration route classified E1–E3 has no record within range of its path and time.' },
  'route-order': { title: 'Dates run against the route direction', desc: 'Records along the route are older toward its end than its start.' },
  'route-speed': { title: 'Implausible speed along the route', desc: 'The implied speed of the movement is extreme.' },
  'orphan': { title: 'No graph links', desc: 'The record is not connected to anything.' },
  'phase': { title: 'Thin research record', desc: 'The record completes few of the ten workflow phases.' },
  'field': { title: 'Missing field for its category', desc: 'The category implies evidence fields that are empty.' },
  'source-unverified': { title: 'Unverified bibliography', desc: 'Most sources behind this record are still unverified.' },
};

// ------------------------------------------------------------------ helpers
const RANK: Record<Status, number> = { E1: 1, E2: 2, E3: 3, E4: 4, E5: 5, E6: 6, E7: 7, E8: 8 };
const mid = (a: { start: number; end: number }) => (a.start + a.end) / 2;
const REL_W: Record<Source['reliability'], number> = { high: 1, medium: 0.7, mixed: 0.5, low: 0.2, unassessed: 0.3 };
const KIND_W: Record<Source['kind'], number> = { primary: 1, secondary: 0.8, official: 0.7, skeptical: 0.8, alternative: 0.4 };
export const sourceWeight = (s: Source) => REL_W[s.reliability] * KIND_W[s.kind];

function km(a: [number, number], b: [number, number]) { return d3.geoDistance(a, b) * 6371; }
const nodeOf = (id: string): (Entry | EnvEvent) | undefined => ENTRY_BY_ID[id] ?? EVENT_BY_ID[id];
const loc = (id: string): [number, number] | null => {
  const e = ENTRY_BY_ID[id]; if (e) return [e.lon, e.lat];
  const v = EVENT_BY_ID[id]; if (v?.lat != null && v.lon != null) return [v.lon, v.lat];
  return null;
};
const isDeep = (n: { start: number }) => n.start < TIME_MIN; // geological-age sentinel records

/** Parse author / year / venue out of a free-text citation when the structured fields are absent. */
export function parseCite(s: Source): { authors: string; year?: number; venue: string } {
  const year = s.year ?? Number((s.cite.match(/\((?:c\. )?(\d{4})(?:[–-]\d{2,4})?[a-z]?\)/) ?? s.cite.match(/\b(1[5-9]\d\d|20[0-2]\d)\b/) ?? [])[1] || NaN) ?? undefined;
  const authors = s.authors ?? s.cite.split(/\s\(|\s—\s|,\s*\d{4}/)[0].replace(/\.$/, '');
  const venue = s.venue ?? (s.cite.match(/\)\s*(?:[^.]*\.\s*)?([A-Z][^.]*(?:Science|Nature|PNAS|Press|Antiquity|Journal|Current|eLife|Archaeology|Review)[^.]*)/)?.[1] ?? '');
  return { authors, year: Number.isFinite(year) ? year : undefined, venue };
}

// ------------------------------------------------------------------ triangulation
export interface Triang {
  score: number;            // weighted independent support
  groups: number;           // distinct source disciplines
  kinds: string[];
  band: Status;             // the best status the score justifies
  declared: Status;
  gap: number;              // declared rank is this many steps better than the band (>0 = overclaim)
  unverified: number;       // share of sources unverified/placeholder
}
const BANDS: [number, Status][] = [[2.6, 'E1'], [1.6, 'E2'], [0.95, 'E3'], [0.5, 'E4'], [0, 'E5']];

const METHOD_FAMILIES: [string, RegExp][] = [
  ['radiocarbon', /radiocarbon|14c|c-14/i], ['U-series', /u-?th|u-series|uranium/i], ['luminescence', /luminescence|osl|\btl\b|thermolum/i], ['ESR', /\besr\b|electron spin/i],
  ['Ar/Ar', /ar\/ar|argon|k-ar|tephra|tuff|ash/i], ['palaeomagnetism', /palaeomag|paleomag|magnetostrat|reversal/i], ['dendrochronology', /dendro|tree-ring/i],
  ['stratigraphy', /stratigraph|context|sequence/i], ['typology', /typolog|architectur|stylistic|palaeograph|paleograph|inscription|epigraph/i], ['historical record', /text|chronicle|king list|annal|logbook|colophon|documentary|contemporary/i],
  ['ice-core', /ice[- ]core|sulphate/i], ['seismic/survey', /seismic|lidar|survey|sonar|geophys/i],
];
/** Independent lines of evidence: those declared on the record plus the distinct evidence types and dating-method families it actually records. */
export function linesOf(e: Entry): string[] {
  const s = new Set<string>(e.lines ?? []);
  if (e.physical?.length) s.add('physical'); if (e.textual?.length) s.add('textual'); if (e.genetic?.length) s.add('genetic');
  const m = `${e.datingMethod ?? ''} ${e.dateNote ?? ''}`;
  for (const [n, re] of METHOD_FAMILIES) if (re.test(m)) s.add(n);
  return [...s];
}

export function triangulate(e: Entry): Triang {
  const srcs = e.sources.map(i => SOURCE_BY_ID[i]).filter(Boolean);
  const byDisc = new Map<string, number>();
  for (const s of srcs) byDisc.set(s.discipline, Math.max(byDisc.get(s.discipline) ?? 0, sourceWeight(s)));
  // sources of the same discipline add only partially: they are rarely independent
  const sameDisc = srcs.length - byDisc.size;
  let score = [...byDisc.values()].reduce((a, b) => a + b, 0) + Math.min(sameDisc, 2) * 0.25;
  score += Math.min(4, Math.max(0, linesOf(e).length - 1)) * 0.5;   // the first line is the source itself; each further independent line adds weight
  const cross = new Set<string>();
  for (const l of LINKS) {
    if (!['supports', 'independently_corroborates'].includes(l.rel)) continue;
    const other = l.a === e.id ? l.b : l.b === e.id ? l.a : null;
    if (other) { const o = ENTRY_BY_ID[other]; cross.add(o ? o.cat : 'event'); }
  }
  score += Math.min(2, cross.size) * 0.25;
  const band = BANDS.find(([min]) => score >= min)![1];
  const unv = srcs.length ? srcs.filter(s => s.placeholder || s.reliability === 'unassessed').length / srcs.length : 0;
  return { score, groups: byDisc.size, kinds: [...new Set(srcs.map(s => s.kind))], band, declared: e.ev, gap: RANK[band] - RANK[e.ev], unverified: unv };
}

// ------------------------------------------------------------------ workflow phases (master prompt §14)
export const PHASES = ['Question', 'Evidence', 'Chronology', 'Provenance', 'Interpretations', 'Cross-discipline', 'Hypothesis tests', 'Uncertainty', 'Model links', 'Report-ready'] as const;
export interface PhaseReport { done: boolean[]; pct: number; missing: string[] }

export function phasesOf(e: Entry): PhaseReport {
  const srcs = e.sources.map(i => SOURCE_BY_ID[i]).filter(Boolean);
  const deg = LINKS.filter(l => l.a === e.id || l.b === e.id).length;
  const catSet = new Set<string>();
  for (const l of LINKS) { const o = l.a === e.id ? l.b : l.b === e.id ? l.a : null; if (o && ENTRY_BY_ID[o]) catSet.add(ENTRY_BY_ID[o].cat); }
  const inQ = QUESTIONS.some(q => q.options.some(o => o.entries?.includes(e.id)));
  const d: boolean[] = [
    e.summary.length >= 40 && !!(e.claim || e.unresolved?.length || e.purpose),
    !!(e.physical?.length || e.textual?.length || e.genetic?.length),
    !!(e.datingMethod && (e.dateKind === 'measured' || e.altChron?.length || e.dateNote)),
    !!(e.discovered || srcs.some(s => s.kind === 'primary')),
    !!(e.mainstream && (e.alternatives?.length ?? 0) >= 1),
    new Set(srcs.map(s => s.discipline)).size >= 2 || linesOf(e).length >= 2 || catSet.size >= 2,
    !!(e.predictions?.length || inQ),
    !!(e.unresolved?.length && (e.against?.length ?? 0) >= 1),
    deg >= 1,
    false,
  ];
  d[9] = d.slice(0, 9).every(Boolean) && srcs.length >= 2;
  const missing = PHASES.filter((_, i) => !d[i]);
  return { done: d, pct: Math.round((d.filter(Boolean).length / d.length) * 100), missing: [...missing] };
}

// ------------------------------------------------------------------ derived context (master prompt §10)
export interface Context {
  contemporaries: { id: string; km: number; overlap: number }[];
  events: string[];
  routes: string[];
  seaM: number | null;
  nearbyDeep: string[];
}
export function contextOf(e: Entry): Context {
  const self: [number, number] = [e.lon, e.lat];
  const radius = e.start < -100000 ? 4500 : e.start < -10000 ? 3000 : 1800;
  const contemporaries: Context['contemporaries'] = [];
  for (const o of ENTRIES) {
    if (o.id === e.id || isDeep(o)) continue;
    const ov = Math.min(e.end, o.end) - Math.max(e.start, o.start);
    const gap = ov >= 0 ? 0 : -ov;
    const tol = Math.max(200, 0.1 * Math.max(e.end - e.start, o.end - o.start));
    if (gap > tol) continue;
    const d = km(self, [o.lon, o.lat]);
    if (d <= radius) contemporaries.push({ id: o.id, km: Math.round(d), overlap: Math.max(0, ov) });
  }
  contemporaries.sort((a, b) => a.km - b.km);
  const events = EVENTS.filter(v => Math.min(e.end, v.end) - Math.max(e.start, v.start) >= -300 && (v.lat == null || v.lon == null || km(self, [v.lon, v.lat]) < 6000)).map(v => v.id);
  const routes = MIGRATIONS.filter(m => Math.min(e.end, m.end) - Math.max(e.start, m.start) >= 0 && routeDistance(m, self) < 700).map(m => m.id);
  const s = seaLevel(e.start);
  return { contemporaries: contemporaries.slice(0, 12), events, routes, seaM: s.grade === 'none' ? null : Math.round(s.m), nearbyDeep: [] };
}

// ------------------------------------------------------------------ routes
const denseCache = new Map<string, [number, number][]>();
function dense(m: Migration): [number, number][] {
  const c = denseCache.get(m.id); if (c) return c;
  const pts: [number, number][] = [];
  for (let i = 0; i < m.path.length - 1; i++) {
    const a = m.path[i], b = m.path[i + 1]; const it = d3.geoInterpolate(a, b); const n = Math.max(2, Math.ceil(km(a, b) / 100));
    for (let j = i === 0 ? 0 : 1; j <= n; j++) pts.push(it(j / n) as [number, number]);
  }
  denseCache.set(m.id, pts); return pts;
}
export function routeDistance(m: Migration, p: [number, number]): number { return nearest(m, p).km; }
function nearest(m: Migration, p: [number, number]) {
  const pts = dense(m); let best = Infinity, idx = 0;
  for (let i = 0; i < pts.length; i++) { const d = km(p, pts[i]); if (d < best) { best = d; idx = i; } }
  return { km: best, frac: pts.length > 1 ? idx / (pts.length - 1) : 0 };
}
export function routeLength(m: Migration) { const pts = dense(m); let L = 0; for (let i = 1; i < pts.length; i++) L += km(pts[i - 1], pts[i]); return L; }
export interface Anchor { id: string; km: number; frac: number; inTime: boolean }
export function anchorsOf(m: Migration): Anchor[] {
  const out: Anchor[] = [];
  const pad = Math.max(1500, (m.end - m.start) * 0.35);
  for (const e of ENTRIES) {
    if (isDeep(e)) continue;
    const n = nearest(m, [e.lon, e.lat]);
    if (n.km > 650) continue;
    const inTime = e.end >= m.start - pad && e.start <= m.end + pad;
    if (inTime) out.push({ id: e.id, km: Math.round(n.km), frac: n.frac, inTime });
  }
  return out.sort((a, b) => a.frac - b.frac);
}
function spearman(xs: number[], ys: number[]) {
  const rank = (a: number[]) => { const s = [...a].map((v, i) => [v, i] as const).sort((p, q) => p[0] - q[0]); const r = new Array(a.length); s.forEach(([, i], k) => (r[i] = k)); return r as number[]; };
  const rx = rank(xs), ry = rank(ys); const n = xs.length; const mx = (n - 1) / 2;
  let num = 0, dx = 0, dy = 0; for (let i = 0; i < n; i++) { num += (rx[i] - mx) * (ry[i] - mx); dx += (rx[i] - mx) ** 2; dy += (ry[i] - mx) ** 2; }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

// ------------------------------------------------------------------ coverage
export const REGIONS: [string, (lat: number, lon: number) => boolean][] = [
  ['Africa', (la, lo) => lo > -20 && lo < 52 && la < 36 && la > -36 && !(lo > 34 && la > 12 && la < 32 && lo < 44 && false)],
  ['Europe', (la, lo) => la >= 36 && lo > -12 && lo < 40 && la < 72],
  ['West & Central Asia', (la, lo) => lo >= 34 && lo < 90 && la >= 12 && la < 60],
  ['South Asia', (la, lo) => lo >= 60 && lo < 92 && la >= 5 && la < 36],
  ['East Asia', (la, lo) => lo >= 90 && lo < 150 && la >= 20 && la < 60],
  ['SE Asia & Australasia', (la, lo) => lo >= 90 && lo < 180 && la < 20],
  ['North America', (la, lo) => lo < -50 && la >= 15],
  ['Mesoamerica & S. America', (la, lo) => lo < -30 && la < 15 && lo > -95],
  ['Pacific & Atlantic islands', (la, lo) => (lo < -95 && la < 15) || lo >= 150],
];
export const regionOf = (lat: number, lon: number): string => {
  // order matters: more specific first
  const order = ['South Asia', 'East Asia', 'SE Asia & Australasia', 'West & Central Asia', 'Europe', 'North America', 'Mesoamerica & S. America', 'Africa', 'Pacific & Atlantic islands'];
  for (const n of order) if (REGIONS.find(r => r[0] === n)![1](lat, lon)) return n;
  return 'Other';
};
export const ERAS: [string, number, number][] = [
  ['> 300 ka', -3_600_000, -300_000], ['300–50 ka', -300_000, -50_000], ['50–12 ka', -50_000, -12_000],
  ['12–6 ka', -12_000, -6_000], ['6–3 ka BCE', -6_000, -3_000], ['3000–1 BCE', -3_000, 0], ['1–1000 CE', 0, 1_000], ['1000 CE–', 1_000, 2_100],
];
export interface Coverage { regions: string[]; eras: string[]; cells: number[][]; byCat: Record<string, number>; thin: string[] }
export function coverage(): Coverage {
  const regions = ['Africa', 'Europe', 'West & Central Asia', 'South Asia', 'East Asia', 'SE Asia & Australasia', 'North America', 'Mesoamerica & S. America', 'Pacific & Atlantic islands'];
  const cells = regions.map(() => ERAS.map(() => 0));
  const byCat: Record<string, number> = {};
  for (const e of ENTRIES) {
    byCat[e.cat] = (byCat[e.cat] ?? 0) + 1;
    if (isDeep(e) || e.cat === 'uap' || e.cat === 'esoteric') continue;
    const r = regions.indexOf(regionOf(e.lat, e.lon)); if (r < 0) continue;
    ERAS.forEach(([, a, b], k) => { if (e.start < b && e.end >= a) cells[r][k]++; });
  }
  const thin: string[] = [];
  regions.forEach((r, i) => ERAS.forEach(([n], k) => { if (cells[i][k] === 0 && plausibleCell(r, k)) thin.push(`${r} · ${n}`); }));
  return { regions, eras: ERAS.map(e => e[0]), cells, byCat, thin };
}
// where a zero cell is genuinely informative (not "people were not there yet")
function plausibleCell(region: string, era: number) {
  if (era <= 1) return region === 'Africa' || region === 'West & Central Asia' || region === 'East Asia' || region === 'SE Asia & Australasia' || region === 'South Asia' ? era === 1 : false;
  if (era === 2) return !['North America', 'Mesoamerica & S. America', 'Pacific & Atlantic islands'].includes(region);
  if (era === 3 || era === 4) return !['Pacific & Atlantic islands'].includes(region);
  return true;
}

// ------------------------------------------------------------------ land lookup (for the sea-coordinate check)
export function landIndex(landFeature: any) {
  const polys: { f: any; b: [[number, number], [number, number]] }[] = [];
  const geoms: any[] = landFeature.features ? landFeature.features.map((f: any) => f.geometry) : [landFeature.geometry ?? landFeature];
  const list: any[] = geoms.flatMap(g => (g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]));
  for (const c of list) { const f = { type: 'Polygon', coordinates: c } as any; polys.push({ f, b: d3.geoBounds(f) as any }); }
  const inLon = (lon: number, b: [[number, number], [number, number]], pad: number) => (b[0][0] <= b[1][0] ? lon >= b[0][0] - pad && lon <= b[1][0] + pad : lon >= b[0][0] - pad || lon <= b[1][0] + pad);
  const inLand = (lon: number, lat: number, pad = 0) => polys.some(({ f, b }) => inLon(lon, b, pad) && lat >= b[0][1] - pad && lat <= b[1][1] + pad && d3.geoContains(f, [lon, lat]));
  return (lon: number, lat: number) => {
    if (inLand(lon, lat)) return true;
    for (const [dx, dy] of [[0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35], [0.25, 0.25], [-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25]]) if (inLand(lon + dx, lat + dy, 0.4)) return true;
    return false;
  };
}

// ------------------------------------------------------------------ the audit
export interface AuditResult {
  findings: Finding[];
  triang: Record<string, Triang>;
  phases: Record<string, PhaseReport>;
  anchors: Record<string, Anchor[]>;
  coverage: Coverage;
  stats: { entries: number; links: number; components: number; crossCategoryLinks: number; avgPhasePct: number; reportReady: number; unverifiedShare: number };
}

export function runAudit(opts: { land?: any } = {}): AuditResult {
  const F: Finding[] = [];
  let n = 0;
  const add = (rule: string, sev: Severity, ids: string[], msg: string, fix?: string) => F.push({ id: `${rule}#${n++}`, rule, sev, ids, msg, fix });

  const triang: Record<string, Triang> = {}, phases: Record<string, PhaseReport> = {}, anchors: Record<string, Anchor[]> = {};

  // ---- per-entry checks
  for (const e of ENTRIES) {
    const t = triang[e.id] = triangulate(e);
    phases[e.id] = phasesOf(e);
    const srcs = e.sources.map(i => SOURCE_BY_ID[i]).filter(Boolean);

    if (RANK[e.interp] < RANK[e.ev] && !(e.ev === 'E5' && e.interp === 'E5'))
      add('status-order', 'warn', [e.id], `${e.title}: interpretation ${e.interp} is classified better than the evidence ${e.ev}.`, 'Lower the interpretation status or raise the evidence status with sources.');

    if (RANK[e.ev] <= 2 || RANK[e.interp] <= 2) {
      if (srcs.length === 1) add('single-source', 'info', [e.id], `${e.title} is ${e.ev}/${e.interp} but rests on a single source (${srcs[0].id}).`, 'Add an independent source of a different kind or discipline.');
      if (srcs.length && (RANK[e.interp] <= 3 || (RANK[e.ev] <= 2 && RANK[e.interp] <= 4)) && srcs.every(s => s.kind === 'alternative' || s.reliability === 'low')) add('alt-only', 'warn', [e.id], `${e.title} is ${e.ev}/${e.interp} but every source is alternative or low reliability.`, 'Add primary or high-reliability sources, or lower the status.');
    }
    if (t.gap >= 3 || (t.gap >= 2 && RANK[e.ev] <= 1 && t.groups <= 1 && linesOf(e).length < 2)) add('overclaim', 'warn', [e.id], `${e.title}: declared ${e.ev}, but source triangulation (score ${t.score.toFixed(1)}, ${t.groups} discipline${t.groups === 1 ? '' : 's'}) supports about ${t.band}.`, 'Add independent lines of evidence (lines[]) or sources, or lower the status.');
    else if (t.gap >= 1 && RANK[e.ev] <= 2) add('overclaim', 'info', [e.id], `${e.title}: declared ${e.ev}, triangulation supports about ${t.band} (score ${t.score.toFixed(1)}).`, 'Add a second independent line (e.g. dating method, text, genetics).');

    if (e.dateKind === 'claimed' && RANK[e.interp] <= 2) add('claimed-high', 'warn', [e.id], `${e.title}: the date is only claimed but the interpretation is ${e.interp}.`);
    if (RANK[e.interp] >= 5 && !(e.against?.length) && !(e.alternatives?.length)) add('contested-balance', 'warn', [e.id], `${e.title} is ${e.interp} but records no contradicting evidence or alternatives.`, 'Document what contradicts the claim (§2.3: never present speculation as established, and show why).');
    if (e.dateKind === 'measured' && !e.datingMethod && !isDeep(e)) add('field', 'info', [e.id], `${e.title}: a measured date should name its dating method.`);
    if (e.cat === 'text' && !e.textual?.length && !e.mainstream) add('field', 'info', [e.id], `${e.title}: a text record should state the textual evidence (language, manuscripts, earliest source).`);
    if (['origins', 'genetics'].includes(e.cat) && !e.physical?.length && !e.genetic?.length && !e.lines?.length) add('field', 'info', [e.id], `${e.title}: a fossil or DNA record should list physical or genetic evidence.`);
    if (e.cat === 'artifact' && !e.physical?.length && !e.artifacts?.length) add('field', 'info', [e.id], `${e.title}: an artifact record should list its physical evidence (material, context).`);
    if (t.unverified >= 0.6 && srcs.length) add('source-unverified', 'info', [e.id], `${e.title}: ${Math.round(t.unverified * 100)}% of its sources are placeholders or unassessed.`);

    // a source cannot predate what it is cited for
    for (const s of srcs) {
      const p = parseCite(s);
      if (p.year && e.start >= 1800 && p.year < e.start - 1 && s.kind !== 'alternative' && !/later retell|reception/i.test(e.summary)) add('source-after', 'warn', [e.id, s.id], `${e.title} (${e.start}) cites ${s.id} published ${p.year}: before the event.`);
    }
    if (phases[e.id].pct <= 40) add('phase', 'info', [e.id], `${e.title} completes only ${phases[e.id].pct}% of the research workflow (missing: ${phases[e.id].missing.slice(0, 4).join(', ')}).`);
  }

  // ---- sea-coordinate check
  if (opts.land) {
    const inLand = landIndex(opts.land);
    for (const e of ENTRIES) {
      if (e.cat === 'submerged' || isDeep(e) || e.geoKind === 'region') continue;
      if (/ocean|\bsea\b|gulf|strait|bay|offshore|atlantic|pacific|solent|coast off|shelf|channel|wreck|island|atoll|reef|pohnpei|micronesia|malta|bahamas|newfoundland|tonga/i.test(e.place + ' ' + e.title + ' ' + (e.geoNote ?? ''))) continue;
      if (!inLand(e.lon, e.lat)) add('geo-sea', 'warn', [e.id], `${e.title}: (${e.lat}, ${e.lon}) is not on land (${e.place}).`, 'Check the coordinates against the excavation report.');
    }
  }
  const seen = new Map<string, string>();
  for (const e of ENTRIES) { const k = `${e.lat.toFixed(3)},${e.lon.toFixed(3)}`; const o = seen.get(k); if (o) { const a = ENTRY_BY_ID[o]; if (a.cat === e.cat && Math.abs(a.start - e.start) < 500) add('geo-dup', 'info', [o, e.id], `${a.title} and ${e.title} share coordinates (${k}).`); } else seen.set(k, e.id); }

  // ---- links
  const pairKey = (a: string, b: string) => [a, b].sort().join('|');
  const byPair = new Map<string, Link[]>();
  for (const l of LINKS) { const k = pairKey(l.a, l.b); byPair.set(k, [...(byPair.get(k) ?? []), l]); }
  for (const [k, ls] of byPair) {
    const rels = ls.map(l => l.rel);
    const [a, b] = k.split('|');
    if (rels.includes('supports') && rels.includes('contradicts')) add('rel-conflict', 'error', [a, b], `${a} and ${b} are linked by both supports and contradicts.`, 'Decide which claim each edge refers to and split or remove one.');
    if (ls.some(l => l.rel === 'predates') && ls.some(l => l.rel === 'postdates' && l.a === ls.find(x => x.rel === 'predates')!.a)) add('rel-conflict', 'error', [a, b], `${a} / ${b}: predates and postdates in the same direction.`);
    const seenRel = new Set<string>();
    for (const l of ls) { const key = `${l.rel}:${l.a}>${l.b}`; if (seenRel.has(key)) add('rel-duplicate', 'warn', [l.a, l.b], `Duplicate ${l.rel} link ${l.a} → ${l.b}.`); seenRel.add(key); }
    const p1 = ls.find(l => l.rel === 'predates'); const p2 = ls.find(l => l.rel === 'predates' && p1 && l.a === p1.b && l.b === p1.a);
    if (p1 && p2) add('rel-conflict', 'error', [a, b], `${a} and ${b} each "predate" the other.`);
  }
  for (const l of LINKS) {
    const A = nodeOf(l.a), B = nodeOf(l.b); if (!A || !B) continue;
    const da = isDeep(A) || isDeep(B);
    if (!da) {
      const tol = (x: { start: number; end: number }) => Math.max(150, 0.05 * Math.abs(x.end - x.start));
      const gapAB = B.start - A.end, overlap = Math.min(A.end, B.end) - Math.max(A.start, B.start);
      if (l.rel === 'predates' && A.start > B.start + tol(A) + tol(B)) add('date-order', 'error', [l.a, l.b], `"${A.title}" is said to predate "${B.title}" but starts later (${A.start} vs ${B.start}).`, 'Reverse the relation or correct a date.');
      if (l.rel === 'postdates' && A.start < B.start - tol(A) - tol(B)) add('date-order', 'error', [l.a, l.b], `"${A.title}" is said to postdate "${B.title}" but starts earlier (${A.start} vs ${B.start}).`, 'Reverse the relation or correct a date.');
      if (l.rel === 'derived_from' && A.start < B.start - tol(A) - tol(B) - 100 && !('dateKind' in A && (A as Entry).dateKind === 'textual' && false)) add('date-order', 'error', [l.a, l.b], `"${A.title}" is derived from "${B.title}" which begins later (${B.start} vs ${A.start}).`, 'A derivation needs the source to be earlier.');
      if (l.rel === 'potentially_influenced' && A.start > B.end + tol(B) + 200) add('date-order', 'error', [l.a, l.b], `"${A.title}" is said to have influenced "${B.title}", which ended before it began.`, 'Reverse the relation or correct a date.');
      const soft = (x: Entry | EnvEvent) => 'dateKind' in x && ((x as Entry).dateKind === 'claimed' || (x as Entry).dateKind === 'textual' || (x as Entry).cat === 'lostciv');
      if (l.rel === 'correlates_with' && !soft(A) && !soft(B) && overlap < 0 && Math.abs(gapAB) > Math.max(2500, 0.5 * Math.abs(A.end - A.start + B.end - B.start)) && -overlap > 2500) add('date-gap', 'warn', [l.a, l.b], `"${A.title}" and "${B.title}" are said to correlate but are ${Math.round(-overlap).toLocaleString()} years apart.`, 'Use predates/postdates, or justify the correlation.');
    }
    if (l.rel === 'geographically_associated_with') { const pa = loc(l.a), pb = loc(l.b); if (pa && pb && km(pa, pb) > 1500) add('geo-distance', 'warn', [l.a, l.b], `"${A.title}" and "${B.title}" are called geographically associated but are ${Math.round(km(pa, pb)).toLocaleString()} km apart.`); }
    if (l.rel === 'supports') { const x = ENTRY_BY_ID[l.a]; if (x && RANK[x.interp] >= 7 && RANK[x.ev] >= 5) add('weak-support', 'warn', [l.a, l.b], `${x.title} (${x.interp}) is used as support for ${B.title}.`, 'Support should come from evidence, not an unsupported claim.'); }
    if (l.rel === 'independently_corroborates') {
      const sa = new Set((ENTRY_BY_ID[l.a]?.sources ?? EVENT_BY_ID[l.a]?.sources) ?? []), sb = new Set((ENTRY_BY_ID[l.b]?.sources ?? EVENT_BY_ID[l.b]?.sources) ?? []);
      const inter = [...sa].filter(x => sb.has(x)).length; const small = Math.min(sa.size, sb.size);
      if (small > 0 && inter / small >= 0.6) add('not-independent', 'warn', [l.a, l.b], `"${A.title}" and "${B.title}" are said to independently corroborate each other but share ${inter} of ${small} sources.`, 'Corroboration needs independent evidence.');
    }
    if (l.rel === 'contradicts') { const x = ENTRY_BY_ID[l.a], y = ENTRY_BY_ID[l.b]; if (x && y && RANK[x.interp] <= 2 && RANK[y.interp] <= 2) add('tension', 'info', [l.a, l.b], `"${x.title}" (${x.interp}) contradicts "${y.title}" (${y.interp}): two well-supported claims in conflict.`); }
  }

  // ---- hypotheses vs their own lists and vs entries
  for (const q of QUESTIONS) for (const o of q.options) {
    const s = o.sources.map(i => SOURCE_BY_ID[i]).filter(Boolean);
    const sup = o.supports.length, con = o.contradicts.length;
    if (RANK[o.status] <= 2 && !s.some(x => x.reliability === 'high')) add('hyp-status', 'warn', [q.id], `${q.question} → “${o.name}” is ${o.status} without any high-reliability source.`);
    if (RANK[o.status] <= 2 && con > sup) add('hyp-status', 'warn', [q.id], `${q.question} → “${o.name}” is ${o.status} but lists more contradicting (${con}) than supporting (${sup}) evidence.`);
    if (o.status === 'E8' && con === 0) add('hyp-status', 'warn', [q.id], `${q.question} → “${o.name}” is E8 (contradicted) but no contradicting evidence is listed.`, 'E8 needs the contradicting evidence written down.');
    if (RANK[o.status] >= 7 && sup >= 3 && con === 0) add('hyp-status', 'info', [q.id], `${q.question} → “${o.name}” is ${o.status} yet lists ${sup} supporting points and none against.`);
    if (RANK[o.status] >= 3 && RANK[o.status] <= 6 && o.falsifiers.length === 0) add('hyp-falsifiable', 'info', [q.id], `${q.question} → “${o.name}” (${o.status}) has no recorded falsifier.`, 'Say what finding would falsify it.');
    for (const id of o.entries ?? []) {
      const en = ENTRY_BY_ID[id]; if (!en) continue;
      // an entry cited by several competing options is the shared subject of the question, not evidence for one reading
      if (q.options.filter(x => x.entries?.includes(id)).length > 1) continue;
      if (RANK[o.status] <= 2 && RANK[en.interp] >= 7) add('cross-table', 'warn', [q.id, id], `“${o.name}” is ${o.status} but cites ${en.title}, whose interpretation is ${en.interp}.`);
      if (RANK[o.status] >= 7 && RANK[en.interp] <= 2 && en.mainstream && en.mainstream.length > 0 && o.name.toLowerCase().includes('mainstream')) add('cross-table', 'warn', [q.id, id], `“${o.name}” is ${o.status} but ${en.title} is ${en.interp} with the same mainstream reading.`);
    }
  }

  // ---- migrations
  for (const m of MIGRATIONS) {
    const an = anchors[m.id] = anchorsOf(m);
    const L = routeLength(m); const dur = Math.max(1, m.end - m.start);
    if (RANK[m.ev] <= 3 && an.length === 0 && m.ev !== 'E8') add('route-anchor', 'warn', [m.id], `Route “${m.title}” (${m.ev}) has no record within 650 km of its path and within its time window.`, 'Anchor it with the sites or genomes that support it.');
    if (an.length >= 4 && m.ev !== 'E8') {
      const times = an.map(a => mid(ENTRY_BY_ID[a.id])); const rho = spearman(an.map(a => a.frac), times);
      if (rho < -0.6) add('route-order', 'warn', [m.id, ...an.slice(0, 3).map(a => a.id)], `Route “${m.title}”: records along the path get older toward its end (rank correlation ${rho.toFixed(2)}).`, 'Check the direction of the route or the dates of the anchor records.');
    }
    const speed = L / dur; if (m.id && speed > 25 && !/trade|silk|ocean|austronesian|poly|contact|pacific|atlantic/i.test(m.title + m.group)) add('route-speed', 'info', [m.id], `Route “${m.title}” implies ${speed.toFixed(1)} km/yr over ${Math.round(L).toLocaleString()} km.`);
  }

  // ---- orphans, graph structure
  const deg = new Map<string, number>(); LINKS.forEach(l => { deg.set(l.a, (deg.get(l.a) ?? 0) + 1); deg.set(l.b, (deg.get(l.b) ?? 0) + 1); });
  for (const e of ENTRIES) if (!deg.get(e.id)) add('orphan', 'info', [e.id], `${e.title} has no links in the evidence graph.`);
  // components
  const parent = new Map<string, string>(); const find = (x: string): string => { let p = parent.get(x) ?? x; if (p !== x) { p = find(p); parent.set(x, p); } return p; };
  for (const l of LINKS) { parent.set(find(l.a), find(l.b)); }
  const comps = new Set([...ENTRIES.map(e => e.id), ...EVENTS.map(e => e.id)].filter(id => deg.get(id)).map(find)).size;
  const cross = LINKS.filter(l => { const a = ENTRY_BY_ID[l.a], b = ENTRY_BY_ID[l.b]; return a && b && a.cat !== b.cat; }).length;

  const reports = Object.values(phases);
  const unv = SOURCES_UNVERIFIED();
  const sevOrder: Record<Severity, number> = { error: 0, warn: 1, info: 2 };
  F.sort((a, b) => sevOrder[a.sev] - sevOrder[b.sev] || a.rule.localeCompare(b.rule));
  return {
    findings: F, triang, phases, anchors, coverage: coverage(),
    stats: { entries: ENTRIES.length, links: LINKS.length, components: comps, crossCategoryLinks: cross, avgPhasePct: Math.round(reports.reduce((a, r) => a + r.pct, 0) / Math.max(1, reports.length)), reportReady: reports.filter(r => r.done[9]).length, unverifiedShare: unv },
  };
}
function SOURCES_UNVERIFIED() { const all = Object.values(SOURCE_BY_ID); return all.length ? all.filter(s => s.placeholder || s.reliability === 'unassessed').length / all.length : 0; }
void ANCHORS; void yearToPos;

let cached: AuditResult | null = null; let cachedWithLand = false;
/** Shared, memoised audit. Pass the land polygons once to enable the sea-coordinate check. */
export function getAudit(land?: any, force = false): AuditResult {
  if (!cached || force || (land && !cachedWithLand)) { cached = runAudit({ land }); cachedWithLand = !!land; }
  return cached;
}
export const findingsFor = (id: string) => getAudit().findings.filter(f => f.ids.includes(id));
