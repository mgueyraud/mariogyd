import { getStoryMarkdown } from "@/lib/story";
import { SITE_URL } from "@/lib/site";

// Mario's story in long form, as markdown. Pure build-time data, so it
// prerenders. The same text is folded into /index.md under "My story".
export const dynamic = "force-static";

export function GET() {
  const body = [
    getStoryMarkdown().trimEnd(),
    "",
    "---",
    `Long-form bio from ${SITE_URL}. Home page as Markdown: ${SITE_URL}/index.md · Index of everything: ${SITE_URL}/llms.txt`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
