# jewish-ancient-inscriptions: Extra-biblical inscriptions and chronicles on Israel and Judah

## Ask
"Quote the extra-biblical inscriptions and chronicles that bear on Israelite and Judaean history, from open translations (Livius, Wikisource, archive.org _djvu.txt, Pritchard-era scans, open scholarship): the Merneptah Stele ('Israel', c. 1208 BCE), the Tel Dan Stele ('House of David'), the Mesha Stele, the Sennacherib Prism on Hezekiah, the Siloam inscription, the Lachish letters, the Babylonian Chronicle (ABC 5) on the capture of Jerusalem in 597 BCE, and the Elephantine papyri (the 419 BCE Passover letter and the 407 BCE petition to Bagoas, tying Judaeans to Persian rule)."
"Date each inscription with the basis (palaeography, regnal year), the object's location and witness, and the dispute where one exists (Tel Dan reading, Mesha date, minimalist critiques)."

22 candidates in `jewish-ancient-inscriptions.candidates.json`: every quote (at most 25 words) was confirmed with `check_quote.py` against the cited URL before it was written. `validate_candidates.py` reports only the "no verifier marker" error on all 22, which is the verifier stage's job to add.

## Cited findings

Composition, witness and edition are kept apart in each `text` object.

- **Merneptah Stele.** Breasted's 1906 translation reads "is desolated, his seed is not;" after Ashkelon, Gezer and Yenoam (section 617). Breasted says it is "the earliest mention of Israel known to us in literature" and also that the assertion is "so brief and bald that little can be drawn from it". The year (regnal year 5, c. 1208 BCE) is from Breasted's "fifth year" plus Wikipedia's c. 1208 BCE. The stele was found by Petrie at Thebes in 1896 and is in Cairo, with a Karnak duplicate. — [Breasted 1906](https://archive.org/stream/ancientrecordsof03brea/ancientrecordsof03brea_djvu.txt); [Wikipedia](https://en.wikipedia.org/wiki/Merneptah_Stele)
- **Merneptah dispute.** Wilson (ANET 378) called the "people" determinative "good, but not conclusive". Hjelm and Thompson read "Jezreel", answered by Hasel. The majority reads Israel. Second-hand via Wikipedia. — [Wikipedia](https://en.wikipedia.org/wiki/Merneptah_Stele)
- **Tel Dan text.** Biran and Naveh's 1995 translation (lines 8-9): "[Ahaz]iahu son of [Jehoram kin-] g of the House of David". Lemaire's 1998 variant reads two kings, not seventy. Restored names are conjectural. — [Wikipedia](https://en.wikipedia.org/wiki/Tel_Dan_stele)
- **Tel Dan date and witness.** Hagelia says the palaeography fits "the latter part of 9th century or around 800 BCE". Biran and Naveh first said c. 870 BCE (1993). The three fragments were found in 1993 and 1994 re-used in a plaza and a wall, so there is no stratigraphic date. The author is probably Hazael (c. 842-806 BCE), by inference. The stele is in the Israel Museum. — [Hagelia 2010](https://bibleinterp.arizona.edu/articles/teldan257923)
- **Tel Dan minimalist readings.** Lemche and Thompson read dwd as an epithet of Yahweh ("beloved") and byt dwd as his temple (via blog notes quoting the article). Stavrakopoulou: "House of David" is disputed because there is no word divider, and even if right it does not show a united monarchy. Cryer and Lemche's forgery charge was ignored or rejected by most scholars. — [Vridar](https://vridar.org/2011/07/19/does-the-tel-dan-inscription-prove-david-to-be-a-historical-person/); [Wikipedia](https://en.wikipedia.org/wiki/Tel_Dan_stele)
- **Mesha text.** Compston (1919): "Israel utterly perished everlastingly." He says the date is "somewhere about mid-ninth century B.C." The stone was found at Dhiban in 1868, broken, restored from a squeeze, and is in the Louvre. — [Compston 1919](https://archive.org/stream/inscriptiononste00compuoft/inscriptiononste00compuoft_djvu.txt)
- **Mesha date.** The usual c. 840 BCE rests on matching 2 Kings 3. Lemaire says the stele "may be as late as 810 BCE". Finkelstein, Na'aman and Romer (2019) read line 31 as Balak, not "House of David", and Langlois disagrees. — [Wikipedia](https://en.wikipedia.org/wiki/Mesha_Stele)
- **Sennacherib Prism.** Luckenbill: Hezekiah, "like a caged bird I shut up in Jerusalem, his royal city". The text claims 46 cities and 200,150 people but not the capture of Jerusalem. The Oriental Institute Prism is dated 689 BCE (limu Gahilu) and the Taylor Prism 691 BCE (limu Bel-emuranni). — [Luckenbill 1924, OIP 2](https://oi-idb-static.uchicago.edu/multimedia/315/oip2.pdf)
- **2 Kings 18:13-17 against the prism.** Both have Sennacherib seizing Judah's fortified towns and a payment by Hezekiah. They differ on the outcome. — [Sefaria, JPS](https://www.sefaria.org/api/texts/II_Kings.18.13?context=0&lang=en)
- **Siloam text.** The 1894 PEFQS translation (E. Davis): "the pick each to his neighbour, and while three cubits [of rock remained]". The tablet was found in 1880 and names no king. — [PEFQS 1894 on Wikisource](https://en.wikisource.org/wiki/Palestine_Exploration_Fund_-_Quarterly_Statement_for_1894/The_Siloam_and_Later_Palestinian_Inscriptions)
- **Siloam date.** The 1883 PEFQS article says the letter forms only prove it is older than the mid-6th century BCE, notes most then ascribed it to Hezekiah, and prefers "the age of Solomon". Frumkin, Shimron and Rosenbaum (Nature 2003, abstract) report radiocarbon and U-Th dating that proves "its Iron Age II date" for the tunnel. That dates the tunnel, not the inscription. — [PEFQS 1883](https://biblicalstudies.org.uk/pdf/pefqs/1883_04_210.pdf); [Nature 2003](https://www.nature.com/articles/nature01875), doi 10.1038/nature01875
- **Siloam script (transfer claim).** The 1894 author argues the Phoenician alphabet is "the sister rather than the parent of the Jewish and Aramean letters". This is a debated strand about writing. — [PEFQS 1894](https://en.wikisource.org/wiki/Palestine_Exploration_Fund_-_Quarterly_Statement_for_1894/The_Siloam_and_Later_Palestinian_Inscriptions)
- **Lachish 4.** Zammit (Oxford DPhil 2016) summarises: the sender and his men are "watching the signals of Lachish, but cannot see" Azekah. The ostraca come from the Level II guardroom (E.18:C), excavated by Starkey, destroyed 588/6 BCE. Winton Thomas (1945) puts the letters in the summer of 589 BCE, "the last days of Zedekiah". Zammit argues "for we can no longer see Azekah" is a mistranslation of "for we cannot see Azekah". — [Zammit 2016](https://ora.ox.ac.uk/objects/uuid:db71cf81-ba6c-4a91-8e51-3c694993ebfe/download_file?file_format=pdf&safe_filename=Zammit_THESIS_Volume%2B1_2016_Original.pdf&type_of_work=Thesis); [Winton Thomas](https://biblicalstudies.org.uk/pdf/tp/lachish_thomas.pdf)
- **ABC 5 (BM 21946).** Wiseman 1956, reverse 11-13: the king of Akkad besieged "the city of Judah" and "on the second day of the month of Adar he seized the city and captured the king". He dates this to 15/16 March 597 BCE. He also says the script "does not of itself allow any precise dating" (near-contemporary to the end of Achaemenid rule). Livius (Grayson and Glassner translation) gives the same entry and says it "contradicts the date in 2 Kings 24.12 (the eighth year)". — [Wiseman, ETANA](https://etana.org/sites/default/files/coretexts/20337.pdf); [Livius](https://www.livius.org/sources/content/mesopotamian-chronicles-content/abc-5-jerusalem-chronicle/); [2 Kings 24:12, Sefaria](https://www.sefaria.org/api/texts/II_Kings.24.12?context=0&lang=en)
- **Elephantine, Cowley no. 21 (419 BCE).** Word came "from the king to Armies" that a festival be kept for the Jewish garrison, with Unleavened Bread rules. Cowley dates it to Darius II's 5th year, 419 BCE. "Passover" is a restoration: Cowley writes "if the proposed restoration is right, the Passover", and Wikipedia says Passover "is not mentioned in the extant text". The papyrus is in the Berlin museum. — [Cowley 1923](https://archive.org/stream/aramaicpapyrioff00ahikuoft/aramaicpapyrioff00ahikuoft_djvu.txt); [Wikipedia](https://en.wikipedia.org/wiki/Elephantine_papyri_and_ostraca)
- **Elephantine, Cowley no. 30 (petition).** Yedoniah and the priests of Yeb write to Bigvai, governor of Judaea, and say they also wrote to Johanan the high priest, "the nobles of the Jews" and the sons of Sanballat, governor of Samaria. The temple of Ya'u was destroyed in Darius II's 14th year. Cowley prints 408 BCE for the 17th year, and Wikipedia (and the brief) say 407 BCE. The two dates are recorded as a range. — [Cowley 1923](https://archive.org/stream/aramaicpapyrioff00ahikuoft/aramaicpapyrioff00ahikuoft_djvu.txt)
- **Composition of 2 Kings.** Wikipedia reports that scholars "tend to treat the books as consisting of a first edition from the late 7th century BC and of a second and final edition from the mid-6th century BC". The earliest witnesses are the Qumran fragments, and the earliest complete copy is the Aleppo Codex (10th c. CE). This is used for the three Kings candidates only. — [Wikipedia](https://en.wikipedia.org/wiki/Books_of_Kings)

## Sceptical and alternative pass
- **Tel Dan:** The minimalist toponym/god reading (Lemche and Thompson, JSOT 64) and the word-divider objection (Stavrakopoulou) are recorded as separate candidates with stance `contradicts` and `fails_to_support`, as are Lemaire's two-kings variant and the forgery charge (noted in the Stavrakopoulou candidate). Hagelia's survey says most specialists accept "House of David" and that the debate has quieted. Athas's comment on the lamed in line 4 is an unresolved dissent in the comments of that page.
- **Mesha:** The date is c. 840 BCE or as late as 810 BCE, and the 2019 reading of line 31 (Balak against "House of David") is disputed. The forgery charge against Mesha is named on Wikipedia, but its source (a ResearchGate paper) was not opened.
- **Merneptah:** Breasted's own caution ("little can be drawn") and Wilson's determinative caution are both in the ledger. The "Jezreel" reading is a minority view.
- **Siloam:** The 1883 Solomon-date argument and the 2003 radiometric result are both recorded. The Nature abstract is a result about the tunnel, not about the inscription.
- **Lachish:** Zammit's "no longer" argument and Thomas's doubt that the sender was at Tell ed-Duweir are recorded in Zammit's own words. No published reply to Zammit was opened.
- **Sennacherib:** Luckenbill's own reading of the Prism is that the victory was "not at all decisive", and the Prism never claims the capture of Jerusalem. The biblical parallel is recorded without any claim of borrowing.
- **Elephantine:** The "Passover" label is itself doubtful (Cowley, Wikipedia). The 407 against 408 BCE date for the petition is left open.
- **Not looked for:** I did not search for a minimalist reading of the Siloam inscription's Hezekiah link beyond Sayce (1883), or for Egyptological readings of Israel as "Jezreel" beyond Wikipedia's quotation.

## Gaps
- **Hosts that failed (not opened, nothing quoted from them):**
  - `www.biblicalarchaeology.org` (BAS Daily), HTTP 403 (Lemaire/Delorme Mesha line 31 and Mesha translation pages).
  - `phys.org` (2019 Mesha article), HTTP 403.
  - `www.kchanson.com` (Tel Dan and Passover translations), "Not Acceptable" from Mod_Security.
  - `www.mdpi.com` (Assyrian chronology article), HTTP 403.
  - `www.pnas.org` (2025 Siloam Dam paper), HTTP 403.
  - `serval.unil.ch` (Finkelstein, Na'aman and Romer, Tel Aviv 46, 2019), returned a human-verification page, not bypassed.
  - `www.rollstonepigraphy.com`, connection failed.
  - `en.wikipedia.org` answered HTTP 429 several times and was retried once after a pause each time; all quoted pages were finally opened.
  - `www.katapi.org.uk` opened (translation of the Mesha stele), but I used Compston instead and quote nothing from it.
- **Recalled, not fetched:**
  - Biran and Naveh, IEJ 43 (1993) and IEJ 45 (1995).
  - Lemche and Thompson, "Did Biran Kill David?", JSOT 64 (1994) 3-22.
  - Thompson, "House of David: an eponymic referent to Yahweh as Godfather", SJOT 9 (1995).
  - Athas, The Tel Dan Inscription (2003); Hagelia (2006, 2009).
  - Rogerson and Davies, "Was the Siloam Tunnel built by Hezekiah?", BA 59 (1996).
  - A PNAS 2025 paper on the Siloam Dam that reportedly calls the construction date obscure.
  - Lemaire (2007) on the Mesha date, and Lemaire and Delorme (2022).
  - Porten and Yardeni, TADAE (the 407 BCE dating).
- **Not found open:**
  - Kurkh Monolith (Ahab) and Black Obelisk (Jehu) translations were not searched for, to stay within the brief's list.
  - A reconciliation of the 408 and 407 BCE dates for Cowley 30.
  - The present museum location of the Siloam inscription and the Lachish ostraca (not stated in an opened source).
  - The Elephantine papyrus museum numbers (only "Berlin" for no. 21, via Wikipedia).
- **Edition limits:**
  - The Tel Dan text is Wikipedia's reproduction of the 1995 translation, not the editors' own page.
  - Wikipedia was also the host for the Merneptah dispute, the Mesha date and the Stavrakopoulou quote, so those three are second-hand.
  - The Lachish 4 quote is Zammit's summary sentence, because her line-by-line translation sits in a table that does not quote cleanly.
  - OCR errors in the Cowley, Wiseman and Breasted scans were avoided by choosing clean sentences, but the Breasted line omits the garbled transliteration of "Israel".
