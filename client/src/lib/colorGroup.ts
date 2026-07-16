export interface TramGradient {
  c1: string;
  c2: string;
}

const GRADIENTS: Record<string, TramGradient> = {
  žlutošedá: { c1: "#ECC94B", c2: "#9CA3AF" },
  modrá: { c1: "#2563EB", c2: "#93C5FD" },
  červená: { c1: "#DC4C3F", c2: "#E88B84" },
  zelená: { c1: "#15803D", c2: "#6EE7B7" },
  bílá: { c1: "#E2E8F0", c2: "#F59E0B" },
  černá: { c1: "#1C1917", c2: "#57534E" },
  růžová: { c1: "#EC4899", c2: "#F9A8D4" },
  oranžová: { c1: "#EA580C", c2: "#FDBA74" },
  barevná: { c1: "#8B5CF6", c2: "#F59E0B" },
  speciální: { c1: "#06B6D4", c2: "#A78BFA" },
};

export function getTramGradient(colorBase: string): TramGradient {
  return GRADIENTS[colorBase] || { c1: "#9CA3AF", c2: "#D1D5DB" };
}
