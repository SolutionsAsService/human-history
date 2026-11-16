# law-christianity-mediterranean: Roman law, the spread of Christianity, and Manichaeism (primary texts)

## Ask
Roman law transmission (Gaius Institutes, Justinian's Digest/Institutes preface, rediscovery at Bologna), the spread of Christianity (Pliny to Trajan letter 10.96 on Christians in Bithynia c. 112 CE, Acts of the Apostles passages on mission routes, Edict of Milan, the Xi'an Nestorian Stele of 781 CE with its Syriac and Chinese text), Manichaeism's spread (Mani's Kephalaia or the Turfan fragments; Augustine's Confessions on Manichaeism). Quote primary passages at their loci with composition date, earliest witness and basis.

22 candidates in `law-christianity-mediterranean.candidates.json`; 16 carry a `text` object, 11 a `strand`. Every quote was confirmed with `check_quote.py` before it was written. The validator reports only the "no verifier marker" error, which is the verifier's step, not the researcher's.

## Cited findings
- Gaius, Inst. 1.1: peoples use partly their own law and partly the law common to all men — [thelatinlibrary.com/law/gaius1.html](https://thelatinlibrary.com/law/gaius1.html). The page is an English text (not Latin) headed "c. 170 A.D."; no translator is named. Composition c. 161 CE is from [Wikipedia, Institutes (Gaius)](https://en.wikipedia.org/wiki/Institutes_(Gaius)) (citing Miglietta 2013). The two dates disagree and I kept both. The same article gives a Verona palimpsest copied c. 500 and Niebuhr's 1816 find.
- Justinian, Institutes proem, "Imperatoriam maiestatem non solum armis decoratam, sed etiam legibus oportet esse armatam" — [Latin Library](https://www.thelatinlibrary.com/justinian/institutes.proem.shtml). Published 21 Nov 533 per [Wikipedia, Institutes (Justinian)](https://en.wikipedia.org/wiki/Institutes_(Justinian)); Deo auctore (530) is mentioned there too.
- Digest, First Preface (Scott translation as hosted): the law inherited "so confused that it is extended to an infinite length" — [constitution.org](https://constitution.org/2-Authors/sps/sps02_j2-01.htm). The hosted prefaces carry dating clauses ending in 533.
- Bologna: Burchard of Ursperg says Wernerius renewed the neglected law books at Matilda's request — [MGH edition, archive.org](https://archive.org/stream/diechronikdespro16burc/diechronikdespro16burc_djvu.txt). Burchard lived c. 1177-1230/1 ([Wikipedia](https://en.wikipedia.org/wiki/Burchard_of_Ursperg)); the edition's apparatus reports Fitting's view that he took the notice from John of Cremona.
- Pliny, Ep. 10.96-97 (English, Georgetown page, translator unnamed; governorship 111-113 CE) — [faculty.georgetown.edu/jod/texts/pliny.html](https://faculty.georgetown.edu/jod/texts/pliny.html). Two candidates: the hymn "to Christ as to a god" and Trajan's "not to be sought out".
- Acts 13:1-4, 16:9-12 and 28:14-16 (KJV, bible-api.com); composition usually 80-90 CE per [Wikipedia, Acts](https://en.wikipedia.org/wiki/Acts_of_the_Apostles).
- Edict ("of Milan") in Lactantius, De mort. pers. 48 (ANF translation) — [earlychurchtexts.com](https://earlychurchtexts.com/public/edict_of_milan.htm). Letter of Licinius, 313; Lactantius's work "sometime after AD 316" ([Wikipedia](https://en.wikipedia.org/wiki/De_mortibus_persecutorum)); the Moissac manuscript was found in 1678.
- Xi'an stele, Eccles and Lieu translation with the Chinese and Syriac text — [PDF, manichaeism.de](https://www.manichaeism.de/wp-content/uploads/2024/10/Xian-Monument-5.11.2023.pdf). Two candidates: Aluoben's arrival in 635 and the Syriac colophon dating the stone to 1092 of the Greeks (781 CE).
- Augustine, Confessions 3.6.10 and 5.3.3 (NPNF translation, New Advent). Composition AD 397-400 per [Wikipedia, Confessions](https://en.wikipedia.org/wiki/Confessions_(Augustine)) (citing Chadwick 2008).
- Kephalaia (Gardner 1995, Sasanika excerpt): Mani "crossed from the country of the Indians to the land of the Persians" — [excerpt PDF](https://cpb-us-e2.wpmucdn.com/sites.uci.edu/dist/c/347/files/2020/01/Kephalaia.pdf). The Coptic codex is dated c. 5th century ([Wikipedia, Kephalaia](https://en.wikipedia.org/wiki/Kephalaia)).
- Mani, Shabuhragan, quoted in al-Biruni (Sachau 1879, p. 190): Buddha to India, Zoroaster to Persia, Jesus to the West, Mani to Babylonia — [archive.org](https://archive.org/stream/chronologyofanci00biru/chronologyofanci00biru_djvu.txt).

## Sceptical and alternative pass
Candidates with stance `contradicts` or `fails_to_support`, or that otherwise weaken a claim:
- Edict of Milan: Potter (via [Wikipedia](https://en.wikipedia.org/wiki/Edict_of_Milan)) says there was never an edict, only a letter of Licinius. Stance `contradicts`.
- Xi'an stele: 17th-century forgery or Jesuit-alteration claims by Horn, Spitzel, Navarrete and Voltaire ([Wikipedia](https://en.wikipedia.org/wiki/Xi%27an_Stele)). Stance `fails_to_support`. The article itself does not give the specialist rebuttal.
- Acts: late-date argument (c. 110-120 CE, Tyson) against 80-90 CE ([Wikipedia](https://en.wikipedia.org/wiki/Acts_of_the_Apostles)). A late date would put Acts after Pliny.
- Pliny: the consensus is that the letters are authentic, and the article frames their value conditionally ([Wikipedia](https://en.wikipedia.org/wiki/Pliny_the_Younger_on_Christians)). I found no source disputing authenticity.
- Bologna: Irnerius's school is dated 1084 or 1088 and Burchard wrote a century later ([Wikipedia](https://en.wikipedia.org/wiki/Irnerius)).
- Gaius date: 161 vs the c. 170 on the quoted page.

Most sceptical candidates are encyclopedia articles quoting books I could not open. They are cautions for the verifier to chase, not independent scholarship. The brief wanted `skeptical` kinds, and I found no open peer-reviewed sceptical paper in this pass.

Strands where the transfer is documented only in a late or hostile source are marked `inferred` or `debated`: the Acts journeys (`inferred`), Burchard on Bologna (`debated`), Mani's own claim of succession (`debated`).

## Gaps
- Failed or unusable hosts: en.wikisource.org (404 on every guessed title: Pliny Book 10, Institutes of Justinian, Pliny and Trajan, Edict of Milan); sourcebooks.fordham.edu and www.fordham.edu (HTTP 500); vroma.org Pliny page (406); penelope.uchicago.edu guessed Pliny URL (404); thelatinlibrary.com/justinian/institutiones*.html and digest1.html (404, the correct pages are `institutes.proem.shtml` and `digest1.shtml`); perseus.tufts.edu Pliny passage URL (302, not used); legalhistorysources.com (no answer in 60 s); en.wikipedia.org answered HTTP 429 for some fetches in bursts (retried slowly, then answered).
- No Turfan Manichaean fragment was opened and quoted, so the Manichaean Central Asian spread rests on the Kephalaia and the Shabuhragan only. Recalled, not fetched: Middle Persian Shabuhragan fragments (M 470 and related) via Iranica, and the Collatio edict of Diocletian against the Manichaeans (302), which English Wikipedia ('Manichaeism') quotes but which I did not open.
- Recalled, not fetched: Eusebius, HE 10.5 (the Greek version of the letter of Licinius); Tuccinardi 2017 (Pliny authorship verification); Potter, Constantine the Emperor (2013); Tyson 2011 on dating Acts; Miglietta 2013 on Gaius's date; Honoré on the Corpus.
- Earliest witnesses not established from opened sources: the Institutes and Digest of Justinian (the Florentine manuscript was not opened), Acts, Augustine's Confessions, the Pliny letter 10.96 leaf.
- The Latin Library "Gaius" page is an English text with no stated translator; the Scott attribution for the Digest preface is not printed in the passage checked.
- No Greek or Latin original was read for the Acts, Augustine or Gaius quotes; all are English. Pliny's Latin was opened (Dickinson Commentaries, macrons) and checked, but it was dropped from the candidates to keep the file focused.
- The Xi'an stele quotes use the Eccles and Lieu translation, which is marked an ongoing project; the Chinese characters were not independently read.
- Composition dates for several works rest on English Wikipedia summaries naming the scholars cited. They need confirming against the scholars' own pages.
