"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function CapacitySurveyRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Đang chuyển hướng đến Danh Bạ Doanh Nghiệp Hội Viên..."
      description="Tra cứu trực tiếp danh bạ doanh nghiệp hội viên và hồ sơ năng lực sản xuất của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)."
      fallbackPath="/doanh-nghiep-dmst"
      fallbackLabel="Đến Danh bạ Doanh nghiệp Hội viên (/doanh-nghiep-dmst)"
    />
  );
}
