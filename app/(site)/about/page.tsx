import type { Metadata } from "next";
import TextPage from "@/components/site/TextPage";
import { ABOUT } from "@/lib/pages";

export const metadata: Metadata = {
  title: `${ABOUT.title} — Mario Gueyraud`,
  description: ABOUT.description,
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <TextPage page={ABOUT} />;
}
