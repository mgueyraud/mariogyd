import type { Metadata } from "next";
import PlaygroundLoader from "@/components/playground/PlaygroundLoader";

// Dev-only scratch canvas (see pageExtensions in next.config.mjs). Lives
// outside the (site) group so it renders full-bleed without the nav.
export const metadata: Metadata = {
  title: "Playground",
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return <PlaygroundLoader />;
}
