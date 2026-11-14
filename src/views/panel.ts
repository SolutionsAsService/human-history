import type { Cat, Status } from '../types';
import { ENTRIES, MIGRATIONS } from '../data';
import { CATS, STATUS, STATUS_ORDER } from '../lib/classification';
import { h } from '../lib/dom';
import { set, state, subscribe, type ColorBy } from '../lib/store';
import { phase } from '../lib/time';
import { GROUP_COLORS, GROUP_LABELS } from './map';

/** Left layer panel: categories, status filters, route models, display options and the legend. */
export class LayerPanel {
  readonly el = h('aside', { class: 'layers' });
  constructor() {
    subscribe(keys => { if (state.view === 'map' && !(keys.size === 1 && (keys.has('hover') || keys.has('selected')))) this.render(); });
    this.render();
  }

  render() {
    const counts: Record<string, number> = {};
    for (const e of ENTRIES) if (phase(e.start, e.end, state.t) === 'active') counts[e.cat] = (counts[e.cat] ?? 0) + 1;
    const groups = new Map<string, Cat[]>();
    (Object.keys(CATS) as Cat[]).forEach(c => groups.set(CATS[c].group, [...(groups.get(CATS[c].group) ?? []), c]));

    const catBlock = [...groups.entries()].map(([g, cats]) => h('div', { class: 'lgrp' },
      h('div', { class: 'lgrp-t' }, g),
      cats.map(c => {
        const on = state.layers.has(c);
        return h('label', { class: 'lrow' + (on ? '' : ' off') },
          h('input', { type: 'checkbox', checked: on, on: { change: () => { const s = new Set(state.layers); on ? s.delete(c) : s.add(c); set({ layers: s }); } } }),
          h('i', { class: 'sw', style: `background:${CATS[c].color}` }), h('span', { class: 'ln' }, CATS[c].label), h('span', { class: 'cn' }, String(counts[c] ?? 0)));
      })));

    const toggle = (label: string, key: 'showEvents' | 'showRoutes' | 'showGhosts' | 'showShelf' | 'showLinks', tip: string) =>
      h('label', { class: 'lrow', title: tip }, h('input', { type: 'checkbox', checked: state[key], on: { change: (e: Event) => set({ [key]: (e.target as HTMLInputElement).checked } as any) } }), h('span', { class: 'ln' }, label));

    const groupsUsed = [...new Set(MIGRATIONS.map(m => m.group))];
    const routeChips = h('div', { class: 'chips' }, groupsUsed.map(g => {
      const on = !state.routeGroups.size || state.routeGroups.has(g);
      return h('button', { class: 'chip' + (on ? ' on' : ''), style: `--c:${GROUP_COLORS[g] ?? '#9aa8ff'}`, title: 'Show only this model group (click again to clear)', on: { click: () => {
        const s = new Set(state.routeGroups);
        if (s.size === 1 && s.has(g)) s.clear(); else { s.clear(); s.add(g); }
        set({ routeGroups: s });
      } } }, h('i'), GROUP_LABELS[g] ?? g);
    }));

    const seg = (label: string, val: ColorBy) => h('button', { class: 'seg' + (state.colorBy === val ? ' on' : ''), on: { click: () => set({ colorBy: val }) } }, label);
    const statusChips = h('div', { class: 'chips' }, STATUS_ORDER.map(s => {
      const on = state.statuses.has(s);
      return h('button', { class: 'chip st' + (on ? ' on' : ''), style: `--c:${STATUS[s].color}`, title: STATUS[s].label + ' — ' + STATUS[s].desc, on: { click: () => { const n = new Set<Status>(state.statuses); on ? n.delete(s) : n.add(s); set({ statuses: n }); } } }, h('i'), s);
    }));

    const legendFill = state.colorBy === 'category' ? 'fill = category' : state.colorBy === 'evidence' ? 'fill = evidence status' : 'fill = interpretation status';
    const legendRing = state.colorBy === 'interpretation' ? 'ring = evidence status' : 'ring = interpretation status';
    this.el.replaceChildren(
      h('div', { class: 'lp-head' }, h('span', null, h('b', null, 'Layers'), h('span', { class: 'dim small' }, '  numbers = records active at this date')), h('button', { class: 'btn icon lp-close', 'aria-label': 'Close layers', on: { click: () => set({ panelOpen: false }) } }, '✕'),
        h('span', { class: 'lp-btns' },
          h('button', { class: 'link', on: { click: () => set({ layers: new Set(Object.keys(CATS) as Cat[]) }) } }, 'all'),
          h('button', { class: 'link', on: { click: () => set({ layers: new Set() }) } }, 'none'))),
      ...catBlock,
      h('div', { class: 'lgrp' }, h('div', { class: 'lgrp-t' }, 'Overlays'),
        toggle('Environmental events', 'showEvents', 'Eruptions, floods, climate shifts'),
        toggle('Migration & exchange routes', 'showRoutes', 'Schematic routes with competing models'),
        toggle('Sea-level shelf exposure', 'showShelf', 'Schematic: tints the continental shelf as sea level falls'),
        toggle('Show ended records as ghosts', 'showGhosts', 'Dim markers for records whose date range has passed'),
        toggle('Evidence links of selection', 'showLinks', 'Draw graph relations for the selected record')),
      h('div', { class: 'lgrp' }, h('div', { class: 'lgrp-t' }, 'Route models'), routeChips),
      h('div', { class: 'lgrp' }, h('div', { class: 'lgrp-t' }, 'Colour by'), h('div', { class: 'segs' }, seg('Category', 'category'), seg('Evidence', 'evidence'), seg('Interpretation', 'interpretation'))),
      h('div', { class: 'lgrp' }, h('div', { class: 'lgrp-t' }, 'Evidence filter'), statusChips),
      h('div', { class: 'legend' },
        h('div', null, h('span', { class: 'lm' }), `${legendFill}, ${legendRing}`),
        h('div', null, h('span', { class: 'lm dash' }), 'dashed = date is claimed, not accepted'),
        h('div', null, h('span', { class: 'lm ghost' }), 'faint = date range has ended'),
        h('div', null, h('span', { class: 'lm diamond' }), 'environmental event'),
        h('div', null, h('span', { class: 'lm tan' }), 'sand tint = exposed shelf (schematic)')));
  }
}
