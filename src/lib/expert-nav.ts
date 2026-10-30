/**
 * Expert Workspace Active Menu Resolver
 * Triệt tiêu xung đột active menu giữa 7 route chuyên biệt theo CR-2026-006 (Delta v1.3)
 */

export type ExpertMenuKey =
  | "account"
  | "profile"
  | "profile-edit"
  | "consultations"
  | "radar"
  | "projects"
  | "contracts"
  | "orders-demands";

export function resolveExpertActiveMenu(pathname: string): ExpertMenuKey {
  if (!pathname) return "profile";

  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  if (cleanPath === "/portal/expert/account" || cleanPath.startsWith("/portal/expert/account/")) {
    return "account";
  }

  if (cleanPath === "/portal/expert/profile/edit" || cleanPath.startsWith("/portal/expert/profile/edit/")) {
    return "profile-edit";
  }

  if (
    cleanPath === "/portal/expert/profile" ||
    cleanPath === "/portal/expert/dashboard" ||
    cleanPath === "/portal/expert" ||
    cleanPath === "/portal"
  ) {
    return "profile";
  }

  if (cleanPath === "/portal/expert/consultations" || cleanPath.startsWith("/portal/expert/consultations/")) {
    return "consultations";
  }

  if (
    cleanPath === "/portal/matching/radar" ||
    cleanPath.startsWith("/portal/matching/radar/") ||
    cleanPath === "/portal/expert/radar" ||
    cleanPath.startsWith("/portal/expert/radar/")
  ) {
    return "radar";
  }

  if (cleanPath === "/portal/expert/projects" || cleanPath.startsWith("/portal/expert/projects/")) {
    return "projects";
  }

  if (
    cleanPath === "/portal/buyer/demands" ||
    cleanPath.startsWith("/portal/buyer/demands/") ||
    cleanPath === "/portal/orders" ||
    cleanPath === "/portal/expert/orders"
  ) {
    return "orders-demands";
  }

  if (cleanPath === "/portal/expert/contracts" || cleanPath.startsWith("/portal/expert/contracts/")) {
    return "contracts";
  }

  // Fallback if inside expert namespace
  if (cleanPath.startsWith("/portal/expert/profile/")) {
    return "profile";
  }

  return "profile";
}
