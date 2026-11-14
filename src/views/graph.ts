import * as d3 from 'd3';
import type { Link, Relation } from '../types';
import { ENTRIES, ENTRY_BY_ID, EVENTS, EVENT_BY_ID, LINKS, nodeTitle } from '../data';
import { CATS, CAUTION, REL, STATUS } from '../lib/classification';
import { h, svg } from '../lib/dom';
import { set, state, subscribe } from '../lib/store';
import { fmtRange } from '../lib/time';
import { confDots, sourceCard } from './ui';

interface N extends d3.SimulationNodeDatum { id: string; kind: 'entry' | 'event'; r: number; color: string; title: string; deg: number }
interface E extends d3.SimulationLinkDatum<N> { link: Link }

/** Evidence graph: every edge has a relation type, a confidence and sources, and the UI repeats the standing cautions. */
export class GraphView {
  readonly el: HTMLElement;
  private svgEl = svg('svg', { class: 'graph-svg' });
  private gRoot = svg('g');
  private sim?: d3.Simulation<N, E>;
  private nodes: N[] = [];
  private edges: E[] = [];
  private nodeSel!: d3.Selection<SVGGElement, N, SVGGElement, unknown>;
  private edgeSel!: d3.Selection<SVGLineElement, E, SVGGElement, unknown>;
  private rels = new Set<Relation>(Object.keys(REL) as Relation[]);
  private panel = h('div', { class: 'edge-panel' });
  private built = false;
  private k = 1;
  private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private fitted = false;

  constructor() {
    const filters = h('div', { class: 'gfilters' },
      h('div', { class: 'gf-title' }, 'Relations'),
      ...(Object.entries(REL) as [Relation, typeof REL[Relation]][]).map(([k, v]) => {
        const cb = h('input', { type: 'checkbox', checked: true, on: { change: () => { cb.checked ? this.rels.add(k) : this.rels.delete(k); this.applyFilter(); } } }) as HTMLInputElement;
        return h('label', { class: 'gf' }, cb, h('span', { class: 'lgline', style: `--c:${v.color}; --d:${v.dash ? 'dashed' : 'solid'}` }), v.label);
      }),
      h('p', { class: 'gcaution' }, 'Correlation does not establish causation. Similarity does not establish contact. Chronological overlap does not establish interaction.'));
    this.el = h('div', { class: 'graph-wrap' }, this.svgEl, filters, this.panel);
    this.svgEl.appendChild(this.gRoot);
    subscribe(keys => { if (state.view === 'graph' && (keys.has('selected') || keys.has('view'))) this.style(); if (keys.has('view') && state.view === 'graph') this.build(); });
  }

  build() {
    if (this.built) { this.size(); this.sim?.alpha(0.3).restart(); return; }
    this.built = true;
    const deg: Record<string, number> = {};
    for (const l of LINKS) { deg[l.a] = (deg[l.a] ?? 0) + 1; deg[l.b] = (deg[l.b] ?? 0) + 1; }
    this.nodes = [
      ...ENTRIES.filter(e => deg[e.id]).map<N>(e => ({ id: e.id, kind: 'entry', r: 5 + Math.min(8, Math.sqrt(deg[e.id]) * 2.2), color: CATS[e.cat].color, title: e.title, deg: deg[e.id] })),
      ...EVENTS.filter(e => deg[e.id]).map<N>(e => ({ id: e.id, kind: 'event', r: 6 + Math.min(8, Math.sqrt(deg[e.id]) * 2), color: '#ff9d4d', title: e.title, deg: deg[e.id] })),
    ];
    const byId = new Map(this.nodes.map(n => [n.id, n]));
    this.edges = LINKS.filter(l => byId.has(l.a) && byId.has(l.b)).map<E>(l => ({ source: l.a, target: l.b, link: l }));
    this.size();
    const { width, height } = this.dims();

    const g = d3.select(this.gRoot);
    this.edgeSel = g.append('g').attr('class', 'edges').selectAll<SVGLineElement, E>('line').data(this.edges).join('line')
      .attr('stroke', d => REL[d.link.rel].color)
      .attr('stroke-width', d => d.link.conf === 'high' ? 2 : d.link.conf === 'medium' ? 1.4 : 0.9)
      .attr('stroke-dasharray', d => REL[d.link.rel].dash ?? null)
      .attr('stroke-opacity', d => d.link.conf === 'high' ? 0.85 : d.link.conf === 'medium' ? 0.6 : 0.4)
      .style('cursor', 'pointer')
      .on('click', (_, d) => this.showEdge(d.link))
      .on('mouseenter', function () { d3.select(this).attr('stroke-width', 3.2); })
      .on('mouseleave', (ev, d) => d3.select(ev.currentTarget as SVGLineElement).attr('stroke-width', d.link.conf === 'high' ? 2 : d.link.conf === 'medium' ? 1.4 : 0.9));
    // wide invisible hit targets would be better, kept simple: edges are 1-3px but have hover growth

    this.nodeSel = g.append('g').attr('class', 'nodes').selectAll<SVGGElement, N>('g').data(this.nodes).join('g')
      .style('cursor', 'pointer')
      .on('click', (_, d) => set({ selected: { kind: d.kind, id: d.id } }))
      .call(d3.drag<SVGGElement, N>()
        .on('start', (ev, d) => { if (!ev.active) this.sim!.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) this.sim!.alphaTarget(0); d.fx = null; d.fy = null; }));
    this.nodeSel.each(function (d) {
      const s = d3.select(this);
      if (d.kind === 'event') s.append('rect').attr('x', -d.r * 0.8).attr('y', -d.r * 0.8).attr('width', d.r * 1.6).attr('height', d.r * 1.6).attr('transform', 'rotate(45)');
      else s.append('circle').attr('r', d.r);
      s.select('circle,rect').attr('fill', d.color).attr('stroke', '#050b16').attr('stroke-width', 1.5);
      s.append('text').attr('x', d.r + 4).attr('y', 3.5).text(d.title.length > 34 ? d.title.slice(0, 33) + '…' : d.title).attr('class', 'nlabel');
      s.append('title').text(d.title);
    });

    this.sim = d3.forceSimulation<N>(this.nodes)
      .force('link', d3.forceLink<N, E>(this.edges).id(d => d.id).distance(d => 40 + 70 / (1 + (d.link.conf === 'high' ? 2 : d.link.conf === 'medium' ? 1 : 0))).strength(0.35))
      .force('charge', d3.forceManyBody().strength(-340).distanceMax(520))
      .force('collide', d3.forceCollide<N>().radius(d => d.r + 16))
      .force('x', d3.forceX(width / 2).strength(0.07)).force('y', d3.forceY(height / 2).strength(0.09))
      .on('tick', () => {
        this.edgeSel.attr('x1', d => (d.source as N).x!).attr('y1', d => (d.source as N).y!).attr('x2', d => (d.target as N).x!).attr('y2', d => (d.target as N).y!);
        this.nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
      })
      .on('end', () => { if (!this.fitted) { this.fitted = true; this.fit(); } });
    this.zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 6]).on('zoom', ev => {
      d3.select(this.gRoot).attr('transform', ev.transform.toString());
      const prev = this.k; this.k = ev.transform.k;
      if ((prev < 1.7) !== (this.k < 1.7)) this.style();
    });
    d3.select(this.svgEl).call(this.zoom as any);
    // seed on a ring so the first frames are not a pile
    this.nodes.forEach((n, i) => { const a = (i / this.nodes.length) * Math.PI * 2; n.x = width / 2 + Math.cos(a) * 260; n.y = height / 2 + Math.sin(a) * 200; });
    this.sim.alpha(1);
    this.style();
  }

  private fit() {
    const { width, height } = this.dims();
    const xs = this.nodes.map(n => n.x!), ys = this.nodes.map(n => n.y!);
    const x0 = Math.min(...xs) - 60, x1 = Math.max(...xs) + 190, y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 40;
    const k = Math.min(width / (x1 - x0), height / (y1 - y0), 1.3);
    const tr = d3.zoomIdentity.translate(width / 2 - k * (x0 + x1) / 2, height / 2 - k * (y0 + y1) / 2).scale(k);
    d3.select(this.svgEl).transition().duration(600).call(this.zoom.transform as any, tr);
  }

  private dims() { const r = this.el.getBoundingClientRect(); return { width: r.width || 900, height: r.height || 600 }; }
  private size() { const { width, height } = this.dims(); this.svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`); }

  private applyFilter() {
    this.edgeSel.attr('display', d => (this.rels.has(d.link.rel) ? null : 'none'));
    this.style();
  }

  /** Dim everything that is not the selection or its direct neighbours. */
  private style() {
    if (!this.nodeSel) return;
    const sel = state.selected && state.selected.kind !== 'migration' ? state.selected.id : null;
    const nb = new Set<string>();
    if (sel) for (const l of LINKS) if (this.rels.has(l.rel)) { if (l.a === sel) nb.add(l.b); if (l.b === sel) nb.add(l.a); }
    this.nodeSel.attr('opacity', d => (!sel || d.id === sel || nb.has(d.id) ? 1 : 0.18));
    const zoomed = this.k >= 1.7;
    this.nodeSel.select('.nlabel').attr('opacity', d => (sel ? (d.id === sel || nb.has(d.id) ? 1 : 0) : (zoomed || d.deg >= 5 ? 1 : 0))).attr('font-weight', d => (d.id === sel ? 700 : 500));
    this.nodeSel.each(function (d) { d3.select(this).select('circle,rect').attr('stroke', d.id === sel ? '#ffffff' : '#050b16').attr('stroke-width', d.id === sel ? 3 : 1.5); });
    this.edgeSel.attr('opacity', d => (!sel || (d.source as N).id === sel || (d.target as N).id === sel ? 1 : 0.06));
  }

  private showEdge(l: Link) {
    const rel = REL[l.rel];
    this.panel.replaceChildren(
      h('button', { class: 'btn icon close', 'aria-label': 'Close', on: { click: () => this.panel.classList.remove('on') } }, '✕'),
      h('div', { class: 'ep-head' }, h('a', { class: 'xref', href: '#', on: { click: (e: Event) => { e.preventDefault(); this.go(l.a); } } }, nodeTitle(l.a)),
        h('span', { class: 'relchip', style: `--c:${rel.color}` }, rel.label),
        h('a', { class: 'xref', href: '#', on: { click: (e: Event) => { e.preventDefault(); this.go(l.b); } } }, nodeTitle(l.b))),
      h('div', { class: 'ep-conf' }, 'Confidence ', confDots(l.conf)),
      h('p', null, l.note),
      h('p', { class: 'cw' }, CAUTION[l.rel]),
      l.src.length ? h('ul', { class: 'srcs' }, l.src.map(sourceCard)) : h('p', { class: 'dim' }, 'No sources recorded for this relationship yet.'));
    this.panel.classList.add('on');
    void fmtRange; void STATUS; void ENTRY_BY_ID; void EVENT_BY_ID;
  }
  private go(id: string) { set({ selected: { kind: ENTRY_BY_ID[id] ? 'entry' : 'event', id } }); }
}
