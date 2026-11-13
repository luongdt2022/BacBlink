import React from "react";
import { WorkspaceRouteSkeleton } from "@/components/common/workspace-route-skeleton";

export default function PortalGroupLoading() {
  return (
    <div className="p-3 sm:p-4">
      <WorkspaceRouteSkeleton
        testId="portal-route-skeleton"
        srText="Đang tải không gian làm việc..."
      />
    </div>
  );
}
