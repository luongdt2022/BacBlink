import { describe, expect, it } from "vitest";
import {
  resolveProvinceName,
  resolveLocationName,
  resolveRoleName,
  resolveRequestTypeLabel,
  resolveSectorName,
  resolveActionBadge,
  formatApprovalRecordCode,
} from "./label-resolver";

describe("T068 [FE-LabelResolver] Universal Label Resolver Verification (BACLINK IND_* & Bac Ninh Locations)", () => {
  it("resolves Bac Ninh area and KCN codes to Vietnamese names", () => {
    expect(resolveProvinceName("TP_BN")).toBe("TP. Bắc Ninh");
    expect(resolveProvinceName("TU_SON")).toBe("TP. Từ Sơn");
    expect(resolveProvinceName("QUE_VO")).toBe("TX. Quế Võ");
    expect(resolveProvinceName("THUAN_THANH")).toBe("TX. Thuận Thành");
    expect(resolveProvinceName("YEN_PHONG")).toBe("H. Yên Phong");
    expect(resolveProvinceName("TIEN_DU")).toBe("H. Tiên Du");
    expect(resolveProvinceName("GIA_BINH")).toBe("H. Gia Bình");
    expect(resolveProvinceName("LUONG_TAI")).toBe("H. Lương Tài");
    expect(resolveProvinceName("NGOAI_TINH")).toBe("Ngoài tỉnh / Đối tác FDI");
    expect(resolveLocationName("KCN_VSIP_BN")).toBe("KCN VSIP Bắc Ninh");
    expect(resolveLocationName("KCN_YEN_PHONG_1")).toBe("KCN Yên Phong I");
    expect(resolveProvinceName("ALL")).toBe("Tất cả Địa bàn & KCN Bắc Ninh");
    expect(resolveProvinceName(null)).toBe("Tất cả Địa bàn & KCN Bắc Ninh");
  });

  it("resolves all 8 BACLINK IND_* sector codes and supports legacy TT17 codes", () => {
    expect(resolveSectorName("IND_ELEC")).toBe("Điện tử, Bán dẫn & Thiết bị điện");
    expect(resolveSectorName("IND_MECH")).toBe("Cơ khí chính xác, Khuôn mẫu & Chế tạo máy");
    expect(resolveSectorName("IND_AUTO")).toBe("Tự động hóa, Robot & Smart Factory");
    expect(resolveSectorName("IND_PLAS")).toBe("Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp");
    expect(resolveSectorName("IND_MAT")).toBe("Vật liệu mới & Công nghiệp hỗ trợ");
    expect(resolveSectorName("IND_IT")).toBe("Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP");
    expect(resolveSectorName("IND_GREEN")).toBe("Công nghiệp xanh, Năng lượng sạch & ESG");
    expect(resolveSectorName("IND_LOG")).toBe("Logistics công nghiệp, Kho vận & Chuỗi cung ứng");
    expect(resolveSectorName("ind_elec")).toBe("Điện tử, Bán dẫn & Thiết bị điện");
    expect(resolveSectorName("IND_ELEC", { IND_ELEC: "Điện tử tùy chỉnh" })).toBe("Điện tử tùy chỉnh");
    expect(resolveSectorName("01")).toBe("Công nghệ thông tin & Truyền thông");
    expect(resolveSectorName("SECTOR_02")).toBe("Năng lượng & Tự động hóa");
  });

  it("resolves role codes to human-readable Vietnamese BACLINK 3-tier roles", () => {
    expect(resolveRoleName("ADMIN")).toBe("Quản trị Hiệp hội (BACLINK)");
    expect(resolveRoleName("SUPER_ADMIN")).toBe("Quản trị Hiệp hội (BACLINK)");
    expect(resolveRoleName("ENTERPRISE")).toBe("Doanh nghiệp Hội viên");
    expect(resolveRoleName("PROVINCIAL_ADMIN")).toBe("Điều phối Địa bàn BACLINK");
    expect(resolveRoleName("SECTOR_ADMIN")).toBe("Điều phối Ngành Công nghiệp BACLINK");
    expect(resolveRoleName("CLUSTER_ADMIN")).toBe("Chuyên viên Thẩm định Kỹ thuật BACLINK");
    expect(resolveRoleName("SELLER")).toBe("Nhà Cung Ứng Sản Phẩm / Công Nghệ");
    expect(resolveRoleName(null)).toBe("Chưa xác định vai trò");
  });

  it("resolves request type codes to user-friendly BACLINK titles without ĐMST", () => {
    expect(resolveRequestTypeLabel("EXPERT")).toBe("Ban Cố Vấn Kỹ Thuật");
    expect(resolveRequestTypeLabel("SHOP")).toBe("Chào Bán Sản Phẩm / Công Nghệ");
    expect(resolveRequestTypeLabel("DEMAND")).toBe("Nhu Cầu Mua & Đặt Hàng");
    expect(resolveRequestTypeLabel("FACILITY")).toBe("Doanh Nghiệp Hội Viên");
    expect(resolveRequestTypeLabel("ENTERPRISE")).toBe("Doanh Nghiệp Hội Viên");
    expect(resolveRequestTypeLabel("ACCOUNT")).toBe("Tài Khoản Doanh Nghiệp Hội Viên");
    expect(resolveRequestTypeLabel(null)).toBe("Hồ sơ Thẩm định");
  });

  it("T094: formatApprovalRecordCode formats UUIDs into friendly #HS-XXXXXX codes", () => {
    expect(formatApprovalRecordCode("01928001-0000-7000-8000-000000058915")).toBe("#HS-058915");
    expect(formatApprovalRecordCode("abc-123456")).toBe("#HS-123456");
    expect(formatApprovalRecordCode("short")).toBe("#HS-SHORT");
    expect(formatApprovalRecordCode(null)).toBe("#HS-000000");
  });

  it("resolves action codes to Vietnamese badge labels and styles", () => {
    const approved = resolveActionBadge("APPROVED");
    expect(approved.label).toBe("Phê Duyệt");
    expect(approved.badgeClass).toContain("bg-emerald");

    const override = resolveActionBadge("OVERRIDE_APPROVE");
    expect(override.label).toBe("Phê Duyệt Đặc Biệt");
    expect(override.badgeClass).toContain("bg-amber");

    const rejected = resolveActionBadge("REJECTED");
    expect(rejected.label).toBe("Từ Chối");
    expect(rejected.badgeClass).toContain("bg-rose");
  });
});
