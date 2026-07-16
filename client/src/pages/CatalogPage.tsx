import { useState, useMemo } from "react";
import { useTrams } from "../api/trams";
import { useSightings, useCatchTram, useUncatchTram } from "../api/sightings";
import { useFilters, applyFilters } from "../hooks/useFilters";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { TramCard } from "../components/TramCard";
import { TramDetailModal } from "../components/TramDetailModal";
import type { Tram } from "../../../shared/types";

export function CatalogPage() {
  const { data: trams, isLoading: tramsLoading } = useTrams();
  const { data: sightings, isLoading: sightingsLoading } = useSightings();
  const catchMutation = useCatchTram();
  const uncatchMutation = useUncatchTram();
  const { filters, setSearch, setType, setColorBase, setDecade, setStatus } =
    useFilters();
  const [selectedTram, setSelectedTram] = useState<Tram | null>(null);

  const caughtMap = useMemo(() => {
    const map = new Map<number, string>();
    sightings?.forEach((s) => map.set(s.tramId, s.seenAt));
    return map;
  }, [sightings]);

  const filtered = useMemo(
    () => applyFilters(trams || [], sightings || [], filters),
    [trams, sightings, filters]
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
      <div className="px-4 pt-[14px] pb-[6px]">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-[22px] font-bold text-heading tracking-[-0.01em]">Katalog</h1>
          <span className="text-[13px] font-semibold text-tertiary">
            <span className="text-brand">{caughtCount}</span> / {totalCount}
          </span>
        </div>

        <div className="mb-3">
          <SearchBar value={filters.search} onChange={setSearch} />
        </div>

        <FilterBar
          trams={trams || []}
          filters={filters}
          onTypeChange={setType}
          onColorChange={setColorBase}
          onDecadeChange={setDecade}
          onStatusChange={setStatus}
        />
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-tertiary">
            <p className="text-[16px] font-medium">Žádné tramvaje nenalezeny</p>
            <p className="text-[13px] mt-1">Zkuste změnit filtry</p>
          </div>
        ) : (
          filtered.map((tram) => (
            <TramCard
              key={tram.id}
              tram={tram}
              caught={caughtMap.has(tram.id)}
              onToggle={() => handleToggle(tram)}
              onDetail={() => setSelectedTram(tram)}
            />
          ))
        )}
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
