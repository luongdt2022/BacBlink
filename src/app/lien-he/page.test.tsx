import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import LienHePage from "./page";
import { BACLINK_COMMITTEES, ORG } from "@/lib/constants/organization";

vi.mock("next/navigation", () => ({ usePathname: () => "/lien-he" }));
vi.mock("@/lib/cms-client", async (orig) => {
  const real = await orig<typeof import("@/lib/cms-client")>();
  return { ...real, cmsClient: { ...real.cmsClient, faqs: vi.fn().mockResolvedValue([{ id: "f1", question: "Câu hỏi mẫu?", answer: "Trả lời mẫu", sortOrder: 1, isPublic: true }]) } };
});

describe("/lien-he (REQ-BL08-CONTACT-009)", () => {
  afterEach(cleanup);

  it("có văn phòng từ ORG, biểu mẫu, đầu mối 9 ban, hợp tác/báo chí và FAQ từ CMS", async () => {
    render(<LienHePage />);
    expect(screen.getByText(ORG.address)).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Biểu mẫu gửi yêu cầu" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Liên hệ Ban/ })).toHaveLength(BACLINK_COMMITTEES.length);
    expect(await screen.findByRole("heading", { name: "Câu hỏi thường gặp" })).toBeInTheDocument();
    expect(screen.getByText("Câu hỏi mẫu?")).toBeInTheDocument();
    expect(document.getElementById("dau-moi-cac-ban")).not.toBeNull();
    expect(document.getElementById("cau-hoi-thuong-gap")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Hợp tác & tài trợ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Truyền thông & báo chí" })).toBeInTheDocument();
  });
});
