/*
 * The one place the site's identity lives for machine readers: canonical
 * origin, contact details, and the profiles linked from the footer. Metadata,
 * JSON-LD, llms.txt, the sitemap and the markdown mirror all read from here so
 * none of them can disagree about who this site belongs to.
 *
 * The apex `mariogyd.com` 308-redirects to `www`, so the canonical origin is
 * the www host — anything else makes canonicals and og:image point through a
 * redirect.
 */

export const SITE_URL = "https://www.mariogyd.com";
export const SITE_HOST = "mariogyd.com";

export const SITE_NAME = "Mario Gueyraud";
export const SITE_TITLE = "Senior Front-End & Design Engineer";
export const SITE_DESCRIPTION =
  "Passionate digital experience creator learning design engineering. Focused on simplicity, modernist design, and great taste.";

export const LOCATION = {
  city: "Asunción",
  country: "Paraguay",
  countryCode: "PY",
} as const;

export const CONTACT = {
  email: "mgueyraud.junior@gmail.com",
  github: "https://github.com/mgueyraud",
  x: "https://x.com/mariogyd",
  xHandle: "@mariogyd",
  linkedin: "https://www.linkedin.com/in/mariogyd/",
  resume: `${SITE_URL}/resume.pdf`,
  source: "https://github.com/mgueyraud/mariogyd",
} as const;

/** Absolute URL for a site path. `absolute("/lab")` → `https://www.mariogyd.com/lab`. */
export function absolute(path: string): string {
  return new URL(path, SITE_URL).toString();
}
