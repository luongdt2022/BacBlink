"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function AssessmentWizardRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Đường dẫn đã được chuyển đổi (410 Gone)"
      description="Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK) cập nhật trực tiếp hồ sơ năng lực sản xuất tại Không gian Hội viên."
      fallbackPath="/portal"
      fallbackLabel="Về Không gian Hội viên (/portal)"
    />
  );
}
