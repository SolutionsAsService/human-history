#!/usr/bin/env python3
"""Turn verified RDADA candidates that carry a `strand` into Strand records (src/data/extra/h.ts).

Every strand is derived from verified material: the `what`, dates and directness come from the candidates' own `strand` objects,
the `for` and `against` lines are their verified quotes, and `passages` are the primary-text ids written by candidates-to-sources.py.
The editor's part is the culture mapping (CULTURE_RULES), the thread per brief, and the status rule below; nothing is invented.
Run after candidates-to-sources.py:  python3 scripts/candidates-to-strands.py rdada_runs "2026-11-17 Breadth"
"""
import glob, json, re, sys
from pathlib import Path
ROOT = Path(sys.argv[1]); RUNS = sys.argv[2:]
idmap = json.load(open(ROOT / 'idmap.json'))
BRIEF_THREAD = {'africa-bantu-sahara': 'th-africa', 'americas-crops-contact': 'th-americas', 'east-asia-sinosphere': 'th-eastasia', 'indianization-se-asia': 'th-seasia',
  'indo-european-branches': 'th-ie', 'islam-arabic-science': 'th-islam', 'law-christianity-mediterranean': 'th-lawchurch', 'mongol-plague-exchange': 'th-plague', 'writing-systems-breakdown': 'th-writing'}
# (regex on the free text, culture id): first match wins
CULTURE_RULES = [
 (r'^unspecified', None), (r'^Americas$', 'americas-all'), (r'^Old World', 'old-world'), (r'Mediterranean or Nile', 'north-africa-sahara'),
 (r'Pre-Anatolian', 'pre-anatolian'), (r'Pontic-Caspian', 'yamnaya'), (r'^Anatolia', 'anatolia'), (r'Europe and Asia', 'europe-asia-ie'), (r'^Alpine', 'alpine'), (r'Germanic', 'germanic-north'), (r'^Tarim', 'tarim'),
 (r'^Bantu|West Central Africa', 'bantu-homeland'), (r'Congo|rainforest', 'congo-rainforest'), (r'Central, eastern|western central|Bantu-speaking|sub-Saharan|Late Iron Age', 'bantu-africa'), (r'Nok', 'nok'),
 (r'North Africa \(across|Muslim North Africa|Muslim merchants', 'north-africa-sahara'), (r'^Ghana|^Mali', 'ghana-mali'), (r'southern Arabia', 'arabia'), (r'East African coast', 'east-africa-coast'), (r'Aksumite', 'aksum'), (r'Roman and Syrian Christian merchants', 'rome'),
 (r'Balsas|^Mexico|^Mesoamerica', 'balsas-mesoamerica'), (r'highland Mexico|^South America|Peruvian', 'andes'), (r'Northern South America|related to present-day Colombia', 'n-south-america'), (r'West Mexico', 'west-mexico'),
 (r'Polynesia', 'polynesia-east'), (r'^Norse', 'norse'), (r'Newfoundland', 'newfoundland'), (r'Indigenous North', 'indigenous-n-america'),
 (r'^Baekje', 'baekje'), (r'^Goguryeo', 'goguryeo'), (r'^Silla', 'silla'), (r'Korea|Goryeo', 'goryeo-joseon'), (r'Yamato|Japan', 'yamato-japan'), (r'Jiaozhi', 'vietnam'), (r'Islamic world / Europe', 'abbasid'),
 (r'Qin China|Jin China|Han|Yuan China|Song China|^China|Tang China|Uighur|Kashmir and Yuan|Chinese characters', 'china'), (r'^Europe$', 'latin-europe'),
 (r'^Champa', 'champa'), (r'^Funan', 'funan'), (r'^Kutai', 'kutai-java'), (r'^Southeast Asia', 'sea-all'),
 (r'^India|Pallava|^South India', 'india'),
 (r'Abbasid', 'abbasid'), (r'Byzantine', 'byzantium'),
 (r'Classical Roman', 'rome'), (r'Justinianic', 'byzantium'), (r'Bologna', 'bologna'), (r'^Early Christianity|Antioch|Christianity \(legal', 'early-christianity'), (r'Roman North Africa', 'roman-north-africa'),
 (r'Bithynia|Roman imperial|^Rome', 'rome'), (r'Cyprus and Anatolia|Troas|Macedonia|Eastern Mediterranean churches', 'roman-east'), (r'Church of the East', 'church-east'),
 (r'Manichaeism|Buddhism, Zoroastrianism', 'manichaean'), (r'Sasanian', 'parthian-sasanian'), (r'India and Persia', 'india'),
 (r'Golden Horde|eastern Europe / Lower Volga', 'golden-horde'), (r'Genoese|Italian maritime', 'italian-ports'), (r'Issyk-Kul', 'tian-shan'), (r'^western Eurasia', 'western-eurasia'),
 (r'western Europe|Western European|German and a Nestorian|Latin Christendom', 'latin-europe'), (r'Mongol|Land of darkness', 'mongol-empire'), (r'Iraq, Syria|Crimea, Rum|western Asia and eastern', 'abbasid'), (r'Ilkhanate|Persia / western', 'ilkhanate'),
 (r'^Arabic', 'arabia'), (r'Nabataean', 'nabataean'), (r'Armenian', 'armenia'), (r'^Georgia', 'georgia'), (r'Old Italic', 'rome'), (r'Ugarit', 'ugarit'), (r'Proto-Sinaitic', 'levant-phoenicia'), (r'Linear A', 'minoan'), (r'Iron Age Cyprus', 'cyprus'),
]
def cid(text):
    for rx, c in CULTURE_RULES:
        if re.search(rx, text): return c
    return '?' + text
RANK = {'debated': 0, 'inferred': 1, 'documented': 2}
def esc(s): return str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ')
def short(c):
    a = (c.get('authors') or '').split(';')[0].split(',')[0].strip()
    if not a or 'Wikipedia' in a: a = 'Wikipedia (pointer)' if 'wikipedia' in c['url'] else c['title'][:40]
    return f"{a}{' (' + str(c['year']) + ')' if c.get('year') and 'Wikipedia' not in a else ''}"
groups = {}
for run in RUNS:
    for f in sorted(glob.glob(str(ROOT / run / 'notes' / '*.verified.json'))):
        b = Path(f).name.split('.')[0]
        for i, c in enumerate(json.load(open(f))):
            s = c.get('strand')
            if not s or b not in BRIEF_THREAD: continue
            a, z = cid(s['from']), cid(s['to'])
            if a is None or z is None or a == z or a.startswith('?') or z.startswith('?'):
                groups.setdefault(('SKIP', b, s['from'], s['to']), []).append((i, c, run)); continue
            groups.setdefault((b, a, z, s['carried']), []).append((i, c, run))
out, skipped, n = [], [], 0
for key, items in groups.items():
    if key[0] == 'SKIP': skipped.append(key[1:]); continue
    b, a, z, carried = key; n += 1
    sts = [c['strand'] for _, c, _ in items]
    d = min((s.get('directness', 'inferred') for s in sts), key=lambda x: RANK[x])
    starts = [s['start'] for s in sts if s.get('start') is not None]; ends = [s['end'] for s in sts if s.get('end') is not None]
    pas = [idmap.get(f"{r}/{b}#{i}#passage") for i, c, r in items]; pas = [p for p in pas if p]
    srcs = list(dict.fromkeys(idmap[f"{r}/{b}#{i}"] for i, c, r in items))
    ptr = [x for x in srcs if x.startswith('w_')]
    primary = any(c['kind'] == 'primary' for _, c, _ in items)
    status = {'documented': 'E2' if (primary or pas) else 'E3', 'inferred': 'E3', 'debated': 'E4'}[d]
    if len(ptr) == len(srcs) and status in ('E2', 'E3'): status = {'E2': 'E3', 'E3': 'E4'}[status]
    start = min(starts) if starts else None; end = max(ends) if ends else None; sched = False
    if start is None and end is None: sched = True
    what = sts[0].get('what') or items[0][1]['title']
    pro = [f"{short(c)}: “{c['quote']}”" for _, c, _ in items if c['stance'] == 'supports']
    con = [f"{short(c)}: “{c['quote']}”" for _, c, _ in items if c['stance'] in ('contradicts', 'fails_to_support')]
    ctx = [f"{short(c)}: “{c['quote']}”" for _, c, _ in items if c['stance'] == 'context']
    note = (items[0][1].get('summary') or '')[:300].rstrip()
    if ctx: note += ' Also on this strand: ' + ' | '.join(ctx[:2])
    lim = ' '.join((c.get('limits') or '') for _, c, _ in items).lower()
    flags = [t for t, k in (('abstract-only', 'abstract'), ('second-hand', 'second-hand')) if k in lim]
    if flags: note += ' Some sources were ' + ' and '.join(flags) + '.'
    if sched: note += ' Dates are placed schematically: no source gave them.'
    if d == 'debated' and not con: con = ['Specialists disagree about this transfer, and no counter-passage was captured from the sources opened: the other side of the argument is a gap.']
    med = next((s.get('medium') for s in sts if s.get('medium')), 'unknown')
    # dates: placeholders resolved by the TS side from culture spans when null
    out.append("  { id: 'x-%s', thread: '%s', from: '%s', to: '%s', carried: '%s', what: '%s', medium: '%s', start: %s, end: %s, directness: '%s', status: '%s', note: '%s', for: %s, against: %s, src: %s, passages: %s%s }," % (
        '%s-%s-%s-%s' % (b.split('-')[0], a, z, carried[:4]), BRIEF_THREAD[b], a, z, carried, esc(what), med, start if start is not None else 'null', end if end is not None else 'null', d, status, esc(note),
        json.dumps(pro, ensure_ascii=False), json.dumps(con, ensure_ascii=False), json.dumps(srcs), json.dumps(pas), ', schematic: true' if sched else ''))
hdr = "import type { Strand } from '../../types';\n// Generated by scripts/candidates-to-strands.py from verified RDADA candidates. Dates left null are resolved in threads.ts from the culture spans (and the strand is marked schematic).\ntype Raw = Omit<Strand, 'start' | 'end'> & { start: number | null; end: number | null; schematic?: boolean };\nexport const STRANDS_H: Raw[] = [\n"
Path('src/data/extra/h.ts').write_text(hdr + '\n'.join(out) + '\n];\n')
print(n, 'strands;', len(skipped), 'skipped groups')
for s in skipped: print('  SKIP', s)
