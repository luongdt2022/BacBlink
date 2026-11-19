"use client";

import React, { Suspense } from "react";
import PortalLayout from "@/app/portal/layout";

export default function ProfileUpgradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PortalLayout>{children}</PortalLayout>
    </Suspense>
  );
}
