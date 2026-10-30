import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import EnterprisesDirectoryView from "./EnterprisesDirectoryView";
import * as masterDataClient from "@/lib/master-data-client";
import * as enterpriseClient from "@/lib/enterprise-client";

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/enterprises",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockSectors: masterDataClient.SectorOption[] = [
  { code: "LV01", name: "Nông nghiệp, lâm nghiệp và thủy sản" },
  { code: "LV02", name: "Khai khoáng" },
  { code: "LV03", name: "Công nghiệp chế biến, chế tạo" },
  { code: "LV04", name: "Sản xuất và phân phối điện, khí đốt" },
  { code: "LV05", name: "Chế biến thực phẩm và đồ uống" },
  { code: "LV06", name: "Dệt, may và da giày" },
  { code: "LV07", name: "Cơ khí, luyện kim và chế tạo thiết bị" },
  { code: "LV08", name: "Công nghệ thông tin và truyền thông" },
  { code: "LV09", name: "Hóa chất và dược phẩm y tế" },
  { code: "LV10", name: "Vật liệu mới và công nghệ sinh học" },
];

const mockDirectoryResponse: enterpriseClient.EnterpriseDirectoryResponse = {
  items: [
    {
      id: "ent-01",
      name: "CÔNG TY CP CƠ ĐIỆN TÂN TIẾN",
      taxCode: "0102030405",
      subjectType: "ENTERPRISE",
      provinceCity: "Hà Nội",
      mainSectorName: "Cơ khí, luyện kim và chế tạo thiết bị",
      sectorCode: "LV07",
      isVerified: true,
      tniScore: 82,
      tniClassification: "HIGH",
      ipCount: 3,
      status: "ACTIVE",
    },
  ],
  totalCount: 1,
  page: 1,
  pageSize: 12,
  totalPages: 1,
};

describe("EnterprisesDirectoryView (T-02.77 - CR-2026-011)", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    vi.spyOn(masterDataClient, "getActiveSectors").mockResolvedValue(mockSectors);
    vi.spyOn(enterpriseClient, "fetchEnterprises").mockResolvedValue(mockDirectoryResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("loads 10 SSOT sectors dynamically from getActiveSectors() and renders in select dropdown", async () => {
    render(<EnterprisesDirectoryView />);

    const select = await screen.findByLabelText(/Lĩnh Vực Công Nghệ TT17/i);

    await waitFor(() => {
      expect(select).not.toBeDisabled();
      expect(select.querySelectorAll("option").length).toBe(11);
    });

    const optionValues = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(optionValues).toContain("LV01");
    expect(optionValues).toContain("LV05");
    expect(optionValues).toContain("LV07");
    expect(optionValues).toContain("LV10");

    const optionTexts = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(optionTexts).toContain("Nông nghiệp, lâm nghiệp và thủy sản");
    expect(optionTexts).toContain("Cơ khí, luyện kim và chế tạo thiết bị");
    expect(optionTexts).toContain("Chế biến thực phẩm và đồ uống");
  });

  it("triggers fetchEnterprises with correct sectorCode when user changes sector filter", async () => {
    render(<EnterprisesDirectoryView />);

    const select = await screen.findByLabelText(/Lĩnh Vực Công Nghệ TT17/i);

    await waitFor(() => {
      expect(select).not.toBeDisabled();
    });

    fireEvent.change(select, { target: { value: "LV07" } });

    await waitFor(() => {
      expect(enterpriseClient.fetchEnterprises).toHaveBeenCalledWith(
        expect.objectContaining({
          sectorCode: "LV07",
        })
      );
    });
  });

  it("handles sectors loading error gracefully without crashing", async () => {
    vi.spyOn(masterDataClient, "getActiveSectors").mockRejectedValue(new Error("Network failed"));

    render(<EnterprisesDirectoryView />);

    await waitFor(() => {
      expect(screen.getByText("Lỗi tải lĩnh vực (chọn tất cả)")).toBeInTheDocument();
    });
  });
});
