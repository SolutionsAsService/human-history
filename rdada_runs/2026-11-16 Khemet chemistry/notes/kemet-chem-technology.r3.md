# kemet-chem-technology: Kemet chemical technology (round 3)

## Ask
What chemical technologies is ancient Egypt (Kemet, Khemet) securely documented to have practised, from analysis of objects and texts: pigments (Egyptian blue, Egyptian green, frit), glass and faience, metallurgy (copper, gold, bronze), mummification materials (natron, resins, oils), cosmetics (galena, lead compounds, kohl), dyes, fermentation, medical recipes? Dates and kind of evidence. Which are measured by archaeometry versus only described in texts?

Method: curl via Bash. Worked: zenodo.org (API: `/api/records/<id>` and `/files/<name>/content`; the direct file URL gave 403), eprints.whiterose.ac.uk, discovery.ucl.ac.uk, pmc.ncbi.nlm.nih.gov (kohl article only; two others hit reCAPTCHA), en.wikipedia.org.

## Cited findings
- Egyptian blue: a calcium copper silicate (cuprorivaite phase), sintered at about 850-1050 C, appears c. 3100 BCE per the review. The review stresses that direct production evidence is scarce and lacking for whole periods. Evidence: product analysis plus experiments; few workshops. — [Kovalev et al. 2023](https://zenodo.org/records/7866492): "we note the absence of direct evidence for the production and processing of Egyptian blue for much of the known period of its use"
- A recipe for Egyptian blue exists only in Vitruvius (1st c. BCE, Puteoli), a text, not Kemet. — [Rodler and Kostomitsopoulou Marketou 2022](https://zenodo.org/records/5827683): "there is little information on the manufacture, the source of raw materials or trade of Egyptian blue"
- Mummification: natron and organic balms, with no native written record; classical authors (Herodotus c. 450 BCE onward) are vague. Chemistry is therefore the main evidence. — [Buckley and Evershed 2001, abstract](https://eprints.whiterose.ac.uk/7092): "The nature of the organic treatments remains obscure, because the ancient Egyptians left no written record of the process."
- Animal mummies (from c. 1400 BCE) contain fats, oils, beeswax, bitumen and several resins, not just resin dips. — [Buckley et al. 2004, abstract](https://eprints.whiterose.ac.uk/7100/): "fats, oils, beeswax, sugar gum, petroleum bitumen, and coniferous, Pistacia and possibly cedar resins"
- Roman-period gazelle balms; a cruciferous seed oil named in Pliny is now chemically shown. — [Marković et al. 2022](https://zenodo.org/records/6276973): "complex mixtures of plant oils, animal fats, conifer resin, and beeswax"
- Votive ibis balms: castor oil, beeswax and Pinaceae tar. — [Marković et al. 2020](https://zenodo.org/records/4896312): "castor oil, beeswax and wood tar of a diterpenic resin belonging to the Pinaceae family"
- Cosmetics: kohl contains galena and cerussite; laurionite and phosgenite read as synthetic (wet chemistry, after Walter et al. 1999, not opened); recipes also include manganese, silicon and organic components. — [Riesmeier et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8994005/): "The presence of laurionite and phosgenite in Ancient Egyptian make-up likely stems from synthetic manufacture"
- Glass: primary glass production at Amarna (14th c. BCE) with cobalt-alum blue and copper colourants; Egyptian origin by trace elements. — [Jackson and Nicholson 2023](https://eprints.whiterose.ac.uk/id/eprint/194908/): "It is accepted that cobalt blue glass was manufactured at Amarna using a cobalt alum"
- Lisht (New Kingdom) also yields crucibles and semi-finished glass; Qantir (Rehren and Pusch 2005) and Amarna are the other cited workshop sites. — [Smirniou, Rehren, Gratuze](https://discovery.ucl.ac.uk/id/eprint/1569273/): "evidence for the primary production of glass at Lisht, including crucible fragments and semi-finished glass"
- Faience: Wikipedia pointer only. — [Wikipedia](https://en.wikipedia.org/wiki/Egyptian_faience): "Egyptian faience is a sintered - quartz ceramic material from Ancient Egypt"

Direct (measured) versus textual, from what was opened:
- Measured: Egyptian blue composition; balm organics (animal mummies; human-mummy abstract); kohl minerals; Late Bronze Age glass (Amarna, Lisht; Qantir cited).
- Workshop remains: glass crucibles and semi-finished glass (Amarna, Lisht, Qantir); Egyptian blue workshops thin.
- Text only here: the Egyptian blue recipe (Vitruvius), Herodotus/Pliny on embalming. No native Egyptian chemical recipe text was opened.

## Sceptical and alternative pass
- Kovalev et al. is itself the sceptical source: production evidence for Egyptian blue is missing for much of its history.
- Rodler and Kostomitsopoulou Marketou note that variation within one workshop complicates workshop identification from chemistry alone.
- Buckley and Evershed and Marković et al. stress that classical texts are vague about materials, and Marković notes conifer resin is identified only to family.
- Riesmeier et al.: "synthetic" for laurionite and phosgenite is an inference ("likely"), and recipes are more diverse than lead-only.
- Jackson and Nicholson: Amarna manufacture of the ingot rests partly on context; cobalt source is "probably" Kharga/Dakhla.
- Not found: any critique of Walter et al. 1999 (could not open it); no opened source on metallurgy, gold, dyes, fermentation or medical papyri. This brief is therefore weighted to pigments, glass, balms and kohl.
- Sources are archaeometric and mostly favour the technology claims; counter-readings were not located.

## Gaps
- Hosts that failed from Bash (connect refused or no resolve): idp.nature.com (cookie/identity redirect, so www.nature.com/articles/17240, s41586-022-05663-4 and s41598-023-39393-y NOT opened), api.crossref.org, ebi.ac.uk, eutils.ncbi, ideas.repec.org, escholarship.org, core.ac.uk, metmuseum.org, scholarlypublications.universiteitleiden.nl, eprints.ncl.ac.uk, cegu.ff.cuni.cz, philosophymindscience.org, ueaeprints.uea.ac.uk, discovery-pp.ucl.ac.uk, ucl.ac.uk, orca.cardiff.ac.uk, press.rebus.community, www.sas.upenn.edu, bhjournal.au (doi.org redirect), springerlink mirror, archive.org `/download/` for Lucas (details page opened, text did not). PMC PMC8106298 and PMC10393888 gave reCAPTCHA (not opened). Zenodo direct file URL gave 403.
- Recalled or snippet-seen, NOT fetched, so not candidates: Walter et al., Nature 397:483-484 (1999, DOI 10.1038/17240); Rehren and Pusch, Science (2005); Smirniou and Rehren 2011 Archaeometry and 2016 J. Archaeol. Sci. 67; Hatton et al. 2008 on Egyptian blue/green frits; Tite and Shortland on faience; Odler 2023 Copper in Ancient Egypt, Odler et al. 2021 Giza arsenical copper, Rademakers et al. 2021, Kmošek et al. 2018 (copper); Huber et al. 2023 Sci. Rep. and the 2023 Saqqara workshop Nature paper (embalming); Lucas, Ancient Egyptian Materials and Industries; Stos-Fertner and Gale 1979 (gold). Metallurgy, gold and Egyptian green/frit remain uncovered by opened sources.
- Toch 1918 "Pigments of the Tomb of Perneb" opened on Zenodo but the OCR was two-column and unusable, so not cited.
