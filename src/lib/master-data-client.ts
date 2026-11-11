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

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const SECTORS_CACHE_TTL_MS = 60_000;

export interface GetActiveSectorsOptions {
  forceRefresh?: boolean;
}

let sectorsCache: { data: SectorOption[]; expiresAt: number } | null = null;
let sectorsInFlight: Promise<SectorOption[]> | null = null;
let sectorsCacheGeneration = 0;

export function invalidateSectorsCache(): void {
  sectorsCacheGeneration += 1;
  sectorsCache = null;
  sectorsInFlight = null;
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

/** Shared master-data client for active sectors and the public province projection. */
export async function getPublicExpertFilterOptions() {
  const [sectors, provinces] = await Promise.all([
    getActiveSectors(),
    getOptions("/api/v1/governance/org-units/public-provinces"),
  ]);
  return { sectors, provinces };
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
