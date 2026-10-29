import type { MetadataRoute } from "next";
import { getAllLabMeta } from "@/lib/lab-meta";
import { TEXT_PAGES } from "@/lib/pages";
import { SITE_URL } from "@/lib/site";
import { TRIPS } from "@/lib/trips";

/*
 * Every indexable URL with a real last-modified date: lab entries use their
 * publish date, trips the month they happened, text pages their edit date.
 * The three indexes change whenever their newest child does.
 */

const labDate = (us: string) => {
  // Frontmatter dates are M/D/YYYY.
  const [m, d, y] = us.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const tripDate = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
};

const newest = (dates: Date[]) =>
  new Date(Math.max(...dates.map((d) => d.getTime())));

export default function sitemap(): MetadataRoute.Sitemap {
  const labs = getAllLabMeta();
  const labDates = labs.map((l) => labDate(l.publishedDate));
  const tripDates = TRIPS.map((t) => tripDate(t.date));
  const pageDates = TEXT_PAGES.map((p) => new Date(p.updated));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: newest([...labDates, ...tripDates, ...pageDates]),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/lab`,
      lastModified: newest(labDates),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...labs.map((lab, i) => ({
      url: `${SITE_URL}/lab/${lab.slug}`,
      lastModified: labDates[i],
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/trips`,
      lastModified: newest(tripDates),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...TRIPS.map((trip, i) => ({
      url: `${SITE_URL}/trips/${trip.slug}`,
      lastModified: tripDates[i],
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...TEXT_PAGES.map((page, i) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: pageDates[i],
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
