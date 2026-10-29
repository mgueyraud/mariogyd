import { describe, expect, it } from "vitest";
import { negotiate, parseAccept, scoreFor } from "@/lib/content-negotiation";

describe("parseAccept", () => {
  it("reads types, defaults q to 1 and clamps it", () => {
    expect(parseAccept("text/markdown, text/html;q=0.8, */*;q=0.1")).toEqual([
      { type: "text", subtype: "markdown", q: 1 },
      { type: "text", subtype: "html", q: 0.8 },
      { type: "*", subtype: "*", q: 0.1 },
    ]);
    expect(parseAccept("text/html;q=7")[0].q).toBe(1);
    expect(parseAccept("text/html;q=abc")[0].q).toBe(0);
  });

  it("is case-insensitive on type and parameter names and ignores junk", () => {
    expect(parseAccept("TEXT/Markdown;Q=0.5, nonsense")).toEqual([
      { type: "text", subtype: "markdown", q: 0.5 },
    ]);
  });
});

describe("scoreFor", () => {
  it("prefers the most specific match", () => {
    const entries = parseAccept("text/*;q=0.5, text/markdown;q=0.9, */*;q=0.1");
    expect(scoreFor("text/markdown", entries)).toBe(0.9);
    expect(scoreFor("text/html", entries)).toBe(0.5);
    expect(scoreFor("image/png", entries)).toBe(0.1);
    expect(scoreFor("application/json", parseAccept("text/html"))).toBe(0);
  });
});

describe("negotiate", () => {
  it("serves HTML by default", () => {
    expect(negotiate(null)).toBe("html");
    expect(negotiate("")).toBe("html");
    expect(negotiate("*/*")).toBe("html");
    expect(negotiate("text/*")).toBe("html");
  });

  it("serves HTML to browsers", () => {
    expect(
      negotiate(
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      )
    ).toBe("html");
  });

  it("serves Markdown when it is preferred", () => {
    expect(negotiate("text/markdown")).toBe("markdown");
    expect(negotiate("text/markdown, text/html;q=0.8")).toBe("markdown");
    expect(negotiate("text/markdown, text/plain;q=0.5, */*;q=0.1")).toBe("markdown");
    expect(negotiate("text/markdown;q=0.9, text/*;q=0.5")).toBe("markdown");
  });

  it("breaks an equal-q tie towards HTML and respects q=0", () => {
    expect(negotiate("text/html, text/markdown")).toBe("html");
    expect(negotiate("text/html;q=0, text/markdown;q=0.5")).toBe("markdown");
    expect(negotiate("text/markdown;q=0, */*")).toBe("html");
  });

  it("reports when neither representation is acceptable", () => {
    expect(negotiate("application/json")).toBe("none");
    expect(negotiate("text/html;q=0, text/markdown;q=0")).toBe("none");
    expect(negotiate("application/json, */*;q=0.1")).toBe("html");
  });
});
