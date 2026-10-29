import Nav from "@/components/site/Nav";
import { ViewModeProvider } from "@/components/site/ViewMode";
import { getSiteMarkdown } from "@/lib/site-markdown";

// Shell for the main site pages: fluid page padding + the left-offset
// 600px content column with the shared nav. The 404 lives outside this
// group (app/not-found.tsx) so it can render full-bleed without the nav.
//
// The nav's HUMAN / MACHINE checkbox switches the page off like a TV and
// brings up its plain-text mirror (the same text /index.md and /llms.txt
// serve) as a dark page of its own. The markdown is built here once; the
// provider owns the switch and wraps the whole page so all of it collapses.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewModeProvider markdown={getSiteMarkdown()}>
      <div style={{ padding: "clamp(48px, 9vw, 88px) clamp(18px, 5vw, 24px) 96px" }}>
        <div
          className="max-w-[600px]"
          style={{ marginLeft: "clamp(0px, 30vw - 210px, 260px)" }}
        >
          <Nav />
          {children}
        </div>
      </div>
    </ViewModeProvider>
  );
}
