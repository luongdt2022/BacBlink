import { ExpertDashboard } from "@/components/expert-detail/expert-dashboard";
import { RoleGuard } from "@/components/auth/role-guard";
import { ROLES } from "@/lib/auth-client";

export default function ExpertOwnerProfileRoute() {
  return (
    <RoleGuard allowedRoles={[ROLES.VERIFIED_EXPERT, ROLES.EXPERT]} portalName="Hồ sơ chuyên gia">
      <ExpertDashboard />
    </RoleGuard>
  );
}
