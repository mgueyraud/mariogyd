import Elsewhere from "@/components/home/Elsewhere";
import Experience from "@/components/home/Experience";
import NowPlaying from "@/components/home/NowPlaying";
import TripsFan from "@/components/home/TripsFan";
import Reveal from "@/components/site/Reveal";
import TextLink, { tapTarget } from "@/components/site/TextLink";
import { ROLES } from "@/lib/experience";
import { getAllLabMeta } from "@/lib/lab-meta";
import { getNowPlaying } from "@/lib/spotify";
import { TRIPS, getFanCards } from "@/lib/trips";

// ISR. The footer's Spotify state is the only time-sensitive thing on the
// page, and NowPlaying refreshes it from /api/now-playing on mount — so the
// server copy only has to be good enough for the first paint (and for
// visitors without JS).
export const revalidate = 600;

const SECTION = "mt-[clamp(64px,12vw,96px)]";
const SECTION_TITLE =
  "font-mono text-[11px] font-normal tracking-[0.14em] text-faint";

export default async function Home() {
  const labs = getAllLabMeta();
  const labPreview = labs.slice(0, 4);
  const nowPlaying = await getNowPlaying({ cache: { revalidate } });

  return (
    <>
      <Reveal step={1} as="header">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em]">
          Mario Gueyraud
        </h1>
        <p className="text-sm text-subtle">
          Senior Front-End &amp; Design Engineer
        </p>
      </Reveal>

      <Reveal
        step={2}
        as="p"
        className="mt-7 max-w-[52ch] text-subtle [text-wrap:pretty]"
      >
        Passionate digital experience creator learning design engineering.
        Focused on simplicity, modernist design, and{" "}
        <em className="font-serif text-[15px] italic text-ink">great taste</em>.
      </Reveal>

      <Reveal step={3}>
        <Experience roles={ROLES} />
      </Reveal>

      <Reveal step={4} as="section" className={SECTION}>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className={SECTION_TITLE}>
            LAB <span className="text-ink">{labs.length}</span>
          </h2>
          <TextLink href="/lab" prefetch className={`text-xs ${tapTarget}`}>
            All experiments ↗
          </TextLink>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-9 gap-y-5">
          {labPreview.map((lab) => (
            <div key={lab.slug}>
              <TextLink
                href={`/lab/${lab.slug}`}
                prefetch
                variant="underline"
                className="text-sm"
              >
                {lab.title}
              </TextLink>
              <p className="mt-[3px] text-[13px] text-subtle">
                {lab.description}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal step={5} as="section" className={SECTION}>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className={SECTION_TITLE}>
            TRIPS <span className="text-ink">{TRIPS.length}</span>
          </h2>
          <TextLink href="/trips" prefetch className={`text-xs ${tapTarget}`}>
            All trips ↗
          </TextLink>
        </div>
        <TripsFan trips={getFanCards()} />
      </Reveal>

      <Reveal step={6}>
        <Elsewhere />
      </Reveal>

      <Reveal step={7}>
        <NowPlaying initial={nowPlaying} />
      </Reveal>
    </>
  );
}
