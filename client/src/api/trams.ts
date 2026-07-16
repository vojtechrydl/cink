import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { TramsResponse } from "../../../shared/types";

export function useTrams() {
  return useQuery({
    queryKey: ["trams"],
    queryFn: () => apiFetch<TramsResponse>("/trams"),
    select: (data) => data.trams,
    staleTime: Infinity,
  });
}
