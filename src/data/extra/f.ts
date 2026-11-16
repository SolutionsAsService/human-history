import type { Entry, Source, Link, HypothesisOption, Question, Status } from '../../types';
import { entry } from '../helpers';
import { bce } from '../../lib/time';

// Author F: Khemet (Kemet, ancient Egypt), the word "chemistry", Graeco-Egyptian alchemy and its transmission to modern chemistry.
// Sourced by the RDADA research agent (rdada_runs/2026-11-16 Khemet chemistry/): each source below was opened and its quoted
// passage found verbatim by an independent verifier on 2026-11-16. Candidates that could not be opened (Zenodo 403, CAPTCHA
// and identity-provider walls) are NOT used. Reliability grades are the editor's reading of the source type, not RDADA's.

type K = Source['kind']; type R = Source['reliability'];
const S = (id: string, cite: string, kind: K, discipline: string, reliability: R, methodology: string, evidence: string, conflicts: string, note?: string): Source =>
  ({ id, cite, kind, discipline, reliability, methodology, evidence, conflicts, note });
const acc = ' (accessed 2026-11-16)';

export const SOURCES_F: Source[] = [
  // ---- chemical crafts
  S('f_buckley2001', 'Buckley S.A., Evershed R.P. (2001) Organic chemistry of embalming agents in Pharaonic and Graeco-Roman mummies. Nature 413:837–841. doi:10.1038/35101588. eprints.whiterose.ac.uk/7092' + acc + ' (abstract record only).', 'primary', 'Organic geochemistry', 'high', 'Gas chromatography–mass spectrometry of mummy tissues, wrappings and resinous materials.', 'Frames the mummification chemistry; notes that no native written record of the process survives.', 'None stated.', 'Only the abstract was opened; specific compounds and dates are not cited here.'),
  S('f_buckley2004', 'Buckley S.A., Clark K.A., Evershed R.P. (2004) Complex organic chemical balms of Pharaonic animal mummies. Nature 431:294–299. doi:10.1038/nature02849. eprints.whiterose.ac.uk/7100' + acc + ' (abstract record only).', 'primary', 'Organic geochemistry', 'high', 'Chemical analysis of cat, hawk and ibis mummy balms.', 'Fats, oils, beeswax, sugar gum, bitumen and several resins in animal mummy treatments.', 'None stated.', 'Abstract only; sample numbers and dating not read.'),
  S('f_riesmeier2022', 'Riesmeier M. et al. (2022) Recipes of ancient Egyptian kohls more diverse than previously thought. Scientific Reports 12:5932. PMC8994005' + acc + '.', 'primary', 'Archaeometry', 'high', 'Multi-analytical study of 11 Petrie Museum kohl containers.', 'Galena and cerussite present; laurionite in one and phosgenite in another, read as likely synthetic (citing Walter et al. 1999, not opened).', 'None stated.', 'Eleven objects only; the synthetic reading is the authors’ inference.'),
  S('f_wiki_faience', 'Wikipedia contributors. Egyptian faience. en.wikipedia.org/wiki/Egyptian_faience' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Names faience as a sintered-quartz ceramic material from ancient Egypt.', 'None.', 'Pointer only; no dating or technology claim rests on it.'),
  // ---- the name
  S('f_plutarch_loeb', 'Plutarch, Isis and Osiris (De Iside et Osiride) §33, in Moralia V, tr. F.C. Babbitt, Loeb Classical Library 306 (1936). archive.org/details/plutarch-isis-osiris-loeb' + acc + ' (OCR of the scan).', 'primary', 'Classical text', 'high', 'Ancient Greek text with a 1936 English translation.', 'Reports that the Egyptians call their land, which has very black soil, “Chemia”, like the black of the eye, and compare it to a heart.', 'Author an outside observer of Egyptian religion.', 'Concerns the country name only; says nothing about metals or transmutation.'),
  S('f_lindsay1970', 'Lindsay J. (1970) The Origins of Alchemy in Graeco-Roman Egypt. Frederick Muller. archive.org/details/alchemy-jack-lindsay' + acc + ' (OCR).', 'secondary', 'Literary and cultural history', 'mixed', 'Survey of the origins of alchemy; philological argument on the word chemeia.', 'Judges the “black land” derivation philologically weak and prefers a Greek route through chyma (a cast metal ingot).', 'Author is a literary historian and novelist, not a trained philologist; the book predates later scholarship.'),
  S('f_regal2009', 'Regal B. (2009) Pseudoscience: A Critical Encyclopedia. Greenwood. archive.org/details/Pseudoscience_A_Critical_Encyclopedia_by_Brian_Regal' + acc + ' (OCR).', 'skeptical', 'Reference work', 'medium', 'Encyclopedia entry for a general audience.', 'States that alchemy derives from Greek chemeia, itself from the word for smelting metals.', 'Sceptic-oriented reference work.', 'Does not discuss the Egyptian black-land derivation in the passage read.'),
  S('f_wiktionary_chymeia', 'Wiktionary contributors. χυμεία (Ancient Greek). en.wiktionary.org/wiki/χυμεία' + acc + ' (raw wikitext).', 'secondary', 'Dictionary (user-edited)', 'low', 'Dictionary etymology.', 'Gives the ancient tradition of an inventor “Chymes” but says the word is more probably formed from χύμα with the suffix -εία.', 'None.', 'No source cited in the part read.'),
  S('f_wiki_etym_chem', 'Wikipedia contributors. Etymology of chemistry. en.wikipedia.org/wiki/Etymology_of_chemistry' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Reports the Egyptian (Budge: kēme, kmt) and Greek (khuma) derivations and a folk-etymology warning attributed to Mahn; names no winner.', 'None.', 'Finding aid only; Budge and Mahn are second-hand.'),
  S('f_wiki_zosimos', 'Wikipedia contributors. Zosimos of Panopolis. en.wikipedia.org/wiki/Zosimos_of_Panopolis' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Quotes the Syncellus passage in which Zosimos says a book called chema gave chemistry its name.', 'None.', 'Finding aid only; Greek not opened.'),
  // ---- Graeco-Egyptian alchemy
  S('f_lagercrantz1913', 'Lagercrantz O. (1913) Papyrus graecus holmiensis (P. Holm.): Recepte für Silber, Steine und Purpur. Uppsala. archive.org/details/papyrusgraecusho00lage' + acc + ' (OCR).', 'primary', 'Papyrology', 'medium', 'Editio princeps of the Stockholm papyrus: Greek text, German translation and commentary.', 'Treats it as a collection of chemical recipes; analyses Pseudo-Democritus’ Physika kai Mystika as three unconnected parts.', 'None.', 'A 1913 edition; later work (Halleux 1981, not opened) supersedes its dating and readings.'),
  S('f_berthelot1887', 'Berthelot M., Ruelle C.-E. (1887) Collection des anciens alchimistes grecs, première livraison (introduction). Paris. archive.org/details/collectiondesanc01bert' + acc + ' (OCR).', 'primary', 'Edition of Greek alchemical texts', 'medium', 'Nineteenth-century collection and commentary.', 'Describes Leiden papyrus X as recipes dated by its editors to the end of the third century CE.', 'None.', 'Dating is Reuvens and Leemans’ palaeography as Berthelot reports it; his “faussaire” reading is an inference.'),
  S('f_berthelot1888', 'Berthelot M., Ruelle C.-E. (1888) Collection des anciens alchimistes grecs, seconde livraison: les œuvres de Zosime. Paris. archive.org/details/collectiondesanc23bert' + acc + ' (OCR).', 'primary', 'Edition of Greek alchemical texts', 'medium', 'Translation of Zosimus’s works.', 'In Zosimus’s Final Account the divine art was revealed to priests only.', 'None.', 'A claim by a writer c. 300 CE, not contemporary pharaonic evidence; Mertens’ 1995 edition (not opened) is standard.'),
  S('f_wiki_leyden', 'Wikipedia contributors. Leyden papyrus X. en.wikipedia.org/wiki/Leyden_papyrus_X' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Summarises the papyrus as 111 recipes whose presentation is exclusively practical.', 'None.', 'Finding aid only.'),
  // ---- transmission
  S('f_chicago_newman2006', 'Newman W.R. (2006) Atoms and Alchemy: Chymistry and the Experimental Origins of the Scientific Revolution. University of Chicago Press. Publisher page' + acc + '.', 'secondary', 'History of science', 'low', 'Publisher description.', 'Describes Newman’s thesis on the alchemical roots of Boyle’s mechanical philosophy.', 'Promotional text.', 'The argument itself was not read.'),
  S('f_chicago_np2002', 'Newman W.R., Principe L.M. (2002) Alchemy Tried in the Fire: Starkey, Boyle, and the Fate of Helmontian Chymistry. University of Chicago Press. Publisher page' + acc + '.', 'secondary', 'History of science', 'low', 'Publisher description.', 'Records the 2005 Pfizer Prize from the History of Science Society.', 'Promotional text.', 'The 2002 year was not re-checked on the page.'),
  S('f_chicago_principe2013', 'Principe L.M. (2013) The Secrets of Alchemy. University of Chicago Press. Publisher page' + acc + '.', 'secondary', 'History of science', 'low', 'Publisher description and table of contents.', 'Table of contents runs from Greco-Egyptian chemeia to Arabic al-Kimiya, Medieval Latin alchemia and early modern chymistry.', 'Promotional text.', 'The evidence for the chain is in the book, which was not read.'),
  S('f_wiki_robert', 'Wikipedia contributors. Liber de compositione alchemiae. en.wikipedia.org/wiki/Liber_de_compositione_alchemiae' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Dates the first Latin translation of an Arabic work on alchemy to 11 February 1144 (Robert of Chester).', 'None.', 'Pointer to the scholarship it cites.'),
  S('f_wiki_islamic_alch', 'Wikipedia contributors. Alchemy in the medieval Islamic world. en.wikipedia.org/wiki/Alchemy_in_the_medieval_Islamic_world' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'States that al-Razi’s laboratory operations overlap with those of pre-Islamic Alexandrian alchemists.', 'None.', 'Pointer; Rhazes-specific scholarship not opened.'),
  S('f_wiki_emerald', 'Wikipedia contributors. Emerald Tablet. en.wikipedia.org/wiki/Emerald_Tablet' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'The Emerald Tablet is believed to have been compiled in Arabic in the late eighth or early ninth century.', 'None.', 'Pointer; Kraus and Weisser are cited there, not read.'),
  S('f_wiki_hermetica', 'Wikipedia contributors. Hermetica. en.wikipedia.org/wiki/Hermetica' + acc + '.', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Reports Fowden on Greek–Egyptian interaction, Bull (2018) on Egyptian priestly authorship in Greek, and a c. 100–300 CE dating.', 'None.', 'Pointer; the picture is mixed, not settled.'),
  S('f_wiki_newton_occult', 'Wikipedia contributors. Isaac Newton’s occult studies. en.wikipedia.org/wiki/Isaac_Newton%27s_occult_studies' + acc + ' (raw wikitext).', 'secondary', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Much of Newton’s occult study can be attributed to his study of alchemy.', 'None.', 'Says nothing on an Egyptian origin.'),
  S('f_wiki_james', 'Wikipedia contributors. George G. M. James (Stolen Legacy). en.wikipedia.org/wiki/Stolen_Legacy' + acc + '.', 'skeptical', 'Encyclopedia (tertiary)', 'low', 'User-edited encyclopedia article.', 'Says Stolen Legacy and its thesis (Greek learning as stolen Egyptian wisdom) are generally considered pseudohistory by historians.', 'None.', 'An analogue; it does not address chemistry or alchemy.'),
];

export const ENTRIES_F: Entry[] = [
  entry({
    id: 'kemet-chemical-crafts', title: 'Chemical crafts of pharaonic Egypt (Khemet)', cat: 'artifact', priority: 'P2',
    place: 'Nile Valley, Egypt', lat: 26.0, lon: 31.0, geoKind: 'region', geoNote: 'A region: the analyses come from several sites and museum collections.',
    start: bce(1400), end: bce(30), dateKind: 'estimated', dateConfidence: 'low',
    dateNote: 'Spans only the evidence opened for this record (Late Bronze Age glass, Pharaonic embalming, kohl). Earlier technologies such as Egyptian blue are not dated here because the dating sources could not be opened.',
    ev: 'E2', interp: 'E2',
    summary: 'Chemical analysis shows pharaonic Egyptian craftspeople made glass, cosmetics and embalming treatments by empirical processes: glass made at Amarna, complex animal-mummy balms, and kohls that include lead compounds read as probably synthetic.',
    physical: ['Glass ingot from Amarna, analysed as Egyptian primary glass using a cobalt alum', 'Animal mummy balms containing fats, oils, beeswax, sugar gum, bitumen and resins', 'Eleven Petrie Museum kohls, two with laurionite or phosgenite', 'Egyptian blue is a synthetic calcium copper tetrasilicate pigment made by heating (abstract of a modern study)', 'A 26th Dynasty embalming workshop at Saqqara: GC-MS of 31 labelled vessels links Egyptian recipe names to oil, tar and resin mixtures with imported Pistacia and conifer products (Rageot et al. 2023); human-mummy balms were as complex as animal ones (Buckley et al. 2004)', 'Deir el-Medina shabtis: two possible Egyptian blue production groups (Seymour et al. 2020); Ptolemaic faience bowls from Athribis: quartz traced to Eastern Desert sources (Trzciński et al. 2022)', 'Copper: bronze was actually very rare in the Egyptian Bronze Age; arsenical copper was far more widespread (a review of Odler 2023, covering c. 4000–1600 BCE)'],
    textual: ['Mummification left no native written record; our knowledge of it relies on analysis and on later Greek and Roman authors', 'The Ebers papyrus (c. 1550 BCE) mixes empirical remedies with invocations; the Edwin Smith papyrus is mainly surgical. Neither shows chemical theory'],
    mainstream: 'Skilled, empirical craft chemistry documented by laboratory analysis. These are crafts passed on by practice, not a theoretical chemistry.',
    alternatives: [{ name: 'A pharaonic theoretical chemistry or lost advanced chemical science', status: 'E7', text: 'No text, apparatus or theory of this kind is documented in the sources opened; the embalming literature stresses that no written record of the processes survives.' }],
    for: ['Dated, published analyses of glass, balms and cosmetics', 'Independent analysis types (organic and inorganic) converge on skilled processing'],
    against: ['The sources opened cover a handful of objects', 'The synthetic origin of the lead compounds is an inference (“likely”), not a measurement'],
    unresolved: ['Dates and production sites for Egyptian blue and faience (sources could not be opened)', 'Copper, gold and bronze metallurgy, dyes, fermentation and medical recipes were not covered', 'The earliest glassmaking workshop is still debated (Shortland 2009)', 'Whether craft knowledge was ever written down before the Graeco-Roman recipe books', 'For a century the hieroglyph for “copper” was misread as “crucible”, a reminder that claims of a pharaonic chemical vocabulary need current philology (second-hand, via a review)'],
    predictions: ['Workshop remains with dated production waste for each material', 'Any pharaonic-period text describing a process, not just products, would revise the “no written record” picture'],
    culture: 'Pharaonic Egypt', lines: ['organic geochemistry', 'inorganic analysis', 'workshop archaeology'],
    sources: ['f_buckley2001', 'f_buckley2004', 'f_riesmeier2022', 'g_jackson2023', 'f_wiki_faience', 'g_rageot2023', 'g_huber2023', 'g_seymour2020', 'g_trzciski2022', 'g_walter1999', 'g_shortland2009', 'g_newbook2024', 'g_partington1950', 'g_skovmller2016', 'w_egyptianblue', 'g_humphreys1953', 'g_helgason1987', 'w_eberspapyrus'],
  }),
  entry({
    id: 'chemia-egypt-name', title: 'Chemia, a name for Egypt, and the word “chemistry”', cat: 'text', priority: 'P2',
    place: 'Egypt (as described by Plutarch)', lat: 30.04, lon: 31.24, geoKind: 'narrative', geoNote: 'The text names the country; the coordinate marks Egypt’s Nile region, not a find-spot.',
    start: 80, end: 120, dateKind: 'textual', dateConfidence: 'medium',
    ev: 'E1', interp: 'E3',
    summary: 'Plutarch (c. 100 CE) reports that the Egyptians call their black-soiled land “Chemia”. Whether the Greek word chemeia, and so “alchemy” and “chemistry”, comes from that name or from a Greek word for casting metal is disputed.',
    textual: ['Plutarch, Isis and Osiris §33: Egypt is called “Chemia”, like the black of the eye', 'Zosimos, via Syncellus: a book called chema gave chemistry its name'],
    mainstream: 'Arabic al-kimiya comes from Late Greek chemeia (uncontested in the sources opened). For the Greek word itself, the sources opened lean to a Greek derivation (chyma, “ingot” or “pour”), while the Egyptian black-land derivation remains an older alternative.',
    alternatives: [
      { name: 'Chemeia derives from Egyptian kmt, “black land”', status: 'E5', text: 'Old and still repeated, but Lindsay (1970) finds it philologically weak and the dictionary and reference sources opened prefer a Greek route; Budge and the folk-etymology warning are known here only second-hand.' },
      { name: 'Named after an inventor “Chymes” or a book called chema', status: 'E7', text: 'An ancient tradition reported by Zosimos; the dictionary treats it as a story and a derivation from χύμα as more probable.' },
    ],
    for: ['Plutarch’s own attestation that Egypt was called Chemia', 'Lindsay allows that practitioners may have heard an echo of the name'],
    against: ['Plutarch says nothing about metals or transmutation', 'Lindsay: “not much to be said” philologically for the Black Art reading', 'Dictionary and reference sources give a Greek metallurgical derivation'],
    unresolved: ['Earliest datable use of chemeia', 'Oxford English Dictionary and Newman–Principe (1998) were not opened'],
    predictions: ['An earlier use of chemeia in a metal-working context would favour the Greek route'],
    lines: ['philology', 'textual attestation'],
    sources: ['f_plutarch_loeb', 'f_lindsay1970', 'f_regal2009', 'f_wiktionary_chymeia', 'f_wiki_etym_chem', 'f_wiki_zosimos', 'w_alchemy'],
  }),
  entry({
    id: 'graeco-egyptian-alchemy', title: 'Graeco-Egyptian recipe books and Zosimos of Panopolis', cat: 'text', priority: 'P1',
    place: 'Egypt (Thebes and Panopolis, Greek-writing workshops)', lat: 26.55, lon: 31.7, geoKind: 'region', geoNote: 'Leiden X was found at Thebes; Zosimos is called “of Panopolis”. The point is approximate (Akhmim).',
    start: 250, end: 400, dateKind: 'estimated', dateConfidence: 'medium',
    datingMethod: 'Palaeography and context as reported by editors and later scholars; no radiometric date',
    ev: 'E1', interp: 'E2',
    summary: 'The Leiden and Stockholm papyri are Greek recipe books on metals, dyes and fake gems written in third- or fourth-century Egypt. Zosimos of Panopolis (c. 300 CE) adds apparatus and allegory. The earliest dated alchemical texts opened here are from Roman Egypt.',
    textual: ['Leiden papyrus X: 111 recipes, presented in an exclusively practical way', 'Stockholm papyrus: a collection of chemical recipes', 'Zosimos’s Final Account: the divine art was revealed to priests only'],
    mainstream: 'A craft tradition of colouring and imitating metals, rooted in artisanal practice, that acquired theory in Roman Egypt (Grimes, via Werrett).',
    alternatives: [{ name: 'Alchemy descends from a pharaonic priestly science, as Zosimos claimed', status: 'E7', text: 'Rests on Zosimos’s own assertion and on hedged modern conjecture (Taylor 1930: “arising perhaps in the traditional knowledge of the Egyptian priesthood”); the sources opened give no alchemical text earlier than the first to third century CE, and an encyclopedia states there is little to no evidence (untraced).' }],
    for: ['Two papyri with hundreds of recipes dated to the third or fourth century', 'Zosimos’s own claims of priestly origin show how his tradition understood itself'],
    against: ['Leiden X is purely practical and contains no alchemical theory', 'The earliest dated texts are Roman-era', 'Zosimos’s claim of pharaonic origin is untested by any earlier document opened'],
    unresolved: ['Whether Zosimos worked in a temple workshop (Werrett calls it a hypothesis; no direct evidence he visited Dendera)', 'Dating of Pseudo-Democritus beyond a first–third century range', 'Modern editions (Halleux 1981, Mertens 1995, Caley) were not opened'],
    predictions: ['A securely dated Ptolemaic or earlier text on tincturing or transmutation would overturn the Roman-era starting point'],
    culture: 'Roman Egypt', lines: ['papyrology', 'textual criticism'],
    sources: ['f_lagercrantz1913', 'f_berthelot1887', 'f_berthelot1888', 'g_martelli2020', 'g_werrett2024', 'f_wiki_leyden', 'w_alchemy', 'g_bentick2020', 'g_taylor1930'],
  }),
  entry({
    id: 'alchemy-to-chymistry', title: 'From Graeco-Egyptian chemeia to Arabic al-kimiya, Latin alchemia and chymistry', cat: 'text', priority: 'P2',
    place: 'Alexandria, Baghdad and Latin Europe (route)', lat: 33.31, lon: 44.37, geoKind: 'narrative', geoNote: 'A transmission route; Baghdad stands for the Arabic-language milieu.',
    start: 750, end: 1700, dateKind: 'estimated', dateConfidence: 'low',
    ev: 'E3', interp: 'E3',
    summary: 'Scholars describe a genealogy running from Greco-Egyptian chemeia through Arabic al-kimiya and Latin alchemia to early modern “chymistry”, with a documented Latin translation of 1144. The sources opened here are mostly publisher descriptions and encyclopedia pages, so the chain is attested but not yet checked against the scholarship.',
    textual: ['Liber de compositione alchemiae, Latin translation completed 11 February 1144', 'Emerald Tablet compiled in Arabic in the late 8th or early 9th century', 'Newton’s occult studies were largely his study of alchemy'],
    mainstream: 'Alchemy and early chemistry were one practice (“chymistry”) in the early modern period (Newman and Principe); modern chemistry grew from it by documented stages, not from a pharaonic science.',
    alternatives: [{ name: 'Modern chemistry is simply ancient Egyptian science', status: 'E7', text: 'Not supported by the sources opened: the Emerald Tablet is Arabic-era, the Hermetica Roman-era, and the dated alchemical texts Roman Egypt. The only sceptical item opened (on the Stolen Legacy thesis) is an analogue, not a chemistry-specific rebuttal.' }],
    for: ['A dated Latin translation from Arabic (1144)', 'Overlap reported between al-Razi’s operations and Alexandrian alchemists', 'Principe’s own chain: Greco-Egyptian chemeia, Arabic, Latin, chymistry'],
    against: ['The pharaonic link has no dated text behind it in the sources opened', 'The Emerald Tablet, often called ancient, is first attested in Arabic', 'Popular “Egyptian origin” claims are matched in other fields by pseudohistory (Stolen Legacy analogue)'],
    unresolved: ['Rhazes and Jabir corpus authorship (Kraus, Haq not opened)', 'Byzantine manuscript collections', 'Boyle’s own texts and Lavoisier were not covered', 'Whether Egyptian priests had a hand in the Hermetica (Bull 2018, via a secondary page)'],
    predictions: ['Manuscript stemmata linking the Greek collections to Arabic translations would fix the chain text by text'],
    culture: 'Late antique, Islamic and Latin traditions', lines: ['textual transmission', 'historiography'],
    sources: ['f_chicago_newman2006', 'f_chicago_np2002', 'f_chicago_principe2013', 'f_wiki_robert', 'f_wiki_islamic_alch', 'f_wiki_emerald', 'f_wiki_hermetica', 'f_wiki_newton_occult', 'f_wiki_james'],
  }),
];

export const EVENTS_F = [];
export const MIGRATIONS_F = [];

export const LINKS_F: Link[] = [
  { a: 'kemet-chemical-crafts', b: 'graeco-egyptian-alchemy', rel: 'potentially_influenced', conf: 'low', note: 'Grimes (via Werrett) describes early Greco-Egyptian alchemy as a craft rooted in older artisanal metal-colouring traditions, and Martelli ties the papyri to workshop practice. The step from pharaonic craft to the Roman-era recipes is not documented by any dated text opened.', src: ['g_werrett2024', 'g_martelli2020'] },
  { a: 'chemia-egypt-name', b: 'graeco-egyptian-alchemy', rel: 'geographically_associated_with', conf: 'low', note: 'Both concern Egypt in the Roman period; the name Chemia for the country is attested by Plutarch, and whether it names the art is the open question.', src: ['f_plutarch_loeb', 'f_lindsay1970'] },
  { a: 'alchemy-to-chymistry', b: 'graeco-egyptian-alchemy', rel: 'derived_from', conf: 'medium', note: 'A scholar’s genealogy begins with Greco-Egyptian chemeia, and al-Razi’s operations are reported to overlap with Alexandrian alchemists; the text-by-text chain was not checked.', src: ['f_chicago_principe2013', 'f_wiki_islamic_alch'] },
  { a: 'emerald-tablet', b: 'graeco-egyptian-alchemy', rel: 'postdates', conf: 'medium', note: 'The Emerald Tablet is first attested in Arabic in the 8th–9th century, partly from earlier Greek or Syriac material, so it follows the Roman-Egyptian recipe tradition and is not pharaonic.', src: ['f_wiki_emerald'] },
  { a: 'emerald-tablet', b: 'kemet-chemical-crafts', rel: 'contradicts', conf: 'medium', note: 'The tablet’s earliest attestation is Arabic, so it cannot be offered as an inscription or text of pharaonic chemistry.', src: ['f_wiki_emerald'] },
];

type Opt = Omit<HypothesisOption, 'id'> & { id: string };
const o = (id: string, name: string, status: Status, description: string, p: Partial<HypothesisOption> & { sources: string[] }): Opt =>
  ({ id, name, status, description, supports: [], contradicts: [], assumptions: [], predictions: [], weaknesses: [], falsifiers: [], ...p });

export const QUESTIONS_F: Question[] = [
  {
    id: 'q-khemet-alchemy',
    question: 'Did alchemy and chemistry originate in pharaonic Egypt (Khemet)?',
    context: 'Pharaonic Egypt had sophisticated chemical crafts, and the Greek word chemeia may echo its name. Whether that makes Egypt the source of alchemy, and so of chemistry, depends on dated texts and on the chain of transmission.',
    history: [{ date: '2026-11-16', note: 'First sourced by RDADA from opened and verified passages; statuses are the editor’s reading of those passages.' }],
    options: [
      o('h-craft-then-roman-alchemy', 'Pharaonic craft chemistry; alchemy as a written tradition formed in Roman Egypt', 'E2', 'Egyptian crafts supply the practical background; the first dated alchemical texts are Greek recipe books and Zosimos of the third and fourth centuries CE.', {
        supports: ['Analyses of Egyptian glass, balms and kohls', 'Leiden and Stockholm papyri dated to the third or fourth century', 'Werrett (quoting Grimes): a craft rooted in artisanal metal-colouring'],
        contradicts: ['Zosimos’s claim of a priestly origin, if it rests on lost older texts'],
        assumptions: ['No older alchemical text exists among the sources opened'],
        predictions: ['No securely dated pre-Roman text on tincturing or transmutation will be found'],
        weaknesses: ['The sources opened do not include modern editions (Halleux, Mertens) or an Egyptologist’s own statement'],
        falsifiers: ['A securely dated Ptolemaic or pharaonic alchemical text'],
        sources: ['f_buckley2001', 'f_riesmeier2022', 'g_jackson2023', 'g_martelli2020', 'g_werrett2024', 'f_berthelot1887'], entries: ['kemet-chemical-crafts', 'graeco-egyptian-alchemy'],
      }),
      o('h-pharaonic-alchemy', 'Alchemy as a priestly science of pharaonic Egypt', 'E7', 'Alchemy existed as a theoretical or priestly tradition in pharaonic Egypt, as Zosimos asserted around 300 CE.', {
        supports: ['Zosimos’s own statement that the art was revealed to priests only'],
        contradicts: ['No alchemical text earlier than the Roman period in the sources opened', 'The Emerald Tablet is Arabic-era and the Hermetica Roman-era'],
        assumptions: ['Lost earlier texts existed and were known to Zosimos'],
        predictions: ['Earlier alchemical papyri or temple inscriptions'],
        weaknesses: ['Rests on a claim made centuries after the period it describes'],
        falsifiers: ['Continued absence of such texts'],
        sources: ['f_berthelot1888', 'w_alchemy', 'f_wiki_emerald', 'f_wiki_hermetica'], entries: ['graeco-egyptian-alchemy', 'emerald-tablet'],
      }),
      o('h-chemistry-is-egyptian', 'Modern chemistry is simply Egyptian science', 'E7', 'Modern chemistry descends directly and almost wholly from pharaonic knowledge.', {
        supports: ['Egyptian crafts were chemically sophisticated', 'The Egyptian-origin etymology of chemistry is widely repeated'],
        contradicts: ['The documented transmission runs through Arabic and Latin translation and early modern chymistry', 'The Greek-derivation etymology is preferred by the sources opened'],
        assumptions: ['Craft know-how equals a transmitted science'],
        predictions: ['A documented pharaonic-to-modern chain'],
        weaknesses: ['No such chain is documented in the sources opened; the Stolen Legacy analogue is judged pseudohistory'],
        falsifiers: ['The Latin and Arabic transmission record, already documented'],
        sources: ['f_chicago_principe2013', 'f_wiki_robert', 'f_wiki_james'], entries: ['alchemy-to-chymistry'],
      }),
    ],
  },
  {
    id: 'q-chemia-etymology',
    question: 'Where does the word “chemistry” come from?',
    context: 'Chemeia is attested in Roman Egypt. Plutarch also reports Chemia as a name for Egypt. The Greek route (a word for casting metal) and the Egyptian route (“black land”) are both argued.',
    history: [{ date: '2026-11-16', note: 'First sourced by RDADA; no opened source declares a winner.' }],
    options: [
      o('h-greek-chyma', 'From Greek chyma, “cast metal”', 'E3', 'Chemeia is formed from Greek χύμα (ingot, fluid) plus -εία, a metalworking term.', {
        supports: ['Dictionary: “more probably” χύμα + -εία', 'Reference work: derived from the word for smelting', 'Lindsay: Greek evidence from inscriptions'],
        contradicts: ['Plutarch’s Chemia for Egypt, if the echo is deliberate'],
        assumptions: [],
        predictions: ['Early metalworking uses of chyma or chemeia'],
        weaknesses: ['Several sources opened are tertiary; Diels is second-hand'],
        falsifiers: ['An earlier Egyptian-language source for the word'],
        sources: ['f_wiktionary_chymeia', 'f_regal2009', 'f_lindsay1970', 'w_alchemy'], entries: ['chemia-egypt-name'],
      }),
      o('h-egyptian-kmt', 'From Egyptian kmt, “black land”', 'E5', 'Chemeia is the “Egyptian art”, from the native name of Egypt.', {
        supports: ['Plutarch: Egypt is called Chemia', 'Zosimos ties the art to Egypt'],
        contradicts: ['Lindsay: “not much to be said” philologically', 'A folk-etymology warning (Mahn, second-hand)'],
        assumptions: ['The Greek word borrowed the name of the country for the art'],
        predictions: ['An early source calling the art “Egyptian”'],
        weaknesses: ['Plutarch’s text concerns the country, not the art'],
        falsifiers: ['A firmly Greek formation with no Egyptian input'],
        sources: ['f_plutarch_loeb', 'f_lindsay1970', 'f_wiki_etym_chem'], entries: ['chemia-egypt-name'],
      }),
      o('h-inventor-chymes', 'Named after an inventor “Chymes” or a book “chema”', 'E7', 'An ancient tradition in Zosimos explains the name by a founder or a book.', {
        supports: ['Zosimos, via Syncellus'],
        contradicts: ['Dictionary treats it as a story and prefers χύμα'],
        assumptions: [],
        predictions: [],
        weaknesses: ['A late etiology of the sort ancient authors often invented'],
        falsifiers: ['Any independent attestation of a person or book of that name'],
        sources: ['f_wiki_zosimos', 'f_wiktionary_chymeia'], entries: ['chemia-egypt-name'],
      }),
    ],
  },
];
