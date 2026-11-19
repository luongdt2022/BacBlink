"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function KhaoSatCongNgheRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Đang chuyển hướng đến Sàn Cung Ứng & Năng Lực Sản Xuất..."
      description="Các doanh nghiệp hội viên BACLINK niêm yết trực tiếp sản phẩm, dây chuyền và năng lực gia công tại Sàn Cung Ứng."
      fallbackPath="/chao-ban-cong-nghe"
      fallbackLabel="Đến Sàn Cung Ứng Công Nghệ (/chao-ban-cong-nghe)"
    />
  );
}
