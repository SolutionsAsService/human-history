# bar-kokhba-diaspora: Second Revolt and the diaspora (primary-text brief)

## Ask
"Quote sources on the Second Revolt and the diaspora: the Bar Kokhba letters (Nahal Hever, Murabba'at), Cassius Dio 69.12-14, Eusebius HE 4.6, Mishnah and Talmud passages on the revolt via Sefaria, Philo Against Flaccus on the Alexandria riots, the Dura-Europos synagogue (c. 244 CE), the Aphrodisias 'God-fearers' inscription, the Theodotos synagogue inscription." and "Composition dates with basis, earliest witness, and the scholarly caution on each source."

22 candidates, every quote confirmed with check_quote.py before recording (candidates file: bar-kokhba-diaspora.candidates.json). Dates are kept as composition / earliest witness / edition inside each `text` object. Where I could not open a scholarly dating source the range is marked as my bracket in `basis`.

## Cited findings
- Dio: Hadrian founded Aelia Capitolina with a Jupiter temple on the Temple site; war followed; "all Judaea had been stirred up, and the Jews everywhere were showing signs of disturbance"; 580,000 killed. Loeb (Cary 1925) on LacusCurtius; the text is the 11th-c. Xiphilinus epitome. — [LacusCurtius Dio 69](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/69*.html)
- Eusebius HE 4.2 (diaspora war under Trajan) and 4.6 (Barcocheba, Bithara, ban from Jerusalem, Gentile Aelia, authority Aristo of Pella). — [New Advent](https://www.newadvent.org/fathers/250104.htm)
- Historia Augusta, Hadrian 14.2: war "because they were forbidden to practice circumcision"; Loeb note prefers Dio. — [LacusCurtius HA Hadrian](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Hadrian/1*.html)
- Jerusalem Talmud Taanit 4:5: Mishnah lemma (Betar taken, city ploughed); Akiva calls Bar Koziba King Messiah; Hadrian besieges Bettar three and a half years. — [Sefaria API](https://www.sefaria.org/api/texts/Jerusalem_Talmud_Taanit.4.5?context=0&commentary=0)
- Bavli Gittin 57a-b: Beitar carriage-shaft legend (57a, read, not recorded because bold markup blocks verbatim checking); Hadrian credited with killing in Alexandria and Vespasian at Beitar (57b, recorded). — [Sefaria API 57b](https://www.sefaria.org/api/texts/Gittin.57b?context=0&commentary=0)
- Bar Kokhba letters: Tekoa order, En-gedi reproach (Yadin 1971 via Livius); Sukkot letter (COJS). — [Livius](https://www.livius.org/sources/content/oriental-varia/four-letters-of-bar-kochba/), [COJS](https://cojs.org/Bar_Kokhba_Letter-_132-135_CE/)
- Philo, Against Flaccus: images in synagogues, million Jews in Egypt, "foreigners and aliens", confinement to a quarter. Yonge translation. — [earlychristianwritings.com](https://www.earlychristianwritings.com/yonge/book36.html)
- Theodotos inscription text (Kloppenborg translation, "before 70 CE"). — [AGRW 270](https://philipharland.com/greco-roman-associations/270-dedication-of-a-synagogue-by-theodotos/)
- Aphrodisias donor list with "those who are Godfearers" (Bonz). — [Posen Library](https://www.posenlibrary.com/node/11268)
- Dura-Europos Aramaic tile: Seleucid year 556, second year of Philip; Greek tile "Samuel (son) of Yedaya, elder of the Jews". — [Posen Library](https://www.posenlibrary.com/node/11249)

Composition-date bases actually opened: Sefaria index compDate (Mishnah Taanit 190-230, Gittin 450-550); Wikipedia "Jerusalem Talmud" (late 4th to first half of 5th c.), "Babylonian Talmud" (c. 500 or mid-6th c.), "Ecclesiastical History (Eusebius)" (Louth: 313; final before 326), "Bar Kokhba Revolt" (Dio early 3rd c., Xiphilinus 11th c., Historia Augusta 4th c., citing Horbury 2014), "Theodotos inscription" (paleography 1st c. BCE-70 CE), Chaniotis 2002 (Aphrodisias c. 200-500). These are tertiary or metadata; no primary-edition critical introduction was opened. Philo's Flaccus has no opened date beyond the 38 CE events and Philo's lifespan.

## Sceptical and alternative pass
- Cause of the revolt: Dio (Aelia) versus Historia Augusta (circumcision). Wikipedia "Bar Kokhba Revolt" says recent scholarship largely rejects the HA reading (cites Berthelot 2021, Goodman 2004; not opened). Recorded as a `contradicts` candidate.
- Scale and Roman reaction: Eck, JRS 89 (1999), open Cambridge extract, resists the view that the threat was "grossly exaggerated"; Current Epigraphy's report of his 2008 lecture lists diplomas and inscriptions behind Dio's "whole earth stirred up". Only the extract and the report were read. Nobody opened argues Dio's 580,000 is wrong; Wikipedia notes some accept it.
- Aphrodisias: Chaniotis 2002 (full PDF opened) shows c. 200 is not secure; 4th-5th c. possible; the identity of theosebeis with Acts' God-fearers is disputed (Tannenbaum 1986 on COJS argues they are gentile sympathisers; I did not open a rebuttal).
- Theodotos: Wikipedia calls McKay's later datings a minority view (Kloppenborg 2000 not opened).
- Dura: no sceptical source found; the one date discrepancy in search snippets (249/250) was not opened and is not recorded.
- Rabbinic texts: all redacted 200-300+ years after the events and legendary in detail; Gittin conflates Hadrian, Vespasian and Alexandria.
- No source opened documents a diaspora revolt in 132-135. The diaspora links in this set are (a) Dio's "Jews everywhere", (b) the 115-117 war (Eusebius 4.2), (c) Alexandria 38 CE (Philo), (d) later communities (Dura, Aphrodisias). Do not read them as one event.

## Gaps
- Failed or not opened: Wikisource "Translation:Against Flaccus" (HTTP 429); documentacatholicaomnia.eu Philo PDF (no DNS); chayacassano.commons.gc.cuny.edu (403); Sefaria `fetch_text` for "Gittin 57a" with no section returned empty (fetched via API instead); GitHub MCP server failed to connect (not needed).
- Recalled or named in search results, not fetched: Reynolds and Tannenbaum 1987 (Aphrodisias edition); Kloppenborg, JJS 51 (2000) on Theodotos; Kraeling 1956 Dura report (inscription numbers come from Posen/secondary citations); Yadin 1971; DJD II and the Nahal Hever documentary editions (so no Murabba'at letter with a papyrus number is recorded; Livius gives none); Berthelot 2021; Goodman 2004; Horbury 2014; Lamentations Rabbah 2:4; Mishnah Sanhedrin or other rabbinic passages on the revolt; Justin Martyr on Jews barred from Jerusalem; Appian/Greek papyri on 115-117.
- Earliest manuscript witnesses for Eusebius, HA, Philo and the Talmud texts were not established from pages opened; each candidate says so.
- Posen Library pages are licence-restricted previews (free registration for the rest); text quoted is what the page showed. The Dura Greek tile (IJO 3.86) is mentioned in a summary, not separately quoted.
- Mishnah Taanit 4:6 standalone (William Davidson edition) was read but could not be quoted verbatim because of bold markup; the Guggenheimer lemma in the Jerusalem Talmud is used instead.
