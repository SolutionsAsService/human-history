// Shapes the evidence data for the PyTorch pipeline in ml/. Run: npm run export:ml  ->  ml/data/dataset.json
// The exporter reuses the app's own logic (slider-space dates, regions, evidence lines, triangulation) so the Python side never
// re-implements it. Fields that would leak a label into a feature are NOT pre-mixed: statuses are exported as plain labels and the
// Python feature builders decide, per task, which of them an input may see.
import { mkdirSync, writeFileSync } from 'node:fs';
import { ENTRIES, EVENTS, LINKS, MIGRATIONS, QUESTIONS, SOURCES, SOURCE_BY_ID } from '../src/data';
import { linesOf, phasesOf, regionOf, triangulate } from '../src/lib/audit';
import { TIME_MIN, yearToPos } from '../src/lib/time';

const out = {
  meta: { generated: new Date().toISOString().slice(0, 10), entries: ENTRIES.length, events: EVENTS.length, links: LINKS.length, sources: SOURCES.length, note: 'Derived from src/data. Statuses are the authors\' own judgements: a model trained on them learns those habits, not the truth about the past.' },
  nodes: [
    ...ENTRIES.map(e => {
      const srcs = e.sources.map(i => SOURCE_BY_ID[i]).filter(Boolean);
      const t = triangulate(e);
      return {
        id: e.id, kind: 'entry', title: e.title, cat: e.cat, priority: e.priority, place: e.place, lat: e.lat, lon: e.lon, region: regionOf(e.lat, e.lon),
        start: e.start, end: e.end, deep: e.start < TIME_MIN, pos0: yearToPos(e.start), pos1: yearToPos(e.end),
        dateKind: e.dateKind, dateConfidence: e.dateConfidence, hasAltChron: !!e.altChron?.length, hasDatingMethod: !!e.datingMethod,
        ev: e.ev, interp: e.interp,
        // text the model may read about the record: deliberately excludes the alternatives (a prediction target) and the statuses
        text: [e.title, e.place, e.summary, e.claim ?? '', e.mainstream ?? '', e.culture ?? '', e.purpose ?? '', e.environment ?? '', ...(e.physical ?? []), ...(e.textual ?? []), ...(e.genetic ?? []), ...(e.artifacts ?? [])].join(' . '),
        textForAgainst: [...(e.for ?? []), ...(e.against ?? [])].join(' . '),
        counts: { sources: srcs.length, physical: e.physical?.length ?? 0, textual: e.textual?.length ?? 0, genetic: e.genetic?.length ?? 0, for: e.for?.length ?? 0, against: e.against?.length ?? 0, unresolved: e.unresolved?.length ?? 0, predictions: e.predictions?.length ?? 0, alternatives: e.alternatives?.length ?? 0, lines: linesOf(e).length },
        srcKinds: Object.fromEntries(['primary', 'secondary', 'alternative', 'official', 'skeptical'].map(k => [k, srcs.filter(s => s.kind === k).length])),
        srcRel: Object.fromEntries(['high', 'medium', 'mixed', 'low', 'unassessed'].map(k => [k, srcs.filter(s => s.reliability === k).length])),
        srcPlaceholder: srcs.filter(s => s.placeholder).length, srcDisciplines: new Set(srcs.map(s => s.discipline)).size,
        // baselines to compare the learned models against (these are rule-based, from the audit)
        audit: { triangScore: t.score, triangBand: t.band, phasePct: phasesOf(e).pct },
        alternatives: (e.alternatives ?? []).map(a => ({ name: a.name, status: a.status, text: a.text })),
        predictions: e.predictions ?? [], againstList: e.against ?? [], unresolved: e.unresolved ?? [],
      };
    }),
    ...EVENTS.map(v => ({
      id: v.id, kind: 'event', title: v.title, cat: 'event', priority: 'P2', place: '', lat: v.lat ?? null, lon: v.lon ?? null, region: v.lat != null && v.lon != null ? regionOf(v.lat, v.lon) : 'global',
      start: v.start, end: v.end, deep: v.start < TIME_MIN, pos0: yearToPos(v.start), pos1: yearToPos(v.end), dateKind: v.dateKind, dateConfidence: v.dateConfidence, hasAltChron: false, hasDatingMethod: false,
      ev: v.ev, interp: v.human?.status ?? v.ev, text: [v.title, v.summary, ...v.physical].join(' . '), textForAgainst: '',
      counts: { sources: v.sources.length, physical: v.physical.length, textual: 0, genetic: 0, for: 0, against: 0, unresolved: 0, predictions: 0, alternatives: v.alternatives?.length ?? 0, lines: 0 },
      srcKinds: {}, srcRel: {}, srcPlaceholder: 0, srcDisciplines: 0, audit: { triangScore: 0, triangBand: v.ev, phasePct: 0 }, alternatives: [], predictions: [], againstList: [], unresolved: [],
    })),
  ],
  links: LINKS.map(l => ({ a: l.a, b: l.b, rel: l.rel, conf: l.conf, nSrc: l.src.length })),
  migrations: MIGRATIONS.map(m => ({ id: m.id, group: m.group, start: m.start, end: m.end, ev: m.ev, interp: m.interp, path: m.path })),
  questions: QUESTIONS.map(q => ({ id: q.id, question: q.question, options: q.options.map(o => ({ id: o.id, name: o.name, status: o.status, supports: o.supports.length, contradicts: o.contradicts.length, falsifiers: o.falsifiers.length, entries: o.entries ?? [] })) })),
};
mkdirSync(new URL('../ml/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../ml/data/dataset.json', import.meta.url), JSON.stringify(out));
console.log(`ml/data/dataset.json: ${out.nodes.length} nodes (${ENTRIES.length} entries, ${EVENTS.length} events), ${out.links.length} links, ${out.questions.length} questions`);
