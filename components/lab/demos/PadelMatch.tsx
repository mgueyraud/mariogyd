"use client";
import { useEffect, useRef } from "react";
import { DialRoot, useDialKit, type DialConfig } from "dialkit";
import "dialkit/styles.css";
import ComponentWrapper, { useTheme } from "../ComponentWrapper";

/*
 * "Small plays" — a padel match. Isometric scene drawn with raw WebGL into a
 * low-res framebuffer, then upscaled with nearest filtering through an
 * ordered (Bayer 4×4) dither + palette quantization, so it reads as pixel art.
 *
 * Loop (10 s): B1 serves and joins B2 at the net. A2 answers with a deep
 * lob to win the net; B2 drops back a step and hits a kick smash that bounces,
 * climbs off the back glass and comes back very high. A1, reading the smash,
 * has already run to the net to recover it, leaps, and can't get near it.
 */
const CONFIG = {
  // Size of one rendered pixel, in CSS px. Bigger = chunkier.
  pixel: [1.8, 1, 8, 0.1],
  // Colour steps per channel after quantization.
  levels: [7, 2, 12, 1],
  dither: [0.75, 0, 1, 0.05],
  speed: [1.25, 0, 3, 0.05],
  court: "#36a34b",
  ground: "#33373b",
  // Ball diameter, metres (real: 0.067, exaggerated so it survives the pixel pass).
  ball: [0.22, 0.1, 1, 0.02],
  // Wire mesh of the cage: cell pitch and wire gauge in metres, how dark the
  // wires draw, and square vs. diamond (chain-link) weave.
  cage: {
    cell: [0.42, 0.05, 1, 0.01],
    wire: [0.05, 0.01, 0.3, 0.005],
    opacity: [0.4, 0, 1, 0.05],
    diamond: true,
  },
  // Post and rail thickness, metres. "glass" posts carry the glass panels
  // (back walls and the first 4 m of each side); "cage" posts carry mesh.
  posts: {
    glass: [0.11, 0.05, 0.5, 0.01],
    cage: [0.11, 0.05, 0.5, 0.01],
    rail: [0.11, 0.03, 0.4, 0.01],
  },
  // Lighting: flat ambient, the directional "sun" (also casts the shadows),
  // and the four floodlights as warm point lights with a falloff reach.
  lights: {
    ambient: [0.35, 0, 1, 0.05],
    sun: [0.35, 0, 1.5, 0.05],
    lamp: [0.75, 0, 4, 0.05],
    reach: [6.5, 1, 30, 0.5],
    color: "#ffe2a8",
  },
  // Surface and depth: world-space grain on every surface, fog toward the
  // background with distance, ink on the dark side of edges, and a vignette.
  look: {
    grain: [0.15, 0, 0.6, 0.01],
    grainScale: [2.5, 0.5, 16, 0.5],
    fog: [0.3, 0, 1, 0.05],
    outline: [0, 0, 1, 0.05],
    vignette: [1, 0, 1, 0.05],
  },
} satisfies DialConfig;
type Posts = { glass: number; cage: number; rail: number };
declare global {
  interface Window {
    __padelSeek?: (t: number) => void;
  }
}

const W = 760;
const H = 640;
const PERIOD = 10;
const G = 9.8;

type Vec3 = [number, number, number];
type M4 = Float32Array;

/* ---------- mat4 (column-major) ---------- */

function ident(): M4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}
function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}
function chain(...ms: M4[]): M4 {
  return ms.reduce((a, b) => mul(a, b));
}
function translate(x: number, y: number, z: number): M4 {
  const m = ident();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}
function rotY(a: number): M4 {
  const m = ident();
  const c = Math.cos(a);
  const s = Math.sin(a);
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}
function scale(k: number): M4 {
  const m = ident();
  m[0] = m[5] = m[10] = k;
  return m;
}
function rotZ(a: number): M4 {
  const m = ident();
  const c = Math.cos(a);
  const s = Math.sin(a);
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  return m;
}
function ortho(l: number, r: number, b: number, t: number, n: number, f: number): M4 {
  const m = new Float32Array(16);
  m[0] = 2 / (r - l);
  m[5] = 2 / (t - b);
  m[10] = -2 / (f - n);
  m[12] = -(r + l) / (r - l);
  m[13] = -(t + b) / (t - b);
  m[14] = -(f + n) / (f - n);
  m[15] = 1;
  return m;
}
function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function lookAt(eye: Vec3, target: Vec3, up: Vec3): M4 {
  const f = norm([target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]]);
  const s = norm(cross(f, up));
  const u = cross(s, f);
  return new Float32Array([
    s[0], u[0], -f[0], 0,
    s[1], u[1], -f[1], 0,
    s[2], u[2], -f[2], 0,
    -dot(s, eye), -dot(u, eye), dot(f, eye), 1,
  ]);
}
// Flattens geometry onto the plane y = h along light direction L.
function shadowMatrix(L: Vec3, h: number): M4 {
  const m = new Float32Array(16);
  const kx = -L[0] / L[1];
  const kz = -L[2] / L[1];
  m[0] = 1;
  m[4] = kx;
  m[12] = -h * kx;
  m[13] = h;
  m[6] = kz;
  m[10] = 1;
  m[14] = -h * kz;
  m[15] = 1;
  return m;
}

/* ---------- geometry ---------- */

type Col = Vec3;
const FACES: { n: Vec3; v: Vec3[] }[] = [
  { n: [1, 0, 0], v: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]] },
  { n: [-1, 0, 0], v: [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]] },
  { n: [0, 1, 0], v: [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]] },
  { n: [0, -1, 0], v: [[-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1]] },
  { n: [0, 0, 1], v: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },
  { n: [0, 0, -1], v: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]] },
];
const STRIDE = 10; // pos3 nrm3 rgba4

class Builder {
  data = new Float32Array(STRIDE * 36 * 64);
  n = 0;
  reset() {
    this.n = 0;
  }
  private push(p: Vec3, nr: Vec3, c: Col, a: number) {
    if ((this.n + 1) * STRIDE > this.data.length) {
      const d = new Float32Array(this.data.length * 2);
      d.set(this.data);
      this.data = d;
    }
    const o = this.n * STRIDE;
    const d = this.data;
    d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2];
    d[o + 3] = nr[0]; d[o + 4] = nr[1]; d[o + 5] = nr[2];
    d[o + 6] = c[0]; d[o + 7] = c[1]; d[o + 8] = c[2]; d[o + 9] = a;
    this.n++;
  }
  // Box centred on the origin of `m`, with `side` (optional) on vertical faces.
  box(m: M4, sx: number, sy: number, sz: number, top: Col, side?: Col, a = 1) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2;
    for (const f of FACES) {
      const nr = norm([
        m[0] * f.n[0] + m[4] * f.n[1] + m[8] * f.n[2],
        m[1] * f.n[0] + m[5] * f.n[1] + m[9] * f.n[2],
        m[2] * f.n[0] + m[6] * f.n[1] + m[10] * f.n[2],
      ]);
      const c = side && f.n[1] === 0 ? side : top;
      const pts = f.v.map((v): Vec3 => {
        const x = v[0] * hx, y = v[1] * hy, z = v[2] * hz;
        return [
          m[0] * x + m[4] * y + m[8] * z + m[12],
          m[1] * x + m[5] * y + m[9] * z + m[13],
          m[2] * x + m[6] * y + m[10] * z + m[14],
        ];
      });
      for (const i of [0, 1, 2, 0, 2, 3]) this.push(pts[i], nr, c, a);
    }
  }
  at(x: number, y: number, z: number, sx: number, sy: number, sz: number, top: Col, side?: Col, a = 1) {
    this.box(translate(x, y, z), sx, sy, sz, top, side, a);
  }
  slice() {
    return this.data.subarray(0, this.n * STRIDE);
  }
}

function hex(h: string): Col {
  const v = parseInt(h.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}
function shade(c: Col, k: number): Col {
  return [c[0] * k, c[1] * k, c[2] * k];
}
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STEEL: Col = hex("#15171a");
const WHITE: Col = hex("#f1f1ec");
// Pure white lands exactly on a quantization level, so the dither leaves it
// solid instead of breaking it into white/grey dashes.
const LINE: Col = [1, 1, 1];
const GLASS: Col = [0.8, 0.93, 1.0];
const MESH: Col = [0.07, 0.08, 0.09];
const CROWD: Col[] = ["#d9d2c5", "#2b2b30", "#7a6f66", "#b9c3cc", "#5c6b8a", "#c9a27e", "#3f4f3a", "#8a3b3b"].map(hex);
const SKINS: Col[] = ["#f0c9a6", "#c88a62", "#7a4a2c", "#e8b48c"].map(hex);

// Court is 20 × 10 m, long axis on x, net at x = 0. Night venue: dark matting,
// black steel frame, white net posts, floodlights, stands behind the far
// side wall and the far back wall.
function buildStatic(courtHex: string, groundHex: string, posts: Posts, eyeDir: Vec3) {
  const op = new Builder();
  const court = hex(courtHex);
  const ground = hex(groundHex);
  const rnd = mulberry(7);

  // Venue floor with a ragged, pixel-noise edge.
  const GX = 13.5, GZ = 10;
  for (let x = -GX; x < GX; x++)
    for (let z = -GZ; z < GZ; z++) {
      const cx = x + 0.5, cz = z + 0.5;
      if (Math.abs(cx) < 11.5 && Math.abs(cz) < 6.5) continue; // under the slab
      const edge = Math.min(GX - Math.abs(cx), GZ - Math.abs(cz));
      if (rnd() > Math.min(1, edge / 2.2 + 0.15)) continue;
      const k = 0.9 + rnd() * 0.2;
      op.at(cx, -0.28, cz, 1, 0.5, 1, shade(ground, k), shade(ground, 0.6));
    }
  // Carpeted slab and the turf on top.
  op.at(0, -0.2, 0, 23, 0.4, 13, shade(ground, 1.3), shade(ground, 0.8));
  op.at(0, 0.015, 0, 20, 0.03, 10, court, shade(court, 0.8));
  // Lines: service lines 3 m from each back wall, centre line between them.
  op.at(6.95, 0.045, 0, 0.3, 0.02, 10, LINE);
  op.at(-6.95, 0.045, 0, 0.3, 0.02, 10, LINE);
  // Centre line crosses both service lines and carries on past them. Real
  // overshoot is 20 cm; drawn at 80 cm so it survives the pixel pass.
  op.at(0, 0.045, 0, 15.5, 0.02, 0.3, LINE);

  // Net: white posts, white tape.
  op.at(0, 0.5, 5.08, 0.22, 1.0, 0.22, WHITE);
  op.at(0, 0.5, -5.08, 0.22, 1.0, 0.22, WHITE);
  op.at(0, 0.9, 0, 0.05, 0.07, 10.1, WHITE);

  // Black steel cage. Back walls: 3 m glass + 1 m mesh. Side walls: 2 m of
  // 3 m glass then 2 m of 2 m glass, both topped with 1 m of mesh, then 3 m
  // mesh up to the entrance at the net. Posts every 2 m, a rail on every
  // panel top.
  const r = posts.rail;
  const post = (x: number, z: number, h: number, w: number) => op.at(x, h / 2, z, w, h, w, STEEL);
  const railX = (x0: number, x1: number, y: number, z: number) =>
    op.at((x0 + x1) / 2, y, z, Math.abs(x1 - x0) + r, r, r, STEEL);
  const railZ = (x: number, y: number, z0: number, z1: number) =>
    op.at(x, y, (z0 + z1) / 2, r, r, Math.abs(z1 - z0) + r, STEEL);
  for (const sx of [-1, 1]) {
    for (const z of [-5, -2.5, 0, 2.5, 5]) post(sx * 10, z, 4, posts.glass);
    railZ(sx * 10, 4, -5, 5);
    railZ(sx * 10, 3, -5, 5);
    for (const sz of [-1, 1]) {
      post(sx * 8, sz * 5, 4, posts.glass);
      post(sx * 6, sz * 5, 3, posts.glass);
      for (const x of [4, 2]) post(sx * x, sz * 5, 3, posts.cage);
      railX(sx * 8, sx * 10, 4, sz * 5);
      railX(sx * 6, sx * 8, 3, sz * 5);
      railX(sx * 6, sx * 8, 2, sz * 5);
    }
  }
  // Entrances: a 1 m opening beside the net post on each side (on +x for the
  // near wall, −x for the far one), framed in white at 2 m. The cage carries
  // on above it: the 3 m rail runs the full length and mesh fills 2–3 m.
  for (const sz of [-1, 1]) {
    const d = sz;
    post(-d * 0.15, sz * 5, 3, posts.cage);
    post(d * 1.4, sz * 5, 3, posts.cage);
    railX(-8, 8, 3, sz * 5);
    for (const x of [d * 0.2, d * 1.2]) op.at(x, 1, sz * 5, 0.2, 2, 0.2, WHITE);
    op.at(d * 0.7, 2, sz * 5, 1.2, 0.16, 0.16, WHITE);
    op.at(d * 0.65, 0.005, sz * 5.8, 1.6, 0.01, 1.4, shade(ground, 1.8));
  }

  // Floodlight masts on the 4 m side posts, heads leaning over the court.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      op.at(sx * 8, 3.4, sz * 5.3, 0.16, 6.8, 0.16, STEEL);
      op.at(sx * 8, 6.9, sz * 4.9, 0.9, 0.24, 0.6, hex("#fff6d6"), STEEL);
    }

  // Stands: tiers behind the far side wall (−z) and the far back wall (+x),
  // sprinkled with a crowd.
  const seat = shade(ground, 1.15);
  const crowd = (x: number, y: number, z: number) => {
    op.at(x, y + 0.26, z, 0.32, 0.5, 0.3, CROWD[Math.floor(rnd() * CROWD.length)]);
    op.at(x, y + 0.6, z, 0.2, 0.2, 0.2, SKINS[Math.floor(rnd() * SKINS.length)]);
  };
  for (let i = 0; i < 3; i++) {
    const h = (i + 1) * 0.45;
    const zc = -7.2 - i * 0.9;
    op.at(0, h / 2, zc, 18, h, 0.9, seat, shade(ground, 0.7));
    for (let x = -8.6; x <= 8.6; x += 0.5) if (rnd() < 0.72) crowd(x + (rnd() - 0.5) * 0.1, h, zc);
    const xc = 12.4 + i * 0.9;
    op.at(xc, h / 2, 0, 0.9, h, 11, seat, shade(ground, 0.7));
    for (let z = -5.2; z <= 5.2; z += 0.5) if (rnd() < 0.72) crowd(xc, h, z + (rnd() - 0.5) * 0.1);
  }

  // Glass + mesh panels, depth-sorted once (camera never moves).
  type Panel = { c: Vec3; build: (b: Builder) => void };
  const panels: Panel[] = [];
  const glass = (x: number, y: number, z: number, sx: number, sy: number, sz: number) =>
    panels.push({ c: [x, y, z], build: (b) => b.at(x, y, z, sx, sy, sz, GLASS, GLASS, 0.11) });
  const mesh = (x: number, y: number, z: number, sx: number, sy: number, sz: number) =>
    panels.push({ c: [x, y, z], build: (b) => b.at(x, y, z, sx, sy, sz, MESH, MESH, -1) });
  for (const sx of [-1, 1]) {
    for (const z of [-3.75, -1.25, 1.25, 3.75]) glass(sx * 10, 1.5, z, 0.04, 3, 2.5);
    mesh(sx * 10, 3.5, 0, 0.03, 1, 10);
    for (const sz of [-1, 1]) {
      glass(sx * 9, 1.5, sz * 5, 2, 3, 0.04);
      mesh(sx * 9, 3.5, sz * 5, 2, 1, 0.03);
      glass(sx * 7, 1, sz * 5, 2, 2, 0.04);
      mesh(sx * 7, 2.5, sz * 5, 2, 1, 0.03);
    }
  }
  // Side mesh runs from x = ±6 to the net-side post, then from the far door
  // post back out to ±6, leaving the entrance open.
  for (const sz of [-1, 1]) {
    const d = sz;
    mesh(-d * 3.075, 1.5, sz * 5, 5.85, 3, 0.03);
    mesh(d * 3.7, 1.5, sz * 5, 4.6, 3, 0.03);
    mesh(d * 0.625, 2.5, sz * 5, 1.55, 1, 0.03); // above the door frame
  }
  // Net mesh
  panels.push({ c: [0, 0.45, 0], build: (b) => b.at(0, 0.44, 0, 0.03, 0.86, 10, MESH, MESH, 0.45) });
  panels.sort((a, b) => dot(a.c, eyeDir) - dot(b.c, eyeDir));
  const tr = new Builder();
  for (const p of panels) p.build(tr);

  return { opaque: op.slice(), transparent: tr.slice() };
}

/* ---------- choreography ---------- */

type Hit = { t: number; p: Vec3; who: number; kind: "fh" | "smash" };
// Every point the ball passes through, in loop time. Between points it
// flies on a parabola; after the last it rests until the loop restarts.
const BALL_PATH: Vec3[] = [
  [7.6, 1.0, 2.6], // 0.4 B1 serves
  [-6.5, 0.0, -2.6], // 1.4 bounce
  [-7.8, 0.8, -2.9], // 1.8 A2 deep lob
  [5.2, 2.9, -1.5], // 3.6 B2 kick smash
  [-6.5, 0.0, 1.0], // 4.1 bounce
  [-9.95, 1.8, 1.4], // 4.35 hits the back glass
  [3.5, 0.0, 2.0], // 6.65 climbs ~7 m, back over the net untouched
  [5.0, 0.0, 2.3], // 7.05
  [5.6, 0.0, 2.4], // 7.3 rest
];
const BALL_T = [0.4, 1.4, 1.8, 3.6, 4.1, 4.35, 6.65, 7.05, 7.3];
const HITS: Hit[] = [
  { t: 0.4, p: BALL_PATH[0], who: 2, kind: "fh" },
  { t: 1.8, p: BALL_PATH[2], who: 1, kind: "fh" },
  { t: 3.6, p: BALL_PATH[3], who: 3, kind: "smash" },
];

function ballAt(t: number): Vec3 {
  if (t < BALL_T[0]) return BALL_PATH[0];
  const last = BALL_T.length - 1;
  if (t >= BALL_T[last]) return BALL_PATH[last];
  let i = 0;
  while (t >= BALL_T[i + 1]) i++;
  const a = BALL_PATH[i], b = BALL_PATH[i + 1];
  const T = BALL_T[i + 1] - BALL_T[i];
  const u = t - BALL_T[i];
  const vy = (b[1] - a[1] + 0.5 * G * T * T) / T;
  const s = u / T;
  return [a[0] + (b[0] - a[0]) * s, a[1] + vy * u - 0.5 * G * u * u, a[2] + (b[2] - a[2]) * s];
}

type Way = [number, number, number]; // t, x, z
type PlayerDef = { shirt: Col; shorts: Col; skin: Col; hair: Col; way: Way[] };
const PLAYERS: PlayerDef[] = [
  {
    // A1 — white kit; runs to the net to recover the smash and can't reach it
    shirt: hex("#ecece6"), shorts: hex("#141417"), skin: hex("#c88a62"), hair: hex("#2a1b12"),
    way: [[0, -7.5, 2.5], [1.6, -7.5, 2.5], [3.0, -4.5, 2.2], [3.4, -4.5, 2.2], [4.6, -1.2, 1.8], [6.6, -1.2, 1.8], [8.3, -2.5, 2.0], [9.6, -7.5, 2.5], [PERIOD, -7.5, 2.5]],
  },
  {
    // A2 — white kit; returns the serve with a deep lob, then drops back
    shirt: hex("#ecece6"), shorts: hex("#141417"), skin: hex("#f0c9a6"), hair: hex("#c47a2c"),
    way: [[0, -7.5, -2.8], [2.0, -7.5, -2.8], [3.0, -5.0, -2.3], [3.4, -5.0, -2.3], [4.1, -7.6, 0.4], [8.3, -7.6, 0.4], [9.6, -7.5, -2.8], [PERIOD, -7.5, -2.8]],
  },
  {
    // B1 — black kit; serves and follows it to the net
    shirt: hex("#1e1e24"), shorts: hex("#ecece6"), skin: hex("#7a4a2c"), hair: hex("#151010"),
    way: [[0, 8.2, 2.9], [0.7, 8.2, 2.9], [2.2, 3.5, 2.5], [8.3, 3.5, 2.5], [9.6, 8.2, 2.9], [PERIOD, 8.2, 2.9]],
  },
  {
    // B2 — black kit; waits at the net, steps back for the kick smash
    shirt: hex("#1e1e24"), shorts: hex("#1e1e24"), skin: hex("#e8b48c"), hair: hex("#3a2616"),
    way: [[0, 3.0, -1.8], [2.4, 3.0, -1.8], [3.3, 5.5, -1.3], [4.0, 5.5, -1.3], [5.0, 3.6, -1.6], [8.3, 3.6, -1.6], [9.6, 3.0, -1.8], [PERIOD, 3.0, -1.8]],
  },
];

const smooth = (s: number) => s * s * (3 - 2 * s);
function posAt(way: Way[], t: number): [number, number] {
  let i = 0;
  while (i < way.length - 2 && t >= way[i + 1][0]) i++;
  const a = way[i], b = way[i + 1];
  const s = smooth(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))));
  return [a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
}
// Racket arm angle: 0 hangs down, + swings forward, π points straight up.
function racketAngle(who: number, t: number) {
  for (const h of HITS) {
    if (h.who !== who) continue;
    const d = t - h.t;
    if (h.kind === "fh") {
      if (d < -0.45 || d > 0.35) continue;
      if (d < -0.12) return -1.3 * smooth((d + 0.45) / 0.33); // wind up
      return -1.3 + 2.9 * smooth((d + 0.12) / 0.47); // swing through
    }
    // smash: load overhead-back, whip forward over the top, follow through
    if (d < -0.8 || d > 0.4) continue;
    if (d < -0.15) return 3.5 * smooth((d + 0.8) / 0.65);
    return 3.5 - 2.9 * smooth((d + 0.15) / 0.55);
  }
  // A1 stretches the racket up as they leap for the rebound at the net
  if (who === 0 && t > 5.5 && t < 6.2) {
    const k = Math.min(1, (t - 5.5) / 0.2, (6.2 - t) / 0.25);
    return 3.0 * k;
  }
  // B2 celebrates once the ball lands untouched on their side
  if (who === 3 && t > 6.9 && t < 8.4) {
    const k = Math.min(1, (t - 6.9) / 0.4, (8.4 - t) / 0.5);
    return (2.9 + 0.25 * Math.sin((t - 6.9) * 9)) * k;
  }
  return 0;
}
function jumpAt(who: number, t: number) {
  // B2's smash jump; A1's hopeless leap under the rebound.
  const j = who === 3 ? [3.6, 0.3, 0.6] : who === 0 ? [5.85, 0.32, 0.5] : null;
  if (!j) return 0;
  const d = (t - j[0]) / j[1];
  return d < -1 || d > 1 ? 0 : j[2] * (1 - d * d);
}

function drawPlayer(b: Builder, def: PlayerDef, who: number, t: number, ball: Vec3) {
  const [x, z] = posAt(def.way, t);
  const [x2, z2] = posAt(def.way, t + 0.04);
  const speed = Math.hypot(x2 - x, z2 - z) / 0.04;
  const moving = speed > 0.3;
  const facing = Math.atan2(-(ball[2] - z), ball[0] - x);
  // Figures are drawn 1.45× life size: pixel-art exaggeration.
  const base = chain(translate(x, jumpAt(who, t), z), rotY(facing), scale(1.45));
  const walk = moving ? Math.sin(t * 11) * 0.55 : 0;
  const shoe = hex("#2b2b2b");

  for (const side of [-1, 1]) {
    const hip = chain(base, translate(0, 0.8, side * 0.1), rotZ(walk * side));
    b.box(chain(hip, translate(0, -0.38, 0)), 0.15, 0.76, 0.15, def.skin);
    b.box(chain(hip, translate(0, -0.3, 0)), 0.17, 0.26, 0.17, def.shorts);
    b.box(chain(hip, translate(0.03, -0.76, 0)), 0.22, 0.08, 0.16, shoe);
  }
  b.box(chain(base, translate(0, 0.9, 0)), 0.36, 0.2, 0.3, def.shorts);
  b.box(chain(base, translate(0, 1.14, 0)), 0.34, 0.34, 0.26, def.shirt);
  b.box(chain(base, translate(0, 1.44, 0)), 0.22, 0.24, 0.22, def.skin);
  b.box(chain(base, translate(-0.015, 1.56, 0)), 0.25, 0.07, 0.25, def.hair);

  const racket = racketAngle(who, t);
  for (const side of [-1, 1]) {
    const isRacket = side === 1;
    const a = isRacket ? racket : moving ? -walk * 0.8 : 0;
    const arm = chain(base, translate(0, 1.27, side * 0.21), rotZ(a));
    b.box(chain(arm, translate(0, -0.27, 0)), 0.1, 0.5, 0.1, def.skin);
    b.box(chain(arm, translate(0, -0.08, 0)), 0.13, 0.16, 0.13, def.shirt);
    if (isRacket) {
      b.box(chain(arm, translate(0, -0.56, 0)), 0.05, 0.12, 0.05, STEEL);
      b.box(chain(arm, translate(0, -0.74, 0)), 0.26, 0.28, 0.035, hex("#1b1b1f"));
    }
  }
}

/* ---------- shaders ---------- */

const VS = `
attribute vec3 a_pos; attribute vec3 a_nrm; attribute vec4 a_col;
uniform mat4 u_vp; uniform mat4 u_model;
varying vec3 v_nrm; varying vec4 v_col; varying vec3 v_pos;
void main() {
  vec4 w = u_model * vec4(a_pos, 1.0);
  gl_Position = u_vp * w;
  v_pos = w.xyz;
  v_nrm = mat3(u_model) * a_nrm;
  v_col = a_col;
}`;
const FS = `
precision mediump float;
varying vec3 v_nrm; varying vec4 v_col; varying vec3 v_pos;
uniform vec3 u_light; uniform vec4 u_flat;
uniform vec4 u_mesh; // cell, wire, opacity, diamond
uniform vec3 u_lamp[4]; uniform vec4 u_lampC; // rgb, intensity
uniform vec4 u_look; // ambient, sun, lamp reach, fog
uniform vec2 u_grain; // amount, scale
uniform vec3 u_eye; uniform vec3 u_bg;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  if (u_flat.a > 0.0) { gl_FragColor = u_flat; return; }
  float a = v_col.a;
  if (a < 0.0) {
    // Wire mesh: every panel is axis-aligned, so x + z is its horizontal run.
    float h = v_pos.x + v_pos.z;
    vec2 q = u_mesh.w > 0.5 ? vec2(h + v_pos.y, h - v_pos.y) * 0.7071 : vec2(h, v_pos.y);
    vec2 g = fract(q / u_mesh.x) * u_mesh.x;
    a = min(g.x, g.y) < u_mesh.y ? u_mesh.z : 0.04;
  }
  vec3 n = normalize(v_nrm);
  float d = max(dot(n, -u_light), 0.0);
  float band = floor(d * 3.0 + 0.5) / 3.0;
  vec3 lit = vec3(u_look.x + 0.14 * (0.5 + 0.5 * n.y) + u_look.y * band);
  for (int i = 0; i < 4; i++) {
    vec3 L = u_lamp[i] - v_pos;
    float dist = length(L);
    float att = u_lampC.a / (1.0 + dist * dist / (u_look.z * u_look.z));
    lit += u_lampC.rgb * max(dot(n, L / dist), 0.0) * att;
  }
  // World-space grain so it sticks to surfaces instead of the screen.
  vec2 gp = vec2(v_pos.x + v_pos.y * 0.37, v_pos.z + v_pos.y * 0.61) * u_grain.y;
  float g = 1.0 + (hash(floor(gp)) - 0.5) * u_grain.x;
  vec3 col = v_col.rgb * lit * g;
  // Depth fog: farther from the camera fades toward the page background.
  float depth = clamp((dot(v_pos, -u_eye) + 14.0) / 28.0, 0.0, 1.0);
  col = mix(col, u_bg, u_look.w * depth * depth);
  gl_FragColor = vec4(col, a);
}`;
const POST_VS = `
attribute vec2 a_pos; varying vec2 v_uv;
void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;
const POST_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex; uniform vec2 u_low; uniform vec3 u_bg;
uniform float u_levels; uniform float u_dither;
uniform vec2 u_fx; // outline, vignette
float b2(vec2 p) { return 3.0 * p.y + 2.0 * p.x - 4.0 * p.x * p.y; }
float lum(vec2 uv) { return dot(texture2D(u_tex, uv).rgb, vec3(0.3, 0.59, 0.11)); }
void main() {
  vec4 c = texture2D(u_tex, v_uv);
  if (c.a < 0.01) { gl_FragColor = vec4(u_bg, 1.0); return; }
  // Ink: darken a pixel that is noticeably darker than a neighbour, so
  // edges get a line on their dark side and bright lines stay bright.
  vec2 px = 1.0 / u_low;
  float here = lum(v_uv);
  float m = max(max(lum(v_uv + vec2(px.x, 0.0)), lum(v_uv - vec2(px.x, 0.0))),
                max(lum(v_uv + vec2(0.0, px.y)), lum(v_uv - vec2(0.0, px.y))));
  vec3 col = c.rgb * (1.0 - u_fx.x * smoothstep(0.12, 0.45, m - here));
  vec2 vv = v_uv - 0.5;
  col *= 1.0 - u_fx.y * dot(vv, vv) * 2.0;
  vec2 p = floor(v_uv * u_low);
  float t = (4.0 * b2(mod(p, 2.0)) + b2(mod(floor(p / 2.0), 2.0)) + 0.5) / 16.0;
  float L = u_levels - 1.0;
  vec3 q = floor(col * L + (t - 0.5) * u_dither + 0.5) / L;
  gl_FragColor = vec4(q, 1.0);
}`;

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

/* ---------- component ---------- */

/*
 * The scene alone, for dropping on any canvas. The wrapper below adds the
 * lab chrome. `background` is what shows through the fog and around the
 * court; it should match whatever the canvas sits on.
 */
export function PadelScene({ background = "#fafafa" }: { background?: string }) {
  const p = useDialKit("Padel", CONFIG);
  const live = useRef(p);
  live.current = p;
  const bg = useRef(background);
  bg.current = background;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // The canvas fills its container; the drawing buffer follows its CSS
    // size. The pixel-art grid is fixed (W × H / pixel) and only the final
    // upscale changes, so the picture looks the same at every width.
    const fit = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round((canvas.clientWidth * H) / W * dpr));
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    // Isometric: long axis runs lower-left → upper-right, like the reference.
    const yaw = -Math.PI / 4, pitch = Math.PI / 6;
    const eyeDir: Vec3 = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
    const target: Vec3 = [0, 1.1, 0];
    const eye: Vec3 = [target[0] + eyeDir[0] * 60, target[1] + eyeDir[1] * 60, target[2] + eyeDir[2] * 60];
    const hw = 17, hh = (hw * H) / W;
    const vp = mul(ortho(-hw, hw, -hh, hh, 1, 200), lookAt(eye, target, [0, 1, 0]));
    const light = norm([0.25, -1, 0.5]);
    const shadowM = shadowMatrix(light, 0.065);

    const prog = compile(gl, VS, FS);
    const post = compile(gl, POST_VS, POST_FS);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uVp = U("u_vp"), uModel = U("u_model"), uLight = U("u_light"), uFlat = U("u_flat"), uMesh = U("u_mesh");
    const uLamp = U("u_lamp"), uLampC = U("u_lampC"), uLook = U("u_look"), uGrain = U("u_grain"), uEye = U("u_eye"), uBg = U("u_bg");
    // Point lights sit just under the floodlight heads.
    const lamps = new Float32Array([-8, 6.6, -4.6, 8, 6.6, -4.6, -8, 6.6, 4.6, 8, 6.6, 4.6]);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aNrm = gl.getAttribLocation(prog, "a_nrm");
    const aCol = gl.getAttribLocation(prog, "a_col");
    const PU = (n: string) => gl.getUniformLocation(post, n);
    const pTex = PU("u_tex"), pLow = PU("u_low"), pBg = PU("u_bg"), pLevels = PU("u_levels"), pDither = PU("u_dither"), pFx = PU("u_fx");
    const pPos = gl.getAttribLocation(post, "a_pos");

    const bufStatic = gl.createBuffer()!;
    const bufTrans = gl.createBuffer()!;
    const bufDyn = gl.createBuffer()!;
    const bufQuad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufQuad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    let staticKey = "";
    let nStatic = 0, nTrans = 0;
    const rebuildStatic = () => {
      const { court, ground, posts } = live.current;
      const key = `${court}${ground}${posts.glass}${posts.cage}${posts.rail}`;
      if (key === staticKey) return;
      staticKey = key;
      const s = buildStatic(court, ground, posts, eyeDir);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufStatic);
      gl.bufferData(gl.ARRAY_BUFFER, s.opaque, gl.STATIC_DRAW);
      nStatic = s.opaque.length / STRIDE;
      gl.bindBuffer(gl.ARRAY_BUFFER, bufTrans);
      gl.bufferData(gl.ARRAY_BUFFER, s.transparent, gl.STATIC_DRAW);
      nTrans = s.transparent.length / STRIDE;
    };

    // Low-res target
    const fbo = gl.createFramebuffer()!;
    const tex = gl.createTexture()!;
    const depth = gl.createRenderbuffer()!;
    let lowW = 0, lowH = 0;
    const sizeTarget = () => {
      const px = Math.max(1, live.current.pixel);
      const w = Math.round(W / px), h = Math.round(H / px);
      if (w === lowW && h === lowH) return;
      lowW = w;
      lowH = h;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const bindGeom = (buf: WebGLBuffer) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const B = STRIDE * 4;
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, B, 0);
      gl.enableVertexAttribArray(aNrm);
      gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, B, 12);
      gl.enableVertexAttribArray(aCol);
      gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, B, 24);
    };

    const dyn = new Builder();
    const ballCol = hex("#e8f05a");
    const q = new URLSearchParams(window.location.search);
    let t = Number(q.get("t")) || 0;
    const frozen = q.has("freeze");
    // Frozen pages expose a seek so a capture script can step the loop.
    if (frozen) window.__padelSeek = (v: number) => void (t = v);
    let last = performance.now();
    let raf = 0;
    // Only plays while on screen, and holds a still frame for readers who
    // prefer reduced motion (the loop still runs so dials keep working).
    let onScreen = true;
    const still = matchMedia("(prefers-reduced-motion: reduce)");

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!frozen && !still.matches) t = (t + dt * live.current.speed) % PERIOD;
      if (!onScreen) return;
      rebuildStatic();
      sizeTarget();

      const ball = ballAt(t);
      dyn.reset();
      PLAYERS.forEach((def, i) => drawPlayer(dyn, def, i, t, ball));
      const bs = live.current.ball;
      dyn.at(ball[0], ball[1] + bs / 2, ball[2], bs, bs, bs, ballCol);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufDyn);
      gl.bufferData(gl.ARRAY_BUFFER, dyn.slice(), gl.DYNAMIC_DRAW);

      const [br, bgc, bb] = hex(bg.current);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, lowW, lowH);
      gl.clearColor(br, bgc, bb, 0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(prog);
      gl.uniformMatrix4fv(uVp, false, vp);
      gl.uniform3fv(uLight, light);
      const { cage: cg, lights: li, look } = live.current;
      gl.uniform4f(uMesh, cg.cell, cg.wire, cg.opacity, cg.diamond ? 1 : 0);
      const lc = hex(li.color);
      gl.uniform3fv(uLamp, lamps);
      gl.uniform4f(uLampC, lc[0], lc[1], lc[2], li.lamp);
      gl.uniform4f(uLook, li.ambient, li.sun, li.reach, look.fog);
      gl.uniform2f(uGrain, look.grain, look.grainScale);
      gl.uniform3fv(uEye, eyeDir);
      gl.uniform3f(uBg, br, bgc, bb);
      gl.uniformMatrix4fv(uModel, false, ident());
      gl.uniform4f(uFlat, 0, 0, 0, 0);
      bindGeom(bufStatic);
      gl.drawArrays(gl.TRIANGLES, 0, nStatic);
      bindGeom(bufDyn);
      gl.drawArrays(gl.TRIANGLES, 0, dyn.n);

      // Flattened shadows of players + ball onto the floor.
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniformMatrix4fv(uModel, false, shadowM);
      gl.uniform4f(uFlat, 0.03, 0.05, 0.1, 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, dyn.n);

      // Glass and mesh last, back to front, without writing depth.
      gl.uniformMatrix4fv(uModel, false, ident());
      gl.uniform4f(uFlat, 0, 0, 0, 0);
      gl.depthMask(false);
      bindGeom(bufTrans);
      gl.drawArrays(gl.TRIANGLES, 0, nTrans);
      gl.depthMask(true);

      // Upscale + dither to the screen.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.useProgram(post);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(pTex, 0);
      gl.uniform2f(pLow, lowW, lowH);
      gl.uniform3f(pBg, br, bgc, bb);
      gl.uniform1f(pLevels, Math.max(2, live.current.levels));
      gl.uniform1f(pDither, live.current.dither);
      gl.uniform2f(pFx, look.outline, look.vignette);
      gl.disableVertexAttribArray(aNrm);
      gl.disableVertexAttribArray(aCol);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufQuad);
      gl.enableVertexAttribArray(pPos);
      gl.vertexAttribPointer(pPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      last = performance.now();
    });
    io.observe(canvas);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (frozen) delete window.__padelSeek;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Pixel-art padel match at night: four tiny players on a green court inside a black cage, a lob, a smash and a point won"
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, display: "block" }}
    />
  );
}

// The wrapper's two canvases, so the fog and the empty corners match it.
const CANVAS = { dark: "#1c1c1a", light: "#fcfcfa" };

function Scene() {
  return <PadelScene background={CANVAS[useTheme()]} />;
}

export default function PadelMatch() {
  return (
    <ComponentWrapper hasLightMode>
      <>
        <Scene />
        {/* Only shows in development (DialKit's default). */}
        <DialRoot theme="dark" />
      </>
    </ComponentWrapper>
  );
}
