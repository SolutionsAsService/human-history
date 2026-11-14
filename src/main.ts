import './styles.css';
import { h } from './lib/dom';
import { readHash, set, state, subscribe, writeHash, type View } from './lib/store';
import { MapView } from './views/map';
import { Dock } from './views/dock';
import { Drawer } from './views/drawer';
import { LayerPanel } from './views/panel';
import { GraphView } from './views/graph';
import { LabView } from './views/lab';
import { LedgerView } from './views/ledger';
import { AboutView } from './views/about';
import { Palette } from './views/search';
import { ENTRIES } from './data';

const TABS: [View, string, string][] = [
  ['map', 'Map', 'Evidence map and time machine'],
  ['graph', 'Evidence graph', 'Connections across disciplines'],
  ['lab', 'Hypothesis lab', 'Competing explanations side by side'],
  ['ledger', 'Ledger', 'Built records and the research queue'],
  ['about', 'Method', 'How to read this and how it stays honest'],
];

const app = document.getElementById('app')!;
const map = new MapView();
const dock = new Dock();
const drawer = new Drawer();
const layers = new LayerPanel();
const graph = new GraphView();
const lab = new LabView();
const ledger = new LedgerView();
const about = new AboutView();
const palette = new Palette();

const tabs = h('nav', { class: 'tabs', role: 'tablist' }, TABS.map(([v, label, tip]) =>
  h('button', { class: 'tab', role: 'tab', title: tip, dataset: { v }, on: { click: () => set({ view: v, playing: false }) } }, label)));

const projToggle = h('div', { class: 'segs' },
  h('button', { class: 'seg', dataset: { p: 'flat' }, on: { click: () => set({ projection: 'flat' }) } }, 'Map'),
  h('button', { class: 'seg', dataset: { p: 'globe' }, on: { click: () => set({ projection: 'globe' }) } }, 'Globe'));
const mapControls = h('div', { class: 'map-ctrls' },
  projToggle,
  h('div', { class: 'zoomctl' },
    h('button', { class: 'btn icon', title: 'Zoom in', 'aria-label': 'Zoom in', on: { click: () => map.zoomBy(1.6) } }, '+'),
    h('button', { class: 'btn icon', title: 'Zoom out', 'aria-label': 'Zoom out', on: { click: () => map.zoomBy(1 / 1.6) } }, '−'),
    h('button', { class: 'btn icon', title: 'Reset view', 'aria-label': 'Reset view', on: { click: () => map.resetView() } }, '⟲')),
  h('button', { class: 'btn layers-toggle', on: { click: () => set({ panelOpen: !state.panelOpen }) } }, 'Layers'));

const loading = h('div', { class: 'loading' }, h('div', { class: 'spin' }), 'Loading the world…');

const vMap = h('section', { class: 'view v-map' }, layers.el, h('div', { class: 'map-col' }, h('div', { class: 'map-stage' }, map.el, mapControls, loading), dock.el));
const vGraph = h('section', { class: 'view v-graph' }, graph.el);
const vLab = h('section', { class: 'view v-lab' }, lab.el);
const vLedger = h('section', { class: 'view v-ledger' }, ledger.el);
const vAbout = h('section', { class: 'view v-about' }, about.el);

const header = h('header', { class: 'top' },
  h('a', { class: 'brand', href: '#/map', title: 'Human History' }, h('span', { class: 'logo' }), h('b', null, 'HUMAN HISTORY'), h('span', { class: 'tag-line' }, 'follow the evidence')),
  tabs, h('span', { class: 'grow' }),
  h('button', { class: 'btn search', on: { click: () => palette.open() } }, 'Search', h('kbd', null, '/')));

const stage = h('main', { class: 'stage' }, vMap, vGraph, vLab, vLedger, vAbout, drawer.el);
app.append(header, stage, palette.el);

function sync() {
  stage.dataset.view = state.view;
  document.body.dataset.view = state.view;
  tabs.querySelectorAll<HTMLElement>('.tab').forEach(b => { const on = b.dataset.v === state.view; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  projToggle.querySelectorAll<HTMLElement>('.seg').forEach(b => b.classList.toggle('on', b.dataset.p === state.projection));
  vMap.classList.toggle('panel-open', state.panelOpen);
  drawer.el.classList.toggle('hidden', state.view === 'lab' || state.view === 'about' || state.view === 'ledger');
}

subscribe(keys => {
  sync();
  if (keys.has('view')) {
    if (state.view === 'map') requestAnimationFrame(() => map.resize());
    if (state.view === 'graph') requestAnimationFrame(() => graph.build());
  }
  if (keys.has('selected') || keys.has('t') || keys.has('view') || keys.has('labPick')) writeHash();
  if (keys.has('selected') && !state.selected) document.title = 'Human History — dynamic evidence map';
});
subscribe(() => { if (document.documentElement.classList.contains('geo-ready')) loading.classList.add('done'); });

addEventListener('hashchange', () => readHash());
addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.selected && !palette.el.classList.contains('on')) set({ selected: null });
});

// Selecting something on the map with a time that makes it invisible would confuse: jump to its start.
subscribe(keys => {
  if (!keys.has('selected') || !state.selected || state.view !== 'map') return;
  const s = state.selected;
  if (s.kind === 'entry') { const e = ENTRIES.find(x => x.id === s.id); if (e && state.t < e.start) set({ t: Math.round(e.start) }); }
});

new ResizeObserver(() => stage.style.setProperty('--dock-h', dock.el.offsetHeight + 'px')).observe(dock.el);
readHash();
sync();
dock.update();
layers.render();
void vGraph; void vLab; void vLedger; void vAbout;
