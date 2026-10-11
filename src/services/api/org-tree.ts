import { API_BASE } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export interface OrganizationUnitItem {
  id: string;
  code: string;
  name: string;
  unitType: "NATIONAL" | "PROVINCIAL" | "INSTITUTION";
  parentId?: string | null;
  provinceId?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAtUtc: string;
  leaderEmail?: string;
  leaderName?: string;
  children?: OrganizationUnitItem[];
}

export interface CreateOrganizationUnitPayload {
  code: string;
  name: string;
  unitType: "NATIONAL" | "PROVINCIAL" | "INSTITUTION";
  parentId?: string | null;
  provinceId?: string | null;
}

export interface UpdateOrganizationUnitPayload {
  name: string;
  provinceId?: string | null;
}

export interface ProvisionProvinceLeaderPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  provinceId: string;
}

export interface Province34Item {
  code: string;
  name: string;
  region: string;
  regionCode: string;
  leader: string;
  institutions: number;
  experts: number;
  shops: number;
  demands: number;
}

export const orgTreeApi = {
  async getTree(): Promise<OrganizationUnitItem[]> {
    const res = await fetch(`${API_BASE}/api/v1/governance/org-units/tree`, {
      headers: authClient.getAuthHeaders(),
      cache: "no-store",
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || "Không thể tải cây cơ cấu hành chính.");
    }
    return payload.data;
  },

  async createUnit(body: CreateOrganizationUnitPayload): Promise<OrganizationUnitItem> {
    const res = await fetch(`${API_BASE}/api/v1/governance/org-units`, {
      method: "POST",
      headers: {
        ...authClient.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || "Không thể tạo đơn vị tổ chức.");
    }
    return payload.data;
  },

  async updateUnit(id: string, body: UpdateOrganizationUnitPayload): Promise<OrganizationUnitItem> {
    const res = await fetch(`${API_BASE}/api/v1/governance/org-units/${id}`, {
      method: "PUT",
      headers: {
        ...authClient.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || "Không thể cập nhật thông tin đơn vị.");
    }
    return payload.data;
  },

  async deactivateUnit(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/governance/org-units/${id}`, {
      method: "DELETE",
      headers: authClient.getAuthHeaders(),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || "Không thể vô hiệu hóa đơn vị.");
    }
  },

  async provisionLeader(body: ProvisionProvinceLeaderPayload): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/governance/org-units/provision-leader`, {
      method: "POST",
      headers: {
        ...authClient.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || "Không thể khởi tạo tài khoản lãnh đạo Sở.");
    }
  },
};
