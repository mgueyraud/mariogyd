import Nav from "@/components/site/Nav";

// Shell for the main site pages: fluid page padding + the left-offset
// 600px content column with the shared nav. The 404 lives outside this
// group (app/not-found.tsx) so it can render full-bleed without the nav.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "clamp(48px, 9vw, 88px) clamp(18px, 5vw, 24px) 96px" }}>
      <div
        className="max-w-[600px]"
        style={{ marginLeft: "clamp(0px, 30vw - 210px, 260px)" }}
      >
        <Nav />
        {children}
      </div>
    </div>
  );
}
