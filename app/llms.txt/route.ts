import { getSiteMarkdown } from "@/lib/site-markdown";

// Same mirror as /index.md, at the path agents look for first.
export const dynamic = "force-static";

export function GET() {
  return new Response(getSiteMarkdown(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
