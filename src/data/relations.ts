import type { Link, Relation, Confidence } from '../types';

// Evidence-graph edges (master prompt §11). Every edge carries a relation type, a confidence, a note and sources.
// Relations are claims about the EVIDENCE, and the UI repeats the caution that correlation is not causation,
// similarity is not contact, and chronological overlap is not interaction.
const L = (a: string, b: string, rel: Relation, conf: Confidence, note: string, src: string[] = []): Link => ({ a, b, rel, conf, note, src });

export const LINKS: Link[] = [
  // --- Connection A: early monumental construction
  L('gobekli-tepe', 'karahan-tepe', 'shares_characteristics_with', 'high', 'T-pillar architecture and carved animals in both; part of one regional network.', ['schmidt2012']),
  L('gobekli-tepe', 'karahan-tepe', 'geographically_associated_with', 'high', 'About 40 km apart in the Şanlıurfa uplands.'),
  L('gobekli-tepe', 'jericho', 'correlates_with', 'medium', 'Contemporary Pre-Pottery Neolithic monumental/communal building in the Levant and Upper Mesopotamia; contact is plausible but not shown by this alone.'),
  L('gobekli-tepe', 'catalhoyuk', 'predates', 'high', 'Göbekli Tepe’s main phases are roughly 2,500 years earlier than Çatalhöyük.', ['schmidt2012', 'hodder2006']),
  L('gobekli-tepe', 'younger-dryas', 'correlates_with', 'low', 'Construction begins near the end of the Younger Dryas; no causal link is demonstrated.'),
  L('gobekli-tepe', 'younger-dryas-abu-hureyra', 'correlates_with', 'low', 'Both lie in the Upper Euphrates region at around the Younger Dryas onset; the proposed impact layer is contested.', ['moore2020']),
  L('gobekli-tepe', 'poverty-point', 'shares_characteristics_with', 'low', 'Monumental building by non-farming societies; similarity is of social type, not evidence of contact.', ['ortmann2013']),
  L('gobekli-tepe', 'nabta-playa', 'shares_characteristics_with', 'low', 'Both are early ritual/ceremonial landscapes built by non-urban societies about 3,000 years apart; no contact is shown.'),
  L('gobekli-tepe', 'atlantis-plato', 'contradicts', 'medium', 'Göbekli Tepe is a Stone-Age site; it does not support a technologically advanced predecessor.', ['schmidt2012']),

  // --- Connection B: lost coastal landscapes
  L('lgm', 'mwp1a', 'predates', 'high', 'Sea-level rise follows the glacial maximum.', ['lambeck2014']),
  L('mwp1a', 'doggerland', 'potentially_influenced', 'medium', 'Rising seas progressively flooded the shelf plains.', ['gaffney2007', 'bailey2008']),
  L('mwp1a', 'sundaland', 'potentially_influenced', 'medium', 'Rapid rise contributed to the shrinking of Sundaland.', ['bailey2008']),
  L('mwp1a', 'sahul-oral', 'potentially_influenced', 'low', 'Proposed: the traditions preserve memory of post-glacial sea-level rise. The stories match later phases of the rise (~10–7 ka) better than MWP-1A itself; dating of oral accounts is inferential.', ['nunn2016']),
  L('lgm', 'beringia', 'supports', 'high', 'Low sea level exposed the Bering land bridge.', ['lambeck2014']),
  L('storegga', 'doggerland', 'potentially_influenced', 'medium', 'The tsunami struck what remained of Doggerland.', ['gaffney2007']),
  L('persian-gulf', 'lgm', 'derived_from', 'medium', 'The Gulf basin was dry land at low sea level.', ['rose2010']),
  L('beringia', 'white-sands', 'correlates_with', 'low', 'A route from Beringia is assumed but not demonstrated; the two are ~5,400 km apart.'),
  L('beringia', 'monte-verde', 'potentially_influenced', 'medium', 'Genetic and archaeological models derive Monte Verde’s population from Beringian ancestors.', ['raghavan2014', 'dillehay2015']),
  L('malta-siberia', 'anzick', 'supports', 'high', 'Both genomes carry ancient North Eurasian ancestry in the Native American lineage.', ['raghavan2014', 'rasmussen2014']),
  L('bouldnor-cliff', 'doggerland', 'shares_characteristics_with', 'medium', 'Mesolithic drowned-landscape archaeology in the same sea-level history.', ['momber2011']),
  L('mwp1a', 'atlit-yam', 'predates', 'low', 'Atlit-Yam was drowned by Holocene sea-level rise, which continued long after MWP-1A; the pulse itself is earlier and not the cause.', ['galili1993', 'lambeck2014']),

  // --- Connection C: flood memory
  L('atrahasis', 'gilgamesh-xi', 'predates', 'high', 'Old Babylonian Atrahasis is older than the Standard Gilgamesh flood tablet.', ['lambert1969', 'george2003']),
  L('gilgamesh-xi', 'atrahasis', 'derived_from', 'high', 'The flood tablet reuses Atrahasis plot and language.', ['george2003']),
  L('genesis-flood', 'gilgamesh-xi', 'derived_from', 'medium', 'Shared motifs; direction of transmission via exile-era Mesopotamia is widely, not universally, held.', ['george2003']),
  L('genesis-flood', 'atrahasis', 'shares_characteristics_with', 'high', 'Shared sequence of divine decision, survivor, boat and sacrifice.', ['lambert1969']),
  L('black-sea', 'genesis-flood', 'potentially_influenced', 'low', 'Proposed as a seed event; the evidence for a chain of transmission is missing.', ['ryan1998']),
  L('jishi-flood', 'sahul-oral', 'shares_characteristics_with', 'low', 'Both are cases where a real event and an oral/textual flood tradition are compared; they are independent.', ['wu2016', 'nunn2016']),
  L('event-4k2', 'uruk', 'correlates_with', 'low', 'Aridity is argued to have affected Mesopotamian societies; causality is debated.', ['weiss1993']),
  L('akrotiri', 'thera-eruption', 'supports', 'high', 'Excavation at Akrotiri documents the eruption’s burial of a town and supplies the olive branch used for radiocarbon dating.', ['manning2006']),
  L('thera-eruption', 'atlantis-plato', 'potentially_influenced', 'low', 'A proposed source of the story; dates and scale do not match.', ['friedrich2000']),
  L('atlantis-plato', 'richat', 'contradicts', 'high', 'Plato’s sunken Atlantic island is not a Saharan dome.', ['plato']),
  L('atlantis-plato', 'bimini', 'contradicts', 'high', 'Beachrock is not an engineered road.', ['shinn']),

  // --- Connection D: astronomy
  L('chankillo', 'nabta-playa', 'shares_characteristics_with', 'low', 'Both are monument-based sky observation; independent invention is likely.'),
  L('babylonian-diaries', 'antikythera', 'potentially_influenced', 'high', 'The mechanism’s cycles use Babylonian period relations.', ['freeth2006']),
  L('dresden-codex', 'babylonian-diaries', 'shares_characteristics_with', 'low', 'Both are long-run observational records of Venus and eclipses; no contact is claimed.'),
  L('newgrange', 'stonehenge', 'shares_characteristics_with', 'medium', 'Both have solstice orientation; Newgrange is ~700 years older.', ['okelly1982', 'parkerpearson2012']),
  L('stonehenge', 'carnac', 'correlates_with', 'low', 'Both lie in the Atlantic Neolithic; the astronomical purposes are debated.'),
  L('nebra', 'babylonian-diaries', 'correlates_with', 'low', 'Bronze Age sky-watching in Europe vs later Babylonian records; no link is established.'),

  // --- Connection E: lost civilization hypothesis
  L('lgm', 'sundaland', 'supports', 'high', 'The shelf was exposed at the LGM.', ['lambeck2014']),
  L('younger-dryas', 'megafauna-na', 'correlates_with', 'medium', 'Roughly contemporaneous; the causes of the extinction are debated.', ['faith2009']),
  L('younger-dryas-abu-hureyra', 'younger-dryas', 'potentially_influenced', 'low', 'The impact hypothesis proposes a causal link; most specialists do not accept it.', ['firestone2007', 'holliday2014']),
  L('younger-dryas-abu-hureyra', 'laacher-see', 'contradicts', 'medium', 'A well-dated volcanic eruption offers a competing trigger.', ['reinig2021']),
  L('laacher-see', 'younger-dryas', 'predates', 'medium', 'Dated to ~12,880 BP, just before or at the onset.', ['reinig2021']),
  L('yd-impact', 'younger-dryas-abu-hureyra', 'supports', 'low', 'A proponent-side analysis of a melt layer.', ['moore2020']),
  L('yd-impact', 'younger-dryas', 'contradicts', 'low', 'Other explanations (meltwater, volcanism) are better supported.', ['holliday2014']),
  L('sphinx', 'giza', 'geographically_associated_with', 'high', 'The Sphinx is within the Khafre complex.', ['reader2001']),
  L('sphinx', 'younger-dryas', 'contradicts', 'medium', 'A ≥ 10,500 BCE date has no supporting archaeology; weathering has other explanations.', ['reader2001']),
  L('gunung-padang', 'younger-dryas', 'contradicts', 'low', 'The deep-pyramid age claim is retracted.', ['natawidjaja2023']),
  L('mwp1a', 'yonaguni', 'potentially_influenced', 'low', 'If the formations were ever human-modified, sea-level rise would have drowned them; no dated human act exists, so this stays hypothetical.'),
  L('mwp1a', 'khambhat', 'potentially_influenced', 'low', 'A claimed drowned structure would have been submerged by Holocene sea-level rise; the anthropogenic origin is unconfirmed.'),

  // --- Egypt & Near East chronology
  L('giza', 'sphinx', 'geographically_associated_with', 'high', 'Same plateau and mortuary landscape.'),
  L('giza', 'palermo-stone', 'independently_corroborates', 'medium', 'Royal annals and archaeology both describe the Old Kingdom court.', ['wilkinson2000', 'bronkramsey2010']),
  L('giza', 'turin-canon', 'independently_corroborates', 'medium', 'King lists agree with radiocarbon chronology within a few decades.', ['bronkramsey2010', 'gardiner1959']),
  L('hierakonpolis', 'giza', 'predates', 'high', 'Predynastic centres precede the Old Kingdom by about a thousand years.', ['hornung2006']),
  L('sumerian-king-list', 'uruk', 'geographically_associated_with', 'high', 'Uruk is one of the listed cities.', ['jacobsen1939']),
  L('sumerian-king-list', 'genesis-flood', 'shares_characteristics_with', 'medium', 'Both separate an antediluvian age with long lives from a flood.', ['jacobsen1939']),
  L('dead-sea-scrolls', 'genesis-flood', 'derived_from', 'medium', 'Enoch fragments expand Genesis 6 material.', ['nickelsburg2001']),
  L('ezekiel-vision', 'dead-sea-scrolls', 'potentially_influenced', 'medium', 'Ezekiel’s throne-chariot imagery shapes later Merkabah and Enoch traditions.', ['greenberg1983']),

  // --- Americas
  L('white-sands', 'monte-verde', 'predates', 'medium', 'About 7,000 years apart; no direct connection shown.', ['bennett2021', 'dillehay2015']),
  L('cerutti', 'white-sands', 'contradicts', 'medium', 'If a 130 ka presence were real, it would predate every other New World site by >100,000 years; the evidence is weak.', ['holen2017']),
  L('pedra-furada', 'monte-verde', 'contradicts', 'low', 'A 50 ka claim is not corroborated by Monte Verde’s ~14.5 ka dates.', ['boeda2014']),
  L('caral', 'chavin', 'predates', 'high', 'Caral’s monumental phase precedes Chavín by about two millennia.', ['shady2001', 'burger1992']),
  L('olmec-san-lorenzo', 'el-mirador', 'predates', 'high', 'Olmec heartland sites precede the Preclassic Maya peak.', ['diehl2004']),
  L('el-mirador', 'maya-lidar', 'geographically_associated_with', 'high', 'Both are in the northern Petén.', ['canuto2018']),
  L('maya-lidar', 'tiwanaku', 'shares_characteristics_with', 'low', 'Low-density, engineered landscapes revealed by LiDAR; no contact.'),
  L('casarabe', 'upano', 'shares_characteristics_with', 'medium', 'Both are Amazonian “garden urbanism” revealed by LiDAR; no direct link is implied.', ['prumers2022', 'rostain2024']),
  L('tiwanaku', 'sacsayhuaman', 'shares_characteristics_with', 'low', 'Fine stonework in the Andes; the two traditions are centuries apart.', ['vranich2006', 'protzen1993']),
  L('serpent-mound', 'cahokia', 'correlates_with', 'low', 'Both are in the Eastern Woodlands; the Fort Ancient date would put them in the same period.', ['fletcher1996']),
  L('poverty-point', 'serpent-mound', 'shares_characteristics_with', 'low', 'Earthwork building in the Eastern Woodlands.'),

  // --- Origins & genetics
  L('lomekwi', 'dmanisi', 'predates', 'high', 'About 1.5 million years apart.', ['harmand2015', 'lordkipanidze2013']),
  L('dmanisi', 'shangchen', 'correlates_with', 'medium', 'Early Eurasian presence; Shangchen’s tools may be earlier than Dmanisi.', ['lordkipanidze2013', 'zhu2018']),
  L('irhoud', 'omo-kibish', 'correlates_with', 'medium', 'Early Homo sapiens-like fossils in North and East Africa, supporting a pan-African origin.', ['hublin2017', 'vidal2022']),
  L('misliya', 'apidima', 'correlates_with', 'medium', 'Both suggest early modern-human presence outside Africa; classification is debated.', ['hershkovitz2018', 'harvati2019']),
  L('denisova-cave', 'vindija', 'shares_characteristics_with', 'high', 'Neanderthal DNA from both informs the Neanderthal genome.', ['prufer2014']),
  L('denisova-cave', 'liang-bua', 'correlates_with', 'low', 'Both show archaic lineages persisting in Asia into the period of Homo sapiens.'),
  L('ust-ishim', 'vindija', 'independently_corroborates', 'medium', 'Segment length in Ust’-Ishim places Neanderthal admixture ~50–60 ka.', ['fu2014', 'green2010']),
  L('toba', 'madjedbebe', 'predates', 'low', 'Toba (~74 ka) is later than the claimed ~65 ka occupation only if Madjedbebe’s age is wrong; no causal relation is established.', ['clarkson2017']),
  L('blombos', 'sulawesi-art', 'shares_characteristics_with', 'medium', 'Symbolic behaviour in Africa and Southeast Asia at different times; no direct link claimed.', ['henshilwood2018', 'oktaviana2024']),
  L('sulawesi-art', 'chauvet', 'predates', 'high', 'Sulawesi art is at least 14,000 years older.', ['oktaviana2024', 'quiles2016']),
  L('iberian-cave-art', 'blombos', 'shares_characteristics_with', 'low', 'Symbolic behaviour in non-sapiens hominins and sapiens remain debated.', ['hoffmann2018']),
  L('hohle-fels', 'chauvet', 'correlates_with', 'medium', 'Both are Aurignacian-period European art.', ['conard2009', 'quiles2016']),

  // --- Oceania & contact
  L('rapa-nui', 'nan-madol', 'correlates_with', 'low', 'Both are monumental Pacific traditions of the second millennium CE; they are independent.', ['hunt2006']),
  L('rapa-nui', 'nan-madol', 'shares_characteristics_with', 'low', 'Megalithic work by island societies, with different techniques.'),

  // --- Maps
  L('piri-reis', 'oronce-fine', 'shares_characteristics_with', 'medium', 'Both show a speculative southern continent from the Terra Australis tradition.', ['mcintosh2000']),

  // --- Artifacts
  L('antikythera', 'babylonian-diaries', 'derived_from', 'high', 'Uses Babylonian cycle relations.', ['freeth2006']),
  L('baghdad-battery', 'dendera-relief', 'shares_characteristics_with', 'low', 'Both are invoked in claims of ancient electricity; the two claims are independent and both unsupported.'),
  L('roman-concrete', 'antikythera', 'correlates_with', 'low', 'Both illustrate sophisticated, documented ancient technologies that need no outside source.', ['seymour2023', 'freeth2021']),

  // --- UAP and esoteric
  L('nuremberg-1561', 'basel-1566', 'shares_characteristics_with', 'high', 'Both are Wickiana-collection broadsheets of sky phenomena.', ['wickiana']),
  L('nimitz-2004', 'gimbal-2015', 'shares_characteristics_with', 'medium', 'Both are Navy sensor videos; no link between the events is shown.', ['dod2020']),
  L('nimitz-2004', 'aaro-2024', 'correlates_with', 'medium', 'AARO reports cover Navy encounters of this kind.', ['aaro2024']),
  L('malmstrom-1967', 'aaro-2024', 'correlates_with', 'medium', 'Historical missile-site reports are within AARO’s historical review.', ['aaro2024']),
  L('malmstrom-1967', 'nimitz-2004', 'correlates_with', 'low', 'Both involve military witnesses; 37 years apart with no link.'),
  L('ariosophy', 'thule-society', 'potentially_influenced', 'medium', 'Völkisch occultism influenced Munich groups.', ['goodrickclarke1985']),
  L('thule-society', 'ahnenerbe', 'correlates_with', 'low', 'Both are cited in popular occult accounts of Nazism; their documented connection is limited.', ['goodrickclarke1985', 'kater1974']),
  L('ahnenerbe', 'atlantis-plato', 'contradicts', 'high', 'Its Aryan Atlantis/Hyperborea claims have no evidence.', ['kater1974']),
  L('atlantis-plato', 'ariosophy', 'potentially_influenced', 'low', 'Atlantis reappears in occult-racist mythology as a source of an “Aryan” origin; this is reception, not evidence.', ['goodrickclarke1985']),

  // --- Megaliths
  L('baalbek', 'giza', 'shares_characteristics_with', 'low', 'Large-block construction; different periods and techniques.'),
  L('baalbek', 'tiwanaku', 'shares_characteristics_with', 'low', 'Precisely cut large stone; unrelated cultures and dates.'),
  L('sacsayhuaman', 'baalbek', 'shares_characteristics_with', 'low', 'Both are cited for large-block engineering; quarry and tool evidence exists at both.', ['protzen1993', 'wiegand1921']),
  L('malta-temples', 'stonehenge', 'predates', 'high', 'Maltese temples are among the oldest freestanding stone buildings.', ['trump2002', 'parkerpearson2012']),
  L('carnac', 'newgrange', 'correlates_with', 'low', 'Atlantic-facade Neolithic megalithism; direct contact is not shown.'),
  // --- Added connections for previously isolated entries
  L('dmanisi', 'wonderwerk', 'predates', 'low', 'Dmanisi (~1.8 Ma) is some 800,000 years older than the Wonderwerk fire evidence; both are early Homo sites on either side of the Sahara and are not directly connected.', ['berna2012', 'lordkipanidze2013']),
  L('naledi', 'irhoud', 'correlates_with', 'medium', 'Contemporary African hominins of very different appearance, showing a diverse Middle Pleistocene Africa.', ['dirks2017', 'hublin2017']),
  L('teotihuacan', 'olmec-san-lorenzo', 'postdates', 'high', 'Teotihuacan rises more than a thousand years after the Olmec heartland.', ['cowgill2015', 'diehl2004']),
  L('teotihuacan', 'maya-lidar', 'potentially_influenced', 'medium', 'Teotihuacan-related iconography and political events at Maya cities are documented in inscriptions; the extent is debated.', ['cowgill2015']),
  L('kerma', 'meroe', 'predates', 'high', 'Kerma precedes the Napatan and Meroitic phases of Kush.', ['welsby1996']),
  L('kerma', 'hierakonpolis', 'correlates_with', 'medium', 'Egypt and Nubia interacted through trade and conflict.', ['welsby1996']),
  L('aksum', 'meroe', 'postdates', 'medium', 'Aksum rose as Meroë declined, and Aksumite inscriptions record campaigns in the region.', ['phillipson2012', 'welsby1996']),
  L('sahara-wet', 'garamantes', 'potentially_influenced', 'medium', 'The Garamantes relied on fossil groundwater left by wetter periods.', ['mattingly2003', 'demenocal2000']),
  L('sahara-wet', 'djenne-djenno', 'potentially_influenced', 'low', 'Saharan drying is proposed to have pushed populations toward the Sahel and Niger.', ['mcintosh1980', 'demenocal2000']),
  L('nok', 'meroe', 'correlates_with', 'low', 'Early iron working in West and the Nile valley; whether there was diffusion is debated.', ['breunig2014', 'welsby1996']),
  L('pavlopetri', 'akrotiri', 'correlates_with', 'medium', 'Contemporary Bronze Age Aegean settlements, one submerged by subsidence and one buried by eruption.', ['henderson2011']),
  L('utsuro-bune', 'nuremberg-1561', 'shares_characteristics_with', 'low', 'In both cases a historical account later gained a technological reading unsupported by the early sources.', ['wickiana', 'ibaraki1803']),
  L('nimrud-lens', 'antikythera', 'shares_characteristics_with', 'low', 'Both are cited in discussions of ancient optical and mechanical skill; one is well documented, the other contested.', ['sines1987', 'freeth2006']),
];
