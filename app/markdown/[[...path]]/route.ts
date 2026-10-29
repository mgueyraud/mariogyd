import type { NextRequest } from "next/server";
import { renderMarkdownRoute } from "@/lib/markdown-routes";
import { MARKDOWN_HEADER } from "@/lib/content-negotiation";

/*
 * Internal target of the Accept: text/markdown rewrite in middleware.ts. It is
 * not a public URL: a request that didn't come through the middleware (no
 * marker header) gets a plain 404 so the site doesn't grow a second URL for
 * every page. The response is a function of the path alone, so Vercel can
 * cache it at the edge per variant.
 */
export const dynamic = "force-dynamic";

export function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  if (request.headers.get(MARKDOWN_HEADER) !== "1") {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const pathname = "/" + (params.path ?? []).join("/");
  const { status, body } = renderMarkdownRoute(pathname);

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control":
        status === 200
          ? "public, s-maxage=600, stale-while-revalidate=86400"
          : "public, s-maxage=60",
      "X-Robots-Tag": "noindex",
    },
  });
}
