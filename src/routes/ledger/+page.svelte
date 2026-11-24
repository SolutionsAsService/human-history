<script lang="ts">
  import { onMount } from 'svelte';
  import { ENTRIES, QUEUE, SOURCES, LINKS, EVENTS, MIGRATIONS, QUESTIONS, depth } from '#data';
  import { CATS, STATUS, STATUS_ORDER } from '$lib/classification';
  import { fmtRange } from '$lib/time';
  import { getAudit } from '$lib/audit';
  import { buildReport, downloadText } from '$lib/report';
  import { openEntry } from '$lib/nav';
  import Badge from '$lib/components/Badge.svelte';
  import type { Priority, Status } from '../../types';

  type Row = { kind: 'built' | 'queued'; id?: string; title: string; cat: string; pri: Priority; ev?: Status; interp?: Status; when?: string; depth?: string; pct?: number; gap?: number; section?: string; note?: string };
  const audit = getAudit();
  const rows: Row[] = [
    ...ENTRIES.map(e => ({ kind: 'built' as const, id: e.id, title: e.title, cat: e.cat, pri: e.priority, ev: e.ev, interp: e.interp, when: fmtRange(e.start, e.end), depth: depth(e), pct: audit.phases[e.id].pct, gap: audit.triang[e.id].gap })),
    ...QUEUE.map(q => ({ kind: 'queued' as const, title: q.title, cat: q.cat, pri: q.priority, section: q.section, note: q.note })),
  ];
  const d = { full: 0, partial: 0, stub: 0 }; ENTRIES.forEach(e => d[depth(e)]++);
  const counts = STATUS_ORDER.map(s => ENTRIES.filter(e => e.ev === s).length);
  const maxN = Math.max(1, ...counts);
  const stats: [number, string][] = [[ENTRIES.length, 'records built'], [QUEUE.length, 'queued'], [d.full, 'fully filled'], [d.partial, 'partial'], [d.stub, 'stubs'], [LINKS.length, 'graph links'], [EVENTS.length, 'events'], [MIGRATIONS.length, 'routes'], [QUESTIONS.length, 'questions'], [SOURCES.length, 'sources']];

  let f = $state({ q: '', pri: '', cat: '', status: '', kind: '' });
  let barsOpen = $state(true);
  onMount(() => { barsOpen = innerWidth >= 720; });
  const shown = $derived(rows.filter(r => (!f.q || (r.title + ' ' + (r.note ?? '')).toLowerCase().includes(f.q.toLowerCase())) && (!f.pri || r.pri === f.pri) && (!f.cat || r.cat === f.cat) && (!f.status || r.ev === f.status) && (!f.kind || r.kind === f.kind))
    .sort((x, y) => x.pri.localeCompare(y.pri) || x.title.localeCompare(y.title)));

  function csv() {
    const esc = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const head = ['id', 'title', 'category', 'priority', 'place', 'lat', 'lon', 'start', 'end', 'date_kind', 'date_confidence', 'evidence_status', 'interpretation_status', 'sources'];
    return [head.join(','), ...ENTRIES.map(e => [e.id, e.title, e.cat, e.priority, e.place, e.lat, e.lon, e.start, e.end, e.dateKind, e.dateConfidence, e.ev, e.interp, e.sources.join(';')].map(esc).join(','))].join('\n');
  }
  const catOf = (k: string) => (CATS as any)[k] as { label: string; color: string } | undefined;
</script>
<svelte:head><title>Ledger · Human History</title></svelte:head>
<section class="view v-ledger">
<div class="ledger">
  <header class="lg-head">
    <div><h2>Evidence ledger</h2><p class="ctx">Built records and the research queue from design/ledger.md. Every record carries separate evidence and interpretation classifications, and records are added here before any narrative is built on them.</p></div>
    <div class="stats">{#each stats as [n, l]}<div class="stat"><b>{n}</b><span>{l}</span></div>{/each}</div>
    <details class="bars-d" open={barsOpen}>
      <summary class="bars-t">Records by evidence status</summary>
      <div class="bars">{#each STATUS_ORDER as s, i}
        <div class="bar" title="{STATUS[s].label}: {counts[i]} records"><div class="bar-fill" style="height:{Math.max(3, Math.round((counts[i] / maxN) * 70))}px;background:{STATUS[s].color}"></div><div class="bar-n">{counts[i]}</div><div class="bar-l">{s}</div></div>
      {/each}</div>
    </details>
  </header>
  <div class="lg-tools">
    <input type="search" placeholder="Filter ledger…" aria-label="Filter ledger" bind:value={f.q} />
    <select aria-label="Priority" bind:value={f.pri}><option value="">Priority</option><option>P1</option><option>P2</option><option>P3</option></select>
    <select aria-label="Category" bind:value={f.cat}><option value="">Category</option>{#each Object.entries(CATS) as [k, v]}<option value={k}>{v.label}</option>{/each}</select>
    <select aria-label="Evidence status" bind:value={f.status}><option value="">Evidence status</option>{#each STATUS_ORDER as s}<option value={s}>{STATUS[s].label}</option>{/each}</select>
    <select aria-label="Built / queued" bind:value={f.kind}><option value="">Built / queued</option><option value="built">Built</option><option value="queued">Queued</option></select>
    <span class="dim">{shown.length} shown</span>
    <span class="grow"></span>
    <button class="btn" onclick={() => downloadText('human-history-ledger.json', JSON.stringify({ entries: ENTRIES, events: EVENTS, migrations: MIGRATIONS, links: LINKS, questions: QUESTIONS, sources: SOURCES, queue: QUEUE }, null, 2), 'application/json')}>Export JSON</button>
    <button class="btn" onclick={() => downloadText('human-history-ledger.csv', csv(), 'text/csv')}>Export CSV</button>
    <button class="btn" title="One research report per record, in the ledger §19 structure" onclick={() => downloadText('human-history-reports.md', ENTRIES.map(buildReport).join('\n\n---\n\n'))}>Export all reports (.md)</button>
  </div>
  <div class="tablewrap"><table>
    <thead><tr>{#each ['Record', 'Category', 'Pri', 'Evidence', 'Interpretation', 'Date', 'Depth', 'Workflow', 'Sourcing'] as t}<th>{t}</th>{/each}</tr></thead>
    <tbody>
      {#each shown as r (r.kind + (r.id ?? r.title))}
        <tr class={r.kind} tabindex={r.kind === 'built' ? 0 : -1} onclick={r.kind === 'built' ? () => openEntry(r.id!) : undefined} onkeydown={r.kind === 'built' ? (e) => { if (e.key === 'Enter') openEntry(r.id!); } : undefined}>
          <td class="ttl">{r.title}{#if r.kind === 'queued'}<div class="qn">Queued · ledger §{r.section}{r.note ? ' — ' + r.note : ''}</div>{/if}</td>
          <td data-l="Category"><span class="dot" style="background:{catOf(r.cat)?.color ?? '#ff9d4d'}"></span>{catOf(r.cat)?.label ?? r.cat}</td>
          <td data-l="Priority">{r.pri}</td>
          <td data-l="Evidence">{#if r.ev}<Badge code={r.ev} label={r.ev} />{:else}—{/if}</td>
          <td data-l="Interpretation">{#if r.interp}<Badge code={r.interp} label={r.interp} />{:else}—{/if}</td>
          <td class="dim" data-l="Date">{r.when ?? '—'}</td>
          <td data-l="Depth">{#if r.depth}<span class="tag d-{r.depth}">{r.depth}</span>{:else}—{/if}</td>
          <td data-l="Workflow">{r.pct != null ? `${r.pct}%` : '—'}</td>
          <td data-l="Sourcing">{#if r.gap == null}—{:else if r.gap >= 1}<span class="tag warn" title="Declared status is stronger than the independent sourcing supports">thin ×{r.gap}</span>{:else}<span class="tag">ok</span>{/if}</td>
        </tr>
      {/each}
    </tbody>
  </table></div>
</div>
</section>
