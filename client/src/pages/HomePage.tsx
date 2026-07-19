import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useTrams } from "../api/trams";
import { useSightings } from "../api/sightings";
import { useAuth } from "../context/AuthContext";
import {
  SpriteCache,
  drawBackdrop,
  drawEntities,
  makeEntities,
  sceneBg,
  sceneMode,
  stepEntities,
  WORLD_W,
  WORLD_H,
  type CaughtTram,
  type Entity,
  type SceneMode,
} from "../lib/pixelScene";

export function HomePage() {
  const { user } = useAuth();
  const { data: trams } = useTrams();
  const { data: sightings } = useSightings();
  const [mode, setMode] = useState<SceneMode>(() => sceneMode());
  const day = mode === "day";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cacheRef = useRef<SpriteCache | null>(null);
  const entsRef = useRef<Entity[]>([]);

  const caught = useMemo<CaughtTram[]>(() => {
    if (!trams || !sightings) return [];
    const byId = new Map(trams.map((t) => [t.id, t]));
    return sightings
      .map((s) => byId.get(s.tramId))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .map((t) => ({ type: t.type, colorBase: t.colorBase }));
  }, [trams, sightings]);

  const caughtCount = caught.length;
  const totalCount = trams?.length ?? 0;

  // Rebuild roaming trams whenever the caught set changes.
  useEffect(() => {
    entsRef.current = makeEntities(caught);
  }, [caught]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!cacheRef.current) {
      cacheRef.current = new SpriteCache((w: number, h: number) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        return c;
      });
    }
    const cache = cacheRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = 0;

    function resize() {
      const r = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.round(r.width * dpr));
      canvas!.height = Math.max(1, Math.round(r.height * dpr));
    }

    function render(t: number) {
      const cw = canvas!.width, ch = canvas!.height;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;

      const scale = Math.max(cw / WORLD_W, ch / WORLD_H);
      const ox = (cw - WORLD_W * scale) / 2, oy = (ch - WORLD_H * scale) / 2;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, cw, ch);
      ctx!.setTransform(scale, 0, 0, scale, ox, oy);

      drawBackdrop(ctx!, mode);
      if (!reduce) stepEntities(entsRef.current, dt, cache);
      drawEntities(ctx!, entsRef.current, cache, t, true, day ? "#d97706" : "#fff7d6");
    }

    function loop(t: number) {
      render(t);
      raf = requestAnimationFrame(loop);
    }

    resize();
    if (reduce) {
      render(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) render(0);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, day]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden h-[calc(100svh-110px)] md:h-[calc(100svh-50px)] min-h-[420px]"
      style={{ background: sceneBg(mode) }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* progress + greeting */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-4 flex items-start justify-between">
        <div>
          <p className={`text-[13px] font-medium ${day ? "text-secondary" : "text-white/60"}`}>
            {user?.name ? `Ahoj, ${user.name}` : "Vítej"}
          </p>
          <p className={`text-[19px] font-bold tracking-[-0.01em] ${day ? "text-heading" : "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"}`}>
            Tvoje sbírka jezdí Plzní
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`rounded-full backdrop-blur-sm px-3 py-1.5 text-[13px] font-semibold tabular-nums ${day ? "bg-white/70 text-heading" : "bg-black/35 text-white"}`}>
            <span className="text-brand">{caughtCount}</span>
            <span className={day ? "text-secondary" : "text-white/60"}> / {totalCount || 104}</span>
          </div>
          <button
            onClick={() => setMode(day ? "night" : "day")}
            title={day ? "Přepnout na noc" : "Přepnout na den"}
            className={`pointer-events-auto flex h-[32px] w-[32px] items-center justify-center rounded-full backdrop-blur-sm transition-colors ${day ? "bg-white/70 text-secondary hover:text-heading" : "bg-black/35 text-white/70 hover:text-white"}`}
          >
            {day ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
                <line x1="4.9" y1="4.9" x2="7" y2="7" />
                <line x1="17" y1="17" x2="19.1" y2="19.1" />
                <line x1="4.9" y1="19.1" x2="7" y2="17" />
                <line x1="17" y1="7" x2="19.1" y2="4.9" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* empty state */}
      {trams && sightings && caughtCount === 0 && (
        <div className="absolute inset-x-0 bottom-0 p-5 flex justify-center">
          <Link
            to="/katalog"
            className="pointer-events-auto rounded-[14px] bg-brand px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_-8px_var(--color-brand-shadow)] active:scale-95 transition-transform"
          >
            Chyť první tramvaj →
          </Link>
        </div>
      )}
    </div>
  );
}
