# TASK-03: Phiếu Khảo Sát Nhu Cầu Công Nghệ DNNVV (Hồ Sơ Mua)

## 1. Overview
Phân hệ thu thập, sàng lọc và số hóa nhu cầu đổi mới công nghệ của các DNNVV. Từ phiếu khảo sát thô ban đầu, cán bộ công nghệ sẽ đánh giá và chuyển hóa thành các bài toán (Demand Brief) chuẩn hóa đưa lên sàn giao dịch.

## 2. User Scenarios
- **US-01**: Là DNNVV, tôi muốn điền thông tin điểm nghẽn kỹ thuật và ngân sách dự kiến để tìm kiếm chuyên gia/công nghệ giải quyết.
- **US-02**: Là cán bộ điều phối, tôi muốn duyệt các phiếu khảo sát mới nộp và tick chọn để tạo thành Demand Brief chính thức.

## 3. Functional Requirements
- **REQ-03-001**: Thu thập thông tin quy mô (Khoảng doanh thu, Khoảng lao động BHXH) không đồng nhất với TT17.
- **REQ-03-002**: Quản lý mảng danh sách các "Điểm nghẽn" (Bottlenecks) và "Nhu cầu tiếp nhận" (Need Items).
- **REQ-03-003**: Cấp mã định danh Ticket riêng biệt cho mỗi dòng nhu cầu.

## 4. Business Rules
- **BR-03-001 (Định nghĩa Khoảng)**: Doanh thu và Lao động ở TASK-03 là dữ liệu Dạng khoảng (Range) hoặc Enum, KHÔNG được phép cộng gộp hay ghi đè vào dữ liệu chính xác của Master Profile hay TT17.
- **BR-03-002 (Approval Workflow)**: Phiếu khảo sát có trạng thái: Draft -> Submitted -> Verified -> Converted (Chuyển thành bài toán).

## 5. Success Criteria
- **SC-01**: Tách bạch 100% dữ liệu khảo sát (tính thời điểm) khỏi dữ liệu Master (SSOT).
