import { ENTRIES, QUEUE, SOURCES, LINKS, EVENTS, MIGRATIONS, QUESTIONS, depth } from '../data';
import { CATS, STATUS, STATUS_ORDER } from '../lib/classification';
import { h } from '../lib/dom';
import { set } from '../lib/store';
import { fmtRange } from '../lib/time';
import type { Cat, Priority, Status } from '../types';
import { badge } from './ui';
import { getAudit } from '../lib/audit';
import { buildReport, downloadText } from '../lib/report';

type Row = { kind: 'built' | 'queued'; id?: string; title: string; cat: string; pri: Priority; ev?: Status; interp?: Status; when?: string; depth?: string; pct?: number; gap?: number; section?: string; note?: string };

/** The ledger as a working document: what has been built, what is queued, and how deep each record goes. */
export class LedgerView {
  readonly el = h('div', { class: 'ledger' });
  private f = { q: '', pri: '', cat: '', status: '', kind: '' };
  private tbody = h('tbody');
  private count = h('span', { class: 'dim' });

  constructor() {
    const built = ENTRIES.length, queued = QUEUE.length;
    const d = { full: 0, partial: 0, stub: 0 };
    ENTRIES.forEach(e => d[depth(e)]++);
    const counts = STATUS_ORDER.map(s => ENTRIES.filter(e => e.ev === s).length);
    const maxN = Math.max(1, ...counts);
    const dist = h('div', { class: 'bars' }, STATUS_ORDER.map((s, i) => {
      const n = counts[i];
      return h('div', { class: 'bar', title: `${STATUS[s].label}: ${n} records` }, h('div', { class: 'bar-fill', style: `height:${Math.max(3, Math.round((n / maxN) * 70))}px;background:${STATUS[s].color}` }), h('div', { class: 'bar-n' }, String(n)), h('div', { class: 'bar-l' }, s));
    }));
    const stat = (n: number | string, l: string) => h('div', { class: 'stat' }, h('b', null, String(n)), h('span', null, l));
    const sel = (key: keyof Ledger['f'], opts: [string, string][], label: string) => {
      const s = h('select', { 'aria-label': label, on: { change: () => { (this.f as any)[key] = s.value; this.draw(); } } }, h('option', { value: '' }, label), opts.map(([v, t]) => h('option', { value: v }, t))) as HTMLSelectElement;
      return s;
    };
    const search = h('input', { type: 'search', placeholder: 'Filter ledger…', 'aria-label': 'Filter ledger', on: { input: () => { this.f.q = search.value; this.draw(); } } }) as HTMLInputElement;
    this.el.append(
      h('header', { class: 'lg-head' },
        h('div', null, h('h2', null, 'Evidence ledger'), h('p', { class: 'ctx' }, 'Built records and the research queue from design/ledger.md. Every record carries separate evidence and interpretation classifications, and records are added here before any narrative is built on them.')),
        h('div', { class: 'stats' }, stat(built, 'records built'), stat(queued, 'queued'), stat(d.full, 'fully filled'), stat(d.partial, 'partial'), stat(d.stub, 'stubs'), stat(LINKS.length, 'graph links'), stat(EVENTS.length, 'events'), stat(MIGRATIONS.length, 'routes'), stat(QUESTIONS.length, 'questions'), stat(SOURCES.length, 'sources')),
        h('details', { class: 'bars-d', open: innerWidth >= 720 }, h('summary', { class: 'bars-t' }, 'Records by evidence status'), dist)),
      h('div', { class: 'lg-tools' }, search,
        sel('pri', [['P1', 'P1'], ['P2', 'P2'], ['P3', 'P3']], 'Priority'),
        sel('cat', Object.entries(CATS).map(([k, v]) => [k, v.label] as [string, string]), 'Category'),
        sel('status', STATUS_ORDER.map(s => [s, STATUS[s].label] as [string, string]), 'Evidence status'),
        sel('kind', [['built', 'Built'], ['queued', 'Queued']], 'Built / queued'),
        this.count,
        h('span', { class: 'grow' }),
        h('button', { class: 'btn', on: { click: () => download('human-history-ledger.json', JSON.stringify({ entries: ENTRIES, events: EVENTS, migrations: MIGRATIONS, links: LINKS, questions: QUESTIONS, sources: SOURCES, queue: QUEUE }, null, 2), 'application/json') } }, 'Export JSON'),
        h('button', { class: 'btn', on: { click: () => download('human-history-ledger.csv', csv(), 'text/csv') } }, 'Export CSV'),
        h('button', { class: 'btn', title: 'One research report per record, in the ledger §19 structure', on: { click: () => downloadText('human-history-reports.md', ENTRIES.map(buildReport).join('\n\n---\n\n')) } }, 'Export all reports (.md)')),
      h('div', { class: 'tablewrap' }, h('table', null, h('thead', null, h('tr', null, ['Record', 'Category', 'Pri', 'Evidence', 'Interpretation', 'Date', 'Depth', 'Workflow', 'Sourcing'].map(t => h('th', null, t)))), this.tbody)));
    this.draw();
  }

  private rows(): Row[] {
    const a: Row[] = ENTRIES.map(e => ({ kind: 'built', id: e.id, title: e.title, cat: e.cat, pri: e.priority, ev: e.ev, interp: e.interp, when: fmtRange(e.start, e.end), depth: depth(e), pct: getAudit().phases[e.id].pct, gap: getAudit().triang[e.id].gap }));
    const b: Row[] = QUEUE.map(q => ({ kind: 'queued', title: q.title, cat: q.cat, pri: q.priority, section: q.section, note: q.note }));
    return [...a, ...b];
  }

  draw() {
    const { q, pri, cat, status, kind } = this.f;
    const rows = this.rows().filter(r => (!q || (r.title + ' ' + (r.note ?? '')).toLowerCase().includes(q.toLowerCase())) && (!pri || r.pri === pri) && (!cat || r.cat === cat) && (!status || r.ev === status) && (!kind || r.kind === kind))
      .sort((x, y) => x.pri.localeCompare(y.pri) || x.title.localeCompare(y.title));
    this.count.textContent = `${rows.length} shown`;
    this.tbody.replaceChildren(...rows.map(r => h('tr', { class: r.kind, tabindex: r.kind === 'built' ? 0 : -1, on: r.kind === 'built' ? { click: () => set({ view: 'map', selected: { kind: 'entry', id: r.id! } }), keydown: (e: KeyboardEvent) => { if (e.key === 'Enter') set({ view: 'map', selected: { kind: 'entry', id: r.id! } }); } } : {} },
      h('td', { class: 'ttl' }, r.title, r.kind === 'queued' ? h('div', { class: 'qn' }, `Queued · ledger §${r.section}${r.note ? ' — ' + r.note : ''}`) : null),
      h('td', { 'data-l': 'Category' }, (CATS as any)[r.cat] ? h('span', { class: 'dot', style: `background:${(CATS as any)[r.cat].color}` }) : h('span', { class: 'dot', style: 'background:#ff9d4d' }), (CATS as any)[r.cat]?.label ?? r.cat),
      h('td', { 'data-l': 'Priority' }, r.pri),
      h('td', { 'data-l': 'Evidence' }, r.ev ? badge(r.ev, r.ev) : '—'),
      h('td', { 'data-l': 'Interpretation' }, r.interp ? badge(r.interp, r.interp) : '—'),
      h('td', { class: 'dim', 'data-l': 'Date' }, r.when ?? '—'),
      h('td', { 'data-l': 'Depth' }, r.depth ? h('span', { class: 'tag d-' + r.depth }, r.depth) : '—'),
      h('td', { 'data-l': 'Workflow' }, r.pct != null ? `${r.pct}%` : '—'),
      h('td', { 'data-l': 'Sourcing' }, r.gap == null ? '—' : r.gap >= 1 ? h('span', { class: 'tag warn', title: 'Declared status is stronger than the independent sourcing supports' }, `thin ×${r.gap}`) : h('span', { class: 'tag' }, 'ok')))));
    void (null as unknown as Cat);
  }
}
type Ledger = LedgerView;

function csv() {
  const esc = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const head = ['id', 'title', 'category', 'priority', 'place', 'lat', 'lon', 'start', 'end', 'date_kind', 'date_confidence', 'evidence_status', 'interpretation_status', 'sources'];
  return [head.join(','), ...ENTRIES.map(e => [e.id, e.title, e.cat, e.priority, e.place, e.lat, e.lon, e.start, e.end, e.dateKind, e.dateConfidence, e.ev, e.interp, e.sources.join(';')].map(esc).join(','))].join('\n');
}
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name }); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 500);
}
