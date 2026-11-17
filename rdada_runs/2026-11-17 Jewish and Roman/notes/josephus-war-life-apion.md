# josephus-war-life-apion: Josephus, War, Life and Against Apion (primary texts)

## Ask
"Quote Flavius Josephus at his loci from open editions ... Jewish War Prologue and the Essene account (2.119-161), the siege and fall of Jerusalem (book 6, the Temple's burning), Masada (7.252-406), Life (his own role at Jotapata), Against Apion (1.37-43 on the Jewish canon; his replies on Egyptian and Greek writers)." And: "Give composition dates with their basis (c. 75-79 CE for the War), his Flavian patronage and the scholarly caution on reliability (Rajak, Mason, Cohen), and the earliest manuscript witnesses."

## Cited findings
All primary quotes are from one open edition: Whiston's translation as digitised by CCEL, [Josephus: The Complete Works plain text](https://www.ccel.org/ccel/j/josephus/complete/cache/complete.txt). Every quote was confirmed with check_quote.py (run against a local download of that file). Locators are Whiston's book.chapter.section; Niese numbers in parentheses were added from standard concordance, not checked in an opened source, and should be treated as unverified. The English is a translation; the Greek was not opened.

- War, Preface: Josephus names himself, a priest who "at first fought against the Romans", translating an earlier work in "the language of our country" (cand. 1).
- War 2.8.2: the Essenes as the third sect (cand. 2). Antiquities 15.10.4: Essenes "live the same kind of life as ... Pythagoreans" (cand. 3, strand, debated).
- War 3.8.9: prophecy to Vespasian (cand. 4). War 6.2.1: "God himself ... bringing on this fire" (cand. 5). War 6.4.5 and 6.4.7: Temple doomed by God; burnt "without Caesar's approbation" (cands 6-7).
- War 7.8.6 and 7.9.1: Eleazar's speech and the 960 dead at Masada, with two women and five children surviving (cands 8-9).
- Life 76: citizenship, pension and an apartment in Vespasian's house (cand. 10). Life 65: attack on Justus of Tiberias (cand. 11). I did not quote the Life's account of Jotapata itself (see Gaps).
- Against Apion 1.8: the twenty-two books (cand. 12). 1.14 and 1.30: Manetho's Shepherds and Josephus's rebuttal (cands 13-14, strands). 2.2: Apion on Moses of Heliopolis (cand. 15, strand). 1.22: Hermippus on Pythagoras and Jewish laws (cand. 16, strand).
- Composition dates and their basis:
  - War: after the Temple of Peace dedication (75), before Vespasian's death (79), with later retouching possible; [Pearse reproducing Thackeray's Loeb introduction](https://tertullian.org/rpearse/manuscripts/josephus_jewish_war.htm). [Livius](https://livius.org/sources/about/josephus-jewish-war) gives 75-79 with book 7 a later addition. Both are secondary web sources; I did not open a journal article stating the dating.
  - Life and Apion: early second century, Life after the death of Agrippa II (Thackeray dates it 100), Apion after 94; [Pearse reproducing Thackeray (1926)](https://www.tertullian.org/rpearse/manuscripts/josephus_vita_apion.htm). Thackeray's own number for Agrippa II's death is disputed and was not tested here.
  - Antiquities: 13th year of Domitian, i.e. 93-94, per Thackeray's reading of Ant. 20.267.
- Earliest witnesses (kept apart from composition and from the 1737 Whiston edition): War, a 3rd-c. papyrus fragment of BJ 2.20.6-7 only, then 10th-11th c. codices (Ambrosianus D.50 sup., Parisinus gr. 1425), with Latin versions of the 4th-5th c. that predate them. Life, Palatinus Vat. gr. 14 (9th/10th c.). Apion, one 11th-c. manuscript (Laurentianus plut. 69.22) plus Cassiodorus's Latin for the gap at 2.52-113.
- Reliability and patronage: [Romm, NYRB 2021](https://www.nybooks.com/articles/2021/01/14/what-happened-at-masada/) lays out Graetz's "Römling", Mason's "pragmatic statesman" and no-commission view, and Magness's more pro-Flavian reading; Mason thinks Masada's truth "probably unrecoverable". Price's review of Rajak (open PDF on scriptaclassica.org) reports her "sympathetic reading": the War can be trusted on most points once its viewpoint is recognised. [Schwartz, HTR 1986](https://doi.org/10.1017/S0017816000020162) (extract only) says book 7 "is problematic throughout".

## Sceptical and alternative pass
Searched for reliability scholarship and Masada critiques. Found the Romm review (covers Mason and Magness, and the Yadin/Ben-Yehuda dispute), the Rajak review, Livius's note that Eleazar's speech cannot rest on a report, and Schwartz on book 7. Josephus's own Preface and Life 65 show he claims eyewitness truth against flattering or hostile rivals; that is advocacy, not independent confirmation. The three Egypt/Greece strands rest on Josephus quoting lost authors (Manetho, Apion, Hermippus); I opened no modern scholar judging whether those quotations are accurate, nor on the Pythagoras or Essene-Pythagorean parallels. Those strands are marked `debated` and the lack of a sceptical source is a limit, not a finding. The Rajak and Mason views conflict with Graetz's and, partly, Magness's: the sample is lopsided toward the favourable-to-Josephus pole (Rajak, Mason) plus one review of the opposite, so the Cohen position is missing.

## Gaps
- Gutenberg (cache/epub/2847-2850) returned a "Temporarily Down for Maintenance" page; not opened.
- Perseus returned a 302 with no body to scripted curl; Wikisource raw URLs I guessed returned 404; LacusCurtius/Penelope path guessed returned 404; none used. Greek text (Perseus/Niese) was therefore not opened.
- josephus.org (Bloom/Goldberg pages) returned 406 Not Acceptable (mod_security); not opened, not retried.
- Haaretz "The Myth of Masada" is registration-walled; not opened.
- Recalled, not fetched: Cohen, Josephus in Galilee and Rome (1979) and his Life/War contradiction argument (only second-hand descriptions in search snippets); Rajak, Josephus: The Historian and His Society (book itself); Mason, A History of the Jewish War (book itself); Mason's Brill commentary; Yadin's excavation report; Ben-Yehuda's Masada Myth.
- The Price review's author name came from a search listing; the opened PDF text did not print it or a year (year left null).
- Life's Jotapata narrative proper and War 3.7-8 siege/lot-casting were not quoted; the NYRB review summarises them.
- Josephus's Antiquities witnesses not checked.
