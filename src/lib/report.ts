import type { Entry } from '../types';
import { ENTRY_BY_ID, EVENT_BY_ID, QUESTIONS, SOURCE_BY_ID, linksOf, nodeTitle } from '../data';
import { fmtRange } from './time';
import { CATS, CAUTION, REL, STATUS } from './classification';
import { contextOf, findingsFor, linesOf, parseCite, phasesOf, PHASES, triangulate } from './audit';

/** Builds the required research report (ledger §19, 16 sections) from a record. Empty sections say so rather than being omitted. */
export function buildReport(e: Entry): string {
  const L: string[] = [];
  const list = (a?: string[]) => (a?.length ? a.map(x => `- ${x}`).join('\n') : '_None recorded yet._');
  const h = (n: number, t: string) => { L.push(`\n## ${n}. ${t}\n`); };
  const t = triangulate(e), ph = phasesOf(e), ctx = contextOf(e);
  L.push(`# ${e.title}`, '', `*${CATS[e.cat].label} · priority ${e.priority} · last reviewed ${e.reviewed}*`, '', `> Generated from the Human History evidence ledger. Sources were recalled during the first build and are flagged where unverified. Verify against the originals.`);

  h(1, 'Executive Summary');
  L.push(e.summary, '', `**Evidence:** ${STATUS[e.ev].label}. **Interpretation:** ${STATUS[e.interp].label}.`);
  if (e.claim) L.push('', `**Original claim:** ${e.claim}`);

  h(2, 'What Was Actually Discovered');
  L.push(e.summary);
  if (e.discovered) L.push('', `**Discovery and excavation history:** ${e.discovered}`);
  if (e.culture) L.push('', `**Archaeological culture:** ${e.culture}`);
  if (e.artifacts?.length) L.push('', '**Associated artifacts:**', list(e.artifacts));
  if (e.construction?.length) L.push('', '**Construction techniques:**', list(e.construction));
  if (e.purpose) L.push('', `**Proposed purpose:** ${e.purpose}`);

  h(3, 'Location and Chronology');
  L.push(`${e.place} (${e.lat}, ${e.lon})${e.geoNote ? ` — *${e.geoNote}*` : ''}`, '', `**Date:** ${fmtRange(e.start, e.end)} (${e.dateKind}, ${e.dateConfidence} confidence)`);
  if (e.datingMethod) L.push('', `**Dating method:** ${e.datingMethod}`);
  if (e.dateNote) L.push('', e.dateNote);
  if (e.altChron?.length) L.push('', '**Competing chronologies:**', e.altChron.map(c => `- ${fmtRange(c.start, c.end)}: ${c.label}`).join('\n'));
  if (e.environment) L.push('', `**Environmental context:** ${e.environment}`);
  if (ctx.seaM != null) L.push('', `**Global sea level at the start of the range:** about ${ctx.seaM} m relative to present (schematic).`);
  if (ctx.events.length) L.push('', `**Environmental events active nearby in time:** ${ctx.events.map(id => EVENT_BY_ID[id]?.title).filter(Boolean).join('; ')}`);

  h(4, 'Original Sources and Provenance');
  L.push(e.sources.length ? e.sources.map(id => { const s = SOURCE_BY_ID[id]; if (!s) return `- ${id}`; const p = parseCite(s); return `- **${s.cite}**  \n  ${s.kind} · ${s.discipline} · reliability ${s.reliability}${s.placeholder ? ' · *citation to locate*' : ' · *unverified*'}${s.methodology ? `  \n  Methodology: ${s.methodology}` : ''}${s.evidence ? `  \n  Evidence presented: ${s.evidence}` : ''}${s.note ? `  \n  Limitations: ${s.note}` : ''}${s.conflicts ? `  \n  Conflicts of interest: ${s.conflicts}` : ''}${p.year ? '' : ''}`; }).join('\n') : '_No sources recorded._');

  h(5, 'Physical Evidence'); L.push(list(e.physical));
  if (e.megalith) { const m = e.megalith; L.push('', '**Engineering record:**', Object.entries({ Geology: m.geology, Quarry: m.quarry, Transport: m.transport, 'Estimated weight': m.weightT, Chronology: m.chronology, 'Tool marks': m.toolMarks, Precision: m.precision, Labour: m.labor, Phases: m.phases }).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join('\n'), m.methods?.length ? `\n**Construction models:**\n${list(m.methods)}` : ''); }
  h(6, 'Genetic Evidence'); L.push(list(e.genetic));
  h(7, 'Textual and Historical Evidence'); L.push(list(e.textual));

  h(8, 'Mainstream Interpretation'); L.push(e.mainstream ?? '_Not yet recorded._');
  if (e.consensus) L.push('', `**Current consensus:** ${e.consensus}`);
  h(9, 'Alternative Interpretations'); L.push(e.alternatives?.length ? e.alternatives.map(a => `- **${a.name}** (${STATUS[a.status].label}): ${a.text}`).join('\n') : '_None recorded._');
  h(10, 'Evidence Supporting Each Interpretation'); L.push(list(e.for));
  h(11, 'Evidence Contradicting Each Interpretation'); L.push(list(e.against));
  h(12, 'Unresolved Questions'); L.push(list(e.unresolved));

  h(13, 'What Would Prove or Disprove the Hypotheses?');
  L.push(list(e.predictions));
  const opts = QUESTIONS.flatMap(q => q.options.filter(o => o.entries?.includes(e.id)).map(o => ({ q, o })));
  for (const { q, o } of opts) L.push('', `*${q.question}* — “${o.name}” (${o.status}) would be falsified by: ${o.falsifiers.join('; ') || '_not recorded_'}`);

  h(14, 'Related Historical Discoveries');
  const links = linksOf(e.id);
  L.push(links.length ? links.map(({ link, other, outgoing }) => `- ${REL[link.rel].label}${outgoing ? ' →' : ' ←'} **${nodeTitle(other)}** (${link.conf}): ${link.note} *${CAUTION[link.rel]}*`).join('\n') : '_No graph links yet._');
  if (ctx.contemporaries.length) L.push('', '**Contemporary records in the region:**', ctx.contemporaries.slice(0, 8).map(c => `- ${ENTRY_BY_ID[c.id].title} (${c.km} km)`).join('\n'));

  h(15, 'Final Evidence Assessment');
  L.push(`- Evidence: **${STATUS[e.ev].label}**; interpretation: **${STATUS[e.interp].label}**`,
    `- Source triangulation score ${t.score.toFixed(1)} from ${t.groups} discipline${t.groups === 1 ? '' : 's'} supports about **${t.band}** (declared ${t.declared}).`,
    `- Independent lines of evidence: ${linesOf(e).join(', ') || 'none recorded'}.`,
    `- Research workflow: ${ph.pct}% complete${ph.missing.length ? ` (missing: ${ph.missing.join(', ')})` : ''}.`);
  const fs = findingsFor(e.id); if (fs.length) L.push('', '**Open audit findings:**', fs.map(f => `- [${f.sev}] ${f.msg}`).join('\n'));
  void PHASES;

  h(16, 'Source Bibliography');
  L.push(e.sources.map(id => SOURCE_BY_ID[id]?.cite ?? id).map(c => `- ${c}`).join('\n') || '_None._');
  return L.join('\n') + '\n';
}

export function downloadText(name: string, text: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 500);
}
