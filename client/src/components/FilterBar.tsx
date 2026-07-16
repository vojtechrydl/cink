import type { Tram } from "../../../shared/types";
import type { Filters, StatusFilter } from "../hooks/useFilters";

interface FilterBarProps {
  trams: Tram[];
  filters: Filters;
  onTypeChange: (type: string | null) => void;
  onColorChange: (color: string | null) => void;
  onDecadeChange: (decade: string | null) => void;
  onStatusChange: (status: StatusFilter) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Vše" },
  { value: "caught", label: "Chycené" },
  { value: "missing", label: "Chybějící" },
];

export function FilterBar({
  trams,
  filters,
  onTypeChange,
  onColorChange,
  onDecadeChange,
  onStatusChange,
}: FilterBarProps) {
  const types = [...new Set(trams.map((t) => t.type))].sort((a, b) =>
    a.localeCompare(b, "cs")
  );
  const colors = [...new Set(trams.map((t) => t.colorBase))].sort((a, b) =>
    a.localeCompare(b, "cs")
  );
  const decades = [
    ...new Set(
      trams.map((t) => String(Math.floor(t.yearBuilt / 10) * 10))
    ),
  ].sort();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={`px-[15px] py-[7px] rounded-[20px] text-[13px] font-semibold transition-colors ${
              filters.status === value
                ? "bg-brand text-white"
                : "bg-chip text-secondary hover:bg-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <select
          value={filters.type || ""}
          onChange={(e) => onTypeChange(e.target.value || null)}
          className="shrink-0 rounded-[12px] border border-border bg-card px-3 py-[7px] text-[13px] text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Všechny typy</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.colorBase || ""}
          onChange={(e) => onColorChange(e.target.value || null)}
          className="shrink-0 rounded-[12px] border border-border bg-card px-3 py-[7px] text-[13px] text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Všechny barvy</option>
          {colors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.decade || ""}
          onChange={(e) => onDecadeChange(e.target.value || null)}
          className="shrink-0 rounded-[12px] border border-border bg-card px-3 py-[7px] text-[13px] text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Všechny roky</option>
          {decades.map((d) => (
            <option key={d} value={d}>{d}s</option>
          ))}
        </select>
      </div>
    </div>
  );
}
