import { describe, expect, it } from "vitest";

/*
 * End-to-end checks against a running site: `pnpm test:site` targets
 * http://localhost:3000 (after `pnpm build && pnpm start`) or whatever
 * SITE_URL points at, e.g. SITE_URL=https://www.mariogyd.com pnpm test:site.
 * Skipped by plain `pnpm test`, which has no server to talk to.
 */
const base = process.env.SITE_URL?.replace(/\/$/, "");

/** True when a Vary value lists `Accept` itself, not just `Accept-Encoding`. */
const variesOnAccept = (vary: string | null) =>
  (vary ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .includes("accept");

const get = (path: string, accept?: string) =>
  fetch(`${base}${path}`, {
    headers: accept ? { Accept: accept } : {},
    redirect: "follow",
  });

describe.skipIf(!base)("agent readiness", () => {
  it("serves Markdown for Accept: text/markdown on the home page, with Vary: Accept", async () => {
    const res = await get("/", "text/markdown");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(
      /^text\/markdown; charset=utf-8/,
    );
    expect(variesOnAccept(res.headers.get("vary"))).toBe(true);
    const body = await res.text();
    expect(body).toContain("# Mario Gueyraud");
  });

  it("keeps serving HTML for Accept: text/html and for browsers", async () => {
    for (const accept of [
      "text/html",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      undefined,
    ]) {
      const res = await get("/", accept);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/^text\/html/);
      expect(await res.text()).toContain("<h1");
    }
  });

  // Set by middleware.ts and the next.config `headers()` rule. Next 14's own
  // server (`next start`) overwrites Vary when it renders a page, so this is a
  // property of the deployment: it is checked against Vercel, not localhost.
  it.skipIf(/localhost|127\.0\.0\.1/.test(base ?? ""))(
    "marks the HTML response as varying on Accept too",
    async () => {
      const res = await get("/", "text/html");
      expect(variesOnAccept(res.headers.get("vary"))).toBe(true);
    },
  );

  it("negotiates Markdown on sub-pages too", async () => {
    for (const path of ["/lab", "/trips", "/about", "/contact", "/privacy"]) {
      const res = await get(path, "text/markdown");
      expect(res.status, path).toBe(200);
      expect(res.headers.get("content-type"), path).toMatch(/^text\/markdown/);
    }
  });

  it("answers unknown paths with 404 and a Markdown body when asked for Markdown", async () => {
    const res = await get("/__agent-404-probe-xyz", "text/markdown");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toMatch(/^text\/markdown/);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("/llms.txt");
  });

  it("keeps the HTML 404 for browsers", async () => {
    const res = await get("/__agent-404-probe-xyz", "text/html");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toMatch(/^text\/html/);
  });

  it("returns 406 only for a page whose Accept rules out both representations", async () => {
    const res = await get("/", "application/json");
    expect(res.status).toBe(406);
    expect(variesOnAccept(res.headers.get("vary"))).toBe(true);
    expect(await res.text()).toContain("text/markdown");
    const nf = await get("/__agent-404-probe-xyz", "application/json");
    expect(nf.status).toBe(404);
  });

  it("does not expose the internal /markdown route directly", async () => {
    const res = await get("/markdown", "text/markdown");
    expect(res.status).toBe(404);
  });

  it("serves llms.txt, index.md, sitemap.xml and robots.txt", async () => {
    const llms = await get("/llms.txt");
    expect(llms.status).toBe(200);
    const llmsText = await llms.text();
    expect(llmsText.startsWith("# Mario Gueyraud\n")).toBe(true);
    expect(llmsText).toContain("When to use this site:");

    const md = await get("/index.md");
    expect(md.headers.get("content-type")).toMatch(/^text\/markdown/);

    const sitemap = await get("/sitemap.xml");
    expect(sitemap.status).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<lastmod>");
    expect(xml).toContain("https://www.mariogyd.com/about</loc>");

    const robots = await get("/robots.txt");
    expect(await robots.text()).toContain(
      "Sitemap: https://www.mariogyd.com/sitemap.xml",
    );
  });

  it("has JSON-LD, canonical, og:type, og:image and lang on the home page", async () => {
    const html = await (await get("/", "text/html")).text();
    expect(html).toMatch(/<html[^>]*\slang="en"/);
    expect(html).toContain(
      '<link rel="canonical" href="https://www.mariogyd.com"',
    );
    expect(html).toContain('<meta property="og:type" content="website"');
    expect(html).toMatch(
      /<meta property="og:image" content="https:\/\/www\.mariogyd\.com\/opengraph-image/,
    );
    const ld = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/s,
    );
    expect(ld).not.toBeNull();
    const data = JSON.parse(ld![1]);
    expect(
      data["@graph"].some((n: { "@type": string }) => n["@type"] === "Person"),
    ).toBe(true);
  });

  it("serves the trust pages with enough prose", async () => {
    for (const path of ["/about", "/contact", "/privacy"]) {
      const res = await get(path, "text/html");
      expect(res.status, path).toBe(200);
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ");
      expect(text.length, path).toBeGreaterThan(500);
      expect(html, path).toContain(
        `<link rel="canonical" href="https://www.mariogyd.com${path}"`,
      );
    }
  });
});
