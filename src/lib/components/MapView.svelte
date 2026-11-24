<script lang="ts" module>
  import * as d3 from 'd3';
  import { ENTRY_BY_ID, EVENT_BY_ID, MIGRATIONS } from '#data';
  import type { Entry, Migration } from '../../types';
  import type { Selection } from '$lib/app.svelte';

  const OCEAN = '#06101d';
  const LAND = '#16233a';
  const LAND_EDGE = '#31496b';
  const SHELF = '#c9a56a';
  const GRATICULE = 'rgba(120,150,200,0.10)';

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
</script>
<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { feature } from 'topojson-client';
  import { base } from '$app/paths';
  import { ENTRIES, EVENTS, linksOf } from '#data';
  import { CATS, REL, STATUS } from '$lib/classification';
  import { GROUP_COLORS, GROUP_LABELS } from '$lib/groups';
  import { app } from '$lib/app.svelte';
  import { seaLevel, yearToPos, posToYear, fmtRange, fmtYear, phase, NOW } from '$lib/time';

  type Topology = any;
  let el: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let tip = $state<{ title: string; sub: string; lines: [string, string][]; tx: number; ty: number } | null>(null);
  let w = 0, hgt = 0, dpr = 1;
  const flatP = d3.geoNaturalEarth1();
  const globeP = d3.geoOrthographic().clipAngle(90);
  let baseFlat = 1, baseGlobe = 1;
  let tr: d3.ZoomTransform = d3.zoomIdentity;
  let rot: [number, number] = [-20, -20];
  let globeK = 1;
  let land110: any = null, land50: any = null, shelf0: any = null, shelf200: any = null;
  let dirty = true;
  let divX = 0.5;
  let markersA: Marker[] = [], markersB: Marker[] = [];
  let routeHits: RouteHit[] = [];
  let zoomBehavior!: d3.ZoomBehavior<HTMLCanvasElement, unknown>;
  let raf = 0, lastT = 0;
  let dragging: null | 'globe' | 'divider' = null;
  let dragStart: [number, number, number, number] = [0, 0, 0, 0];
  const grat = d3.geoGraticule10();
  let matchIds: Set<string> | null = null;
  let pendingFocus: Selection = null;
  let inset = 0;                       // bottom area covered by the phone sheet; the focus point is centred above it
  const pointers = new Map<number, [number, number]>();
  let pinch = 0;
  let coarse = false;
  let reduceMotion = false;

  async function loadGeo() {
    const get = (f: string) => fetch(`${base}/data/${f}`).then(r => r.json());
    const [l110, l50, b0, b200] = await Promise.all([
      fetch(`${base}/data/land-110m.topo.json`).then(r => r.json()).catch(() => null),
      get('land-50m.topo.json'), get('bathy_L_0.topo.json'), get('bathy_K_200.topo.json'),
    ]);
    const firstObj = (t: Topology) => feature(t, t.objects[Object.keys(t.objects)[0]]) as any;
    land50 = firstObj(l50);
    land110 = l110 ? firstObj(l110) : land50;
    // Simplification can collapse a tiny ring so its winding flips and d3 reads it as "the whole sphere": drop those.
    const clean = (fc: any) => ({ ...fc, features: fc.features.filter((f: any) => f.geometry && d3.geoArea(f) < 12) });
    shelf0 = clean(firstObj(b0));
    shelf200 = clean(firstObj(b200));
    dirty = true;
    document.documentElement.classList.add('geo-ready');
    app.geoReady = true;
  }

  function matches(e: Entry, q: string) {
    const s = q.toLowerCase();
    return e.title.toLowerCase().includes(s) || e.place.toLowerCase().includes(s) || e.summary.toLowerCase().includes(s) || e.cat.includes(s);
  }

  // ---------------------------------------------------------------- layout
  function resize() {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = Math.round(r.width); hgt = Math.round(r.height);
    canvas.width = w * dpr; canvas.height = hgt * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = hgt + 'px';
    fitProjection();
    zoomBehavior?.extent([[0, 0], [w, hgt]]).translateExtent([[0, 0], [w, hgt]]);
    dirty = true;
    if (pendingFocus) { const s = pendingFocus; pendingFocus = null; focusSelection(s, 4, true); }
  }
  function fitProjection() {
    if (!w) return;
    flatP.fitExtent([[8, 8], [w - 8, hgt - 8]], { type: 'Sphere' } as any);
    baseFlat = flatP.scale();
    globeBaseFit();
  }
  function globeBaseFit() {
    baseGlobe = Math.min(w, hgt) / 2 - 14;
  }
  function projection() {
    if (app.projection === 'globe') {
      return globeP.scale(baseGlobe * globeK).translate([w / 2, (hgt - inset) / 2]).rotate([rot[0], rot[1], 0]);
    }
    const k = tr.k;
    return flatP.scale(baseFlat * k).translate([tr.k * w / 2 + tr.x, tr.k * hgt / 2 + tr.y]);
  }
  function zoomLevel() { return app.projection === 'globe' ? globeK : tr.k; }

  // ---------------------------------------------------------------- interaction
  function setupInteraction() {
    zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 60])
      .filter(ev => app.projection === 'flat' && !(ev.type === 'mousedown' && nearDivider(ev)))
      .on('zoom', ev => { tr = ev.transform; dirty = true; hideTip(); });
    d3.select(canvas).call(zoomBehavior).on('dblclick.zoom', null);

    canvas.addEventListener('wheel', ev => {
      if (app.projection !== 'globe') return;
      ev.preventDefault();
      globeK = Math.min(12, Math.max(0.8, globeK * Math.exp(-ev.deltaY * 0.0015)));
      dirty = true;
    }, { passive: false });

    canvas.addEventListener('pointerdown', ev => {
      const [x, y] = pt(ev);
      pointers.set(ev.pointerId, [x, y]);
      if (pointers.size === 2 && app.projection === 'globe') { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); dragging = null; return; }
      if (app.compare && nearDivider(ev)) { dragging = 'divider'; canvas.setPointerCapture(ev.pointerId); return; }
      if (app.projection === 'globe') {
        dragging = 'globe'; dragStart = [x, y, rot[0], rot[1]];
        canvas.setPointerCapture(ev.pointerId); canvas.style.cursor = 'grabbing';
      }
    });
    canvas.addEventListener('pointermove', ev => {
      const [x, y] = pt(ev);
      if (pointers.has(ev.pointerId)) pointers.set(ev.pointerId, [x, y]);
      if (pointers.size === 2 && app.projection === 'globe' && pinch) {
        const [a, b] = [...pointers.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        globeK = Math.min(12, Math.max(0.8, globeK * (d / pinch))); pinch = d; dirty = true; return;
      }
      if (dragging === 'divider') { divX = Math.min(0.95, Math.max(0.05, x / w)); dirty = true; return; }
      if (dragging === 'globe') {
        const k = 0.28 / globeK;
        rot = [dragStart[2] + (x - dragStart[0]) * k, Math.max(-85, Math.min(85, dragStart[3] - (y - dragStart[1]) * k))];
        dirty = true; hideTip(); return;
      }
      hover(x, y, ev);
    });
    const end = (ev: PointerEvent) => {
      pointers.delete(ev.pointerId); if (pointers.size < 2) pinch = 0;
      if (dragging) { try { canvas.releasePointerCapture(ev.pointerId); } catch { /* ignore */ } }
      dragging = null; canvas.style.cursor = app.projection === 'globe' ? 'grab' : 'default';
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', () => { hideTip(); if (app.hover) app.hover = null; });
    canvas.addEventListener('click', ev => {
      const [x, y] = pt(ev);
      if (dragMoved(x, y)) return;
      const hit = pick(x, y);
      app.selected = hit;
    });
    canvas.addEventListener('dblclick', ev => {
      const [x, y] = pt(ev);
      const hit = pick(x, y);
      if (hit) focusSelection(hit, 6);
    });
    canvas.addEventListener('keydown', ev => onKey(ev));
    canvas.addEventListener('blur', () => { kbSnap = null; if (app.hover) app.hover = null; });
  }
  /** Keyboard access: arrows / PageUp / PageDown step through the visible records (west to east, then north to south), Enter selects, +/- zoom. */
  let kb = -1;
  let kbSnap: Marker[] | null = null;
  function onKey(ev: KeyboardEvent) {
    // one snapshot per keyboard session so "n of m" stays stable while the markers pulse and move
    if (!kbSnap) kbSnap = [...markersA].sort((a, b) => a.x - b.x || a.y - b.y);
    const list = kbSnap;
    const step = (d: number) => {
      if (!list.length) return;
      const cur = app.hover ? list.findIndex(m => m.id === app.hover!.id) : -1;
      kb = (cur < 0 ? (d > 0 ? 0 : list.length - 1) : (cur + d + list.length) % list.length);
      const m = list[kb]; app.hover = { kind: m.kind, id: m.id };
      const e = m.kind === 'entry' ? ENTRY_BY_ID[m.id] : null; const v = m.kind === 'event' ? EVENT_BY_ID[m.id] : null;
      const live = document.getElementById('sr-live');
      if (live) live.textContent = e ? `${e.title}. ${CATS[e.cat].label}, ${fmtRange(e.start, e.end)}. Evidence ${e.ev}, interpretation ${e.interp}. ${kb + 1} of ${list.length}. Press Enter for the record.` : v ? `${v.title}, environmental event. ${kb + 1} of ${list.length}.` : '';
    };
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(ev.key)) { ev.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(ev.key)) { ev.preventDefault(); step(-1); }
    else if ((ev.key === 'Enter' || ev.key === ' ') && app.hover) { ev.preventDefault(); app.selected = app.hover; }
    else if (ev.key === '+' || ev.key === '=') zoomBy(1.4);
    else if (ev.key === '-') zoomBy(1 / 1.4);
    else if (ev.key === 'Escape') { kbSnap = null; app.selected = null; app.hover = null; }
  }
  function dragMoved(x: number, y: number) { return dragStart[0] !== 0 && Math.hypot(x - dragStart[0], y - dragStart[1]) > 4 && app.projection === 'globe'; }
  function pt(ev: MouseEvent): [number, number] { const r = canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
  function nearDivider(ev: MouseEvent) { if (!app.compare) return false; const [x] = pt(ev); return Math.abs(x - divX * w) < 10; }

  function pick(x: number, y: number): Selection {
    const list = app.compare && x > divX * w ? markersB : markersA;
    let best: Marker | null = null; let bd = 1e9;
    for (const m of list) {
      const d = Math.hypot(m.x - x, m.y - y);
      if (d <= m.r + (coarse ? 14 : 5) && d < bd) { best = m; bd = d; }
    }
    if (best) return { kind: best.kind, id: best.id };
    let rb: RouteHit | null = null; let rd = 6;
    for (const r of routeHits) {
      for (let i = 0; i < r.pts.length - 1; i++) {
        const d = segDist(x, y, r.pts[i], r.pts[i + 1]);
        if (d < rd) { rd = d; rb = r; }
      }
    }
    return rb ? { kind: 'migration', id: rb.id } : null;
  }

  function hover(x: number, y: number, ev: MouseEvent) {
    const hit = pick(x, y);
    const cur = app.hover;
    if ((hit?.id ?? null) !== (cur?.id ?? null)) app.hover = hit;
    if (!hit) { hideTip(); canvas.style.cursor = app.projection === 'globe' ? 'grab' : 'default'; return; }
    canvas.style.cursor = 'pointer';
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
    const tx = Math.min(w - 270, x + 16), ty = Math.min(hgt - 120, y + 14);
    tip = { title, sub, lines, tx: Math.max(8, tx), ty: Math.max(8, ty) };
    void ev;
  }
  function hideTip() { if (tip) tip = null; }

  /** Smoothly centre a selection. */
  function focusSelection(sel: Selection = app.selected, zoom = 4, instant = false) {
    if (!sel) return;
    if (!w) { pendingFocus = sel; return; }
    const dr = document.querySelector('.drawer') as HTMLElement | null;
    const toInset = innerWidth < 720 ? Math.round(dr?.offsetHeight || hgt * 0.5) : 0;
    let lat: number | undefined, lon: number | undefined;
    if (sel.kind === 'entry') { const e = ENTRY_BY_ID[sel.id]; lat = e?.lat; lon = e?.lon; }
    else if (sel.kind === 'event') { const e = EVENT_BY_ID[sel.id]; lat = e?.lat; lon = e?.lon; }
    else { const m = MIGRATIONS.find(m => m.id === sel.id); if (m) { const mid = m.path[Math.floor(m.path.length / 2)]; lon = mid[0]; lat = mid[1]; zoom = 2; } }
    if (lat == null || lon == null) return;
    if (app.projection === 'globe') {
      const from = [...rot] as [number, number]; const to: [number, number] = [-lon, -lat];
      const interp = d3.interpolate(from, to);
      const i0 = inset;
      d3.select(canvas).transition().duration(reduceMotion || instant ? 0 : 700).tween('rot', () => t => { rot = interp(t) as [number, number]; inset = i0 + (toInset - i0) * t; dirty = true; });
      return;
    }
    const p = flatP.scale(baseFlat).translate([w / 2, hgt / 2])([lon, lat]);
    if (!p) return;
    const k = Math.max(tr.k, zoom);
    const t = d3.zoomIdentity.translate(w / 2 - p[0] * k, (hgt - toInset) / 2 - p[1] * k).scale(k);
    d3.select(canvas).transition().duration(reduceMotion || instant ? 0 : 700).call(zoomBehavior.transform as any, t);
  }
  function zoomBy(f: number) {
    if (app.projection === 'globe') { globeK = Math.min(12, Math.max(0.8, globeK * f)); dirty = true; return; }
    d3.select(canvas).transition().duration(250).call(zoomBehavior.scaleBy as any, f);
  }
  function resetView() {
    if (app.projection === 'globe') { globeK = 1; rot = [-20, -20]; dirty = true; return; }
    d3.select(canvas).transition().duration(400).call(zoomBehavior.transform as any, d3.zoomIdentity);
  }

  // ---------------------------------------------------------------- loop
  function loop(now: number) {
    const dt = Math.min(0.1, (now - (lastT || now)) / 1000); lastT = now;
    if (app.playing) {
      // A full pass takes ~70 s at 1x. Time moves in slider space so every era gets screen time.
      const pos = yearToPos(app.t) + app.dir * app.speed * dt / 70;
      if (pos >= 1 || pos <= 0) { app.playing = false; app.t = pos >= 1 ? NOW : app.t; }
      else app.t = Math.round(posToYear(pos));
      dirty = true;
    }
    if (w && (dirty || needsAnim())) {
      draw(now);
      dirty = false;
    }
    raf = requestAnimationFrame(loop);
  }
  function needsAnim() {
    if (reduceMotion) return false;
    if (app.selected) return true;
    const p = yearToPos(app.t);
    for (const e of ENTRIES) { const d = p - yearToPos(e.start); if (d >= 0 && d < 0.03) return true; }
    return app.playing;
  }

  // ---------------------------------------------------------------- drawing
  function draw(now: number) {
    const H = hgt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, H);
    const proj = projection();
    if (app.compare) {
      const x = divX * w;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip();
      markersA = scene(ctx, proj, app.t, now);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(x, 0, w - x, H); ctx.clip();
      markersB = scene(ctx, proj, app.tB, now, true);
      ctx.restore();
      // divider
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.fillStyle = '#e8eefc'; ctx.beginPath(); ctx.arc(x, H / 2, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a1424'; ctx.font = '700 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('↔', x, H / 2 + 0.5);
      badge(ctx, 12, H - 36, 'A · ' + fmtYear(app.t));
      badge(ctx, w - 12, H - 36, 'B · ' + fmtYear(app.tB), true);
    } else {
      markersA = scene(ctx, proj, app.t, now);
      markersB = [];
    }
  }
  function badge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, right = false) {
    ctx.font = '600 12px system-ui'; const wd = ctx.measureText(text).width + 16;
    const bx = right ? x - wd : x;
    ctx.fillStyle = 'rgba(8,16,30,0.85)'; ctx.strokeStyle = 'rgba(160,190,255,0.4)'; ctx.lineWidth = 1;
    roundRect(ctx, bx, y, wd, 24, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8eefc'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 8, y + 12.5);
  }

  function scene(ctx: CanvasRenderingContext2D, proj: d3.GeoProjection, t: number, now: number, isB = false): Marker[] {
    const path = d3.geoPath(proj, ctx);
    const globe = app.projection === 'globe';
    // --- ocean
    ctx.fillStyle = OCEAN;
    if (globe) {
      const g = ctx.createRadialGradient(w / 2 - 60, hgt / 2 - 60, 20, w / 2, hgt / 2, baseGlobe * globeK);
      g.addColorStop(0, '#0d2036'); g.addColorStop(1, '#050d19');
      ctx.fillStyle = g; ctx.beginPath(); path({ type: 'Sphere' } as any); ctx.fill();
      ctx.strokeStyle = 'rgba(120,170,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    } else {
      ctx.beginPath(); path({ type: 'Sphere' } as any); ctx.fill();
    }
    // --- shelf exposure: schematic, driven by global sea level
    const sl = seaLevel(t);
    const k = zoomLevel();
    const land = k > 3 && land50 ? land50 : land110;
    if (app.showShelf && shelf0 && sl.grade !== 'none') {
      const a = Math.max(0, Math.min(1, -sl.m / 130));
      if (a > 0.02) {
        ctx.globalAlpha = 0.18 + 0.55 * a * (sl.grade === 'schematic' ? 0.7 : 1);
        ctx.fillStyle = SHELF; ctx.beginPath(); path(shelf0); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = globe ? '#08172a' : OCEAN; ctx.beginPath(); path(shelf200); ctx.fill();
        if (globe) { /* gradient lost under the deep-water patch on the globe: acceptable at this fidelity */ }
        ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(201,165,106,0.35)'; ctx.lineWidth = 0.8; ctx.beginPath(); path(shelf200); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // --- graticule, land
    ctx.strokeStyle = GRATICULE; ctx.lineWidth = 0.6; ctx.beginPath(); path(grat); ctx.stroke();
    if (land) {
      ctx.fillStyle = LAND; ctx.beginPath(); path(land); ctx.fill();
      ctx.strokeStyle = LAND_EDGE; ctx.lineWidth = k > 6 ? 1 : 0.7; ctx.stroke();
    }

    const markers: Marker[] = [];
    const screen = (lon: number, lat: number): [number, number] | null => {
      if (globe) {
        const c = [-rot[0], -rot[1]] as [number, number];
        if (d3.geoDistance([lon, lat], c) > Math.PI / 2 - 0.02) return null;
      }
      const p = proj([lon, lat]);
      return p ? [p[0], p[1]] : null;
    };

    // --- migration routes
    routeHits = isB ? routeHits : [];
    if (app.showRoutes) {
      for (const m of MIGRATIONS) {
        if (app.routeGroups.size && !app.routeGroups.has(m.group)) continue;
        const ph = phase(m.start, m.end, t);
        if (ph === 'future') continue;
        const prog = ph === 'past' ? 1 : (t - m.start) / Math.max(1, m.end - m.start);
        if (ph === 'past' && !app.showGhosts) continue;
        const col = GROUP_COLORS[m.group] ?? '#9aa8ff';
        const sub = subPath(DENSE[m.id], prog);
        const sel = app.selected?.kind === 'migration' && app.selected.id === m.id;
        const hov = app.hover?.kind === 'migration' && app.hover.id === m.id;
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
          if (pts.length > 1) routeHits.push({ id: m.id, pts });
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
          if (s) { ctx.fillStyle = '#fff'; ctx.font = '600 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(m.model, s[0] + 8, s[1] - 10); }
        }
      }
    }

    // --- evidence links of the selection (drawn under markers)
    const sel = app.selected;
    const selNodeId = sel && sel.kind !== 'migration' ? sel.id : null;
    if (app.showLinks && selNodeId) {
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
    if (app.showEvents) {
      for (const ev of EVENTS) {
        if (ev.lat == null || ev.lon == null) continue;
        const ph = phase(ev.start, ev.end, t);
        if (ph === 'future') continue;
        if (ph === 'past' && !app.showGhosts) continue;
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
      if (!app.layers.has(e.cat) || !app.statuses.has(e.ev)) continue;
      const ph = phase(e.start, e.end, t);
      if (ph === 'future') continue;
      if (ph === 'past' && !app.showGhosts) continue;
      const s = screen(e.lon, e.lat); if (!s) continue;
      const dim = matchIds && !matchIds.has(e.id);
      const selected = sel?.kind === 'entry' && sel.id === e.id;
      const hovered = app.hover?.kind === 'entry' && app.hover.id === e.id;
      const linked = selNodeId && linksOf(selNodeId).some(l => l.other === e.id);
      const base = (e.priority === 'P1' ? 6.2 : e.priority === 'P2' ? 5 : 4) * (coarse ? 1.3 : 1);
      const act = ph === 'active';
      const r = (act ? base : base * 0.62) * (selected || hovered ? 1.35 : 1);
      const fill = fillColor(e), ring = ringColor(e);
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
    ctx.font = '600 12px system-ui'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
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

  function fillColor(e: Entry) {
    return app.colorBy === 'category' ? CATS[e.cat].color : app.colorBy === 'evidence' ? STATUS[e.ev].color : STATUS[e.interp].color;
  }
  function ringColor(e: Entry) {
    return app.colorBy === 'interpretation' ? STATUS[e.ev].color : STATUS[e.interp].color;
  }

  export { zoomBy, resetView, focusSelection, resize };

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    coarse = matchMedia('(pointer: coarse)').matches;
    reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ro = new ResizeObserver(() => resize());
    ro.observe(el);
    setupInteraction();
    loadGeo();
    raf = requestAnimationFrame(loop);
    resize();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  });

  // projection switch: refit, reset the zoom transform, change the cursor
  $effect(() => {
    const p = app.projection;
    untrack(() => { if (!canvas) return; fitProjection(); tr = d3.zoomIdentity; canvas.style.cursor = p === 'globe' ? 'grab' : 'default'; dirty = true; });
  });
  // selection: focus it; clearing it eases the phone inset back
  let prevSel: Selection = null;
  $effect(() => {
    const s = app.selected;
    untrack(() => {
      if (!canvas) return;
      if (s && s !== prevSel) focusSelection(s);
      if (!s && prevSel && inset) { const i0 = inset; d3.select(canvas).transition().duration(reduceMotion ? 0 : 350).tween('inset', () => t => { inset = i0 * (1 - t); dirty = true; }); }
      prevSel = s;
    });
  });
  // anything that changes what is drawn
  $effect(() => {
    void [app.t, app.tB, app.compare, app.selected, app.hover, app.showEvents, app.showRoutes, app.showGhosts, app.showShelf, app.showLinks, app.colorBy, app.projection, app.query, app.layers.size, app.statuses.size, app.routeGroups.size];
    void [...app.layers]; void [...app.statuses]; void [...app.routeGroups];
    const q = app.query;
    matchIds = q.trim() ? new Set(ENTRIES.filter(e => matches(e, q)).map(e => e.id)) : null;
    dirty = true;
  });
</script>

<div class="map-wrap" bind:this={el}>
  <canvas class="map-canvas" bind:this={canvas} tabindex="0" aria-label="Interactive evidence map. Arrow keys step through the records shown, Enter opens one, plus and minus zoom. The time slider moves through history."></canvas>
  <div class="tip" class:on={!!tip} role="status" style={tip ? `transform: translate(${tip.tx}px, ${tip.ty}px)` : ''}>
    {#if tip}
      <b>{tip.title}</b><div class="tip-sub">{tip.sub}</div>
      {#each tip.lines as [k, v]}<div class="tip-row"><span>{k}</span><span>{v}</span></div>{/each}
    {/if}
  </div>
</div>
