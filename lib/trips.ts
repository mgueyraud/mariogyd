export type TripPhoto = {
  src: string;
  width: number;
  height: number;
  /** Grid columns the photo occupies — landscape shots run full width */
  span: 1 | 2;
};

export type Trip = {
  slug: string;
  city: string;
  country: string;
  /** ISO year-month, e.g. "2024-01" — the source of truth for order and labels */
  date: string;
  lat: number;
  lng: number;
  /** Polaroid tilt in degrees for the home fan */
  rotation: number;
  /** Which photo fronts the home fan, numbered like the files (1 = 01.jpg) */
  cover: number;
  blurb: string;
  photos: TripPhoto[];
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const parse = (date: string) => {
  const [year, month] = date.split("-");
  return { year, month: MONTHS[Number(month) - 1] };
};

/** Short mono label, e.g. "JAN 24" */
export function shortDate(date: string): string {
  const { year, month } = parse(date);
  return `${month} ${year.slice(2)}`;
}

/** Detail-header label, e.g. "JAN 2024" */
export function longDate(date: string): string {
  const { year, month } = parse(date);
  return `${month} ${year}`;
}

const BLOB = "https://k5c5brlnuchluhwp.public.blob.vercel-storage.com/trips";

/** Real pixel dimensions of the web exports (see scripts/photos-web.py). */
const DIMS = {
  p: { width: 1350, height: 1800 },
  l: { width: 1800, height: 1350 },
  s: { width: 961, height: 961 },
} as const;

/**
 * `shape` is one letter per photo in filename order — p portrait, l landscape,
 * s square — which is enough to derive the URL, the real aspect ratio, and the
 * grid span for every photo in a trip.
 */
const photoSet = (slug: string, shape: string): TripPhoto[] =>
  shape.split("").map((k, i) => ({
    src: `${BLOB}/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
    ...DIMS[k as keyof typeof DIMS],
    span: k === "l" ? (2 as const) : (1 as const),
  }));

/** Newest first. Cities visited more than once carry the year in their slug. */
export const TRIPS: Trip[] = [
  {
    slug: "florianopolis",
    city: "Florianópolis",
    country: "Brazil",
    date: "2026-01",
    lat: -27.6,
    lng: -48.55,
    rotation: -5,
    cover: 4,
    blurb:
      "A week on the island with my padel friends — beaches in the morning, nothing scheduled after that. Somewhere in the middle of it I told the love of my life how I felt about her.",
    photos: photoSet("florianopolis", "pppppppppp"),
  },
  {
    slug: "miami",
    city: "Miami",
    country: "USA",
    date: "2025-12",
    lat: 25.76,
    lng: -80.19,
    rotation: -7,
    cover: 10,
    blurb:
      "A trip back to where I spent part of my childhood, before my family moved home when my father got sick. I saw the friends and family I grew up around and walked the streets I still remember.",
    photos: photoSet("miami", "ppppplplps"),
  },
  {
    slug: "san-francisco",
    city: "San Francisco",
    country: "USA",
    date: "2025-12",
    lat: 37.77,
    lng: -122.42,
    rotation: 4,
    cover: 4,
    blurb:
      "Onsite with the Ultralight team, formerly Vibrant. A week of meeting the people I work with every day and getting a much closer look at how the developer ecosystem actually moves.",
    photos: photoSet("san-francisco", "pppppppplp"),
  },
  {
    slug: "montevideo",
    city: "Montevideo",
    country: "Uruguay",
    date: "2025-12",
    lat: -34.9,
    lng: -56.19,
    rotation: -4,
    cover: 9,
    blurb:
      "Time with a coworker and one of my closest friends — one of the best people I know, and someone I've learned a lot from. Slow days on the Rambla and long conversations.",
    photos: photoSet("montevideo", "plpppppppp"),
  },
  {
    slug: "medellin-2024",
    city: "Medellín",
    country: "Colombia",
    date: "2024-12",
    lat: 6.24,
    lng: -75.57,
    rotation: 2,
    cover: 6,
    blurb:
      "Back to Medellín, this time with my closest friends and nothing on the calendar. Green afternoons in El Poblado and the kind of week that doesn't need a plan.",
    photos: photoSet("medellin-2024", "pppppppplp"),
  },
  {
    slug: "buenos-aires-2024",
    city: "Buenos Aires",
    country: "Argentina",
    date: "2024-01",
    lat: -34.6,
    lng: -58.38,
    rotation: 5,
    cover: 4,
    blurb:
      "A return to Buenos Aires with my best friends, this time with no reason other than to be there. Long dinners, longer walks, and a very good week.",
    photos: photoSet("buenos-aires-2024", "pppppppppp"),
  },
  {
    slug: "medellin-2023",
    city: "Medellín",
    country: "Colombia",
    date: "2023-11",
    lat: 6.24,
    lng: -75.57,
    rotation: -3,
    cover: 8,
    blurb:
      "JSConf Medellín. I went for the community more than the talks — to meet the educators whose work I'd been learning from for years.",
    photos: photoSet("medellin-2023", "ppplpppppp"),
  },
  {
    slug: "santiago",
    city: "Santiago",
    country: "Chile",
    date: "2023-02",
    lat: -33.45,
    lng: -70.65,
    rotation: 6,
    cover: 5,
    blurb:
      "JSConf Chile, and the first time I met in person coworkers I'd only known through a screen. Clear mornings under the Andes between sessions.",
    photos: photoSet("santiago", "lpppplpppl"),
  },
  {
    slug: "camboriu",
    city: "Balneário Camboriú",
    country: "Brazil",
    date: "2022-12",
    lat: -26.99,
    lng: -48.63,
    rotation: 3,
    cover: 5,
    blurb:
      "New Year's on the coast. Fireworks over the bay at midnight, with the skyline lit up behind the beach.",
    photos: photoSet("camboriu", "ppppppplpp"),
  },
  {
    slug: "foz-do-iguacu",
    city: "Foz do Iguaçu",
    country: "Brazil",
    date: "2022-12",
    lat: -25.54,
    lng: -54.59,
    rotation: -6,
    cover: 4,
    blurb:
      "I tagged along on my brother's school trip. The falls are the kind of thing a photo can't really hold — I tried anyway.",
    photos: photoSet("foz-do-iguacu", "pppppppppp"),
  },
  {
    slug: "buenos-aires-2022",
    city: "Buenos Aires",
    country: "Argentina",
    date: "2022-05",
    lat: -34.6,
    lng: -58.38,
    rotation: 7,
    cover: 8,
    blurb:
      "My first trip. I flew down with friends for a concert and spent the rest of the days walking a city I'd never seen before.",
    photos: photoSet("buenos-aires-2022", "pppppppplp"),
  },
];

/** The photo that fronts a trip on the home fan. Falls back to the first. */
export function coverPhoto(trip: Trip): TripPhoto {
  return trip.photos[trip.cover - 1] ?? trip.photos[0];
}

export function getTripBySlug(slug: string): Trip | undefined {
  return TRIPS.find((t) => t.slug === slug);
}

/**
 * One trip per city for the map — repeat visits collapse onto a single dot
 * that points at the most recent trip. TRIPS is newest first, so the first
 * match for a city wins.
 */
export function getMapTrips(): Trip[] {
  const seen = new Set<string>();
  return TRIPS.filter((trip) => {
    const key = `${trip.city}, ${trip.country}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
