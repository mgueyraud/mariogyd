import type { Metadata } from "next";
import TextPage from "@/components/site/TextPage";
import { PRIVACY } from "@/lib/pages";

export const metadata: Metadata = {
  title: `${PRIVACY.title} — Mario Gueyraud`,
  description: PRIVACY.description,
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <TextPage page={PRIVACY} />;
}
