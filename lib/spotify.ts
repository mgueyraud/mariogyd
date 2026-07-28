// Spotify "now playing" data layer. Server-only — reads secrets from env and is
// imported by the home page (RSC) and /api/now-playing.
//
// See docs/now-playing-prd.md. The contract that matters: getNowPlaying() never
// throws. Every upstream failure resolves to { status: "unavailable" } so a
// Spotify outage can't take down the home page render.

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";
const TIMEOUT_MS = 4000;

export type NowPlayingTrack = {
  title: string;
  artist: string;
  url: string | null;
  /** Reserved — populated but not rendered in v1. */
  albumImage: string | null;
};

export type NowPlayingState =
  | { status: "playing"; track: NowPlayingTrack }
  | { status: "idle"; track: NowPlayingTrack; playedAt: string }
  | { status: "unavailable" };

/**
 * How the upstream fetches interact with Next's data cache.
 *
 * This is load-bearing: a `no-store` fetch forces the whole enclosing route
 * segment to render dynamically. The home page passes `{ revalidate: 30 }` so
 * it stays ISR (CDN-served, ~1 upstream call per window no matter the traffic);
 * the already-`force-dynamic` route handler passes "no-store" for freshness.
 */
export type CacheMode = "no-store" | { revalidate: number };

function cacheInit(mode: CacheMode): RequestInit {
  return mode === "no-store"
    ? { cache: "no-store" }
    : ({ next: { revalidate: mode.revalidate } } as RequestInit);
}

/* ------------------------------------------------------------------ tokens */

// Module-level cache. On Fluid Compute instances are reused across requests, so
// this is ~one refresh per hour per warm instance rather than one per request.
// Best-effort only: a cold instance just refreshes again.
let cached: { token: string; expiresAt: number } | null = null;
let inFlight: Promise<string> | null = null;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function requestAccessToken(mode: CacheMode): Promise<string> {
  const basic = Buffer.from(
    `${env("SPOTIFY_CLIENT_ID")}:${env("SPOTIFY_CLIENT_SECRET")}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env("SPOTIFY_REFRESH_TOKEN"),
    }),
    // POSTs are never stored in Next's data cache; this only keeps the call
    // from forcing the enclosing segment dynamic.
    ...cacheInit(mode),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const body = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    token: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
  return body.access_token;
}

async function getAccessToken(mode: CacheMode): Promise<string> {
  // Refresh when missing or within 60s of expiry.
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token;
  // De-dupe concurrent refreshes behind a single in-flight promise.
  if (!inFlight) {
    inFlight = requestAccessToken(mode).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/* --------------------------------------------------------------- api calls */

type ApiResult = { status: number; body: any };

async function apiGet(
  path: string,
  mode: CacheMode,
  retryOn401 = true
): Promise<ApiResult> {
  const token = await getAccessToken(mode);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...cacheInit(mode),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  // Token rejected mid-flight (revoked, or clock skew) — drop the cache and
  // take exactly one more swing with a fresh token. The retry always bypasses
  // the data cache, otherwise it would replay the same stale 401 response.
  if (res.status === 401 && retryOn401) {
    cached = null;
    return apiGet(path, "no-store", false);
  }

  if (res.status === 204) return { status: 204, body: null };
  if (!res.ok) throw new Error(`Spotify ${path} failed: ${res.status}`);

  return { status: res.status, body: await res.json() };
}

/* ----------------------------------------------------------- normalization */

function joinArtists(names: unknown): string {
  if (!Array.isArray(names)) return "";
  const clean = names
    .map((a) => (typeof a?.name === "string" ? a.name : ""))
    .filter(Boolean);
  if (clean.length <= 2) return clean.join(", ");
  return `${clean.slice(0, 2).join(", ")}…`;
}

function smallestImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  // Spotify orders images largest-first.
  const url = images[images.length - 1]?.url;
  return typeof url === "string" ? url : null;
}

/** Returns null for anything we can't render as a track (ads, local files). */
function toTrack(item: any): NowPlayingTrack | null {
  if (!item || typeof item.name !== "string") return null;

  if (item.type === "episode") {
    return {
      title: item.name,
      artist: typeof item.show?.name === "string" ? item.show.name : "",
      url: item.external_urls?.spotify ?? null,
      albumImage: smallestImage(item.images ?? item.show?.images),
    };
  }

  const artist = joinArtists(item.artists);
  if (!artist) return null;

  return {
    title: item.name,
    artist,
    url: item.external_urls?.spotify ?? null,
    albumImage: smallestImage(item.album?.images),
  };
}

/* -------------------------------------------------------------- public api */

/** null means "fall through to recently-played". */
async function getCurrentlyPlaying(mode: CacheMode): Promise<NowPlayingState | null> {
  const { status, body } = await apiGet(
    "/me/player/currently-playing?additional_types=track,episode",
    mode
  );

  // 204: nothing active, or a private session.
  if (status === 204 || !body) return null;
  // Paused counts as idle — otherwise the green dot animates for hours after
  // I close the app.
  if (body.is_playing !== true) return null;

  const track = toTrack(body.item);
  return track ? { status: "playing", track } : null;
}

async function getRecentlyPlayed(mode: CacheMode): Promise<NowPlayingState | null> {
  const { body } = await apiGet("/me/player/recently-played?limit=1", mode);
  const entry = body?.items?.[0];
  const track = toTrack(entry?.track);
  if (!track) return null;

  return {
    status: "idle",
    track,
    playedAt:
      typeof entry.played_at === "string"
        ? entry.played_at
        : new Date().toISOString(),
  };
}

export async function getNowPlaying(
  mode: CacheMode = "no-store"
): Promise<NowPlayingState> {
  try {
    const current = await getCurrentlyPlaying(mode);
    if (current) return current;
    return (await getRecentlyPlayed(mode)) ?? { status: "unavailable" };
  } catch {
    // Timeout, 429, revoked token, malformed payload — all the same to the UI.
    return { status: "unavailable" };
  }
}
