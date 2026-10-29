import { describe, expect, it } from "vitest";
import { getHomeJsonLd, jsonLdScript, PERSON_ID } from "@/lib/json-ld";
import { CONTACT, SITE_URL } from "@/lib/site";

type Node = Record<string, unknown> & { "@type": string };

describe("home JSON-LD", () => {
  const data = getHomeJsonLd();
  const graph = data["@graph"] as Node[];
  const person = graph.find((n) => n["@type"] === "Person")!;

  it("is a schema.org graph with WebSite, ProfilePage and Person", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(graph.map((n) => n["@type"]).sort()).toEqual(["Person", "ProfilePage", "WebSite"]);
  });

  it("describes the person with name, url, description, job title and profiles", () => {
    expect(person.name).toBe("Mario Gueyraud");
    expect(person.url).toBe(SITE_URL);
    expect(person.jobTitle).toMatch(/Engineer/);
    expect(typeof person.description).toBe("string");
    expect(person.sameAs).toEqual(expect.arrayContaining([CONTACT.github, CONTACT.linkedin, CONTACT.x]));
  });

  it("carries a PostalAddress and a ContactPoint with an email", () => {
    expect(person.address).toMatchObject({ "@type": "PostalAddress", addressLocality: "Asunción", addressCountry: "PY" });
    expect(person.contactPoint).toMatchObject({ "@type": "ContactPoint", email: CONTACT.email });
    expect((person.contactPoint as Node).contactType).toBeTruthy();
  });

  it("links the website and profile page back to the person", () => {
    const site = graph.find((n) => n["@type"] === "WebSite")!;
    const profile = graph.find((n) => n["@type"] === "ProfilePage")!;
    expect(site.author).toEqual({ "@id": PERSON_ID });
    expect(profile.mainEntity).toEqual({ "@id": PERSON_ID });
  });

  it("serialises safely for an inline script", () => {
    const script = jsonLdScript({ a: "</script><b>" });
    expect(script).not.toContain("</script>");
    expect(JSON.parse(script)).toEqual({ a: "</script><b>" });
    expect(() => JSON.parse(jsonLdScript(data))).not.toThrow();
  });
});
