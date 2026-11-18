"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function DeepSurveyRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Đang chuyển hướng đến Bảng Nhu Cầu Mua & Đặt Hàng..."
      description="Các doanh nghiệp hội viên BACLINK đăng trực tiếp nhu cầu mua sắm, đặt hàng gia công và tìm kiếm nhà cung ứng tại Bảng Nhu Cầu."
      fallbackPath="/nhu-cau-cong-nghe"
      fallbackLabel="Đến Bảng Nhu Cầu Mua & Đặt Hàng (/nhu-cau-cong-nghe)"
    />
  );
}
