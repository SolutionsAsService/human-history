<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import * as d3 from 'd3';
  import { feature } from 'topojson-client';
  import { ENTRIES, ENTRY_BY_ID, EVENT_BY_ID, MIGRATIONS, QUESTIONS, SOURCES } from '#data';
  import { PHASES, RULES, getAudit, linesOf, type Finding, type Severity } from '$lib/audit';
  import { downloadText } from '$lib/report';
  import { app } from '$lib/app.svelte';
  import { open } from '$lib/nav';
  import { goto } from '$app/navigation';
  import Badge from '$lib/components/Badge.svelte';

  const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
  const ratio = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  function cellStyle(n: number, max: number) {
    if (n === 0) return 'background:#2a1218;color:#ffb3b8';
    const r = n / max; const bg = r < 0.4 ? d3.interpolateRgb('#16304d', '#2c6aa3')(r / 0.4) : d3.interpolateRgb('#76dbea', '#a6f6ff')((r - 0.4) / 0.6); const hex = d3.color(bg)!.formatHex();
    return `background:${hex};color:${ratio(hex, '#06101d') >= ratio(hex, '#f2f6ff') ? '#06101d' : '#f2f6ff'}`;
  }

  let a = $state(getAudit());
  let sev = $state<Severity[]>(['error', 'warn']);
  let rule = $state('');
  let limit = $state(60);
  let introOpen = $state(true);
  onMount(async () => {
    introOpen = innerWidth >= 720;
    try {
      const topo = await fetch(`${base}/data/land-50m.topo.json`).then(r => r.json());
      a = getAudit(feature(topo, topo.objects[Object.keys(topo.objects)[0]]), true);
    } catch { /* geography check simply stays off */ }
  });

  const count = (s: Severity) => a.findings.filter(f => f.sev === s).length;
  const byRule = $derived.by(() => { const m = new Map<string, Finding[]>(); a.findings.forEach(f => m.set(f.rule, [...(m.get(f.rule) ?? []), f])); return [...m.entries()].sort((x, y) => y[1].length - x[1].length); });
  const visible = $derived(a.findings.filter(f => sev.includes(f.sev) && (!rule || f.rule === rule)));
  const toggleSev = (s: Severity) => { sev = sev.includes(s) ? sev.filter(x => x !== s) : [...sev, s]; limit = 60; };
  const max = $derived(Math.max(1, ...a.coverage.cells.flat()));
  const tri = $derived(ENTRIES.map(e => ({ e, t: a.triang[e.id] })).filter(x => x.t.gap >= 1).sort((x, y) => y.t.gap - x.t.gap || x.t.score - y.t.score).slice(0, 25));
  const ph = $derived(PHASES.map((_, i) => ENTRIES.filter(e => a.phases[e.id].done[i]).length));
  const pmax = $derived(Math.max(1, ...ph));

  function go(id: string) {
    if (ENTRY_BY_ID[id]) open({ kind: 'entry', id });
    else if (EVENT_BY_ID[id]) open({ kind: 'event', id });
    else if (MIGRATIONS.some(m => m.id === id)) open({ kind: 'migration', id });
    else if (QUESTIONS.some(q => q.id === id)) { app.labPick = id; goto(`${base}/lab`); }
  }
  const label = (id: string) => ENTRY_BY_ID[id]?.title ?? EVENT_BY_ID[id]?.title ?? MIGRATIONS.find(m => m.id === id)?.title ?? QUESTIONS.find(q => q.id === id)?.question ?? id;
  const tiles = $derived<[string | number, string][]>([[count('error'), 'errors'], [count('warn'), 'warnings'], [count('info'), 'notes'], [a.stats.avgPhasePct + '%', 'avg workflow completeness'], [a.stats.reportReady, 'report-ready records'], [`${a.stats.crossCategoryLinks}/${a.stats.links}`, 'cross-discipline links'], [a.stats.components, 'graph components'], [Math.round(a.stats.unverifiedShare * 100) + '%', 'citations still to locate'], [SOURCES.length, 'sources']]);
</script>
<svelte:head><title>Audit · Human History</title></svelte:head>
<section class="view v-audit">
<div class="audit">
  <header>
    <h2>Evidence audit</h2>
    <details class="intro" open={introOpen}><summary>What this audit does</summary><p class="ctx">The evidence tables checking each other. Declared statuses are compared with the sources and independent lines of evidence behind them; graph relations are tested against dates, geography and each other; hypotheses against their own evidence lists and the records they cite; migration routes against the records that should anchor them; and coverage is mapped by region and era. </p></details>
    <p class="ctx verdictline"><b>Prompts for review, not verdicts.</b> An algorithm cannot tell you which side of a dispute is right.</p>
    <div class="ag">{#each tiles as [n, l]}<div class="stat"><b>{n}</b><span>{l}</span></div>{/each}</div>
  </header>
  <h3>Findings</h3>
  <div class="rules">
    {#each [['error', 'Errors'], ['warn', 'Warnings'], ['info', 'Notes']] as [s, l]}
      <button class="chip" class:on={sev.includes(s as Severity)} onclick={() => toggleSev(s as Severity)}>{l} <em>{count(s as Severity)}</em></button>
    {/each}
    <span class="dim">|</span>
    {#each byRule as [r, fs]}
      <button class="chip" class:on={rule === r} title={RULES[r]?.desc} onclick={() => { rule = rule === r ? '' : r; limit = 60; }}>{RULES[r]?.title ?? r}<em>{fs.length}</em></button>
    {/each}
  </div>
  <div class="flist">
    {#each visible.slice(0, limit) as f}
      <div class="fi {f.sev}">
        <div class="fh"><span class="fr">{RULES[f.rule]?.title ?? f.rule}</span><span>{f.msg}</span></div>
        {#if f.fix}<div class="ff">Fix: {f.fix}</div>{/if}
        <div class="fids">{#each f.ids as id}<a class="chip" href="{base}/?e={id}" onclick={(ev) => { ev.preventDefault(); go(id); }}>{label(id).slice(0, 48)}</a>{/each}</div>
      </div>
    {/each}
  </div>
  {#if visible.length > limit}<p><button class="btn" onclick={() => (limit += 80)}>Show {Math.min(80, visible.length - limit)} more of {visible.length - limit}</button></p>{/if}
  {#if !visible.length}<p class="dim">No findings for this filter.</p>{/if}
  <h3>Coverage by region and era (records whose date range touches the era)</h3>
  <div class="tablewrap" style="padding:8px">
    <table class="heat"><thead><tr><th></th>{#each a.coverage.eras as e}<th>{e}</th>{/each}</tr></thead>
      <tbody>{#each a.coverage.regions as r, i}<tr><td class="rl">{r}</td>{#each a.coverage.cells[i] as n}<td style={cellStyle(n, max)}>{n === 0 ? '·' : n}</td>{/each}</tr>{/each}</tbody></table>
  </div>
  <p class="dim small">Empty cells where people were plausibly present are a gap in the ledger (or in the evidence): {a.coverage.thin.length} cells. Records with no coordinates in range, UAP and esoteric records are not counted.</p>
  <h3>Workflow phases completed across records (master prompt §14)</h3>
  <div class="hist-bars" style="margin-bottom:22px">{#each PHASES as n, i}<div style="height:{Math.max(3, Math.round((ph[i] / pmax) * 68))}px" title="{n}: {ph[i]} of {ENTRIES.length} records"><span>{n.split('-')[0].slice(0, 9)}</span></div>{/each}</div>
  <h3>Largest gaps between declared status and what the sourcing supports</h3>
  <div class="tablewrap"><table class="tbl2"><thead><tr>{#each ['Record', 'Declared', 'Sourcing supports', 'Score', 'Lines of evidence'] as t}<th>{t}</th>{/each}</tr></thead>
    <tbody>{#each tri as { e, t }}<tr>
      <td><a class="xref" href="{base}/?e={e.id}" onclick={(ev) => { ev.preventDefault(); go(e.id); }}>{e.title}</a></td>
      <td><Badge code={t.declared} label={t.declared} /></td><td><Badge code={t.band} label={t.band} /></td><td>{t.score.toFixed(1)}</td><td class="dim">{linesOf(e).join(', ') || '—'}</td></tr>{/each}</tbody></table></div>
  <h3>Migration routes and the records that anchor them</h3>
  <div class="tablewrap"><table class="tbl2"><thead><tr>{#each ['Route', 'Evidence', 'Anchor records within 650 km and the time window'] as t}<th>{t}</th>{/each}</tr></thead>
    <tbody>{#each MIGRATIONS as m}{@const an = a.anchors[m.id] ?? []}<tr>
      <td><a class="xref" href="{base}/?e={m.id}&k=migration" onclick={(ev) => { ev.preventDefault(); go(m.id); }}>{m.title}</a></td><td><Badge code={m.ev} label={m.ev} /></td>
      <td class={an.length ? '' : 'warnline'}>{an.length ? an.slice(0, 7).map(x => ENTRY_BY_ID[x.id].title.split(' — ')[0]).join(' → ') + (an.length > 7 ? ` … (+${an.length - 7})` : '') : 'none: not anchored by any record'}</td></tr>{/each}</tbody></table></div>
  <h3>What the checks do</h3>
  <div class="flist">{#each Object.entries(RULES) as [k, v]}<div class="fi info"><div class="fh"><span class="fr">{k}</span><span><b>{v.title}</b> — {v.desc}</span></div></div>{/each}</div>
  <p><button class="btn" onclick={() => downloadText('human-history-audit.json', JSON.stringify({ stats: a.stats, findings: a.findings, coverage: a.coverage }, null, 2), 'application/json')}>Export audit (JSON)</button></p>
</div>
</section>
