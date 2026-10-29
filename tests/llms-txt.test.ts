import { describe, expect, it } from "vitest";
import { getAllLabMeta } from "@/lib/lab-meta";
import { getLlmsTxt } from "@/lib/llms-txt";
import { SITE_URL } from "@/lib/site";

describe("llms.txt", () => {
  const txt = getLlmsTxt();
  const lines = txt.split("\n");

  it("starts with the H1 and then the blockquote summary, per llmstxt.org", () => {
    expect(lines[0]).toBe("# Mario Gueyraud");
    expect(lines[1]).toBe("");
    expect(lines[2]).toMatch(/^> .{40,}/);
  });

  it("has no headings other than the H1 before the first H2", () => {
    const firstH2 = lines.findIndex((l) => l.startsWith("## "));
    expect(firstH2).toBeGreaterThan(3);
    const before = lines.slice(1, firstH2);
    expect(before.some((l) => /^#/.test(l))).toBe(false);
  });

  it("tells agents when to use the site and how to call it", () => {
    expect(txt).toMatch(/^When to use this site:$/m);
    expect(txt).toContain("Accept: text/markdown");
    expect(txt).toContain(`${SITE_URL}/sitemap.xml`);
    expect(txt).toContain(`${SITE_URL}/index.md`);
    expect(txt).toMatch(/- Not for:/);
  });

  it("formats every H2 section entry as - [name](url): notes", () => {
    const firstH2 = lines.findIndex((l) => l.startsWith("## "));
    const entries = lines.slice(firstH2).filter((l) => l.startsWith("- "));
    expect(entries.length).toBeGreaterThan(10);
    for (const entry of entries) {
      expect(entry).toMatch(/^- \[[^\]]+\]\((https?:\/\/|mailto:)[^)]+\): .+/);
    }
  });

  it("links the trust pages and every lab entry", () => {
    for (const slug of ["about", "contact", "privacy"]) {
      expect(txt).toContain(`](${SITE_URL}/${slug}): `);
    }
    for (const lab of getAllLabMeta()) {
      expect(txt).toContain(`](${SITE_URL}/lab/${lab.slug}): `);
    }
    expect(txt).toContain("## Optional");
  });
});
