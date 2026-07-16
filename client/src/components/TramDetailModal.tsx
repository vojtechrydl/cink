import type { Tram } from "../../../shared/types";
import { getTramGradient } from "../lib/colorGroup";

interface TramDetailModalProps {
  tram: Tram;
  caught: boolean;
  seenAt: string | null;
  onToggle: () => void;
  onClose: () => void;
}

export function TramDetailModal({
  tram,
  caught,
  seenAt,
  onToggle,
  onClose,
}: TramDetailModalProps) {
  const { c1, c2 } = getTramGradient(tram.colorBase);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface w-full sm:max-w-[420px] sm:rounded-[18px] rounded-t-[18px] max-h-[90vh] overflow-y-auto">
        {/* Hero image area */}
        <div
          className="relative h-[248px] flex-none overflow-hidden sm:rounded-t-[18px]"
          style={{ background: `linear-gradient(150deg, ${c1}, ${c2})` }}
        >
          {tram.photoUrl ? (
            <img
              src={tram.photoUrl}
              alt={`Tramvaj ${tram.number}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 opacity-[.22]" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="14" rx="2.5" />
              <line x1="4" y1="10" x2="20" y2="10" />
              <circle cx="8.5" cy="20" r="1.3" fill="white" stroke="none" />
              <circle cx="15.5" cy="20" r="1.3" fill="white" stroke="none" />
            </svg>
          )}
          <span className="absolute left-[18px] bottom-[14px] font-extrabold text-[44px] text-white/50 tracking-[-0.02em]">
            #{tram.number}
          </span>
          <button
            onClick={onClose}
            className="absolute top-[18px] right-4 w-[34px] h-[34px] rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-body hover:text-heading"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 bg-surface">
          <div className="flex items-center justify-between mb-[3px]">
            <span className="font-extrabold text-[28px] text-heading tracking-[-0.01em]">#{tram.number}</span>
            <button
              onClick={onToggle}
              className={`inline-flex items-center gap-[5px] text-[13px] font-semibold px-[13px] py-[6px] rounded-[20px] transition-all active:scale-95 ${
                caught
                  ? "bg-success-bg text-success"
                  : "bg-brand text-white shadow-[0_10px_22px_-8px_var(--color-brand-shadow)]"
              }`}
            >
              {caught ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Chycená
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Chytit
                </>
              )}
            </button>
          </div>

          <div className="text-[14px] font-medium text-tertiary">{tram.type}</div>

          {/* Info tiles */}
          <div className="flex gap-[10px]">
            <div className="flex-1 bg-card border border-border rounded-[14px] p-[12px_14px] flex items-center gap-[10px]">
              <span
                className="w-[18px] h-[18px] rounded-full shrink-0"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
              />
              <div>
                <div className="text-[10px] text-tertiary">Barva</div>
                <div className="text-[13px] font-semibold text-heading">{tram.color}</div>
              </div>
            </div>
            <div className="flex-1 bg-card border border-border rounded-[14px] p-[12px_14px] flex items-center gap-[10px] text-tertiary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
              <div>
                <div className="text-[10px] text-tertiary">Rok</div>
                <div className="text-[13px] font-semibold text-heading">{tram.yearBuilt}</div>
              </div>
            </div>
          </div>

          {tram.note && (
            <div className="bg-subtle rounded-[14px] p-[14px_16px]">
              <p className="text-[13px] leading-[1.55] text-body">{tram.note}</p>
            </div>
          )}

          {caught && seenAt && (
            <div className="bg-success-bg rounded-[14px] p-[13px_16px] flex items-center gap-[9px] text-success-dark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[13px] font-semibold">
                Chycená{" "}
                {new Date(seenAt).toLocaleDateString("cs-CZ", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
