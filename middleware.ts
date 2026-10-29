import { NextResponse, type NextRequest } from "next/server";
import { MARKDOWN_HEADER, negotiate } from "@/lib/content-negotiation";

/*
 * Markdown content negotiation (acceptmarkdown.com) for every page.
 *
 * A request whose Accept header prefers `text/markdown` over `text/html` is
 * rewritten to the internal /markdown route, which answers with the page as
 * Markdown (or a Markdown 404). Everything else renders as usual. Both
 * answers carry `Vary: Accept` so caches keep the two representations apart.
 *
 * Only page navigations negotiate: static files, /_next, /api and the OG
 * image routes are excluded by the matcher, and the App Router's own RSC and
 * prefetch fetches (which send `Accept: text/x-component`) pass straight
 * through. 406 is reserved for a page URL whose Accept header rules out both
 * HTML and Markdown — never for unknown paths, which stay 404.
 */

const MARKDOWN_PREFIX = "/markdown";

/**
 * Next's own Vary entries plus Accept. Set in full, rather than appended,
 * because the layer that applies middleware headers may replace the render's
 * value instead of merging with it.
 */
export const HTML_VARY =
  "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept";

const PAGE_PATTERNS = [
  /^\/$/,
  /^\/lab(\/[^/]+)?$/,
  /^\/trips(\/[^/]+)?$/,
  /^\/(about|contact|privacy)$/,
];

function isNavigation(request: NextRequest): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (request.headers.has("rsc")) return false;
  if (request.headers.has("next-router-prefetch")) return false;
  if (request.headers.get("purpose") === "prefetch") return false;
  return true;
}

export function middleware(request: NextRequest) {
  if (!isNavigation(request)) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const representation = negotiate(request.headers.get("accept"));

  if (representation === "markdown") {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? MARKDOWN_PREFIX : `${MARKDOWN_PREFIX}${pathname}`;
    const headers = new Headers(request.headers);
    headers.set(MARKDOWN_HEADER, "1");
    const response = NextResponse.rewrite(url, { request: { headers } });
    response.headers.set("Vary", "Accept");
    return response;
  }

  if (
    representation === "none" &&
    PAGE_PATTERNS.some((re) => re.test(pathname))
  ) {
    return new NextResponse(
      [
        "406 Not Acceptable",
        "",
        `This URL is available as text/html and text/markdown; the Accept header "${request.headers.get("accept")}" matches neither.`,
        "Retry with Accept: text/html or Accept: text/markdown.",
        "",
      ].join("\n"),
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Accept",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("Vary", HTML_VARY);
  return response;
}

export const config = {
  // Pages only: skip Next internals, API routes, the internal markdown route,
  // anything with a file extension (resume.pdf, llms.txt, videos, images) and
  // the generated OG images, which are fetched with Accept: image/*.
  matcher: [
    "/((?!api/|_next/|markdown(?:/|$)|.*\\.|.*opengraph-image|.*twitter-image).*)",
  ],
};
