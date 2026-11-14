import type { HypothesisOption, Question } from '../types';
import { ENTRY_BY_ID, QUESTIONS, QUESTION_BY_ID } from '../data';
import { STATUS, STATUS_ORDER } from '../lib/classification';
import { h } from '../lib/dom';
import { set, state, subscribe } from '../lib/store';
import { badge, list, sourceCard } from './ui';

/** Hypothesis laboratory: competing explanations side by side. Nothing here ever forces a single winner. */
export class LabView {
  readonly el = h('div', { class: 'lab' });
  private listEl = h('nav', { class: 'lab-list', 'aria-label': 'Questions' });
  private main = h('div', { class: 'lab-main' });
  private sel!: HTMLSelectElement;

  constructor() {
    this.sel = h('select', { class: 'lab-sel', 'aria-label': 'Choose an open question', on: { change: () => set({ labPick: this.sel.value }) } }, QUESTIONS.map(q => h('option', { value: q.id }, q.question))) as HTMLSelectElement;
    this.el.append(this.sel, this.listEl, this.main);
    subscribe(keys => { if (state.view === 'lab' && (keys.has('labPick') || keys.has('view'))) this.render(); });
    this.render();
  }

  render() {
    const pick = QUESTION_BY_ID[state.labPick ?? ''] ?? QUESTIONS[0];
    this.sel.value = pick.id;
    this.listEl.replaceChildren(
      h('div', { class: 'lab-title' }, 'Open questions', h('em', null, String(QUESTIONS.length))),
      ...QUESTIONS.map(q => h('button', { class: 'lab-q' + (q.id === pick.id ? ' on' : ''), on: { click: () => set({ labPick: q.id }) } },
        h('span', null, q.question),
        h('span', { class: 'dots' }, q.options.map(o => h('i', { style: `background:${STATUS[o.status].color}`, title: `${o.name}: ${STATUS[o.status].short}` }))))));
    this.main.replaceChildren(this.question(pick));
  }

  private question(q: Question) {
    return h('div', null,
      h('header', { class: 'lab-head' },
        h('h2', null, q.question),
        h('p', { class: 'ctx' }, q.context),
        this.axis(q),
        h('p', { class: 'rule' }, 'The marks above show where each explanation stands on the ledger scale today. Several can be live at once, and statuses change as evidence changes. No option is chosen for you.')),
      h('div', { class: 'cols' }, q.options.map(o => this.card(o))),
      q.history.length ? h('section', { class: 'hist' }, h('h3', null, 'How confidence has changed'), h('ul', null, q.history.map(x => h('li', null, h('b', null, x.date), ' ', x.note)))) : null);
  }

  /** E1..E8 axis with one mark per explanation. */
  private axis(q: Question) {
    const cells = STATUS_ORDER.map(s => {
      const here = q.options.filter(o => o.status === s);
      return h('div', { class: 'ax-cell' }, h('div', { class: 'ax-marks' }, here.map(o => h('span', { class: 'ax-mark', style: `--c:${STATUS[s].color}`, title: o.name }, o.name))), h('div', { class: 'ax-lab', style: `--c:${STATUS[s].color}` }, s), h('div', { class: 'ax-sub' }, STATUS[s].short));
    });
    return h('div', { class: 'axis', role: 'img', 'aria-label': 'Where each explanation sits on the evidence scale' }, cells);
  }

  private card(o: HypothesisOption) {
    const group = (title: string, items: string[], cls = '') => (items.length ? h('div', { class: 'lc-g' }, h('h4', { class: cls }, title), list(items, cls)) : null);
    return h('article', { class: 'lcard', style: `--c:${STATUS[o.status].color}` },
      h('header', null, h('h3', null, o.name), badge(o.status)),
      h('p', { class: 'desc' }, o.description),
      group('Supporting evidence', o.supports, 'pos'),
      group('Contradicting evidence', o.contradicts, 'neg'),
      group('Required assumptions', o.assumptions),
      group('Testable predictions', o.predictions),
      group('Known weaknesses', o.weaknesses),
      group('What would falsify it', o.falsifiers),
      o.entries?.length ? h('div', { class: 'lc-g' }, h('h4', null, 'Related records'), h('div', { class: 'chips' }, o.entries.map(id => h('a', { class: 'chip', href: `#/map?e=${id}`, on: { click: (e: Event) => { e.preventDefault(); set({ view: 'map', selected: { kind: 'entry', id } }); } } }, ENTRY_BY_ID[id]?.title ?? id)))) : null,
      o.sources.length ? h('details', { class: 'sec small' }, h('summary', null, 'Sources', h('em', null, String(o.sources.length))), h('ul', { class: 'srcs' }, o.sources.map(sourceCard))) : h('p', { class: 'dim small' }, 'No sources attached.'));
  }
}
