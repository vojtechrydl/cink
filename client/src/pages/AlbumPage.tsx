import { useState, useMemo } from "react";
import { useTrams } from "../api/trams";
import { useSightings, useCatchTram, useUncatchTram } from "../api/sightings";
import { TramAlbumCard } from "../components/TramAlbumCard";
import { TramDetailModal } from "../components/TramDetailModal";
import type { Tram } from "../../../shared/types";

type GroupBy = "number" | "type" | "colorBase" | "yearBuilt";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "number", label: "Číslo" },
  { value: "type", label: "Typ" },
  { value: "colorBase", label: "Barva" },
  { value: "yearBuilt", label: "Rok" },
];

function groupTrams(trams: Tram[], groupBy: GroupBy): Map<string, Tram[]> {
  const groups = new Map<string, Tram[]>();

  if (groupBy === "number") {
    groups.set("Všechny tramvaje", [...trams]);
    return groups;
  }

  for (const tram of trams) {
    const key =
      groupBy === "yearBuilt" ? String(tram.yearBuilt) : tram[groupBy];
    const group = groups.get(key) || [];
    group.push(tram);
    groups.set(key, group);
  }

  return new Map(
    [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "cs"))
  );
}

export function AlbumPage() {
  const { data: trams, isLoading: tramsLoading } = useTrams();
  const { data: sightings, isLoading: sightingsLoading } = useSightings();
  const catchMutation = useCatchTram();
  const uncatchMutation = useUncatchTram();
  const [groupBy, setGroupBy] = useState<GroupBy>("number");
  const [selectedTram, setSelectedTram] = useState<Tram | null>(null);

  const caughtMap = useMemo(() => {
    const map = new Map<number, string>();
    sightings?.forEach((s) => map.set(s.tramId, s.seenAt));
    return map;
  }, [sightings]);

  const grouped = useMemo(
    () => groupTrams(trams || [], groupBy),
    [trams, groupBy]
  );

  const caughtCount = sightings?.length ?? 0;
  const totalCount = trams?.length ?? 0;

  function handleToggle(tram: Tram) {
    if (caughtMap.has(tram.id)) {
      uncatchMutation.mutate(tram.id);
    } else {
      catchMutation.mutate(tram.id);
    }
  }

  if (tramsLoading || sightingsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <div className="px-4 pt-[14px] pb-[10px]">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-[22px] font-bold text-heading tracking-[-0.01em]">Album</h1>
          <span className="text-[13px] font-semibold text-tertiary">
            <span className="text-brand">{caughtCount}</span> / {totalCount}
          </span>
        </div>

        <div className="flex gap-2">
          {GROUP_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setGroupBy(value)}
              className={`px-[13px] py-[6px] rounded-[18px] text-[12px] font-semibold transition-colors ${
                groupBy === value
                  ? "bg-brand text-white"
                  : "bg-chip text-secondary hover:bg-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-5">
        {[...grouped.entries()].map(([groupLabel, groupTrams]) => {
          const groupCaught = groupTrams.filter((t) =>
            caughtMap.has(t.id)
          ).length;

          return (
            <div key={groupLabel}>
              {groupBy !== "number" && (
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[13px] font-semibold text-secondary">{groupLabel}</h2>
                  <span className="text-[12px] font-semibold text-tertiary tabular-nums">
                    {groupCaught}/{groupTrams.length}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[10px]">
                {groupTrams.map((tram) => (
                  <TramAlbumCard
                    key={tram.id}
                    tram={tram}
                    caught={caughtMap.has(tram.id)}
                    onClick={() => setSelectedTram(tram)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTram && (
        <TramDetailModal
          tram={selectedTram}
          caught={caughtMap.has(selectedTram.id)}
          seenAt={caughtMap.get(selectedTram.id) ?? null}
          onToggle={() => handleToggle(selectedTram)}
          onClose={() => setSelectedTram(null)}
        />
      )}
    </div>
  );
}
