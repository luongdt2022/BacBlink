# Change Request: CR-2026-TRL-TNI-VERIFY Chuẩn Hóa Phương Pháp Luận TRL & TNI, Tách Bạch Luồng Duyệt Sản Phẩm vs. Chỉ Số Kèm Minh Chứng & Hệ Thống Nhãn Bảo Chứng

**CR-ID**: CR-2026-TRL-TNI-VERIFY  
**Primary Epic**: TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC  
**Linked Epics**: TASK-03_HO_SO_TIM_MUA_BUYER, TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN, TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME  
**Status**: APPLIED  
**Target Version**: TASK-04 v1.12.0 | TASK-03 v1.16.0 | TASK-07 v1.15.0 | TASK-01 v1.4.0  
**Author**: PO kiêm Lead BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-09  
**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định `PO-DEC-20261109-01` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 31; Hiến pháp Quản lý Đặc tả `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is)**:
  1. **Thiếu dẫn chứng phương pháp luận & Màn hình giải thích cách tính**:
     - Khối khai báo TRL (`ReactiveYellowTrlPanel.tsx`) và trang chi tiết chào bán (`/chao-ban-cong-nghe/[id]`) chỉ hiện tooltip 1 dòng, thiếu dẫn chứng chuẩn học thuật/pháp lý (NASA / ISO 16290:2013 / ITRI Đài Loan / Thông tư 17/2019/TT-BKHCN) và danh mục hồ sơ minh chứng bắt buộc tương ứng từng cấp TRL 1–9.
     - Khối tính điểm TNI (`TniRealtimeCalculator.tsx`, `QuickDemandModal.tsx`, `/khao-sat-nhu-cau`) chỉ hiển thị công thức thô `ROUND((35%K + 30%L + 20%N + 15%O)/5)`, thiếu thuyết minh mô hình định lượng 4 chiều K-L-N-O của NacenTech trên tập mẫu thực nghiệm 304 doanh nghiệp và thiếu ví dụ tính toán minh họa.
  2. **Coupling cứng giữa Duyệt Niêm Yết Sản Phẩm và Duyệt Chỉ Số TRL/SHTT/TNI**:
     - Bảng `seller_technology_offers` và `demand_items` chỉ có 1 cột `status` duy nhất. Cán bộ Sở KH&CN không thể duyệt cho sản phẩm lên sàn giao dịch trước trong khi giữ chỉ số TRL ở mức `SELF_DECLARED` chờ thẩm định chuyên sâu.
     - Quy tắc `BR-SELLER-07` cũ tự động gỡ sản phẩm khỏi sàn (`status = 'PENDING'`, `published_at = null`) khi Seller cập nhật mức TRL hoặc SHTT.
     - Màn hình `gov-approval-queue.tsx` chỉ hiện 1 dòng tên văn bằng, không liệt kê danh sách các file minh chứng (`TRL_EVIDENCE`, `PATENT_CERT`, `CATALOGUE`) kèm nút xem/tải trực tiếp.
  3. **Hiển thị nhãn TRL/TNI thiếu nhất quán trên các bề mặt công khai**:
     - Trang chủ (`/`), Danh sách Chào bán (`/chao-ban-cong-nghe`), Chi tiết Chào bán (`/chao-ban-cong-nghe/[id]`) và Danh sách Nhu cầu (`/nhu-cau-cong-nghe`) hiển thị nhãn TRL/TNI tự kê khai giống hệt chỉ số đã được cơ quan nhà nước thẩm định; thậm chí fallback điểm giả `item.tniScore || 75`.

- **Đề xuất mới (Proposed State / To-Be)**:
  1. **Minh bạch hóa Phương pháp luận (`REQ-METH-01`, `REQ-METH-02`)**: Cung cấp dẫn chứng học thuật/pháp lý và bộ đôi `<TrlMethodologyModal />`, `<TniMethodologyModal />` tại mọi điểm nhập và xem chỉ số TRL/TNI.
  2. **Máy Trạng Thái Kép & Duyệt Tách Bạch 2 Tầng (`REQ-GOV-DECOUPLED-01`, `REQ-GOV-DECOUPLED-02`, `BR-TRL-VERIFY-01..03`, `BR-TNI-VERIFY-01`)**:
     - Tách `Offer.Status` (Duyệt niêm yết sàn) khỏi `TrlVerificationStatus` và `IpVerificationStatus` (`SELF_DECLARED`, `PENDING_VERIFICATION`, `VERIFIED_BY_GOV`, `REJECTED_TRL`).
     - Tách `DemandItem.Status` khỏi `TniVerificationStatus` (`SELF_DECLARED`, `PENDING_VERIFICATION`, `VERIFIED_BY_GOV`).
     - Cho phép Cán bộ xem trực tiếp danh sách tài liệu minh chứng (`TRL_EVIDENCE`, `PATENT_CERT`, khảo sát 4 chiều K-L-N-O) và quyết định độc lập: duyệt sản phẩm lên sàn trước, xác thực chỉ số TRL/SHTT/TNI riêng.
  3. **Chuẩn hóa Hệ thống Nhãn Bảo chứng (`REQ-BADGE-UNIFIED-01`, `BR-BADGE-DISPLAY-01`)**:
     - Xây dựng `<IndexVerificationBadge />` phân biệt rõ `TRL X/9 · Tự kê khai (Chưa kiểm định)` (style trung tính/cảnh báo nhẹ) và `✓ TRL X/9 · Đã thẩm định bởi [Tên Cơ Quan]` (style Emerald bảo chứng). Xóa bỏ hoàn toàn fallback điểm giả `|| 75`.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Anchor Changes)

- **[ADD] `REQ-METH-01`**: Minh bạch phương pháp luận TRL 1–9 (NASA / ISO 16290:2013 / ITRI / Thông tư 17/2019/TT-BKHCN) và danh mục hồ sơ minh chứng bắt buộc qua `<TrlMethodologyModal />`.
- **[ADD] `REQ-METH-02`**: Minh bạch mô hình định lượng 4 chiều K-L-N-O của chỉ số TNI (thực nghiệm 304 DN) và công thức tính qua `<TniMethodologyModal />`.
- **[ADD] `REQ-GOV-DECOUPLED-01`**: Xem danh sách giấy tờ minh chứng trực tiếp (`TRL_EVIDENCE`, `PATENT_CERT`, `CATALOGUE`) và duyệt tách bạch 2 tầng (Sản phẩm vs. Chỉ số TRL/SHTT) trên `gov-approval-queue.tsx`.
- **[ADD] `REQ-GOV-DECOUPLED-02`**: Xem chi tiết điểm khảo sát 4 trục K-L-N-O và duyệt tách bạch niêm yết nhu cầu vs. xác thực chỉ số TNI trên `/gov/demands` và `gov-approval-queue.tsx`.
- **[ADD] `REQ-BADGE-UNIFIED-01`**: Hệ thống nhãn xác thực `<IndexVerificationBadge />` đồng nhất trên Trang chủ, Danh sách và Chi tiết Chào bán / Nhu cầu.
- **[ADD] `BR-TRL-VERIFY-01`**: Khởi tạo trạng thái `trl_verification_status` và `ip_verification_status` theo hồ sơ minh chứng đính kèm.
- **[ADD] `BR-TRL-VERIFY-02`**: Quy tắc duyệt tách bạch cho phép niêm yết sản phẩm lên sàn trước khi xác thực TRL/SHTT và ghi nhận tên cơ quan thẩm định (`verified_authority_name`).
- **[MODIFY] `BR-SELLER-07` $\rightarrow$ `BR-TRL-VERIFY-03`**: Sửa mức TRL/SHTT trên sản phẩm đã `APPROVED` giữ nguyên sản phẩm trên sàn, chỉ reset `trl_verification_status` / `ip_verification_status` về `PENDING_VERIFICATION` (hoặc `SELF_DECLARED`).
- **[ADD] `BR-TNI-VERIFY-01`**: Quy tắc xác thực chỉ số TNI độc lập và cấm tuyệt đối fallback điểm giả `75`.
- **[ADD] `BR-BADGE-DISPLAY-01`**: Quy tắc hiển thị nhãn phân biệt rõ "Tự kê khai - Chưa kiểm định" và "Đã thẩm định bởi [Tên Ban ngành]".
- **[ADD] `DB-TECH-OFFER-02` & `DB-DEMAND-02`**: Mở rộng cột xác thực chỉ số trong `seller_technology_offers` và `demand_items`.
- **[ADD] `API-SELLER-OFFER-04` & `API-DEMAND-VERIFY-02`**: Hợp đồng API hỗ trợ trả về trạng thái xác thực chỉ số và nhận quyết định duyệt tách bạch 2 tầng.

---

### 3. Ma Trận Tác Động Đa Bề Mặt & Liên Phân Hệ (Cross-Surface & Cross-Epic Impact)

| Bề Mặt / Epic | Thành Phần Liên Quan | Nội Dung Điều Chỉnh |
| :--- | :--- | :--- |
| **DB & Domain (`Tier-1`)** | `SellerTechnologyOffer.cs`, `DemandItem.cs` | Bổ sung các trường `TrlVerificationStatus`, `IpVerificationStatus`, `TniVerificationStatus`, `VerifiedAuthorityName`, `TrlVerifiedBy`, `TrlVerifiedAt`, `TrlReviewNote`, `TniReviewNote`. |
| **Backend API** | `TechnologyOffersController.cs`, `DemandController.cs` | Mở rộng DTO public/portal/gov và nâng cấp endpoint `/review`, `/verify` hỗ trợ quyết định duyệt tách bạch. |
| **Shared UI Components** | `TrlMethodologyModal.tsx`, `TniMethodologyModal.tsx`, `IndexVerificationBadge.tsx` | Tạo mới 3 component chuẩn hóa phương pháp luận và nhãn xác thực. |
| **Epic `TASK-04` (Seller)** | `ReactiveYellowTrlPanel.tsx`, `IpQuadDigitizationCard.tsx`, `/chao-ban-cong-nghe/*` | Nhúng dẫn chứng TRL + Modal cách tính; hiển thị `<IndexVerificationBadge />` trên danh sách và chi tiết chào bán. |
| **Epic `TASK-03` (Buyer)** | `TniRealtimeCalculator.tsx`, `QuickDemandModal.tsx`, `/khao-sat-nhu-cau`, `/nhu-cau-cong-nghe/*` | Nhúng dẫn chứng TNI 304 DN + Modal cách tính; hiển thị `<IndexVerificationBadge />` và xóa fallback `|| 75`. |
| **Epic `TASK-07` (Gov/Admin)** | `gov-approval-queue.tsx`, `/gov/demands/page.tsx`, `/admin/approvals/page.tsx` | Hiển thị danh sách file minh chứng xem/tải trực tiếp; tách 2 nhóm điều khiển Duyệt Niêm Yết và Duyệt Chỉ Số. |
| **Epic `TASK-01` (Home)** | `src/app/page.tsx` | Đồng bộ `<IndexVerificationBadge />` cho cả thẻ Chào bán (TRL) và thẻ Nhu cầu (TNI) trên Trang chủ. |
