import type { Carried, Culture, Directness, Strand } from '../types';
import { CARRIED, CULTURES, PASSAGE_BY_ID, STRANDS, THREADS } from '../data/threads';
import { ENTRY_BY_ID } from '../data';
import { STATUS } from '../lib/classification';
import { h, svg } from '../lib/dom';
import { fmtRange, fmtYear } from '../lib/time';
import { set, state, subscribe } from '../lib/store';
import { badge, list, sourceCard } from './ui';
import { SOURCE_BY_ID } from '../data';

/** Threads: what travelled between cultures. A time-by-culture diagram of transfers, with the evidence for each one. */
const AXIS = [-40000, -15000, -10000, -5000, -3000, -1500, -500, 0, 500, 1000, 1500, 2000];
const xPos = (y: number) => {
  if (y <= AXIS[0]) return 0; if (y >= AXIS[AXIS.length - 1]) return 1;
  for (let i = 0; i < AXIS.length - 1; i++) if (y <= AXIS[i + 1]) return (i + (y - AXIS[i]) / (AXIS[i + 1] - AXIS[i])) / (AXIS.length - 1);
  return 1;
};
const DIRECT: Record<Directness, { label: string; tip: string; dash: string; w: number }> = {
  documented: { label: 'Documented', tip: 'A dated text, inscription, or dated archaeological or genetic evidence shows the transfer.', dash: '', w: 3.2 },
  inferred: { label: 'Inferred', tip: 'Similarity plus plausible contact; no direct record of the transfer.', dash: '2 4', w: 2.2 },
  debated: { label: 'Debated', tip: 'Specialists disagree about whether, when or how.', dash: '7 5', w: 2.6 },
};
const tick = (y: number) => (y <= -10000 ? `${-y / 1000}k BCE` : y < -1000 ? `${Math.abs(y).toLocaleString('en-US')} BCE` : y < 0 ? `${-y} BCE` : y === 0 ? '1 CE' : `${y} CE`);
const MEDIUM: Record<string, string> = { migration: 'migration', conquest: 'conquest', trade: 'trade', translation: 'translation', text: 'texts', teaching: 'teaching', court_or_empire: 'court or empire', unknown: 'route unknown' };

export class ThreadsView {
  readonly el = h('div', { class: 'threads' });
  private kinds = new Set<Carried>(Object.keys(CARRIED) as Carried[]);
  private directs = new Set<Directness>(['documented', 'inferred', 'debated']);
  private thread: string | null = null;
  private mode: 'diagram' | 'list' = typeof innerWidth !== 'undefined' && innerWidth < 760 ? 'list' : 'diagram';
  private body = h('div', { class: 'th-body' });
  private detail = h('aside', { class: 'th-detail', 'aria-live': 'polite' });
  private layout!: HTMLElement;
  private ro?: ResizeObserver; private lastW = 0; private rendered = '';

  constructor() {
    this.layout = h('div', { class: 'th-layout' }, this.body, this.detail);
    this.el.append(this.head(), this.layout);
    subscribe(keys => { if (state.view === 'threads' && (keys.has('view') || keys.has('strand'))) this.render(); });
    this.ro = new ResizeObserver(() => { const w = this.body.clientWidth; if (state.view === 'threads' && this.mode === 'diagram' && Math.abs(w - this.lastW) > 8) this.render(); });
    this.ro.observe(this.body);
    this.render();
  }

  private visible(): Strand[] {
    return STRANDS.filter(s => this.kinds.has(s.carried) && this.directs.has(s.directness) && (!this.thread || s.thread === this.thread));
  }

  private head() {
    const chips = (Object.keys(CARRIED) as Carried[]).filter(k => STRANDS.some(s => s.carried === k)).map(k =>
      h('button', { class: 'th-chip on', style: `--c:${CARRIED[k].color}`, 'aria-pressed': 'true', on: { click: (e: Event) => { const b = e.currentTarget as HTMLElement; const on = !this.kinds.has(k); on ? this.kinds.add(k) : this.kinds.delete(k); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); this.render(); } } }, h('i'), CARRIED[k].label));
    const dchips = (Object.keys(DIRECT) as Directness[]).map(d =>
      h('button', { class: 'th-chip on d-' + d, title: DIRECT[d].tip, 'aria-pressed': 'true', on: { click: (e: Event) => { const b = e.currentTarget as HTMLElement; const on = !this.directs.has(d); on ? this.directs.add(d) : this.directs.delete(d); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); this.render(); } } }, h('i'), DIRECT[d].label));
    const threadSel = h('select', { class: 'th-sel', 'aria-label': 'Follow one thread', on: { change: (e: Event) => { this.thread = (e.target as HTMLSelectElement).value || null; this.render(); } } },
      h('option', { value: '' }, 'All threads'), ...THREADS.map(t => h('option', { value: t.id }, t.name)));
    const seg = h('div', { class: 'segs', role: 'group', 'aria-label': 'Layout' },
      ...(['diagram', 'list'] as const).map(m => h('button', { class: 'seg' + (m === this.mode ? ' on' : ''), dataset: { m }, on: { click: () => { this.mode = m; seg.querySelectorAll('.seg').forEach(b => b.classList.toggle('on', (b as HTMLElement).dataset.m === m)); this.render(); } } }, m === 'diagram' ? 'Diagram' : 'List')));
    return h('header', { class: 'th-head' },
      h('div', { class: 'th-title' },
        h('h2', null, 'Threads'),
        h('p', null, 'What one culture passed to another: languages, scripts, religions, ideas, technologies, crops. Each ribbon is one claimed transfer with its evidence. ', h('b', null, 'Solid'), ' = documented, ', h('b', null, 'dashed'), ' = debated, ', h('b', null, 'dotted'), ' = inferred from resemblance.')),
      h('div', { class: 'th-ctl' }, threadSel, seg),
      h('div', { class: 'th-chips', role: 'group', 'aria-label': 'What was passed on' }, chips),
      h('div', { class: 'th-chips', role: 'group', 'aria-label': 'How direct the evidence is' }, dchips));
  }

  render() {
    const vis = this.visible();
    const sel = STRANDS.find(s => s.id === state.strand) ?? null;
    if (!STRANDS.length) { this.body.replaceChildren(h('p', { class: 'th-empty' }, 'No threads yet.')); this.detail.replaceChildren(); return; }
    this.body.replaceChildren(vis.length ? (this.mode === 'diagram' ? this.diagram(vis, sel) : this.listView(vis, sel)) : h('p', { class: 'th-empty' }, 'No transfers match these filters.'));
    this.lastW = this.body.clientWidth;
    const inline = this.mode === 'list';
    this.detail.replaceChildren(inline ? '' : sel ? this.card(sel) : h('p', { class: 'th-hint' }, 'Select a ribbon to see what was passed on, the evidence for it, and what argues against it.'));
    this.detail.classList.toggle('has', !!sel && !inline);
    this.layout.classList.toggle('has', !!sel && !inline);
    this.detail.hidden = inline;
    if (sel && this.rendered !== sel.id) {
      this.rendered = sel.id;
      requestAnimationFrame(() => { const el = inline ? this.body.querySelector('.th-card') : (innerWidth < 1100 ? this.detail : null); (el as HTMLElement | null)?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    }
    if (!sel) this.rendered = '';
  }

  // ---- diagram
  private diagram(vis: Strand[], sel: Strand | null) {
    const used = new Set<string>(); vis.forEach(s => { used.add(s.from); used.add(s.to); });
    const groups = [...new Set(CULTURES.filter(c => used.has(c.id)).map(c => c.group))];
    const lanes: Culture[] = groups.flatMap(g => CULTURES.filter(c => c.group === g && used.has(c.id)));
    const laneH = 30, top = 34, left = 216, pad = 28;
    const W = Math.max(this.body.clientWidth || 900, 780), H = top + lanes.length * laneH + 20;
    const X = (y: number) => left + xPos(y) * (W - left - pad);
    const Y = (id: string) => top + lanes.findIndex(l => l.id === id) * laneH + laneH / 2;
    const root = svg('svg', { class: 'th-svg', viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'group', 'aria-label': 'Transfers between cultures over time' });
    const defs = svg('defs'); root.append(defs);
    (Object.keys(CARRIED) as Carried[]).forEach(k => {
      const m = svg('marker', { id: 'ar-' + k, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' });
      m.append(svg('path', { d: 'M0 0L10 5L0 10z', fill: CARRIED[k].color })); defs.append(m);
    });
    AXIS.forEach(y => {
      root.append(svg('line', { x1: X(y), x2: X(y), y1: top - 6, y2: H - 14, class: 'th-grid' }));
      const t = svg('text', { x: Math.min(X(y), W - 30), y: 16, class: 'th-tick', 'text-anchor': 'middle' }); t.textContent = tick(y); root.append(t);
    });
    let band = ''; lanes.forEach((c, i) => {
      const y = top + i * laneH;
      if (c.group !== band) { band = c.group; root.append(svg('line', { x1: 0, x2: W, y1: y, y2: y, class: 'th-band' })); }
      root.append(svg('rect', { x: X(c.start), y: y + 7, width: Math.max(3, X(c.end) - X(c.start)), height: laneH - 14, rx: 4, class: 'th-span' }));
      const lab = svg('text', { x: 8, y: y + laneH / 2 + 4, class: 'th-lane' }); lab.textContent = c.name.length > 33 ? c.name.slice(0, 32) + '…' : c.name; const lt = svg('title'); lt.textContent = c.name; lab.append(lt); root.append(lab);
    });
    const g = svg('g'); root.append(g);
    const order = [...vis].sort((a, b) => (a.id === sel?.id ? 1 : 0) - (b.id === sel?.id ? 1 : 0));
    for (const s of order) {
      const x0 = X(s.start), x1 = Math.max(X(s.end), x0 + 22), y0 = Y(s.from), y1 = Y(s.to), dx = Math.max(24, (x1 - x0) * 0.5);
      const d = `M${x0} ${y0} C${x0 + dx} ${y0} ${x1 - dx} ${y1} ${x1} ${y1}`;
      const dim = sel && sel.id !== s.id;
      const grp = svg('g', { class: 'th-strand' + (sel?.id === s.id ? ' on' : '') + (dim ? ' dim' : ''), tabindex: 0, role: 'button', 'aria-label': `${this.name(s.from)} to ${this.name(s.to)}: ${s.what}. ${DIRECT[s.directness].label}.` });
      grp.append(svg('path', { d, class: 'th-hit' }));
      const p = svg('path', { d, class: 'th-rib', stroke: CARRIED[s.carried].color, 'stroke-width': DIRECT[s.directness].w, 'marker-end': `url(#ar-${s.carried})` }); if (DIRECT[s.directness].dash) p.setAttribute('stroke-dasharray', DIRECT[s.directness].dash);
      grp.append(p);
      const pick = () => set({ strand: s.id });
      grp.addEventListener('click', pick); grp.addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); pick(); } });
      const tt = svg('title'); tt.textContent = `${this.name(s.from)} → ${this.name(s.to)}: ${s.what}`; grp.append(tt);
      g.append(grp);
    }
    const wrap = h('div', { class: 'th-scroll' }); wrap.append(root);
    return wrap;
  }

  // ---- list
  private listView(vis: Strand[], sel: Strand | null) {
    const byThread = new Map<string, Strand[]>(); vis.forEach(s => { (byThread.get(s.thread) ?? byThread.set(s.thread, []).get(s.thread)!).push(s); });
    return h('div', { class: 'th-list' }, THREADS.filter(t => byThread.has(t.id)).map(t =>
      h('section', { class: 'th-group' },
        h('h3', { style: `--c:${CARRIED[t.carried].color}` }, h('i'), t.name),
        h('p', { class: 'dim small' }, t.blurb),
        h('ul', null, byThread.get(t.id)!.sort((a, b) => a.start - b.start).map(s =>
          h('li', null, h('button', { class: 'th-row' + (sel?.id === s.id ? ' on' : ''), style: `--c:${CARRIED[s.carried].color}`, 'aria-pressed': String(sel?.id === s.id), on: { click: () => set({ strand: sel?.id === s.id ? null : s.id }) } },
            h('span', { class: 'th-route' }, this.name(s.from), h('b', { 'aria-hidden': 'true' }, ' → '), this.name(s.to)),
            h('span', { class: 'th-what' }, s.what),
            h('span', { class: 'th-meta' }, fmtRange(s.start, s.end), ' · ', DIRECT[s.directness].label)), sel?.id === s.id ? this.card(s) : null))))));
  }

  private passage(p: import('../types').Passage) {
    const comp = p.compStart == null && p.compEnd == null ? 'not dated here' : p.compStart === p.compEnd ? `c. ${fmtYear(p.compStart!)}` : `${p.compStart == null ? '?' : fmtYear(p.compStart)} – ${p.compEnd == null ? '?' : fmtYear(p.compEnd)}`;
    return h('figure', { class: 'th-q' },
      h('blockquote', { lang: /hebrew|greek|latin|akkad|sumer|egypt|sanskrit|avest|chinese|old persian/i.test(p.language) && !/english|translat/i.test(p.language) ? undefined : undefined }, '“' + p.quote + '”'),
      h('figcaption', null, h('b', null, p.work + ' ' + p.locator), ' · ', p.language),
      h('dl', { class: 'th-dates' },
        h('dt', null, 'Work composed'), h('dd', null, comp, h('span', { class: 'dim' }, ' — ' + p.compBasis)),
        h('dt', null, 'Earliest witness'), h('dd', null, p.witness),
        h('dt', null, 'Edition read'), h('dd', null, p.edition)),
      SOURCE_BY_ID[p.src] ? h('details', { class: 'sec small' }, h('summary', null, 'Source of this edition'), h('ul', { class: 'srcs' }, sourceCard(p.src))) : null);
  }

  private name(id: string) { return CULTURES.find(c => c.id === id)?.name ?? id; }

  private card(s: Strand) {
    const t = THREADS.find(x => x.id === s.thread);
    const rel = (s.entries ?? []).filter(id => ENTRY_BY_ID[id]);
    return h('article', { class: 'th-card', style: `--c:${CARRIED[s.carried].color}` },
      h('header', null,
        h('div', { class: 'th-kicker' }, h('i'), CARRIED[s.carried].label, t ? ` · ${t.name}` : ''),
        h('h3', null, this.name(s.from), ' → ', this.name(s.to)),
        h('p', { class: 'th-what2' }, s.what),
        h('div', { class: 'th-facts' },
          h('span', { class: 'tag' }, fmtRange(s.start, s.end)), h('span', { class: 'tag' }, 'by ' + (MEDIUM[s.medium] ?? s.medium)),
          h('span', { class: 'tag d-' + s.directness, title: DIRECT[s.directness].tip }, DIRECT[s.directness].label),
          h('span', { title: 'Evidence for the transfer itself' }, badge(s.status))),
        h('button', { class: 'btn small th-close', 'aria-label': 'Close details', on: { click: () => set({ strand: null }) } }, 'Close')),
      h('p', null, s.note),
      s.for.length ? h('div', { class: 'lc-g' }, h('h4', { class: 'pos' }, 'Evidence for'), list(s.for, 'pos')) : null,
      s.against.length ? h('div', { class: 'lc-g' }, h('h4', { class: 'neg' }, 'Against, or limits'), list(s.against, 'neg')) : null,
      s.unresolved?.length ? h('div', { class: 'lc-g' }, h('h4', null, 'Unresolved'), list(s.unresolved)) : null,
      (s.passages ?? []).length ? h('div', { class: 'lc-g th-pass' }, h('h4', null, 'Primary passages'), (s.passages ?? []).map(id => PASSAGE_BY_ID[id]).filter(Boolean).map(p => this.passage(p))) : null,
      rel.length ? h('div', { class: 'lc-g' }, h('h4', null, 'Related records'), h('div', { class: 'chips' }, rel.map(id => h('a', { class: 'chip', href: `#/map?e=${id}`, on: { click: (e: Event) => { e.preventDefault(); set({ view: 'map', selected: { kind: 'entry', id } }); } } }, ENTRY_BY_ID[id].title)))) : null,
      h('details', { class: 'sec small', open: true }, h('summary', null, 'Sources', h('em', null, String(s.src.length))), h('ul', { class: 'srcs' }, s.src.map(sourceCard))),
      h('p', { class: 'rule' }, 'Status grades the evidence for this transfer, not for either culture. Model-free: nothing here is inferred by software.'));
  }
}
void STATUS;
