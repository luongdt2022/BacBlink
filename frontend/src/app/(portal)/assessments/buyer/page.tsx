"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function BuyerWizardPage() {
  return (
    <DeprecatedRouteNotice
      title="Đang chuyển hướng đến Bảng Nhu Cầu Mua & Đặt Hàng..."
      description="Chức năng đăng bài toán đặt hàng và tìm kiếm nhà cung ứng công nghiệp được thực hiện trực tiếp tại Sàn Nhu Cầu BACLINK."
      fallbackPath="/nhu-cau-cong-nghe"
      fallbackLabel="Đến Bảng Nhu Cầu Mua & Đặt Hàng (/nhu-cau-cong-nghe)"
    />
  );
}
