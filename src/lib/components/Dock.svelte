<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ENTRIES, ENTRY_BY_ID, EVENTS, EVENT_BY_ID, MIGRATIONS } from '#data';
  import { app } from '$lib/app.svelte';
  import { ANCHORS, fmtYear, posToYear, yearToPos, seaLevel, bp, bce, NOW, phase } from '$lib/time';

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

  let track: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let w = 0; const hh = 64;
  let cache: { act: number[]; sea: number[] } | null = null;

  function togglePlay() {
    if (!app.playing && yearToPos(app.t) >= 0.999 && app.dir === 1) app.t = ANCHORS[0];
    app.playing = !app.playing;
  }
  function jump(dir: 1 | -1) {
    const times = new Set<number>();
    for (const e of ENTRIES) if (app.layers.has(e.cat)) times.add(e.start);
    for (const e of EVENTS) times.add(e.start);
    const arr = [...times].sort((a, b) => a - b);
    const t = app.t;
    const next = dir === 1 ? arr.find(x => x > t + 0.5) : [...arr].reverse().find(x => x < t - 0.5);
    if (next != null) { app.t = Math.round(next); app.playing = false; }
  }
  function resize() {
    const r = track.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = Math.round(r.width);
    canvas.width = w * dpr; canvas.height = hh * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = hh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cache = null;
    draw();
  }
  function compute() {
    const N = 360;
    const act = new Array(N).fill(0), sea = new Array(N).fill(NaN);
    for (let i = 0; i < N; i++) {
      const y = posToYear((i + 0.5) / N);
      let c = 0;
      for (const e of ENTRIES) if (app.layers.has(e.cat) && phase(e.start, e.end, y) === 'active') c++;
      act[i] = c;
      const s = seaLevel(y); sea[i] = s.grade === 'none' ? NaN : s.m;
    }
    cache = { act, sea };
  }

  function draw() {
    if (!w) return;
    if (!cache) compute();
        const { act, sea } = cache!;
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
    ctx.fillStyle = 'rgba(190,205,235,0.65)'; ctx.font = '12px system-ui'; ctx.textBaseline = 'alphabetic';
    ANCHORS.forEach((y, i) => {
      const x = (i / (ANCHORS.length - 1)) * w;
      const step = w < 480 ? 3 : w < 760 ? 2 : 1;
      if (i % step !== 0 && i !== ANCHORS.length - 1) { ctx.fillRect(Math.min(w - 1, x), hh - 14, 1, 5); return; }
      ctx.fillRect(Math.min(w - 1, x), hh - 14, 1, 5);
      ctx.textAlign = i === 0 ? 'left' : i === ANCHORS.length - 1 ? 'right' : 'center';
      ctx.fillText(y === NOW ? 'now' : fmtYear(y, true), i === 0 ? x + 3 : i === ANCHORS.length - 1 ? x - 3 : x, hh - 2);
    });
    // selected range(s), including competing chronologies
    const s = app.selected;
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
      if (label) { ctx.font = '700 12px system-ui'; ctx.textAlign = x > w - 20 ? 'right' : 'left'; ctx.fillText(label, x + (x > w - 20 ? -7 : 7), 12); }
    };
    head(app.t, '#ffffff', app.compare ? 'A' : '');
    if (app.compare) head(app.tB, '#ffd37a', 'B');
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    const ro = new ResizeObserver(() => resize());
    ro.observe(track);
    resize();
    return () => ro.disconnect();
  });
  // the activity histogram depends on the layer filter
  $effect(() => { void [...app.layers]; untrack(() => { cache = null; }); });
  $effect(() => {
    void [app.t, app.tB, app.compare, app.selected, app.layers.size];
    untrack(() => { if (ctx) draw(); });
  });

  const slText = $derived.by(() => { const sl = seaLevel(app.t); return sl.grade === 'none' ? 'sea level not modelled' : `sea level ${sl.m >= 0 ? '+' : '−'}${Math.abs(Math.round(sl.m))} m · shelf tint schematic${sl.grade === 'schematic' ? ', deep-time curve illustrative' : ''}`; });
  const counts = $derived.by(() => { let active = 0, started = 0; for (const e of ENTRIES) { if (!app.layers.has(e.cat)) continue; const p = phase(e.start, e.end, app.t); if (p === 'active') active++; if (p !== 'future') started++; } return { active, started }; });
  const evs = $derived(EVENTS.filter(e => phase(e.start, e.end, app.t) === 'active'));
  const migs = $derived(MIGRATIONS.filter(m => phase(m.start, m.end, app.t) === 'active'));

  function keydown(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' && (t as HTMLInputElement).type === 'text' || t.tagName === 'TEXTAREA' || t.tagName === 'SEARCH' || (t.tagName === 'INPUT' && (t as HTMLInputElement).type === 'search'))) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowRight' && !t?.classList.contains('dock-range')) { app.t = Math.round(posToYear(Math.min(1, yearToPos(app.t) + 0.004))); app.playing = false; }
    if (e.key === 'ArrowLeft' && !t?.classList.contains('dock-range')) { app.t = Math.round(posToYear(Math.max(0, yearToPos(app.t) - 0.004))); app.playing = false; }
  }
</script>

<svelte:window onkeydown={keydown} />
<div class="dock" class:compare={app.compare}>
  <div class="dock-top">
    <div class="ctrls">
      <button class="btn icon hide-sm" title="Direction" onclick={() => (app.dir = app.dir === 1 ? -1 : 1)}>{app.dir === 1 ? '→' : '←'}</button>
      <button class="btn icon" title="Play / pause (space)" aria-label="Play or pause" onclick={togglePlay}>{app.playing ? '❚❚' : '▶'}</button>
      <button class="btn hide-sm" title="Playback speed" onclick={() => { const s = [1, 2, 4, 0.5]; app.speed = s[(s.indexOf(app.speed) + 1) % s.length]; }}>{app.speed}×</button>
      <button class="btn icon" title="Previous discovery" aria-label="Previous discovery" onclick={() => jump(-1)}>⏮</button>
      <button class="btn icon" title="Next discovery" aria-label="Next discovery" onclick={() => jump(1)}>⏭</button>
    </div>
    <div class="readout-box"><div class="readout">{fmtYear(app.t)}</div><div class="readout-sub">{slText}</div></div>
    <div class="dock-right">
      <div class="dock-stats"><span>{counts.active} active</span><span class="dim"> · {counts.started} of {ENTRIES.length} recorded by now</span></div>
      <button class="btn" class:on={app.compare} title="Compare two moments with a swipe curtain" onclick={() => (app.compare = !app.compare)}>Compare</button>
    </div>
  </div>
  <div class="dock-track" bind:this={track}>
    <canvas class="dock-canvas" bind:this={canvas}></canvas>
    <input type="range" min="0" max="10000" step="1" class="dock-range" aria-label="Time cursor A" value={Math.round(yearToPos(app.t) * 10000)}
      oninput={e => { app.t = Math.round(posToYear(Number(e.currentTarget.value) / 10000)); app.playing = false; }} />
    <input type="range" min="0" max="10000" step="1" class="dock-range dock-range-b" aria-label="Time cursor B" style:display={app.compare ? '' : 'none'} value={Math.round(yearToPos(app.tB) * 10000)}
      oninput={e => (app.tB = Math.round(posToYear(Number(e.currentTarget.value) / 10000)))} />
  </div>
  <div class="dock-bottom">
    <div class="presets">
      {#each PRESETS as [n, y, tip]}<button class="chip" title={tip} onclick={() => { app.t = y; app.playing = false; }}>{n}</button>{/each}
    </div>
    <div class="chips-active">
      {#each evs as e (e.id)}<button class="chip ev" title={e.summary} onclick={() => (app.selected = { kind: 'event', id: e.id })}>◆ {e.title}</button>{/each}
      {#each migs as m (m.id)}<button class="chip mig" title={m.summary} onclick={() => (app.selected = { kind: 'migration', id: m.id })}>➜ {m.title}</button>{/each}
    </div>
  </div>
</div>
