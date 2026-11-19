import { IntakeSeedData, runSectorSeed } from './shared';

export const SEEDS: IntakeSeedData[] = [
  {
    title: 'Nền tảng ERP cloud tích hợp toàn diện cho doanh nghiệp SME',
    sectorNames: ['Công nghệ thông tin', 'Sản xuất & Công nghiệp'],
    content: `<h2>Giải Pháp ERP Cloud Toàn Diện Cho Doanh Nghiệp Vừa Và Nhỏ</h2>
<p>Hệ thống hoạch định nguồn lực doanh nghiệp (ERP) trên nền tảng đám mây, được tối ưu hóa đặc biệt cho các SME Việt Nam với chi phí triển khai thấp và thời gian go-live chỉ 4-8 tuần.</p>
<h3>Vấn đề doanh nghiệp SME đang gặp phải</h3>
<p>Hơn 95% SME Việt Nam đang quản lý bằng Excel, phần mềm rời rạc không kết nối, dẫn đến dữ liệu không nhất quán, quyết định chậm trễ và lãng phí nguồn lực lên đến 30% chi phí vận hành. Các hệ thống ERP truyền thống có chi phí triển khai từ 2-5 tỷ đồng, vượt khả năng tài chính của SME.</p>
<h3>Giải pháp và tính năng chính</h3>
<p>Nền tảng ERP cloud cung cấp đầy đủ các module: Kế toán & Tài chính, Quản lý kho hàng, Mua hàng & Nhà cung cấp, Bán hàng & CRM, Sản xuất & MRP, Nhân sự & Payroll. Tất cả kết nối real-time trên một dashboard duy nhất. Hỗ trợ đa chi nhánh, đa tiền tệ, tích hợp ngân hàng điện tử và cổng thanh toán.</p>
<h3>Lợi thế cạnh tranh</h3>
<p>Mô hình SaaS với phí thuê bao từ 3-15 triệu đồng/tháng, không cần đầu tư hạ tầng. API mở tích hợp với Shopee, Lazada, TikTok Shop, các nền tảng TMĐT. Bảo mật đạt chuẩn ISO 27001, dữ liệu backup tự động 3 lần/ngày. Hỗ trợ triển khai và đào tạo trong 48 giờ.</p>
<h3>Kết quả thực tế</h3>
<p>Đã triển khai thành công cho 450+ doanh nghiệp thuộc 12 ngành nghề. Khách hàng ghi nhận tiết kiệm trung bình 25 giờ/tuần công việc thủ công, giảm 18% tồn kho, tăng 35% tốc độ ra hóa đơn. Tỷ lệ hài lòng khách hàng đạt 92% sau 6 tháng sử dụng.</p>`,
  },
  {
    title: 'Giải pháp bảo mật Zero Trust Network Access cho doanh nghiệp',
    sectorNames: ['Công nghệ thông tin', 'An ninh & Bảo mật'],
    content: `<h2>Kiến Trúc Zero Trust - Bảo Mật Toàn Diện Trong Kỷ Nguyên Làm Việc Từ Xa</h2>
<p>Giải pháp Zero Trust Network Access (ZTNA) bảo vệ toàn bộ hạ tầng số của doanh nghiệp với nguyên tắc "không tin tưởng mặc định, xác minh liên tục" - phù hợp với môi trường làm việc hybrid hiện đại.</p>
<h3>Thách thức bảo mật hiện tại</h3>
<p>Với xu hướng làm việc từ xa, các doanh nghiệp đang đối mặt với bề mặt tấn công mở rộng đáng kể. VPN truyền thống không còn đủ để bảo vệ khi 67% vi phạm dữ liệu bắt nguồn từ credential bị đánh cắp hoặc insider threat. Chi phí trung bình một sự cố bảo mật tại Việt Nam đã vượt 1.2 triệu USD.</p>
<h3>Kiến trúc giải pháp</h3>
<p>Hệ thống triển khai xác thực đa yếu tố (MFA) bắt buộc cho mọi truy cập, phân quyền tối thiểu (least privilege), micro-segmentation mạng nội bộ. AI phân tích hành vi người dùng (UEBA) phát hiện bất thường trong vòng 30 giây. Tích hợp với Azure AD, Okta, Google Workspace.</p>
<h3>Tính năng nổi bật</h3>
<p>Dashboard giám sát real-time toàn bộ truy cập mạng. Phân tích log bằng AI phát hiện mối đe dọa tiềm ẩn. Tự động cách ly thiết bị khi phát hiện hành vi đáng ngờ. Báo cáo tuân thủ theo chuẩn ISO 27001, PCI-DSS, GDPR. Hỗ trợ 24/7 SOC (Security Operations Center).</p>
<h3>Hiệu quả triển khai</h3>
<p>Giảm 80% bề mặt tấn công so với mô hình VPN truyền thống. Phát hiện và ngăn chặn 99.7% mối đe dọa đã biết. Thời gian phản hồi sự cố trung bình giảm từ 8 giờ xuống 15 phút. ROI đạt 340% trong năm đầu tiên theo nghiên cứu độc lập.</p>`,
  },
  {
    title: 'Hệ thống quản lý nhân sự HRM thông minh tích hợp AI',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>HRM Thông Minh - Chuyển Đổi Số Hoàn Toàn Quy Trình Quản Lý Nhân Sự</h2>
<p>Nền tảng quản lý nhân sự toàn diện ứng dụng AI để tự động hóa tuyển dụng, đánh giá hiệu suất, và phát triển nhân tài - giúp bộ phận HR tập trung vào chiến lược thay vì tác vụ hành chính.</p>
<h3>Bài toán quản lý nhân sự hiện nay</h3>
<p>HR tại các doanh nghiệp Việt Nam dành 60-70% thời gian cho các tác vụ hành chính như chấm công, tính lương, lưu hồ sơ. Quy trình tuyển dụng thủ công kéo dài 45-60 ngày, tỷ lệ sai sót bảng lương cao, thiếu dữ liệu để đưa ra quyết định nhân sự chiến lược.</p>
<h3>Các tính năng cốt lõi</h3>
<p>Module tuyển dụng: ATS tự động sàng lọc CV bằng AI, lên lịch phỏng vấn tự động, đánh giá ứng viên bằng video interview AI. Module chấm công: nhận diện khuôn mặt, GPS, tích hợp máy chấm công. Module lương: tính lương tự động theo ca làm việc, phụ cấp, bảo hiểm xã hội theo quy định Việt Nam. Module OKR & KPI: thiết lập mục tiêu, theo dõi hiệu suất real-time.</p>
<h3>Tích hợp và mở rộng</h3>
<p>API kết nối với phần mềm kế toán (MISA, Fast, Bravo), hệ thống ERP, cổng thanh toán lương. App mobile cho nhân viên tự phục vụ: xin nghỉ phép, xem phiếu lương, cập nhật thông tin cá nhân. Chatbot AI trả lời câu hỏi HR 24/7.</p>
<h3>Kết quả điển hình</h3>
<p>Giảm 75% thời gian xử lý bảng lương, từ 3 ngày xuống còn 4 giờ. Rút ngắn chu kỳ tuyển dụng từ 45 ngày xuống 18 ngày. Tăng 40% tỷ lệ giữ chân nhân tài nhờ chương trình phát triển cá nhân hóa. Đang phục vụ 180+ doanh nghiệp với tổng 45,000 nhân viên.</p>`,
  },
  {
    title: 'Platform tự động hóa quy trình RPA cho ngân hàng và bảo hiểm',
    sectorNames: ['Công nghệ thông tin', 'Tài chính & Ngân hàng'],
    content: `<h2>RPA - Robot Phần Mềm Tự Động Hóa Các Quy Trình Lặp Lại Tốn Kém</h2>
<p>Robotic Process Automation (RPA) triển khai robot phần mềm thực hiện các tác vụ lặp đi lặp lại với tốc độ và độ chính xác vượt trội so với con người, đặc biệt hiệu quả trong lĩnh vực tài chính - ngân hàng - bảo hiểm.</p>
<h3>Các quy trình phù hợp với RPA</h3>
<p>Xử lý hồ sơ vay vốn: thu thập dữ liệu từ nhiều hệ thống, kiểm tra CIC, nhập liệu vào core banking. Reconciliation: đối chiếu giao dịch giữa các hệ thống hàng đêm. Xử lý claim bảo hiểm: kiểm tra điều kiện, tính toán bồi thường, tạo văn bản. Báo cáo tuân thủ: tổng hợp dữ liệu từ nhiều nguồn, tạo báo cáo NHNN định kỳ.</p>
<h3>Công nghệ và kiến trúc</h3>
<p>Nền tảng hỗ trợ cả attended (có người giám sát) và unattended (tự động hoàn toàn) robot. Tích hợp AI/ML để xử lý tài liệu không cấu trúc (OCR, NLP). Orchestrator quản lý toàn bộ đội robot với dashboard real-time. Audit trail đầy đủ đáp ứng yêu cầu compliance.</p>
<h3>Model triển khai</h3>
<p>RPA-as-a-Service: thuê robot theo giờ/tháng, không cần đầu tư license. Hoặc triển khai on-premise với license vĩnh viễn. Đào tạo "Citizen Developer" để nhân viên nghiệp vụ tự xây dựng robot cơ bản. Center of Excellence (CoE) hỗ trợ mở rộng quy mô automation.</p>
<h3>ROI thực tế</h3>
<p>Trung bình robot RPA hoạt động tương đương 3-5 nhân viên full-time với chi phí bằng 1/3. Xử lý 24/7 không nghỉ, tỷ lệ lỗi dưới 0.01%. Một ngân hàng top 10 Việt Nam tiết kiệm 12 tỷ đồng/năm chi phí nhân sự sau khi triển khai 45 robot RPA.</p>`,
  },
  {
    title: 'Hạ tầng Hybrid Cloud và Multi-Cloud cho doanh nghiệp lớn',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>Chiến Lược Hybrid Cloud - Tối Ưu Chi Phí Và Linh Hoạt Hạ Tầng IT</h2>
<p>Giải pháp thiết kế và triển khai hạ tầng hybrid cloud kết hợp data center nội bộ với các nền tảng cloud công cộng (AWS, Azure, GCP) để tối ưu hiệu suất, chi phí và đảm bảo tính liên tục kinh doanh.</p>
<h3>Tại sao cần Hybrid Cloud</h3>
<p>Dữ liệu nhạy cảm cần lưu on-premise theo quy định pháp lý (ngân hàng, y tế, chính phủ), trong khi ứng dụng cần tính mở rộng linh hoạt và tốc độ triển khai nhanh của cloud công cộng. Chi phí vận hành data center tự xây thường cao hơn 40-60% so với thuê cloud theo nhu cầu thực tế.</p>
<h3>Dịch vụ triển khai</h3>
<p>Đánh giá hạ tầng hiện tại và lập roadmap chuyển đổi cloud. Thiết kế kiến trúc hybrid theo mô hình TOGAF. Triển khai SD-WAN kết nối an toàn on-premise với cloud. Container hóa ứng dụng với Kubernetes. FinOps tối ưu chi phí cloud liên tục. Đào tạo đội ngũ vận hành DevOps/SRE.</p>
<h3>Công nghệ sử dụng</h3>
<p>Terraform cho Infrastructure as Code, Ansible cho configuration management. Kubernetes (EKS/AKS/GKE) cho container orchestration. Istio service mesh cho microservices. Prometheus + Grafana cho monitoring. ArgoCD cho GitOps CI/CD pipeline.</p>
<h3>Kết quả khách hàng</h3>
<p>Giảm 45% chi phí hạ tầng IT sau 12 tháng. Tăng 99.95% uptime so với 99.5% trước đây. Thời gian triển khai tính năng mới từ 3 tuần xuống còn 2 ngày. Đã hỗ trợ 35+ tổ chức lớn bao gồm 8 ngân hàng, 4 công ty bảo hiểm và 6 tập đoàn sản xuất.</p>`,
  },
  {
    title: 'Nền tảng Business Intelligence và Data Analytics thời gian thực',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>BI Platform - Biến Dữ Liệu Thành Quyết Định Kinh Doanh Thông Minh</h2>
<p>Nền tảng phân tích dữ liệu và business intelligence toàn diện, cho phép doanh nghiệp thu thập, xử lý và trực quan hóa dữ liệu từ mọi nguồn để đưa ra quyết định dựa trên dữ liệu trong thời gian thực.</p>
<h3>Vấn đề dữ liệu phân tán</h3>
<p>Doanh nghiệp trung bình sử dụng 12-15 hệ thống phần mềm khác nhau nhưng dữ liệu không thông suốt. CEO phải chờ báo cáo hàng tuần/tháng thay vì thấy tình hình kinh doanh real-time. Nhân viên tốn 30% thời gian tổng hợp báo cáo thủ công từ nhiều nguồn.</p>
<h3>Kiến trúc Data Platform</h3>
<p>Data Lakehouse trên cloud tích hợp dữ liệu từ ERP, CRM, POS, eCommerce, mạng xã hội. ETL pipeline tự động cập nhật mỗi 15 phút. Data Catalog quản lý metadata và lineage. Semantic layer chuẩn hóa định nghĩa KPI toàn công ty. Self-service analytics cho người dùng business.</p>
<h3>Tính năng phân tích</h3>
<p>200+ template báo cáo theo ngành (bán lẻ, sản xuất, dịch vụ, ngân hàng). AI-powered insights tự động phát hiện xu hướng và bất thường. Dự báo doanh thu, tồn kho, nhu cầu khách hàng bằng machine learning. Natural language query: hỏi dữ liệu bằng tiếng Việt thông thường.</p>
<h3>Triển khai và hỗ trợ</h3>
<p>SaaS hoặc on-premise, tích hợp với Microsoft Power BI, Tableau, Looker. Đào tạo data literacy cho toàn bộ cấp quản lý. Dịch vụ Data Analyst-as-a-Service cho doanh nghiệp chưa có team chuyên biệt. 250+ khách hàng đang sử dụng, xử lý trung bình 2 tỷ records/ngày.</p>`,
  },
  {
    title: 'Chatbot AI đa kênh chăm sóc khách hàng 24/7',
    sectorNames: ['Công nghệ thông tin', 'Thương mại điện tử'],
    content: `<h2>Chatbot AI - Nâng Tầm Trải Nghiệm Khách Hàng Với Chi Phí Tối Ưu</h2>
<p>Nền tảng chatbot AI conversational thế hệ mới, tích hợp mô hình ngôn ngữ lớn (LLM) và hiểu biết về ngữ cảnh tiếng Việt, triển khai đồng thời trên Website, Facebook, Zalo, Telegram và App mobile.</p>
<h3>Bài toán chăm sóc khách hàng</h3>
<p>Chi phí một nhân viên CSKH trung bình 8-12 triệu đồng/tháng, nhưng chỉ phục vụ được 50-80 khách/ngày trong giờ hành chính. Tỷ lệ bỏ giỏ hàng vì không được tư vấn kịp thời chiếm 35% doanh thu bị mất. Khách hàng kỳ vọng phản hồi trong vòng 5 phút bất kể giờ giấc.</p>
<h3>Công nghệ chatbot</h3>
<p>Fine-tuned LLM trên dữ liệu sản phẩm/dịch vụ của doanh nghiệp. Intent classification chính xác 95%+ cho tiếng Việt có dấu và không dấu, tiếng lóng. Slot filling thu thập thông tin khách hàng tự nhiên. Handoff thông minh sang agent người khi gặp tình huống phức tạp. Sentiment analysis phát hiện khách hàng không hài lòng để ưu tiên xử lý.</p>
<h3>Tích hợp nghiệp vụ</h3>
<p>Tra cứu đơn hàng, tồn kho real-time từ ERP/OMS. Đặt lịch hẹn, booking dịch vụ. Xử lý khiếu nại cấp 1 tự động. Upsell/cross-sell dựa trên lịch sử mua hàng. Tích hợp CRM tạo và cập nhật ticket tự động.</p>
<h3>Hiệu quả kinh doanh</h3>
<p>Xử lý 80% câu hỏi thường gặp hoàn toàn tự động. Giảm 65% chi phí CSKH, tăng 40% tỷ lệ chuyển đổi khách hàng tiềm năng. Phục vụ không giới hạn khách hàng đồng thời 24/7. Khách hàng điển hình tại Việt Nam: Thế Giới Di Động, Điện Máy Xanh, các ngân hàng top 10.</p>`,
  },
  {
    title: 'Giải pháp quản lý tài liệu số DMS và quy trình phê duyệt điện tử',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>DMS - Số Hóa Toàn Bộ Quy Trình Tài Liệu Và Phê Duyệt Doanh Nghiệp</h2>
<p>Hệ thống quản lý tài liệu số (DMS) tích hợp chữ ký điện tử, workflow phê duyệt tự động và lưu trữ đám mây an toàn, giúp doanh nghiệp loại bỏ hoàn toàn giấy tờ thủ công.</p>
<h3>Thực trạng quản lý tài liệu</h3>
<p>Doanh nghiệp Việt Nam trung bình in ấn và lưu trữ 50,000-200,000 trang tài liệu giấy mỗi năm. Chi phí in ấn, lưu kho, tìm kiếm tài liệu chiếm 5-8% doanh thu. Tài liệu quan trọng có nguy cơ thất lạc, hư hỏng, không tuân thủ phiên bản mới nhất. Quy trình phê duyệt thủ công kéo dài 3-7 ngày do phụ thuộc vào lịch họp của lãnh đạo.</p>
<h3>Tính năng hệ thống</h3>
<p>Lưu trữ không giới hạn với phân cấp quyền truy cập theo vai trò. Full-text search tìm kiếm nội dung trong hàng triệu tài liệu dưới 3 giây. OCR nhận dạng văn bản từ hình ảnh scan. Workflow builder kéo thả thiết kế quy trình phê duyệt đa cấp. Chữ ký số theo chuẩn eIDAS, tuân thủ Nghị định 130/2018/NĐ-CP của Việt Nam.</p>
<h3>Tích hợp hệ sinh thái</h3>
<p>Tích hợp với Office 365, Google Workspace để soạn thảo trực tiếp trên DMS. Connector với SAP, Oracle, MISA ERP để tự động lưu tài liệu kế toán. API mở cho các hệ thống bên thứ ba. App mobile iOS/Android ký duyệt mọi lúc mọi nơi.</p>
<h3>Lợi ích và tuân thủ</h3>
<p>Giảm 90% chi phí in ấn và lưu kho. Thời gian phê duyệt từ 5 ngày xuống còn 4 giờ. Audit trail đầy đủ đáp ứng yêu cầu kiểm toán, thuế. Backup tự động, recovery trong 1 giờ, uptime 99.9%. Đang phục vụ 300+ doanh nghiệp và cơ quan nhà nước.</p>`,
  },
  {
    title: 'Nền tảng no-code phát triển ứng dụng doanh nghiệp nhanh chóng',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>No-Code Platform - Trao Quyền Cho Nghiệp Vụ Tự Xây Dựng Ứng Dụng</h2>
<p>Nền tảng phát triển ứng dụng không cần lập trình (no-code/low-code) cho phép nhân viên nghiệp vụ tự tạo ứng dụng web và mobile trong vài ngày thay vì chờ đợi IT nhiều tháng.</p>
<h3>Vấn đề phát triển phần mềm truyền thống</h3>
<p>Backlog IT tại các doanh nghiệp lớn thường kéo dài 6-18 tháng. Chi phí phát triển một ứng dụng doanh nghiệp điển hình: 500 triệu - 2 tỷ đồng và mất 6-12 tháng. Khi ứng dụng được phát triển xong, yêu cầu nghiệp vụ đã thay đổi. Thiếu hụt nhân lực IT lành nghề ngày càng trầm trọng.</p>
<h3>Khả năng của nền tảng</h3>
<p>Visual app builder kéo thả xây dựng giao diện đẹp chuẩn material design. Logic builder tạo quy trình nghiệp vụ phức tạp không cần code. Database builder thiết kế cơ sở dữ liệu quan hệ trực quan. Integration hub kết nối 200+ ứng dụng và API phổ biến. AI assistant gợi ý component phù hợp theo mô tả tiếng Việt.</p>
<h3>Bảo mật và quản trị</h3>
<p>Single sign-on với Azure AD/Okta. Role-based access control chi tiết đến từng field dữ liệu. Audit log mọi thao tác người dùng. Sandbox environment kiểm thử trước khi publish. IT governance kiểm soát app catalog toàn tổ chức.</p>
<h3>Câu chuyện thành công</h3>
<p>Một tập đoàn bán lẻ 500 cửa hàng xây dựng 23 ứng dụng nội bộ trong 3 tháng, tiết kiệm 8 tỷ đồng chi phí phát triển. Đội marketing tự tạo app tracking chiến dịch quảng cáo trong 2 ngày. 150+ doanh nghiệp đang vận hành 2,000+ ứng dụng trên nền tảng.</p>`,
  },
  {
    title: 'Hệ thống quản lý chuỗi cung ứng số tích hợp IoT và Blockchain',
    sectorNames: ['Công nghệ thông tin', 'Giao thông & Logistics'],
    content: `<h2>Supply Chain Digital Twin - Số Hóa Và Minh Bạch Hóa Chuỗi Cung Ứng</h2>
<p>Nền tảng quản lý chuỗi cung ứng thế hệ mới kết hợp IoT tracking, AI dự báo và Blockchain truy xuất nguồn gốc, cho phép doanh nghiệp kiểm soát toàn bộ hành trình sản phẩm từ nhà máy đến tay người tiêu dùng.</p>
<h3>Thách thức chuỗi cung ứng hiện đại</h3>
<p>Doanh nghiệp xuất khẩu Việt Nam đang đối mặt với yêu cầu truy xuất nguồn gốc ngày càng khắt khe từ EU (EUDR), Mỹ (UFLPA). Hàng giả hàng nhái gây thiệt hại 2.5 tỷ USD/năm. Thiếu khả năng nhìn thấy tồn kho real-time dẫn đến tình trạng vừa thừa vừa thiếu hàng đồng thời.</p>
<h3>Công nghệ lõi</h3>
<p>IoT sensors theo dõi vị trí, nhiệt độ, độ ẩm hàng hóa real-time. Digital Twin mô phỏng toàn bộ chuỗi cung ứng để tối ưu lộ trình. AI dự báo nhu cầu với độ chính xác 92%, tự động trigger đặt hàng. Blockchain Hyperledger Fabric lưu trữ dữ liệu truy xuất nguồn gốc bất biến. QR code động cho phép người tiêu dùng xem đầy đủ hành trình sản phẩm.</p>
<h3>Tính năng quản lý</h3>
<p>Control tower nhìn thấy toàn bộ chuỗi cung ứng trên một màn hình. Cảnh báo tự động khi có rủi ro gián đoạn cung ứng. Tối ưu hóa lộ trình vận chuyển giảm chi phí logistics. Quản lý nhà cung cấp đa cấp (tier 1, 2, 3) với chấm điểm ESG.</p>
<h3>Lợi ích kinh doanh</h3>
<p>Giảm 30% tồn kho dư thừa, tiết kiệm vốn lưu động. Tăng 25% tốc độ xử lý đơn hàng. Đáp ứng 100% yêu cầu kiểm toán chuỗi cung ứng từ khách hàng quốc tế. Đang triển khai tại 80+ doanh nghiệp xuất khẩu nông sản, thủy sản, dệt may.</p>`,
  },
];

export const SEEDS_EXTRA: IntakeSeedData[] = [
  {
    title: 'Giải pháp DevOps CI/CD tự động hóa triển khai phần mềm liên tục',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>DevOps as a Service - Tăng Tốc Phát Triển Phần Mềm Với CI/CD Hiện Đại</h2>
<p>Dịch vụ tư vấn và triển khai DevOps toàn diện, xây dựng pipeline CI/CD tự động hóa từ commit code đến production deployment, giúp đội ngũ phát triển release nhanh hơn và đáng tin cậy hơn.</p>
<h3>Vấn đề phát triển phần mềm truyền thống</h3>
<p>Release phần mềm thủ công tốn 2-3 ngày mỗi lần, dễ sai sót và không thể rollback nhanh khi có lỗi. Dev và Ops team hoạt động tách biệt gây bottleneck. Mean Time to Recovery (MTTR) khi có incident kéo dài 4-8 giờ. Khó test toàn diện trước khi đưa lên production dẫn đến bug xuất hiện sau release.</p>
<h3>Pipeline CI/CD thiết kế</h3>
<p>Git-based workflow với branching strategy (GitFlow/trunk-based). Automated testing: unit test, integration test, E2E test chạy song song. Static code analysis, security scanning (SAST/DAST), dependency vulnerability check. Container build và push lên registry tự động. Blue-green hoặc canary deployment zero-downtime. Automated rollback khi health check thất bại.</p>
<h3>Công nghệ stack</h3>
<p>GitLab CI/CD hoặc Jenkins hoặc GitHub Actions tùy môi trường. Docker và Kubernetes cho container orchestration. Helm chart quản lý deployment configuration. ArgoCD cho GitOps continuous delivery. Prometheus/Grafana/Loki cho observability. SonarQube cho code quality gate.</p>
<h3>Kết quả khách hàng</h3>
<p>Tăng tần suất deployment từ 1 lần/tháng lên 10+ lần/ngày. Giảm MTTR từ 4 giờ xuống 15 phút. Tỷ lệ deployment thất bại giảm từ 25% xuống 2%. Đã tư vấn và triển khai cho 60+ doanh nghiệp công nghệ và ngân hàng.</p>`,
  },
  {
    title: 'Nền tảng IoT quản lý tòa nhà thông minh BMS tích hợp năng lượng',
    sectorNames: ['Công nghệ thông tin', 'Năng lượng'],
    content: `<h2>SmartBuilding Platform - Tối Ưu Vận Hành Và Tiết Kiệm Năng Lượng Tòa Nhà</h2>
<p>Hệ thống quản lý tòa nhà thông minh (BMS) tích hợp IoT, AI và điện toán đám mây để tự động hóa điều khiển HVAC, chiếu sáng, thang máy và hệ thống an ninh, tiết kiệm 30-40% chi phí điện năng.</p>
<h3>Chi phí vận hành tòa nhà</h3>
<p>Chi phí điện năng chiếm 30-40% tổng chi phí vận hành tòa nhà văn phòng và trung tâm thương mại. HVAC tiêu thụ 50-60% điện năng nhưng thường chạy theo lịch cố định bất kể tình trạng thực tế. Thiếu dữ liệu real-time khiến bộ phận vận hành phản ứng chậm với sự cố.</p>
<h3>Hệ thống IoT và điều khiển</h3>
<p>10,000+ sensor nhiệt độ, độ ẩm, CO2, ánh sáng, chuyển động phủ toàn tòa nhà. AI điều chỉnh HVAC theo số người thực tế và dự báo thời tiết 24 giờ tới. Đèn LED dimming tự động theo ánh sáng tự nhiên và hiện diện người. Thang máy dispatch thông minh giảm thời gian chờ 35%. Tích hợp access control, camera AI phát hiện xâm nhập.</p>
<h3>Energy management</h3>
<p>Real-time energy dashboard theo tầng, khu vực, thiết bị. Phân tích bất thường tiêu thụ điện phát hiện thiết bị hỏng. Demand response: tự động giảm tải giờ cao điểm tiết kiệm phụ phí EVN. Carbon footprint tracking theo tiêu chuẩn GHG Protocol. Báo cáo ESG tự động cho các tòa nhà green building (LEED, LOTUS).</p>
<h3>ROI và triển khai</h3>
<p>ROI trung bình 18-24 tháng. Tiết kiệm 2-5 tỷ đồng điện/năm cho tòa nhà 30.000m². Đang quản lý 85 tòa nhà văn phòng, khách sạn và trung tâm thương mại tại Hà Nội và TP.HCM.</p>`,
  },
  {
    title: 'Hệ thống quản lý dự án và cộng tác nhóm cho doanh nghiệp phân tán',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>TeamSync - Nền Tảng Quản Lý Dự Án Và Cộng Tác Cho Đội Ngũ Phân Tán</h2>
<p>Giải pháp quản lý dự án và cộng tác nhóm toàn diện được thiết kế cho mô hình làm việc hybrid và remote, tích hợp lập kế hoạch Agile, theo dõi tiến độ và giao tiếp nhóm trong một nền tảng thống nhất.</p>
<h3>Thách thức làm việc phân tán</h3>
<p>Với 60% doanh nghiệp Việt Nam áp dụng mô hình hybrid sau COVID-19, quản lý dự án và giao tiếp nhóm trở nên phức tạp hơn. Sử dụng quá nhiều công cụ rời rạc (email, Zalo, Excel, Google Docs) khiến thông tin phân tán, khó theo dõi tiến độ. Dự án trễ deadline chiếm 70% trường hợp do thiếu visibility và accountability.</p>
<h3>Tính năng quản lý dự án</h3>
<p>Kanban, Scrum, Gantt linh hoạt theo phương pháp làm việc của từng team. OKR và milestone tracking kết nối mục tiêu cá nhân với mục tiêu công ty. Dependency mapping phát hiện bottleneck trước khi ảnh hưởng deadline. Time tracking tích hợp báo cáo giờ công và chi phí dự án. Resource management: phân bổ và cân bằng tải công việc toàn công ty.</p>
<h3>Cộng tác và giao tiếp</h3>
<p>Workspace tích hợp: document, wiki, whiteboard, video call trong một app. @mention và thread thảo luận gắn với task/dự án cụ thể. AI summarize cuộc họp và action item tự động. Notification thông minh không làm gián đoạn deep work. Tích hợp với Slack, Teams, Zoom, Google Calendar.</p>
<h3>Hiệu quả đo lường</h3>
<p>Tăng 35% tỷ lệ dự án hoàn thành đúng deadline. Giảm 50% cuộc họp status update không cần thiết. Visibility 100% tiến độ dự án cho lãnh đạo mà không cần báo cáo thủ công. Đang phục vụ 400+ công ty với 25,000 người dùng tích cực.</p>`,
  },
  {
    title: 'Giải pháp tích hợp dữ liệu và API management cho hệ sinh thái số',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>DataBridge - Nền Tảng Tích Hợp Và Quản Lý API Doanh Nghiệp</h2>
<p>Nền tảng tích hợp dữ liệu và quản lý API (API Gateway + Integration Platform) giúp doanh nghiệp kết nối liền mạch các hệ thống nội bộ và đối tác bên ngoài, xây dựng hệ sinh thái số thống nhất.</p>
<h3>Vấn đề tích hợp hệ thống</h3>
<p>Doanh nghiệp trung bình sử dụng 900+ ứng dụng cloud nhưng chỉ 28% được tích hợp với nhau. Mỗi kết nối point-to-point mới tốn 3-6 tháng phát triển. Spaghetti integration khó bảo trì, dễ đứt gãy khi một hệ thống thay đổi. API không được quản lý tập trung gây rủi ro bảo mật và khó theo dõi sử dụng.</p>
<h3>API Gateway và Management</h3>
<p>Cổng API tập trung xử lý authentication, rate limiting, caching, load balancing. API portal self-service cho developer nội bộ và đối tác tra cứu, test API. Versioning và backward compatibility management. Analytics: ai đang dùng API gì, frequency, latency, error rate. Monetization API cho mô hình kinh doanh API economy.</p>
<h3>Integration Platform</h3>
<p>Low-code connector builder kết nối 500+ ứng dụng phổ biến (SAP, Salesforce, Shopify, VNPay, MoMo). Message queue và event streaming (Kafka) cho real-time integration. Data transformation và mapping trực quan. Error handling, retry logic, dead letter queue tự động. Monitoring dashboard toàn bộ luồng dữ liệu.</p>
<h3>Kết quả triển khai</h3>
<p>Giảm 70% thời gian phát triển tích hợp mới. Một ngân hàng giảm từ 18 tháng xuống 3 tháng để tích hợp fintech partner mới. Uptime 99.99% cho API mission-critical. Đang xử lý 500 triệu API call/ngày cho 40+ khách hàng doanh nghiệp.</p>`,
  },
  {
    title:
      'Nền tảng học máy MLOps quản lý vòng đời mô hình AI cho doanh nghiệp',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>MLOps Platform - Đưa AI Từ Phòng Lab Vào Production Một Cách Tin Cậy</h2>
<p>Nền tảng MLOps toàn diện giúp doanh nghiệp quản lý vòng đời mô hình machine learning từ data preparation, model training, deployment đến monitoring và retraining tự động.</p>
<h3>Khoảng cách giữa AI research và production</h3>
<p>85% mô hình AI chưa bao giờ được đưa vào sản xuất thực tế. Data scientist và engineering team dùng ngôn ngữ và công cụ khác nhau. Model drift theo thời gian gây giảm chất lượng dự đoán mà không ai biết. Tái sản xuất kết quả nghiên cứu để audit và compliance rất khó khi thiếu version control đầy đủ.</p>
<h3>Tính năng MLOps</h3>
<p>Data versioning và lineage: biết chính xác dữ liệu nào dùng để train model nào. Experiment tracking: so sánh hàng trăm thí nghiệm, hyperparameter, metric. Model registry: lưu trữ, version, metadata và artifact của mọi model. Automated ML pipeline: trigger retraining khi data drift phát hiện. A/B testing và shadow mode deployment an toàn.</p>
<h3>Model monitoring và governance</h3>
<p>Real-time drift detection: data drift, concept drift, prediction drift. Fairness monitoring phát hiện bias theo nhóm dân số. Model explainability (SHAP, LIME) cho regulated industries. Audit trail đầy đủ cho AI governance và compliance. Alert tự động khi model performance xuống dưới threshold.</p>
<h3>Kết quả enterprise AI</h3>
<p>Tăng tốc time-to-production model từ 6 tháng xuống 3 tuần. 90% model duy trì performance ổn định sau 6 tháng nhờ auto-retraining. Đang quản lý 500+ mô hình AI cho 25 tổ chức tài chính, bán lẻ và sản xuất.</p>`,
  },
  {
    title: 'Dịch vụ an ninh mạng SOC và ứng cứu sự cố bảo mật 24/7',
    sectorNames: ['Công nghệ thông tin', 'An ninh & Bảo mật'],
    content: `<h2>SOC-as-a-Service - Trung Tâm Vận Hành An Ninh Mạng Thuê Ngoài Chuyên Nghiệp</h2>
<p>Dịch vụ Security Operations Center (SOC) thuê ngoài cung cấp giám sát an ninh mạng 24/7, phát hiện và ứng cứu sự cố trong vòng 15 phút, phù hợp với doanh nghiệp chưa đủ nguồn lực xây dựng SOC nội bộ.</p>
<h3>Tại sao cần SOC chuyên nghiệp</h3>
<p>Chi phí xây dựng SOC nội bộ từ 50-100 tỷ đồng/năm chỉ phù hợp với doanh nghiệp rất lớn. Thiếu hụt nghiêm trọng nhân lực an ninh mạng tại Việt Nam (cần 50,000 chuyên gia, thiếu 25,000). Các mối đe dọa ngày càng tinh vi: APT, ransomware, zero-day exploit đòi hỏi chuyên gia chuyên sâu và công cụ SIEM/SOAR đắt tiền.</p>
<h3>Dịch vụ SOC cung cấp</h3>
<p>24/7 threat monitoring với SIEM (Splunk/Microsoft Sentinel) tổng hợp log từ toàn bộ hạ tầng. Threat hunting chủ động tìm kiếm mối đe dọa tiềm ẩn. Vulnerability management: scan và ưu tiên vá lỗ hổng. Incident response: điều tra, ngăn chặn, khắc phục và báo cáo. Digital forensics khi cần điều tra pháp lý. Threat intelligence feed cập nhật daily từ mạng lưới toàn cầu.</p>
<h3>Quy trình ứng cứu sự cố</h3>
<p>Alert phát hiện → phân tích trong 5 phút → escalate và thông báo trong 10 phút → containment trong 15 phút. Playbook tự động cho các loại sự cố phổ biến (ransomware, phishing, DDoS). War room trực tuyến phối hợp ứng cứu với team khách hàng. Post-incident report chi tiết với lesson learned.</p>
<h3>Compliance và báo cáo</h3>
<p>Báo cáo hàng tháng: số sự cố, xu hướng, rủi ro tồn đọng. Hỗ trợ kiểm toán ISO 27001, PCI-DSS, Thông tư 09/2020/TT-NHNN. Đang bảo vệ 120+ doanh nghiệp với tổng hơn 50,000 endpoint.</p>`,
  },
  {
    title: 'Hệ thống phân tích người dùng và cá nhân hóa trải nghiệm số',
    sectorNames: ['Công nghệ thông tin', 'Thương mại điện tử'],
    content: `<h2>PersonaIQ - AI Cá Nhân Hóa Trải Nghiệm Khách Hàng Ở Quy Mô Lớn</h2>
<p>Nền tảng phân tích hành vi người dùng và cá nhân hóa trải nghiệm real-time, giúp doanh nghiệp thương mại điện tử và ứng dụng số tăng tỷ lệ chuyển đổi và giữ chân khách hàng.</p>
<h3>Bài toán cá nhân hóa</h3>
<p>91% người tiêu dùng muốn trải nghiệm cá nhân hóa nhưng 63% nói rằng họ không được hiểu. Website và app hiển thị cùng nội dung cho mọi người dùng dù hành vi và sở thích hoàn toàn khác nhau. A/B testing thủ công chậm và kém hiệu quả khi cần cá nhân hóa hàng triệu người dùng.</p>
<h3>Phân tích hành vi người dùng</h3>
<p>Heatmap, session recording phân tích UX không cần code thêm. Funnel analysis phát hiện điểm rớt khách hàng trong hành trình mua hàng. Cohort analysis so sánh hành vi theo nhóm người dùng, thời gian. Real-time segmentation phân loại người dùng theo 100+ thuộc tính hành vi. Predictive churn: dự báo khách hàng sắp rời bỏ trước 14 ngày.</p>
<h3>Cá nhân hóa AI</h3>
<p>Product recommendation engine collaborative filtering + content-based: tăng 25% average order value. Dynamic pricing cá nhân hóa theo willingness-to-pay. Email và push notification cá nhân hóa nội dung, thời điểm gửi tối ưu. Homepage, search result, banner tự động thay đổi theo từng người dùng. Multivariate testing tự động tìm combination tốt nhất.</p>
<h3>Kết quả kinh doanh</h3>
<p>Tăng 40% click-through rate trên recommendation. Giảm 20% tỷ lệ bỏ giỏ hàng. Tăng 18% doanh thu từ email marketing cá nhân hóa. Đang phục vụ 80+ doanh nghiệp TMĐT với tổng 30 triệu người dùng cuối.</p>`,
  },
  {
    title: 'Giải pháp blockchain truy xuất nguồn gốc và chứng nhận số',
    sectorNames: ['Công nghệ thông tin'],
    content: `<h2>TrustChain - Blockchain Tạo Niềm Tin Và Minh Bạch Trong Chuỗi Giá Trị</h2>
<p>Nền tảng blockchain cho phép doanh nghiệp xây dựng hệ thống truy xuất nguồn gốc sản phẩm, cấp chứng nhận số và thực hiện smart contract minh bạch với đối tác và khách hàng.</p>
<h3>Nhu cầu minh bạch và truy xuất</h3>
<p>Người tiêu dùng ngày càng quan tâm nguồn gốc sản phẩm: 73% sẵn sàng trả thêm cho sản phẩm có thể xác minh nguồn gốc. Gian lận xuất xứ hàng hóa gây thiệt hại hàng nghìn tỷ đồng. Yêu cầu EUDR (quy định chống phá rừng EU) bắt buộc truy xuất chuỗi cung ứng nông sản từ 2025.</p>
<h3>Tính năng blockchain</h3>
<p>Permissioned blockchain (Hyperledger Fabric) cho doanh nghiệp: tốc độ 10,000 TPS, kiểm soát quyền truy cập. Smart contract tự động thực thi điều khoản hợp đồng khi điều kiện đủ. QR code động cho phép người tiêu dùng xác minh toàn bộ hành trình sản phẩm. NFT chứng nhận số cho bằng sáng chế, giấy chứng nhận chất lượng, artwork. Cross-chain bridge kết nối với blockchain công cộng khi cần.</p>
<h3>Ứng dụng theo ngành</h3>
<p>Nông sản xuất khẩu: truy xuất từ nông trại → sơ chế → container → cảng → siêu thị. Thực phẩm hữu cơ: xác minh chứng nhận organic không thể giả mạo. Dược phẩm: anti-counterfeit và track-and-trace toàn chuỗi. Luxury goods: chứng thực hàng thật, chống hàng giả. Bất động sản: số hóa sổ đỏ và giao dịch bất động sản minh bạch.</p>
<h3>Triển khai và đối tác</h3>
<p>Đã deploy cho 50+ doanh nghiệp xuất khẩu nông sản, dược phẩm. Đối tác công nghệ của Bộ NN&PTNT trong dự án truy xuất nguồn gốc quốc gia. Xử lý 2 triệu transaction/ngày với zero downtime.</p>`,
  },
  {
    title: 'Hệ thống quản lý và tối ưu hóa quảng cáo số đa kênh',
    sectorNames: ['Công nghệ thông tin', 'Media & Giải trí'],
    content: `<h2>AdOptimize - Nền Tảng AI Quản Lý Và Tối Ưu Quảng Cáo Số Đa Kênh</h2>
<p>Nền tảng quản lý quảng cáo số tích hợp AI, tổng hợp và tối ưu hóa chiến dịch trên Google, Facebook, TikTok, Zalo, programmatic advertising từ một dashboard duy nhất với chi phí quảng cáo hiệu quả hơn 40%.</p>
<h3>Phân mảnh kênh quảng cáo số</h3>
<p>Doanh nghiệp Việt Nam trung bình chạy quảng cáo trên 5-8 kênh số nhưng quản lý rời rạc, thiếu attribution chính xác. Chi phí quảng cáo số tại Việt Nam tăng 25%/năm nhưng hiệu quả không tương xứng do ngân sách phân bổ không tối ưu. 40% ngân sách quảng cáo bị lãng phí theo nghiên cứu thị trường.</p>
<h3>Tích hợp và quản lý đa kênh</h3>
<p>Single dashboard quản lý Google Ads, Meta, TikTok, Zalo, Cốc Cốc, programmatic DSP. Tự động đồng bộ audience, creative, bid strategy giữa các nền tảng. Unified attribution model: biết chính xác kênh nào đóng góp vào conversion. Creative performance analytics: phân tích element nào trong creative hiệu quả nhất. Budget pacing tự động phân bổ ngân sách theo hiệu suất real-time.</p>
<h3>AI tối ưu hóa</h3>
<p>Bid optimization AI điều chỉnh đấu giá theo giờ, ngày, thiết bị, vị trí địa lý. Audience expansion tự động tìm đối tượng tương tự hiệu quả. Ad copy generation AI viết 50 biến thể tiêu đề và mô tả để A/B test. Anomaly detection cảnh báo chi tiêu bất thường. Forecast doanh thu và leads trước khi launch campaign.</p>
<h3>Kết quả khách hàng</h3>
<p>Giảm trung bình 35% cost per acquisition. Tăng 50% ROAS (Return on Ad Spend). Tiết kiệm 10 giờ/tuần công việc báo cáo thủ công. Đang quản lý 500 tỷ đồng ngân sách quảng cáo/tháng cho 200+ khách hàng.</p>`,
  },
  {
    title:
      'Giải pháp xử lý ngôn ngữ tự nhiên NLP cho văn bản pháp lý và hợp đồng',
    sectorNames: ['Công nghệ thông tin', 'Luật & Tư vấn'],
    content: `<h2>LegalAI - NLP Phân Tích Và Tóm Tắt Văn Bản Pháp Lý Tiếng Việt</h2>
<p>Giải pháp AI chuyên biệt cho xử lý văn bản pháp lý tiếng Việt: phân tích hợp đồng, trích xuất điều khoản quan trọng, phát hiện rủi ro pháp lý và tóm tắt tài liệu, giúp luật sư và bộ phận pháp chế làm việc hiệu quả hơn 5 lần.</p>
<h3>Khối lượng văn bản pháp lý</h3>
<p>Một doanh nghiệp lớn ký kết 500-2,000 hợp đồng mỗi năm. Rà soát một hợp đồng thủ công tốn 2-8 giờ luật sư tùy độ phức tạp. Rủi ro bỏ sót điều khoản bất lợi do khối lượng lớn và thời gian gấp. Chi phí thuê luật sư review hợp đồng trung bình 500,000 - 2,000,000 đồng/giờ.</p>
<h3>Khả năng AI pháp lý</h3>
<p>Contract review: phân tích và flag các điều khoản rủi ro trong 3 phút. Entity extraction: tự động trích xuất bên ký kết, giá trị, thời hạn, điều kiện thanh toán, điều khoản phạt. Clause comparison: so sánh với template chuẩn hoặc hợp đồng tham chiếu của công ty. Legal document summarization: tóm tắt 200 trang thành 2 trang executive summary. Precedent search: tìm án lệ và văn bản pháp luật liên quan từ cơ sở dữ liệu 500,000 văn bản.</p>
<h3>Tích hợp workflow pháp lý</h3>
<p>Plugin Word/Google Docs review hợp đồng ngay trong soạn thảo. Contract lifecycle management: lưu trữ, tìm kiếm, nhắc gia hạn. E-signature integration với Viettel CA, VNPT CA. Risk dashboard tổng hợp rủi ro hợp đồng toàn danh mục. Training liên tục từ phản hồi của luật sư nội bộ.</p>
<h3>Hiệu quả pháp lý</h3>
<p>Giảm 80% thời gian review hợp đồng thông thường. Phát hiện 95%+ rủi ro mà đội pháp chế xác nhận là quan trọng. Tiết kiệm 30-50% chi phí tư vấn pháp lý bên ngoài. Đang sử dụng tại 25 tập đoàn và 8 công ty luật hàng đầu Việt Nam.</p>`,
  },
];

export const ALL_SEEDS = [...SEEDS, ...SEEDS_EXTRA];

if (require.main === module) {
  runSectorSeed('Công nghệ thông tin', ALL_SEEDS).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
