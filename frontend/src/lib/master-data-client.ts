import { API_BASE } from "@/lib/api-client";

export interface MasterDataOption {
  id?: string;
  code: string;
  name: string;
  region?: string | null;
  tt17Code?: string;
  [key: string]: any;
}

export type SectorOption = MasterDataOption;
export type LocationOption = MasterDataOption & {
  locationType?: "AREA" | "KCN" | string;
  type?: "AREA" | "KCN" | string;
};

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const SECTORS_CACHE_TTL_MS = 60_000;
const LOCATIONS_CACHE_TTL_MS = 60_000;

export interface GetActiveSectorsOptions {
  forceRefresh?: boolean;
}

export interface GetBacNinhLocationsOptions {
  type?: "AREA" | "KCN";
  forceRefresh?: boolean;
}

let sectorsCache: { data: SectorOption[]; expiresAt: number } | null = null;
let sectorsInFlight: Promise<SectorOption[]> | null = null;
let sectorsCacheGeneration = 0;

const locationsCache = new Map<string, { data: LocationOption[]; expiresAt: number }>();
const locationsInFlight = new Map<string, Promise<LocationOption[]>>();
let locationsCacheGeneration = 0;

export function invalidateSectorsCache(): void {
  sectorsCacheGeneration += 1;
  sectorsCache = null;
  sectorsInFlight = null;
}

export function invalidateLocationsCache(): void {
  locationsCacheGeneration += 1;
  locationsCache.clear();
  locationsInFlight.clear();
}

async function getOptions(path: string): Promise<MasterDataOption[]> {
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Không tải được danh mục bộ lọc.");

  const payload = (await response.json()) as ApiEnvelope<MasterDataOption[]>;
  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error(payload.message || "Dữ liệu danh mục không hợp lệ.");
  }

  return payload.data.filter((item) => typeof item.code === "string" && item.code.length > 0 && typeof item.name === "string");
}

/** Shared master-data client for active sectors and Bac Ninh location/KCN options. */
export async function getPublicExpertFilterOptions() {
  const [sectors, provinces] = await Promise.all([
    getActiveSectors(),
    getBacNinhLocations(),
  ]);
  return { sectors, provinces };
}

export async function getBacNinhLocations(options?: GetBacNinhLocationsOptions): Promise<LocationOption[]> {
  const path = options?.type
    ? `/api/v1/master-data/locations?type=${encodeURIComponent(options.type)}`
    : "/api/v1/master-data/locations";

  if (typeof window === "undefined") {
    return getOptions(path);
  }

  if (options?.forceRefresh === true) {
    invalidateLocationsCache();
  }

  const cacheKey = options?.type ?? "ALL";
  const cached = locationsCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return [...cached.data];
  }

  const inFlight = locationsInFlight.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const requestGeneration = locationsCacheGeneration;
  const currentPromise = getOptions(path)
    .then((rows) => {
      if (requestGeneration === locationsCacheGeneration) {
        locationsCache.set(cacheKey, {
          data: rows,
          expiresAt: Date.now() + LOCATIONS_CACHE_TTL_MS,
        });
      }
      return [...rows];
    })
    .finally(() => {
      if (locationsInFlight.get(cacheKey) === currentPromise) {
        locationsInFlight.delete(cacheKey);
      }
    });

  locationsInFlight.set(cacheKey, currentPromise);
  return currentPromise;
}

export async function getActiveSectors(options?: GetActiveSectorsOptions): Promise<SectorOption[]> {
  if (typeof window === "undefined") {
    return getOptions("/api/v1/sectors");
  }

  if (options?.forceRefresh === true) {
    invalidateSectorsCache();
  }

  if (sectorsCache !== null && Date.now() < sectorsCache.expiresAt) {
    return [...sectorsCache.data];
  }

  if (sectorsInFlight !== null) {
    return sectorsInFlight;
  }

  const requestGeneration = sectorsCacheGeneration;
  const currentPromise = getOptions("/api/v1/sectors")
    .then((rows) => {
      if (requestGeneration === sectorsCacheGeneration) {
        sectorsCache = {
          data: rows,
          expiresAt: Date.now() + SECTORS_CACHE_TTL_MS,
        };
      }
      return [...rows];
    })
    .finally(() => {
      if (sectorsInFlight === currentPromise) {
        sectorsInFlight = null;
      }
    });

  sectorsInFlight = currentPromise;
  return currentPromise;
}

/** Historical profiles retain their sector labels even after a sector is deactivated. */
export async function getSectorLabels(): Promise<SectorOption[]> {
  return getOptions("/api/v1/master-data/sectors?activeOnly=false");
}
