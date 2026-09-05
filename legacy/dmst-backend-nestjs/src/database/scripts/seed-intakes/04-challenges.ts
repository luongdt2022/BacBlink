import { IntakeSeedData, runSectorSeed } from './shared';
import { IntakeType } from '../../../intakes/intake.entity';

export const SEEDS: IntakeSeedData[] = [
  // --- Công nghệ thông tin ---
  {
    title:
      'Cần giải pháp quản lý và tích hợp dữ liệu từ nhiều hệ thống ERP rời rạc',
    sectorNames: ['Công nghệ thông tin'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Bài Toán Tích Hợp Hệ Thống Cho Tập Đoàn Đa Ngành</h2>
<p>Chúng tôi là tập đoàn hoạt động trong 5 lĩnh vực khác nhau, hiện đang vận hành 7 phần mềm quản lý riêng biệt (ERP, CRM, HRM, kế toán, kho, logistics, bán hàng) không kết nối với nhau. Mỗi tuần cần 3 ngày công nhập liệu thủ công để tổng hợp báo cáo hợp nhất toàn tập đoàn.</p>
<h3>Vấn đề cụ thể</h3>
<p>Dữ liệu không đồng nhất giữa các hệ thống, xảy ra sai lệch số liệu thường xuyên. Lãnh đạo không có báo cáo real-time để ra quyết định. Mỗi lần tích hợp thêm đối tác mới mất 6-12 tháng. Không có luồng dữ liệu tự động giữa đơn hàng, kho và kế toán.</p>
<h3>Yêu cầu giải pháp</h3>
<p>Tìm giải pháp tích hợp dữ liệu (middleware/iPaaS) có thể kết nối 7 hệ thống hiện tại mà không cần thay thế. Cần dashboard hợp nhất real-time cho ban lãnh đạo. Timeline triển khai dưới 6 tháng. Ngân sách khoảng 2-5 tỷ đồng.</p>`,
  },
  {
    title:
      'Tìm kiếm nền tảng AI phân tích hành vi khách hàng và dự báo doanh thu',
    sectorNames: ['Công nghệ thông tin', 'Thương mại điện tử'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Cần AI Dự Báo Và Cá Nhân Hóa Cho Nền Tảng Bán Lẻ 500+ Cửa Hàng</h2>
<p>Chuỗi bán lẻ của chúng tôi có 520 cửa hàng, 8 triệu khách hàng thành viên nhưng đang dự báo doanh thu bằng Excel và kinh nghiệm của quản lý. Tỷ lệ tồn kho sai lệch giữa thực tế và dự báo lên đến 35%, gây ra vừa thiếu hàng vừa thừa hàng cùng lúc ở các cửa hàng khác nhau.</p>
<h3>Thách thức cụ thể</h3>
<p>Có 50 triệu transaction/năm nhưng chưa khai thác được. Không biết khách hàng nào sắp rời bỏ để giữ chân. Chiến dịch marketing gửi cùng một nội dung cho tất cả 8 triệu khách, hiệu quả kém. Không dự báo được nhu cầu theo mùa vụ, sự kiện, thời tiết.</p>
<h3>Mong muốn</h3>
<p>Cần giải pháp AI/ML có thể: dự báo doanh thu và nhu cầu tồn kho theo cửa hàng/SKU/tuần, phân khúc khách hàng tự động, cảnh báo churn sớm 30 ngày, và đề xuất sản phẩm cá nhân hóa. Ưu tiên giải pháp tích hợp được với SAP hiện tại.</p>`,
  },
  {
    title:
      'Cần giải pháp bảo mật và quản lý danh tính cho 10.000 nhân viên làm việc từ xa',
    sectorNames: ['Công nghệ thông tin', 'An ninh & Bảo mật'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Bài Toán Bảo Mật Hạ Tầng Với Mô Hình Hybrid Work Quy Mô Lớn</h2>
<p>Sau đại dịch, 70% trong số 10.000 nhân viên của chúng tôi làm việc hybrid hoặc full remote. Chúng tôi đã xảy ra 2 sự cố phishing nghiêm trọng năm 2023, mất dữ liệu khách hàng và bị phạt theo PDPA. VPN truyền thống quá tải và chậm, nhân viên tìm cách bypass dẫn đến rủi ro bảo mật cao hơn.</p>
<h3>Vấn đề hiện tại</h3>
<p>Không có Single Sign-On tập trung, nhân viên dùng 15+ tài khoản khác nhau. Không kiểm soát được thiết bị cá nhân (BYOD) truy cập hệ thống công ty. Không phát hiện được threat trong thời gian thực. Không có MFA cho toàn bộ ứng dụng nội bộ.</p>
<h3>Tìm kiếm</h3>
<p>Cần giải pháp Zero Trust hoặc SASE có thể triển khai cho 10.000 user, tích hợp với Microsoft 365 và SAP. Yêu cầu MFA, device trust, network segmentation và SOC monitoring. Ngân sách 3-8 tỷ/năm, ưu tiên vendor có hỗ trợ tiếng Việt 24/7.</p>`,
  },
  {
    title: 'Cần nền tảng low-code để số hóa 200+ quy trình hành chính nội bộ',
    sectorNames: ['Công nghệ thông tin'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Số Hóa Quy Trình Hành Chính Cho Tổ Chức 5.000 Người</h2>
<p>Tổ chức chúng tôi có hơn 200 quy trình hành chính (xin phép, đề xuất, phê duyệt, báo cáo) vẫn đang xử lý bằng giấy tờ hoặc email. Mỗi quy trình mất 3-7 ngày, không có tracking, dễ thất lạc. IT backlog 18 tháng không đủ nguồn lực để code từng ứng dụng.</p>
<h3>Nhu cầu cụ thể</h3>
<p>Cần nền tảng cho phép bộ phận nghiệp vụ tự xây dựng form và workflow mà không cần IT. Phải tích hợp với hệ thống nhân sự SAP HR và email. Cần mobile app để cấp quản lý duyệt mọi lúc mọi nơi. Audit trail đầy đủ cho yêu cầu kiểm toán.</p>
<h3>Tiêu chí lựa chọn</h3>
<p>Nền tảng no-code/low-code có template sẵn cho quy trình phổ biến (xin nghỉ phép, đề xuất mua sắm, báo cáo chi phí). Giá SaaS dưới 500,000 đồng/user/tháng. Hỗ trợ tiếng Việt. Triển khai được trong 3 tháng.</p>`,
  },
  {
    title: 'Tìm giải pháp phân tích log và monitoring hạ tầng cloud real-time',
    sectorNames: ['Công nghệ thông tin'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Cần Observability Platform Cho Microservices 200+ Services Trên Cloud</h2>
<p>Hệ thống chúng tôi đang chạy 200+ microservices trên AWS, xử lý 10 triệu request/ngày. Khi có incident, team mất trung bình 4 giờ để tìm root cause vì log phân tán, không có tracing xuyên suốt, và alert nhiễu quá nhiều. MTTR cao khiến SLA 99.9% thường xuyên bị vi phạm.</p>
<h3>Thách thức kỹ thuật</h3>
<p>Log từ 200+ services không tập trung, tìm kiếm chậm. Không có distributed tracing để theo dõi một request qua nhiều service. Alert threshold cứng dẫn đến cả nghìn alert/ngày không actionable. Không có anomaly detection tự động phát hiện vấn đề mới.</p>
<h3>Yêu cầu</h3>
<p>Cần observability platform tích hợp logs, metrics, traces (three pillars of observability). AI-powered anomaly detection và root cause analysis. Tích hợp với PagerDuty và Slack. Xử lý được 100GB log/ngày với query dưới 5 giây. Ngân sách 200-500 triệu/năm.</p>`,
  },

  // --- Y tế & Chăm sóc sức khỏe ---
  {
    title: 'Bệnh viện cần hệ thống AI hỗ trợ chẩn đoán và giảm tải bác sĩ',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Công nghệ thông tin'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Bài Toán Quá Tải Tại Bệnh Viện Tuyến Trung Ương 2.000 Giường</h2>
<p>Bệnh viện chúng tôi tiếp nhận 3.500 bệnh nhân ngoại trú/ngày với chỉ 450 bác sĩ. Tình trạng quá tải khiến mỗi bác sĩ chỉ có 5-7 phút/bệnh nhân, tỷ lệ bỏ sót chẩn đoán tăng, bác sĩ kiệt sức. Đặc biệt khoa chẩn đoán hình ảnh tồn đọng 800-1200 phim X-quang/ngày, trả kết quả sau 2-3 ngày.</p>
<h3>Nhu cầu AI</h3>
<p>Cần hệ thống AI hỗ trợ đọc X-quang phổi (phát hiện viêm phổi, lao, tràn dịch) để giảm tải khoa CĐHA. AI triage bệnh nhân tại khoa cấp cứu để phân loại ưu tiên. Clinical decision support gợi ý chẩn đoán và phác đồ điều trị cho bác sĩ trẻ. Phải tích hợp với HIS hiện tại (Hệ thống Vinmec).</p>
<h3>Yêu cầu kỹ thuật</h3>
<p>Giải pháp phải có CE-Mark hoặc FDA clearance, hoặc đang trong quá trình xin phép Bộ Y tế Việt Nam. Độ nhạy tối thiểu 95% cho các bệnh lý phổ biến. Thời gian phân tích dưới 60 giây/case. Explainability: hiển thị vùng tổn thương để bác sĩ phê duyệt.</p>`,
  },
  {
    title:
      'Cần giải pháp theo dõi sức khỏe từ xa cho 50.000 bệnh nhân đái tháo đường',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Quản Lý Bệnh Nhân Đái Tháo Đường Quy Mô Lớn Tại Tỉnh</h2>
<p>Sở Y tế tỉnh chúng tôi quản lý 50.000 bệnh nhân đái tháo đường type 2 phân bổ tại 150 xã phường, chủ yếu người cao tuổi. Hiện tại theo dõi bằng sổ sách, bệnh nhân tái khám không đều, biến chứng phát hiện muộn. Năm ngoái có 340 ca biến chứng nặng phải nhập viện, 45 ca tử vong do không kiểm soát được đường huyết.</p>
<h3>Bài toán cụ thể</h3>
<p>Cần thiết bị đo đường huyết và huyết áp tại nhà dễ dùng cho người cao tuổi ít hiểu biết công nghệ. Dữ liệu phải tự động gửi về trạm y tế xã. Bác sĩ tuyến huyện cần dashboard theo dõi và cảnh báo khi có bất thường. Hệ thống nhắc uống thuốc qua điện thoại người thân.</p>
<h3>Ràng buộc</h3>
<p>Ngân sách từ nguồn bảo hiểm y tế và dự án WHO: 15 tỷ đồng cho 3 năm. Thiết bị phải chịu được điều kiện nhiệt đới, pin lâu, thao tác đơn giản. Cần đào tạo cán bộ y tế xã sử dụng hệ thống trong 1 tuần. Ưu tiên giải pháp đã triển khai thành công tại tỉnh/thành khác ở Việt Nam.</p>`,
  },
  {
    title:
      'Phòng khám tư cần phần mềm quản lý toàn diện tích hợp đặt lịch online',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Số Hóa Phòng Khám Chuyên Khoa Nội Tiết 5 Bác Sĩ</h2>
<p>Phòng khám nội tiết của chúng tôi có 5 bác sĩ, tiếp nhận 80-100 bệnh nhân/ngày. Hiện tại đặt lịch qua điện thoại, sổ giấy, thường xảy ra trùng lịch, bệnh nhân chờ 1-2 giờ. Không có hồ sơ bệnh án điện tử, mỗi lần tái khám bác sĩ phải hỏi lại từ đầu. Doanh thu khó kiểm soát vì không có báo cáo tự động.</p>
<h3>Tính năng cần thiết</h3>
<p>Đặt lịch online qua website và Zalo. Hồ sơ bệnh nhân điện tử lưu lịch sử khám, kết quả xét nghiệm, đơn thuốc. Kê đơn điện tử có cảnh báo tương tác thuốc. Thanh toán tích hợp MoMo, VNPAY. Báo cáo doanh thu tự động hàng ngày/tuần/tháng. Nhắc lịch tái khám tự động qua SMS/Zalo.</p>
<h3>Ngân sách và kỳ vọng</h3>
<p>Ngân sách 5-15 triệu đồng/tháng (SaaS). Cần triển khai và đào tạo xong trong 2 tuần. Hỗ trợ kỹ thuật nhanh khi có sự cố. Ưu tiên phần mềm đã có nhiều phòng khám nội tiết sử dụng tại Việt Nam.</p>`,
  },
  {
    title:
      'Chuỗi nhà thuốc 200 chi nhánh cần hệ thống quản lý tồn kho và dược phẩm',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Dược phẩm & Công nghệ sinh học'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Tối Ưu Hóa Tồn Kho Dược Phẩm Cho Chuỗi 200 Nhà Thuốc GPP</h2>
<p>Chuỗi nhà thuốc GPP của chúng tôi có 200 chi nhánh tại 30 tỉnh thành. Tổng tồn kho 50 tỷ đồng nhưng vẫn xảy ra tình trạng hết hàng 15-20 SKU/ngày tại mỗi chi nhánh. Đồng thời có 8-12% hàng tồn quá hạn phải tiêu hủy mỗi năm. Hệ thống hiện tại không dự báo nhu cầu, đặt hàng hoàn toàn theo cảm tính của quản lý chi nhánh.</p>
<h3>Bài toán tồn kho</h3>
<p>Cần hệ thống dự báo nhu cầu thuốc theo từng chi nhánh dựa trên lịch sử bán, mùa dịch, địa phương. Tự động đề xuất đặt hàng tối ưu. Cảnh báo hàng sắp hết hạn 30/60/90 ngày trước. Quản lý nhiệt độ bảo quản cho nhóm thuốc cần điều kiện đặc biệt. Tích hợp đặt hàng B2B với các nhà phân phối lớn.</p>
<h3>Yêu cầu hệ thống</h3>
<p>Dashboard tập trung cho quản lý chuỗi theo dõi tất cả chi nhánh. Mobile app cho quản lý chi nhánh kiểm kho và đặt hàng. Tuân thủ GDP theo quy định Bộ Y tế. Tích hợp với phần mềm bán hàng hiện tại. Ngân sách 3-8 tỷ đồng triển khai, 500 triệu/năm vận hành.</p>`,
  },
  {
    title:
      'Bệnh viện nhi cần ứng dụng giáo dục sức khỏe và theo dõi phát triển trẻ em',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Giáo dục'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Nền Tảng Số Theo Dõi Sức Khỏe Và Phát Triển Toàn Diện Cho Trẻ Em</h2>
<p>Bệnh viện Nhi của chúng tôi khám cho 1.200 trẻ em/ngày. Phụ huynh thường lo lắng về sự phát triển của con nhưng không có công cụ theo dõi chuẩn xác giữa các lần khám. Nhiều trường hợp phát triển chậm (thể chất, nhận thức, ngôn ngữ) được phát hiện quá muộn do thiếu screening định kỳ.</p>
<h3>Nhu cầu ứng dụng</h3>
<p>App mobile cho phụ huynh: theo dõi chiều cao, cân nặng theo chuẩn WHO với biểu đồ tăng trưởng. Nhật ký vaccine và nhắc lịch tiêm chủng. Milestone chart theo dõi phát triển ngôn ngữ, vận động, xã hội theo độ tuổi. Sàng lọc tự động phát hiện nguy cơ tự kỷ, rối loạn phát triển. Kết nối với bác sĩ nhi khoa qua telemedicine.</p>
<h3>Tích hợp bệnh viện</h3>
<p>Đồng bộ dữ liệu khám bệnh từ HIS bệnh viện. Bác sĩ nhập kết quả khám trực tiếp vào app. Thống kê dân số học phục vụ nghiên cứu khoa học. Ngân sách 2-5 tỷ đồng, ưu tiên giải pháp có thể white-label cho bệnh viện.</p>`,
  },

  // --- Dược phẩm & Công nghệ sinh học ---
  {
    title:
      'Công ty dược cần hệ thống số hóa quy trình đăng ký thuốc và hồ sơ GMP',
    sectorNames: ['Dược phẩm & Công nghệ sinh học'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Thách Thức Quản Lý Hồ Sơ Đăng Ký Thuốc Và Tuân Thủ GMP</h2>
<p>Công ty dược của chúng tôi có 150 số đăng ký thuốc đang hoạt động và 40 hồ sơ đang chờ phê duyệt tại Cục Quản lý Dược. Toàn bộ hồ sơ đang quản lý bằng file server và email, mỗi lần cần tài liệu mất 30-60 phút tìm kiếm. Năm ngoái bị phạt 2 lần vì nộp hồ sơ gia hạn trễ do quên theo dõi hạn đăng ký.</p>
<h3>Vấn đề cần giải quyết</h3>
<p>Quản lý toàn bộ lifecycle đăng ký thuốc từ nộp hồ sơ đến gia hạn. Cảnh báo tự động hạn đăng ký 6-12 tháng trước. Lưu trữ và tìm kiếm hồ sơ GMP (SOP, batch record, CoA) hiệu quả. Quản lý variation sau đăng ký (thay đổi nhà cung cấp, bao bì, thành phần). Chuẩn bị hồ sơ eCTD theo định dạng Cục Quản lý Dược yêu cầu.</p>
<h3>Yêu cầu</h3>
<p>Phần mềm regulatory affairs chuyên biệt cho thị trường Việt Nam. Hiểu quy trình Cục Quản lý Dược Việt Nam. Dưới 200 triệu đồng/năm. Có thể triển khai và đào tạo trong 1 tháng. Ưu tiên vendor đã phục vụ các công ty dược trong nước.</p>`,
  },
  {
    title:
      'Nhà máy dược phẩm cần hệ thống quản lý sản xuất và kiểm soát chất lượng GMP',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Sản xuất & Công nghiệp'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Nâng Cấp Hệ Thống Sản Xuất Để Đạt Chứng Nhận WHO-GMP Xuất Khẩu</h2>
<p>Nhà máy dược phẩm của chúng tôi hiện đạt GMP-ASEAN và đang hướng đến WHO-GMP để xuất khẩu sang các thị trường Africa và Đông Nam Á. Tuy nhiên đoàn thanh tra WHO lần trước đưa ra 12 observation, trong đó 3 critical liên quan đến data integrity: hồ sơ lô bằng giấy dễ sửa, thiếu audit trail, không có electronic batch record.</p>
<h3>Gap cần khắc phục</h3>
<p>Chuyển đổi toàn bộ batch record từ giấy sang điện tử (eBR). Hệ thống LIMS kết nối tự động với thiết bị phân tích QC. Quản lý deviation và CAPA điện tử. Audit trail 21 CFR Part 11. Môi trường và tiện ích (HVAC, nước tinh khiết) monitoring real-time. Quản lý calibration thiết bị.</p>
<h3>Ràng buộc dự án</h3>
<p>Cần đạt chứng nhận WHO-GMP trong 18 tháng để ký hợp đồng xuất khẩu trị giá 50 triệu USD. Ngân sách 5-15 tỷ đồng. Cần vendor có kinh nghiệm hỗ trợ audit WHO-GMP tại Việt Nam và đã có khách hàng đạt chứng nhận thành công.</p>`,
  },
  {
    title: 'Startup biotech cần đối tác phát triển và sản xuất thuốc sinh học',
    sectorNames: ['Dược phẩm & Công nghệ sinh học'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Tìm CDMO Cho Thuốc Sinh Học Kháng Thể Đơn Dòng Điều Trị Ung Thư</h2>
<p>Startup biotech của chúng tôi đã nghiên cứu thành công kháng thể đơn dòng (mAb) điều trị ung thư gan giai đoạn sớm với dữ liệu tiền lâm sàng đầy hứa hẹn. Chúng tôi cần CDMO (Contract Development and Manufacturing Organization) có thể giúp scale-up từ quy mô lab (2L) lên pilot batch (200L) đạt chuẩn GMP để xin phép thử nghiệm lâm sàng Phase I.</p>
<h3>Yêu cầu kỹ thuật</h3>
<p>Kinh nghiệm với mammalian cell culture (CHO cells) cho sản xuất mAb. Capacity bioreactor 50-500L GMP class. Downstream processing: protein A chromatography, viral inactivation, UF/DF. Phân tích đặc tính: SEC, icIEF, glycosylation, potency assay. Hồ sơ CMC đáp ứng yêu cầu IND submission FDA hoặc EMA.</p>
<h3>Mong đợi từ đối tác</h3>
<p>Có thể bắt đầu trong 6 tháng. Kinh nghiệm với ít nhất 3 mAb project thành công đến Phase I. Có QP (Qualified Person) và có thể hỗ trợ regulatory strategy. Flexible về IP ownership. Ngân sách 3-8 triệu USD cho giai đoạn development và pilot manufacturing.</p>`,
  },
  {
    title:
      'Viện nghiên cứu cần nền tảng quản lý dữ liệu và phân tích genomics quy mô lớn',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Công nghệ thông tin'],
    type: IntakeType.CHALLENGE,
    content: `<h2>Hạ Tầng Tin Sinh Học Cho Dự Án Giải Mã 100.000 Genome Người Việt</h2>
<p>Viện Nghiên cứu của chúng tôi đang triển khai dự án giải mã genome 100.000 người Việt Nam nhằm xây dựng database di truyền học quốc gia. Năm đầu đã có 15.000 mẫu, dữ liệu raw WGS lên đến 5TB/100 samples. Hạ tầng tin sinh học hiện tại không đủ để xử lý quy mô này và thiếu pipeline phân tích variant chuẩn hóa.</p>
<h3>Nhu cầu hạ tầng</h3>
<p>HPC cluster hoặc cloud bioinformatics platform xử lý được 1,000 WGS samples/tháng. Pipeline phân tích tự động: alignment, variant calling, annotation, QC. Database lưu trữ và query variant có khả năng mở rộng đến 1 triệu genome. Bảo mật dữ liệu y tế theo quy định (de-identification, access control). Công cụ GWAS và population genetics phân tích.</p>
<h3>Ưu tiên</h3>
<p>Tuân thủ quy định bảo vệ dữ liệu cá nhân Việt Nam. Tích hợp với hệ thống biobank và lab automation. Hỗ trợ cộng tác với đối tác quốc tế (IGSR, HGDP). Ngân sách 20-50 tỷ đồng cho 5 năm. Ưu tiên giải pháp có thể deploy on-premise do yêu cầu data sovereignty.</p>`,
  },
];

export const ALL_SEEDS = SEEDS;

if (require.main === module) {
  runSectorSeed('Challenges (Buyer)', SEEDS).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
