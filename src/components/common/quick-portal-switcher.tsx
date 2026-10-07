"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RotateCcw, ShieldCheck, Smartphone, Monitor } from "lucide-react";
import { authClient, UserContext } from "@/lib/auth-client";

const USER_KEY = "nacentwin_user_context";
const TOKEN_KEY = "nacentwin_access_token";
const BACKUP_KEY = "nacentwin_qa_original_session";

type QuickPortal = {
  label: string;
  role: string;
  path: string;
  scopeType?: string;
  scopeId?: string;
};

const webPortals: QuickPortal[] = [
  { label: "Công khai", role: "GUEST", path: "/" },
  { label: "Người dùng (chưa là chuyên gia)", role: "USER", path: "/" },
  { label: "Admin hệ thống", role: "SUPER_ADMIN", path: "/admin" },
  {
    label: "Quản lý Sở", role: "PROVINCIAL_ADMIN", path: "/gov", scopeType: "PROVINCE", scopeId: "HÀ NỘI",
  },
  { label: "Người chào bán", role: "SELLER", path: "/portal" },
  { label: "Người tìm mua", role: "BUYER", path: "/portal" },
  { label: "Đơn vị đổi mới", role: "INNOVATION_ENTITY", path: "/portal" },
  { label: "Chuyên gia", role: "VERIFIED_EXPERT", path: "/portal/expert/profile" },
];

function getStoredSession() {
  return {
    token: window.localStorage.getItem(TOKEN_KEY),
    user: window.localStorage.getItem(USER_KEY),
  };
}

export function QuickPortalSwitcher() {
  const [activeRole, setActiveRole] = useState<string>("");
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    setActiveRole(authClient.getUser()?.role ?? "GUEST");
    setHasBackup(Boolean(window.sessionStorage.getItem(BACKUP_KEY)));
  }, []);

  const switchWebPortal = (role: string) => {
    const portal = webPortals.find((item) => item.role === role);
    if (!portal) return;

    if (!window.sessionStorage.getItem(BACKUP_KEY)) {
      window.sessionStorage.setItem(BACKUP_KEY, JSON.stringify(getStoredSession()));
    }

    const previewUser: UserContext = {
      id: `qa-${portal.role.toLowerCase()}`,
      email: `qa.${portal.role.toLowerCase()}@nacentwin.local`,
      fullName: `Kiểm thử — ${portal.label}`,
      role: portal.role,
      scopeType: portal.scopeType,
      scopeId: portal.scopeId,
    };

    authClient.setSession("qa-preview-token", previewUser);
    setActiveRole(portal.role);
    setHasBackup(true);
    // Full navigation makes every role guard evaluate the newly selected preview session.
    window.location.assign(portal.path);
  };

  const restoreSession = () => {
    const backupRaw = window.sessionStorage.getItem(BACKUP_KEY);
    if (!backupRaw) return;

    const backup: { token: string | null; user: string | null } = JSON.parse(backupRaw);
    if (backup.token) window.localStorage.setItem(TOKEN_KEY, backup.token);
    else window.localStorage.removeItem(TOKEN_KEY);
    if (backup.user) window.localStorage.setItem(USER_KEY, backup.user);
    else window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(BACKUP_KEY);
    window.location.assign("/");
  };

  return (
    <div className="border-b border-amber-200/80 bg-amber-50 text-slate-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-slate-200">
      <div className="mx-auto flex min-h-11 max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 text-label sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          Kiểm thử nhanh (tạm thời)
        </span>

        <label className="inline-flex items-center gap-1.5 font-medium">
          <Monitor className="h-3.5 w-3.5 text-slate-500" />
          <span className="sr-only">Chuyển cổng Web theo vai trò</span>
          <select
            aria-label="Chuyển cổng Web theo vai trò"
            value={activeRole}
            onChange={(event) => switchWebPortal(event.target.value)}
            className="form-control focus-ring min-h-11 max-w-52 rounded-control border border-amber-300 bg-white px-2 text-body font-semibold text-slate-700 dark:border-amber-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {webPortals.map((portal) => (
              <option key={portal.role} value={portal.role}>{`Web — ${portal.label}`}</option>
            ))}
          </select>
        </label>

        <a
          href="http://localhost:3000"
          className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-control border border-amber-300 bg-white px-2 font-semibold text-slate-700 transition hover:border-amber-500 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-amber-950/70"
          title="Mở Zalo Mini App Sổ tay Chuyên gia (môi trường local)"
        >
          <Smartphone className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
          Mobile — Sổ tay Chuyên gia
          <ExternalLink className="h-3 w-3" />
        </a>

        {hasBackup && (
          <button
            type="button"
            onClick={restoreSession}
            className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-control px-1.5 font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Khôi phục phiên
          </button>
        )}
      </div>
    </div>
  );
}
