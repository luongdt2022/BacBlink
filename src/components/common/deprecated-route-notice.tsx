"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Ban } from "lucide-react";
import { authClient, getRedirectPathByRole, normalizePlatformRole } from "@/lib/auth-client";

interface DeprecatedRouteNoticeProps {
  title?: string;
  description?: string;
}

export function DeprecatedRouteNotice({
  title = "Phân hệ không còn áp dụng (410 Gone)",
  description = "Theo kiến trúc phân quyền 3 cấp BACLINK, phân hệ quản trị theo Sở/Ngành và cây 34 tỉnh/thành đã được gỡ bỏ và hợp nhất về quy trình 1 cấp.",
}: DeprecatedRouteNoticeProps) {
  const router = useRouter();
  const [targetPath, setTargetPath] = useState<string>("/");
  const [targetLabel, setTargetLabel] = useState<string>("Về Trang chủ BACLINK");

  useEffect(() => {
    const user = authClient.getUser();
    const role = normalizePlatformRole(user?.role);
    const destination = user ? getRedirectPathByRole(user.role) : "/";

    setTargetPath(destination);
    if (role === "ADMIN" && user) {
      setTargetLabel("Về Trung tâm Quản trị (/admin)");
    } else if (role === "ENTERPRISE" && user) {
      setTargetLabel("Về Workspace Doanh nghiệp (/portal)");
    } else {
      setTargetLabel("Về Trang chủ BACLINK (/)");
    }

    router.replace(destination);
  }, [router]);

  return (
    <div
      data-testid="deprecated-route-410"
      className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
          <Ban className="w-6 h-6" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
          410 Gone
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        <div className="pt-2">
          <Link
            href={targetPath}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition shadow-xs"
          >
            <span>{targetLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
