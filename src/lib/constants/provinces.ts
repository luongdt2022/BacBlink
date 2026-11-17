/**
 * Danh mục Chuẩn 8+1 Địa bàn & KCN Trọng điểm tỉnh Bắc Ninh (BACLINK)
 * Căn cứ: CR-BACLINK-003 (REQ-BACLINK-TAX-002, BR-BACLINK-TAX-002)
 */

export type BacNinhLocationType = "ALL" | "AREA" | "KCN";

export interface BacNinhLocationItem {
  code: string;
  name: string;
  fullName: string;
  locationType: BacNinhLocationType;
  region: "BAC_NINH" | "KCN" | "NGOAI_TINH" | "ALL" | "BAC" | "TRUNG_TAY_NGUYEN" | "NAM";
}

/** @deprecated Alias tương thích tạm thời — dùng BacNinhLocationItem cho code mới */
export type ProvinceItem = BacNinhLocationItem;

export const BAC_NINH_AREAS: BacNinhLocationItem[] = [
  {
    code: "TP_BN",
    name: "TP. Bắc Ninh",
    fullName: "Thành phố Bắc Ninh",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "TU_SON",
    name: "TP. Từ Sơn",
    fullName: "Thành phố Từ Sơn",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "QUE_VO",
    name: "TX. Quế Võ",
    fullName: "Thị xã Quế Võ",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "THUAN_THANH",
    name: "TX. Thuận Thành",
    fullName: "Thị xã Thuận Thành",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "YEN_PHONG",
    name: "H. Yên Phong",
    fullName: "Huyện Yên Phong",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "TIEN_DU",
    name: "H. Tiên Du",
    fullName: "Huyện Tiên Du",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "GIA_BINH",
    name: "H. Gia Bình",
    fullName: "Huyện Gia Bình",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "LUONG_TAI",
    name: "H. Lương Tài",
    fullName: "Huyện Lương Tài",
    locationType: "AREA",
    region: "BAC_NINH",
  },
  {
    code: "NGOAI_TINH",
    name: "Ngoài tỉnh / Đối tác FDI",
    fullName: "Đối tác FDI / Doanh nghiệp ngoài tỉnh Bắc Ninh",
    locationType: "AREA",
    region: "NGOAI_TINH",
  },
];

export const BAC_NINH_KCNS: BacNinhLocationItem[] = [
  {
    code: "KCN_YEN_PHONG_1",
    name: "KCN Yên Phong I",
    fullName: "Khu công nghiệp Yên Phong I",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_YEN_PHONG_2C",
    name: "KCN Yên Phong II-C",
    fullName: "Khu công nghiệp Yên Phong II-C",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_QUE_VO_1",
    name: "KCN Quế Võ I",
    fullName: "Khu công nghiệp Quế Võ I",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_QUE_VO_2",
    name: "KCN Quế Võ II",
    fullName: "Khu công nghiệp Quế Võ II",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_QUE_VO_3",
    name: "KCN Quế Võ III",
    fullName: "Khu công nghiệp Quế Võ III",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_VSIP_BN",
    name: "KCN VSIP Bắc Ninh",
    fullName: "Khu công nghiệp VSIP Bắc Ninh",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_TIEN_SON",
    name: "KCN Tiên Sơn",
    fullName: "Khu công nghiệp Tiên Sơn",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_DAI_DONG_HOAN_SON",
    name: "KCN Đại Đồng - Hoàn Sơn",
    fullName: "Khu công nghiệp Đại Đồng - Hoàn Sơn",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_HANAKA",
    name: "KCN Hanaka",
    fullName: "Khu công nghiệp Hanaka",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_THUAN_THANH_1",
    name: "KCN Thuận Thành I",
    fullName: "Khu công nghiệp Thuận Thành I",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_THUAN_THANH_2",
    name: "KCN Thuận Thành II",
    fullName: "Khu công nghiệp Thuận Thành II",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_THUAN_THANH_3",
    name: "KCN Thuận Thành III",
    fullName: "Khu công nghiệp Thuận Thành III",
    locationType: "KCN",
    region: "KCN",
  },
  {
    code: "KCN_GIA_BINH",
    name: "KCN Gia Bình",
    fullName: "Khu công nghiệp Gia Bình",
    locationType: "KCN",
    region: "KCN",
  },
];

export const BAC_NINH_LOCATIONS: BacNinhLocationItem[] = [
  {
    code: "ALL",
    name: "Tất cả Địa bàn & KCN Bắc Ninh",
    fullName: "Tất cả Địa bàn & KCN tỉnh Bắc Ninh",
    locationType: "ALL",
    region: "ALL",
  },
  ...BAC_NINH_AREAS,
  ...BAC_NINH_KCNS,
];

export const BAC_NINH_LOCATION_CODES = BAC_NINH_LOCATIONS.filter((l) => l.code !== "ALL").map((l) => l.code);

export function getBacNinhLocationByCode(code?: string): BacNinhLocationItem | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase();
  return BAC_NINH_LOCATIONS.find((l) => l.code.toUpperCase() === clean);
}

/** @deprecated Alias tương thích tạm thời — sử dụng BAC_NINH_LOCATIONS */
export const PROVINCES_34 = BAC_NINH_LOCATIONS;

/** @deprecated Alias tương thích tạm thời — sử dụng BAC_NINH_LOCATION_CODES */
export const PROVINCE_CODES_34 = BAC_NINH_LOCATION_CODES;

/** @deprecated Alias tương thích tạm thời — sử dụng getBacNinhLocationByCode */
export const getProvinceByCode = getBacNinhLocationByCode;
