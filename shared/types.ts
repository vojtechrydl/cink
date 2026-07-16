export interface Tram {
  id: number;
  number: number;
  type: string;
  color: string;
  colorBase: string;
  yearBuilt: number;
  yearNote: string | null;
  photoUrl: string | null;
  note: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Sighting {
  id: number;
  userId: number;
  tramId: number;
  seenAt: string;
  photoUrl: string | null;
}

export interface AuthResponse {
  user: User;
}

export interface TramsResponse {
  trams: Tram[];
}

export interface SightingsResponse {
  sightings: Sighting[];
}

export interface StatsResponse {
  total: number;
  caught: number;
  percentage: number;
  byType: CategoryStat[];
  byColor: CategoryStat[];
  byDecade: CategoryStat[];
  lastAdded: (Tram & { seenAt: string }) | null;
  oldestCaught: Tram | null;
  newestCaught: Tram | null;
}

export interface CategoryStat {
  category: string;
  total: number;
  caught: number;
}
