<script lang="ts">
  import { onMount, tick as nextTick } from 'svelte';
  import type { Carried, Culture, Directness, Strand, Passage } from '../../types';
  import { CARRIED, CULTURES, PASSAGE_BY_ID, REJECTED, STRANDS, THREADS } from '#data/threads';
  import { ENTRY_BY_ID, SOURCE_BY_ID } from '#data';
  import { STATUS } from '$lib/classification';
  import { fmtRange, fmtYear } from '$lib/time';
  import { app } from '$lib/app.svelte';
  import { openEntry } from '$lib/nav';
  import { base } from '$app/paths';
  import Badge from '$lib/components/Badge.svelte';
  import SourceCard from '$lib/components/SourceCard.svelte';

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
  const tickLabel = (y: number) => (y <= -10000 ? `${-y / 1000}k BCE` : y < -1000 ? `${Math.abs(y).toLocaleString('en-US')} BCE` : y < 0 ? `${-y} BCE` : y === 0 ? '1 CE' : `${y} CE`);
  const ERAS = [
    { id: 'deep', label: 'Before 3000 BCE', a: -1e9, b: -3000 }, { id: 'bronze', label: '3000–1000 BCE', a: -3000, b: -1000 }, { id: 'iron', label: '1000–300 BCE', a: -1000, b: -300 },
    { id: 'classical', label: '300 BCE – 500 CE', a: -300, b: 500 }, { id: 'medieval', label: '500–1500 CE', a: 500, b: 1500 }, { id: 'modern', label: 'After 1500 CE', a: 1500, b: 1e9 }];
  const isPointer = (id: string) => id.startsWith('w_') || SOURCE_BY_ID[id]?.reliability === 'low';
  function sourcing(s: Strand): { label: string; cls: string; tip: string } {
    const n = (s.passages ?? []).length, pointer = s.src.filter(isPointer).length, real = s.src.length - pointer;
    if (n) return { label: `Primary text quoted (${n})`, cls: 'src-primary', tip: 'The ancient text itself is quoted on this strand.' };
    if (real >= 2) return { label: 'Scholarly sources', cls: 'src-schol', tip: 'Two or more non-pointer sources were opened.' };
    if (real === 1) return { label: 'One scholarly source', cls: 'src-thin', tip: 'Only one non-pointer source was opened: treat as provisional.' };
    return { label: 'Pointer sources only', cls: 'src-pointer', tip: 'Only encyclopedia or publisher pages were opened: a lead, not evidence.' };
  }
  const MEDIUM: Record<string, string> = { migration: 'migration', conquest: 'conquest', trade: 'trade', translation: 'translation', text: 'texts', teaching: 'teaching', court_or_empire: 'court or empire', unknown: 'route unknown' };
  const name = (id: string) => CULTURES.find(c => c.id === id)?.name ?? id;
  const groupOf = (id: string) => CULTURES.find(c => c.id === id)?.group;
  const CARRIED_KEYS = Object.keys(CARRIED) as Carried[];
  const DIRECT_KEYS = Object.keys(DIRECT) as Directness[];
  const regions = [...new Set(CULTURES.map(c => c.group))];

  let kinds = $state<Carried[]>([...CARRIED_KEYS]);
  let directs = $state<Directness[]>([...DIRECT_KEYS]);
  let thread = $state('');
  let culture = $state<string | null>(null);
  let era = $state('');
  let region = $state('');
  let fine = $state(false);
  let query = $state('');
  let mode = $state<'diagram' | 'list' | 'cultures'>('list');
  let filtersOpen = $state(false);
  let bodyW = $state(0);
  let bodyEl: HTMLElement | undefined = $state();
  onMount(() => { if (innerWidth >= 900) mode = 'diagram'; });

  const sel = $derived(STRANDS.find(s => s.id === app.strand) ?? null);
  function matches(s: Strand) {
    if (!kinds.includes(s.carried) || !directs.includes(s.directness)) return false;
    if (thread && s.thread !== thread) return false;
    if (culture && s.from !== culture && s.to !== culture) return false;
    if (s.parent && !fine && !query && !culture && app.strand !== s.id) return false;
    if (era) { const e = ERAS.find(x => x.id === era)!; if (s.end < e.a || s.start > e.b) return false; }
    if (region && groupOf(s.from) !== region && groupOf(s.to) !== region) return false;
    if (query) {
      const q = query.toLowerCase();
      const al = (id: string) => (CULTURES.find(c => c.id === id)?.aliases ?? []).join(' ');
      const pq = (s.passages ?? []).map(id => PASSAGE_BY_ID[id]).filter(Boolean).map(p => `${p.work} ${p.locator} ${p.quote}`).join(' ');
      const hay = `${name(s.from)} ${al(s.from)} ${name(s.to)} ${al(s.to)} ${s.what} ${s.note} ${pq}`.toLowerCase();
      if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }
  const vis = $derived(STRANDS.filter(matches));
  const filterCount = $derived((CARRIED_KEYS.length - kinds.length) + (3 - directs.length) + (thread ? 1 : 0) + (era ? 1 : 0) + (region ? 1 : 0) + (fine ? 1 : 0));
  const inline = $derived(mode !== 'diagram');
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const childrenOf = (id: string) => STRANDS.filter(x => x.parent === id);

  // ---- diagram geometry
  const laneH = 30, top = 34, left = 216, pad = 28;
  const diag = $derived.by(() => {
    const used = new Set<string>(); vis.forEach(s => { used.add(s.from); used.add(s.to); });
    const groups = [...new Set(CULTURES.filter(c => used.has(c.id)).map(c => c.group))];
    const lanes: Culture[] = groups.flatMap(g => CULTURES.filter(c => c.group === g && used.has(c.id)));
    const W = Math.max(bodyW || 900, 780), H = top + lanes.length * laneH + 20;
    const X = (y: number) => left + xPos(y) * (W - left - pad);
    const idx = new Map(lanes.map((l, i) => [l.id, i]));
    const Y = (id: string) => top + (idx.get(id) ?? 0) * laneH + laneH / 2;
    const ribs = [...vis].sort((a, b) => (a.id === sel?.id ? 1 : 0) - (b.id === sel?.id ? 1 : 0)).map(s => {
      const x0 = X(s.start), x1 = Math.max(X(s.end), x0 + 22), y0 = Y(s.from), y1 = Y(s.to), dx = Math.max(24, (x1 - x0) * 0.5);
      return { s, d: `M${x0} ${y0} C${x0 + dx} ${y0} ${x1 - dx} ${y1} ${x1} ${y1}` };
    });
    return { lanes, W, H, X, ribs };
  });
  const bands = $derived(diag.lanes.map((c, i) => ({ c, i, y: top + i * laneH, newBand: i === 0 || diag.lanes[i - 1].group !== c.group })));

  function pickStrand(id: string | null) { app.strand = id; }
  function keyAct(e: KeyboardEvent, fn: () => void) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }
  const followCulture = (id: string) => { culture = culture === id ? null : id; };
  async function scrollToSel() {
    await nextTick();
    const el = inline ? bodyEl?.querySelector('.th-card') : (innerWidth < 1100 ? document.querySelector('.th-detail') : null);
    (el as HTMLElement | null)?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  let lastSel = '';
  $effect(() => { const id = sel?.id ?? ''; if (id && id !== lastSel) scrollToSel(); lastSel = id; });

  // ---- by thread
  const groupsList = $derived.by(() => {
    const byThread = new Map<string, Strand[]>(); vis.forEach(s => { (byThread.get(s.thread) ?? byThread.set(s.thread, []).get(s.thread)!).push(s); });
    const gs = THREADS.filter(t => byThread.has(t.id));
    return gs.map((t, i) => {
      const all = [...byThread.get(t.id)!].sort((a, b) => a.start - b.start);
      const tops = all.filter(s => !s.parent || !all.some(x => x.id === s.parent));
      const items = tops.flatMap(s => [s, ...all.filter(c => c.parent === s.id)]);
      const open = !!thread || !!query || gs.length === 1 || (sel ? items.some(s => s.id === sel.id) : i === 0);
      return { t, items, open };
    });
  });
  // ---- by culture
  const cultGroups = $derived(regions.map(g => ({ g, cs: CULTURES.filter(c => c.group === g && vis.some(s => s.from === c.id || s.to === c.id)).map(c => ({ c, out: vis.filter(s => s.from === c.id).sort((a, b) => a.start - b.start), inn: vis.filter(s => s.to === c.id).sort((a, b) => a.start - b.start) })) })).filter(x => x.cs.length));

  // ---- review queue
  const thin = STRANDS.filter(s => sourcing(s).cls === 'src-pointer');
  const one = STRANDS.filter(s => sourcing(s).cls === 'src-thin');
  const noAgainst = STRANDS.filter(s => !s.against.length);
  const byReason = (() => { const m = new Map<string, number>(); REJECTED.forEach(r => { const k = r.reason.split(/[:;(]/)[0].trim() || 'other'; m.set(k, (m.get(k) ?? 0) + 1); }); return [...m]; })();
  function jump(id: string) { thread = ''; query = ''; culture = null; era = ''; region = ''; fine = true; app.strand = id; }
  function passageComp(p: Passage) { return p.compStart == null && p.compEnd == null ? 'not dated here' : p.compStart === p.compEnd ? `c. ${fmtYear(p.compStart!)}` : `${p.compStart == null ? '?' : fmtYear(p.compStart)} – ${p.compEnd == null ? '?' : fmtYear(p.compEnd)}`; }
  const dash = (d: Directness) => DIRECT[d].dash || undefined;
</script>

{#snippet lineSample(d: Directness, color: string)}
  <svg class="th-ls" viewBox="0 0 28 8" width="28" height="8" aria-hidden="true"><line x1="1" y1="4" x2="27" y2="4" stroke={color} stroke-width={DIRECT[d].w} stroke-linecap="round" stroke-dasharray={dash(d)} /></svg>
{/snippet}

{#snippet card(s: Strand)}
  {@const t = THREADS.find(x => x.id === s.thread)}
  {@const rel = (s.entries ?? []).filter(id => ENTRY_BY_ID[id])}
  {@const sc = sourcing(s)}
  {@const kids = childrenOf(s.id)}
  <article class="th-card" style="--c:{CARRIED[s.carried].color}">
    <header>
      <div class="th-kicker"><i></i>{CARRIED[s.carried].label}{t ? ` · ${t.name}` : ''}</div>
      <h3>{name(s.from)} → {name(s.to)}</h3>
      <p class="th-what2">{s.what}</p>
      <div class="th-facts">
        <span class="tag">{fmtRange(s.start, s.end)}</span><span class="tag">by {MEDIUM[s.medium] ?? s.medium}</span>
        <span class="tag d-{s.directness}" title={DIRECT[s.directness].tip}>{DIRECT[s.directness].label}</span>
        <span title="Evidence for the transfer itself"><Badge code={s.status} /></span>
      </div>
      <div class="th-cardbtns">
        <button class="btn small" onclick={() => { culture = s.from; mode = 'cultures'; app.strand = null; }}>Everything {name(s.from).split(' (')[0]} gave</button>
        <button class="btn small th-close" aria-label="Close details" onclick={() => pickStrand(null)}>Close</button>
      </div>
    </header>
    <p class="th-sourcing"><b>How this is sourced: </b><span class="th-src {sc.cls}">{sc.label}</span> · {s.src.length} source{s.src.length === 1 ? '' : 's'}{s.src.filter(isPointer).length ? ` (${s.src.filter(isPointer).length} pointer)` : ''}</p>
    {#if s.parent}<p><button class="btn small" onclick={() => pickStrand(s.parent!)}>↑ Part of: {STRANDS.find(x => x.id === s.parent)?.what ?? ''}</button></p>{/if}
    {#if kids.length}<div class="lc-g"><h4>Finer detail</h4><ul class="th-kids">{#each kids as x}<li><button class="th-kid" onclick={() => { fine = true; pickStrand(x.id); }}>{name(x.from)} → {name(x.to)}: {x.what}</button></li>{/each}</ul></div>{/if}
    <p>{s.note}</p>
    {#if s.for.length}<div class="lc-g"><h4 class="pos">Evidence for</h4><ul class="bul pos">{#each s.for as i}<li>{i}</li>{/each}</ul></div>{/if}
    {#if s.against.length}<div class="lc-g"><h4 class="neg">Against, or limits</h4><ul class="bul neg">{#each s.against as i}<li>{i}</li>{/each}</ul></div>{/if}
    {#if s.unresolved?.length}<div class="lc-g"><h4>Unresolved</h4><ul class="bul">{#each s.unresolved as i}<li>{i}</li>{/each}</ul></div>{/if}
    {#if (s.passages ?? []).length}
      <div class="lc-g th-pass"><h4>Primary passages ({(s.passages ?? []).length})</h4>
        {#each (s.passages ?? []).map(id => PASSAGE_BY_ID[id]).filter(Boolean) as p}
          <figure class="th-q">
            <blockquote>“{p.quote}”</blockquote>
            <figcaption><b>{p.work} {p.locator}</b> · {p.language}</figcaption>
            <dl class="th-dates">
              <dt>Work composed</dt><dd>{passageComp(p)}<span class="dim"> — {p.compBasis}</span></dd>
              <dt>Earliest witness</dt><dd>{p.witness}</dd>
              <dt>Edition read</dt><dd>{p.edition}</dd>
            </dl>
            {#if SOURCE_BY_ID[p.src]}<details class="sec small"><summary>Source of this edition</summary><ul class="srcs"><SourceCard id={p.src} /></ul></details>{/if}
          </figure>
        {/each}
      </div>
    {/if}
    {#if rel.length}<div class="lc-g"><h4>Related records</h4><div class="chips">{#each rel as id}<a class="chip" href="{base}/?e={id}" onclick={e => { e.preventDefault(); openEntry(id); }}>{ENTRY_BY_ID[id].title}</a>{/each}</div></div>{/if}
    <details class="sec small"><summary>Sources<em>{s.src.length}</em></summary><ul class="srcs">{#each s.src as id}<SourceCard {id} />{/each}</ul></details>
    <p class="rule">Status grades the evidence for this transfer, not for either culture.</p>
  </article>
{/snippet}

{#snippet row(s: Strand, from?: string)}
  {@const on = sel?.id === s.id}
  {@const e = STATUS[s.status]}
  {@const np = (s.passages ?? []).length}
  {@const sc = sourcing(s)}
  {@const kids = childrenOf(s.id).length}
  <li class={s.parent ? 'th-childli' : undefined}>
    <button class="th-row" class:on class:th-child={!!s.parent} style="--c:{CARRIED[s.carried].color}" aria-pressed={on} aria-expanded={on} onclick={() => pickStrand(on ? null : s.id)}>
      <span class="th-route">{#if from}<b aria-hidden="true">{s.from === from ? '→ ' : '← '}</b>{name(s.from === from ? s.to : s.from)}{:else}{name(s.from)}<b aria-hidden="true"> → </b>{name(s.to)}{/if}</span>
      <span class="th-what">{s.what}</span>
      <span class="th-meta">{@render lineSample(s.directness, CARRIED[s.carried].color)}<span>{DIRECT[s.directness].label}</span>
        <span class="th-dot" style="--c:{e.color}" title={e.label}><i></i>{s.status}</span><span class="dim">{fmtRange(s.start, s.end)}</span></span>
      <span class="th-ev">{[`${s.for.length} for`, `${s.against.length} against`, np ? `${np} primary passage${np === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ')} · <span class="th-src {sc.cls}" title={sc.tip}>{sc.label}</span></span>
      {#if kids}<span class="th-more">Breaks down into {kids} finer strands</span>{/if}
    </button>
    {#if on}{@render card(s)}{/if}
  </li>
{/snippet}

<svelte:head><title>Threads · Human History</title></svelte:head>
<section class="view v-threads">
<div class="threads" class:filters-open={filtersOpen}>
  <header class="th-head">
    <div class="th-title">
      <h2>Threads</h2>
      <p class="th-lede">What one culture passed to another: languages, scripts, religions, ideas, technologies, crops. Each transfer carries its evidence and what argues against it.</p>
      <details class="th-how"><summary>How to read this</summary>
        <p><b>Solid</b> line = documented (a dated text, inscription or dated find shows the transfer). <b>Dashed</b> = debated (specialists disagree). <b>Dotted</b> = inferred from resemblance or plausible contact. The E-grade rates the evidence for the transfer itself, not for either culture. Nothing here is inferred by software.</p></details>
    </div>
  </header>
  <div class="th-bar">
    <input type="search" class="th-search" placeholder="Search transfers: Persia, alphabet, flood…" aria-label="Search transfers" bind:value={query} />
    <div class="th-stick">
      <div class="segs th-modes" role="group" aria-label="Layout">
        {#each [['diagram', 'Diagram'], ['list', 'By thread'], ['cultures', 'Cultures']] as const as [m, label]}
          <button class="seg" class:on={m === mode} data-m={m} aria-pressed={m === mode} onclick={() => (mode = m)}>{label}</button>
        {/each}
      </div>
      <button class="btn th-fbtn" aria-expanded={filtersOpen} onclick={() => (filtersOpen = !filtersOpen)}>{filterCount ? `Filters · ${filterCount}` : 'Filters'}</button>
    </div>
  </div>
  <div class="th-panel">
    <label class="th-lab"><span>Follow one thread</span>
      <select class="th-sel" aria-label="Follow one thread" bind:value={thread}><option value="">All threads</option>{#each THREADS as t}<option value={t.id}>{t.name}</option>{/each}</select></label>
    <label class="th-lab"><span>Period</span>
      <select class="th-sel" aria-label="Period" bind:value={era}><option value="">Any period</option>{#each ERAS as x}<option value={x.id}>{x.label}</option>{/each}</select></label>
    <label class="th-lab"><span>Region</span>
      <select class="th-sel" aria-label="Region" bind:value={region}><option value="">Any region</option>{#each regions as g}<option value={g}>{g}</option>{/each}</select></label>
    <div class="th-lab"><span>Level of detail</span>
      <button class="th-chip" class:on={fine} aria-pressed={fine} title="Show the finer strands that break the big ones down" onclick={() => (fine = !fine)}><i></i>Show fine detail</button></div>
    <div class="th-lab"><span>What was passed on</span>
      <div class="th-chips" role="group" aria-label="What was passed on">
        {#each CARRIED_KEYS.filter(k => STRANDS.some(s => s.carried === k)) as k}
          <button class="th-chip" class:on={kinds.includes(k)} style="--c:{CARRIED[k].color}" aria-pressed={kinds.includes(k)} onclick={() => (kinds = toggle(kinds, k))}><i></i>{CARRIED[k].label}</button>
        {/each}
      </div></div>
    <div class="th-lab"><span>How direct the evidence is</span>
      <div class="th-chips" role="group" aria-label="How direct the evidence is">
        {#each DIRECT_KEYS as d}
          <button class="th-chip d-{d}" class:on={directs.includes(d)} aria-pressed={directs.includes(d)} title={DIRECT[d].tip} onclick={() => (directs = toggle(directs, d))}><i></i>{DIRECT[d].label}</button>
        {/each}
      </div></div>
  </div>
  <div class="th-active" aria-live="polite" hidden={!(culture || era || region || thread)}>
    {#if culture}<button class="th-pill" aria-label="Remove filter: Culture: {name(culture)}" onclick={() => (culture = null)}>Culture: {name(culture)}<b aria-hidden="true"> ×</b></button>{/if}
    {#if era}<button class="th-pill" aria-label="Remove filter: Period" onclick={() => (era = '')}>Period: {ERAS.find(x => x.id === era)?.label}<b aria-hidden="true"> ×</b></button>{/if}
    {#if region}<button class="th-pill" aria-label="Remove filter: Region" onclick={() => (region = '')}>Region: {region}<b aria-hidden="true"> ×</b></button>{/if}
    {#if thread}<button class="th-pill" aria-label="Remove filter: Thread" onclick={() => (thread = '')}>Thread: {THREADS.find(t => t.id === thread)?.name ?? ''}<b aria-hidden="true"> ×</b></button>{/if}
  </div>

  <div class="th-layout" class:has={!!sel && !inline}>
    <div class="th-body" bind:this={bodyEl} bind:clientWidth={bodyW}>
      {#if !STRANDS.length}
        <p class="th-empty">No threads yet.</p>
      {:else}
        <p class="th-count" role="status">{vis.length} of {STRANDS.length} transfers</p>
        {#if mode === 'cultures'}
          <div class="th-list th-cultures">
            {#each cultGroups as { g, cs }}
              <section class="th-cgroup"><h3>{g}</h3>
                {#each cs as { c, out, inn }}
                  <details class="th-cult" open={culture === c.id} ontoggle={e => { const o = e.currentTarget.open; if (o && culture !== c.id) culture = c.id; else if (!o && culture === c.id) culture = null; }}>
                    <summary><span class="th-cname">{c.name}</span><span class="th-cnum" title="Received / gave">← {inn.length}  → {out.length}</span></summary>
                    {#if out.length}<div><h4>Gave</h4><ul>{#each out as s (s.id)}{@render row(s, c.id)}{/each}</ul></div>{/if}
                    {#if inn.length}<div><h4>Received</h4><ul>{#each inn as s (s.id)}{@render row(s, c.id)}{/each}</ul></div>{/if}
                  </details>
                {/each}
              </section>
            {/each}
          </div>
        {:else if !vis.length}
          <p class="th-empty">No transfers match. Clear a filter or the search.</p>
        {:else if mode === 'diagram'}
          <div class="th-scroll">
            <svg class="th-svg" viewBox="0 0 {diag.W} {diag.H}" width={diag.W} height={diag.H} role="group" aria-label="Transfers between cultures over time">
              <defs>{#each CARRIED_KEYS as k}
                <marker id="ar-{k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={CARRIED[k].color} /></marker>
              {/each}</defs>
              {#each AXIS as y}
                <line x1={diag.X(y)} x2={diag.X(y)} y1={top - 6} y2={diag.H - 14} class="th-grid" />
                <text x={Math.min(diag.X(y), diag.W - 30)} y="16" class="th-tick" text-anchor="middle">{tickLabel(y)}</text>
              {/each}
              {#each bands as { c, y, newBand }}
                {#if newBand}<line x1="0" x2={diag.W} y1={y} y2={y} class="th-band" />{/if}
                <rect x={diag.X(c.start)} y={y + 7} width={Math.max(3, diag.X(c.end) - diag.X(c.start))} height={laneH - 14} rx="4" class="th-span" class:on={culture === c.id} />
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <g class="th-lanebtn" class:on={culture === c.id} tabindex="0" role="button" aria-pressed={culture === c.id} aria-label="Follow {c.name}" onclick={() => followCulture(c.id)} onkeydown={e => keyAct(e, () => followCulture(c.id))}>
                  <rect x="0" {y} width={left - 6} height={laneH} fill="transparent" />
                  <text x="8" y={y + laneH / 2 + 4} class="th-lane">{c.name.length > 33 ? c.name.slice(0, 32) + '…' : c.name}<title>{c.name} (select to follow)</title></text>
                </g>
              {/each}
              <g>
                {#each diag.ribs as { s, d } (s.id)}
                  <g class="th-strand" class:on={sel?.id === s.id} class:dim={sel && sel.id !== s.id} tabindex="0" role="button" aria-label="{name(s.from)} to {name(s.to)}: {s.what}. {DIRECT[s.directness].label}." onclick={() => pickStrand(s.id)} onkeydown={e => keyAct(e, () => pickStrand(s.id))}>
                    <path {d} class="th-hit" />
                    <path {d} class="th-rib" stroke={CARRIED[s.carried].color} stroke-width={DIRECT[s.directness].w} stroke-dasharray={dash(s.directness)} marker-end="url(#ar-{s.carried})" />
                    <title>{name(s.from)} → {name(s.to)}: {s.what}</title>
                  </g>
                {/each}
              </g>
            </svg>
          </div>
        {:else}
          <div class="th-list">
            {#each groupsList as { t, items, open } (t.id)}
              <details class="th-group" {open} style="--c:{CARRIED[t.carried].color}">
                <summary><i></i><span class="th-gname">{t.name}</span><em>{items.length}</em></summary>
                <p class="th-blurb">{t.blurb}</p>
                <ul>{#each items as s (s.id)}{@render row(s)}{/each}</ul>
              </details>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
    <aside class="th-detail" class:has={!!sel && !inline} aria-live="polite" hidden={inline}>
      {#if !inline}
        {#if sel}{@render card(sel)}{:else}<p class="th-hint">Select a ribbon to see what was passed on, the evidence for it, and what argues against it. Select a culture name to follow everything it gave and received.</p>{/if}
      {/if}
    </aside>
  </div>

  <details class="th-review">
    <summary>Review queue<em>{thin.length + one.length} thin · {REJECTED.length} rejected</em></summary>
    <p class="dim small">What this page could not settle. Thin strands are leads to strengthen; rejected candidates are sources an independent verifier would not accept, with the reason. Nothing here is hidden: the verifiers’ decisions are part of the record.</p>
    {#each [[`Pointer sources only (${thin.length})`, thin], [`One scholarly source (${one.length})`, one], [`Records nothing against (${noAgainst.length})`, noAgainst]] as [title, list] (title)}
      {#if (list as Strand[]).length}
        <section><h4>{title}</h4>
          <ul class="th-rq">{#each list as Strand[] as s}<li><button class="th-kid" onclick={() => jump(s.id)}>{name(s.from)} → {name(s.to)}: {s.what}</button></li>{/each}</ul></section>
      {/if}
    {/each}
    {#if REJECTED.length}
      <section><h4>Rejected by verifiers ({REJECTED.length})</h4>
        <p class="dim small">{byReason.map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
        <ul class="th-rq">{#each REJECTED as r}<li><b>{r.title || '(untitled)'}</b><span class="dim"> — {r.reason} ({r.brief})</span></li>{/each}</ul></section>
    {/if}
  </details>
</div>
</section>
