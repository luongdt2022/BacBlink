import { describe, expect, it } from "vitest";
import {
  resolveProvinceName,
  resolveRoleName,
  resolveRequestTypeLabel,
  resolveSectorName,
  resolveActionBadge,
} from "./label-resolver";

describe("T068 [FE-LabelResolver] Universal Label Resolver Verification", () => {
  it("resolves province codes to full Vietnamese names for 34 provinces", () => {
    expect(resolveProvinceName("HN")).toBe("TP. Hà Nội");
    expect(resolveProvinceName("SG")).toBe("TP. Hồ Chí Minh");
    expect(resolveProvinceName("HP")).toBe("TP. Hải Phòng");
    expect(resolveProvinceName("BN")).toBe("Tỉnh Bắc Ninh");
    expect(resolveProvinceName("ALL")).toBe("Toàn quốc (34 Tỉnh/Thành ĐMST)");
    expect(resolveProvinceName(null)).toBe("Toàn quốc (34 Tỉnh/Thành ĐMST)");
  });

  it("resolves role codes to human-readable Vietnamese roles", () => {
    expect(resolveRoleName("SUPER_ADMIN")).toBe("Quản trị Tối cao (NacenTech)");
    expect(resolveRoleName("PROVINCIAL_ADMIN")).toBe("Lãnh đạo Sở KH&CN Tỉnh/Thành");
    expect(resolveRoleName("CLUSTER_ADMIN")).toBe("Chuyên viên Thẩm định Sở Tỉnh");
    expect(resolveRoleName("SELLER")).toBe("Nhà Cung Ứng Công Nghệ");
    expect(resolveRoleName(null)).toBe("Chưa xác định vai trò");
  });

  it("resolves request type codes to user-friendly titles", () => {
    expect(resolveRequestTypeLabel("EXPERT")).toBe("Hồ sơ Chuyên gia KH&CN");
    expect(resolveRequestTypeLabel("SHOP")).toBe("Gian hàng Công nghệ (Shop)");
    expect(resolveRequestTypeLabel("DEMAND")).toBe("Bài toán Nhu cầu Công nghệ");
    expect(resolveRequestTypeLabel(null)).toBe("Hồ sơ Thẩm định");
  });

  it("resolves sector numbers and codes to TT17 domain names", () => {
    expect(resolveSectorName("01")).toBe("Công nghệ thông tin & Truyền thông");
    expect(resolveSectorName("SECTOR_02")).toBe("Năng lượng & Tự động hóa");
    expect(resolveSectorName("05")).toBe("Nông nghiệp Công nghệ cao & Chế biến Thực phẩm");
  });

  it("resolves action codes to Vietnamese badge labels and styles", () => {
    const approved = resolveActionBadge("APPROVED");
    expect(approved.label).toBe("Phê Duyệt");
    expect(approved.badgeClass).toContain("bg-emerald");

    const override = resolveActionBadge("OVERRIDE_APPROVE");
    expect(override.label).toBe("Can Thiệp Tầng 0");
    expect(override.badgeClass).toContain("bg-amber");

    const rejected = resolveActionBadge("REJECTED");
    expect(rejected.label).toBe("Từ Chối");
    expect(rejected.badgeClass).toContain("bg-rose");
  });
});
