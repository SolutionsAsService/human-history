import type { Source } from '../types';

type K = Source['kind'];
type R = Source['reliability'];
const s = (id: string, cite: string, kind: K, discipline: string, reliability: R, note?: string, placeholder = false): Source =>
  ({ id, cite, kind, discipline, reliability, note, placeholder: placeholder || undefined });

// IMPORTANT: this bibliography was assembled from recall while building the first release. Every record is a
// lead to be checked against the original publication before anything here is relied on (see About -> Data honesty).
// Records marked `placeholder` do not yet identify a specific publication.
export const SOURCES: Source[] = [
  // --- Human origins, fossils, early technology
  s('harmand2015', 'Harmand S. et al. (2015) 3.3-million-year-old stone tools from Lomekwi 3, West Turkana, Kenya. Nature 521:310–315.', 'primary', 'Palaeoanthropology', 'high', 'Excavation report; stratigraphy and palaeomagnetic dating. Toolmaker species unknown.'),
  s('lordkipanidze2013', 'Lordkipanidze D. et al. (2013) A complete skull from Dmanisi, Georgia, and the evolutionary biology of early Homo. Science 342:326–331.', 'primary', 'Palaeoanthropology', 'high'),
  s('berna2012', 'Berna F. et al. (2012) Microstratigraphic evidence of in situ fire in the Acheulean strata of Wonderwerk Cave, Northern Cape province, South Africa. PNAS 109:E1215–E1220.', 'primary', 'Archaeology / geoarchaeology', 'high', 'Micromorphology and FTIR of burnt bone and ash; interpretation of hominin control of fire is the debated step.'),
  s('zhu2018', 'Zhu Z. et al. (2018) Hominin occupation of the Chinese Loess Plateau since about 2.1 million years ago. Nature 559:608–612.', 'primary', 'Archaeology / magnetostratigraphy', 'high'),
  s('dirks2017', 'Dirks P.H.G.M. et al. (2017) The age of Homo naledi and associated sediments in the Rising Star Cave, South Africa. eLife 6:e24231.', 'primary', 'Geochronology', 'high', 'Combined U-Th, ESR and palaeomagnetism; the age of 335–236 ka is itself discussed.'),
  s('hublin2017', 'Hublin J.-J. et al. (2017) New fossils from Jebel Irhoud, Morocco and the pan-African origin of Homo sapiens. Nature 546:289–292.', 'primary', 'Palaeoanthropology', 'high'),
  s('richter2017', 'Richter D. et al. (2017) The age of the hominin fossils from Jebel Irhoud, Morocco, and the origins of the Middle Stone Age. Nature 546:293–296.', 'primary', 'Geochronology', 'high', 'Thermoluminescence dating of burnt flint; 315 ± 34 ka.'),
  s('vidal2022', 'Vidal C.M. et al. (2022) Age of the oldest known Homo sapiens from eastern Africa. Nature 601:579–583.', 'primary', 'Geochronology', 'high', 'Dates the Omo Kibish Formation volcanic ash; minimum age ~233 ka.'),
  s('hershkovitz2018', 'Hershkovitz I. et al. (2018) The earliest modern humans outside Africa. Science 359:456–459.', 'primary', 'Palaeoanthropology', 'high', 'Misliya-1 maxilla; taxonomic assignment of a partial maxilla is debated.'),
  s('harvati2019', 'Harvati K. et al. (2019) Apidima Cave fossils provide earliest evidence of Homo sapiens in Eurasia. Nature 571:500–504.', 'primary', 'Palaeoanthropology', 'high', 'Apidima 1 is badly damaged; classification and dating are disputed.'),
  s('sutikna2016', 'Sutikna T. et al. (2016) Revised stratigraphy and chronology for Homo floresiensis at Liang Bua in Indonesia. Nature 532:366–369.', 'primary', 'Geochronology', 'high'),
  s('stringer2016', 'Stringer C. (2016) The origin and evolution of Homo sapiens. Philosophical Transactions of the Royal Society B 371:20150237.', 'secondary', 'Palaeoanthropology', 'high'),
  s('clarkson2017', 'Clarkson C. et al. (2017) Human occupation of northern Australia by 65,000 years ago. Nature 547:306–310.', 'primary', 'Archaeology / luminescence dating', 'high', 'Dating and stratigraphic integrity of Madjedbebe are contested in print.'),

  // --- Ancient DNA
  s('green2010', 'Green R.E. et al. (2010) A draft sequence of the Neandertal genome. Science 328:710–722.', 'primary', 'Ancient DNA', 'high'),
  s('reich2010', 'Reich D. et al. (2010) Genetic history of an archaic hominin group from Denisova Cave in Siberia. Nature 468:1053–1060.', 'primary', 'Ancient DNA', 'high'),
  s('prufer2014', 'Prüfer K. et al. (2014) The complete genome sequence of a Neanderthal from the Altai Mountains. Nature 505:43–49.', 'primary', 'Ancient DNA', 'high'),
  s('fu2014', 'Fu Q. et al. (2014) Genome sequence of a 45,000-year-old modern human from western Siberia. Nature 514:445–449.', 'primary', 'Ancient DNA', 'high'),
  s('raghavan2014', 'Raghavan M. et al. (2014) Upper Palaeolithic Siberian genome reveals dual ancestry of Native Americans. Nature 505:87–91.', 'primary', 'Ancient DNA', 'high'),
  s('rasmussen2014', 'Rasmussen M. et al. (2014) The genome of a Late Pleistocene human from a Clovis burial site in western Montana. Nature 506:225–229.', 'primary', 'Ancient DNA', 'high'),
  s('haak2015', 'Haak W. et al. (2015) Massive migration from the steppe was a source for Indo-European languages in Europe. Nature 522:207–211.', 'primary', 'Ancient DNA', 'high', 'Genetic ancestry is not language; the language inference is a separate step.'),
  s('allentoft2015', 'Allentoft M.E. et al. (2015) Population genomics of Bronze Age Eurasia. Nature 522:167–172.', 'primary', 'Ancient DNA', 'high'),
  s('hofmanova2016', 'Hofmanová Z. et al. (2016) Early farmers from across Europe directly descended from Neolithic Aegeans. PNAS 113:6886–6891.', 'primary', 'Ancient DNA', 'high'),
  s('hublin2020', 'Hublin J.-J. et al. (2020) Initial Upper Palaeolithic Homo sapiens from Bacho Kiro Cave, Bulgaria. Nature 581:299–302.', 'primary', 'Palaeoanthropology / ancient DNA', 'high'),
  s('ioannidis2020', 'Ioannidis A.G. et al. (2020) Native American gene flow into Polynesia predating Easter Island settlement. Nature 583:572–577.', 'primary', 'Population genetics', 'high', 'Contact is inferred from admixture dating; the physical route and the number of contacts remain open.'),
  s('patin2017', 'Patin E. et al. (2017) Dispersals and genetic adaptation of Bantu-speaking populations in Africa and North America. Science 356:543–546.', 'primary', 'Population genetics', 'high'),

  // --- Symbolic behaviour
  s('henshilwood2011', 'Henshilwood C.S. et al. (2011) A 100,000-year-old ochre-processing workshop at Blombos Cave, South Africa. Science 334:219–222.', 'primary', 'Archaeology', 'high'),
  s('henshilwood2018', 'Henshilwood C.S. et al. (2018) An abstract drawing from the 73,000-year-old levels at Blombos Cave, South Africa. Nature 562:115–118.', 'primary', 'Archaeology', 'high'),
  s('brumm2021', 'Brumm A. et al. (2021) Oldest cave art found in Sulawesi. Science Advances 7:eabd4648.', 'primary', 'Archaeology / U-series dating', 'high'),
  s('oktaviana2024', 'Oktaviana A.A. et al. (2024) Narrative cave art in Indonesia by 51,200 years ago. Nature 631:814–818.', 'primary', 'Archaeology / U-series dating', 'high'),
  s('quiles2016', 'Quiles A. et al. (2016) A high-precision chronological model for the decorated Upper Paleolithic cave of Chauvet-Pont d’Arc, Ardèche, France. PNAS 113:4670–4675.', 'primary', 'Radiocarbon chronology', 'high'),
  s('conard2009', 'Conard N.J. (2009) A female figurine from the basal Aurignacian of Hohle Fels Cave in southwestern Germany. Nature 459:248–252.', 'primary', 'Archaeology', 'high'),
  s('hoffmann2018', 'Hoffmann D.L. et al. (2018) U-Th dating of carbonate crusts reveals Neandertal origin of Iberian cave art. Science 359:912–915.', 'primary', 'U-series dating', 'mixed', 'Dating method and what the crusts actually date have been challenged in published replies.'),

  // --- Americas
  s('bennett2021', 'Bennett M.R. et al. (2021) Evidence of humans in North America during the Last Glacial Maximum. Science 373:1528–1531.', 'primary', 'Geochronology / ichnology', 'high'),
  s('pigati2023', 'Pigati J.S. et al. (2023) Independent age estimates resolve the controversy of ancient human footprints at White Sands. Science 382:73–75.', 'primary', 'Geochronology', 'high', 'Re-dating (pollen and OSL) addressing the reservoir-effect objection to the 2021 ryegrass seeds.'),
  s('dillehay2015', 'Dillehay T.D. et al. (2015) New archaeological evidence for an early human presence at Monte Verde, Chile. PLoS ONE 10:e0141923.', 'primary', 'Archaeology', 'high'),
  s('holen2017', 'Holen S.R. et al. (2017) A 130,000-year-old archaeological site in southern California, USA. Nature 544:479–483.', 'primary', 'Archaeology', 'mixed', 'Extraordinary claim; the possibility that the breakage is natural has been argued in replies.'),
  s('boeda2014', 'Boëda E. et al. (2014) A new late Pleistocene archaeological sequence in South America: the Vale da Pedra Furada (Piauí, Brazil). Antiquity 88:927–955.', 'primary', 'Archaeology', 'mixed', 'Whether the quartz cobbles are artefacts or naturally fractured is the core dispute.'),
  s('pedersen2016', 'Pedersen M.W. et al. (2016) Postglacial viability and colonization in North America’s ice-free corridor. Nature 537:45–49.', 'primary', 'Sedimentary DNA / palaeoecology', 'high'),
  s('erlandson2007', 'Erlandson J.M. et al. (2007) The Kelp Highway hypothesis: marine ecology, the coastal migration theory, and the peopling of the Americas. Journal of Island and Coastal Archaeology 2:161–174.', 'secondary', 'Archaeology', 'high'),

  // --- Monuments, settlements
  s('schmidt2012', 'Schmidt K. (2012) Göbekli Tepe: A Stone Age Sanctuary in South-Eastern Anatolia. Ex Oriente.', 'secondary', 'Archaeology', 'high', 'Excavator’s synthesis; interpretations are the excavator’s.'),
  s('dietrich2012', 'Dietrich O. et al. (2012) The role of cult and feasting in the emergence of Neolithic communities: new evidence from Göbekli Tepe. Antiquity 86:674–695.', 'primary', 'Archaeology', 'high'),
  s('banning2011', 'Banning E.B. (2011) So fair a house: Göbekli Tepe and the identification of temples in the Pre-Pottery Neolithic of the Near East. Current Anthropology 52:619–660.', 'secondary', 'Archaeology', 'high', 'Argues the enclosures may have been domestic buildings; a main alternative to the cult-centre reading.'),
  s('sweatman2017', 'Sweatman M.B., Tsikritsis D. (2017) Decoding Göbekli Tepe with archaeoastronomy: what does the fox say? Mediterranean Archaeology and Archaeometry 17(1):233–250.', 'alternative', 'Archaeoastronomy', 'low', 'Matches pillar carvings to constellations and a proposed impact; relies on selection of carvings and on the identification of the symbols.'),
  s('hodder2006', 'Hodder I. (2006) The Leopard’s Tale: Revealing the Mysteries of Çatalhöyük. Thames & Hudson.', 'secondary', 'Archaeology', 'high'),
  s('kenyon1957', 'Kenyon K.M. (1957) Digging Up Jericho. Benn.', 'primary', 'Archaeology', 'mixed', 'Mid-century excavation; chronology since revised.'),
  s('baryosef1986', 'Bar-Yosef O. (1986) The walls of Jericho: an alternative interpretation. Current Anthropology 27:157–162.', 'secondary', 'Archaeology', 'high'),
  s('malville1998', 'Malville J.M., Wendorf F., Mazar A.A., Schild R. (1998) Megaliths and Neolithic astronomy in southern Egypt. Nature 392:488–491.', 'primary', 'Archaeoastronomy', 'high', 'The calendar-circle interpretation has been critiqued for the small number of alignment points.'),
  s('parkerpearson2012', 'Parker Pearson M. (2012) Stonehenge: Exploring the Greatest Stone Age Mystery. Simon & Schuster.', 'secondary', 'Archaeology', 'high'),
  s('okelly1982', 'O’Kelly M.J. (1982) Newgrange: Archaeology, Art and Legend. Thames & Hudson.', 'primary', 'Archaeology', 'high'),
  s('scarre2011', 'Scarre C. (2011) Landscapes of Neolithic Brittany. Oxford University Press.', 'secondary', 'Archaeology', 'high'),
  s('trump2002', 'Trump D.H. (2002) Malta: Prehistory and Temples. Midsea Books.', 'secondary', 'Archaeology', 'high'),
  s('wiegand1921', 'Wiegand T., Schulz B. (eds) (1921–1925) Baalbek: Ergebnisse der Ausgrabungen und Untersuchungen in den Jahren 1898 bis 1905. De Gruyter.', 'primary', 'Archaeology / architecture', 'high', 'Early excavation; later German Archaeological Institute work refines the building history.'),
  s('tallet2017', 'Tallet P. (2017) Les papyrus de la mer Rouge I: Le « journal de Merer » (Papyrus Jarf A et B). IFAO.', 'primary', 'Egyptology', 'high', 'Logbook of a work-gang leader hauling limestone to Giza in the reign of Khufu.'),
  s('bronkramsey2010', 'Bronk Ramsey C. et al. (2010) Radiocarbon-based chronology for dynastic Egypt. Science 328:1554–1557.', 'primary', 'Radiocarbon chronology', 'high'),
  s('hornung2006', 'Hornung E., Krauss R., Warburton D.A. (eds) (2006) Ancient Egyptian Chronology. Brill.', 'secondary', 'Egyptology', 'high'),
  s('reader2001', 'Reader C. (2001) A geomorphological study of the Giza Necropolis, with implications for the development of the site. Archaeometry 43:149–165.', 'primary', 'Geomorphology', 'high', 'Argues the Sphinx may predate Khafre but remains within the Early Dynastic range.'),
  s('schoch1992', 'Schoch R.M. (1992) Redating the Great Sphinx of Giza. KMT 3(2):52–59.', 'alternative', 'Geology', 'low', 'Argues precipitation-induced weathering implies a pre-dynastic date; widely rebutted by Egyptologists and some geologists.'),
  s('hancock1996', 'Bauval R., Hancock G. (1996) Keeper of Genesis / The Message of the Sphinx. Heinemann.', 'alternative', 'Popular synthesis', 'low', 'Source of hypotheses and leads, not independent verification.'),
  s('vranich2006', 'Vranich A. (2006) The construction and reconstruction of ritual space at Tiwanaku, Bolivia (A.D. 500–1000). Journal of Field Archaeology 31:121–136.', 'primary', 'Archaeology', 'high'),
  s('protzen1993', 'Protzen J.-P. (1993) Inca Architecture and Construction at Ollantaytambo. Oxford University Press.', 'primary', 'Architecture / archaeology', 'high', 'Experimental replication of Inca stonecutting.'),
  s('athens1983', 'J.S. Athens — archaeological work on the megalithic ruins of Nan Madol, Pohnpei (1980s). Specific publication to be located.', 'secondary', 'Archaeology', 'unassessed', 'Exact bibliographic details to be located.', true),
  s('hunt2006', 'Hunt T.L., Lipo C.P. (2006) Late colonization of Easter Island. Science 311:1603–1606.', 'primary', 'Radiocarbon chronology', 'high'),
  s('wilmshurst2011', 'Wilmshurst J.M. et al. (2011) High-precision radiocarbon dating shows recent and rapid initial human colonization of East Polynesia. PNAS 108:1815–1820.', 'primary', 'Radiocarbon chronology', 'high'),
  s('natawidjaja2023', 'Natawidjaja D.H. et al. (2023) Geo-archaeological prospection of Gunung Padang buried prehistoric pyramid in West Java, Indonesia. Archaeological Prospection (later retracted).', 'primary', 'Geophysics / radiocarbon', 'low', 'Retracted in 2024 by the publisher; radiocarbon samples were reported not to date the claimed structure.'),
  s('ghezzi2007', 'Ghezzi I., Ruggles C. (2007) Chankillo: a 2300-year-old solar observatory in coastal Peru. Science 315:1239–1243.', 'primary', 'Archaeoastronomy', 'high'),
  s('shady2001', 'Shady Solís R., Haas J., Creamer W. (2001) Dating Caral, a preceramic site in the Supe Valley on the central coast of Peru. Science 292:723–726.', 'primary', 'Radiocarbon chronology', 'high'),
  s('canuto2018', 'Canuto M.A. et al. (2018) Ancient lowland Maya complexity as revealed by airborne laser scanning of northern Guatemala. Science 361:eaau0137.', 'primary', 'Remote sensing / archaeology', 'high', 'LiDAR shows structures, not dates; population estimates are model-dependent.'),
  s('prumers2022', 'Prümers H. et al. (2022) Lidar reveals pre-Hispanic low-density urbanism in the Bolivian Amazon. Nature 606:325–328.', 'primary', 'Remote sensing / archaeology', 'high'),
  s('rostain2024', 'Rostain S. et al. (2024) Two thousand years of garden urbanism in the Upper Amazon. Science 383:183–189.', 'primary', 'Remote sensing / archaeology', 'high'),
  s('diehl2004', 'Diehl R.A. (2004) The Olmecs: America’s First Civilization. Thames & Hudson.', 'secondary', 'Archaeology', 'high'),
  s('cowgill2015', 'Cowgill G.L. (2015) Ancient Teotihuacan: Early City of Immense Power. Cambridge University Press.', 'secondary', 'Archaeology', 'high'),
  s('burger1992', 'Burger R.L. (1992) Chavín and the Origins of Andean Civilization. Thames & Hudson.', 'secondary', 'Archaeology', 'high'),
  s('ortmann2013', 'Ortmann A.L., Kidder T.R. (2013) Building Mound A at Poverty Point, Louisiana: monumental public architecture, ritual practice, and implications for hunter-gatherer complexity. Geoarchaeology 28:66–86.', 'primary', 'Geoarchaeology', 'high'),
  s('pauketat2009', 'Pauketat T.R. (2009) Cahokia: Ancient America’s Great City on the Mississippi. Viking.', 'secondary', 'Archaeology', 'high'),
  s('herrmann2014', 'Herrmann E.W. et al. (2014) A new multistage construction chronology for the Great Serpent Mound, USA. Journal of Archaeological Science 50:117–125.', 'primary', 'Radiocarbon chronology', 'high', 'Supports a much earlier date than the Fort Ancient attribution; the dating question remains argued.'),
  s('fletcher1996', 'Fletcher R., Cameron T., Lepper B., Wymer D., Pickard W. (1996) Serpent Mound: a Fort Ancient icon? Midcontinental Journal of Archaeology 21:105–143.', 'primary', 'Archaeology', 'mixed', 'Earlier chronology favouring a Fort Ancient attribution; details to be checked.'),
  s('pikirayi2001', 'Pikirayi I. (2001) The Zimbabwe Culture: Origins and Decline of Southern Zambezian States. AltaMira Press.', 'secondary', 'Archaeology', 'high'),
  s('welsby1996', 'Welsby D.A. (1996) The Kingdom of Kush: The Napatan and Meroitic Empires. British Museum Press.', 'secondary', 'Archaeology', 'high'),
  s('breunig2014', 'Breunig P. (2014) Nok: African Sculpture in Archaeological Context. Africa Magna.', 'secondary', 'Archaeology', 'high'),
  s('mcintosh1980', 'McIntosh S.K., McIntosh R.J. (1980) Prehistoric Investigations in the Region of Jenne, Mali. BAR International Series.', 'primary', 'Archaeology', 'high'),
  s('phillipson2012', 'Phillipson D.W. (2012) Foundations of an African Civilisation: Aksum and the Northern Horn, 1000 BC–AD 1300. James Currey.', 'secondary', 'Archaeology', 'high'),
  s('mattingly2003', 'Mattingly D.J. (ed.) (2003) The Archaeology of Fazzān, Vol. 1: Synthesis. Society for Libyan Studies.', 'primary', 'Archaeology', 'high'),
  s('nissen1988', 'Nissen H.J. (1988) The Early History of the Ancient Near East, 9000–2000 B.C. University of Chicago Press.', 'secondary', 'Near Eastern archaeology', 'high'),

  // --- Submerged landscapes, sea level, environment
  s('bailey2008', 'Bailey G.N., Flemming N.C. (2008) Archaeology of the continental shelf: marine resources, submerged landscapes and underwater archaeology. Quaternary Science Reviews 27:2153–2165.', 'secondary', 'Submerged archaeology', 'high'),
  s('gaffney2007', 'Gaffney V., Thomson K., Fitch S. (eds) (2007) Mapping Doggerland: The Mesolithic Landscapes of the Southern North Sea. Archaeopress.', 'primary', 'Seismic survey / landscape archaeology', 'high'),
  s('momber2011', 'Momber G. et al. (2011) Mesolithic Occupation at Bouldnor Cliff and the Submerged Prehistoric Landscapes of the Solent. CBA Research Report 164.', 'primary', 'Submerged archaeology', 'high'),
  s('smith2015', 'Smith O. et al. (2015) Sedimentary DNA from a submerged site reveals wheat in the British Isles 8000 years ago. Science 347:998–1001.', 'primary', 'Sedimentary ancient DNA', 'mixed', 'Contested in published comments on contamination and on dating.'),
  s('galili1993', 'Galili E. et al. (1993) Atlit-Yam: a prehistoric site on the sea floor off the Israeli coast. Journal of Field Archaeology 20:133–157.', 'primary', 'Submerged archaeology', 'high'),
  s('henderson2011', 'Henderson J.C., Gallou C., Flemming N.C., Spondylis E. (2011) The Pavlopetri Underwater Archaeology Project: investigating an ancient submerged town. In: Benjamin J. et al. (eds) Submerged Prehistory. Oxbow.', 'primary', 'Submerged archaeology', 'high'),
  s('rose2010', 'Rose J.I. (2010) New light on human prehistory in the Arabo-Persian Gulf Oasis. Current Anthropology 51:849–883.', 'secondary', 'Archaeology / palaeoenvironment', 'mixed', 'A model proposal; direct archaeological evidence from the now-submerged basin is thin.'),
  s('oppenheimer1998', 'Oppenheimer S. (1998) Eden in the East: The Drowned Continent of Southeast Asia. Weidenfeld & Nicolson.', 'alternative', 'Synthesis / genetics', 'low', 'A hypothesis about drowned Sundaland as a source region; contested in its use of genetic and linguistic evidence.'),
  s('nunn2016', 'Nunn P.D., Reid N.J. (2016) Aboriginal memories of inundation of the Australian coast dating from more than 7000 years ago. Australian Geographer 47:11–47.', 'primary', 'Ethnography / geomorphology', 'mixed', 'Matches oral traditions to reconstructed sea-level rise; the dating of oral tradition is inferential.'),
  s('lambeck2014', 'Lambeck K., Rouby H., Purcell A., Sun Y., Sambridge M. (2014) Sea level and global ice volumes from the Last Glacial Maximum to the Holocene. PNAS 111:15296–15303.', 'primary', 'Sea-level modelling', 'high'),
  s('deschamps2012', 'Deschamps P. et al. (2012) Ice-sheet collapse and sea-level rise at the Bølling warming 14,600 years ago. Nature 483:559–564.', 'primary', 'Sea-level proxy', 'high'),
  s('clark2009', 'Clark P.U. et al. (2009) The Last Glacial Maximum. Science 325:710–714.', 'secondary', 'Palaeoclimate', 'high'),
  s('ambrose1998', 'Ambrose S.H. (1998) Late Pleistocene human population bottlenecks, volcanic winter, and differentiation of modern humans. Journal of Human Evolution 34:623–651.', 'primary', 'Palaeoanthropology', 'mixed', 'The original Toba-bottleneck proposal; later work questions the climatic and genetic premises.'),
  s('lane2013', 'Lane C.S., Chorn B.T., Johnson T.C. (2013) Ash from the Toba supereruption in Lake Malawi shows no volcanic winter in East Africa at 75 ka. PNAS 110:8025–8029.', 'primary', 'Tephrochronology / palaeoecology', 'high'),
  s('firestone2007', 'Firestone R.B. et al. (2007) Evidence for an extraterrestrial impact 12,900 years ago that contributed to the megafaunal extinctions and the Younger Dryas cooling. PNAS 104:16016–16021.', 'primary', 'Geochemistry', 'mixed', 'Original proposal; marker identifications and reproducibility have been challenged.'),
  s('holliday2014', 'Holliday V.T. et al. (2014) The Younger Dryas impact hypothesis: a critical review. Quaternary Science Reviews 83.', 'skeptical', 'Geology / archaeology', 'high', 'Review concluding the proposed markers are not reproducibly diagnostic of impact.'),
  s('moore2020', 'Moore A.M.T. et al. (2020) Evidence of cosmic impact at Abu Hureyra, Syria at the Younger Dryas onset (~12.8 ka): high-temperature melting at >2200 °C. Scientific Reports 10:4185.', 'primary', 'Geochemistry', 'mixed', 'Proponent-side analysis of a settlement-layer melt; interpretation contested.'),
  s('kjaer2022', 'Kjær K.H. et al. (2022) Hiawatha impact crater dated to ~58 million years ago. Science Advances (details to confirm).', 'primary', 'Geochronology', 'high', 'Dates the Greenland crater to the Paleocene, ruling it out as a Younger Dryas impact.', true),
  s('reinig2021', 'Reinig F. et al. (2021) Precise date for the Laacher See eruption synchronizes the Younger Dryas. Nature 595:66–69.', 'primary', 'Dendrochronology', 'high'),
  s('demenocal2000', 'deMenocal P. et al. (2000) Abrupt onset and termination of the African Humid Period: rapid climate responses to gradual insolation forcing. Quaternary Science Reviews 19:347–361.', 'primary', 'Palaeoclimate', 'high'),
  s('ryan1998', 'Ryan W., Pitman W. (1998) Noah’s Flood: The New Scientific Discoveries About the Event That Changed History. Simon & Schuster.', 'secondary', 'Marine geology', 'mixed', 'The catastrophic Black Sea reflooding hypothesis; a popular exposition by the proposing scientists.'),
  s('yanchilina2017', 'Yanchilina A.G. et al. (2017) Compilation of geophysical, geochronological, and geochemical evidence indicates a rapid Mediterranean-derived submergence of the Black Sea’s shelf and subsequent substantial salinity increase and biotic change. Marine Geology 383:14–34.', 'primary', 'Marine geology', 'mixed', 'Supports rapid reflooding; other studies favour gradual rise.'),
  s('weiss1993', 'Weiss H. et al. (1993) The genesis and collapse of third millennium North Mesopotamian civilization. Science 261:995–1004.', 'primary', 'Archaeology / palaeoclimate', 'mixed', 'The 4.2 ka aridification-collapse link is debated.'),
  s('wu2016', 'Wu Q. et al. (2016) Outburst flood at 1920 BCE supports historicity of China’s Great Flood and the Xia dynasty. Science 353:579–582.', 'primary', 'Geomorphology / radiocarbon', 'mixed', 'Dates a real flood; the link to the Xia dynasty and the Yu flood narrative is inferential.'),
  s('baker1973', 'Baker V.R. (1973) Paleohydrology and Sedimentology of Lake Missoula Flooding in Eastern Washington. Geological Society of America Special Paper 144.', 'primary', 'Geomorphology', 'high'),
  s('faith2009', 'Faith J.T., Surovell T.A. (2009) Synchronous extinction of North America’s Pleistocene mammals. PNAS 106:20641–20645.', 'primary', 'Palaeontology', 'high'),
  s('manning2006', 'Manning S.W. et al. (2006) Chronology for the Aegean Late Bronze Age 1700–1400 B.C. Science 312:565–569.', 'primary', 'Radiocarbon chronology', 'high', 'Radiocarbon places the Thera eruption near 1600 BCE, earlier than the archaeological chronology.'),
  s('friedrich2000', 'Friedrich W.L. (2000) Fire in the Sea: The Santorini Volcano. Cambridge University Press.', 'secondary', 'Volcanology / archaeology', 'high'),

  // --- Texts and records
  s('plato', 'Plato, Timaeus 20d–25d and Critias 108e–121c (c. 360–355 BCE). Greek text with translation, e.g. Loeb Classical Library.', 'primary', 'Classical philology', 'high', 'The only surviving ancient source for Atlantis. Genre and intent are the central questions.'),
  s('vidalnaquet2007', 'Vidal-Naquet P. (2007) The Atlantis Story: A Short History of Plato’s Myth. University of Exeter Press.', 'secondary', 'Classical reception', 'high'),
  s('jacobsen1939', 'Jacobsen T. (1939) The Sumerian King List. Assyriological Studies 11, University of Chicago Press.', 'primary', 'Assyriology', 'high'),
  s('george2003', 'George A.R. (2003) The Babylonian Gilgamesh Epic: Introduction, Critical Edition and Cuneiform Texts. Oxford University Press.', 'primary', 'Assyriology', 'high'),
  s('lambert1969', 'Lambert W.G., Millard A.R. (1969) Atra-ḫasīs: The Babylonian Story of the Flood. Clarendon Press.', 'primary', 'Assyriology', 'high'),
  s('wilkinson2000', 'Wilkinson T.A.H. (2000) Royal Annals of Ancient Egypt: The Palermo Stone and Its Associated Fragments. Kegan Paul.', 'primary', 'Egyptology', 'high'),
  s('gardiner1959', 'Gardiner A.H. (1959) The Royal Canon of Turin. Griffith Institute.', 'primary', 'Egyptology', 'high'),
  s('milik1976', 'Milik J.T. (1976) The Books of Enoch: Aramaic Fragments of Qumrân Cave 4. Clarendon Press.', 'primary', 'Second Temple texts', 'high'),
  s('nickelsburg2001', 'Nickelsburg G.W.E. (2001) 1 Enoch 1: A Commentary on the Book of 1 Enoch, Chapters 1–36; 81–108. Fortress Press.', 'secondary', 'Second Temple texts', 'high'),
  s('greenberg1983', 'Greenberg M. (1983) Ezekiel 1–20. Anchor Bible 22. Doubleday.', 'secondary', 'Biblical studies', 'high'),
  s('cauville', 'Cauville S. — publications on the Hathor temple at Dendera (Institut français d’archéologie orientale).', 'primary', 'Egyptology', 'unassessed', 'The specific volume describing the crypt reliefs is to be located.', true),

  // --- Artifacts and technology
  s('freeth2006', 'Freeth T. et al. (2006) Decoding the ancient Greek astronomical calculator known as the Antikythera Mechanism. Nature 444:587–591.', 'primary', 'Imaging / history of science', 'high'),
  s('freeth2021', 'Freeth T. et al. (2021) A model of the cosmos in the ancient Greek Antikythera Mechanism. Scientific Reports 11:5821.', 'primary', 'History of science', 'high'),
  s('seymour2023', 'Seymour L.M. et al. (2023) Hot mixing: mechanistic insights into the durability of ancient Roman concrete. Science Advances 9:eadd1602.', 'primary', 'Materials science', 'high'),
  s('keyser1993', 'Keyser P.T. (1993) The purpose of the Parthian galvanic cells: a first-century A.D. electric battery used for analgesia. Journal of Near Eastern Studies 52:81–98.', 'secondary', 'History of technology', 'mixed', 'Argues for an electrical function; speculative, and one of several competing readings.'),
  s('reibold2006', 'Reibold M. et al. (2006) Carbon nanotubes in an ancient Damascus sabre. Nature 444:286.', 'primary', 'Materials science', 'mixed'),
  s('sines1987', 'Sines G., Sakellarakis Y.A. (1987) Lenses in antiquity. American Journal of Archaeology 91:191–196.', 'secondary', 'History of optics', 'high'),

  // --- Maps, astronomy, contact
  s('mcintosh2000', 'McIntosh G.C. (2000) The Piri Reis Map of 1513. University of Georgia Press.', 'secondary', 'History of cartography', 'high'),
  s('soucek1996', 'Soucek S. (1996) Piri Reis and Turkish Mapmaking after Columbus: The Khalili Portolan Atlas. Nour Foundation / Oxford University Press.', 'secondary', 'History of cartography', 'high'),
  s('hapgood1966', 'Hapgood C.H. (1966) Maps of the Ancient Sea Kings: Evidence of Advanced Civilization in the Ice Age. Chilton Books.', 'alternative', 'Popular synthesis', 'low', 'Origin of the Antarctica-before-glaciation claim; relies on selective matching and on distortions of the source map.'),
  s('griaule1950', 'Griaule M., Dieterlen G. (1950) Un système soudanais de Sirius. Journal de la Société des Africanistes 20:273–294.', 'primary', 'Ethnography', 'mixed', 'The original ethnographic report. Chronology and informant context are the questions.'),
  s('vanbeek1991', 'Van Beek W.E.A. (1991) Dogon restudied: a field evaluation of the work of Marcel Griaule. Current Anthropology 32:139–167.', 'primary', 'Ethnography', 'high', 'Restudy that did not find the Sirius material among the Dogon he worked with.'),
  s('temple1976', 'Temple R.K.G. (1976) The Sirius Mystery. Sidgwick & Jackson.', 'alternative', 'Popular synthesis', 'low', 'Interprets Griaule and Dieterlen as evidence of ancient astronomical knowledge.'),
  s('dresden', 'Dresden Codex (Maya, Venus table), Saxon State and University Library Dresden; facsimile and commentary by Thompson J.E.S. (1972).', 'primary', 'Maya epigraphy', 'high'),
  s('nebra', 'Meller H. (ed.) (2004) Der geschmiedete Himmel: Die weite Welt im Herzen Europas vor 3600 Jahren. Theiss.', 'primary', 'Archaeology', 'mixed', 'The excavated-context and dating of the sky disc has been disputed in later literature.'),
  s('babylonian', 'Sachs A.J., Hunger H. (1988–2006) Astronomical Diaries and Related Texts from Babylonia, vols I–VI. Austrian Academy of Sciences.', 'primary', 'Assyriology / history of astronomy', 'high'),

  // --- UAP and government
  s('odni2021', 'Office of the Director of National Intelligence (2021) Preliminary Assessment: Unidentified Aerial Phenomena (25 June 2021).', 'official', 'Government assessment', 'medium', 'Documents that reports exist and are unresolved; it does not establish a cause.'),
  s('aaro2024', 'All-domain Anomaly Resolution Office (2024) Report on the Historical Record of U.S. Government Involvement with Unidentified Anomalous Phenomena, Volume 1.', 'official', 'Government assessment', 'medium', 'Concludes it found no verifiable evidence of extraterrestrial technology; critics dispute its scope and access.'),
  s('dod2020', 'U.S. Department of Defense (2020) Statement on the Release of Historical Navy Videos (27 April 2020): FLIR1, Gimbal, GoFast.', 'official', 'Government release', 'high', 'Authenticates the videos as Navy footage; it makes no claim about their cause.'),
  s('nyt2017', 'Cooper H., Blumenthal R., Kean L. (2017) Glowing auras and ‘black money’: the Pentagon’s mysterious U.F.O. program. The New York Times, 16 December 2017.', 'secondary', 'Journalism', 'mixed', 'Journalistic first publication of the Nimitz account to a general audience.'),
  s('mickwest', 'Independent technical analyses of the Gimbal and GoFast videos (e.g. parallax and glare-rotation analyses by M. West, Metabunk).', 'skeptical', 'Independent video analysis', 'mixed', 'Mundane explanations; assumptions about sensor geometry are the weak point.', true),
  s('hastings2008', 'Hastings R. (2008) UFOs and Nukes: Extraordinary Encounters at Nuclear Weapons Sites. AuthorHouse.', 'alternative', 'Witness interviews', 'low', 'Retrospective interview collection; primary documentation varies case by case.'),
  s('salas2005', 'Salas R., Klotz J. (2005) Faded Giant. BookSurge.', 'alternative', 'Witness account', 'low', 'First-person retrospective testimony decades after the 1967 events.'),
  s('wickiana', 'Wickiana collection (Johann Jakob Wick), Zentralbibliothek Zürich; includes broadsheets on the 1561 Nuremberg and 1566 Basel sky phenomena.', 'primary', 'Early modern print', 'high', 'Contemporary reports are sermon-like and interpret the sky as portent.'),
  s('ibaraki1803', 'Japanese Edo-period accounts of the 1803 ‘utsuro-bune’ (Hitachi coast) in Kōzō zatsuwa and related manuscripts.', 'primary', 'Edo-period manuscripts', 'low', 'Later retellings differ; the earliest source and its genre need re-establishing.', true),

  s('renfrew1966', 'Renfrew C., Dixon J.E., Cann J.R. (1966) Obsidian and early cultural contact in the Near East. Proceedings of the Prehistoric Society 32:30–72.', 'primary', 'Archaeometry', 'high'),
  s('hansen2012', 'Hansen V. (2012) The Silk Road: A New History. Oxford University Press.', 'secondary', 'History', 'high'),
  s('casson1989', 'Casson L. (1989) The Periplus Maris Erythraei: Text with Introduction, Translation, and Commentary. Princeton University Press.', 'primary', 'Classical texts', 'high', 'Translation and commentary on an anonymous 1st-century CE Greek merchant’s guide.'),

  // --- Esoteric movements
  s('goodrickclarke1985', 'Goodrick-Clarke N. (1985) The Occult Roots of Nazism: Secret Aryan Cults and Their Influence on Nazi Ideology. Aquarian Press.', 'secondary', 'History of ideas', 'high'),
  s('kater1974', 'Kater M.H. (1974) Das ‘Ahnenerbe’ der SS 1935–1945. Deutsche Verlags-Anstalt.', 'primary', 'Archival history', 'high', 'Archival study of the SS research organisation.'),
  s('pringle2006', 'Pringle H. (2006) The Master Plan: Himmler’s Scholars and the Holocaust. Hyperion.', 'secondary', 'History', 'high'),

  // --- Placeholders for claims whose primary literature still has to be located
  s('shinn', 'E.A. Shinn — geological assessment of the Bimini ‘road’ as beachrock (USGS). Specific publication to be located.', 'secondary', 'Geology', 'unassessed', 'Beachrock explanation; check the original paper.', true),
  s('kimura', 'M. Kimura — surveys and publications on the Yonaguni formations (University of the Ryukyus). Specific publication to be located.', 'alternative', 'Marine geology / archaeology', 'unassessed', 'Argues for human modification; check original reports and geological rebuttals.', true),
  s('khambhat', 'Reports on submerged structures in the Gulf of Khambhat announced by Indian government agencies from 2001. Specific reports to be located.', 'primary', 'Marine survey', 'unassessed', 'Chronology and anthropogenic origin have to be established from the primary survey data.', true),
];

export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(SOURCES.map(x => [x.id, x]));
