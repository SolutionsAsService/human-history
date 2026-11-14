// Cross-table evidence audit. Run: npm run audit   (exit 1 on errors; --strict also fails on warnings)
import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { RULES, runAudit } from '../src/lib/audit';

const topo = JSON.parse(readFileSync(new URL('../public/data/land-50m.topo.json', import.meta.url), 'utf8'));
const land = feature(topo, topo.objects[Object.keys(topo.objects)[0]]);
const a = runAudit({ land });
const strict = process.argv.includes('--strict');
const verbose = process.argv.includes('--all');

const byRule = new Map<string, typeof a.findings>();
for (const f of a.findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
console.log(`audit · ${a.stats.entries} entries · ${a.stats.links} links (${a.stats.crossCategoryLinks} cross-category) · ${a.stats.components} graph components · avg research completeness ${a.stats.avgPhasePct}% · ${a.stats.reportReady} report-ready · ${Math.round(a.stats.unverifiedShare * 100)}% of sources unverified/placeholder\n`);
for (const [rule, fs] of byRule) {
  const sev = { error: 0, warn: 0, info: 0 }; fs.forEach(f => sev[f.sev]++);
  console.log(`${rule.padEnd(18)} ${RULES[rule]?.title ?? ''}  [${sev.error} error, ${sev.warn} warn, ${sev.info} info]`);
  for (const f of fs.filter(f => verbose || f.sev !== 'info').slice(0, verbose ? 999 : 6)) console.log(`   ${f.sev.toUpperCase().padEnd(5)} ${f.msg}`);
}
console.log('\ncoverage gaps (region · era):', a.coverage.thin.join('; ') || 'none');
const errs = a.findings.filter(f => f.sev === 'error').length, warns = a.findings.filter(f => f.sev === 'warn').length;
console.log(`\n${errs} error(s), ${warns} warning(s), ${a.findings.length - errs - warns} info`);
if (errs || (strict && warns)) process.exit(1);
