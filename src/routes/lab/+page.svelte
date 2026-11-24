<script lang="ts">
  import { base } from '$app/paths';
  import { ENTRY_BY_ID, QUESTIONS, QUESTION_BY_ID } from '#data';
  import { STATUS, STATUS_ORDER } from '$lib/classification';
  import { app } from '$lib/app.svelte';
  import { openEntry } from '$lib/nav';
  import Badge from '$lib/components/Badge.svelte';
  import SourceCard from '$lib/components/SourceCard.svelte';
  import type { HypothesisOption } from '../../types';

  const pick = $derived(QUESTION_BY_ID[app.labPick ?? ''] ?? QUESTIONS[0]);
  type G = [string, string[], string];
  const groups = (o: HypothesisOption): G[] => ([
    ['Supporting evidence', o.supports, 'pos'], ['Contradicting evidence', o.contradicts, 'neg'], ['Required assumptions', o.assumptions, ''],
    ['Testable predictions', o.predictions, ''], ['Known weaknesses', o.weaknesses, ''], ['What would falsify it', o.falsifiers, ''],
  ] as G[]).filter(g => g[1]?.length);
</script>
<svelte:head><title>Hypothesis lab · Human History</title></svelte:head>
<section class="view v-lab">
<div class="lab">
  <select class="lab-sel" aria-label="Choose an open question" value={pick.id} onchange={e => (app.labPick = e.currentTarget.value)}>
    {#each QUESTIONS as q}<option value={q.id}>{q.question}</option>{/each}
  </select>
  <nav class="lab-list" aria-label="Questions">
    <div class="lab-title">Open questions<em>{QUESTIONS.length}</em></div>
    {#each QUESTIONS as q}
      <button class="lab-q" class:on={q.id === pick.id} onclick={() => (app.labPick = q.id)}>
        <span>{q.question}</span>
        <span class="dots">{#each q.options as o}<i style="background:{STATUS[o.status].color}" title="{o.name}: {STATUS[o.status].short}"></i>{/each}</span>
      </button>
    {/each}
  </nav>
  <div class="lab-main"><div>
    <header class="lab-head">
      <h2>{pick.question}</h2>
      <p class="ctx">{pick.context}</p>
      <div class="axis" role="img" aria-label="Where each explanation sits on the evidence scale">
        {#each STATUS_ORDER as s}
          <div class="ax-cell">
            <div class="ax-marks">{#each pick.options.filter(o => o.status === s) as o}<span class="ax-mark" style="--c:{STATUS[s].color}" title={o.name}>{o.name}</span>{/each}</div>
            <div class="ax-lab" style="--c:{STATUS[s].color}">{s}</div><div class="ax-sub">{STATUS[s].short}</div>
          </div>
        {/each}
      </div>
      <p class="rule">The marks above show where each explanation stands on the ledger scale today. Several can be live at once, and statuses change as evidence changes. No option is chosen for you.</p>
    </header>
    <div class="cols">
      {#each pick.options as o}
        <article class="lcard" style="--c:{STATUS[o.status].color}">
          <header><h3>{o.name}</h3><Badge code={o.status} /></header>
          <p class="desc">{o.description}</p>
          {#each groups(o) as [title, items, cls]}
            <div class="lc-g"><h4 class={cls}>{title}</h4><ul class="bul {cls}">{#each items as i}<li>{i}</li>{/each}</ul></div>
          {/each}
          {#if o.entries?.length}
            <div class="lc-g"><h4>Related records</h4><div class="chips">
              {#each o.entries as id}<a class="chip" href="{base}/?e={id}" onclick={e => { e.preventDefault(); openEntry(id); }}>{ENTRY_BY_ID[id]?.title ?? id}</a>{/each}
            </div></div>
          {/if}
          {#if o.sources.length}
            <details class="sec small"><summary>Sources<em>{o.sources.length}</em></summary><ul class="srcs">{#each o.sources as id}<SourceCard {id} />{/each}</ul></details>
          {:else}<p class="dim small">No sources attached.</p>{/if}
        </article>
      {/each}
    </div>
    {#if pick.history.length}
      <section class="hist"><h3>How confidence has changed</h3><ul>{#each pick.history as x}<li><b>{x.date}</b> {x.note}</li>{/each}</ul></section>
    {/if}
  </div></div>
</div>
</section>
