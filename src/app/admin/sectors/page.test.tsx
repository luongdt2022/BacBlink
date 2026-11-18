import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminSectorsPage from "./page";
import * as masterDataClient from "@/lib/master-data-client";

const rows = [
  { id: "sec-1", code: "IND_ELEC", name: "Điện tử, Bán dẫn & Thiết bị điện", vsicCode: "C26", isActive: true },
  { id: "sec-2", code: "IND_MECH", name: "Cơ khí chính xác, Khuôn mẫu & Chế tạo máy", vsicCode: "C28", isActive: true },
  { id: "sec-legacy", code: "LV01", name: "Lĩnh vực cũ đã ngừng", isActive: false },
];

const locationRows = [
  { code: "TP_BN", name: "TP. Bắc Ninh", locationType: "AREA" },
  { code: "KCN_VSIP_BN", name: "KCN VSIP Bắc Ninh", locationType: "KCN" },
];

vi.mock("@/lib/auth-client", () => ({ authClient: { getAuthHeaders: () => ({}) } }));

describe("Admin runtime sectors & Bac Ninh locations (BACLINK CR-BACLINK-007)", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    masterDataClient.invalidateSectorsCache();
    masterDataClient.invalidateLocationsCache();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => ({
        ok: true,
        json: async () => ({
          success: true,
          data: url.includes("locations") ? locationRows : url.includes("sectors") ? rows : [],
        }),
      }))
    );
  });

  afterEach(() => {
    masterDataClient.invalidateSectorsCache();
    masterDataClient.invalidateLocationsCache();
    cleanup();
  });

  it("renders only active IND_* sectors, VSIC column, and only 3 BACLINK tabs (purges tt17/tree/exhibitions & LV*)", async () => {
    const { container } = render(<AdminSectorsPage />);
    expect(await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện")).toBeInTheDocument();
    expect(screen.getByText("Cơ khí chính xác, Khuôn mẫu & Chế tạo máy")).toBeInTheDocument();
    expect(screen.queryByText("Lĩnh vực cũ đã ngừng")).not.toBeInTheDocument();
    expect(screen.queryByText("LV01")).not.toBeInTheDocument();

    // Column header check
    expect(screen.getByText("Mã VSIC / Phân ngành")).toBeInTheDocument();

    // Only 3 BACLINK tabs exist
    expect(screen.getByRole("button", { name: /Ngành công nghiệp BACLINK \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Địa bàn & KCN Bắc Ninh/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ma trận Năng lực & TRL/i })).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /Phân Ngành TT17/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cây Taxonomy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sự Kiện Kết Nối/i })).not.toBeInTheDocument();

    const text = container.textContent || "";
    expect(text).not.toMatch(/TT17|Thông tư 17|Bộ KH&CN|34 tỉnh/i);
  });

  it("filters runtime IND_* names", async () => {
    render(<AdminSectorsPage />);
    await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện");
    fireEvent.change(screen.getByPlaceholderText(/Tìm theo tên ngành/i), {
      target: { value: "Khuôn mẫu" },
    });
    expect(screen.getByText("Cơ khí chính xác, Khuôn mẫu & Chế tạo máy")).toBeInTheDocument();
    expect(screen.queryByText("Điện tử, Bán dẫn & Thiết bị điện")).not.toBeInTheDocument();
  });

  it("empty response does not manufacture seed data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })
    );
    render(<AdminSectorsPage />);
    expect(await screen.findByText("Không có ngành công nghiệp phù hợp.")).toBeInTheDocument();
    expect(screen.queryByText("IND_ELEC")).not.toBeInTheDocument();
    expect(screen.queryByText("LV01")).not.toBeInTheDocument();
  });

  it("read error does not manufacture seed data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<AdminSectorsPage />);
    expect(await screen.findByText("Không tải được danh mục ngành công nghiệp.")).toBeInTheDocument();
    expect(screen.queryByText("IND_ELEC")).not.toBeInTheDocument();
  });

  it("rejects non-IND_* sector codes via ^IND_[A-Z0-9_]+$ validation", async () => {
    render(<AdminSectorsPage />);
    await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện");
    fireEvent.click(screen.getByRole("button", { name: /Thêm Ngành Công Nghiệp/ }));
    fireEvent.change(screen.getByPlaceholderText(/VD: IND_SEMI/i), { target: { value: "LV19" } });
    fireEvent.change(screen.getByPlaceholderText(/VD: Công nghiệp Bán dẫn/i), {
      target: { value: "Ngành không hợp lệ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu Ngành" }));
    expect(await screen.findByText(/Mã ngành phải theo định dạng chuẩn 'IND_\*'/i)).toBeInTheDocument();
  });

  it("network failure on create keeps form open without local row", async () => {
    render(<AdminSectorsPage />);
    await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện");
    fireEvent.click(screen.getByRole("button", { name: /Thêm Ngành Công Nghiệp/ }));
    fireEvent.change(screen.getByPlaceholderText(/VD: IND_SEMI/i), { target: { value: "IND_SEMI" } });
    fireEvent.change(screen.getByPlaceholderText(/VD: Công nghiệp Bán dẫn/i), {
      target: { value: "Công nghiệp Bán dẫn" },
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    fireEvent.click(screen.getByRole("button", { name: "Lưu Ngành" }));
    await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Thêm Ngành Công Nghiệp Mới" })).toBeInTheDocument();
    expect(screen.queryByText("IND_SEMI")).not.toBeInTheDocument();
  });

  it("calls invalidateSectorsCache() after creating an IND_* sector", async () => {
    const invalidateSpy = vi.spyOn(masterDataClient, "invalidateSectorsCache");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, opts?: RequestInit) => {
        if (opts?.method === "POST") {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { id: "sec-new", code: "IND_SEMI", name: "Công nghiệp Bán dẫn", vsicCode: "C261", isActive: true },
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: url.includes("locations") ? locationRows : url.includes("sectors") ? rows : [],
          }),
        };
      })
    );

    render(<AdminSectorsPage />);
    await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện");
    fireEvent.click(screen.getByRole("button", { name: /Thêm Ngành Công Nghiệp/ }));
    fireEvent.change(screen.getByPlaceholderText(/VD: IND_SEMI/i), { target: { value: "IND_SEMI" } });
    fireEvent.change(screen.getByPlaceholderText(/VD: Công nghiệp Bán dẫn/i), {
      target: { value: "Công nghiệp Bán dẫn" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu Ngành" }));

    expect(await screen.findByText("Công nghiệp Bán dẫn")).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("opens safe confirmation dialog when deactivating sector, sends DELETE, and invalidates cache", async () => {
    const invalidateSpy = vi.spyOn(masterDataClient, "invalidateSectorsCache");
    const rowsWithId = [
      { id: "sec-elec", code: "IND_ELEC", name: "Điện tử, Bán dẫn & Thiết bị điện", isActive: true, filterRuleCount: 3, vsicCode: "C26" },
    ];
    const fetchSpy = vi.fn(async (url: string, opts?: RequestInit) => {
      if (opts?.method === "DELETE") return { ok: true, json: async () => ({ success: true }) };
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: url.includes("locations") ? locationRows : url.includes("sectors") ? rowsWithId : [],
        }),
      };
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(<AdminSectorsPage />);
    expect(await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện")).toBeInTheDocument();

    const deactBtn = screen.getByRole("button", { name: "Ngừng hoạt động" });
    fireEvent.click(deactBtn);

    expect(screen.getByText("Xác Nhận Ngừng Hoạt Động Lĩnh Vực")).toBeInTheDocument();
    expect(screen.getAllByText(/3 quy tắc lọc/i).length).toBeGreaterThanOrEqual(1);

    const confirmBtn = screen.getByRole("button", { name: "Xác Nhận Ngừng Hoạt Động" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      const deleteCall = fetchSpy.mock.calls.find(([, opts]) => (opts as RequestInit)?.method === "DELETE");
      expect(deleteCall).toBeDefined();
    });
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("renders Bac Ninh locations & KCN tab from /api/v1/master-data/locations and filters AREA vs KCN", async () => {
    render(<AdminSectorsPage />);
    await screen.findByText("Điện tử, Bán dẫn & Thiết bị điện");

    fireEvent.click(screen.getByRole("button", { name: /Địa bàn & KCN Bắc Ninh/i }));
    expect(await screen.findByText("TP. Bắc Ninh")).toBeInTheDocument();
    expect(screen.getByText("KCN VSIP Bắc Ninh")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "KCN trọng điểm" }));
    expect(screen.getByText("KCN VSIP Bắc Ninh")).toBeInTheDocument();
    expect(screen.queryByText("TP. Bắc Ninh")).not.toBeInTheDocument();
  });
});
