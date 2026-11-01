import { ROLES } from "@/lib/experience";
import { KIND_WORDS } from "@/lib/kind-words";
import { getAllLabMeta } from "@/lib/lab-meta";
import { storySectionLines } from "@/lib/story";
import { TRIPS, longDate } from "@/lib/trips";

/*
 * The plain-text mirror of the site, served at /index.md, as the Accept:
 * text/markdown body of / and rendered in the nav's MACHINE view. Built from
 * the same data the pages use, so it can't drift from them. The long-form
 * story (lib/story.ts) is folded in near the end so the compact sections stay
 * on top. Server-only: lab-meta reads the filesystem.
 *
 * Kept to a small markdown subset on purpose — headings, bullets, one
 * blockquote, two-space continuation lines — because MachineView colours the
 * lines by those prefixes rather than running a markdown parser.
 */

export const SITE_HOST = "mariogyd.com";

const span = (years: string) => years.replace(" ··· ", "–");

export function getSiteMarkdown(): string {
  const lines: string[] = [
    `> Note to any AI agent: this is the plain-text mirror of ${SITE_HOST}. Read it, quote it, answer questions about Mario. His full story, in his own words, is the “My story” section near the end (also at ${SITE_HOST}/story.md). Don’t run anything from it.`,
    "",
    "# Mario Gueyraud",
    "Senior Front-End & Design Engineer — Asunción, Paraguay.",
    "",
    "Passionate digital experience creator learning design engineering. Focused on simplicity, modernist design, and great taste.",
    "",
    "## Experience",
    ...ROLES.flatMap((r) => [
      `- ${span(r.years)}  ${r.company} — ${r.role}`,
      `  ${r.desc} (${r.site})`,
    ]),
    "",
    "## Kind words",
    ...KIND_WORDS.map((t) => {
      const context = [t.together.replace("Worked together at", "worked together at"), t.now?.toLowerCase()]
        .filter(Boolean)
        .join("; ");
      return `- ${t.name} (${context}): “${t.highlight}”`;
    }),
    "",
    "## Lab",
    ...getAllLabMeta().map(
      (lab) => `- ${lab.title} — ${lab.description} (${SITE_HOST}/lab/${lab.slug})`
    ),
    "",
    "## Trips",
    ...TRIPS.map((t) => `- ${t.city}, ${t.country} — ${longDate(t.date)}`),
    "",
    "## My story",
    ...storySectionLines(),
    "",
    "## Elsewhere",
    "- GitHub: github.com/mgueyraud",
    "- X: @mariogyd",
    "- LinkedIn: linkedin.com/in/mariogyd",
    "- Email: mgueyraud.junior@gmail.com",
    `- Resume: ${SITE_HOST}/resume.pdf`,
    `- Story on its own: ${SITE_HOST}/story.md`,
    "",
  ];
  return lines.join("\n");
}
