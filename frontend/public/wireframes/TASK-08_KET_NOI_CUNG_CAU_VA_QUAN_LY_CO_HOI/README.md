# TASK-08: Thiết Kế Cơ Sở — Kết Nối Cung–Cầu & Quản Lý Cơ Hội

> **Mã phân hệ**: TASK-08  
> **Nguồn căn cứ**: [Báo cáo cấu trúc module Nacentwin (backup)](../../LƯU_TRỮ_BACKUP/SRS_LEGACY/Bao_cao_cau_truc_module_Nacentwin.html), mục **Kết nối cung–cầu & AI**; các hồ sơ đầu vào từ TASK-03, TASK-04, TASK-05 và danh mục TASK-06.  
> **Trạng thái**: 🟢 100% Basic Design Approved; sẵn sàng phân rã Detail SRS  
> **Trang review**: [REVIEW_QUYET_DINH_PO.html](REVIEW_QUYET_DINH_PO.html)  
> **Bộ 2 Wireframe Tương Tác Khép Kín Luồng Cơ Hội**:
> - Radar Matching Cung-Cầu & Pipeline Quản lý cơ hội: [`wireframe_matching_va_quan_ly_co_hoi.html`](wireframe_matching_va_quan_ly_co_hoi.html)
> - Phòng đàm phán hợp tác Deal Room 1-1 & Soạn thảo MOU: [`wireframe_deal_room_hop_tac.html`](wireframe_deal_room_hop_tac.html)

## 1. Mục tiêu và ranh giới

Biến dữ liệu hồ sơ **Nhu cầu (Buyer)**, **Nguồn cung (Seller)** và **Chuyên gia** đã được phê duyệt thành một cơ hội hợp tác có thể theo dõi.

**Phạm vi MVP đã được PO chốt**

- Tra cứu và gợi ý đối tượng phù hợp theo danh mục ngành, lĩnh vực/công nghệ và điều kiện hồ sơ.
- Buyer, Seller hoặc Admin tạo yêu cầu kết nối; bên nhận chấp nhận hoặc từ chối.
- Chỉ mở thông tin liên hệ theo chính sách đồng ý kết nối.
- Theo dõi trạng thái cơ hội từ gợi ý đến kết quả ban đầu.

**Chưa tự đưa vào MVP**

- Matching AI ngữ nghĩa, tự học từ phản hồi.
- Deal Room có chat, tài liệu, đàm phán hoặc ký kết.
- Giao dịch, đặt cọc và hợp đồng thương mại.

## 2. Backbone và Walking Skeleton

Hồ sơ Buyer/Seller/Chuyên gia đã duyệt → danh mục dùng chung → tra cứu hoặc gợi ý → yêu cầu kết nối → bên nhận phản hồi → mở liên hệ theo đồng ý → theo dõi cơ hội và kết quả.

**Walking Skeleton cần chạy được:** một Buyer có nhu cầu đã duyệt nhìn thấy một Seller phù hợp, gửi yêu cầu; Seller chấp nhận; hệ thống ghi nhận cơ hội và chỉ sau đó mở kênh liên hệ theo chính sách đã chốt.

## 3. Mô hình miền khái niệm

Demand và Offer tạo Match Candidate. Một Match Candidate có thể thành Connection Request. Khi yêu cầu được chấp nhận, hệ thống tạo Opportunity. Expert có thể được mời hỗ trợ tại Match Candidate hoặc Opportunity.

Các khái niệm này chỉ xác định ranh giới nghiệp vụ; quy tắc tính điểm, cấu trúc lưu trữ và API thuộc SRS chi tiết.

## 4. Lộ trình phạm vi

| Giai đoạn | Bao gồm | Điều kiện chuyển tiếp |
|---|---|---|
| Walking Skeleton | Lọc theo danh mục, yêu cầu/chấp nhận kết nối, ghi nhận cơ hội | Chốt chính sách mở liên hệ và vai trò điều phối |
| MVP | Gợi ý có xếp hạng minh bạch, dashboard theo dõi cơ hội, mời chuyên gia | Có dữ liệu phản hồi để đo chất lượng gợi ý |
| Post-MVP | AI semantic matching, Deal Room, workflow hợp tác mở rộng | PO duyệt mục tiêu vận hành và mức bảo mật cần thiết |

## 5. Quyết định PO đã chốt

1. MVP áp dụng **matching theo danh mục/quy tắc minh bạch**; AI semantic matching và tự học để giai đoạn sau.
2. MVP gồm yêu cầu kết nối hai chiều, mở liên hệ sau đồng ý và nhật ký cơ hội.
3. Deal Room chưa bao gồm chat, chia sẻ tài liệu hay đàm phán ở MVP.
4. Chi tiết chỉ số hiệu quả cơ hội được chốt khi viết SRS.
5. Áp dụng **Chỉ số TNI (Technology Need Index)** từ TASK-03 (theo Quyết định PO-DEC-20261008-03) làm trọng số ưu tiên hàng đợi (Queue Priority) và hệ số khuếch đại (Boost Factor): Nhu cầu có $\text{TNI} \ge 80$ (Rất cao) được xếp ưu tiên cao nhất trong danh sách gợi ý Matching và tự động phân công Chuyên gia tư vấn đồng hành.
6. Áp dụng **Bộ tứ thuộc tính SHTT & TRL** từ TASK-04 (theo Quyết định PO-DEC-20261008-04) vào thuật toán gợi ý: Khớp nối mức độ TRL giữa nhu cầu của Buyer và mức độ hoàn thiện của Seller; cộng điểm tin cậy (Trust Boost +20%) cho các công nghệ chào bán đã có Bằng độc quyền sáng chế (`PATENT_GRANTED`) và TRL $\ge 7$.

