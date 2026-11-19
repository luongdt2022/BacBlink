"use client";

import React from "react";
import { LmsManagementWorkspace } from "@/components/lms/LmsManagementWorkspace";

export default function AdminElearningManagementPage() {
  return (
    <div className="w-full">
      <LmsManagementWorkspace portalRole="ADMIN" />
    </div>
  );
}
