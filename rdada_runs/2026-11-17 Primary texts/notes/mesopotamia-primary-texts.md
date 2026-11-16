# mesopotamia-primary-texts: Mesopotamian primary texts and the evidence they travelled

Run date 2026-11-17. 24 candidates in `mesopotamia-primary-texts.candidates.json`. Every quote was confirmed on its page with `check_quote.py` before it was recorded. The validator reports only the "no verifier marker" error on each candidate, which is the verifier's job to add.

## Ask
"Quote the cuneiform primary texts and translations: Enuma Elish tablet I, Atrahasis tablet III (flood), Gilgamesh XI (flood), the Code of Hammurabi prologue and some laws, the Sumerian King List; and the evidence that Mesopotamian literature travelled: Gilgamesh fragments found at Hattusa (Hittite and Hurrian versions) and Megiddo, and the Amarna letters (Akkadian diplomatic correspondence between Egypt, Mitanni, Hatti, Babylon and Levantine rulers, c. 1360 BCE)." Plus composition ranges with basis, earliest witness and find-spot, and the edition read.

## Cited findings
Composition, earliest witness and edition are kept apart in each candidate's `text` object.

- Enuma Elish I, ll. 1-9 ("When in the height heaven was not named ... Their waters were mingled together"): King's 1902 translation, read from the Internet Archive full text — [King 1902](https://archive.org/download/the-seven-tablets-of-creation.-vol.-1/The%20seven%20tablets%20of%20creation.%20Vol.%201_djvu.txt). Composition is disputed (see the sceptical pass); earliest manuscript Assur, 9th c. BCE, per [Wikipedia](https://en.wikipedia.org/wiki/En%C5%ABma_Eli%C5%A1).
- Atrahasis: Enki's warning ("forsake possessions, and save life", I.c) and the deluge (III.iii, "one person did not see another"), from Livius's Foster-adapted translation — [Livius](https://www.livius.org/articles/misc/great-flood/flood3_t-arahasis/). The three-tablet Old Babylonian copy is of Ammi-saduqa (c. 1647-1626 BCE). Composition 18th c. BCE per [Wikipedia, Atra-Hasis](https://en.wikipedia.org/wiki/Atra-Hasis).
- Gilgamesh XI, Ea's warning to the reed-hut ("Wall, wall! Hearken, O Reed-hut") and the dove, swallow and raven: [Thompson 1928](https://archive.org/download/thompson-1928-gilgamesh/Thompson_1928_Gilgamesh_djvu.txt). Standard Babylonian version 13th-10th c. BCE per [Wikipedia](https://en.wikipedia.org/wiki/Epic_of_Gilgamesh); Nineveh editions are 7th c. BCE per Thompson's preface.
- Flood relationship: Livius tabulates 32 parallels among the Eridu Genesis, Atrahasis, Gilgamesh, Genesis and Berossus — [Livius](https://www.livius.org/articles/misc/great-flood/flood6-parallels/). The Eridu Genesis (Ziusudra) is at [Livius](https://www.livius.org/articles/misc/great-flood/flood2-t/).
- Sumerian King List, ETCSL translation: antediluvian kings and "Then the flood swept over", and Gilgamec lord of Kulaba, 126 years — [ETCSL](https://etcsl.orinst.ox.ac.uk/section2/tr211.htm). Oldest version Ur III (c. 2112-2004 BCE), the Ur III copy under Shulgi — [Wikipedia](https://en.wikipedia.org/wiki/Sumerian_King_List).
- Code of Hammurabi: prologue ("to cause justice to prevail in the land"), Laws 1-2, Laws 196-199 in Harper's 1904 translation — [Wikisource, Harper](https://en.wikisource.org/wiki/The_Code_of_Hammurabi_(Harper_translation)). Reign c. 1792-c. 1750 BCE; stele rediscovered at Susa in 1901 — [Wikipedia](https://en.wikipedia.org/wiki/Code_of_Hammurabi).
- Gilgamesh at Hattusa: Beckman's register gives find-spots (Akkadian: Temple 16 and Buyukkale H; Hurrian: Temple 1 and Buyukkaya; Hittite: Temple 1, Unterstadt, Buyukkale K, Haus am Hang; about half "unknown"), and his summary says Hattusa has yielded more Gilgamesh sources than all other Late Bronze Age sites combined — [Beckman 2019, publisher's sample](https://lockwoodpressonline.com/index.php/ebooks/catalog/download/10/17/3171?inline=1). The same register lists an Akkadian Atrahasis (KBo 36.26) and four Hittite Atrahasis manuscripts, so more than one Mesopotamian epic reached Hatti.
- Gilgamesh at Megiddo: CDLI record P273198, IAA 1955-0002, "excavated in Uncertain (mod. Megiddo)", Middle Babylonian — [CDLI](https://cdli.earth/artifacts/273198). Found "in the 1950s on the surface at Megiddo", and petrography/NAA show it "was not Mesopotamian, but was written in southern Israel" — [Goren et al. 2009 abstract](https://cris.tau.ac.il/en/publications/a-provenance-study-of-the-gilgamesh-fragment-from-megiddo/), DOI 10.1111/j.1475-4754.2008.00437.x.
- Amarna: archive in Akkadian, "the regional language of diplomacy for this period", found c. 1887; Kadashman-Enlil letters anchor the mid-14th c. BCE; the archive also holds Mesopotamian myths (EA 356 Adapa, EA 357 Nergal and Ereshkigal) — [Wikipedia](https://en.wikipedia.org/wiki/Amarna_letters). A Mitannian king's letter to the Pharaoh in Conder's translation — [Conder](https://archive.org/download/tellamarnatablet00palerich/tellamarnatablet00palerich_djvu.txt). The 1892 British Museum catalogue describes the Nergal and Ereshkigal text and the Adapa fragment — [Bezold and Budge](https://archive.org/download/tellelamarnatabl00bezo/tellelamarnatabl00bezo_djvu.txt).

## Sceptical and alternative pass
- Enuma Elish: an old view put its composition under Hammurabi; most scholars now accept the Second Dynasty of Isin, with a late-Kassite date still proposed (Wikipedia summary, own candidate). Disputed, so the range recorded is wide (-1300 to -900).
- Code of Hammurabi: Landsberger's 1950 objection that judges ignored the Code, and Yaron's "persistent misnomer" — [Wikipedia](https://en.wikipedia.org/wiki/Code_of_Hammurabi), own candidate. The "laws" may not be statutes.
- Hattusa: Beckman says Gilgamesh was imported "for use in scribal instruction" (own candidate): the tablets prove a curriculum text arrived, not a readership.
- Megiddo: Goren et al. show the tablet was written locally, so it is not an imported Mesopotamian object. The route is not documented; the tablet shows the text, and presumably a scribe who knew it, in Canaan.
- Amarna: Conder's translation is obsolete, with his Hittite-Mongol theory; use Moran or Rainey for any claim about wording.
- Flood borrowing: the Livius table shows resemblance only. No scholarly dissent on direction (Sumerian to Akkadian to Hebrew, or independent) was opened. This brief is one-sided on that point and the thread brief for the flood should carry it.
- Harper's 1904 Hammurabi dates him "about 2250 B.C.", long obsolete; the modern middle-chronology date is used.

## Gaps
Hosts that did not open:
- sacred-texts.com: Cloudflare challenge (403), every page.
- gutenberg.org: 503 on every fetch, so the Gutenberg Thompson and Hammurabi texts were not used.
- ORACC (oracc.museum.upenn.edu): no connection. CDLI main host (cdli.mpiwg-berlin.mpg.de): redirect only; cdli.earth worked.
- Wikisource API (en.wikisource.org/w/api.php) and several Wikipedia raw fetches: intermittent 429 or 404; pages read through the normal URLs.
- onlinelibrary.wiley.com (Goren 2009 full paper): 403. academia.edu and library.biblicalarchaeology.org (BAS note on the Megiddo find): 403. soas-repository.worktribe.com (George, "What's new in the Gilgamesh Epic?"): 403.
- deepblue.lib.umich.edu Beckman offprint "Gilgamesh in Hatti": 404.
- hethport.uni-wuerzburg.de CTH 341: redirected to a moved-notice page.
- archive.org copy of Lambert and Millard, Atra-hasis: lending-only, empty OCR.
- ETCSL tr211 and the Livius pages answered; an archive.org Mercer 1939 Amarna was not found.

Recalled, not fetched (not candidates):
- Lambert and Millard, Atra-hasis (1969), and Lambert, Babylonian Creation Myths (2013).
- George 2003, The Babylonian Gilgamesh Epic, the critical edition the CDLI record cites.
- Goetze and Levy 1959, "Fragment of the Gilgamesh Epic from Megiddo", 'Atiqot 2.
- Moran 1992, The Amarna Letters; Rainey et al. 2014, The El-Amarna Correspondence.
- Roth 1995, Law Collections from Mesopotamia and Asia Minor.

Not obtained: the Hurrian and Hittite Gilgamesh text itself (only Beckman's front matter and register); a modern open translation of Enuma Elish I and of the Gilgamesh XI Utnapishtim speech (George); the Amarna letters by EA number in a modern translation; Hammurabi epilogue; the Atrahasis Hattusa fragments' own texts.
