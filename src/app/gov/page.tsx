"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function GovRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Cổng Công Vụ cấp Sở KH&CN đã ngừng vận hành (410 Gone)"
      description="Phân hệ /gov/* đã được gỡ bỏ theo kiến trúc 3 cấp BACLINK. Vui lòng sử dụng không gian làm việc tương ứng với vai trò của bạn."
    />
  );
}
