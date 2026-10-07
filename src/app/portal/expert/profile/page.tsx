import { ExpertOwnerDetailPage } from "@/components/expert-detail/profile-detail";
import { RoleGuard } from "@/components/auth/role-guard";
import { ROLES } from "@/lib/auth-client";

export default function ExpertOwnerProfileRoute() {
  return <RoleGuard allowedRoles={[ROLES.VERIFIED_EXPERT]} portalName="Hồ sơ chuyên gia"><ExpertOwnerDetailPage /></RoleGuard>;
}
