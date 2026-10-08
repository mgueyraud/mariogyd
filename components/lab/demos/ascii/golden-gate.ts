/*
 * golden gate: sunset through the strait. The sun sits on the ocean between
 * the Marin headlands and the Presidio, the bridge's towers and cables stand
 * against it in international orange, and the fog pours in through the gate.
 * Cars trail lights across the deck, the aviation lamps blink on the towers,
 * and a sailboat crosses the bay on the glittering road under the sun.
 *
 * Written for this site in the manner of ascii.rest's "varanasi ghats" by
 * @bas3line (MIT): shaded in colour cell by cell, then drawn as a halftone, a
 * dot whose size is the cell's brightness, ordered-dithered, in the palette
 * colour nearest its hue.
 */
import type { Frame, Meta } from "./types";

export const meta = {
  name: "golden gate",
  category: "scenes",
  note: "sunset through the golden gate, fog pouring in under the bridge",
  cols: 200,
  rows: 100,
  cell: 1,
  fps: 15,
  ground: "#0b0812",
  palette: [
    // the sky, indigo through violet
    "#141230", "#1d1a42", "#272257", "#332b6a", "#45357a", "#5a4388", "#7259a8",
    // plum, orchid, mauve and rose
    "#6d3a73", "#8a4677", "#a8527a", "#c4607a", "#d97a92", "#b866a0", "#9a68c8", "#c868b0", "#e8707a",
    // coral to gold
    "#d9705f", "#e88552", "#f29f4a", "#f8b85a", "#fcd07a", "#ffe3a6", "#fff2d2",
    // the headlands in shadow
    "#1a1220", "#24182a", "#301f33", "#3f2838", "#523340", "#3a2c4c", "#4d3a64",
    // international orange, from shadow to the rim the sun lights
    "#2e0f0c", "#4a1610", "#6a1e12", "#8e2a16", "#b5381a", "#d9502a", "#f06a3a",
    // fog, lit by the sunset
    "#5a4a6a", "#7a6282", "#9c7c94", "#c09aa4", "#e2bcb4",
    // lamps and headlights
    "#ffffff", "#fff6d8", "#ffd860", "#ff9f2a", "#f06a1e",
    // tail lights and the aviation lamps
    "#ff3b30", "#a01818",
    // the bay
    "#0f1a2c", "#162540", "#20325a", "#2c4270",
    // the piers
    "#5c5560", "#857c84",
    // starlight, set directly and never matched
    "#d6d4ee",
  ],
} satisfies Meta;

const W = 200, H = 100;
const HZ = 62; // the ocean's horizon, through the gate
const SUN = [104, HZ - 5.5];
const SR = 6.5;
const DOTS = " ·•●";
const COVER = [0, 0.3, 0.6, 1];
// how far a dot's colour may be brightened to make up for its size: small dots
// in dark areas stay dark instead of turning into a pale speckle
const LIFT = [0, 2.5, 1.7, 1.35];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.47);
const LAMP = [1, 0.7, 0.3];

const SKY = 0, WATER = 1, LAND = 2, STEEL = 3;

// heat, then colour: indigo overhead, violet, plum, rose, coral, amber, gold
const RAMP: [number, number, number, number][] = [
  [0.0, 0.085, 0.07, 0.24],
  [0.14, 0.13, 0.1, 0.34],
  [0.28, 0.22, 0.14, 0.44],
  [0.42, 0.34, 0.17, 0.48],
  [0.52, 0.47, 0.21, 0.47],
  [0.62, 0.6, 0.26, 0.42],
  [0.7, 0.7, 0.31, 0.36],
  [0.78, 0.8, 0.39, 0.3],
  [0.86, 0.88, 0.5, 0.26],
  [0.92, 0.95, 0.65, 0.32],
  [0.97, 1.0, 0.8, 0.48],
  [1.0, 1.0, 0.92, 0.7],
];

function hash(x: number, y: number): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number, period: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  let x0 = xi, x1 = xi + 1;
  if (period) {
    x0 = ((xi % period) + period) % period;
    x1 = (x0 + 1) % period;
  }
  const a = hash(x0, yi), b = hash(x1, yi), c = hash(x0, yi + 1), d = hash(x1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, octaves: number, period: number): number {
  let s = 0, n = 0, amp = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) {
    s += amp * noise(x * f, y * f, period * f);
    n += amp;
    amp *= 0.5;
    f *= 2;
  }
  return s / n;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, v: number) => {
  const k = clamp((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);

// The heat ramp, tabulated.
const RL = 256;
const RT = new Float32Array((RL + 1) * 3);
for (let i = 0; i <= RL; i++) {
  const h = i / RL;
  let j = 0;
  while (j < RAMP.length - 2 && h > RAMP[j + 1][0]) j++;
  const [h0, r0, g0, b0] = RAMP[j], [h1, r1, g1, b1] = RAMP[j + 1];
  const k = clamp((h - h0) / (h1 - h0));
  RT[i * 3] = mix(r0, r1, k), RT[i * 3 + 1] = mix(g0, g1, k), RT[i * 3 + 2] = mix(b0, b1, k);
}
const rampAt = (h: number) => ((h < 0 ? 0 : h > 1 ? 1 : h) * RL + 0.5) | 0;

// The sunset sky's heat: low overhead, rising toward the horizon, hottest round the sun.
function skyHeat(x: number, y: number): number {
  const v = clamp(y / HZ);
  const dx = Math.abs(x - SUN[0]), dy = Math.abs(SUN[1] - y);
  const wide = 0.44 * Math.exp(-dx / 62 - dy / 24);
  const core = 0.16 * Math.exp(-Math.sqrt((dx / 16) ** 2 + (dy / 7) ** 2));
  return 0.06 + 0.4 * v * v + wide + core;
}

// --- the bridge ---------------------------------------------------------------
// The far (north) tower on the left and the near (south) tower on the right:
// the bridge runs a little toward us, so the near one is taller and lower.
const TOWERS = [
  { x: 66, base: HZ + 1.5, top: 25, deck: 52, hw: 2.7, s: 0.8 },
  { x: 146, base: HZ + 6, top: 13, deck: 47, hw: 3.7, s: 1.1 },
];
const [TN, TS] = TOWERS;
const deckY = (x: number) => TN.deck + ((TS.deck - TN.deck) * (x - TN.x)) / (TS.x - TN.x);
const scale = (x: number) => mix(TN.s, TS.s, (x - TN.x) / (TS.x - TN.x));
const deckTh = (x: number) => 1 + 0.9 * scale(x);
const ANCHOR_N = 24, ANCHOR_S = 232;
// The main cable: hung between the towers, and down from each to its anchorage.
function cableY(x: number): number {
  if (x < TN.x) {
    const u = (x - ANCHOR_N) / (TN.x - ANCHOR_N);
    return mix(deckY(ANCHOR_N) - 0.6, TN.top + 0.6, u) + 2.5 * 4 * u * (1 - u);
  }
  if (x > TS.x) {
    const u = (x - TS.x) / (ANCHOR_S - TS.x);
    return mix(TS.top + 0.6, deckY(ANCHOR_S) - 0.6, u) + 3 * 4 * u * (1 - u);
  }
  const u = (x - TN.x) / (TS.x - TN.x);
  return mix(TN.top + 0.6, TS.top + 0.6, u) + 27.5 * 4 * u * (1 - u);
}

// What of the bridge is at a point: 0 nothing, 1 steel, 2 cable, 3 a suspender, 4 a pier.
function bridgeAt(px: number, py: number): number {
  for (const T of TOWERS) {
    const dx = Math.abs(px - T.x);
    // the concrete pier the tower stands on
    if (py >= T.base - 2.6 * T.s && py <= T.base + 0.4 && dx < T.hw * 1.45) return 4;
    if (py > T.base || py < T.top - 1.6 * T.s || dx > T.hw * 1.1) continue;
    // stepped in at each tier, wider toward the water
    const tier = Math.min(3, Math.floor((4 * (py - T.top)) / (T.base - T.top)));
    const hw = T.hw * (0.8 + 0.07 * Math.max(0, tier));
    const lw = hw * 0.62;
    if (py < T.top) {
      // the art deco caps on top of each leg
      const cap = (T.top - py) / (1.6 * T.s);
      if (dx < hw - lw * (0.15 + 0.35 * cap) && dx > hw - lw * (0.85 - 0.35 * cap)) return 1;
      continue;
    }
    if (dx <= hw && dx >= hw - lw) return 1;
    // the portal struts between the legs
    if (dx < hw) {
      const rel = (py - T.top) / (T.deck - T.top);
      for (const [a, b] of [[0, 0.07], [0.29, 0.34], [0.57, 0.61], [0.84, 0.88]]) if (rel >= a && rel <= b) return 1;
      const under = py - (T.deck + deckTh(T.x));
      if (under > 0 && under < 1.4 * T.s) return 1;
    }
  }
  // the deck, ending where it lands on the headland
  if (px > ANCHOR_N - 2) {
    const dy = deckY(px);
    if (py >= dy && py < dy + deckTh(px)) return 1;
  }
  // the main cable, thicker as it nears us
  const cy = cableY(px);
  if (px > ANCHOR_N && Math.abs(py - cy) < 0.32 + 0.22 * scale(px)) return 2;
  // the suspenders, hung from the cable to the deck
  if (px > ANCHOR_N + 2 && py > cy && py < deckY(px)) {
    const sp = 2.3 * scale(px);
    const f = (px - TN.x) / sp;
    if (Math.abs(f - Math.round(f)) * sp < 0.16) return 3;
  }
  return 0;
}

// --- the land -----------------------------------------------------------------
// The Marin headlands climbing out of the water on the left, the Presidio low on the right.
const marinTop = (x: number) => {
  if (x > 70) return Infinity;
  const f = clamp(1 - x / 70);
  return HZ - 0.8 - 22 * Math.pow(f, 0.7) * (0.85 + 0.25 * fbm(x * 0.06, 1, 3, 0)) - 2.2 * fbm(x * 0.3, 4, 2, 0) * f;
};
const presidioTop = (x: number) => {
  if (x < 164) return Infinity;
  return HZ - 0.8 - 7 * smooth(164, 192, x) - 2 * fbm(x * 0.22, 6, 3, 0) * smooth(164, 172, x);
};

export default function goldenGate(): Frame {
  const P = meta.palette.map(hex);
  const STAR = P.length - 1;
  const N = W * H;
  const out = new Array<string>(N);

  const lut = new Uint8Array(32768).fill(255);
  const nearest = (r: number, g: number, b: number): number => {
    const k = (Math.min(31, (r * 31.99) | 0) << 10) | (Math.min(31, (g * 31.99) | 0) << 5) | Math.min(31, (b * 31.99) | 0);
    if (lut[k] !== 255) return lut[k];
    let best = 0, bd = 1e9;
    for (let i = 0; i < STAR; i++) {
      const dr = P[i][0] - r, dg = P[i][1] - g, db = P[i][2] - b;
      const d = 0.3 * dr * dr + 0.5 * dg * dg + 0.2 * db * db;
      if (d < bd) (bd = d), (best = i);
    }
    return (lut[k] = best);
  };

  // --- the still scene: sky, sun and land, then the bridge over them ----------
  const mat = new Uint8Array(N);
  const sR = new Float32Array(N), sG = new Float32Array(N), sB = new Float32Array(N);
  const flo = new Float32Array(N);
  const warm = new Float32Array(N);
  const sun = new Float32Array(N); // how much of the cell is the sun's disc

  for (let r = 0; r < H; r++) {
    for (let x = 0; x < W; x++) {
      const k = r * W + x;
      const xc = x + 0.5, y = r + 0.5;
      const land = Math.min(marinTop(xc), presidioTop(xc));
      if (y >= land && y < HZ + 0.6) {
        // backlit hillside, a little violet from the sky, darker low down
        mat[k] = LAND;
        const fy = clamp((y - land) / 14);
        sR[k] = 0.07 * (1.1 - 0.4 * fy), sG[k] = 0.045 * (1.1 - 0.4 * fy), sB[k] = 0.085 * (1.1 - 0.3 * fy);
        flo[k] = 0.08;
        continue;
      }
      if (y >= HZ) {
        mat[k] = WATER;
        continue;
      }
      const veil = 0.92 + 0.16 * fbm(x * 0.05, r * 0.1, 3, 0);
      const hh = skyHeat(xc, y) + 0.05 * (fbm(x * 0.07 + 11, r * 0.16, 2, 0) - 0.5) + 0.1 * (fbm(x * 0.025 + 3, r * 0.09 + 5, 3, 0) - 0.5);
      warm[k] = smooth(0.3, 0.9, hh);
      const i = rampAt(hh) * 3;
      let cr = RT[i] * veil, cg = RT[i + 1] * veil, cb = RT[i + 2] * veil;
      // the sun, a little flattened as it meets the sea, banded by the haze low down
      let cov = 0;
      for (let sy = 0; sy < 3; sy++)
        for (let sx = 0; sx < 3; sx++) {
          const px = x + (sx + 0.5) / 3 - SUN[0], py = (r + (sy + 0.5) / 3 - SUN[1]) / 0.86;
          if (px * px + py * py < SR * SR && r + (sy + 0.5) / 3 < HZ) cov++;
        }
      if (cov) {
        const d = Math.hypot(xc - SUN[0], (y - SUN[1]) / 0.86) / SR;
        const band = y > SUN[1] + 1 && Math.sin(y * 2.4) > 0.55 ? 0.6 : 1;
        const a = (cov / 9) * band;
        cr = mix(cr, 1, a), cg = mix(cg, mix(0.96, 0.62, d * d), a), cb = mix(cb, mix(0.8, 0.3, d * d), a);
        sun[k] = a;
      }
      mat[k] = SKY;
      sR[k] = cr, sG[k] = cg, sB[k] = cb, flo[k] = 0.2;
    }
  }

  // rim light: hill edges facing the sun, and their tops, take the sky's colour
  for (let r = 1; r < H - 1; r++) {
    for (let x = 2; x < W - 2; x++) {
      const k = r * W + x;
      if (mat[k] !== LAND) continue;
      const toward = x < SUN[0] ? 1 : -1;
      const strong = 0.6 * Math.exp(-Math.abs(x - SUN[0]) / 40);
      if (mat[k + toward] === SKY) (sR[k] += 0.85 * strong), (sG[k] += 0.42 * strong), (sB[k] += 0.25 * strong);
      if (mat[k - W] === SKY) (sR[k] += sR[k - W] * 0.3), (sG[k] += sG[k - W] * 0.3), (sB[k] += sB[k - W] * 0.3);
    }
  }

  // The bridge, sampled nine times a cell so its thin cables come out as partial cover.
  const bCov = new Float32Array(N);
  const bR = new Float32Array(N), bG = new Float32Array(N), bB = new Float32Array(N);
  const isSteel = new Uint8Array(N);
  for (let r = 0; r < H; r++) {
    for (let x = 0; x < W; x++) {
      const k = r * W + x;
      let steel = 0, cable = 0, susp = 0, pier = 0;
      for (let sy = 0; sy < 3; sy++)
        for (let sx = 0; sx < 3; sx++) {
          const b = bridgeAt(x + (sx + 0.5) / 3, r + (sy + 0.5) / 3);
          if (b === 1) steel++;
          else if (b === 2) cable++;
          else if (b === 3) susp++;
          else if (b === 4) pier++;
        }
      const n = steel + cable + susp + pier;
      if (!n) continue;
      // international orange in its own shadow, the sun behind it
      let cr = (steel * 0.3 + cable * 0.42 + susp * 0.3 + pier * 0.13) / n;
      let cg = (steel * 0.075 + cable * 0.11 + susp * 0.08 + pier * 0.11) / n;
      let cb = (steel * 0.045 + cable * 0.06 + susp * 0.05 + pier * 0.13) / n;
      // darker below the deck, out of the sky's light
      if (r > deckY(x) + 2) (cr *= 0.75), (cg *= 0.8), (cb *= 0.85);
      bR[k] = cr, bG[k] = cg, bB[k] = cb;
      bCov[k] = (steel + pier + cable * 0.95 + susp * 0.55) / 9;
      if (steel + pier >= 5) isSteel[k] = 1;
    }
  }
  // the towers' edges facing the sun catch it, hot orange
  for (let r = 1; r < H - 1; r++) {
    for (let x = 2; x < W - 2; x++) {
      const k = r * W + x;
      if (!isSteel[k]) continue;
      const toward = x < SUN[0] ? 1 : -1;
      const strong = 0.7 * Math.exp(-Math.abs(x - SUN[0]) / 55);
      let a = 0;
      if (!isSteel[k + toward] && mat[k + toward] === SKY) a = strong;
      else if (!isSteel[k + 2 * toward] && mat[k + 2 * toward] === SKY) a = strong * 0.35;
      if (!isSteel[k - W] && mat[k - W] === SKY) a = Math.max(a, 0.3);
      bR[k] += 0.95 * a, bG[k] += 0.34 * a, bB[k] += 0.14 * a;
    }
  }

  // the still scene as the water sees it, bridge and all
  const stR = new Float32Array(N), stG = new Float32Array(N), stB = new Float32Array(N);
  for (let k = 0; k < N; k++) {
    const c = bCov[k];
    stR[k] = mix(sR[k], bR[k], c), stG[k] = mix(sG[k], bG[k], c), stB[k] = mix(sB[k], bB[k], c);
  }

  // --- the reflection: the gate mirrored at the horizon ------------------------
  const refl = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
  for (let r = 0; r < H; r++) {
    for (let x = 0; x < W; x++) {
      const k = r * W + x;
      if (mat[k] !== WATER) continue;
      const d = r + 0.5 - HZ;
      let ar = 0, ag = 0, ab = 0;
      for (let o = 0; o < 2; o++) {
        const ym = HZ - d * 0.85 - 0.4 - o * 0.8;
        const q = ym < 0 ? -1 : Math.floor(ym) * W + x;
        // the rippled water stretches the sky's light down toward us
        const i = rampAt(skyHeat(x + 0.5, Math.max(0, HZ - d * 0.36 - 1 - o * 0.6))) * 3;
        if (q < 0 || mat[q] === WATER) (ar += RT[i]), (ag += RT[i + 1]), (ab += RT[i + 2]);
        else if (mat[q] === SKY && !bCov[q]) (ar += RT[i]), (ag += RT[i + 1]), (ab += RT[i + 2]);
        else (ar += stR[q] + RT[i] * 0.2), (ag += stG[q] + RT[i + 1] * 0.2), (ab += stB[q] + RT[i + 2] * 0.2);
      }
      const a = 0.55 - 0.3 * smooth(HZ, H, r);
      refl[0][k] = (ar / 2) * a, refl[1][k] = (ag / 2) * a, refl[2][k] = (ab / 2) * a;
    }
  }

  // --- clouds: long sunset streaks, dark on top and lit from below ------------
  const CW = 800, CH = HZ - 4;
  const cover = new Float32Array(CW * CH);
  const clit = new Float32Array(CW * CH);
  const density = (x: number, y: number) => {
    const q = fbm(x * 0.005, y * 0.03, 3, 4);
    const d = fbm(x * 0.0125 + q * 1.8, y * 0.09 + q * 0.9, 5, 10);
    const env = 0.04 * Math.exp(-(((y - 11) / 4) ** 2)) + 0.09 * Math.exp(-(((y - 27) / 5.5) ** 2));
    // and one thin, broken streak low down, to cross the sun
    const c = 52 + 2.5 * (fbm(x * 0.01, 9.5, 2, 8) - 0.5);
    const th = 0.8 + 0.7 * fbm(x * 0.05, 3.5, 2, 40);
    const streak = Math.exp(-(((y - c) / th) ** 2)) * smooth(0.42, 0.6, fbm(x * 0.0125, 21.5, 3, 10)) * (0.75 + 0.5 * fbm(x * 0.05, y * 0.3, 3, 40));
    return Math.max(d + env - 0.08, 0.36 + 0.3 * streak);
  };
  for (let r = 0; r < CH; r++) {
    for (let x = 0; x < CW; x++) {
      const y = r + 0.5;
      const d = density(x, y);
      cover[r * CW + x] = smooth(0.47, 0.62, d);
      clit[r * CW + x] = clamp(0.4 + (d - density(x, y + 2)) * 5.5 + (density(x, y - 2.5) - d) * 1.5);
    }
  }

  // --- the lights -----------------------------------------------------------------
  // sodium lamps along the deck
  const lamps: number[] = [];
  for (let x = ANCHOR_N + 3; x < W; x += 4.6 * scale(x)) lamps.push(x);
  // cars: [lane offset, speed, start, headlights toward us or tail lights away]
  const cars: [number, number, number, boolean][] = [];
  for (let i = 0; i < 9; i++) cars.push([hash(i, 91) < 0.5 ? 0 : 0.4, 5 + 4 * hash(i, 92), hash(i, 93) * 220, i % 2 === 0]);

  const dyn = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
  const dref = [new Float32Array(N), new Float32Array(N), new Float32Array(N)]; // light to be reflected
  const addGlow = (fx: number, fy: number, core: number, halo: number, amp: number, c: number[]) => {
    const R = Math.ceil(halo * 3.2);
    for (let r = Math.max(0, Math.floor(fy - R)); r < Math.min(H, fy + R); r++) {
      for (let x = Math.max(0, Math.floor(fx - R)); x < Math.min(W, fx + R); x++) {
        const k = r * W + x;
        const dx = x + 0.5 - fx, dy = (r + 0.5 - fy) * 0.85;
        const d = Math.sqrt(dx * dx + dy * dy);
        const h = Math.exp(-((d / core) ** 2)) * 1.5 * amp, v = Math.exp(-d / halo) * 0.3 * amp;
        dyn[0][k] += h + v * c[0], dyn[1][k] += h * mix(0.4, 0.9, c[1]) + v * c[1], dyn[2][k] += h * mix(0.3, 0.7, c[2]) + v * c[2];
      }
    }
  };
  // a light's broken road on the water, starting where its reflection would sit
  const addStreak = (fx: number, from: number, width: number, len: number, amp: number, c: number[]) => {
    for (let r = Math.max(Math.ceil(HZ), Math.floor(from)); r < H; r++) {
      const dy = r + 0.5 - from;
      const a = Math.exp(-Math.max(0, dy) / len) * amp * smooth(-1.5, 0.5, dy);
      if (a < 0.01) break;
      for (let x = Math.max(0, Math.floor(fx - 3 * width - 1)); x < Math.min(W, fx + 3 * width + 1); x++) {
        const k = r * W + x;
        if (mat[k] !== WATER) continue;
        const v = a * Math.exp(-(((x + 0.5 - fx) / width) ** 2));
        dref[0][k] += v * c[0], dref[1][k] += v * c[1], dref[2][k] += v * c[2];
      }
    }
  };
  const mirror = (y: number) => HZ + (HZ - y) * 0.85;
  const RED = [1, 0.12, 0.08], WHITE = [1, 0.95, 0.85];

  // the sailboat crossing the bay
  const BS = 0.9;
  const boatAt = (lx: number, ly: number) => {
    // local coordinates: lx along the boat, bow to the right, ly up from the waterline
    if (Math.abs(lx) < 7 && ly > -0.5 && ly < 1.3 + 0.6 * Math.pow(Math.abs(lx) / 7, 2)) return 1;
    if (Math.abs(lx - 0.5) < 0.3 && ly > 0 && ly < 15) return 1; // the mast
    if (lx < 0.4 && lx > -5.8 && ly > 2 && ly < 14.5 && (lx + 5.8) / 6.2 > (ly - 2) / 12.5) return 2; // the mainsail
    if (lx > 0.7 && lx < 6 && ly > 1.6 && ly < 13.5 && (6 - lx) / 5.3 > (ly - 1.6) / 11.9) return 2; // the jib
    return 0;
  };

  return (t, { color } = {}) => {
    for (let c = 0; c < 3; c++) dyn[c].fill(0), dref[c].fill(0);

    for (const x of lamps) {
      const y = deckY(x) - 0.5;
      addGlow(x, y, 0.4 + 0.15 * scale(x), 0.5 + 0.5 * scale(x), 0.45, LAMP);
      addStreak(x, mirror(y), 0.35, 5, 0.16, LAMP);
    }
    // aviation lamps on the tower caps, slowly blinking
    TOWERS.forEach((T, i) => {
      const on = smooth(-0.2, 0.4, Math.sin(t * 2.4 + i * 1.7));
      for (const side of [-1, 1]) {
        const x = T.x + side * T.hw * 0.62, y = T.top - 1.8 * T.s;
        addGlow(x, y, 0.5, 0.9 + 0.5 * T.s, 0.9 * on, RED);
        addStreak(x, mirror(y), 0.4, 6, 0.35 * on, RED);
      }
    });
    // cars on the deck: white heading toward the city, red heading for Marin
    for (const [lane, speed, x0, toward] of cars) {
      const span = W - ANCHOR_N + 20;
      const p = ((((x0 + (toward ? 1 : -1) * speed * t) % span) + span) % span) + ANCHOR_N - 10;
      if (p < ANCHOR_N || p >= W) continue;
      const y = deckY(p) - 0.3 + lane;
      const c = toward ? WHITE : RED;
      addGlow(p, y, 0.45, 0.6, toward ? 0.8 : 0.6, c);
      addStreak(p, mirror(y), 0.3, 4, 0.12, c);
    }

    const drift = t * 0.8 + 340;
    const fogT = t * 1.6;
    const bx = ((t * 1.1 + 95) % 250) - 25, by = 84 + Math.sin(t * 0.8) * 0.2;

    for (let r = 0; r < H; r++) {
      const y = r + 0.5;
      for (let x = 0; x < W; x++) {
        const k = r * W + x;
        const m = mat[k];
        let cr = sR[k], cg = sG[k], cb = sB[k], floor = flo[k], fade = 1, star = false;

        if (m === SKY) {
          if (r < CH && sun[k] < 0.5) {
            const sx = x + drift, ix = Math.floor(sx), fx = sx - ix;
            const i0 = r * CW + (ix % CW), i1 = r * CW + ((ix + 1) % CW);
            const c = cover[i0] + (cover[i1] - cover[i0]) * fx;
            if (c > 0.01) {
              // high streaks glow rose from below; low ones stand dark against
              // the sunset with only their undersides lit, gold near the sun
              const l = clit[i0] + (clit[i1] - clit[i0]) * fx;
              const lo = smooth(12, 30, y);
              const lit = mix(0.3 + 0.7 * l, 0.9 * l * l, lo);
              const i = rampAt(0.56 + 0.38 * warm[k] + 0.08 * l) * 3;
              const kr = mix(0.075, RT[i], lit), kg = mix(0.05, RT[i + 1], lit), kb = mix(0.15, RT[i + 2], lit);
              cr = mix(cr, kr, c), cg = mix(cg, kg, c), cb = mix(cb, kb, c);
              floor = mix(floor, 0.06, c * (1 - lit));
            } else if (y < 22 && hash(x, r * 3 + 11) > 0.993) {
              const tw = 0.4 + 0.25 * Math.sin(t * (1.3 + hash(x, r) * 2) + hash(r, x) * 6.28);
              cr = Math.max(cr, tw * 0.9), cg = Math.max(cg, tw * 0.88), cb = Math.max(cb, tw);
              star = true;
            }
          }
        } else if (m === WATER) {
          const v = (y - HZ) / (H - HZ);
          const w = 0.6 * noise(x * 0.05 + t * 0.08, y * 0.45 - t * 0.45, 0) + 0.4 * noise(x * 0.16 - t * 0.15, y * 0.95 - t * 0.9, 0);
          const swell = 0.55 + 0.9 * w;
          cr = 0.035 * swell, cg = 0.05 * swell, cb = 0.13 * swell;
          const wob = (noise(x * 0.04 + 7, y * 0.3 - t * 0.6, 0) - 0.5) * (1.2 + 4 * v);
          let sx = x + wob;
          if (sx < 0) sx = 0;
          if (sx > W - 1.001) sx = W - 1.001;
          const i0 = r * W + (sx | 0), fx = sx - (sx | 0);
          const dash = smooth(0.25, 0.75, noise(x * 0.12 + 3, y * 0.8 - t * 1.1, 0));
          const ref = (a: Float32Array) => a[i0] + (a[i0 + 1] - a[i0]) * fx;
          // broken bands, except in the bright reach under the sun
          const reach = Math.exp(-(((x + 0.5 - SUN[0]) / 18) ** 2)) * smooth(HZ + 1, HZ + 5, y);
          const da = mix(0.05 + 1.1 * dash, 0.8 + 0.5 * dash, reach) * mix(0.55, 1, Math.exp(-Math.abs(x - SUN[0]) / 45));
          cr += ref(refl[0]) * da, cg += ref(refl[1]) * da, cb += ref(refl[2]) * da;
          const fl = 0.2 + 1.1 * dash;
          cr += ref(dref[0]) * fl, cg += ref(dref[1]) * fl, cb += ref(dref[2]) * fl;
          // the sun's road of glitter, straight toward us
          const gw = 2 + (y - HZ) * 0.22;
          const gx = (x + 0.5 - SUN[0]) / gw;
          if (gx > -3 && gx < 3) {
            const road = Math.exp(-gx * gx) * Math.exp(-(y - HZ) / 30);
            const rip = noise(x * 0.45 + y * 0.1 - t * 0.3, y * 1.3 - t * 1.6, 0);
            const glint = smooth(0.4, 0.76, 0.45 * w + 0.55 * rip) * road;
            cr += 1.1 * glint + 0.16 * road, cg += 0.8 * glint + 0.09 * road, cb += 0.42 * glint + 0.05 * road;
          }
          floor = 0.12;
          fade = smooth(H + 4, H - 16, y);
        }

        // the fog bank pouring in through the gate, thickest on the ocean side,
        // behind the bridge and lit peach and mauve by the sun
        if (m !== WATER || y < HZ + 2) {
          const top = HZ - 2 - 9 * smooth(112, 12, x) - 3 * fbm(x * 0.03 - fogT * 0.02, 2, 2, 0);
          if (y > top - 2) {
            const n = fbm((x - fogT) * 0.035, y * 0.2 + 3, 4, 0);
            const dens = smooth(0.38, 0.66, n) * smooth(top - 2, top + 2.5, y) * smooth(178, 120, x) * (1 - smooth(HZ, HZ + 2, y) * 0.6) * (1 - 0.7 * Math.exp(-(((x - SUN[0]) / 9) ** 2)));
            if (dens > 0.01) {
              const glow = Math.exp(-Math.abs(x - SUN[0]) / 30);
              const lift = 0.95 + 0.4 * smooth(top + 4, top - 1, y);
              const fr = mix(0.4, 1, glow) * lift, fg = mix(0.3, 0.68, glow) * lift, fb = mix(0.42, 0.55, glow) * lift;
              const a = dens * 0.85;
              cr = mix(cr, fr, a), cg = mix(cg, fg, a), cb = mix(cb, fb, a);
              floor = mix(floor, 0.25, a), star = false;
            }
          }
        }

        // the bridge in front of it all
        const bc = bCov[k];
        if (bc) {
          cr = mix(cr, bR[k], bc), cg = mix(cg, bG[k], bc), cb = mix(cb, bB[k], bc);
          floor = mix(floor, 0.05, bc), star = false;
        }

        // the sailboat and its dark reflection
        const lx = x + 0.5 - bx;
        if (lx > -10 && lx < 10 && r > by - 16 && r < by + 14) {
          let cov = 0, sail = 0, rc = 0;
          for (let sy2 = 0; sy2 < 2; sy2++)
            for (let sx2 = 0; sx2 < 2; sx2++) {
              const px = (lx - 0.25 + sx2 * 0.5) / BS, py = (by - (r + 0.25 + sy2 * 0.5)) / BS;
              const b = boatAt(px, py);
              if (b === 1) cov++;
              else if (b === 2) sail++;
              if (m === WATER && boatAt(px, -py * 0.9)) rc++;
            }
          cov /= 4, sail /= 4, rc /= 4;
          if (cov + sail > 0) {
            // a dusky hull, and sails a mid-tone mauve: darker than the sun's road,
            // lighter than the open water, so the boat reads against either
            const a = cov + sail, sk = sail / a;
            cr = mix(cr, mix(0.03, 0.3, sk), a), cg = mix(cg, mix(0.022, 0.19, sk), a), cb = mix(cb, mix(0.04, 0.27, sk), a);
            floor = mix(floor, 0.03, a);
          } else if (rc > 0) (cr *= 1 - 0.7 * rc), (cg *= 1 - 0.7 * rc), (cb *= 1 - 0.65 * rc);
        }

        cr += dyn[0][k], cg += dyn[1][k], cb += dyn[2][k];

        const peak = Math.max(cr, cg, cb, 1e-4);
        const level = clamp(floor + (1 - floor) * Math.pow(peak, 0.72) * 0.95) * fade;
        const step = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(r & 3) * 4 + (x & 3)])));
        out[k] = DOTS[step];
        if (color) {
          if (star) color[k] = STAR;
          else {
            const want = step ? Math.min(1, (level + 0.06) / COVER[step]) : 0;
            const s = Math.min(LIFT[step], (0.3 + 0.7 * want) / peak);
            color[k] = nearest(clamp(cr * s), clamp(cg * s), clamp(cb * s));
          }
        }
      }
    }
    const lines: string[] = [];
    for (let r = 0; r < H; r++) lines.push(out.slice(r * W, (r + 1) * W).join(""));
    return lines.join("\n");
  };
}
