import { describe, expect, it } from "vitest";
import {
  BAC_NINH_AREAS,
  BAC_NINH_KCNS,
  BAC_NINH_LOCATIONS,
  BAC_NINH_LOCATION_CODES,
  PROVINCES_34,
  PROVINCE_CODES_34,
  getBacNinhLocationByCode,
  getProvinceByCode,
} from "./provinces";

describe("BAC_NINH_LOCATIONS (CR-BACLINK-003 - REQ-BACLINK-TAX-002)", () => {
  it("contains 8+1 Bac Ninh areas and 13 key KCNs plus ALL", () => {
    expect(BAC_NINH_AREAS).toHaveLength(9);
    expect(BAC_NINH_KCNS).toHaveLength(13);
    expect(BAC_NINH_LOCATION_CODES).toHaveLength(22);
    expect(BAC_NINH_LOCATIONS).toHaveLength(23);
    expect(PROVINCE_CODES_34).toEqual(BAC_NINH_LOCATION_CODES);
    expect(PROVINCES_34).toEqual(BAC_NINH_LOCATIONS);
  });

  it("includes ALL as the first item with Bac Ninh wording (no 34 provinces / Sở KH&CN)", () => {
    expect(BAC_NINH_LOCATIONS[0].code).toBe("ALL");
    expect(BAC_NINH_LOCATIONS[0].name).toBe("Tất cả Địa bàn & KCN Bắc Ninh");
    expect(BAC_NINH_LOCATIONS.some((l) => l.fullName.includes("Sở KH&CN"))).toBe(false);
  });

  it("includes all 8+1 Bac Ninh areas and major industrial parks", () => {
    expect(getBacNinhLocationByCode("TP_BN")?.name).toBe("TP. Bắc Ninh");
    expect(getBacNinhLocationByCode("TU_SON")?.name).toBe("TP. Từ Sơn");
    expect(getBacNinhLocationByCode("QUE_VO")?.name).toBe("TX. Quế Võ");
    expect(getBacNinhLocationByCode("THUAN_THANH")?.name).toBe("TX. Thuận Thành");
    expect(getBacNinhLocationByCode("YEN_PHONG")?.name).toBe("H. Yên Phong");
    expect(getBacNinhLocationByCode("TIEN_DU")?.name).toBe("H. Tiên Du");
    expect(getBacNinhLocationByCode("GIA_BINH")?.name).toBe("H. Gia Bình");
    expect(getBacNinhLocationByCode("LUONG_TAI")?.name).toBe("H. Lương Tài");
    expect(getBacNinhLocationByCode("NGOAI_TINH")?.name).toBe("Ngoài tỉnh / Đối tác FDI");
    expect(getBacNinhLocationByCode("KCN_VSIP_BN")?.name).toBe("KCN VSIP Bắc Ninh");
    expect(getBacNinhLocationByCode("KCN_YEN_PHONG_1")?.name).toBe("KCN Yên Phong I");
  });

  it("resolves locations case-insensitively and preserves compatibility alias", () => {
    expect(getBacNinhLocationByCode("tp_bn")?.name).toBe("TP. Bắc Ninh");
    expect(getProvinceByCode("kcn_vsip_bn")?.name).toBe("KCN VSIP Bắc Ninh");
  });
});
