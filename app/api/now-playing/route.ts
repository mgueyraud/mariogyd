import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

// Never prerendered — this is the freshness endpoint the footer polls.
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getNowPlaying();

  // The CDN absorbs visitor traffic: N concurrent visitors still produce at
  // most ~1 upstream Spotify call per 30s. A transient outage gets a shorter
  // window so it isn't pinned in cache.
  const sMaxAge = state.status === "unavailable" ? 10 : 30;

  return NextResponse.json(state, {
    headers: {
      "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=60`,
    },
  });
}
