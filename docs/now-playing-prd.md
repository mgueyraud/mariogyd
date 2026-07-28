# PRD — Live "Now Playing" (Spotify)

**Status:** implemented
**Owner:** Mario Gueyraud
**Component:** `components/home/NowPlaying.tsx`
**Date:** 2026-07-27

---

## 1. Summary

`NowPlaying` is currently a mockup: it renders a hard-coded track (`Vessel — Jon Hopkins`)
and takes a `playing` boolean prop that nothing sets. This PRD covers replacing the mock
with real data from the Spotify Web API, so the home page footer shows:

- **Active state** — the track I'm playing right now (green dot, animated waveform).
- **Idle state** — the last track I finished (gray dot, static waveform, `last played · ` prefix).

The visual design does not change. Only the data source and the freshness behavior do.

## 2. Goals / Non-goals

**Goals**

- Show my genuine, current Spotify playback on the home page.
- Fall back to the most recently played track when nothing is playing.
- Never break, blank, or shift the footer layout — including when Spotify is down,
  rate-limits us, or my refresh token is revoked.
- Cost the site ~one upstream Spotify call per 30s **total**, regardless of traffic.
- No secrets in the client bundle.

**Non-goals**

- Album art, progress bar / scrubber, or play controls. (Deliberately out — the footer
  is one line of 11px mono type. Album art is listed under Future work.)
- Podcast/episode display beyond a generic label.
- Historical listening stats, top tracks, "recently played" lists.
- Real-time push (WebSocket / SSE). Polling is sufficient at this granularity.

## 3. User-facing behavior

| State | Dot | Waveform | Text |
|---|---|---|---|
| Playing a track | green `oklch(0.65 0.15 150)` | animated | `{title} — {artist}` |
| Paused | gray `#C9C9C0` | static | `last played · {title} — {artist}` |
| Nothing playing (idle / offline) | gray | static | `last played · {title} — {artist}` |
| Playing a podcast episode | green | animated | `{episode name} — {show name}` |
| Private session / no data | gray | static | `last played · —` *(or hide the line, see §8)* |
| API failure, first load | gray | static | last known good value, else the line is omitted |

Details:

- **Paused counts as idle.** Spotify's `currently-playing` endpoint returns a track with
  `is_playing: false` when paused. Treating paused as "playing" would leave a green dot
  animating for hours after I close the app.
- **Title/artist truncation.** Long titles must not wrap the footer to a third line.
  Truncate with `text-overflow: ellipsis` on the text span, `min-width: 0` on the flex
  child. No marquee.
- **Multiple artists** are joined with `, ` — cap at the first 2 artists, then `…`.
- **Link.** The track text becomes an `<a>` to `external_urls.spotify`, opening in a new
  tab, styled like the other footer links (no underline, `hover:text-ink`). The
  `play("bloom")` hover cue stays on the container.
- **No layout shift.** The server renders real text on first paint; the client poll only
  swaps the string in place. There is never a "loading…" placeholder.
- **Transitions.** When the track changes, cross-fade the text span (~200ms opacity) so it
  doesn't pop. Respect `prefers-reduced-motion` — the existing `WaveformLoader` should be
  told `animate={false}` under reduced motion regardless of playback state.

## 4. Architecture

```
Spotify Accounts  ──refresh_token──▶  lib/spotify.ts  ◀── in-memory access-token cache
                                            │
                                            ▼
                            app/api/now-playing/route.ts   (Node runtime, CDN-cached 30s)
                                    │                       │
                       RSC first paint                  client poll (60s, visible tab only)
                                    │                       │
                                    ▼                       ▼
                          app/(site)/page.tsx  ──▶  components/home/NowPlaying.tsx
```

### 4.1 Auth — one-time setup, then a long-lived refresh token

The "what am I playing" endpoints are **user-scoped**; the Client Credentials flow cannot
reach them. We do the Authorization Code flow **once, manually, on my machine**, and store
the resulting refresh token as an environment variable. There is no login UI on the site
and no user-facing OAuth flow.

1. Create an app at <https://developer.spotify.com/dashboard>. Add
   `http://127.0.0.1:3000/spotify/callback` as a redirect URI.
2. Visit the authorize URL with `scope=user-read-currently-playing user-read-recently-played`
   and `response_type=code`.
3. Exchange the returned `code` for tokens at `POST https://accounts.spotify.com/api/token`
   with `Authorization: Basic base64(client_id:client_secret)`.
4. Save `refresh_token`. Spotify refresh tokens do not expire on a timer; they are
   invalidated only if I revoke app access or change my password.

A throwaway script under `scripts/spotify-auth.mjs` (git-ignored output) does steps 2–3 so
this is reproducible if the token is ever revoked.

**Environment variables** (all server-only — no `NEXT_PUBLIC_` prefix):

| Name | Notes |
|---|---|
| `SPOTIFY_CLIENT_ID` | from the dashboard |
| `SPOTIFY_CLIENT_SECRET` | from the dashboard |
| `SPOTIFY_REFRESH_TOKEN` | from the one-time exchange |

Added via `vercel env add` for Production + Preview, and pulled locally with
`vercel env pull .env.local`. `.env.local` must be git-ignored.

### 4.2 Access-token handling

`lib/spotify.ts` keeps the access token in a module-level variable with its expiry
(`expires_in` is 3600s). It refreshes when the token is missing or within 60s of expiry,
and de-dupes concurrent refreshes behind a single in-flight promise. On Vercel's Fluid
Compute, instances are reused across requests, so in practice this is roughly one token
refresh per hour per warm instance — not per request.

The cache is best-effort, not a correctness requirement: a cold instance just refreshes.

### 4.3 Data fetch

- `GET https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode`
  - `200` with `is_playing: true` and a non-null `item` → **playing**.
  - `200` with `is_playing: false`, or `204 No Content` (nothing active / private session)
    → fall through to recently-played.
  - `item: null` (ad break, local file, unsupported type) → fall through.
- `GET https://api.spotify.com/v1/me/player/recently-played?limit=1` → **idle** with
  `items[0].track` and `items[0].played_at`.
- Every upstream call gets a hard timeout (`AbortSignal.timeout(4000)`).
- Caching is a **parameter**, not a constant — see the constraint below.

> **Constraint discovered during implementation.** A `cache: "no-store"` fetch forces the
> entire enclosing route segment to render dynamically, which silently defeats
> `export const revalidate = 30`. The first build shipped `/` as `ƒ (Dynamic)`, meaning
> every visitor would hit Spotify directly — exactly the rate-limit exposure the CDN
> layer exists to prevent.
>
> So `getNowPlaying(mode)` takes a `CacheMode`:
> - the home page passes `{ revalidate: 30 }` → fetches join the data cache, `/` stays
>   `○ Static` / ISR;
> - the route handler (already `force-dynamic`) passes `"no-store"` → always fresh.
>
> The 401-retry path always forces `"no-store"`, otherwise it would replay the cached
> 401 and the retry would be pointless.

### 4.4 Normalized contract

`lib/spotify.ts` exports:

```ts
export type NowPlayingTrack = {
  title: string;
  artist: string;       // already joined + capped
  url: string | null;   // external_urls.spotify
  albumImage: string | null; // reserved for Future work; not rendered in v1
};

export type NowPlayingState =
  | { status: "playing"; track: NowPlayingTrack }
  | { status: "idle"; track: NowPlayingTrack; playedAt: string } // ISO
  | { status: "unavailable" };

export async function getNowPlaying(): Promise<NowPlayingState>;
```

`getNowPlaying()` never throws. Any upstream error, timeout, or malformed payload resolves
to `{ status: "unavailable" }`.

### 4.5 Delivery: RSC first paint + client poll

**First paint (server).** `app/(site)/page.tsx` is a Server Component. It calls
`getNowPlaying()` and passes the result to `<NowPlaying initial={...} />`. The page opts
into a 30s revalidate window so the home page is still statically served and shared across
visitors:

```ts
// app/(site)/page.tsx
export const revalidate = 30;
```

> Note: this makes the home page ISR instead of fully static. Everything else on the page
> (lab MDX, trips) is build-time data and is unaffected by a 30s revalidate.

**Freshness (client).** `NowPlaying` stays a Client Component (it already is — it uses
`cuelume` and `framer-motion`). It polls `/api/now-playing` every **60s**, and:

- only while `document.visibilityState === "visible"` (pause the interval on `hidden`,
  fire one immediate fetch on becoming visible again);
- with a 30s minimum spacing between fetches after a visibility-triggered refetch;
- aborting the in-flight request on unmount.

**Route handler caching.** `app/api/now-playing/route.ts`:

```ts
export const dynamic = "force-dynamic"; // no build-time prerender
// response header:
"Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
```

The CDN absorbs visitor traffic: N concurrent visitors still produce at most ~1 upstream
Spotify call per 30s. This is the main defense against Spotify's rate limit (a rolling
30-second window, ~180 req/min for a non-extended-quota app).

On `{ status: "unavailable" }`, the route responds `200` with that body and a short
`s-maxage=10` so a transient outage doesn't get pinned in cache for 30s.

## 5. Component changes

`components/home/NowPlaying.tsx`:

- Props change from `{ playing?: boolean }` to `{ initial: NowPlayingState }`.
- `useState(initial)` + a polling `useEffect`. Poll failures are swallowed and keep the
  previous state — the UI never degrades from a good value to an error state.
- Derived: `const isPlaying = state.status === "playing"`, which drives the dot color and
  `<WaveformLoader animate={...} />` exactly as today.
- `status: "unavailable"` with no prior good value → render the footer without the track
  line (location stays), so the layout is still a valid one-liner.
- The location string (`Asunción, Paraguay`) stays hard-coded.

## 6. Files

| File | Change |
|---|---|
| `lib/spotify.ts` | new — token refresh, both endpoint calls, normalization, types |
| `app/api/now-playing/route.ts` | new — GET handler, cache headers |
| `components/home/NowPlaying.tsx` | modified — accept `initial`, poll, render real data |
| `app/(site)/page.tsx` | modified — `export const revalidate = 30`, await + pass `initial` |
| `scripts/spotify-auth.mjs` | new — one-time refresh-token bootstrap (dev only) |
| `.env.example` | new — documents the three vars, no values |

Per the flat-layout preference, `lib/spotify.ts` sits alongside `lib/trips.ts` and
`lib/experience.ts`. No new folder structure.

## 7. Rollout

1. **Phase 0 — credentials.** Create the Spotify app, run the auth script, add the three
   env vars to Vercel (Production + Preview) and `.env.local`. Verify with a one-off
   `node` call that `currently-playing` returns 200/204.
2. **Phase 1 — data layer.** `lib/spotify.ts` + `/api/now-playing`. Verify by hand:
   playing → `playing`; paused → `idle`; Spotify closed → `idle`; bogus refresh token →
   `unavailable` (not a 500).
3. **Phase 2 — UI.** Wire `initial` through the page, add polling, truncation, link,
   reduced-motion. Confirm no CLS on the footer.
4. **Phase 3 — verify on a preview deploy.** Check the `x-vercel-cache` header on
   `/api/now-playing` shows `HIT` on repeat requests, and that a track change appears
   within ~90s.

## 8. Decisions (was: open questions)

All three shipped as proposed. Revisit any of them if they feel wrong in use.

1. **Empty fallback text** — the track line is omitted entirely when there's no data. A
   stale hard-coded track is a small lie, and the footer reads fine with just the location.
2. **Paused is not a distinct state** — it renders as idle (`last played · `). Two states
   keeps the footer quiet.
3. **Podcasts are shown**, via `additional_types=track,episode`; the show name takes the
   artist slot.

One more, decided during implementation:

4. **The initial paint does not fade.** framer-motion's `initial={{opacity: 0}}` renders
   `opacity: 0` into the SSR HTML and only fades in at hydration — so the track text was
   invisible until JS ran, and permanently invisible if it never did. A `firstPaint` ref
   suppresses the animation on mount; only *subsequent* track changes cross-fade.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Refresh token revoked (password change) | `unavailable` state degrades gracefully; re-run the auth script to reissue |
| Spotify 429 rate limit | CDN caching caps upstream calls at ~1/30s; on 429, return `unavailable` and honor `Retry-After` by extending cache |
| Home page becomes dynamic / slower | 30s ISR keeps it CDN-served; the RSC call has a 4s timeout so a hung Spotify can't hold the render |
| Secrets leaking to the client | All three vars are server-only; the component only ever talks to our own `/api/now-playing` |
| Privacy | This intentionally publishes what I'm listening to. Spotify's "private session" mode returns 204, which surfaces as the idle/last-played state — acceptable |

## 10. Success criteria

- Playing a track on any device updates the footer within 90 seconds of a page view.
- Closing Spotify flips the footer to `last played · …` within 90 seconds.
- Killing network access to Spotify (simulated) leaves the page rendering with no visible
  error and no layout shift.
- Lighthouse CLS on `/` is unchanged from today.
- No Spotify credential appears in the client bundle (`grep` the `.next/static` output).

## 11. Future work

- Album art thumbnail (needs `remotePatterns: ["i.scdn.co"]` in `next.config.mjs`).
- Progress bar reflecting `progress_ms / duration_ms`, interpolated client-side between
  polls.
- A `/now` page with recent tracks and top artists.
