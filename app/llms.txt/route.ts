import { getLlmsTxt } from "@/lib/llms-txt";

// The llmstxt.org index: what's here, when an agent should use it, and links
// to every page. The home page's own markdown lives at /index.md.
export const dynamic = "force-static";

export function GET() {
  return new Response(getLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
