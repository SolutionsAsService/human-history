<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { Link, Relation } from '../../types';
  import { ENTRIES, ENTRY_BY_ID, EVENTS, LINKS, nodeTitle } from '#data';
  import { CATS, CAUTION, REL } from '$lib/classification';
  import { app } from '$lib/app.svelte';
  import ConfDots from '$lib/components/ConfDots.svelte';
  import SourceCard from '$lib/components/SourceCard.svelte';

  interface N extends d3.SimulationNodeDatum { id: string; kind: 'entry' | 'event'; r: number; color: string; title: string; deg: number }
  interface E extends d3.SimulationLinkDatum<N> { link: Link }

  /** Evidence graph: every edge has a relation type, a confidence and sources, and the UI repeats the standing cautions. */
  let wrap: HTMLDivElement | undefined = $state();
  let svgEl: SVGSVGElement | undefined = $state();
  let gRoot: SVGGElement | undefined = $state();
  let hintGone = $state(false);
  let edge = $state<Link | null>(null);
  let rels = $state<Relation[]>(Object.keys(REL) as Relation[]);
  let built = $state(false);
  let k = $state(1);
  let filtersOpen = $state(true);

  let sim: d3.Simulation<N, E> | undefined;
  let nodes: N[] = [];
  let edges: E[] = [];
  let nodeSel: d3.Selection<SVGGElement, N, SVGGElement, unknown> | undefined;
  let edgeSel: d3.Selection<SVGLineElement, E, SVGGElement, unknown> | undefined;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | undefined;
  let fitted = false;

  const dims = () => { const r = wrap!.getBoundingClientRect(); return { width: r.width || 900, height: r.height || 600 }; };
  const size = () => { const { width, height } = dims(); svgEl!.setAttribute('viewBox', `0 0 ${width} ${height}`); };
  const confW = (c: Link['conf']) => (c === 'high' ? 2 : c === 'medium' ? 1.4 : 0.9);

  function fit() {
    const { width, height } = dims();
    const xs = nodes.map(n => n.x!), ys = nodes.map(n => n.y!);
    const x0 = Math.min(...xs) - 60, x1 = Math.max(...xs) + 190, y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 40;
    const kk = Math.min(width / (x1 - x0), height / (y1 - y0), 1.3);
    const tr = d3.zoomIdentity.translate(width / 2 - kk * (x0 + x1) / 2, height / 2 - kk * (y0 + y1) / 2).scale(kk);
    d3.select(svgEl!).transition().duration(600).call(zoom!.transform as any, tr);
  }

  function build() {
    const deg: Record<string, number> = {};
    for (const l of LINKS) { deg[l.a] = (deg[l.a] ?? 0) + 1; deg[l.b] = (deg[l.b] ?? 0) + 1; }
    nodes = [
      ...ENTRIES.filter(e => deg[e.id]).map<N>(e => ({ id: e.id, kind: 'entry', r: 5 + Math.min(8, Math.sqrt(deg[e.id]) * 2.2), color: CATS[e.cat].color, title: e.title, deg: deg[e.id] })),
      ...EVENTS.filter(e => deg[e.id]).map<N>(e => ({ id: e.id, kind: 'event', r: 6 + Math.min(8, Math.sqrt(deg[e.id]) * 2), color: '#ff9d4d', title: e.title, deg: deg[e.id] })),
    ];
    const byId = new Map(nodes.map(n => [n.id, n]));
    edges = LINKS.filter(l => byId.has(l.a) && byId.has(l.b)).map<E>(l => ({ source: l.a, target: l.b, link: l }));
    size();
    const { width, height } = dims();

    const g = d3.select(gRoot!);
    edgeSel = g.append('g').attr('class', 'edges').selectAll<SVGLineElement, E>('line').data(edges).join('line')
      .attr('stroke', d => REL[d.link.rel].color)
      .attr('stroke-width', d => confW(d.link.conf))
      .attr('stroke-dasharray', d => REL[d.link.rel].dash ?? null)
      .attr('stroke-opacity', d => (d.link.conf === 'high' ? 0.85 : d.link.conf === 'medium' ? 0.6 : 0.4))
      .style('cursor', 'pointer')
      .on('click', (_, d) => { edge = d.link; })
      .on('mouseenter', function () { d3.select(this).attr('stroke-width', 3.2); })
      .on('mouseleave', (ev, d) => d3.select(ev.currentTarget as SVGLineElement).attr('stroke-width', confW(d.link.conf)));

    nodeSel = g.append('g').attr('class', 'nodes').selectAll<SVGGElement, N>('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .on('click', (_, d) => { app.selected = { kind: d.kind, id: d.id }; })
      .call(d3.drag<SVGGElement, N>()
        .on('start', (ev, d) => { if (!ev.active) sim!.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) sim!.alphaTarget(0); d.fx = null; d.fy = null; }));
    nodeSel.each(function (d) {
      const s = d3.select(this);
      if (d.kind === 'event') s.append('rect').attr('x', -d.r * 0.8).attr('y', -d.r * 0.8).attr('width', d.r * 1.6).attr('height', d.r * 1.6).attr('transform', 'rotate(45)');
      else s.append('circle').attr('r', d.r);
      s.select('circle:not(.hit),rect').attr('fill', d.color).attr('stroke', '#050b16').attr('stroke-width', 1.5);
      s.insert('circle', ':first-child').attr('r', Math.max(d.r + 6, 22)).attr('fill', 'transparent').attr('class', 'hit');
      s.append('text').attr('x', d.r + 4).attr('y', 3.5).text(d.title.length > 34 ? d.title.slice(0, 33) + '…' : d.title).attr('class', 'nlabel');
      s.append('title').text(d.title);
    });

    sim = d3.forceSimulation<N>(nodes)
      .force('link', d3.forceLink<N, E>(edges).id(d => d.id).distance(d => 40 + 70 / (1 + (d.link.conf === 'high' ? 2 : d.link.conf === 'medium' ? 1 : 0))).strength(0.35))
      .force('charge', d3.forceManyBody().strength(-340).distanceMax(520))
      .force('collide', d3.forceCollide<N>().radius(d => d.r + 16))
      .force('x', d3.forceX(width / 2).strength(width < height ? 0.16 : 0.07)).force('y', d3.forceY(height / 2).strength(width < height ? 0.035 : 0.09))
      .on('tick', () => {
        edgeSel!.attr('x1', d => (d.source as N).x!).attr('y1', d => (d.source as N).y!).attr('x2', d => (d.target as N).x!).attr('y2', d => (d.target as N).y!);
        nodeSel!.attr('transform', d => `translate(${d.x},${d.y})`);
      })
      .on('end', () => { if (!fitted) { fitted = true; fit(); } });
    zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 6]).on('zoom', ev => {
      d3.select(gRoot!).attr('transform', ev.transform.toString());
      k = ev.transform.k;
      d3.select(gRoot!).selectAll('.nlabel').attr('font-size', 12 / k);
    });
    d3.select(svgEl!).call(zoom as any);
    // seed on a ring so the first frames are not a pile
    nodes.forEach((n, i) => { const a = (i / nodes.length) * Math.PI * 2; n.x = width / 2 + Math.cos(a) * 260; n.y = height / 2 + Math.sin(a) * 200; });
    sim.alpha(1);
    built = true;
  }

  onMount(() => {
    filtersOpen = innerWidth >= 720;
    const raf = requestAnimationFrame(build);
    const ro = new ResizeObserver(() => { if (built) { size(); } });
    ro.observe(wrap!);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); sim?.stop(); };
  });

  /** Dim everything that is not the selection or its direct neighbours; hide edges of switched-off relations. */
  $effect(() => {
    if (!built || !nodeSel || !edgeSel) return;
    const active = new Set(rels);
    const sel = app.selected && app.selected.kind !== 'migration' ? app.selected.id : null;
    const zoomed = k >= (innerWidth < 720 ? 2.4 : 1.7);
    const nb = new Set<string>();
    if (sel) for (const l of LINKS) if (active.has(l.rel)) { if (l.a === sel) nb.add(l.b); if (l.b === sel) nb.add(l.a); }
    edgeSel.attr('display', d => (active.has(d.link.rel) ? null : 'none'));
    nodeSel.attr('opacity', d => (!sel || d.id === sel || nb.has(d.id) ? 1 : 0.18));
    nodeSel.select('.nlabel').attr('opacity', d => (sel ? (d.id === sel || nb.has(d.id) ? 1 : 0) : (zoomed || (d as N).deg >= 5 ? 1 : 0))).attr('font-weight', d => ((d as N).id === sel ? 700 : 500));
    nodeSel.each(function (d) { d3.select(this).select('circle:not(.hit),rect').attr('stroke', d.id === sel ? '#ffffff' : '#050b16').attr('stroke-width', d.id === sel ? 3 : 1.5); });
    edgeSel.attr('opacity', d => (!sel || (d.source as N).id === sel || (d.target as N).id === sel ? 1 : 0.06));
  });

  const go = (id: string) => { app.selected = { kind: ENTRY_BY_ID[id] ? 'entry' : 'event', id }; };
  const relEntries = Object.entries(REL) as [Relation, (typeof REL)[Relation]][];
  function toggle(r: Relation, on: boolean) { rels = on ? [...rels, r] : rels.filter(x => x !== r); }
</script>

<svelte:head><title>Evidence graph · Human History</title></svelte:head>
<section class="view v-graph">
  <div class="graph-wrap" bind:this={wrap}>
    <svg class="graph-svg" bind:this={svgEl} onpointerdown={() => (hintGone = true)} role="img" aria-label="Evidence graph of records and events linked by typed relations"><g bind:this={gRoot}></g></svg>
    <details class="gfilters" bind:open={filtersOpen}>
      <summary class="gf-title">Relations and cautions</summary>
      {#each relEntries as [rk, v]}
        <label class="gf"><input type="checkbox" checked={rels.includes(rk)} onchange={(e) => toggle(rk, e.currentTarget.checked)} /><span class="lgline" style="--c:{v.color}; --d:{v.dash ? 'dashed' : 'solid'}"></span>{v.label}</label>
      {/each}
      <p class="gcaution">Correlation does not establish causation. Similarity does not establish contact. Chronological overlap does not establish interaction.</p>
    </details>
    <div class="edge-panel" class:on={!!edge}>
      {#if edge}
        {@const rel = REL[edge.rel]}
        <button class="btn icon close" aria-label="Close" onclick={() => (edge = null)}>✕</button>
        <div class="ep-head">
          <a class="xref" href="#a" onclick={(e) => { e.preventDefault(); go(edge!.a); }}>{nodeTitle(edge.a)}</a>
          <span class="relchip" style="--c:{rel.color}">{rel.label}</span>
          <a class="xref" href="#b" onclick={(e) => { e.preventDefault(); go(edge!.b); }}>{nodeTitle(edge.b)}</a>
        </div>
        <div class="ep-conf">Confidence <ConfDots c={edge.conf} /></div>
        <p>{edge.note}</p>
        <p class="cw">{CAUTION[edge.rel]}</p>
        {#if edge.src.length}<ul class="srcs">{#each edge.src as id}<SourceCard {id} />{/each}</ul>{:else}<p class="dim">No sources recorded for this relationship yet.</p>{/if}
      {/if}
    </div>
    <div class="graph-hint" class:gone={hintGone}>Evidence graph · pinch to zoom · drag to pan · tap a node</div>
  </div>
</section>
