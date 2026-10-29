import { describe, expect, it } from "vitest";
import { getAllLabMeta } from "@/lib/lab-meta";
import {
  allPagePaths,
  isPagePath,
  normalizePathname,
  notFoundMarkdown,
  renderMarkdownRoute,
} from "@/lib/markdown-routes";
import { SITE_URL } from "@/lib/site";
import { TRIPS } from "@/lib/trips";

describe("renderMarkdownRoute", () => {
  it("serves the home page mirror at /", () => {
    const res = renderMarkdownRoute("/");
    expect(res.status).toBe(200);
    expect(res.body).toContain("# Mario Gueyraud");
    expect(res.body).toContain("## Experience");
    expect(res.body).toContain(`${SITE_URL}/llms.txt`);
  });

  it("serves every page path with a 200 and a title", () => {
    for (const path of allPagePaths()) {
      const res = renderMarkdownRoute(path);
      expect(res.status, path).toBe(200);
      expect(res.body, path).toMatch(/^# .+/m);
      expect(res.body.length, path).toBeGreaterThan(200);
    }
  });

  it("renders a lab entry from its MDX without the demo component", () => {
    const res = renderMarkdownRoute("/lab/padel-match");
    expect(res.body).toContain("# Padel Match");
    expect(res.body).toContain("A padel court under floodlights");
    expect(res.body).not.toContain("<PadelMatch");
    expect(res.body).toContain("- Source: https://github.com/");
    expect(res.body).toContain(`- Video: ${SITE_URL}/videos/padel-match.mp4`);
  });

  it("renders a trip with its photos", () => {
    const trip = TRIPS[0];
    const res = renderMarkdownRoute(`/trips/${trip.slug}`);
    expect(res.body).toContain(`# ${trip.city}`);
    expect(res.body).toContain(trip.blurb);
    expect(res.body.match(/^- \[/gm)?.length).toBe(trip.photos.length);
  });

  it("lists every lab entry and trip on the indexes", () => {
    const lab = renderMarkdownRoute("/lab").body;
    for (const l of getAllLabMeta()) expect(lab).toContain(`${SITE_URL}/lab/${l.slug}`);
    const trips = renderMarkdownRoute("/trips").body;
    for (const t of TRIPS) expect(trips).toContain(`${SITE_URL}/trips/${t.slug}`);
  });

  it("answers unknown paths with a Markdown 404 that links to the docs", () => {
    for (const path of ["/nope", "/lab/not-a-thing", "/trips/atlantis", "/about/extra"]) {
      const res = renderMarkdownRoute(path);
      expect(res.status, path).toBe(404);
      expect(res.body, path).toContain("# 404");
      expect(res.body.length, path).toBeGreaterThan(20);
      expect(res.body, path).toContain(`${SITE_URL}/llms.txt`);
      expect(res.body, path).toContain(`${SITE_URL}/sitemap.xml`);
    }
    expect(notFoundMarkdown("/x")).toContain("`/x`");
  });

  it("normalises trailing slashes", () => {
    expect(normalizePathname("/lab/")).toBe("/lab");
    expect(normalizePathname("///")).toBe("/");
    expect(renderMarkdownRoute("/lab/").status).toBe(200);
  });

  it("knows which paths are pages", () => {
    expect(isPagePath("/")).toBe(true);
    expect(isPagePath("/lab/padel-match")).toBe(true);
    expect(isPagePath("/privacy")).toBe(true);
    expect(isPagePath("/api/now-playing")).toBe(false);
    expect(isPagePath("/resume.pdf")).toBe(false);
  });
});
