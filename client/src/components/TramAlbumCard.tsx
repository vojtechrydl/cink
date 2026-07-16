import type { Tram } from "../../../shared/types";
import { getTramGradient } from "../lib/colorGroup";

interface TramAlbumCardProps {
  tram: Tram;
  caught: boolean;
  onClick: () => void;
}

export function TramAlbumCard({ tram, caught, onClick }: TramAlbumCardProps) {
  const { c1, c2 } = getTramGradient(tram.colorBase);

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-[13px] overflow-hidden transition-all active:scale-95"
    >
      {caught ? (
        <>
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(140deg, ${c1}, ${c2})` }}
          />
          {tram.photoUrl && (
            <img
              src={tram.photoUrl}
              alt={`Tramvaj ${tram.number}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute top-[5px] right-[5px] w-[18px] h-[18px] rounded-full bg-success flex items-center justify-center border-2 border-white">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="absolute left-[6px] bottom-[3px] font-extrabold text-[13px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            #{tram.number}
          </span>
        </>
      ) : (
        <div className="w-full h-full rounded-[13px] border-[1.5px] border-dashed border-border-dashed flex flex-col items-center justify-center gap-[5px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4BFB9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="text-[10px] font-semibold text-placeholder">#{tram.number}</span>
        </div>
      )}
    </button>
  );
}
