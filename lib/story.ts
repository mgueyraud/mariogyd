/*
 * Mario's story, long form: the human part, then every role in order. This is
 * the fullest first-person account on the site, so it is what an agent should
 * read when a one-line bio isn't enough. Served on its own at /story.md and
 * folded into the home page mirror (MACHINE view, /index.md, Accept:
 * text/markdown on /) by lib/site-markdown.ts.
 *
 * Headings start at H2 so the body can sit under an H1 (/story.md) or, demoted
 * one level, under a "## My story" section of the home mirror. Keep to plain
 * paragraphs, ##/### headings, bullets and bold: MachineView tints lines by
 * prefix only.
 */

/** ISO date of the last substantive edit, shown in the footer and the sitemap. */
export const STORY_UPDATED = "2026-11-01";

export const STORY_INTRO =
  "I set my biggest life goal when I was nine years old, and it took me sixteen years to reach it. My name is Mario Gueyraud, I’m an engineer from Paraguay, and this is my story, the human part first, because it is the part that explains everything else.";

export const STORY_BODY = `## Me as a human

I was born and raised in Paraguay, the son of two Paraguayans with French roots (my great-grandfather was French). I lived in Paraguay with my mom until I was five, since my dad was working in Miami. Then he took me to live with him there, and I spent four years in the US with my dad.

In the US I met great people and made a best friend I still remember to this day, Diego. His parents, Leslie and Joaquin, were wonderful people who took care of me. I had a blast and enjoyed every minute there: going to school, going to the beach, and my dad blasting Frankie Ruiz through the car speakers (he loved salsa). Then my dad was diagnosed with cancer, and in 2009 he sadly passed away. I had to come back to Paraguay to live with my mom.

Back in Paraguay, I reunited with my mom after four years apart. She always took great care of me and made sure I had everything I needed. I’ve spent most of my life here since, going to school and making new friends.

It was then that I met Christian, my stepfather. He never tried to replace my dad, he just showed up, every day, and treated me like his own son. He is also the reason I do what I do: when I was 11 he sat me in front of a computer, showed me what engineering could be, and walked me through every path it could open. To this day I call him my father, and I mean it.

I got to meet my new sister Angelica (Kika), and later my brother Ian was born. I love them with all my heart (I’m the second of five siblings). We had some rough times, but what I value most about my family is that we overcame everything. I still carry that with me, and it’s part of who I am.

Ever since I came back to Paraguay, I had one goal: to go back to where I lived with my dad and meet up with Diego and his family. I didn’t know how I was going to do it, but I knew I was capable of it.

When I was 13, I heard about a competition called Google Code-in that was being held here in Paraguay. I was the only person who showed up to the meetup, and to be honest, I didn’t end up participating because I was afraid at the time. From then on I started playing with everything: mobile development, animations in Blender, web development, hacking with Kali Linux. I stuck with mobile development because I really enjoyed it, and I built a few small side projects while I was in school, like a rock-paper-scissors app to play with your friends.

Fast forward to 2020: I started university, COVID hit, and I thought it was a great opportunity to start working (I wanted a little more independence, if you know what I mean, haha). I was grateful to land a job at an agency here in Paraguay, where I learned a lot (shout-out to Angel and Ivan). I was there for a year and a half, but I’ve always aimed higher and wanted more out of life, so I decided to take the leap and try working remotely for companies outside my country. It was the best decision I’ve ever made.

Since then, I’ve worked at startups like Ultralight and at enterprise companies like Belk (more on that in the “Me as a professional” section).

In 2025 I started a role as a Founding Engineer at Ultralight, where I met Nico (he’s from Uruguay), one of the best coworkers and friends anyone could’ve asked for. I learned so much at Ultralight, and I genuinely felt I was making the world a better place, since it was a healthcare AI startup. Then, out of nowhere, they proposed an onsite in SF! I was so happy I couldn’t believe it. Everything I had worked for and always imagined was coming true. They even paid for my flight to Miami so I could spend some time there, where I got to reunite with Leslie (my childhood best friend’s mom) and see where I used to live. It brought back so many memories. I’m truly grateful to Pedro (Ultralight’s CTO at the time) and especially Nico, who helped me through so much, both personally and professionally.

Outside of work, I love my friends, my family, and life itself, and I’m enjoying every part of it: playing padel, traveling all around the world (I love trips), and having a blast. I’m also a bit of an old soul. I love the way things used to be made, vintage tech like the iPod, the stuff from when we were all a little more disconnected and a little more present. I’m more into that than whatever is new this week.

Every chapter of my life required a different Mario. Miami, coming home to Paraguay, school, the agency, going remote, Ultralight. I adapted to each one, and each one left something in me that stuck. I’m always evolving, and the person writing this is the sum of all of those pieces.

When I look back at all of it, losing my dad, coming home to my mom, Christian showing up every single day, a family that went through rough times and came out the other side, I can see what it did to me. It made me someone who cares. About people first, about the things I’m working on, about getting the small stuff right. I value people and experiences over almost anything else, and that is where my empathy comes from.

It also made me someone who notices everything. Every detail, every small thing. These days I spend my life paying attention, trying to slow down and enjoy the little things that are easy to walk past. That is also why I ended up in design engineering and UX. At its heart it’s the same thing: putting yourself in someone else’s shoes, noticing where they struggle, and taking the friction out so their life gets a little easier. It’s why animations are the part of my work I love most, the small details that make a product feel alive and make someone’s day a bit smoother without them ever noticing why. I bring an uncommon amount of care to whatever I’m building. Not because someone asked for it, but because after everything, I don’t know how to do it any other way.

Standing in front of the house where I lived with my dad, with Nico next to me, I realized the goal I set at nine had quietly been met. I did not know what to replace it with, and honestly I still don’t fully know. What I do know is that today I get to build products with people I admire, from a country I love, for users all over the world. That is more than the kid who showed up alone to that Google Code-in meetup would have believed. I am grateful for all of it, and I am still writing the rest.

## Me as a professional

I’m a front-end, full-stack, product, and founding engineer with 6+ years of experience, most of it working remotely with US-based teams, since 2022 as a Toptal-vetted engineer (Toptal accepts roughly the top 3% of applicants). My core stack is TypeScript, React, React Native, Next.js, Python/FastAPI, and AWS, and my specialty is the product layer: design systems, UI architecture, performance, and the animations and details that make an interface feel finished. I’ve worked across healthtech, eCommerce, compliance, and consumer mobile, in roles ranging from UI developer at an agency to Founding Engineer at a healthcare AI startup. Below is each role in order, with what I built, the stack I used, and how long I was there.

### Software Developer Intern — Teixido (https://teixido.co/)

**2017 · 3 months · Asunción, Paraguay**

My first contact with the industry, a school-required internship. I didn’t ship anything of consequence here and I won’t pretend I did. What I got out of it was foundations: the team put me through courses, walked me through how real software gets built, and gave me the vocabulary I’d need three years later when I came back as a developer.

### Front-end / UI Developer — Teixido (https://teixido.co/)

**March 2020 – July 2021 · 1 year 5 months · Asunción, Paraguay (agency)**

My first real job. I joined during COVID, in my first year of university, and worked on web products for some of the biggest media and insurance brands in Paraguay. I was mostly the UI layer: building and maintaining components, then handing them off to the back-end engineers who integrated them.

- **5días (national newspaper, https://5dias.com.py/)** — The paper was going through a full rebrand, and I built the new design system from the ground up for the redesigned site: Sass structured with an ITCSS architecture and BEM naming so it could scale across every section without specificity fights, plus the React component library on top of it, with lazy-loading patterns to keep the rebranded site fast. Did some integration work in PHP alongside the back-end engineers who wired the components into the site.
- **Hoy (national newspaper, https://www.hoy.com.py/)** — Performance work on the existing site: lazy-loaded the React components, cut the initial load time, and reduced the download size on first paint.
- **La Consolidada (insurance, https://www.consolidada.com.py/)** — Owned the insurance-claims experience on the company’s website: the flow where a customer reports an incident, uploads photos of the damage, and adds the details of what happened. I shipped new features in that flow and reworked the overall UX to cut friction at every step, because the person filling it out had usually just had a bad day, a car accident or worse, and the last thing they needed was a form fighting them. React on the front end, PHP with CodeIgniter on the back end.
- **Gloria Ayala (personal-finance educator)** — Built and launched her blog on Ghost CMS, end to end.
- **ueno bank (formerly Visión Banco, https://www.ueno.com.py/)** — Worked on the marketing website we built for Visión Banco, shipping smaller updates and refinements. Visión Banco was later acquired by ueno, now the largest bank in Paraguay.

Stack: React, JavaScript, Sass (ITCSS + BEM), PHP, CodeIgniter, Ghost CMS, web performance (lazy loading, bundle/asset optimization).

### Lead Front-end Engineer — Tonic3 (agency, US, https://tonic3.com/)

**July 2021 – June 2022 · 1 year · Remote**

My first international role, and the one where I went from building UI to owning it. Tonic3 is a US agency, and I was placed full-time on its account with Avery Dennison (https://www.averydennison.com/), the global materials-science and digital-ID company behind the labels, tags, and RFID inlays inside the products of the world’s biggest apparel brands. I signed an NDA, so I can’t name the product or go into specifics, but I can describe the shape of what I built.

I was the lead front-end engineer on a B2B analytics dashboard that Avery Dennison’s brand clients used to understand the consumers interacting with their products: demographic breakdowns, geographic views, and the kind of segmentation that lets a marketing team target a specific type of customer. One of the biggest outdoor-apparel brands in the US was among the first clients onboarded, and the feedback from both that brand and the Avery Dennison team was strong enough that the product was then rolled out to additional clients.

What I built and owned:

- The entire front end, in **TypeScript and React**: data tables with server-side pagination, multi-dimensional filtering, charting, and interactive maps built on **Mapbox**.
- The **React component library** for the product, documented in **Storybook**. I started it from zero, and it was later adopted across Avery Dennison’s other internal products.
- The app itself became the **template** Avery Dennison used to spin up new applications, so the architecture decisions I made there outlived the project.
- **Unit and integration tests** across the front end.
- All **API integration** with the backend, working alongside a Java engineer who owned the services.

Stack: TypeScript, React, Storybook, Mapbox, REST API integration (Java backend), unit + integration testing.

### Front-end Engineer, eCommerce — Belk (https://www.belk.com/)

**June 2022 – September 2023 · 1 year 4 months · Remote (Charlotte, NC–based company)**

Belk is one of the largest regional department-store chains in the US, founded in 1888, with nearly 300 stores across 16 Southeastern states and a major eCommerce business on Belk.com. I was on the eCommerce engineering team, working in two-week sprints with a dedicated QA team, product, and design. Everything I shipped went in front of millions of shoppers, so accessibility and performance weren’t nice-to-haves, they were the job.

What I did:

- **Cut server-side render time nearly in half** by migrating templates from Salesforce Commerce Cloud’s ISML to JavaScript, the single biggest performance win I contributed on the storefront.
- **Built the Conn’s x Belk integration on Belk.com.** Belk had just partnered with Conn’s HomePlus to sell furniture, appliances, and electronics, and I developed the eCommerce side of that partnership: customers could buy Conn’s products through Belk.com and choose delivery, installation, and haul-away options at checkout. A net-new product category for the site, with its own fulfillment logic.
- **Extended Belk’s design system** with new components built as **Vue.js web components**, working directly with the design team on the component API so they’d be easy for other engineers to adopt, and wiring each one to its backend data with clean API integrations.
- **Owned heavy UI work and maintenance** across the storefront: HTML, CSS, and JavaScript fixes and improvements, with accessibility (WCAG) and Core Web Vitals in mind on every change.

Stack: Salesforce Commerce Cloud (SFCC / Demandware), ISML → JavaScript, Vue.js, Web Components, HTML/CSS/JavaScript, accessibility, web performance, Agile/Scrum with QA.

### Front-end Engineer (contract) — Tinloof (agency, Germany, https://tinloof.com/)

**September 2023 – November 2023 · 3 months · Remote**

A short, focused contract with Tinloof, a European agency known for Sanity and Next.js work, where I was dropped onto two client projects and shipped both end to end.

**Sole Retriever (sneaker release tracker, https://www.soleretriever.com/)** — Led the build of their new blog as a Next.js + Sanity MVP, replacing a Webflow setup. The result was a faster site and a content-editing experience that writers could use without engineering help. Two pieces I’m proud of:

- **The Webflow → Sanity migration.** I wrote custom scripts to scrape every existing article from Webflow and import it into a cleaner, structured content model in Sanity. Beyond the better architecture, this eliminated a five-figure annual Webflow bill the client had been paying just to run the blog.
- **A custom Sanity input component** that let writers search and select sneakers directly from Sole Retriever’s Supabase database inside the editor, so sneaker data (names, images, release details) could be embedded in articles without copy-pasting.

**Ambassador (referral-marketing platform, https://www.getambassador.com/)** — Built and shipped a responsive marketing website using Remix on top of Tinloof’s in-house page-builder: a reusable starter kit the agency had built so every new project began from a proven template and was then adapted to the client’s needs rather than built from scratch. Improved the site’s UX across devices.

Stack: Next.js, Remix, Sanity (custom input components, content modeling), Supabase, Webflow migration scripting, TypeScript/React.

### Founding Engineer (lead front-end) — Saagas.ai (https://saagas.ai/)

**December 2023 – May 2024 · 6 months · Remote · launch contract**

Saagas was an early-stage startup, led by an ex-Amazon CEO, building a new way to license AI-generated art. I joined as the founding engineer with one mandate: get the product from zero to a public launch. I owned the entire front end, most of the UX and a good share of the design decisions (alongside a dedicated designer), and the deployment pipeline for both surfaces we shipped. When the product launched, the company hired its in-house team and my contract wrapped, which was the plan from day one.

What I built:

- **The product MVP** — the full web app in **React + TypeScript on Vite**, with **Radix UI** for accessible primitives and **Tailwind** for styling. Every screen was built with accessibility as a baseline, not an afterthought.
- **The launch landing page** in **Next.js + TypeScript**, deployed on **AWS Amplify**.
- **CI/CD for both** — branch-based pipelines so that merging to a given branch deployed automatically: the landing page through Amplify, the app to an **S3 bucket**. No manual deploys from the first week on.
- **Backend performance work** alongside the backend/DevOps engineer: **AWS Lambda** functions in **Python with FastAPI** to speed up the app’s heavier operations.
- **Decision documentation** — I kept a running, detailed record of every significant architecture and product decision and why we made it, so the engineers hired post-launch could onboard without a hand-off call.

Stack: React, Next.js, TypeScript, Vite, Tailwind CSS, Radix UI, AWS (Amplify, S3, Lambda), Python, FastAPI, CI/CD, accessibility.

### Front-end / Full-stack Engineer (contract) — Binti (https://binti.com/)

**October 2024 – December 2024 · 3 months · Remote**

Binti builds software for child-welfare agencies: foster care licensing, case management, and the forms and workflows social workers use every day. I was brought on for a single high-stakes deliverable: a React demo for a Washington State procurement worth eight figures, on a tight timeline.

Child-welfare software is almost entirely forms, deeply relational ones: children, parents, relatives, caseworkers, and every connection between them. So the first job was architecture: designing a form system and set of reusable layouts and components that could absorb dozens of screens without collapsing into one-off code. That paid off fast. By the end of the first week I had most of the existing designs built, and from there I kept a rapid delivery pace through the rest of the engagement.

What I built:

- **An intake screening tool** with decision-tree logic, the core flow that routes a report through the right questions based on previous answers.
- **A person profile page** tying together a child’s or adult’s records and relationships.
- **A reusable layout and component library**, documented in **Storybook**, which the whole demo was assembled from and which accelerated every screen that followed.
- **Full-stack features**: React on the front end integrated with a **Ruby on Rails** backend.
- **Two exploratory prototypes** on top of the core scope: a reporter portal (for people who file reports with the agency) and an image-annotation prototype.

The demo was delivered complete and on time, with consistently positive feedback from the managers I worked with. The engagement was scoped to that deliverable, and it ended as scoped when the state’s procurement timeline shifted and the presentation didn’t take place.

Stack: React, TypeScript, Storybook, Ruby on Rails, form architecture, decision-tree logic, rapid prototyping.

### Founding Product Engineer — Ultralight (formerly Vibrant Practice, https://www.ultralighthealth.com/)

**March 2025 – March 2026 · 1 year 1 month · Remote (San Francisco–based) · onsite week in SF**

Ultralight is an AI-native operating system for functional, integrative, and longevity medicine practices: an EHR, practice management, and patient engagement in one platform, with AI built into the clinical workflow rather than bolted on. Clinicians use a web dashboard; patients use a React Native mobile app. I joined as a founding product engineer when the company was in a handful of clinics and was shipping to production in my first week. This is the role I’m proudest of. I felt I was making healthcare better for real people, and the numbers backed that up: during my time the platform grew from 6 clinics to 65, and the month after I left Ultralight announced a $9.3M seed round led by The General Partnership, with 75 clinics and 1,200+ clinicians on the platform.

What I built and led:

- **Redesigned and expanded the clinical communication and records experience.** Refactored the messaging UI, added clinician-only internal notes, dynamic care-team chat management, and optimistic messaging, and launched a unified Records tab consolidating AI scribe notes, labs, imaging, and questionnaires in one place.
- **Built real-time, in-person AI scribing** powered by **Deepgram**: streaming visit transcription in fault-tolerant chunks, with encounters processed via background jobs into structured **SOAP notes** inside the platform. The scribe lived in a draggable widget that snaps to any corner of the screen, modeled on the Next.js dev-tools overlay, so it stayed out of the clinician’s way during a visit. Design-engineering work I’m particularly fond of.
- **Integrated Fullscript** for supplement-plan creation and tracking, so clinicians can prescribe, manage, and sync supplement data straight into **Medplum**-powered patient records for end-to-end care continuity.
- **Led the evolution of scheduling** across web and mobile: moved to practice-wide appointment types, integrated **Cal.com**, added busy-time syncing, multi-provider daily views, and physical-room scheduling so in-person care could run alongside virtual visits.
- **Shipped the patient mobile app’s core flows in React Native**: care-team messaging, practice-wide appointment booking, and the full care-team model, all with backward compatibility so existing patient data kept working through the migration.

Stack: Next.js, TypeScript, React Native, Medplum (FHIR), Deepgram, Fullscript API, Cal.com, Google Gemini, background job processing, Sentry, Better Stack, Sass. Healthcare interoperability (FHIR). AI-assisted development with Cursor and MCP integrations.

Ultralight flew me to San Francisco for a week to work onsite with the team, which was both the professional highlight of the year and the trip that closed a personal loop I describe in the human section above.

### What I’m looking for now

I’m open to a new role, and the shape I’m after is clear: **design engineer, founding product engineer, or senior product/full-stack engineer at a startup**, ideally one building with AI. I want the startup pace: small team, real ownership, shipping to production in week one, the way I did at Ultralight and Saagas.

The work I care most about is the product layer, where design meets engineering: design systems, motion, micro-interactions, and the small details that make software feel considered. Those aren’t a side interest. They’re the part of the job I’m best at and the part I’d happily do all day. I’m equally comfortable owning the full stack when the product needs it (Next.js, React Native, Python/FastAPI, AWS, FHIR-based healthcare data), and I’ve shipped production AI features end to end, from streaming transcription to structured LLM output.

Practical details: I’m based in Asunción, Paraguay (UTC−3, which lines up with US East Coast hours and overlaps most of the Pacific workday), I’ve worked remotely with US teams for 6+ years, and I’m bilingual in English and Spanish. Full-time, contract, or contract-to-hire all work.

### Skills summary

- **Languages:** TypeScript, JavaScript, Python, HTML, CSS/Sass, PHP, Ruby (Rails integration)
- **Front-end:** React, Next.js, React Native (Expo), Vue.js, Web Components, Remix, Vite, Tailwind CSS, Radix UI, Storybook, design systems (ITCSS, BEM, component libraries), accessibility (WCAG), web performance (Core Web Vitals, lazy loading, SSR optimization), motion and micro-interactions
- **Back-end & data:** Python/FastAPI, Node.js, AWS Lambda, Ruby on Rails, PHP/CodeIgniter, Supabase, Medplum (FHIR), background job processing, REST API design and integration
- **AI & healthcare:** production AI features (Deepgram streaming transcription, LLM-generated SOAP notes, Google Gemini), AI-assisted development (Cursor, MCP integrations), FHIR / healthcare interoperability, HIPAA-aware product work
- **Cloud & infra:** AWS (Amplify, S3, Lambda), CI/CD pipelines (branch-based deploys), Sentry, Better Stack
- **Platforms & CMS:** Salesforce Commerce Cloud (SFCC, ISML), Sanity, Ghost, Webflow migrations, Mapbox, Cal.com, Fullscript
- **Ways of working:** founding/0-to-1 engineering, rapid prototyping under deadlines, Agile/Scrum with QA, architecture decision documentation, close collaboration with designers, remote-first with US teams
- **Industries:** healthtech, eCommerce, government/compliance, media, fintech marketing, consumer mobile`;

/** The story as a page of its own, for /story.md. */
export function getStoryMarkdown(): string {
  return ["# My story", "", STORY_INTRO, "", STORY_BODY, "", `Last updated ${STORY_UPDATED}.`, ""].join("\n");
}

/**
 * The story as a section of a larger document: every heading demoted one
 * level so "## Me as a human" sits under a "## My story" section heading.
 */
export function storySectionLines(): string[] {
  return [STORY_INTRO, "", ...STORY_BODY.split("\n").map((line) => line.replace(/^(#+) /, "#$1 "))];
}
