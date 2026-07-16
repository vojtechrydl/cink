import type { Tram } from "../../../shared/types";
import { getTramGradient } from "../lib/colorGroup";

interface TramCardProps {
  tram: Tram;
  caught: boolean;
  onToggle: () => void;
  onDetail: () => void;
}

export function TramCard({ tram, caught, onToggle, onDetail }: TramCardProps) {
  const { c1, c2 } = getTramGradient(tram.colorBase);

  return (
    <div
      onClick={onDetail}
      className="flex items-center gap-[13px] py-[13px] px-4 border-b border-border-light cursor-pointer active:bg-chip/50 transition-colors"
    >
      <div
        className="shrink-0 w-[52px] h-[52px] rounded-[13px] overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        {tram.photoUrl ? (
          <img
            src={tram.photoUrl}
            alt={`Tramvaj ${tram.number}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="absolute right-[5px] bottom-0 font-extrabold text-[17px] text-white/55">
            {tram.number}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-[7px]">
          <span className="font-bold text-[16px] text-heading">#{tram.number}</span>
          <span className="text-[11px] font-medium text-tertiary tracking-[.02em]">{tram.type}</span>
        </div>
        <div className="text-[13px] font-medium text-body mt-[2px] truncate">{tram.color}</div>
        <div className="text-[12px] text-tertiary mt-[1px]">{tram.yearBuilt}</div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all active:scale-90 ${
          caught
            ? "bg-success-bg text-success"
            : "bg-chip text-secondary hover:bg-border"
        }`}
      >
        {caught ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
    </div>
  );
}
