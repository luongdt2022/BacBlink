"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function GovLayout({ children: _children }: { children: React.ReactNode }) {
  return (
    <DeprecatedRouteNotice
      title="Phân hệ cũ đã ngừng vận hành (410 Gone)"
      description="Hệ thống BACLINK áp dụng mô hình phê duyệt 1 cấp tập trung bởi Ban Quản trị Hiệp hội (ADMIN). Đang chuyển hướng bạn về không gian làm việc hợp lệ."
    />
  );
}
