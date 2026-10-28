"use client";

import EnterprisesDirectoryView from "@/components/enterprise/EnterprisesDirectoryView";

export default function DoanhNghiepDmstRoute() {
  return (
    <EnterprisesDirectoryView
      initialSortBy="innovation_desc"
      pageTitle="Danh Bạ & Bảng Xếp Hạng Doanh Nghiệp Đổi Mới Sáng Tạo"
      pageSubtitle="Tra cứu bảng xếp hạng năng lực ĐMST (⭐️ Huy hiệu Vàng, 🥈 Bạc, 🥉 Đồng), điểm số 8 nhóm trụ cột và chỉ số nhu cầu công nghệ TNI của các doanh nghiệp trên toàn quốc."
      badgeLabel="Bảng Xếp Hạng & Danh Bạ Năng Lực ĐMST Quốc Gia"
    />
  );
}
