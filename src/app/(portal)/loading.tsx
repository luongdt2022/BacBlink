import React from "react";
import { WorkspaceRouteSkeleton } from "@/components/common/workspace-route-skeleton";

export default function PortalGroupLoading() {
  return (
    <div className="p-4 sm:p-8">
      <WorkspaceRouteSkeleton
        testId="portal-route-skeleton"
        srText="Đang tải không gian làm việc..."
      />
    </div>
  );
}
