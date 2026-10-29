/*
 * Accept-header negotiation between the two representations every page has:
 * HTML for people, Markdown for agents (the acceptmarkdown.com convention).
 *
 * Implements the ranking from RFC 9110 §12.5.1 the way the convention
 * describes it: each type we can produce takes the q-value of its most
 * specific matching entry (exact type > `text/*` > `*\/*`), the highest score
 * wins, HTML wins ties because it is the default, and if nothing we can
 * produce is acceptable the caller answers 406.
 *
 * Pure and dependency-free so it runs in middleware and in unit tests.
 */

/** Request header the middleware sets on the rewrite so the markdown route knows it was reached on purpose. */
export const MARKDOWN_HEADER = "x-mariogyd-markdown";

export type Representation = "html" | "markdown";
export type Negotiation = Representation | "none";

export const MEDIA_TYPES: Record<Representation, string> = {
  html: "text/html",
  markdown: "text/markdown",
};

type AcceptEntry = {
  type: string;
  subtype: string;
  q: number;
};

export function parseAccept(header: string): AcceptEntry[] {
  return header
    .split(",")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .flatMap((raw) => {
      const [mediaRange, ...params] = raw.split(";").map((p) => p.trim());
      const [type, subtype] = mediaRange.toLowerCase().split("/");
      if (!type || !subtype) return [];
      let q = 1;
      for (const param of params) {
        const [key, value] = param.split("=").map((p) => p.trim());
        if (key?.toLowerCase() === "q" && value !== undefined) {
          const parsed = Number(value);
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
        }
      }
      return [{ type, subtype, q }];
    });
}

/**
 * The q-value a media type earns from an Accept header: its most specific
 * matching entry decides, and 0 means "not acceptable" (no match, or q=0).
 */
export function scoreFor(mediaType: string, entries: AcceptEntry[]): number {
  const [type, subtype] = mediaType.toLowerCase().split("/");
  let best: { specificity: number; q: number } | undefined;
  for (const entry of entries) {
    let specificity: number;
    if (entry.type === type && entry.subtype === subtype) specificity = 3;
    else if (entry.type === type && entry.subtype === "*") specificity = 2;
    else if (entry.type === "*" && entry.subtype === "*") specificity = 1;
    else continue;
    if (!best || specificity > best.specificity) {
      best = { specificity, q: entry.q };
    }
  }
  return best?.q ?? 0;
}

/**
 * Which representation an Accept header asks for.
 *
 * - missing or empty header → "html" (no constraint, serve the default)
 * - `*\/*` or `text/*` → "html" (anything is fine, serve the default)
 * - markdown scored strictly above html → "markdown"
 * - neither acceptable (e.g. `Accept: application/json`) → "none" (406)
 */
export function negotiate(accept: string | null | undefined): Negotiation {
  if (!accept || !accept.trim()) return "html";
  const entries = parseAccept(accept);
  if (entries.length === 0) return "html";
  const html = scoreFor(MEDIA_TYPES.html, entries);
  const markdown = scoreFor(MEDIA_TYPES.markdown, entries);
  if (html === 0 && markdown === 0) return "none";
  return markdown > html ? "markdown" : "html";
}
