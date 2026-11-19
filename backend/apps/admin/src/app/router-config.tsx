import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { LoginPage, ProtectedRoute } from "@/features/auth";
import { UserManagementPage, UserProfilePage } from "@/features/users";
import {
  ImplementationsPage,
  ImplementationDetailPage,
  CreateImplementationPage,
} from "@/features/implementations";
import {
  IntakesPage,
  CreateIntakePage,
  IntakeDetailPage,
  EditIntakePage,
  IpsPage,
  ChallengesPage,
  IpDetailPage,
  ChallengeDetailPage,
  CreateIpPage,
  CreateChallengePage,
  EditIpPage,
  EditChallengePage,
} from "@/features/intakes";
import { NotFoundPage } from "@/shared/components/NotFoundPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { StoriesPage, StoryFormPage, StoryDetailPage } from "@/features/stories";
import { AuditLogPage } from "@/features/audit";
import { CasesPage, CaseDetailPage } from "@/features/cases";
import { PolicySnapshotPage } from "@/features/policy";
import { MatchRoundsPage, RoundDetailPage, CompareRoundsPage } from "@/features/matching";
import { SignalsPage } from "@/features/signals";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "users",
        element: <UserManagementPage />,
      },
      {
        path: "user-profile/:id",
        element: <UserProfilePage />,
      },
      {
        path: "implementations",
        element: <ImplementationsPage />,
      },
      {
        path: "implementations/create",
        element: <CreateImplementationPage />,
      },
      {
        path: "implementations/detail",
        element: <ImplementationDetailPage />,
      },
      {
        path: "intakes",
        element: <IntakesPage />,
      },
      {
        path: "intakes/create",
        element: <CreateIntakePage />,
      },
      {
        path: "intakes/detail",
        element: <IntakeDetailPage />,
      },
      {
        path: "intakes/edit",
        element: <EditIntakePage />,
      },
      {
        path: "ips",
        element: <IpsPage />,
      },
      {
        path: "ips/create",
        element: <CreateIpPage />,
      },
      {
        path: "ips/detail",
        element: <IpDetailPage />,
      },
      {
        path: "ips/edit",
        element: <EditIpPage />,
      },
      {
        path: "challenges",
        element: <ChallengesPage />,
      },
      {
        path: "challenges/create",
        element: <CreateChallengePage />,
      },
      {
        path: "challenges/detail",
        element: <ChallengeDetailPage />,
      },
      {
        path: "challenges/edit",
        element: <EditChallengePage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        // Bộ lọc nằm trong query string chứ không trong đường dẫn: một liên kết kèm bộ lọc là thao tác chính
        // của màn hình này, và bốn ô lọc không map được vào tham số đường dẫn.
        path: "audit-log",
        element: <AuditLogPage />,
      },
      {
        // Định danh nằm trong ĐƯỜNG DẪN (`/cases/:id`), bộ lọc danh sách nằm trong query string. Ba màn hình
        // này là ba màn hình đầu tiên của bảng quản trị làm đúng điều `nen-tang/dieu-huong-va-url.md` đòi.
        path: "cases",
        children: [
          { index: true, element: <CasesPage /> },
          { path: ":id", element: <CaseDetailPage /> },
        ],
      },
      {
        path: "policy-snapshots/:id",
        element: <PolicySnapshotPage />,
      },
      {
        path: "demand-signals",
        element: <SignalsPage />,
      },
      {
        path: "match-rounds",
        children: [
          { index: true, element: <MatchRoundsPage /> },
          // Hai đường cố định đứng TRƯỚC đường có hai tham số, để "compare" và "rounds" không bị đọc thành `:kind`.
          { path: "compare", element: <CompareRoundsPage /> },
          { path: "rounds/:roundId", element: <RoundDetailPage /> },
          { path: ":kind/:id", element: <MatchRoundsPage /> },
        ],
      },
      {
        path: "stories",
        children: [
          {
            index: true,
            element: <StoriesPage />,
          },
          {
            path: "create",
            element: <StoryFormPage />,
          },
          {
            path: ":id",
            element: <StoryDetailPage />,
          },
          {
            path: ":id/edit",
            element: <StoryFormPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
