/**
 * Script: seed-intakes-chunks
 *
 * 1. Insert N intakes với nội dung thực tế (tiếng Việt)
 * 2. Strip HTML → chunk (chunkSize=1500, overlap=150)
 * 3. Call BGE-M3 để embed
 * 4. Lưu vào intake_chunks
 * 5. In báo cáo kết quả từ DB
 *
 * Usage: npm run seed:intakes-chunks
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import {
  Intake,
  IntakeType,
  AiChunkingStatus,
} from '../../intakes/intake.entity';
import { IntakeChunk } from '../../intakes/intake-chunk.entity';

config();

const BGE_M3_URL = process.env.BGE_M3_URL ?? 'http://localhost:8003';
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 150;

// ---------------------------------------------------------------------------
// Dữ liệu intake mẫu (nội dung thực tế, đa dạng lĩnh vực)
// ---------------------------------------------------------------------------
const INTAKE_SEEDS = [
  {
    title: 'Thiết bị Data Logger quan trắc môi trường tự động',
    content: `<h2>Đột Phá Trong Quản Lý Dữ Liệu Môi Trường Với Thiết Bị Data Logger</h2>
<p>Thiết bị Data Logger kết nối hiệu quả giữa các thiết bị quan trắc môi trường và cơ quan quản lý, đảm bảo dữ liệu được thu thập, lưu trữ và truyền tải chính xác, đúng quy định.</p>
<h3>Tổng quan giải pháp</h3>
<p>Thiết bị Data Logger được thiết kế đặc biệt để hỗ trợ doanh nghiệp trong việc tuân thủ quy định pháp lý về môi trường, tối ưu hóa quá trình thu thập dữ liệu, và nâng cao hiệu quả giám sát môi trường.</p>
<h3>Đặc điểm nổi bật & Thông số kỹ thuật</h3>
<p><strong>Phần cứng:</strong> Mạch xử lý trung tâm với màn hình hiển thị 3.5 inch, cảm ứng. 04 đầu vào tương tự (4 AI) dải đo: 4~20 mA. 04 đầu vào số (DI). 02 đầu ra số (2 DO). 01 Truyền thông RS485. Đồng hồ thời gian thực. Nguồn điện sử dụng: 24VDC.</p>
<p><strong>Phần mềm:</strong> Hiển thị các thông số đo dưới dạng số, đồ thị, trạng thái. Hỗ trợ đăng nhập tài khoản và mật khẩu. Cấu hình đầu vào AI, đầu ra DO theo nhu cầu doanh nghiệp. Hiệu chỉnh giá trị đo và cài đặt ngưỡng cảnh báo. Truyền thông qua MQTT, FTP server. Thiết lập tần suất gửi tới FTP Server theo thời gian. File định dạng *.txt gửi tới FTP Server theo Thông tư số 10/2021/TT-BTNMT.</p>
<h3>Giá trị cốt lõi mang lại</h3>
<p>Thiết bị Data Logger không chỉ giúp doanh nghiệp tuân thủ pháp lý mà còn tối ưu hóa quy trình thu thập dữ liệu, đảm bảo dữ liệu được truyền tải liên tục và chính xác, từ đó hỗ trợ ra quyết định kịp thời và hiệu quả hơn trong công tác quản lý môi trường.</p>`,
  },
  {
    title: 'Hệ thống AI phân tích hình ảnh y tế chẩn đoán ung thư da',
    content: `<h2>Giải Pháp AI Chẩn Đoán Sớm Ung Thư Da Với Độ Chính Xác Cao</h2>
<p>Hệ thống ứng dụng trí tuệ nhân tạo để phân tích hình ảnh da liễu, hỗ trợ bác sĩ phát hiện sớm các tổn thương da có nguy cơ ung thư với độ chính xác lên đến 94.7%.</p>
<h3>Bối cảnh và vấn đề</h3>
<p>Ung thư da là một trong những loại ung thư phổ biến nhất thế giới, với hơn 1.5 triệu ca mới được chẩn đoán mỗi năm. Tại Việt Nam, tỷ lệ phát hiện muộn vẫn còn cao do thiếu chuyên gia da liễu tại các vùng nông thôn và thiếu thiết bị chẩn đoán hiện đại.</p>
<h3>Giải pháp công nghệ</h3>
<p>Hệ thống sử dụng mô hình deep learning EfficientNet-B7 được huấn luyện trên tập dữ liệu ISIC 2020 gồm hơn 33,000 ảnh da liễu được gán nhãn bởi các chuyên gia. Model được fine-tune thêm với 5,000 ảnh của bệnh nhân Việt Nam để phù hợp với đặc điểm da người Châu Á.</p>
<h3>Tính năng chính</h3>
<p>Phân tích ảnh chụp tổn thương da từ điện thoại thông minh hoặc máy ảnh chuyên dụng. Phân loại 9 loại tổn thương da phổ biến. Cung cấp điểm nguy cơ (risk score) từ 0-100. Tích hợp giải thích AI (XAI) bằng Grad-CAM để hiển thị vùng ảnh hưởng đến quyết định. Lưu lịch sử theo dõi bệnh nhân theo thời gian.</p>
<h3>Kết quả thử nghiệm lâm sàng</h3>
<p>Thử nghiệm tại 3 bệnh viện tuyến trung ương trong 6 tháng với 2,847 trường hợp. Sensitivity: 96.2%, Specificity: 91.8%, AUC: 0.979. Giảm 40% thời gian chẩn đoán ban đầu so với phương pháp truyền thống.</p>`,
  },
  {
    title: 'Nền tảng FinTech cho vay ngang hàng P2P dành cho SME',
    content: `<h2>Giải Pháp Tài Chính Số Kết Nối SME Với Nhà Đầu Tư Cá Nhân</h2>
<p>Nền tảng P2P Lending chuyên biệt cho doanh nghiệp vừa và nhỏ (SME), sử dụng AI để đánh giá tín dụng và kết nối với mạng lưới hơn 50,000 nhà đầu tư cá nhân.</p>
<h3>Thách thức của SME Việt Nam</h3>
<p>Có hơn 800,000 SME đang hoạt động tại Việt Nam nhưng chỉ 30% trong số đó có thể tiếp cận vốn vay ngân hàng truyền thống. Nguyên nhân chính do thiếu tài sản thế chấp, lịch sử tín dụng ngắn, và quy trình thẩm định phức tạp kéo dài 4-8 tuần.</p>
<h3>Mô hình hoạt động</h3>
<p>SME đăng ký vay trực tuyến với hồ sơ tối giản. Hệ thống AI phân tích 200+ điểm dữ liệu bao gồm dòng tiền, lịch sử thuế, dữ liệu thương mại điện tử, và mạng xã hội doanh nghiệp để chấm điểm tín dụng trong vòng 24 giờ. Các khoản vay được phân mảnh và phân phối đến nhiều nhà đầu tư để giảm thiểu rủi ro.</p>
<h3>Sản phẩm vay</h3>
<p>Vay ngắn hạn 3-12 tháng, hạn mức 50 triệu - 5 tỷ đồng. Lãi suất cạnh tranh 10-18%/năm tùy mức độ tín nhiệm. Giải ngân trong 48 giờ sau phê duyệt. Hỗ trợ trả nợ linh hoạt theo dòng tiền kinh doanh.</p>
<h3>Hiệu quả hoạt động</h3>
<p>Đã giải ngân hơn 2,000 tỷ đồng cho 4,500 SME trong 3 năm hoạt động. Tỷ lệ nợ xấu (NPL) duy trì ở mức 2.1%, thấp hơn trung bình ngành ngân hàng. Lợi nhuận trung bình cho nhà đầu tư đạt 12.5%/năm.</p>`,
  },
  {
    title: 'Robot thu hoạch nông sản thông minh ứng dụng computer vision',
    content: `<h2>Robot Nông Nghiệp Thế Hệ Mới - Giải Pháp Cho Cuộc Khủng Hoảng Lao Động Nông Thôn</h2>
    <p>Robot thu hoạch tự động sử dụng camera 3D và AI để nhận diện, định vị và thu hoạch trái cây, rau củ với tốc độ tương đương 3 công nhân lành nghề, hoạt động liên tục 20 giờ/ngày.</p>
<h3>Vấn đề ngành nông nghiệp</h3>
<p>Lực lượng lao động nông nghiệp tại Việt Nam đang giảm nhanh do xu hướng đô thị hóa. Chi phí lao động thu hoạch chiếm 45-60% tổng chi phí sản xuất. Mùa thu hoạch ngắn nhưng nhu cầu lao động tập trung cao gây ra tình trạng thiếu hụt lao động theo mùa vụ.</p>
<h3>Thông số kỹ thuật robot</h3>
<p>Hệ thống di chuyển: 4 bánh toàn hướng, tốc độ 0.5m/s trên địa hình đồi dốc đến 15 độ. Camera: Intel RealSense D435i stereo depth camera + RGB camera 12MP. Cánh tay robot: 6 bậc tự do (DOF), tầm với 1.2m, tải trọng 2kg. Bộ kẹp: Gripper mềm dạng khí nén, điều chỉnh lực theo độ chín của quả. Pin: LiFePO4 48V-100Ah, thời gian hoạt động 20 giờ, sạc nhanh 2 giờ.</p>
<h3>Thuật toán AI</h3>
<p>Phát hiện và phân loại trái cây: YOLOv8 custom trained trên 150,000 ảnh thanh long, dâu tây, cà chua, ớt. Đánh giá độ chín: CNN phân tích màu sắc và kết cấu bề mặt. Lập kế hoạch đường đi cánh tay: RRT* path planning tránh va chạm với cành lá. Điều hướng tự động: SLAM (Simultaneous Localization and Mapping) với LiDAR 2D.</p>
<h3>Kết quả thí điểm</h3>
<p>Thí điểm tại 5 trang trại thanh long ở Bình Thuận và Long An trong vụ 2024. Năng suất thu hoạch: 800-1200 quả/giờ (tương đương 3 công nhân). Tỷ lệ tổn thương quả: 0.8% (thấp hơn thu hoạch thủ công 2.3%). ROI dự kiến hoàn vốn trong 2.5 năm với trang trại 5 hecta.</p>`,
  },
  {
    title: 'Hệ thống quản lý năng lượng thông minh cho tòa nhà thương mại',
    content: `<h2>Smart Energy Management System - Giảm 35% Chi Phí Điện Năng Cho Tòa Nhà</h2>
<p>Giải pháp BEMS (Building Energy Management System) tích hợp IoT và AI, tự động tối ưu hóa tiêu thụ điện năng cho hệ thống điều hòa, chiếu sáng và thang máy trong tòa nhà thương mại.</p>
<h3>Tại sao cần BEMS?</h3>
<p>Chi phí điện năng chiếm 25-40% tổng chi phí vận hành của tòa nhà thương mại. Tại Việt Nam, với giá điện tăng liên tục và cam kết Net Zero 2050, các chủ đầu tư và ban quản lý tòa nhà đang chịu áp lực lớn về tối ưu năng lượng. Phần lớn hệ thống HVAC hiện tại vận hành theo lịch cố định, không thích ứng với điều kiện thực tế.</p>
<h3>Kiến trúc hệ thống</h3>
<p>Lớp thiết bị: 500-2000 cảm biến IoT đo nhiệt độ, độ ẩm, CO2, ánh sáng và cảm biến hiện diện người. Gateway edge computing xử lý dữ liệu tại chỗ với độ trễ dưới 100ms. Lớp nền tảng: Cloud platform trên AWS xử lý dữ liệu lịch sử và huấn luyện model AI. Dashboard real-time cho ban quản lý. Lớp điều khiển: Tích hợp với BACnet/Modbus để điều khiển trực tiếp HVAC, đèn LED và thang máy.</p>
<h3>Thuật toán tối ưu hóa</h3>
<p>Dự báo nhu cầu làm mát: LSTM model dự đoán tải nhiệt 4 giờ tới dựa trên lịch sử, thời tiết và lịch đặt phòng. Tối ưu lịch vận hành: Model-Predictive Control (MPC) lập kế hoạch vận hành tối ưu cho từng tầng. Phát hiện bất thường: Isolation Forest phát hiện thiết bị tiêu thụ điện bất thường.</p>
<h3>Kết quả triển khai</h3>
<p>Đã triển khai tại 12 tòa nhà văn phòng hạng A tại Hà Nội và TP.HCM (tổng diện tích 450,000m²). Tiết kiệm điện trung bình 32-38% so với baseline. Giảm phát thải CO2 tương đương 1,200 tấn/năm. Payback period: 2.8 năm.</p>`,
  },
  {
    title: 'Nền tảng EdTech học tiếng Anh cá nhân hóa với AI tutor',
    content: `<h2>Cách Mạng Học Tiếng Anh - AI Tutor Cá Nhân Hóa 24/7</h2>
<p>Nền tảng học tiếng Anh ứng dụng AI conversation partner, phân tích phát âm real-time và lộ trình học cá nhân hóa theo mục tiêu và phong cách học của từng người dùng.</p>
<h3>Vấn đề học tiếng Anh truyền thống</h3>
<p>Hơn 60 triệu người Việt Nam đang học tiếng Anh nhưng tỷ lệ đạt trình độ giao tiếp thực tế chỉ khoảng 15%. Nguyên nhân chính: thiếu cơ hội luyện nói thực tế, học theo lộ trình cố định không phù hợp cá nhân, và chi phí học với gia sư người bản ngữ quá cao (500,000 - 2,000,000 đồng/giờ).</p>
<h3>Công nghệ cốt lõi</h3>
<p>AI Conversation Engine: GPT-4 được fine-tune với 50,000 cuộc hội thoại tiếng Anh-Việt, đóng vai nhiều nhân vật (đồng nghiệp, khách hàng, phỏng vấn viên). Speech Analysis: Whisper ASR + mô hình phân tích phoneme phát hiện lỗi phát âm cụ thể theo chuẩn IPA. Adaptive Learning: Thuật toán spaced repetition kết hợp Item Response Theory điều chỉnh độ khó theo năng lực thực tế. Progress Analytics: Dashboard theo dõi 40+ chỉ số học tập với dự báo thời gian đạt mục tiêu.</p>
<h3>Tính năng nổi bật</h3>
<p>Luyện hội thoại với AI trong 50+ tình huống thực tế (công việc, du lịch, học thuật). Phân tích phát âm từng âm tiết với hướng dẫn sửa lỗi cụ thể. Học từ vựng theo ngữ cảnh từ video YouTube, podcast, bài báo yêu thích. Thi thử IELTS, TOEIC với đề thi được cập nhật hàng tuần.</p>
<h3>Tác động và số liệu</h3>
<p>Hơn 500,000 người dùng active sau 18 tháng ra mắt. 78% người dùng đạt mục tiêu IELTS/TOEIC trong thời gian dự kiến. NPS score: 72 (thuộc top 10% ứng dụng giáo dục toàn cầu). Chi phí: 199,000 đồng/tháng, tiết kiệm 90% so với học gia sư.</p>`,
  },
  {
    title: 'Giải pháp blockchain truy xuất nguồn gốc thực phẩm hữu cơ',
    content: `<h2>Minh Bạch Chuỗi Cung Ứng Thực Phẩm Hữu Cơ Bằng Công Nghệ Blockchain</h2>
<p>Hệ thống truy xuất nguồn gốc toàn diện từ trang trại đến bàn ăn, sử dụng blockchain Hyperledger Fabric kết hợp IoT sensor và QR code để đảm bảo tính xác thực của thực phẩm hữu cơ.</p>
<h3>Bối cảnh thị trường</h3>
<p>Thị trường thực phẩm hữu cơ Việt Nam tăng trưởng 15%/năm, đạt 150 triệu USD năm 2024. Tuy nhiên, 40% sản phẩm được gắn nhãn "hữu cơ" không đáp ứng tiêu chuẩn. Người tiêu dùng sẵn sàng trả phí cao hơn 30-50% nhưng thiếu niềm tin vào chứng nhận hữu cơ hiện tại.</p>
<h3>Kiến trúc blockchain</h3>
<p>Mạng lưới Hyperledger Fabric với các node đặt tại: nông trại (tự động), đơn vị chứng nhận, nhà vận chuyển, siêu thị, và cơ quan quản lý nhà nước. Smart contract tự động xác minh điều kiện bảo quản (nhiệt độ, độ ẩm) từ IoT sensor trên xe lạnh. Mỗi lô hàng được gắn mã QR duy nhất liên kết với NFT certificate trên blockchain.</p>
<h3>Dữ liệu được ghi nhận</h3>
<p>Tại nông trại: giống cây, ngày trồng, phân bón/thuốc bảo vệ thực vật sử dụng, kết quả xét nghiệm đất và nước, ảnh drone chụp định kỳ. Vận chuyển: nhiệt độ container real-time, GPS tracking, thời gian vận chuyển. Kiểm nghiệm: kết quả test dư lượng thuốc BVTV từ lab độc lập.</p>
<h3>Kết quả và tác động</h3>
<p>Triển khai tại 200 nông trại hữu cơ, 15 đơn vị vận chuyển lạnh, 50 siêu thị cao cấp. Scan QR đạt 2.5 triệu lượt/tháng. Phát hiện và ngăn chặn 23 trường hợp làm giả chứng nhận trong năm 2024. Giá bán sản phẩm có blockchain tăng trung bình 18% so với sản phẩm cùng loại.</p>`,
  },
  {
    title: 'Hệ thống tự động hóa kho hàng với AMR và WMS thông minh',
    content: `<h2>Kho Thông Minh Thế Hệ 4.0 - Tự Động Hóa Toàn Diện Từ Nhập Đến Xuất</h2>
<p>Giải pháp tự động hóa kho hàng tích hợp robot di động tự hành (AMR), hệ thống băng chuyền thông minh và WMS (Warehouse Management System) điều phối bằng AI, tăng năng suất 300% và giảm 70% chi phí nhân công.</p>
<h3>Thách thức logistics hiện tại</h3>
<p>Chi phí logistics Việt Nam chiếm 20.8% GDP, cao hơn 2-3 lần so với các nước phát triển. Nguyên nhân chính từ quy trình kho bãi thủ công, tỷ lệ sai sót picking cao (2-5%), và khó mở rộng quy mô đáp ứng peak season (Tết, 11.11, 12.12).</p>
<h3>Thành phần hệ thống</h3>
<p>Fleet AMR: 50-200 robot tự hành (payload 300kg, tốc độ 2m/s) điều hướng bằng QR code grid hoặc SLAM laser. AS/RS (Automated Storage and Retrieval System): Kệ đứng 12m tích hợp stacker crane tự động. Conveyor System: Băng chuyền phân loại tốc độ cao với xử lý 3,000 kiện/giờ. Put-to-light và Pick-to-light hỗ trợ nhân công tại station đặc biệt.</p>
<h3>WMS AI-Powered</h3>
<p>Demand forecasting: ARIMA + Prophet dự báo nhu cầu 30 ngày để tối ưu vị trí lưu kho (slotting). Dynamic routing: Thuật toán VRP (Vehicle Routing Problem) phân công đường đi tối ưu cho fleet AMR real-time. Predictive maintenance: Phân tích rung động và nhiệt độ motor dự báo hỏng hóc 72 giờ trước.</p>
<h3>Hiệu quả triển khai</h3>
<p>Triển khai cho 3 trung tâm phân phối lớn tại Hà Nội, TP.HCM, Đà Nẵng (tổng 150,000m²). Throughput tăng từ 8,000 lên 32,000 đơn hàng/ngày. Accuracy rate: 99.97%. Payback period: 3.2 năm. Giảm 65% diện tích kho cần thiết nhờ tận dụng chiều cao.</p>`,
  },
  {
    title: 'Công nghệ màng lọc nano xử lý nước thải công nghiệp tái sử dụng',
    content: `<h2>Màng Lọc Nano Thế Hệ Mới - Giải Pháp Xử Lý Nước Thải Công Nghiệp Tuần Hoàn</h2>
<p>Công nghệ màng lọc nano composite PES/TiO2 kết hợp xúc tác quang học cho phép xử lý nước thải công nghiệp đạt chuẩn tái sử dụng cho sản xuất, giảm 80% chi phí xử lý so với công nghệ truyền thống.</p>
<h3>Vấn đề nước thải công nghiệp Việt Nam</h3>
<p>Hơn 700 khu công nghiệp với 90,000 doanh nghiệp thải ra 1.8 triệu m³ nước thải/ngày. Chỉ 60% được xử lý đạt tiêu chuẩn. Chi phí xử lý nước thải truyền thống: 8,000-15,000 đồng/m³. Nhiều KCN ở vùng khan hiếm nước phải bơm nước từ xa với chi phí cao.</p>
<h3>Đặc tính màng lọc mới</h3>
<p>Vật liệu: Màng PES (Polyethersulfone) pha TiO2 nano 5% wt với kích thước lỗ 0.001-0.01 μm. Flux nước: 85 L/m²·h ở áp suất 5 bar (tăng 40% so với màng PES thường). Khả năng chống fouling: Lớp TiO2 phân hủy chất hữu cơ bám màng dưới UV, giảm 70% tần suất rửa ngược. Tuổi thọ màng: 5-7 năm (tăng gấp đôi so với màng thương mại hiện tại).</p>
<h3>Quy trình xử lý tích hợp</h3>
<p>Bước 1: Tiền xử lý - lọc thô + điều chỉnh pH. Bước 2: Màng UF loại bỏ SS và vi sinh. Bước 3: Màng NF nano composite loại bỏ kim loại nặng và hợp chất hữu cơ. Bước 4: Khử trùng UV-C. Bước 5: Kiểm tra chất lượng online bằng sensor đa thông số.</p>
<h3>Kết quả xử lý đạt được</h3>
<p>COD: từ 500-2000 mg/L xuống dưới 30 mg/L (đạt QCVN 40:2011/BTNMT cột A). Kim loại nặng: Pb, Hg, Cd, Cr loại bỏ >99.9%. Màu sắc: khử màu >98%. Chi phí xử lý: 3,500-5,000 đồng/m³. Nước sau xử lý đủ tiêu chuẩn tái sử dụng cho làm mát thiết bị, vệ sinh nhà xưởng và tưới cây xanh KCN.</p>`,
  },
  {
    title:
      'Giải pháp quản lý đội xe thông minh GPS và phân tích hành vi lái xe',
    content: `<h2>Fleet Intelligence Platform - Tối Ưu Hóa Đội Xe Doanh Nghiệp Với AI</h2>
<p>Nền tảng quản lý đội xe toàn diện tích hợp GPS tracking, phân tích hành vi lái xe bằng AI, và dự báo bảo dưỡng, giúp doanh nghiệp tiết kiệm 25-40% chi phí vận hành đội xe.</p>
<h3>Chi phí ẩn của đội xe doanh nghiệp</h3>
<p>Chi phí vận hành đội xe thường vượt ngân sách 30-50% do: lái xe phóng nhanh vượt ẩu làm tăng tiêu hao nhiên liệu 15-25%, bảo dưỡng phòng ngừa không đúng thời điểm gây hỏng hóc đột xuất, tuyến đường không tối ưu, và xe chạy không tải (deadhead) cao. Tai nạn giao thông gây thiệt hại trực tiếp và gián tiếp (kiện tụng, bảo hiểm).</p>
<h3>Thành phần hệ thống</h3>
<p>Thiết bị OBD-II: Đầu đọc tích hợp GPS, gia tốc kế 3 trục, gyroscope kết nối 4G. Camera AI: Camera cabin 4-kênh với AI nhận diện buồn ngủ, sao nhãng, không đội mũ bảo hiểm. Server Edge: Xử lý AI tại thiết bị, chỉ upload event quan trọng để tiết kiệm băng thông. Dashboard Web/App: Real-time map, báo cáo, cảnh báo.</p>
<h3>Tính năng AI phân tích</h3>
<p>Driver scoring: Chấm điểm 0-100 dựa trên 15 hành vi lái xe (tăng/giảm tốc đột ngột, vào cua nhanh, vượt đèn đỏ, sử dụng điện thoại). Predictive maintenance: Phân tích dữ liệu OBD2 (RPM, nhiệt độ động cơ, mức dầu) dự báo hỏng hóc 500-1000 km trước. Route optimization: Giải bài toán TSP (Travelling Salesman Problem) với ràng buộc thời gian giao hàng và trọng tải xe.</p>
<h3>Kết quả khách hàng</h3>
<p>Quản lý 15,000 xe cho 120 doanh nghiệp logistics và vận tải. Tiết kiệm nhiên liệu trung bình 18% nhờ cải thiện hành vi lái xe. Giảm 35% chi phí bảo dưỡng nhờ predictive maintenance. Giảm 42% tai nạn giao thông nghiêm trọng. ROI trung bình 320% sau 12 tháng sử dụng.</p>`,
  },
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function embedChunks(chunks: string[]): Promise<number[][]> {
  const response = await fetch(`${BGE_M3_URL}/embed/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: chunks }),
  });
  if (!response.ok) {
    throw new Error(
      `BGE-M3 error ${response.status}: ${await response.text()}`,
    );
  }
  const data = (await response.json()) as { embeddings: number[][] };
  return data.embeddings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
  console.log('=== seed-intakes-chunks ===\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'dmst_poc',
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    synchronize: false,
    logging: false,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  });

  await dataSource.initialize();
  const intakeRepo = dataSource.getRepository(Intake);
  const chunkRepo = dataSource.getRepository(IntakeChunk);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const report: Array<{
    title: string;
    intakeId: string;
    chunks: number;
    charsBefore: number;
    charsAfter: number;
    embeddingDim: number;
  }> = [];

  for (let i = 0; i < INTAKE_SEEDS.length; i++) {
    const seed = INTAKE_SEEDS[i];
    process.stdout.write(
      `[${i + 1}/${INTAKE_SEEDS.length}] ${seed.title.substring(0, 50)}... `,
    );

    // 1. Insert intake
    const intake = intakeRepo.create({
      title: seed.title,
      content: seed.content,
      type: IntakeType.IP,
      aiChunkingStatus: AiChunkingStatus.PROCESSING,
    });
    const saved = await intakeRepo.save(intake);

    // 2. Strip HTML + chunk
    const plain = stripHtml(seed.content);
    const chunks = await splitter.splitText(plain);

    // 3. Embed
    const embeddings = await embedChunks(chunks);

    // 4. Delete old + save new chunks
    await chunkRepo.delete({ intakeId: saved.id });
    const chunkEntities = chunks.map((text, index) =>
      chunkRepo.create({
        intakeId: saved.id,
        index,
        text,
        embedding: embeddings[index],
      }),
    );
    await chunkRepo.save(chunkEntities);

    // 5. Update status
    await intakeRepo.update(saved.id, {
      aiChunkingStatus: AiChunkingStatus.COMPLETED,
    });

    report.push({
      title: seed.title,
      intakeId: saved.id,
      chunks: chunks.length,
      charsBefore: seed.content.length,
      charsAfter: plain.length,
      embeddingDim: embeddings[0]?.length ?? 0,
    });

    console.log(`✓  ${chunks.length} chunks`);
  }

  // ---------------------------------------------------------------------------
  // Report từ DB
  // ---------------------------------------------------------------------------
  console.log('\n=== Kết quả trong DB ===\n');
  console.log(
    'Title'.padEnd(52) +
      'Chunks'.padEnd(8) +
      'Chars(html)'.padEnd(13) +
      'Chars(text)'.padEnd(13) +
      'EmbedDim',
  );
  console.log('-'.repeat(100));
  for (const r of report) {
    console.log(
      r.title.substring(0, 50).padEnd(52) +
        String(r.chunks).padEnd(8) +
        String(r.charsBefore).padEnd(13) +
        String(r.charsAfter).padEnd(13) +
        String(r.embeddingDim),
    );
  }

  // Tổng hợp
  const totalChunks = report.reduce((s, r) => s + r.chunks, 0);
  const dbCount = await chunkRepo
    .createQueryBuilder('c')
    .innerJoin('c.intake', 'i')
    .where('i.ai_chunking_status = :s', { s: AiChunkingStatus.COMPLETED })
    .getCount();

  console.log('-'.repeat(100));
  console.log(
    `Tổng intakes: ${report.length}  |  Tổng chunks: ${totalChunks}  |  Chunks trong DB: ${dbCount}`,
  );

  // Sample 2 chunks đầu của intake đầu tiên để xem nội dung
  console.log('\n=== Sample chunks của intake đầu tiên ===\n');
  const sampleChunks = await chunkRepo.find({
    where: { intakeId: report[0].intakeId },
    order: { index: 'ASC' },
    take: 3,
  });
  for (const c of sampleChunks) {
    console.log(
      `--- Chunk [${c.index}] (${c.text.length} chars, embed[0..4]=[${c.embedding
        .slice(0, 4)
        .map((v) => v.toFixed(4))
        .join(', ')}...]) ---`,
    );
    console.log(c.text.substring(0, 200) + (c.text.length > 200 ? '...' : ''));
    console.log();
  }

  await dataSource.destroy();
  console.log('=== Done! ===');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
