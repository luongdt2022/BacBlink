# TASK-09: Đánh Giá Trình Độ Năng Lực Công Nghệ TT17

## 1. Overview
Hệ thống số hóa toàn bộ quy trình khảo sát và đánh giá năng lực công nghệ doanh nghiệp sản xuất theo Thông tư 17/2019/TT-BKHCN. Chuyển đổi từ phiếu giấy sang luồng nhập liệu Form Wizard 5 bước (T-E-O-R-I), lưu trữ bất biến (immutable revisions) và tự động tính toán 26 tiêu chí.

## 2. User Scenarios
- **US-01**: Là người đại diện doanh nghiệp, tôi muốn nhập liệu Phụ lục I qua giao diện Wizard từng bước để tránh bị ngợp bởi lượng câu hỏi quá lớn.
- **US-02**: Là chuyên gia đánh giá, tôi muốn hệ thống tự động tính toán sơ bộ điểm của 26 tiêu chí (dựa trên chuỗi số liệu 3 năm) để tôi có cơ sở đối chiếu minh chứng nhanh hơn.
- **US-03**: Là cán bộ Sở KH&CN, tôi muốn mỗi lần nộp phiếu phải là một bản chụp (snapshot) bất biến để đảm bảo tính pháp lý khi giải trình thanh tra.

## 3. Functional Requirements
- **REQ-09-001**: Hệ thống cung cấp Form Wizard 5 nhóm (T-E-O-R-I) cho Phụ lục I.
- **REQ-09-002**: Cơ chế lưu nháp (Auto-save) an toàn không gây khóa DB, hỗ trợ lưu các mảng dữ liệu lặp (danh sách thiết bị, công nghệ số).
- **REQ-09-003**: Tính năng Real-time Calculator hiển thị kết quả dự kiến (Điểm tổng, Phân loại, Radar Chart) trước khi Submit.
- **REQ-09-004**: Đóng gói toàn bộ phiếu thành Snapshot (Revision bất biến) khi nhấn Submit.

## 4. Business Rules
- **BR-09-001 (Chuỗi 3 năm)**: Các chỉ tiêu tài chính ($G_{sp}, G_{dt}, M, M_{tt}$) bắt buộc nhập đủ số liệu chính xác cho 3 năm liền kề trước năm đánh giá.
- **BR-09-002 (Kế thừa dữ liệu)**: Chỉ được prefill dữ liệu từ TASK-03 nếu trùng khớp về định nghĩa, kỳ báo cáo, đơn vị đo lường và pháp nhân.
- **BR-09-003 (Phân loại kết quả)**: Tổng điểm hệ số 100 quy ra 4 mức: Lạc hậu (<35), Trung bình (35-75), Khá (75-90), Tiên tiến (>90).

## 5. Success Criteria
- **SC-01**: Tốc độ load form nháp dưới 1 giây (nhờ cấu trúc DB Hybrid).
- **SC-02**: 100% các bản nộp không bị thay đổi lịch sử khi thông tin định danh Master Doanh nghiệp bị đổi tên/MST.
