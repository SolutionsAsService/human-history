import type { Entry, EnvEvent, Migration } from '../types';
import { h } from '../lib/dom';
import { ENTRY_BY_ID, EVENT_BY_ID, MIGRATIONS, QUESTIONS, depth, linksOf, nodeTitle } from '../data';
import { CATS, CAUTION, REL, STATUS } from '../lib/classification';
import { fmtRange, fmtYear, NOW } from '../lib/time';
import { set, state, subscribe } from '../lib/store';
import { badge, confDots, copy, dualBadges, list, section, sourceCard, yaml } from './ui';
import { GROUP_LABELS } from './map';
import { contextOf, findingsFor, linesOf, phasesOf, PHASES, triangulate, RULES } from '../lib/audit';
import { buildReport, downloadText } from '../lib/report';

/** Right-hand evidence explorer panel. */
export class Drawer {
  readonly el = h('aside', { class: 'drawer', 'aria-label': 'Evidence explorer' });
  constructor() {
    subscribe(keys => { if (keys.has('selected') || keys.has('view')) this.render(); });
    this.render();
  }

  private opener: HTMLElement | null = null;
  render() {
    const sel = state.selected;
    const wasOpen = this.el.classList.contains('open');
    this.el.classList.toggle('open', !!sel);
    if (!sel) {
      this.el.replaceChildren();
      if (wasOpen) { const o = this.opener; this.opener = null; const usable = !!o && document.contains(o) && o !== document.body && o.offsetParent !== null && !o.closest('.palette');
        setTimeout(() => ((usable ? o : document.querySelector('.map-canvas')) as HTMLElement | null)?.focus({ preventScroll: true }), 0); }
      return;
    }
    let y0 = 0, moved = false;
    const handle = h('button', { class: 'sheet-handle', 'aria-label': 'Record panel: tap to expand or collapse, swipe down to close', 'aria-expanded': String(this.el.classList.contains('full')), on: {
      pointerdown: (e: PointerEvent) => { y0 = e.clientY; moved = false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); },
      pointermove: (e: PointerEvent) => { if (Math.abs(e.clientY - y0) > 8) moved = true; },
      pointerup: (e: PointerEvent) => { const dy = e.clientY - y0; if (dy > 60) { if (this.el.classList.contains('full')) this.el.classList.remove('full'); else set({ selected: null }); } else if (dy < -60) this.el.classList.add('full'); else if (!moved) this.el.classList.toggle('full'); handle.setAttribute('aria-expanded', String(this.el.classList.contains('full'))); },
    } });
    const close = h('button', { class: 'btn icon close', 'aria-label': 'Close panel', title: 'Close (Esc)', on: { click: () => set({ selected: null }) } }, '✕');
    let body: Node | null = null;
    if (sel.kind === 'entry' && ENTRY_BY_ID[sel.id]) body = this.entry(ENTRY_BY_ID[sel.id]);
    else if (sel.kind === 'event' && EVENT_BY_ID[sel.id]) body = this.event(EVENT_BY_ID[sel.id]);
    else if (sel.kind === 'migration') { const m = MIGRATIONS.find(m => m.id === sel.id); if (m) body = this.migration(m); }
    this.el.classList.remove('full');
    const foot = h('div', { class: 'sheet-foot' }, h('button', { class: 'btn', on: { click: () => set({ selected: null }) } }, 'Close record'));
    const note = h('div', { class: 'foot-note' }, 'Positions approximate · routes and shelf tint schematic · records unverified');
    this.el.replaceChildren(handle, close, note, body ?? h('p', { class: 'dim' }, 'Record not found.'), foot);
    this.el.scrollTop = 0;
    if (sel && !wasOpen) { this.opener = document.activeElement as HTMLElement | null; }
    if (sel) { this.el.setAttribute('tabindex', '-1'); this.el.setAttribute('aria-label', 'Evidence record'); this.el.focus({ preventScroll: true }); }
  }

  private dates(e: { start: number; end: number; dateKind: string; dateConfidence: any; datingMethod?: string; dateNote?: string; altChron?: Entry['altChron'] }) {
    const kind: Record<string, string> = { measured: 'Measured date', estimated: 'Estimated date', claimed: 'Claimed date (not accepted)', textual: 'Date of the text' };
    return h('div', { class: 'datebox' },
      h('div', { class: 'date-main' }, fmtRange(e.start, e.end), ' ', confDots(e.dateConfidence)),
      h('div', { class: 'date-kind' }, kind[e.dateKind] ?? e.dateKind),
      e.datingMethod ? h('div', { class: 'date-method' }, 'Method: ', e.datingMethod) : null,
      e.dateNote ? h('div', { class: 'date-note' }, e.dateNote) : null,
      e.altChron?.length ? h('div', { class: 'altchron' }, h('b', null, 'Competing chronologies'), h('ul', null, e.altChron.map(c => h('li', null, h('span', null, fmtRange(c.start, c.end)), ' ', c.label)))) : null);
  }

  private entry(e: Entry) {
    const d = depth(e);
    const links = linksOf(e.id);
    const head = h('header', { class: 'dh' },
      h('div', { class: 'dh-cat', style: `--c:${CATS[e.cat].color}` }, h('i'), CATS[e.cat].label, h('span', { class: 'pri' }, e.priority)),
      h('h2', null, e.title),
      h('div', { class: 'dh-place' }, `${e.place} · ${e.lat.toFixed(3)}, ${e.lon.toFixed(3)}`, e.geoKind && e.geoKind !== 'site' ? h('span', { class: 'tag' }, e.geoKind) : null),
      e.geoNote ? h('div', { class: 'note' }, '⚠ ', e.geoNote) : null,
      dualBadges(e.ev, e.interp),
      this.dates(e),
      d !== 'full' ? h('div', { class: 'depth ' + d, title: 'How fully this record fills the ledger template (design/ledger.md §2).' }, d === 'stub' ? 'Stub record: most ledger fields not yet researched.' : 'Partial record: some ledger fields not yet researched.') : null,
    );
    const frag = document.createDocumentFragment();
    frag.append(head);
    const add = (n: Node | null | false | undefined) => { if (n) frag.append(n); };
    add(section('What was actually discovered', h('p', null, e.summary)));
    if (e.claim) add(section('Original claim', h('p', { class: 'claim' }, e.claim)));
    const ev = h('div', null,
      e.physical?.length ? h('div', null, h('h4', null, 'Physical'), list(e.physical)) : null,
      e.textual?.length ? h('div', null, h('h4', null, 'Textual'), list(e.textual)) : null,
      e.genetic?.length ? h('div', null, h('h4', null, 'Genetic'), list(e.genetic)) : null);
    add(section('Evidence', ev.children.length ? ev : null));
    const interps = h('div', null,
      e.mainstream ? h('div', { class: 'interp main' }, h('b', null, 'Mainstream reading'), h('p', null, e.mainstream)) : null,
      ...(e.alternatives ?? []).map(a => h('div', { class: 'interp' }, h('div', { class: 'ih' }, h('b', null, a.name), badge(a.status)), h('p', null, a.text))));
    add(section('Interpretations', interps.children.length ? interps : null, true, (e.alternatives?.length ?? 0) + (e.mainstream ? 1 : 0)));
    const fa = h('div', { class: 'two' },
      e.for?.length ? h('div', null, h('h4', { class: 'pos' }, 'Supporting'), list(e.for, 'pos')) : null,
      e.against?.length ? h('div', null, h('h4', { class: 'neg' }, 'Contradicting / weak points'), list(e.against, 'neg')) : null);
    add(section('For and against', fa.children.length ? fa : null));
    add(section('Unresolved questions', list(e.unresolved)));
    add(section('What would prove or disprove it', list(e.predictions)));
    add(section('Site record', this.siteRecord(e), true));
    add(section('Research workflow and audit', this.auditPanel(e), false));
    add(section('Context (derived)', this.context(e), false));
    add(section('Connections', links.length ? this.connections(links) : null, true, links.length));
    add(section('Sources', e.sources.length ? h('ul', { class: 'srcs' }, e.sources.map(sourceCard)) : h('p', { class: 'dim' }, 'No sources recorded.'), true, e.sources.length));
    const related = QUESTIONS.filter(q => q.options.some(o => o.entries?.includes(e.id)));
    if (related.length) add(section('Hypothesis laboratory', h('div', null, related.map(q => h('a', { class: 'xref block', href: `#/lab?q=${q.id}`, on: { click: (ev: Event) => { ev.preventDefault(); set({ view: 'lab', labPick: q.id }); } } }, '⚗ ', q.question)))));
    const tools = h('footer', { class: 'tools' },
      h('button', { class: 'btn', on: { click: (ev: Event) => copy(yaml(e), ev.currentTarget as HTMLElement, 'YAML copied') } }, 'Copy ledger YAML'),
      h('button', { class: 'btn', title: 'Research report in the ledger §19 structure', on: { click: () => downloadText(`${e.id}.md`, buildReport(e)) } }, 'Export report (.md)'),
      h('button', { class: 'btn', on: { click: (ev: Event) => copy(location.href, ev.currentTarget as HTMLElement, 'Link copied') } }, 'Copy link'),
      h('span', { class: 'dim' }, `reviewed ${e.reviewed}`));
    add(tools);
    return frag;
  }

  private siteRecord(e: Entry): Node | null {
    const m = e.megalith;
    const rows: [string, string | undefined][] = [
      ['Culture', e.culture], ['Discovery & excavation', e.discovered], ['Proposed purpose', e.purpose], ['Current consensus', e.consensus], ['Environmental context', e.environment],
      ['Geology', m?.geology], ['Quarry', m?.quarry], ['Transport', m?.transport], ['Estimated weight', m?.weightT], ['Chronology', m?.chronology], ['Tool marks', m?.toolMarks], ['Precision', m?.precision], ['Labour', m?.labor], ['Building phases', m?.phases],
    ];
    const present = rows.filter(([, v]) => v);
    if (!present.length && !e.artifacts?.length && !e.construction?.length && !m?.methods?.length) return null;
    return h('div', null,
      h('dl', { class: 'kv' }, present.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v!)])),
      e.artifacts?.length ? h('div', null, h('h4', null, 'Associated artifacts'), list(e.artifacts)) : null,
      e.construction?.length ? h('div', null, h('h4', null, 'Construction techniques'), list(e.construction)) : null,
      m?.methods?.length ? h('div', null, h('h4', null, 'Competing construction models'), list(m.methods)) : null);
  }

  private auditPanel(e: Entry): Node {
    const t = triangulate(e), ph = phasesOf(e), fs = findingsFor(e.id);
    const over = t.gap >= 1;
    return h('div', null,
      h('div', { class: 'tri' },
        h('div', { class: 'tri-n' }, t.score.toFixed(1)),
        h('div', null, h('div', null, `Source triangulation: supports about `, badge(t.band), ` · declared `, badge(t.declared)),
          h('div', { class: over ? 'warnline' : 'dim small' }, over ? `Declared status is ${t.gap} step${t.gap > 1 ? 's' : ''} stronger than the independent sourcing justifies.` : 'Declared status is within what the sourcing supports.'),
          h('div', { class: 'dim small' }, `${t.groups} source discipline${t.groups === 1 ? '' : 's'} · lines: ${linesOf(e).join(', ') || 'none'}`))),
      h('h4', null, `Research workflow (§14) · ${ph.pct}%`),
      h('div', { class: 'bar-h' }, h('i', { style: `width:${ph.pct}%` })),
      h('ol', { class: 'phases' }, PHASES.map((n, i) => h('li', { class: ph.done[i] ? 'ok' : '' }, n))),
      h('h4', null, `Audit findings (${fs.length})`),
      fs.length ? h('ul', { class: 'finds' }, fs.slice(0, 8).map(f => h('li', { class: f.sev }, h('b', null, RULES[f.rule]?.title ?? f.rule), h('div', null, f.msg), f.fix ? h('div', { class: 'dim small' }, 'Fix: ' + f.fix) : null))) : h('p', { class: 'dim small' }, 'No open findings.'));
  }

  private context(e: Entry): Node | null {
    const c = contextOf(e);
    const chip = (id: string, label: string, extra = '') => h('a', { class: 'chip', href: `#/map?e=${id}`, on: { click: (ev: Event) => { ev.preventDefault(); set({ selected: { kind: ENTRY_BY_ID[id] ? 'entry' : 'event', id } }); } } }, label, extra ? h('em', { class: 'dim' }, ' ' + extra) : null);
    return h('div', null,
      c.seaM != null ? h('p', { class: 'dim small' }, `Global sea level at the start of the range ≈ ${c.seaM} m (schematic).`) : null,
      c.contemporaries.length ? h('div', null, h('h4', null, 'Contemporary records nearby'), h('div', { class: 'chips' }, c.contemporaries.map(x => chip(x.id, ENTRY_BY_ID[x.id].title, `${x.km} km`)))) : h('p', { class: 'dim small' }, 'No contemporary records in range yet: a gap in the ledger or in the evidence.'),
      c.events.length ? h('div', null, h('h4', null, 'Environmental events in this window'), h('div', { class: 'chips' }, c.events.map(id => chip(id, EVENT_BY_ID[id].title)))) : null,
      c.routes.length ? h('div', null, h('h4', null, 'Migration models passing nearby'), h('div', { class: 'chips' }, c.routes.map(id => h('a', { class: 'chip', href: '#', on: { click: (ev: Event) => { ev.preventDefault(); set({ selected: { kind: 'migration', id } }); } } }, MIGRATIONS.find(m => m.id === id)?.title ?? id)))) : null);
  }

  private connections(links: ReturnType<typeof linksOf>) {
    return h('ul', { class: 'conns' }, links.map(({ link, other, outgoing }) => {
      const rel = REL[link.rel];
      const kind = ENTRY_BY_ID[other] ? 'entry' : 'event';
      return h('li', null,
        h('div', { class: 'cl' },
          h('span', { class: 'relchip', style: `--c:${rel.color}` }, (outgoing || !rel.directed ? '' : '← ') + rel.label + (outgoing && rel.directed ? ' →' : '')),
          h('a', { href: `#/map?e=${other}`, class: 'xref', on: { click: (ev: Event) => { ev.preventDefault(); set({ selected: { kind, id: other } }); } } }, nodeTitle(other)),
          confDots(link.conf)),
        h('div', { class: 'cn' }, link.note),
        h('div', { class: 'cw' }, CAUTION[link.rel]));
    }));
  }

  private event(e: EnvEvent) {
    const frag = document.createDocumentFragment();
    frag.append(h('header', { class: 'dh' },
      h('div', { class: 'dh-cat', style: '--c:#ff9d4d' }, h('i'), 'Environmental event'),
      h('h2', null, e.title),
      e.lat != null ? h('div', { class: 'dh-place' }, `${e.lat.toFixed(2)}, ${e.lon!.toFixed(2)}`) : h('div', { class: 'dh-place' }, 'Global / hemispheric'),
      h('div', { class: 'dual' }, h('div', null, h('span', { class: 'dual-k' }, 'Physical evidence'), badge(e.ev)), e.human ? h('div', null, h('span', { class: 'dual-k' }, 'Human consequences'), badge(e.human.status)) : null),
      this.dates(e)));
    const add = (n: Node | null | false) => { if (n) frag.append(n); };
    add(section('What the record shows', h('p', null, e.summary)));
    add(section('Physical evidence', list(e.physical)));
    add(section('Human consequences: is causation established?', e.human ? h('p', null, e.human.text) : null));
    add(section('Alternative explanations', list(e.alternatives)));
    add(section('Connections', linksOf(e.id).length ? this.connections(linksOf(e.id)) : null, true, linksOf(e.id).length));
    add(section('Sources', h('ul', { class: 'srcs' }, e.sources.map(sourceCard)), true, e.sources.length));
    return frag;
  }

  private migration(m: Migration) {
    const frag = document.createDocumentFragment();
    const siblings = MIGRATIONS.filter(x => x.group === m.group && x.id !== m.id);
    frag.append(h('header', { class: 'dh' },
      h('div', { class: 'dh-cat', style: '--c:#9aa8ff' }, h('i'), GROUP_LABELS[m.group] ?? m.group),
      h('h2', null, m.title),
      h('div', { class: 'dh-place' }, m.model, m.schematic ? h('span', { class: 'tag', title: 'Routes are schematic: they show order and direction, not surveyed paths.' }, 'schematic route') : null),
      dualBadges(m.ev, m.interp),
      h('div', { class: 'datebox' }, h('div', { class: 'date-main' }, fmtRange(m.start, m.end), ' ', confDots(m.dateConfidence)))));
    const add = (n: Node | null | false) => { if (n) frag.append(n); };
    add(section('Summary', h('p', null, m.summary)));
    add(section('For and against', h('div', { class: 'two' }, m.for.length ? h('div', null, h('h4', { class: 'pos' }, 'Supporting'), list(m.for, 'pos')) : null, m.against.length ? h('div', null, h('h4', { class: 'neg' }, 'Contradicting / weak points'), list(m.against, 'neg')) : null)));
    add(section('Unresolved questions', list(m.unresolved)));
    add(siblings.length ? section('Competing or related models', h('ul', { class: 'conns' }, siblings.map(s => h('li', null, h('a', { class: 'xref', href: `#/map`, on: { click: (ev: Event) => { ev.preventDefault(); set({ selected: { kind: 'migration', id: s.id } }); } } }, s.model + ' — ' + s.title), ' ', badge(s.ev))))) : null);
    add(section('Sources', h('ul', { class: 'srcs' }, m.sources.map(sourceCard)), true, m.sources.length));
    void STATUS; void fmtYear; void NOW;
    return frag;
  }
}
