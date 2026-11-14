import * as d3 from 'd3';
import { feature } from 'topojson-client';
type Topology = any;
import type { Entry, Migration } from '../types';
import { ENTRIES, ENTRY_BY_ID, EVENTS, EVENT_BY_ID, MIGRATIONS, linksOf } from '../data';
import { CATS, REL, STATUS, STATUS_ORDER } from '../lib/classification';
import { state, set, subscribe, type Selection } from '../lib/store';
import { seaLevel, yearToPos, fmtRange, fmtYear, phase, NOW } from '../lib/time';
import { h } from '../lib/dom';

const OCEAN = '#06101d';
const LAND = '#16233a';
const LAND_EDGE = '#31496b';
const SHELF = '#c9a56a';
const GRATICULE = 'rgba(120,150,200,0.10)';

const GROUP_COLORS: Record<string, string> = {
  dispersal: '#ff8f5a', 'out-of-africa': '#ffb454', americas: '#6ad1ff', neolithic: '#b8f06a',
  'indo-european': '#ff7ad1', pacific: '#2fe0d0', contact: '#f7e26b', africa: '#c79bff', trade: '#9aa8ff', 'bronze-age': '#ffa07a', 'east-asia': '#8fe3a8',
};
export const GROUP_LABELS: Record<string, string> = {
  dispersal: 'Early Homo dispersal', 'out-of-africa': 'Out of Africa', americas: 'Peopling of the Americas',
  neolithic: 'Neolithic farming', 'indo-european': 'Indo-European origins', pacific: 'Pacific expansion',
  contact: 'Transoceanic contact', africa: 'Bantu expansion', trade: 'Trade & exchange', 'bronze-age': 'Bronze Age movements', 'east-asia': 'East Asian movements',
};

interface Dense { pts: [number, number][]; cum: number[]; total: number }
interface Marker { kind: 'entry' | 'event'; id: string; x: number; y: number; r: number }
interface RouteHit { id: string; pts: [number, number][] }

function densify(path: [number, number][]): Dense {
  const pts: [number, number][] = [];
  const cum: number[] = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    const interp = d3.geoInterpolate(a, b);
    const dist = d3.geoDistance(a, b);
    const n = Math.max(2, Math.ceil(dist / 0.03));
    for (let j = i === 0 ? 0 : 1; j <= n; j++) {
      const p = interp(j / n) as [number, number];
      if (pts.length) total += d3.geoDistance(pts[pts.length - 1], p);
      pts.push(p); cum.push(total);
    }
  }
  return { pts, cum, total };
}
const DENSE: Record<string, Dense> = Object.fromEntries(MIGRATIONS.map(m => [m.id, densify(m.path)]));

function subPath(d: Dense, p: number): [number, number][] {
  if (p >= 1) return d.pts;
  const target = d.total * Math.max(0, p);
  let i = 0;
  while (i < d.cum.length && d.cum[i] < target) i++;
  return d.pts.slice(0, Math.max(2, i + 1));
}

const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class MapView {
  readonly el: HTMLElement;
  private canvas = h('canvas', { class: 'map-canvas', tabindex: 0, 'aria-label': 'Interactive evidence map. Use the time slider to move through history.' });
  private ctx: CanvasRenderingContext2D;
  private tip = h('div', { class: 'tip', role: 'status' });
  private w = 0; private hgt = 0; private dpr = 1;
  private flat = d3.geoNaturalEarth1();
  private globe = d3.geoOrthographic().clipAngle(90);
  private baseFlat = 1; private baseGlobe = 1;
  private tr = d3.zoomIdentity;
  private rot: [number, number] = [-20, -20];
  private globeK = 1;
  private land110: any = null; private land50: any = null; private shelf0: any = null; private shelf200: any = null;
  private dirty = true;
  private divX = 0.5;
  private markersA: Marker[] = []; private markersB: Marker[] = [];
  private routeHits: RouteHit[] = [];
  private zoomBehavior!: d3.ZoomBehavior<HTMLCanvasElement, unknown>;
  private raf = 0;
  private lastT = 0;
  private dragging: null | 'globe' | 'divider' = null;
  private dragStart: [number, number, number, number] = [0, 0, 0, 0];
  private grat = d3.geoGraticule10();
  private matchIds: Set<string> | null = null;
  private pendingFocus: Selection = null;

  constructor() {
    this.ctx = this.canvas.getContext('2d')!;
    this.el = h('div', { class: 'map-wrap' }, this.canvas, this.tip);
    new ResizeObserver(() => this.resize()).observe(this.el);
    this.setupInteraction();
    subscribe(keys => this.onState(keys));
    this.loadGeo();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private async loadGeo() {
    const base = import.meta.env.BASE_URL;
    const get = (f: string) => fetch(`${base}data/${f}`).then(r => r.json());
    const [l110, l50, b0, b200] = await Promise.all([
      fetch(`${base}data/land-110m.topo.json`).then(r => r.json()).catch(() => null),
      get('land-50m.topo.json'), get('bathy_L_0.topo.json'), get('bathy_K_200.topo.json'),
    ]);
    const firstObj = (t: Topology) => feature(t, t.objects[Object.keys(t.objects)[0]]) as any;
    this.land50 = firstObj(l50);
    this.land110 = l110 ? firstObj(l110) : this.land50;
    // Simplification can collapse a tiny ring so its winding flips and d3 reads it as "the whole sphere": drop those.
    const clean = (fc: any) => ({ ...fc, features: fc.features.filter((f: any) => f.geometry && d3.geoArea(f) < 12) });
    this.shelf0 = clean(firstObj(b0));
    this.shelf200 = clean(firstObj(b200));
    this.dirty = true;
    document.documentElement.classList.add('geo-ready');
    set({});
  }

  private onState(keys: Set<string>) {
    if (keys.has('projection')) { this.fitProjection(); this.tr = d3.zoomIdentity; this.canvas.style.cursor = state.projection === 'globe' ? 'grab' : 'default'; }
    if (keys.has('selected') && state.selected && state.view === 'map') this.focusSelection();
    this.matchIds = state.query.trim() ? new Set(ENTRIES.filter(e => this.matches(e, state.query)).map(e => e.id)) : null;
    this.dirty = true;
  }

  private matches(e: Entry, q: string) {
    const s = q.toLowerCase();
    return e.title.toLowerCase().includes(s) || e.place.toLowerCase().includes(s) || e.summary.toLowerCase().includes(s) || e.cat.includes(s);
  }

  // ---------------------------------------------------------------- layout
  resize() {
    const r = this.el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.round(r.width); this.hgt = Math.round(r.height);
    this.canvas.width = this.w * this.dpr; this.canvas.height = this.hgt * this.dpr;
    this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.hgt + 'px';
    this.fitProjection();
    this.zoomBehavior?.extent([[0, 0], [this.w, this.hgt]]).translateExtent([[0, 0], [this.w, this.hgt]]);
    this.dirty = true;
    if (this.pendingFocus) { const s = this.pendingFocus; this.pendingFocus = null; this.focusSelection(s, 4, true); }
  }
  private fitProjection() {
    if (!this.w) return;
    this.flat.fitExtent([[8, 8], [this.w - 8, this.hgt - 8]], { type: 'Sphere' } as any);
    this.baseFlat = this.flat.scale();
    this.globeBaseFit();
  }
  private globeBaseFit() {
    this.baseGlobe = Math.min(this.w, this.hgt) / 2 - 14;
  }
  private projection() {
    if (state.projection === 'globe') {
      return this.globe.scale(this.baseGlobe * this.globeK).translate([this.w / 2, this.hgt / 2]).rotate([this.rot[0], this.rot[1], 0]);
    }
    const k = this.tr.k;
    return this.flat.scale(this.baseFlat * k).translate([this.tr.k * this.w / 2 + this.tr.x, this.tr.k * this.hgt / 2 + this.tr.y]);
  }
  private zoomLevel() { return state.projection === 'globe' ? this.globeK : this.tr.k; }

  // ---------------------------------------------------------------- interaction
  private setupInteraction() {
    this.zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 60])
      .filter(ev => state.projection === 'flat' && !(ev.type === 'mousedown' && this.nearDivider(ev)))
      .on('zoom', ev => { this.tr = ev.transform; this.dirty = true; this.hideTip(); });
    d3.select(this.canvas).call(this.zoomBehavior).on('dblclick.zoom', null);

    this.canvas.addEventListener('wheel', ev => {
      if (state.projection !== 'globe') return;
      ev.preventDefault();
      this.globeK = Math.min(12, Math.max(0.8, this.globeK * Math.exp(-ev.deltaY * 0.0015)));
      this.dirty = true;
    }, { passive: false });

    this.canvas.addEventListener('pointerdown', ev => {
      const [x, y] = this.pt(ev);
      if (state.compare && this.nearDivider(ev)) { this.dragging = 'divider'; this.canvas.setPointerCapture(ev.pointerId); return; }
      if (state.projection === 'globe') {
        this.dragging = 'globe'; this.dragStart = [x, y, this.rot[0], this.rot[1]];
        this.canvas.setPointerCapture(ev.pointerId); this.canvas.style.cursor = 'grabbing';
      }
    });
    this.canvas.addEventListener('pointermove', ev => {
      const [x, y] = this.pt(ev);
      if (this.dragging === 'divider') { this.divX = Math.min(0.95, Math.max(0.05, x / this.w)); this.dirty = true; return; }
      if (this.dragging === 'globe') {
        const k = 0.28 / this.globeK;
        this.rot = [this.dragStart[2] + (x - this.dragStart[0]) * k, Math.max(-85, Math.min(85, this.dragStart[3] - (y - this.dragStart[1]) * k))];
        this.dirty = true; this.hideTip(); return;
      }
      this.hover(x, y, ev);
    });
    const end = (ev: PointerEvent) => {
      if (this.dragging) { try { this.canvas.releasePointerCapture(ev.pointerId); } catch { /* ignore */ } }
      this.dragging = null; this.canvas.style.cursor = state.projection === 'globe' ? 'grab' : 'default';
    };
    this.canvas.addEventListener('pointerup', end);
    this.canvas.addEventListener('pointercancel', end);
    this.canvas.addEventListener('pointerleave', () => { this.hideTip(); if (state.hover) set({ hover: null }); });
    this.canvas.addEventListener('click', ev => {
      const [x, y] = this.pt(ev);
      if (this.dragMoved(x, y)) return;
      const hit = this.pick(x, y);
      set({ selected: hit });
    });
    this.canvas.addEventListener('dblclick', ev => {
      const [x, y] = this.pt(ev);
      const hit = this.pick(x, y);
      if (hit) this.focusSelection(hit, 6);
    });
    this.canvas.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') set({ selected: null });
    });
  }
  private dragMoved(x: number, y: number) { return this.dragStart[0] !== 0 && Math.hypot(x - this.dragStart[0], y - this.dragStart[1]) > 4 && state.projection === 'globe'; }
  private pt(ev: MouseEvent): [number, number] { const r = this.canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
  private nearDivider(ev: MouseEvent) { if (!state.compare) return false; const [x] = this.pt(ev); return Math.abs(x - this.divX * this.w) < 10; }

  private pick(x: number, y: number): Selection {
    const list = state.compare && x > this.divX * this.w ? this.markersB : this.markersA;
    let best: Marker | null = null; let bd = 1e9;
    for (const m of list) {
      const d = Math.hypot(m.x - x, m.y - y);
      if (d <= m.r + 5 && d < bd) { best = m; bd = d; }
    }
    if (best) return { kind: best.kind, id: best.id };
    let rb: RouteHit | null = null; let rd = 6;
    for (const r of this.routeHits) {
      for (let i = 0; i < r.pts.length - 1; i++) {
        const d = segDist(x, y, r.pts[i], r.pts[i + 1]);
        if (d < rd) { rd = d; rb = r; }
      }
    }
    return rb ? { kind: 'migration', id: rb.id } : null;
  }

  private hover(x: number, y: number, ev: MouseEvent) {
    const hit = this.pick(x, y);
    const cur = state.hover;
    if ((hit?.id ?? null) !== (cur?.id ?? null)) set({ hover: hit });
    if (!hit) { this.hideTip(); this.canvas.style.cursor = state.projection === 'globe' ? 'grab' : 'default'; return; }
    this.canvas.style.cursor = 'pointer';
    const lines: [string, string][] = [];
    let title = '', sub = '';
    if (hit.kind === 'entry') {
      const e = ENTRY_BY_ID[hit.id]; title = e.title; sub = `${CATS[e.cat].label} · ${fmtRange(e.start, e.end)}`;
      lines.push(['Evidence', STATUS[e.ev].label], ['Interpretation', STATUS[e.interp].label]);
    } else if (hit.kind === 'event') {
      const e = EVENT_BY_ID[hit.id]; title = e.title; sub = `Environmental event · ${fmtRange(e.start, e.end)}`;
      lines.push(['Evidence', STATUS[e.ev].label]);
    } else {
      const m = MIGRATIONS.find(m => m.id === hit.id)!; title = m.title; sub = `${GROUP_LABELS[m.group]} · ${fmtRange(m.start, m.end)}`;
      lines.push(['Evidence', STATUS[m.ev].label], ['Model', m.model]);
    }
    this.tip.replaceChildren(h('b', null, title), h('div', { class: 'tip-sub' }, sub), ...lines.map(([k, v]) => h('div', { class: 'tip-row' }, h('span', null, k), h('span', null, v))));
    this.tip.classList.add('on');
    const tx = Math.min(this.w - 270, x + 16), ty = Math.min(this.hgt - 120, y + 14);
    this.tip.style.transform = `translate(${Math.max(8, tx)}px, ${Math.max(8, ty)}px)`;
    void ev;
  }
  private hideTip() { this.tip.classList.remove('on'); }

  /** Smoothly centre a selection. */
  focusSelection(sel: Selection = state.selected, zoom = 4, instant = false) {
    if (!sel) return;
    if (!this.w) { this.pendingFocus = sel; return; }
    let lat: number | undefined, lon: number | undefined;
    if (sel.kind === 'entry') { const e = ENTRY_BY_ID[sel.id]; lat = e?.lat; lon = e?.lon; }
    else if (sel.kind === 'event') { const e = EVENT_BY_ID[sel.id]; lat = e?.lat; lon = e?.lon; }
    else { const m = MIGRATIONS.find(m => m.id === sel.id); if (m) { const mid = m.path[Math.floor(m.path.length / 2)]; lon = mid[0]; lat = mid[1]; zoom = 2; } }
    if (lat == null || lon == null) return;
    if (state.projection === 'globe') {
      const from = [...this.rot] as [number, number]; const to: [number, number] = [-lon, -lat];
      const interp = d3.interpolate(from, to);
      d3.select(this.canvas).transition().duration(reduceMotion || instant ? 0 : 700).tween('rot', () => t => { this.rot = interp(t) as [number, number]; this.dirty = true; });
      return;
    }
    const p = this.flat.scale(this.baseFlat).translate([this.w / 2, this.hgt / 2])([lon, lat]);
    if (!p) return;
    const k = Math.max(this.tr.k, zoom);
    const t = d3.zoomIdentity.translate(this.w / 2 - p[0] * k, this.hgt / 2 - p[1] * k).scale(k);
    d3.select(this.canvas).transition().duration(reduceMotion || instant ? 0 : 700).call(this.zoomBehavior.transform as any, t);
  }
  zoomBy(f: number) {
    if (state.projection === 'globe') { this.globeK = Math.min(12, Math.max(0.8, this.globeK * f)); this.dirty = true; return; }
    d3.select(this.canvas).transition().duration(250).call(this.zoomBehavior.scaleBy as any, f);
  }
  resetView() {
    if (state.projection === 'globe') { this.globeK = 1; this.rot = [-20, -20]; this.dirty = true; return; }
    d3.select(this.canvas).transition().duration(400).call(this.zoomBehavior.transform as any, d3.zoomIdentity);
  }

  // ---------------------------------------------------------------- loop
  private loop(now: number) {
    const dt = Math.min(0.1, (now - (this.lastT || now)) / 1000); this.lastT = now;
    if (state.playing && state.view === 'map') {
      // A full pass takes ~70 s at 1x. Time moves in slider space so every era gets screen time.
      const pos = yearToPos(state.t) + state.dir * state.speed * dt / 70;
      if (pos >= 1 || pos <= 0) { set({ playing: false, t: pos >= 1 ? NOW : state.t }); }
      else set({ t: Math.round(posToYearLocal(pos)) });
      this.dirty = true;
    }
    if (state.view === 'map' && this.w && (this.dirty || this.needsAnim())) {
      this.draw(now);
      this.dirty = false;
    }
    this.raf = requestAnimationFrame(this.loop);
  }
  private needsAnim() {
    if (reduceMotion) return false;
    if (state.selected) return true;
    const p = yearToPos(state.t);
    for (const e of ENTRIES) { const d = p - yearToPos(e.start); if (d >= 0 && d < 0.03) return true; }
    return state.playing;
  }
  destroy() { cancelAnimationFrame(this.raf); }

  // ---------------------------------------------------------------- drawing
  private draw(now: number) {
    const { ctx, w, hgt: H, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, H);
    const proj = this.projection();
    if (state.compare) {
      const x = this.divX * w;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip();
      this.markersA = this.scene(ctx, proj, state.t, now);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(x, 0, w - x, H); ctx.clip();
      this.markersB = this.scene(ctx, proj, state.tB, now, true);
      ctx.restore();
      // divider
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.fillStyle = '#e8eefc'; ctx.beginPath(); ctx.arc(x, H / 2, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a1424'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('↔', x, H / 2 + 0.5);
      this.badge(ctx, 12, H - 36, 'A · ' + fmtYear(state.t));
      this.badge(ctx, w - 12, H - 36, 'B · ' + fmtYear(state.tB), true);
    } else {
      this.markersA = this.scene(ctx, proj, state.t, now);
      this.markersB = [];
    }
  }
  private badge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, right = false) {
    ctx.font = '600 12px system-ui'; const wd = ctx.measureText(text).width + 16;
    const bx = right ? x - wd : x;
    ctx.fillStyle = 'rgba(8,16,30,0.85)'; ctx.strokeStyle = 'rgba(160,190,255,0.4)'; ctx.lineWidth = 1;
    roundRect(ctx, bx, y, wd, 24, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8eefc'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 8, y + 12.5);
  }

  private scene(ctx: CanvasRenderingContext2D, proj: d3.GeoProjection, t: number, now: number, isB = false): Marker[] {
    const path = d3.geoPath(proj, ctx);
    const globe = state.projection === 'globe';
    // --- ocean
    ctx.fillStyle = OCEAN;
    if (globe) {
      const g = ctx.createRadialGradient(this.w / 2 - 60, this.hgt / 2 - 60, 20, this.w / 2, this.hgt / 2, this.baseGlobe * this.globeK);
      g.addColorStop(0, '#0d2036'); g.addColorStop(1, '#050d19');
      ctx.fillStyle = g; ctx.beginPath(); path({ type: 'Sphere' } as any); ctx.fill();
      ctx.strokeStyle = 'rgba(120,170,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    } else {
      ctx.beginPath(); path({ type: 'Sphere' } as any); ctx.fill();
    }
    // --- shelf exposure: schematic, driven by global sea level
    const sl = seaLevel(t);
    const k = this.zoomLevel();
    const land = k > 3 && this.land50 ? this.land50 : this.land110;
    if (state.showShelf && this.shelf0 && sl.grade !== 'none') {
      const a = Math.max(0, Math.min(1, -sl.m / 130));
      if (a > 0.02) {
        ctx.globalAlpha = 0.18 + 0.55 * a * (sl.grade === 'schematic' ? 0.7 : 1);
        ctx.fillStyle = SHELF; ctx.beginPath(); path(this.shelf0); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = globe ? '#08172a' : OCEAN; ctx.beginPath(); path(this.shelf200); ctx.fill();
        if (globe) { /* gradient lost under the deep-water patch on the globe: acceptable at this fidelity */ }
        ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(201,165,106,0.35)'; ctx.lineWidth = 0.8; ctx.beginPath(); path(this.shelf200); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // --- graticule, land
    ctx.strokeStyle = GRATICULE; ctx.lineWidth = 0.6; ctx.beginPath(); path(this.grat); ctx.stroke();
    if (land) {
      ctx.fillStyle = LAND; ctx.beginPath(); path(land); ctx.fill();
      ctx.strokeStyle = LAND_EDGE; ctx.lineWidth = k > 6 ? 1 : 0.7; ctx.stroke();
    }

    const markers: Marker[] = [];
    const screen = (lon: number, lat: number): [number, number] | null => {
      if (globe) {
        const c = [-this.rot[0], -this.rot[1]] as [number, number];
        if (d3.geoDistance([lon, lat], c) > Math.PI / 2 - 0.02) return null;
      }
      const p = proj([lon, lat]);
      return p ? [p[0], p[1]] : null;
    };

    // --- migration routes
    this.routeHits = isB ? this.routeHits : [];
    if (state.showRoutes) {
      for (const m of MIGRATIONS) {
        if (state.routeGroups.size && !state.routeGroups.has(m.group)) continue;
        const ph = phase(m.start, m.end, t);
        if (ph === 'future') continue;
        const prog = ph === 'past' ? 1 : (t - m.start) / Math.max(1, m.end - m.start);
        if (ph === 'past' && !state.showGhosts) continue;
        const col = GROUP_COLORS[m.group] ?? '#9aa8ff';
        const sub = subPath(DENSE[m.id], prog);
        const sel = state.selected?.kind === 'migration' && state.selected.id === m.id;
        const hov = state.hover?.kind === 'migration' && state.hover.id === m.id;
        ctx.save();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const contradicted = m.ev === 'E8';
        ctx.strokeStyle = contradicted ? STATUS.E8.color : col;
        ctx.globalAlpha = ph === 'past' ? (sel || hov ? 0.9 : 0.32) : 0.95;
        ctx.lineWidth = (sel || hov ? 3.4 : 2.2) * (m.dateConfidence === 'low' ? 0.9 : 1);
        const dash = contradicted ? [2, 5] : (m.ev === 'E3' || m.ev === 'E5') ? [7, 4] : [];
        ctx.setLineDash(dash.length ? dash : [0]); if (!dash.length) ctx.setLineDash([]);
        if (!reduceMotion && ph === 'active') ctx.lineDashOffset = -((now / 60) % 22);
        ctx.beginPath(); path({ type: 'LineString', coordinates: sub } as any); ctx.stroke();
        ctx.restore();
        // hit geometry in screen space (sampled)
        if (!isB) {
          const pts: [number, number][] = [];
          const step = Math.max(1, Math.floor(sub.length / 80));
          for (let i = 0; i < sub.length; i += step) { const s = screen(sub[i][0], sub[i][1]); if (s) pts.push(s); }
          if (pts.length > 1) this.routeHits.push({ id: m.id, pts });
        }
        // moving head while active
        if (ph === 'active') {
          const head = sub[sub.length - 1]; const s = screen(head[0], head[1]);
          if (s) {
            ctx.fillStyle = col; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(s[0], s[1], 9, 0, 7); ctx.fill();
            ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(s[0], s[1], 3.6, 0, 7); ctx.fill();
          }
        }
        if (prog > 0 && (sel || hov)) {
          const first = DENSE[m.id].pts[0]; const s = screen(first[0], first[1]);
          if (s) { ctx.fillStyle = '#fff'; ctx.font = '600 11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(m.model, s[0] + 8, s[1] - 10); }
        }
      }
    }

    // --- evidence links of the selection (drawn under markers)
    const sel = state.selected;
    const selNodeId = sel && sel.kind !== 'migration' ? sel.id : null;
    if (state.showLinks && selNodeId) {
      for (const { link, other } of linksOf(selNodeId)) {
        const a = nodePos(selNodeId), b = nodePos(other);
        if (!a || !b) continue;
        const rel = REL[link.rel];
        ctx.save();
        ctx.strokeStyle = rel.color; ctx.globalAlpha = link.conf === 'high' ? 0.9 : link.conf === 'medium' ? 0.65 : 0.4;
        ctx.lineWidth = link.conf === 'high' ? 2 : 1.4;
        ctx.setLineDash(rel.dash ? rel.dash.split(' ').map(Number) : []);
        ctx.beginPath(); path({ type: 'LineString', coordinates: [a, b] } as any); ctx.stroke();
        ctx.restore();
      }
    }

    // --- environmental events
    const labels: { x: number; y: number; text: string; pri: number }[] = [];
    if (state.showEvents) {
      for (const ev of EVENTS) {
        if (ev.lat == null || ev.lon == null) continue;
        const ph = phase(ev.start, ev.end, t);
        if (ph === 'future') continue;
        if (ph === 'past' && !state.showGhosts) continue;
        const s = screen(ev.lon, ev.lat); if (!s) continue;
        const act = ph === 'active';
        const selected = sel?.kind === 'event' && sel.id === ev.id;
        const r = act ? 7 : 4;
        ctx.save(); ctx.translate(s[0], s[1]); ctx.rotate(Math.PI / 4);
        if (act && !reduceMotion) {
          const pulse = ((now / 1200) % 1);
          ctx.strokeStyle = `rgba(255,157,77,${0.55 * (1 - pulse)})`; ctx.lineWidth = 2;
          const pr = r + pulse * 22; ctx.strokeRect(-pr, -pr, pr * 2, pr * 2);
        }
        ctx.globalAlpha = act ? 1 : 0.3;
        ctx.fillStyle = act ? '#ff9d4d' : '#9b7a5a'; ctx.strokeStyle = selected ? '#fff' : STATUS[ev.ev].color; ctx.lineWidth = selected ? 2.4 : 1.6;
        ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); ctx.strokeRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
        ctx.restore();
        markers.push({ kind: 'event', id: ev.id, x: s[0], y: s[1], r: r + 2 });
        if (act && (k > 2 || selected)) labels.push({ x: s[0] + 10, y: s[1], text: ev.title, pri: selected ? 100 : 40 });
      }
    }

    // --- entries
    const pNow = yearToPos(t);
    const order = [...ENTRIES].sort((a, b) => b.priority.localeCompare(a.priority));
    for (const e of order) {
      if (!state.layers.has(e.cat) || !state.statuses.has(e.ev)) continue;
      const ph = phase(e.start, e.end, t);
      if (ph === 'future') continue;
      if (ph === 'past' && !state.showGhosts) continue;
      const s = screen(e.lon, e.lat); if (!s) continue;
      const dim = this.matchIds && !this.matchIds.has(e.id);
      const selected = sel?.kind === 'entry' && sel.id === e.id;
      const hovered = state.hover?.kind === 'entry' && state.hover.id === e.id;
      const linked = selNodeId && linksOf(selNodeId).some(l => l.other === e.id);
      const base = e.priority === 'P1' ? 6.2 : e.priority === 'P2' ? 5 : 4;
      const act = ph === 'active';
      const r = (act ? base : base * 0.62) * (selected || hovered ? 1.35 : 1);
      const fill = this.fillColor(e), ring = this.ringColor(e);
      ctx.save();
      ctx.globalAlpha = dim ? 0.12 : act ? 1 : 0.28;
      // freshly started: expanding ring
      const age = pNow - yearToPos(e.start);
      if (act && !reduceMotion && age >= 0 && age < 0.03) {
        const f = ((now / 900) % 1);
        ctx.strokeStyle = fill; ctx.globalAlpha = (dim ? 0.1 : 0.7) * (1 - f); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s[0], s[1], r + 3 + f * 26, 0, 7); ctx.stroke(); ctx.globalAlpha = dim ? 0.12 : 1;
      }
      ctx.beginPath(); ctx.arc(s[0], s[1], r, 0, 7);
      if (e.dateKind === 'claimed') { ctx.fillStyle = hexA(fill, 0.35); ctx.fill(); ctx.setLineDash([2.2, 2.2]); }
      else { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = selected ? '#ffffff' : ring; ctx.lineWidth = selected ? 2.6 : 1.8; ctx.stroke(); ctx.setLineDash([]);
      if (selected) { const f = reduceMotion ? 0 : ((now / 1100) % 1); ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - f)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(s[0], s[1], r + 4 + f * 14, 0, 7); ctx.stroke(); }
      else if (linked) { ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(s[0], s[1], r + 4, 0, 7); ctx.stroke(); }
      ctx.restore();
      markers.push({ kind: 'entry', id: e.id, x: s[0], y: s[1], r: Math.max(r, 5) });
      if (dim) continue;
      const showLabel = selected || hovered || linked || (act && ((e.priority === 'P1' && k > 1.7) || (e.priority === 'P2' && k > 3.2) || k > 7));
      if (showLabel) labels.push({ x: s[0] + r + 5, y: s[1], text: e.title, pri: selected ? 100 : hovered ? 90 : linked ? 60 : e.priority === 'P1' ? 30 : 10 });
    }

    // --- labels with simple overlap rejection
    labels.sort((a, b) => b.pri - a.pri);
    const boxes: [number, number, number, number][] = [];
    ctx.font = '600 11.5px system-ui'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const l of labels) {
      const wd = ctx.measureText(l.text).width;
      const box: [number, number, number, number] = [l.x - 3, l.y - 9, l.x + wd + 3, l.y + 9];
      if (l.pri < 90 && boxes.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
      boxes.push(box);
      ctx.fillStyle = 'rgba(6,14,27,0.78)'; roundRect(ctx, box[0], box[1], box[2] - box[0], 18, 4); ctx.fill();
      ctx.fillStyle = '#e9f0ff'; ctx.fillText(l.text, l.x, l.y + 0.5);
    }
    return markers;
  }

  private fillColor(e: Entry) {
    return state.colorBy === 'category' ? CATS[e.cat].color : state.colorBy === 'evidence' ? STATUS[e.ev].color : STATUS[e.interp].color;
  }
  private ringColor(e: Entry) {
    return state.colorBy === 'interpretation' ? STATUS[e.ev].color : STATUS[e.interp].color;
  }
}

// ---- helpers
function nodePos(id: string): [number, number] | null {
  const e = ENTRY_BY_ID[id]; if (e) return [e.lon, e.lat];
  const v = EVENT_BY_ID[id]; if (v && v.lat != null && v.lon != null) return [v.lon, v.lat];
  return null;
}
function segDist(px: number, py: number, a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - a[0]) * dx + (py - a[1]) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hgt: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hgt, r); ctx.arcTo(x + w, y + hgt, x, y + hgt, r);
  ctx.arcTo(x, y + hgt, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
import { posToYear as posToYearLocal } from '../lib/time';
export { GROUP_COLORS, STATUS_ORDER };
