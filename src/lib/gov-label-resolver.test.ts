import { describe, expect, it } from "vitest";
import {
  BACLINK_SECTORS_MAP,
  MASTER_SECTORS_MAP,
  VSIC_MANUFACTURING_MAP,
  resolveProvinceName,
  resolveSectorName,
  resolveTrlInfo,
  resolveIpStatusInfo,
  resolveTt17Classification,
  resolveTniUrgency,
  resolveGovRequestType,
  resolveRoleDisplayName,
  formatGovRecordCode,
} from "./gov-label-resolver";
import { BAC_NINH_LOCATIONS } from "./constants/provinces";

describe("T080 [FE-LabelResolver] GovLabelResolver Unit Tests", () => {
  describe("resolveSectorName", () => {
    it("resolves all 8 BACLINK IND_* sectors", () => {
      expect(Object.keys(BACLINK_SECTORS_MAP)).toHaveLength(8);
      for (const [code, expectedName] of Object.entries(BACLINK_SECTORS_MAP)) {
        expect(resolveSectorName(code)).toBe(expectedName);
      }
      expect(resolveSectorName("ind_elec")).toBe("Điện tử, Bán dẫn & Thiết bị điện");
    });

    it("resolves all 18 TT17 sectors (CN01 to CN18)", () => {
      expect(Object.keys(MASTER_SECTORS_MAP)).toHaveLength(18);
      for (const [code, expectedName] of Object.entries(MASTER_SECTORS_MAP)) {
        expect(resolveSectorName(code)).toBe(expectedName);
      }
      expect(resolveSectorName("CN01")).toBe("Công nghệ thông tin và truyền thông");
      expect(resolveSectorName("CN06")).toBe("Công nghệ sinh học trong nông nghiệp");
      expect(resolveSectorName("CN18")).toBe("Công nghệ số hóa di sản và văn hóa");
    });

    it("resolves all 23 VSIC manufacturing sub-sectors (C.10 to C.32)", () => {
      expect(Object.keys(VSIC_MANUFACTURING_MAP)).toHaveLength(23);
      for (const [code, expectedName] of Object.entries(VSIC_MANUFACTURING_MAP)) {
        expect(resolveSectorName(code)).toBe(expectedName);
      }
      expect(resolveSectorName("C.10")).toBe("Chế biến thực phẩm");
      expect(resolveSectorName("C.26")).toBe("Sản xuất điện tử, máy tính và quang học");
      expect(resolveSectorName("C.32")).toBe("Công nghiệp chế biến, chế tạo khác");
    });

    it("prioritizes customDict if provided and matched", () => {
      const customDict = {
        CN01: "Ngành CNTT Tùy Chỉnh",
        CUSTOM_99: "Ngành Thử Nghiệm",
      };
      expect(resolveSectorName("CN01", customDict)).toBe("Ngành CNTT Tùy Chỉnh");
      expect(resolveSectorName("CUSTOM_99", customDict)).toBe("Ngành Thử Nghiệm");
      expect(resolveSectorName("CN02", customDict)).toBe("Năng lượng và tự động hóa");
    });

    it("handles variations and normalizations (whitespace, case, without dot)", () => {
      expect(resolveSectorName("  CN01  ")).toBe("Công nghệ thông tin và truyền thông");
      expect(resolveSectorName("cn02")).toBe("Năng lượng và tự động hóa");
      expect(resolveSectorName("CN1")).toBe("Công nghệ thông tin và truyền thông");
      expect(resolveSectorName("C10")).toBe("Chế biến thực phẩm");
      expect(resolveSectorName("c.20")).toBe("Sản xuất hoá chất công nghiệp");
    });

    it("handles null, undefined, empty string and unknown codes", () => {
      expect(resolveSectorName(null)).toBe("Chưa phân loại ngành");
      expect(resolveSectorName(undefined)).toBe("Chưa phân loại ngành");
      expect(resolveSectorName("")).toBe("Chưa phân loại ngành");
      expect(resolveSectorName("   ")).toBe("Chưa phân loại ngành");
      expect(resolveSectorName("UNKNOWN_CODE_999")).toBe("UNKNOWN_CODE_999");
    });
  });

  describe("resolveProvinceName", () => {
    it("resolves Bac Ninh locations, ALL, and legacy province codes", () => {
      expect(resolveProvinceName("TP_BN")).toBe("TP. Bắc Ninh");
      expect(resolveProvinceName("KCN_VSIP_BN")).toBe("KCN VSIP Bắc Ninh");
      expect(resolveProvinceName("HN")).toBe("Hà Nội");
      expect(resolveProvinceName("SG")).toBe("TP. Hồ Chí Minh");
      expect(resolveProvinceName("HCM")).toBe("TP. Hồ Chí Minh");
      expect(resolveProvinceName("HP")).toBe("Hải Phòng");
      expect(resolveProvinceName("DN")).toBe("Đà Nẵng");
      expect(resolveProvinceName("ALL")).toBe("Tất cả Địa bàn & KCN Bắc Ninh");
    });

    it("resolves locations accurately from BAC_NINH_LOCATIONS list", () => {
      for (const loc of BAC_NINH_LOCATIONS) {
        if (loc.code === "ALL") continue;
        expect(resolveProvinceName(loc.code)).toBe(loc.name);
      }
    });

    it("handles case insensitivity, whitespace, null, undefined, and unknown codes", () => {
      expect(resolveProvinceName("  hn  ")).toBe("Hà Nội");
      expect(resolveProvinceName("hp")).toBe("Hải Phòng");
      expect(resolveProvinceName(null)).toBe("Địa bàn");
      expect(resolveProvinceName(undefined)).toBe("Địa bàn");
      expect(resolveProvinceName("")).toBe("Địa bàn");
      expect(resolveProvinceName("PROV_UNKNOWN")).toBe("PROV_UNKNOWN");
    });
  });

  describe("resolveTrlInfo", () => {
    it("resolves TRL levels 1 to 9 with Vietnamese descriptions and color classes", () => {
      const trl1 = resolveTrlInfo(1);
      expect(trl1.label).toBe("TRL 1/9");
      expect(trl1.desc).toBe("Nguyên lý cơ bản được nghiên cứu");
      expect(trl1.colorClass).toContain("text-slate");

      const trl4 = resolveTrlInfo(4);
      expect(trl4.label).toBe("TRL 4/9");
      expect(trl4.desc).toBe("Xác thực trong phòng thí nghiệm");

      const trl7 = resolveTrlInfo(7);
      expect(trl7.label).toBe("TRL 7/9");
      expect(trl7.desc).toBe("Thử nghiệm trong môi trường thực tế");
      expect(trl7.colorClass).toContain("amber");

      const trl9 = resolveTrlInfo(9);
      expect(trl9.label).toBe("TRL 9/9");
      expect(trl9.desc).toBe("Thương mại hóa hoàn toàn");
      expect(trl9.colorClass).toContain("emerald");
    });

    it("handles string representations of TRL levels", () => {
      const trl6 = resolveTrlInfo("6");
      expect(trl6.label).toBe("TRL 6/9");
      expect(trl6.desc).toBe("Thử nghiệm mẫu hoạt động");
    });

    it("handles invalid levels, null, and undefined", () => {
      const trlInvalid = resolveTrlInfo(0);
      expect(trlInvalid.label).toBe("TRL 0/9");
      expect(trlInvalid.desc).toBe("Đang cập nhật mức độ hoàn thiện");

      const trlNull = resolveTrlInfo(null);
      expect(trlNull.label).toBe("TRL 0/9");
      expect(trlNull.desc).toBe("Đang cập nhật mức độ hoàn thiện");

      const trlOut = resolveTrlInfo(10);
      expect(trlOut.label).toBe("TRL 10/9");
    });
  });

  describe("resolveIpStatusInfo", () => {
    it("resolves known IP statuses with labels and color classes", () => {
      const granted = resolveIpStatusInfo("PATENT_GRANTED");
      expect(granted.label).toBe("Đã cấp Bằng độc quyền sáng chế");
      expect(granted.colorClass).toContain("emerald");

      const utility = resolveIpStatusInfo("UTILITY_MODEL");
      expect(utility.label).toBe("Giải pháp hữu ích");
      expect(utility.colorClass).toContain("teal");

      const secret = resolveIpStatusInfo("TRADE_SECRET");
      expect(secret.label).toBe("Bí mật kinh doanh");
      expect(secret.colorClass).toContain("indigo");

      const pending = resolveIpStatusInfo("PATENT_PENDING");
      expect(pending.label).toBe("Đang thẩm định đơn SHTT");
      expect(pending.colorClass).toContain("cyan");

      const application = resolveIpStatusInfo("PATENT_APPLICATION");
      expect(application.label).toBe("Đang thẩm định đơn SHTT");

      const copyright = resolveIpStatusInfo("SOFTWARE_COPYRIGHT");
      expect(copyright.label).toBe("Bản quyền phần mềm / Tác giả");

      const copyrightReg = resolveIpStatusInfo("COPYRIGHT_REGISTERED");
      expect(copyrightReg.label).toBe("Bản quyền phần mềm / Tác giả");
    });

    it("handles lowercase and whitespace trimming without falling back", () => {
      expect(resolveIpStatusInfo("patent_granted").label).toBe("Đã cấp Bằng độc quyền sáng chế");
      expect(resolveIpStatusInfo("  PATENT_GRANTED  ").label).toBe("Đã cấp Bằng độc quyền sáng chế");
      expect(resolveIpStatusInfo("utility_model").label).toBe("Giải pháp hữu ích");
      expect(resolveIpStatusInfo(" trade_secret ").label).toBe("Bí mật kinh doanh");
    });

    it("handles NONE, null, undefined and unknown status", () => {
      const none = resolveIpStatusInfo("NONE");
      expect(none.label).toBe("Chưa bảo hộ SHTT");
      expect(none.colorClass).toContain("slate");

      const nil = resolveIpStatusInfo(null);
      expect(nil.label).toBe("Chưa bảo hộ SHTT");

      const unk = resolveIpStatusInfo("UNKNOWN_IP");
      expect(unk.label).toBe("Chưa bảo hộ SHTT");
    });
  });

  describe("resolveTt17Classification", () => {
    it("resolves TT17 technology classifications accurately", () => {
      const tt = resolveTt17Classification("TIEN_TIEN");
      expect(tt.label).toBe("Trình độ Tiên tiến (≥ 75đ & T_ĐB ≥ 0.75)");
      expect(tt.badgeClass).toContain("emerald");

      const tbtt = resolveTt17Classification("TRUNG_BINH_TIEN_TIEN");
      expect(tbtt.label).toBe("Trung bình Tiên tiến (60–74đ & T_ĐB ≥ 0.60)");
      expect(tbtt.badgeClass).toContain("teal");

      const tb = resolveTt17Classification("TRUNG_BINH");
      expect(tb.label).toBe("Trình độ Trung bình (50–59đ & T_ĐB ≥ 0.50)");
      expect(tb.badgeClass).toContain("amber");

      const lh = resolveTt17Classification("LAC_HAU");
      expect(lh.label).toBe("Trình độ Lạc hậu (< 50đ)");
      expect(lh.badgeClass).toContain("rose");
    });

    it("handles lowercase and whitespace trimming without breaking", () => {
      expect(resolveTt17Classification("tien_tien").label).toBe("Trình độ Tiên tiến (≥ 75đ & T_ĐB ≥ 0.75)");
      expect(resolveTt17Classification("  TIEN_TIEN  ").label).toBe("Trình độ Tiên tiến (≥ 75đ & T_ĐB ≥ 0.75)");
      expect(resolveTt17Classification("trung_binh").label).toBe("Trình độ Trung bình (50–59đ & T_ĐB ≥ 0.50)");
    });

    it("handles null, undefined, or custom classification codes", () => {
      expect(resolveTt17Classification(null).label).toBe("Chưa xếp loại");
      expect(resolveTt17Classification(undefined).label).toBe("Chưa xếp loại");
      expect(resolveTt17Classification("CUSTOM_RATING").label).toBe("CUSTOM_RATING");
    });
  });

  describe("resolveTniUrgency", () => {
    it("resolves TNI urgency ratings", () => {
      const urgent = resolveTniUrgency("URGENT");
      expect(urgent.label).toBe("Cấp bách (Giải quyết trong quý)");
      expect(urgent.badgeClass).toContain("rose");

      const strategic = resolveTniUrgency("STRATEGIC");
      expect(strategic.label).toBe("Chiến lược dài hạn");
      expect(strategic.badgeClass).toContain("blue");

      const potential = resolveTniUrgency("POTENTIAL");
      expect(potential.label).toBe("Tiềm năng mở rộng");
      expect(potential.badgeClass).toContain("slate");
    });

    it("handles lowercase and whitespace trimming", () => {
      expect(resolveTniUrgency("urgent").label).toBe("Cấp bách (Giải quyết trong quý)");
      expect(resolveTniUrgency("  STRATEGIC  ").label).toBe("Chiến lược dài hạn");
    });

    it("handles null, undefined and fallbacks", () => {
      expect(resolveTniUrgency(null).label).toBe("Tiềm năng mở rộng");
      expect(resolveTniUrgency(undefined).label).toBe("Tiềm năng mở rộng");
      expect(resolveTniUrgency("UNKNOWN").label).toBe("Tiềm năng mở rộng");
    });
  });

  describe("resolveGovRequestType", () => {
    it("resolves government approval request types", () => {
      const expert = resolveGovRequestType("EXPERT");
      expect(expert.label).toBe("Chuyên gia KH&CN");
      expect(expert.badgeClass).toContain("purple");

      const shop = resolveGovRequestType("SHOP");
      expect(shop.label).toBe("Sản phẩm / Sáng chế TRL");
      expect(shop.badgeClass).toContain("emerald");

      const techOffer = resolveGovRequestType("TECHNOLOGY_OFFER");
      expect(techOffer.label).toBe("Sản phẩm / Sáng chế TRL");

      const demand = resolveGovRequestType("DEMAND");
      expect(demand.label).toBe("Nhu cầu Công nghệ");
      expect(demand.badgeClass).toContain("blue");

      const account = resolveGovRequestType("ACCOUNT");
      expect(account.label).toBe("Tài khoản Pháp nhân");

      const ent = resolveGovRequestType("ENTERPRISE");
      expect(ent.label).toBe("Doanh nghiệp ĐMST");
      expect(ent.badgeClass).toContain("cyan");
    });

    it("handles lowercase and whitespace trimming", () => {
      expect(resolveGovRequestType("expert").label).toBe("Chuyên gia KH&CN");
      expect(resolveGovRequestType("  shop  ").label).toBe("Sản phẩm / Sáng chế TRL");
    });

    it("handles null, undefined, and custom types", () => {
      expect(resolveGovRequestType(null).label).toBe("Hồ sơ công vụ");
      expect(resolveGovRequestType(undefined).label).toBe("Hồ sơ công vụ");
      expect(resolveGovRequestType("CUSTOM_TYPE").label).toBe("CUSTOM_TYPE");
    });
  });

  describe("resolveRoleDisplayName", () => {
    it("resolves role names to proper civil service titles", () => {
      expect(resolveRoleDisplayName("PROVINCIAL_ADMIN")).toBe("Lãnh đạo Sở (Admin)");
      expect(resolveRoleDisplayName("PROVINCE_LEADER")).toBe("Lãnh đạo Sở (Checker)");
      expect(resolveRoleDisplayName("PROVINCE_OFFICER")).toBe("Chuyên viên Thẩm tra (Maker)");
      expect(resolveRoleDisplayName("SUPER_ADMIN")).toBe("Quản trị Tối cao Tầng 0");
      expect(resolveRoleDisplayName(null)).toBe("Cán bộ công vụ");
      expect(resolveRoleDisplayName(undefined)).toBe("Cán bộ công vụ");
    });
  });

  describe("formatGovRecordCode", () => {
    it("formats technology offer records with CB prefix and uppercase province code", () => {
      const codeInfo = formatGovRecordCode("c25347fc-8f7a-4299-8cfb-3715c0e7d58a", "TECHNOLOGY_OFFER", "HN");
      expect(codeInfo.code).toBe("CB-HN-C25347");
      expect(codeInfo.prefix).toBe("CB");
      expect(codeInfo.scope).toBe("HN");
      expect(codeInfo.hash).toBe("C25347");
    });

    it("formats expert records with CG prefix and handles SHOP type as CB", () => {
      const expertCode = formatGovRecordCode("a109f2d1-0000-4000-8000-000000000000", "EXPERT", "SG");
      expect(expertCode.code).toBe("CG-SG-A109F2");

      const shopCode = formatGovRecordCode("9a4207cf-1111-4000-8000-000000000000", "SHOP", "HP");
      expect(shopCode.code).toBe("CB-HP-9A4207");
    });

    it("formats demand with NC and enterprise with DN", () => {
      const demandCode = formatGovRecordCode("88e29e91-2222-4000-8000-000000000000", "DEMAND", "DN");
      expect(demandCode.code).toBe("NC-DN-88E29E");

      const entCode = formatGovRecordCode("825cdc93-3333-4000-8000-000000000000", "ACCOUNT", "BD");
      expect(entCode.code).toBe("DN-BD-825CDC");
    });

    it("handles null and empty id safely with fallback", () => {
      expect(formatGovRecordCode(null).code).toBe("HS-CHUA-CAP-MA");
      expect(formatGovRecordCode("").code).toBe("HS-CHUA-CAP-MA");
    });
  });
});
