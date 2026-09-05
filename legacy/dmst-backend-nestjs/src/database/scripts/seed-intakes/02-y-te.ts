import { IntakeSeedData, runSectorSeed } from './shared';

export const SEEDS: IntakeSeedData[] = [
  {
    title: 'Hệ thống thông tin bệnh viện HIS thông minh tích hợp toàn diện',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Công nghệ thông tin'],
    content: `<h2>HIS Thông Minh - Số Hóa Toàn Diện Hoạt Động Bệnh Viện</h2>
<p>Hệ thống thông tin bệnh viện (HIS) thế hệ mới, tích hợp hồ sơ bệnh án điện tử (EMR), quản lý viện phí, dược phẩm, xét nghiệm và hình ảnh y tế trên một nền tảng duy nhất.</p>
<h3>Thực trạng bệnh viện Việt Nam</h3>
<p>Hơn 70% bệnh viện tuyến tỉnh vẫn sử dụng hệ thống cũ, dữ liệu phân tán ở nhiều phần mềm không kết nối. Bác sĩ mất 30% thời gian ghi chép thủ công thay vì khám bệnh. Bệnh nhân chờ đợi trung bình 2-4 giờ cho một lần khám do quy trình rời rạc. Sai sót y tế do thiếu thông tin bệnh sử chiếm 15% sự cố y khoa.</p>
<h3>Các module chính</h3>
<p>EMR: hồ sơ bệnh án điện tử chuẩn HL7 FHIR, lưu trữ toàn bộ lịch sử khám chữa bệnh. OPD/IPD: quản lý bệnh nhân ngoại trú và nội trú. LIS: quản lý xét nghiệm, trả kết quả điện tử. PACS: lưu trữ và xem hình ảnh chẩn đoán DICOM. Pharmacy: quản lý thuốc, cảnh báo tương tác thuốc tự động. Billing: viện phí, bảo hiểm y tế tự động đối chiếu với BHYT.</p>
<h3>Tích hợp hệ sinh thái y tế</h3>
<p>Kết nối cổng dữ liệu y tế quốc gia. Tích hợp thiết bị y tế (máy xét nghiệm, máy chụp chiếu) tự động đẩy kết quả. Telemedicine module hội chẩn từ xa. App mobile cho bác sĩ xem và ghi hồ sơ mọi nơi.</p>
<h3>Tuân thủ và bảo mật</h3>
<p>Đáp ứng Thông tư 46/2018/TT-BYT về hồ sơ bệnh án điện tử. Mã hóa dữ liệu y tế theo chuẩn HIPAA. Triển khai tại 45 bệnh viện tuyến tỉnh và trung ương, phục vụ 5 triệu lượt khám/năm.</p>`,
  },
  {
    title:
      'Thiết bị telemedicine theo dõi sức khỏe từ xa cho bệnh nhân mãn tính',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>Telemedicine Hub - Kết Nối Bệnh Nhân Mãn Tính Với Bác Sĩ 24/7</h2>
<p>Thiết bị y tế đeo tay và gateway gia đình theo dõi liên tục các chỉ số sức khỏe của bệnh nhân mãn tính (đái tháo đường, tim mạch, tăng huyết áp), tự động gửi cảnh báo cho bác sĩ khi có bất thường.</p>
<h3>Gánh nặng bệnh mãn tính tại Việt Nam</h3>
<p>Việt Nam có 5 triệu bệnh nhân đái tháo đường, 11 triệu người tăng huyết áp và 1.2 triệu người mắc bệnh tim mạch. 60% biến chứng nghiêm trọng có thể phòng ngừa nếu phát hiện và can thiệp sớm. Bệnh nhân tuyến dưới thường chỉ được khám 1-2 lần/tháng, khoảng trống giữa các lần khám là rủi ro lớn.</p>
<h3>Hệ thống thiết bị</h3>
<p>Vòng đeo tay y tế đo liên tục: nhịp tim, SpO2, nhịp thở, nhiệt độ, ECG 1 kênh, hoạt động thể chất. Gateway nhà ở kết nối WiFi/4G đo huyết áp, đường huyết không xâm lấn mỗi 15 phút. Máy đo đường huyết CGM tích hợp truyền dữ liệu tự động. Pin 7 ngày, chống nước IP68.</p>
<h3>Nền tảng phần mềm</h3>
<p>AI phân tích xu hướng chỉ số, dự báo nguy cơ biến chứng 24-72 giờ trước khi xảy ra. Dashboard bác sĩ quản lý 500+ bệnh nhân, phân loại theo mức độ ưu tiên. Tư vấn video với bác sĩ ngay trên app. Nhắc uống thuốc và lịch tái khám tự động. Chia sẻ dữ liệu với gia đình người bệnh.</p>
<h3>Tác động lâm sàng</h3>
<p>Giảm 45% lượt nhập viện cấp cứu của bệnh nhân đái tháo đường trong thử nghiệm 6 tháng. Phát hiện sớm 87% trường hợp rối loạn nhịp tim nguy hiểm. Tiết kiệm trung bình 12 triệu đồng/bệnh nhân/năm chi phí điều trị. Đang phục vụ 15,000 bệnh nhân mãn tính tại 8 tỉnh thành.</p>`,
  },
  {
    title: 'Nền tảng AI chẩn đoán hình ảnh X-quang phổi hỗ trợ bác sĩ',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Công nghệ thông tin'],
    content: `<h2>AI Radiology Assistant - Tăng Tốc Và Nâng Cao Độ Chính Xác Đọc Film X-Quang</h2>
<p>Hệ thống AI phân tích hình ảnh X-quang phổi và CT scan, hỗ trợ bác sĩ chẩn đoán 15 loại bệnh phổi phổ biến với độ nhạy 97.3% và tốc độ xử lý dưới 60 giây mỗi case.</p>
<h3>Áp lực chẩn đoán hình ảnh</h3>
<p>Số lượng hình ảnh X-quang cần đọc tăng 40% mỗi năm nhưng số bác sĩ chẩn đoán hình ảnh không tăng tương ứng. Mỗi bác sĩ phải đọc 80-120 film/ngày dễ dẫn đến sai sót do mệt mỏi. Bệnh nhân ở tuyến huyện phải chờ 3-5 ngày kết quả do thiếu chuyên gia.</p>
<h3>Khả năng chẩn đoán AI</h3>
<p>Phát hiện và định lượng: viêm phổi, lao phổi, tràn dịch màng phổi, u phổi, COVID-19, COPD, phù phổi. Đo kích thước và theo dõi tiến triển khối u qua nhiều lần chụp. Ưu tiên case khẩn cấp tự động (tràn khí màng phổi, nhồi máu phổi). Tích hợp PACS, trả kết quả ngay trên giao diện quen thuộc của bác sĩ.</p>
<h3>Giải thích AI (XAI)</h3>
<p>Heatmap hiển thị vùng tổn thương AI phát hiện. Confidence score cho từng chẩn đoán. So sánh với database 2 triệu case tương tự. Gợi ý chẩn đoán phân biệt theo evidence. Bác sĩ chỉnh sửa và phê duyệt cuối cùng, AI học từ phản hồi.</p>
<h3>Triển khai thực tế</h3>
<p>CE-Mark (châu Âu) và đang xin phép Bộ Y tế Việt Nam. Triển khai tại 28 bệnh viện, xử lý 3,000+ film/ngày. Giảm 60% thời gian đọc film thông thường, tăng 23% độ nhạy phát hiện ung thư phổi giai đoạn sớm.</p>`,
  },
  {
    title: 'Phần mềm quản lý phòng khám đa khoa và chuỗi phòng khám tư nhân',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>ClinicPro - Giải Pháp Quản Lý Phòng Khám Tư Nhân Hiện Đại</h2>
<p>Phần mềm quản lý phòng khám toàn diện cho phòng khám đơn lẻ và chuỗi phòng khám tư nhân, tích hợp đặt lịch online, EMR, thanh toán và marketing trong một nền tảng duy nhất.</p>
<h3>Thị trường phòng khám tư nhân</h3>
<p>Việt Nam có hơn 35,000 phòng khám tư nhân, tăng trưởng 15%/năm nhưng 78% vẫn quản lý bằng sổ sách hoặc phần mềm lỗi thời. Bệnh nhân phải gọi điện đặt lịch, chờ đợi lâu, không có hồ sơ bệnh sử đầy đủ. Chủ phòng khám thiếu dữ liệu để quản lý hiệu quả và mở rộng chuỗi.</p>
<h3>Tính năng đặt lịch và front desk</h3>
<p>Đặt lịch online 24/7 qua web, app, Zalo OA. Tự động gửi nhắc lịch hẹn qua SMS/Zalo. Check-in nhanh bằng mã QR. Màn hình hiển thị tại phòng chờ. Quản lý hàng chờ real-time. Tối ưu lịch bác sĩ tự động dựa trên thời gian khám trung bình.</p>
<h3>Hồ sơ bệnh án và kê đơn</h3>
<p>EMR chuẩn hóa theo chuyên khoa (nhi, nha, phụ sản, da liễu, tổng quát). Kê đơn điện tử với cảnh báo tương tác thuốc, dị ứng. Yêu cầu xét nghiệm, hình ảnh tích hợp với lab bên ngoài. Thanh toán viện phí, xuất hóa đơn điện tử theo TT78 Bộ Tài chính.</p>
<h3>Marketing và tăng trưởng</h3>
<p>Chương trình khách hàng thân thiết tự động. Email/SMS/Zalo marketing theo phân khúc bệnh nhân. Đánh giá 5 sao tự động sau mỗi lần khám. Báo cáo doanh thu, tỷ lệ quay lại, bác sĩ hiệu quả nhất. Đang phục vụ 1,200+ phòng khám và 15 chuỗi phòng khám toàn quốc.</p>`,
  },
  {
    title: 'Hệ thống quản lý và phân phối dược phẩm thông minh cho nhà thuốc',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Dược phẩm & Công nghệ sinh học'],
    content: `<h2>PharmaSmart - Số Hóa Chuỗi Phân Phối Dược Phẩm An Toàn Và Hiệu Quả</h2>
<p>Hệ thống quản lý nhà thuốc và chuỗi phân phối dược phẩm tích hợp, đảm bảo kiểm soát chất lượng, truy xuất nguồn gốc thuốc và tuân thủ GDP/GPP theo quy định Bộ Y tế.</p>
<h3>Thách thức ngành dược phẩm</h3>
<p>Thuốc giả, thuốc kém chất lượng gây thiệt hại ước tính 1.5 tỷ USD/năm. Quy định GDP (Good Distribution Practice) yêu cầu kiểm soát nhiệt độ toàn chuỗi lạnh. Quản lý hạn sử dụng thủ công dẫn đến hàng hóa hết hạn, gây lãng phí 8-12% doanh thu. Kê khai với cơ quan quản lý còn nhiều thủ công, rủi ro sai sót.</p>
<h3>Tính năng quản lý nhà thuốc</h3>
<p>Nhập hàng tự động quét mã vạch/QR code, kiểm tra nguồn gốc trên blockchain. Cảnh báo hàng sắp hết hạn 30/60/90 ngày trước. Kiểm soát tồn kho FIFO/FEFO tự động. Kê đơn thuốc điện tử theo toa bác sĩ. Báo cáo Bộ Y tế (DQMS) tự động theo định kỳ.</p>
<h3>Chuỗi lạnh và điều kiện bảo quản</h3>
<p>IoT sensor theo dõi nhiệt độ, độ ẩm kho thuốc real-time. Cảnh báo ngay khi vi phạm điều kiện bảo quản. Ghi log tự động đủ tiêu chuẩn kiểm định GDP. Báo cáo deviation temperature có chữ ký điện tử.</p>
<h3>Hiệu quả kinh doanh</h3>
<p>Giảm 25% hàng hóa hết hạn phải tiêu hủy. Tăng 18% vòng quay hàng tồn kho. 100% nhà thuốc GPP trong 6 kỳ kiểm tra không vi phạm. Đang phục vụ 3,500+ nhà thuốc và 25 công ty phân phối dược phẩm.</p>`,
  },
  {
    title: 'Nền tảng tư vấn sức khỏe và khám bệnh trực tuyến',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>HealthConnect - Tiếp Cận Bác Sĩ Chuyên Khoa Mọi Lúc Mọi Nơi</h2>
<p>Nền tảng khám bệnh và tư vấn sức khỏe trực tuyến kết nối bệnh nhân với 5,000+ bác sĩ chuyên khoa, cho phép khám video, nhận đơn thuốc điện tử và theo dõi sức khỏe liên tục.</p>
<h3>Rào cản tiếp cận y tế</h3>
<p>60% dân số Việt Nam ở vùng nông thôn nhưng 70% bác sĩ chuyên khoa tập trung ở Hà Nội và TP.HCM. Chi phí đi lại và chờ đợi tại bệnh viện trung bình tốn 4-6 giờ/lần khám. Người bệnh thường tự mua thuốc hoặc tham khảo Google trước khi đến bác sĩ, dẫn đến nhiều hệ quả nguy hiểm.</p>
<h3>Tính năng nền tảng</h3>
<p>Khám video HD với bác sĩ trong vòng 15 phút sau đặt lịch. Chat text với bác sĩ 24/7 cho câu hỏi sức khỏe thông thường. Kê đơn điện tử giao thuốc tận nhà trong 2 giờ (tại Hà Nội và TP.HCM). Lịch sử khám bệnh và theo dõi sức khỏe cá nhân. Chương trình sức khỏe doanh nghiệp với gói khám định kỳ cho nhân viên.</p>
<h3>Đội ngũ bác sĩ</h3>
<p>5,000+ bác sĩ từ các bệnh viện hàng đầu xét duyệt khắt khe. 35 chuyên khoa từ nội khoa, nhi, phụ sản, da liễu, tâm lý đến ung thư. Đánh giá bác sĩ minh bạch từ bệnh nhân. Bảo hiểm trách nhiệm nghề nghiệp cho mọi bác sĩ trên nền tảng.</p>
<h3>Quy mô và tăng trưởng</h3>
<p>1.2 triệu bệnh nhân đăng ký, 15,000 lượt khám/ngày. Chi phí khám trung bình 150,000-300,000 đồng, tiết kiệm 70% so với khám trực tiếp. Series B vừa huy động 20 triệu USD để mở rộng toàn Đông Nam Á.</p>`,
  },
  {
    title: 'Robot phục hồi chức năng thông minh hỗ trợ bệnh nhân đột quỵ',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Tự động hóa & Robot'],
    content: `<h2>RehabBot - Robot Phục Hồi Chức Năng Cá Nhân Hóa Cho Bệnh Nhân Đột Quỵ</h2>
<p>Robot đeo tay thông minh kết hợp AI để cá nhân hóa chương trình phục hồi chức năng cho bệnh nhân sau đột quỵ, stroke và chấn thương tủy sống, tăng tốc độ phục hồi và giảm gánh nặng cho đội ngũ vật lý trị liệu.</p>
<h3>Gánh nặng đột quỵ tại Việt Nam</h3>
<p>200,000 ca đột quỵ mới mỗi năm, 50% để lại di chứng liệt nửa người cần phục hồi chức năng. Thiếu trầm trọng nhân lực vật lý trị liệu (chỉ 3 chuyên gia/100,000 dân). Chi phí phục hồi chức năng dài hạn 50-200 triệu đồng/bệnh nhân. Bệnh nhân tập tại nhà không có hướng dẫn chuyên nghiệp thường bỏ cuộc sau 2-3 tháng.</p>
<h3>Hệ thống robot</h3>
<p>Exoskeleton tay và bàn tay với 12 motor servo nhỏ gọn. Sensor lực và EMG đo tín hiệu cơ của bệnh nhân. AI điều chỉnh lực hỗ trợ real-time theo khả năng từng người. Game trị liệu gamification tăng động lực tập luyện. Camera phân tích dáng đứng và chuyển động toàn thân.</p>
<h3>Chương trình phục hồi</h3>
<p>AI lập kế hoạch tập luyện cá nhân hóa dựa trên đánh giá ban đầu. 300+ bài tập phân loại theo giai đoạn phục hồi và vùng tổn thương. Bác sĩ điều chỉnh chương trình từ xa qua dashboard. Gia đình theo dõi tiến trình và hỗ trợ từ app mobile. Báo cáo tiến trình chi tiết cho bảo hiểm y tế.</p>
<h3>Kết quả lâm sàng</h3>
<p>Thử nghiệm 180 bệnh nhân tại BV Bạch Mai: nhóm dùng robot phục hồi nhanh hơn 45% so với nhóm truyền thống. 78% bệnh nhân duy trì tập đủ 3 tháng (so với 35% nhóm truyền thống). Đang trong quá trình xin phép lưu hành Bộ Y tế.</p>`,
  },
  {
    title: 'Hệ thống cảnh báo sớm và kiểm soát dịch bệnh ứng dụng Big Data',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Công nghệ thông tin'],
    content: `<h2>EpiGuard - Hệ Thống Thông Minh Giám Sát Và Kiểm Soát Dịch Bệnh</h2>
<p>Nền tảng surveillance dịch bệnh tích hợp dữ liệu từ bệnh viện, mạng xã hội, dữ liệu di chuyển để cảnh báo sớm ổ dịch và hỗ trợ cơ quan y tế phân bổ nguồn lực ứng phó hiệu quả.</p>
<h3>Bài học từ đại dịch COVID-19</h3>
<p>Ứng phó chậm trễ trong những ngày đầu dịch COVID-19 gây thiệt hại kinh tế toàn cầu 10 nghìn tỷ USD. Hệ thống báo cáo dịch bệnh truyền thống chậm 7-14 ngày so với thực tế. Thiếu công cụ phân tích và dự báo khiến ngành y tế bị động trong phân bổ nguồn lực.</p>
<h3>Nguồn dữ liệu và AI</h3>
<p>Real-time data feed từ HIS của 300+ bệnh viện (hội chứng ILI, SARI). Web scraping và NLP phân tích 50,000 bài đăng mạng xã hội/ngày phát hiện cụm triệu chứng. Dữ liệu di chuyển ẩn danh từ telco để mô hình hóa lây lan. Weather data tương quan với mùa dịch. AI dự báo nguy cơ ổ dịch 14 ngày trước, độ chính xác 83%.</p>
<h3>Tính năng ứng phó dịch</h3>
<p>Dashboard geospatial hiển thị bản đồ nguy cơ toàn quốc. Alert system thông báo tự động cho Bộ Y tế, Sở Y tế theo phân cấp. Mô phỏng kịch bản lây lan để lập kế hoạch ứng phó. Phân bổ vắc-xin và thuốc tối ưu dựa trên mô hình nguy cơ. Báo cáo định kỳ cho WHO theo chuẩn IHR.</p>
<h3>Triển khai</h3>
<p>Đang vận hành tại 15 tỉnh thành thí điểm. Phát hiện sớm 3 ổ dịch sốt xuất huyết và 1 ổ cúm A trong năm 2024, giúp kiểm soát trước khi bùng phát rộng. Đối tác của WHO WPRO và CDC Hoa Kỳ trong dự án GHSA.</p>`,
  },
  {
    title: 'Giải pháp quản lý chuỗi lạnh vaccine và sinh phẩm y tế',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Dược phẩm & Công nghệ sinh học'],
    content: `<h2>ColdChain Pro - Bảo Toàn Hiệu Lực Vaccine Qua Toàn Chuỗi Lạnh</h2>
<p>Hệ thống quản lý và giám sát chuỗi lạnh vaccine và sinh phẩm y tế end-to-end, từ nhà sản xuất đến điểm tiêm chủng, đảm bảo 100% vaccine giữ nguyên hiệu lực và truy xuất nguồn gốc minh bạch.</p>
<h3>Rủi ro chuỗi lạnh vaccine</h3>
<p>Vaccine bị gián đoạn chuỗi lạnh mất hoàn toàn hiệu lực nhưng không thể phân biệt bằng mắt thường. WHO ước tính 25% vaccine trên toàn cầu mất hiệu lực do vấn đề chuỗi lạnh, gây lãng phí 34 tỷ USD/năm. Việt Nam gặp sự cố vaccine kém chất lượng nhiều lần do thiếu hệ thống giám sát hiệu quả.</p>
<h3>Công nghệ giám sát</h3>
<p>IoT sensor nhiệt độ đặt tại mọi điểm trong chuỗi: kho trung ương, xe lạnh, tủ lạnh điểm tiêm. Cảnh báo tức thì qua SMS/app khi nhiệt độ vượt ngưỡng 2-8°C. Data logger thụ động trong từng lô hàng ghi lịch sử nhiệt độ toàn chặng đường. VVM (Vaccine Vial Monitor) điện tử thay thế nhãn giấy truyền thống.</p>
<h3>Quản lý tồn kho và phân phối</h3>
<p>Forecast nhu cầu vaccine theo lịch tiêm chủng quốc gia và dịch tễ địa phương. Phân bổ vaccine tự động tối thiểu lãng phí, ưu tiên vùng nguy cơ cao. Truy xuất nguồn gốc từng lọ vaccine bằng QR code. Dashboard quản lý tỷ lệ tiêm chủng theo địa bàn real-time.</p>
<h3>Kết quả triển khai</h3>
<p>Thí điểm tại Chương trình Tiêm chủng Mở rộng 5 tỉnh: giảm 35% lãng phí vaccine, phát hiện 12 sự cố chuỗi lạnh trước khi vaccine đến tay người dùng. Đang mở rộng toàn quốc với sự hỗ trợ của UNICEF và Bộ Y tế.</p>`,
  },
  {
    title: 'Nền tảng quản lý sức khỏe doanh nghiệp và chăm sóc nhân viên',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>CorpHealth - Đầu Tư Sức Khỏe Nhân Viên Là Đầu Tư Vào Năng Suất Doanh Nghiệp</h2>
<p>Nền tảng quản lý sức khỏe doanh nghiệp toàn diện, từ khám sức khỏe định kỳ, quản lý hồ sơ y tế nhân viên đến chương trình wellness, giúp doanh nghiệp giảm chi phí y tế và tăng năng suất lao động.</p>
<h3>Chi phí sức khỏe nhân viên</h3>
<p>Nhân viên không khỏe mạnh làm giảm 20-30% năng suất. Chi phí y tế doanh nghiệp tăng 15%/năm nhưng không có hệ thống theo dõi hiệu quả. Khám sức khỏe định kỳ truyền thống chỉ là formality, không phát hiện sớm và can thiệp kịp thời. Stress, burnout gây turnover cao tốn kém hơn nhiều so với đầu tư phòng ngừa.</p>
<h3>Dịch vụ nền tảng</h3>
<p>Tổ chức khám sức khỏe định kỳ tại công ty hoặc tại 200+ phòng khám đối tác. Hồ sơ y tế điện tử cho từng nhân viên, lưu lịch sử qua các năm. App wellness cá nhân: theo dõi bước chân, giấc ngủ, stress, dinh dưỡng. Tư vấn tâm lý online giấu tên 24/7. Dashboard cho HR theo dõi sức khỏe tổng thể (ẩn danh theo nhóm).</p>
<h3>Phòng ngừa và can thiệp sớm</h3>
<p>AI phân tích kết quả xét nghiệm phát hiện nguy cơ bệnh mãn tính. Chương trình can thiệp cá nhân hóa theo nhóm nguy cơ. Workshop dinh dưỡng, yoga, mindfulness trực tiếp và online. Chương trình cai thuốc lá, giảm cân có thưởng. EAP (Employee Assistance Program) cho khủng hoảng cá nhân.</p>
<h3>ROI cho doanh nghiệp</h3>
<p>Trung bình đầu tư 1 đồng vào wellness = tiết kiệm 3.5 đồng chi phí y tế và năng suất. Giảm 28% ngày nghỉ bệnh, tăng 15% Employee Engagement Score. Đang phục vụ 250 doanh nghiệp với 80,000+ nhân viên tham gia chương trình.</p>`,
  },
];

export const SEEDS_EXTRA: IntakeSeedData[] = [
  {
    title: 'Phần mềm quản lý phòng xét nghiệm và thiết bị y tế bệnh viện',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>LabTrack - Quản Lý Toàn Diện Phòng Xét Nghiệm Và Thiết Bị Y Tế</h2>
<p>Hệ thống quản lý phòng xét nghiệm lâm sàng và thiết bị y tế tích hợp, từ tiếp nhận mẫu, phân tích, trả kết quả đến bảo trì thiết bị, đảm bảo chất lượng theo chuẩn ISO 15189.</p>
<h3>Thực trạng phòng xét nghiệm bệnh viện</h3>
<p>Phòng xét nghiệm tuyến tỉnh xử lý 500-2,000 mẫu/ngày nhưng nhập liệu kết quả bằng tay, dễ nhầm lẫn và chậm trễ. Thiết bị y tế đắt tiền (máy MRI, CT, xét nghiệm huyết học) thường bảo trì theo lịch cố định thay vì theo tình trạng thực tế, gây hỏng đột xuất và chi phí sửa chữa cao. Thiếu hệ thống cảnh báo khi kết quả xét nghiệm nghiêm trọng.</p>
<h3>Module quản lý xét nghiệm</h3>
<p>Barcode/RFID tiếp nhận và theo dõi mẫu xét nghiệm từ đầu đến cuối. Tích hợp middleware kết nối máy phân tích tự động import kết quả. Delta check: so sánh kết quả mới với kết quả cũ phát hiện bất thường. Critical value alert: gửi SMS/app cho bác sĩ ngay khi có kết quả nguy hiểm. QC nội kiểm và ngoại kiểm tự động, xuất báo cáo EQAS.</p>
<h3>Quản lý thiết bị y tế</h3>
<p>Đăng ký toàn bộ thiết bị với thông tin kỹ thuật, hợp đồng bảo hành. Predictive maintenance AI dự đoán hỏng hóc trước 2-4 tuần dựa trên sensor và log thiết bị. Lịch bảo trì tự động theo condition-based thay vì time-based. Quản lý vật tư tiêu hao, hóa chất, phụ kiện tồn kho thông minh. Hồ sơ thiết bị đầy đủ cho kiểm định Bộ Y tế.</p>
<h3>Kết quả triển khai</h3>
<p>Giảm 60% thời gian trả kết quả xét nghiệm. Tăng 30% thời gian hoạt động thiết bị nhờ bảo trì dự đoán. Triển khai tại 35 bệnh viện đa khoa tuyến tỉnh và tuyến trung ương.</p>`,
  },
  {
    title: 'Hệ thống quản lý dinh dưỡng bệnh viện và suất ăn bệnh nhân',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Thực phẩm & Đồ uống'],
    content: `<h2>NutriCare - Quản Lý Dinh Dưỡng Lâm Sàng Và Suất Ăn Bệnh Nhân Chuyên Nghiệp</h2>
<p>Hệ thống quản lý dinh dưỡng bệnh viện toàn diện, từ đánh giá tình trạng dinh dưỡng bệnh nhân, lập kế hoạch dinh dưỡng lâm sàng đến quản lý bếp ăn và phân phối suất ăn điều trị.</p>
<h3>Tầm quan trọng của dinh dưỡng lâm sàng</h3>
<p>40-60% bệnh nhân nhập viện có tình trạng suy dinh dưỡng, làm chậm hồi phục và tăng biến chứng. Thiếu hệ thống đánh giá và theo dõi dinh dưỡng khiến nhiều trường hợp không được phát hiện và can thiệp kịp thời. Quản lý bếp ăn bệnh viện phục vụ 500-3,000 suất/ngày thường bằng giấy, dễ sai sót và lãng phí thực phẩm.</p>
<h3>Đánh giá và can thiệp dinh dưỡng</h3>
<p>Công cụ sàng lọc NRS-2002, MUST, MNA điện tử tích hợp vào quy trình nhập viện. AI phân tích kết quả xét nghiệm, chẩn đoán và tiền sử để gợi ý kế hoạch dinh dưỡng. Theo dõi intake thực tế hàng ngày và so sánh với nhu cầu. Cảnh báo tự động cho dietitian khi bệnh nhân có nguy cơ cao. Tích hợp với HIS và EMR bệnh viện.</p>
<h3>Quản lý bếp ăn thông minh</h3>
<p>Menu planning tự động theo chế độ ăn điều trị (đái tháo đường, thận, tim mạch, dị ứng). Tính toán nguyên liệu chính xác theo số suất thực tế, giảm lãng phí. Kiểm soát chi phí thực phẩm theo ngân sách. HACCP checklist điện tử đảm bảo an toàn thực phẩm. Phân phối suất ăn đúng bệnh nhân bằng barcode.</p>
<h3>Kết quả lâm sàng</h3>
<p>Giảm 25% tỷ lệ biến chứng liên quan dinh dưỡng. Rút ngắn 2 ngày thời gian nằm viện trung bình. Giảm 20% chi phí thực phẩm nhờ tối ưu hóa. Triển khai tại 20 bệnh viện đa khoa và chuyên khoa.</p>`,
  },
  {
    title: 'Giải pháp AI hỗ trợ phân loại và ưu tiên bệnh nhân cấp cứu',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Công nghệ thông tin'],
    content: `<h2>EmergencyAI - Triage Thông Minh Cứu Sống Bệnh Nhân Trong Từng Giây</h2>
<p>Hệ thống AI hỗ trợ phân loại và ưu tiên bệnh nhân (triage) tại khoa cấp cứu, dựa trên sinh hiệu, triệu chứng và bệnh sử để dự báo mức độ nghiêm trọng và phân luồng điều trị tối ưu.</p>
<h3>Khủng hoảng cấp cứu</h3>
<p>Khoa cấp cứu bệnh viện lớn tiếp nhận 200-500 bệnh nhân/ngày, vượt tải thường xuyên. Triage thủ công bởi y tá dựa trên kinh nghiệm có thể sai sót đặc biệt khi quá tải. Bệnh nhân nặng bị bỏ sót trong dòng bệnh nhân nhẹ là tai biến y tế nghiêm trọng. Thiếu dữ liệu real-time về tình trạng tổng thể khoa cấp cứu để điều phối nguồn lực.</p>
<h3>Hệ thống triage AI</h3>
<p>Tablet tiếp nhận sinh hiệu tự động từ thiết bị Bluetooth (SpO2, huyết áp, nhịp tim, nhiệt độ). NLP tiếng Việt phân tích triệu chứng bệnh nhân tự khai. AI dự đoán 5 cấp độ ưu tiên và nguy cơ nhập viện ICU trong vòng 2 phút. Tích hợp với hệ thống EMR để lấy bệnh sử. Cảnh báo sớm SEPSIS, MI, stroke dựa trên pattern sinh hiệu.</p>
<h3>Điều phối cấp cứu</h3>
<p>Dashboard real-time tổng quan toàn khoa: số giường, bệnh nhân đang chờ, thời gian chờ trung bình. Điều phối bác sĩ và phòng khám tự động theo khối lượng công việc. Notification khi có ca bệnh phức tạp cần hội chẩn. Dự báo nhu cầu giường ICU 4-8 giờ tới giúp chuẩn bị trước.</p>
<h3>Kết quả cứu sống</h3>
<p>Giảm 35% thời gian door-to-treatment cho nhóm bệnh nhân nguy kịch. Phát hiện 92% ca SEPSIS trong vòng 60 phút nhập viện. Đang thử nghiệm tại 5 khoa cấp cứu bệnh viện tuyến trung ương.</p>`,
  },
  {
    title:
      'Nền tảng phục hồi sức khỏe tâm thần trực tuyến và ứng dụng thiền định',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>MindWell - Chăm Sóc Sức Khỏe Tâm Thần Toàn Diện Cho Người Việt</h2>
<p>Nền tảng số hỗ trợ sức khỏe tâm thần toàn diện, kết hợp tư vấn tâm lý trực tuyến, chương trình CBT (Cognitive Behavioral Therapy) số hóa và công cụ thiền định để tiếp cận chăm sóc tâm thần cho mọi đối tượng.</p>
<h3>Khủng hoảng sức khỏe tâm thần tại Việt Nam</h3>
<p>15 triệu người Việt Nam có vấn đề sức khỏe tâm thần nhưng chỉ 20% tiếp cận được điều trị. Kỳ thị xã hội là rào cản lớn nhất, nhiều người không muốn đến cơ sở y tế. Thiếu nghiêm trọng chuyên gia tâm lý (chỉ 0.5 bác sĩ tâm thần/100,000 dân so với 10 cần thiết). Chi phí trị liệu 500,000-2,000,000 đồng/buổi ngoài khả năng nhiều gia đình.</p>
<h3>Tư vấn và trị liệu trực tuyến</h3>
<p>300+ chuyên gia tâm lý được thẩm định, tư vấn video và chat giấu tên. Chương trình CBT số hóa 8 tuần cho lo âu, trầm cảm, mất ngủ. EMDR trực tuyến cho PTSD với hướng dẫn chuyên gia. Đánh giá PHQ-9, GAD-7, DASS-21 định kỳ theo dõi tiến trình. Hỗ trợ khủng hoảng 24/7 kết nối đường dây nóng.</p>
<h3>Công cụ tự chăm sóc</h3>
<p>Thư viện 500+ bài thiền, hít thở sâu, body scan tiếng Việt. Mood tracker và nhật ký cảm xúc có hướng dẫn. Lập trình thần kinh ngôn ngữ (NLP) và mindfulness dựa trên bằng chứng. Cộng đồng peer support được kiểm duyệt. Tích hợp wearable phát hiện stress qua nhịp tim.</p>
<h3>Tác động xã hội</h3>
<p>200,000 người dùng, 45% chưa từng tiếp cận dịch vụ tâm lý trước đây. Điểm PHQ-9 giảm trung bình 4.2 điểm sau 8 tuần chương trình CBT. Đối tác với 50 doanh nghiệp cung cấp EAP cho 100,000 nhân viên.</p>`,
  },
  {
    title:
      'Công nghệ in 3D y tế sản xuất dụng cụ phẫu thuật và mô hình giải phẫu',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Sản xuất & Công nghiệp'],
    content: `<h2>MedPrint3D - In 3D Y Tế Cá Nhân Hóa Dụng Cụ Và Implant Theo Từng Bệnh Nhân</h2>
<p>Dịch vụ in 3D y tế chuyên nghiệp sản xuất dụng cụ phẫu thuật cá nhân hóa, mô hình giải phẫu học trước mổ, và nẹp chỉnh hình tùy chỉnh theo dữ liệu CT/MRI của từng bệnh nhân.</p>
<h3>Nhu cầu cá nhân hóa y tế</h3>
<p>Dụng cụ phẫu thuật và implant tiêu chuẩn không phù hợp với giải phẫu từng người, đặc biệt cho phẫu thuật phức tạp (khớp, cột sống, hàm mặt). Bác sĩ phẫu thuật cần lên kế hoạch và thực hành trên mô hình 3D trước ca mổ phức tạp để tăng an toàn và rút ngắn thời gian phẫu thuật. Nhập khẩu dụng cụ cá nhân hóa từ nước ngoài tốn kém và chậm.</p>
<h3>Quy trình sản xuất</h3>
<p>Upload dữ liệu DICOM từ CT/MRI → phần mềm 3D Slicer chuyển đổi sang model 3D → bác sĩ review và phê duyệt → in 3D bằng vật liệu y tế tương thích sinh học → xử lý bề mặt và kiểm định → giao trong 48-72 giờ. Vật liệu: Ti6Al4V ELI cho implant kim loại; PEEK cho cột sống; resin biocompatible cho mô hình giải phẫu.</p>
<h3>Sản phẩm y tế</h3>
<p>Mô hình tim, não, thận 1:1 cho lập kế hoạch phẫu thuật và đào tạo sinh viên. Jig cắt xương tùy chỉnh cho phẫu thuật thay khớp gối chính xác cao. Nẹp chỉnh hình tay, chân, cột sống tùy chỉnh theo đường cong cơ thể. Implant sọ não titanium cá nhân hóa cho khuyết sọ. Máng răng trong suốt chỉnh nha.</p>
<h3>Kết quả phẫu thuật</h3>
<p>Giảm 30% thời gian phẫu thuật nhờ lập kế hoạch trước mổ trên mô hình 3D. Độ chính xác implant cao hơn 95% so với kỹ thuật truyền thống. Đang cung cấp cho 40 bệnh viện, thực hiện 2,000+ ca/năm.</p>`,
  },
  {
    title: 'Hệ thống khám mắt kỹ thuật số và điều trị tật khúc xạ bằng laser',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>OpticsAI - Khám Và Điều Trị Mắt Chính Xác Với Công Nghệ AI Hiện Đại</h2>
<p>Hệ thống khám mắt kỹ thuật số toàn diện kết hợp AI phân tích ảnh đáy mắt, đo thị lực tự động và hỗ trợ điều trị tật khúc xạ bằng laser LASIK/SMILE chính xác nhất.</p>
<h3>Gánh nặng bệnh mắt tại Việt Nam</h3>
<p>Hơn 45% người Việt Nam mắc tật khúc xạ (cận, viễn, loạn thị). Bệnh đái tháo đường võng mạc là nguyên nhân gây mù lòa hàng đầu nhưng 90% có thể phòng ngừa nếu phát hiện sớm. Thoái hóa điểm vàng tuổi già đang tăng nhanh. Thiếu chuyên gia nhãn khoa đặc biệt ở tuyến huyện và nông thôn.</p>
<h3>Hệ thống khám mắt AI</h3>
<p>Fundus camera tự động chụp ảnh đáy mắt, AI phân tích phát hiện: võng mạc đái tháo đường, tăng nhãn áp, thoái hóa điểm vàng với độ chính xác 97%. OCT (Optical Coherence Tomography) chụp cắt lớp võng mạc nanometer. Topographer bản đồ giác mạc 3D cho phẫu thuật LASIK. Auto-refractor đo tật khúc xạ tự động không cần hợp tác người bệnh.</p>
<h3>Hỗ trợ điều trị LASIK/SMILE</h3>
<p>Phân tích giác mạc toàn diện xác định đủ điều kiện phẫu thuật. WaveScan đo aberration quang học cá nhân hóa thông số laser. Lập kế hoạch điều trị tối ưu cho từng mắt. Theo dõi tái khám và dự báo kết quả sau phẫu thuật bằng AI. Hệ thống tài liệu phẫu thuật điện tử đầy đủ.</p>
<h3>Mở rộng tiếp cận</h3>
<p>Xe khám mắt lưu động trang bị đầy đủ thiết bị phục vụ vùng sâu vùng xa. Teleophthalmology: bác sĩ tuyến trung ương đọc kết quả từ ảnh đáy mắt tuyến huyện. Tầm soát mắt học đường cho 500,000 học sinh/năm. 30 phòng khám mắt chuỗi tại 15 tỉnh thành.</p>`,
  },
  {
    title: 'Giải pháp quản lý và vận hành chuỗi nhà thuốc GPP hiện đại',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Dược phẩm & Công nghệ sinh học'],
    content: `<h2>PharmChain - Hệ Thống Quản Lý Tích Hợp Cho Chuỗi Nhà Thuốc GPP</h2>
<p>Giải pháp quản lý chuỗi nhà thuốc toàn diện, từ đặt hàng, tồn kho, bán hàng đến chăm sóc khách hàng, tích hợp tư vấn dược sĩ và dịch vụ giao thuốc tại nhà trong vòng 1 giờ.</p>
<h3>Thị trường bán lẻ dược phẩm</h3>
<p>Việt Nam có 60,000+ nhà thuốc nhưng chỉ 30% đạt chuẩn GPP. Chuỗi nhà thuốc lớn (Long Châu, Pharmacity, An Khang) đang chiếm thị phần nhanh nhờ quy trình chuẩn hóa và công nghệ. Nhà thuốc nhỏ lẻ khó cạnh tranh do quản lý thủ công, thiếu dữ liệu và dịch vụ kém cạnh tranh.</p>
<h3>Quản lý tồn kho và mua hàng</h3>
<p>Auto-replenishment: tự động đề xuất đặt hàng dựa trên tốc độ bán và mức tồn tối thiểu. Kết nối trực tiếp với 50+ nhà phân phối dược phẩm đặt hàng B2B online. Quản lý hàng gần hết hạn với chiến lược bán hàng phù hợp. Kiểm soát nhiệt độ và độ ẩm kho thuốc tự động.</p>
<h3>Bán hàng và chăm sóc khách hàng</h3>
<p>POS tích hợp bảo hiểm y tế, thanh toán MoMo/VNPay. Hồ sơ bệnh nhân mãn tính: nhắc mua thuốc đúng lịch. Kiểm tra tương tác thuốc tự động khi bán. Dược sĩ tư vấn từ xa qua app cho khách hàng. Giao thuốc trong 1 giờ tích hợp Lalamove, Grab.</p>
<h3>Phân tích kinh doanh</h3>
<p>Dashboard doanh thu, lợi nhuận, tồn kho theo thời gian thực. Phân tích danh mục thuốc bán chạy, margin, nhà cung cấp tối ưu. So sánh hiệu suất giữa các nhà thuốc trong chuỗi. Đang phục vụ 800+ nhà thuốc GPP trên toàn quốc.</p>`,
  },
  {
    title: 'Hệ thống phân loại và xử lý rác thải y tế tự động và an toàn',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Môi trường & Xử lý chất thải'],
    content: `<h2>MedWaste Smart - Quản Lý Rác Thải Y Tế An Toàn Và Tuân Thủ Quy Định</h2>
<p>Hệ thống quản lý rác thải y tế toàn diện từ phân loại tại nguồn, thu gom, xử lý đến tiêu hủy, đảm bảo tuân thủ Thông tư 20/2021/TT-BYT và bảo vệ môi trường bệnh viện.</p>
<h3>Rủi ro rác thải y tế</h3>
<p>Bệnh viện 500 giường thải ra 1-2 tấn rác thải y tế/ngày. Rác thải y tế không được xử lý đúng cách là nguồn lây nhiễm HIV, viêm gan B, C và các bệnh truyền nhiễm nguy hiểm. Xử phạt vi phạm xử lý chất thải y tế lên đến 150 triệu đồng. Nhiều cơ sở y tế thiếu quy trình và thiết bị đáp ứng yêu cầu.</p>
<h3>Hệ thống phân loại thông minh</h3>
<p>Camera AI nhận diện loại rác thải y tế và phân loại thùng đúng (lây nhiễm, sắc nhọn, hóa học, phóng xạ). RFID tracking thùng chứa từ phát sinh đến xử lý. Cân điện tử tự động ghi nhận khối lượng từng loại rác. Cảnh báo khi thùng chứa đầy hoặc quá hạn thu gom.</p>
<h3>Xử lý và tiêu hủy</h3>
<p>Lò đốt chất thải y tế 2 buồng đạt tiêu chuẩn khí thải QCVN 02:2012/BTNMT. Hấp tiệt trùng autoclave cho chất thải không cần đốt. Hệ thống xử lý nước thải y tế đạt QCVN 28:2010/BTNMT. Hồ sơ điện tử cho từng mẻ xử lý: thời gian, nhiệt độ, khối lượng.</p>
<h3>Báo cáo và kiểm toán</h3>
<p>Tự động tạo báo cáo chất thải y tế định kỳ cho Sở Y tế và Sở TN&MT. Manifest điện tử thay thế chứng từ giấy. Đang phục vụ 60 bệnh viện và phòng khám, xử lý 500 tấn rác thải y tế/tháng.</p>`,
  },
  {
    title: 'Nền tảng đào tạo và mô phỏng kỹ năng lâm sàng cho sinh viên y khoa',
    sectorNames: ['Y tế & Chăm sóc sức khỏe', 'Giáo dục'],
    content: `<h2>MedSimulate - Thực Hành Lâm Sàng An Toàn Với Mô Phỏng VR/AR Và AI</h2>
<p>Nền tảng đào tạo y khoa hiện đại kết hợp mô phỏng lâm sàng VR/AR, mannequin robot và AI bệnh nhân ảo, giúp sinh viên y khoa thực hành kỹ năng không giới hạn mà không rủi ro cho bệnh nhân thật.</p>
<h3>Thách thức đào tạo y khoa</h3>
<p>Tỷ lệ sinh viên/bệnh nhân tại bệnh viện thực hành ngày càng cao, ít cơ hội thực hành thủ thuật. Đạo đức y tế hạn chế việc thực hành trực tiếp trên bệnh nhân trước khi thành thạo. Tiêu chuẩn đánh giá kỹ năng lâm sàng chưa chuẩn hóa. Chi phí xây dựng phòng sim lab truyền thống rất cao (5-20 tỷ đồng).</p>
<h3>Module mô phỏng</h3>
<p>VR procedures: đặt NKQ, chọc dịch màng bụng, đặt catheter, khâu vết thương với haptic feedback. AI patient: bệnh nhân ảo phản ứng thực tế theo can thiệp sinh viên. OSCE digital: thi OSCE có chấm điểm tự động theo checklist chuẩn. Simulation scenarios: 500+ tình huống lâm sàng từ thông thường đến cấp cứu. Debriefing AI: phân tích video và nhận xét chi tiết từng hành động.</p>
<h3>Học tập và đánh giá</h3>
<p>Adaptive learning: điều chỉnh độ khó theo năng lực từng sinh viên. Competency tracking: theo dõi tiến bộ theo milestone. Portfolio điện tử tổng hợp kỹ năng đã đạt. Peer learning: tình huống nhóm phối hợp xử lý đa chuyên khoa. Faculty dashboard: giám sát học sinh toàn khóa.</p>
<h3>Triển khai và mở rộng</h3>
<p>Đang triển khai tại 8 trường đại học y dược. 5,000 sinh viên sử dụng hàng tháng, thực hành 50,000 lần thủ thuật/tháng. Chi phí đầu tư thấp hơn 80% so với sim lab vật lý truyền thống.</p>`,
  },
  {
    title:
      'Giải pháp vật lý trị liệu tại nhà kết hợp thiết bị thông minh và hướng dẫn AI',
    sectorNames: ['Y tế & Chăm sóc sức khỏe'],
    content: `<h2>PhysioHome - Vật Lý Trị Liệu Chuyên Nghiệp Tại Nhà Với Hướng Dẫn AI</h2>
<p>Giải pháp vật lý trị liệu tại nhà kết hợp thiết bị cảm biến chuyển động, app AI hướng dẫn bài tập và kết nối trực tiếp với chuyên viên vật lý trị liệu, phục vụ bệnh nhân sau phẫu thuật và phục hồi chức năng mãn tính.</p>
<h3>Nhu cầu phục hồi tại nhà</h3>
<p>80% quá trình phục hồi chức năng diễn ra tại nhà nhưng không có hỗ trợ chuyên nghiệp. Bệnh nhân thường tập sai kỹ thuật hoặc bỏ cuộc sớm, kéo dài thời gian phục hồi. Đến bệnh viện 3 lần/tuần gây tốn kém và mất thời gian. Thiếu chuyên viên VLTL đặc biệt ở vùng nông thôn và ngoại thành.</p>
<h3>Thiết bị và công nghệ</h3>
<p>Bộ sensor IMU gắn cơ thể đo góc khớp, tốc độ chuyển động, cân bằng real-time. Camera phân tích dáng đi (gait analysis) 3D từ smartphone thông thường. AI phát hiện lỗi kỹ thuật tập và cảnh báo tức thì tránh chấn thương. Thiết bị điện trị liệu TENS/EMS kết nối app điều chỉnh thông số từ xa. Cân và máy đo cơ lực theo dõi tiến triển.</p>
<h3>Chương trình tập và giám sát</h3>
<p>Chuyên viên VLTL thiết kế chương trình cá nhân sau thăm khám video. Thư viện 2,000+ bài tập video có hướng dẫn tiếng Việt theo chuyên khoa. AI tự động điều chỉnh cường độ và số lần lặp theo hiệu suất thực tế. Video consultation hàng tuần với chuyên viên VLTL review tiến trình. Báo cáo tiến độ tự động gửi bác sĩ phẫu thuật.</p>
<h3>Kết quả phục hồi</h3>
<p>Tỷ lệ tuân thủ chương trình tập 78% (so với 35% truyền thống). Rút ngắn 30% thời gian phục hồi sau phẫu thuật khớp gối. Đang phục vụ 8,000 bệnh nhân trên toàn quốc với 150 chuyên viên VLTL đối tác.</p>`,
  },
];

export const ALL_SEEDS = [...SEEDS, ...SEEDS_EXTRA];

if (require.main === module) {
  runSectorSeed('Y tế & Chăm sóc sức khỏe', ALL_SEEDS).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
