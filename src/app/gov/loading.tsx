import React from "react";
import { WorkspaceRouteSkeleton } from "@/components/common/workspace-route-skeleton";

export default function GovLoading() {
  return (
    <WorkspaceRouteSkeleton
      testId="gov-route-skeleton"
      srText="Đang tải cổng quản trị nhà nước..."
    />
  );
}
