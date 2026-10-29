import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  // The www host is where the apex redirects, so canonicals and og:image
  // must point there rather than through the 308.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  // Pages that set their own `alternates` replace this whole object, so each
  // one supplies its own canonical; the home page inherits these.
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md" },
  },
  // og:title / og:description fall back to the page's own title and
  // description, so sub-pages inherit only the site-wide fields here.
  openGraph: {
    type: "website",
    siteName: `${SITE_NAME} — ${SITE_TITLE}`,
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@mariogyd",
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/circle-black.svg",
        href: "/circle-black.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/circle-white.svg",
        href: "/circle-white.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body className={cn("bg-paper text-ink font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
