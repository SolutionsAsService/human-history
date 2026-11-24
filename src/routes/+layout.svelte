<script lang="ts">
  import '../styles.css';
  import { onMount, type Snippet } from 'svelte';
  import { page } from '$app/state';
  import { goto, replaceState } from '$app/navigation';
  import { base } from '$app/paths';
  import { app, set, type View } from '$lib/app.svelte';
  import { ENTRIES } from '#data';
  import Icon from '$lib/components/Icon.svelte';
  import Drawer from '$lib/components/Drawer.svelte';
  import Palette from '$lib/components/Palette.svelte';

  let { children }: { children: Snippet } = $props();
  const TABS: [View, string, string, string][] = [
    ['map', 'Map', 'Map', 'Evidence map and time machine'],
    ['graph', 'Evidence graph', 'Graph', 'Connections across disciplines'],
    ['threads', 'Threads', 'Threads', 'What passed between cultures: languages, scripts, religions, ideas, technologies'],
    ['lab', 'Hypothesis lab', 'Lab', 'Competing explanations side by side'],
    ['ledger', 'Ledger', 'Ledger', 'Built records and the research queue'],
    ['audit', 'Audit', 'Audit', 'The evidence tables checking each other'],
    ['method', 'Method', 'Method', 'How to read this and how it stays honest'],
  ];
  const pathOf = (v: View) => (v === 'map' ? '/' : `/${v}`);
  const view = $derived<View>((TABS.find(([v]) => v !== 'map' && page.url.pathname.replace(base, '').startsWith('/' + v))?.[0]) ?? 'map');
  const noDrawer = $derived(view === 'lab' || view === 'threads' || view === 'method' || view === 'ledger' || view === 'audit');
  let ready = $state(false);

  // ---- URL query <-> state: /?e=gobekli-tepe&t=-9600, /lab?q=…, /threads?s=…  (old #/map?e=… links are rewritten once on load)
  function readUrl(u: URL) {
    const p = u.searchParams;
    const e = p.get('e'); app.selected = e ? { kind: (p.get('k') as any) || 'entry', id: e } : null;
    const t = p.get('t'); if (t && !Number.isNaN(Number(t))) app.t = Number(t);
    const q = p.get('q'); if (q) app.labPick = q;
    const s = p.get('s'); app.strand = s || null;
  }
  onMount(() => {
    if (location.hash.startsWith('#/')) {
      const [v, qs] = location.hash.slice(2).split('?'); const known = TABS.find(([x]) => x === v || (v === 'about' && x === 'method'));
      if (known) { goto(`${base}${pathOf(known[0])}${qs ? '?' + qs : ''}`, { replaceState: true }).then(() => { readUrl(page.url); setTimeout(() => (ready = true), 50); }); return; }
    }
    readUrl(page.url); setTimeout(() => (ready = true), 50); // after the router has hydrated: replaceState needs it
  });
  $effect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (app.selected) { p.set('e', app.selected.id); if (app.selected.kind !== 'entry') p.set('k', app.selected.kind); }
    if (view === 'map') p.set('t', String(Math.round(app.t)));
    if (view === 'lab' && app.labPick) p.set('q', app.labPick);
    if (view === 'threads' && app.strand) p.set('s', app.strand);
    const qs = p.toString(); const want = page.url.pathname + (qs ? '?' + qs : '');
    if (want !== page.url.pathname + page.url.search) replaceState(want, page.state);
  });
  $effect(() => { document.body.dataset.view = view; });
  // Selecting something while the time cursor hides it would confuse: jump to its start.
  $effect(() => {
    const s = app.selected; if (!s || view !== 'map' || s.kind !== 'entry') return;
    const e = ENTRIES.find(x => x.id === s.id); if (e && app.t < e.start) app.t = Math.round(e.start);
  });
  function keydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && app.panelOpen && innerWidth <= 1100 && view === 'map') { app.panelOpen = false; return; }
    if (e.key === 'Escape' && app.selected && !app.paletteOpen) app.selected = null;
  }
  $effect(() => { if (!app.selected) document.title = 'Human History — dynamic evidence map'; });
</script>

<svelte:window onkeydown={keydown} />
<svelte:head><title>Human History — dynamic evidence map</title><meta name="description" content="An evidence-first interactive map of human history: sites, migrations, environmental events and competing hypotheses, each with separate evidence and interpretation classifications." /></svelte:head>

<header class="top">
  <h1 class="brand"><a href="{base}/" title="Human History: follow the evidence"><span class="logo"></span><b>HUMAN HISTORY</b><span class="tag-line">follow the evidence</span></a></h1>
  <nav class="tabs" role="tablist">
    {#each TABS as [v, label, , tip]}
      <a class="tab" class:on={view === v} role="tab" aria-selected={view === v} title={tip} href="{base}{pathOf(v)}" onclick={() => (app.playing = false)}>{label}</a>
    {/each}
  </nav>
  <span class="grow"></span>
  <button class="btn search" onclick={() => (app.paletteOpen = true)}>Search<kbd>/</kbd></button>
</header>
<main class="stage" data-view={view} data-sel={app.selected ? '1' : ''}>
  {@render children()}
  <Drawer hidden={noDrawer} />
</main>
<Palette />
<div id="sr-live" class="sr-only" role="status" aria-live="polite"></div>
<nav class="bottomnav" aria-label="Views">
  {#each TABS as [v, , short, tip]}
    <a class:on={view === v} title={tip} aria-label={tip} aria-current={view === v ? 'page' : 'false'} href="{base}{pathOf(v)}" onclick={() => (app.playing = false)}><Icon name={v} /><span>{short}</span></a>
  {/each}
</nav>
