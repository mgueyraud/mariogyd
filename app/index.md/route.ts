import { getSiteMarkdown } from "@/lib/site-markdown";

// The home page as markdown. Pure build-time data, so it prerenders.
export const dynamic = "force-static";

export function GET() {
  return new Response(getSiteMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
