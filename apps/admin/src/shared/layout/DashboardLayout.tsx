import { useRef, useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Users, FileCheck2, LogOut, LayoutDashboard, FileText, Lightbulb, Tag, ChevronUp, KeyRound, BookOpen, ScrollText, Briefcase, Shuffle } from "lucide-react";
import { useAuth } from "@/features/auth";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "ips",
    label: "Quản lý Cung",
    icon: FileText,
    path: "/ips",
  },
  {
    id: "challenges",
    label: "Quản lý Cầu",
    icon: Lightbulb,
    path: "/challenges",
  },
  {
    id: "categories",
    label: "Danh mục",
    icon: Tag,
    path: "/categories",
  },
  {
    id: "cases",
    label: "Hồ sơ vụ việc",
    icon: Briefcase,
    path: "/cases",
  },
  {
    id: "match-rounds",
    label: "Vòng ghép cặp",
    icon: Shuffle,
    path: "/match-rounds",
  },
  {
    id: "audit-log",
    label: "Nhật ký kiểm toán",
    icon: ScrollText,
    path: "/audit-log",
  },
  {
    id: "users",
    label: "Quản lý người dùng",
    icon: Users,
    path: "/users",
  },
  {
    id: "stories",
    label: "Câu chuyện",
    icon: BookOpen,
    path: "/stories",
  },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "Admin User";
  const avatarLetter = (user?.firstName?.charAt(0) || user?.email?.charAt(0) || "A").toUpperCase();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (itemPath: string) => {
    if (itemPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-72 shrink-0 flex-col border-r border-border/50 bg-card">

        {/* ── Logo header ── */}
        <div className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo/NACENTECH_Main-Logo-G.png"
              alt="Nacentech"
              className="h-12 w-12 object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-foreground">
                Hệ thống quản trị
              </p>
              <p className="truncate text-[11px] text-muted-foreground/70">
                Nền tảng đổi mới sáng tạo
              </p>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(19,127,121,0.25)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-primary-foreground/20 text-white"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <span className="flex-1 text-sm font-semibold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── User section with dropdown ── */}
        <div className="relative border-t border-border/40 p-3" ref={userMenuRef}>
          {/* Dropdown menu — opens upward */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg shadow-black/[0.08]">
              <div className="px-3 py-2.5 border-b border-border/40">
                <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-[11px] text-muted-foreground/60">Quản trị viên</p>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => { setShowUserMenu(false); navigate("/change-password"); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <KeyRound className="size-4" />
                  Đổi mật khẩu
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/8"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          {/* Trigger button */}
          <button
            type="button"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/70"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-[11px] text-muted-foreground/60">Quản trị viên</p>
            </div>
            <ChevronUp
              className={`size-3.5 shrink-0 text-muted-foreground/50 transition-transform ${
                showUserMenu ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
