import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mario Gueyraud",
  description: "Passionate digital experience creator learning design engineering. Focused on simplicity, modernist design, and great taste.",
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/circle-black.svg',
        href: '/circle-black.svg',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/circle-white.svg',
        href: '/circle-white.svg',
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
    <html lang="en" data-theme="dark">
      <body className={cn(inter.className, 'bg-neutral-900 text-white')}>
        <main className="py-20 max-w-xl mx-auto px-4 md:px-0">
          {children}
        </main>
      </body>
    </html>
  );
}
