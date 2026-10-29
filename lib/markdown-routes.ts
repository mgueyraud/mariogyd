import fs from "fs";
import path from "path";
import { contentDir, getAllLabMeta, type LabMeta } from "@/lib/lab-meta";
import { getTextPage, TEXT_PAGES, textPageMarkdown } from "@/lib/pages";
import { getSiteMarkdown } from "@/lib/site-markdown";
import { SITE_URL } from "@/lib/site";
import { TRIPS, getTripBySlug, longDate } from "@/lib/trips";

/*
 * The Markdown representation of every page, keyed by the page's own path.
 * middleware.ts rewrites `Accept: text/markdown` requests here; the route
 * handler at app/markdown/[[...path]] just serialises what this returns.
 *
 * Every body ends with the same footer so an agent that lands on one page can
 * find the index and the canonical HTML URL.
 */

export type MarkdownResponse = {
  status: 200 | 404;
  body: string;
};

const PAGE_PATTERNS = [
  /^\/$/,
  /^\/lab$/,
  /^\/lab\/[^/]+$/,
  /^\/trips$/,
  /^\/trips\/[^/]+$/,
  /^\/(about|contact|privacy)$/,
];

/** True for paths that are (or look like) pages this site renders. */
export function isPagePath(pathname: string): boolean {
  return PAGE_PATTERNS.some((re) => re.test(pathname));
}

function footer(pathname: string): string[] {
  return [
    "",
    "---",
    `Markdown version of ${SITE_URL}${pathname === "/" ? "" : pathname}. Index of everything: ${SITE_URL}/llms.txt · Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ];
}

export function notFoundMarkdown(pathname: string): string {
  return [
    "# 404 — Not found",
    "",
    `There is no page at \`${pathname}\` on ${SITE_URL}. It may have moved, or the link may have been mistyped.`,
    "",
    "Places that do exist:",
    "",
    `- [Home](${SITE_URL}/): who Mario Gueyraud is and what he's worked on`,
    `- [llms.txt](${SITE_URL}/llms.txt): the index of every page, with when-to-use guidance for agents`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL with last-modified dates`,
    `- [Lab](${SITE_URL}/lab) and [Trips](${SITE_URL}/trips): the two sections most links point into`,
    "",
  ].join("\n");
}

/** The MDX body with frontmatter, imports and demo components removed. */
function labBodyMarkdown(slug: string): string {
  const raw = fs.readFileSync(path.join(contentDir, `${slug}.mdx`), "utf8");
  const body = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  return body
    .split("\n")
    .filter((line) => !/^\s*(import|export)\s/.test(line))
    .filter((line) => !/^\s*<\/?[A-Z][\w.]*[^>]*\/?>\s*$/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function labEntry(lab: LabMeta): string {
  return `- [${lab.title}](${SITE_URL}/lab/${lab.slug}): ${lab.description}`;
}

export function labIndexMarkdown(): string {
  const labs = getAllLabMeta();
  return [
    "# Lab",
    "",
    "A creative hub for UI experiments, component explorations, and interaction design.",
    "",
    `${labs.length} experiments, newest first. Each page has a short write-up, a video and, where there is one, a link to the source.`,
    "",
    ...labs.map(labEntry),
    "",
  ].join("\n");
}

export function labMarkdown(slug: string): string | undefined {
  const lab = getAllLabMeta().find((l) => l.slug === slug);
  if (!lab) return undefined;
  const lines = [
    `# ${lab.title}`,
    "",
    lab.description,
    "",
    `Published ${lab.publishedDate}. Part of the [Lab](${SITE_URL}/lab).`,
    "",
    labBodyMarkdown(slug),
    "",
  ];
  if (lab.video) lines.push(`- Video: ${SITE_URL}${lab.video}`);
  if (lab.githubLink) lines.push(`- Source: ${lab.githubLink}`);
  lines.push("");
  return lines.join("\n");
}

export function tripsIndexMarkdown(): string {
  return [
    "# Trips",
    "",
    "Places I've been, and the photos my phone came home with.",
    "",
    ...TRIPS.map(
      (t) => `- [${t.city}, ${t.country}](${SITE_URL}/trips/${t.slug}): ${longDate(t.date)}, ${t.photos.length} photos`
    ),
    "",
  ].join("\n");
}

export function tripMarkdown(slug: string): string | undefined {
  const trip = getTripBySlug(slug);
  if (!trip) return undefined;
  return [
    `# ${trip.city}`,
    "",
    `${longDate(trip.date)} · ${trip.country} · ${trip.photos.length} photos. Part of [Trips](${SITE_URL}/trips).`,
    "",
    trip.blurb,
    "",
    "Photos:",
    "",
    ...trip.photos.map((p, i) => `- [${trip.city} ${String(i + 1).padStart(2, "0")}](${p.src}) (${p.width}×${p.height})`),
    "",
  ].join("\n");
}

function bodyFor(pathname: string): string | undefined {
  if (pathname === "/") return getSiteMarkdown();
  if (pathname === "/lab") return labIndexMarkdown();
  if (pathname === "/trips") return tripsIndexMarkdown();

  const lab = pathname.match(/^\/lab\/([^/]+)$/);
  if (lab) return labMarkdown(decodeURIComponent(lab[1]));

  const trip = pathname.match(/^\/trips\/([^/]+)$/);
  if (trip) return tripMarkdown(decodeURIComponent(trip[1]));

  const page = getTextPage(pathname.slice(1));
  if (page) return textPageMarkdown(page);

  return undefined;
}

/** Collapse trailing slashes and empty segments the way Next's router does. */
export function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function renderMarkdownRoute(rawPathname: string): MarkdownResponse {
  const pathname = normalizePathname(rawPathname);
  const body = bodyFor(pathname);
  if (body === undefined) {
    return { status: 404, body: notFoundMarkdown(pathname) };
  }
  return { status: 200, body: body.trimEnd() + "\n" + footer(pathname).join("\n") };
}

/** Every path this module can answer with a 200 — the sitemap uses the same list. */
export function allPagePaths(): string[] {
  return [
    "/",
    "/lab",
    ...getAllLabMeta().map((l) => `/lab/${l.slug}`),
    "/trips",
    ...TRIPS.map((t) => `/trips/${t.slug}`),
    ...TEXT_PAGES.map((p) => `/${p.slug}`),
  ];
}
