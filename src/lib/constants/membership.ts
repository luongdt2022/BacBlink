/**
 * Nội dung trang Hội viên — CR-BACLINK-008 · REQ-BL08-MEMBER-PUBLIC-006.
 * [PROPOSAL – DEMO]: chờ BACLINK cung cấp Điều lệ chính thức để thay thế.
 */
export const MEMBER_BENEFITS = [
  "Hiển thị hồ sơ năng lực trong Danh bạ hội viên và được giới thiệu tới khách hàng FDI",
  "Đăng nhu cầu mua hàng, sản phẩm, năng lực; nhận yêu cầu báo giá và đề xuất kết nối",
  "Ưu tiên tham gia hội chợ, phiên kết nối B2B và chương trình xúc tiến thương mại",
  "Tham gia đào tạo, học liệu số và tư vấn từ Ban Cố vấn Kỹ thuật",
  "Được Hiệp hội tiếp nhận, tổng hợp và kiến nghị vướng mắc chính sách",
  "Tham gia hoạt động 9 ban chuyên môn và mạng lưới doanh nghiệp Bắc Ninh",
];

export const MEMBER_CONDITIONS = [
  "Doanh nghiệp, tổ chức được thành lập hợp pháp tại Việt Nam, có mã số thuế còn hiệu lực",
  "Hoạt động trong lĩnh vực sản xuất công nghiệp, công nghiệp hỗ trợ hoặc dịch vụ cho sản xuất",
  "Tán thành Điều lệ Hiệp hội, tự nguyện tham gia và đóng hội phí theo quy định",
];

export const MEMBER_DOCUMENTS = [
  "Giấy chứng nhận đăng ký doanh nghiệp (bản PDF)",
  "Thông tin người đại diện: họ tên, chức danh, số điện thoại, email",
  "Giới thiệu ngắn về doanh nghiệp, sản phẩm nổi bật, website (nếu có)",
  "Thông tin trợ lý/thư ký làm đầu mối (không bắt buộc)",
];

export const JOIN_STEPS = [
  { title: "Tạo tài khoản", desc: "Đăng ký tài khoản trên cổng BACLINK (bỏ qua nếu đã có)." },
  { title: "Khai hồ sơ doanh nghiệp", desc: "Nhập mã số thuế (tự tra cứu), thông tin người đại diện, chọn loại hội viên, tải giấy phép." },
  { title: "Ban Quản trị xét duyệt", desc: "Văn phòng Hiệp hội kiểm tra hồ sơ và liên hệ xác nhận." },
  { title: "Nhận chứng nhận hội viên", desc: "Tài khoản được kích hoạt quyền hội viên, cấp số chứng nhận BL-YYYY-NNNN, xem tại Cổng hội viên." },
];

export const WORKFORCE = ["Dưới 10 lao động", "10 – 99 lao động", "100 – 300 lao động", "Trên 300 lao động"];

/** Gợi ý hạng theo quy mô lao động (bảng hạng demo, CR-BACLINK-008 §2.3). */
export function suggestTier(workforce: string): string {
  if (workforce.startsWith("Trên 300")) return "OFFICIAL_L";
  if (workforce.startsWith("100")) return "OFFICIAL_M";
  return "OFFICIAL_S";
}
