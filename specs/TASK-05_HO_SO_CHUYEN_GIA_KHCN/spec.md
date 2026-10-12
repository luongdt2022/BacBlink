# Feature Specification: TASK-05 Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH

**Feature Branch**: `expert-profile-llkh-upgrade`  
**Feature Directory**: `specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Created**: 25/09/2026  
**Status**: Delta v6 planned — xác thực thật & liên kết tài khoản–hồ sơ chuyên gia  
**Ánh Xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md)  
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

## 5. Spec Delta v2: Kênh Tiếp Nhận Nhanh Qua Zalo Mini App (< 2 Phút) & Chuẩn Hóa PDPD

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

## 6. Spec Delta v3: Hoàn chỉnh Data Model Hồ sơ Chuyên gia, Chứng từ và AI Ingestion

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

## 7. Spec Delta v4: Hợp nhất Contract DB — Zalo Mini App — Web Portal

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

## 8. Spec Delta v5: Trang Chi Tiết Chuyên Gia KH&CN

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

## 9. Spec Delta v6: Đăng nhập thật và xem Hồ sơ Full của Chuyên gia

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

## 10. Spec Delta v7: Owner Workspace — View, Edit và Cảnh báo hoàn thiện

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

## 11. Spec Delta v8: Dashboard tác nghiệp chuyên gia

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

## 12. Spec Delta v9: CCCD là dữ liệu lịch sử, không phải input Portal/Zalo

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

## 13. Spec Delta v10: Danh bạ Tìm kiếm & Lọc Chuyên gia Công Khai (`/experts` & `/chuyen-gia`)

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

## 14. Spec Delta v11: Hội tụ danh bạ theo Master Data và tinh gọn UX

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


## Delta v12 - CR-2026-005: Runtime sectors across channels

- **REQ-MD-SECTOR-001**: Web, admin, profile and Zalo sector selectors, lists, labels and counts read the SECTOR taxonomy API/DB; no fixed 10/18 lists or default sector.
- **BR-MD-SECTOR-001**: New selections require an active code. Never replace the selected sector silently with the first record; ask the user to select again when an existing code is inactive.
- **BR-MD-SECTOR-002**: Empty/error responses show empty/error and retry, without sample fallback or success before a valid API response.
- **API-EXP-INTAKE-002**: Zalo reads GET /api/v1/sectors and submits the original active code as sectorCode to the existing quick-intake endpoint.
- **UI-EXP-INTAKE-002**: Show loading/error/empty/success for Zalo taxonomy; prevent submit without an active sector selection.
- **BR-EXP-AI-002**: CV parsing reads active taxonomy before AI; return 503 when taxonomy is unavailable/empty and 502 for an AI sector outside the active list.

This scope supersedes v11 owner/admin/Zalo exclusions for sector data consumption. Specialized keywords remain separate from sectors.

## 13. Delta v13 — close real draft handoff gap

Existing US06/BR-EXP-009/015/017 remain mandatory. Draft lookup uses72h purpose-signed HMAC token with onlySHA256 hash stored in existing DB column; legacy plaintext tokens are rejected. GET does notconsume; authenticated officialsubmit claims originalprofile and clears hash/expiry in samehosttransaction as approval enqueue. Runtimeindustrycode survives handoff, historical inactivecode requires active user selection before submission. No fabricatedAIprogress/prefill is reported. ConfiguredfrontendURL replaces hardcodedhost. Minimal handoff completion does not imply completion of CV ingestion/ZNS pipeline.

---

## 14. Spec Delta v14: Form Chỉnh Sửa Hồ Sơ Chuyên Gia & Completeness Engine

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

