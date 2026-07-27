import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Nav from "@/components/custom/Nav";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mariogyd.com"),
  title: "Mario Gueyraud",
  description:
    "Passionate digital experience creator learning design engineering. Focused on simplicity, modernist design, and great taste.",
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
        <div className="px-6 pt-[88px] pb-24">
          <div className="max-w-[600px] ml-[clamp(0px,14vw,260px)]">
            <Nav />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
