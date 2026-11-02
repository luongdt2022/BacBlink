# Feature Specification: TASK-05 Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH

**Feature Branch**: `expert-profile-llkh-upgrade`  
**Feature Directory**: `specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Version**: 1.19.0  
**Created**: 25/09/2026  
**Last Updated**: 02/11/2026 (CR-2026-021: AI CV Scan Precision & Context Enrichment)  
**Status**: Shipped (Gate 5 Approved - Delta v1.5 Implemented)  
**Ánh Xạ Basic Design**: [`Specification/BASIC_DESIGN_NACENTECH.md`](../../Specification/BASIC_DESIGN_NACENTECH.md) (Mục 10 & Mục 20)  
**Bản Dựng Wireframe Tương Tác**: [`wireframe_expert_upgrade.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_expert_upgrade.html)  
**Nguồn Dữ Liệu Gốc**: Sheet `C.gia` (94 dòng dữ liệu, 6 cột) trong Master Excel `Nacentwin_20260924_bo_loc_da_sua.xlsx`  
**Phân Hệ Quản Trị Liên Thông**: [`specs/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`](../TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/) (Kiểm duyệt hồ sơ)  

---

## 1. Mục Đích & Bối Cảnh (Context & Objectives)

Nhằm xây dựng mạng lưới chuyên gia khoa học và công nghệ phục vụ tư vấn chuyển giao công nghệ cho doanh nghiệp trên toàn quốc, hệ thống cung cấp công cụ tự nâng hạng tài khoản từ thành viên cơ bản (`USER`/`GUEST`) lên chuyên gia được định danh (`EXPERT`):
1. **Số Hóa Hồ Sơ Lý Lịch Khoa Học (LLKH)**: Thu thập toàn diện dữ liệu theo chuẩn quy định của Bộ KH&CN (văn bằng, học vị, công trình công bố, sáng chế, đề tài các cấp).
2. **Trợ Lý Thông Minh AI-to-Text**: Tự động bóc tách thông tin từ tệp CV/LLKH (PDF, Word, Ảnh) bằng OCR và LLM để điền sẵn vào biểu mẫu, giảm thiểu 80% thời gian nhập liệu thủ công của nhà khoa học.
3. **Liên Thông Hàng Đợi Kiểm Duyệt Phân Cấp (TASK-07)**: Hồ sơ sau khi nộp được chuyển tiếp vào hệ thống thẩm định 2 vòng của Sở KH&CN địa phương và Hội đồng Khoa học NacenTech.

---

## 2. User Scenarios & Acceptance Criteria

### User Story 1 - Khai Báo Thông Tin Định Danh & Học Vị (Priority: P1)
**User Persona**: Thành viên đã đăng nhập (`USER`), là nhà khoa học/giảng viên/chuyên gia.  
**Mục tiêu**: Bắt đầu quy trình nâng hạng chuyên gia bằng việc khai báo thông tin pháp lý và học vị cao nhất tại Bước 1 của Form Wizard.

**Acceptance Scenarios**:
1. **Given** người dùng đã đăng nhập tại trang `/profile/upgrade`, **When** mở Tab "Chuyên gia KH&CN", **Then** hệ thống hiển thị Bước 1 với các trường tự động điền sẵn từ tài khoản (Họ tên, Email, SĐT) và yêu cầu bổ sung: Năm sinh, Giới tính, Số CCCD (12 số), Ngày cấp, Nơi cấp.
2. **Given** người dùng tải lên ảnh CCCD (2 mặt) và ảnh chân dung 3x4, **When** tệp có định dạng hợp lệ (JPG, PNG, PDF $\le 10$MB), **Then** hệ thống tiếp nhận, hiển thị xem trước (preview) và đánh dấu trạng thái hợp lệ.
3. **Given** khai báo Học hàm (PGS/GS) và Học vị (TS/ThS/KS) kèm Cơ quan công tác chính, **When** bấm [Tiếp tục: Bước 2], **Then** hệ thống lưu nháp (draft) dữ liệu Bước 1 và chuyển tiếp sang Bước 2.

---

### User Story 2 - Trích Xuất Dữ Liệu Tự Động Bằng Trợ Lý AI-to-Text (Priority: P1)
**User Persona**: Chuyên gia có sẵn tệp CV / Lý lịch khoa học cá nhân.  
**Mục tiêu**: Không phải gõ lại toàn bộ quá trình đào tạo và công tác từ đầu, tận dụng AI để bóc tách tệp.

**Acceptance Scenarios**:
1. **Given** chuyên gia ở Bước 2 của Form Wizard, **When** kéo thả tệp `LLKH_CaNhan.pdf` vào vùng thả tệp AI Uploader, **Then** hệ thống hiển thị tiến trình quét (OCR & Semantic Extraction) kèm hiệu ứng thanh tiến trình 0% $\rightarrow$ 100%.
2. **Given** quá trình trích xuất hoàn tất, **When** AI đọc xong tệp, **Then** các trường: Quá trình đào tạo (Đại học/Thạc sĩ/Tiến sĩ), Quá trình công tác, và Tóm tắt năng lực tư vấn được tự động điền sẵn nội dung chính xác.
3. **Given** nội dung AI điền trước, **When** chuyên gia chỉnh sửa hoặc bổ sung bằng tay, **Then** hệ thống cho phép biên tập tự do và lưu lại bản chỉnh sửa cuối cùng của chuyên gia.

---

### User Story 3 - Khai Báo Hồ Sơ Khoa Học, Đăng Ký Nhiệm Vụ & Cam Kết (Priority: P1)
**User Persona**: Chuyên gia hoàn thiện hồ sơ khoa học và cam kết pháp lý tại Bước 3.  
**Mục tiêu**: Cung cấp bằng chứng công trình nghiên cứu và cam kết tuân thủ chính sách PDPD.

**Acceptance Scenarios**:
1. **Given** chuyên gia ở Bước 3, **When** khai báo tối đa 05 công trình khoa học tiêu biểu (Tên bài báo, vai trò Tác giả chính/Đồng tác giả, Tạp chí Scopus/ISI, Năm XB), **Then** hệ thống kiểm tra và lưu vào bảng danh mục công trình.
2. **Given** chuyên gia có nguyện vọng điều phối đề tài, **When** tích chọn *"Đăng ký Chủ nhiệm nhiệm vụ KH&CN"*, **Then** hệ thống kiểm tra điều kiện học vị (tối thiểu Tiến sĩ hoặc chứng chỉ tương đương theo quy định).
3. **Given** chuyên gia tích chọn cam kết bảo vệ dữ liệu cá nhân (PDPD NĐ 13/2023) và cam kết tính trung thực của hồ sơ, **When** bấm [GỬI HỒ SƠ NÂNG CẤP CHUYÊN GIA], **Then** hệ thống đóng gói toàn bộ hồ sơ, tạo bản ghi `ExpertProfile` trạng thái `PENDING_REVIEW`, sinh yêu cầu thẩm định tại `TASK-07` và hiển thị mã hồ sơ tra cứu (ví dụ: `EXP-2026-0925-HN08`).

---

### User Story 4 - Theo Dõi & Nhận Thông Báo Thẩm Định Hồ Sơ (Priority: P2)
**User Persona**: Chuyên gia đang chờ kết quả phê duyệt.  
**Mục tiêu**: Nắm bắt tiến độ thẩm định của Hội đồng Khoa học NacenTech hoặc Sở KH&CN.

**Acceptance Scenarios**:
1. **Given** hồ sơ ở trạng thái `PENDING_REVIEW`, **When** chuyên gia truy cập lại trang cá nhân, **Then** form chuyển sang chế độ xem (Read-only) với nhãn vàng: *"Hồ sơ đang trong quá trình thẩm định (SLA: tối đa 48 giờ làm việc)"*.
2. **Given** Hội đồng yêu cầu bổ sung thông tin (trạng thái `CHANGES_REQUESTED`), **When** chuyên gia đăng nhập, **Then** hệ thống hiển thị thông báo kèm lý do yêu cầu chỉnh sửa và mở lại quyền sửa đổi form.
3. **Given** hồ sơ được phê duyệt (`APPROVED`), **When** chuyên gia đăng nhập, **Then** tài khoản được tự động gán vai trò `EXPERT` (`PlatformRoles.Expert`), mở menu Quản lý hồ sơ tư vấn và niêm yết lên Danh bạ Chuyên gia công khai.

---

## 3. Business Rules (Quy Tắc Nghiệp Vụ Bắt Buộc)

| Mã Rule | Tên Quy Tắc | Điều Kiện Kích Hoạt & Logic Xử Lý | Mã Lỗi / Phản Ứng |
| :--- | :--- | :--- | :--- |
| **BR-EXP-001** | **Điều Kiện Học Vị Bắt Buộc** | Hồ sơ bắt buộc phải có học vị tối thiểu là `Cử nhân / Kỹ sư`. Đối với các lĩnh vực chuyên sâu (Y dược, Công nghệ sinh học, Vật liệu mới), khuyến khích từ `Thạc sĩ` trở lên. | `422 Unprocessable` (`ERR_DEGREE_REQUIRED`) |
| **BR-EXP-002** | **Điều Kiện Đăng Ký Chủ Nhiệm Nhiệm Vụ** | Chỉ tài khoản có học vị `Tiến sĩ` hoặc `Tiến sĩ Khoa học` (hoặc có xác nhận chủ trì đề tài cấp Bộ trở lên) mới được phép tích chọn điều kiện *Chủ nhiệm nhiệm vụ KH&CN*. | Cảnh báo giao diện / Khóa checkbox |
| **BR-EXP-003** | **Giới Hạn Tệp Đính Kèm & Bảo Mật** | Tệp CCCD và văn bằng $\le 10$MB (PDF/JPG/PNG). Tệp CV/LLKH $\le 20$MB (PDF/DOCX). Backend bắt buộc kiểm tra MIME Type và Magic Bytes chống file độc hại. | `413 Payload Too Large` (`ERR_FILE_TOO_LARGE`) |
| **BR-EXP-004** | **Bắt Buộc Đồng Ý PDPD (Nghị Định 13)** | Hồ sơ không thể submit nếu chưa tích chọn đồng ý lưu trữ và xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP. Ghi nhận `pdpd_consent_at = UTC_NOW`. | `400 Bad Request` (`ERR_PDPD_CONSENT_REQUIRED`) |
| **BR-EXP-005** | **Tự Động Đẩy Sang Hàng Đợi Kiểm Duyệt TASK-07** | Khi submit hồ sơ thành công, hệ thống tự động sinh 1 bản ghi vào bảng `approval_requests` với `request_type = 'EXPERT'`, `scope_type = 'PROVINCE'` (hoặc `GLOBAL`). | Giao dịch nguyên tử (ACID) |
| **BR-EXP-006** | **Khóa Chỉnh Sửa Khi Đang Chờ Duyệt** | Khi hồ sơ mang trạng thái `PENDING_REVIEW`, mọi thao tác chỉnh sửa dữ liệu của chuyên gia đều bị khóa tạm thời để đảm bảo tính toàn vẹn thẩm định. | `403 Forbidden` (`ERR_PROFILE_LOCKED_FOR_REVIEW`) |
| **BR-EXP-CV-011** | **Ghi Đè Tên Demo Mặc Định** | Khi AI trích xuất họ tên từ CV, tự động điền đè lên tên demo/placeholder ("Dang Lanm"). Không chặn ghi đè nếu giá trị cũ là demo. | `200 OK` (Auto-fill with badge "✨ AI Gợi Ý") |
| **BR-EXP-CV-012** | **Trích Xuất Bắt Buộc Năm Đạt Học Vị** | Schema & Prompt của Gemini bắt buộc có `degree_year`. Trích xuất chính xác năm cấp bằng (ví dụ: 2011), không rơi về năm 2026. | `200 OK` (Valid Integer YYYY) |
| **BR-EXP-CV-013** | **Gợi Ý Cơ Quan Thẩm Định Cấp 2** | Suy luận `target_review_scope` từ cơ quan/địa chỉ công tác: Trực thuộc Bộ KH&CN -> `GLOBAL`, Tỉnh/thành -> `HN`, `HCM`, `HP`... Cấm hardcode 'HP'. | `200 OK` (Context Scope Mapping) |
| **BR-EXP-CV-014** | **Đối Soát Ngữ Nghĩa Lĩnh Vực Công Nghệ** | Áp dụng Multi-tier match (Exact -> Keyword -> Fuzzy Similarity >= 0.6) map sang 10 Lĩnh vực TT17. Bảo lưu `raw_extracted_sectors`, không xóa trắng. | `200 OK` (Taxonomy Semantic Match) |

---

## 4. Success Criteria & Non-Functional Requirements (NFR)

1. **Hiệu Năng (Performance)**:
   - Thời gian tiếp nhận và lưu trữ hồ sơ nộp lên: $\le 1.0$ giây (kể cả tải tệp đính kèm).
   - Thời gian AI OCR bóc tách tệp LLKH: $\le 5.0$ giây cho tệp PDF dưới 10 trang.
2. **Độ Chính Xác Trích Xuất (Accuracy)**:
   - Tỷ lệ trích xuất đúng thông tin quá trình đào tạo và công trình khoa học từ tệp CV đạt $\ge 85\%$.
3. **Bảo Mật & An Toàn Thông Tin**:
   - Dữ liệu CCCD và số điện thoại chuyên gia được mã hóa ở mức lưu trữ (AES-256).
   - Chỉ công khai thông tin học vị, cơ quan và hướng nghiên cứu lên sàn; ẩn số CCCD và thông tin cá nhân nhạy cảm khỏi người dùng vãng lai.
4. **Tính Toàn Vẹn Liên Thông**:
   - 100% hồ sơ nộp thành công phải xuất hiện tức thì trên Bảng điều khiển kiểm duyệt của Cán bộ Sở / NacenTech (`TASK-07`).

---

## Spec Delta v2: Kênh Tiếp Nhận Nhanh Qua Zalo Mini App (< 2 Phút) & Chuẩn Hóa PDPD

- **Bối cảnh & Căn cứ thay đổi**: Triển khai theo tài liệu Thiết kế Cơ sở `TASK-05` (Mục 4) và Wireframe [`wireframe_zalo_input_form.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_zalo_input_form.html). Ứng dụng mã nguồn sẵn có tại [`SourceCode/ZaloMiniApp/`](../../SourceCode/ZaloMiniApp/) để tiếp cận nhanh đội ngũ nhà khoa học trên điện thoại di động qua Zalo OA/Group.
- **Quyết định PO quan trọng**:
  1. **Loại bỏ hoàn toàn trường CCCD / ảnh CCCD** ở bước thu thập ban đầu để bảo vệ dữ liệu nhạy cảm theo Nghị định 13/2023/NĐ-CP (PDPD).
  2. **Bổ sung trường "Công nghệ làm chủ"**: Multi-select từ danh mục 34 nhóm công nghệ chuẩn (`CN01` $\rightarrow$ `CN39`) từ Sheet Ma trận Lĩnh vực - Công nghệ.

### User Story 5 - Nộp Hồ Sơ Sơ Bộ Siêu Tốc Trên Zalo Mini App (Priority: P1)
**User Persona**: Nhà khoa học, chuyên gia mở link Zalo trên điện thoại smartphone.  
**Mục tiêu**: Hoàn thành việc đăng ký và nộp CV chỉ trong vòng dưới 2 phút mà không gặp rào cản gõ phím phức tạp.

**Acceptance Scenarios**:
1. **Given** chuyên gia mở Zalo Mini App từ Zalo OA Viện NacenTech, **When** ứng dụng khởi động, **Then** hệ thống gọi SDK `getUserInfo` và `getPhoneNumber` để tự động điền sẵn Họ tên và Số điện thoại liên lạc.
2. **Given** form thu thập sơ bộ, **When** chuyên gia điền Email công tác, chọn Học vị cao nhất (TS/PGS/GS/ThS/KS), nhập Cơ quan công tác, chọn Lĩnh vực 18 ngành TT17 và chọn các Công nghệ làm chủ, **Then** hệ thống kiểm tra tính hợp lệ tức thì (Client-side validation).
3. **Given** tệp CV / Lý lịch khoa học cá nhân, **When** chuyên gia tải lên tệp PDF/Word/Ảnh $\le 20$MB và tích cam kết PDPD, **Then** nút [GỬI HỒ SƠ] kích hoạt. Bấm gửi sẽ gửi request multipart/form-data lên backend, hiển thị thanh tiến trình AI và Modal tiếp nhận kèm mã số `DRAFT-EXP-2026-XXXX`.

---

### User Story 6 - Tự Động Kích Hoạt Magic Link & Bàn Giao Web Portal (Priority: P1)
**User Persona**: Chuyên gia sau khi gửi hồ sơ qua Zalo Mini App.  
**Mục tiêu**: Xem lại dữ liệu AI bóc tách và xác nhận pháp lý chính thức trên Web Portal.

**Acceptance Scenarios**:
1. **Given** hồ sơ Zalo được tiếp nhận, **When** AI Ingestion Engine phân tích xong tệp CV, **Then** hệ thống tự động sinh `MagicLinkUrl` kèm token xác thực một lần (TTL 72 giờ).
2. **Given** chuyên gia bấm vào nút [Mở Xem Lại & Xác Nhận Ngay] trên Zalo Mini App (hoặc link gửi qua tin nhắn Zalo ZNS / Email), **When** mở trang Web Portal, **Then** toàn bộ dữ liệu (quá trình đào tạo, công tác, 5 bài báo tiêu biểu) đã được điền sẵn 90-95% vào Form Wizard 3 bước.
3. **Given** chuyên gia rà soát thông tin trên Web Portal, **When** bấm [Xác Nhận & Nộp Chính Thức], **Then** hồ sơ chuyển từ `DRAFT_AI_PREFILLED` sang `PENDING_REVIEW` của `TASK-07`.

---

### Quy Tắc Nghiệp Vụ Bổ Sung (Spec Delta Rules)

| Mã Rule | Tên Quy Tắc | Điều Kiện Kích Hoạt & Logic Xử Lý | Mã Lỗi / Phản Ứng |
| :--- | :--- | :--- | :--- |
| **BR-EXP-007** | **Xác Thực Đầu Vào Zalo Mini App** | Bắt buộc Họ tên, SĐT hợp lệ Việt Nam (10 số), Email, Học vị, Cơ quan, Mã ngành 18 TT17, ít nhất 1 mã công nghệ làm chủ và 1 tệp đính kèm CV $\le 20$MB. | `400 Bad Request` (`ERR_INVALID_INTAKE_PAYLOAD`) |
| **BR-EXP-008** | **Bảo Mật PDPD Zero-Friction** | Tuyệt đối không thu thập hoặc lưu trữ số CCCD và ảnh CCCD ở bước sơ bộ qua Zalo Mini App. | Vi phạm PDPD nếu yêu cầu CCCD |
| **BR-EXP-009** | **Cơ Chế Token Magic Link An Toàn** | Token Magic Link được mã hóa HMAC-SHA256, thời hạn sống 72 giờ, tự động hủy hiệu lực ngay sau khi chuyên gia bấm xác nhận nộp chính thức trên Web Portal. | `401 Unauthorized` (`ERR_MAGIC_LINK_EXPIRED`) |
| **BR-EXP-010** | **CORS Whitelist Webview Zalo** | API Gateway Backend bắt buộc cấp quyền truy cập CORS cho 2 origins: `https://h5.zdn.vn` và `https://mini.zalo.me`. | `403 CORS Blocked` nếu thiếu cấu hình |

---

## Spec Delta v3: Hoàn chỉnh Data Model Hồ sơ Chuyên gia, Chứng từ và AI Ingestion

**Bối cảnh & căn cứ thay đổi:** Đối soát 28/09/2026 giữa Basic Design TASK-05, Detail Design, `ExpertProfile`/EF configuration và EF migration snapshot cho thấy model hiện tại thiếu các nhóm trường bắt buộc, chưa có migration `expert_profiles`, và chưa đáp ứng NFR mã hóa PII. Delta này chỉ bổ sung, không xóa hoặc đổi kiểu dữ liệu cũ.

### Yêu cầu chức năng mới

- **REQ-EXP-DB-001 — Hồ sơ đầy đủ và truy vấn được:** Lưu riêng từng bản ghi đào tạo, công tác, công trình, sáng chế, ứng dụng thực tế, đề tài và giải thưởng; bài báo tiêu biểu giới hạn tối đa 5 bản ghi active/hồ sơ.
- **REQ-EXP-DB-002 — Chứng từ và PII an toàn:** Quản lý nhiều tệp ảnh chân dung/CCCD/văn bằng/CV với metadata, checksum, kiểm tra MIME + magic bytes + malware scan; PII tách khỏi dữ liệu hiển thị công khai và được mã hóa ở application layer.
- **REQ-EXP-DB-003 — Intake Zalo & AI có truy vết:** Bản nháp có lifecycle `DRAFT → AI_PROCESSING → AI_PREFILLED`; mỗi lượt AI lưu model/version, confidence, lỗi và nguồn tệp. Magic Link là one-time token, chỉ lưu hash.
- **REQ-EXP-DB-004 — Liên thông phê duyệt có lịch sử:** Khi nộp chính thức, tạo `approval_requests` của TASK-07 và `expert_profile_status_history` trong một transaction; status AI không thay thế status phê duyệt.
- **REQ-EXP-DB-005 — Danh mục chuẩn và dịch vụ tư vấn:** Ngành TT17, OECD và công nghệ làm chủ dùng mã chuẩn/FK theo TASK-06; bổ sung loại dịch vụ, hình thức làm việc, khu vực và lịch sẵn sàng cho kết nối doanh nghiệp.

### Quy tắc nghiệp vụ bổ sung

| Mã Rule | Quy tắc |
| :--- | :--- |
| **BR-EXP-011** | Không được chuyển `PENDING_REVIEW` khi thiếu chứng từ bắt buộc, tệp không qua kiểm tra hoặc chưa có cả PDPD và legal oath versioned consent. |
| **BR-EXP-012** | Không API public nào được trả CCCD, dữ liệu liên hệ hoặc URL chứng từ riêng tư; DTO phải tách public/owner/admin. |
| **BR-EXP-013** | `person_id` unique khi khác null; một draft Zalo chưa gắn person không chặn draft khác. |
| **BR-EXP-014** | AI chỉ prefill; dữ liệu AI không thành dữ liệu chính thức cho đến khi chuyên gia rà soát và xác nhận. |
| **BR-EXP-015** | Magic Link hết hạn sau 72 giờ, chỉ dùng một lần và được đối chiếu bằng hash; không lưu token thô. |

### Acceptance Criteria

1. **Given** chuyên gia nộp hồ sơ hoàn chỉnh, **When** lưu, **Then** từng dòng đào tạo/công tác/hồ sơ khoa học và từng chứng từ được lưu đúng bảng, có FK về profile.
2. **Given** draft từ Zalo, **When** AI xử lý CV, **Then** hệ thống ghi một ingestion job có trạng thái/kết quả/confidence; profile chỉ chuyển `AI_PREFILLED` sau job thành công.
3. **Given** yêu cầu API public, **When** đọc danh bạ chuyên gia, **Then** response không chứa PII hay document private.
4. **Given** người dùng xác nhận nộp, **When** toàn bộ điều kiện hợp lệ, **Then** profile status history và approval request được tạo nguyên tử; khi một thao tác lỗi, không có bản ghi nửa chừng.

---

## Spec Delta v4: Hợp nhất Contract DB — Zalo Mini App — Web Portal

**Phát hiện:** Zalo đang gọi đúng route quick-intake nhưng chỉ truyền dữ liệu sơ bộ; Web Portal đang gửi tên trường không khớp `SubmitExpertUpgradeRequest`. Các bảng chi tiết đã có trong database nhưng chưa có API contract hay luồng UI ghi/đọc. Delta này là hợp đồng bắt buộc để ba lớp dùng chung một data model.

### Yêu cầu hợp nhất

- **REQ-EXP-INT-001 — Canonical Web Profile Contract:** Web Portal phải gửi đúng contract: `birthYear`, `gender`, `idCardNumber`, `idCardDate`, `degree`, `degreeYear`, `organizationName`, `expertiseSectors`, hai consent; các trường UI cũ không có đích lưu trữ chỉ được giữ khi bổ sung schema/contract tương ứng.
- **REQ-EXP-INT-002 — Detail Collections API:** Owner API phải nhận/trả các collection `trainingRecords`, `employmentRecords`, `publications`, `patents`, `practicalProjects`, `researchProjects`, `awards`, `documents`, `consents` và `aiIngestions`; public API chỉ trả projection an toàn, không PII/chứng từ.
- **REQ-EXP-INT-003 — Zalo Draft Handoff:** Quick intake lưu tệp bằng document record, tạo ingestion record và tracking code bền vững; Magic Link mở đúng draft trên Web Portal để rà soát, bổ sung thông tin bắt buộc và submit chính thức.
- **REQ-EXP-INT-004 — UI State Synchronization:** Web và Zalo hiển thị cùng status chuẩn `DRAFT`, `AI_PROCESSING`, `AI_PREFILLED`, `PENDING_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`; không dùng `PENDING_APPROVAL` hay `DRAFT_AI_PREFILLED` như tên trạng thái riêng.
- **REQ-EXP-INT-005 — Document Upload Contract:** Upload có document type, file binary, checksum/MIME/scan status; Zalo chỉ cho `CV_LLKH`, Web mới nhận CCCD, portrait và bằng cấp. API không coi `IFormFile.FileName` là storage URL.

### Quy tắc nghiệp vụ bổ sung

| Mã Rule | Quy tắc |
| :--- | :--- |
| **BR-EXP-016** | Web Portal không được fallback sang trạng thái thành công khi API submit lỗi; phải hiển thị Error state và giữ dữ liệu để sửa. |
| **BR-EXP-017** | Chỉ profile owner với Magic Link hợp lệ hoặc session đã xác thực mới được đọc draft; link hết hạn/đã dùng trả mã lỗi rõ ràng. |
| **BR-EXP-018** | Một document `CV_LLKH` được Zalo tải lên phải trở thành nguồn của một `expert_ai_ingestions`; không tạo ingestion nếu upload/scan chưa hợp lệ. |
| **BR-EXP-019** | Khi cập nhật collection, request phải chạy transaction; lỗi một bản ghi con không được lưu một phần profile. |

### Acceptance Criteria

1. **Given** Web Portal submit profile, **When** request đến API, **Then** payload khớp canonical contract và được lưu cả root/detail collections trong một transaction.
2. **Given** Zalo quick intake có CV hợp lệ, **When** API trả kết quả, **Then** response chứa tracking ID bền vững và Magic Link; database có document + ingestion record liên kết draft.
3. **Given** chuyên gia mở Magic Link, **When** token còn hiệu lực, **Then** Web Portal nạp draft và cho bổ sung chứng từ/collection trước khi submit chính thức.
4. **Given** API lỗi hoặc document chưa scan xong, **When** UI nhận response, **Then** Zalo/Web hiển thị Error/Partial state, không hiển thị thành công giả lập.

---

## Spec Delta v5: Trang Chi Tiết Chuyên Gia KH&CN

**Nguồn đã đối soát:** [`wireframe_so_tay_chuyen_gia_profile.html`](../../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_so_tay_chuyen_gia_profile.html). Đây là màn hình của đúng `TASK-05`, gồm hai projection của cùng một hồ sơ: **Public Web** và **Full/Owner**.

### User Story 7 — Tra cứu hồ sơ công khai

**Persona:** doanh nghiệp, viện/trường hoặc đối tác chưa đăng nhập.  
**Mục tiêu:** đánh giá năng lực chuyên gia và gửi yêu cầu kết nối mà không nhận dữ liệu nhạy cảm.

1. **Given** hồ sơ `APPROVED` và được phép hiển thị, **When** người dùng mở `/experts/{expertCode}`, **Then** hiển thị hero (mã chuyên gia, xác thực, sẵn sàng tư vấn), tổ chức/chức danh, giới thiệu, ngành TT17, công nghệ làm chủ và chỉ số thành tựu.
2. **Given** người dùng ở Public Web, **When** xem liên hệ/nội dung, **Then** không nhận SĐT, email, CCCD, địa chỉ cư trú, tài khoản/thù lao ngân hàng, chứng từ hay nhật ký truy cập; CTA là `Đặt lịch tư vấn KH&CN` và `Chia sẻ`.
3. **Given** hồ sơ công khai, **When** chuyển tab, **Then** xem được bằng sáng chế/GPHI, đề tài KH&CN, công trình công bố, áp dụng thực tiễn/tư vấn và giải thưởng đã được phép công bố.

### User Story 8 — Chủ hồ sơ xem bản Full

**Persona:** chính chuyên gia đã đăng nhập; quản trị viên có quyền đối soát.  
**Mục tiêu:** quản lý hồ sơ/chứng từ/PDPD mà không làm lộ dữ liệu này trên Public Web.

1. **Given** actor là owner hoặc admin có permission, **When** mở `/portal/expert/profile`, **Then** nhận Full projection gồm khu định danh/tài chính, vai trò đăng ký, thông tin tổ chức, địa chỉ/PDPD và minh chứng.
2. **Given** actor không có quyền, **When** gọi Full API hoặc tải chứng từ, **Then** nhận `403` và không có một phần PII nào trong response.
3. **Given** owner bấm chỉnh sửa/PDPD, **Then** được dẫn tới luồng hiện có; `PENDING_REVIEW` vẫn khóa sửa theo `BR-EXP-006`.

### Yêu cầu và quy tắc bổ sung

- **REQ-EXP-DETAIL-001:** Public Detail API/route theo `expertCode` bất biến; chỉ trả profile `APPROVED` + `PUBLIC` và dữ liệu được phép công bố.
- **REQ-EXP-DETAIL-002:** Full Detail API riêng cho owner/admin, không dùng DTO public.
- **REQ-EXP-DETAIL-003:** Render hero, đào tạo, công tác, liên hệ theo projection, hội đồng/chứng nhận và 5 tab thành tựu theo wireframe.
- **REQ-EXP-DETAIL-004:** CTA Public mở phiếu kết nối khi contract module đích đã có; nếu chưa có thì `Partial`, không giả lập success.
- **REQ-EXP-DETAIL-005:** Zalo Mini App chỉ handoff an toàn tới Public Detail/Portal owner, không lặp Full desktop page.
- **REQ-EXP-DETAIL-006:** Đọc private/tải chứng từ phải audit; share chỉ tạo public URL, không token/PII.

| Mã Rule | Quy tắc |
| :--- | :--- |
| **BR-EXP-020** | Public Detail chỉ tồn tại với `APPROVED` + `PUBLIC`; trạng thái khác trả `404`. |
| **BR-EXP-021** | DTO/API public không chứa PII, tài chính, document URL/key, consent detail hoặc audit trail, kể cả `null`/masked. |
| **BR-EXP-022** | Full Detail chỉ cho owner hoặc quyền TASK-07; mọi đọc private/download document tạo audit actor, purpose, thời điểm, resource. |
| **BR-EXP-023** | Tab public chỉ hiển thị bản ghi `is_public = true` và `is_active = true`; rỗng phải là Empty state. |
| **BR-EXP-024** | `expertCode` unique, bất biến, là định danh URL; không dùng UUID/họ tên làm public route. |

### Acceptance Criteria Delta v5

1. Contract test xác nhận public response không có key PII/chứng từ/audit và profile không public trả `404`.
2. Owner/admin API và download document có authorization/audit; owner không đọc được Full profile của người khác.
3. Web khớp các vùng wireframe và đủ Loading, Empty, Error, Success, Partial.
4. Zalo handoff đúng context, không mang Magic Link/token trong share URL.

---

## Spec Delta v6: Đăng nhập thật và xem Hồ sơ Full của Chuyên gia

**Bối cảnh & căn cứ thay đổi:** Rà soát luồng chạy local ngày 29/09/2026 cho thấy trang `/login` gọi relative URL không được proxy sang API, sau đó bắt mọi lỗi và tạo `mock-jwt-token`. Token giả bị API từ chối khi owner page gọi `/api/v1/experts/me/detail`. Đồng thời, tài khoản demo trên Web chưa được liên kết bằng `person_id` tới hồ sơ `CG-NACEN-DEMOIT01`. Đây là lỗ hổng của đúng hành trình TASK-05, không mở Epic mới; TASK-00 chỉ là dependency về JWT/RBAC.

### User Story 9 — Chuyên gia đăng nhập thật và xem hồ sơ của chính mình (Priority: P0)

**Persona:** chuyên gia đã được phê duyệt và có tài khoản hoạt động.

1. **Given** chuyên gia nhập email/mật khẩu hợp lệ tại `/login`, **When** bấm đăng nhập, **Then** Web gọi API thật theo cấu hình môi trường, lưu access token do Backend cấp và điều hướng `VERIFIED_EXPERT` tới `/portal`.
2. **Given** chuyên gia bấm mở Hồ sơ chuyên gia từ Portal, **When** truy cập `/portal/expert/profile`, **Then** Web gửi Bearer token thật tới `GET /api/v1/experts/me/detail` và chỉ nhận Full projection của profile có `person_id` đúng bằng `sub` của token.
3. **Given** đăng nhập sai, API không sẵn sàng hoặc nhận 401/403, **When** Web xử lý response, **Then** không tạo session giả, hiển thị Error state có thể thử lại và không gửi token giả tới Backend.

### Yêu cầu chức năng mới

- **REQ-EXP-AUTH-001 — Canonical real-login transport:** Login/Register và mọi API client của Web phải lấy cùng `NEXT_PUBLIC_API_BASE_URL` (development mặc định `http://localhost:5080`); không dùng relative `/api/v1/*` nếu không có reverse proxy được cấu hình và kiểm thử. Lỗi network/4xx/5xx không được fallback sang mock session.
- **REQ-EXP-AUTH-002 — JWT role contract:** Backend login response phải trả `id`, `email`, `fullName`, `role`, `scopeType`, `scopeId` đúng với claims JWT. `VERIFIED_EXPERT` là role hợp lệ của PlatformRoles; public login xác thực account active theo role thực, còn admin login vẫn giới hạn role quản trị.
- **REQ-EXP-AUTH-003 — Account-to-profile ownership:** `ExpertProfile.PersonId` là nguồn chân lý duy nhất xác định owner. Tài khoản chuyên gia local dùng để nghiệm thu phải được tạo/kích hoạt thật, gán role `VERIFIED_EXPERT` và liên kết idempotent với `CG-NACEN-DEMOIT01`; tuyệt đối không match theo họ tên hoặc email.
- **REQ-EXP-AUTH-004 — Owner route guard & recovery:** `/portal/expert/profile` kiểm tra session/role trước khi gọi API; 401 thì xóa session và đưa về login, 403/404 hiển thị trạng thái rõ ràng. Chỉ `VERIFIED_EXPERT` owner hoặc admin được xem Full projection; public route giữ nguyên DTO không PII.
- **REQ-EXP-AUTH-005 — Local E2E fixture an toàn:** Có fixture development tách khỏi production migration để tạo/đồng bộ account demo. Không hard-code credential trong bundle frontend, migration hoặc production config; credential local được lấy qua biến môi trường/secret development và chỉ hiển thị trong hướng dẫn test nội bộ.

### Quy tắc nghiệp vụ bổ sung

| Mã Rule | Quy tắc |
| :--- | :--- |
| **BR-EXP-025** | Login thất bại, API không kết nối hoặc response không hợp lệ phải kết thúc ở Error state; không được tạo `mock-jwt-token`, mock user hay session thành công giả. |
| **BR-EXP-026** | Chỉ access token do Backend ký, còn hạn và có `sub` hợp lệ mới được dùng gọi Owner API. `role`, `scopeType`, `scopeId` hiển thị trên Web phải nhất quán với response và JWT. |
| **BR-EXP-027** | Owner API chỉ truy vấn theo `ExpertProfile.PersonId == actor.PersonId`; không có suy diễn ownership từ tên/email, và owner không đọc được profile khác. |
| **BR-EXP-028** | Tài khoản xem Full profile chuyên gia phải active và có role `VERIFIED_EXPERT`; role nâng hạng chỉ được gán sau approval theo quy trình TASK-05/TASK-07. |
| **BR-EXP-029** | Fixture demo chỉ chạy khi môi trường Development được bật rõ ràng; chạy lại phải idempotent, không sửa account/profile production và không in password vào log. |

### Acceptance Criteria Delta v6

1. **Given** local API/Web/DB đều chạy, **When** đăng nhập bằng account chuyên gia fixture hợp lệ, **Then** nhận JWT thật, session lưu đúng role `VERIFIED_EXPERT` và điều hướng `/portal` mà không có nhánh mock.
2. **Given** session thật của chuyên gia, **When** mở `/portal/expert/profile`, **Then** API trả `200` với Full projection của `CG-NACEN-DEMOIT01`; các PII chỉ xuất hiện tại owner projection.
3. **Given** mật khẩu sai, API down, token giả/hết hạn hoặc actor khác owner, **When** vào owner route/API, **Then** không có dữ liệu private; UI hiển thị Login/Error/403 đúng trạng thái và session bất hợp lệ bị xóa.
4. **Given** chạy fixture local hai lần, **When** kiểm tra database, **Then** chỉ có một account demo active và một liên kết `person_id` tới profile; dữ liệu public hiện hữu không bị tạo trùng hoặc thay đổi ngoài phạm vi fixture.
5. **Given** regression public profile và Zalo handoff, **When** chạy test/build, **Then** `/experts/CG-NACEN-DEMOIT01` vẫn public-safe, không mang token và các test cũ không hồi quy.

## Spec Delta v7: Owner Workspace — View, Edit và Cảnh báo hoàn thiện

**Căn cứ:** Basic Design v2.3 và wireframe `wireframe_expert_owner_workspace.html`. Không tạo Epic mới; đây là năng lực owner self-service của TASK-05.

- **REQ-EXP-OWNER-001:** Owner workspace hiển thị Full profile, đường dẫn Chỉnh sửa và tiến độ/cảnh báo các nhóm thông tin còn thiếu.
- **REQ-EXP-OWNER-002:** Chỉ owner/admin được nhận completeness result; public projection không thay đổi và không suy diễn PII.
- **REQ-EXP-OWNER-003:** Thanh chuyển role QA không được hiển thị trong sản phẩm; role chỉ do backend/TASK-07 cấp.
- **BR-EXP-030:** Completeness chỉ hướng dẫn bổ sung, không tự đổi trạng thái phê duyệt.
- **BR-EXP-031:** Trường đã xác minh vẫn phải đi qua luồng review hiện có khi nộp lại.

### User Story 10 — Workspace tác nghiệp của chuyên gia (Priority: P0)

**Persona:** chuyên gia có role `VERIFIED_EXPERT`; **system role:** Owner của `ExpertProfile`.

1. **BỐI CẢNH** chuyên gia đăng nhập hợp lệ, **KHI** mở `/portal/expert/profile`, **THÌ** thấy Tổng quan, tiến độ hồ sơ, các việc cần làm, thông báo và các điểm vào đúng quyền; **VÀ** không thấy menu chuyển role QA/Seller/Buyer.
2. **BỐI CẢNH** profile có trường thiếu hoặc trạng thái `CHANGES_REQUESTED`, **KHI** xem Tổng quan, **THÌ** hệ thống liệt kê nhóm thiếu, mức độ ưu tiên và CTA tới phần chỉnh sửa phù hợp. **Kịch bản lỗi 10 —** nếu không tải được completeness, trang vẫn hiển thị Owner Detail và trạng thái Partial có Retry, không tự kết luận hồ sơ đã đủ.

### User Story 11 — Xem, chỉnh sửa và nộp lại hồ sơ (Priority: P0)

**Persona:** chuyên gia có role `VERIFIED_EXPERT`; **system role:** Owner của `ExpertProfile`.

1. **BỐI CẢNH** Owner mở Hồ sơ của tôi, **KHI** chọn View, **THÌ** nhận Full projection riêng tư của chính mình và link Public View không chứa PII/token.
2. **BỐI CẢNH** profile là Draft hoặc `CHANGES_REQUESTED`, **KHI** Owner chọn Edit, **THÌ** có thể lưu nháp, sửa đúng nhóm được phép và nộp lại; thay đổi có bằng chứng được chuyển luồng thẩm định hiện có. **Kịch bản lỗi 11 —** nếu profile `PENDING_REVIEW`, nút Edit bị khóa, nêu rõ lý do và không mất dữ liệu.

### User Story 12 — Theo dõi yêu cầu tư vấn và kết nối (Priority: P1)

**Persona:** chuyên gia có role `VERIFIED_EXPERT`; **system role:** người nhận yêu cầu tư vấn.

1. **BỐI CẢNH** doanh nghiệp/NacenTech gửi yêu cầu kết nối hợp lệ, **KHI** chuyên gia vào mục Yêu cầu tư vấn & kết nối, **THÌ** xem danh sách yêu cầu của chính mình, trạng thái, lịch sử phản hồi và lịch làm việc khi có.
2. **BỐI CẢNH** chưa có yêu cầu, **KHI** mở mục này, **THÌ** hiển thị Empty state hướng dẫn hoàn thiện năng lực/dịch vụ tư vấn. **Kịch bản lỗi 12 —** nếu actor khác cố đọc yêu cầu, API/UI từ chối và không lộ tên, liên hệ hay nội dung yêu cầu.

### Phạm vi Post-MVP — Đơn tư vấn / hợp đồng

Đơn có báo giá, chấp nhận/hủy, hợp đồng, hóa đơn hoặc thanh toán không thuộc Delta v7. Đây là miền Marketplace & Commerce; không dùng từ `order` hay tạo bảng/API thanh toán trong TASK-05 trước khi PO chốt chính sách thương mại.

## Spec Delta v8: Dashboard tác nghiệp chuyên gia

**Căn cứ:** Basic Design v2.4 và `wireframe_expert_dashboard.html`. Trang `/portal` trước đây tái sử dụng dashboard đa vai trò, làm chuyên gia thấy các thẻ Gian hàng, Buyer và Doanh nghiệp không thuộc quyền/ngữ cảnh của mình.

### User Story 13 — Dashboard chung của chuyên gia (Priority: P0)

**Persona:** chuyên gia đã đăng nhập với role `VERIFIED_EXPERT`.

1. **Given** chuyên gia mở `/portal`, **When** session hợp lệ, **Then** hệ thống hiển thị Dashboard chuyên gia gồm trạng thái hồ sơ, việc cần làm, thông báo và lối tắt xem/chỉnh sửa hồ sơ; không hiển thị các mô-đun Seller, Buyer hoặc Doanh nghiệp ĐMST.
2. **Given** Owner Detail có nhóm thông tin thiếu, **When** dashboard tải xong, **Then** mỗi việc cần làm nêu lý do và CTA tới luồng bổ sung; nội dung chỉ được suy ra từ projection Owner đã được cấp quyền.
3. **Given** không tải được Owner Detail, **When** dashboard mở, **Then** hiển thị Error + Retry; không thay bằng số liệu marketplace hoặc dữ liệu giả.

### Yêu cầu và quy tắc bổ sung

- **REQ-EXP-DASH-001:** `/portal` phải render theo role session; nhánh `VERIFIED_EXPERT` dùng Dashboard chuyên gia, các role khác giữ dashboard chung hiện hữu.
- **REQ-EXP-DASH-002:** Dashboard chuyên gia dùng Owner Detail hiện hữu để hiển thị tiến độ, danh sách việc cần làm và trạng thái thẩm định; không mở DB schema/API mới trong Delta này.
- **REQ-EXP-DASH-003:** Dashboard chỉ có lối tắt Hồ sơ của tôi và Chỉnh sửa/Bổ sung; “Yêu cầu tư vấn & kết nối” giữ trạng thái Sắp có theo T068.
- **BR-EXP-032:** Thẻ/tác vụ Seller, Buyer, Doanh nghiệp ĐMST và số liệu marketplace không được hiển thị cho session chỉ có `VERIFIED_EXPERT`.
- **BR-EXP-033:** Khi chưa có notification backend, dashboard hiển thị Empty state trung thực; không tạo thông báo hoặc việc cần làm giả.

### Acceptance Criteria Delta v8

1. Session `VERIFIED_EXPERT` vào `/portal` không thấy ba thẻ marketplace và thấy “Dashboard chuyên gia”, “Việc cần làm”, “Thông báo”.
2. Profile thiếu liên hệ/chứng từ/công trình hiển thị đúng CTA Bổ sung; profile đủ hiển thị Empty/Success trung thực.
3. Lỗi Owner Detail có Retry; role khác vẫn nhận dashboard chung không hồi quy.

## Spec Delta v9: CCCD là dữ liệu lịch sử, không phải input Portal/Zalo

**Căn cứ:** Decision Record Basic Design v2.5. CCCD/ảnh CCCD không được chuyên gia tự nhập hoặc xem trên Web Portal/Zalo trong MVP; dữ liệu cũ được bảo toàn trong DB cho quy trình xác minh được cấp quyền sau này.

| Bề mặt | Hiện trạng | Thay đổi | Kiểm chứng |
| :--- | :--- | :--- | :--- |
| Basic Design/wireframe | Quyết định v2.5 | Nguồn chân lý đã cập nhật | Review Decision Record |
| Web Wizard | Có input bắt buộc | Bỏ state, input và payload CCCD | Component/build không còn nhãn/payload |
| Zalo Mini App | Đã không thu thập | Giữ nguyên | Regression search/test không có field |
| Domain/API DTO | Bắt buộc và trả Owner DTO | Nullable khi tạo; không trả Portal/Admin projection hiện hành | Unit/contract deny-list |
| DB/migration | Hai cột NOT NULL | Nới nullable, không xoá dữ liệu | Migration integration |
| Public/Owner/Admin | Public đã ẩn, Owner/Admin còn nhận | Không trả qua projection hiện hành | Contract test |

**Field Lifecycle:** `id_card_number`, `id_card_date` được **lưu** cho bản ghi lịch sử; không cho user **nhập** hoặc **hiển thị** ở Web/Zalo; không thuộc DTO hiện hành. Quy trình xác minh có thẩm quyền là phạm vi tương lai, yêu cầu contract/audit riêng.

- **REQ-EXP-PII-001:** Web/Zalo self-service không render, validate hoặc gửi CCCD/ngày cấp/ảnh CCCD.
- **REQ-EXP-PII-002:** Domain và DB chấp nhận profile mới không có CCCD, không mất dữ liệu profile cũ.
- **REQ-EXP-PII-003:** Public, Owner và Admin projection dùng cho Portal hiện tại không serialize CCCD/ngày cấp.
- **BR-EXP-034:** CCCD chỉ là dữ liệu lịch sử/xác minh có thẩm quyền, không phải điều kiện submit hồ sơ chuyên gia hiện tại.
- **BR-EXP-035:** Không được thay thế giá trị CCCD cũ bằng dữ liệu giả khi migration/rollback.

---

## Spec Delta v10: Danh bạ Tìm kiếm & Lọc Chuyên gia Công Khai (`/experts` & `/chuyen-gia`)

**Căn cứ pháp lý & Thiết kế cơ sở**: Basic Design v2.7 (Mục 2.3) và Wireframe [`wireframe_danh_ba_chuyen_gia.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_danh_ba_chuyen_gia.html).

### User Story 14 — Tra cứu & Lọc Danh bạ Chuyên gia Công Khai (Priority: P1)

**User Persona**: Doanh nghiệp (Buyer), Đơn vị nghiên cứu hoặc Khách vãng lai (`PUBLIC_USER`).  
**Mục tiêu**: Nhanh chóng tìm kiếm và sàng lọc các chuyên gia KH&CN uy tín theo ngành nghề TT17, học vị và địa phương để kết nối giải quyết bài toán kỹ thuật.

**Acceptance Scenarios**:
1. **Given** người dùng truy cập trang danh bạ `/experts` (hoặc click menu "Chuyên gia KH&CN" trên Navbar trỏ tới `/chuyen-gia`), **When** trang tải xong, **Then** hệ thống hiển thị Khung tìm kiếm Hero, Sidebar bộ lọc 4 trục bên trái, và Lưới thẻ chuyên gia (Grid 3 cột) hiển thị các chuyên gia đã được phê duyệt (`APPROVED`).
2. **Given** người dùng nhập từ khóa vào ô tìm kiếm (Họ tên, đơn vị công tác, lĩnh vực), **When** bấm [Tìm kiếm] hoặc gõ debounce, **Then** hệ thống lọc tức thì danh sách chuyên gia phù hợp mà không cần tải lại toàn trang.
3. **Given** người dùng chọn các tiêu chí trong Bộ lọc 4 trục:
   - *Trục 1*: Học vị / Học hàm (GS, PGS, TS, ThS).
   - *Trục 2*: 18 Ngành công nghiệp trọng điểm TT17.
   - *Trục 3*: Địa bàn Sở KH&CN tiếp nhận (34 Tỉnh thành 3 miền Bắc - Trung - Nam).
   - *Trục 4*: Chứng thực & Thẩm quyền (Đã xác thực bởi Sở/Viện, Chủ nhiệm đề tài, Có sáng chế).  
   **When** áp dụng bộ lọc, **Then** danh sách thẻ chuyên gia cập nhật khớp chính xác số lượng tìm thấy và điều chỉnh phân trang.
4. **Given** từng Thẻ chuyên gia (Expert Card), **When** người dùng quan sát, **Then** hiển thị đầy đủ: Ảnh đại diện/Avatar viết tắt, Huy hiệu tích xanh xác thực, Học vị/Học hàm, Sở KH&CN thẩm định, Lĩnh vực TT17 chính, Các tag công nghệ làm chủ, Thống kê năng lực (Số bài báo, sáng chế, đề tài), Nút [Xem hồ sơ chi tiết] (chuyển sang `/experts/[expertCode]`), và Nút [Gửi yêu cầu kết nối].
5. **Given** người dùng bấm nút [Gửi yêu cầu kết nối], **When** modal mở ra, **Then** cho phép nhập Tên doanh nghiệp, Tóm tắt bài toán công nghệ, Hình thức tư vấn mong muốn (Online / Khảo sát trực tiếp) và thông báo gửi yêu cầu thành công.
6. **Given** người dùng chọn bộ lọc không có chuyên gia nào phù hợp, **When** kết quả rỗng, **Then** hiển thị giao diện Empty State trung thực kèm nút [Đặt lại bộ lọc].

### Quy Tắc Nghiệp Vụ Bổ Sung (Spec Delta Rules)

- **REQ-EXP-DIR-001**: Hệ thống cung cấp API công khai `GET /api/v1/public/experts` hỗ trợ tìm kiếm toàn văn (`query`), lọc theo học vị (`degree`), lọc theo ngành (`sectorCode`), lọc theo tỉnh thành (`provinceCode`) và phân trang (`page`, `pageSize`).
- **REQ-EXP-DIR-002**: Route `/chuyen-gia` trên Web Portal tự động chuyển hướng hoặc hiển thị trực tiếp giao diện Danh bạ `/experts`, đồng bộ với thanh điều hướng Header Navbar.
- **BR-EXP-036 (Bảo vệ PII Tuyệt đối)**: Danh bạ công khai `/experts` chỉ niêm yết các hồ sơ có trạng thái `APPROVED`. Tuyệt đối KHÔNG trả về và KHÔNG render số CCCD, ảnh CCCD, Số điện thoại di động cá nhân hoặc Email riêng tư của chuyên gia.
- **BR-EXP-037 (Xử lý Bất đồng bộ 5 UX States)**: Giao diện danh bạ phải bao phủ trọn vẹn 5 trạng thái UX: Loading (Skeleton Cards), Empty (Không tìm thấy chuyên gia phù hợp), Error (Lỗi nạp dữ liệu kèm Retry), Success (Grid thẻ chuyên gia), Updating (Lọc dữ liệu mượt mà).

## Spec Delta v11: Hội tụ danh bạ theo Master Data và tinh gọn UX

**Quyết định PO**: Bộ lọc lĩnh vực hiển thị đúng các taxonomy `SECTOR` đang active trong DB; không hardcode số lượng hoặc bịa mã TT17. Baseline hiện tại có 10 mã `LV` được migration TASK-06 seed. Danh sách runtime lấy từ `GET /api/v1/sectors`; count trên giao diện là số mục trả về từ nguồn này.

### User Story 15 — Lọc danh bạ theo nguồn dữ liệu chuẩn (P1)

- **REQ-EXP-DIR-003**: Web nạp các ngành active từ `GET /api/v1/sectors`; danh sách và số lượng hiển thị phải khớp response hiện hành. Lỗi nạp danh mục có thông báo và retry, không thay bằng danh sách hardcode.
- **REQ-EXP-DIR-004**: Lọc ngành truyền đúng `code` của taxonomy vào `sectorCode`; API chỉ lọc mã thuộc expertise sectors của hồ sơ public đã duyệt.
- **REQ-EXP-DIR-005**: Lọc địa bàn chỉ được áp dụng trên mã tỉnh có nguồn xác thực. Với hồ sơ có `PersonId`, địa bàn được suy ra từ scope tỉnh của tài khoản đã duyệt (`ScopeType=PROVINCE`, `ScopeId`); hồ sơ thiếu scope không được gán tỉnh mặc định.
- **API-EXP-DIR-002**: `GET /api/v1/public/experts` hỗ trợ lọc `acceptingConsultation` và áp dụng `provinceCode` theo scope đã duyệt; các query cũ tiếp tục tương thích.
- **API-EXP-DIR-005**: Từ khóa được nhận qua `q` (client hiện hữu) và `query` (contract đã công bố); nếu cả hai cùng có giá trị thì `q` được ưu tiên. Các tham số cũ giữ tương thích.
- **API-EXP-DIR-003**: Danh sách địa bàn công khai trả mã/tên/vùng từ `/api/v1/governance/org-units/public-provinces`; không trả email/quản trị hay số liệu vận hành.
- **API-EXP-DIR-004**: Modal gọi endpoint hiện hữu `POST /api/v1/public/experts/{expertCode}/consultation-requests`; chỉ báo tiếp nhận theo response thành công.
- **BR-EXP-038**: Không trình bày chứng thực, sẵn sàng tư vấn hoặc sắp xếp như bộ lọc hoạt động nếu chúng không được giữ trong state và áp dụng lên kết quả/API.
- **BR-EXP-039**: Khi danh mục hoặc truy vấn lỗi, giữ các tiêu chí hiện chọn, cho phép retry và không hiển thị kết quả cũ như kết quả của truy vấn mới.
- **BR-EXP-040**: Danh bạ công khai tuyệt đối không hiển thị CCCD, số điện thoại cá nhân hoặc email riêng; chỉ expose thông tin hồ sơ đã duyệt và công khai.

### User Story 16 — Tra cứu gọn và dễ quét (P1)

- **REQ-EXP-DIR-006**: Tinh gọn khu vực Hero, thanh lọc và card theo wireframe Delta v11; giữ tìm kiếm, 4 trục nghiệp vụ khi có nguồn dữ liệu, phân trang và 5 UX states.
- **UI-EXP-DIR-002**: Desktop ưu tiên hero thấp, thanh tìm kiếm gọn, bộ lọc mở rộng theo nhu cầu và card ít chi tiết cạnh tranh; mobile dùng drawer cho bộ lọc. Giữ CTA xem hồ sơ và CTA kết nối theo trạng thái triển khai thật.
- **NFR-EXP-DIR-001**: Responsive tại 1440×900 và 390×844, hỗ trợ bàn phím/label accessible, không gây layout shift đáng kể khi loading.

**Điều chỉnh theo đối chiếu mã nguồn**: TASK-05 đã có `POST /api/v1/public/experts/{expertCode}/consultation-requests`, gửi notification cho nhóm quản trị. Delta v11 nối modal với endpoint hiện hữu và dùng thông điệp chính xác về người nhận; không tạo lại API. Quy trình xử lý yêu cầu tư vấn/cơ hội cung-cầu tiếp theo vẫn thuộc TASK-08.


## Spec Delta v12 — CR-2026-005: Runtime sectors across channels

- **REQ-MD-SECTOR-001**: Web, admin, profile and Zalo sector selectors, lists, labels and counts read the SECTOR taxonomy API/DB; no fixed 10/18 lists or default sector.
- **BR-MD-SECTOR-001**: New selections require an active code. Never replace the selected sector silently with the first record; ask the user to select again when an existing code is inactive.
- **BR-MD-SECTOR-002**: Empty/error responses show empty/error and retry, without sample fallback or success before a valid API response.
- **API-EXP-INTAKE-002**: Zalo reads GET /api/v1/sectors and submits the original active code as sectorCode to the existing quick-intake endpoint.
- **UI-EXP-INTAKE-002**: Show loading/error/empty/success for Zalo taxonomy; prevent submit without an active sector selection.
- **BR-EXP-AI-002**: CV parsing reads active taxonomy before AI; return 503 when taxonomy is unavailable/empty and 502 for an AI sector outside the active list.

This scope supersedes v11 owner/admin/Zalo exclusions for sector data consumption. Specialized keywords remain separate from sectors.

## Spec Delta v13 — Close real draft handoff gap

Existing US06/BR-EXP-009/015/017 remain mandatory. Draft lookup uses72h purpose-signed HMAC token with onlySHA256 hash stored in existing DB column; legacy plaintext tokens are rejected. GET does notconsume; authenticated officialsubmit claims originalprofile and clears hash/expiry in samehosttransaction as approval enqueue. Runtimeindustrycode survives handoff, historical inactivecode requires active user selection before submission. No fabricatedAIprogress/prefill is reported. ConfiguredfrontendURL replaces hardcodedhost. Minimal handoff completion does not imply completion of CV ingestion/ZNS pipeline.

---

## Spec Delta v14: Form Chỉnh Sửa Hồ Sơ Chuyên Gia & Completeness Engine

**Căn cứ pháp lý & Thiết kế cơ sở**: Basic Design Wireframe [`wireframe_chinh_sua_ho_so_chuyen_gia.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_chinh_sua_ho_so_chuyen_gia.html) và [`wireframe_expert_dashboard.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_expert_dashboard.html).

### User Story 17 — Chuyên Gia Tự Quản Trị & Cập Nhật Hồ Sơ LLKH (Priority: P1)
**User Persona**: Chuyên gia đã được phê duyệt tài khoản (`VERIFIED_EXPERT`).  
**Mục tiêu**: Có giao diện tự phục vụ (Self-service Workspace) để cập nhật học hàm, cơ quan, từ khóa nghiên cứu, thành tựu khoa học và trạng thái sẵn sàng nhận tư vấn chuyển giao công nghệ.

**Acceptance Scenarios**:
1. **Given** chuyên gia đã đăng nhập với vai trò `VERIFIED_EXPERT`, **When** bấm nút "Chỉnh sửa hồ sơ" trên trang cá nhân hoặc truy cập `/portal/expert/profile/edit`, **Then** hệ thống nạp dữ liệu hiện hành từ CSDL thật vào biểu mẫu 3 khối chuẩn Wireframe:
   - *Khối 1*: Học hàm, Học vị, Năm công nhận, Cơ quan công tác, Chức vụ chuyên môn.
   - *Khối 2*: Lĩnh vực trụ cột TT17 (chọn từ taxonomy active trong DB) & Từ khóa chuyên sâu (`specializedKeywords`).
   - *Khối 3*: Danh mục công trình khoa học, bằng sáng chế, đề tài và tóm tắt năng lực tư vấn.
   - *Khối Trạng thái*: Bật/tắt trạng thái Nhận lời mời tư vấn (`isAcceptingConsultation`).
2. **Given** chuyên gia sửa đổi thông tin và bấm [Lưu Thay Đổi Hồ Sơ], **When** gửi yêu cầu `PUT /api/v1/experts/my-profile`, **Then** hệ thống cập nhật vào PostgreSQL thật, trả thông báo thành công và điều hướng mượt mà.
3. **Given** hồ sơ chuyên gia đang ở trạng thái chờ duyệt `PENDING_REVIEW`, **When** truy cập trang chỉnh sửa, **Then** hệ thống khóa form và hiển thị cảnh báo giải thích quy trình thẩm định.

### User Story 18 — Đánh Giá Tỷ Lệ Hoàn Thiện Hồ Sơ (Priority: P2)
**User Persona**: Chuyên gia muốn biết hồ sơ của mình đạt chuẩn chất lượng ở mức độ nào để bổ sung kịp thời.  
**Mục tiêu**: Cung cấp thước đo định lượng (Completeness Score) chuẩn hóa 100% dựa trên 5 trụ cột dữ liệu Bộ KH&CN.

**Acceptance Scenarios**:
1. **Given** chuyên gia truy cập trang hồ sơ hoặc trang chỉnh sửa, **When** hệ thống gọi `GET /api/v1/experts/me/completeness`, **Then** trả về:
   - `score`: Số nguyên từ 0 đến 100.
   - `grade`: Phân loại (`EXCELLENT` $\ge 90$, `GOOD` $\ge 70$, `BASIC` $\ge 50$, `INCOMPLETE` $< 50$).
   - `completedCriteria`: Mảng tên các tiêu chí đã hoàn thành.
   - `missingCriteria`: Mảng tên các nhóm thông tin còn thiếu kèm gợi ý bổ sung.
2. **Given** tỷ lệ hoàn thiện còn thiếu, **When** hiển thị banner cảnh báo, **Then** cung cấp lối tắt nhanh dẫn đến đúng nhóm trường cần bổ sung.

### Quy Tắc Nghiệp Vụ Bổ Sung (Spec Delta Rules)
- **REQ-EXP-EDIT-001**: Hệ thống cung cấp API `PUT /api/v1/experts/my-profile` cho phép cập nhật thông tin cá nhân chuyên gia an toàn.
- **REQ-EXP-EDIT-002**: Hệ thống cung cấp API `GET /api/v1/experts/me/completeness` trả về điểm hoàn thiện hồ sơ được tính toán từ máy chủ (Server-side calculation).
- **BR-EXP-041 (Owner Authorization Guard)**: Chỉ tài khoản sở hữu hồ sơ và mang role `VERIFIED_EXPERT` mới được phép gọi API cập nhật hoặc tính completeness của chính mình.
- **BR-EXP-042 (Pending Review State Guard)**: Hồ sơ mang trạng thái `PENDING_REVIEW` bị khóa sửa đổi để bảo toàn tính toàn vẹn trong thẩm định.
- **BR-EXP-043 (Sector Active Validation)**: Mã lĩnh vực trong `expertiseSectors` bắt buộc phải là mã đang `active` trong bảng taxonomy của hệ thống.

---

## Spec Delta v15: Bàn Làm Việc Quản Trị Tài Khoản Chuyên Gia (Account Workspace) [CR-2026-013]

**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định phê duyệt PO-DEC-20261014-01, Mục 7 trong Basic Design [`README.md`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md) và Wireframe độc lập [`wireframe_expert_account.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_expert_account.html).

### User Story 19 — Không Gian Quản Trị Tài Khoản Chuyên Gia May Đo Riêng (Priority: P1)
**User Persona**: Chuyên gia KH&CN đã được Sở KH&CN địa phương thẩm định và phê duyệt tư cách (`VERIFIED_EXPERT`).  
**Bối cảnh**: Tuyến `/settings` chỉ dành cho người dùng công chúng (`PUBLIC_USER`). Chuyên gia khi đăng nhập vào hệ thống cần một không gian quản trị tài khoản chuyên biệt (`/portal/expert/account`), đặt ở vị trí ưu tiên số 1 trên menu điều hướng, để quản lý định danh pháp lý khoa học, trạng thái sẵn sàng nhận tư vấn, theo dõi điểm số hoàn thiện hồ sơ và bảo mật phiên truy cập.

**Acceptance Scenarios**:
1. **Given** người dùng đăng nhập với vai trò `VERIFIED_EXPERT`, **When** mở thanh Sidebar của Workspace Chuyên gia, **Then** mục đầu tiên (Item 1/6) là "Tài khoản Chuyên gia" (`/portal/expert/account`) với huy hiệu nhận diện và icon bảo vệ (`ShieldCheck`), trên cả mục "Tổng quan Chuyên gia".
2. **Given** chuyên gia truy cập tuyến `/portal/expert/account`, **When** trang tải xong, **Then** hệ thống hiển thị đầy đủ 5 khối chức năng theo chuẩn Wireframe:
   - *Khối 1: Định danh Khoa học & Quyết định Phê duyệt Cấp Sở*: Hiển thị Mã chuyên gia (`EXP-2026-xxxx`), Họ và tên, Chức danh, Cơ quan công tác, Đơn vị thẩm định (Sở KH&CN Tỉnh/Thành phố), Số Quyết định công nhận, Ngày duyệt, và huy hiệu xác nhận bảo vệ dữ liệu PDPD (Nghị định 13/2023/NĐ-CP).
   - *Khối 2: Thiết lập Sẵn sàng Tiếp nhận Tư vấn Doanh nghiệp*: Công tắc Toggle (On/Off) cho phép doanh nghiệp gửi yêu cầu tư vấn, danh sách lĩnh vực chuyên môn TT17 đang tiếp nhận, và các hình thức hợp tác mong muốn (R&D dài hạn, Thẩm định Deal Room 1-1, Hội đồng TT17).
   - *Khối 3: Thước đo Hoàn thiện Hồ sơ (Completeness Engine 5 Trụ Cột)*: Hiển thị thanh tiến trình điểm số (Thang 100đ), phân hạng chất lượng, chi tiết 5 trụ cột (Định danh 20đ, Văn bằng 20đ, SHTT 20đ, Đề tài 20đ, Kinh nghiệm tư vấn 20đ), kèm lối tắt chuyển sang trang chỉnh sửa `/portal/expert/profile/edit`.
   - *Khối 4: Bảo mật, Phiên Đăng nhập & Định danh Zalo Mini App*: Email đăng nhập, Số điện thoại xác thực đã che mặt nạ (masked PDPD), nút Đổi mật khẩu, Mã QR định danh đồng bộ Zalo Mini App, và danh sách Phiên đăng nhập hiện hoạt (Active Sessions) kèm nút Đăng xuất thiết bị khác.
   - *Khối 5: Tùy chọn Trải nghiệm & Cấu hình Thông báo*: Lựa chọn Giao diện (Sáng/Tối), Cỡ chữ (100%, 110%, 125%), Cấu hình nhận thông báo (Email/ZNS khi có lời mời tư vấn, tin nhắn Deal Room), Cảnh báo SLA Deal Room trước 12h, và nút [Lưu Thay Đổi Cài Đặt].
3. **Given** chuyên gia thay đổi trạng thái "Cho phép Doanh nghiệp gửi yêu cầu tư vấn" (On -> Off hoặc Off -> On), **When** bấm lưu hoặc gạt toggle, **Then** hệ thống gọi API cập nhật `isAcceptingConsultation` lên máy chủ, lưu trữ thành công và hiển thị thông báo phản hồi tức thì.
4. **Given** người dùng không có vai trò `VERIFIED_EXPERT` (ví dụ `PUBLIC_USER` hoặc chưa đăng nhập), **When** cố gắng truy cập `/portal/expert/account`, **Then** hệ thống chặn bằng `RoleGuard` và điều hướng về trang phù hợp hoặc hiển thị thông báo từ chối quyền truy cập.

### Yêu Cầu Nghiệp Vụ Bổ Sung (Spec Delta Requirements)
- **REQ-EXP-ACC-001 (Không gian quản trị tài khoản chuyên gia độc lập)**: Hệ thống cung cấp route `/portal/expert/account` may đo riêng cho vai trò `VERIFIED_EXPERT`, hiển thị ở vị trí Item 1/6 trên Sidebar của Workspace Chuyên gia.
- **REQ-EXP-ACC-002 (Thiết lập trạng thái tiếp nhận tư vấn On/Off)**: Cho phép chuyên gia chủ động bật/tắt công tắc sẵn sàng tiếp nhận yêu cầu tư vấn từ doanh nghiệp (`isAcceptingConsultation`), cập nhật trực tiếp vào hồ sơ chuyên gia trên máy chủ.
- **REQ-EXP-ACC-003 (Bảo mật, Active Sessions và Định danh Zalo cá nhân)**: Cung cấp giao diện quản lý phiên đăng nhập hiện hoạt đa thiết bị (Active Sessions) bảo vệ dữ liệu PDPD, kèm mã QR đồng bộ Zalo Mini App chuyên gia để tiếp nhận thông báo ZNS tức thời.

### Quy Tắc Nghiệp Vụ Bổ Sung (Spec Delta Business Rules)
- **BR-EXP-047 (Quyền truy cập Account Workspace bắt buộc RoleGuard `VERIFIED_EXPERT`)**: Chỉ tài khoản đã được thẩm định cấp Sở và mang vai trò `VERIFIED_EXPERT` mới được cấp quyền truy cập và thao tác tại `/portal/expert/account`. Mọi vai trò khác bị từ chối truy cập.
- **BR-EXP-048 (Đồng bộ trạng thái nhận tư vấn với bộ lọc Marketplace công khai)**: Khi chuyên gia tắt công tắc nhận tư vấn (`isAcceptingConsultation = false`), hồ sơ chuyên gia sẽ tự động bị loại khỏi danh sách lọc "Đang sẵn sàng nhận tư vấn" trên Marketplace công khai (`/experts`) và thuật toán Matching AI sẽ tạm ngừng đề xuất các bài toán tư vấn trực tiếp cho đến khi chuyên gia kích hoạt trở lại.

---

## Spec Delta v16 (PO-DEC-20261014-02): Chuẩn Hóa 6 Màn Hình Workspace Chuyên Gia, Hộp Thư Tư Vấn 3 Tab, Kanban Dự Án TRL 5 UX States & Scoped RBAC

**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định phê duyệt PO: `PO-DEC-20261014-02`.
- Tài liệu Thiết kế Cơ sở: [`Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md).
- Wireframe tham chiếu: [`Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_quan_ly_yeu_cau_tu_van_chuyen_gia.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_quan_ly_yeu_cau_tu_van_chuyen_gia.html).

### User Story 20 — Bàn Làm Việc Chuẩn Hóa 6 Màn Hình & Triệt Tiêu Xung Đột Active Menu (Priority: P1)
**User Persona**: Chuyên gia KH&CN (`EXPERT` / `VERIFIED_EXPERT`).  
**Mục tiêu**: Có thanh Sidebar điều hướng 6 màn hình chuyên biệt, không bị nhầm lẫn giữa yêu cầu tư vấn ngắn hạn và dự án hợp tác dài hạn, không bị xung đột active đồng thời 2 menu.

**Acceptance Scenarios**:
1. **Given** chuyên gia đăng nhập vào Portal, **When** quan sát Sidebar Workspace Chuyên gia, **Then** hệ thống hiển thị chính xác 6 mục chức năng:
   - Item 1: `Tài khoản Chuyên gia` (`/portal/expert/account`, icon `ShieldCheck`)
   - Item 2: `Tổng quan Chuyên gia` (`/portal/expert/profile` hoặc `/portal`, icon `LayoutDashboard`)
   - Item 3: `Hồ sơ LLKH của tôi` (`/portal/expert/profile/edit`, icon `GraduationCap`)
   - Item 4: `Hộp Thư Tư Vấn & Kết Nối` (`/portal/expert/consultations`, icon `Inbox` hoặc `ClipboardList`)
   - Item 5: `Radar Cơ hội Phù hợp (AI)` (`/portal/expert/radar` hoặc `/portal/matching/radar`, icon `Sparkles`)
   - Item 6: `Dự án Đồng hành & Hợp tác` (`/portal/expert/projects`, icon `Kanban`)
2. **Given** chuyên gia điều hướng tới `/portal/expert/consultations`, **When** kiểm tra thanh Sidebar, **Then** chỉ mục "Hộp Thư Tư Vấn & Kết Nối" sáng trạng thái active; mục "Dự án Đồng hành & Hợp tác" tuyệt đối không bị active nhầm.
3. **Given** chuyên gia điều hướng tới `/portal/expert/projects`, **When** kiểm tra thanh Sidebar, **Then** chỉ mục "Dự án Đồng hành & Hợp tác" sáng trạng thái active.

---

### User Story 21 — Quản Lý Hộp Thư Tư Vấn Doanh Nghiệp 3 Tab Nghiệp Vụ (Priority: P1)
**User Persona**: Chuyên gia KH&CN đã được xác thực (`VERIFIED_EXPERT`).  
**Mục tiêu**: Quản trị tập trung các yêu cầu tư vấn 1-1 từ doanh nghiệp và từ Sở KH&CN, phản hồi theo SLA 48h, tham gia phòng họp trực tuyến và ký nghiệm thu thù lao khoa học.

**Acceptance Scenarios**:
1. **Given** chuyên gia truy cập `/portal/expert/consultations`, **When** trang tải xong, **Then** hệ thống hiển thị thanh điều hướng 3 Tab kèm Badge đếm số lượng:
   - *Tab 1: Lời Mời Chờ Xử Lý*: Danh sách yêu cầu mới với đồng hồ đếm ngược SLA 48 giờ. Phân định rõ nguồn: `Sở KH&CN Chỉ Định Kết Nối 1-1` (thù lao Quỹ ĐMST chi trả) hoặc `Doanh Nghiệp Đặt Lịch Trực Tiếp Qua Portal` kèm Điểm Năng lực ĐMST (TNI).
   - *Tab 2: Lịch Hẹn Sắp Tới*: Danh sách các buổi tư vấn trực tuyến đã chốt lịch, kèm link Zoom/Meet, nút "Vào Phòng Họp" (kích hoạt trước giờ họp 15 phút) và tệp đính kèm pre-read.
   - *Tab 3: Lịch Sử Nghiệm Thu & Đánh Giá*: Danh sách các buổi tư vấn đã hoàn thành, biên bản tư vấn MoA 2 chiều, đánh giá 5 sao và trạng thái giải ngân thù lao (`ĐÃ QUYẾT TOÁN THÙ LAO` / `ĐANG ĐỐI SOÁT HỒ SƠ`).
2. **Given** một yêu cầu tư vấn ở Tab 1, **When** chuyên gia nhấn "Đồng ý tư vấn & Chọn lịch hẹn", **Then** hiển thị Modal chọn ngày giờ, phương thức họp (Zoom/Meet/Trực tiếp) và gửi yêu cầu `POST /api/v1/expert/consultations/{id}/accept`, chuyển đơn sang Tab 2.
3. **Given** chuyên gia không thể tiếp nhận yêu cầu, **When** nhấn "Từ chối & Nêu lý do", **Then** hiển thị Modal bắt buộc chọn lý do từ chối (Trùng lịch, Không đúng chuyên môn, Xung đột lợi ích...) và gọi `POST /api/v1/expert/consultations/{id}/reject`.

---

### User Story 22 — Quản Lý Dự Án Đồng Hành & Hợp Tác Dài Hạn Theo Chuẩn TRL (Priority: P1)
**User Persona**: Chuyên gia KH&CN (`VERIFIED_EXPERT`).  
**Mục tiêu**: Quản trị tiến trình các dự án R&D, chuyển giao công nghệ dài hạn trên giao diện Kanban 5 cột chuẩn TRL, bảo đảm không xuất hiện các chức năng sai thẩm quyền.

**Acceptance Scenarios**:
1. **Given** chuyên gia truy cập `/portal/expert/projects`, **When** trang tải xong, **Then** hệ thống hiển thị Bảng Kanban 5 cột theo quy trình chuẩn:
   - Cột 1: `Tiếp nhận & Ký NDA` (Intake & NDA Signing)
   - Cột 2: `Đàm phán Deal Room 1-1` (Technical Scoping & Deal Room)
   - Cột 3: `Thẩm định TRL & Lộ trình Tech` (TRL Assessment & Roadmap)
   - Cột 4: `Ký kết Thỏa thuận MOU` (MOU & Contract Finalized)
   - Cột 5: `Đồng hành Chuyển giao & Nghiệm thu` (Transfer & Milestones Completed)
2. **Given** màn hình `/portal/expert/projects`, **When** kiểm tra các nút hành động, **Then** tuyệt đối KHÔNG hiển thị nút "Giám sát Sở KH&CN". Thay vào đó là bộ lọc Lĩnh vực TT17, bộ lọc Thang đo TRL (TRL 1-3, TRL 4-6, TRL 7-9) và nút "Xuất Báo Cáo Tiến Độ Đồng Hành".
3. **Given** một cột Kanban không có dự án nào, **When** quan sát giao diện cột, **Then** tuyệt đối KHÔNG hiển thị chữ "Trống" thô sơ; cột phải hiển thị chuẩn Empty State với thông điệp hướng dẫn và nút CTA "Khám Phá Radar Cơ Hội AI" dẫn về `/portal/matching/radar`.
4. **Given** thẻ dự án trên cột Kanban, **When** hiển thị thông tin, **Then** bao gồm: Mã dự án `PRJ-EXP-YYYY-XXXX`, trạng thái NDA/MOU, Thang đo TRL kép (`[TRL Hiện tại] -> [TRL Mục tiêu]`), Tên doanh nghiệp đối tác, Dự toán kinh phí R&D, và hạn chót phản hồi mốc tiếp theo.

---

### User Story 23 — Scoped RBAC và Bảo Vệ Dữ Liệu Cá Nhân PDPD (Priority: P1)
**User Persona**: Chuyên gia đăng ký mới (`EXPERT`) vs Chuyên gia đã được phê duyệt cấp Sở (`VERIFIED_EXPERT`).  
**Mục tiêu**: Áp dụng phân quyền chặt chẽ theo vai trò và bảo vệ tuyệt đối danh tính khoa học theo Nghị định 13/2023/NĐ-CP.

**Acceptance Scenarios**:
1. **Given** tài khoản mang vai trò `EXPERT` (hồ sơ đang chờ duyệt cấp Sở), **When** truy cập `/portal/expert/consultations` hoặc `/portal/expert/projects`, **Then** hệ thống hiển thị giao diện thông báo trạng thái hồ sơ đang thẩm định, chưa cấp quyền mở hộp thư tiếp nhận tư vấn hoặc ký kết MOU.
2. **Given** tài khoản mang vai trò `VERIFIED_EXPERT`, **When** truy cập bất kỳ route nào trong 6 màn hình Workspace Chuyên gia, **Then** hệ thống cấp toàn quyền truy cập tác nghiệp.
3. **Given** doanh nghiệp duyệt danh bạ chuyên gia công khai, **When** xem thông tin chuyên gia, **Then** hệ thống che dấu hoàn toàn Số điện thoại cá nhân và Email cá nhân (PDPD PII Protection). Thông tin liên hệ chỉ được hiển thị khi chuyên gia đã chủ động chấp thuận yêu cầu tư vấn tại Tab 2.

---

### Yêu Cầu Nghiệp Vụ Bổ Sung (Spec Delta Requirements: REQ-EXP-UI-007 .. REQ-EXP-UI-010)

- **REQ-EXP-UI-007 (Chuẩn hóa 6 Màn hình & Thuật toán Active Menu độc lập)**:
  Thanh Sidebar Workspace Chuyên gia bắt buộc cấu hình 6 mục chức năng cố định với đường dẫn chuyên biệt. Áp dụng thuật toán `resolveExpertActiveMenu(pathname)` để phân giải chính xác active menu key (`account`, `profile`, `profile-edit`, `consultations`, `radar`, `projects`), bảo đảm ranh giới tuyệt đối độc lập giữa `/portal/expert/consultations` và `/portal/expert/projects`.
- **REQ-EXP-UI-008 (Hộp thư Tư vấn & Kết nối 3 Tab Nghiệp vụ)**:
  Cung cấp route chuyên trách `/portal/expert/consultations` chia thành 3 Tab: Tab 1 (Lời mời chờ xử lý với SLA đếm ngược 48h, modal chấp thuận/từ chối); Tab 2 (Lịch hẹn sắp tới với phòng họp Zoom/Meet mở trước 15 phút, tài liệu pre-read); Tab 3 (Lịch sử nghiệm thu biên bản MoA 2 chiều và tình trạng quyết toán thù lao).
- **REQ-EXP-UI-009 (Bảng Kanban Dự án Đồng hành TRL 1-9 & Loại bỏ Nút Giám sát Sở)**:
  Cung cấp route chuyên trách `/portal/expert/projects` tổ chức theo 5 cột tiến trình TRL (Tiếp nhận NDA -> Deal Room 1-1 -> Thẩm định TRL -> Ký MOU -> Đồng hành nghiệm thu). Loại bỏ hoàn toàn nút "Giám sát Sở KH&CN" khỏi giao diện chuyên gia; bổ sung bộ lọc TT17/TRL và nút xuất báo cáo tiến độ.
- **REQ-EXP-UI-010 (Chuẩn hóa 5 Trạng Thái UX States Cho Kanban & Hộp Thư)**:
  Triệt tiêu 100% chữ "Trống" thô thiển trên các cột Kanban và danh sách bảng. Áp dụng chuẩn Enterprise UX với đầy đủ 5 trạng thái: `Loading` (Skeleton Shimmer), `Ideal` (Thẻ Deal TRL / Card Lời mời), `Empty` (Minh họa nét đứt + CTA dẫn sang Radar AI), `Error` (Icon cảnh báo + Nút Retry), `Filtered Empty` (Kính lúp rỗng + Nút Reset bộ lọc).

---

### Quy Tắc Nghiệp Vụ Bổ Sung (Spec Delta Business Rules: BR-EXP-011 .. BR-EXP-014)

- **BR-EXP-011 (Quy tắc Quản lý Thời Gian Phản Hồi SLA 48h)**:
  Mỗi yêu cầu tư vấn gửi đến chuyên gia được kích hoạt đồng hồ đếm ngược 48 giờ kể từ `created_at`. Khi thời gian còn $\le 24$h, hiển thị cảnh báo đỏ (`text-red-600 bg-red-50`). Khi hết 48h mà chuyên gia chưa phản hồi, trạng thái đơn tự động chuyển thành `SLA_EXPIRED`, hệ thống điều phối lại cho Cán bộ Sở hoặc thông báo hoàn trả cho Doanh nghiệp, đồng thời ghi nhận vào chỉ số phản hồi của chuyên gia.
- **BR-EXP-012 (Phân loại Minh Bạch Nguồn Yêu Cầu Tư Vấn & Thù Lao)**:
  Phân biệt rõ 2 luồng yêu cầu tư vấn:
  1. *Chỉ định Cấp Sở KH&CN*: Huy hiệu khiên bảo hộ màu xanh lam, thù lao được Quỹ ĐMST / Ngân sách Nhà nước bảo trợ chi trả;
  2. *Doanh nghiệp Đặt Trực Tiếp*: Huy hiệu màu xanh ngọc kèm Điểm Năng lực ĐMST (TNI), thù lao thỏa thuận hoặc chi trả theo biểu phí công bố của chuyên gia.
- **BR-EXP-013 (Triệt Tiêu Nút Giám Sát Nhà Nước Khỏi Workspace Chuyên Gia)**:
  Tuyệt đối không hiển thị nút hoặc chức năng "Giám sát Sở KH&CN" trên bàn làm việc của Chuyên gia (`/portal/expert/*`). Thẩm quyền giám sát thị trường và thanh tra thuộc độc quyền của Cán bộ Quản trị Nhà nước trên Cổng Quản lý Nhà nước (`TASK-07` / GOV Portal).
- **BR-EXP-014 (Scoped RBAC & Bảo Mật Dữ Liệu PDPD NĐ 13/2023)**:
  - Tài khoản mang role `EXPERT` (đang chờ duyệt cấp Sở) chỉ được phép xem thông tin tổng quan và chỉnh sửa bổ sung hồ sơ LLKH.
  - Chỉ tài khoản được cấp role `VERIFIED_EXPERT` mới được cấp quyền tiếp nhận lời mời tư vấn (`/portal/expert/consultations`), vào phòng đàm phán Deal Room 1-1 và ký kết MOU (`/portal/expert/projects`).
  - Dữ liệu PII (SĐT, Email cá nhân) của chuyên gia được che giấu toàn diện trên toàn hệ thống công khai; chỉ mở khi chuyên gia đã chấp thuận phiên tư vấn.





---

## Spec Delta v17 (PO-DEC-20261016-03): Tối Ưu Hóa UI/UX Danh Bạ Chuyên Gia & Bộ Lọc Đa Tiêu Chí [CR-2026-016]

**Căn cứ pháp lý & Quyết định Sản phẩm**:
- **Quyết định phê duyệt PO**: `PO-DEC-20261016-03` ngày 16/10/2026 về tinh gọn và tối ưu hóa trải nghiệm người dùng Danh bạ Chuyên gia KH&CN (`/experts` và `/chuyen-gia`).
- **Nguồn dữ liệu & Tài liệu liên quan**:
  + Basic Design v2.7 [`wireframe_danh_ba_chuyen_gia.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_danh_ba_chuyen_gia.html).
  + Danh mục 34 Sở KH&CN trọng điểm 3 miền tại `GovernanceControllers.cs` (`KeyProvinces34`).
  + Dữ liệu thực nghiệm chuyên gia và nhóm công nghệ tại `cleanup_and_seed_real_market_data.sql`.

---

### 17.1. Bối Cảnh & Quyết Định Sản Phẩm (PO Decisions & UX Insights)

Từ kết quả rà soát thực tế và phản hồi của người dùng (Doanh nghiệp tìm chuyên gia và Nhà khoa học):
1. **Thẻ Chuyên gia (Expert Card) [CONFIRMED]**: Hiện tại thẻ chuyên gia đang render các chuỗi mã kỹ thuật thô như `TECH-SUPERCRITICAL-CO2`, `TECH-CNC-5AXIS`... dạng font monospace gây cảm giác khô cứng, khó hiểu đối với doanh nghiệp và nhà quản trị. Quyết định PO: Thay thế mã thô bằng nhãn hiển thị thân thiện, rõ nghĩa tiếng Việt (Friendly Technology Labels), dùng font chữ giao diện mềm mại, trang nhã.
2. **Khối Chỉ Số Thành Tựu Khoa Học [CONFIRMED]**: Hiện tại thẻ chuyên gia hiển thị cố định 3 ô vuông đếm số: Công bố, Sáng chế, Đề tài KH kể cả khi mang giá trị 0. Quyết định PO: Áp dụng triết lý *"Cái gì đẹp show ra, không có thì ẩn đi"*. Chỉ số nào có giá trị $> 0$ thì hiển thị dạng Badge/Chip thành tựu nổi bật; chỉ số $= 0$ phải ẩn đi. Nếu chuyên gia chưa có chỉ số nào $> 0$, ẩn hoàn toàn toàn bộ khối thống kê, tuyệt đối không để 3 ô số 0 trống rỗng làm giảm uy tín của chuyên gia.
3. **Bộ Lọc Chuyên Sâu (Sidebar Filter) [CONFIRMED]**: Hiện tại Học vị và Lĩnh vực đang sử dụng nút Radio (đơn chọn), gây cản trở khi người dùng muốn tìm kiếm chuyên gia đa ngành hoặc nhiều học vị (ví dụ: vừa chọn GS vừa chọn PGS). Quyết định PO: Chuyển đổi toàn diện sang Checkbox (đa chọn - multi-select). Quy định rõ thuật toán kết hợp điều kiện: Trong cùng một tiêu chí (nhiều học vị hoặc nhiều ngành) áp dụng toán tử logic **OR**; giữa các tiêu chí khác nhau áp dụng toán tử logic **AND**.
4. **Địa Bàn Sở KH&CN [CONFIRMED]**: Dropdown địa bàn hiện tại chứa quá nhiều tỉnh thành (danh sách 63 tỉnh), nhiều tỉnh chưa có dữ liệu tham gia dẫn đến kết quả lọc bị rỗng. Quyết định PO: Quy hoạch và chuẩn hóa dropdown về đúng danh sách 34 Tỉnh/Thành phố trọng điểm thuộc phạm vi quản trị/liên thông của dự án NacenTech (phân theo 3 miền Bắc - Trung - Nam), loại bỏ sự dàn trải ngoài phạm vi.

---

### 17.2. User Stories & Acceptance Scenarios (Gherkin Format)

#### User Story 24 — Trải Nghiệm Thẻ Chuyên Gia Thân Thiện & Nhãn Công Nghệ Trực Quan (Priority: P1)
**User Persona**: Doanh nghiệp ĐMST (Buyer) hoặc Khách vãng lai truy cập Danh bạ Chuyên gia.  
**Mục tiêu**: Nhanh chóng nhận diện năng lực chuyên môn và công nghệ làm chủ của chuyên gia bằng ngôn ngữ thân thiện, dễ hiểu; nắm bắt ngay các thành tựu nổi bật mà không bị phân tâm bởi các số liệu 0 trống rỗng.

**Acceptance Scenarios**:
1. **Given** người dùng duyệt danh sách chuyên gia tại `/experts`, **When** quan sát từng Thẻ chuyên gia (Expert Card), **Then** hệ thống hiển thị nhãn công nghệ làm chủ bằng tiếng Việt rõ nghĩa (Ví dụ: `Chiết xuất CO2 siêu tới hạn`, `Gia công CNC 5 trục`, `Thị giác máy tính AI`, `Điện toán biên`...) thay vì hiển thị các mã định danh kỹ thuật thô (`TECH-...`) font monospace.
2. **Given** chuyên gia có thành tựu khoa học đã được kiểm chứng (Công bố $> 0$, Sáng chế $> 0$ hoặc Đề tài KH $> 0$), **When** hiển thị khối thành tựu trên thẻ, **Then** hệ thống hiển thị các huy hiệu/chip nổi bật (Ví dụ: `140+ Công bố quốc tế`, `8 Bằng sáng chế`, `5 Đề tài KH`), ẩn đi bất kỳ chỉ số nào có giá trị $= 0$.
3. **Given** chuyên gia là nhà tư vấn thực chiến chưa có công bố hay sáng chế ($\text{publicationCount} = 0$, $\text{patentCount} = 0$, $\text{projectCount} = 0$), **When** hiển thị thẻ chuyên gia, **Then** hệ thống ẩn hoàn toàn toàn bộ khối thống kê chỉ số, không hiển thị 3 ô số 0 xám trống rỗng; bố cục thẻ tự động co giãn hài hòa, liền mạch.
4. **Given** dữ liệu công nghệ chứa một mã mới chưa có trong từ điển nhãn Master Data, **When** render thẻ, **Then** hệ thống kích hoạt cơ chế chuẩn hóa nhãn dự phòng (Fallback Resolver): loại bỏ tiền tố `TECH-`, thay thế dấu gạch ngang bằng khoảng trắng và viết hoa đầu từ (Title Case), bảo đảm không bao giờ để lộ chuỗi mã lỗi thời dạng debug.

---

#### User Story 25 — Lọc Đa Tiêu Chí Độc Lập Với Checkbox & Phối Hợp Logic OR / AND (Priority: P1)
**User Persona**: Doanh nghiệp hoặc Viện/Trường cần tìm kiếm tổ hợp chuyên gia phù hợp với bài toán phức hợp.  
**Mục tiêu**: Có thể tích chọn nhiều học vị và nhiều lĩnh vực chuyên môn cùng lúc, nhận kết quả tìm kiếm chính xác theo cơ chế logic OR nội bộ và AND liên tiêu chí.

**Acceptance Scenarios**:
1. **Given** người dùng mở Sidebar Bộ Lọc Chuyên Sâu, **When** quan sát mục "Học hàm & Học vị" và "Lĩnh vực chuyên môn", **Then** hệ thống hiển thị dưới dạng Checkbox (đa chọn), cho phép tích chọn nhiều ô đồng thời.
2. **Given** người dùng tích chọn đồng thời `Giáo sư (GS)` và `Phó Giáo sư (PGS)`, **When** áp dụng bộ lọc, **Then** hệ thống trả về tất cả chuyên gia có học hàm/học vị là GS **HOẶC** PGS (Toán tử OR nội bộ).
3. **Given** người dùng tích chọn đồng thời `Nông nghiệp công nghệ cao (LV01)` và `Công nghệ chế biến & Dược liệu (LV05)`, **When** áp dụng bộ lọc, **Then** hệ thống trả về các chuyên gia có năng lực thuộc ngành LV01 **HOẶC** LV05 (Toán tử OR nội bộ).
4. **Given** người dùng kết hợp nhiều tiêu chí: Chọn Học vị = [GS, PGS] AND Chọn Lĩnh vực = [LV01] AND Chọn Địa bàn = [Hà Nội] AND Tích "Sẵn sàng nhận tư vấn", **When** áp dụng bộ lọc, **Then** hệ thống trả về danh sách chuyên gia thỏa mãn **ĐỒNG THỜI** tất cả các nhóm tiêu chí trên (Toán tử AND liên tiêu chí).
5. **Given** người dùng đã chọn nhiều tiêu chí lọc, **When** quan sát khu vực phía trên lưới kết quả, **Then** hệ thống hiển thị danh sách các Thẻ tiêu chí đang chọn (Filter Chips), cho phép bấm dấu `×` trên từng chip để gỡ bỏ tiêu chí đơn lẻ hoặc bấm [Đặt lại bộ lọc] để xóa toàn bộ về mặc định.

---

#### User Story 26 — Thu Hẹp & Chuẩn Hóa Địa Bàn Về Các Sở KH&CN Trọng Điểm NacenTech (Priority: P1)
**User Persona**: Doanh nghiệp hoặc Cán bộ quản lý cần tìm chuyên gia theo phạm vi địa phương.  
**Mục tiêu**: Tra cứu chuyên gia gắn với địa bàn Sở KH&CN tham gia chính thức vào mạng lưới NacenTech, tránh việc chọn các tỉnh không có dữ liệu thực tế.

**Acceptance Scenarios**:
1. **Given** người dùng mở dropdown "Địa bàn Tỉnh / Thành phố", **When** quan sát danh sách tùy chọn, **Then** hệ thống hiển thị danh mục chuẩn hóa 34 Sở KH&CN trọng điểm được phân nhóm rõ ràng theo 3 miền:
   - *Miền Bắc (12 Tỉnh/TP)*: Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, Vĩnh Phúc, Thái Nguyên, Hải Dương, Hưng Yên, Nam Định, Phú Thọ, Ninh Bình, Bắc Giang.
   - *Miền Trung & Tây Nguyên (10 Tỉnh/TP)*: Đà Nẵng, Thanh Hóa, Nghệ An, Thừa Thiên Huế, Quảng Nam, Quảng Ngãi, Bình Định, Khánh Hòa, Đắk Lắk, Lâm Đồng.
   - *Miền Nam (12 Tỉnh/TP)*: TP. Hồ Chí Minh, Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Cần Thơ, Long An, Tiền Giang, An Giang, Đồng Tháp, Kiên Giang, Tây Ninh, Cà Mau.
2. **Given** người dùng chọn địa bàn `Sở KH&CN TP. Hà Nội (HN)`, **When** bộ lọc thực thi, **Then** hệ thống lọc chính xác các chuyên gia có hồ sơ được Sở KH&CN Hà Nội thẩm định và phân quyền (`ScopeType = PROVINCE`, `ScopeId = HN`).

---

### 17.3. Yêu Cầu Chức Năng Bổ Sung (Spec Delta Functional Requirements)

- **`REQ-EXP-DIR-TECH-LABEL` (Hiển thị nhãn công nghệ thân thiện rõ nghĩa tiếng Việt)** [CONFIRMED]:
  + Hệ thống hiển thị tên công nghệ làm chủ rõ nghĩa thay cho mã định danh kỹ thuật thô (`TECH-...`).
  + Frontend và Backend áp dụng bộ giải mã nhãn công nghệ (Technology Label Resolver) ánh xạ từ mã định danh chuẩn sang nhãn tiếng Việt hiển thị theo Master Data:
    * `TECH-SUPERCRITICAL-CO2` $\rightarrow$ *"Chiết xuất CO2 siêu tới hạn"*
    * `TECH-NANO-EXTRACTION` $\rightarrow$ *"Chiết xuất công nghệ Nano"*
    * `TECH-BIOACTIVE-COMPOUNDS` $\rightarrow$ *"Phân lập hoạt chất sinh học"*
    * `TECH-AI-VISION` $\rightarrow$ *"Thị giác máy tính AI"*
    * `TECH-EDGE-COMPUTING` $\rightarrow$ *"Điện toán biên (Edge Computing)"*
    * `TECH-SMART-FACTORY` $\rightarrow$ *"Nhà máy thông minh (Smart Factory)"*
    * `TECH-CNC-5AXIS` $\rightarrow$ *"Gia công CNC 5 trục"*
    * `TECH-INDUSTRIAL-ROBOT` $\rightarrow$ *"Robot công nghiệp"*
    * `TECH-PRESSURE-DIE-CASTING` $\rightarrow$ *"Đúc áp lực cao"*
    * `TECH-ASIC-DESIGN` $\rightarrow$ *"Thiết kế vi mạch ASIC"*
    * `TECH-FPGA-ACCEL` $\rightarrow$ *"Tăng tốc phần cứng FPGA"*
    * `TECH-IOT-GATEWAY` $\rightarrow$ *"Cổng kết nối IoT Gateway"*
    * `TECH-POSTHARVEST-PRESERVATION` $\rightarrow$ *"Bảo quản sau thu hoạch"*
    * `TECH-BIO-COATING` $\rightarrow$ *"Màng bao sinh học"*
    * `TECH-COLD-PLASMA` $\rightarrow$ *"Công nghệ Plasma lạnh"*
    * `TECH-GRAPHENE-NANO` $\rightarrow$ *"Vật liệu Nano Graphene"*
    * `TECH-ANTI-CORROSION` $\rightarrow$ *"Sơn phủ chống ăn mòn"*
    * `TECH-RECYCLED-COMPOSITE` $\rightarrow$ *"Vật liệu Composite tái chế"*
  + Triệt tiêu hoàn toàn font chữ `font-mono` kỹ thuật trên thẻ chuyên gia; sử dụng font giao diện chuẩn `font-sans` với kiểu dáng tag mềm mại, màu sắc nhã nhặn.
  + Cung cấp cơ chế fallback thông minh: nếu gặp mã chưa được định nghĩa trong từ điển, tự động chuẩn hóa nhãn bằng cách loại bỏ tiền tố `TECH-` và chuyển sang Title Case.

- **`REQ-EXP-DIR-STATS-DISPLAY` (Khối chỉ số thành tựu thông minh — Ẩn giá trị 0)** [CONFIRMED]:
  + Khối thống kê thành tựu trên thẻ chuyên gia chỉ hiển thị các chỉ số có giá trị $> 0$ (`publicationCount > 0`, `patentCount > 0`, `projectCount > 0`).
  + Các chỉ số $> 0$ được hiển thị dưới dạng Badge/Chip thành tựu nổi bật kèm icon nhận diện chuyên ngành:
    * Công bố khoa học: `N+ Công bố` (hoặc `N Bài báo ISI/Scopus`)
    * Sáng chế / GPHI: `N Sáng chế`
    * Đề tài KH&CN: `N Đề tài KH`
  + Bất kỳ chỉ số nào mang giá trị $\le 0$ đều bị ẩn hoàn toàn, không render ô số 0.
  + Trường hợp chuyên gia chưa có bất kỳ chỉ số nào $> 0$ ($\sum = 0$), hệ thống ẩn hoàn toàn toàn bộ khối chỉ số thành tựu, không để lại khoảng trống layout bất thường.

- **`REQ-EXP-DIR-MULTI-SELECT` (Bộ lọc Checkbox đa chọn Học vị & Lĩnh vực)** [CONFIRMED]:
  + Thay thế bộ chọn đơn dạng Radio button thành Checkbox đa chọn (multi-select) cho hai trục: "Học hàm & Học vị" và "Lĩnh vực chuyên môn".
  + Cho phép người dùng chọn không giới hạn số lượng mục trong mỗi nhóm tiêu chí.
  + Hỗ trợ bộ lọc nhanh (Search filter) trong danh sách Lĩnh vực chuyên môn khi số lượng mục lớn; hiển thị số lượng tiêu chí đang được chọn trên tiêu đề nhóm lọc.
  + Đồng bộ hóa trạng thái tiêu chí đã chọn lên thanh Active Filter Chips và URL Query Parameters để hỗ trợ chia sẻ đường dẫn tìm kiếm hoặc tải lại trang không mất bộ lọc.

- **`REQ-EXP-DIR-PROVINCE-SCOPE` (Chuẩn hóa danh mục địa bàn Sở KH&CN trọng điểm)** [CONFIRMED]:
  + Thu hẹp danh mục địa bàn Tỉnh/Thành phố về đúng 34 Tỉnh/Thành phố trọng điểm theo quy hoạch của dự án NacenTech (`KeyProvinces34`), phân chia theo 3 nhóm vùng địa lý: Miền Bắc (12 Tỉnh/TP), Miền Trung & Tây Nguyên (10 Tỉnh/TP), Miền Nam (12 Tỉnh/TP).
  + Nguồn dữ liệu danh mục lấy trực tiếp từ API hệ thống `GET /api/v1/governance/org-units/public-provinces`.
  + Loại bỏ danh sách 63 tỉnh thành dàn trải ngoài phạm vi nhằm bảo đảm mọi tùy chọn địa bàn đều gắn liền với đơn vị quản trị Nhà nước cấp Sở đã liên thông trong hệ thống.

---

### 17.4. Quy Tắc Nghiệp Vụ Bổ Sung (Spec Delta Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Điều Kiện Kích Hoạt & Logic Xử Lý | Mã Lỗi / Phản Ứng |
| :--- | :--- | :--- | :--- |
| **`BR-EXP-DIR-MULTI-FILTER`** | **Logic Phối Hợp Bộ Lọc Đa Tiêu Chí (OR nội bộ, AND liên nhóm)** | - **Nội bộ cùng nhóm tiêu chí (Intra-criteria)**: Áp dụng điều kiện **OR**. Chuyên gia được giữ lại nếu thỏa mãn ít nhất một giá trị được chọn trong mảng (Ví dụ: `Degree ∈ selectedDegrees` hoặc `ExpertiseSectors ∩ selectedSectors ≠ ∅`).<br>- **Liên nhóm tiêu chí (Inter-criteria)**: Áp dụng điều kiện **AND**. Chuyên gia chỉ xuất hiện trong kết quả khi thỏa mãn đồng thời tất cả các nhóm tiêu chí có kích hoạt: `(Degrees OR) AND (Sectors OR) AND (Province) AND (AcceptingConsultation) AND (SearchKeyword)`.<br>- **Tương thích API**: `GET /api/v1/public/experts` hỗ trợ nhận query parameter mảng hoặc chuỗi phân tách dấu phẩy: `degrees=GS,PGS` (hoặc lặp `degree=GS&degree=PGS`) và `sectorCodes=LV01,LV05` (hoặc lặp `sectorCode=LV01&sectorCode=LV05`). Vẫn tương thích ngược với tham số đơn trị cũ. | Trả kết quả rỗng (Empty State) nếu không có bản ghi nào thỏa mãn điều kiện AND |
| **`BR-EXP-DIR-HIDE-ZERO-METRICS`** | **Ẩn Toàn Bộ Chỉ Số Số Liệu Bằng 0 ("Cái gì đẹp show ra, không có thì ẩn đi")** | - Chỉ số thành tựu `publicationCount`, `patentCount`, `projectCount` chỉ được render khi giá trị $> 0$.<br>- Mọi giá trị $\le 0$ bị loại trừ khỏi DOM hiển thị.<br>- Khi cả 3 chỉ số đều $= 0$, khối container thống kê bị ẩn hoàn toàn (`display: none` hoặc không render component). Tuyệt đối không hiển thị ô đếm có giá trị "0". | Ẩn phần tử giao diện tự động |
| **`BR-EXP-DIR-PROVINCE-GOV-SCOPE`** | **Phạm Vi Thẩm Quyền Địa Bàn Trọng Điểm NacenTech** | - Lọc địa bàn chỉ áp dụng trên mã Tỉnh/Thành phố thuộc danh mục 34 Sở KH&CN trọng điểm (`KeyProvinces34`).<br>- Hồ sơ chuyên gia được xác định địa bàn thông qua liên kết tài khoản đã phê duyệt (`ScopeType = 'PROVINCE'` và `ScopeId = provinceCode`).<br>- Hồ sơ không có liên kết địa bàn hoặc có địa bàn ngoài danh mục 34 tỉnh sẽ không xuất hiện khi người dùng kích hoạt bộ lọc theo tỉnh cụ thể; hồ sơ này vẫn hiển thị đầy đủ khi chọn "Tất cả địa bàn". | Loại trừ bản ghi không khớp scope |

---

### 17.5. Đặc Tả Giao Diện & Trạng Thái UX (UI/UX Specifications)

#### `UI-EXP-DIR-CARD-POLISH` — Tinh Chỉnh Thẻ Chuyên Gia Doanh Nghiệp (Expert Card Polish) [CONFIRMED]
1. **Cấu trúc Thẻ Chuyên Gia (3 tầng)**:
   - **Tầng 1 (Định danh & Thẩm quyền)**:
     * Avatar chuyên gia với chữ cái đầu viết tắt trên nền gradient nhận diện thương hiệu NacenTech (`bg-brand-700`).
     * Huy hiệu xác thực tích xanh cấp Sở (`ShieldCheck`) gắn góc avatar cho chuyên gia đã được duyệt.
     * Huy hiệu Học hàm & Học vị: Phân màu trực quan theo cấp bậc (GS: Viền tím đậm/Nền tím nhạt; PGS: Viền xanh navy/Nền xanh nhạt; TS: Viền xanh ngọc/Nền xanh ngọc nhạt).
     * Huy hiệu Đã xác thực cấp Sở: Nền xanh lá nhạt (`bg-emerald-50 text-emerald-800 border-emerald-200`) với biểu tượng `ShieldCheck`.
     * Họ tên chuyên gia: Font bold, cỡ chữ tiêu đề card, giới hạn tối đa 2 dòng kèm tooltip họ tên đầy đủ, hiệu ứng hover đổi màu thương hiệu.
     * Cơ quan công tác: Icon `Building2`, chữ xám nhạt, cắt ngắn (truncate) khi quá dài kèm tooltip.
   - **Tầng 2 (Lĩnh vực & Công nghệ làm chủ)**:
     * Ngành chuyên môn chính: Badge bo góc nhẹ, màu nền thương hiệu dịu (`bg-brand-50 text-brand-800 border border-brand-200`).
     * Danh mục Công nghệ làm chủ:
       - Hiển thị tối đa 2 nhãn công nghệ thân thiện bằng tiếng Việt (font chữ sans-serif thường, nền `bg-slate-100 text-slate-700 border border-slate-200`).
       - Tuyệt đối KHÔNG sử dụng font `font-mono` kỹ thuật hoặc hiển thị mã thô dạng `TECH-SUPERCRITICAL-CO2`.
       - Nếu có từ 3 công nghệ trở lên, hiển thị badge đếm `+N` công nghệ để người dùng click mở xem thêm.
   - **Tầng 3 (Khối Thành tựu Nổi bật & Hành động)**:
     * Khối Thành tựu Nổi bật (Conditional Rendering):
       - Chỉ hiển thị khi $\sum(\text{publicationCount}, \text{patentCount}, \text{projectCount}) > 0$.
       - Bố cục flex wrap gồm các Chip thành tựu viền bo tròn nhẹ:
         + `N+ Công bố quốc tế` (Nền xanh lam nhạt, chữ xanh lam đậm)
         + `N Bằng sáng chế` (Nền hổ phách/cam nhạt, chữ hổ phách đậm)
         + `N Đề tài KH` (Nền xanh ngọc nhạt, chữ xanh ngọc đậm)
       - Nếu cả 3 chỉ số đều $= 0$: Ẩn hoàn toàn khối này, không để khoảng trống thừa.
     * Nút Hành động (CTA Footer):
       - Nút chính: `[Xem hồ sơ chi tiết]` (Full-width hoặc 75% chiều rộng, style Secondary Brand, dẫn sang `/experts/[expertCode]`).
       - Nút phụ: `[Kết nối]` (Icon `MessageSquarePlus`, mở modal gửi yêu cầu hợp tác công nghệ 1-1).

#### `UI-EXP-DIR-FILTER-CHECKBOX` — Thanh Bộ Lọc Chuyên Sâu Đa Tiêu Chí (Sidebar Filter Polish) [CONFIRMED]
1. **Thiết kế Bộ Lọc 4 Trục**:
   - **Trục 1 (Học hàm & Học vị)**: Nhóm Checkbox đa chọn gồm 4 tùy chọn chuẩn:
     * `[ ] Giáo sư (GS)`
     * `[ ] Phó Giáo sư (PGS)`
     * `[ ] Tiến sĩ (TS / TSKH)`
     * `[ ] Thạc sĩ / Kỹ sư chính`
     * Hiển thị số lượng học vị đang được chọn cạnh tiêu đề nhóm: `Học hàm & Học vị (2)`.
   - **Trục 2 (Lĩnh vực chuyên môn)**: Nhóm Checkbox đa chọn đọc từ taxonomy active (`GET /api/v1/sectors`):
     * Ô tìm kiếm nhanh với biểu tượng kính lúp để lọc danh sách khi có nhiều ngành nghề.
     * Khung cuộn tối đa chiều cao `max-h-52` với scrollbar thanh mảnh.
     * Mỗi mục là 1 checkbox kèm tên ngành đầy đủ, tự động xuống dòng khi tên dài.
     * Hiển thị badge số lượng ngành đang chọn: `Lĩnh vực chuyên môn (3)`.
   - **Trục 3 (Địa bàn Tỉnh / Thành phố)**: Dropdown chuẩn hóa phân nhóm theo 3 miền với `<optgroup>`:
     * `Tất cả địa bàn`
     * `[Optgroup: Miền Bắc (12 Tỉnh/TP)]`: Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, Vĩnh Phúc, Thái Nguyên, Hải Dương, Hưng Yên, Nam Định, Phú Thọ, Ninh Bình, Bắc Giang.
     * `[Optgroup: Miền Trung & Tây Nguyên (10 Tỉnh/TP)]`: Đà Nẵng, Thanh Hóa, Nghệ An, Thừa Thiên Huế, Quảng Nam, Quảng Ngãi, Bình Định, Khánh Hòa, Đắk Lắk, Lâm Đồng.
     * `[Optgroup: Miền Nam (12 Tỉnh/TP)]`: TP. Hồ Chí Minh, Bình Dương, Đồng Nai, Bà Rịa - Vũng Tàu, Cần Thơ, Long An, Tiền Giang, An Giang, Đồng Tháp, Kiên Giang, Tây Ninh, Cà Mau.
   - **Trục 4 (Trạng thái chuyên gia)**:
     * Checkbox: `[ ] Sẵn sàng tiếp nhận tư vấn` (Lọc chuyên gia có `isAcceptingConsultation = true`).
2. **Khu Vực Thẻ Tiêu Chí Đang Chọn (Active Filter Chips)**:
   - Nằm ngay dưới thanh thông tin số lượng kết quả tìm thấy.
   - Tự động sinh ra các Chip tròn bo góc đại diện cho từng tiêu chí được chọn:
     * Chip từ khóa: `Tìm kiếm: "nano" ×`
     * Chip học vị: `Học vị: GS ×`, `Học vị: PGS ×`
     * Chip ngành: `Ngành: Tự động hóa ×`
     * Chip địa bàn: `Địa bàn: TP. Hà Nội ×`
     * Chip tư vấn: `Sẵn sàng nhận tư vấn ×`
   - Bấm vào `×` để gỡ bỏ riêng tiêu chí đó và tự động làm mới kết quả.
   - Nút `[Đặt lại bộ lọc]` trên đầu Sidebar và cạnh danh sách Chips để xóa sạch mọi tiêu chí về mặc định chỉ với 1 cú click.
3. **Bao Phủ Trọn Vẹn 5 Trạng Thái UX (Enterprise 5 UX States)**:
   - **Loading**: Hiển thị lưới 6 Skeleton Cards hiệu ứng Shimmer mượt mà, giữ nguyên khung Sidebar không giật lag.
   - **Success (Ideal)**: Lưới thẻ chuyên gia 3 cột (Desktop) / 2 cột (Tablet) / 1 cột (Mobile) với đầy đủ thông tin trực quan.
   - **Empty State**: Khi không có chuyên gia thỏa mãn bộ lọc, hiển thị hình minh họa nét đứt, thông điệp *"Không tìm thấy chuyên gia phù hợp với tiêu chí lọc"*, kèm gợi ý nới lỏng bộ lọc và nút CTA lớn `[Đặt lại bộ lọc]`.
   - **Error State**: Khi mất kết nối API, hiển thị biểu tượng cảnh báo màu đỏ, thông báo lỗi trung thực và nút `[Thử lại]`.
   - **Updating Transition**: Khi người dùng thay đổi checkbox, hiển thị trạng thái mờ nhẹ (opacity 0.7) trong tích tắc trước khi nạp dữ liệu mới, không gây giật cuộn trang.

---

### 17.6. Bảng Ánh Xạ Nhãn Công Nghệ Chuẩn Hóa (Technology Label Dictionary) [VERIFIED]

| Mã Kỹ Thuật Gốc (`techCode`) | Nhãn Hiển Thị Thân Thiện Tiếng Việt (`techLabel`) | Lĩnh Vực Liên Quan (TT17) |
| :--- | :--- | :--- |
| `TECH-SUPERCRITICAL-CO2` | Chiết xuất CO2 siêu tới hạn | Hóa học & Dược phẩm (LV05) |
| `TECH-NANO-EXTRACTION` | Chiết xuất công nghệ Nano | Hóa học & Dược liệu (LV05) |
| `TECH-BIOACTIVE-COMPOUNDS` | Phân lập hoạt chất sinh học | Công nghệ sinh học & Dược (LV01/LV05) |
| `TECH-AI-VISION` | Thị giác máy tính AI | Công nghệ thông tin & Tự động hóa (LV16) |
| `TECH-EDGE-COMPUTING` | Điện toán biên (Edge Computing) | Công nghệ thông tin (LV16) |
| `TECH-SMART-FACTORY` | Nhà máy thông minh (Smart Factory) | Cơ khí & Tự động hóa (LV07/LV08) |
| `TECH-CNC-5AXIS` | Gia công CNC 5 trục | Cơ khí chế tạo chính xác (LV07) |
| `TECH-INDUSTRIAL-ROBOT` | Robot công nghiệp | Cơ khí & Tự động hóa (LV07) |
| `TECH-PRESSURE-DIE-CASTING` | Đúc áp lực cao | Luyện kim & Đúc kim loại (LV14) |
| `TECH-ASIC-DESIGN` | Thiết kế vi mạch ASIC | Điện tử & Bán dẫn (LV08) |
| `TECH-FPGA-ACCEL` | Tăng tốc phần cứng FPGA | Điện tử & Vi điện tử (LV08) |
| `TECH-IOT-GATEWAY` | Cổng kết nối IoT Gateway | Viễn thông & IoT (LV16) |
| `TECH-POSTHARVEST-PRESERVATION` | Bảo quản sau thu hoạch | Nông nghiệp CNC & Thực phẩm (LV01/LV11) |
| `TECH-BIO-COATING` | Màng bao sinh học | Công nghệ thực phẩm (LV11) |
| `TECH-COLD-PLASMA` | Công nghệ Plasma lạnh | Chế biến nông sản & Dược (LV01) |
| `TECH-GRAPHENE-NANO` | Vật liệu Nano Graphene | Vật liệu mới & Nanotech (LV12) |
| `TECH-ANTI-CORROSION` | Sơn phủ chống ăn mòn | Vật liệu mới & Hóa chất (LV12) |
| `TECH-RECYCLED-COMPOSITE` | Vật liệu Composite tái chế | Vật liệu mới & Môi trường (LV12/LV17) |

*Ghi chú*: Trường hợp hệ thống ghi nhận mã mới ngoài bảng tra cứu trên, thuật toán tự động chuẩn hóa: bỏ tiền tố `TECH-`, chuyển sang Title Case để hiển thị thân thiện với người dùng.

---

### 17.7. Danh Sách 34 Sở KH&CN Trọng Điểm Quy Hoạch NacenTech [VERIFIED]

| Vùng Địa Lý | Số Lượng | Danh Sách Tỉnh / Thành Phố (Mã - Tên Đơn Vị) |
| :--- | :--- | :--- |
| **Miền Bắc** | 12 | `HN` - TP. Hà Nội, `HP` - TP. Hải Phòng, `QN` - Tỉnh Quảng Ninh, `BN` - Tỉnh Bắc Ninh, `VP` - Tỉnh Vĩnh Phúc, `TN` - Tỉnh Thái Nguyên, `HD` - Tỉnh Hải Dương, `HY` - Tỉnh Hưng Yên, `ND` - Tỉnh Nam Định, `PT` - Tỉnh Phú Thọ, `NB` - Tỉnh Ninh Bình, `BG` - Tỉnh Bắc Giang |
| **Miền Trung & Tây Nguyên** | 10 | `DN` - TP. Đà Nẵng, `TH` - Tỉnh Thanh Hóa, `NA` - Tỉnh Nghệ An, `TTH` - Tỉnh Thừa Thiên Huế, `QNA` - Tỉnh Quảng Nam, `QNG` - Tỉnh Quảng Ngãi, `BD` - Tỉnh Bình Định, `KH` - Tỉnh Khánh Hòa, `DL` - Tỉnh Đắk Lắk, `LD` - Tỉnh Lâm Đồng |
| **Miền Nam** | 12 | `SG` - TP. Hồ Chí Minh, `BDG` - Tỉnh Bình Dương, `DNA` - Tỉnh Đồng Nai, `BRVT` - Tỉnh Bà Rịa - Vũng Tàu, `CT` - TP. Cần Thơ, `LA` - Tỉnh Long An, `TG` - Tỉnh Tiền Giang, `AG` - Tỉnh An Giang, `DT` - Tỉnh Đồng Tháp, `KG` - Tỉnh Kiên Giang, `TNH` - Tỉnh Tây Ninh, `CM` - Tỉnh Cà Mau |

---

### 17.8. Ma Trận Truy Vết Nghiệp Vụ (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-DIR-TECH-LABEL`** | Functional Req | Hiển thị Nhãn Công Nghệ Thân Thiện | Chuyển đổi mã kỹ thuật thô (`TECH-...`) sang nhãn tiếng Việt rõ nghĩa; loại bỏ font-mono | `[CONFIRMED]` |
| **`REQ-EXP-DIR-STATS-DISPLAY`** | Functional Req | Khối Chỉ Số Thành Tựu Thông Minh | Chỉ hiển thị các chỉ số $> 0$; ẩn toàn bộ số 0; ẩn cả khối khi $\sum = 0$ | `[CONFIRMED]` |
| **`REQ-EXP-DIR-MULTI-SELECT`** | Functional Req | Bộ Lọc Checkbox Đa Tiêu Chí | Chuyển đổi Radio sang Checkbox cho Học vị và Lĩnh vực chuyên môn | `[CONFIRMED]` |
| **`REQ-EXP-DIR-PROVINCE-SCOPE`** | Functional Req | Chuẩn Hóa Phạm Vi Địa Bàn Trọng Điểm | Quy hoạch dropdown địa bàn về 34 Sở KH&CN trọng điểm phân nhóm 3 miền | `[CONFIRMED]` |
| **`BR-EXP-DIR-MULTI-FILTER`** | Business Rule | Phối Hợp Logic Bộ Lọc (OR / AND) | OR trong cùng nhóm tiêu chí, AND giữa các nhóm tiêu chí khác nhau | `[CONFIRMED]` |
| **`BR-EXP-DIR-HIDE-ZERO-METRICS`** | Business Rule | Ẩn Tuyệt Đối Các Chỉ Số Bằng 0 | Loại trừ khỏi DOM hiển thị mọi số liệu $\le 0$; không để ô trống vô nghĩa | `[CONFIRMED]` |
| **`BR-EXP-DIR-PROVINCE-GOV-SCOPE`** | Business Rule | Thẩm Quyền Địa Bàn 34 Sở Trọng Điểm | Chỉ áp dụng lọc trên các Sở KH&CN thuộc phạm vi liên thông NacenTech | `[CONFIRMED]` |
| **`UI-EXP-DIR-CARD-POLISH`** | UI/UX Spec | Thiết Kế Thẻ Chuyên Gia Doanh Nghiệp | Tinh chỉnh giao diện thẻ: Nhãn tiếng Việt, chip thành tựu, nút xem & kết nối | `[CONFIRMED]` |
| **`UI-EXP-DIR-FILTER-CHECKBOX`** | UI/UX Spec | Giao Diện Bộ Lọc Checkbox & 5 UX States | Giao diện Checkbox đa chọn, thanh Active Chips, bao phủ 5 UX states | `[CONFIRMED]` |


---

## Spec Delta v18: Tinh chỉnh Thẻ Chuyên gia & Bổ sung Social Proof (Lượt kết nối)

### 18.1. Bối Cảnh & Căn Cứ Quyết Định PO (Context & PO Rationale)

- **Căn cứ chỉ đạo**: Quyết định PO Orchestrator ngày 21/10/2026 về việc chuẩn hóa trải nghiệm thẩm mỹ thị giác và gia tăng tỷ lệ chuyển đổi kết nối (Conversion Rate) trên Danh bạ Chuyên gia KH&CN (`/experts`).
- **Phản hồi từ User Testing & Phân tích khoảng cách (Gap Analysis)**:
  1. **Khối Spotlight Rail (Chuyên gia Tiêu biểu & Nổi bật)**: Hiện chỉ hiển thị Avatar, Học hàm/Học vị, Họ tên và Cơ quan công tác. Doanh nghiệp khi lướt nhanh không nắm bắt được lĩnh vực thế mạnh hay công nghệ làm chủ của chuyên gia nổi bật, làm giảm hiệu quả đề xuất kết nối.
  2. **Bố cục Thẻ Chuyên gia (Expert Card)**: Thẻ chuyên gia gặp lỗi hiển thị số `+1` (hoặc `+N`) lơ lửng dạng text thô không viền, không khối, tách rời khỏi các chip công nghệ. Các khối thông tin có chiều cao co giãn bất thường dẫn đến thẻ trong cùng hàng có chiều cao so le, phá vỡ nhịp điệu thị giác (visual rhythm) của lưới 3 cột.
  3. **Yếu tố Thúc đẩy Niềm tin (Social Proof)**: Doanh nghiệp tìm kiếm chuyên gia cần chỉ số bằng chứng thực tế về năng lực chuyển giao thành công. Chỉ số "Lượt kết nối / Tư vấn thành công" (`ConnectionCount`) đóng vai trò là huy hiệu tín nhiệm mạnh mẽ thúc đẩy gửi yêu cầu hợp tác.
  4. **Triết lý sản phẩm NacenTech**: Giữ vững nguyên tắc *"Cái gì đẹp show ra, không có thì ẩn đi"*. Tuyệt đối không để số 0 hiển thị trên thẻ làm giảm uy tín của chuyên gia mới gia nhập mạng lưới.

---

### 18.2. Yêu Cầu Chức Năng Mới (Functional Requirements)

- **`FR-DELTA-01` — Bổ Sung Ngành Chuyên Môn & Chip Công Nghệ Trên Spotlight Rail**:
  + Tích hợp hiển thị Tên ngành chuyên môn chính (`primarySectorName`) dưới dạng Badge nhỏ gọn bo góc nhẹ, màu sắc thương hiệu dịu (`bg-brand-50 text-brand-800 border-brand-200`).
  + Hiển thị tối đa 02 Chip công nghệ tiêu biểu (`masteredTechCodes`) được giải mã sang nhãn tiếng Việt rõ nghĩa qua `resolveTechLabel()`.
  + Tối ưu không gian thẻ Spotlight để không gây tràn layout hoặc phá vỡ cấu trúc flex/grid trên các kích thước màn hình từ Desktop đến Mobile.

- **`FR-DELTA-02` — Chuẩn Hóa Bố Cục Thẻ Chuyên Gia & Triệt Tiêu Số `+1` Lơ Lửng**:
  + **Loại bỏ triệt để số `+1` text trần**: Khi danh sách công nghệ làm chủ $> 2$, phần tử đếm số dư (`+{length - 2}`) phải được đóng gói thành Pill Badge chuẩn thiết kế (`px-2 py-0.5 rounded text-caption font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`).
  + **Cân bằng nhịp điệu thị giác (Visual Rhythm) & Min-height đồng bộ**:
    * Tiêu đề họ tên chuyên gia: Cố định khoảng không gian hiển thị (`min-h-[44px]` với `line-clamp-2`), đảm bảo thẻ 1 dòng hay 2 dòng họ tên đều có cùng vị trí bắt đầu cho phần cơ quan.
    * Cơ quan công tác: `truncate min-h-[20px]`.
    * Khối Ngành & Chip công nghệ: Đặt `min-h-[64px]` để cố định chiều cao khối năng lực công nghệ, triệt tiêu hiện tượng thẻ bị thụt lề khi chuyên gia có ít chip hơn.
    * Khối Thành tựu: Giữ nguyên quy tắc conditional rendering, đồng thời đảm bảo khoảng cách đệm (padding/margin) co giãn tự nhiên xuống chân thẻ (`mt-auto`).

- **`FR-DELTA-03` — Bổ Sung Badge Lượt Kết Nối / Tư Vấn Thành Công (Social Proof Badge)**:
  + Bổ sung trường dữ liệu `ConnectionCount` vào DTO thẻ công khai (`ExpertPublicCardDto`).
  + Hiển thị Badge Social Proof: `[N Lượt kết nối]` hoặc `[N Tư vấn thành công]` với icon nhận diện (`MessageSquarePlus` hoặc `Users`), phong cách tươi sáng, uy tín (`bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800`).
  + Vị trí hiển thị: Nằm trong cụm thông tin định danh hoặc gắn liền với thanh chỉ số uy tín của thẻ chuyên gia.

---

### 18.3. Quy Tắc Nghiệp Vụ (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật |
| :--- | :--- | :--- |
| **`BR-DELTA-01`** | **Nguyên Tắc Hiển Thị Social Proof Có Điều Kiện** | - **Chỉ hiển thị khi `ConnectionCount > 0`**: Badge Lượt kết nối chỉ được render khi chuyên gia có ít nhất 1 lượt kết nối thành công (`ConnectionCount >= 1`).<br>- **Tuyệt đối ẩn khi `= 0` hoặc rỗng**: Trường hợp chuyên gia chưa có lượt kết nối nào (`ConnectionCount == 0`, `null` hoặc `undefined`), hệ thống ẩn hoàn toàn Badge khỏi DOM. Tuyệt đối KHÔNG hiển thị "0 Lượt kết nối". |
| **`BR-DELTA-02`** | **Chuẩn Hóa Nhãn Công Nghệ Trên Mọi Bề Mặt** | Toàn bộ mã công nghệ (`TECH-...`) hiển thị trên Spotlight Rail và Thẻ chuyên gia bắt buộc phải đi qua bộ giải mã nhãn Master Data (`resolveTechLabel`). Không để lộ mã kỹ thuật thô. |
| **`BR-DELTA-03`** | **Pill Badge Nhất Quán Cho Đếm Công Nghệ Dư** | Phần tử đếm công nghệ vượt quá giới hạn 2 tag (`+N`) bắt buộc phải áp dụng chung token giao diện của hệ thống design system, không dùng text trần font serif/sans đơn lẻ. |
| **`BR-DELTA-04`** | **Tuân Thủ Bảo Vệ Dữ Liệu Cá Nhân (PDPD NĐ 13/2023)** | Dữ liệu `ConnectionCount` chỉ là số lượng tổng hợp vô danh (Aggregated count), tuyệt đối không tiết lộ danh tính doanh nghiệp đối tác, số hợp đồng hay thông tin bảo mật của phiên tư vấn. |

---

### 18.4. Tiêu Chí Chấp Thuận (Acceptance Criteria - Gherkin Format)

#### `AC-DELTA-01`: Hiển Thị Ngành & Công Nghệ Trên Spotlight Rail
- **Given** người dùng truy cập trang Danh bạ Chuyên gia `/experts`,
- **When** quan sát từng thẻ chuyên gia trên Băng chuyền Chuyên gia Tiêu biểu & Nổi bật (Spotlight Rail),
- **Then** hệ thống hiển thị:
  + Tên ngành chuyên môn chính (ví dụ: `03. Điện tử & CNTT` hoặc `Nông nghiệp công nghệ cao`).
  + Tối đa 2 Chip công nghệ làm chủ tiêu biểu với nhãn tiếng Việt thân thiện (ví dụ: `Thị giác máy tính AI`, `Chiết xuất CO2 siêu tới hạn`).
  + Bố cục thẻ Spotlight cân đối, không bị xô lệch trên mọi độ phân giải.

#### `AC-DELTA-02`: Chuẩn Hóa Bố Cục Thẻ & Loại Bỏ Số `+1` Lơ Lửng
- **Given** chuyên gia trong danh bạ có nhiều hơn 2 công nghệ làm chủ (ví dụ: 3 công nghệ),
- **When** thẻ chuyên gia được hiển thị trong lưới kết quả,
- **Then**:
  + Hệ thống hiển thị 2 chip công nghệ đầu tiên kèm theo 1 Pill Badge định dạng chuẩn `+1` (có màu nền, viền bo góc tròn mềm mại), tuyệt đối không xuất hiện chữ số `+1` text trần không viền.
  + Các thẻ chuyên gia cạnh nhau trong cùng một hàng lưới duy trì nhịp điệu thị giác hài hòa, các khu vực Tiêu đề họ tên, Cơ quan, và Khối công nghệ có `min-height` nhất quán, nút CTA ghim thẳng hàng ở đáy thẻ (`mt-auto`).

#### `AC-DELTA-03`: Badge Lượt Kết Nối / Tư Vấn Thành Công (Conditional Social Proof)
- **Given** chuyên gia A có `ConnectionCount = 12` và chuyên gia B có `ConnectionCount = 0`,
- **When** hệ thống nạp dữ liệu và render thẻ chuyên gia tại `/experts`,
- **Then**:
  + Thẻ của chuyên gia A hiển thị Badge `12 lượt kết nối` (kèm icon nhận diện).
  + Thẻ của chuyên gia B hoàn toàn không hiển thị Badge kết nối, không render bất kỳ phần tử DOM nào chứa số 0, và bố cục thẻ chuyên gia B vẫn lấp đầy tự nhiên, chỉn chu.

---

### 18.5. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kỹ Thuật (Surface) | Vị Trí Tệp Mã Nguồn / Schema | Bản Chất Tác Động | Chi Tiết Thay Đổi Cần Thực Hiện |
| :--- | :--- | :--- | :--- |
| **Web Public Directory** | `SourceCode/frontend/src/app/experts/page.tsx`<br>`page.test.tsx` | UI Component & View Logic | - Bổ sung Ngành chuyên môn & 2 Chip công nghệ cho từng item trên Spotlight Rail.<br>- Thay thế text `+{expert.masteredTechCodes.length - 2}` bằng Pill Badge chuẩn.<br>- Bổ sung Badge Social Proof `[N lượt kết nối]` có điều kiện `expert.connectionCount > 0`.<br>- Bổ sung các lớp `min-h-[...]` để cố định nhịp điệu thị giác lưới thẻ.<br>- Cập nhật Vitest tests bao phủ 3 tiêu chí chấp thuận. |
| **Mobile / Zalo Mini App** | `SourceCode/frontend/src/app/experts/zalo-preview/page.tsx`<br>`SourceCode/ZaloMiniApp/` | Mobile UX Preview & Channel Sync | - Cập nhật giả lập giao diện mobile đồng bộ huy hiệu Social Proof và hiển thị nhãn công nghệ thân thiện.<br>- Đảm bảo form thu thập sơ bộ Zalo không bị ảnh hưởng và tuân thủ PDPD (không thu thập PII trái phép). |
| **API DTO & Application Service** | `backend/modules/brokerage/Application/Contracts.cs`<br>`backend/modules/brokerage/Application/ExpertService.cs` | Backend API Contract & DTO Projection | - Bổ sung trường `int ConnectionCount = 0` vào `ExpertPublicCardDto` (tương thích ngược với default value).<br>- `ExpertService.GetPublicDirectoryAsync` gán giá trị `ConnectionCount` từ thực thể hồ sơ hoặc tổng hợp liên kết.<br>- Cập nhật các mock/test fixture liên quan trong backend. |
| **Database & Persistence** | `backend/modules/brokerage/Domain/ExpertProfile.cs`<br>`packages/persistence/Configurations.cs`<br>`packages/persistence/Migrations/` | Domain Entity & Relational Schema | - Domain: Thêm property `ConnectionCount` trong `ExpertProfile.cs` (default 0).<br>- EF Core: Cấu hình ánh xạ cột `connection_count` trong bảng `brokerage.expert_profiles`.<br>- Migration: Tạo migration thêm cột `connection_count` kiểu `integer NOT NULL DEFAULT 0`.<br>- Seed data: Cập nhật seed data thực nghiệm để một số chuyên gia có lượt kết nối $> 0$ và số khác $= 0$. |

---

## Spec Delta v19: Chuẩn Hóa Menu Workspace Chuyên Gia 7 Mục & Hợp Đồng Thù Lao Disabled [CR-2026-006]

### 19.1. Bối Cảnh & Căn Cứ Quyết Định PO (Context & PO Rationale)

- **Căn cứ chỉ đạo**: Quyết định PO Orchestrator `PO-DEC-20261023-01` (CR-2026-006) ban hành ngày 23/10/2026 về việc chuẩn hóa thanh điều hướng Workspace Chuyên gia KH&CN (`TASK-05`).
- **Phản hồi từ User Testing & Khảo sát Chuyên gia**:
  1. **Tái cấu trúc 3 khối chức năng**: Bàn làm việc Chuyên gia cần phản ánh đúng chu trình tác nghiệp khoa học, tách bạch giữa tác nghiệp hàng ngày (Dashboard, Hộp thư tư vấn, Radar AI, Dự án TRL), khía cạnh kinh tế hợp đồng, và khối quản trị hồ sơ cá nhân.
  2. **Vấn đề phân hệ Hợp đồng & Thù lao**: Hệ sinh thái hợp đồng điện tử ký số toàn diện (`/contracts`) là bài toán lớn đang được phát triển theo lộ trình. Việc vội vã đưa ra một màn hình mock sẽ vi phạm nguyên tắc Zero-Mock của NacenTech. PO quyết định:
     - Đặt menu *“Hợp đồng & Thù lao”* ở trạng thái **Disabled (Xám)**, hiển thị nhãn **"Sắp ra mắt"**. Khi bấm vào, chặn điều hướng và hiển thị Toast thông báo lộ trình.
     - **Phương án A (Thù lao tư vấn)**: Tích hợp trường theo dõi giá trị thù lao & trạng thái thanh lý giải ngân vào **Tab 3 "Lịch sử & Nghiệm thu biên bản"** của Hộp thư Tư vấn (`/portal/expert/consultations?tab=completed`).
  3. **Đổi tên & Sắp xếp lại "Cài đặt & Tài khoản"**: Đổi tên từ *"Tài khoản Chuyên gia"* thành *"Cài đặt & Tài khoản"*, chuyển xuống vị trí cuối cùng (Mục số 7) trong Sidebar để đúng với thông lệ thiết kế Enterprise UI/UX.

---

### 19.2. Yêu Cầu Chức Năng Mới (Functional Requirements)

#### `REQ-EXP-NAV-001` — Cấu Trúc Menu Workspace Chuyên Gia 7 Mục Theo 3 Khối Logic
Thanh Sidebar điều hướng cho vai trò `VERIFIED_EXPERT` (và `EXPERT`) được cấu hình gồm **7 mục** phân bổ theo **3 khối**:

1. **Khối 1: Tác nghiệp hàng ngày (Daily Operations)**:
   - **Mục 1**: `Tổng quan Chuyên gia`
     * URL: `/portal/expert/profile` (key: `profile`)
     * Icon: `LayoutDashboard`
     * Mục tiêu: Dashboard điều hành cá nhân, danh sách việc cần làm, thông báo Sở.
   - **Mục 2**: `Hộp Thư Tư Vấn & Kết Nối`
     * URL: `/portal/expert/consultations` (key: `consultations`)
     * Icon: `Inbox`
     * Huy hiệu (Badge): **Số đếm ngược SLA 48h** (ví dụ: Badge đỏ/cam hiển thị số lượng yêu cầu đang chờ phản hồi trong vòng 48 giờ).
     * Mục tiêu: Tiếp nhận đơn tư vấn 1-1 từ DNNVV hoặc chỉ định Sở KH&CN.
   - **Mục 3**: `Radar Cơ hội Phù hợp (AI)`
     * URL: `/portal/matching/radar` (hoặc `/portal/expert/radar`, key: `radar`)
     * Icon: `Sparkles`
     * Huy hiệu (Badge): **"Mới"** (Pill Badge xanh lá/emerald làm nổi bật cơ hội ghép nối mới).
     * Mục tiêu: Khám phá nhu cầu công nghệ DNNVV và hội đồng đánh giá TT17.
   - **Mục 4**: `Dự án Đồng hành & Hợp tác`
     * URL: `/portal/expert/projects` (key: `projects`)
     * Icon: `Kanban`
     * Mục tiêu: Quản lý Kanban 5 giai đoạn R&D, chuyển giao công nghệ TRL 1-9 và Deal Room 1-1.

2. **Khối 2: Kinh tế & Hợp đồng (Economics & Contracts - Sắp ra mắt)**:
   - **Mục 5**: `Hợp đồng & Thù lao`
     * URL: `/portal/expert/contracts` (key: `contracts`)
     * Icon: `FileText` (hoặc `Coins` / `ScrollText`)
     * Trạng thái: **Disabled (Xám)**
     * Huy hiệu (Badge): **"Sắp ra mắt"** (Pill badge nhỏ màu hổ phách/xám `bg-amber-100 text-amber-800 text-[10px]`).

3. **Khối 3: Hồ sơ & Quản trị (Profile & Settings)**:
   - **Mục 6**: `Hồ sơ LLKH của tôi`
     * URL: `/portal/expert/profile/edit` (key: `profile-edit`)
     * Icon: `GraduationCap`
     * Mục tiêu: Quản trị Lý lịch khoa học chuẩn Bộ KH&CN, văn bằng, công trình.
   - **Mục 7**: `Cài đặt & Tài khoản`
     * URL: `/portal/expert/account` (key: `account`)
     * Icon: `ShieldCheck` (hoặc `Settings`)
     * Nhãn hiển thị: Đổi tên thành **"Cài đặt & Tài khoản"** (trước đây là "Tài khoản Chuyên gia").
     * Vị trí: Chuyển xuống **vị trí cuối cùng** trong Sidebar.
     * Mục tiêu: Quản lý định danh khoa học (Mã EXP, QĐ Sở), bật/tắt tiếp nhận tư vấn (Readiness Toggle), đo điểm Completeness 5 trụ cột, an toàn đăng nhập & Zalo Mini App.

#### `REQ-EXP-NAV-002` — Xử Lý Tương Tác Mục Hợp Đồng & Thù Lao Disabled (Toast Notification)
1. **Khóa chuyển hướng (Route Guard)**:
   - Phần tử Sidebar mục `contracts` phải áp dụng thuộc tính `disabled: true`, render dạng thẻ `<button>` hoặc `<div>` có `aria-disabled="true"`.
   - Khi người dùng click chuột hoặc nhấn Enter/Space: Chặn hoàn toàn sự kiện chuyển trang mặc định (`e.preventDefault()`, không gọi `router.push`).
2. **Thông báo Toast (Notification Toast)**:
   - Kích hoạt thông báo Toast dạng `info`:
     * Tiêu đề/Nội dung: *"Tính năng Hợp đồng & Thù lao đang được phát triển theo lộ trình"*.
     * Thời gian hiển thị: 3000ms.
3. **Phong cách thị giác (Visual Style)**:
   - Style xám mờ (`opacity-60 text-slate-400 dark:text-slate-500 cursor-not-allowed hover:bg-transparent`).
   - Huy hiệu "Sắp ra mắt" hiển thị trực quan ở mép phải của menu item.

#### `REQ-EXP-NAV-003` — Quản Trị Thù Lao Tư Vấn Tại Tab 3 Hộp Thư Tư Vấn (Phương Án A)
1. **Tích hợp Thù lao vào Tab 3 Lịch sử & Nghiệm thu**:
   - Mỗi phiên tư vấn hoàn thành trong Tab 3 (`/portal/expert/consultations?tab=completed`) hiển thị đầy đủ:
     * Giá trị thù lao: `advisoryFeeVnd` (ví dụ: `15.000.000 VNĐ`).
     * Đơn vị chi trả: `feePayer` (ví dụ: `Quỹ ĐMST Hà Nội` hoặc `Doanh nghiệp chi trả trực tiếp`).
     * Trạng thái giải ngân: `disbursementStatus` (`CHO_NGHIEM_THU`, `DANG_DOI_SOAT_SO`, `DA_QUYET_TOAN`, `DN_DA_THANH_TOAN`).
     * Huy hiệu thanh lý: Hiển thị badge màu tương ứng (Xanh lá khi đã quyết toán, Hổ phách khi đang đối soát).
2. **Khối tổng kết thu nhập ở đầu trang**:
   - Hiển thị tóm tắt: Tổng thù lao đã quyết toán, Thù lao đang chờ giải ngân từ Quỹ ĐMST.

---

### 19.3. Quy Tắc Nghiệp Vụ (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật |
| :--- | :--- | :--- |
| **`BR-EXP-NAV-001`** | **Quy Tắc Active Route & Khóa Điều Hướng Disabled** | - **Triệt tiêu active cho Disabled**: Mục `contracts` không bao giờ được nhận class active khi người dùng đang ở các màn hình khác.<br>- **Không chuyển route**: Khi click vào mục `disabled`, sự kiện `onClick` gọi `e.preventDefault()`, hiển thị Toast thông báo lộ trình. Tuyệt đối không chuyển hướng URL.<br>- **Phân giải chính xác 7 Key**: Hàm `resolveExpertActiveMenu` phân giải chuẩn xác 7 key (`profile`, `consultations`, `radar`, `projects`, `contracts`, `profile-edit`, `account`), tuyệt đối không có xung đột giữa `consultations` và `projects`. |
| **`BR-EXP-NAV-002`** | **Phương Án A: Phân Định Phạm Vi Thù Lao** | - Toàn bộ thù lao phiên tư vấn ngắn hạn được đối soát và hiển thị tại Tab 3 của Hộp thư Tư vấn (`consultations?tab=completed`).<br>- Hợp đồng kinh tế lớn và chuyển giao công nghệ dài hạn thuộc phạm vi phân hệ `contracts` tương lai. |
| **`BR-EXP-NAV-003`** | **Tiêu Chuẩn Tiếp Cận A11y Cho Mục Disabled** | - Phần tử `contracts` trên Sidebar bắt buộc có `aria-disabled="true"` và nhãn `aria-label="Hợp đồng & Thù lao (Tính năng đang được phát triển theo lộ trình, hiện chưa khả dụng)"`.<br>- Vẫn cho phép nhận focus bàn phím (`tabIndex={0}`) để người dùng khiếm thị biết sự hiện diện của tính năng trên lộ trình, phím Enter kích hoạt Toast tương tự click chuột. |

---

### 19.4. Tiêu Chí Chấp Thuận (Acceptance Criteria - Gherkin Format)

#### `AC-NAV-01`: Cấu Trúc Menu 7 Mục Đúng 3 Khối Trên Sidebar
- **Given** người dùng đăng nhập với vai trò Chuyên gia (`VERIFIED_EXPERT` hoặc `EXPERT`),
- **When** quan sát thanh Sidebar điều hướng Bàn làm việc Chuyên gia,
- **Then** hệ thống hiển thị đúng thứ tự 7 mục:
  1. `Tổng quan Chuyên gia` (`/portal/expert/profile`)
  2. `Hộp Thư Tư Vấn & Kết Nối` (`/portal/expert/consultations`)
  3. `Radar Cơ hội Phù hợp (AI)` (`/portal/matching/radar` hoặc `/portal/expert/radar`)
  4. `Dự án Đồng hành & Hợp tác` (`/portal/expert/projects`)
  5. `Hợp đồng & Thù lao` (`/portal/expert/contracts` - Disabled)
  6. `Hồ sơ LLKH của tôi` (`/portal/expert/profile/edit`)
  7. `Cài đặt & Tài khoản` (`/portal/expert/account`)

#### `AC-NAV-02`: Click Mục "Hợp Đồng & Thù Lao" Hiển Thị Toast & Chặn Chuyển Route
- **Given** người dùng đang ở bất kỳ trang nào trong Workspace Chuyên gia,
- **When** người dùng click vào mục *“Hợp đồng & Thù lao”* trên Sidebar,
- **Then**:
  - Hệ thống chặn điều hướng trang, URL trình duyệt giữ nguyên không đổi sang `/portal/expert/contracts`.
  - Một thông báo Toast xuất hiện trên màn hình với nội dung: *"Tính năng Hợp đồng & Thù lao đang được phát triển theo lộ trình"*.
  - Mục này không bị highlight dạng active.

#### `AC-NAV-03`: Hiển Thị Badge SLA 48h Và Badge "Mới"
- **Given** chuyên gia có yêu cầu tư vấn đang chờ xử lý trong 48 giờ,
- **When** quan sát Sidebar,
- **Then**:
  - Mục *“Hộp Thư Tư Vấn & Kết Nối”* hiển thị Badge số đếm yêu cầu cần phản hồi trong 48h.
  - Mục *“Radar Cơ hội Phù hợp (AI)”* hiển thị Badge "Mới" (hoặc icon Sparkles nổi bật).
  - Mục *“Hợp đồng & Thù lao”* hiển thị Badge "Sắp ra mắt".

#### `AC-NAV-04`: Đổi Tên "Cài Đặt & Tài Khoản" Và Định Vị Ở Cuối Cùng
- **Given** thanh điều hướng Sidebar của Chuyên gia,
- **When** quan sát mục số 7,
- **Then**:
  - Tên hiển thị là **"Cài đặt & Tài khoản"** (thay vì "Tài khoản Chuyên gia").
  - Mục này nằm ở vị trí cuối cùng trong danh sách menu chuyên gia.
  - Khi click, chuyển hướng chính xác đến `/portal/expert/account` và nhận active key `account`.

#### `AC-NAV-05`: Quản Trị Thù Lao Tại Tab 3 Hộp Thư Tư Vấn (Phương Án A)
- **Given** chuyên gia truy cập `/portal/expert/consultations?tab=completed`,
- **When** nạp danh sách các phiên tư vấn đã nghiệm thu,
- **Then**:
  - Mỗi bản ghi hiển thị rõ ràng giá trị thù lao (ví dụ: `15.000.000 VNĐ`), nguồn chi trả (Quỹ ĐMST / DN), và trạng thái giải ngân (`ĐÃ QUYẾT TOÁN` hoặc `ĐANG ĐỐI SOÁT HỒ SƠ QUỸ ĐMST`).

---

### 19.5. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kỹ Thuật (Surface) | Vị Trí Tệp Mã Nguồn / Spec | Bản Chất Tác Động | Chi Tiết Thay Đổi Cần Thực Hiện |
| :--- | :--- | :--- | :--- |
| **Portal Sidebar Navigation** | `SourceCode/frontend/src/app/portal/layout.tsx`<br>`layout.test.tsx` | UI Layout & Navigation Config | - Tái cấu trúc `expertNavItems` thành 7 mục theo đúng thứ tự 3 khối.<br>- Bổ sung item `contracts` với thuộc tính `disabled: true`, badge "Sắp ra mắt".<br>- Bổ sung Toast handler khi click item disabled.<br>- Đổi tên item `account` thành "Cài đặt & Tài khoản", chuyển xuống cuối.<br>- Cập nhật Vitest tests kiểm tra 7 mục và click toast. |
| **Active Menu Resolver** | `SourceCode/frontend/src/lib/expert-nav.ts`<br>`expert-nav.test.ts` | Routing Helper & Active Key Logic | - Cập nhật type `ExpertMenuKey` bổ sung `"contracts"`.<br>- Cập nhật hàm `resolveExpertActiveMenu` xử lý đúng thứ tự ưu tiên.<br>- Bổ sung unit tests cho tất cả 7 route. |
| **Consultation Inbox Tab 3** | `SourceCode/frontend/src/app/portal/expert/consultations/page.tsx` | View Logic & UX Display (PA-A) | - Hiển thị trường theo dõi thù lao `advisoryFeeVnd`, nguồn chi trả `feePayer`, trạng thái `disbursementStatus` trong Tab 3.<br>- Bổ sung khối tổng kết thù lao đã quyết toán ở đầu Tab 3. |
| **Basic Design Delta** | `Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md` | SSOT Kiến trúc & Thiết kế Cơ sở | - Đồng bộ 7 mục 3 khối, quyết định Phương án A và quy chuẩn disabled toast. |

---

### 19.6. Ma Trận Truy Vết Nghiệp Vụ (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-NAV-001`** | Functional Req | Cấu Trúc Menu Workspace 7 Mục 3 Khối | Chuẩn hóa Sidebar thành 7 mục theo 3 khối logic tác nghiệp | `[CONFIRMED]` |
| **`REQ-EXP-NAV-002`** | Functional Req | Menu Hợp Đồng Disabled & Toast Notification | Khóa click, hiển thị nhãn "Sắp ra mắt" và toast thông báo lộ trình | `[CONFIRMED]` |
| **`REQ-EXP-NAV-003`** | Functional Req | Quản Trị Thù Lao Tại Tab 3 (Phương Án A) | Tích hợp theo dõi giá trị thù lao & trạng thái thanh lý vào Tab 3 Hộp thư Tư vấn | `[CONFIRMED]` |
| **`BR-EXP-NAV-001`** | Business Rule | Quy Tắc Active Route & Khóa Điều Hướng | Không active mục disabled, phân giải độc lập 7 keys, không va chạm route | `[CONFIRMED]` |
| **`BR-EXP-NAV-002`** | Business Rule | Phân Định Thù Lao Tư Vấn & Hợp Đồng Dự Án | Thù lao tư vấn quản lý tại Tab 3; Hợp đồng dự án dành cho giai đoạn sau | `[CONFIRMED]` |
| **`BR-EXP-NAV-003`** | Business Rule | Tiêu Chuẩn Tiếp Cận A11y Cho Mục Disabled | Thuộc tính `aria-disabled="true"`, `aria-label`, hỗ trợ phím bấm | `[CONFIRMED]` |
| **`UI-EXP-NAV-7ITEMS`** | UI/UX Spec | Giao Diện Sidebar 7 Mục & Disabled Badge | Style trực quan 7 mục, badge SLA 48h, badge "Mới", badge "Sắp ra mắt" | `[CONFIRMED]` |
| **`UI-EXP-FEE-TAB3`** | UI/UX Spec | Giao Diện Thẻ Thù Lao & Trạng Thái Thanh Lý | Thẻ tư vấn hoàn thành hiển thị giá trị thù lao, huy hiệu thanh lý | `[CONFIRMED]` |

---

## Spec Delta v20: Chuẩn Hóa Trải Nghiệm Dashboard, Triệt Tiêu Hardcode Account & Toast Standard [CR-2026-007]

> **Căn cứ pháp lý & chỉ đạo**: Quyết định PO Orchestrator `PO-DEC-20261023-02` (CR-2026-007: Cải tiến Giai đoạn 1 - Sửa lỗi điều hướng Dashboard, chuẩn hóa Toast và triệt tiêu hardcode) ban hành ngày 23/10/2026.  
> **Tài liệu tham chiếu Basic Design**: [`BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md) (Mục 9).  
> **Phạm vi tác động**: Bàn làm việc Chuyên gia KH&CN (`TASK-05`), Tuyến hạ cánh `/portal/expert/profile`, Màn hình Cài đặt & Tài khoản (`/portal/expert/account`), Hộp thư Tư vấn (`/portal/expert/consultations`), Radar cơ hội (`/portal/matching/radar`).

### 20.1. Bối Cảnh & Mục Tiêu Thay Đổi (Context & Objectives)

Sau đợt rà soát nghiệm thu vận hành phiên bản Workspace Chuyên gia 7 mục, PO Orchestrator và QA Shadow đã ghi nhận 3 vấn đề gây suy giảm trải nghiệm người dùng và vi phạm nguyên tắc cốt lõi:
1. **Lệch Ngữ Cảnh Trang Hạ Cánh Item 1 (`/portal/expert/profile`)**:
   - Khi chuyên gia nhấp vào mục "Tổng quan Chuyên gia" (`/portal/expert/profile`), hệ thống trước đây hiển thị chi tiết hồ sơ `ExpertOwnerDetailPage` thay vì một trang Dashboard tổng quan đúng nghĩa.
   - Component `ExpertDashboard` đã được xây dựng sẵn nhưng chưa được gắn làm view chính của route `/portal/expert/profile`, đồng thời các nút hành động trong To-Do list cũ trỏ nhầm sang `/profile/upgrade/expert` thay vì `/portal/expert/profile/edit`.
2. **Vi Phạm Zero-Mock & Mất Dữ Liệu Tùy Chọn Tại Item 7 (`/portal/expert/account`)**:
   - Trường số điện thoại khi trống dữ liệu tự ý fallback về số giả `0912****89 (Đã bảo vệ PDPD)`. Điều này vi phạm kỷ luật Zero-Mock và Zero Hallucination của dự án NacenTech.
   - Các cài đặt giao diện (Theme sáng/tối/hệ thống, Cỡ chữ nhỏ/vừa/lớn) chỉ tồn tại trong bộ nhớ tạm React State, bị reset hoàn toàn khi tải lại trang.
   - Danh sách phiên đăng nhập (Active Sessions) thiếu nhãn minh họa thiết bị trực quan.
3. **Sử Dụng Native `alert()` Gây Gián Đoạn Trải Nghiệm**:
   - Vẫn còn sự xuất hiện của các hàm `alert()` của trình duyệt khi chặn quyền hoặc thông báo lỗi (ví dụ tại `consultations` và `radar`), không đúng chuẩn mực Enterprise Design System của NacenTech.

---

### 20.2. Yêu Cầu Chức Năng Mới (Functional Requirements)

#### `REQ-EXP-DASH-001` — Trang Hạ Cánh Tổng Quan Chuyên Gia (Dashboard Landing Component)
1. **Gán Component Dashboard làm Landing View**:
   - Tuyến `/portal/expert/profile` (Item 1 trên Sidebar, key: `profile`) hiển thị trực tiếp component `ExpertDashboard` làm trang hạ cánh trung tâm của Bàn làm việc Chuyên gia.
   - Được bảo vệ bởi `RoleGuard` cho phép các quyền `VERIFIED_EXPERT` và `EXPERT`.
2. **Nội Dung & Cấu Trúc Hiển Thị**:
   - **Banner chào mừng**: Cá nhân hóa theo tên chuyên gia và học hàm/học vị, badge "Dashboard chuyên gia", nền gradient nhận diện thương hiệu.
   - **Thanh tiến độ % hoàn thiện hồ sơ**: Tính toán động dựa trên 3 tiêu chí cốt lõi (Thông tin liên hệ, Chứng từ xác minh đang hiệu lực, Công trình khoa học/Sáng chế). Màu xanh lá khi đạt $\ge 80\%$, màu hổ phách khi dưới $80\%$.
   - **Danh sách việc cần làm (To-Do List)**: Hiển thị các hành động cần thực hiện nếu hồ sơ còn thiếu thông tin. Nút bấm tương tác ("Bổ sung" / "Chỉnh sửa") điều hướng trực tiếp đến trang quản trị LLKH chính thức `/portal/expert/profile/edit` (loại bỏ tuyệt đối link cũ `/profile/upgrade/expert`).
   - **Thao tác nhanh**: Các thẻ shortcut dẫn đến xem chi tiết hồ sơ hoặc sang trang chỉnh sửa `/portal/expert/profile/edit`.
   - **Thông báo Sở KH&CN**: Cảnh báo nổi bật khi hồ sơ có yêu cầu bổ sung (`CHANGES_REQUESTED`) hoặc thông báo trạng thái thẩm định.

#### `REQ-EXP-ACC-001` — Triệt Tiêu Hardcode PDPD & Lưu Trữ Bền Vững Tùy Chọn Cài Đặt (Zero-Hardcode & Preference Persistence)
1. **Triệt tiêu số điện thoại giả lập (Zero-Mock PDPD)**:
   - Khi chuyên gia chưa khai báo số điện thoại (`phone` null, undefined, hoặc rỗng), hệ thống bắt buộc hiển thị nhãn trung thực **"Chưa cập nhật"**. Tuyệt đối cấm hiển thị chuỗi giả mạo `0912****89`.
   - Khi có số điện thoại thật, thực hiện masking tuân thủ Nghị định 13/2023/NĐ-CP (ví dụ: `0987****34 (Đã bảo vệ PDPD)`).
2. **Lưu trữ tùy chọn giao diện bền vững (Client Persistence)**:
   - Tùy chọn Theme (Sáng / Tối / Tự động): Lưu vào `localStorage` với key `expert_theme_pref`. Khôi phục trạng thái khi tải lại trang và áp dụng class tương ứng.
   - Tùy chọn Cỡ chữ (Nhỏ / Vừa / Lớn): Lưu vào `localStorage` với key `expert_fontsize_pref`. Khôi phục trạng thái khi tải lại trang.
3. **Minh họa Thiết bị Phiên Đăng Nhập (Active Sessions)**:
   - Hiển thị danh sách thiết bị có phân loại rõ ràng qua icon và nhãn chi tiết (`Laptop` cho máy tính để bàn/xách tay, `Smartphone` cho điện thoại di động).
   - Phân định rõ "Phiên hiện tại" và các phiên đăng nhập khác, nút thao tác "Đăng xuất thiết bị này" kích hoạt Toast xác nhận thay vì reload toàn trang.

#### `REQ-EXP-TOAST-001` — Chuẩn Hóa Thông Báo Toast Notification Thay Thế Hoàn Toàn `alert()`
1. **Loại bỏ 100% `alert()` của trình duyệt**:
   - Nghiêm cấm hoàn toàn lệnh `window.alert()` trên tất cả các màn hình của Workspace Chuyên gia.
2. **Chuẩn hóa thông báo bằng `useToast()`**:
   - Tại Hộp thư Tư vấn (`/portal/expert/consultations`): Khi chuyên gia chưa được Sở KH&CN phê duyệt (`status !== 'APPROVED'`) bấm tiếp nhận yêu cầu có thù lao Quỹ ĐMST $\rightarrow$ Hiển thị Toast Warning với tiêu đề và nội dung giải thích rõ ràng.
   - Tại Radar Cơ hội Phù hợp (`/portal/matching/radar`): Khi gặp lỗi kết nối hoặc phản hồi thất bại $\rightarrow$ Hiển thị Toast Error với thông điệp thân thiện.
   - Tại các màn hình liên quan (`projects`, `profile/edit`): Chuyển đổi toàn bộ thông báo xuất báo cáo hoặc khóa hồ sơ sang Toast Info/Warning tương ứng.

---

### 20.3. Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật |
| :--- | :--- | :--- |
| **`BR-EXP-DASH-001`** | **Quy Tắc Điều Hướng Landing View & Action Links của Dashboard** | - Route `/portal/expert/profile` luôn phục vụ `ExpertDashboard` làm trang chủ của Bàn làm việc Chuyên gia.<br>- Toàn bộ liên kết cập nhật/bổ sung hồ sơ từ Dashboard bắt buộc dẫn về route quản trị LLKH chính thức `/portal/expert/profile/edit` (loại bỏ triệt để liên kết cũ `/profile/upgrade/expert`).<br>- Trạng thái % hoàn thiện phản ánh thực tế dữ liệu hồ sơ chuyên gia đã lưu. |
| **`BR-EXP-ACC-001`** | **Quy Tắc Bảo Vệ Dữ Liệu PDPD Thật & Lưu Trữ Tùy Chọn Cục Bộ** | - Tuyệt đối cấm tạo số điện thoại ảo giả lập che giấu thiếu dữ liệu. Thiếu thì hiển thị "Chưa cập nhật".<br>- Tuân thủ Nghị định 13/2023/NĐ-CP: chỉ mask số điện thoại thật do người dùng đã đăng ký.<br>- Cài đặt tùy biến cá nhân (Theme, Font size) lưu bền vững vào `localStorage` (`expert_theme_pref`, `expert_fontsize_pref`), tự động hydrate khi mount component. |

---

### 20.4. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria - Gherkin Format)

#### `AC-DASH-01`: Trang Hạ Cánh `/portal/expert/profile` Hiển Thị Đúng Component `ExpertDashboard` & Link To-Do Chuẩn Xác
- **Given** người dùng đăng nhập với vai trò Chuyên gia (`VERIFIED_EXPERT` hoặc `EXPERT`),
- **When** người dùng truy cập route `/portal/expert/profile` (hoặc click mục "Tổng quan Chuyên gia" trên thanh Sidebar),
- **Then**:
  - Hệ thống hiển thị giao diện `ExpertDashboard` với banner chào mừng cá nhân hóa, huy hiệu "Dashboard chuyên gia", thanh tiến độ % hoàn thiện và danh sách To-Do list.
  - Mỗi mục trong To-Do list hiển thị nút "Bổ sung" / "Chỉnh sửa" với thuộc tính `href` trỏ chính xác về `/portal/expert/profile/edit`.
  - Khối thao tác nhanh cũng cung cấp liên kết dẫn về `/portal/expert/profile/edit`.

#### `AC-DASH-02`: Triệt Tiêu Số Điện Thoại Bịa Đặt & Lưu Bền Vững Tùy Chọn Cài Đặt
- **Given** chuyên gia chưa cập nhật số điện thoại trong hồ sơ cá nhân,
- **When** truy cập vào màn hình Cài đặt & Tài khoản (`/portal/expert/account`),
- **Then**:
  - Tại ô hiển thị số điện thoại, hệ thống hiển thị văn bản **"Chưa cập nhật"**, tuyệt đối không hiển thị chuỗi giả mạo `0912****89`.
- **Given** người dùng đang ở trang `/portal/expert/account`,
- **When** người dùng chọn chế độ giao diện "Tối" (hoặc thay đổi cỡ chữ "Lớn") rồi làm mới trình duyệt (F5/Reload),
- **Then**:
  - Hệ thống tự động nạp lại đúng tùy chọn đã lưu từ `localStorage`, giao diện duy trì trạng thái đã chọn.
- **Given** danh sách phiên đăng nhập (Active sessions),
- **When** quan sát khối quản trị phiên,
- **Then**:
  - Hệ thống hiển thị rõ ràng nhãn thiết bị (`MacBook Pro`, `iPhone...`) kèm icon tương ứng (`Laptop`, `Smartphone`).

#### `AC-DASH-03`: Loại Bỏ Toàn Bộ `alert()` Trình Duyệt & Chuẩn Hóa Bằng `useToast()`
- **Given** chuyên gia có hồ sơ đang ở trạng thái chờ duyệt hoặc cần chỉnh sửa (`status !== 'APPROVED'`),
- **When** chuyên gia thao tác tiếp nhận yêu cầu có thù lao Quỹ ĐMST tại Hộp thư Tư vấn (`/portal/expert/consultations`),
- **Then**:
  - Không có bất kỳ hộp thoại pop-up `window.alert()` nào của trình duyệt bật lên.
  - Hệ thống kích hoạt Toast Notification (variant `warning`) hiển thị cảnh báo: *"Hồ sơ Chuyên gia đang chờ Sở KH&CN phê duyệt. Chưa thể tiếp nhận yêu cầu ủy thác có thù lao Quỹ ĐMST."*
- **Given** chuyên gia thao tác phản hồi yêu cầu tại Radar Cơ hội Phù hợp (`/portal/matching/radar`) và gặp lỗi,
- **When** lỗi xảy ra,
- **Then**:
  - Hệ thống hiển thị Toast Notification (variant `error`) thông báo lỗi rõ ràng thay cho `alert()`.

---

### 20.5. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kỹ Thuật (Surface) | Vị Trí Tệp Mã Nguồn / Spec | Bản Chất Tác Động | Chi Tiết Thay Đổi Cần Thực Hiện |
| :--- | :--- | :--- | :--- |
| **Expert Profile Landing Route** | `SourceCode/frontend/src/app/portal/expert/profile/page.tsx` | View Component Route | - Chuyển sang render component `ExpertDashboard` (thay vì `ExpertOwnerDetailPage`).<br>- Giữ nguyên `RoleGuard` cho `VERIFIED_EXPERT` và `EXPERT`. |
| **Expert Dashboard Component** | `SourceCode/frontend/src/components/expert-detail/expert-dashboard.tsx`<br>`expert-dashboard.test.tsx` | UI Component & Action Links | - Cập nhật các liên kết trong To-Do list và Thao tác hồ sơ từ `/profile/upgrade/expert` sang `/portal/expert/profile/edit`.<br>- Bổ sung/cập nhật unit tests tương ứng. |
| **Expert Account Page** | `SourceCode/frontend/src/app/portal/expert/account/page.tsx`<br>`account.test.tsx` | UI View & Logic Persistence | - Sửa hàm `maskPhone`: khi không có `phone`, trả về `"Chưa cập nhật"`.<br>- Bổ sung lưu/khôi phục `localStorage` cho Theme (`expert_theme_pref`) và Cỡ chữ (`expert_fontsize_pref`).<br>- Gắn nhãn minh họa thiết bị cho active sessions. |
| **Consultation Inbox** | `SourceCode/frontend/src/app/portal/expert/consultations/page.tsx`<br>`consultations.test.tsx` | UI View & Toast Replacement | - Loại bỏ `alert()`, tích hợp hook `useToast()` để hiển thị thông báo warning/error chuẩn Design System. |
| **Matching Radar** | `SourceCode/frontend/src/app/portal/matching/radar/page.tsx` | UI View & Toast Replacement | - Loại bỏ `alert(err.message)`, tích hợp `useToast()` để thông báo lỗi thân thiện. |
| **Basic Design Delta** | `Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md` | SSOT Kiến trúc Cơ sở | - Đồng bộ Quyết định `PO-DEC-20261023-02`, đặc tả chi tiết 3 hạng mục cải tiến trong Mục 9. |

---

### 20.6. Ma Trận Truy Vết Nghiệp Vụ (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-DASH-001`** | Functional Req | Dashboard Landing Component | Tuyến `/portal/expert/profile` hiển thị `ExpertDashboard`, To-Do list trỏ về `/portal/expert/profile/edit` | `[CONFIRMED]` |
| **`REQ-EXP-ACC-001`** | Functional Req | Zero-Hardcode Phone & Preference Persistence | Triệt tiêu số điện thoại giả, hiển thị "Chưa cập nhật"; lưu theme/cỡ chữ vào `localStorage`; gắn nhãn thiết bị | `[CONFIRMED]` |
| **`REQ-EXP-TOAST-001`** | Functional Req | Chuẩn Hóa Toast Notification Thay Alert | Loại bỏ 100% `alert()`, chuẩn hóa thông báo qua `useToast()` chuẩn Design System | `[CONFIRMED]` |
| **`BR-EXP-DASH-001`** | Business Rule | Quy Tắc Điều Hướng Landing View & Action Links | Phân định trang hạ cánh và trang biên tập LLKH, liên kết To-Do đồng bộ | `[CONFIRMED]` |
| **`BR-EXP-ACC-001`** | Business Rule | Quy Tắc PDPD Thật & Lưu Trữ Cục Bộ | Tuyệt đối không bịa số điện thoại, tuân thủ Nghị định 13/2023/NĐ-CP, lưu client preference | `[CONFIRMED]` |
| **`UI-EXP-DASH-VIEW`** | UI/UX Spec | Giao Diện Trang Hạ Cánh ExpertDashboard | Banner chào mừng, tiến độ %, To-Do list, thông báo Sở | `[CONFIRMED]` |
| **`UI-EXP-ACC-ZERO-MOCK`** | UI/UX Spec | Giao Diện Tài Khoản Zero-Mock & Session Icons | Nhãn "Chưa cập nhật", Icon Laptop/Smartphone, lưu trạng thái theme | `[CONFIRMED]` |
| **`UI-EXP-TOAST-ENTERPRISE`** | UI/UX Spec | Chuẩn Hóa Toast Notification Hệ Thống | Thông báo dạng Toast ToastProvider/useToast thay thế pop-up alert gián đoạn | `[CONFIRMED]` |

---

## Spec Delta v21: Zero-Mock Backend Integration Cho Hộp Thư Tư Vấn & Dự Án Đồng Hành [CR-2026-008]

### 21.1. Bối Cảnh & Mục Tiêu Kỹ Thuật (Context & Technical Objectives)
- **Căn cứ pháp lý**: Quyết định của PO Orchestrator `PO-DEC-20261023-03` ban hành ngày 23/10/2026 (CR-2026-008: Zero-Mock Sprint).
- **Mục tiêu cốt lõi**:
  1. Triệt tiêu hoàn toàn mảng tĩnh giả lập (`INITIAL_CONSULTATIONS`, `INITIAL_PROJECTS`) trong Frontend tại 2 màn hình: Hộp thư Tư vấn (`/portal/expert/consultations`) và Dự án Đồng hành (`/portal/expert/projects`).
  2. Xây dựng và tích hợp các API Backend .NET Core API kết nối trực tiếp với CSDL PostgreSQL thật.
  3. Cưỡng chế phân quyền đa tầng Scoped RBAC `VERIFIED_EXPERT`, tuân thủ mẫu thiết kế bảo mật `/api/v1/experts/me/*`.
  4. Đảm bảo toàn bộ tương tác tiếp nhận/từ chối phiếu tư vấn đạt tính nguyên tử (Atomic transaction), kiểm tra SLA 48h chặt chẽ.

---

### 21.2. Yêu Cầu Chức Năng Chi Tiết (Functional Requirements)

#### `REQ-EXP-API-001`: Backend API Danh Sách Phiếu Tư Vấn Chuyên Gia (My Consultations API)
- **Tuyến API**: `GET /api/v1/experts/me/consultations`
- **Mục đích**: Cung cấp danh sách các phiếu tư vấn được gán cho chính chuyên gia đang đăng nhập, phục vụ 3 Tab nghiệp vụ: Chờ duyệt, Lịch hẹn sắp tới, Lịch sử nghiệm thu.
- **Xác thực & Ủy quyền**: `Bearer Token` - Vai trò `VERIFIED_EXPERT` (hoặc `EXPERT` có hồ sơ đã được duyệt).
- **Tham số truy vấn (Query Params)**:
  * `tab` (tùy chọn): `pending` | `scheduled` | `completed`.
  * `pageIndex` (mặc định: 1), `pageSize` (mặc định: 20).
- **Hợp đồng DTO (`ConsultationTicketDto`)**:
  * `ticketCode` (string): Mã phiếu tư vấn (ví dụ: `CS-2026-0012`).
  * `enterpriseName` (string): Tên doanh nghiệp đặt yêu cầu tư vấn.
  * `demandTitle` (string): Tiêu đề nhu cầu / bài toán công nghệ.
  * `meetingDate` (string): Ngày hẹn chuẩn `YYYY-MM-DD`.
  * `meetingTime` (string): Khung giờ hẹn (ví dụ: `09:00 - 11:30`).
  * `meetingType` (string): Hình thức (`ONLINE_ZOOM` | `ONLINE_MEET` | `ON_SITE`).
  * `meetingUrl` (string, nullable): URL phòng họp trực tuyến (nếu là Online).
  * `advisoryFeeVnd` (number): Mức thù lao tư vấn kỹ thuật (VNĐ).
  * `feePayer` (string): Đơn vị chi trả (`SO_KHCN_QUY_DMST` | `DOANH_NGHIEP_TU_CHI_TRA`).
  * `disbursementStatus` (string): Trạng thái giải ngân (`CHUA_GIAI_NGAN` | `DANG_XU_LY` | `DA_QUYET_TOAN`).
  * `slaDeadlineHours` (number): Số giờ còn lại trước khi hết hạn SLA 48h.
  * `status` (string): Trạng thái phiếu (`PENDING_ACCEPTANCE` | `SCHEDULED` | `COMPLETED` | `REJECTED` | `SLA_EXPIRED`).

#### `REQ-EXP-API-002`: Backend API Phản Hồi Tiếp Nhận / Từ Chối Phiếu Tư Vấn (Consultation Response API)
- **Tuyến API**: `POST /api/v1/experts/me/consultations/{id}/respond`
- **Mục đích**: Cho phép chuyên gia chấp thuận (`ACCEPT`) hoặc từ chối (`REJECT`) phiếu tư vấn.
- **Tham số đường dẫn**: `id` - Khóa chính định danh UUID của phiếu tư vấn.
- **Cấu trúc Body**:
  ```json
  {
    "action": "ACCEPT", // "ACCEPT" | "REJECT"
    "reason": "Chuyên gia đồng ý lịch làm việc trực tuyến."
  }
  ```
- **Xử lý nghiệp vụ Backend**:
  * Kiểm tra quyền sở hữu phiếu tư vấn (`ExpertId == CurrentUser.ExpertId`).
  * Kiểm tra hạn SLA 48h: Nếu `slaDeadlineHours <= 0`, từ chối thao tác và trả về mã lỗi `ERR_SLA_EXPIRED`.
  * Ghi nhận cập nhật trạng thái phiếu và lịch sử xử lý trong giao dịch CSDL nguyên tử.
  * Trả về kết quả cập nhật mới nhất cho Client.

#### `REQ-EXP-API-003`: Backend API Danh Sách Dự Án Đồng Hành Kanban (My Projects Kanban API)
- **Tuyến API**: `GET /api/v1/experts/me/projects`
- **Mục đích**: Cung cấp danh sách dự án R&D / Tech Transfer cho bảng Kanban 5 cột theo thang TRL 1-9.
- **Xác thực & Ủy quyền**: `Bearer Token` - Vai trò `VERIFIED_EXPERT`.
- **Tham số truy vấn**: `stage` (tùy chọn: `NDA_RECEIVE` | `DEAL_ROOM_1_1` | `TRL_ASSESSMENT` | `MOU_SIGNING` | `TRANSFER_COMPLETION`), `keyword` (tùy chọn).
- **Hợp đồng DTO (`ExpertProjectDto`)**:
  * `projectCode` (string): Mã định danh dự án KH&CN (ví dụ: `PRJ-RD-2026-004`).
  * `title` (string): Tên nhiệm vụ / dự án đồng hành R&D.
  * `stage` (string): Giai đoạn tương ứng trên 5 cột Kanban.
  * `securityStatus` (string): Mức độ bảo mật (`STRICT_CONFIDENTIAL` | `INTERNAL` | `PUBLIC_DOMAIN`).
  * `partnerOrgName` (string): Doanh nghiệp / Tổ chức đối tác.
  * `sectorCode` (string): Mã ngành KH&CN theo QĐ 12/2008/QĐ-BKHCN.
  * `sectorName` (string): Tên lĩnh vực KH&CN.
  * `currentTrl` (number): Mức TRL hiện tại (1 - 9).
  * `currentTrlLabel` (string): Nhãn mô tả TRL hiện tại.
  * `targetTrl` (number): Mức TRL mục tiêu (1 - 9).
  * `targetTrlLabel` (string): Nhãn mô tả TRL mục tiêu.
  * `estimatedValueVnd` (number): Giá trị dự kiến chuyển giao (VNĐ).
  * `deadlineSlaText` (string): Thời hạn hoàn thành chặng hiện tại.
  * `dealRoomUrl` (string): Đường dẫn phòng đàm phán bảo mật Deal Room 1-1.

---

### 21.3. Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật |
| :--- | :--- | :--- |
| **`BR-EXP-API-001`** | **Phân Quyền Truy Cập Tài Nguyên Chuyên Gia (me/* Pattern)** | - Toàn bộ API lấy dữ liệu cá nhân chuyên gia (`me/*`) phải trích xuất `ExpertId`/`UserId` từ JWT Claims đã xác thực.<br>- Nghiêm cấm nhận `expertId` từ Query/Body để query dữ liệu.<br>- Chuyên gia chỉ được truy xuất và thao tác trên đúng phiếu tư vấn và dự án do mình làm chủ nhiệm/tham gia; vi phạm trả về `403 Forbidden` ngay tại tầng API Gateway/Controller.<br>- Ngăn chặn 100% nguy cơ IDOR và rò rỉ dữ liệu chéo người dùng. |
| **`BR-EXP-API-002`** | **SLA Phản Hồi 48h & Giao Dịch Phản Hồi Nguyên Tử (Atomic Response)** | - Phiếu tư vấn gửi tới chuyên gia có thời hạn phản hồi nghiêm ngặt 48 giờ tính từ thời điểm tạo.<br>- Khi `slaDeadlineHours <= 0`, phiếu tự động chuyển trạng thái `SLA_EXPIRED`, hệ thống khóa chức năng Chấp thuận.<br>- Hành động phản hồi (`ACCEPT` / `REJECT`) được thực thi trong Transaction CSDL nguyên tử: cập nhật trạng thái phiếu tư vấn, lưu log vết kiểm toán và thông báo sang phía Doanh nghiệp/Sở KH&CN.<br>- Nếu bất kỳ bước nào thất bại, toàn bộ giao dịch rollback, đảm bảo tính toàn vẹn CSDL. |

---

### 21.4. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria - Gherkin Format)

#### `AC-API-01`: Tích Hợp Zero-Mock Endpoint Hộp Thư Tư Vấn & Phản Hồi Nguyên Tử (Atomic Response)
- **Given** người dùng đăng nhập với vai trò Chuyên gia (`VERIFIED_EXPERT`),
- **When** người dùng mở trang Hộp thư Tư vấn (`/portal/expert/consultations`),
- **Then**:
  - Frontend gọi API `GET /api/v1/experts/me/consultations` kèm Bearer Token xác thực.
  - Tuyệt đối không nạp mảng `INITIAL_CONSULTATIONS` tĩnh vào component.
  - Component `<Async>` hiển thị Skeleton loading trong lúc gọi API, hiển thị Empty state nếu không có phiếu, và hiển thị danh sách thẻ phiếu tư vấn thật từ CSDL PostgreSQL khi thành công.
  - Trên mỗi thẻ phiếu tư vấn hiển thị đầy đủ: `ticketCode`, `enterpriseName`, `demandTitle`, `meetingDate`, `meetingTime`, hình thức họp kèm badge SLA 48h.
- **Given** một phiếu tư vấn ở trạng thái `PENDING_ACCEPTANCE` có `slaDeadlineHours > 0`,
- **When** chuyên gia bấm nút "Tiếp nhận" (hoặc "Từ chối" kèm lý do),
- **Then**:
  - Frontend gửi request `POST /api/v1/experts/me/consultations/{id}/respond` với action tương ứng.
  - Backend cập nhật trạng thái trong Transaction CSDL PostgreSQL và trả về `200 OK`.
  - Frontend cập nhật tức thì trạng thái của thẻ phiếu tư vấn sang `SCHEDULED` (hoặc `REJECTED`) và hiển thị Toast Notification thông báo thành công mà không làm vỡ giao diện.

#### `AC-API-02`: Tích Hợp Zero-Mock Endpoint Dự Án Đồng Hành Kanban Phản Ánh Trạng Thái TRL Thực Tế Từ CSDL
- **Given** người dùng đăng nhập với vai trò Chuyên gia (`VERIFIED_EXPERT`),
- **When** người dùng truy cập trang Dự án Đồng hành (`/portal/expert/projects`),
- **Then**:
  - Frontend gọi API `GET /api/v1/experts/me/projects` lấy danh sách dự án KH&CN của chuyên gia.
  - Tuyệt đối không sử dụng mảng dữ liệu tĩnh `INITIAL_PROJECTS` trong frontend code.
  - Dữ liệu trả về được phân bổ tự động vào 5 cột Kanban theo trường `stage`:
    * Cột 1: Tiếp nhận & Ký NDA (`NDA_RECEIVE`)
    * Cột 2: Đàm phán Deal Room 1-1 (`DEAL_ROOM_1_1`)
    * Cột 3: Thẩm định TRL & Lộ trình Tech (`TRL_ASSESSMENT`)
    * Cột 4: Ký kết Thỏa thuận MOU (`MOU_SIGNING`)
    * Cột 5: Đồng hành Chuyển giao & Nghiệm thu (`TRANSFER_COMPLETION`)
  - Mỗi thẻ dự án hiển thị chính xác: `projectCode`, `title`, đối tác, lĩnh vực KH&CN, nhãn TRL hiện tại $\rightarrow$ TRL mục tiêu, giá trị dự kiến và liên kết phòng Deal Room.
  - Khi cột không có dự án, hiển thị Empty State theo đúng chuẩn thiết kế kèm nút hành động định hướng (ví dụ: "Tìm kiếm dự án tại Radar").

---

### 21.5. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kỹ Thuật (Surface) | Vị Trí Tệp Mã Nguồn / Spec | Bản Chất Tác Động | Chi Tiết Thay Đổi Cần Thực Hiện |
| :--- | :--- | :--- | :--- |
| **Backend API Controller** | `SourceCode/backend/src/NacenTwin.Api/Controllers/ExpertConsultationsController.cs`<br>`ExpertProjectsController.cs` | REST API Endpoints | - Hiện thực `GET /api/v1/experts/me/consultations`, `POST /api/v1/experts/me/consultations/{id}/respond`.<br>- Hiện thực `GET /api/v1/experts/me/projects`.<br>- Phân quyền Scoped RBAC `VERIFIED_EXPERT`. |
| **Backend Domain & Application** | `SourceCode/backend/src/NacenTwin.Application/Features/Experts/Queries/`<br>`Commands/` | CQRS Handlers & DTOs | - Tạo `GetMyConsultationsQuery`, `RespondConsultationCommand`.<br>- Tạo `GetMyProjectsQuery`.<br>- Triển khai các DTO: `ConsultationTicketDto`, `ExpertProjectDto`.<br>- Xử lý ràng buộc SLA 48h (`BR-EXP-API-002`). |
| **PostgreSQL Database** | `SourceCode/backend/src/NacenTwin.Infrastructure/Persistence/` | EF Core Entities & Migrations | - Bổ sung/đồng bộ entities `ConsultationTicket`, `ExpertProject` vào DbContext.<br>- Đảm bảo migration non-destructive. |
| **Frontend Consultation Inbox** | `SourceCode/frontend/src/app/portal/expert/consultations/page.tsx`<br>`SourceCode/frontend/src/services/expert-consultation.service.ts` | UI View & API Client | - Xóa sạch mảng tĩnh `INITIAL_CONSULTATIONS`.<br>- Tích hợp gọi API qua service client.<br>- Bọc dữ liệu bằng component `<Async>`, xử lý Loading/Error/Empty/Success states. |
| **Frontend Expert Projects Kanban** | `SourceCode/frontend/src/app/portal/expert/projects/page.tsx`<br>`SourceCode/frontend/src/services/expert-project.service.ts` | UI View & API Client | - Xóa sạch mảng tĩnh `INITIAL_PROJECTS`.<br>- Tích hợp gọi API qua service client.<br>- Hiển thị thẻ Kanban từ dữ liệu backend thực tế. |
| **Basic Design Delta** | `Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md` | SSOT Kiến trúc Cơ sở | - Đồng bộ Quyết định `PO-DEC-20261023-03` tại Mục 10. |

---

### 21.6. Ma Trận Truy Vết Nghiệp Vụ (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-API-001`** | Functional Req | My Consultations API | `GET /api/v1/experts/me/consultations`, phân quyền `VERIFIED_EXPERT`, lấy danh sách phiếu tư vấn | `[CONFIRMED]` |
| **`REQ-EXP-API-002`** | Functional Req | Consultation Response API | `POST /api/v1/experts/me/consultations/{id}/respond`, tiếp nhận/từ chối nguyên tử (Atomic), kiểm tra SLA 48h | `[CONFIRMED]` |
| **`REQ-EXP-API-003`** | Functional Req | My Projects Kanban API | `GET /api/v1/experts/me/projects`, danh sách dự án R&D theo 5 cột Kanban TRL 1-9 | `[CONFIRMED]` |
| **`BR-EXP-API-001`** | Business Rule | Phân Quyền me/* Pattern | Trích xuất danh tính từ JWT Claims, chống IDOR và rò rỉ dữ liệu chéo | `[CONFIRMED]` |
| **`BR-EXP-API-002`** | Business Rule | SLA Phản Hồi 48h & Atomic Response | Khóa phiếu khi quá hạn 48h (`SLA_EXPIRED`), cập nhật nguyên tử trong DB transaction | `[CONFIRMED]` |
| **`AC-API-01`** | Acceptance Criteria | Kiểm Thử Zero-Mock Hộp Thư Tư Vấn | Xóa bỏ mock tĩnh, kết nối backend CSDL PostgreSQL, phản hồi nguyên tử | `[CONFIRMED]` |
| **`AC-API-02`** | Acceptance Criteria | Kiểm Thử Zero-Mock Dự Án Đồng Hành | Xóa bỏ mock tĩnh, nạp dự án thực tế vào 5 cột Kanban theo thang TRL 1-9 | `[CONFIRMED]` |
| **`UI-EXP-CONSULT-ZERO-MOCK`** | UI/UX Spec | Giao Diện Hộp Thư Tư Vấn Zero-Mock | 3 Tab nghiệp vụ, hiển thị 5 UX States qua `<Async>`, badge SLA 48h | `[CONFIRMED]` |
| **`UI-EXP-PROJ-ZERO-MOCK`** | UI/UX Spec | Giao Diện Kanban Dự Án Zero-Mock | 5 Cột Kanban TRL 1-9, thẻ dự án chuẩn KH&CN, không nút giám sát Sở | `[CONFIRMED]` |

---

## Spec Delta v22: Smart AI CV Onboarding (Bóc tách & Điền form toàn diện)

### 22.1. Bối Cảnh & Mục Tiêu Nghiệp Vụ

Nhằm triệt tiêu rào cản thời gian và công sức khi nhà khoa học phải tự tay nhập liệu hơn 90 trường thông tin hồ sơ lý lịch khoa học (LLKH), hệ thống nâng cấp trải nghiệm Onboarding lên chuẩn **Smart AI CV Onboarding**:
1. **Dời Trọng Tâm Lên Bước 1 (Entry-point Elevation)**: Đưa Hero Dropzone *"AI Trích Xuất Dữ Liệu Hồ Sơ Tự Động (AI CV Scan)"* lên ngay đầu **Bước 1 ("Quét CV & Định danh")** của Form Wizard, biến thao tác kéo thả CV thành cửa ngõ tự động hóa toàn diện.
2. **Bóc Tách Toàn Diện 94 Trường Sheet `C.gia`**: Dùng mô hình đa phương thức (Google Gemini Multimodal API) kết hợp Structured JSON Outputs để đọc hiểu tệp CV/LLKH (PDF, DOCX, Ảnh scan) và tự động điền đồng thời vào cả 3 bước (Định danh, Năng lực chuyên môn, Công bố/Sáng chế/Đề tài).
3. **Bảo Tồn Dữ Liệu Người Dùng (Non-destructive) & Không Đóng Băng Hệ Thống (Zero-Lock Fallback)**: Đảm bảo người dùng luôn nắm quyền kiểm soát cao nhất (Human-in-the-Loop) và form luôn sẵn sàng cho nhập liệu thủ công trong mọi tình huống.

---

### 22.2. User Story

#### `US-EXP-DELTA-01`: Smart AI CV Onboarding & Tự Động Hóa Biểu Mẫu 3 Bước Chuẩn 94 Trường Sheet `C.gia`
- **User Persona**: Nhà khoa học, Giảng viên đại học, Chuyên gia R&D có sẵn tệp CV / LLKH cá nhân.
- **Mục tiêu**: Nâng hạng tài khoản thành công trong thời gian dưới 3 phút nhờ AI tự động điền sẵn 94 trường thông tin vào Form Wizard 3 bước.

**Acceptance Criteria (Gherkin Format)**:
1. **Scenario 1: Kéo thả tệp CV tại Bước 1 và Kích hoạt Quét In-Memory**
   - **Given** người dùng ở Bước 1 của trang `/profile/upgrade/expert` ("Quét CV & Định danh"),
   - **When** người dùng kéo thả hoặc chọn tải lên tệp CV (định dạng PDF, DOCX, PNG, JPG với dung lượng $\le 20$MB),
   - **Then**:
     - Hệ thống tiếp nhận tệp, hiển thị tiến trình quét (0% $\rightarrow$ 100%) kèm Shimmer Animation.
     - Tệp được phân tích in-memory hoặc lưu tạm có mã hóa, tuân thủ Nghị định 13/2023/NĐ-CP (PDPD).
     - Backend gọi Google Gemini Multimodal trích xuất schema có cấu trúc theo 94 trường chuẩn hóa.

2. **Scenario 2: Tự Động Điền Dữ Liệu Không Ghi Đè (Non-destructive Auto-fill)**
   - **Given** quá trình bóc tách AI hoàn tất thành công (`success: true`),
   - **When** dữ liệu DTO được đẩy về client,
   - **Then**:
     - Hệ thống tự động điền các trường còn trống trên cả 3 bước:
       * **Bước 1**: Họ tên, Năm sinh, Giới tính, Học vị cao nhất, Năm đạt, Cơ quan, Chức vụ, Google Scholar, ORCID, Scopus ID...
       * **Bước 2**: 18 Ngành TT17, Lĩnh vực OECD, Quá trình đào tạo, Quá trình công tác, Tóm tắt năng lực tư vấn, Từ khóa...
       * **Bước 3**: Danh mục tối đa 5 bài báo Scopus/ISI, Bằng sáng chế/GPHI, Đề tài KH&CN các cấp, Giải thưởng...
     - Tuyệt đối KHÔNG ghi đè lên các trường người dùng đã nhập trước đó hoặc đã chỉnh sửa bằng tay.
     - Các trường được AI điền tự động hiển thị visual badge `"✨ AI Gợi Ý"` và viền màu xanh lá nhạt để người dùng dễ dàng nhận biết và kiểm chứng.

3. **Scenario 3: Dự Phòng Hoàn Hảo & Không Đóng Băng Giao Diện (Zero-Lock Fallback)**
   - **Given** dịch vụ AI gặp sự cố (quá hạn ngạch rate limit `429`, timeout `504`, mất mạng, hoặc tệp tài liệu quá mờ không thể OCR `422`),
   - **When** request trích xuất thất bại,
   - **Then**:
     - Hệ thống hiển thị Toast Notification thông báo lỗi nhẹ nhàng: *"Trợ lý AI tạm thời không phân tích được tệp. Vui lòng tiếp tục nhập liệu thủ công bằng biểu mẫu bên dưới."*
     - Toàn bộ các trường form trên cả 3 bước vẫn mở 100% cho người dùng nhập liệu bằng tay.
     - Tuyệt đối không đóng băng (freeze) giao diện, không khóa nút "Tiếp tục", không ngăn cản luồng nộp hồ sơ chuẩn.

4. **Scenario 4: Kiểm Duyệt Con Người (Human-in-the-Loop) & Nộp Hồ Sơ Chính Thức**
   - **Given** các trường thông tin đã được AI gợi ý trên cả 3 bước,
   - **When** chuyên gia chuyển tiếp qua Bước 2 và Bước 3,
   - **Then**:
     - Chuyên gia có toàn quyền thêm, sửa, xóa bất kỳ dòng thông tin nào (đặc biệt là danh mục đề tài, công bố khoa học).
     - Hệ thống chỉ tiếp nhận nộp hồ sơ khi chuyên gia tích chọn Cam kết PDPD (NĐ 13/2023) và chủ động nhấn nút **[GỬI HỒ SƠ NÂNG CẤP CHUYÊN GIA]** tại Bước 3.

---

### 22.3. Quy Tắc Nghiệp Vụ Bắt Buộc (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật |
| :--- | :--- | :--- |
| **`BR-EXP-CV-01`** | **Non-destructive Auto-fill (Tự Động Điền Không Hủy Dữ Liệu)** | - Khi AI trả về kết quả trích xuất, hệ thống **CHỈ điền tự động vào các trường form đang mang giá trị rỗng/mặc định**.<br>- Nếu một trường đã có dữ liệu do người dùng tự nhập hoặc sửa đổi trước đó, hệ thống giữ nguyên 100% dữ liệu của người dùng, không được phép tự ý ghi đè.<br>- Cung cấp visual indicator `"✨ AI Gợi Ý"` cho phép người dùng click để đối chiếu giữa giá trị người dùng nhập và giá trị AI phát hiện từ CV nếu có sai lệch. |
| **`BR-EXP-CV-02`** | **Zero-Lock Fallback (Dự Phòng Hoàn Hảo Không Khóa Giao Diện)** | - Luồng AI CV Scan là tính năng **gia tăng tốc độ (accelerator)**, KHÔNG PHẢI là điều kiện tiên quyết (prerequisite) để nâng cấp tài khoản.<br>- Nếu phân hệ AI gặp lỗi (mất kết nối, file không hỗ trợ, OCR confidence $< 0.3$, JSON parse error, rate limit), toàn bộ form 3 bước vẫn duy trì trạng thái hoạt động bình thường.<br>- Tuyệt đối không chặn tiến trình người dùng, không disable nút bấm điều hướng Stepper, và không làm mất bất kỳ dữ liệu nào đã nhập. |
| **`BR-EXP-CV-03`** | **PDPD & In-Memory Parsing (Bảo Mật Dữ Liệu Cá Nhân NĐ 13/2023)** | - Tệp CV/LLKH tải lên chỉ phục vụ mục đích trích xuất biểu mẫu, được xử lý in-memory hoặc lưu trữ tạm thời trong bucket ngắn hạn với thời gian tự hủy tối đa 24 giờ.<br>- Dữ liệu định danh cá nhân nhạy cảm (Số CCCD, số điện thoại riêng tư) chỉ được lưu vào CSDL khi người dùng xác nhận nộp hồ sơ ở Bước 3.<br>- Nghiêm cấm sử dụng tệp CV và thông tin khoa học của chuyên gia cho mục đích huấn luyện AI bên thứ ba khi chưa có sự đồng ý bằng văn bản. |
| **`BR-EXP-CV-04`** | **Human-in-the-Loop (Người Dùng Là Chốt Chặn Kiểm Duyệt Cuối Cùng)** | - Mọi kết quả do AI trích xuất chỉ có giá trị là **BẢN NHÁP GỢI Ý (Draft Suggestions)**.<br>- Chuyên gia bắt buộc phải trực tiếp rà soát, kiểm chứng và xác nhận dữ liệu trên cả 3 bước.<br>- Hệ thống tuyệt đối không tự động nộp hồ sơ (`auto-submit`) và không tự động gán trạng thái `VERIFIED_EXPERT` nếu không có thao tác xác nhận chủ động từ người dùng kèm cam kết pháp lý. |

---

### 22.4. Ma Trận Data Mapping 94 Trường Sheet `C.gia` Sang Form Wizard 3 Bước

Toàn bộ 94 trường trích xuất từ Sheet `C.gia` (Master Excel `Nacentwin_20260924_bo_loc_da_sua.xlsx`) được phân bổ chính xác vào 3 bước của Form Wizard:

#### 1. Bước 1: Quét CV & Định Danh Khoa Học (22 Trường Chuẩn Hóa)
| STT | Tên Trường DTO / Form Field | Nhãn Giao Diện | Kiểu Dữ Liệu | Ràng Buộc Nghiệp Vụ | Dòng Sheet `C.gia` |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 1 | `ai_cv_file` | Tệp CV/LLKH nguồn | File (PDF/DOCX) | Tối đa 20MB, đầu vào kích hoạt trích xuất AI | Dòng 65-66, 79 |
| 2 | `full_name` | Họ và tên đầy đủ | String | Bắt buộc, 2 - 100 ký tự | Dòng 83 |
| 3 | `birth_year` | Năm sinh | Integer (YYYY) | Bắt buộc, $1940 \le \text{Năm sinh} \le 2005$ | Dòng 84 |
| 4 | `gender` | Giới tính | Enum (M/F/O) | `Nam`, `Nữ`, `Khác` | Dòng 85 |
| 5 | `academic_rank` | Học hàm khoa học | Enum | `Không có`, `Phó Giáo sư (PGS)`, `Giáo sư (GS)` | Dòng 86 |
| 6 | `academic_rank_year` | Năm được phong học hàm | Integer (YYYY) | Bắt buộc nếu chọn PGS/GS | Dòng 87 |
| 7 | `highest_degree` | Học vị cao nhất | Enum | Bắt buộc: `TS`, `ThS`, `KS`, `Cử nhân`, `TSKH` | Dòng 88 |
| 8 | `degree_year` | Năm đạt học vị | Integer (YYYY) | Bắt buộc, năm tốt nghiệp văn bằng cao nhất | Dòng 89 |
| 9 | `id_card_number` | Số Căn cước công dân | String (12 số) | Chuẩn 12 chữ số Bộ Công an, mã hóa AES-256 | Dòng 90 |
| 10 | `id_card_issue_date` | Ngày cấp CCCD | Date | $\le$ Ngày hiện tại | Dòng 91 |
| 11 | `id_card_issue_place` | Nơi cấp CCCD | String | Cục CSQLHC về TTXH hoặc Công an tỉnh/TP | Dòng 91 |
| 12 | `id_card_front_file` | Ảnh mặt trước CCCD | File Upload | JPG/PNG/PDF $\le 10$MB | Dòng 77 |
| 13 | `id_card_back_file` | Ảnh mặt sau CCCD | File Upload | JPG/PNG/PDF $\le 10$MB | Dòng 77 |
| 14 | `portrait_image` | Ảnh chân dung 3x4 | File Upload | Ảnh nền sáng, định dạng JPG/PNG $\le 5$MB | Dòng 67 |
| 15 | `degree_certificate_file` | Bản scan văn bằng cao nhất | File Upload | PDF/Ảnh scan bằng gốc | Dòng 78 |
| 16 | `organization_name` | Cơ quan / Đơn vị công tác | String | Tên Viện, Trường, Trung tâm, Doanh nghiệp | Dòng 98 |
| 17 | `organization_address` | Địa chỉ cơ quan | String | Địa chỉ trụ sở nơi công tác | Dòng 101 |
| 18 | `research_title` | Chức danh nghiên cứu | String | Nghiên cứu viên, Giảng viên cao cấp, Kỹ sư chính | Dòng 92 |
| 19 | `management_position` | Chức vụ quản lý | String | Trưởng phòng, Viện trưởng, Trưởng Lab... | Dòng 93 |
| 20 | `google_scholar_url` | Google Scholar URL | URL Format | Link hồ sơ bài báo khoa học quốc tế | Dòng 94 |
| 21 | `orcid_id` | ORCID iD | String (16 ký tự) | Định danh nhà khoa học toàn cầu (xxxx-xxxx-xxxx-xxxx) | Dòng 95 |
| 22 | `scopus_author_id` | Scopus Author ID | String | Mã tác giả Scopus (Elsevier) | Dòng 96 |

#### 2. Bước 2: Năng Lực Chuyên Môn & Tiến Trình Đào Tạo - Công Tác (36 Trường Chuẩn Hóa)
| STT | Tên Trường DTO / Form Field | Nhãn Giao Diện | Kiểu Dữ Liệu | Ràng Buộc Nghiệp Vụ | Dòng Sheet `C.gia` |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 23-28 | `expertise_sectors` | 18 Ngành công nghiệp TT17 | Multi-Select | Bắt buộc chọn ít nhất 1 ngành trọng điểm | Dòng 147 |
| 29-34 | `oecd_fields` | 6 Lĩnh vực KH&CN (OECD) | Multi-Select | Tự nhiên, Kỹ thuật, Y dược, Nông nghiệp, Xã hội, Nhân văn | Master Data |
| 35-44 | `training_history` | Quá trình đào tạo (ĐH/ThS/TS) | Dynamic Table | 4 cấp độ: Bậc học, Nơi đào tạo, Chuyên ngành, Năm tốt nghiệp, Luận án | Dòng 102-106 |
| 45-54 | `employment_history` | Quá trình công tác chuyên môn | Dynamic Table | Giai đoạn (từ năm - đến năm), Cơ quan, Vị trí, Địa điểm | Dòng 107-111 |
| 55 | `consulting_summary` | Tóm tắt năng lực tư vấn | Textarea | Mô tả sâu công nghệ, giải pháp thế mạnh | Dòng 151 |
| 56-57 | `mastered_tech_codes` | Nhóm công nghệ làm chủ | Multi-Select | Danh mục 34 công nghệ chuẩn hóa (CN01 -> CN39) | Ma trận LV-CN |
| 58 | `research_keywords` | Từ khóa chuyên môn (Keywords) | Array of String | Tối đa 10 từ khóa lĩnh vực mũi nhọn | Dòng 148 |

#### 3. Bước 3: Hồ Sơ Khoa Học, Đăng Ký Nhiệm Vụ & Cam Kết Pháp Lý (36 Trường Chuẩn Hóa)
| STT | Tên Trường DTO / Form Field | Nhãn Giao Diện | Kiểu Dữ Liệu | Ràng Buộc Nghiệp Vụ | Dòng Sheet `C.gia` |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 59-68 | `publications` | Công bố khoa học tiêu biểu | Dynamic Table | Tối đa 5 bài báo: Tên bài báo, Tác giả, Tạp chí, Năm, DOI, ISI/Scopus | Dòng 112-117 |
| 69-74 | `patents` | Bằng độc quyền sáng chế / GPHI | Dynamic Table | Tên sáng chế, Số văn bằng, Năm cấp, Quốc gia/Cục SHTT | Dòng 118-121 |
| 75-79 | `practical_projects` | Công trình ứng dụng thực tế | Dynamic Table | Tên công nghệ, Đơn vị tiếp nhận, Quy mô, Kết quả áp dụng | Dòng 122-126 |
| 80-86 | `research_projects` | Đề tài/Dự án KH&CN các cấp | Dynamic Table | Tên đề tài, Cấp (Nhà nước/Bộ/Cơ sở), Vai trò, Năm, Đánh giá nghiệm thu | Dòng 127-131 |
| 87-90 | `awards` | Giải thưởng KH&CN đã đạt | Dynamic Table | Tên giải thưởng, Cơ quan trao thưởng, Năm trao thưởng | Dòng 132-136 |
| 91 | `is_project_leader` | Đăng ký Chủ nhiệm nhiệm vụ KH&CN | Boolean (Checkbox) | Yêu cầu học vị $\ge$ Tiến sĩ hoặc xác nhận chủ nhiệm cấp Bộ | Dòng 75 |
| 92 | `is_main_contributor` | Đăng ký Thành viên nghiên cứu chính | Boolean (Checkbox) | Đăng ký tham gia nhóm nghiên cứu trọng điểm | Dòng 76 |
| 93 | `pdpd_consent` | Cam kết bảo vệ dữ liệu PDPD | Boolean (Checkbox) | Bắt buộc tích theo Nghị định 13/2023/NĐ-CP | Dòng 155 |
| 94 | `legal_oath` | Cam kết trung thực & Pháp lý | Boolean (Checkbox) | Bắt buộc tích: Chịu trách nhiệm hoàn toàn về tính chính xác | Dòng 155 |

---

### 22.5. Ma Trận Truy Vết Nghiệp Vụ Delta v1.3 (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-CV-001`** | Functional Req | Hero AI CV Dropzone Bước 1 | Đưa Dropzone bóc tách CV lên đầu Bước 1 Wizard `/profile/upgrade/expert` | `[CONFIRMED]` |
| **`REQ-EXP-CV-002`** | Functional Req | Bóc Tách 94 Trường Sheet C.gia | Gọi Google Gemini Multimodal trích xuất schema có cấu trúc chuẩn 94 trường | `[CONFIRMED]` |
| **`REQ-EXP-CV-003`** | Functional Req | Non-destructive Auto-fill | Tự động điền giá trị vào form cả 3 bước mà không ghi đè dữ liệu người dùng | `[CONFIRMED]` |
| **`REQ-EXP-CV-004`** | Functional Req | Zero-Lock Fallback Form | Khi lỗi AI hoặc ngắt mạng, mở 100% form thủ công, không chặn tiến trình | `[CONFIRMED]` |
| **`BR-EXP-CV-01`** | Business Rule | Điền Form Không Ghi Đè | Chỉ điền ô trống, hiển thị visual badge `"✨ AI Gợi Ý"` | `[CONFIRMED]` |
| **`BR-EXP-CV-02`** | Business Rule | Dự Phòng Zero-Lock | Form hoạt động bình thường kể cả khi dịch vụ AI sập hoặc timeout | `[CONFIRMED]` |
| **`BR-EXP-CV-03`** | Business Rule | Bảo Vệ Dữ Liệu PDPD NĐ 13 | Xử lý CV in-memory, không lưu vĩnh viễn PII khi chưa submit | `[CONFIRMED]` |
| **`BR-EXP-CV-04`** | Business Rule | Human-in-the-Loop | Bản nháp gợi ý, người dùng rà soát 3 bước và chủ động nộp hồ sơ | `[CONFIRMED]` |
| **`UI-EXP-CV-01`** | UI/UX Spec | Wireframe Stepper Mới | Bước 1: "Quét CV & Định danh", Bước 2: "Năng lực Chuyên môn", Bước 3: "Công bố & Cam kết" | `[CONFIRMED]` |
| **`UI-EXP-CV-02`** | UI/UX Spec | 5 UX States Scanner | Idle $\rightarrow$ Scanning Shimmer $\rightarrow$ Success Auto-fill $\rightarrow$ Error Fallback Toast $\rightarrow$ Partial Review | `[CONFIRMED]` |

---

## 23. PHỤ LỤC DELTA V1.6 (CR-2026-011): CHUẨN HÓA ĐỒNG BỘ 10 LĨNH VỰC TT17 CHO BỘ LỌC CHUYÊN GIA KH&CN

### 23.1 Mục Tiêu & Ranh Giới Chuẩn Hóa
- **Chuẩn hóa danh mục ngành**: Phân hệ Danh bạ Chuyên gia (`/experts`) và Hồ sơ Chuyên gia (`/portal/expert/*`) thống nhất sử dụng duy nhất **10 Lĩnh vực công nghệ trọng điểm TT17** khớp 1:1 với CSDL Master Data `policy.taxonomy_terms`.
- **Khai tử thuật ngữ 18 ngành**: Thay thế toàn bộ các nhãn và trường mô tả cũ "18 Ngành công nghiệp TT17" thành "10 Lĩnh Vực Công Nghệ Trọng Điểm TT17".

### 23.2 Đặc Tả Yêu Cầu Kỹ Thuật
- **`REQ-EXP-DELTA-01` (Bộ Lọc Ngành Khớp 10 Lĩnh Vực CSDL)**:
  - Danh bạ chuyên gia nạp bộ lọc ngành từ `getPublicExpertFilterOptions()` (`GET /api/v1/sectors`).
  - Dropdown lọc ngành hiển thị đúng 10 mã và tên chuẩn (`LV01`, `LV05`, `LV07`, `LV08`, `LV11`, `LV12`, `LV14`, `LV15`, `LV16`, `LV17`).
  - Tham số `sectorCodes` gửi xuống API `/api/v1/public/experts` phải đối soát trực tiếp theo `primary_sector_code` và mảng `expertise_sectors` trong CSDL PostgreSQL.
- **`AC-EXP-DELTA-01` (Kiểm Thử Bộ Lọc Chuyên Gia)**:
  - Given người dùng tích chọn lĩnh vực `LV07` (Cơ khí – chế tạo – công nghiệp hỗ trợ),
  - When hệ thống tải danh sách chuyên gia,
  - Then toàn bộ kết quả trả về là các chuyên gia có lĩnh vực công tác chính hoặc chuyên môn hẹp thuộc ngành cơ khí.

---

## 24. PHỤ LỤC DELTA V1.4 (CR-2026-012): MỞ RỘNG QUYỀN MUA HÀNG & ĐĂNG NHU CẦU TRONG WORKSPACE CHUYÊN GIA KH&CN

### 24.1. Bối Cảnh & Cơ Sở Quyết Định PO
- **Căn cứ quyết định**: Quyết định PO `PO-DEC-20261030-04` và cập nhật Thiết kế Cơ sở `BASIC_DESIGN_NACENTECH.md` Mục 5.3.3.
- **Vấn đề thực tế**: Chuyên gia KH&CN (`VERIFIED_EXPERT`, `EXPERT`) trong các viện nghiên cứu, trường đại học thường là Chủ nhiệm đề tài hoặc Trưởng phòng thí nghiệm. Họ có nhu cầu mua sắm thiết bị, mẫu thử nghiệm, sản phẩm thương mại OCOP từ các Nhà cung ứng (Seller), đồng thời có nhu cầu đăng bài toán nhu cầu R&D liên ngành tìm kiếm đối tác liên kết.
- **Khắc phục lỗi đứt gãy luồng người dùng**: Trước đây Workspace Chuyên gia chỉ có 7 mục menu tập trung vào tư vấn và nghiên cứu, hoàn toàn thiếu menu quản lý đơn hàng và nhu cầu. Khi Chuyên gia đặt mua sản phẩm tại Sàn chào bán và nhấn nút CTA *"Theo dõi đơn hàng trong Workspace →"*, thanh Sidebar Chuyên gia không có menu tương ứng, gây đứt gãy trải nghiệm.

---

### 24.2. Yêu Cầu Chức Năng Mới (Functional Requirements)

#### `REQ-EXP-COMMERCE-001` — Quyền Mua Sắm & Quản Lý Đơn Đặt Mua Thương Mại
- Tài khoản `VERIFIED_EXPERT` và `EXPERT` được quyền đặt mua sản phẩm thương mại, mẫu thử nghiệm trực tiếp tại Sàn Chào Bán (`/chao-ban-cong-nghe/[id]`).
- Mọi yêu cầu tạo đơn gửi tới `POST /api/v1/demands/items` tự động đính kèm JWT Bearer Token, gán `CreatedBy = Actor.PersonId`, sinh mã đơn định danh `ORD-YYYYMMDD-XXXXX`.
- Chuyên gia được quản lý toàn bộ đơn đặt mua của mình tại **Tab 1: Đơn mua sản phẩm thương mại** trên Bàn làm việc `/portal/buyer/demands?tab=commercial`.
- Giao diện tích hợp thành phần `OrderTrackingStepper` hiển thị 4 bước tuyến tính: `SUBMITTED` $\rightarrow$ `PROCESSING` $\rightarrow$ `NEGOTIATING` $\rightarrow$ `COMPLETED`.
- Cho phép Chuyên gia chủ động bấm "Hủy đơn hàng" khi đơn hàng đang ở trạng thái `SUBMITTED`.

#### `REQ-EXP-DEMAND-001` — Quyền Đăng Bài Toán Nhu Cầu R&D & Quản Lý Nhu Cầu Cá Nhân
- Chuyên gia được quyền mở biểu mẫu đăng nhanh nhu cầu công nghệ (`QuickDemandModal`) ngay trong Workspace cá nhân.
- Hệ thống tự động tính điểm chỉ số nhu cầu công nghệ (TNI Score: K, L, N, O) và xếp loại TNI tương ứng, lưu vào CSDL với trạng thái `PENDING`.
- Chuyên gia theo dõi danh sách bài toán, tiến độ thẩm định của Sở KH&CN, và số lượng hồ sơ nguồn cung ghép nối tại **Tab 2: Nhu cầu R&D / Bài toán công nghệ** (`/portal/buyer/demands?tab=demands`).

#### `REQ-EXP-NAV-003` — Chuẩn Hóa Cấu Trúc Sidebar Workspace Chuyên Gia 8 Mục
Thanh điều hướng Sidebar cho vai trò Chuyên gia (`expertNavItems`) được cấu hình gồm **8 mục** phân bổ theo 3 khối logic chặt chẽ:

1. **Khối 1: Tác nghiệp hàng ngày (Daily Operations)**:
   - **Mục 1**: `Tổng quan Chuyên gia` — URL: `/portal/expert/profile` (Icon: `LayoutDashboard`)
   - **Mục 2**: `Hộp Thư Tư Vấn & Kết Nối` — URL: `/portal/expert/consultations` (Icon: `Inbox`, Badge: SLA đếm ngược)
   - **Mục 3**: `Radar Cơ hội Phù hợp (AI)` — URL: `/portal/matching/radar` (Icon: `Sparkles`, Badge: "Mới")
   - **Mục 4**: `Dự án Đồng hành & Hợp tác` — URL: `/portal/expert/projects` (Icon: `Kanban`)
   - **Mục 5**: `Đơn hàng & Nhu cầu đặt mua` — URL: `/portal/buyer/demands` (Icon: `ShoppingBag`) *(MỚI)*
2. **Khối 2: Kinh tế & Hợp đồng (Economics & Contracts)**:
   - **Mục 6**: `Hợp đồng & Thù lao` — URL: `/portal/expert/contracts` (Icon: `FileText`, Trạng thái: `disabled: true`, Badge: "Sắp ra mắt")
3. **Khối 3: Hồ sơ & Quản trị (Profile & Settings)**:
   - **Mục 7**: `Hồ sơ LLKH của tôi` — URL: `/portal/expert/profile/edit` (Icon: `GraduationCap`)
   - **Mục 8**: `Cài đặt & Tài khoản` — URL: `/portal/expert/account` (Icon: `ShieldCheck`)

---

### 24.3. Quy Tắc Nghiệp Vụ (Business Rules)

- **`BR-EXP-015` (Bảo Vệ Chống IDOR Trên Đơn Hàng & Nhu Cầu Chuyên Gia)**:
  * Truy vấn danh sách đơn hàng và bài toán tại `/api/v1/buyer/demands` luôn gắn chặt điều kiện `CreatedBy == Actor.PersonId` đối với Chuyên gia.
  * Chuyên gia tuyệt đối không nhìn thấy đơn mua hoặc bài toán chưa công bố của các Doanh nghiệp hoặc Chuyên gia khác.
- **`BR-EXP-016` (Đồng Bộ Dẫn Hướng CTA Từ Sàn Chào Bán Sang Workspace Chuyên Gia)**:
  * Khi Chuyên gia tạo đơn mua thành công tại modal `/chao-ban-cong-nghe/[id]`, nút CTA `"Theo dõi đơn hàng trong Workspace →"` dẫn hướng trực tiếp tới `/portal/buyer/demands?tab=commercial`.
  * Tại Bàn làm việc, Sidebar Workspace Chuyên gia tự động highlight mục số 5 *"Đơn hàng & Nhu cầu đặt mua"*.
- **`BR-EXP-017` (Bộ Lọc Danh Sách Đơn Hàng & Bài Toán 5 UX States)**:
  * Trang `/portal/buyer/demands` phải hiển thị đủ 5 trạng thái UX qua component chuẩn `<Async>`: Loading shimmer $\rightarrow$ Empty state (kèm CTA khám phá Sàn hoặc đăng bài toán) $\rightarrow$ Error alert $\rightarrow$ Success state.

---

### 24.4. Tiêu Chí Chấp Thuận (Acceptance Criteria)

- **`AC-EXP-ORD-01`**:
  * **Given** tài khoản Chuyên gia (`VERIFIED_EXPERT`) đã đăng nhập,
  * **When** truy cập sản phẩm thương mại tại `/chao-ban-cong-nghe/[id]` và bấm "Đặt mua sản phẩm",
  * **Then** hệ thống tạo đơn hàng thành công, hiển thị mã `ORD-YYYYMMDD-XXXXX` và cung cấp nút CTA chuyển về Workspace.
- **`AC-EXP-ORD-02`**:
  * **Given** Chuyên gia truy cập `/portal/buyer/demands?tab=commercial`,
  * **Then** hệ thống hiển thị danh sách đơn đặt mua của chính Chuyên gia, bảng chi tiết đơn và `OrderTrackingStepper` 4 bước chính xác.
- **`AC-EXP-DMD-01`**:
  * **Given** Chuyên gia truy cập `/portal/buyer/demands?tab=demands`,
  * **When** bấm "Đăng bài toán nhu cầu mới" và hoàn tất form `QuickDemandModal`,
  * **Then** bài toán được lưu vào CSDL với trạng thái `PENDING`, hiển thị ngay lập tức trong bảng nhu cầu của Chuyên gia.
- **`AC-EXP-NAV-01`**:
  * **Given** tài khoản Chuyên gia đăng nhập vào `/portal/*`,
  * **Then** Sidebar Workspace Chuyên gia hiển thị đúng 8 mục menu; khi URL là `/portal/buyer/demands`, mục số 5 *"Đơn hàng & Nhu cầu đặt mua"* được active nổi bật.

---

### 24.5. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kỹ Thuật (Surface) | Vị Trí Tệp Mã Nguồn / Schema | Bản Chất Tác Động | Chi Tiết Thay Đổi Cần Thực Hiện |
| :--- | :--- | :--- | :--- |
| **Frontend Portal Layout** | `SourceCode/frontend/src/app/portal/layout.tsx`<br>`layout.test.tsx` | Navigation & Active Route Logic | - Bổ sung item số 5 `{ href: "/portal/buyer/demands", label: "Đơn hàng & Nhu cầu đặt mua", icon: ShoppingBag, key: "orders-demands" }` vào `expertNavItems`.<br>- Cập nhật Vitest tests kiểm chứng 8 mục menu. |
| **Frontend Demands Page** | `SourceCode/frontend/src/app/portal/buyer/demands/page.tsx`<br>`page.test.tsx` | View Logic & Context Awareness | - Điều chỉnh hiển thị tiêu đề linh hoạt theo vai trò (Chuyên gia / Doanh nghiệp / Thành viên).<br>- Đảm bảo component 2 Tabs vận hành trơn tru khi `isExpert` truy cập. |
| **Frontend Technology Offer** | `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx` | Order Flow & Modal CTA | - Kiểm tra CTA chuyển hướng `/portal/buyer/demands?tab=commercial` cho Chuyên gia. |
| **Backend API & RBAC** | `backend/apps/api/V1Compat/DemandController.cs` | Controller & Scoped IDOR | - Xác nhận `POST /api/v1/demands/items` và `GET /api/v1/buyer/demands` đã hỗ trợ `Actor.PersonId` cho vai trò `VERIFIED_EXPERT`/`EXPERT`. |
| **Database & Persistence** | PostgreSQL `brokerage.demand_items` | Relational Data | - Tái sử dụng bảng `demand_items` hiện tại với `created_by` và `is_commercial_order`. Không yêu cầu migration mới. |

---

### 24.6. Ma Trận Truy Vết Nghiệp Vụ Delta v1.4 (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-COMMERCE-001`** | Functional Req | Đơn Hàng Mua Sắm Chuyên Gia | Đặt mua sản phẩm tại Sàn và theo dõi Stepper 4 bước | `[CONFIRMED]` |
| **`REQ-EXP-DEMAND-001`** | Functional Req | Đăng Nhu Cầu R&D Chuyên Gia | Tạo bài toán qua QuickDemandModal và quản lý nhu cầu | `[CONFIRMED]` |
| **`REQ-EXP-NAV-003`** | Functional Req | Sidebar Chuyên Gia 8 Mục | Thêm mục số 5 "Đơn hàng & Nhu cầu đặt mua" | `[CONFIRMED]` |
| **`BR-EXP-015`** | Business Rule | Chống Rò Rỉ IDOR | Chỉ truy xuất đơn hàng/nhu cầu có CreatedBy == Actor.PersonId | `[CONFIRMED]` |
| **`BR-EXP-016`** | Business Rule | Dẫn Hướng CTA Từ Sàn | CTA modal mua hàng dẫn mượt mà về Workspace Chuyên gia | `[CONFIRMED]` |
| **`BR-EXP-017`** | Business Rule | Chuẩn Hóa 5 UX States | Áp dụng <Async> đủ 5 trạng thái tại bàn làm việc đơn hàng | `[CONFIRMED]` |
| **`AC-EXP-ORD-01`** | Acceptance Criteria | Kiểm Thử Đặt Mua Hàng | Test case đặt mua sản phẩm thương mại cho Chuyên gia | `[CONFIRMED]` |
| **`AC-EXP-ORD-02`** | Acceptance Criteria | Kiểm Thử Quản Lý Đơn Mua | Test case bảng đơn hàng và stepper 4 bước | `[CONFIRMED]` |
| **`AC-EXP-DMD-01`** | Acceptance Criteria | Kiểm Thử Đăng Nhu Cầu | Test case tạo nhu cầu và tính điểm TNI cho Chuyên gia | `[CONFIRMED]` |
| **`AC-EXP-NAV-01`** | Acceptance Criteria | Kiểm Thử Sidebar 8 Mục | Test case hiển thị và active route mục 5 Sidebar | `[CONFIRMED]` |

---

## 25. PHỤ LỤC DELTA V1.5 (CR-2026-021): NÂNG CAO ĐỘ CHÍNH XÁC & LÀM GIÀU NGỮ CẢNH BÓC TÁCH AI CV SCAN CHO HỒ SƠ CHUYÊN GIA KH&CN

### 25.1. Bối Cảnh & Cơ Sở Quyết Định PO
- **Căn cứ quyết định**: Quyết định PO `PO-DEC-20261102-03` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 20; Hồ sơ Change Request `deltas/CR-2026-021_ai_cv_scan_precision_enhancement.md`.
- **Dữ liệu thực tế đối soát**: Tệp lý lịch khoa học thực tế `Specification/01_DATA_RAW/LLKH CN/1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc`.
- **4 Khiếm khuyết bóc tách thực tế**:
  1. *Họ và tên*: AI bóc tách được "Bành Quốc Tuấn" nhưng bị Frontend chặn ghi đè vì form khởi tạo sẵn giá trị demo "Dang Lanm".
  2. *Năm đạt học vị*: Học vị Tiến sĩ năm 2011 trong CV không được trích xuất do Schema và Prompt của Gemini thiếu trường `degreeYear` / `degree_year`, dẫn đến UI rơi về năm hiện tại mặc định (2026).
  3. *Cơ quan thẩm định Cấp 2*: Dropdown bị gán cứng 'HP', thiếu logic tự động suy luận theo cơ quan công tác (Viện Ứng dụng Công nghệ, Bộ KH&CN tại Hà Nội phải được gợi ý Cấp 2 là `GLOBAL` hoặc `HN`).
  4. *Lĩnh vực trụ cột công nghệ*: Bị xóa trắng tại backend khi chuyên môn trong CV ("Quang điện tử, laser, bán dẫn") không khớp chính xác 100% chuỗi ký tự với mã danh mục TT17.

---

### 25.2. Yêu Cầu Chức Năng Mới (Functional Requirements)

#### `REQ-EXP-CV-010` — Nâng Cấp Năng Lực Trích Xuất & Tự Động Điền Dữ Liệu Thông Minh Từ Tệp CV/LLKH
Hệ thống nâng cấp toàn diện pipeline trích xuất AI CV Scan tại Bước 1 Wizard `/profile/upgrade/expert`:
1. **Tiếp Nhận Đa Định Dạng**: Tiếp nhận tệp .doc, .docx, .pdf, .png, .jpg (dung lượng $\le 20$MB), chuyển đổi và xử lý in-memory tuân thủ Nghị định 13/2023/NĐ-CP (PDPD).
2. **Bóc Tách Chuẩn Xác 100% Thực Thể Định Danh**: Trích xuất chính xác Họ và tên, Năm sinh, Giới tính, Học vị cao nhất, Năm đạt học vị, Cơ quan công tác, Địa chỉ cơ quan, Chức danh nghiên cứu, Chức vụ quản lý theo chuẩn mẫu B1-4 của Bộ KH&CN.
3. **Làm Giàu Ngữ Cảnh & Tự Động Gợi Ý Phân Cấp (Context Enrichment)**: Tự động phân tích tên và địa chỉ cơ quan công tác để suy luận Cơ quan tiếp nhận thẩm định Cấp 2 (`suggested_review_scope`).
4. **Chuẩn Hóa Ngữ Nghĩa Lĩnh Vực Công Nghệ (Semantic Taxonomy Normalization)**: Tự động ánh xạ lĩnh vực chuyên môn từ văn bản tự nhiên trong CV sang 10 Lĩnh vực trọng điểm TT17 (`LV01` - `LV17`) bằng thuật toán phân tầng (Exact $\rightarrow$ Dictionary $\rightarrow$ Fuzzy Similarity), bảo lưu từ khóa gốc khi không thể map chắc chắn.
5. **Giao Diện Trực Quan Phản Hồi Trạng Thái**: Gắn visual badge `"✨ AI Gợi Ý"` tại các trường được điền tự động để Chuyên gia dễ dàng nhận diện và kiểm chứng.

---

### 25.3. Quy Tắc Nghiệp Vụ Bắt Buộc (Business Rules)

#### `BR-EXP-CV-011` — Quy Tắc Ưu Tiên Cập Nhật Họ Tên Từ CV & Ghi Đè Dữ Liệu Demo/Mặc Định
- Khi AI CV Scan trích xuất thành công trường họ tên (`extracted_full_name`), hệ thống MUST tự động điền vào ô "Họ và tên" nếu giá trị hiện tại trên form là:
  1. Chuỗi rỗng, null hoặc chưa được khởi tạo.
  2. Giá trị demo/placeholder mặc định của hệ thống (ví dụ: `"Dang Lanm"`, `"Người dùng"`, `"Chuyên gia"`, `"User"`).
  3. Hoặc khi người dùng chủ động nhấn nút "Quét lại CV" / "Tải CV mới".
- Frontend TUYỆT ĐỐI KHÔNG được chặn ghi đè đối với các giá trị placeholder/demo này.
- Trường hợp người dùng đã tự tay chỉnh sửa một tên riêng hợp lệ khác với tên demo, hệ thống hiển thị tooltip/banner xác nhận: *"AI phát hiện tên trong CV: [extracted_full_name]. Bấm để áp dụng."*

#### `BR-EXP-CV-012` — Quy Tắc Trích Xuất Bắt Buộc Năm Đạt Học Vị (`degreeYear` / `degree_year`) Trong Schema & Prompt
- Schema trích xuất có cấu trúc (Structured Outputs JSON Schema) gửi lên Gemini Multimodal API và System Prompt BẮT BUỘC định nghĩa trường:
  ```json
  "degree_year": {
    "type": "integer",
    "description": "Năm tốt nghiệp hoặc năm cấp bằng của học vị cao nhất (ví dụ: 2011)"
  }
  ```
- Prompt chỉ dẫn: *"Tìm kiếm năm cấp bằng tốt nghiệp hoặc năm bảo vệ luận án thành công của học vị cao nhất trong phần Đào tạo hoặc Văn bằng chứng chỉ. Ví dụ: 'Tiến sĩ Quang học năm 2011' -> degree_year = 2011"*.
- Frontend Form Wizard Bước 1 bắt buộc ánh xạ trường `degree_year` vào ô "Năm đạt học vị". TUYỆT ĐỐI KHÔNG fallback về năm hiện tại (2026) nếu AI đã trích xuất được giá trị hợp lệ.

#### `BR-EXP-CV-013` — Quy Tắc Tự Động Gợi Ý Cơ Quan Tiếp Nhận Thẩm Định Cấp 2 (Target Review Scope Auto-mapping)
- Hệ thống tự động phân tích ngữ cảnh từ `organization_name` và `organization_address` trích xuất từ CV để suy luận Cơ quan tiếp nhận thẩm định Cấp 2 (`target_review_scope`):
  * **Khối Trung ương / Bộ KH&CN (`GLOBAL`)**:
    - Nếu tên hoặc địa chỉ cơ quan chứa các từ khóa: `"Viện Ứng dụng Công nghệ"`, `"NacenTech"`, `"Bộ Khoa học và Công nghệ"`, `"Bộ KH&CN"`, `"Viện Hàn lâm KH&CN"`, `"Đại học Quốc gia"`, `"Viện Năng lượng nguyên tử"`, các Viện/Cục trực thuộc Bộ KH&CN $\rightarrow$ Tự động gợi ý mã `'GLOBAL'` (Hội đồng KH&CN NacenTech / Trung ương).
  * **Khối Địa phương / Cấp Sở KH&CN Tỉnh (`PROVINCE`)**:
    - Nếu địa chỉ hoặc tên cơ quan thuộc địa bàn tỉnh/thành phố cụ thể $\rightarrow$ Tự động ánh xạ về mã tỉnh/thành tương ứng:
      + Chứa `"Hà Nội"` / `"Ha Noi"` $\rightarrow$ Gợi ý mã `'HN'` (Sở KH&CN TP. Hà Nội).
      + Chứa `"Hải Phòng"` / `"Hai Phong"` $\rightarrow$ Gợi ý mã `'HP'` (Sở KH&CN TP. Hải Phòng).
      + Chứa `"Hồ Chí Minh"` / `"TP.HCM"` / `"TP. Hồ Chí Minh"` $\rightarrow$ Gợi ý mã `'HCM'` (Sở KH&CN TP. Hồ Chí Minh).
      + Chứa `"Đà Nẵng"` / `"Da Nang"` $\rightarrow$ Gợi ý mã `'DN'` (Sở KH&CN TP. Đà Nẵng).
      + Tương tự cho các tỉnh thành khác theo Master Data `ProvinceCodes`.
  * **Cấm hardcode**: Tuyệt đối không gán mặc định `'HP'` cho mọi trường hợp.
  * Dropdown hiển thị giá trị được gợi ý kèm badge `"✨ AI Gợi Ý"`, cho phép chuyên gia thay đổi trước khi submit.

#### `BR-EXP-CV-014` — Quy Tắc Đối Soát Ngữ Nghĩa Cho Lĩnh Vực Trụ Cột Công Nghệ (Semantic/Fuzzy Taxonomy Matching)
- Backend TUYỆT ĐỐI KHÔNG xóa trắng khi chuyên ngành từ CV không khớp chính xác 100% chuỗi ký tự danh mục TT17.
- Quy trình đối soát phân tầng:
  1. *Tầng 1 (Exact Match)*: Khớp chính xác mã ngành (`LV01`..) hoặc tên ngành tiếng Việt.
  2. *Tầng 2 (Keyword/Alias Dictionary)*: Tra cứu từ điển từ khóa chuyên ngành (ví dụ: `"quang điện tử"`, `"laser"`, `"bán dẫn"` $\rightarrow$ `LV08` Vật liệu & Vi điện tử; `"phần mềm"`, `"trí tuệ nhân tạo"`, `"AI"`, `"IoT"` $\rightarrow$ `LV01` CNTT & Truyền thông; `"cảm biến y sinh"` $\rightarrow$ `LV14` Y dược).
  3. *Tầng 3 (Fuzzy Semantic Similarity)*: Tính toán khoảng cách Levenshtein / Token Similarity với ngưỡng tin cậy $\ge 0.60$.
  4. *Tầng 4 (Preserve Raw Extraction)*: Nếu không tự động map được với độ tin cậy cao, Backend MUST giữ nguyên mảng văn bản thô (`raw_extracted_sectors`), trả về cho Frontend hiển thị dưới dạng Badge gợi ý màu vàng để Chuyên gia nhấp chọn 1 click, không làm mất thông tin.

---

### 25.4. Đặc Tả Giao Diện & Trải Nghiệm (UI/UX Specification)

#### `UI-EXP-CV-003` — Trải Nghiệm Điền Form Thông Minh & Gợi Ý Lĩnh Vực
1. **Highlight Trường Điền Tự Động**: Các ô Họ và tên, Năm sinh, Năm đạt học vị, Cơ quan công tác, Cơ quan thẩm định Cấp 2 hiển thị nhãn `"✨ AI Gợi Ý"` cùng hiệu ứng viền màu xanh lá nhạt (`border-emerald-300 bg-emerald-50/30`).
2. **Khối Lĩnh Vực Chuyên Môn**:
   - Các ngành TT17 được AI tự động nhận diện thành công sẽ được tích chọn sẵn trong danh sách checkbox.
   - Bên dưới hiển thị khối gợi ý phụ: *"Từ khóa phát hiện từ CV:"* kèm các thẻ tag pill (`badge`) có thể nhấp để thêm nhanh vào danh sách từ khóa chuyên môn hoặc lĩnh vực tương ứng.
3. **Cơ Chế Dự Phòng (Zero-Lock Fallback)**:
   - Nếu quá trình gọi AI bị lỗi mạng hoặc lỗi tệp, giao diện hiển thị thông báo Toast hướng dẫn và mở toàn bộ các trường để người dùng tự gõ tay, không chặn điều hướng của Wizard.

---

### 25.5. Tiêu Chuẩn Nghiệm Thu & Kịch Bản Kiểm Thử (Acceptance Criteria & Test Suite)

#### `TEST-EXP-CV-005` — Bộ Kịch Bản Kiểm Thử Bóc Tách Tệp LLKH Thực Tế B1-4
- **`AC-EXP-CV-01` (Kiểm Thử Ghi Đè Họ Tên Demo)**:
  * **Given** người dùng truy cập `/profile/upgrade/expert` với tên demo mặc định "Dang Lanm",
  * **When** tải lên tệp `1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc` và kích hoạt AI Scan,
  * **Then** ô "Họ và tên" được cập nhật thành "Bành Quốc Tuấn", hiển thị badge `"✨ AI Gợi Ý"`.
- **`AC-EXP-CV-02` (Kiểm Thử Trích Xuất Năm Đạt Học Vị)**:
  * **Given** tệp CV có thông tin tốt nghiệp Tiến sĩ năm 2011,
  * **When** quá trình bóc tách hoàn tất,
  * **Then** ô "Năm đạt học vị" hiển thị giá trị `2011`, tuyệt đối không rơi về `2026`.
- **`AC-EXP-CV-03` (Kiểm Thử Gợi Ý Cơ Quan Thẩm Định Cấp 2)**:
  * **Given** CV ghi cơ quan "Viện Ứng dụng Công nghệ - Bộ KH&CN, C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
  * **When** hệ thống phân tích ngữ cảnh,
  * **Then** dropdown Cơ quan tiếp nhận thẩm định tự động chọn `GLOBAL` (hoặc `HN`), không còn bị gán cứng `HP`.
- **`AC-EXP-CV-04` (Kiểm Thử Đối Soát Ngữ Nghĩa Lĩnh Vực Công Nghệ)**:
  * **Given** CV chứa các từ khóa chuyên môn "Quang điện tử, laser, đo lường điều khiển, vật liệu bán dẫn",
  * **When** backend đối soát với danh mục TT17,
  * **Then** hệ thống tự động ánh xạ vào `LV08` (Vật liệu mới & Vi điện tử) hoặc hiển thị mảng `raw_extracted_sectors` dạng thẻ tag, không bị xóa trắng.
- **`AC-EXP-CV-05` (Kiểm Thử Dự Phòng Zero-Lock Fallback)**:
  * **Given** dịch vụ AI gặp lỗi kết nối hoặc timeout,
  * **When** quét CV thất bại,
  * **Then** hệ thống thông báo Toast nhẹ nhàng, form mở 100% cho nhập tay, nút "Tiếp tục" không bị khóa.

---

### 25.6. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kỹ Thuật (Surface) | Vị Trí Tệp Mã Nguồn / Schema | Bản Chất Tác Động | Chi Tiết Thay Đổi Cần Thực Hiện |
| :--- | :--- | :--- | :--- |
| **Basic Design (`Specification`)** | `Specification/BASIC_DESIGN_NACENTECH.md` Mục 20 & Mục 10 | Chuẩn Hóa SSOT | Bổ sung `PO-DEC-20261102-03`, `REQ-EXP-CV-010`, `BR-EXP-CV-011..014`. |
| **Delta Ledger (`TASK-05`)** | `specs/TASK-05_.../deltas/CR-2026-021...` | Sổ cái CR | Lưu vết đầy đủ 4 trạng thái vòng đời CR-2026-021 theo chuẩn Hiến pháp Spec. |
| **AI Prompt & Schema** | `NacenTech.Infrastructure.AI/Prompts/ResumePrompt.cs`<br>`DD-02-ai-extractor-contracts.md` | DTO & Prompt Contract | Bổ sung `degree_year`, `suggested_review_scope`, `raw_extracted_sectors` vào Schema trích xuất. |
| **Backend Service Logic** | `NacenTech.Application/Experts/Services/ExpertService.cs`<br>`TaxonomyMatcher.cs` | Logic Đối Soát & Gợi Ý | Thêm thuật toán Fuzzy Match cho lĩnh vực và bộ phân tích địa chỉ cơ quan gợi ý Cấp 2. |
| **Frontend Form Wizard** | `SourceCode/frontend/src/app/(auth)/profile/upgrade/expert/page.tsx` | View & State Management | Hỗ trợ ghi đè tên demo "Dang Lanm"; map `degreeYear`; tự động chọn scope; hiển thị badge AI. |
| **Kiểm Thử 4 Tầng** | `test_cases_4_tier.md` & Playwright E2E | Verification | Xây dựng test suite với tệp mẫu B1-4 kiểm chứng 100% AC-CR-021.1 đến AC-CR-021.6. |

---

### 25.7. Ma Trận Truy Vết Nghiệp Vụ Delta v1.5 (Traceability Matrix)

| Mã Định Danh | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả & Căn Cứ Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-EXP-CV-010`** | Functional Req | AI CV Scan B1-4 Precision | Nâng cấp độ chính xác và làm giàu ngữ cảnh AI CV Scan từ tệp B1-4 | `[APPLIED]` |
| **`BR-EXP-CV-011`** | Business Rule | Ghi Đè Tên Demo Mặc Định | Ưu tiên tên từ CV, ghi đè lên giá trị demo "Dang Lanm" | `[APPLIED]` |
| **`BR-EXP-CV-012`** | Business Rule | Trích Xuất Bắt Buộc degreeYear | Định nghĩa degree_year trong schema và prompt, map đúng năm 2011 | `[APPLIED]` |
| **`BR-EXP-CV-013`** | Business Rule | Gợi Ý Cơ Quan Thẩm Định Cấp 2 | Suy luận scope_id (GLOBAL/HN) theo địa chỉ cơ quan, không hardcode HP | `[APPLIED]` |
| **`BR-EXP-CV-014`** | Business Rule | Đối Soát Ngữ Nghĩa Lĩnh Vực | Fuzzy match ngành TT17, bảo lưu raw sectors, không xóa trắng | `[APPLIED]` |
| **`UI-EXP-CV-003`** | UI/UX Spec | Highlight & Visual Badges | Gắn badge "✨ AI Gợi Ý", thẻ tag unmapped sectors | `[APPLIED]` |
| **`TEST-EXP-CV-005`** | Test Spec | Bộ Test Case Tệp B1-4 | 5 kịch bản kiểm thử Happy Path, Boundary và Zero-Lock Fallback | `[APPLIED]` |
| **`AC-EXP-CV-01`** | Acceptance Criteria | Kiểm Thử Ghi Đè Họ Tên | Kiểm chứng form cập nhật tên "Bành Quốc Tuấn" | `[APPLIED]` |
| **`AC-EXP-CV-02`** | Acceptance Criteria | Kiểm Thử Năm Đạt Học Vị | Kiểm chứng form hiển thị đúng năm 2011 | `[APPLIED]` |
| **`AC-EXP-CV-03`** | Acceptance Criteria | Kiểm Thử Gợi Ý Cấp 2 | Kiểm chứng dropdown gợi ý GLOBAL / HN | `[APPLIED]` |
| **`AC-EXP-CV-04`** | Acceptance Criteria | Kiểm Thử Đối Soát Ngành | Kiểm chứng ngành được map hoặc gợi ý dạng badge | `[APPLIED]` |
| **`AC-EXP-CV-05`** | Acceptance Criteria | Kiểm Thử Zero-Lock Fallback | Kiểm chứng form nhập tay mở 100% khi lỗi AI | `[APPLIED]` |




