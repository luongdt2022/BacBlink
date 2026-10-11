"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function BuyerWizardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/buyer/demands");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
        <ShoppingBag className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Đang chuyển hướng đến Không Gian Nhu Cầu Bên Mua...
      </h1>
      <p className="text-sm text-slate-500 max-w-md">
        Hồ sơ bài toán công nghệ và nhu cầu đổi mới sáng tạo được quản lý tập trung tại Cổng Doanh Nghiệp (Buyer Portal).
      </p>
      <Link
        href="/portal/buyer/demands"
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-lg font-semibold hover:bg-brand-800 transition"
      >
        <span>Đến Không Gian Nhu Cầu</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
