import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { SightingsResponse, Sighting } from "../../../shared/types";

export function useSightings() {
  return useQuery({
    queryKey: ["sightings"],
    queryFn: () => apiFetch<SightingsResponse>("/sightings"),
    select: (data) => data.sightings,
  });
}

export function useCatchTram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (tramId: number) =>
      apiFetch<{ sighting: Sighting }>("/sightings", {
        method: "POST",
        body: JSON.stringify({ tramId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sightings"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUncatchTram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (tramId: number) =>
      apiFetch<void>(`/sightings/${tramId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sightings"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
