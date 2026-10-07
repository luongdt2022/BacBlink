import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ExpertDashboard, expertDashboardTodos } from "./expert-dashboard";
import type { ExpertPrivateDetail } from "@/lib/expert-detail";
import { authClient } from "@/lib/auth-client";

vi.mock("next/link", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));

const profile: ExpertPrivateDetail = {
  phone: null, email: null, organizationAddress: null, pdpdConsent: true, legalOath: true, status: "APPROVED", activeDocumentTypes: [],
  publicProfile: { expertCode: "CG-DEMO", fullName: "Nguyễn Minh An", academicRank: "PGS", degree: "DOCTOR", birthYear: 1980, gender: "male", organizationName: "NacenTech", positionTitle: null, publicBio: null, expertiseSectors: [], masteredTechCodes: [], isVerified: true, isAcceptingConsultation: false, training: [], employment: [], patents: [], researchProjects: [], publications: [], practicalProjects: [], awards: [] },
};

describe("ExpertDashboard", () => {
  beforeEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); authClient.setSession("real-token", { id: "person-1", email: "expert@test.local", fullName: "Nguyễn Minh An", role: "VERIFIED_EXPERT" }); });

  it("derives only profile work items, not marketplace cards", () => {
    expect(expertDashboardTodos(profile).map(x => x.title)).toEqual(["Bổ sung thông tin liên hệ", "Tải chứng từ xác minh", "Rà soát công trình tiêu biểu"]);
  });

  it("renders the expert dashboard from the owner detail API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: profile }) }));
    render(<ExpertDashboard />);
    expect(await screen.findByText("Dashboard chuyên gia")).toBeInTheDocument();
    expect(screen.getByText("Việc cần làm")).toBeInTheDocument();
    expect(screen.getByText("Bổ sung thông tin liên hệ")).toBeInTheDocument();
    expect(screen.queryByText("Gian hàng Công nghệ")).not.toBeInTheDocument();
  });
});
