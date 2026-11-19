import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Lock, Mail, LayoutDashboard, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: LayoutDashboard, text: "Quản lý toàn bộ nội dung hệ thống" },
  { icon: Users,           text: "Phân quyền và giám sát người dùng" },
  { icon: ShieldCheck,     text: "Bảo mật đa lớp, truy cập kiểm soát" },
];

interface RedirectState {
  from?: { pathname?: string; search?: string; hash?: string };
  reason?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const defaultRedirectPath = "/dashboard";

  // B-11: `ProtectedRoute` đã ghi lại vị trí người dùng định tới khi đẩy họ về đây, và trang này chưa bao giờ
  // đọc nó — ai bấm một liên kết sâu lúc phiên hết hạn đều hạ cánh ở /dashboard rồi phải tự tìm đường về.
  const state = location.state as RedirectState | null;
  const from = state?.from;
  const redirectPath = from?.pathname
    ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
    : defaultRedirectPath;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  // B-18: vào nhầm cổng khác với gõ sai mật khẩu, và người dùng cần biết mình đang gặp cái nào.
  const [error, setError]       = useState(
    state?.reason === "not-admin" ? "Tài khoản này không có quyền truy cập bảng quản trị." : ""
  );
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(redirectPath, { replace: true });
  }, [redirectPath, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.error ?? "Đăng nhập thất bại. Kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Left brand panel ── */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden lg:flex lg:flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#0f4f4c_0%,#137f79_45%,#00a388_100%)]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
        {/* Glow blobs */}
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-[80px]" />
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          {/* Top: logo */}
          <div>
            <img
              src="/logo/NACENTECH_Main-Logo-G.png"
              alt="Nacentech"
              className="h-14 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Middle: headline + features */}
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80">
              Admin Portal
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-snug tracking-tight text-white xl:text-4xl">
              Nền tảng<br />đổi mới sáng tạo
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Bảng điều khiển quản trị tập trung cho hệ thống NACENTECH — theo dõi, phê duyệt và vận hành mọi hoạt động.
            </p>

            <ul className="mt-8 space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="size-4 text-white" />
                  </span>
                  <span className="text-sm text-white/80">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom: version tag */}
          <p className="text-[11px] text-white/40">© 2026 Nacentech · v2.0</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative flex flex-1 items-center justify-center bg-slate-50/80 px-6 py-12">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#0f4f4c_1px,transparent_1px),linear-gradient(to_bottom,#0f4f4c_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative z-10 w-full max-w-[420px]">
          {/* Mobile-only logo */}
          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <img src="/logo/NACENTECH_Main-Logo-G.png" alt="Nacentech" className="h-16 w-auto object-contain" />
            <p className="text-xs text-muted-foreground/60">Nền tảng đổi mới sáng tạo quốc gia</p>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-[2.5rem] border border-white bg-white/80 p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-xl md:p-10">
            <div className="mb-7">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Đăng nhập Admin
              </h2>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Nhập thông tin tài khoản quản trị để tiếp tục
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-white py-2.5 pr-4 pl-10 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-white py-2.5 pr-4 pl-10 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          </div>{/* /card */}

          <p className="mt-5 text-center text-xs text-muted-foreground/40">
            Chỉ tài khoản được cấp quyền mới có thể truy cập.
          </p>
        </div>
      </div>
    </div>
  );
}
