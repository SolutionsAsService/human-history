import './styles.css';
import { h } from './lib/dom';
import { readHash, set, state, subscribe, writeHash, type View } from './lib/store';
import { MapView } from './views/map';
import { Dock } from './views/dock';
import { Drawer } from './views/drawer';
import { LayerPanel } from './views/panel';
import { GraphView } from './views/graph';
import { LabView } from './views/lab';
import { ThreadsView } from './views/threads';
import { LedgerView } from './views/ledger';
import { AboutView } from './views/about';
import { AuditView } from './views/audit';
import { Palette } from './views/search';
import { ENTRIES } from './data';
import { icon } from './lib/icons';

const TABS: [View, string, string][] = [
  ['map', 'Map', 'Evidence map and time machine'],
  ['graph', 'Evidence graph', 'Connections across disciplines'],
  ['threads', 'Threads', 'What passed between cultures: languages, scripts, religions, ideas, technologies'],
  ['lab', 'Hypothesis lab', 'Competing explanations side by side'],
  ['ledger', 'Ledger', 'Built records and the research queue'],
  ['audit', 'Audit', 'The evidence tables checking each other'],
  ['about', 'Method', 'How to read this and how it stays honest'],
];

const app = document.getElementById('app')!;
const map = new MapView();
const dock = new Dock();
const drawer = new Drawer();
const layers = new LayerPanel();
const graph = new GraphView();
const lab = new LabView();
const threads = new ThreadsView();
const ledger = new LedgerView();
const about = new AboutView();
const audit = new AuditView();
const palette = new Palette();

const tabs = h('nav', { class: 'tabs', role: 'tablist' }, TABS.map(([v, label, tip]) =>
  h('button', { class: 'tab', role: 'tab', title: tip, dataset: { v }, on: { click: () => set({ view: v, playing: false }) } }, label)));

const ICON_FOR: Record<string, string> = { map: 'map', graph: 'graph', threads: 'threads', lab: 'lab', ledger: 'ledger', audit: 'audit', about: 'about' };
const SHORT: Record<string, string> = { map: 'Map', graph: 'Graph', threads: 'Threads', lab: 'Lab', ledger: 'Ledger', audit: 'Audit', about: 'Method' };
const bottomNav = h('nav', { class: 'bottomnav', 'aria-label': 'Views' }, TABS.map(([v, , tip]) =>
  h('button', { dataset: { v }, title: tip, 'aria-label': tip, on: { click: () => set({ view: v, playing: false }) } }, icon(ICON_FOR[v]), h('span', null, SHORT[v]))));

const projToggle = h('div', { class: 'segs' },
  h('button', { class: 'seg', dataset: { p: 'flat' }, on: { click: () => set({ projection: 'flat' }) } }, 'Map'),
  h('button', { class: 'seg', dataset: { p: 'globe' }, on: { click: () => set({ projection: 'globe' }) } }, 'Globe'));
let layersToggle: HTMLElement;
const mapControls = h('div', { class: 'map-ctrls' },
  projToggle,
  h('div', { class: 'zoomctl' },
    h('button', { class: 'btn icon', title: 'Zoom in', 'aria-label': 'Zoom in', on: { click: () => map.zoomBy(1.6) } }, '+'),
    h('button', { class: 'btn icon', title: 'Zoom out', 'aria-label': 'Zoom out', on: { click: () => map.zoomBy(1 / 1.6) } }, '−'),
    h('button', { class: 'btn icon', title: 'Reset view', 'aria-label': 'Reset view', on: { click: () => map.resetView() } }, '⟲')),
  layersToggle = h('button', { class: 'btn layers-toggle', 'aria-label': 'Layers and filters', on: { click: () => set({ panelOpen: !state.panelOpen }) } }, 'Layers'));

const caveat = h('div', { class: 'map-caveat' },
  h('span', { class: 'mc-touch' }, 'Tap a dot for its evidence. '), h('span', { class: 'mc-click' }, 'Click a dot for its evidence. '),
  'Dashed ring = claimed date. Routes and the sand-tint shelf are schematic. Positions approximate; records unverified. ', h('a', { href: '#/about' }, 'Method'));
const loading = h('div', { class: 'loading' }, h('div', { class: 'spin' }), 'Loading the world…');

const scrim = h('div', { class: 'scrim', on: { click: () => set({ panelOpen: false }) } });
const vMap = h('section', { class: 'view v-map' }, layers.el, scrim, h('div', { class: 'map-col' }, h('div', { class: 'map-stage' }, map.el, mapControls, caveat, loading), dock.el));
const vGraph = h('section', { class: 'view v-graph' }, graph.el);
const vThreads = h('section', { class: 'view v-threads' }, threads.el);
const vLab = h('section', { class: 'view v-lab' }, lab.el);
const vLedger = h('section', { class: 'view v-ledger' }, ledger.el);
const vAbout = h('section', { class: 'view v-about' }, about.el);
const vAudit = h('section', { class: 'view v-audit' }, audit.el);

const header = h('header', { class: 'top' },
  h('h1', { class: 'brand' }, h('a', { href: '#/map', title: 'Human History: follow the evidence' }, h('span', { class: 'logo' }), h('b', null, 'HUMAN HISTORY'), h('span', { class: 'tag-line' }, 'follow the evidence'))),
  tabs, h('span', { class: 'grow' }),
  h('button', { class: 'btn search', on: { click: () => palette.open() } }, 'Search', h('kbd', null, '/')));

const stage = h('main', { class: 'stage' }, vMap, vGraph, vThreads, vLab, vLedger, vAudit, vAbout, drawer.el);
app.append(header, stage, palette.el);
document.body.append(h('div', { id: 'sr-live', class: 'sr-only', role: 'status', 'aria-live': 'polite' }));
document.body.append(bottomNav);

let wasModal = false; let prevFocus: HTMLElement | null = null;
function sync() {
  stage.dataset.view = state.view;
  stage.dataset.sel = state.selected ? '1' : '';
  document.body.dataset.view = state.view;
  tabs.querySelectorAll<HTMLElement>('.tab').forEach(b => { const on = b.dataset.v === state.view; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  bottomNav.querySelectorAll<HTMLElement>('button').forEach(b => { const on = b.dataset.v === state.view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
  projToggle.querySelectorAll<HTMLElement>('.seg').forEach(b => b.classList.toggle('on', b.dataset.p === state.projection));
  vMap.classList.toggle('panel-open', state.panelOpen);
  // the layers sheet is a modal dialog wherever it overlays the map
  const modal = state.panelOpen && innerWidth <= 1100;
  layers.el.setAttribute('role', modal ? 'dialog' : 'complementary'); layers.el.setAttribute('aria-modal', String(modal)); layers.el.setAttribute('aria-label', 'Layers and filters');
  (vMap.querySelector('.map-col') as any).inert = modal;
  if (modal && !wasModal) { prevFocus = document.activeElement as HTMLElement | null; setTimeout(() => (layers.el.querySelector('.lp-close') as HTMLElement | null)?.focus(), 0); }
  if (!modal && wasModal) setTimeout(() => (prevFocus && document.contains(prevFocus) ? prevFocus : (layersToggle as HTMLElement)).focus(), 0);
  wasModal = modal;
  drawer.el.classList.toggle('hidden', state.view === 'lab' || state.view === 'threads' || state.view === 'about' || state.view === 'ledger' || state.view === 'audit');
}

subscribe(keys => {
  sync();
  if (keys.has('view')) {
    if (state.view === 'map') requestAnimationFrame(() => map.resize());
    if (state.view === 'graph') requestAnimationFrame(() => graph.build());
  }
  if (keys.has('selected') || keys.has('t') || keys.has('view') || keys.has('labPick') || keys.has('strand')) writeHash();
  if (keys.has('selected') && !state.selected) document.title = 'Human History — dynamic evidence map';
});
subscribe(() => { if (document.documentElement.classList.contains('geo-ready')) loading.classList.add('done'); });

addEventListener('hashchange', () => readHash());
addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.panelOpen && innerWidth <= 1100 && state.view === 'map') { set({ panelOpen: false }); return; }
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
void vGraph; void vThreads; void vLab; void vLedger; void vAbout; void vAudit;
