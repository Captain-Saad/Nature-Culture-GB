import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Destinations — real, verified Gilgit-Baltistan locations. Facts (forts'
// restoration history, the Attabad landslide date, Deosai's status, etc.)
// are general knowledge cross-checked against what's publicly documented
// about each site; cost figures are illustrative estimates only, and every
// price-bearing row is timestamped so the API can label it as such.
// ---------------------------------------------------------------------------

const PRICE_AS_OF = new Date("2026-08-01T00:00:00.000Z");

interface DestinationSeed {
  id: string;
  slug: string;
  name: string;
  region: string;
  images: string[];
  shortDescription: string;
  longDescription: string;
  bestTimeToVisit: string;
  estimatedDurationDays: number;
  estimatedDurationLabel: string;
  activities: string[];
  difficulty: string;
  approxCostMinPKR: number;
  approxCostMaxPKR: number;
  nearbyHotelIds: string[];
  nearbyAttractionIds: string[];
  lat: number;
  lng: number;
}

function img(seed: string, count: number, w = 1200, h = 800) {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/${w}/${h}`);
}

const destinations: DestinationSeed[] = [
  {
    id: "dest-01",
    slug: "skardu-city",
    name: "Skardu",
    region: "Skardu",
    images: img("skardu-city", 4),
    shortDescription: "Gateway to the Karakoram, ringed by cold desert and turquoise lakes.",
    longDescription:
      "Skardu is the administrative capital of Skardu District and the launch point for most Karakoram expeditions, including the approach to K2. The town sits in a wide valley along the Indus River at roughly 2,230m, overlooked by Kharpocho Fort (also called Skardu Fort), a 16th-century fort built during the reign of Raja Ali Sher Khan Anchan of the Maqpon dynasty. The surrounding cold desert, dotted with sand dunes, is unusual scenery for a high-altitude Himalayan/Karakoram valley.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 2,
    estimatedDurationLabel: "2–3 days",
    activities: ["Sightseeing", "Boating", "Fort visit", "Local cuisine"],
    difficulty: "Easy",
    approxCostMinPKR: 8000,
    approxCostMaxPKR: 20000,
    nearbyHotelIds: ["hotel-01", "hotel-02"],
    nearbyAttractionIds: ["dest-02", "dest-03", "dest-05", "dest-06"],
    lat: 35.2971,
    lng: 75.6333,
  },
  {
    id: "dest-02",
    slug: "shangrila-lake",
    name: "Shangrila (Lower Kachura) Lake",
    region: "Skardu",
    images: img("shangrila-lake", 4),
    shortDescription: "The famous 'heaven on earth' lake resort near Skardu.",
    longDescription:
      "Lower Kachura Lake, popularly known by the name of the resort built on its bank, Shangrila, sits about 25km from Skardu town amid orchards and poplar groves. The resort is known for its boat-shaped restaurant built into a former aircraft-wing structure over the lake, and the site is widely marketed as 'heaven on earth' — a nickname that has stuck since the resort opened in the 1980s.",
    bestTimeToVisit: "May – September",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "Half day",
    activities: ["Boating", "Photography", "Lakeside dining"],
    difficulty: "Easy",
    approxCostMinPKR: 3000,
    approxCostMaxPKR: 8000,
    nearbyHotelIds: ["hotel-02"],
    nearbyAttractionIds: ["dest-01", "dest-04"],
    lat: 35.3861,
    lng: 75.5219,
  },
  {
    id: "dest-03",
    slug: "deosai-plains",
    name: "Deosai National Park",
    region: "Skardu",
    images: img("deosai", 4),
    shortDescription: "The 'Land of Giants' — one of the highest plateaus in the world.",
    longDescription:
      "Deosai is a vast alpine plateau straddling Skardu and Astore districts, averaging around 4,100m in elevation. It was declared a national park in 1993, largely to protect one of the last significant populations of the Himalayan brown bear in Pakistan. The plateau is snowbound for roughly half the year and bursts into wildflower meadows in summer; Sheosar Lake, near the Astore side, is one of its best-known features.",
    bestTimeToVisit: "June – September",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1–2 days",
    activities: ["Wildlife spotting", "Camping", "Photography", "Trekking"],
    difficulty: "Moderate",
    approxCostMinPKR: 6000,
    approxCostMaxPKR: 15000,
    nearbyHotelIds: ["hotel-02"],
    nearbyAttractionIds: ["dest-01"],
    lat: 34.95,
    lng: 75.4167,
  },
  {
    id: "dest-05a",
    slug: "satpara-lake",
    name: "Satpara Lake",
    region: "Skardu",
    images: img("satpara-lake", 3),
    shortDescription: "A glacial lake and dam a short drive from Skardu town.",
    longDescription:
      "Satpara Lake sits about 8km south of Skardu, fed by glacial meltwater from the Deosai plateau. A dam completed in the 2000s uses the lake to supply drinking water and hydroelectric power to Skardu; the lake itself, framed by bare mountain slopes, is a common half-day boating stop for visitors based in Skardu.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "Half day",
    activities: ["Boating", "Photography"],
    difficulty: "Easy",
    approxCostMinPKR: 2500,
    approxCostMaxPKR: 6000,
    nearbyHotelIds: ["hotel-01", "hotel-02"],
    nearbyAttractionIds: ["dest-01"],
    lat: 35.2333,
    lng: 75.6167,
  },
  {
    id: "dest-05b",
    slug: "katpana-desert",
    name: "Katpana Desert (Cold Desert)",
    region: "Skardu",
    images: img("katpana-desert", 3),
    shortDescription: "A high-altitude cold desert with sand dunes beside the Indus.",
    longDescription:
      "The Katpana Desert, on Skardu's outskirts, is one of the highest cold deserts in the world at over 2,200m. Wind-sculpted sand dunes sit against a backdrop of snow-capped peaks along the Indus River — a striking, unusual pairing of desert and high-altitude terrain that draws photographers and jeep-safari operators.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "Half day",
    activities: ["Jeep safari", "Photography"],
    difficulty: "Easy",
    approxCostMinPKR: 2000,
    approxCostMaxPKR: 5000,
    nearbyHotelIds: ["hotel-01", "hotel-02"],
    nearbyAttractionIds: ["dest-01"],
    lat: 35.2764,
    lng: 75.6244,
  },
  {
    id: "dest-04",
    slug: "shigar-valley",
    name: "Shigar Valley",
    region: "Shigar",
    images: img("shigar", 4),
    shortDescription: "A green oasis of orchards and the restored Shigar Fort.",
    longDescription:
      "Shigar Valley opens onto the Shigar River about an hour from Skardu, and is a traditional staging point for expeditions heading up the Braldu valley toward the Baltoro Glacier and K2. Its centerpiece is Fong Khar (Shigar Fort), a 17th-century fort-palace of the Amacha dynasty that fell into disrepair before the Aga Khan Trust for Culture restored it in the late 1990s; it reopened in 2001 as a heritage guesthouse.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1 day",
    activities: ["Heritage walk", "Fort visit", "Local crafts"],
    difficulty: "Easy",
    approxCostMinPKR: 4000,
    approxCostMaxPKR: 10000,
    nearbyHotelIds: ["hotel-03"],
    nearbyAttractionIds: ["dest-01"],
    lat: 35.4225,
    lng: 75.7439,
  },
  {
    id: "dest-05",
    slug: "hunza-valley",
    name: "Hunza Valley (Karimabad)",
    region: "Hunza",
    images: img("hunza", 4),
    shortDescription: "Snow-capped peaks over terraced fields — GB's most iconic valley.",
    longDescription:
      "Centered on the town of Karimabad, Hunza Valley is framed by Rakaposhi, Ultar Sar and Lady Finger Peak, and threaded by the Karakoram Highway. Baltit Fort, the roughly 700-year-old ancestral seat of the Mirs of Hunza, was restored by the Aga Khan Trust for Culture and opened as a museum in 1996. Nearby Altit Fort, thought to be the older of the two forts in the valley, was restored and opened to visitors in 2011.",
    bestTimeToVisit: "March – November",
    estimatedDurationDays: 3,
    estimatedDurationLabel: "2–4 days",
    activities: ["Fort visits", "Hiking", "Local markets", "Viewpoints"],
    difficulty: "Easy",
    approxCostMinPKR: 10000,
    approxCostMaxPKR: 25000,
    nearbyHotelIds: ["hotel-04", "hotel-05"],
    nearbyAttractionIds: ["dest-06", "dest-07", "dest-13"],
    lat: 36.3167,
    lng: 74.65,
  },
  {
    id: "dest-06",
    slug: "attabad-lake",
    name: "Attabad Lake",
    region: "Hunza",
    images: img("attabad", 4),
    shortDescription: "A striking turquoise lake formed by a 2010 landslide.",
    longDescription:
      "On 4 January 2010, a massive landslide above Attabad village blocked the Hunza River, flooding roughly 21km of the valley — submerging a stretch of the Karakoram Highway and several villages — and creating what is now Attabad Lake. The lake's electric-blue water, a result of suspended glacial sediment, now supports a small tourism economy of boating and jet-skiing along the KKH.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "Half day",
    activities: ["Boating", "Jet skiing", "Photography"],
    difficulty: "Easy",
    approxCostMinPKR: 3000,
    approxCostMaxPKR: 7000,
    nearbyHotelIds: ["hotel-04"],
    nearbyAttractionIds: ["dest-05"],
    lat: 36.3183,
    lng: 74.8697,
  },
  {
    id: "dest-07",
    slug: "passu-cones",
    name: "Passu Cones & Hussaini Bridge",
    region: "Hunza",
    images: img("passu", 4),
    shortDescription: "Jagged cathedral peaks beside a landmark suspension bridge.",
    longDescription:
      "In Gojal (upper Hunza), the Passu Cones — also called Passu Peaks or, locally, Tupopdan — rise in a serrated ridge above the Hunza River and are among the most photographed formations in the region. A short drive away, the Hussaini Suspension Bridge, a wood-and-wire footbridge swaying over the river near Hussaini village, has become a well-known (if nerve-testing) stop in its own right.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1 day",
    activities: ["Suspension bridge walk", "Glacier viewpoint", "Photography"],
    difficulty: "Moderate",
    approxCostMinPKR: 3000,
    approxCostMaxPKR: 8000,
    nearbyHotelIds: ["hotel-05"],
    nearbyAttractionIds: ["dest-05", "dest-06", "dest-08b"],
    lat: 36.4667,
    lng: 74.8833,
  },
  {
    id: "dest-08b",
    slug: "khunjerab-pass",
    name: "Khunjerab Pass",
    region: "Hunza",
    images: img("khunjerab", 3),
    shortDescription: "The world's highest paved international border crossing.",
    longDescription:
      "Khunjerab Pass, at roughly 4,693m on the Pakistan-China border, carries the Karakoram Highway over the Karakoram range and is the highest paved international border crossing in the world. It sits within Khunjerab National Park, established to protect the Marco Polo sheep and snow leopard, among other high-altitude species. The pass is closed by snow for much of the winter, typically from December to April.",
    bestTimeToVisit: "May – October (closed in winter)",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "Full day trip",
    activities: ["Sightseeing", "Wildlife spotting", "Photography"],
    difficulty: "Moderate",
    approxCostMinPKR: 5000,
    approxCostMaxPKR: 12000,
    nearbyHotelIds: [],
    nearbyAttractionIds: ["dest-07"],
    lat: 36.8497,
    lng: 75.4231,
  },
  {
    id: "dest-08",
    slug: "gilgit-city",
    name: "Gilgit",
    region: "Gilgit",
    images: img("gilgit", 4),
    shortDescription: "The regional hub where the Karakoram, Hindukush and Himalaya meet.",
    longDescription:
      "Gilgit is Gilgit-Baltistan's commercial and administrative capital, at the confluence of the Gilgit and Hunza rivers. Just outside town, the Kargah Buddha — a large standing Buddha relief carved into a cliff face, dated to roughly the 7th century — is a reminder of the region's Buddhist past along the ancient trade routes linking South and Central Asia.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1–2 days",
    activities: ["Bazaar walk", "Kargah Buddha", "Polo ground"],
    difficulty: "Easy",
    approxCostMinPKR: 5000,
    approxCostMaxPKR: 12000,
    nearbyHotelIds: ["hotel-06"],
    nearbyAttractionIds: ["dest-09"],
    lat: 35.9208,
    lng: 74.3144,
  },
  {
    id: "dest-09",
    slug: "naltar-valley",
    name: "Naltar Valley",
    region: "Ghizer",
    images: img("naltar", 4),
    shortDescription: "Pine forests and three colour-changing alpine lakes.",
    longDescription:
      "Naltar Valley, reached by jeep track from Nomal near Gilgit, is known for the Naltar Lakes — three small lakes whose color shifts with the light and season — set among pine forest. In winter the valley hosts Pakistan's main ski resort, run with the Pakistan Air Force's ski school; in summer it reverts to a hiking and picnic destination.",
    bestTimeToVisit: "May – September (summer); January – February (skiing)",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1 day",
    activities: ["Hiking", "Skiing (winter)", "Lake visits"],
    difficulty: "Moderate",
    approxCostMinPKR: 6000,
    approxCostMaxPKR: 14000,
    nearbyHotelIds: ["hotel-06"],
    nearbyAttractionIds: ["dest-08"],
    lat: 36.1667,
    lng: 74.1833,
  },
  {
    id: "dest-10",
    slug: "fairy-meadows",
    name: "Fairy Meadows",
    region: "Diamer",
    images: img("fairy-meadows", 4),
    shortDescription: "Face-to-face views of Nanga Parbat's sheer Rupal face.",
    longDescription:
      "Fairy Meadows is a high meadow at roughly 3,300m reached by jeep from Raikot Bridge on the Karakoram Highway, followed by a final hike or short jeep leg. It offers one of the most accessible close-range views of Nanga Parbat (8,126m), the ninth-highest mountain in the world, and serves as a base camp for treks further up toward the mountain's base camps.",
    bestTimeToVisit: "May – September",
    estimatedDurationDays: 2,
    estimatedDurationLabel: "2 days",
    activities: ["Trekking", "Camping", "Photography"],
    difficulty: "Challenging",
    approxCostMinPKR: 12000,
    approxCostMaxPKR: 28000,
    nearbyHotelIds: ["hotel-07"],
    nearbyAttractionIds: [],
    lat: 35.3833,
    lng: 74.5833,
  },
  {
    id: "dest-11",
    slug: "rama-lake",
    name: "Rama Meadow & Lake",
    region: "Astore",
    images: img("rama-lake", 4),
    shortDescription: "A quiet meadow lake beneath Nanga Parbat's northern flank.",
    longDescription:
      "Rama Meadow, above Astore town, offers views toward Nanga Parbat's northern side and is generally easier to reach by vehicle than Fairy Meadows, making it a popular family-friendly alternative. A small glacial lake sits within the meadow, surrounded by pine forest.",
    bestTimeToVisit: "May – September",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1 day",
    activities: ["Picnic", "Short hikes", "Photography"],
    difficulty: "Easy",
    approxCostMinPKR: 5000,
    approxCostMaxPKR: 12000,
    nearbyHotelIds: ["hotel-07"],
    nearbyAttractionIds: ["dest-10"],
    lat: 35.3167,
    lng: 74.7,
  },
  {
    id: "dest-12",
    slug: "khaplu-valley",
    name: "Khaplu Valley",
    region: "Ghanche",
    images: img("khaplu", 4),
    shortDescription: "A remote valley anchored by the restored Khaplu Palace.",
    longDescription:
      "Khaplu, the main town of Ghanche district, is a quieter alternative to Skardu. Its Yabgo Khaplu Khar (Khaplu Palace), built in the early 20th century for the ruling Yabgo dynasty, was restored by the Aga Khan Trust for Culture and reopened in 2011 as a heritage guesthouse — one of the best-preserved examples of Balti-Tibetan architecture in the region.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1 day",
    activities: ["Palace visit", "Heritage walk"],
    difficulty: "Easy",
    approxCostMinPKR: 4000,
    approxCostMaxPKR: 10000,
    nearbyHotelIds: ["hotel-08"],
    nearbyAttractionIds: [],
    lat: 35.1667,
    lng: 76.3333,
  },
  {
    id: "dest-13",
    slug: "rakaposhi-viewpoint-nagar",
    name: "Rakaposhi Viewpoint (Nagar)",
    region: "Nagar",
    images: img("nagar", 4),
    shortDescription: "The classic front-on view of Rakaposhi from Nagar Valley.",
    longDescription:
      "Nagar Valley faces Hunza across the river and, from the Minapin/Nagar side, offers one of the most complete unobstructed views of Rakaposhi (7,788m) from base to summit — a view often used to represent the mountain in tourism photography.",
    bestTimeToVisit: "April – October",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "Half day",
    activities: ["Viewpoint", "Photography", "Short walks"],
    difficulty: "Easy",
    approxCostMinPKR: 3000,
    approxCostMaxPKR: 8000,
    nearbyHotelIds: ["hotel-04"],
    nearbyAttractionIds: ["dest-05"],
    lat: 36.2333,
    lng: 74.7333,
  },
  {
    id: "dest-14",
    slug: "kharmang-valley",
    name: "Kharmang Valley",
    region: "Kharmang",
    images: img("kharmang", 4),
    shortDescription: "An off-the-beaten-path valley along the Indus, near the LoC.",
    longDescription:
      "Kharmang District, carved out of Skardu District in 2013, is one of Gilgit-Baltistan's least-visited areas. It follows the Indus River toward the Line of Control, past traditional Balti villages and stark, arid mountain scenery largely untouched by mainstream tourism infrastructure.",
    bestTimeToVisit: "May – September",
    estimatedDurationDays: 1,
    estimatedDurationLabel: "1 day",
    activities: ["Village walks", "Photography"],
    difficulty: "Moderate",
    approxCostMinPKR: 5000,
    approxCostMaxPKR: 12000,
    nearbyHotelIds: [],
    nearbyAttractionIds: ["dest-01"],
    lat: 34.9333,
    lng: 76.1167,
  },
];

// ---------------------------------------------------------------------------
// Mountains — the six named in the frontend spec. Heights, world ranks
// (among the standard list of the world's highest peaks) and first-ascent
// details are established mountaineering-history facts.
// ---------------------------------------------------------------------------

interface MountainSeed {
  id: string;
  slug: string;
  name: string;
  heightMeters: number;
  range: string;
  difficulty: string;
  images: string[];
  description: string;
  firstAscent: string;
  bestSeason: string;
  worldRank: number;
  nearestTown: string;
  lat: number;
  lng: number;
}

const mountains: MountainSeed[] = [
  {
    id: "mtn-01",
    slug: "k2",
    name: "K2",
    heightMeters: 8611,
    range: "Karakoram",
    difficulty: "Extreme",
    images: img("k2", 3),
    description:
      "K2 is the world's second-highest mountain and widely considered the most dangerous of the 8,000m peaks to climb, owing to its consistently steep terrain and severe weather. It's reached via the Baltoro Glacier from Askole, with Concordia serving as the classic base-camp viewpoint. First climbed on 31 July 1954 by Achille Compagnoni and Lino Lacedelli, members of an Italian expedition led by Ardito Desio.",
    firstAscent: "1954 — Achille Compagnoni & Lino Lacedelli (Italian expedition, led by Ardito Desio)",
    bestSeason: "June – August",
    worldRank: 2,
    nearestTown: "Skardu",
    lat: 35.8825,
    lng: 76.5133,
  },
  {
    id: "mtn-02",
    slug: "nanga-parbat",
    name: "Nanga Parbat",
    heightMeters: 8126,
    range: "Himalaya",
    difficulty: "Extreme",
    images: img("nanga-parbat", 3),
    description:
      "Nanga Parbat, the westernmost major peak of the Himalaya, rises dramatically above the Indus valley and is visible from Fairy Meadows and Rama Meadow. Its imposing Rupal Face, one of the highest mountain faces on Earth, and a history of fatal early expeditions earned it the nickname 'Killer Mountain.' It was first climbed on 3 July 1953 by Hermann Buhl, who made the final push alone.",
    firstAscent: "1953 — Hermann Buhl, solo final push (German–Austrian Himalaya Foundation expedition)",
    bestSeason: "May – September",
    worldRank: 9,
    nearestTown: "Chilas",
    lat: 35.2358,
    lng: 74.5892,
  },
  {
    id: "mtn-03",
    slug: "rakaposhi",
    name: "Rakaposhi",
    heightMeters: 7788,
    range: "Karakoram",
    difficulty: "Challenging",
    images: img("rakaposhi", 3),
    description:
      "Rakaposhi is often cited as having one of the greatest unbroken vertical rises of any mountain on Earth, climbing roughly 5,900m from the Hunza valley floor to its summit with no intervening high ground. It dominates the skyline above Hunza and Nagar, and was first climbed on 25 June 1958 by Mike Banks and Tom Patey during a British–Pakistani Army expedition.",
    firstAscent: "1958 — Mike Banks & Tom Patey (British–Pakistani Army expedition)",
    bestSeason: "May – September",
    worldRank: 27,
    nearestTown: "Hunza / Nagar",
    lat: 36.155,
    lng: 74.4897,
  },
  {
    id: "mtn-04",
    slug: "broad-peak",
    name: "Broad Peak",
    heightMeters: 8051,
    range: "Karakoram",
    difficulty: "Extreme",
    images: img("broad-peak", 3),
    description:
      "Broad Peak takes its name from its wide, roughly 1.5km-long summit ridge. It stands close to K2 and the Gasherbrum group along the Baltoro Glacier. A small four-man Austrian expedition — Fritz Wintersteller, Marcus Schmuck, Kurt Diemberger and Hermann Buhl — made the first ascent on 9 June 1957, notable at the time as one of the first 8,000m peaks climbed without supplemental oxygen or high-altitude porters above base camp.",
    firstAscent: "1957 — Fritz Wintersteller, Marcus Schmuck, Kurt Diemberger & Hermann Buhl (Austrian expedition)",
    bestSeason: "June – August",
    worldRank: 12,
    nearestTown: "Skardu",
    lat: 35.8117,
    lng: 76.5683,
  },
  {
    id: "mtn-05",
    slug: "gasherbrum-1",
    name: "Gasherbrum I (Hidden Peak)",
    heightMeters: 8080,
    range: "Karakoram",
    difficulty: "Extreme",
    images: img("gasherbrum", 3),
    description:
      "Gasherbrum I, also called Hidden Peak because it is not visible from the Baltoro Glacier's main approach until quite close, is the highest of the Gasherbrum group — sometimes called the 'Shining Wall' massif — deep in the Baltoro region. Pete Schoening and Andrew Kauffman reached the summit on 5 July 1958 as part of an American expedition led by Nick Clinch.",
    firstAscent: "1958 — Pete Schoening & Andrew Kauffman (American expedition, led by Nick Clinch)",
    bestSeason: "June – August",
    worldRank: 11,
    nearestTown: "Skardu",
    lat: 35.7242,
    lng: 76.6964,
  },
  {
    id: "mtn-06",
    slug: "masherbrum",
    name: "Masherbrum",
    heightMeters: 7821,
    range: "Karakoram",
    difficulty: "Extreme",
    images: img("masherbrum", 3),
    description:
      "Masherbrum (also known as K1, the first Karakoram peak assigned a survey designation by 19th-century surveyors) dominates the skyline above Khaplu and the Hushe valley. George Bell and Willi Unsoeld, members of an American expedition, reached the summit on 6 July 1960.",
    firstAscent: "1960 — George Bell & Willi Unsoeld (American expedition)",
    bestSeason: "June – August",
    worldRank: 22,
    nearestTown: "Khaplu",
    lat: 35.6497,
    lng: 76.3067,
  },
];

// ---------------------------------------------------------------------------
// Hotels — manually curated placeholder listings, not scraped from any
// booking platform. Several reference real, named heritage/resort
// properties (Shangrila Resort, the Serena heritage forts, Hunza Serena
// Inn); pricing, rooms and ratings attached to every entry are illustrative
// estimates only, timestamped via priceLastUpdated.
// ---------------------------------------------------------------------------

interface HotelSeed {
  id: string;
  slug: string;
  name: string;
  region: string;
  images: string[];
  description: string;
  starRating: number;
  category: string;
  estimatedPricePerNightPKR: number;
  facilities: string[];
  roomTypes: {
    type: string;
    capacity: number;
    estimatedPricePKR: number;
    images: string[];
    bedConfig: string;
    maxOccupancy: { adults: number; children: number };
    sizeSqFt?: number;
    facilities: string[];
  }[];
  cancellationPolicy: string;
  lat: number;
  lng: number;
}

const hotels: HotelSeed[] = [
  {
    id: "hotel-01",
    slug: "indus-motel-skardu",
    name: "Indus Motel Skardu",
    region: "Skardu",
    images: img("indus-motel", 3),
    description: "A straightforward, centrally located mid-range stay in Skardu town.",
    starRating: 3,
    category: "Mid-Range",
    estimatedPricePerNightPKR: 12000,
    facilities: ["Free Wi-Fi", "Parking", "Restaurant", "Room Service"],
    roomTypes: [
      {
        type: "Standard Double",
        capacity: 3,
        estimatedPricePKR: 12000,
        images: img("indus-motel-standard-double", 3),
        bedConfig: "1 Queen Bed",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 180,
        facilities: ["Air Conditioning", "Attached Bathroom", "Free Wi-Fi", "TV"],
      },
      {
        type: "Family Room",
        capacity: 6,
        estimatedPricePKR: 18000,
        images: img("indus-motel-family-room", 3),
        bedConfig: "2 Double Beds",
        maxOccupancy: { adults: 4, children: 2 },
        sizeSqFt: 280,
        facilities: ["Air Conditioning", "Attached Bathroom", "Free Wi-Fi", "TV", "Extra Bedding"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 35.2965,
    lng: 75.6301,
  },
  {
    id: "hotel-02",
    slug: "shangrila-resort-skardu",
    name: "Shangrila Resort",
    region: "Skardu",
    images: img("shangrila-resort", 3),
    description: "The well-known resort on the bank of Lower Kachura Lake, famous for its boat-shaped restaurant.",
    starRating: 4,
    category: "Luxury",
    estimatedPricePerNightPKR: 35000,
    facilities: ["Free Wi-Fi", "Lake View", "Restaurant", "Boating", "Parking"],
    roomTypes: [
      {
        type: "Deluxe Cottage",
        capacity: 3,
        estimatedPricePKR: 35000,
        images: img("shangrila-deluxe-cottage", 3),
        bedConfig: "1 King Bed",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 320,
        facilities: ["Lake View", "Air Conditioning", "Attached Bathroom", "Mini Fridge", "Free Wi-Fi"],
      },
      {
        type: "Lake View Suite",
        capacity: 5,
        estimatedPricePKR: 48000,
        images: img("shangrila-lake-view-suite", 3),
        bedConfig: "1 King Bed + 1 Sofa Bed",
        maxOccupancy: { adults: 3, children: 2 },
        sizeSqFt: 450,
        facilities: [
          "Lake View",
          "Air Conditioning",
          "Private Balcony",
          "Attached Bathroom",
          "Mini Fridge",
          "Free Wi-Fi",
        ],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 35.3861,
    lng: 75.5219,
  },
  {
    id: "hotel-03",
    slug: "shigar-fort-residence",
    name: "Shigar Fort Residence",
    region: "Shigar",
    images: img("shigar-fort", 3),
    description:
      "A heritage guesthouse inside the restored 17th-century Shigar Fort (Fong Khar), managed as part of Serena's heritage collection.",
    starRating: 4,
    category: "Luxury",
    estimatedPricePerNightPKR: 32000,
    facilities: ["Heritage Building", "Free Wi-Fi", "Restaurant", "Garden"],
    roomTypes: [
      {
        type: "Heritage Room",
        capacity: 2,
        estimatedPricePKR: 32000,
        images: img("shigar-fort-heritage-room", 3),
        bedConfig: "1 Queen Bed",
        maxOccupancy: { adults: 2, children: 0 },
        sizeSqFt: 240,
        facilities: ["Heritage Decor", "Attached Bathroom", "Garden View", "Free Wi-Fi"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 35.4225,
    lng: 75.7439,
  },
  {
    id: "hotel-04",
    slug: "hunza-serena-inn",
    name: "Hunza Serena Inn",
    region: "Hunza",
    images: img("hunza-serena", 3),
    description: "A hillside hotel in Karimabad with views toward Rakaposhi and the Hunza valley.",
    starRating: 4,
    category: "Luxury",
    estimatedPricePerNightPKR: 30000,
    facilities: ["Mountain View", "Free Wi-Fi", "Restaurant", "Parking"],
    roomTypes: [
      {
        type: "Deluxe Room",
        capacity: 3,
        estimatedPricePKR: 30000,
        images: img("hunza-serena-deluxe-room", 3),
        bedConfig: "1 King Bed",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 260,
        facilities: ["Mountain View", "Air Conditioning", "Attached Bathroom", "Free Wi-Fi", "TV"],
      },
      {
        type: "Suite",
        capacity: 5,
        estimatedPricePKR: 42000,
        images: img("hunza-serena-suite", 3),
        bedConfig: "1 King Bed + 1 Sofa Bed",
        maxOccupancy: { adults: 3, children: 2 },
        sizeSqFt: 400,
        facilities: ["Mountain View", "Air Conditioning", "Sitting Area", "Attached Bathroom", "Free Wi-Fi", "TV"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 36.3167,
    lng: 74.65,
  },
  {
    id: "hotel-05",
    slug: "passu-inn",
    name: "Passu Inn",
    region: "Hunza",
    images: img("passu-inn", 3),
    description: "A budget guesthouse in Passu village with direct views of the Passu Cones.",
    starRating: 3,
    category: "Budget",
    estimatedPricePerNightPKR: 7000,
    facilities: ["Free Wi-Fi", "Restaurant", "Glacier View"],
    roomTypes: [
      {
        type: "Standard Room",
        capacity: 3,
        estimatedPricePKR: 7000,
        images: img("passu-inn-standard-room", 3),
        bedConfig: "2 Twin Beds",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 160,
        facilities: ["Glacier View", "Attached Bathroom", "Free Wi-Fi"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 36.4667,
    lng: 74.8833,
  },
  {
    id: "hotel-06",
    slug: "gilgit-riverside-hotel",
    name: "Gilgit Riverside Hotel",
    region: "Gilgit",
    images: img("gilgit-riverside", 3),
    description: "A mid-range hotel in Gilgit town overlooking the Gilgit River.",
    starRating: 3,
    category: "Mid-Range",
    estimatedPricePerNightPKR: 10000,
    facilities: ["Free Wi-Fi", "River View", "Restaurant", "Parking"],
    roomTypes: [
      {
        type: "Standard Double",
        capacity: 3,
        estimatedPricePKR: 10000,
        images: img("gilgit-riverside-standard-double", 3),
        bedConfig: "1 Queen Bed",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 190,
        facilities: ["River View", "Air Conditioning", "Attached Bathroom", "Free Wi-Fi", "TV"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 35.9208,
    lng: 74.3144,
  },
  {
    id: "hotel-07",
    slug: "raikot-fairy-meadows-cottages",
    name: "Raikot Fairy Meadows Cottages",
    region: "Diamer",
    images: img("raikot-cottages", 3),
    description: "Simple wooden cottages at Fairy Meadows with direct views of Nanga Parbat.",
    starRating: 3,
    category: "Budget",
    estimatedPricePerNightPKR: 8000,
    facilities: ["Nanga Parbat View", "Bonfire", "Meals Included"],
    roomTypes: [
      {
        type: "Wooden Cottage",
        capacity: 3,
        estimatedPricePKR: 8000,
        images: img("raikot-cottages-wooden-cottage", 3),
        bedConfig: "1 Double Bed",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 150,
        facilities: ["Nanga Parbat View", "Shared Bathroom", "Bonfire Access"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 35.3833,
    lng: 74.5833,
  },
  {
    id: "hotel-08",
    slug: "khaplu-palace-residence",
    name: "Khaplu Palace Residence",
    region: "Ghanche",
    images: img("khaplu-palace", 3),
    description:
      "A heritage guesthouse inside the restored early-20th-century Khaplu Palace (Yabgo Khaplu Khar), part of Serena's heritage collection.",
    starRating: 4,
    category: "Luxury",
    estimatedPricePerNightPKR: 28000,
    facilities: ["Heritage Building", "Free Wi-Fi", "Restaurant", "Garden"],
    roomTypes: [
      {
        type: "Palace Room",
        capacity: 3,
        estimatedPricePKR: 28000,
        images: img("khaplu-palace-room", 3),
        bedConfig: "1 King Bed",
        maxOccupancy: { adults: 2, children: 1 },
        sizeSqFt: 300,
        facilities: ["Heritage Decor", "Attached Bathroom", "Garden View", "Free Wi-Fi"],
      },
    ],
    cancellationPolicy: "Cancellation policy details will be provided by the hotel at time of booking.",
    lat: 35.1667,
    lng: 76.3333,
  },
];

// ---------------------------------------------------------------------------
// Packages — itineraries reference only the real places seeded above.
// ---------------------------------------------------------------------------

interface ItineraryDaySeed {
  day: number;
  title: string;
  description: string;
  overnightAt?: string;
}

interface PackageSeed {
  id: string;
  slug: string;
  title: string;
  category: string;
  durationDays: number;
  images: string[];
  estimatedPriceMinPKR: number;
  estimatedPriceMaxPKR: number;
  highlights: string[];
  itinerary: ItineraryDaySeed[];
  included: string[];
  excluded: string[];
  regions: string[];
}

const packages: PackageSeed[] = [
  {
    id: "pkg-01",
    slug: "3-day-skardu-escape",
    title: "3-Day Skardu Quick Escape",
    category: "Family",
    durationDays: 3,
    images: img("pkg-skardu-3day", 4),
    estimatedPriceMinPKR: 28000,
    estimatedPriceMaxPKR: 45000,
    highlights: ["Shangrila Lake", "Kharpocho Fort", "Deosai day trip", "Skardu bazaar"],
    itinerary: [
      { day: 1, title: "Arrival in Skardu", description: "Arrive in Skardu, check in, evening walk along the Indus and local bazaar.", overnightAt: "Skardu" },
      { day: 2, title: "Shangrila & Kharpocho Fort", description: "Visit Shangrila Lake in the morning and Kharpocho Fort for sunset views over the city.", overnightAt: "Skardu" },
      { day: 3, title: "Deosai day trip & departure", description: "Early drive to Deosai Plains, return by afternoon for departure.", overnightAt: "—" },
    ],
    included: ["Hotel accommodation", "Private transport", "Breakfast"],
    excluded: ["Airfare", "Lunch & dinner", "Entry tickets"],
    regions: ["Skardu"],
  },
  {
    id: "pkg-02",
    slug: "5-day-adventure-trek",
    title: "5-Day Adventure Trek",
    category: "Adventure",
    durationDays: 5,
    images: img("pkg-adventure-5day", 4),
    estimatedPriceMinPKR: 55000,
    estimatedPriceMaxPKR: 85000,
    highlights: ["Deosai crossing", "Camping under the stars", "Local guide", "Wildlife spotting"],
    itinerary: [
      { day: 1, title: "Arrival & briefing", description: "Arrive in Skardu, gear check and trek briefing with your guide.", overnightAt: "Skardu" },
      { day: 2, title: "Skardu to Deosai", description: "Drive to Deosai National Park, set up camp near Sheosar Lake.", overnightAt: "Camp, Deosai" },
      { day: 3, title: "Deosai exploration", description: "Full day exploring the plateau on foot, wildlife and wildflower spotting.", overnightAt: "Camp, Deosai" },
      { day: 4, title: "Deosai to Skardu", description: "Trek out and drive back to Skardu, rest and recovery.", overnightAt: "Skardu" },
      { day: 5, title: "Departure", description: "Free morning, transfer for departure.", overnightAt: "—" },
    ],
    included: ["Camping equipment", "Guide & porter", "All meals during trek"],
    excluded: ["Airfare", "Personal gear", "Travel insurance"],
    regions: ["Skardu"],
  },
  {
    id: "pkg-03",
    slug: "7-day-skardu-hunza-explorer",
    title: "7-Day Skardu + Hunza Explorer",
    category: "Family",
    durationDays: 7,
    images: img("pkg-skardu-hunza-7day", 4),
    estimatedPriceMinPKR: 95000,
    estimatedPriceMaxPKR: 140000,
    highlights: ["Skardu lakes", "Karakoram Highway drive", "Hunza forts", "Attabad Lake", "Passu Cones"],
    itinerary: [
      { day: 1, title: "Arrival in Skardu", description: "Arrive and settle in, short orientation walk.", overnightAt: "Skardu" },
      { day: 2, title: "Skardu sightseeing", description: "Shangrila Lake, Kharpocho Fort, Indus riverside.", overnightAt: "Skardu" },
      { day: 3, title: "Skardu to Hunza", description: "Scenic drive along the Karakoram Highway to Hunza Valley.", overnightAt: "Hunza" },
      { day: 4, title: "Karimabad & Altit Fort", description: "Explore Baltit Fort, Altit Fort and Karimabad bazaar.", overnightAt: "Hunza" },
      { day: 5, title: "Attabad Lake & Passu", description: "Boating at Attabad Lake, walk to Passu Cones viewpoint.", overnightAt: "Hunza" },
      { day: 6, title: "Nagar viewpoint", description: "Visit the Rakaposhi viewpoint in Nagar Valley, free afternoon.", overnightAt: "Hunza" },
      { day: 7, title: "Departure", description: "Drive back towards Gilgit for onward departure.", overnightAt: "—" },
    ],
    included: ["Hotel accommodation", "Private transport", "Breakfast", "Fort entry tickets"],
    excluded: ["Airfare", "Lunch & dinner"],
    regions: ["Skardu", "Hunza"],
  },
  {
    id: "pkg-04",
    slug: "10-day-complete-gb-tour",
    title: "10-Day Complete GB Grand Tour",
    category: "Luxury",
    durationDays: 10,
    images: img("pkg-complete-gb-10day", 4),
    estimatedPriceMinPKR: 180000,
    estimatedPriceMaxPKR: 260000,
    highlights: ["Skardu", "Shigar", "Khaplu", "Hunza", "Naltar", "Gilgit", "Luxury heritage stays"],
    itinerary: [
      { day: 1, title: "Arrival in Skardu", description: "Arrive, check in to a heritage-style hotel, evening at leisure.", overnightAt: "Skardu" },
      { day: 2, title: "Skardu lakes", description: "Shangrila Lake and Kharpocho Fort.", overnightAt: "Skardu" },
      { day: 3, title: "Shigar Valley", description: "Day trip to Shigar Fort and the fertile Shigar orchards.", overnightAt: "Skardu" },
      { day: 4, title: "Khaplu Palace", description: "Drive to Khaplu, visit the restored Khaplu Palace.", overnightAt: "Khaplu" },
      { day: 5, title: "Khaplu to Skardu", description: "Return drive to Skardu with stops along the Shyok river.", overnightAt: "Skardu" },
      { day: 6, title: "Skardu to Hunza", description: "Full-day scenic drive on the Karakoram Highway.", overnightAt: "Hunza" },
      { day: 7, title: "Hunza forts & lake", description: "Baltit Fort, Altit Fort, Attabad Lake boating.", overnightAt: "Hunza" },
      { day: 8, title: "Passu & Naltar", description: "Passu Cones viewpoint, transfer towards Naltar Valley.", overnightAt: "Gilgit" },
      { day: 9, title: "Naltar lakes", description: "Day trip to Naltar's three lakes and pine forests.", overnightAt: "Gilgit" },
      { day: 10, title: "Departure", description: "Free morning in Gilgit, transfer for departure.", overnightAt: "—" },
    ],
    included: ["Heritage/luxury accommodation", "Private transport", "Breakfast & dinner", "All entry tickets"],
    excluded: ["Airfare", "Lunch", "Travel insurance"],
    regions: ["Skardu", "Shigar", "Ghanche", "Hunza", "Ghizer", "Gilgit"],
  },
  {
    id: "pkg-05",
    slug: "honeymoon-in-hunza",
    title: "Honeymoon in Hunza",
    category: "Honeymoon",
    durationDays: 6,
    images: img("pkg-honeymoon-hunza", 4),
    estimatedPriceMinPKR: 110000,
    estimatedPriceMaxPKR: 170000,
    highlights: ["Private mountain-view suite", "Candlelight dinner", "Attabad Lake sunset boat ride", "Couples photography walk"],
    itinerary: [
      { day: 1, title: "Arrival & welcome", description: "Private transfer to Hunza, welcome drink and check-in to a mountain-view suite.", overnightAt: "Hunza" },
      { day: 2, title: "Karimabad exploration", description: "Baltit Fort, Karimabad bazaar, sunset viewpoint together.", overnightAt: "Hunza" },
      { day: 3, title: "Attabad Lake sunset cruise", description: "Private boat ride on Attabad Lake at golden hour.", overnightAt: "Hunza" },
      { day: 4, title: "Passu day trip", description: "Suspension bridge walk and glacier viewpoint at Passu.", overnightAt: "Hunza" },
      { day: 5, title: "Leisure day & candlelight dinner", description: "Free day at the resort, private candlelight dinner in the evening.", overnightAt: "Hunza" },
      { day: 6, title: "Departure", description: "Private transfer back towards Gilgit for departure.", overnightAt: "—" },
    ],
    included: ["Luxury accommodation", "Private transport", "One candlelight dinner", "Breakfast"],
    excluded: ["Airfare", "Lunch & remaining dinners"],
    regions: ["Hunza"],
  },
  {
    id: "pkg-06",
    slug: "family-fun-gb",
    title: "Family Fun in GB",
    category: "Family",
    durationDays: 6,
    images: img("pkg-family-gb", 4),
    estimatedPriceMinPKR: 100000,
    estimatedPriceMaxPKR: 150000,
    highlights: ["Kid-friendly pace", "Boating", "Fort visits", "Connecting family rooms"],
    itinerary: [
      { day: 1, title: "Arrival in Skardu", description: "Arrive and settle in with an easy first day.", overnightAt: "Skardu" },
      { day: 2, title: "Shangrila Lake", description: "Relaxed boating and lakeside lunch at Shangrila.", overnightAt: "Skardu" },
      { day: 3, title: "Skardu to Hunza", description: "Scenic drive with photo stops for the kids.", overnightAt: "Hunza" },
      { day: 4, title: "Karimabad & Attabad", description: "Easy fort visit followed by boating at Attabad Lake.", overnightAt: "Hunza" },
      { day: 5, title: "Free day / optional Passu walk", description: "Optional short walk to Passu viewpoint, otherwise resort leisure time.", overnightAt: "Hunza" },
      { day: 6, title: "Departure", description: "Transfer for departure.", overnightAt: "—" },
    ],
    included: ["Family rooms", "Private transport", "Breakfast"],
    excluded: ["Airfare", "Lunch & dinner"],
    regions: ["Skardu", "Hunza"],
  },
  {
    id: "pkg-07",
    slug: "adventure-k2-basecamp-approach",
    title: "Adventure: K2 Base Camp Approach Trek",
    category: "Adventure",
    durationDays: 12,
    images: img("pkg-k2-basecamp", 4),
    estimatedPriceMinPKR: 220000,
    estimatedPriceMaxPKR: 320000,
    highlights: ["Baltoro Glacier", "Concordia views", "Experienced high-altitude guide", "Full trekking crew"],
    itinerary: [
      { day: 1, title: "Arrival in Skardu", description: "Arrive, gear check, permits and briefing.", overnightAt: "Skardu" },
      { day: 2, title: "Drive to Askole", description: "Jeep drive along a rugged mountain road to the trailhead village of Askole.", overnightAt: "Askole" },
      { day: 3, title: "Askole to Jhula", description: "Trek begins along the Braldu river.", overnightAt: "Camp, Jhula" },
      { day: 4, title: "Jhula to Paiju", description: "Continue upriver towards the Baltoro Glacier snout.", overnightAt: "Camp, Paiju" },
      { day: 5, title: "Rest day at Paiju", description: "Acclimatization day before the glacier trek begins.", overnightAt: "Camp, Paiju" },
      { day: 6, title: "Paiju to Khoburtse", description: "First day on the Baltoro Glacier itself.", overnightAt: "Camp, Khoburtse" },
      { day: 7, title: "Khoburtse to Concordia approach", description: "Trek deeper into the glacier with Gasherbrum and Broad Peak coming into view.", overnightAt: "Camp" },
      { day: 8, title: "Concordia — K2 Base Camp views", description: "Reach Concordia for panoramic views of K2 and the surrounding giants.", overnightAt: "Camp, Concordia" },
      { day: 9, title: "Begin descent", description: "Retrace the route down the Baltoro Glacier.", overnightAt: "Camp" },
      { day: 10, title: "Descent continues", description: "Continue the descent back towards Paiju.", overnightAt: "Camp, Paiju" },
      { day: 11, title: "Return to Askole & Skardu", description: "Trek out to Askole, jeep drive back to Skardu.", overnightAt: "Skardu" },
      { day: 12, title: "Departure", description: "Rest and transfer for departure.", overnightAt: "—" },
    ],
    included: ["Camping equipment", "Guide, cook & porters", "All meals during trek", "Permits"],
    excluded: ["Airfare", "Personal trekking gear", "Travel insurance"],
    regions: ["Skardu"],
  },
  {
    id: "pkg-08",
    slug: "budget-backpacker-gb-circuit",
    title: "Budget Backpacker GB Circuit",
    category: "Budget Backpacker",
    durationDays: 8,
    images: img("pkg-backpacker-gb", 4),
    estimatedPriceMinPKR: 45000,
    estimatedPriceMaxPKR: 70000,
    highlights: ["Shared transport (NATCO/vans)", "Guesthouse stays", "Flexible itinerary", "Local eateries"],
    itinerary: [
      { day: 1, title: "Arrival in Gilgit", description: "Arrive by road or air, settle into a guesthouse.", overnightAt: "Gilgit" },
      { day: 2, title: "Gilgit to Hunza", description: "Shared van to Karimabad, evening bazaar walk.", overnightAt: "Hunza" },
      { day: 3, title: "Karimabad on foot", description: "Self-guided fort and viewpoint walk.", overnightAt: "Hunza" },
      { day: 4, title: "Attabad & Passu", description: "Shared transport to Attabad Lake and Passu.", overnightAt: "Hunza" },
      { day: 5, title: "Hunza to Skardu", description: "Long scenic travel day via shared transport.", overnightAt: "Skardu" },
      { day: 6, title: "Skardu lakes", description: "Shangrila Lake and Kharpocho Fort on a budget day pass.", overnightAt: "Skardu" },
      { day: 7, title: "Deosai day trip", description: "Optional shared jeep trip to Deosai Plains.", overnightAt: "Skardu" },
      { day: 8, title: "Departure", description: "Transfer for departure.", overnightAt: "—" },
    ],
    included: ["Guesthouse stays", "Shared transport"],
    excluded: ["Airfare", "All meals", "Entry tickets"],
    regions: ["Gilgit", "Hunza", "Skardu"],
  },
  {
    id: "pkg-09",
    slug: "luxury-hunza-skardu-retreat",
    title: "Luxury Hunza & Skardu Retreat",
    category: "Luxury",
    durationDays: 6,
    images: img("pkg-luxury-retreat", 4),
    estimatedPriceMinPKR: 160000,
    estimatedPriceMaxPKR: 240000,
    highlights: ["5-star style resorts", "Private guide & vehicle", "Curated dining", "Priority fort access"],
    itinerary: [
      { day: 1, title: "Private arrival transfer", description: "Private vehicle transfer to a luxury resort in Skardu.", overnightAt: "Skardu" },
      { day: 2, title: "Skardu in comfort", description: "Private guided visit to Shangrila Lake and Kharpocho Fort.", overnightAt: "Skardu" },
      { day: 3, title: "Fly or drive to Hunza", description: "Scenic transfer to a premium Hunza resort.", overnightAt: "Hunza" },
      { day: 4, title: "Hunza heritage & lake", description: "Priority-access fort tours and a private Attabad Lake excursion.", overnightAt: "Hunza" },
      { day: 5, title: "Leisure & spa", description: "Free day for leisure, spa or optional Passu excursion.", overnightAt: "Hunza" },
      { day: 6, title: "Departure", description: "Private transfer for departure.", overnightAt: "—" },
    ],
    included: ["Luxury accommodation", "Private guide & vehicle", "Breakfast & dinner"],
    excluded: ["Airfare", "Lunch", "Spa treatments"],
    regions: ["Skardu", "Hunza"],
  },
];

async function main() {
  console.log("Seeding: clearing existing Phase 3 content...");
  // Reviews may FK-reference Destination/Hotel rows; clear first so the
  // reset below doesn't hit a foreign key constraint.
  await prisma.review.deleteMany({});
  await prisma.destination.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.mountain.deleteMany({});
  await prisma.package.deleteMany({});

  console.log(`Seeding ${hotels.length} hotels...`);
  for (const h of hotels) {
    await prisma.hotel.create({
      data: {
        id: h.id,
        slug: h.slug,
        name: h.name,
        region: h.region as Prisma.HotelCreateInput["region"],
        images: h.images,
        description: h.description,
        starRating: h.starRating,
        category: h.category,
        estimatedPricePerNightPKR: h.estimatedPricePerNightPKR,
        priceLastUpdated: PRICE_AS_OF,
        facilities: h.facilities,
        roomTypes: h.roomTypes as unknown as Prisma.InputJsonValue,
        cancellationPolicy: h.cancellationPolicy,
        lat: h.lat,
        lng: h.lng,
      },
    });
  }

  console.log(`Seeding ${destinations.length} destinations...`);
  for (const d of destinations) {
    await prisma.destination.create({
      data: {
        id: d.id,
        slug: d.slug,
        name: d.name,
        region: d.region as Prisma.DestinationCreateInput["region"],
        images: d.images,
        shortDescription: d.shortDescription,
        longDescription: d.longDescription,
        bestTimeToVisit: d.bestTimeToVisit,
        estimatedDurationDays: d.estimatedDurationDays,
        estimatedDurationLabel: d.estimatedDurationLabel,
        activities: d.activities,
        difficulty: d.difficulty as Prisma.DestinationCreateInput["difficulty"],
        approxCostMinPKR: d.approxCostMinPKR,
        approxCostMaxPKR: d.approxCostMaxPKR,
        nearbyHotelIds: d.nearbyHotelIds,
        nearbyAttractionIds: d.nearbyAttractionIds,
        lat: d.lat,
        lng: d.lng,
        updatedAt: PRICE_AS_OF,
      },
    });
  }

  console.log(`Seeding ${mountains.length} mountains...`);
  for (const m of mountains) {
    await prisma.mountain.create({
      data: {
        id: m.id,
        slug: m.slug,
        name: m.name,
        heightMeters: m.heightMeters,
        range: m.range,
        difficulty: m.difficulty as Prisma.MountainCreateInput["difficulty"],
        images: m.images,
        description: m.description,
        firstAscent: m.firstAscent,
        bestSeason: m.bestSeason,
        worldRank: m.worldRank,
        nearestTown: m.nearestTown,
        lat: m.lat,
        lng: m.lng,
      },
    });
  }

  console.log(`Seeding ${packages.length} packages...`);
  for (const p of packages) {
    await prisma.package.create({
      data: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        durationDays: p.durationDays,
        images: p.images,
        estimatedPriceMinPKR: p.estimatedPriceMinPKR,
        estimatedPriceMaxPKR: p.estimatedPriceMaxPKR,
        priceLastUpdated: PRICE_AS_OF,
        highlights: p.highlights,
        itinerary: p.itinerary as unknown as Prisma.InputJsonValue,
        included: p.included,
        excluded: p.excluded,
        regions: p.regions as Prisma.PackageCreateInput["regions"],
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
