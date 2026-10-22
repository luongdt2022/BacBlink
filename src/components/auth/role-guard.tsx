"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, UserContext, getRedirectPathByRole } from "@/lib/auth-client";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  portalName?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  portalName = "Cổng chức năng",
}: RoleGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserContext | null>(null);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const currentUser = authClient.getUser();
    setUser(currentUser);

    if (!currentUser) {
      setAuthorized(false);
      setChecking(false);
      return;
    }

    if (!allowedRoles || allowedRoles.length === 0) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const currentRole = currentUser.role?.toUpperCase();
    const hasRole = allowedRoles.map((r) => r.toUpperCase()).includes(currentRole);

    setAuthorized(hasRole);
    setChecking(false);
  }, [allowedRoles]);

  if (checking) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-body text-slate-500 font-medium dark:text-slate-300">Đang kiểm tra quyền truy cập hệ thống...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-8 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-card-title">Yêu cầu Đăng nhập</h3>
          <p className="text-body text-slate-600 dark:text-slate-400 leading-relaxed">
            Bạn cần đăng nhập bằng tài khoản có thẩm quyền để truy cập vào không gian <strong>{portalName}</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-label font-bold transition shadow-sm focus-ring min-h-11 inline-flex items-center justify-center"
            >
              <LogIn className="w-4 h-4" />
              <span>Đi đến trang Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    const userTargetPortal = getRedirectPathByRole(user.role);

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-surface p-8 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-card-title">Truy cập bị từ chối (403 Forbidden)</h3>
          <p className="text-body text-slate-600 dark:text-slate-400 leading-relaxed">
            Tài khoản của bạn có vai trò <strong>{user.role}</strong>, không thuộc danh sách thẩm quyền truy cập vào <strong>{portalName}</strong>.
          </p>
          <div className="pt-2">
            <Link
              href={userTargetPortal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-label font-bold transition shadow-sm focus-ring min-h-11 inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Cổng làm việc của bạn</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
