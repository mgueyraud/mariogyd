/**
 * Typewriter: a fixed body and keys under a sheet that never moves. A keystroke kicks its key down and
 * the carriage (roller, knobs, lever, type guide) steps one character; the letter lands on the sheet in
 * a single-stroke type, and a full row feeds the paper up. The slider is the row's length.
 */
import HL from "./kernel";

const {
  Cam, circ, fillet, fit, facing, hull, open, poly, proj, prism, rings, ringAt, rrect, run, seg, unproj, r2,
  spring, stepS, tween, tset, tval, tdone, mk, solid, put, pointer, register, disposer,
} = HL;

const PITCH = 5, MARGIN = 7, PW = 74, YP = 8, Z0 = 43.6, LH = 6, ZTOP = 96, PBOT = 36;
const W = 70, D = 80, HT = 26, YT = 34, YC = 10, ZC = 33, R = 7, L = 78, KR = 5.2, KP = 13;
const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"], RY = [43, 54, 65], RX = [-58.5, -54, -45.5];
const LIP = 6, slope = (y) => LIP + ((HT - LIP) * (D - y)) / (D - YT);
/** The paper x of column j's centre: also where the carriage's type guide sits to type it. */
const X = (j) => -PW / 2 + MARGIN + j * PITCH + PITCH / 2;
const REST = ["ONE STROKE", "OF LIGHT", "ON PAPER,", "TYPE"];

// A single-stroke type on a 4 × 6 grid: each polyline is pairs of digits, x then y, y up from the baseline.
const O = "100105163645413010", PB = "00063645443303";
const FONT = {
  A: "002640 1232", B: PB + " 3342413000", C: "4536160501103041", D: "00062644422000", E: "46060040 0333", F: "460600 0333",
  G: "45361605011030414323", H: "0006 4640 0343", I: "1636 2620 1030", J: "4641301001", K: "0006 4602 1340", L: "060040",
  M: "0006234640", N: "00064046", O, P: PB, Q: O + " 2240", R: PB + " 2340", S: "453616050413334241301001", T: "0646 2620",
  U: "060110304146", V: "062046", W: "0610233046", X: "0046 0640", Y: "062346 2320", Z: "06464000",
  0: O, 1: "152620 1030", 2: "05163645440040", 3: "05163645443313 334241301001", 4: "30360242", 5: "4606033342413000",
  6: "36160501103041423303", 7: "064610", 8: "130405163645443313 1302011030414233", 9: "43130405163645413010",
  ".": "2021", ",": "2110", "-": "1333", ":": "2021 2425", "!": "2622 2021", "?": "05163645442322 2021", "'": "2625",
};
/** The glyph for ch as path data, each grid point placed by at(gx, gy). */
const glyph = (ch, at) => (FONT[ch] || "").split(" ").filter(Boolean)
  .map((pl) => open(pl.match(/../g).map((p) => at(+p[0], +p[1])))).join("");

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let N = Math.round(value);

  const C = Cam(45, 0.5, 1.4);
  fit(C, [[X(0) - L - 8, 0, 0], [X(11) + L + 8, D, 0], [-W, D, 0], [X(11) + L + 8, 0, 0], [-PW / 2, YP, ZTOP + 4], [PW / 2, YP, ZTOP + 4]], 200, 166);
  const P = proj(C), front = facing(C);

  // The paper: fixed, painted first; its foot sits inside the roller, which covers it at every carriage position.
  const g = mk("g", {}, svg);
  const sheet = fillet([[-PW / 2, PBOT], [PW / 2, PBOT], [PW / 2, ZTOP + 4], [-PW / 2, ZTOP + 4]], [0.1, 0.1, 1.6, 1.6]);
  mk("path", { d: poly(sheet.map(([x, z]) => P(x, YP, z))), class: "sil" }, g);
  const oldInk = mk("path", { class: "nf lo" }, g), ink = mk("path", { class: "nf" }, g);

  // The body: fixed, a deck over a plinth with the keyboard slope between.
  const foot = rrect(-W + 2, 0, W - 2, D, 8, 6), top = rrect(-W + 4, 3, W - 4, YT, 6, 6);
  const inner = rrect(-W + 5.5, 4.5, W - 5.5, YT - 1.5, 4.5, 6);
  put(solid(g), { sil: poly(hull(ringAt(P, foot, 0).concat(ringAt(P, foot, LIP), ringAt(P, top, HT)))), crease: open(ringAt(P, run(inner, front), HT)) });

  // The carriage, drawn once at offset 0 and moved as a whole: projection is affine, so a step in x is one translate.
  const M = mk("g", {}, g);
  /** A roller lying along x from x0 to x1: its silhouette, and the near end as the crease. */
  const cyl = (x0, x1, r) => {
    const c = circ(r, 28), at = (x) => c.map((q) => P(x, YC + q.u, ZC + q.v));
    return { sil: poly(hull(at(x0).concat(at(x1)))), crease: poly(at(x1)) };
  };
  for (const [a, b, r] of [[-L - 8, -L, 4.6], [-L, L, R], [L, L + 8, 4.6]]) put(solid(M), cyl(a, b, r));
  mk("path", { d: open([P(-L - 4, YC, ZC + 4), P(-L - 6, YC + 5, ZC + 12), P(-L + 6, YC + 15, ZC + 15)]), class: "nf sil" }, M);
  // the type guide: frames the cell the next character lands in
  const guide = mk("path", {
    d: poly(fillet([[-2.7, 41.3], [2.7, 41.3], [2.7, 45.9], [-2.7, 45.9]], [0.9, 0.9, 0.9, 0.9]).map(([x, z]) => P(x, YP + 1, z))),
    class: "nf hi",
  }, M);

  // two ribbon spools on the deck, in front of the roller
  for (const sx of [-46, 46]) {
    const [ring, rin] = rings(sx - 8, 18, sx + 8, 34, 8, 1.4);
    put(solid(g), prism(P, front, ring, rin, HT, HT + 3));
  }

  // Keys: rows back to front, left to right, then the space bar; each on its stem, its letter on its top.
  const keys = [];
  const addKey = (ch, x, y, half) => {
    const z0 = slope(y) + (half ? 3.5 : 4), grp = mk("g", {}, g);
    const stems = half ? [-half + 4, half - 4] : [0];
    const stem = mk("path", { class: "nf lo" }, grp);
    const [ring, rin] = half ? rings(x - half - 2.6, y - 2.6, x + half + 2.6, y + 2.6, 2.6, 0.9) : rings(x - KR, y - KR, x + KR, y + KR, KR, 1.2);
    const el = solid(grp), cap = mk("path", { class: "nf" }, grp);
    keys.push({ ch, x, y, half, z0, z1: z0 + 3, stems, stem, ring, rin, el, cap, hv: tween(0), sp: spring(0), drawn: NaN });
  };
  ROWS.forEach((row, r) => [...row].forEach((ch, i) => addKey(ch, RX[r] + i * KP, RY[r], 0)));
  addKey(" ", 0, 74.5, 30);

  function drawKey(k, now) {
    const d = tval(k.hv, now) + k.sp.x;
    if (d === k.drawn) return;
    k.drawn = d;
    put(k.el, prism(P, front, k.ring, k.rin, k.z0 - d, k.z1 - d));
    k.stem.setAttribute("d", k.stems.map((s) => seg(P(k.x + s, k.y, slope(k.y)), P(k.x + s, k.y, k.z0 - d))).join(""));
    k.cap.setAttribute("d", glyph(k.ch, (gx, gy) => P(k.x + (gx - 2) * 0.65, k.y + (3 - gy) * 0.65, k.z1 - d)));
  }

  // Text: rows of letters, row 0 the one being typed. f runs from -1 to 0 after a feed.
  const lines = REST.slice().reverse().map((s) => [...s]);
  let col = lines[0].length, mx = tween(X(col)), feed = tween(0), dirty = true, drawnM = NaN, drawnF = NaN;

  function drawInk(f) {
    let cur = "", old = "";
    lines.forEach((line, k) => {
      const z = Z0 + (k + f) * LH;
      if (z > ZTOP) return;
      line.forEach((ch, j) => {
        const s = glyph(ch, (gx, gy) => P(X(j) + (gx - 2) * 0.5, YP, z + (gy - 3) * 0.5));
        if (k === 0) cur += s; else old += s;
      });
    });
    ink.setAttribute("d", cur); oldInk.setAttribute("d", old);
  }

  const B = register(stage, (dt, now) => {
    let moving = false;
    const m = tval(mx, now), f = tval(feed, now);
    if (m !== drawnM) {
      drawnM = m;
      const a = P(m, 0, 0), b = P(0, 0, 0);
      M.setAttribute("transform", `translate(${r2(a[0] - b[0])} ${r2(a[1] - b[1])})`);
    }
    if (f !== drawnF || dirty) { drawnF = f; dirty = false; drawInk(f); }
    for (const k of keys) { if (stepS(k.sp, dt) || !tdone(k.hv, now)) moving = true; drawKey(k, now); }
    return moving || !tdone(mx, now) || !tdone(feed, now);
  });
  bag.add(B.unregister);

  /** Carriage return and line feed: the carriage goes back to column 0, the paper rises one line. */
  function newline(now) {
    lines.unshift([]);
    lines.length = Math.min(lines.length, 10);
    col = 0; tset(mx, X(0), now, 0);
    feed = tween(tval(feed, now) - 1);
    tset(feed, 0, now, 0);
    dirty = true; B.wake();
  }

  // Hit test against each key's rest top: the keys never travel, only dip.
  let act = -1;
  function pick(p) {
    let best = -1, bd = 6.6;
    keys.forEach((k, i) => {
      const [wx, wy] = unproj(C, p[0], p[1], k.z1);
      const dd = Math.hypot(Math.max(0, Math.abs(wx - k.x) - k.half), wy - k.y);
      if (dd < bd) { bd = dd; best = i; }
    });
    return best;
  }
  function hover(i) {
    if (i === act) return;
    const now = performance.now();
    if (act >= 0) { tset(keys[act].hv, 0, now, 0); keys[act].el.sil.classList.remove("hi"); }
    if ((act = i) >= 0) { tset(keys[i].hv, 2.4, now, 0); keys[i].el.sil.classList.add("hi"); }
    guide.classList.toggle("hi", i < 0);
    read.textContent = i < 0 ? "rest" : keys[i].ch === " " ? "space" : "key " + keys[i].ch;
    B.wake();
  }
  const keyOf = (ch) => keys.find((q) => q.ch === ch);
  /** One keystroke: its key goes down (held while the real key is, or kicked and sprung back), the letter lands, the carriage steps on. */
  function strike(ch, held) {
    const now = performance.now(), k = keyOf(ch);
    if (k && held) k.sp.t = 3.2; else if (k) k.sp.v = 70;
    if (ch !== " ") lines[0][col] = ch;
    col++;
    if (col >= N) newline(now); else tset(mx, X(col), now, 0);
    dirty = true; B.wake();
  }
  function back() { if (col > 0) { col--; tset(mx, X(col), performance.now(), 0); B.wake(); } }

  bag.add(pointer(stage, {
    move: (p) => hover(pick(p)), down: (p) => { const i = pick(p); if (i >= 0) strike(keys[i].ch); }, leave: () => hover(-1),
  }));
  bag.on(stage.ownerDocument, "keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, ch = e.key.toUpperCase();
    // leave text fields alone, and let a focused control keep its own Space and Enter
    if (t.isContentEditable || t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && t.type !== "range")) return;
    if ((t.tagName === "BUTTON" || t.tagName === "INPUT") && (e.key === " " || e.key === "Enter")) return;
    if (e.key === "Enter") newline(performance.now());
    else if (e.key === "Backspace") back();
    else if (ch === " " || FONT[ch]) { if (!e.repeat) strike(ch, true); }
    else return;
    e.preventDefault();
  });
  const release = (k) => { if (k && k.sp.t) { k.sp.t = 0; B.wake(); } };
  bag.on(stage.ownerDocument, "keyup", (e) => release(keyOf(e.key.toUpperCase())));
  bag.on(stage.ownerDocument.defaultView, "blur", () => keys.forEach(release));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { N = Math.round(v); if (col >= N) newline(performance.now()); },
    destroy: bag.dispose,
  };
}

export const typewriter = {
  name: "typewriter",
  means: "Type, or tap a key: the carriage steps along under a still sheet, and a full row feeds the paper up and starts again.",
  range: [6, 10, 12],
  mount,
};
