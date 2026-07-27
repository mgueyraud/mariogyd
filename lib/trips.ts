export type TripPhoto = {
  caption: string;
  span: 1 | 2;
  ar: string;
};

export type Trip = {
  slug: string;
  city: string;
  country: string;
  /** Short mono label, e.g. "JUL 24" */
  date: string;
  /** Detail-header label, e.g. "JUL 2024" */
  monthYear: string;
  lat: number;
  lng: number;
  /** Polaroid tilt in degrees for the home fan */
  rotation: number;
  blurb: string;
  photos: TripPhoto[];
};

// Placeholder photo layout shared across trips (fake data / mockup).
const LAYOUT: Pick<TripPhoto, "span" | "ar">[] = [
  { span: 2, ar: "21/10" },
  { span: 1, ar: "3/4" },
  { span: 1, ar: "3/4" },
  { span: 1, ar: "3/2" },
  { span: 1, ar: "3/2" },
  { span: 2, ar: "21/10" },
  { span: 1, ar: "3/4" },
  { span: 1, ar: "3/4" },
];

const photoSet = (captions: string[]): TripPhoto[] =>
  captions.map((caption, i) => ({ caption, ...LAYOUT[i % LAYOUT.length] }));

export const TRIPS: Trip[] = [
  {
    slug: "miami",
    city: "Miami",
    country: "USA",
    date: "MAR 26",
    monthYear: "MAR 2026",
    lat: 25.76,
    lng: -80.19,
    rotation: -7,
    blurb:
      "A few bright days on the beach and in Wynwood. Shot on a Fujifilm X100V — pastel facades, palm shadows, and neon after dark.",
    photos: photoSet([
      "south beach at noon",
      "wynwood walls",
      "art deco facade",
      "little havana",
      "ocean drive neon",
      "biscayne bay",
      "lifeguard tower",
      "palm shadows",
    ]),
  },
  {
    slug: "san-francisco",
    city: "San Francisco",
    country: "USA",
    date: "NOV 25",
    monthYear: "NOV 2025",
    lat: 37.77,
    lng: -122.42,
    rotation: 4,
    blurb:
      "Cold, foggy November. Steep streets and cable cars, the Golden Gate half-hidden in mist, and coffee to keep warm.",
    photos: photoSet([
      "golden gate in fog",
      "painted ladies",
      "cable car",
      "mission murals",
      "the embarcadero",
      "twin peaks view",
      "chinatown alley",
      "ferry building",
    ]),
  },
  {
    slug: "medellin",
    city: "Medellín",
    country: "Colombia",
    date: "AUG 25",
    monthYear: "AUG 2025",
    lat: 6.24,
    lng: -75.57,
    rotation: -3,
    blurb:
      "The city of eternal spring. Cable cars up the hills, Comuna 13 in full color, and long green afternoons in El Poblado.",
    photos: photoSet([
      "comuna 13 stairs",
      "metrocable view",
      "botero plaza",
      "el poblado café",
      "street graffiti",
      "valley at dusk",
      "flower market",
      "guatapé day trip",
    ]),
  },
  {
    slug: "santiago",
    city: "Santiago",
    country: "Chile",
    date: "MAY 25",
    monthYear: "MAY 2025",
    lat: -33.45,
    lng: -70.65,
    rotation: 6,
    blurb:
      "Autumn under the Andes. Clear cold mornings, the funicular up San Cristóbal, and empanadas in Bellavista.",
    photos: photoSet([
      "andes skyline",
      "cerro san cristóbal",
      "bellavista street",
      "plaza de armas",
      "central market",
      "sunset over the city",
      "barrio lastarria",
      "metro tiles",
    ]),
  },
  {
    slug: "florianopolis",
    city: "Florianópolis",
    country: "Brazil",
    date: "JAN 25",
    monthYear: "JAN 2025",
    lat: -27.6,
    lng: -48.55,
    rotation: -5,
    blurb:
      "Island summer. Forty-something beaches, warm rain in the afternoons, and açaí on the sand.",
    photos: photoSet([
      "praia mole",
      "lagoa da conceição",
      "dunes at joaquina",
      "island bridge",
      "surf at noon",
      "sunset over the lagoon",
      "beach boardwalk",
      "green hills",
    ]),
  },
  {
    slug: "camboriu",
    city: "Camboriú",
    country: "Brazil",
    date: "JAN 25",
    monthYear: "JAN 2025",
    lat: -26.99,
    lng: -48.63,
    rotation: 3,
    blurb:
      "Skyline on the sand — the 'Brazilian Dubai'. Cable car across the bay and a long hot beach day.",
    photos: photoSet([
      "central beach",
      "the skyline",
      "cable car over the bay",
      "unipraias park",
      "beachfront towers",
      "sunset from the hill",
      "boardwalk crowd",
      "warm ocean",
    ]),
  },
  {
    slug: "montevideo",
    city: "Montevideo",
    country: "Uruguay",
    date: "OCT 24",
    monthYear: "OCT 2024",
    lat: -34.9,
    lng: -56.19,
    rotation: -4,
    blurb:
      "Spring on the Rambla. Mate in the park, the old city at golden hour, and the widest river in the world.",
    photos: photoSet([
      "the rambla",
      "ciudad vieja",
      "mercado del puerto",
      "plaza independencia",
      "río de la plata",
      "sunset walk",
      "art nouveau doorway",
      "parque rodó",
    ]),
  },
  {
    slug: "buenos-aires",
    city: "Buenos Aires",
    country: "Argentina",
    date: "JUL 24",
    monthYear: "JUL 2024",
    lat: -34.6,
    lng: -58.38,
    rotation: 5,
    blurb:
      "A week in July, cold and clear. Shot on a Fujifilm X100V and a Canon AE-1 loaded with Portra 400 — cafés, bookstores, and long walks from San Telmo up to Palermo.",
    photos: photoSet([
      "obelisco at dusk",
      "café tortoni",
      "el ateneo bookstore",
      "san telmo market",
      "caminito, la boca",
      "puerto madero bridge",
      "palermo streets at night",
      "recoleta rooftops",
    ]),
  },
];

export function getTripBySlug(slug: string): Trip | undefined {
  return TRIPS.find((t) => t.slug === slug);
}
