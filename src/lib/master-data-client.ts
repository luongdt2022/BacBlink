import { API_BASE } from "@/lib/api-client";

export interface MasterDataOption {
  code: string;
  name: string;
  region?: string | null;
}

export type SectorOption = MasterDataOption;

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
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
    getOptions("/api/v1/sectors"),
    getOptions("/api/v1/governance/org-units/public-provinces"),
  ]);
  return { sectors, provinces };
}

export async function getActiveSectors(): Promise<SectorOption[]> {
  return getOptions("/api/v1/sectors");
}

/** Historical profiles retain their sector labels even after a sector is deactivated. */
export async function getSectorLabels(): Promise<SectorOption[]> {
  return getOptions("/api/v1/master-data/sectors?activeOnly=false");
}
