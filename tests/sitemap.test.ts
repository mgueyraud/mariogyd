import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { getAllLabMeta } from "@/lib/lab-meta";
import { allPagePaths } from "@/lib/markdown-routes";
import { SITE_URL } from "@/lib/site";
import { TRIPS } from "@/lib/trips";

describe("sitemap", () => {
  const entries = sitemap();

  it("lists exactly the pages the site renders, as absolute www URLs", () => {
    const urls = entries.map((e) => e.url).sort();
    const expected = allPagePaths().map((p) => `${SITE_URL}${p}`).sort();
    expect(urls).toEqual(expected);
    for (const url of urls) expect(url.startsWith("https://www.mariogyd.com/")).toBe(true);
  });

  it("gives every URL a valid lastModified date no later than today", () => {
    const now = Date.now();
    for (const e of entries) {
      const d = e.lastModified as Date;
      expect(d, e.url).toBeInstanceOf(Date);
      expect(Number.isNaN(d.getTime()), e.url).toBe(false);
      expect(d.getTime(), e.url).toBeLessThanOrEqual(now);
    }
  });

  it("dates lab entries by publish date and trips by month", () => {
    const lab = getAllLabMeta()[0];
    const entry = entries.find((e) => e.url.endsWith(`/lab/${lab.slug}`))!;
    const [m, d, y] = lab.publishedDate.split("/").map(Number);
    expect((entry.lastModified as Date).toISOString().slice(0, 10)).toBe(
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
    const trip = TRIPS[0];
    const tripEntry = entries.find((e) => e.url.endsWith(`/trips/${trip.slug}`))!;
    expect((tripEntry.lastModified as Date).toISOString().slice(0, 7)).toBe(trip.date);
  });
});

describe("robots", () => {
  it("points at the sitemap and hides the internal markdown route", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toContain("/markdown");
  });
});
