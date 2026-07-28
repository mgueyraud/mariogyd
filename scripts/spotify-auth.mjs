/**
 * One-time bootstrap for SPOTIFY_REFRESH_TOKEN.
 *
 * Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET from .env.local, walks the
 * Authorization Code flow against a temporary loopback server, and prints the
 * resulting refresh token.
 *
 *   node scripts/spotify-auth.mjs           # print the token
 *   node scripts/spotify-auth.mjs --write   # also write it into .env.local
 *
 * Re-run this only if the token is revoked (password change, or app access
 * removed at spotify.com/account/apps).
 */

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Must match a Redirect URI registered on the app at
// https://developer.spotify.com/dashboard — exactly, including the port.
// Spotify requires the loopback IP literal (127.0.0.1), not "localhost".
const PORT = 3000;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/spotify/callback`;
const CALLBACK_PATH = new URL(REDIRECT_URI).pathname;

const SCOPES = ["user-read-currently-playing", "user-read-recently-played"];

const ENV_PATH = new URL("../.env.local", import.meta.url);

function readEnv() {
  let raw;
  try {
    raw = readFileSync(ENV_PATH, "utf8");
  } catch {
    fail(".env.local not found. Create it with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.");
  }
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return { raw, env };
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

const { raw, env } = readEnv();
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  fail("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env.local first.");
}

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const state = randomBytes(16).toString("hex");

const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES.join(" "),
    redirect_uri: REDIRECT_URI,
    state,
    // Force the consent screen so re-runs reliably return a fresh token.
    show_dialog: "true",
  });

async function exchange(code) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    fail(
      `Token exchange failed (${res.status}): ${body.error ?? "unknown"} — ` +
        `${body.error_description ?? "no description"}`
    );
  }
  return body;
}

function writeToken(token) {
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(raw)
    ? raw.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : raw.replace(/\n*$/, `\n${line}\n`);
  writeFileSync(ENV_PATH, next);
  console.log("✓ Wrote SPOTIFY_REFRESH_TOKEN to .env.local");
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== CALLBACK_PATH) {
    res.writeHead(404).end();
    return;
  }

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  const done = (message) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<body style="font:14px ui-monospace,monospace;padding:40px">${message}</body>`
    );
  };

  if (error) {
    done("Authorization denied. You can close this tab.");
    server.close();
    fail(`Spotify returned: ${error}`);
  }

  if (returnedState !== state) {
    done("State mismatch. You can close this tab.");
    server.close();
    fail("State mismatch — possible CSRF. Re-run the script.");
  }

  const tokens = await exchange(code);

  done("Done. You can close this tab and return to the terminal.");
  server.close();

  console.log("\n─────────────────────────────────────────────");
  console.log("SPOTIFY_REFRESH_TOKEN=" + tokens.refresh_token);
  console.log("─────────────────────────────────────────────\n");
  console.log(`Granted scopes: ${tokens.scope}`);

  if (process.argv.includes("--write")) {
    writeToken(tokens.refresh_token);
  } else {
    console.log("Paste it into .env.local, or re-run with --write to do it automatically.");
  }

  console.log(
    "\nThen add it to Vercel:\n" +
      "  vercel env add SPOTIFY_REFRESH_TOKEN production\n" +
      "  vercel env add SPOTIFY_REFRESH_TOKEN preview\n"
  );
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `\nMake sure this exact Redirect URI is registered on your Spotify app:\n` +
      `  ${REDIRECT_URI}\n\n` +
      `Then open this URL in a browser and approve:\n\n  ${authorizeUrl}\n\n` +
      `Waiting for the callback…`
  );
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    fail(`Port ${PORT} is in use — stop \`next dev\` and re-run.`);
  }
  fail(err.message);
});
