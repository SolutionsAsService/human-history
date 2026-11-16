# bible-near-east-parallels: Hebrew Bible passages and the Near Eastern texts compared with them

## Ask
Quote the Hebrew Bible passages and the Near Eastern texts that scholars compare with them, each from an edition opened: Genesis 6-9 with Atrahasis (tablet III) and Gilgamesh XI; Genesis 1-2 with Enuma Elish; Exodus 2:1-10 with the Sargon birth legend; Proverbs 22:17-24:22 with the Instruction of Amenemope; Psalm 104 with the Great Hymn to the Aten; Exodus 21-23 with the Code of Hammurabi. For each pair: what the passages share and where they differ, the composition range and basis, and the strongest scholarly caution.

32 candidates in `bible-near-east-parallels.candidates.json` (20 primary passages, 12 secondary/skeptical). Every quote was confirmed with the `check_quote.py` normaliser against the cited URL by script before it was written (all 32 pass, all 25 words or fewer). `validate_candidates.py` reports only the expected "no verifier marker" errors (the verifier stage has not run).

## Cited findings

### Genesis 6-9 / Atrahasis III / Gilgamesh XI
- Gen 6:14 ark "with compartments ... cover it inside and out with pitch"; 8:11 dove with olive leaf; 8:21 God "smelled the pleasing odor". — [Sefaria API, JPS Gender-Sensitive](https://www.sefaria.org/api/texts/Genesis_8%3A21?context=0&commentary=0)
- Atrahasis OB III (Sippar): Enki to the hero, "Depart from (your) house, build a boat! Spurn property and save life!" and after the flood "[The gods sniffed] the scent, they grouped [like flies] over the offering." — [SEAL no. 1517](https://seal.huji.ac.il/node/1517)
- Gilgamesh XI (Rogers 1912): dove sent, "there was no resting place and she returned"; "The gods smelt the sweet savor, The gods gathered like flies over the sacrificer." — [Rogers, Cuneiform Parallels (archive.org)](https://archive.org/stream/cuneiformparalle00roge/cuneiformparalle00roge_djvu.txt)
- Shared: divine warning, a built vessel sealed with pitch/bitumen, birds sent, post-flood sacrifice smelled by the deity. Different: Genesis has one God, a moral cause (human wickedness) and a covenant; Atrahasis has divine rivalry and human "noise", famished gods swarming the offering, and no bird episode in the Old Babylonian text opened; Gilgamesh has dove-swallow-raven vs Genesis raven/dove. Battenfield lists the same similarities and differences line by line. — [Battenfield, GTJ 12.2 (1971)](https://biblicalelearning.org/wp-content/uploads/2022/01/Battenfield-Atra-Hasis-GTJ.pdf)
- Dating: Atrahasis archetype "perhaps as early as ca. 1800 B. C.", Ku-Aya's Old Babylonian copy c. 1630 BCE (Battenfield, citing Lambert and Millard); Gilgamesh Standard Babylonian version compiled by Sin-leqi-unninni, c. 1300-1000 BCE, copies from Ashurbanipal's library; Genesis flood in P and J layers, book c. 5th c. BCE (some say 3rd for chs. 1-11). — [Wikipedia: Epic of Gilgamesh](https://en.wikipedia.org/wiki/Epic_of_Gilgamesh); [Wikipedia: Genesis flood narrative](https://en.wikipedia.org/wiki/Genesis_flood_narrative)

### Genesis 1-2 / Enuma Elish
- Gen 1:6 "Let there be an expanse in the midst of the water, that it may separate water from water." — Sefaria JPS.
- Enuma Elish I "When above the heaven was not named, And beneath the earth bore no name"; IV "He split her open like a flat (?) fish into two halves;" (one half becomes heaven's covering). — Rogers 1912 (link above).
- Shared: primeval waters, a vault dividing waters above and below. Different: Genesis has no theogony and no theomachy ("no trace of the resistance to the reduction of chaos to order"), creation by speech, one God. — [Wikipedia: Genesis creation narrative](https://en.wikipedia.org/wiki/Genesis_creation_narrative)
- Dating: Enuma Elish was once placed under Hammurabi, most scholars now accept the Second Dynasty of Isin; earliest manuscript from Assur, 9th c. BCE. — [Wikipedia: Enuma Elish](https://en.wikipedia.org/wiki/Enuma_Elish). Genesis 1 is Priestly, possibly 6th c. BCE (creation-narrative page).

### Exodus 2:1-10 / Sargon legend
- Ex 2:3 "she got a wicker basket for him and caulked it with bitumen and pitch"; Sargon: "She set me in a basket of rushes, with bitumen she closed my door; She cast me into the river, which rose not over me." — Sefaria; Rogers 1912.
- Shared: hidden birth, bitumen-sealed reed basket on a river, rescue and adoption. Different: Moses' mother acts to save him and his sister watches; Sargon is a priestess's secret child, first-person narrator, becomes a gardener then king.
- Alternative claim: a Cambridge Open Engage preprint argues direct adaptation from the Akkadian text, composed "most likely" late 8th c. BC, and states the common view as shared diffusion of motifs. — [A Case for Babylonian Moses](https://www.cambridge.org/engage/coe/article-details/690d26f3113cc7cfffa5cec5) (not peer reviewed).

### Proverbs 22:17-24:22 / Amenemope
- Prov 22:28 "Do not remove the ancient boundary stone"; Amenemope ch. 6 "Do not move the markers on the borders of fields, Nor shift the position of the measuring-cord."; ch. 30 "Look to these thirty chapters, They inform, they educate". — Sefaria; [Lichtheim, AEL vol. II (archive.org)](https://archive.org/stream/Miriam_Lichtheim_Ancient_Egyptian_Literature_Vol_I_II_III_2006/Miriam_Lichtheim_Ancient_Egyptian_Literature_Vol_I_II_III_2006_djvu.txt)
- Lichtheim: composition "usually assigned to the Ramesside period"; "It can hardly be doubted that the author of Proverbs was acquainted with the Egyptian work and borrowed from it"; consensus since Erman, though some argue the reverse or a lost Semitic original.
- Strongest caution: Ruffle, "some doubt about the existence of a direct connection between Proverbs and Amenemope"; the "thirty" rests on Erman's emendation of Prov 22:20; key Amenemope themes absent from Proverbs. — [Ruffle, Tyndale lecture 1975](https://tyndalebulletin.org/article/30616.pdf), DOI 10.53751/001c.30616.
- Shared: boundary-marker ban with widow/orphan protection and divine retribution. Different: Proverbs is a line or two in a different order; Amenemope develops it in a chapter with the Moon (Thoth) as judge.

### Psalm 104 / Great Hymn to the Aten
- Ps 104:21 "The lions roar for prey"; Aten hymn "Every lion comes from its den, All the serpents bite;". — Sefaria; Lichtheim (translation of the tomb-of-Ay text).
- Shared: night/day sequence with lions, work at dawn, ships and sea creatures. Different: sun and moon are creations marking seasons in the Psalm; the lions seek food from God; the Aten is the single sun-disk and night is its absence.
- Strongest caution: Lichtheim, note 3, "A specific literary interdependence is not probable" (generic similarity of hymns). Mark S. Smith (via Wikipedia): enthusiasm "for even indirect influence has been tempered"; Assmann and Redford still argue for influence. — [Wikipedia: Psalm 104](https://en.wikipedia.org/wiki/Psalm_104)
- Dating: hymn under Akhenaten, c. 1353-1336 BCE, in the tomb of Ay at Amarna (Bouriant copy 1883-84; van den Dungen page and Wikipedia "14th century BC"). No dating source for Psalm 104 itself was opened.

### Exodus 21-23 / Code of Hammurabi
- Ex 21:29 known-goring ox "though warned, has failed to guard it"; Hammurabi 251 "If a man's bull have been wont to gore and they have made known to him his habit of goring"; Ex 21:24 "eye for eye, tooth for tooth"; Hammurabi 196 "If a man destroy the eye of another man, they shall destroy his eye." — Sefaria; [Wikisource, Harper 1904](https://en.wikisource.org/wiki/The_Code_of_Hammurabi_(Harper_translation))
- Shared: distinction between first and warned-goring ox; equal-injury principle. Different: silver fines (half mana, 251; one-third, 252) vs capital liability or ransom and stoning the ox; Hammurabi differentiates by class (198-199 silver for commoner or slave).
- Dating: Code composed c. 1753 BCE (Wikipedia: Code of Hammurabi, Louvre stele from Susa). Covenant Code date "continues to be debated" (Wikipedia: Covenant Code).
- Strongest dissent in each direction: Wright argues the Covenant Code depends "directly and primarily" on Hammurabi, used 740-640 BCE; the synopsis states most scholars attribute similarities to oral tradition. — [Wright, Inventing God's Law (publisher synopsis)](https://www.abebooks.com/products/isbn/9780199974955). Carol Meyers (reverse direction for Ex 34) and Coogan (difference) appear only as second-hand mentions in the search result and Wikipedia and were not recorded as candidates.

## Sceptical and alternative pass
- Amenemope/Proverbs: Ruffle (skeptical), Lichtheim (consensus with caveats). The WebSearch summaries mention Whybray, Emerton, Shupak and Grumach (common-source) but I opened none of them: recalled, not fetched.
- Psalm 104/Aten: Lichtheim's note and Smith/Assmann/Redford via Wikipedia. Breasted's original claim not opened.
- Exodus 2/Sargon: preprint (alternative, minority); the common-diffusion view is stated only inside that abstract. No peer-reviewed sceptical piece opened (Westenholz's 1984 JNES review of Lewis, and Lewis's own book, are leads only).
- Covenant Code: Wright (publisher synopsis) vs the oral-tradition majority described there. No independent critique opened (see Gaps).
- Flood and creation: Battenfield is confessional and is flagged as such; Wikipedia pages are encyclopaedia summaries used for dating bands and consensus statements only.
- Direction of influence is disputed or unproven in every pair; every strand object is `debated` except the flood narrative (`inferred`). Nothing here is `documented`.

## Gaps
- Hosts failed or refused: sacred-texts.com (Cloudflare 403, not opened); gutenberg.org (503 maintenance); publikationen.uni-tuebingen.de (Markl, Covenant Code PDF; connection reset); soas-repository.worktribe.com (403); schweitzer-online.de (429); Livius Sargon legend URL guessed wrongly (404); Wikipedia returned 429 intermittently (for Enuma Elish and Genesis creation narrative the quote check used the copy fetched earlier in the session; Aten hymn and Atra-Hasis Wikipedia pages not retrieved).
- archive.org items with no text (lending only): Lambert and Millard, Atra-hasis 1969; Heidel, Gilgamesh Epic and OT Parallels and Babylonian Genesis; Pritchard ANET. So Atrahasis is quoted from SEAL (Wasserman 2020 edition), not Lambert-Millard.
- Atrahasis Tablet III: the Old Babylonian Sippar text on SEAL has no bird episode and the ark's landing is lost; Atrahasis I (the "noise" motive) and the Assyrian recension were not quoted.
- Gilgamesh XI is quoted in a 1912 translation (Rogers); George (2003) and the cuneiform editions on ORACC/CDLI were not opened. Dating of Gilgamesh, Enuma Elish and Genesis rests on Wikipedia summaries of scholarship, not on George, Lambert or a Pentateuch introduction. The Enuma Elish composition band in the candidates (1155-1000 BCE) is my gloss of "Second Dynasty of Isin" and is flagged for verification.
- No dating source opened for Proverbs 22:17-24:22, Psalm 104 or the Covenant Code (composition null with basis stated). Earliest Hebrew manuscript witnesses not opened (Dead Sea Scrolls, Aleppo Codex), so none asserted.
- Sargon legend: no scholarly date opened; tablet provenance not checked against a museum record. Hebrew text itself was not quoted (English JPS only); `fetch_text.py ... --lang he` available for a follow-up.
- Hammurabi is the Harper 1904 translation on Wikisource, not Roth 1995 or an ORACC/CDLI edition. Exodus 22:1-2 and Hammurabi 21 (house-breaking), and Ex 21:2-6 with Hammurabi 117 (debt-slavery, three years vs six), were fetched but not recorded as candidates.
- Genesis 2 / Atrahasis creation of man not quoted.
