import { API_BASE, readApiError, userFacingRequestError } from "@/lib/api-client";
import { authClient, getStoredSession } from "@/lib/auth-client";
import { getCachedOrFetch, invalidateCachePrefix } from "@/lib/client-cache";

function getBlockchainAuthScope(): string {
  const s = getStoredSession();
  return `${s?.user?.id ?? "anon"}:${s?.user?.role ?? "anon"}`;
}

// ==========================================
// 1. DTOs & TypeScript Interfaces
// ==========================================

export interface AnchorPolicyDto {
  id: string;
  entityType: string;
  displayName: string;
  isEnabled: boolean;
  triggerStatus: string;
  jsonFieldsExpression: string;
  batchSizeThreshold: number;
  batchTimeoutMinutes: number;
  anchoredRecordsCount: number;
  version: number;
}

export interface UpdateAnchorPolicyRequest {
  isEnabled?: boolean;
  batchSizeThreshold?: number;
  batchTimeoutMinutes?: number;
  expectedVersion?: number;
}

export interface LedgerBlockSummaryDto {
  blockNumber: number;
  blockHash: string;
  previousHash: string;
  merkleRoot: string;
  txCount: number;
  validatorAddress: string;
  blockSignature: string;
  status: "COMMITTED" | "NDACHAIN_SUBMITTED" | "NDACHAIN_CONFIRMED" | string;
  ndaChainTxHash?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
}

export interface AnchorRecordSummaryDto {
  id: string;
  entityType: string;
  entityId: string;
  entityCode: string;
  commitmentHash: string;
  rawDataHash: string;
  ledgerBlockNumber?: number | null;
  txIndexInBlock?: number | null;
  status: "PENDING" | "LOCAL_LEDGER_ANCHORED" | "NDACHAIN_SUBMITTED" | "NDACHAIN_CONFIRMED" | "FAILED" | string;
  merklePathJson?: string | null;
  createdAt: string;
  anchoredAt?: string | null;
}

export interface LedgerBlockDetailDto extends LedgerBlockSummaryDto {
  transactions: AnchorRecordSummaryDto[];
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GatewayStatusDto {
  gatewayType: string;
  isConnected: boolean;
  validatorAddress?: string | null;
  highestBlockNumber?: number | null;
  endpoint?: string | null;
  chainId?: number | null;
  contractAddress?: string | null;
  details?: string | null;
  lastCheckedAt: string;
}

export interface BridgeSyncResultDto {
  success: boolean;
  syncedBlocksCount: number;
  message: string;
  timestamp: string;
}

export interface VerificationStepResult {
  stepName: string;
  passed: boolean;
  details: string;
  expectedValue?: string | null;
  actualValue?: string | null;
}

export interface VerificationVerdictResult {
  verdict: "VERIFIED" | "TAMPERED" | "NOT_ANCHORED" | "BLOCK_UNCONFIRMED" | string;
  isSuccess: boolean;
  summary: string;
  blockNumber?: number | null;
  blockHash?: string | null;
  merkleRoot?: string | null;
  commitmentHash?: string | null;
  validatorAddress?: string | null;
  anchoredAt?: string | null;
  ndaChainTxHash?: string | null;
  steps: VerificationStepResult[];
}

export interface LiveVerificationApiRequest {
  entityType: string;
  entityId: string;
  customPayloadJson?: string;
}

// ==========================================
// 2. Helper Auth Headers
// ==========================================

function getAuthHeaders(): HeadersInit {
  const token = authClient.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// 3. Admin API Functions
// ==========================================

/** Lấy danh sách ma trận chính sách neo dữ liệu */
export async function fetchAnchorPolicies(): Promise<AnchorPolicyDto[]> {
  try {
    return await getCachedOrFetch<AnchorPolicyDto[]>(
      `blockchain:policies:${getBlockchainAuthScope()}`,
      20_000,
      async () => {
        const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/policies`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(await readApiError(res, "Không thể tải danh sách chính sách neo."));
        }

        const payload = await res.json();
        return Array.isArray(payload.data) ? payload.data : [];
      }
    );
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể kết nối máy chủ để lấy chính sách neo."));
  }
}

/** Cập nhật chính sách neo dữ liệu (bật/tắt hoặc ngưỡng gom lô) */
export async function updateAnchorPolicy(
  policyId: string,
  request: UpdateAnchorPolicyRequest
): Promise<AnchorPolicyDto> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/policies/${policyId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể cập nhật chính sách neo."));
    }

    const payload = await res.json();
    invalidateCachePrefix("blockchain:");
    return payload.data;
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể cập nhật chính sách neo."));
  }
}

/** Lấy danh sách sổ cái khối phân trang */
export async function fetchLedgerBlocks(
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<LedgerBlockSummaryDto>> {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const qs = query.toString();

    return await getCachedOrFetch<PagedResult<LedgerBlockSummaryDto>>(
      `blockchain:blocks:${getBlockchainAuthScope()}:${qs}`,
      20_000,
      async () => {
        const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/blocks?${qs}`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(await readApiError(res, "Không thể tải danh sách sổ cái khối."));
        }

        const payload = await res.json();
        return {
          items: Array.isArray(payload.data) ? payload.data : [],
          total: payload.total ?? 0,
          page: payload.page ?? page,
          pageSize: payload.pageSize ?? pageSize,
          totalPages: payload.totalPages ?? 1,
        };
      }
    );
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể kết nối máy chủ để lấy danh sách khối."));
  }
}

/** Lấy chi tiết một khối sổ cái kèm danh sách giao dịch Merkle */
export async function fetchLedgerBlockDetail(
  blockNumber: number
): Promise<LedgerBlockDetailDto> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/blocks/${blockNumber}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, `Không thể tải chi tiết khối #${blockNumber}.`));
    }

    const payload = await res.json();
    return payload.data;
  } catch (err) {
    throw new Error(userFacingRequestError(err, `Không thể tải chi tiết khối #${blockNumber}.`));
  }
}

/** Kích hoạt đóng khối thủ công ngay lập tức (Flush Pending Records) */
export async function flushPendingBlock(): Promise<LedgerBlockSummaryDto | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/blocks/flush`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể thực hiện đóng khối."));
    }

    const payload = await res.json();
    invalidateCachePrefix("blockchain:");
    return payload.data ?? null;
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể kích hoạt đóng khối."));
  }
}

/** Tra cứu danh sách bản ghi neo dữ liệu */
export async function fetchAnchorRecords(params?: {
  entityType?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<AnchorRecordSummaryDto>> {
  try {
    const query = new URLSearchParams();
    if (params?.entityType) query.set("entityType", params.entityType);
    if (params?.status) query.set("status", params.status);
    if (params?.keyword) query.set("keyword", params.keyword);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.pageSize) query.set("pageSize", params.pageSize.toString());

    const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/records?${query.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể tra cứu bản ghi neo."));
    }

    const payload = await res.json();
    return {
      items: Array.isArray(payload.data) ? payload.data : [],
      total: payload.total ?? 0,
      page: payload.page ?? params?.page ?? 1,
      pageSize: payload.pageSize ?? params?.pageSize ?? 20,
      totalPages: payload.totalPages ?? 1,
    };
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể kết nối máy chủ để tra cứu bản ghi neo."));
  }
}

/** Lấy trạng thái cổng liên thông Chuỗi khối Quốc gia NDAChain */
export async function fetchBridgeStatus(): Promise<GatewayStatusDto> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/bridge/status`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể tải trạng thái cổng liên thông NDAChain."));
    }

    const payload = await res.json();
    return payload.data;
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể kết nối cổng liên thông NDAChain."));
  }
}

/** Kích hoạt đồng bộ bù Merkle Root lên NDAChain */
export async function triggerBridgeSync(): Promise<BridgeSyncResultDto> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/blockchain/bridge/trigger-sync`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Kích hoạt đồng bộ bù NDAChain thất bại."));
    }

    const payload = await res.json();
    invalidateCachePrefix("blockchain:");
    return payload.data;
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Kích hoạt đồng bộ bù NDAChain thất bại."));
  }
}

// ==========================================
// 4. Public API Functions (Khách vãng lai / Tra cứu công khai)
// ==========================================

/** Tra cứu trạng thái neo dữ liệu công khai của một thực thể */
export async function fetchEntityAnchorStatus(
  entityType: string,
  entityId: string
): Promise<VerificationVerdictResult> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/blockchain/verify/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
      {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(await readApiError(res, "Không thể kiểm tra trạng thái neo của thực thể."));
    }

    const payload = await res.json();
    return payload.data;
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể kết nối máy chủ kiểm chứng."));
  }
}

/** Kiểm chứng toán học thời gian thực (4 bước: Canonical JSON, ZKP Commitment, Merkle Path, ECDSA) */
export async function verifyEntityLive(
  request: LiveVerificationApiRequest
): Promise<VerificationVerdictResult> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/blockchain/verify/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(await readApiError(res, "Kiểm chứng toán học thời gian thực thất bại."));
    }

    const payload = await res.json();
    return payload.data;
  } catch (err) {
    throw new Error(userFacingRequestError(err, "Không thể thực hiện kiểm chứng thời gian thực."));
  }
}
