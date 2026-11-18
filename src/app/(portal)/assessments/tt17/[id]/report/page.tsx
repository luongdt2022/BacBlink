"use client";

import React from "react";
import { DeprecatedRouteNotice } from "@/components/common/deprecated-route-notice";

export default function AssessmentReportRetiredPage() {
  return (
    <DeprecatedRouteNotice
      title="Đường dẫn đã được chuyển đổi (410 Gone)"
      description="Báo cáo năng lực sản xuất của doanh nghiệp hội viên được tích hợp trực tiếp tại Không gian Hội viên BACLINK."
      fallbackPath="/portal"
      fallbackLabel="Về Không gian Hội viên (/portal)"
    />
  );
}
