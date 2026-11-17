import type { Culture, Strand, Thread, Carried, Passage } from '../types';
import { PASSAGES as GEN_PASSAGES, REJECTED as GEN_REJECTED } from './extra/g';

// Threads: what one culture passed to another. Every strand below comes from a source that was opened and whose quoted
// passage was found verbatim by an independent verifier (see rdada_runs/). A resemblance noticed by an editor is not a strand.
// Culture spans are rough conventional spans used only to place lanes; they are schematic, not dated claims.

export const CARRIED: Record<Carried, { label: string; color: string }> = {
  language: { label: 'Language', color: '#ff9f6b' },
  writing: { label: 'Writing', color: '#ffd04d' },
  religion: { label: 'Religion', color: '#c7a1ff' },
  idea: { label: 'Ideas', color: '#7cf0ff' },
  technology: { label: 'Technology', color: '#6fe3a0' },
  crop_or_animal: { label: 'Crops and animals', color: '#a8e05f' },
  people: { label: 'People', color: '#ff7aa8' },
  institution: { label: 'Institutions', color: '#79b8ff' },
  custom: { label: 'Other', color: '#aab6cc' },
};


const C = (id: string, name: string, group: string, start: number, end: number, entries?: string[]): Culture => ({ id, name, group, start, end, entries });
/** C with aliases, so a search for “Persia” or “Kemet” finds the lane. */
const CA = (id: string, aliases: string[], name: string, group: string, start: number, end: number, entries?: string[]): Culture => ({ ...C(id, name, group, start, end, entries), aliases });

// Lane order is the order of this list; lanes appear grouped by region band.
export const PASSAGES: Passage[] = GEN_PASSAGES;
export const REJECTED = GEN_REJECTED;
export const PASSAGE_BY_ID: Record<string, Passage> = Object.fromEntries(PASSAGES.map(p => [p.id, p]));

export const CULTURES: Culture[] = [
  C('paleo-eurasia', 'Late Palaeolithic Eurasia', 'Deep time', -40000, -11000),
  C('americas-first', 'First peoples of the Americas', 'Deep time', -20000, -1000),
  C('neolithic-anatolia', 'Neolithic Anatolia and Aegean', 'Early farmers', -8000, -5500),
  C('neolithic-europe', 'Neolithic Europe', 'Early farmers', -6500, -2800),
  C('corded-ware', 'Corded Ware and Bell Beaker Europe', 'Early farmers', -2900, -2200),
  CA('yamnaya', ['steppe', 'Pontic'], 'Yamnaya (Pontic–Caspian steppe)', 'Steppe', -3300, -2600),
  C('steppe-west', 'Western Eurasian steppe', 'Steppe', -3300, -1000),
  C('andronovo', 'Sintashta and Andronovo', 'Steppe', -2100, -900),
  C('eurasian-steppe', 'Wider Eurasian steppe', 'Steppe', -2200, -500),
  C('steppe-east', 'Eastern steppe (Mongolia)', 'Steppe', -2000, -500),
  C('steppe-neighbours', 'Uralic, Turkic and early Chinese speakers', 'Steppe', -3000, 0),
  CA('mesopotamia', ['Babylon', 'Sumer', 'Akkad', 'Assyria', 'Iraq'], 'Mesopotamia', 'Near East', -3500, -539),
  CA('anatolia', ['Hittites', 'Hatti', 'Turkey'], 'Anatolia and the Hittite world', 'Near East', -2000, -1000),
  C('mitanni', 'Mitanni (Hurrian kingdom)', 'Near East', -1500, -1300),
  C('near-east-iron', 'Wider Near East (Iron Age)', 'Near East', -1200, -500),
  C('colchis', 'South Caucasus (Colchis)', 'Near East', -1300, -500),
  C('proto-sinaitic', 'Sinai (Proto-Sinaitic inscriptions)', 'Near East', -1900, -1000),
  CA('levant-phoenicia', ['Phoenicians', 'Canaan', 'Lebanon'], 'Phoenicia and the Levant', 'Near East', -1500, -332),
  CA('israel-judah', ['Hebrew', 'Jewish', 'Judaism', 'Israel', 'Bible'], 'Israel, Judah and Second Temple Judaism', 'Near East', -1000, 70),
  CA('egypt-pharaonic', ['Egypt', 'Kemet', 'Khemet', 'Nile', 'pharaohs'], 'Pharaonic Egypt (Khemet)', 'Egypt', -3100, -332, ['kemet-chemical-crafts']),
  CA('egypt-roman', ['Egypt', 'Alexandria', 'Ptolemies', 'Ptolemaic'], 'Ptolemaic and Roman Egypt', 'Egypt', -332, 641, ['graeco-egyptian-alchemy', 'chemia-egypt-name']),
  CA('achaemenid', ['Persia', 'Persian Empire', 'Iran', 'Cyrus', 'Darius'], 'Achaemenid Persia', 'Iran', -550, -330),
  CA('parthian-sasanian', ['Persia', 'Iran', 'Sasanians', 'Parthians'], 'Parthian and Sasanian Iran', 'Iran', -247, 651),
  C('bactria', 'Bactria, Ferghana and Central Asia', 'Central Asia', -300, 300),
  CA('india', ['South Asia', 'Vedic', 'Mauryan', 'Ashoka'], 'India', 'South and East Asia', -1500, 1200),
  CA('china', ['Han', 'Chinese'], 'China', 'South and East Asia', -1600, 1700),
  CA('greece-archaic', ['Greece', 'Athens', 'Hellenes'], 'Archaic and Classical Greece', 'Mediterranean', -800, -323),
  CA('hellenistic-world', ['Alexander', 'Seleucids', 'Greek kingdoms'], 'Hellenistic world', 'Mediterranean', -323, -30),
  C('rome', 'Rome', 'Mediterranean', -509, 476),
  C('byzantium', 'Byzantium and the Greek East', 'Mediterranean', 330, 1453),
  CA('abbasid', ['Baghdad', 'Islamic world', 'Arabic', 'caliphate'], 'Abbasid Caliphate (Baghdad)', 'Islamic world and Europe', 750, 1258),
  C('al-andalus', 'Al-Andalus', 'Islamic world and Europe', 711, 1492),
  CA('latin-europe', ['Medieval Europe', 'Christendom'], 'Latin Europe', 'Islamic world and Europe', 800, 1700, ['alchemy-to-chymistry']),
  CA('olmec', ['Mesoamerica'], 'Olmec Gulf Coast', 'Americas', -1200, -400),
  CA('maya', ['Mesoamerica'], 'Maya and later Mesoamerica', 'Americas', -400, 900),
  C('austronesian', 'Austronesian (Taiwan and island Southeast Asia)', 'Pacific', -3000, -1000),
  C('near-oceania', 'Near Oceania (Papuan ancestry)', 'Pacific', -3000, -500),
  C('remote-oceania', 'Remote Oceania (Vanuatu)', 'Pacific', -1000, -400),
];

export const THREADS: Thread[] = [
  { id: 'th-farming', name: 'Farming, animals and settlers', carried: 'crop_or_animal', blurb: 'Ancient DNA now shows people, not only ideas, moving with farming and herds; how much is migration and how much diffusion is argued region by region.' },
  { id: 'th-ie', name: 'Indo-European languages', carried: 'language', blurb: 'The steppe and Anatolian hypotheses compete to explain how one language family reached Europe, Iran and India. This page draws both, and the doubts about each.' },
  { id: 'th-writing', name: 'Writing systems', carried: 'writing', blurb: 'Alphabets descend from one another by documented adaptation in some places (Greek to Latin) and by argued resemblance in others (the origin of Brahmi).' },
  { id: 'th-religion', name: 'Religions and sacred narratives', carried: 'religion', blurb: 'What travelled with traders, courts and monks, and what only looks alike. The “Axial Age” (Jaspers) is a debated idea of parallel developments, not a transfer, so it is not drawn as a ribbon; Black (2008) calls the standard account “highly defective” in his abstract.' },
  { id: 'th-persia', name: 'Persian ideas and institutions', carried: 'idea', blurb: 'Greek writers record Persian words and ideas; whether Persian models shaped Judaism, Hellenistic states or the Abbasid court is where specialists disagree. Most strands here rest on one source and are graded accordingly.' },
  { id: 'th-science', name: 'Numerals, science and paper', carried: 'idea', blurb: 'The best-documented thread: Indian numerals and Greek science reached Latin Europe through Arabic translation. The earlier and the technological links (Babylon to Hipparchus, paper, printing) are thinner.' },
  { id: 'th-alchemy', name: 'Khemet, alchemy and chemistry', carried: 'technology', blurb: 'Egyptian craft chemistry, the Greek recipe books of Roman Egypt, and the Arabic and Latin road to early modern chymistry. See also the ledger records and hypothesis lab on the same subject.' },
  { id: 'th-bible', name: 'The Bible and its neighbours', carried: 'idea', blurb: 'Passages of the Hebrew Bible set beside the Mesopotamian, Egyptian and Persian texts they are compared with, each quoted at its locus. Resemblance is not proof of borrowing: every strand here records what the passages share, where they differ, and the scholar who doubts the link.' },
  { id: 'th-silk', name: 'Silk Road contacts', carried: 'people', blurb: 'Chinese court histories and Indian edicts that record contact between distant states: goods, envoys, Buddhist practice, paper. Composition dates are the histories’, written after the events.' },
  { id: 'th-myth', name: 'Very old shared myths', carried: 'idea', blurb: 'Witzel and d’Huy argue for myths older than the peopling of the Americas. All sources opened here are the proponents’ own; the independent criticism could not be opened, so these strands are graded cautiously.' },
];

type SInit = Omit<Strand, 'id' | 'for' | 'against' | 'note'> & { note?: string; for?: string[]; against?: string[] };
let n = 0;
const T = (id: string, s: SInit): Strand => { n++; return { note: '', for: [], against: [], ...s, id }; };

export const STRANDS: Strand[] = [
  // ---------------------------------------------------------------- farming, animals, settlers
  T('s-farmers-anatolia-europe', { thread: 'th-farming', from: 'neolithic-anatolia', to: 'neolithic-europe', carried: 'people', what: 'Early farmers and their farming economy', medium: 'migration', start: -6500, end: -5500, directness: 'documented', status: 'E2',
    note: 'Ancient genomes from early European farmers derive largely from Anatolian and Aegean populations. How much of the spread was migration, how much local foragers adopted the package, is still argued.',
    for: ['Early farmers across Europe are shown by ancient DNA to descend directly from Anatolian and Aegean farmers'], against: ['The share of migration, diffusion and forager admixture differs by region and is disputed', 'Only a pointer source (Wikipedia) was opened for the “Neolithic package” and the Balkan route'], src: ['g_hofmanov2016', 'w_neolithiceurope'] }),
  T('s-austronesian-vanuatu', { thread: 'th-farming', from: 'austronesian', to: 'remote-oceania', carried: 'people', what: 'Austronesian-speaking (Lapita) colonists with East Asian ancestry', medium: 'migration', start: -1000, end: -400, directness: 'documented', status: 'E2',
    note: 'Ancient DNA from Vanuatu shows the first settlers of Remote Oceania were largely of Austronesian (East Asian) ancestry, followed soon after by a turnover.',
    for: ['Ancient DNA from the first Vanuatu burials places East Asian (Austronesian) ancestry in the earliest settlers'], against: ['A rapid later turnover replaced most of that ancestry (see the next strand)'], src: ['g_lipsonnd'] }),
  T('s-papuan-turnover', { thread: 'th-farming', from: 'near-oceania', to: 'remote-oceania', carried: 'people', what: 'Papuan-ancestry population arriving after the first Austronesian settlers', medium: 'migration', start: -1000, end: -400, directness: 'documented', status: 'E2',
    note: 'The same genomes show the first settlers’ ancestry replaced soon after by people with Papuan ancestry. Dates are those given by the research summary and are approximate.',
    for: ['The same Vanuatu genomes record a turnover to Papuan ancestry shortly after settlement'], against: ['Simple continuity from the first Austronesian settlers is contradicted by this turnover'], src: ['g_lipsonnd'] }),
  T('s-out-of-taiwan', { thread: 'th-farming', from: 'austronesian', to: 'near-oceania', carried: 'language', what: 'Austronesian languages and seafaring settlement (the Out-of-Taiwan model)', medium: 'migration', start: -3000, end: -1500, directness: 'debated', status: 'E3',
    note: 'The standard model places the Austronesian homeland in Taiwan; rivals place it in Sundaland. Only a pointer (Wikipedia) was opened, so this is the weakest-sourced strand in the thread.',
    against: ['Out-of-Sundaland and other models are in the literature (via the pointer source)', 'No scholarly source on the homeland debate could be opened'], src: ['w_austronesianpeoples'] }),
  T('s-dairy-mongolia', { thread: 'th-farming', from: 'steppe-west', to: 'steppe-east', carried: 'crop_or_animal', what: 'Dairy pastoralism with western domesticated ruminants', medium: 'unknown', start: -1300, end: -1300, directness: 'inferred', status: 'E3',
    note: 'Bronze Age genomes and dairy evidence in Mongolia indicate pastoralism spreading east by cultural transmission rather than wholesale population replacement. The source states a date range, not a single year.',
    for: ['A study of Bronze Age population dynamics reports dairy pastoralism reaching the eastern steppe by cultural diffusion'], against: ['The source does not name the western origin precisely'], src: ['g_jeong2018'] }),
  T('s-horse-dom2', { thread: 'th-farming', from: 'steppe-west', to: 'eurasian-steppe', carried: 'crop_or_animal', what: 'The DOM2 domestic horse lineage', medium: 'unknown', start: -2200, end: -2000, directness: 'inferred', status: 'E3',
    note: 'Genomic work places the origin of the domestic horse lineage that spread across Eurasia in the lower Don–Volga region about 2200 BCE; the spread itself is inferred from the lineage’s later distribution.',
    for: ['A supplementary report dates the origin of the DOM2 lineage to about 2200 BCE in the lower Don–Volga'], against: ['Earlier claims for horse domestication elsewhere (Botai, Dereivka) are contested; only the 2200 BCE origin was confirmed here'], src: ['g_widespreadhorsnd'] }),
  T('s-iron-anatolia', { thread: 'th-farming', from: 'anatolia', to: 'near-east-iron', carried: 'technology', what: 'Extractive iron metallurgy', medium: 'unknown', start: -1900, end: -900, directness: 'inferred', status: 'E3',
    note: 'A review traces iron’s early innovation to a limited area of Anatolia and its later adoption across the Near East, without showing the route.',
    for: ['A review finds a limited Anatolian origin for iron in the early second millennium BCE'], against: ['The route and speed of adoption are not documented in the source'], src: ['g_erbsatullo2019'] }),
  T('s-tin-colchis', { thread: 'th-farming', from: 'near-east-iron', to: 'colchis', carried: 'technology', what: 'Tin bronze production in the South Caucasus (source of tin uncertain)', medium: 'trade', start: -1300, end: -800, directness: 'debated', status: 'E4',
    note: 'Crucible analyses from Colchis ask whether tin bronze was imported or locally made; the tin may have come from local sources.',
    against: ['The tin source is unresolved; local tin is possible'], src: ['g_crucibletechnond'] }),
  // ---------------------------------------------------------------- Indo-European
  T('s-ie-steppe-cordedware', { thread: 'th-ie', from: 'yamnaya', to: 'corded-ware', carried: 'people', what: 'Steppe-derived ancestry into temperate Europe', medium: 'migration', start: -3000, end: -2500, directness: 'documented', status: 'E2',
    note: 'Ancient genomes show steppe ancestry in Corded Ware Europe. The critics accept the genetic signal but dispute how much it explains.',
    for: ['A large aDNA study reports migrations from the steppe into temperate Europe, in the paper’s own words now “documented”'], against: ['Furholt argues the impact of the recent aDNA studies on archaeology is overstated', 'Klejn et al.’s discussion records doubts that remain unassuaged'], src: ['g_kristiansen2017', 'g_furholt2018', 'g_klejn2018'] }),
  T('s-ie-steppe-language', { thread: 'th-ie', from: 'yamnaya', to: 'corded-ware', carried: 'language', what: 'Indo-European, developing into the Germanic branch', medium: 'migration', start: -3000, end: -2000, directness: 'inferred', status: 'E3',
    note: 'The steppe hypothesis links the genetic migration to the spread of Indo-European. Language is inferred from the migration, not read from the genomes.',
    for: ['Kristiansen et al. connect the steppe migration to the formation of the Germanic branch', 'Kloekhorst treats Yamnaya as the carrier of Indo-European to Europe and Asia'], against: ['A discussion piece records doubts about whether the genetic evidence settles the language question', 'The Anatolian hypothesis (next strand) offers a rival'], src: ['g_kristiansen2017', 'g_klejn2018', 'g_kloekhorst2023'] }),
  T('s-ie-anatolian-farmers', { thread: 'th-ie', from: 'neolithic-anatolia', to: 'neolithic-europe', carried: 'language', what: 'Indo-European with the spread of farming (the Anatolian hypothesis)', medium: 'migration', start: -6500, end: -4000, directness: 'debated', status: 'E4',
    note: 'A Bayesian-phylogenetic dating of the family supports an older Anatolian origin than the steppe hypothesis allows; critics challenge those dates.',
    for: ['Heggarty (2014) reviews the Bayesian-phylogenetic case for an Anatolian origin'], against: ['Critics of the Bayesian dating studies (reported second-hand) dispute their method', 'The steppe hypothesis explains the genetic record better in the sources opened'], src: ['g_heggarty2014', 'w_anatolianhypothesis'] }),
  T('s-ie-steppe-anatolia', { thread: 'th-ie', from: 'yamnaya', to: 'anatolia', carried: 'language', what: 'The Anatolian branch (route unresolved)', medium: 'migration', start: -3300, end: -2000, directness: 'debated', status: 'E4',
    note: 'A recent review finds the route by which the earliest Anatolian languages arrived is unsettled. Dates here are a schematic placement because the source gives no range.',
    against: ['The review says the route of entry into Anatolia is unsettled'], src: ['g_bjrn2024'] }),
  T('s-ie-sintashta', { thread: 'th-ie', from: 'corded-ware', to: 'andronovo', carried: 'people', what: 'Steppe ancestry and the chariot-era Sintashta culture, eastward', medium: 'migration', start: -2100, end: -1800, directness: 'inferred', status: 'E3',
    note: 'The page hedges between direct migration from Corded Ware populations and shared descent from an earlier steppe population. A pointer source only.',
    against: ['Whether the link is migration or common ancestry is unresolved in the source'], src: ['w_sintashtaculture'] }),
  T('s-ie-asia', { thread: 'th-ie', from: 'yamnaya', to: 'india', carried: 'language', what: 'Indo-European languages to Central and South Asia', medium: 'migration', start: -3300, end: -1500, directness: 'inferred', status: 'E3',
    note: 'Kloekhorst’s chapter takes Yamnaya as the source of Indo-European languages in Europe, Central Asia and South Asia. The chapter summary gives no end date, so the end is a schematic placement; no dated Indo-Iranian source was opened.',
    for: ['The chapter states Yamnaya spread Indo-European to Europe and Central and South Asia'], against: ['Only a chapter summary was opened; the route into Iran and India has no primary source here'], src: ['g_kloekhorst2023'] }),
  T('s-ie-loanwords', { thread: 'th-ie', from: 'andronovo', to: 'steppe-neighbours', carried: 'language', what: 'Bronze Age loanwords (for example “honey”, “horse”) into Uralic, Turkic and Old Chinese', medium: 'trade', start: -3000, end: -1500, directness: 'inferred', status: 'E3',
    note: 'Shared vocabulary suggests contact between Indo-European speakers on the steppe and their eastern neighbours.',
    for: ['A study finds six Bronze Age loanwords from Indo-European into Uralic, Turkic and Old Chinese'], against: ['Direction of borrowing and exact donor group rest on linguistic argument, not dated texts'], src: ['g_bjrn2022'] }),
  // ---------------------------------------------------------------- writing
  T('s-writing-egypt-sinai', { thread: 'th-writing', from: 'egypt-pharaonic', to: 'proto-sinaitic', carried: 'writing', what: 'Egyptian signs reworked into a letter system at Serabit el-Khadim', medium: 'unknown', start: -1500, end: -1500, directness: 'debated', status: 'E3',
    note: 'Petrie (1906) found a non-Egyptian sign system carved in Egyptian style. Later work is not opened here. Date is Petrie’s, c. 1500 BCE.',
    for: ['Petrie describes a definite non-Egyptian system carved in an Egyptian setting'], against: ['His account of the relation to Egyptian writing rests on the surrounding argument, not on the quoted sentence', 'No modern decipherment source was opened'], src: ['g_petrie1906'] }),
  T('s-writing-sinai-phoenician', { thread: 'th-writing', from: 'proto-sinaitic', to: 'levant-phoenicia', carried: 'writing', what: 'Whether the Sinai signs are the ancestor of the fixed Phoenician alphabet', medium: 'unknown', start: -1500, end: -1050, directness: 'debated', status: 'E3',
    against: ['Petrie called it one of many early alphabets rather than the single ancestor'], note: 'A 1906 view: the Sinai alphabet may be one of several experiments. No modern source on this step was opened.', src: ['g_petrie1906'] }),
  T('s-writing-phoenician-greek', { thread: 'th-writing', from: 'levant-phoenicia', to: 'greece-archaic', carried: 'writing', what: 'Consonant letters adapted as the Greek alphabet', medium: 'trade', start: -900, end: -740, directness: 'inferred', status: 'E2',
    note: 'The letter shapes, order and names show the Greek alphabet descends from the Phoenician. The date and place of adoption are argued (Cyprus is one proposal).',
    for: ['Woodard: shared letter shapes, order and names', 'Herodotus 5.58 records the Greek tradition that Phoenicians brought the letters'], against: ['Jeffery and Johnston: the dispute over the date has ranged over seven centuries', 'Woodard also records the thesis that Cypriot scribes, not Phoenician traders, were the channel'], src: ['g_woodard1997', 'g_jeffery1990', 'g_herodotusnd'] }),
  T('s-writing-greek-latin', { thread: 'th-writing', from: 'greece-archaic', to: 'rome', carried: 'writing', what: 'Greek letters to the Etruscans and then the Romans (via Euboean Cumae)', medium: 'migration', start: -750, end: -500, directness: 'inferred', status: 'E2',
    for: ['Jeffery and Johnston describe the Greek letters passing to the Etruscans and then to Rome', 'Taylor (1883) places the carrier in the Chalcidian colonies at Cumae'], against: ['Taylor’s scholarship is dated; the passage is stated in outline'], note: 'One of the best-supported adaptations in the thread; the sources opened are a modern handbook and a nineteenth-century survey.', src: ['g_jeffery1990', 'g_taylor1883'] }),
  T('s-writing-aramaic-kharosthi', { thread: 'th-writing', from: 'achaemenid', to: 'india', carried: 'writing', what: 'Aramaic chancery letters adapted for Prakrit (Kharosthi)', medium: 'court_or_empire', start: -520, end: -250, directness: 'inferred', status: 'E3',
    note: 'Bühler (1898) dates Aramaic’s reach into India to the Achaemenid period and derives Kharosthi from it; the quote shows the date, not Kharosthi by name.',
    for: ['Bühler places Aramaic in India under Achaemenid rule'], against: ['A 1898 source; no modern epigraphic source was opened'], src: ['g_buhler1898'] }),
  T('s-writing-semitic-brahmi', { thread: 'th-writing', from: 'levant-phoenicia', to: 'india', carried: 'writing', what: 'Semitic prototypes for the Brahmi letters', medium: 'trade', start: -850, end: -750, directness: 'debated', status: 'E4',
    note: 'Bühler argued for Semitic prototypes around 800 BCE; Cunningham held Brahmi to be of purely Indian origin. No modern source on the dispute could be opened.',
    for: ['Bühler derives Brahmi from North Semitic prototypes dated about 800 BCE'], against: ['Cunningham: the letters are of purely Indian origin (OCR text garbled, meaning confirmed by the verifier)'], src: ['g_buhler1898', 'g_cunningham1879'] }),
  // ---------------------------------------------------------------- religion
  T('s-buddhism-india-china', { thread: 'th-religion', from: 'india', to: 'china', carried: 'religion', what: 'Buddhist texts, images and monks, with translation at the Han court', medium: 'teaching', start: 60, end: 414, directness: 'debated', status: 'E2',
    note: 'That Buddhism reached China from India by way of Central Asia is not in doubt; the 60 CE imperial dream story is legend, and Fa-hien (c. 400 CE) records monks already carrying sutras east.',
    for: ['Fa-hien records Indian monks carrying sutras and discipline texts across the Indus', 'Beal retells the dream of Ming-ti (60 CE) and the first translators at the Han court', 'A pointer source places extensive contacts in the second century'], against: ['Fa-hien’s companions asked when the Law first went east: the origin was unclear even then', 'The dream story is semi-legendary (pointer source)'], src: ['g_faxian1886', 'g_beal1882', 'w_silkroadtransmissionofbuddhi'] }),
  T('s-flood-hebrew', { thread: 'th-religion', from: 'mesopotamia', to: 'israel-judah', carried: 'idea', what: 'Flood narrative with ark and bird-release sequence', medium: 'text', start: -2000, end: -500, directness: 'debated', status: 'E3',
    note: 'The Mesopotamian flood stories (Atra-Hasis, Gilgamesh XI) and Genesis share a sequence of events; many scholars think Gilgamesh took it from Atra-Hasis. The route to the Hebrew Bible is argued, not documented.',
    for: ['George Smith (1876) set out the dove, swallow and raven episodes beside Genesis', 'A pointer source reports that many scholars think the Gilgamesh flood came from Atra-Hasis'], against: ['Smith himself noted divergent details (the mountain of the ark)', 'His dating of the traditions is that of 1876'], src: ['g_smith1876', 'w_gilgameshfloodmyth'] }),
  T('s-isis-hellenistic', { thread: 'th-religion', from: 'egypt-roman', to: 'hellenistic-world', carried: 'religion', what: 'The cult of Isis and Serapis', medium: 'court_or_empire', start: -307, end: -100, directness: 'inferred', status: 'E2',
    note: 'Cumont (1911) tells the Ptolemaic export of the cult to Cyprus and Sicily. His ancient sources are not shown in the passage read.',
    for: ['Cumont describes the Ptolemaic introduction of Isis and Serapis abroad'], against: ['The quoted words carry no date; the narrative is a 1911 secondary account'], src: ['g_cumont1911'] }),
  T('s-isis-rome', { thread: 'th-religion', from: 'egypt-roman', to: 'rome', carried: 'religion', what: 'Isiac initiation and devotion in the Roman Empire', medium: 'text', start: -50, end: 180, directness: 'inferred', status: 'E2',
    for: ['Cumont records the expulsions of the cult under Augustus and Tiberius', 'Apuleius’ second-century novel shows the cult present and thriving'], against: ['A novel shows a cult’s presence, not a dated transfer'], note: 'The cult’s presence in Rome is not in doubt; its mechanism of transfer is told from late and literary sources.', src: ['g_cumont1911', 'g_apuleius1922'] }),
  // ---------------------------------------------------------------- Persian
  T('s-persia-greece-institutions', { thread: 'th-persia', from: 'achaemenid', to: 'greece-archaic', carried: 'institution', what: 'Persian institutions (the satrapy, the relay post called angareion) as known to Greeks; adoption by Greeks is not shown', medium: 'court_or_empire', start: -520, end: -450, directness: 'inferred', status: 'E3',
    for: ['Herodotus 3.89 records the satrapies and their Persian name', 'Herodotus 8.98 describes the relay post and its Persian name'], against: ['The passages show Greeks recording the Persian terms, not Greek states adopting the institutions'], note: 'Strong evidence that Greeks knew these institutions; none that they copied them.', src: ['g_herodotus1920', 'g_herodotus1920b'] }),
  T('s-persia-magi-greece', { thread: 'th-persia', from: 'achaemenid', to: 'greece-archaic', carried: 'idea', what: 'The Magi’s teaching of two principles and a future life, as reported by Greek writers', medium: 'text', start: -400, end: -300, directness: 'inferred', status: 'E3',
    for: ['Diogenes Laertius’ Prologue reports the Magi’s doctrines, citing Theopompus'], against: ['The passage shows Greeks knew the ideas; it does not show they shaped Greek philosophy'], src: ['g_diogenesnd'] }),
  T('s-persia-judaism', { thread: 'th-persia', from: 'achaemenid', to: 'israel-judah', carried: 'idea', what: 'Angels, eschatological dualism and a final judgement (the “Zoroastrian influence” thesis)', medium: 'court_or_empire', start: -539, end: -330, directness: 'debated', status: 'E4',
    note: 'The Persian period is well documented; whether Zoroastrian ideas shaped Judaism is the disputed part. Boyce argued strong influence; others diminish or reject it. All scholarly voices here are second-hand through a pointer source.',
    for: ['Josephus (Antiquities 11.1) ties Cyrus’s release of the exiles to a reading of Isaiah', 'A pointer source reports Boyce’s strong-influence view'], against: ['The Cyrus Cylinder names only Mesopotamian sanctuaries and never mentions Jews, Jerusalem or Judea', 'Other scholars “diminish or reject” the influence (pointer source)', 'No peer-reviewed paper on the debate could be opened'], src: ['g_josephusnd', 'w_cyruscylinder', 'w_zoroastrianism'] }),
  T('s-persia-pardes', { thread: 'th-persia', from: 'achaemenid', to: 'israel-judah', carried: 'language', what: 'The Persian word for a walled garden, Hebrew pardes (“paradise”)', medium: 'court_or_empire', start: -538, end: -330, directness: 'documented', status: 'E2',
    note: 'The loanword is attested in Hebrew after 538 BCE and has an Old Iranian source; Greek paradeisos is attested in Xenophon. Source is a pointer (Wikipedia), so graded below E1.',
    for: ['The pointer source gives the Hebrew word’s post-538 BCE attestation and its Old Iranian source'], against: ['A pointer source only; the scholarly reference was not opened'], src: ['w_paradise'] }),
  T('s-persia-seleucid', { thread: 'th-persia', from: 'achaemenid', to: 'hellenistic-world', carried: 'institution', what: 'Royal finance and administration', medium: 'court_or_empire', start: -330, end: -250, directness: 'debated', status: 'E3',
    for: ['Aperghis’ thesis abstract finds Seleukid finance “owed much to Achaemenid prototypes”'], against: ['Wood’s thesis: most scholars call for a less extreme interpretation of Achaemenid continuity'], note: 'Both sources are theses and only abstracts were read.', src: ['g_aperghis1999', 'g_wood2012'] }),
  T('s-persia-abbasid', { thread: 'th-persia', from: 'parthian-sasanian', to: 'abbasid', carried: 'idea', what: 'Pahlavi texts translated into Arabic, and the Irano-Islamic scribal class', medium: 'translation', start: 750, end: 900, directness: 'inferred', status: 'E3',
    note: 'Pointer sources: Pahlavi works were translated into Arabic and an Irano-Islamic scribal class (the Barmakids) staffed the Abbasid state. The quote says “Irano-Islamic”, not strictly Sasanian.',
    for: ['A pointer source records Pahlavi translations into Arabic', 'The Barmakid secretaries are described as an Irano-Islamic class'], against: ['A scholar quoted on the Barmakids page cautions that Khurasan was bypassed in the transfer of Indian learning', 'Only encyclopedia pages were opened'], src: ['w_graecoarabictranslationmovem', 'w_barmakids'] }),
  // ---------------------------------------------------------------- numerals, science, paper
  T('s-numerals-india-baghdad', { thread: 'th-science', from: 'india', to: 'abbasid', carried: 'idea', what: 'Hindu decimal numerals and reckoning', medium: 'text', start: 800, end: 900, directness: 'documented', status: 'E2',
    note: 'Arabic writers from the early ninth century recognise the numerals as Hindu (Smith and Karpinski, from named Arabic treatises); al-Biruni (c. 1030) says the signs “derived from the finest forms of the Hindu signs”.',
    for: ['Smith and Karpinski: Arabs from the early ninth century treat the numerals as Hindu', 'Al-Biruni: the numeral signs derive from Hindu forms'], against: ['The sentence from Smith and Karpinski is the authors’ own inference from named treatises', 'The date of the first zero in India is a separate dispute and is not claimed here'], src: ['g_smith1911', 'g_alberuni1910'] }),
  T('s-siddhantas-baghdad', { thread: 'th-science', from: 'india', to: 'abbasid', carried: 'idea', what: 'Sanskrit astronomical siddhantas brought to Baghdad (753–774)', medium: 'court_or_empire', start: 753, end: 774, directness: 'inferred', status: 'E3',
    note: 'Al-Biruni, writing c. 1030, reports that Indian scholars brought the Brahmasiddhanta to Baghdad. It is a retrospective literary report, not a dated document.',
    for: ['Al-Biruni reports the siddhantas brought to Baghdad in 753–774'], against: ['A retrospective literary report', 'Gutas doubts direct Sanskrit-to-Arabic translation (next strand)'], src: ['g_alberuni1910'] }),
  T('s-india-via-persia', { thread: 'th-science', from: 'india', to: 'abbasid', carried: 'idea', what: 'Indian astronomy, mathematics and medicine, said to arrive through Pahlavi intermediaries', medium: 'court_or_empire', start: 600, end: 900, directness: 'debated', status: 'E3',
    against: ['Gutas: Indian science came “mainly through Persian (Pahlavi) intermediaries”, which sits against al-Biruni’s direct pandits; the two accounts are not reconciled here'], note: 'A scholarly alternative route for the same transfer.', src: ['g_gutas1998'] }),
  T('s-numerals-latin', { thread: 'th-science', from: 'abbasid', to: 'latin-europe', carried: 'idea', what: 'The Indian numerals and al-Khwarizmi’s algebra in Latin (“Dixit Algorizmi”; Fibonacci, 1202)', medium: 'translation', start: 1100, end: 1202, directness: 'documented', status: 'E1',
    for: ['Karpinski edits the Latin translation of al-Khwarizmi’s arithmetic by named translators', 'Smith and Karpinski quote Fibonacci’s Liber Abaci: “the nine figures of the Indians”'], against: ['The quoted sentence from Karpinski has no date; 1145 comes from elsewhere in the same book', 'The popular name “Arabic numerals” is itself a naming dispute, not covered here'], src: ['g_karpinski1915', 'g_smith1911'] }),
  T('s-greek-arabic-translation', { thread: 'th-science', from: 'byzantium', to: 'abbasid', carried: 'idea', what: 'The Greek scientific and philosophical corpus', medium: 'translation', start: 750, end: 1000, directness: 'documented', status: 'E1',
    for: ['Gutas: almost all secular Greek books available in the eastern Mediterranean were translated into Arabic c. 750–1000'], against: ['The motives and patronage are interpreted differently by different historians'], src: ['g_gutas1998'] }),
  T('s-babylon-hipparchus', { thread: 'th-science', from: 'mesopotamia', to: 'hellenistic-world', carried: 'idea', what: 'Lunar period relations, eclipse records and sexagesimal methods', medium: 'text', start: -162, end: -127, directness: 'inferred', status: 'E3',
    for: ['A pointer source reports the case (Kugler, Toomer) that Hipparchus used Babylonian data and methods'], against: ['The same page says his surviving text cannot decide how much he used', 'Only an encyclopedia page was opened'], src: ['w_hipparchus'] }),
  T('s-paper-islam', { thread: 'th-science', from: 'china', to: 'abbasid', carried: 'technology', what: 'Papermaking (the legend of the capture at Talas, 751)', medium: 'unknown', start: 751, end: 794, directness: 'debated', status: 'E3',
    against: ['The Talas story is doubted: Du Huan’s account lists no papermakers among the captives (pointer source)'], note: 'That paper reached the Islamic world from China is accepted; the mechanism and date are the legend’s weak point. Pointer source only.', src: ['w_historyofpaper'] }),
  T('s-paper-europe', { thread: 'th-science', from: 'al-andalus', to: 'latin-europe', carried: 'technology', what: 'Papermaking', medium: 'trade', start: 1085, end: 1282, directness: 'inferred', status: 'E3',
    note: 'The pointer source dates paper’s reach into Christian Europe to 1085–1150 on documentary evidence, with a “probably” for the Islamic origin of the earliest dated Spanish codex.', src: ['w_historyofpaper'] }),
  T('s-printing-europe', { thread: 'th-science', from: 'china', to: 'latin-europe', carried: 'technology', what: 'Woodblock and movable-type printing', medium: 'trade', start: 1040, end: 1450, directness: 'debated', status: 'E4',
    against: ['Yule’s scepticism about a Marco Polo link to European printing (pointer source)'], note: 'Independent invention in Europe is argued; no transfer is documented in the source opened.', src: ['w_movabletype'] }),
  // ---------------------------------------------------------------- Khemet, alchemy and chemistry
  T('s-craft-to-roman-alchemy', { thread: 'th-alchemy', from: 'egypt-pharaonic', to: 'egypt-roman', carried: 'technology', what: 'Craft traditions of metal-colouring behind the Greek recipe books', medium: 'teaching', start: -332, end: 300, directness: 'inferred', status: 'E3',
    note: 'Early Greco-Egyptian alchemy is described as a craft rooted in artisanal metal-colouring; no pharaonic text describing the processes survives.',
    for: ['Werrett, quoting Grimes: a craft rooted in artisanal traditions of metal-colouring', 'Martelli ties the Leiden and Stockholm papyri to workshop practice', 'Analyses show skilled pharaonic glass, balms and kohls'], against: ['Zosimus’s claim of a priestly pharaonic origin is untested by any earlier document opened', 'No Egyptologist’s direct statement on pharaonic alchemy was found'], entries: ['kemet-chemical-crafts', 'graeco-egyptian-alchemy'], src: ['g_werrett2024', 'g_martelli2020', 'f_riesmeier2022', 'g_jackson2023'] }),
  T('s-greek-to-arabic-kimiya', { thread: 'th-alchemy', from: 'egypt-roman', to: 'abbasid', carried: 'idea', what: 'Greek chemeia becoming Arabic al-kimiya', medium: 'translation', start: 700, end: 900, directness: 'inferred', status: 'E3',
    for: ['A scholar’s genealogy runs from Greco-Egyptian chemeia to Arabic al-Kimiya', 'Al-Razi’s operations are reported to overlap with those of pre-Islamic Alexandrian alchemists'], against: ['The text-by-text chain was not checked', 'The Emerald Tablet and the Jabirian corpus are first attested in Arabic, not Greek'], entries: ['alchemy-to-chymistry', 'emerald-tablet'], src: ['f_chicago_principe2013', 'f_wiki_islamic_alch', 'f_wiki_emerald'] }),
  T('s-arabic-to-latin-alchemy', { thread: 'th-alchemy', from: 'abbasid', to: 'latin-europe', carried: 'idea', what: 'Robert of Chester’s Liber de compositione alchemiae', medium: 'translation', start: 1144, end: 1144, directness: 'documented', status: 'E2',
    for: ['Generally considered the first Latin translation of an Arabic work on alchemy, completed 11 February 1144 (pointer source)'], against: ['Pointer source only; scholarship it cites was not opened'], entries: ['alchemy-to-chymistry'], src: ['f_wiki_robert'] }),
  // ---------------------------------------------------------------- shared myths
  T('s-laurasian', { thread: 'th-myth', from: 'paleo-eurasia', to: 'americas-first', carried: 'idea', what: 'A common “Laurasian” story line from creation to the end of the world', medium: 'migration', start: -40000, end: -11000, directness: 'debated', status: 'E5',
    note: 'Witzel argues many mythologies descend from one Late Palaeolithic source. The sources opened are Witzel’s and d’Huy’s own; independent criticism (for example a published review calling the framework “ill-founded”) could not be opened and is not used.',
    for: ['Witzel proposes a Laurasian story line and uses Berezkin’s motif maps', 'He argues the flood myth is not a late diffusion'], against: ['Witzel: such maps show a trend but “the actual geographical origin of a trait remains unclear”', 'Independent criticism is missing from this strand because it could not be opened'], src: ['g_witzel2012', 'g_witzel2008'] }),
  T('s-cosmic-hunt', { thread: 'th-myth', from: 'paleo-eurasia', to: 'americas-first', carried: 'idea', what: 'The Cosmic Hunt (Big Dipper) myth', medium: 'migration', start: -20000, end: -11000, directness: 'debated', status: 'E5',
    note: 'A phylogenetic study of 19 versions finds low horizontal transmission and proposes a very old origin; its author concedes some clusters are explained by borrowing.',
    for: ['d’Huy’s tree of 19 versions: consistency index 0.59, retention index 0.71, “low horizontal transmissions”'], against: ['d’Huy admits runs with modified data “could be less reliable”', 'He attributes some clusters, such as the Tuareg story, to borrowing', 'The motif is found “nowhere” missing on the planet, a distribution statement rather than a transfer'], src: ['g_dhuy2013'] }),
];
void n;

// ================================================================ Primary-text strands (RDADA run 2026-11-17)
// Passages are quoted from editions the RDADA researcher opened; a separate verifier re-found every quote and re-checked its
// locator and date basis. Directness and status are the editor's reading of those passages, and every parallel records its
// strongest doubt. `X` adds to a strand written above; `T` adds a new one.

const X = (id: string, add: { passages?: string[]; src?: string[]; for?: string[]; against?: string[]; unresolved?: string[]; note?: string }) => {
  const s = STRANDS.find(x => x.id === id);
  if (!s) throw new Error('unknown strand ' + id);
  s.passages = [...(s.passages ?? []), ...(add.passages ?? [])];
  s.src = [...new Set([...s.src, ...(add.src ?? [])])];
  s.for.push(...(add.for ?? [])); s.against.push(...(add.against ?? []));
  if (add.unresolved) s.unresolved = [...(s.unresolved ?? []), ...add.unresolved];
  if (add.note) s.note += ' ' + add.note;
};

// ---- extend strands already drawn
X('s-flood-hebrew', { passages: ['p_genesis_614', 'p_genesis_811', 'p_atrahasisoldba_c2i2224', 'p_epicofgilgames_xilines3439r', 'p_epicofgilgames_xiline4646a'], src: ['g_wasserman2020', 'g_rogers1926', 'g_battenfield1971', 'w_genesisfloodnarrative'],
  for: ['Genesis 6:14 (build the ark) and Atrahasis (build the boat) both give construction orders; Genesis 8:21 and Gilgamesh XI both have the deity smell the offering after the flood', 'Gilgamesh XI has a bird-release sequence (dove, swallow, raven) beside Genesis 8'],
  against: ['The Old Babylonian Atrahasis text quoted has no bird episode (it is in Gilgamesh XI)', 'Battenfield argues all three accounts go back to one historical flood, which would make the likeness a common source rather than borrowing'] });
X('s-persia-judaism', { passages: ['p_isaiah_4557', 'p_daniel_1213', 'p_yasnaahunavait_3036', 'p_yasnaahunavait_30710'], src: ['g_cyruscylinder2020', 'g_zoroastrianismnd', 'g_ehrman2017', 'g_antia2012', 'g_silverman2011', 'g_mills1898'],
  against: ['The ISBE entry holds that nothing in Judaism’s formal theology is “borrowed”', 'Bremmer (2002, via Ehrman) argues against deriving resurrection from Persia, and Mark S. Smith (2001, via a partisan compilation) that Zoroastrian dualism “does not truly resemble biblical monotheism”: both second-hand', 'Silverman, who argues for the influence, concedes the field has “severe problems in method”'],
  for: ['Isaiah 45:5–7 (“I form light and create darkness”) and Daniel 12:1–3 (resurrection and judgement) are the passages most often set beside the Gathic dualism of Yasna 30, which is quoted alongside them'] });
X('s-buddhism-india-china', { passages: ['p_houhanshu_88tianzhuclo'], src: ['g_fan445b', 'g_pelliot1919'],
  against: ['Fan Ye (Hou Hanshu 88) introduces the Ming dream as “世傳”, a tradition', 'Pelliot (1919) calls the dream and the embassy legendary'] });
X('s-babylon-hipparchus', { passages: ['p_ptolemyalmages_iv2heibergpp', 'p_ptolemyalmages_v14heibergp4'], src: ['g_ptolemy1984', 'g_jones1991', 'g_newtonnd'],
  for: ['Ptolemy (Almagest IV.2) says Hipparchus used the Chaldaean observations, and V.14 dates an eclipse “in Babylon” to a Babylonian king’s year', 'Jones (1991) shows Hipparchus’s parameters agree with Babylonian ones'],
  against: ['Toomer’s footnote says Ptolemy’s account is “not historically accurate”', 'Newton argues Ptolemy fabricated many of the early observations'],
  note: 'Upgraded from a pointer: the primary text and a specialist article were opened. Ptolemy wrote about 300 years after Hipparchus.' });
X('s-writing-phoenician-greek', { passages: ['p_dipylonoinocho_46lettersrou', 'p_nestorscupinsc_threelinesri', 'p_herodotushisto_558sections1', 'p_ahiramsarcopha_rimofcoffina'], src: ['w_dipyloninscription', 'w_nestor27scuppithekoussai', 'g_herodotus1920c', 'w_ahiramsarcophagus', 'w_historyofthegreekalphabet'],
  for: ['The Dipylon oinochoe and Nestor’s Cup carry some of the earliest Greek alphabetic writing (c. 740–720 BCE per the pointer pages)'],
  against: ['The Ahiram sarcophagus inscription, the usual Phoenician comparison, is dated either c. 1000 or c. 850 BCE', 'Proposals for a much earlier Greek alphabet (Naveh, Stieglitz, Bernal) are reported as contradicting the usual date'] });
X('s-writing-greek-latin', { passages: ['p_marsilianadalb_alphabetseri'], src: ['g_mnamonnd', 'w_etruscanalphabet'], for: ['The Marsiliana tablet is an Etruscan alphabet series: the Etruscans wrote a Greek alphabet'] });
X('s-numerals-latin', { passages: ['p_liberalgebraee_openingofthe', 'p_liberalgebraee_closinglines'], src: ['g_robert1915', 'g_muhammad1831'],
  for: ['Robert of Chester’s Latin Algebra closes with a colophon at Segovia dated Spanish Era 1183, that is 1145 CE'], against: ['The editors who read the Arabic and Latin texts (Rosen 1831, Karpinski 1915) are nineteenth- and early-twentieth-century; modern work on al-Khwarizmi’s sources was not opened'] });
X('s-greek-arabic-translation', { passages: ['p_kitabalfihrist_chapter7dodg', 'p_kitabalfihrist_chapter7ptol'], src: ['g_ibn1970', 'g_gutas1998b'],
  for: ['The Fihrist (c. 987) lists the Arabic translators of the Almagest'],
  against: ['The Fihrist’s story of al-Ma’mun’s Aristotle dream is late (c. 987) and Gutas reads it as propaganda for the movement, not a record of its start'] });
X('s-paper-islam', { src: ['g_fan445c', 'w_cailun'], for: ['Hou Hanshu 78 credits Cai Lun with presenting paper in 105 CE'], against: ['Fangmatan paper (179–141 BCE) predates Cai Lun, so the 105 CE story is not the invention of paper (pointer sources)'] });
X('s-persia-abbasid', { src: [], note: '' });

const T2 = (id: string, s: SInit) => STRANDS.push(T(id, s));

// ---- the Bible and its neighbours
T2('s-creation-enuma', { thread: 'th-bible', from: 'mesopotamia', to: 'israel-judah', carried: 'idea', what: 'The divided waters of creation (Enuma Elish) beside Genesis 1:6', medium: 'text', start: -1000, end: -500, directness: 'debated', status: 'E4',
  note: 'Enuma Elish has the god split the sea-goddess; Genesis 1:6 has a firmament separating the waters. The wording is not close, and the composition date of Enuma Elish itself is disputed.',
  for: ['Both accounts make an ordered cosmos by dividing primeval waters'], against: ['Dating of Enuma Elish is disputed: a Second Dynasty of Isin origin is the usual view, a later Kassite one is argued, and no date is asserted here', 'The sources opened are old translations and encyclopedia summaries; no modern comparative study was opened'],
  passages: ['p_genesis_16', 'p_enumaelishbaby_tabletilines', 'p_enumaelishbaby_tabletivline', 'p_enumaelishbaby_tabletilines2'], src: ['g_rogers1926', 'g_king1902', 'w_enumaelish', 'w_genesiscreationnarrative'] });
T2('s-sargon-moses', { thread: 'th-bible', from: 'mesopotamia', to: 'israel-judah', carried: 'idea', what: 'An abandoned infant set afloat in a basket (the Sargon legend and Exodus 2)', medium: 'text', start: -750, end: -600, directness: 'debated', status: 'E5',
  note: 'Both stories have a child laid in a pitch-sealed basket on a river. The only source opened arguing direct adaptation is a non-peer-reviewed preprint; the usual view is a shared motif.',
  for: ['Exodus 2:3 and the Sargon legend both have a pitch-sealed basket on the river'], against: ['The one source arguing direct adaptation is a preprint (Maranz 2025) and is a minority position', 'The motif of the exposed hero child is widespread and need not be borrowed'],
  passages: ['p_exodus_23', 'p_legendofsargon_columniiilin'], src: ['g_maranz2025', 'g_rogers1926'] });
T2('s-amenemope-proverbs', { thread: 'th-bible', from: 'egypt-pharaonic', to: 'israel-judah', carried: 'idea', what: 'Maxims on moving boundary stones: Amenemope ch. 6 and Proverbs 22:28', medium: 'text', start: -1300, end: -600, directness: 'debated', status: 'E3',
  note: 'The best-known textual parallel between the Hebrew Bible and an Egyptian text. Lichtheim gives the consensus that Amenemope is Ramesside; Ruffle doubts that a direct connection can be shown.',
  for: ['Amenemope ch. 6 and Proverbs 22:28 both forbid moving the ancient boundary marker', 'Both works are set out in numbered sayings (Amenemope “thirty chapters”; Proverbs 22:20 “thirty”) according to the sources opened'], against: ['Ruffle: “some doubt about the existence of a direct connection”', 'Lichtheim’s introduction records the reverse-direction and lost-common-source alternatives', 'The date of Proverbs 22:17–24:22 is not established in any source opened'],
  passages: ['p_instructionofa_chapter6', 'p_instructionofa_chapter6vii1', 'p_proverbs_222829', 'p_proverbs_2228', 'p_instructionofa_chapter30xxv'], src: ['g_van2016', 'g_lichtheim2006', 'g_ruffle1975', 'g_proverbs2228291985'] });
T2('s-aten-psalm104', { thread: 'th-bible', from: 'egypt-pharaonic', to: 'israel-judah', carried: 'idea', what: 'Night and the beasts of the forest: the Great Hymn to the Aten and Psalm 104', medium: 'text', start: -1350, end: -600, directness: 'debated', status: 'E4',
  note: 'Both hymns praise a creator who gives the beasts their night and the day its work. Lichtheim judged a specific literary dependence “not probable”.',
  for: ['The Aten hymn’s night strophe and Psalm 104:20–24 both describe beasts moving at night and man at work by day'], against: ['Lichtheim: “A specific literary interdependence is not probable”', 'Mark S. Smith (via Wikipedia) says enthusiasm for even indirect influence has cooled', 'The Psalm’s date is not established in any source opened'],
  passages: ['p_greathymntothe_nightstrophe', 'p_greathymntothe_westwall13co', 'p_psalms_1042024', 'p_psalms_10421'], src: ['g_breasted1912', 'g_lichtheim2006', 'g_psalm10420241985', 'w_psalm104', 'w_greathymntotheaten'] });
T2('s-hammurabi-covenant', { thread: 'th-bible', from: 'mesopotamia', to: 'israel-judah', carried: 'institution', what: 'The goring ox and “eye for eye”: Hammurabi 196, 251 and Exodus 21', medium: 'text', start: -740, end: -640, directness: 'debated', status: 'E4',
  note: 'Cases in Exodus 21 resemble laws in Hammurabi’s Code. Wright argues direct dependence; most scholars, as his publisher’s synopsis says, favour a shared legal tradition.',
  for: ['Exodus 21:29 (the ox known to gore) and Hammurabi 251 treat the same case; Exodus 21:24 and Hammurabi 196 both state an eye for an eye'], against: ['A shared legal tradition, transmitted orally, is the majority view (publisher synopsis of Wright)', 'Landsberger and others object that Hammurabi’s text is not a legal code in the modern sense (via a pointer page)', 'The date of the Covenant Code is not established in any source opened'],
  passages: ['p_exodus_2129', 'p_codeofhammurab_laws251', 'p_exodus_2124', 'p_codeofhammurab_laws196197'], src: ['g_harper1904', 'g_wright2009', 'w_codeofhammurabi'] });
T2('s-persia-restoration', { thread: 'th-bible', from: 'achaemenid', to: 'israel-judah', carried: 'institution', what: 'Cyrus’s edict and the Judaean return (Ezra 1, 6; 2 Chronicles 36) against the Cyrus Cylinder', medium: 'court_or_empire', start: -539, end: -515, directness: 'debated', status: 'E3',
  note: 'The Hebrew Bible says Cyrus authorised the rebuilding of the Temple. The Cyrus Cylinder shows Cyrus restoring sanctuaries and returning displaced gods and peoples in Babylonia, but never mentions Jews, Jerusalem or Judea.',
  for: ['Ezra 1:1–4, 6:3–5 and 2 Chronicles 36:22–23 give Cyrus’s decree', 'Cyrus Cylinder lines 30–33 record him returning gods and settling displaced peoples'], against: ['Livius’s introduction: no evidence of a new tolerance policy, and the Judaean return is not in the text', 'Ezra–Nehemiah and Chronicles are dated about 400–200 BCE from encyclopedia pages, long after the events'],
  passages: ['p_ezra_114', 'p_ezra_635', 'p_2chronicles_362223', 'p_isaiah_4428451', 'p_cyruscylinderb_lines3033'], src: ['g_cyruscylinder2020', 'g_cyruscylindernd', 'w_isaiahscroll'] });
// ---- the Mesopotamian road
T2('s-gilgamesh-hatti', { thread: 'th-bible', from: 'mesopotamia', to: 'anatolia', carried: 'writing', what: 'Gilgamesh and Atrahasis copied and translated in the Hittite capital', medium: 'text', start: -1500, end: -1200, directness: 'documented', status: 'E2',
  note: 'The register of texts found at Hattusa lists Akkadian and Hittite Gilgamesh and Atrahasis manuscripts with their find-spots. Beckman reads them as scribal instruction.',
  for: ['Beckman’s register places Gilgamesh and Atrahasis manuscripts in several buildings at Hattusa, with find-spots by tablet'], against: ['Beckman’s caution: the texts served scribal instruction, which is not the same as the stories being believed or retold', 'Only a free preview of the book was read: no dates for the individual tablets'],
  passages: ['p_gilgameshhattu_registerofte', 'p_atrahasishattu_appendixap1a'], src: ['g_beckman2019'] });
T2('s-gilgamesh-megiddo', { thread: 'th-bible', from: 'mesopotamia', to: 'levant-phoenicia', carried: 'writing', what: 'A Gilgamesh tablet from Megiddo, written locally', medium: 'text', start: -1400, end: -1100, directness: 'documented', status: 'E2',
  note: 'A fragment of the epic was found at Megiddo. Petrographic study (Goren 2009) finds the clay local, so the text was copied by a scribe in the southern Levant rather than imported.',
  for: ['The CDLI record lists the tablet as a Gilgamesh fragment, provenience “mod. Megiddo”'], against: ['Goren et al. 2009: the tablet “was written in southern Israel”: it was not imported', 'The surface find at Megiddo is attested by the Goren abstract, not by CDLI'],
  passages: ['p_epicofgilgames_cdlip273198i'], src: ['g_cuneiform2023', 'g_goren2009'] });
T2('s-amarna-akkadian', { thread: 'th-bible', from: 'mesopotamia', to: 'egypt-pharaonic', carried: 'writing', what: 'Akkadian cuneiform as the language of diplomacy, and Mesopotamian myths in an Egyptian archive', medium: 'court_or_empire', start: -1360, end: -1332, directness: 'documented', status: 'E1',
  note: 'The Amarna archive holds Akkadian letters between Egypt, Mitanni, Hatti, Babylon and Levantine rulers, and a few Mesopotamian literary and mythological texts.',
  for: ['The Amarna letters are in Akkadian cuneiform on clay (pointer source and a nineteenth-century translation)', 'A British Museum tablet from Amarna carries a Nergal and Ereshkigal text (catalogue description)'], against: ['The translations opened are obsolete (Conder 1893–94, Bezold 1892); no modern edition (Moran, Rainey) was opened', 'The quote from Bezold is a catalogue description, not the tablet’s words'],
  passages: ['p_amarnalettersr_conderroyall', 'p_mythologicalte_bmcataloguen'], src: ['w_amarnaletters', 'g_conder1894', 'g_bezold1892'] });
// ---- Hebrew Bible into Greek and Latin
T2('s-hebrew-greek', { thread: 'th-bible', from: 'israel-judah', to: 'egypt-roman', carried: 'writing', what: 'The Hebrew Law and Prophets translated into Greek in Ptolemaic Egypt', medium: 'translation', start: -280, end: -130, directness: 'documented', status: 'E2',
  note: 'The prologue to Sirach, translated by the author’s grandson in Egypt, says the Law, the Prophets and the other books existed in Greek; the Letter of Aristeas tells a legendary story of how the Law was translated.',
  for: ['Sirach prologue: the translator came to Egypt in the thirty-eighth year of Euergetes and notes that the Greek differs from the Hebrew', 'The Letter of Aristeas names Demetrius, the library and a seventy-two-day translation', 'Philo (Life of Moses II.37) tells the story of the translators’ inspiration'], against: ['The Letter of Aristeas is judged unreliable history: its dating (c. 200 BCE or Maccabean, before 63 BCE) is argued', 'Jerome (Genesis preface) calls the story of the seventy cells an untruth', 'Which Euergetes the Sirach prologue means is not settled in the sources opened'],
  passages: ['p_wisdomofjesust_prologue', 'p_wisdomofjesust_prologue2', 'p_letterofariste_911', 'p_letterofariste_307', 'p_onthelifeofmos_ii37yongenum'], src: ['g_wisdomofnd', 'g_theletternd', 'g_philond', 'g_aristeasletternd', 'g_jerome2006'] });
T2('s-hebrew-latin-jerome', { thread: 'th-bible', from: 'israel-judah', to: 'rome', carried: 'writing', what: 'Jerome’s Latin Old Testament made from the Hebrew (Prologus Galeatus, c. 391)', medium: 'translation', start: 391, end: 405, directness: 'documented', status: 'E2',
  note: 'Jerome says he translated from the Hebrew rather than from the Greek, and that books outside the Hebrew canon are not in it. His prologues are the primary witness.',
  for: ['Prologus Galeatus: books outside the Hebrew canon are set apart, and readers are told to compare the Greek and Latin manuscripts'], against: ['The end year is schematic: the Genesis preface was not securely dated in the sources opened', 'Only English translations of the prologues were read'],
  passages: ['p_prologusgaleat_closingparag', 'p_prologusgaleat_closingparag2', 'p_prefacetothepe_prefacecells'], src: ['g_jeromend', 'g_jerome2006'] });
// ---- Indo-Iranian and Persian texts
T2('s-mitanni-indoaryan', { thread: 'th-ie', from: 'andronovo', to: 'mitanni', carried: 'language', what: 'Indo-Aryan names for gods and horse-training terms in a Hurrian kingdom', medium: 'unknown', start: -1400, end: -1346, directness: 'inferred', status: 'E3',
  note: 'The Hittite–Mitanni treaty (c. 1380 BCE) swears by Mitra, Varuna, Indra and the Nasatyas, and the Kikkuli horse text uses Indo-Aryan-looking terms. How an Indo-Aryan elite came to be in northern Mesopotamia is not documented, and the origin is placed on the steppe only by inference.',
  for: ['Cornil’s French translation of the treaty lists Indra and the Nasatyas among the oath gods', 'Burrow (1973) reports the then-prevailing Indo-Aryan view of the Mitanni names'], against: ['Gentile (2019): “some scepticism” (Kammenhuber 1968, Diakonov 1972), and it is debated whether the forms are Proto-Indo-Iranian or Proto-Indo-Aryan', 'The Rigveda and Gathas are dated from each other and from these names: the dating is circular, not independent'],
  passages: ['p_treatyofsuppil_lines5556ofc', 'p_treatyofsuppil_akkadianvers', 'p_kikkulihorsetr_openinglines', 'p_rigveda_101251', 'p_rigveda_212stanza3'], src: ['g_cornilnd', 'g_suppiluliumahind', 'w_kikkuli', 'g_burrow1973', 'g_gentile2019', 'g_griffith1889', 'g_lenderingnd', 'w_rigveda'] });
T2('s-ashoka-kandahar', { thread: 'th-silk', from: 'india', to: 'hellenistic-world', carried: 'religion', what: 'Ashoka’s dharma proclaimed in Greek and Aramaic at Kandahar', medium: 'court_or_empire', start: -258, end: -258, directness: 'documented', status: 'E1',
  note: 'Rock edicts at Kandahar carry the king’s dharma in Greek and in Aramaic. They are inscriptions in place, so the proclamation is documented; what the Greek readers made of it is not.',
  for: ['Sircar prints the Greek version of the Kandahar edict; a pointer page reproduces the bilingual rock inscription with its Greek and Aramaic halves'], against: ['The inscription’s date is c. 258 BCE per Sircar; one pointer page gives the “8th year”, another Sircar’s “ten years after coronation”'],
  passages: ['p_kandahargreeke_sircarfragme', 'p_kandaharbiling_greekhalfeng', 'p_kandahargreeke_oldkandaharp'], src: ['g_sircar1979', 'w_kandaharbilingualrockinscrip', 'w_kandahargreekedictsofashoka'] });
T2('s-ashoka-kings', { thread: 'th-silk', from: 'india', to: 'hellenistic-world', carried: 'idea', what: 'Dharma envoys to named Hellenistic kings (Major Rock Edict XIII)', medium: 'court_or_empire', start: -252, end: -250, directness: 'debated', status: 'E4',
  note: 'Rock Edict XIII names Hellenistic kings among those to whom Ashoka’s messengers went. No Greek source opened confirms any embassy or any effect.',
  for: ['Major Rock Edict XIII (Kalsi version) names the kings; Hultzsch’s footnote identifies them'], against: ['The claim is Ashoka’s own; no Greek or Hellenistic source records the embassies in the sources opened', 'Hultzsch’s identification of the four kings and the edict’s date (252–250 BCE) depends on his own reading'],
  passages: ['p_majorrockedict_kalsiversion2', 'p_majorrockedict_kalsiversion'], src: ['g_hultzschnd'] });
// ---- China
T2('s-silk-shu-bactria', { thread: 'th-silk', from: 'china', to: 'bactria', carried: 'technology', what: 'Sichuan cloth and bamboo canes found in Bactria (Zhang Qian)', medium: 'trade', start: -128, end: -126, directness: 'inferred', status: 'E3',
  note: 'Sima Qian reports that Zhang Qian saw Shu goods in Daxia (Bactria) and reasoned they came by way of India (Shendu). The route rests on a merchant’s report plus Zhang Qian’s own reckoning.',
  for: ['Shiji 123 quotes Zhang Qian on Shu cloth and bamboo in Daxia'], against: ['The route is Zhang Qian’s inference (“以騫度之”), not a witnessed shipment', 'Shiji 123 was completed about 91 BCE and later interpolated; strand dates are those of the mission, not stated on the page'],
  passages: ['p_shiji_123zhangqian', 'p_shiji_123daxiasect', 'p_shiji_123dayuansec'], src: ['g_sima-91', 'w_shiji'] });
T2('s-alfalfa-grapes', { thread: 'th-silk', from: 'bactria', to: 'china', carried: 'crop_or_animal', what: 'Alfalfa and grapes brought from Dayuan (Ferghana)', medium: 'court_or_empire', start: -126, end: -91, directness: 'documented', status: 'E2',
  for: ['Shiji 123’s closing section says Han envoys brought back alfalfa and grape seeds from Dayuan and planted them near the palaces'], against: ['The record is a Han court historian’s account, not an archaeobotanical finding'], note: 'The same source says Han deserters taught the Dayuan to cast metal, a claim whose quote was rejected on verification for not containing it.',
  passages: ['p_shiji_123closingse'], src: ['g_sima-91'] });
T2('s-buddhism-chuying', { thread: 'th-silk', from: 'india', to: 'china', carried: 'religion', what: 'Buddhist observance at the Han court: Prince Ying of Chu and the 65 CE edict', medium: 'court_or_empire', start: 65, end: 65, directness: 'documented', status: 'E2',
  note: 'The Hou Hanshu (compiled in the fifth century from earlier histories) records Prince Ying of Chu studying the Buddha and an edict of 65 CE naming fu-tu (Buddha), upasaka and sramana.',
  for: ['Hou Hanshu 42 quotes the 65 CE edict with the three Buddhist terms'], against: ['The Hou Hanshu was compiled about three centuries after the event; the page marks inline commentary, which is not Fan Ye’s text', 'The Ming-ti dream, which the same history reports, is a tradition and judged legendary (Pelliot 1919)'],
  passages: ['p_houhanshu_42chuwangyin', 'p_houhanshu_42chuwangyin2', 'p_houhanshu_88tianzhu'], src: ['g_fan445', 'g_fan445b', 'g_pelliot1919'] });
T2('s-ganying-rome', { thread: 'th-silk', from: 'china', to: 'parthian-sasanian', carried: 'people', what: 'Gan Ying’s mission to the west (97 CE)', medium: 'court_or_empire', start: 97, end: 97, directness: 'documented', status: 'E2',
  for: ['Hou Hanshu 88 (Anxi and Daqin sections) records Gan Ying’s embassy, quoted in Chinese and in Hirth’s English'], against: ['Written in the fifth century CE from earlier sources', 'Hirth’s English adds nothing independent: it translates the same passage'], note: 'The Chinese record shows contact with Parthian territory; what it says of Daqin (Rome) is hearsay gathered on the mission.',
  passages: ['p_houhanshu_88daqinanxi', 'p_houhanshu_88daqinganyi'], src: ['g_fan445b', 'g_hirth1885'] });

// ================================================================ Scholarship wave (RDADA run 2026-11-17 Scholarship)
// First-hand papers and reviews replace some of the pointer sources used above. Where the scholar could only be reached second-hand,
// the line says so. Sceptical sources are held to the same standard as supportive ones.

X('s-ie-steppe-language', { src: ['g_allentoft2015', 'g_narasimhan2019', 'g_lazaridis2022', 'g_klejn2017', 'g_heyd2017'],
  for: ['Allentoft et al. (2015, abstract): “Our findings are consistent with the hypothesized spread of Indo-European languages during the Early Bronze Age”: their own hedge, since the paper measures ancestry, not language'],
  against: ['Lazaridis et al. (2022): “Language is not encoded in the genome”; the homeland is an inference from where steppe ancestry is and is not found', 'Klejn’s answer to the 2015 authors: his doubts are not assuaged (abstract only; his arguments were not read)', 'Heyd (2017, abstract): the Yamnaya-to-Corded-Ware picture is too simple, with “considerable evidence for centuries of connections and interactions across the continent”'] });
X('s-ie-steppe-cordedware', { src: ['g_heyd2017'], against: ['Heyd (2017): the archaeological record shows centuries of interaction, not a single transmission (abstract only)'] });
X('s-ie-anatolian-farmers', { src: ['g_bouckaert2012', 'g_heggarty2023', 'g_kassian2025', 'g_lazaridis2022'],
  for: ['Bouckaert et al. (2012): “We find decisive support for an Anatolian over a steppe origin”', 'Heggarty et al. (2023, abstract): a root of about 8120 years BP that “does not rule out an initial homeland south of the Caucasus, with a subsequent branch northward onto the steppe”: a hybrid, not pure Anatolian', 'Lazaridis et al. (2022): a West Asian homeland for Indo-Anatolian, with only secondary dispersals of non-Anatolian Indo-European from the steppe'],
  against: ['Kassian and Starostin (2025): “there remain serious issues when it comes to marking cognation between different characters”: they belong to a school with a rival method, so they have a stake', 'Bouckaert’s root has since been challenged by later trees (Heggarty 2023 gets a different root and a hybrid homeland)'],
  note: 'Updated with the first-hand papers: the Anatolian case is now mainly a West Asian or south-Caucasus one, not farmers into Europe.' });
X('s-ie-asia', { src: ['g_narasimhan2019'],
  for: ['Narasimhan et al. (2019, abstract): steppe ancestry in South Asia is “tracking a movement of people that affected both regions and that likely spread the unique shared features shared between Indo-Iranian and Balto-Slavic languages”'],
  against: ['The same abstract notes there is no ancient DNA yet for the ANI and ASI groups, so the inference is statistical'] });
X('s-persia-judaism', { src: ['g_shakednd', 'g_isbell2006', 'g_boyce1984', 'g_agostini2016', 'g_dobroruka2012', 'g_smithnd'],
  for: ['Shaked (an Iranist, typescript): “scholars of Iranian generally tend to assume that Iran had a great deal of influence on Judaism and Christianity”; he names angelology, eschatology and dualism as the changes that point to Persia'],
  against: ['Isbell (2006): “not a single Persian loanword is known throughout the entirety of the Hebrew Torah”; his own survey is “cursory”', 'Ehrman (first-hand blog): “Do we see any evidence of a belief in resurrection in Jewish texts from that period? Well, actually, no we don’t”: resurrection appears only from the Maccabean period, after Persian rule', 'M. S. Smith’s own summary explains Israelite monotheism by empire: “the conditions of human empires provided the model for divine empire” (Assyria and Babylon, not Persia)', 'Gignoux, as reported by Dobroruka (second-hand): Persian apocalyptic “is either too late to be taken as an effective influence”'],
  unresolved: ['Barr (1985), Grabbe and Bremmer’s book could not be opened; Boyce reached only through a chapter abstract and a second-hand report'],
  note: 'Updated: one proponent (Shaked) and two sceptics (Isbell, Ehrman) now read first-hand; the others stay second-hand and are marked so.' });
X('s-writing-egypt-sinai', { src: ['g_haring2019', 'g_haring2025', 'g_simons2011', 'g_hflmayer2021'],
  for: ['Simons (2011): “The proto-Sinaitic script almost certainly used the principle of acrophony to assign phonetic values to its signs”, drawing its signs from Egyptian hieroglyphic and hieratic'],
  against: ['Haring (2019): “the Proto-Sinaitic inscriptions have largely remained undeciphered, the Wadi el-Ḥôl texts entirely so”', 'Haring (2025): “without a satisfactory decipherment of the Wadi el-Hol abjad texts it is impossible to say if they are really related to the expedition texts”', 'Höflmayer et al. (2021): “The date for the development of early alphabetic script is still disputed”; several scholars also deny acrophony'] });
X('s-writing-sinai-phoenician', { src: ['g_hflmayer2021'], against: ['Höflmayer et al. (2021) report a Lachish inscription argued to bridge the gap between Sinai and later Levantine texts; the gap-filling is argued, not settled'] });
X('s-writing-semitic-brahmi', { src: ['g_pillai2023', 'g_baumsnd'],
  for: ['Pillai (2023): “Brāhmī was not derived from a single script, but instead was a hybrid invention by Indian scholars from Aramaic, Phoenician and Greek letters” (a minority proposal that also says there is no consensus)'],
  against: ['Baums: “it remains possible, though by no means certain, that [Ashoka] or his immediate predecessors may have invented the Brahmi script on the model of Kharosthi”: the Kharosthi-model view, not a Semitic one', 'Salomon (1998) and Falk (2018), the standard references, could not be opened: they are known only through Pillai and Baums'],
  note: 'Updated: three modern positions are now on the page (Semitic prototypes, a Kharosthi model, a hybrid), all graded debated.' });
T2('s-olmec-maya-writing', { thread: 'th-writing', from: 'olmec', to: 'maya', carried: 'writing', what: 'The earliest Mesoamerican writing (the Cascajal block, c. 1000–800 BCE) and later scripts', medium: 'unknown', start: -1000, end: -400, directness: 'debated', status: 'E4',
  note: 'The Cascajal block is claimed as the earliest writing in the Americas. Imaging and pXRF find its material consistent with Olmec serpentine, but doubts about authenticity linger. The strand’s end year is a schematic placement: no source opened dates the first Maya glyphs.',
  for: ['Skidmore (2006, Mesoweb) summarises the original Science claim of 1000–800 BCE', 'Englehardt et al. (2020) find the block’s material and manufacture consistent with securely provenanced Olmec serpentine'], against: ['Englehardt et al.: “Doubts linger, however, regarding the object’s authenticity”', 'A Mesoweb report on the San Bartolo murals relies on sources not opened and treats claimed La Venta glyphs as iconic rather than script', 'No source opened tests whether Olmec signs descend into Maya writing'],
  src: ['g_englehardt2020', 'g_skidmore2006', 'g_evidenceofnd', 'g_clemmensen2023'] });
X('s-laurasian', { src: ['g_thompsonnd', 'g_allen2014', 'g_witzelnd', 'g_dhuy2015', 'g_graca2016', 'g_urban2025'],
  for: ['Allen (2014): the Thulung data “seem to accord with the Laurasia concept sufficiently well to suggest that the concept merits further testing”: he is predisposed to common-origin approaches, and this is one case', 'd’Huy (2015, a newsletter): “Comparative evidence supports the probability that the Polyphemus tale was current in some form in the Palaeolithic era”'],
  against: ['Thompson’s review calls it “completely out of date and highly questionable scholarship”: one hostile review, whose “racist” charge is the reviewer’s own definition', 'A comparable method traces one tale, “The Smith and the Devil”, to the Bronze Age (da Silva and Tehrani 2016, one of five tested at 87%); Urban (2025) calls that “the astonishing claim” and finds tree models fit Quechua versions poorly (by analogy, not a reanalysis)'],
  unresolved: ['Lincoln’s 2015 review of Witzel could not be opened; no independent review of Berezkin’s catalogue turned up'] });
X('s-cosmic-hunt', { src: ['g_berezkin2005'], for: ['Berezkin (2005): the parallels “could be explained only by particular historical links between corresponding traditions”: his own work, not an independent test'] });
X('s-craft-to-roman-alchemy', { src: ['g_rageot2023', 'g_walter1999', 'g_shortland2009'],
  for: ['A 26th Dynasty embalming workshop at Saqqara: labelled vessels link Egyptian recipe names to oil, tar and resin mixtures, including imported Pistacia and conifer products (Rageot et al. 2023)', 'Walter et al. (1999, abstract): laurionite and phosgenite in cosmetics “appear to be synthetic products manufactured by the Egyptians using ‘wet’ chemistry”: the authors’ inference'],
  against: ['Shortland (2009): “The earliest surviving glassmaking workshop is a subject of debate”: even the best-known craft site is unsettled'] });

// ================================================================ Breadth wave (RDADA run 2026-11-17 Breadth)
// New regions and eras. Strands in extra/h.ts are generated from verified candidates (scripts/candidates-to-strands.py); the
// cultures, threads and the grouping below are the editor's. Where no source gave dates, the strand sits on the overlap of the
// two cultures' spans and says so in its note.
import { STRANDS_H } from './extra/h';

CULTURES.push(
  CA('qumran', ['Dead Sea Scrolls', 'Essenes', 'yahad', 'Qumran'], 'Qumran sect (the yahad)', 'Near East', -150, 70),
  CA('judaea-roman', ['Roman Judaea', 'Syria Palaestina', 'Bar Kokhba'], 'Roman Judaea and Palaestina', 'Near East', 6, 640),
  CA('jewish-diaspora', ['Diaspora', 'Jewish communities abroad'], 'Jewish diaspora communities', 'Mediterranean', -586, 640),
  C('elephantine', 'Elephantine Jewish garrison (Egypt)', 'Egypt', -525, -399),
  C('moab', 'Moab (Mesha’s kingdom)', 'Near East', -900, -580),
  CA('bantu-homeland', ['Nigeria', 'Cameroon'], 'Bantu homeland (Nigeria–Cameroon)', 'Africa', -3000, -1000),
  C('congo-rainforest', 'Congo rainforest', 'Africa', -1000, 1500),
  CA('bantu-africa', ['Bantu', 'sub-Saharan Africa'], 'Bantu-speaking Africa', 'Africa', -1000, 1500),
  C('nok', 'Nok culture (central Nigeria)', 'Africa', -1000, 300),
  CA('north-africa-sahara', ['Maghreb', 'Sahara', 'trans-Saharan trade'], 'North Africa and the Sahara trade', 'Africa', -500, 1500),
  CA('ghana-mali', ['Ghana', 'Mali', 'Sahel', 'Timbuktu'], 'Ghana and Mali (Sahel)', 'Africa', 400, 1600),
  CA('aksum', ['Axum', 'Ethiopia', 'Ezana'], 'Aksum (Ethiopia)', 'Africa', 100, 940),
  CA('east-africa-coast', ['Swahili', 'Azania', 'Periplus'], 'East African coast (Azania)', 'Africa', 0, 1500),
  CA('balsas-mesoamerica', ['Mexico', 'maize', 'Mesoamerica'], 'Balsas valley and Mesoamerica', 'Americas', -8000, 1500),
  CA('andes', ['Peru', 'Inca'], 'Andes and Peruvian coast', 'Americas', -3000, 1500),
  C('west-mexico', 'West Mexico', 'Americas', 600, 1500),
  C('n-south-america', 'Northern South America (Ecuador, Colombia)', 'Americas', -3000, 1500),
  C('indigenous-n-america', 'Indigenous North America', 'Americas', -15000, 1600),
  CA('newfoundland', ['Vinland', 'L’Anse aux Meadows'], 'Newfoundland (L’Anse aux Meadows)', 'Americas', 1000, 1030),
  C('americas-all', 'The Americas', 'Americas', -15000, 1600),
  C('old-world', 'The Old World', 'Americas', -3000, 1900),
  CA('polynesia-east', ['Polynesia', 'Rapa Nui', 'Easter Island'], 'Eastern Polynesia', 'Pacific', 800, 1500),
  CA('norse', ['Vikings', 'Iceland', 'Greenland'], 'Norse world (Iceland, Greenland)', 'Europe', 800, 1400),
  CA('baekje', ['Paekche', 'Korea'], 'Baekje (Korea)', 'East Asia', -18, 660),
  CA('goguryeo', ['Koguryo', 'Korea'], 'Goguryeo (Korea)', 'East Asia', -37, 668),
  CA('silla', ['Korea'], 'Silla (Korea)', 'East Asia', -57, 935),
  CA('goryeo-joseon', ['Korea', 'Joseon', 'Goryeo'], 'Goryeo and Joseon Korea', 'East Asia', 918, 1897),
  CA('yamato-japan', ['Japan', 'Nara', 'Heian'], 'Yamato and early Japan', 'East Asia', 300, 1100),
  CA('vietnam', ['Jiaozhi', 'Annam', 'Tonkin'], 'Jiaozhi (northern Vietnam)', 'East Asia', -111, 938),
  CA('funan', ['Cambodia', 'Mekong delta'], 'Funan', 'Southeast Asia', 100, 550),
  CA('champa', ['Cham', 'Vietnam'], 'Champa', 'Southeast Asia', 192, 1500),
  CA('kutai-java', ['Borneo', 'Java', 'Kutai'], 'Kutai and West Java', 'Southeast Asia', 350, 500),
  CA('sea-all', ['Indianization', 'Indonesia'], 'Southeast Asia', 'Southeast Asia', -500, 1500),
  C('pre-anatolian', 'Pre-Anatolian Indo-European speakers', 'Near East', -2500, -1900),
  C('europe-asia-ie', 'Europe and Asia (Indo-European speakers)', 'Europe', -4000, 1000),
  C('alpine', 'Alpine region (north Italic contact)', 'Europe', -700, 0),
  CA('germanic-north', ['runes', 'Scandinavia'], 'Germanic north (runic)', 'Europe', -200, 800),
  CA('armenia', ['Mashtots', 'Koriwn'], 'Armenia', 'Near East', -600, 1000),
  C('georgia', 'Georgia (Kartli)', 'Near East', -300, 1000),
  CA('ugarit', ['Syria'], 'Ugarit (Syria)', 'Near East', -1400, -1190),
  C('nabataean', 'Nabataean kingdom', 'Near East', -100, 106),
  CA('arabia', ['Hijaz', 'Arabic script', 'Namara'], 'Arabia (Nabataean to early Islam)', 'Near East', -100, 700),
  C('manichaean', 'Manichaean communities', 'Near East', 240, 1400),
  CA('church-east', ['Nestorian', 'Syriac Christianity'], 'Church of the East (Syria and Persia)', 'Near East', 100, 1400),
  C('minoan', 'Minoan Crete (Linear A)', 'Mediterranean', -2000, -1450),
  C('cyprus', 'Cyprus', 'Mediterranean', -1100, 300),
  CA('early-christianity', ['Christians', 'church'], 'Early Christian communities', 'Mediterranean', 30, 400),
  C('roman-east', 'Roman Anatolia and the Aegean', 'Mediterranean', -133, 400),
  C('roman-north-africa', 'Roman North Africa', 'Mediterranean', -146, 430),
  C('italian-ports', 'Italian maritime republics (Genoa, Caffa)', 'Mediterranean', 1200, 1500),
  CA('bologna', ['Irnerius', 'Roman law revival'], 'Medieval Bologna', 'Europe', 1000, 1300),
  CA('golden-horde', ['Mongols', 'Sarai'], 'Golden Horde', 'Steppe', 1242, 1502),
  CA('mongol-empire', ['Mongols', 'Genghis', 'Karakorum'], 'Mongol Empire', 'Steppe', 1206, 1368),
  C('tian-shan', 'Issyk-Kul and the Tian Shan', 'Steppe', 1300, 1350),
  C('western-eurasia', 'Western Eurasia', 'Islamic world and Europe', 1300, 1400),
  CA('ilkhanate', ['Tabriz', 'Rashid al-Din'], 'Ilkhanate Persia', 'Iran', 1256, 1335),
);
THREADS.push(
  { id: 'th-qumran', name: 'Dead Sea Scrolls and Second Temple Judaism', carried: 'idea', blurb: 'What the Qumran manuscripts say about the sect that kept them, set against what Josephus, Philo and Pliny report about the Essenes. Who wrote them, and whether Qumran was a settlement, a fortress or a library, is argued; both sides are kept.' },
  { id: 'th-jewishsrc', name: 'Jewish sources, inscriptions and Josephus', carried: 'idea', blurb: 'Josephus on Jewish origins and sects, the Testimonium and its transmission through Christian hands, and the inscriptions (Merneptah, Tel Dan, Mesha, Siloam, Lachish, Elephantine) that touch Israel and Judah directly.' },
  { id: 'th-romejews', name: 'Rome, Jews and Christians', carried: 'people', blurb: 'What Roman historians wrote about Jews and Christians, and the Bar Kokhba revolt and the diaspora that followed. Hostile and late reports are graded as such.' },
  { id: 'th-africa', name: 'Africa: peoples, iron and trade', carried: 'people', blurb: 'The Bantu expansion, the debated origins of African iron, and what Arabic geographers and the Periplus record of trade and conversion. Genomic, linguistic and archaeological reconstructions of the Bantu route disagree, and the page keeps both.' },
  { id: 'th-americas', name: 'The Americas: crops and contact', carried: 'crop_or_animal', blurb: 'Maize and its spread, Polynesian and Norse contact, and the Columbian exchange. Dated finds are separated from inference; the sceptic is quoted where one was opened.' },
  { id: 'th-eastasia', name: 'East Asia: the Sinosphere', carried: 'religion', blurb: 'Writing, Buddhism, paper and technologies between China, Korea, Japan and Vietnam, read from Nihon Shoki, Samguk sagi and Hangul’s own prefaces. Scholars date the arrival of Buddhism in Japan differently from the chronicle.' },
  { id: 'th-seasia', name: 'Southeast Asia: Indianization', carried: 'idea', blurb: 'Sanskrit inscriptions and Chinese envoy accounts set against the scholars who doubt a simple “Indianization”: Wolters’s localization, Vickery’s dating, and multidirectional exchange.' },
  { id: 'th-islam', name: 'Islam, Arabic and the Indian Ocean', carried: 'idea', blurb: 'The earliest Arabic-script inscriptions, the Birmingham Quran fragment’s dating dispute, the Constitution of Medina, and the Indian Ocean trade to China.' },
  { id: 'th-lawchurch', name: 'Law and Christianity', carried: 'institution', blurb: 'Roman law from Gaius to Bologna, and the spread of Christianity and Manichaeism through Pliny, Acts, Augustine and the Xi’an stele. A letter showing Christians in Bithynia is not a spread route, and the page says so.' },
  { id: 'th-plague', name: 'Mongol-era exchange and the plague', carried: 'people', blurb: 'Rubruck and Polo on the Mongol world, and the Black Death’s route. The Caffa catapult story rests on one non-eyewitness; ancient-DNA studies place the strain, not the route.' },
);
for (const r of STRANDS_H) {
  const a = CULTURES.find(c => c.id === r.from)!, b = CULTURES.find(c => c.id === r.to)!;
  let start = r.start, end = r.end;
  if (start == null && end == null) { start = Math.max(a.start, b.start); end = Math.min(a.end, b.end); if (end < start) { start = b.start; end = Math.min(b.end, b.start + 60); } }
  else if (start == null) start = end!; else if (end == null) end = start;
  const { schematic, ...s } = r; void schematic;
  STRANDS.push({ ...s, start: start!, end: end! } as Strand);
}

// Finer detail: route and branch strands nested under their overview strand (shown with "Show fine detail").
// Hand-authored strands from the Jewish and Roman wave: each rests on passages quoted at their locus and re-found by a verifier.
T2('s-testimonium', { thread: 'th-jewishsrc', from: 'israel-judah', to: 'early-christianity', carried: 'writing', what: 'The Testimonium Flavianum (Antiquities 18.3.3): Josephus’s text on Jesus as copied by Christian hands', medium: 'text', start: 93, end: 324, directness: 'debated', status: 'E4',
  note: 'Josephus wrote the Antiquities c. 93/94 CE, and Eusebius quotes a Testimonium by 324. Whether the passage is wholly authentic, wholly added, or an authentic core with Christian additions is the open question; the surviving Greek manuscripts are medieval. Jerome (late 4th c.) quotes a variant, “believed to be Christ”, that departs from the Greek, which shows the text was not fixed.',
  passages: ['p_josephusantiqu_1833whiston1', 'p_eusebiuseccles_churchhistor', 'p_jeromelivesofi_devirisillus', 'p_josephusantiqu_2091whiston2'],
  for: ['Josephus (Ant. 18.3.3): “He drew over to him both many of the Jews and many of the Gentiles.”', 'Eusebius (HE 1.11): “a wise man, if indeed it be proper to call him a man”: the passage existed in Christian hands by 324'],
  against: ['Jerome quotes “and was believed to be Christ”, not the Greek “He was [the] Christ”: the wording varies between witnesses', 'Eusebius, HE 2.23, says Jerusalem fell “to avenge James the Just”, a sentence not in the extant Antiquities, so Christian readers also shaped how Josephus was remembered'],
  unresolved: ['Is there an authentic core, and where do the Christian additions begin?', 'No pre-Eusebian quotation of the passage was captured from the sources opened.'], src: ['g_josephus94f', 'g_eusebius1890b', 'g_eusebius1890c', 'g_jerome1892'] });
T2('s-essenes-qumran', { thread: 'th-qumran', from: 'israel-judah', to: 'qumran', carried: 'people', what: 'Were the Essenes of Josephus, Philo and Pliny the sect whose scrolls were hidden at Qumran?', medium: 'text', start: -150, end: 70, directness: 'debated', status: 'E4',
  note: 'Pliny the Elder places the Essenes on the west shore of the Dead Sea, above En-gedi, and Josephus describes their rules. Many scholars identify them with the Community Rule’s yahad; Golb argues the scrolls came from Jerusalem libraries, and others look to a Sadducean priestly tradition. The page keeps these as separate strands.',
  passages: ['p_plinytheeldern_573', 'p_josephusjewish_282119'],
  for: ['Pliny the Elder: “Lying on the west of Asphalt lake … are the Essenes.” (the location only; he does not mention scrolls or Qumran by name)'],
  against: ['The Community Rule is not named as Essene by any of the three classical writers; the identification is an inference from the match of rules and place', 'Golb: the scrolls were taken from Jerusalem libraries in 66-70 CE (see the library strand)'],
  unresolved: ['Is the match of place and practice enough, or does it need a document that names the sect?'], src: ['g_pliny2022', 'g_josephusndb'] });
T2('s-tacitus-christians', { thread: 'th-romejews', from: 'israel-judah', to: 'rome', carried: 'religion', what: 'Christians in Rome by 64 CE: Tacitus on Christus and the fire (Annals 15.44)', medium: 'text', start: 64, end: 64, directness: 'documented', status: 'E3',
  note: 'Tacitus (written c. 105-116) says Christus “suffered the extreme penalty during the reign of Tiberius” and that a “vast multitude” was punished at Rome after the fire of 64. Shaw (2015) argues the general execution reported is contested. It is a hostile, later witness: strong that Christians were known in Rome, weaker on the details.',
  passages: ['p_tacitusannals_15443', 'p_tacitusannals_15442'],
  for: ['Tacitus, Annals 15.44.3: “Christus, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius”'],
  against: ['Shaw (2015) argues that the large-scale execution Tacitus describes is contested, though not that nothing happened'], src: ['g_tacitusndb', 'g_shaw2015'] });
T2('s-citizenship-212', { thread: 'th-romejews', from: 'rome', to: 'egypt-roman', carried: 'institution', what: 'Citizenship for “the whole inhabited world”: the Constitutio Antoniniana as preserved in P.Giss. 40', medium: 'text', start: 211, end: 213, directness: 'documented', status: 'E2',
  note: 'The papyrus reads “[…] the whole world citizenship of the Romans”. The column is fragmentary and its restorations are contested, so what it grants and to whom is argued even though the document itself is first-hand.',
  passages: ['p_pgiss40colicon_colilines89q'],
  for: ['P.Giss. 40 col. I, line 9: “κατὰ τ]ὴ̣ν οἰκουμέν̣η̣ν π[ολιτ]είαν Ῥωμαίων”'],
  against: ['The column is fragmentary and the restorations are contested: the scope of the grant is not read directly from the surviving words'], src: ['g_papyrusgiessennd'] });
const PARENTS: Record<string, string[]> = {
  'x-africa-bantu-homeland-bantu-africa-peop': ['x-africa-bantu-homeland-congo-rainforest-lang', 'x-africa-bantu-homeland-congo-rainforest-peop', 'x-africa-congo-rainforest-bantu-africa-peop'],
  'x-mongol-golden-horde-latin-europe-peop': ['x-mongol-golden-horde-italian-ports-peop', 'x-mongol-tian-shan-western-eurasia-peop'],
  'x-indo-yamnaya-europe-asia-ie-lang': ['x-indo-pre-anatolian-anatolia-lang', 'x-indo-yamnaya-anatolia-lang', 'x-indo-germanic-north-alpine-lang'],
};
for (const [par, kids] of Object.entries(PARENTS)) for (const k of kids) { const s = STRANDS.find(x => x.id === k); if (s) s.parent = par; }
