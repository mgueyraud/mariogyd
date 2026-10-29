import Reveal from "@/components/site/Reveal";
import TextLink from "@/components/site/TextLink";
import type { TextPage as TextPageData } from "@/lib/pages";

/*
 * The prose pages (About, Contact, Privacy), set like the Lab and Trips
 * headers: serif title, muted body column, hairline-underlined links. The
 * content comes from lib/pages.ts so the markdown mirror renders the same words.
 */
export default function TextPage({ page }: { page: TextPageData }) {
  let step = 1;
  return (
    <article>
      <Reveal step={step++} as="header">
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.01em]">
          {page.title}
        </h1>
      </Reveal>

      {page.sections.map((section, i) => (
        <Reveal
          key={i}
          step={step++}
          as="section"
          className={i === 0 ? "mt-3.5" : "mt-10"}
        >
          {section.heading ? (
            <h2 className="mb-3 font-mono text-[11px] font-normal tracking-[0.14em] text-faint uppercase">
              {section.heading}
            </h2>
          ) : null}
          {section.paragraphs.map((p) => (
            <p key={p} className="mt-4 max-w-[52ch] text-subtle text-pretty first:mt-0">
              {p}
            </p>
          ))}
          {section.links?.length ? (
            <ul className="mt-5 flex flex-col gap-2.5 text-sm">
              {section.links.map((link) => {
                const external = /^(https?:|mailto:)/.test(link.href);
                return (
                  <li key={link.href} className="flex flex-wrap items-baseline gap-x-2">
                    <TextLink
                      href={link.href}
                      variant="underline"
                      target={external && !link.href.startsWith("mailto:") ? "_blank" : undefined}
                      rel={external ? "me noopener" : undefined}
                    >
                      {link.label}
                    </TextLink>
                    <span className="text-[13px] text-subtle">{link.note}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Reveal>
      ))}

      <Reveal step={step++} className="mt-12 font-mono text-[11px] tracking-[0.08em] text-faint">
        LAST UPDATED {page.updated}
      </Reveal>
    </article>
  );
}
