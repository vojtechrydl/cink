import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { StatsResponse } from "../../../shared/types";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => apiFetch<StatsResponse>("/stats"),
  });
}
