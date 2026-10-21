/**
 * NacenTwin Auth Client
 * Quản lý Token JWT Bearer, phiên đăng nhập, 10 Roles và Role Gateway Routing
 */

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
  // Tầng 0: Quản trị Trung ương
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATOR_ADMIN: "OPERATOR_ADMIN",
  ADMIN: "ADMIN",

  // Tầng 1: Quản trị Nhà nước phân cấp theo taxonomy và địa bàn hiện hành
  PROVINCIAL_ADMIN: "PROVINCIAL_ADMIN",
  SECTOR_ADMIN: "SECTOR_ADMIN",
  CLUSTER_ADMIN: "CLUSTER_ADMIN",

  // Tầng 2: Chủ thể Thị trường & Chuyên gia KH&CN
  SELLER: "SELLER",
  BUYER: "BUYER",
  INNOVATION_ENTITY: "INNOVATION_ENTITY",
  VERIFIED_EXPERT: "VERIFIED_EXPERT",
  EXPERT: "EXPERT",

  // Tầng 3: Đại chúng & Khách vãng lai
  PUBLIC_USER: "PUBLIC_USER",
  GUEST: "GUEST",
  USER: "USER",
} as const;

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  OPERATOR_ADMIN: "Quản trị viên vận hành",
  PROVINCIAL_ADMIN: "Quản trị viên cấp tỉnh",
  SECTOR_ADMIN: "Quản trị viên ngành",
  CLUSTER_ADMIN: "Quản trị viên đơn vị liên kết",
  SELLER: "Nhà cung ứng công nghệ",
  BUYER: "Bên có nhu cầu công nghệ",
  INNOVATION_ENTITY: "Chủ thể đổi mới sáng tạo",
  VERIFIED_EXPERT: "Chuyên gia KH&CN đã xác thực",
  PUBLIC_USER: "Thành viên công chúng",
  ADMIN: "Quản trị viên",
  EXPERT: "Chuyên gia KH&CN",
  USER: "Thành viên",
  GUEST: "Khách",
};

/** Nhãn hiển thị cho người dùng; không đưa mã role kỹ thuật lên giao diện. */
export function getRoleDisplayName(role?: string | null): string {
  if (!role) return "Thành viên";
  return ROLE_DISPLAY_NAMES[role.toUpperCase()] ?? "Thành viên";
}

export function getRedirectPathByRole(role?: string | null): string {
  if (!role) return "/";

  const upper = role.toUpperCase();

  // Tầng 0: Cổng Quản trị Tối cao
  if (upper === "SUPER_ADMIN" || upper === "OPERATOR_ADMIN" || upper === "ADMIN") {
    return "/admin";
  }

  // Tầng 1: Cổng Thẩm định Nhà nước & 34 Sở Tỉnh trọng điểm
  if (
    upper === "PROVINCIAL_ADMIN" ||
    upper === "SECTOR_ADMIN" ||
    upper === "CLUSTER_ADMIN" ||
    upper === "PROVINCE_OFFICER" ||
    upper === "PROVINCE_LEADER"
  ) {
    return "/gov";
  }

  // Tầng 2: Cổng Không gian Thị trường & Chuyên gia
  if (
    upper === "SELLER" ||
    upper === "BUYER" ||
    upper === "INNOVATION_ENTITY" ||
    upper === "VERIFIED_EXPERT" ||
    upper === "EXPERT"
  ) {
    return "/portal";
  }

  // Tầng 3: Cổng Đại chúng
  return "/";
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
    return allowedRoles.map((r) => r.toUpperCase()).includes(userRole);
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
