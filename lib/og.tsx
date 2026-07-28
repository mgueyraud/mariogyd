import type { ImageResponse } from "next/og";

/*
 * Share cards, in the site's own palette and type.
 *
 * satori can't resolve `font-family: "Helvetica Neue"` or `ui-monospace` the
 * way a browser does, so the three roles the design leans on are fetched as
 * real files: Newsreader for headings (as in `font-serif`), Arimo for body
 * text (metric-compatible with Helvetica), IBM Plex Mono for the small
 * tracked-out labels (`font-mono`).
 */

type ImageResponseOptions = ConstructorParameters<typeof ImageResponse>[1];
type Fonts = NonNullable<ImageResponseOptions>["fonts"];

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Mirrors the `paper / ink / subtle / faint / line` palette in tailwind.config.ts
const PAPER = "#FCFCFA";
const INK = "#1C1C1A";
const SUBTLE = "#75756E";
const FAINT = "#97978F";
const LINE = "#ECECE5";

const SERIF = "Newsreader";
const SANS = "Arimo";
const MONO = "IBM Plex Mono";

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2" +
  "?family=Newsreader:wght@500" +
  "&family=Arimo:wght@400" +
  "&family=IBM+Plex+Mono:wght@400";

let fontsPromise: Promise<Fonts> | undefined;

async function fetchFonts(): Promise<Fonts> {
  // Requesting without a User-Agent makes Google Fonts serve .ttf instead of
  // .woff2, which is the only format satori can parse.
  const css = await fetch(FONT_CSS_URL).then((res) => res.text());
  const face =
    /font-family:\s*'([^']+)';[\s\S]*?font-weight:\s*(\d+);[\s\S]*?src:\s*url\((https:[^)]+)\)/g;
  const faces: { name: string; weight: number; url: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = face.exec(css)) !== null) {
    faces.push({ name: match[1], weight: Number(match[2]), url: match[3] });
  }

  return Promise.all(
    faces.map(async ({ name, weight, url }) => ({
      name,
      data: await fetch(url).then((res) => res.arrayBuffer()),
      weight: weight as 400 | 500,
      style: "normal" as const,
    }))
  );
}

/**
 * Memoized across the whole build — every card asks for the same three files.
 * Falls back to satori's built-in font rather than failing the build if Google
 * Fonts is unreachable.
 */
export async function loadFonts(): Promise<Fonts> {
  fontsPromise ??= fetchFonts().catch(() => undefined);
  return fontsPromise;
}

export function OgCard({
  eyebrow,
  title,
  meta,
  byline = "Mario Gueyraud — Senior Front-End & Design Engineer",
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  byline?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: PAPER,
        color: INK,
        fontFamily: SANS,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 22,
            backgroundColor: INK,
          }}
        />
        <span style={{ fontFamily: MONO, fontSize: 24, color: SUBTLE }}>
          mariogyd.com
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow ? (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: 3.5,
              textTransform: "uppercase",
              color: FAINT,
              marginBottom: 22,
            }}
          >
            {eyebrow}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: title.length > 26 ? 78 : 94,
            lineHeight: 1.05,
            letterSpacing: -1,
          }}
        >
          {title}
        </span>
        <div
          style={{
            height: 1,
            backgroundColor: LINE,
            marginTop: 44,
            marginBottom: 26,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 24, color: SUBTLE }}>{byline}</span>
          {meta ? (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 22,
                letterSpacing: 1.5,
                color: FAINT,
              }}
            >
              {meta}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
