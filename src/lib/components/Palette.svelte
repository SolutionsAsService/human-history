<script lang="ts">
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { ENTRIES, EVENTS, MIGRATIONS, QUESTIONS } from '#data';
  import { CATS } from '$lib/classification';
  import { fmtRange } from '$lib/time';
  import { app } from '$lib/app.svelte';
  import { open as openOnMap } from '$lib/nav';

  interface Hit { label: string; sub: string; run: () => void; score: number }
  let input: HTMLInputElement | undefined = $state();
  let q = $state('');
  let idx = $state(0);

  const sc = (s: string, needle: string) => { const i = s.toLowerCase().indexOf(needle); return i < 0 ? -1 : i === 0 ? 3 : 1; };
  const hits = $derived.by<Hit[]>(() => {
    if (!app.paletteOpen) return [];
    const n = q.trim().toLowerCase();
    const out: Hit[] = [];
    for (const e of ENTRIES) {
      const s = !n ? 0 : Math.max(sc(e.title, n) * 3, sc(e.place, n), sc(e.summary, n) * 0.3, sc(CATS[e.cat].label, n));
      if (n && s < 0) continue;
      out.push({ label: e.title, sub: `${CATS[e.cat].label} · ${fmtRange(e.start, e.end)} · ${e.place}`, score: s + (e.priority === 'P1' ? 0.5 : 0), run: () => openOnMap({ kind: 'entry', id: e.id }) });
    }
    for (const e of EVENTS) { const s = !n ? 0 : sc(e.title, n); if (n && s < 0) continue; out.push({ label: '◆ ' + e.title, sub: `Environmental event · ${fmtRange(e.start, e.end)}`, score: s, run: () => openOnMap({ kind: 'event', id: e.id }, { t: Math.round((e.start + e.end) / 2) }) }); }
    for (const m of MIGRATIONS) { const s = !n ? 0 : Math.max(sc(m.title, n), sc(m.model, n)); if (n && s < 0) continue; out.push({ label: '➜ ' + m.title, sub: `Route · ${fmtRange(m.start, m.end)}`, score: s, run: () => openOnMap({ kind: 'migration', id: m.id }, { t: Math.round((m.start + m.end) / 2) }) }); }
    for (const x of QUESTIONS) { const s = !n ? -0.5 : sc(x.question, n); if (n && s < 0) continue; out.push({ label: '⚗ ' + x.question, sub: `Hypothesis laboratory · ${x.options.length} competing explanations`, score: s, run: () => { app.labPick = x.id; goto(`${base}/lab?q=${x.id}`); } }); }
    return out.sort((a, b) => b.score - a.score).slice(0, 40);
  });

  $effect(() => { if (app.paletteOpen) { q = ''; idx = 0; tick().then(() => setTimeout(() => input?.focus(), 0)); } });
  $effect(() => { q; idx = 0; });
  const close = () => { app.paletteOpen = false; };
  const run = (h?: Hit) => { h?.run(); close(); };

  function keyInput(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(hits.length - 1, idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); }
    else if (e.key === 'Enter') run(hits[idx]);
  }
  function keyGlobal(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); app.paletteOpen = true; }
  }
</script>

<svelte:window onkeydown={keyGlobal} />
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="palette" class:on={app.paletteOpen} role="dialog" aria-modal="true" aria-label="Search" tabindex="-1" onmousedown={(e) => { if (e.target === e.currentTarget) close(); }}>
  <div class="pal-box">
    <input type="search" placeholder="Search records, events, routes, questions…" aria-label="Search" bind:this={input} bind:value={q} onkeydown={keyInput} />
    <ul class="pal-results">
      {#each hits as hit, i}
        <li class:on={i === idx} onmousedown={() => run(hit)} onmouseenter={() => (idx = i)}><div class="pl">{hit.label}</div><div class="ps">{hit.sub}</div></li>
      {:else}
        <li class="none">No matches.</li>
      {/each}
    </ul>
    <div class="pal-foot">↑↓ navigate · Enter open · Esc close</div>
  </div>
</div>
