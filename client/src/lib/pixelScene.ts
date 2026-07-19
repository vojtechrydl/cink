// Pixel "Pokédex" scene: a full-bleed, low-contrast Plzeň city texture with
// the user's caught trams roaming the whole screen. Day or night follows the
// local clock. Rendering is portable (browser canvas or node via an injected
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

// ---- scene (full-bleed Plzeň texture, fixed 1000x600 world; component cover-scales it) ----
export const WORLD_W = 1000;
export const WORLD_H = 600;

export type SceneMode = "day" | "night";
export function sceneMode(date = new Date()): SceneMode {
  const h = date.getHours();
  return h >= 7 && h < 20 ? "day" : "night";
}
export function sceneBg(mode: SceneMode) {
  return mode === "day" ? "#e9ebf1" : "#232b43";
}

interface Palette {
  bg: string; ink: string; win: string; winA: number;
  green: string; red: string; redD: string; cream: string; creamD: string; gold: string;
  stone: string; roof: string; hole: string; night: boolean;
}
function makePalette(mode: SceneMode): Palette {
  const night = mode === "night";
  const bg = sceneBg(mode), ink = night ? "#e8ebf5" : "#1a2032";
  const col = (hex: string, towardBg: number) => rgbCss(mix(hex, bg, towardBg));
  return night
    ? { bg, ink, win: "#f4d488", winA: 0.4,
        green: col("#3f9b83", 0.5), red: col("#a85a49", 0.45), redD: col("#8a4a44", 0.45),
        cream: col("#c2b390", 0.45), creamD: col("#a2916e", 0.45), gold: "#c9a75a",
        stone: col(ink, 0.82), roof: col(ink, 0.76), hole: col("#000000", 0.7), night }
    : { bg, ink, win: col(ink, 0.42), winA: 0.3,
        green: col("#3f9b83", 0.6), red: col("#a85a49", 0.56), redD: col("#8a4a44", 0.56),
        cream: col("#b3a37e", 0.52), creamD: col("#99855c", 0.52), gold: col("#b58a2a", 0.42),
        stone: col(ink, 0.8), roof: col(ink, 0.72), hole: col(ink, 0.64), night };
}

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

// A handful of scattered houses — the backdrop stays mostly flat colour.
interface Bldg { x: number; base: number; w: number; h: number; }
const BUILDINGS: Bldg[] = [
  { x: 60, base: 210, w: 40, h: 64 },
  { x: 320, base: 120, w: 36, h: 56 },
  { x: 470, base: 250, w: 44, h: 70 },
  { x: 760, base: 120, w: 38, h: 58 },
  { x: 930, base: 240, w: 40, h: 66 },
  { x: 180, base: 430, w: 36, h: 60 },
  { x: 560, base: 470, w: 44, h: 72 },
  { x: 300, base: 560, w: 40, h: 62 },
  { x: 700, base: 580, w: 38, h: 56 },
  { x: 900, base: 545, w: 44, h: 68 },
];
function drawBuildings(ctx: CanvasRenderingContext2D, p: Palette) {
  const tone = rgbCss(mix(p.ink, p.bg, 0.9));
  for (const b of BUILDINGS) {
    rect(ctx, b.x, b.base - b.h, b.w, b.h, tone);
    tri(ctx, b.x - 1, b.base - b.h, b.x + b.w / 2, b.base - b.h - 10, b.x + b.w + 1, b.base - b.h, tone);
    windows(ctx, b.x + 5, b.base - b.h + 8, b.x + b.w - 3, b.base - 6, 9, 13, p.win, p.winA);
  }
}

function lmRadnice(ctx: CanvasRenderingContext2D, cx: number, base: number, p: Palette) {
  const w = 60, x = cx - w / 2, top = base - 124;
  rect(ctx, x, top, w, base - top, p.stone);
  rect(ctx, x, top, w, 22, p.roof);
  [x + 9, x + w - 9].forEach((gx) => { rect(ctx, gx - 7, top - 6, 14, 6, p.roof); rect(ctx, gx - 1, top - 14, 2, 8, p.gold); rect(ctx, gx - 3, top - 14, 6, 2, p.gold); });
  rect(ctx, cx - 6, top - 12, 12, 12, p.stone);
  onion(ctx, cx, top - 12, 15, 14, p.green, null);
  rect(ctx, cx - 1, top - 32, 2, 6, p.green);
  ctx.fillStyle = p.win; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(cx, top + 10, 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  windows(ctx, x + 6, top + 26, x + w - 4, base - 6, 11, 14, p.win, p.winA);
}
function lmSynagoga(ctx: CanvasRenderingContext2D, cx: number, base: number, p: Palette) {
  const gap = 58, t1 = cx - gap / 2, t2 = cx + gap / 2, tw = 24, tTop = base - 98, bTop = base - 62;
  const bw = gap + tw, bx = cx - bw / 2;
  rect(ctx, bx, bTop, bw, base - bTop, p.red);
  tri(ctx, bx, bTop, cx, bTop - 22, bx + bw, bTop, p.red);
  starD(ctx, cx, bTop - 9, 4, p.gold);
  for (let a = 0; a < 3; a++) { const wx = bx + 10 + a * ((bw - 16) / 3); ctx.fillStyle = p.hole; ctx.beginPath(); ctx.moveTo(wx, base); ctx.lineTo(wx, bTop + 16); ctx.arc(wx + 6, bTop + 16, 6, Math.PI, 0, false); ctx.lineTo(wx + 12, base); ctx.closePath(); ctx.fill(); }
  [t1, t2].forEach((tc) => {
    rect(ctx, tc - tw / 2, tTop, tw, base - tTop, p.red);
    for (let by = tTop + 10; by < base; by += 13) rect(ctx, tc - tw / 2, by, tw, 2, p.cream);
    onion(ctx, tc, tTop, tw + 8, 24, p.redD, p.cream);
    rect(ctx, tc - 1, tTop - 35, 2, 11, p.gold); starD(ctx, tc, tTop - 39, 3, p.gold);
  });
}
function lmBartolomej(ctx: CanvasRenderingContext2D, cx: number, base: number, p: Palette) {
  const tw = 24, tx = cx - tw / 2, tTop = base - 100;
  const nx = cx + tw / 2 - 2, nw = 116, nTop = base - 70;
  rect(ctx, nx, nTop + 14, nw, base - (nTop + 14), p.stone);
  rect(ctx, nx, nTop + 6, nw, 10, p.roof);
  ctx.fillStyle = p.win; ctx.globalAlpha = p.winA;
  for (let gwx = nx + 10; gwx < nx + nw - 6; gwx += 16) ctx.fillRect(gwx, nTop + 22, 3, base - nTop - 30);
  ctx.globalAlpha = 1;
  rect(ctx, nx + nw * 0.5, nTop - 4, 3, 12, p.stone); tri(ctx, nx + nw * 0.5 - 3, nTop - 4, nx + nw * 0.5 + 1.5, nTop - 14, nx + nw * 0.5 + 6, nTop - 4, p.green);
  rect(ctx, tx, tTop, tw, base - tTop, p.stone);
  ctx.fillStyle = p.win; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(cx, tTop + 24, 4, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  windows(ctx, tx + 4, tTop + 40, tx + tw - 3, base - 14, 8, 16, p.win, p.winA);
  tri(ctx, tx + 1, tTop, cx, base - 192, tx + tw - 1, tTop, p.green);
  rect(ctx, cx - 1, base - 200, 2, 9, p.green);
}
function lmPrazdroj(ctx: CanvasRenderingContext2D, cx: number, base: number, p: Palette) {
  const w = 94, x = cx - w / 2, top = base - 56;
  rect(ctx, x, top, w, base - top, p.cream);
  [cx - 22, cx + 22].forEach((axx) => { ctx.fillStyle = p.hole; ctx.beginPath(); ctx.moveTo(axx - 13, base); ctx.lineTo(axx - 13, top + 18); ctx.arc(axx, top + 18, 13, Math.PI, 0, false); ctx.lineTo(axx + 13, base); ctx.closePath(); ctx.fill(); });
  rect(ctx, x, top, w, 7, p.creamD);
  rect(ctx, cx - 13, top - 20, 26, 22, p.cream); tri(ctx, cx - 13, top - 20, cx, top - 33, cx + 13, top - 20, p.cream);
  rect(ctx, cx - 1, top - 41, 2, 8, p.gold);
}
function lmWaterTower(ctx: CanvasRenderingContext2D, cx: number, base: number, p: Palette) {
  rect(ctx, cx + 15, base - 118, 8, 118, p.stone);
  rect(ctx, cx + 15, base - 104, 8, 3, p.creamD); rect(ctx, cx + 15, base - 66, 8, 3, p.creamD);
  const tw = 22; rect(ctx, cx - tw / 2, base - 76, tw, 76, p.stone);
  for (let by = base - 64; by < base; by += 16) rect(ctx, cx - tw / 2, by, tw, 2, p.cream);
  tri(ctx, cx - tw / 2 - 3, base - 76, cx, base - 96, cx + tw / 2 + 3, base - 76, p.roof);
  rect(ctx, cx - 1, base - 102, 2, 6, p.stone);
}

export function drawBackdrop(ctx: CanvasRenderingContext2D, mode: SceneMode = sceneMode()) {
  const p = makePalette(mode);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  drawBuildings(ctx, p);
  // Landmarks scattered across the canvas, sitting inside the texture.
  lmSynagoga(ctx, 200, 150, p);
  lmBartolomej(ctx, 640, 214, p);
  lmRadnice(ctx, 420, 356, p);
  lmPrazdroj(ctx, 850, 400, p);
  lmWaterTower(ctx, 120, 520, p);
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
function sparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, phase: number, color: string) {
  const a = 0.35 + 0.65 * Math.abs(Math.sin(phase)), s = 1 + Math.abs(Math.sin(phase)) * 1.6;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(cx - s, cy, s * 2, 1.4); ctx.fillRect(cx, cy - s, 1.4, s * 2); ctx.restore();
}
export function drawEntities(ctx: CanvasRenderingContext2D, ents: Entity[], cache: SpriteCache, timeMs: number, shiny = true, sparkleColor = "#fff7d6") {
  ctx.imageSmoothingEnabled = false;
  ents.forEach((e, i) => {
    const sprite = cache.get(e.type, e.colorBase), sc = e.scale, flip = e.vx < 0;
    const w = sprite.width * sc, hh = sprite.height * sc, dx = Math.round(e.x), dy = Math.round(e.y);
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(dx + w / 2, dy + hh - 1, w * 0.42, 3.5, 0, 0, 7); ctx.fill(); ctx.restore();
    if (flip) { ctx.save(); ctx.translate(dx + w, dy); ctx.scale(-1, 1); ctx.drawImage(sprite, 0, 0, w, hh); ctx.restore(); }
    else ctx.drawImage(sprite, dx, dy, w, hh);
    if (shiny && e.colorBase !== "žlutošedá") { const ph = timeMs / 380 + i * 1.3; sparkle(ctx, e.x + w * (flip ? 0.2 : 0.8), e.y + 3, ph, sparkleColor); sparkle(ctx, e.x + w * 0.5, e.y - 1, ph + 1.7, sparkleColor); }
  });
}
