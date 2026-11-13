"use client";

import React from "react";
import { LmsManagementWorkspace } from "@/components/lms/LmsManagementWorkspace";

export default function ExpertElearningManagementPage() {
  return (
    <div className="w-full">
      <LmsManagementWorkspace portalRole="EXPERT" />
    </div>
  );
}
