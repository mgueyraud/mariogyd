import { ROLES } from "@/lib/experience";
import {
  CONTACT,
  LOCATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

/*
 * Structured data for the home page. A personal site, so the identity type is
 * Person, published through a ProfilePage so parsers know the page is about
 * that person. The WebSite node names the site and points at the person as
 * its author; the Person node carries the fields agents use to resolve and
 * contact an entity: sameAs profiles, a postal address and a contact point.
 */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function getHomeJsonLd() {
  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME,
    givenName: "Mario",
    familyName: "Gueyraud",
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    jobTitle: SITE_TITLE,
    description: SITE_DESCRIPTION,
    email: `mailto:${CONTACT.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: LOCATION.city,
      addressCountry: LOCATION.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "professional inquiries",
      email: CONTACT.email,
      url: `${SITE_URL}/contact`,
      availableLanguage: ["en", "es"],
    },
    sameAs: [CONTACT.github, CONTACT.linkedin, CONTACT.x],
    knowsAbout: [
      "Front-end engineering",
      "Design engineering",
      "React",
      "Next.js",
      "TypeScript",
      "UI animation",
      "Design systems",
    ],
    worksFor: ROLES.slice(0, 1).map((r) => ({
      "@type": "Organization",
      name: r.company,
      url: r.url,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: `${SITE_NAME} — ${SITE_TITLE}`,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
        dateModified: new Date().toISOString().slice(0, 10),
      },
      person,
    ],
  };
}

/** Serialised for a <script type="application/ld+json">; `<` is escaped so the JSON can't close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
