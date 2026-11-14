import { ENTRIES, EVENTS, MIGRATIONS, QUESTIONS } from '../data';
import { CATS } from '../lib/classification';
import { h } from '../lib/dom';
import { set } from '../lib/store';
import { fmtRange } from '../lib/time';

interface Hit { label: string; sub: string; run: () => void; score: number }

/** Command-palette style global search (press / or Ctrl/Cmd+K). */
export class Palette {
  readonly el = h('div', { class: 'palette', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' });
  private input = h('input', { type: 'search', placeholder: 'Search records, events, routes, questions…', 'aria-label': 'Search' }) as HTMLInputElement;
  private results = h('ul', { class: 'pal-results' });
  private hits: Hit[] = [];
  private idx = 0;

  constructor() {
    this.el.append(h('div', { class: 'pal-box' }, this.input, this.results, h('div', { class: 'pal-foot' }, '↑↓ navigate · Enter open · Esc close')));
    this.el.addEventListener('mousedown', e => { if (e.target === this.el) this.close(); });
    this.input.addEventListener('input', () => { this.idx = 0; this.search(); });
    this.input.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); this.idx = Math.min(this.hits.length - 1, this.idx + 1); this.paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.idx = Math.max(0, this.idx - 1); this.paint(); }
      else if (e.key === 'Enter') { this.hits[this.idx]?.run(); this.close(); }
    });
    addEventListener('keydown', e => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); this.open(); }
    });
  }
  open() { this.el.classList.add('on'); this.input.value = ''; this.search(); setTimeout(() => this.input.focus(), 0); }
  close() { this.el.classList.remove('on'); }

  private search() {
    const q = this.input.value.trim().toLowerCase();
    const hits: Hit[] = [];
    const sc = (s: string) => { const i = s.toLowerCase().indexOf(q); return i < 0 ? -1 : i === 0 ? 3 : 1; };
    for (const e of ENTRIES) {
      const s = !q ? 0 : Math.max(sc(e.title) * 3, sc(e.place), sc(e.summary) * 0.3, sc(CATS[e.cat].label));
      if (q && s < 0) continue;
      hits.push({ label: e.title, sub: `${CATS[e.cat].label} · ${fmtRange(e.start, e.end)} · ${e.place}`, score: s + (e.priority === 'P1' ? 0.5 : 0), run: () => set({ view: 'map', selected: { kind: 'entry', id: e.id } }) });
    }
    for (const e of EVENTS) { const s = !q ? 0 : sc(e.title); if (q && s < 0) continue; hits.push({ label: '◆ ' + e.title, sub: `Environmental event · ${fmtRange(e.start, e.end)}`, score: s, run: () => set({ view: 'map', selected: { kind: 'event', id: e.id }, t: Math.round((e.start + e.end) / 2) }) }); }
    for (const m of MIGRATIONS) { const s = !q ? 0 : Math.max(sc(m.title), sc(m.model)); if (q && s < 0) continue; hits.push({ label: '➜ ' + m.title, sub: `Route · ${fmtRange(m.start, m.end)}`, score: s, run: () => set({ view: 'map', selected: { kind: 'migration', id: m.id }, t: Math.round((m.start + m.end) / 2) }) }); }
    for (const x of QUESTIONS) { const s = !q ? -0.5 : sc(x.question); if (q && s < 0) continue; hits.push({ label: '⚗ ' + x.question, sub: `Hypothesis laboratory · ${x.options.length} competing explanations`, score: s, run: () => set({ view: 'lab', labPick: x.id }) }); }
    this.hits = hits.sort((a, b) => b.score - a.score).slice(0, 40);
    this.paint();
  }
  private paint() {
    this.results.replaceChildren(...this.hits.map((hit, i) => h('li', { class: i === this.idx ? 'on' : '', on: { mousedown: () => { hit.run(); this.close(); }, mouseenter: () => { this.idx = i; this.paint(); } } }, h('div', { class: 'pl' }, hit.label), h('div', { class: 'ps' }, hit.sub))));
    if (!this.hits.length) this.results.replaceChildren(h('li', { class: 'none' }, 'No matches.'));
  }
}
