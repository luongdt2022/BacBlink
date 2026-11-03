"use client";

import React from "react";
import { LmsManagementWorkspace } from "@/components/lms/LmsManagementWorkspace";

export default function AdminElearningManagementPage() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <LmsManagementWorkspace portalRole="ADMIN" />
    </div>
  );
}
