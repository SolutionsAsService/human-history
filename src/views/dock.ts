import { ENTRIES, ENTRY_BY_ID, EVENTS, EVENT_BY_ID, MIGRATIONS } from '../data';
import { h } from '../lib/dom';
import { state, set, subscribe } from '../lib/store';
import { ANCHORS, fmtRange, fmtYear, posToYear, yearToPos, seaLevel, bp, bce, NOW, phase } from '../lib/time';
import { STATUS } from '../lib/classification';

const PRESETS: [string, number, string][] = [
  ['Origins', -300_000, '~300 ka · earliest Homo sapiens lineage'],
  ['Out of Africa', bp(60000), '~60 ka · the main dispersal'],
  ['Glacial maximum', bp(21000), '~21 ka · low seas, exposed shelves'],
  ['Younger Dryas', bp(12500), '~12.5 ka · abrupt cold'],
  ['First monuments', bce(9500), '9500 BCE · Göbekli Tepe and Jericho'],
  ['First cities', bce(3300), '3300 BCE · Uruk and Caral'],
  ['Pyramids', bce(2550), '2550 BCE · Giza'],
  ['Classical', 0, '1 CE'],
  ['Present', NOW, 'today'],
];

export class Dock {
  readonly el: HTMLElement;
  private canvas = h('canvas', { class: 'dock-canvas' });
  private range = h('input', { type: 'range', min: 0, max: 10000, step: 1, class: 'dock-range', 'aria-label': 'Time cursor A' }) as HTMLInputElement;
  private rangeB = h('input', { type: 'range', min: 0, max: 10000, step: 1, class: 'dock-range dock-range-b', 'aria-label': 'Time cursor B' }) as HTMLInputElement;
  private readout = h('div', { class: 'readout' });
  private sub = h('div', { class: 'readout-sub' });
  private chips = h('div', { class: 'chips-active' });
  private playBtn = h('button', { class: 'btn icon', title: 'Play / pause (space)', 'aria-label': 'Play or pause' }, '▶');
  private speedBtn = h('button', { class: 'btn', title: 'Playback speed' }, '1×');
  private dirBtn = h('button', { class: 'btn icon', title: 'Direction' }, '→');
  private cmpBtn = h('button', { class: 'btn', title: 'Compare two moments with a swipe curtain' }, 'Compare');
  private stats = h('div', { class: 'dock-stats' });
  private ctx: CanvasRenderingContext2D;
  private w = 0; private hh = 64;
  private cache: { act: number[]; sea: number[] } | null = null;

  constructor() {
    this.ctx = this.canvas.getContext('2d')!;
    const track = h('div', { class: 'dock-track' }, this.canvas, this.range, this.rangeB);
    const presets = h('div', { class: 'presets' }, PRESETS.map(([n, y, tip]) => h('button', { class: 'chip', title: tip, on: { click: () => set({ t: y, playing: false }) } }, n)));
    this.el = h('div', { class: 'dock' },
      h('div', { class: 'dock-top' },
        h('div', { class: 'ctrls' }, this.dirBtn, this.playBtn, this.speedBtn,
          h('button', { class: 'btn icon', title: 'Previous discovery', 'aria-label': 'Previous discovery', on: { click: () => this.jump(-1) } }, '⏮'),
          h('button', { class: 'btn icon', title: 'Next discovery', 'aria-label': 'Next discovery', on: { click: () => this.jump(1) } }, '⏭')),
        h('div', { class: 'readout-box' }, this.readout, this.sub),
        h('div', { class: 'dock-right' }, this.stats, this.cmpBtn)),
      track, h('div', { class: 'dock-bottom' }, presets, this.chips));

    this.range.addEventListener('input', () => set({ t: Math.round(posToYear(Number(this.range.value) / 10000)), playing: false }));
    this.rangeB.addEventListener('input', () => set({ tB: Math.round(posToYear(Number(this.rangeB.value) / 10000)) }));
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.speedBtn.addEventListener('click', () => { const s = [1, 2, 4, 0.5]; set({ speed: s[(s.indexOf(state.speed) + 1) % s.length] }); });
    this.dirBtn.addEventListener('click', () => set({ dir: state.dir === 1 ? -1 : 1 }));
    this.cmpBtn.addEventListener('click', () => set({ compare: !state.compare }));
    new ResizeObserver(() => this.resize()).observe(this.canvas.parentElement ?? this.el);
    subscribe(() => this.update());
    addEventListener('keydown', e => {
      if (state.view !== 'map') return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' && (t as HTMLInputElement).type === 'text' || t.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
      if (e.key === 'ArrowRight' && !t.classList.contains('dock-range')) { set({ t: Math.round(posToYear(Math.min(1, yearToPos(state.t) + 0.004))), playing: false }); }
      if (e.key === 'ArrowLeft' && !t.classList.contains('dock-range')) { set({ t: Math.round(posToYear(Math.max(0, yearToPos(state.t) - 0.004))), playing: false }); }
    });
    queueMicrotask(() => { this.resize(); this.update(); });
  }

  private togglePlay() {
    if (!state.playing && yearToPos(state.t) >= 0.999 && state.dir === 1) set({ t: ANCHORS[0] });
    set({ playing: !state.playing });
  }

  private jump(dir: 1 | -1) {
    const times = new Set<number>();
    for (const e of ENTRIES) if (state.layers.has(e.cat)) times.add(e.start);
    for (const e of EVENTS) times.add(e.start);
    const arr = [...times].sort((a, b) => a - b);
    const t = state.t;
    const next = dir === 1 ? arr.find(x => x > t + 0.5) : [...arr].reverse().find(x => x < t - 0.5);
    if (next != null) set({ t: Math.round(next), playing: false });
  }

  private resize() {
    const r = this.canvas.parentElement!.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    this.w = Math.round(r.width);
    this.canvas.width = this.w * dpr; this.canvas.height = this.hh * dpr;
    this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.hh + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cache = null;
    this.draw();
  }

  private compute() {
    const N = 360;
    const act = new Array(N).fill(0), sea = new Array(N).fill(NaN);
    for (let i = 0; i < N; i++) {
      const y = posToYear((i + 0.5) / N);
      let c = 0;
      for (const e of ENTRIES) if (state.layers.has(e.cat) && phase(e.start, e.end, y) === 'active') c++;
      act[i] = c;
      const s = seaLevel(y); sea[i] = s.grade === 'none' ? NaN : s.m;
    }
    this.cache = { act, sea };
  }

  update() {
    this.range.value = String(Math.round(yearToPos(state.t) * 10000));
    this.rangeB.value = String(Math.round(yearToPos(state.tB) * 10000));
    this.rangeB.style.display = state.compare ? '' : 'none';
    this.el.classList.toggle('compare', state.compare);
    this.cmpBtn.classList.toggle('on', state.compare);
    this.playBtn.textContent = state.playing ? '❚❚' : '▶';
    this.speedBtn.textContent = state.speed + '×';
    this.dirBtn.textContent = state.dir === 1 ? '→' : '←';

    this.readout.textContent = fmtYear(state.t);
    const sl = seaLevel(state.t);
    const slText = sl.grade === 'none' ? 'sea level not modelled' : `sea level ${sl.m >= 0 ? '+' : '−'}${Math.abs(Math.round(sl.m))} m${sl.grade === 'schematic' ? ' (schematic)' : ''}`;
    let active = 0, started = 0;
    for (const e of ENTRIES) { if (!state.layers.has(e.cat)) continue; const p = phase(e.start, e.end, state.t); if (p === 'active') active++; if (p !== 'future') started++; }
    this.sub.textContent = slText;
    this.stats.replaceChildren(h('span', null, `${active} active`), h('span', { class: 'dim' }, ` · ${started} of ${ENTRIES.length} recorded by now`));

    const evs = EVENTS.filter(e => phase(e.start, e.end, state.t) === 'active');
    const migs = MIGRATIONS.filter(m => phase(m.start, m.end, state.t) === 'active');
    this.chips.replaceChildren(
      ...evs.map(e => h('button', { class: 'chip ev', title: e.summary, on: { click: () => set({ selected: { kind: 'event', id: e.id } }) } }, '◆ ' + e.title)),
      ...migs.map(m => h('button', { class: 'chip mig', title: m.summary, on: { click: () => set({ selected: { kind: 'migration', id: m.id } }) } }, '➜ ' + m.title)),
    );
    this.draw();
  }

  private draw() {
    if (!this.w) return;
    if (!this.cache) this.compute();
    const { ctx, w, hh } = this;
    const { act, sea } = this.cache!;
    ctx.clearRect(0, 0, w, hh);
    const N = act.length;
    const maxA = Math.max(1, ...act);
    // activity bars
    ctx.fillStyle = 'rgba(120,160,230,0.22)';
    for (let i = 0; i < N; i++) { const bh = (act[i] / maxA) * (hh - 24); ctx.fillRect((i / N) * w, hh - 14 - bh, w / N + 0.5, bh); }
    // sea level curve (0 at top margin, -130 at bottom of band)
    ctx.beginPath(); let started = false;
    for (let i = 0; i < N; i++) {
      if (Number.isNaN(sea[i])) { started = false; continue; }
      const y = 10 + Math.min(1, Math.max(-0.1, -sea[i] / 135)) * (hh - 34);
      const x = ((i + 0.5) / N) * w;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(201,165,106,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
    // anchor ticks & labels
    ctx.fillStyle = 'rgba(190,205,235,0.65)'; ctx.font = '10px system-ui'; ctx.textBaseline = 'alphabetic';
    ANCHORS.forEach((y, i) => {
      const x = (i / (ANCHORS.length - 1)) * w;
      if (w < 700 && i % 2 === 1 && i !== ANCHORS.length - 1) { ctx.fillRect(Math.min(w - 1, x), hh - 14, 1, 5); return; }
      ctx.fillRect(Math.min(w - 1, x), hh - 14, 1, 5);
      ctx.textAlign = i === 0 ? 'left' : i === ANCHORS.length - 1 ? 'right' : 'center';
      ctx.fillText(y === NOW ? 'now' : fmtYear(y, true), i === 0 ? x + 3 : i === ANCHORS.length - 1 ? x - 3 : x, hh - 2);
    });
    // selected range(s), including competing chronologies
    const s = state.selected;
    const bands: { a: number; b: number; col: string; hatch?: boolean }[] = [];
    if (s?.kind === 'entry') {
      const e = ENTRY_BY_ID[s.id];
      if (e) { bands.push({ a: e.start, b: e.end, col: '#7cf0ff' }); for (const c of e.altChron ?? []) bands.push({ a: c.start, b: c.end, col: '#f1d24a', hatch: true }); }
    } else if (s?.kind === 'event') { const e = EVENT_BY_ID[s.id]; if (e) bands.push({ a: e.start, b: e.end, col: '#ff9d4d' }); }
    else if (s?.kind === 'migration') { const m = MIGRATIONS.find(m => m.id === s.id); if (m) bands.push({ a: m.start, b: m.end, col: '#9aa8ff' }); }
    for (const b of bands) {
      const x1 = yearToPos(b.a) * w, x2 = Math.max(x1 + 3, yearToPos(b.b) * w);
      ctx.fillStyle = b.hatch ? 'rgba(241,210,74,0.35)' : 'rgba(124,240,255,0.30)';
      ctx.fillRect(x1, 2, x2 - x1, hh - 16);
      ctx.strokeStyle = b.col; ctx.lineWidth = 1.2; ctx.setLineDash(b.hatch ? [3, 2] : []); ctx.strokeRect(x1 + 0.5, 2.5, x2 - x1 - 1, hh - 17); ctx.setLineDash([]);
    }
    // playheads
    const head = (y: number, col: string, label: string) => {
      const x = yearToPos(y) * w;
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, hh - 12); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, 4, 4, 0, 7); ctx.fill();
      if (label) { ctx.font = '700 10px system-ui'; ctx.textAlign = x > w - 20 ? 'right' : 'left'; ctx.fillText(label, x + (x > w - 20 ? -7 : 7), 12); }
    };
    head(state.t, '#ffffff', state.compare ? 'A' : '');
    if (state.compare) head(state.tB, '#ffd37a', 'B');
    void STATUS; void fmtRange;
  }
}
