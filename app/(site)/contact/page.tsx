import type { Metadata } from "next";
import TextPage from "@/components/site/TextPage";
import { CONTACT_PAGE } from "@/lib/pages";

export const metadata: Metadata = {
  title: `${CONTACT_PAGE.title} — Mario Gueyraud`,
  description: CONTACT_PAGE.description,
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <TextPage page={CONTACT_PAGE} />;
}
