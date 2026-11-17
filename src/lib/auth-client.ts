/**
 * BACLINK Auth Client
 * Quản lý Token JWT Bearer, phiên đăng nhập, RBAC 3 cấp (ADMIN, ENTERPRISE, PUBLIC_USER) và Gateway Routing
 */

export type PlatformRole = "ADMIN" | "ENTERPRISE" | "PUBLIC_USER";

export interface UserContext {
  id: string;
  email: string;
  fullName: string;
  role: string;
  scopeType?: string;
  scopeId?: string;
  organizationName?: string;
  phone?: string;
  phoneNumber?: string;
}

export const ROLES = {
  // 3 Cấp chuẩn hóa BACLINK (ADR-0018)
  ADMIN: "ADMIN",
  ENTERPRISE: "ENTERPRISE",
  PUBLIC_USER: "PUBLIC_USER",

  /** @deprecated Legacy alias -> ADMIN */
  SUPER_ADMIN: "SUPER_ADMIN",
  /** @deprecated Legacy alias -> ADMIN */
  OPERATOR_ADMIN: "OPERATOR_ADMIN",

  /** @deprecated Legacy alias -> PUBLIC_USER (gỡ phân cấp Sở/Ngành) */
  PROVINCIAL_ADMIN: "PROVINCIAL_ADMIN",
  /** @deprecated Legacy alias -> PUBLIC_USER */
  SECTOR_ADMIN: "SECTOR_ADMIN",
  /** @deprecated Legacy alias -> PUBLIC_USER */
  CLUSTER_ADMIN: "CLUSTER_ADMIN",

  /** @deprecated Legacy alias -> ENTERPRISE */
  SELLER: "SELLER",
  /** @deprecated Legacy alias -> ENTERPRISE */
  BUYER: "BUYER",
  /** @deprecated Legacy alias -> ENTERPRISE */
  INNOVATION_ENTITY: "INNOVATION_ENTITY",
  /** @deprecated Legacy alias -> ENTERPRISE */
  VERIFIED_EXPERT: "VERIFIED_EXPERT",
  /** @deprecated Legacy alias -> ENTERPRISE */
  EXPERT: "EXPERT",

  /** @deprecated Legacy alias -> PUBLIC_USER */
  GUEST: "GUEST",
  /** @deprecated Legacy alias -> PUBLIC_USER */
  USER: "USER",
} as const;

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  ADMIN: "Quản trị viên",
  ENTERPRISE: "Doanh nghiệp Hội viên",
  PUBLIC_USER: "Thành viên công chúng",

  // Legacy display names (giữ tương thích hiển thị cho token cũ)
  SUPER_ADMIN: "Quản trị viên cấp cao",
  OPERATOR_ADMIN: "Quản trị viên vận hành",
  PROVINCIAL_ADMIN: "Quản trị viên cấp tỉnh",
  SECTOR_ADMIN: "Quản trị viên ngành",
  CLUSTER_ADMIN: "Quản trị viên đơn vị liên kết",
  SELLER: "Nhà cung ứng công nghệ",
  BUYER: "Bên có nhu cầu công nghệ",
  INNOVATION_ENTITY: "Chủ thể đổi mới sáng tạo",
  VERIFIED_EXPERT: "Chuyên gia KH&CN đã xác thực",
  EXPERT: "Chuyên gia KH&CN",
  USER: "Thành viên",
  GUEST: "Khách",
};

/** Chuẩn hóa mọi mã vai trò (bao gồm token legacy) về đúng 3 cấp BACLINK: ADMIN | ENTERPRISE | PUBLIC_USER */
export function normalizePlatformRole(role?: string | null): PlatformRole {
  if (!role) return "PUBLIC_USER";
  const upper = role.trim().toUpperCase();

  if (upper === "ADMIN" || upper === "SUPER_ADMIN" || upper === "OPERATOR_ADMIN") {
    return "ADMIN";
  }

  if (
    upper === "ENTERPRISE" ||
    upper === "SELLER" ||
    upper === "BUYER" ||
    upper === "INNOVATION_ENTITY" ||
    upper === "VERIFIED_EXPERT" ||
    upper === "EXPERT"
  ) {
    return "ENTERPRISE";
  }

  return "PUBLIC_USER";
}

/** Nhãn hiển thị cho người dùng; không đưa mã role kỹ thuật lên giao diện. */
export function getRoleDisplayName(role?: string | null): string {
  if (!role) return "Thành viên";
  return ROLE_DISPLAY_NAMES[role.toUpperCase()] ?? "Thành viên";
}

export function getRedirectPathByRole(role?: string | null): string {
  if (!role) return "/";

  const normalized = normalizePlatformRole(role);
  if (normalized === "ADMIN") return "/admin";
  if (normalized === "ENTERPRISE") return "/portal";
  return "/";
}

/** Trả về đường dẫn Không gian làm việc (Workspace) chính xác theo Role (không còn nhánh /gov) */
export function getWorkspacePath(role?: string | null): string {
  if (!role) return "/portal";

  const normalized = normalizePlatformRole(role);
  if (normalized === "ADMIN") return "/admin";
  return "/portal";
}

const TOKEN_KEY = "nacentwin_access_token";
const USER_KEY = "nacentwin_user_context";

export const authClient = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): UserContext | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setSession(token: string, user: UserContext): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  hasRole(allowedRoles: string[]): boolean {
    const user = this.getUser();
    if (!user || !user.role) return false;
    const userRole = user.role.toUpperCase();
    const normalizedRole = normalizePlatformRole(userRole);
    const allowedUpper = allowedRoles.map((r) => r.toUpperCase());
    return allowedUpper.includes(userRole) || allowedUpper.includes(normalizedRole);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
};

export function getStoredSession(): { accessToken?: string; token?: string; user?: UserContext | null } | null {
  const token = authClient.getToken();
  const user = authClient.getUser();
  if (!token && !user) return null;
  return { accessToken: token ?? undefined, token: token ?? undefined, user };
}
