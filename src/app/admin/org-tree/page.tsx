"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function OrgTreeRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Cây tổ chức 34 Sở KH&CN đã ngừng áp dụng (410 Gone)"
      description="Hệ thống BACLINK hoạt động tập trung tại tỉnh Bắc Ninh theo mô hình 3 cấp (ADMIN, ENTERPRISE, PUBLIC_USER), không còn phân cấp 34 Sở KH&CN."
    />
  );
}
