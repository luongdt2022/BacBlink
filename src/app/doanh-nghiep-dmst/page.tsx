"use client";

import EnterprisesDirectoryView from "@/components/enterprise/EnterprisesDirectoryView";

export default function DoanhNghiepDmstRoute() {
  return (
    <EnterprisesDirectoryView
      initialSortBy="innovation_desc"
      pageTitle="Danh Bạ & Bảng Xếp Hạng Doanh Nghiệp Hội Viên BACLINK"
      pageSubtitle="Tra cứu xếp hạng năng lực sản xuất, chứng chỉ nhà máy (ISO, IATF 16949, ESD), dây chuyền công nghệ và kết nối chuỗi cung ứng công nghiệp tỉnh Bắc Ninh."
      badgeLabel="Mạng Lưới Sản Xuất Công Nghiệp Tỉnh Bắc Ninh"
    />
  );
}
