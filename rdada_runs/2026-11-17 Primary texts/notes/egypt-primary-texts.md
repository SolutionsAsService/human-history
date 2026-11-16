# egypt-primary-texts: Egyptian primary texts that threads depend on

## Ask
Quote the Egyptian primary texts that threads depend on: the Instruction of Amenemope (chapters 1-3, 9-10 compared by scholars with Proverbs), the Great Hymn to the Aten (Amarna, c. 1350 BCE), the Rosetta Stone and Canopus Decree (Egyptian hieroglyphic, Demotic and Greek in one text), a Pyramid Text spell, and the Memphite Theology; and any Egyptian text describing a chemical or technical process (for example the Ebers papyrus recipes). Give composition range with basis, material witness (stone, papyrus, museum number) and the edition or translation read.

18 candidates in `egypt-primary-texts.candidates.json`. Every quote was machine-checked against its page with `check_quote.py` logic before being written (0 unverified). The validator's "no verifier marker" message is expected: that field is added by the verifier stage.

## Cited findings
- Amenemope, ch. 1 "Give your ears, hear the sayings, give your heart to understand them" (cf. Prov 22:17) — [van den Dungen translation](https://maat.sofiatopia.org/amen_em_apt.htm)
- Amenemope ch. 2 "Beware of robbing a poor wretch", ch. 3/9 "heated man", ch. 6 "Do not move the markers on the borders of fields", ch. 30 "Look to these thirty chapters" — same page. Proverbs side: [Prov 22:28-29, JPS via Sefaria](https://www.sefaria.org/api/texts/Proverbs_22:28-29?context=0&commentary=0)
- Amenemope witness: papyrus BM 10474, hieratic 950-650 BCE; Cairo ostracon (Cerny) late XXIst/early XXIInd Dynasty; composition "before 1,000 B.C." — [Ruffle, Tyndale Bulletin (1975 lecture)](https://tyndalebulletin.org/article/30616.pdf), doi 10.53751/001c.30616
- Great Hymn to the Aten, night strophe ("Every lion cometh forth from his den") — [Breasted 1912](https://archive.org/stream/developmentofrel00brea/developmentofrel00brea_djvu.txt); Psalm 104:20 "when all the beasts of the forests stir" — [Sefaria JPS](https://www.sefaria.org/api/texts/Psalms_104:20-24?context=0&commentary=0)
- Rosetta decree orders itself cut "in the writing of the divine words, and in the writing of the books, and in the writing of the Greeks" — [Budge 1904 vol. II](https://archive.org/download/the-decrees-of-memphis-and-canopus-in-three-volumes.-the-rosetta-stone.-vol-ii-1904/The%20decrees%20of%20Memphis%20and%20Canopus%20in%20three%20volumes.%20The%20Rosetta%20Stone.%20Vol%20II%20%281904%29_djvu.txt)
- Canopus decree, same clause, "in the writing of the House of Life ... of the books ... of the Greeks" — [Budge 1904 vol. III](https://archive.org/stream/decreesofmemphis03budg/decreesofmemphis03budg_djvu.txt)
- Pyramid Text sun-hymn, Pyr. §1479 "Hail to thee, Atum! Hail to thee, Kheprer!" — Breasted 1912 (same scan as above)
- Memphite Theology "Every divine word came into existence by the thought of the heart and the commandment of the tongue" — Breasted 1912 (same scan)
- Ebers (Bryan 1930 extract): "Honey 1 Put in Fresh Milk and then apply to the Eyes" — [archive.org](https://archive.org/download/ANCIENTEGYPTIANMEDICINETHEPAPYRUSEBERS/ANCIENT%20EGYPTIAN%20MEDICINE%20THE%20PAPYRUS%20EBERS_djvu.txt)

Dating and museum-number facts NOT taken from a scholarly page I opened came from Wikipedia raw text and are labelled as such in each `composition.basis`: Rosetta 196 BCE and "EA 24", Canopus 238 BCE and Tanis find, Ebers c. 1550 BCE (Leipzig), Great Hymn "middle of the 14th century BC" and the tomb of Ay, Pyramid Texts "late Old Kingdom", Shabaka Stone dating dispute. Treat these as pointers to be replaced by Lichtheim, Allen, Bodine and similar.

## Sceptical and alternative pass
- Amenemope/Proverbs: Ruffle (a sceptical but not neutral voice; he defends a Solomonic compiler) doubts "a direct connection", notes that Amenemope's central contrast of the hothead and the quiet man is absent from Proverbs, and that some parallels only "work" across large gaps. He still allows a cumulative case (about 11 of 24 verses). The Hebrew of Prov 22:20 is uncertain (JPS "threefold lore"), so "thirty" is an emendation. Directness is set to `debated`.
- Aten/Psalm 104: Koller (supports a link, says it "has been debated endlessly"); Lichtheim's rejection ("A specific literary interdependence is not probable") is quoted only second-hand through Wikipedia, so it is flagged as such. Mark S. Smith's note that enthusiasm has been "tempered" is also second-hand and not recorded. Weigall 1911 (Gutenberg) returned a 683-byte page and was not opened.
- Memphite Theology: Breasted's Old Kingdom dating is overturned by Junge and most later scholars (25th Dynasty); the candidate range is deliberately the later span.
- Ebers: Bryan's own text mixes remedies with spells, so it is a pharmacy/magic text, not a chemical-process manual. No text describing a chemical process (dyeing, metals, glass) was found from an opened source.
- Rosetta/Canopus: no scepticism sought beyond the 1904 vs modern identification of the stone's rock (basalt vs granodiorite).

## Gaps
- Thesaurus Linguae Aegyptiae (thesaurus-linguae-aegyptiae.de): bot-verification page, NOT opened.
- sacred-texts.com (Pyramid Texts, Mercer): HTTP 403. British Museum collection page (Rosetta EA 24, BM 498, BM 10474): HTTP 403. Livius Rosetta page: 404. web.archive.org JSSEA PDF (Hoffmeier on the Aten hymn): proxy tunnel closed. Gutenberg Weigall: 683-byte page. Wikisource Hymn to the Aten: 404. Dawn of Conscience scan (archive.org dawnofconscience00brea): lending stub, no text.
- Recalled, not fetched: Griffith, JEA 12 (1926) 191-231 (Amenemope translation); Lichtheim, Ancient Egyptian Literature II (2006) p. 100 (first-hand); Bodine 2009 on the Shabaka Stone; Dion 1991 and Day 2016 on Psalm 104; Brunet 1949; Grumach 1972; Budge 1923 hieratic facsimile.
- Not covered: Canopus Greek and hieroglyphic text read directly (only Budge's English); Cairo museum number for the Canopus stele; any modern edition (Allen, Faulkner, Lichtheim) of the Pyramid Texts, Memphite Theology or Aten hymn; a chemical or technical process text other than the Ebers eye remedies (e.g. Leiden/Stockholm papyri, glass or dye recipes) not found; the Ebers extract on archive.org is only about 15 KB (eye chapter), and its date and Leipzig location are from Wikipedia.
- Breasted 1912 and Budge 1904 translations are old and OCR-based; the quoted wording is the scan's, not a modern edition's.
