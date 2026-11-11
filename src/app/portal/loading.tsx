import React from "react";
import { WorkspaceRouteSkeleton } from "@/components/common/workspace-route-skeleton";

export default function PortalLoading() {
  return (
    <WorkspaceRouteSkeleton
      testId="portal-route-skeleton"
      srText="Đang tải không gian làm việc..."
    />
  );
}
