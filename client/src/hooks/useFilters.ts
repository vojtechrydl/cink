import { useState } from "react";
import type { Tram, Sighting } from "../../../shared/types";

export type StatusFilter = "all" | "caught" | "missing";

export interface Filters {
  search: string;
  type: string | null;
  colorBase: string | null;
  decade: string | null;
  status: StatusFilter;
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: null,
    colorBase: null,
    decade: null,
    status: "all",
  });

  const setSearch = (search: string) =>
    setFilters((f) => ({ ...f, search }));
  const setType = (type: string | null) =>
    setFilters((f) => ({ ...f, type }));
  const setColorBase = (colorBase: string | null) =>
    setFilters((f) => ({ ...f, colorBase }));
  const setDecade = (decade: string | null) =>
    setFilters((f) => ({ ...f, decade }));
  const setStatus = (status: StatusFilter) =>
    setFilters((f) => ({ ...f, status }));

  return { filters, setSearch, setType, setColorBase, setDecade, setStatus };
}

export function applyFilters(
  trams: Tram[],
  sightings: Sighting[],
  filters: Filters
): Tram[] {
  const caughtIds = new Set(sightings.map((s) => s.tramId));

  return trams.filter((t) => {
    if (filters.search && !String(t.number).includes(filters.search))
      return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.colorBase && t.colorBase !== filters.colorBase) return false;
    if (filters.decade) {
      const decade = Math.floor(t.yearBuilt / 10) * 10;
      if (String(decade) !== filters.decade) return false;
    }
    if (filters.status === "caught" && !caughtIds.has(t.id)) return false;
    if (filters.status === "missing" && caughtIds.has(t.id)) return false;
    return true;
  });
}
