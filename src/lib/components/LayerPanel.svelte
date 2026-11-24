<script lang="ts">
  import type { Cat, Status } from '../../types';
  import { ENTRIES, MIGRATIONS } from '#data';
  import { CATS, STATUS, STATUS_ORDER } from '$lib/classification';
  import { GROUP_COLORS, GROUP_LABELS } from '$lib/groups';
  import { app, type ColorBy } from '$lib/app.svelte';
  import { phase } from '$lib/time';

  let { modal = false }: { modal?: boolean } = $props();

  const counts = $derived.by(() => {
    const c: Record<string, number> = {};
    for (const e of ENTRIES) if (phase(e.start, e.end, app.t) === 'active') c[e.cat] = (c[e.cat] ?? 0) + 1;
    return c;
  });
  const cats = Object.keys(CATS) as Cat[];
  const groups: [string, Cat[]][] = (() => {
    const g = new Map<string, Cat[]>();
    cats.forEach(c => g.set(CATS[c].group, [...(g.get(CATS[c].group) ?? []), c]));
    return [...g.entries()];
  })();
  const groupsUsed = [...new Set(MIGRATIONS.map(m => m.group))];
  const overlays: [string, 'showEvents' | 'showRoutes' | 'showGhosts' | 'showShelf' | 'showLinks', string][] = [
    ['Environmental events', 'showEvents', 'Eruptions, floods, climate shifts'],
    ['Migration & exchange routes', 'showRoutes', 'Schematic routes with competing models'],
    ['Sea-level shelf exposure', 'showShelf', 'Schematic: tints the continental shelf as sea level falls'],
    ['Show ended records as ghosts', 'showGhosts', 'Dim markers for records whose date range has passed'],
    ['Evidence links of selection', 'showLinks', 'Draw graph relations for the selected record'],
  ];
  const colorModes: [string, ColorBy][] = [['Category', 'category'], ['Evidence', 'evidence'], ['Interpretation', 'interpretation']];
  const legendFill = $derived(app.colorBy === 'category' ? 'fill = category' : app.colorBy === 'evidence' ? 'fill = evidence status' : 'fill = interpretation status');
  const legendRing = $derived(app.colorBy === 'interpretation' ? 'ring = evidence status' : 'ring = interpretation status');

  function toggleCat(c: Cat) { if (app.layers.has(c)) app.layers.delete(c); else app.layers.add(c); }
  function toggleGroup(g: string) {
    if (app.routeGroups.size === 1 && app.routeGroups.has(g)) app.routeGroups.clear();
    else { app.routeGroups.clear(); app.routeGroups.add(g); }
  }
  function toggleStatus(s: Status) { if (app.statuses.has(s)) app.statuses.delete(s); else app.statuses.add(s); }
</script>

<aside class="layers" role={modal ? 'dialog' : 'complementary'} aria-modal={modal} aria-label="Layers and filters">
  <div class="lp-head">
    <span><b>Layers</b><span class="dim small">  numbers = records active at this date</span></span>
    <button class="btn icon lp-close" aria-label="Close layers" onclick={() => (app.panelOpen = false)}>✕</button>
    <span class="lp-btns">
      <button class="link" onclick={() => cats.forEach(c => app.layers.add(c))}>all</button>
      <button class="link" onclick={() => app.layers.clear()}>none</button>
    </span>
  </div>
  {#each groups as [g, list]}
    <div class="lgrp">
      <div class="lgrp-t">{g}</div>
      {#each list as c}
        {@const on = app.layers.has(c)}
        <label class="lrow" class:off={!on}>
          <input type="checkbox" checked={on} onchange={() => toggleCat(c)} />
          <i class="sw" style="background:{CATS[c].color}"></i><span class="ln">{CATS[c].label}</span><span class="cn">{counts[c] ?? 0}</span>
        </label>
      {/each}
    </div>
  {/each}
  <div class="lgrp">
    <div class="lgrp-t">Overlays</div>
    {#each overlays as [label, key, tip]}
      <label class="lrow" title={tip}><input type="checkbox" checked={app[key]} onchange={e => (app[key] = e.currentTarget.checked)} /><span class="ln">{label}</span></label>
    {/each}
  </div>
  <div class="lgrp">
    <div class="lgrp-t">Route models</div>
    <div class="chips">
      {#each groupsUsed as g}
        <button class="chip" class:on={!app.routeGroups.size || app.routeGroups.has(g)} style="--c:{GROUP_COLORS[g] ?? '#9aa8ff'}" title="Show only this model group (click again to clear)" onclick={() => toggleGroup(g)}><i></i>{GROUP_LABELS[g] ?? g}</button>
      {/each}
    </div>
  </div>
  <div class="lgrp">
    <div class="lgrp-t">Colour by</div>
    <div class="segs">{#each colorModes as [label, val]}<button class="seg" class:on={app.colorBy === val} onclick={() => (app.colorBy = val)}>{label}</button>{/each}</div>
  </div>
  <div class="lgrp">
    <div class="lgrp-t">Evidence filter</div>
    <div class="chips">
      {#each STATUS_ORDER as s}
        <button class="chip st" class:on={app.statuses.has(s)} style="--c:{STATUS[s].color}" title="{STATUS[s].label} — {STATUS[s].desc}" onclick={() => toggleStatus(s)}><i></i>{s}</button>
      {/each}
    </div>
  </div>
  <div class="legend">
    <div><span class="lm"></span>{legendFill}, {legendRing}</div>
    <div><span class="lm dash"></span>dashed = date is claimed, not accepted</div>
    <div><span class="lm ghost"></span>faint = date range has ended</div>
    <div><span class="lm diamond"></span>environmental event</div>
    <div><span class="lm tan"></span>sand tint = exposed shelf (schematic)</div>
  </div>
</aside>
