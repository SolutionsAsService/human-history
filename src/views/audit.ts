import { feature } from 'topojson-client';
import { ENTRIES, ENTRY_BY_ID, EVENT_BY_ID, MIGRATIONS, QUESTIONS, SOURCES } from '../data';
import { PHASES, RULES, getAudit, linesOf, type Finding, type Severity } from '../lib/audit';
import { STATUS } from '../lib/classification';
import { downloadText } from '../lib/report';
import { h } from '../lib/dom';
import { set, state, subscribe } from '../lib/store';
import { badge } from './ui';

/** Audit view: the evidence tables checking each other. */
export class AuditView {
  readonly el = h('div', { class: 'audit' });
  private sev = new Set<Severity>(['error', 'warn']);
  private rule = '';
  private limit = 60;
  private landLoaded = false;

  constructor() {
    subscribe(keys => { if (state.view === 'audit' && keys.has('view')) { this.render(); this.loadLand(); } });
    this.render();
  }

  private async loadLand() {
    if (this.landLoaded) return; this.landLoaded = true;
    try {
      const topo = await fetch(`${import.meta.env.BASE_URL}data/land-50m.topo.json`).then(r => r.json());
      const land = feature(topo, topo.objects[Object.keys(topo.objects)[0]]);
      getAudit(land, true); if (state.view === 'audit') this.render();
    } catch { /* geography check simply stays off */ }
  }

  private go(id: string) {
    if (ENTRY_BY_ID[id]) set({ view: 'map', selected: { kind: 'entry', id } });
    else if (EVENT_BY_ID[id]) set({ view: 'map', selected: { kind: 'event', id } });
    else if (MIGRATIONS.some(m => m.id === id)) set({ view: 'map', selected: { kind: 'migration', id } });
    else if (QUESTIONS.some(q => q.id === id)) set({ view: 'lab', labPick: id });
  }
  private label(id: string) { return ENTRY_BY_ID[id]?.title ?? EVENT_BY_ID[id]?.title ?? MIGRATIONS.find(m => m.id === id)?.title ?? QUESTIONS.find(q => q.id === id)?.question ?? id; }

  render() {
    const a = getAudit();
    const count = (s: Severity) => a.findings.filter(f => f.sev === s).length;
    const tile = (n: string | number, l: string, cls = '') => h('div', { class: 'stat ' + cls }, h('b', null, String(n)), h('span', null, l));
    const byRule = new Map<string, Finding[]>(); a.findings.forEach(f => byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]));
    const visible = a.findings.filter(f => this.sev.has(f.sev) && (!this.rule || f.rule === this.rule));

    const sevChip = (s: Severity, label: string) => h('button', { class: 'chip' + (this.sev.has(s) ? ' on' : ''), on: { click: () => { this.sev.has(s) ? this.sev.delete(s) : this.sev.add(s); this.limit = 60; this.render(); } } }, `${label} `, h('em', null, String(count(s))));
    const ruleChips = [...byRule.entries()].sort((x, y) => y[1].length - x[1].length).map(([r, fs]) => h('button', { class: 'chip' + (this.rule === r ? ' on' : ''), title: RULES[r]?.desc, on: { click: () => { this.rule = this.rule === r ? '' : r; this.limit = 60; this.render(); } } }, RULES[r]?.title ?? r, h('em', null, String(fs.length))));

    // coverage heat map
    const c = a.coverage; const max = Math.max(1, ...c.cells.flat());
    const heat = h('table', { class: 'heat' }, h('thead', null, h('tr', null, h('th'), c.eras.map(e => h('th', null, e)))),
      h('tbody', null, c.regions.map((r, i) => h('tr', null, h('td', { class: 'rl' }, r), c.cells[i].map(n => h('td', { style: `background:${n === 0 ? 'rgba(229,83,91,.18)' : `rgba(124,240,255,${0.12 + 0.7 * (n / max)})`};color:${n === 0 ? '#ff9aa2' : '#06101d'}` }, n === 0 ? '·' : String(n)))))));

    // triangulation
    const tri = ENTRIES.map(e => ({ e, t: a.triang[e.id] })).filter(x => x.t.gap >= 1).sort((x, y) => y.t.gap - x.t.gap || x.t.score - y.t.score).slice(0, 25);
    const triTable = h('table', { class: 'tbl2' }, h('thead', null, h('tr', null, ['Record', 'Declared', 'Sourcing supports', 'Score', 'Lines of evidence'].map(t => h('th', null, t)))),
      h('tbody', null, tri.map(({ e, t }) => h('tr', null,
        h('td', null, h('a', { class: 'xref', href: '#', on: { click: (ev: Event) => { ev.preventDefault(); this.go(e.id); } } }, e.title)),
        h('td', null, badge(t.declared, t.declared)), h('td', null, badge(t.band, t.band)), h('td', null, t.score.toFixed(1)), h('td', { class: 'dim' }, linesOf(e).join(', ') || '—')))));

    // routes
    const routeTable = h('table', { class: 'tbl2' }, h('thead', null, h('tr', null, ['Route', 'Evidence', 'Anchor records within 650 km and the time window'].map(t => h('th', null, t)))),
      h('tbody', null, MIGRATIONS.map(m => { const an = a.anchors[m.id] ?? []; return h('tr', null, h('td', null, h('a', { class: 'xref', href: '#', on: { click: (ev: Event) => { ev.preventDefault(); this.go(m.id); } } }, m.title)), h('td', null, badge(m.ev, m.ev)),
        h('td', { class: an.length ? '' : 'warnline' }, an.length ? an.slice(0, 7).map(x => ENTRY_BY_ID[x.id].title.split(' — ')[0]).join(' → ') + (an.length > 7 ? ` … (+${an.length - 7})` : '') : 'none: not anchored by any record')); })));

    // phases
    const ph = PHASES.map((_, i) => ENTRIES.filter(e => a.phases[e.id].done[i]).length); const pmax = Math.max(1, ...ph);
    const phBars = h('div', { class: 'hist-bars', style: 'margin-bottom:22px' }, PHASES.map((n, i) => h('div', { style: `height:${Math.max(3, Math.round((ph[i] / pmax) * 68))}px`, title: `${n}: ${ph[i]} of ${ENTRIES.length} records` }, h('span', null, n.split('-')[0].slice(0, 9)))));

    const list = visible.slice(0, this.limit);
    this.el.replaceChildren(
      h('header', null,
        h('h2', null, 'Evidence audit'),
        h('p', { class: 'ctx' }, 'The evidence tables checking each other. Declared statuses are compared with the sources and independent lines of evidence behind them; graph relations are tested against dates, geography and each other; hypotheses against their own evidence lists and the records they cite; migration routes against the records that should anchor them; and coverage is mapped by region and era. These are prompts for review, not verdicts. An algorithm cannot tell you which side of a dispute is right.'),
        h('div', { class: 'ag' },
          tile(count('error'), 'errors'), tile(count('warn'), 'warnings'), tile(count('info'), 'notes'),
          tile(a.stats.avgPhasePct + '%', 'avg workflow completeness'), tile(a.stats.reportReady, 'report-ready records'),
          tile(`${a.stats.crossCategoryLinks}/${a.stats.links}`, 'cross-discipline links'), tile(a.stats.components, 'graph components'),
          tile(Math.round(a.stats.unverifiedShare * 100) + '%', 'citations still to locate'), tile(SOURCES.length, 'sources'))),
      h('h3', null, 'Findings'),
      h('div', { class: 'rules' }, sevChip('error', 'Errors'), sevChip('warn', 'Warnings'), sevChip('info', 'Notes'), h('span', { class: 'dim' }, '|'), ruleChips),
      h('div', { class: 'flist' }, list.map(f => h('div', { class: 'fi ' + f.sev },
        h('div', { class: 'fh' }, h('span', { class: 'fr' }, RULES[f.rule]?.title ?? f.rule), h('span', null, f.msg)),
        f.fix ? h('div', { class: 'ff' }, 'Fix: ' + f.fix) : null,
        h('div', { class: 'fids' }, f.ids.map(id => h('a', { class: 'chip', href: '#', on: { click: (ev: Event) => { ev.preventDefault(); this.go(id); } } }, this.label(id).slice(0, 48))))))),
      visible.length > this.limit ? h('p', null, h('button', { class: 'btn', on: { click: () => { this.limit += 80; this.render(); } } }, `Show ${Math.min(80, visible.length - this.limit)} more of ${visible.length - this.limit}`)) : h('span'),
      !visible.length ? h('p', { class: 'dim' }, 'No findings for this filter.') : h('span'),
      h('h3', null, 'Coverage by region and era (records whose date range touches the era)'),
      h('div', { class: 'tablewrap', style: 'padding:8px' }, heat),
      h('p', { class: 'dim small' }, `Empty cells where people were plausibly present are a gap in the ledger (or in the evidence): ${c.thin.length} cells. Records with no coordinates in range, UAP and esoteric records are not counted.`),
      h('h3', null, 'Workflow phases completed across records (master prompt §14)'), phBars,
      h('h3', null, 'Largest gaps between declared status and what the sourcing supports'), h('div', { class: 'tablewrap' }, triTable),
      h('h3', null, 'Migration routes and the records that anchor them'), h('div', { class: 'tablewrap' }, routeTable),
      h('h3', null, 'What the checks do'),
      h('div', { class: 'flist' }, Object.entries(RULES).map(([k, v]) => h('div', { class: 'fi info' }, h('div', { class: 'fh' }, h('span', { class: 'fr' }, k), h('span', null, h('b', null, v.title), ' — ', v.desc))))),
      h('p', null, h('button', { class: 'btn', on: { click: () => downloadText('human-history-audit.json', JSON.stringify({ stats: a.stats, findings: a.findings, coverage: a.coverage }, null, 2), 'application/json') } }, 'Export audit (JSON)')));
    void STATUS;
  }
}
