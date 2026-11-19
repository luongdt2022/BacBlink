"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function GovRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Phân hệ cũ đã ngừng vận hành (410 Gone)"
      description="Theo kiến trúc phân quyền 3 cấp của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK), đường dẫn này đã được gỡ bỏ. Vui lòng sử dụng không gian làm việc tương ứng với vai trò của bạn."
    />
  );
}
