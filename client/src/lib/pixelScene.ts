// Pixel "Pokédex" scene: side-view Plzeň at dusk with the user's caught trams
// roaming freely. Rendering is portable (browser canvas or node via an injected
// canvas factory) so it can be verified headless.

export interface Livery {
  c1: string;
  c2: string;
}

// Mirrors client/src/lib/colorGroup.ts
export const GRADIENTS: Record<string, Livery> = {
  žlutošedá: { c1: "#ECC94B", c2: "#9CA3AF" },
  modrá: { c1: "#2563EB", c2: "#93C5FD" },
  červená: { c1: "#DC4C3F", c2: "#E88B84" },
  zelená: { c1: "#15803D", c2: "#6EE7B7" },
  bílá: { c1: "#E2E8F0", c2: "#F59E0B" },
  černá: { c1: "#1C1917", c2: "#57534E" },
  růžová: { c1: "#EC4899", c2: "#F9A8D4" },
  oranžová: { c1: "#EA580C", c2: "#FDBA74" },
  barevná: { c1: "#8B5CF6", c2: "#F59E0B" },
  speciální: { c1: "#06B6D4", c2: "#A78BFA" },
};
export function liveryFor(colorBase: string): Livery {
  return GRADIENTS[colorBase] || { c1: "#9CA3AF", c2: "#D1D5DB" };
}

interface TramConfig {
  id: string;
  bays: number;
  nose: string;
  floor: string;
  band: string;
  artics: number[];
  pods: number;
}

// Keyed by the exact DB `type` string.
const CONFIGS: Record<string, TramConfig> = {
  "T3R.PLF": { id: "t3", bays: 3, nose: "retro", floor: "high", band: "grey", artics: [], pods: 1 },
  "KT8D5-RN2P": { id: "kt8", bays: 6, nose: "flat", floor: "high", band: "grey", artics: [0.34, 0.66], pods: 2 },
  "VARIO LFR.S": { id: "lfrs", bays: 4, nose: "raked", floor: "low", band: "white", artics: [0.52], pods: 1 },
  "VARIO LF plus": { id: "lfp", bays: 4, nose: "boxy", floor: "mid", band: "grey", artics: [], pods: 1 },
  "VARIO LF 2/2 IN": { id: "lf22", bays: 5, nose: "roundModern", floor: "low", band: "white", artics: [0.5], pods: 1 },
  EVO2: { id: "evo2", bays: 5, nose: "roundModern", floor: "low", band: "whiteTop", artics: [0.5], pods: 1 },
  "40T (ForCity Smart)": { id: "40t", bays: 7, nose: "sleek", floor: "low", band: "white", artics: [0.28, 0.72], pods: 2 },
};
const FALLBACK: TramConfig = CONFIGS["VARIO LFR.S"];
export function configForType(type: string): TramConfig {
  return CONFIGS[type] || FALLBACK;
}

// ---- colour utils ----
type RGB = [number, number, number];
function hexToRgb(h: string): RGB {
  h = h.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function clamp(v: number) { return v < 0 ? 0 : v > 255 ? 255 : v | 0; }
function mix(hex: string, target: string, amt: number): RGB {
  const a = hexToRgb(hex), b = hexToRgb(target);
  return [clamp(a[0] + (b[0] - a[0]) * amt), clamp(a[1] + (b[1] - a[1]) * amt), clamp(a[2] + (b[2] - a[2]) * amt)];
}
const shade = (h: string, a: number) => mix(h, "#000000", a);
const tint = (h: string, a: number) => mix(h, "#ffffff", a);
function luma(hex: string) { const r = hexToRgb(hex); return (0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]) / 255; }
function rgbCss(a: RGB) { return `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`; }

// ---- sprite geometry (side view, faces right) ----
const R = { EMPTY: 0, BODY: 1, BODYD: 2, BODYH: 3, GLASS: 4, GLASSH: 5, STEEL: 6, WHITE: 7, BLACK: 8, HUB: 9, LIGHT: 10, PANTO: 11, JOINT: 12, RIM: 13 } as const;
const SPRITE_H = 16;

function colorFor(role: number, liv: Livery, darkBody: boolean): RGB | null {
  switch (role) {
    case R.BODY: return hexToRgb(liv.c1);
    case R.BODYD: return shade(liv.c1, 0.24);
    case R.BODYH: return tint(liv.c1, 0.22);
    case R.GLASS: return hexToRgb("#16273f");
    case R.GLASSH: return hexToRgb("#3f5f8c");
    case R.STEEL: return hexToRgb(liv.c2);
    case R.WHITE: return hexToRgb("#eef2f7");
    case R.BLACK: return hexToRgb("#0c0f16");
    case R.HUB: return hexToRgb("#3b4256");
    case R.LIGHT: return hexToRgb("#fff2b8");
    case R.PANTO: return mix(liv.c2, "#000000", 0.35);
    case R.JOINT: return hexToRgb("#10151f");
    case R.RIM: return darkBody ? tint(liv.c1, 0.35) : shade(liv.c1, 0.5);
  }
  return null;
}

function noseLen(n: string) { return n === "flat" || n === "boxy" ? 3 : n === "raked" || n === "retro" ? 4 : n === "roundModern" ? 5 : n === "sleek" ? 6 : 4; }
function frontTopR(n: string) { return n === "flat" ? 1 : n === "boxy" ? 2 : n === "raked" ? 4 : n === "retro" ? 3 : n === "roundModern" ? 5 : n === "sleek" ? 6 : 2; }
function frontBotR(n: string) { return n === "retro" ? 3 : n === "roundModern" ? 3 : n === "sleek" ? 4 : n === "boxy" ? 1 : 1; }

function insideRR(x: number, y: number, x0: number, y0: number, x1: number, y1: number, rTL: number, rTR: number, rBL: number, rBR: number) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  if (rTL > 0 && x < x0 + rTL && y < y0 + rTL) { const dx = x0 + rTL - x, dy = y0 + rTL - y; return dx * dx + dy * dy <= rTL * rTL + rTL; }
  if (rTR > 0 && x > x1 - rTR && y < y0 + rTR) { const dx = x - (x1 - rTR), dy = y0 + rTR - y; return dx * dx + dy * dy <= rTR * rTR + rTR; }
  if (rBL > 0 && x < x0 + rBL && y > y1 - rBL) { const dx = x0 + rBL - x, dy = y - (y1 - rBL); return dx * dx + dy * dy <= rBL * rBL + rBL; }
  if (rBR > 0 && x > x1 - rBR && y > y1 - rBR) { const dx = x - (x1 - rBR), dy = y - (y1 - rBR); return dx * dx + dy * dy <= rBR * rBR + rBR; }
  return true;
}

interface Geo { w: number; h: number; grid: Uint8Array; }
const geoCache: Record<string, Geo> = {};
function buildGeometry(cfg: TramConfig): Geo {
  const nL = noseLen(cfg.nose), rearCap = 4, bayW = 5;
  const W = rearCap + cfg.bays * bayW + nL, H = SPRITE_H;
  const grid = new Uint8Array(W * H);
  const set = (x: number, y: number, v: number) => { if (x >= 0 && x < W && y >= 0 && y < H) grid[y * W + x] = v; };
  const get = (x: number, y: number) => (x < 0 || x >= W || y < 0 || y >= H ? 0 : grid[y * W + x]);

  const bodyTop = 2, bodyBot = cfg.floor === "high" ? 11 : 12;
  const retro = cfg.nose === "retro";
  const winTop = retro ? 4 : 5, winBot = 8, beltY = winBot + 1;
  const rTR = frontTopR(cfg.nose), rBR = frontBotR(cfg.nose);

  for (let y = bodyTop; y <= bodyBot; y++) for (let x = 0; x < W; x++) {
    if (!insideRR(x, y, 0, bodyTop, W - 1, bodyBot, 2, rTR, 1, rBR)) continue;
    set(x, y, y <= bodyTop + 1 ? R.STEEL : R.BODY);
  }
  const winL = rearCap, winR = W - 1 - nL;
  for (let yy = winTop; yy <= winBot; yy++) for (let xx = winL; xx <= winR; xx++) {
    if (!insideRR(xx, yy, 0, bodyTop, W - 1, bodyBot, 2, rTR, 1, rBR)) continue;
    set(xx, yy, (xx - winL) % bayW === 0 ? R.BODY : (yy === winTop ? R.GLASSH : R.GLASS));
  }
  for (let yw = winTop; yw <= winBot; yw++) for (let xw = winR; xw < W; xw++) {
    if (!insideRR(xw, yw, 0, bodyTop, W - 1, bodyBot, 2, rTR, 1, rBR)) continue;
    if (get(xw, yw) === R.STEEL) continue;
    set(xw, yw, yw === winTop ? R.GLASSH : R.GLASS);
  }
  for (let xb = 1; xb < W - 1; xb++) if (get(xb, beltY) === R.BODY) set(xb, beltY, cfg.band === "white" ? R.WHITE : R.BODYD);
  if (cfg.band === "whiteTop") for (let xt = 1; xt < W - 1; xt++) if (get(xt, bodyTop + 2) === R.BODY) set(xt, bodyTop + 2, R.WHITE);
  const doorXs = [winL + 2, Math.floor((winL + winR) / 2), winR - 2];
  for (const dx0 of doorXs) for (let dy = winBot + 1; dy <= bodyBot - 1; dy++) if (get(dx0, dy) === R.BODY) set(dx0, dy, R.BODYD);
  for (let xs = 0; xs < W; xs++) if (get(xs, bodyBot) !== 0) set(xs, bodyBot, R.BLACK);
  set(W - 2, bodyBot - 1, R.LIGHT); if (get(W - 3, bodyBot - 1) !== 0) set(W - 3, bodyBot - 1, R.LIGHT);
  for (const frac of cfg.artics) { const ax = Math.round(frac * W); for (let ay = bodyTop + 2; ay <= bodyBot - 1; ay++) if (get(ax, ay) !== 0 && get(ax, ay) !== R.GLASSH) set(ax, ay, R.JOINT); }
  const podXs = cfg.pods >= 2 ? [Math.round(W * 0.3), Math.round(W * 0.62)] : [Math.round(W * 0.4)];
  for (const px of podXs) { set(px, bodyTop, R.BODYD); set(px + 1, bodyTop, R.BODYD); }
  const pcx = Math.round(W * 0.5);
  set(pcx, 1, R.PANTO); set(pcx + 1, 0, R.PANTO); set(pcx - 1, 0, R.PANTO); set(pcx, 0, R.PANTO); set(pcx + 1, 1, R.PANTO); set(pcx - 1, 1, R.PANTO);
  const big = cfg.floor === "high";
  const centers = cfg.bays >= 6 ? [0.2, 0.5, 0.82] : [0.24, 0.78];
  for (const cf of centers) {
    const cxw = Math.round(cf * W), pair = big ? [cxw - 2, cxw + 2] : [cxw - 1, cxw + 1], rad = big ? 2 : 1;
    for (const wxc of pair) {
      for (let oy = 0; oy <= rad + 1; oy++) for (let ox = -rad; ox <= rad; ox++) {
        if (oy <= rad && ox * ox + oy * oy <= rad * rad + rad) set(wxc + ox, bodyBot + oy, R.BLACK);
      }
      set(wxc, bodyBot + (big ? 1 : 0), R.HUB);
    }
  }
  const rim = new Uint8Array(W * H);
  for (let ry = 0; ry < H; ry++) for (let rx = 0; rx < W; rx++) {
    const v = get(rx, ry); if (v === 0) continue;
    if ((get(rx - 1, ry) === 0 || get(rx + 1, ry) === 0 || get(rx, ry - 1) === 0) && (v === R.BODY || v === R.STEEL || v === R.WHITE)) rim[ry * W + rx] = 1;
  }
  for (let i = 0; i < W * H; i++) if (rim[i]) grid[i] = R.RIM;
  return { w: W, h: H, grid };
}
function getGeo(cfg: TramConfig) { return (geoCache[cfg.id] ||= buildGeometry(cfg)); }

// ---- sprite rendering + cache ----
export type MkCanvas = (w: number, h: number) => any; // HTMLCanvasElement | OffscreenCanvas | node Canvas

export class SpriteCache {
  private cache: Record<string, any> = {};
  private mk: MkCanvas;
  constructor(mk: MkCanvas) {
    this.mk = mk;
  }
  get(type: string, colorBase: string) {
    const key = type + "|" + colorBase;
    if (this.cache[key]) return this.cache[key];
    const cfg = configForType(type), liv = liveryFor(colorBase), geo = getGeo(cfg);
    const darkBody = luma(liv.c1) < 0.28;
    const cvs = this.mk(geo.w, geo.h);
    const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
    const img = ctx.createImageData(geo.w, geo.h);
    for (let i = 0; i < geo.grid.length; i++) {
      const role = geo.grid[i]; if (role === 0) continue;
      const c = colorFor(role, liv, darkBody)!; const o = i * 4;
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return (this.cache[key] = cvs);
  }
  geoWidth(type: string) { return getGeo(configForType(type)).w; }
}

// ---- scene (dusk Plzeň, fixed 1000x600 world; component cover-scales it) ----
export const WORLD_W = 1000;
export const WORLD_H = 600;
const BASE = 430; // ground line for landmarks
const PAL = { bg: "#0e1220", bg2: "#141a2b", ink: "#e8ebf5", star: "#3a4568" };

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function tri(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, cx: number, cy: number, c: string) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill(); }
function windows(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, sx: number, sy: number, win: string, a: number) {
  ctx.fillStyle = win; ctx.globalAlpha = a;
  for (let wy = y0; wy < y1; wy += sy) for (let wx = x0; wx < x1; wx += sx) ctx.fillRect(wx, wy, 2, 3);
  ctx.globalAlpha = 1;
}
function onion(ctx: CanvasRenderingContext2D, cx: number, yBase: number, wmax: number, h: number, fill: string, band: string | null) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(cx - wmax * 0.5, yBase);
  ctx.bezierCurveTo(cx - wmax * 0.72, yBase - h * 0.5, cx - wmax * 0.16, yBase - h * 0.72, cx, yBase - h);
  ctx.bezierCurveTo(cx + wmax * 0.16, yBase - h * 0.72, cx + wmax * 0.72, yBase - h * 0.5, cx + wmax * 0.5, yBase);
  ctx.closePath(); ctx.fill();
  if (band) { ctx.fillStyle = band; ctx.fillRect(cx - wmax * 0.5, yBase - 2, wmax, 2); }
}
function starD(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string) { tri(ctx, cx - r, cy + r * 0.55, cx + r, cy + r * 0.55, cx, cy - r, c); tri(ctx, cx - r, cy - r * 0.55, cx + r, cy - r * 0.55, cx, cy + r, c); }

function farRow(ctx: CanvasRenderingContext2D, base: number, tone: string) {
  for (let x = -10; x < WORLD_W + 10; x += 42) { const h = 26 + ((x * 11) % 32); rect(ctx, x, base - h, 40, h, tone); tri(ctx, x, base - h, x + 20, base - h - 8, x + 40, base - h, tone); }
}
function cityRow(ctx: CanvasRenderingContext2D, base: number, step: number, minH: number, varH: number, gable: number, tone: string, win: string, wa: number) {
  for (let x = -8; x < WORLD_W + 8; x += step) {
    const h = minH + ((x * 13) % varH), w = step - 4;
    rect(ctx, x, base - h, w, h, tone);
    tri(ctx, x - 1, base - h, x + w / 2, base - h - gable, x + w + 1, base - h, tone);
    windows(ctx, x + 5, base - h + 9, x + w - 3, base - 8, 9, 13, win, wa);
  }
}

function lmRadnice(ctx: CanvasRenderingContext2D, cx: number, stone: string, roof: string, green: string, gold: string, win: string, wa: number) {
  const w = 60, x = cx - w / 2, top = BASE - 124;
  rect(ctx, x, top, w, BASE - top, stone);
  rect(ctx, x, top, w, 22, roof);
  [x + 9, x + w - 9].forEach((gx) => { rect(ctx, gx - 7, top - 6, 14, 6, roof); rect(ctx, gx - 1, top - 14, 2, 8, gold); rect(ctx, gx - 3, top - 14, 6, 2, gold); });
  rect(ctx, cx - 6, top - 12, 12, 12, stone);
  onion(ctx, cx, top - 12, 15, 14, green, null);
  rect(ctx, cx - 1, top - 32, 2, 6, green);
  ctx.fillStyle = win; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(cx, top + 10, 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  windows(ctx, x + 6, top + 26, x + w - 4, BASE - 6, 11, 14, win, wa);
}
function lmSynagoga(ctx: CanvasRenderingContext2D, cx: number, red: string, redD: string, cream: string, gold: string, hole: string) {
  const gap = 58, t1 = cx - gap / 2, t2 = cx + gap / 2, tw = 24, tTop = BASE - 98, bTop = BASE - 62;
  const bw = gap + tw, bx = cx - bw / 2;
  rect(ctx, bx, bTop, bw, BASE - bTop, red);
  tri(ctx, bx, bTop, cx, bTop - 22, bx + bw, bTop, red);
  starD(ctx, cx, bTop - 9, 4, gold);
  for (let a = 0; a < 3; a++) { const wx = bx + 10 + a * ((bw - 16) / 3); ctx.fillStyle = hole; ctx.beginPath(); ctx.moveTo(wx, BASE); ctx.lineTo(wx, bTop + 16); ctx.arc(wx + 6, bTop + 16, 6, Math.PI, 0, false); ctx.lineTo(wx + 12, BASE); ctx.closePath(); ctx.fill(); }
  [t1, t2].forEach((tc) => {
    rect(ctx, tc - tw / 2, tTop, tw, BASE - tTop, red);
    for (let by = tTop + 10; by < BASE; by += 13) rect(ctx, tc - tw / 2, by, tw, 2, cream);
    onion(ctx, tc, tTop, tw + 8, 24, redD, cream);
    rect(ctx, tc - 1, tTop - 35, 2, 11, gold); starD(ctx, tc, tTop - 39, 3, gold);
  });
}
function lmBartolomej(ctx: CanvasRenderingContext2D, cx: number, stone: string, green: string, roof: string, win: string, wa: number) {
  const tw = 24, tx = cx - tw / 2, tTop = BASE - 100;
  const nx = cx + tw / 2 - 2, nw = 116, nTop = BASE - 70;
  rect(ctx, nx, nTop + 14, nw, BASE - (nTop + 14), stone);
  rect(ctx, nx, nTop + 6, nw, 10, roof);
  ctx.fillStyle = win; ctx.globalAlpha = wa;
  for (let gwx = nx + 10; gwx < nx + nw - 6; gwx += 16) ctx.fillRect(gwx, nTop + 22, 3, BASE - nTop - 30);
  ctx.globalAlpha = 1;
  rect(ctx, nx + nw * 0.5, nTop - 4, 3, 12, stone); tri(ctx, nx + nw * 0.5 - 3, nTop - 4, nx + nw * 0.5 + 1.5, nTop - 14, nx + nw * 0.5 + 6, nTop - 4, green);
  rect(ctx, tx, tTop, tw, BASE - tTop, stone);
  ctx.fillStyle = win; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(cx, tTop + 24, 4, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  windows(ctx, tx + 4, tTop + 40, tx + tw - 3, BASE - 14, 8, 16, win, wa);
  tri(ctx, tx + 1, tTop, cx, BASE - 192, tx + tw - 1, tTop, green);
  rect(ctx, cx - 1, BASE - 200, 2, 9, green);
}
function lmPrazdroj(ctx: CanvasRenderingContext2D, cx: number, cream: string, creamD: string, hole: string, gold: string) {
  const w = 94, x = cx - w / 2, top = BASE - 56;
  rect(ctx, x, top, w, BASE - top, cream);
  [cx - 22, cx + 22].forEach((axx) => { ctx.fillStyle = hole; ctx.beginPath(); ctx.moveTo(axx - 13, BASE); ctx.lineTo(axx - 13, top + 18); ctx.arc(axx, top + 18, 13, Math.PI, 0, false); ctx.lineTo(axx + 13, BASE); ctx.closePath(); ctx.fill(); });
  rect(ctx, x, top, w, 7, creamD);
  rect(ctx, cx - 13, top - 20, 26, 22, cream); tri(ctx, cx - 13, top - 20, cx, top - 33, cx + 13, top - 20, cream);
  rect(ctx, cx - 1, top - 41, 2, 8, gold);
}
function lmWaterTower(ctx: CanvasRenderingContext2D, cx: number, stone: string, cream: string, roof: string, band: string) {
  rect(ctx, cx + 15, BASE - 118, 8, 118, stone);
  rect(ctx, cx + 15, BASE - 104, 8, 3, band); rect(ctx, cx + 15, BASE - 66, 8, 3, band);
  const tw = 22; rect(ctx, cx - tw / 2, BASE - 76, tw, 76, stone);
  for (let by = BASE - 64; by < BASE; by += 16) rect(ctx, cx - tw / 2, by, tw, 2, cream);
  tri(ctx, cx - tw / 2 - 3, BASE - 76, cx, BASE - 96, cx + tw / 2 + 3, BASE - 76, roof);
  rect(ctx, cx - 1, BASE - 102, 2, 6, stone);
}

let starField: number[][] | null = null;
function stars() {
  if (!starField) { starField = []; for (let i = 0; i < 60; i++) starField.push([Math.random() * WORLD_W, Math.random() * (BASE - 260), Math.random() * 1.5 + 0.4]); }
  return starField;
}

export function drawBackdrop(ctx: CanvasRenderingContext2D) {
  const gen = (a: number) => rgbCss(mix(PAL.bg2, PAL.ink, a));
  const col = (hex: string, a: number) => rgbCss(mix(hex, PAL.bg, a));
  const win = "#f4d488", wa = 0.55;
  const green = col("#3f9b83", 0.58), red = col("#a85a49", 0.56), redD = col("#8a4a44", 0.56),
    cream = col("#c2b390", 0.55), creamD = col("#a2916e", 0.56), gold = "#c9a75a",
    stone = gen(0.19), roof = rgbCss(mix(PAL.bg, PAL.ink, 0.24)), hole = rgbCss(mix(PAL.bg, "#000000", 0.30));

  const g = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  g.addColorStop(0, PAL.bg); g.addColorStop(0.4, rgbCss(mix(PAL.bg, PAL.ink, 0.05))); g.addColorStop(1, gen(0.05));
  ctx.fillStyle = g; ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.fillStyle = PAL.star;
  for (const s of stars()) { ctx.globalAlpha = 0.4 + 0.4 * (s[2] / 2); ctx.fillRect(s[0], s[1], s[2], s[2]); }
  ctx.globalAlpha = 1;

  const hy = BASE - 330;
  ctx.fillStyle = gen(0.03); ctx.beginPath(); ctx.moveTo(0, hy);
  ctx.quadraticCurveTo(170, hy - 24, 330, hy - 6); ctx.quadraticCurveTo(520, hy - 32, 720, hy - 8); ctx.quadraticCurveTo(880, hy - 24, 1000, hy - 6);
  ctx.lineTo(1000, hy + 70); ctx.lineTo(0, hy + 70); ctx.closePath(); ctx.fill();

  farRow(ctx, BASE - 130, gen(0.06));
  rect(ctx, 0, BASE - 2, WORLD_W, WORLD_H - BASE + 2, gen(0.16));
  cityRow(ctx, BASE, 34, 52, 40, 11, gen(0.12), win, wa);

  lmRadnice(ctx, 150, stone, roof, green, gold, win, wa);
  lmSynagoga(ctx, 348, red, redD, cream, gold, hole);
  lmBartolomej(ctx, 548, stone, green, roof, win, wa);
  lmPrazdroj(ctx, 768, cream, creamD, hole, gold);
  lmWaterTower(ctx, 902, stone, cream, roof, gen(0.05));

  cityRow(ctx, BASE + 88, 40, 60, 46, 13, gen(0.15), win, wa);
  cityRow(ctx, WORLD_H + 6, 44, 78, 52, 15, gen(0.20), win, wa);

  const vg = ctx.createRadialGradient(500, 300, 220, 500, 300, 720);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, WORLD_W, WORLD_H);
}

// ---- entities ----
export interface CaughtTram { type: string; colorBase: string; }
export interface Entity { type: string; colorBase: string; scale: number; x: number; y: number; vx: number; vy: number; turn: number; tacc: number; }

const SCALES = [1.9, 2.5, 3.2];
export function makeEntities(caught: CaughtTram[]): Entity[] {
  const ents = caught.map((c, i) => {
    const sc = SCALES[i % SCALES.length];
    const dir = Math.random() < 0.5 ? -1 : 1, sp = 16 + Math.random() * 22, hh = SPRITE_H * sc;
    return { type: c.type, colorBase: c.colorBase, scale: sc,
      x: Math.random() * WORLD_W, y: 8 + Math.random() * (WORLD_H - hh - 16),
      vx: dir * sp, vy: (Math.random() - 0.5) * sp * 0.5, turn: 2 + Math.random() * 4, tacc: 0 };
  });
  ents.sort((a, b) => a.scale - b.scale);
  return ents;
}
export function stepEntities(ents: Entity[], dt: number, cache: SpriteCache) {
  for (const e of ents) {
    e.tacc += dt;
    if (e.tacc > e.turn) { e.tacc = 0; e.turn = 3 + Math.random() * 4; e.vy = (Math.random() - 0.5) * Math.abs(e.vx) * 0.8; if (Math.random() < 0.22) e.vx = -e.vx; }
    e.x += e.vx * dt; e.y += e.vy * dt;
    const w = cache.geoWidth(e.type) * e.scale, hh = SPRITE_H * e.scale;
    if (e.x > WORLD_W + 16) e.x = -w - 16; if (e.x < -w - 16) e.x = WORLD_W + 16;
    if (e.y < 4) { e.y = 4; e.vy = Math.abs(e.vy); } if (e.y > WORLD_H - hh - 4) { e.y = WORLD_H - hh - 4; e.vy = -Math.abs(e.vy); }
  }
}
function sparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, phase: number) {
  const a = 0.35 + 0.65 * Math.abs(Math.sin(phase)), s = 1 + Math.abs(Math.sin(phase)) * 1.6;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#fff7d6"; ctx.fillRect(cx - s, cy, s * 2, 1.4); ctx.fillRect(cx, cy - s, 1.4, s * 2); ctx.restore();
}
export function drawEntities(ctx: CanvasRenderingContext2D, ents: Entity[], cache: SpriteCache, timeMs: number, shiny = true) {
  ctx.imageSmoothingEnabled = false;
  ents.forEach((e, i) => {
    const sprite = cache.get(e.type, e.colorBase), sc = e.scale, flip = e.vx < 0;
    const w = sprite.width * sc, hh = sprite.height * sc, dx = Math.round(e.x), dy = Math.round(e.y);
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(dx + w / 2, dy + hh - 1, w * 0.42, 3.5, 0, 0, 7); ctx.fill(); ctx.restore();
    if (flip) { ctx.save(); ctx.translate(dx + w, dy); ctx.scale(-1, 1); ctx.drawImage(sprite, 0, 0, w, hh); ctx.restore(); }
    else ctx.drawImage(sprite, dx, dy, w, hh);
    if (shiny && e.colorBase !== "žlutošedá") { const ph = timeMs / 380 + i * 1.3; sparkle(ctx, e.x + w * (flip ? 0.2 : 0.8), e.y + 3, ph); sparkle(ctx, e.x + w * 0.5, e.y - 1, ph + 1.7); }
  });
}
