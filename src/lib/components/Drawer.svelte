<script lang="ts">
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import type { Entry } from '../../types';
  import { ENTRY_BY_ID, EVENT_BY_ID, MIGRATIONS, QUESTIONS, depth, linksOf, nodeTitle } from '#data';
  import { CATS, CAUTION, REL } from '$lib/classification';
  import { fmtRange } from '$lib/time';
  import { app } from '$lib/app.svelte';
  import { GROUP_LABELS } from '$lib/groups';
  import { contextOf, findingsFor, linesOf, phasesOf, PHASES, triangulate, RULES } from '$lib/audit';
  import { buildReport, downloadText } from '$lib/report';
  import { copy, yaml } from '$lib/ui';
  import Badge from './Badge.svelte';
  import DualBadges from './DualBadges.svelte';
  import ConfDots from './ConfDots.svelte';
  import SourceCard from './SourceCard.svelte';
  import Section from './Section.svelte';

  let { hidden = false }: { hidden?: boolean } = $props();

  let el: HTMLElement | undefined = $state();
  let full = $state(false);
  let opener: HTMLElement | null = null;
  let wasOpen = false;

  const sel = $derived(app.selected);
  const entry = $derived(sel?.kind === 'entry' ? ENTRY_BY_ID[sel.id] : undefined);
  const event = $derived(sel?.kind === 'event' ? EVENT_BY_ID[sel.id] : undefined);
  const migration = $derived(sel?.kind === 'migration' ? MIGRATIONS.find(m => m.id === sel.id) : undefined);
  const siblings = $derived(migration ? MIGRATIONS.filter(x => x.group === migration.group && x.id !== migration.id) : []);

  // focus management: remember who opened the record, move focus into the drawer, return it on close
  $effect(() => {
    const open = !!sel; sel?.id; // re-run for each new record
    if (!el) return;
    if (open) {
      full = false;
      if (!wasOpen) opener = document.activeElement as HTMLElement | null;
      tick().then(() => { if (!el) return; el.scrollTop = 0; el.focus({ preventScroll: true }); });
    } else if (wasOpen) {
      const o = opener; opener = null;
      const usable = !!o && document.contains(o) && o !== document.body && o.offsetParent !== null && !o.closest('.palette');
      setTimeout(() => ((usable ? o : document.querySelector('.map-canvas')) as HTMLElement | null)?.focus({ preventScroll: true }), 0);
    }
    wasOpen = open;
  });

  const close = () => { app.selected = null; };
  let y0 = 0, moved = false;
  function down(e: PointerEvent) { y0 = e.clientY; moved = false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
  function move(e: PointerEvent) { if (Math.abs(e.clientY - y0) > 8) moved = true; }
  function up(e: PointerEvent) {
    const dy = e.clientY - y0;
    if (dy > 60) { if (full) full = false; else close(); }
    else if (dy < -60) full = true;
    else if (!moved) full = !full;
  }

  const KIND: Record<string, string> = { measured: 'Measured date', estimated: 'Estimated date', claimed: 'Claimed date (not accepted)', textual: 'Date of the text' };
  const pick = (kind: 'entry' | 'event', id: string) => { app.selected = { kind, id }; };
  const kindOf = (id: string) => (ENTRY_BY_ID[id] ? 'entry' : 'event') as 'entry' | 'event';
  const openQuestion = (id: string) => { app.labPick = id; goto(`${base}/lab?q=${id}`); };

  function siteRows(e: Entry): [string, string][] {
    const m = e.megalith;
    const rows: [string, string | undefined][] = [
      ['Culture', e.culture], ['Discovery & excavation', e.discovered], ['Proposed purpose', e.purpose], ['Current consensus', e.consensus], ['Environmental context', e.environment],
      ['Geology', m?.geology], ['Quarry', m?.quarry], ['Transport', m?.transport], ['Estimated weight', m?.weightT], ['Chronology', m?.chronology], ['Tool marks', m?.toolMarks], ['Precision', m?.precision], ['Labour', m?.labor], ['Building phases', m?.phases],
    ];
    return rows.filter((r): r is [string, string] => !!r[1]);
  }
  const hasSite = (e: Entry) => siteRows(e).length > 0 || !!e.artifacts?.length || !!e.construction?.length || !!e.megalith?.methods?.length;
  const related = $derived(entry ? QUESTIONS.filter(q => q.options.some(o => o.entries?.includes(entry.id))) : []);
</script>

{#snippet bul(items: string[] | undefined, cls = '')}
  {#if items?.length}<ul class="bul {cls}">{#each items as i}<li>{i}</li>{/each}</ul>{/if}
{/snippet}

{#snippet dates(e: { start: number; end: number; dateKind: string; dateConfidence: any; datingMethod?: string; dateNote?: string; altChron?: Entry['altChron'] })}
  <div class="datebox">
    <div class="date-main">{fmtRange(e.start, e.end)} <ConfDots c={e.dateConfidence} /></div>
    <div class="date-kind">{KIND[e.dateKind] ?? e.dateKind}</div>
    {#if e.datingMethod}<div class="date-method">Method: {e.datingMethod}</div>{/if}
    {#if e.dateNote}<div class="date-note">{e.dateNote}</div>{/if}
    {#if e.altChron?.length}<div class="altchron"><b>Competing chronologies</b><ul>{#each e.altChron as c}<li><span>{fmtRange(c.start, c.end)}</span> {c.label}</li>{/each}</ul></div>{/if}
  </div>
{/snippet}

{#snippet connections(id: string)}
  {@const links = linksOf(id)}
  <Section title="Connections" count={links.length}>
    <ul class="conns">
      {#each links as { link, other, outgoing }}
        {@const rel = REL[link.rel]}
        <li>
          <div class="cl">
            <span class="relchip" style="--c:{rel.color}">{(outgoing || !rel.directed ? '' : '← ') + rel.label + (outgoing && rel.directed ? ' →' : '')}</span>
            <a href="{base}/?e={other}" class="xref" onclick={(ev) => { ev.preventDefault(); pick(kindOf(other), other); }}>{nodeTitle(other)}</a>
            <ConfDots c={link.conf} />
          </div>
          <div class="cn">{link.note}</div>
          <div class="cw">{CAUTION[link.rel]}</div>
        </li>
      {/each}
    </ul>
  </Section>
{/snippet}

{#snippet sources(ids: string[])}
  <Section title="Sources" count={ids.length}>
    {#if ids.length}<ul class="srcs">{#each ids as id}<SourceCard {id} />{/each}</ul>{:else}<p class="dim">No sources recorded.</p>{/if}
  </Section>
{/snippet}

{#snippet entryView(e: Entry)}
  {@const d = depth(e)}
  {@const links = linksOf(e.id)}
  <header class="dh">
    <div class="dh-cat" style="--c:{CATS[e.cat].color}"><i></i>{CATS[e.cat].label}<span class="pri">{e.priority}</span></div>
    <h2>{e.title}</h2>
    <div class="dh-place">{e.place} · {e.lat.toFixed(3)}, {e.lon.toFixed(3)}{#if e.geoKind && e.geoKind !== 'site'}<span class="tag">{e.geoKind}</span>{/if}</div>
    {#if e.geoNote}<div class="note">⚠ {e.geoNote}</div>{/if}
    <DualBadges ev={e.ev} interp={e.interp} />
    {@render dates(e)}
    {#if d !== 'full'}<div class="depth {d}" title="How fully this record fills the ledger template (design/ledger.md §2).">{d === 'stub' ? 'Stub record: most ledger fields not yet researched.' : 'Partial record: some ledger fields not yet researched.'}</div>{/if}
  </header>
  <Section title="What was actually discovered"><p>{e.summary}</p></Section>
  {#if e.claim}<Section title="Original claim"><p class="claim">{e.claim}</p></Section>{/if}
  {#if e.physical?.length || e.textual?.length || e.genetic?.length}
    <Section title="Evidence"><div>
      {#if e.physical?.length}<div><h4>Physical</h4>{@render bul(e.physical)}</div>{/if}
      {#if e.textual?.length}<div><h4>Textual</h4>{@render bul(e.textual)}</div>{/if}
      {#if e.genetic?.length}<div><h4>Genetic</h4>{@render bul(e.genetic)}</div>{/if}
    </div></Section>
  {/if}
  {#if e.mainstream || e.alternatives?.length}
    <Section title="Interpretations" count={(e.alternatives?.length ?? 0) + (e.mainstream ? 1 : 0)}><div>
      {#if e.mainstream}<div class="interp main"><b>Mainstream reading</b><p>{e.mainstream}</p></div>{/if}
      {#each e.alternatives ?? [] as a}<div class="interp"><div class="ih"><b>{a.name}</b><Badge code={a.status} /></div><p>{a.text}</p></div>{/each}
    </div></Section>
  {/if}
  {#if e.for?.length || e.against?.length}
    <Section title="For and against"><div class="two">
      {#if e.for?.length}<div><h4 class="pos">Supporting</h4>{@render bul(e.for, 'pos')}</div>{/if}
      {#if e.against?.length}<div><h4 class="neg">Contradicting / weak points</h4>{@render bul(e.against, 'neg')}</div>{/if}
    </div></Section>
  {/if}
  {#if e.unresolved?.length}<Section title="Unresolved questions">{@render bul(e.unresolved)}</Section>{/if}
  {#if e.predictions?.length}<Section title="What would prove or disprove it">{@render bul(e.predictions)}</Section>{/if}
  {#if hasSite(e)}
    <Section title="Site record"><div>
      <dl class="kv">{#each siteRows(e) as [k, v]}<dt>{k}</dt><dd>{v}</dd>{/each}</dl>
      {#if e.artifacts?.length}<div><h4>Associated artifacts</h4>{@render bul(e.artifacts)}</div>{/if}
      {#if e.construction?.length}<div><h4>Construction techniques</h4>{@render bul(e.construction)}</div>{/if}
      {#if e.megalith?.methods?.length}<div><h4>Competing construction models</h4>{@render bul(e.megalith.methods)}</div>{/if}
    </div></Section>
  {/if}
  {@const t = triangulate(e)}
  {@const ph = phasesOf(e)}
  {@const fs = findingsFor(e.id)}
  <Section title="Research workflow and audit" open={false}><div>
    <div class="tri">
      <div class="tri-n">{t.score.toFixed(1)}</div>
      <div>
        <div>Source triangulation: supports about <Badge code={t.band} /> · declared <Badge code={t.declared} /></div>
        <div class={t.gap >= 1 ? 'warnline' : 'dim small'}>{t.gap >= 1 ? `Declared status is ${t.gap} step${t.gap > 1 ? 's' : ''} stronger than the independent sourcing justifies.` : 'Declared status is within what the sourcing supports.'}</div>
        <div class="dim small">{t.groups} source discipline{t.groups === 1 ? '' : 's'} · lines: {linesOf(e).join(', ') || 'none'}</div>
      </div>
    </div>
    <h4>Research workflow (§14) · {ph.pct}%</h4>
    <div class="bar-h"><i style="width:{ph.pct}%"></i></div>
    <ol class="phases">{#each PHASES as n, i}<li class={ph.done[i] ? 'ok' : ''}>{n}</li>{/each}</ol>
    <h4>Audit findings ({fs.length})</h4>
    {#if fs.length}
      <ul class="finds">{#each fs.slice(0, 8) as f}<li class={f.sev}><b>{RULES[f.rule]?.title ?? f.rule}</b><div>{f.msg}</div>{#if f.fix}<div class="dim small">Fix: {f.fix}</div>{/if}</li>{/each}</ul>
    {:else}<p class="dim small">No open findings.</p>{/if}
  </div></Section>
  {@const c = contextOf(e)}
  <Section title="Context (derived)" open={false}><div>
    {#if c.seaM != null}<p class="dim small">Global sea level at the start of the range ≈ {c.seaM} m (schematic).</p>{/if}
    {#if c.contemporaries.length}
      <div><h4>Contemporary records nearby</h4><div class="chips">{#each c.contemporaries as x}<a class="chip" href="{base}/?e={x.id}" onclick={(ev) => { ev.preventDefault(); pick(kindOf(x.id), x.id); }}>{ENTRY_BY_ID[x.id].title}<em class="dim"> {x.km} km</em></a>{/each}</div></div>
    {:else}<p class="dim small">No contemporary records in range yet: a gap in the ledger or in the evidence.</p>{/if}
    {#if c.events.length}<div><h4>Environmental events in this window</h4><div class="chips">{#each c.events as id}<a class="chip" href="{base}/?e={id}" onclick={(ev) => { ev.preventDefault(); pick(kindOf(id), id); }}>{EVENT_BY_ID[id].title}</a>{/each}</div></div>{/if}
    {#if c.routes.length}<div><h4>Migration models passing nearby</h4><div class="chips">{#each c.routes as id}<a class="chip" href="{base}/" onclick={(ev) => { ev.preventDefault(); app.selected = { kind: 'migration', id }; }}>{MIGRATIONS.find(m => m.id === id)?.title ?? id}</a>{/each}</div></div>{/if}
  </div></Section>
  {#if links.length}{@render connections(e.id)}{/if}
  {@render sources(e.sources)}
  {#if related.length}
    <Section title="Hypothesis laboratory"><div>{#each related as q}<a class="xref block" href="{base}/lab?q={q.id}" onclick={(ev) => { ev.preventDefault(); openQuestion(q.id); }}>⚗ {q.question}</a>{/each}</div></Section>
  {/if}
  <footer class="tools">
    <button class="btn" onclick={(ev) => copy(yaml(e), ev.currentTarget as HTMLElement, 'YAML copied')}>Copy ledger YAML</button>
    <button class="btn" title="Research report in the ledger §19 structure" onclick={() => downloadText(`${e.id}.md`, buildReport(e))}>Export report (.md)</button>
    <button class="btn" onclick={(ev) => copy(location.href, ev.currentTarget as HTMLElement, 'Link copied')}>Copy link</button>
    <span class="dim">reviewed {e.reviewed}</span>
  </footer>
{/snippet}

<aside class="drawer" class:hidden class:open={!!sel} class:full aria-label={sel ? 'Evidence record' : 'Evidence explorer'} tabindex={sel ? -1 : undefined} bind:this={el}>
  {#if sel}
    <button class="sheet-handle" aria-label="Record panel: tap to expand or collapse, swipe down to close" aria-expanded={full} onpointerdown={down} onpointermove={move} onpointerup={up}></button>
    <button class="btn icon close" aria-label="Close panel" title="Close (Esc)" onclick={close}>✕</button>
    <div class="foot-note">Positions approximate · routes and shelf tint schematic · records unverified</div>
    {#if entry}
      {@render entryView(entry)}
    {:else if event}
      <header class="dh">
        <div class="dh-cat" style="--c:#ff9d4d"><i></i>Environmental event</div>
        <h2>{event.title}</h2>
        <div class="dh-place">{event.lat != null ? `${event.lat.toFixed(2)}, ${event.lon!.toFixed(2)}` : 'Global / hemispheric'}</div>
        <div class="dual">
          <div><span class="dual-k">Physical evidence</span><Badge code={event.ev} /></div>
          {#if event.human}<div><span class="dual-k">Human consequences</span><Badge code={event.human.status} /></div>{/if}
        </div>
        {@render dates(event)}
      </header>
      <Section title="What the record shows"><p>{event.summary}</p></Section>
      {#if event.physical?.length}<Section title="Physical evidence">{@render bul(event.physical)}</Section>{/if}
      {#if event.human}<Section title="Human consequences: is causation established?"><p>{event.human.text}</p></Section>{/if}
      {#if event.alternatives?.length}<Section title="Alternative explanations">{@render bul(event.alternatives)}</Section>{/if}
      {#if linksOf(event.id).length}{@render connections(event.id)}{/if}
      {@render sources(event.sources)}
    {:else if migration}
      <header class="dh">
        <div class="dh-cat" style="--c:#9aa8ff"><i></i>{GROUP_LABELS[migration.group] ?? migration.group}</div>
        <h2>{migration.title}</h2>
        <div class="dh-place">{migration.model}{#if migration.schematic}<span class="tag" title="Routes are schematic: they show order and direction, not surveyed paths.">schematic route</span>{/if}</div>
        <DualBadges ev={migration.ev} interp={migration.interp} />
        <div class="datebox"><div class="date-main">{fmtRange(migration.start, migration.end)} <ConfDots c={migration.dateConfidence} /></div></div>
      </header>
      <Section title="Summary"><p>{migration.summary}</p></Section>
      <Section title="For and against"><div class="two">
        {#if migration.for.length}<div><h4 class="pos">Supporting</h4>{@render bul(migration.for, 'pos')}</div>{/if}
        {#if migration.against.length}<div><h4 class="neg">Contradicting / weak points</h4>{@render bul(migration.against, 'neg')}</div>{/if}
      </div></Section>
      {#if migration.unresolved?.length}<Section title="Unresolved questions">{@render bul(migration.unresolved)}</Section>{/if}
      {#if siblings.length}
        <Section title="Competing or related models"><ul class="conns">{#each siblings as s}<li><a class="xref" href="{base}/" onclick={(ev) => { ev.preventDefault(); app.selected = { kind: 'migration', id: s.id }; }}>{s.model} — {s.title}</a> <Badge code={s.ev} /></li>{/each}</ul></Section>
      {/if}
      {@render sources(migration.sources)}
    {:else}
      <p class="dim">Record not found.</p>
    {/if}
    <div class="sheet-foot"><button class="btn" onclick={close}>Close record</button></div>
  {/if}
</aside>
