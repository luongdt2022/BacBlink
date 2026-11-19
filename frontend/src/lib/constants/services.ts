/**
 * 8 dịch vụ hỗ trợ doanh nghiệp — CR-BACLINK-010 · REQ-BL10-SERVICE-001.
 * Mẫu 4 câu hỏi theo góp ý khách hàng: Dành cho ai – Giải quyết vấn đề gì – BACLINK hỗ trợ thế nào – Đăng ký ở đâu.
 * [PROPOSAL – DEMO]: mô tả chung, KHÔNG nêu mức phí/thời hạn/cam kết cụ thể; chờ BACLINK bổ sung chính thức.
 */
export interface ServiceLink { label: string; href: string }

export interface BusinessService {
  slug: string;
  title: string;
  summary: string;
  forWhom: string[];
  problems: string[];
  support: string[];
  /** Ban chuyên môn phụ trách (khớp BACLINK_COMMITTEES.code). */
  committeeCode: string;
  /** Kênh tự phục vụ sẵn có trên cổng (nếu có). */
  selfService: ServiceLink[];
}

export const BUSINESS_SERVICES: readonly BusinessService[] = [
  {
    slug: "ho-tro-chinh-sach",
    title: "Hỗ trợ & tư vấn chính sách",
    summary: "Giải thích chính sách mới, tiếp nhận vướng mắc và phản ánh kiến nghị của doanh nghiệp tới cơ quan quản lý.",
    forWhom: ["Doanh nghiệp gặp vướng mắc về thủ tục, ưu đãi, đất đai, thuế, lao động", "Doanh nghiệp cần hiểu đúng chính sách mới ban hành"],
    problems: ["Khó nắm bắt và áp dụng đúng chính sách", "Vướng mắc kéo dài chưa biết phản ánh với ai"],
    support: ["Tiếp nhận và phân loại vướng mắc", "Giải thích chính sách và hướng dẫn thủ tục", "Tổng hợp kiến nghị, đối thoại với cơ quan chức năng"],
    committeeCode: "BAN_CS_DTDT",
    selfService: [{ label: "Đọc chính sách mới", href: "/tin-tuc?category=chinh-sach-moi" }, { label: "Giải thích chính sách", href: "/tin-tuc?category=giai-thich-chinh-sach" }],
  },
  {
    slug: "ket-noi-cung-cau",
    title: "Kết nối cung – cầu",
    summary: "Giúp doanh nghiệp tìm khách hàng, nhà cung cấp và đối tác trong chuỗi cung ứng FDI – nội địa.",
    forWhom: ["Doanh nghiệp tìm nhà cung cấp, đối tác gia công", "Doanh nghiệp muốn giới thiệu sản phẩm, năng lực tới khách hàng"],
    problems: ["Khó tiếp cận khách hàng và nhà cung cấp phù hợp", "Chưa có kênh trưng bày năng lực sản xuất"],
    support: ["Danh bạ hội viên và đăng sản phẩm, năng lực", "Đăng nhu cầu mua hàng, gửi yêu cầu báo giá", "Ghép nối và tổ chức phiên kết nối B2B"],
    committeeCode: "BAN_GT_XTTM",
    selfService: [{ label: "Danh bạ hội viên", href: "/enterprises" }, { label: "Nhu cầu mua hàng", href: "/nhu-cau-cong-nghe" }, { label: "Sản phẩm & năng lực", href: "/chao-ban-cong-nghe" }],
  },
  {
    slug: "dao-tao-nhan-luc",
    title: "Đào tạo & phát triển nhân lực",
    summary: "Khóa đào tạo, học liệu số và kết nối cơ sở đào tạo nhằm nâng năng lực đội ngũ doanh nghiệp.",
    forWhom: ["Doanh nghiệp cần nâng kỹ năng quản lý, kỹ thuật, vận hành", "Doanh nghiệp cần nguồn nhân lực theo nhu cầu sản xuất"],
    problems: ["Thiếu chương trình đào tạo sát thực tế sản xuất", "Khó kết nối trường nghề, chuyên gia đào tạo"],
    support: ["Học liệu số và khóa đào tạo trực tuyến", "Hội thảo, khóa đào tạo tập trung", "Kết nối chuyên gia và cơ sở đào tạo"],
    committeeCode: "BAN_DT_NL",
    selfService: [{ label: "Khóa học trực tuyến", href: "/elearning" }, { label: "Lịch sự kiện & đào tạo", href: "/trien-lam" }],
  },
  {
    slug: "cong-nghe-chuyen-doi-so",
    title: "Công nghệ & chuyển đổi số",
    summary: "Tư vấn, kết nối đối tác công nghệ và chuyên gia cho nhu cầu tự động hóa, số hóa sản xuất.",
    forWhom: ["Doanh nghiệp muốn tự động hóa, số hóa quy trình sản xuất", "Đơn vị có công nghệ cần chuyển giao"],
    problems: ["Chưa rõ lộ trình và đối tác công nghệ phù hợp", "Cần đánh giá, định giá công nghệ trước khi đầu tư"],
    support: ["Kết nối chuyên gia, Ban Cố vấn Kỹ thuật", "Hỗ trợ chuyển giao công nghệ", "Thẩm định, định giá công nghệ"],
    committeeCode: "BAN_CGCN_KT",
    selfService: [{ label: "Chuyển giao công nghệ", href: "/dich-vu-khac#chuyen-giao-cong-nghe" }, { label: "Mạng lưới chuyên gia", href: "/experts" }],
  },
  {
    slug: "nang-suat-chat-luong",
    title: "Năng suất & chất lượng",
    summary: "Hỗ trợ cải tiến năng suất, chuẩn bị đáp ứng yêu cầu chất lượng của khách hàng.",
    forWhom: ["Doanh nghiệp chuẩn bị đánh giá của khách hàng FDI", "Doanh nghiệp muốn cải tiến năng suất, giảm lãng phí"],
    problems: ["Chưa đáp ứng tiêu chuẩn chất lượng khách hàng yêu cầu", "Năng suất và chi phí sản xuất chưa tối ưu"],
    support: ["Tư vấn từ Ban Cố vấn Kỹ thuật", "Hướng dẫn chuẩn bị hồ sơ, đánh giá chất lượng", "Chia sẻ thực hành tốt giữa các hội viên"],
    committeeCode: "BAN_CGCN_KT",
    selfService: [{ label: "Ban Cố vấn Kỹ thuật", href: "/experts" }],
  },
  {
    slug: "chuyen-doi-xanh-esg",
    title: "Chuyển đổi xanh & ESG",
    summary: "Đồng hành doanh nghiệp đáp ứng yêu cầu môi trường, xã hội, quản trị của khách hàng và thị trường.",
    forWhom: ["Doanh nghiệp được khách hàng yêu cầu báo cáo ESG, giảm phát thải", "Doanh nghiệp muốn tiết kiệm năng lượng, sản xuất xanh"],
    problems: ["Chưa rõ yêu cầu và cách đáp ứng ESG", "Thiếu giải pháp tiết kiệm năng lượng phù hợp"],
    support: ["Cập nhật yêu cầu và xu hướng ESG", "Kết nối chuyên gia, nhà cung cấp giải pháp xanh", "Chia sẻ kinh nghiệm giữa hội viên"],
    committeeCode: "BAN_CNX_DMST",
    selfService: [{ label: "Tin về chuyển đổi xanh & ESG", href: "/tin-tuc?category=chuoi-cung-ung" }],
  },
  {
    slug: "xuc-tien-thuong-mai",
    title: "Xúc tiến thương mại",
    summary: "Tham gia hội chợ, hội thảo, phiên kết nối giao thương do Hiệp hội tổ chức hoặc phối hợp tổ chức.",
    forWhom: ["Doanh nghiệp muốn mở rộng thị trường trong và ngoài tỉnh", "Doanh nghiệp muốn trưng bày sản phẩm, gặp gỡ khách hàng"],
    problems: ["Thiếu kênh quảng bá và gặp gỡ khách hàng", "Chi phí tự tham gia hội chợ cao"],
    support: ["Thông tin lịch sự kiện, chương trình xúc tiến", "Đăng ký tham dự, tổ chức đoàn", "Kết nối giao thương B2B tại sự kiện"],
    committeeCode: "BAN_GT_XTTM",
    selfService: [{ label: "Lịch sự kiện", href: "/trien-lam" }, { label: "Đăng ký tham dự", href: "/trien-lam/dang-ky-tham-quan" }],
  },
  {
    slug: "hop-tac-quoc-te",
    title: "Hợp tác quốc tế",
    summary: "Kết nối đối tác, thị trường nước ngoài và hỗ trợ doanh nghiệp tham gia đoàn giao lưu, ký kết hợp tác.",
    forWhom: ["Doanh nghiệp muốn tìm đối tác, thị trường nước ngoài", "Tổ chức nước ngoài muốn tìm hiểu doanh nghiệp Bắc Ninh"],
    problems: ["Thiếu đầu mối và thông tin thị trường quốc tế", "Cần được giới thiệu, bảo trợ khi làm việc với đối tác"],
    support: ["Đón tiếp, giới thiệu đoàn đối tác nước ngoài", "Tổ chức đoàn giao lưu, ký kết hợp tác", "Cung cấp thông tin hội viên cho đối tác nước ngoài"],
    committeeCode: "BAN_DN_HTQT",
    selfService: [{ label: "Tin hợp tác quốc tế", href: "/tin-tuc?category=hop-tac-quoc-te" }],
  },
] as const;

export const getService = (slug: string) => BUSINESS_SERVICES.find((s) => s.slug === slug);
