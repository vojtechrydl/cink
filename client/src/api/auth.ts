import { apiFetch } from "./client";
import type { AuthResponse } from "../../../shared/types";

export function fetchMe() {
  return apiFetch<AuthResponse>("/auth/me");
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string, name: string) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
}
