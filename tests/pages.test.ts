import { describe, expect, it } from "vitest";
import {
  TEXT_PAGES,
  getTextPage,
  textPageMarkdown,
  textPagePlainText,
} from "@/lib/pages";
import { CONTACT, SITE_URL } from "@/lib/site";

describe("trust pages", () => {
  it.each(TEXT_PAGES.map((p) => [p.slug, p] as const))(
    "/%s has at least 500 characters of real content",
    (_slug, page) => {
      expect(textPagePlainText(page).length).toBeGreaterThanOrEqual(500);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  );

  it("contact page carries the email and profiles", () => {
    const text = textPagePlainText(getTextPage("contact")!);
    expect(text).toContain(CONTACT.email);
    for (const href of [CONTACT.github, CONTACT.linkedin, CONTACT.x]) {
      expect(getTextPage("contact")!.sections.flatMap((s) => s.links ?? []).map((l) => l.href)).toContain(href);
    }
  });

  it("privacy page states what is and is not collected", () => {
    const text = textPagePlainText(getTextPage("privacy")!);
    expect(text).toMatch(/no cookies/i);
    expect(text).toMatch(/Vercel/);
    expect(text).toMatch(/analytics/i);
  });

  it("renders markdown with a title, absolute links and the update date", () => {
    for (const page of TEXT_PAGES) {
      const md = textPageMarkdown(page);
      expect(md.startsWith(`# ${page.title}\n`)).toBe(true);
      expect(md).toContain(`Last updated ${page.updated}.`);
      expect(md).not.toMatch(/\]\(\/[^)]*\)/);
      if (page.sections.some((s) => s.links?.length)) {
        expect(md).toMatch(new RegExp(`\\]\\(${SITE_URL}/`));
      }
    }
  });

  it("knows its slugs", () => {
    expect(getTextPage("about")?.title).toBe("About");
    expect(getTextPage("nope")).toBeUndefined();
  });
});
