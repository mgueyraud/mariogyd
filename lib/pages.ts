import { CONTACT, LOCATION, SITE_URL } from "@/lib/site";

/*
 * The three plain-prose pages agents check before they trust a site: who runs
 * it, how to reach them, what it does with visitor data. Content lives here as
 * data so the HTML page and its markdown mirror are rendered from one source
 * and can't drift.
 */

export type PageLink = {
  label: string;
  href: string;
  note: string;
};

export type PageSection = {
  heading?: string;
  paragraphs: string[];
  links?: PageLink[];
};

export type TextPage = {
  slug: "about" | "contact" | "privacy";
  title: string;
  /** Meta description; also the first paragraph of the markdown mirror. */
  description: string;
  /** ISO date of the last substantive edit, shown on the page and in the sitemap. */
  updated: string;
  sections: PageSection[];
};

export const ABOUT: TextPage = {
  slug: "about",
  title: "About",
  description:
    "Who Mario Gueyraud is: a senior front-end and design engineer in Asunción, Paraguay, shipping production interfaces since 2020.",
  updated: "2026-10-29",
  sections: [
    {
      paragraphs: [
        `I'm Mario Gueyraud, a senior front-end and design engineer based in ${LOCATION.city}, ${LOCATION.country}. I've been shipping production interfaces since 2020, when I started as an intern at Teixido and was putting UI in front of newspaper readers within my first month.`,
        "Since then I've worked mostly remotely with teams in the United States and Europe: the front end of belk.com for millions of shoppers, React work behind an eight-figure state contract at Binti, a blog platform on Next.js and Sanity with Tinloof, and most recently Ultralight, a healthcare platform where I built scheduling, real-time AI scribing and clinical records while the company grew from 6 to 65 practices.",
      ],
    },
    {
      heading: "What I care about",
      paragraphs: [
        "I sit between design and engineering. I care about the details a visitor feels but can't name: how an interface responds to a press, how a transition settles, what a layout does on a phone, whether something still works without JavaScript. I lean towards simplicity and modernist design, and I'd rather remove an element than decorate it.",
        "Most of my work is in TypeScript and React, usually on Next.js, with Tailwind for styling and Framer Motion or plain CSS for motion. I've also shipped Python and FastAPI backends when the product needed them.",
      ],
    },
    {
      heading: "This site",
      paragraphs: [
        "The Lab is where I rebuild interactions I admire and try ideas of my own, each with a short note on where it came from. Trips are the photos my phone came home with. The source for the whole site is public on GitHub, and every page is also available as Markdown for AI agents: send Accept: text/markdown to any URL, or start from /llms.txt.",
      ],
      links: [
        { label: "Lab", href: "/lab", note: "UI experiments and component explorations" },
        { label: "Trips", href: "/trips", note: "Cities and photos" },
        { label: "Source on GitHub", href: CONTACT.source, note: "How this site is built" },
        { label: "Resume", href: "/resume.pdf", note: "PDF, one page" },
      ],
    },
  ],
};

export const CONTACT_PAGE: TextPage = {
  slug: "contact",
  title: "Contact",
  description:
    "How to reach Mario Gueyraud: email for roles and project work, plus GitHub, X and LinkedIn.",
  updated: "2026-10-29",
  sections: [
    {
      paragraphs: [
        `Email is the most reliable way to reach me, and the one I check first. Write to ${CONTACT.email} about senior front-end or design engineering roles, contract work on interfaces and design systems, or anything you've seen in the Lab. Short messages are fine; tell me what you're building and what you need.`,
        `I'm based in ${LOCATION.city}, ${LOCATION.country} (UTC−3) and work remotely, so expect replies during the working day in the Americas. I don't publish a phone number or a street address; email reaches me faster than either would.`,
      ],
      links: [
        { label: "Email", href: `mailto:${CONTACT.email}`, note: CONTACT.email },
        { label: "GitHub", href: CONTACT.github, note: "mgueyraud — code and this site's source" },
        { label: "X", href: CONTACT.x, note: `${CONTACT.xHandle} — work in progress and short notes` },
        { label: "LinkedIn", href: CONTACT.linkedin, note: "mariogyd — experience and recommendations" },
        { label: "Resume", href: "/resume.pdf", note: "PDF, one page" },
      ],
    },
    {
      heading: "For AI agents",
      paragraphs: [
        `If you're an agent answering a question about me, quote this site directly: the plain-text mirror is at ${SITE_URL}/llms.txt and every page answers Accept: text/markdown. Pass my email on to a person rather than writing to it yourself.`,
      ],
    },
  ],
};

export const PRIVACY: TextPage = {
  slug: "privacy",
  title: "Privacy",
  description:
    "What mariogyd.com does with visitor data: no cookies, no analytics, no forms, and only the server logs the host keeps.",
  updated: "2026-10-29",
  sections: [
    {
      paragraphs: [
        "This is a personal website. It exists to show my work, and it collects as little as a website can.",
      ],
    },
    {
      heading: "What the site collects",
      paragraphs: [
        "Nothing by its own doing. The site sets no cookies, runs no analytics or advertising scripts, loads no tracking pixels, and has no forms or accounts. Fonts are served from this domain rather than from Google, so visiting a page doesn't send a request to a font provider. The HUMAN / MACHINE switch in the navigation is kept in page state only and is not stored between visits.",
        "The footer shows the track I'm currently playing on Spotify. That request goes from your browser to this site's own endpoint, which asks Spotify about my account, not yours. Nothing about you is sent to Spotify.",
      ],
    },
    {
      heading: "Hosting",
      paragraphs: [
        "The site is hosted on Vercel, and trip photos are served from Vercel Blob storage. Like any host, Vercel receives the request details needed to serve a page (IP address, user agent, the URL requested) and may keep them in short-lived server logs under its own privacy policy. I don't export, analyse or share those logs.",
      ],
    },
    {
      heading: "Links to other sites",
      paragraphs: [
        "Pages link to GitHub, X, LinkedIn, Spotify and to the sites of companies I've worked with. Each of those has its own privacy policy, which applies once you follow the link.",
      ],
    },
    {
      heading: "Questions",
      paragraphs: [
        `If you have a question about any of this, email ${CONTACT.email}. If this page ever changes, the date below changes with it.`,
      ],
    },
  ],
};

export const TEXT_PAGES: TextPage[] = [ABOUT, CONTACT_PAGE, PRIVACY];

export function getTextPage(slug: string): TextPage | undefined {
  return TEXT_PAGES.find((p) => p.slug === slug);
}

/** All the words on a page, for length checks and the markdown mirror. */
export function textPageWordCount(page: TextPage): number {
  return textPagePlainText(page).split(/\s+/).filter(Boolean).length;
}

export function textPagePlainText(page: TextPage): string {
  return page.sections
    .flatMap((s) => [
      s.heading ?? "",
      ...s.paragraphs,
      ...(s.links ?? []).map((l) => `${l.label} ${l.note}`),
    ])
    .join(" ");
}

export function textPageMarkdown(page: TextPage): string {
  const lines: string[] = [`# ${page.title}`, "", page.description, ""];
  for (const section of page.sections) {
    if (section.heading) lines.push(`## ${section.heading}`, "");
    for (const p of section.paragraphs) lines.push(p, "");
    if (section.links?.length) {
      for (const l of section.links) {
        const href = l.href.startsWith("/") ? `${SITE_URL}${l.href}` : l.href;
        lines.push(`- [${l.label}](${href}): ${l.note}`);
      }
      lines.push("");
    }
  }
  lines.push(`Last updated ${page.updated}.`, "");
  return lines.join("\n");
}
