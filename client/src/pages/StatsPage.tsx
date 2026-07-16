import { useStats } from "../api/stats";
import { ProgressBar } from "../components/ProgressBar";
import type { CategoryStat } from "../../../shared/types";

function CategoryBreakdown({
  title,
  stats,
}: {
  title: string;
  stats: CategoryStat[];
}) {
  return (
    <div className="bg-card border border-border rounded-[18px] p-[16px_18px]">
      <h3 className="font-bold text-[14px] text-heading mb-[14px]">{title}</h3>
      <div className="space-y-[13px]">
        {stats.map((s) => (
          <div key={s.category}>
            <div className="flex justify-between items-baseline mb-[6px]">
              <span className="text-[13px] font-medium text-body">{s.category}</span>
              <span className="text-[12px] font-semibold text-tertiary tabular-nums">
                {s.caught}/{s.total}
              </span>
            </div>
            <ProgressBar caught={s.caught} total={s.total} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-[14px] pb-4 space-y-3 bg-surface">
      <h1 className="text-[22px] font-bold text-heading tracking-[-0.01em] mb-[14px]">Statistiky</h1>

      {/* Hero card */}
      <div className="bg-card border border-border rounded-[18px] p-[22px_20px] text-center">
        <div className="text-[46px] font-bold text-heading leading-none tabular-nums tracking-[-0.02em]">
          {stats.caught}<span className="text-divider">/</span>{stats.total}
        </div>
        <div className="text-[13px] font-medium text-secondary mt-[6px] mb-4">
          {stats.percentage} % sbírky dokončeno
        </div>
        <ProgressBar caught={stats.caught} total={stats.total} size="lg" />
      </div>

      {/* Small info cards */}
      <div className="flex gap-[10px]">
        {stats.lastAdded && (
          <div className="flex-1 bg-card border border-border rounded-[15px] p-[13px]">
            <div className="text-[10px] font-medium text-tertiary mb-1">Poslední přidaná</div>
            <div className="font-bold text-[18px] text-heading tabular-nums">#{stats.lastAdded.number}</div>
            <div className="text-[11px] text-tertiary">{stats.lastAdded.type}</div>
          </div>
        )}
        {stats.oldestCaught && (
          <div className="flex-1 bg-card border border-border rounded-[15px] p-[13px]">
            <div className="text-[10px] font-medium text-tertiary mb-1">Nejstarší</div>
            <div className="font-bold text-[18px] text-heading tabular-nums">#{stats.oldestCaught.number}</div>
            <div className="text-[11px] text-tertiary">{stats.oldestCaught.yearBuilt}</div>
          </div>
        )}
        {stats.newestCaught && (
          <div className="flex-1 bg-card border border-border rounded-[15px] p-[13px]">
            <div className="text-[10px] font-medium text-tertiary mb-1">Nejnovější</div>
            <div className="font-bold text-[18px] text-heading tabular-nums">#{stats.newestCaught.number}</div>
            <div className="text-[11px] text-tertiary">{stats.newestCaught.yearBuilt}</div>
          </div>
        )}
      </div>

      <CategoryBreakdown title="Podle typu" stats={stats.byType} />
      <CategoryBreakdown title="Podle barvy" stats={stats.byColor} />
      <CategoryBreakdown title="Podle dekády" stats={stats.byDecade} />
    </div>
  );
}
