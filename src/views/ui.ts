import type { Entry, Source, Status, Confidence } from '../types';
import { h } from '../lib/dom';
import { STATUS } from '../lib/classification';
import { SOURCE_BY_ID } from '../data';
import { set } from '../lib/store';

export function badge(code: Status, label?: string) {
  const s = STATUS[code];
  return h('span', { class: 'badge', style: `--c:${s.color}`, title: s.desc }, h('i'), label ?? s.label);
}
export function dualBadges(ev: Status, interp: Status) {
  return h('div', { class: 'dual' },
    h('div', null, h('span', { class: 'dual-k' }, 'Evidence'), badge(ev)),
    h('div', null, h('span', { class: 'dual-k' }, 'Interpretation'), badge(interp)));
}
export function confDots(c: Confidence) {
  const n = c === 'high' ? 3 : c === 'medium' ? 2 : 1;
  return h('span', { class: 'conf', title: `${c} confidence` }, '●'.repeat(n), h('span', { class: 'off' }, '●'.repeat(3 - n)));
}

const KIND_LABEL: Record<Source['kind'], string> = { primary: 'primary', secondary: 'secondary', alternative: 'alternative', official: 'official', skeptical: 'critical' };
export function sourceCard(id: string) {
  const s = SOURCE_BY_ID[id];
  if (!s) return h('li', { class: 'src bad' }, `Unknown source “${id}”`);
  return h('li', { class: 'src' },
    h('div', { class: 'src-cite' }, s.cite),
    h('div', { class: 'src-meta' },
      h('span', { class: `tag k-${s.kind}` }, KIND_LABEL[s.kind]),
      h('span', { class: 'tag' }, s.discipline),
      h('span', { class: `tag rel-${s.reliability}` }, `reliability: ${s.reliability}`),
      s.placeholder ? h('span', { class: 'tag warn', title: 'This record does not yet identify a specific publication.' }, 'citation to locate') : h('span', { class: 'tag dim', title: 'Recalled during the first build and not yet checked against the original.' }, 'unverified'),
    ),
    s.note ? h('div', { class: 'src-note' }, s.note) : null);
}

export function list(items?: string[], cls = '') {
  if (!items?.length) return null;
  return h('ul', { class: 'bul ' + cls }, items.map(i => h('li', null, i)));
}

export function section(title: string, body: Node | null | undefined | false, open = true, count?: number) {
  if (!body) return null;
  const d = h('details', { class: 'sec', open }, h('summary', null, title, count != null ? h('em', null, String(count)) : null), body);
  return d;
}

export function entryLink(id: string, label: string) {
  return h('a', { href: `#/map?e=${id}`, class: 'xref', on: { click: (e: Event) => { e.preventDefault(); set({ view: 'map', selected: { kind: 'entry', id } }); } } }, label);
}

export function yaml(e: Entry): string {
  const q = (s: string) => JSON.stringify(s);
  const list = (k: string, v?: string[]) => (v?.length ? `${k}:\n${v.map(x => `  - ${q(x)}`).join('\n')}\n` : `${k}: []\n`);
  return [
    `id: ${e.id}`, `title: ${q(e.title)}`, `category: ${e.cat}`, `location: ${q(e.place)}`,
    `coordinates: [${e.lat}, ${e.lon}]${e.geoNote ? `  # ${e.geoNote}` : ''}`,
    `estimated_date: [${e.start}, ${e.end}]`, `date_confidence: ${e.dateConfidence}  # date kind: ${e.dateKind}`,
    `discovery: ${q(e.summary)}`, `original_claim: ${q(e.claim ?? '')}`,
    list('physical_evidence', e.physical), list('textual_evidence', e.textual), list('genetic_evidence', e.genetic),
    `mainstream_interpretation: ${q(e.mainstream ?? '')}`,
    `alternative_interpretations:\n${(e.alternatives ?? []).map(a => `  - {name: ${q(a.name)}, status: ${a.status}}`).join('\n') || '  []'}`,
    list('supporting_evidence', e.for), list('contradicting_evidence', e.against),
    `independent_sources: [${e.sources.join(', ')}]`,
    `evidence_status: ${e.ev}`, `interpretation_status: ${e.interp}`,
    list('unresolved_questions', e.unresolved), list('testable_predictions', e.predictions),
    `research_priority: ${e.priority}`, `last_reviewed: ${e.reviewed}`,
  ].join('\n');
}

export async function copy(text: string, btn: HTMLElement, done = 'Copied') {
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = done; } catch { btn.textContent = 'Copy failed'; }
  setTimeout(() => { btn.textContent = old; }, 1400);
}
