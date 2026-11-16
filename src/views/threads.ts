import type { Carried, Culture, Directness, Strand } from '../types';
import { CARRIED, CULTURES, PASSAGE_BY_ID, REJECTED, STRANDS, THREADS } from '../data/threads';
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
const ERAS: { id: string; label: string; a: number; b: number }[] = [
  { id: 'deep', label: 'Before 3000 BCE', a: -1e9, b: -3000 }, { id: 'bronze', label: '3000–1000 BCE', a: -3000, b: -1000 }, { id: 'iron', label: '1000–300 BCE', a: -1000, b: -300 },
  { id: 'classical', label: '300 BCE – 500 CE', a: -300, b: 500 }, { id: 'medieval', label: '500–1500 CE', a: 500, b: 1500 }, { id: 'modern', label: 'After 1500 CE', a: 1500, b: 1e9 }];
/** How a strand is sourced, borrowed from the atlas idea that every edge declares where its assertion comes from. */
const isPointer = (id: string) => id.startsWith('w_') || SOURCE_BY_ID[id]?.reliability === 'low';
function sourcing(s: Strand): { label: string; cls: string; tip: string } {
  const n = (s.passages ?? []).length, pointer = s.src.filter(isPointer).length, real = s.src.length - pointer;
  if (n) return { label: `Primary text quoted (${n})`, cls: 'src-primary', tip: 'The ancient text itself is quoted on this strand.' };
  if (real >= 2) return { label: 'Scholarly sources', cls: 'src-schol', tip: 'Two or more non-pointer sources were opened.' };
  if (real === 1) return { label: 'One scholarly source', cls: 'src-thin', tip: 'Only one non-pointer source was opened: treat as provisional.' };
  return { label: 'Pointer sources only', cls: 'src-pointer', tip: 'Only encyclopedia or publisher pages were opened: a lead, not evidence.' };
}
const MEDIUM: Record<string, string> = { migration: 'migration', conquest: 'conquest', trade: 'trade', translation: 'translation', text: 'texts', teaching: 'teaching', court_or_empire: 'court or empire', unknown: 'route unknown' };


/** A 28px sample of the line style, so the legend lives on every row. */
function lineSample(d: Directness, color: string) {
  const el = svg('svg', { class: 'th-ls', viewBox: '0 0 28 8', width: 28, height: 8, 'aria-hidden': 'true' });
  const l = svg('line', { x1: 1, y1: 4, x2: 27, y2: 4, stroke: color, 'stroke-width': DIRECT[d].w, 'stroke-linecap': 'round' }); if (DIRECT[d].dash) l.setAttribute('stroke-dasharray', DIRECT[d].dash);
  el.append(l); return el;
}

export class ThreadsView {
  readonly el = h('div', { class: 'threads' });
  private kinds = new Set<Carried>(Object.keys(CARRIED) as Carried[]);
  private directs = new Set<Directness>(['documented', 'inferred', 'debated']);
  private thread: string | null = null;
  private culture: string | null = null;
  private era: string | null = null;
  private region: string | null = null;
  private fine = false;
  private query = '';
  private mode: 'diagram' | 'list' | 'cultures' = typeof innerWidth !== 'undefined' && innerWidth < 900 ? 'list' : 'diagram';
  private filtersOpen = false;
  private bar!: HTMLElement; private panel!: HTMLElement; private active!: HTMLElement;
  private body = h('div', { class: 'th-body' });
  private detail = h('aside', { class: 'th-detail', 'aria-live': 'polite' });
  private layout!: HTMLElement;
  private ro?: ResizeObserver; private lastW = 0; private rendered = '';

  constructor() {
    this.layout = h('div', { class: 'th-layout' }, this.body, this.detail);
    this.el.append(...this.head(), this.layout, this.reviewQueue());
    subscribe(keys => { if (state.view === 'threads' && (keys.has('view') || keys.has('strand'))) this.render(); });
    this.ro = new ResizeObserver(() => { const w = this.body.clientWidth; if (state.view === 'threads' && this.mode === 'diagram' && Math.abs(w - this.lastW) > 8) this.render(); });
    this.ro.observe(this.body);
    this.render();
  }

  private matches(s: Strand) {
    if (!this.kinds.has(s.carried) || !this.directs.has(s.directness)) return false;
    if (this.thread && s.thread !== this.thread) return false;
    if (this.culture && s.from !== this.culture && s.to !== this.culture) return false;
    if (s.parent && !this.fine && !this.query && !this.culture && state.strand !== s.id) return false;
    if (this.era) { const e = ERAS.find(x => x.id === this.era)!; if (s.end < e.a || s.start > e.b) return false; }
    if (this.region) { const g = (id: string) => CULTURES.find(c => c.id === id)?.group; if (g(s.from) !== this.region && g(s.to) !== this.region) return false; }
    if (this.query) {
      const q = this.query.toLowerCase();
      const al = (id: string) => (CULTURES.find(c => c.id === id)?.aliases ?? []).join(' ');
      const pq = (s.passages ?? []).map(id => PASSAGE_BY_ID[id]).filter(Boolean).map(p => `${p.work} ${p.locator} ${p.quote}`).join(' ');
      const hay = `${this.name(s.from)} ${al(s.from)} ${this.name(s.to)} ${al(s.to)} ${s.what} ${s.note} ${pq}`.toLowerCase();
      if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }
  private visible(): Strand[] { return STRANDS.filter(s => this.matches(s)); }
  private filterCount() { return (Object.keys(CARRIED).length - this.kinds.size) + (3 - this.directs.size) + (this.thread ? 1 : 0) + (this.era ? 1 : 0) + (this.region ? 1 : 0) + (this.fine ? 1 : 0); }

  private chip(label: string, color: string | null, cls: string, on: boolean, tip: string | undefined, toggle: () => boolean) {
    const b = h('button', { class: 'th-chip' + (on ? ' on' : '') + (cls ? ' ' + cls : ''), style: color ? `--c:${color}` : undefined, title: tip, 'aria-pressed': String(on),
      on: { click: () => { const v = toggle(); b.classList.toggle('on', v); b.setAttribute('aria-pressed', String(v)); this.render(); this.syncBar(); } } }, h('i'), label);
    return b;
  }

  private head(): HTMLElement[] {
    const kinds = (Object.keys(CARRIED) as Carried[]).filter(k => STRANDS.some(s => s.carried === k)).map(k =>
      this.chip(CARRIED[k].label, CARRIED[k].color, '', true, undefined, () => { const on = !this.kinds.has(k); on ? this.kinds.add(k) : this.kinds.delete(k); return on; }));
    const dirs = (Object.keys(DIRECT) as Directness[]).map(d =>
      this.chip(DIRECT[d].label, null, 'd-' + d, true, DIRECT[d].tip, () => { const on = !this.directs.has(d); on ? this.directs.add(d) : this.directs.delete(d); return on; }));
    const threadSel = h('select', { class: 'th-sel', 'aria-label': 'Follow one thread', on: { change: (e: Event) => { this.thread = (e.target as HTMLSelectElement).value || null; this.render(); this.syncBar(); } } },
      h('option', { value: '' }, 'All threads'), ...THREADS.map(t => h('option', { value: t.id }, t.name)));
    const search = h('input', { type: 'search', class: 'th-search', placeholder: 'Search transfers: Persia, alphabet, flood…', 'aria-label': 'Search transfers', on: { input: (e: Event) => { this.query = (e.target as HTMLInputElement).value.trim(); this.render(); this.syncBar(); } } });
    const seg = h('div', { class: 'segs th-modes', role: 'group', 'aria-label': 'Layout' },
      ...([['diagram', 'Diagram'], ['list', 'By thread'], ['cultures', 'Cultures']] as const).map(([m, label]) => h('button', { class: 'seg' + (m === this.mode ? ' on' : ''), dataset: { m }, 'aria-pressed': String(m === this.mode),
        on: { click: () => { this.mode = m; this.render(); this.syncBar(); } } }, label)));
    const fbtn = h('button', { class: 'btn th-fbtn', 'aria-expanded': 'false', on: { click: () => { this.filtersOpen = !this.filtersOpen; this.syncBar(); } } }, 'Filters');
    const eraSel = h('select', { class: 'th-sel', 'aria-label': 'Period', on: { change: (e: Event) => { this.era = (e.target as HTMLSelectElement).value || null; this.render(); } } }, h('option', { value: '' }, 'Any period'), ...ERAS.map(x => h('option', { value: x.id }, x.label)));
    const regionSel = h('select', { class: 'th-sel', 'aria-label': 'Region', on: { change: (e: Event) => { this.region = (e.target as HTMLSelectElement).value || null; this.render(); } } }, h('option', { value: '' }, 'Any region'), ...[...new Set(CULTURES.map(c => c.group))].map(g => h('option', { value: g }, g)));
    const detailBtn = h('button', { class: 'th-chip', 'aria-pressed': 'false', title: 'Show the finer strands that break the big ones down', on: { click: () => { this.fine = !this.fine; detailBtn.classList.toggle('on', this.fine); detailBtn.setAttribute('aria-pressed', String(this.fine)); this.render(); } } }, h('i'), 'Show fine detail');
    this.panel = h('div', { class: 'th-panel' },
      h('label', { class: 'th-lab' }, h('span', null, 'Follow one thread'), threadSel),
      h('label', { class: 'th-lab' }, h('span', null, 'Period'), eraSel),
      h('label', { class: 'th-lab' }, h('span', null, 'Region'), regionSel),
      h('div', { class: 'th-lab' }, h('span', null, 'Level of detail'), detailBtn),
      h('div', { class: 'th-lab' }, h('span', null, 'What was passed on'), h('div', { class: 'th-chips', role: 'group', 'aria-label': 'What was passed on' }, kinds)),
      h('div', { class: 'th-lab' }, h('span', null, 'How direct the evidence is'), h('div', { class: 'th-chips', role: 'group', 'aria-label': 'How direct the evidence is' }, dirs)));
    this.active = h('div', { class: 'th-active', 'aria-live': 'polite' });
    this.bar = h('div', { class: 'th-bar' }, search, h('div', { class: 'th-stick' }, seg, fbtn));
    return [h('header', { class: 'th-head' },
      h('div', { class: 'th-title' },
        h('h2', null, 'Threads'),
        h('p', { class: 'th-lede' }, 'What one culture passed to another: languages, scripts, religions, ideas, technologies, crops. Each transfer carries its evidence and what argues against it.'),
        h('details', { class: 'th-how' }, h('summary', null, 'How to read this'),
          h('p', null, h('b', null, 'Solid'), ' line = documented (a dated text, inscription or dated find shows the transfer). ', h('b', null, 'Dashed'), ' = debated (specialists disagree). ', h('b', null, 'Dotted'), ' = inferred from resemblance or plausible contact. The E-grade rates the evidence for the transfer itself, not for either culture. Nothing here is inferred by software.'))),
    ), this.bar, this.panel, this.active];
  }

  /** Keeps the bar, the filter panel and the active-filter chips in step with state. */
  private syncBar() {
    this.bar.querySelectorAll<HTMLElement>('.seg').forEach(b => { const on = b.dataset.m === this.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    const n = this.filterCount();
    const fb = this.bar.querySelector('.th-fbtn') as HTMLElement; fb.textContent = n ? `Filters · ${n}` : 'Filters'; fb.setAttribute('aria-expanded', String(this.filtersOpen));
    this.el.classList.toggle('filters-open', this.filtersOpen);
    const chips: Node[] = [];
    const pill = (label: string, clear: () => void) => h('button', { class: 'th-pill', 'aria-label': `Remove filter: ${label}`, on: { click: clear } }, label, h('b', { 'aria-hidden': 'true' }, ' ×'));
    if (this.culture) chips.push(pill('Culture: ' + this.name(this.culture), () => { this.culture = null; this.render(); this.syncBar(); }));
    if (this.era) chips.push(pill('Period: ' + ERAS.find(x => x.id === this.era)!.label, () => { this.era = null; (this.panel.querySelectorAll('select')[1] as HTMLSelectElement).value = ''; this.render(); }));
    if (this.region) chips.push(pill('Region: ' + this.region, () => { this.region = null; (this.panel.querySelectorAll('select')[2] as HTMLSelectElement).value = ''; this.render(); }));
    if (this.thread) chips.push(pill('Thread: ' + (THREADS.find(t => t.id === this.thread)?.name ?? ''), () => { this.thread = null; (this.panel.querySelector('select') as HTMLSelectElement).value = ''; this.render(); this.syncBar(); }));
    this.active.replaceChildren(...chips); this.active.hidden = !chips.length;
  }

  render() {
    const vis = this.visible();
    const sel = STRANDS.find(s => s.id === state.strand) ?? null;
    this.syncBar();
    if (!STRANDS.length) { this.body.replaceChildren(h('p', { class: 'th-empty' }, 'No threads yet.')); this.detail.replaceChildren(); return; }
    const inline = this.mode !== 'diagram';
    const count = h('p', { class: 'th-count', role: 'status' }, `${vis.length} of ${STRANDS.length} transfers`);
    const main = this.mode === 'cultures' ? this.culturesView(vis, sel) : !vis.length ? h('p', { class: 'th-empty' }, 'No transfers match. Clear a filter or the search.') : this.mode === 'diagram' ? this.diagram(vis, sel) : this.listView(vis, sel);
    this.body.replaceChildren(count, main);
    this.lastW = this.body.clientWidth;
    this.detail.replaceChildren(inline ? '' : sel ? this.card(sel) : h('p', { class: 'th-hint' }, 'Select a ribbon to see what was passed on, the evidence for it, and what argues against it. Select a culture name to follow everything it gave and received.'));
    this.detail.hidden = inline;
    this.detail.classList.toggle('has', !!sel && !inline);
    this.layout.classList.toggle('has', !!sel && !inline);
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
      const on = this.culture === c.id;
      root.append(svg('rect', { x: X(c.start), y: y + 7, width: Math.max(3, X(c.end) - X(c.start)), height: laneH - 14, rx: 4, class: 'th-span' + (on ? ' on' : '') }));
      const g = svg('g', { class: 'th-lanebtn' + (on ? ' on' : ''), tabindex: 0, role: 'button', 'aria-pressed': String(on), 'aria-label': `Follow ${c.name}` });
      g.append(svg('rect', { x: 0, y, width: left - 6, height: laneH, fill: 'transparent' }));
      const lab = svg('text', { x: 8, y: y + laneH / 2 + 4, class: 'th-lane' }); lab.textContent = c.name.length > 33 ? c.name.slice(0, 32) + '…' : c.name; const lt = svg('title'); lt.textContent = c.name + ' (select to follow)'; lab.append(lt); g.append(lab);
      const toggle = () => { this.culture = this.culture === c.id ? null : c.id; this.render(); };
      g.addEventListener('click', toggle); g.addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); toggle(); } });
      root.append(g);
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

  // ---- shared row
  private row(s: Strand, sel: Strand | null, from?: string) {
    const on = sel?.id === s.id;
    const e = STATUS[s.status];
    const ev = [`${s.for.length} for`, `${s.against.length} against`, (s.passages ?? []).length ? `${(s.passages ?? []).length} primary passage${(s.passages ?? []).length === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ');
    const other = from ? (s.from === from ? s.to : s.from) : null;
    const sc = sourcing(s);
    return h('li', { class: s.parent ? 'th-childli' : undefined }, h('button', { class: 'th-row' + (on ? ' on' : '') + (s.parent ? ' th-child' : ''), style: `--c:${CARRIED[s.carried].color}`, 'aria-pressed': String(on), 'aria-expanded': String(on), on: { click: () => set({ strand: on ? null : s.id }) } },
      h('span', { class: 'th-route' }, from ? [h('b', { 'aria-hidden': 'true' }, s.from === from ? '→ ' : '← '), this.name(other!)] : [this.name(s.from), h('b', { 'aria-hidden': 'true' }, ' → '), this.name(s.to)]),
      h('span', { class: 'th-what' }, s.what),
      h('span', { class: 'th-meta' },
        lineSample(s.directness, CARRIED[s.carried].color), h('span', null, DIRECT[s.directness].label),
        h('span', { class: 'th-dot', style: `--c:${e.color}`, title: e.label }, h('i'), s.status),
        h('span', { class: 'dim' }, fmtRange(s.start, s.end))),
      h('span', { class: 'th-ev' }, ev, ' · ', h('span', { class: 'th-src ' + sc.cls, title: sc.tip }, sc.label)),
      STRANDS.some(x => x.parent === s.id) ? h('span', { class: 'th-more' }, `Breaks down into ${STRANDS.filter(x => x.parent === s.id).length} finer strands`) : null), on ? this.card(s) : null);
  }

  // ---- by thread
  private listView(vis: Strand[], sel: Strand | null) {
    const byThread = new Map<string, Strand[]>(); vis.forEach(s => { (byThread.get(s.thread) ?? byThread.set(s.thread, []).get(s.thread)!).push(s); });
    const groups = THREADS.filter(t => byThread.has(t.id));
    return h('div', { class: 'th-list' }, groups.map((t, i) => {
      const all = byThread.get(t.id)!.sort((a, b) => a.start - b.start);
      const tops = all.filter(s => !s.parent || !all.some(x => x.id === s.parent));
      const items = tops.flatMap(s => [s, ...all.filter(c => c.parent === s.id)]);
      const open = !!this.thread || !!this.query || groups.length === 1 || (sel ? items.some(s => s.id === sel.id) : i === 0);
      return h('details', { class: 'th-group', open, style: `--c:${CARRIED[t.carried].color}` },
        h('summary', null, h('i'), h('span', { class: 'th-gname' }, t.name), h('em', null, String(items.length))),
        h('p', { class: 'th-blurb' }, t.blurb),
        h('ul', null, items.map(s => this.row(s, sel))));
    }));
  }

  // ---- by culture: everything one culture gave and received
  private culturesView(vis: Strand[], sel: Strand | null) {
    const touching = (id: string) => vis.filter(s => s.from === id || s.to === id);
    const groups = [...new Set(CULTURES.map(c => c.group))];
    return h('div', { class: 'th-list th-cultures' }, groups.map(g => {
      const cs = CULTURES.filter(c => c.group === g && touching(c.id).length);
      if (!cs.length) return null;
      return h('section', { class: 'th-cgroup' }, h('h3', null, g), cs.map(c => {
        const out = vis.filter(s => s.from === c.id), inn = vis.filter(s => s.to === c.id);
        const open = this.culture === c.id || (!!sel && (sel.from === c.id || sel.to === c.id) && this.culture === null && false);
        const d = h('details', { class: 'th-cult', open },
          h('summary', null, h('span', { class: 'th-cname' }, c.name), h('span', { class: 'th-cnum', title: 'Received / gave' }, `← ${inn.length}  → ${out.length}`)),
          out.length ? h('div', null, h('h4', null, 'Gave'), h('ul', null, out.sort((a, b) => a.start - b.start).map(s => this.row(s, sel, c.id)))) : null,
          inn.length ? h('div', null, h('h4', null, 'Received'), h('ul', null, inn.sort((a, b) => a.start - b.start).map(s => this.row(s, sel, c.id)))) : null);
        d.addEventListener('toggle', () => { if (d.open && this.culture !== c.id) { this.culture = c.id; this.syncBar(); } else if (!d.open && this.culture === c.id) { this.culture = null; this.syncBar(); } });
        return d;
      }));
    }));
  }

  private passage(p: import('../types').Passage) {
    const comp = p.compStart == null && p.compEnd == null ? 'not dated here' : p.compStart === p.compEnd ? `c. ${fmtYear(p.compStart!)}` : `${p.compStart == null ? '?' : fmtYear(p.compStart)} – ${p.compEnd == null ? '?' : fmtYear(p.compEnd)}`;
    return h('figure', { class: 'th-q' },
      h('blockquote', null, '“' + p.quote + '”'),
      h('figcaption', null, h('b', null, p.work + ' ' + p.locator), ' · ', p.language),
      h('dl', { class: 'th-dates' },
        h('dt', null, 'Work composed'), h('dd', null, comp, h('span', { class: 'dim' }, ' — ' + p.compBasis)),
        h('dt', null, 'Earliest witness'), h('dd', null, p.witness),
        h('dt', null, 'Edition read'), h('dd', null, p.edition)),
      SOURCE_BY_ID[p.src] ? h('details', { class: 'sec small' }, h('summary', null, 'Source of this edition'), h('ul', { class: 'srcs' }, sourceCard(p.src))) : null);
  }

  /** What the build refused to settle, in the atlas spirit: thin strands and the candidates verifiers rejected. */
  private reviewQueue() {
    const thin = STRANDS.filter(s => sourcing(s).cls === 'src-pointer');
    const one = STRANDS.filter(s => sourcing(s).cls === 'src-thin');
    const noAgainst = STRANDS.filter(s => !s.against.length);
    const byReason = new Map<string, number>(); REJECTED.forEach(r => { const k = r.reason.split(/[:;(]/)[0].trim() || 'other'; byReason.set(k, (byReason.get(k) ?? 0) + 1); });
    const rows = (list: Strand[]) => h('ul', { class: 'th-rq' }, list.map(s => h('li', null, h('button', { class: 'th-kid', on: { click: () => { this.thread = null; this.query = ''; this.culture = null; this.era = null; this.region = null; this.fine = true; set({ strand: s.id }); } } }, this.name(s.from), ' → ', this.name(s.to), ': ', s.what))));
    return h('details', { class: 'th-review' },
      h('summary', null, 'Review queue', h('em', null, `${thin.length + one.length} thin · ${REJECTED.length} rejected`)),
      h('p', { class: 'dim small' }, 'What this page could not settle. Thin strands are leads to strengthen; rejected candidates are sources an independent verifier would not accept, with the reason. Nothing here is hidden: the verifiers’ decisions are part of the record.'),
      thin.length ? h('section', null, h('h4', null, `Pointer sources only (${thin.length})`), rows(thin)) : null,
      one.length ? h('section', null, h('h4', null, `One scholarly source (${one.length})`), rows(one)) : null,
      noAgainst.length ? h('section', null, h('h4', null, `Records nothing against (${noAgainst.length})`), rows(noAgainst)) : null,
      REJECTED.length ? h('section', null, h('h4', null, `Rejected by verifiers (${REJECTED.length})`), h('p', { class: 'dim small' }, [...byReason].map(([k, v]) => `${k}: ${v}`).join(' · ')), h('ul', { class: 'th-rq' }, REJECTED.map(r => h('li', null, h('b', null, r.title || '(untitled)'), h('span', { class: 'dim' }, ` — ${r.reason} (${r.brief})`))))) : null);
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
        h('div', { class: 'th-cardbtns' },
          h('button', { class: 'btn small', on: { click: () => { this.culture = s.from; this.mode = 'cultures'; set({ strand: null }); this.render(); } } }, 'Everything ' + this.name(s.from).split(' (')[0] + ' gave'),
          h('button', { class: 'btn small th-close', 'aria-label': 'Close details', on: { click: () => set({ strand: null }) } }, 'Close'))),
      h('p', { class: 'th-sourcing' }, h('b', null, 'How this is sourced: '), h('span', { class: 'th-src ' + sourcing(s).cls }, sourcing(s).label), ' · ', `${s.src.length} source${s.src.length === 1 ? '' : 's'}`, s.src.filter(isPointer).length ? ` (${s.src.filter(isPointer).length} pointer)` : ''),
      s.parent ? h('p', null, h('button', { class: 'btn small', on: { click: () => set({ strand: s.parent! }) } }, '↑ Part of: ' + (STRANDS.find(x => x.id === s.parent)?.what ?? ''))) : null,
      STRANDS.some(x => x.parent === s.id) ? h('div', { class: 'lc-g' }, h('h4', null, 'Finer detail'), h('ul', { class: 'th-kids' }, STRANDS.filter(x => x.parent === s.id).map(x => h('li', null, h('button', { class: 'th-kid', on: { click: () => { this.fine = true; set({ strand: x.id }); } } }, this.name(x.from), ' → ', this.name(x.to), ': ', x.what))))) : null,
      h('p', null, s.note),
      s.for.length ? h('div', { class: 'lc-g' }, h('h4', { class: 'pos' }, 'Evidence for'), list(s.for, 'pos')) : null,
      s.against.length ? h('div', { class: 'lc-g' }, h('h4', { class: 'neg' }, 'Against, or limits'), list(s.against, 'neg')) : null,
      s.unresolved?.length ? h('div', { class: 'lc-g' }, h('h4', null, 'Unresolved'), list(s.unresolved)) : null,
      (s.passages ?? []).length ? h('div', { class: 'lc-g th-pass' }, h('h4', null, `Primary passages (${(s.passages ?? []).length})`), (s.passages ?? []).map(id => PASSAGE_BY_ID[id]).filter(Boolean).map(p => this.passage(p))) : null,
      rel.length ? h('div', { class: 'lc-g' }, h('h4', null, 'Related records'), h('div', { class: 'chips' }, rel.map(id => h('a', { class: 'chip', href: `#/map?e=${id}`, on: { click: (e: Event) => { e.preventDefault(); set({ view: 'map', selected: { kind: 'entry', id } }); } } }, ENTRY_BY_ID[id].title)))) : null,
      h('details', { class: 'sec small' }, h('summary', null, 'Sources', h('em', null, String(s.src.length))), h('ul', { class: 'srcs' }, s.src.map(sourceCard))),
      h('p', { class: 'rule' }, 'Status grades the evidence for this transfer, not for either culture.'));
  }
}
