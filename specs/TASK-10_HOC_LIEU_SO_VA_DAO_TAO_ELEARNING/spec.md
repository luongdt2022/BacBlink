# ĐẶC TẢ YÊU CẦU KỸ THUẬT (SPECIFICATION)
## PHÂN HỆ: HỌC LIỆU SỐ & ĐÀO TẠO E-LEARNING (TASK-10)

> **Mã Epic**: `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`  
> **Phiên bản**: v1.1 (Completed — Gate 4 & Gate 5 Verified)  
> **Trạng thái**: Shipped 2026-11-10 (Completed — Gate 4 & Gate 5 Verified · CR-2026-028 Merged)  
> **Cập nhật lần cuối**: 2026-11-10  
> **Ánh xạ Basic Design**: `Specification/02_BASIC_DESIGN/TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING/README.md` & `Specification/BASIC_DESIGN_NACENTECH.md` Mục 32  
> **Nguồn căn cứ**:  
> - Báo cáo chuyên đề: `Specification/01_DATA_RAW/Bao cao chuyen de Khung chuong trinh dao tao so NV nguon cung cong nghe_Draft 1.docx` (Theo Quyết định số 1993/QĐ-BKHCN ngày 01/8/2025 của Bộ trưởng Bộ Khoa học và Công nghệ).  
> - Master Excel: `Tài liệu BA phần mềm Nacentwin 19.10.xlsx` (`HOME1` R48–R51: E-Learning, Học liệu số, Kết nối chuyên gia tư vấn `R50`, Đào tạo tri thức cho Agent AI `R51`).  
> - Bộ 30 kịch bản chi tiết chuẩn BA: `Specification/01_DATA_RAW/New temp/*.xlsx` (30 bài học thực chiến chuyên gia đứng giảng từ BÀI 02 đến BÀI 49).  
> - SRS v1.0: `Specification/01_DATA_RAW/NACENTECH_SRS_V1.0.docx` (Mục 2.3 `US-EL-01` $\rightarrow$ `US-EL-06`).  
> - Quyết định kiến trúc PO: `PO-DEC-20261102-01` $\rightarrow$ `PO-DEC-20261102-06` (Phương án A Native Module) & `PO-DEC-20261110-01` + `PO-DEC-20261110-02` (CR-2026-028: Không gian học tập tương tác 8 thành phần, Khung 50 bài học [30 CG + 20 ĐH], 8 Mô-đun / 5 Lộ trình & Pipeline ETL).  

---

### MỤC 1: TỔNG QUAN HỆ THỐNG & RANH GIỚI NGHIỆP VỤ

1. **Mục tiêu**: Xây dựng kho học liệu số tương tác 8 thành phần chuẩn hóa và nền tảng đào tạo trực tuyến e-learning theo Khung chương trình đào tạo số cấp quốc gia (QĐ 1993/QĐ-BKHCN), phục vụ chuyển giao tri thức đổi mới sáng tạo, kết nối chuyên gia tư vấn (`R50`), cung cấp không gian thực hành bài toán công nghệ (`TASK-03`) và tự động đào tạo tri thức cho Trợ lý ảo AI NacenTwin (`R51`).
2. **Kiến trúc Dual-Surface**:
   - **Bề mặt 1 (`/elearning` & `/elearning/[id]`)**: Cổng Học Liệu Số Công Khai & Không gian học tập tương tác (Bộ lọc đa chiều theo 5 Lộ trình `LT1`–`LT5`, 8 Mô-đun `M1`–`M8`, 6 Cụm chuyên đề A–F, 3 Nhóm chức năng video và Hình thức `CG`/`ĐH`; Playlist 3 Micro-Videos kèm CALL SHEET; Trình phát video HTTP 206 có In-Video Pop-up Quiz tự động dừng hình; Không gian thực hành 13 Biểu mẫu `BM01`–`BM13`; 5 Công cụ Tự đánh giá `TĐG01`–`TĐG05`; Bảng tự chấm điểm 7 tiêu chí mở khóa CTA kép; Bảng tóm tắt kiến thức; Khung hỏi đáp FAQ; Bài kiểm tra trắc nghiệm cuối bài $\ge 60\%$; Cấp Chứng nhận số trực tuyến NACENTECH).
   - **Bề mặt 2 (`/portal/expert/elearning` & `/admin/elearning`)**: Bàn làm việc Quản lý Học liệu số chuẩn 10 cột, Form 4 Tabs A–B–C–D, Modal Gỡ bài có lý do và Xóa mềm.

---

### MỤC 2: TÁC NHÂN & MA TRẬN PHÂN QUYỀN (3D SCOPED RBAC)

| Mã Quyền (Action) | Quyền Hạn Nghiệp Vụ | `ADMIN` (`GLOBAL`) | `VERIFIED_EXPERT` (`SELF` / `PUBLIC`) | `LEARNER` / `BUYER` / `SELLER` | Khách vãng lai (`ANONYMOUS`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `LmsReadCatalog` | Xem danh mục học tập & chi tiết bài học `PUBLISHED` | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| `LmsReadManagement` | Xem bảng quản lý mọi trạng thái (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`) | ✅ Có | ✅ Có | ❌ Không | ❌ Không |
| `LmsCreate` | Đăng mới học liệu số (4 Tabs A–D) | ✅ Có | ✅ Có | ❌ Không | ❌ Không |
| `LmsUpdate` | Chỉnh sửa học liệu số (Khóa chính chủ `created_by`) | ✅ Mọi bài | ✅ Chỉ bài của mình | ❌ Không | ❌ Không |
| `LmsUnpublish` | Gỡ học liệu công khai kèm lý do $\le 250$ ký tự | ✅ Mọi bài | ✅ Chỉ bài của mình | ❌ Không | ❌ Không |
| `LmsDelete` | Xóa mềm học liệu (`is_deleted = true`) | ✅ Mọi bài | ✅ Chỉ bài của mình | ❌ Không | ❌ Không |
| `LmsSubmitQuiz` | Làm bài Quiz tự kiểm tra & ghi nhận điểm số | ✅ Có | ✅ Có | ✅ Có (Lưu DB) | Xem thử (Không lưu DB) |
| `LmsSubmitPractice` | Nộp bài thực hành BM01–BM13 & tự chấm điểm 7 tiêu chí | ✅ Có | ✅ Có | ✅ Có (Lưu DB) | Thử nghiệm (Không lưu DB) |
| `LmsReceiveCertificate`| Nhận Chứng nhận số NACENTECH theo Lộ trình LT1–LT5 | ✅ Có | ✅ Có | ✅ Có | ❌ Không |

---

### MỤC 3: YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

- **`REQ-EL-001` (Tra cứu & Lọc Danh mục Quản lý `US-EL-01`)**: Hệ thống cung cấp bảng danh sách 10 bản ghi/trang, sắp xếp Ngày cập nhật giảm dần, lọc kết hợp AND giữa Từ khóa (Tiêu đề, Chuyên gia), Dropdown Loại bài (`Loại A`, `Loại B`, `Loại B+`) và Trạng thái (`Nháp`, `Công khai`, `Đã gỡ`).
- **`REQ-EL-002` (Biên soạn Form 4 Tabs A–D `US-EL-02`, `US-EL-04`)**:
  - *Tab A*: Tiêu đề ($\le 250$), Loại bài (`Loại A / B / B+`), Chuyên gia giảng dạy (Multi-select tối đa 10 người), Thời lượng phút ($1..300$), Mô tả Rich Text ($\le 5000$), Tệp video `.mp4 <= 1GB` (có tiến trình tải, hủy/thay thế, tự trích xuất thumbnail).
  - *Tab B*: Câu hỏi tự kiểm tra trắc nghiệm 4 đáp án A/B/C/D (tối đa 10 câu, kéo thả sắp xếp, giải thích đáp án, cảnh báo vàng khi $\max > 2 \times \min$).
  - *Tab C*: Công cụ thực hành (`.docx`, `.pdf <= 10MB`, tối đa 10 tệp), Phiếu tóm tắt (`.pdf <= 10MB`, 1 tệp), Tài liệu khác (`.pdf`, `.docx`, `.pptx <= 25MB`, tối đa 10 tệp).
  - *Tab D*: Liên kết cơ sở dữ liệu NacenTech (tối đa 5 liên kết URL hợp lệ).
- **`REQ-EL-003` (Xem Chi tiết & Video Streaming HTTP 206 `US-EL-03`)**: Phát video `.mp4` trực tiếp từ storage hỗ trợ tua nhanh qua HTTP Range 206; hiển thị Banner đỏ lý do gỡ bài khi `Đã gỡ` (không cho đóng); nút `Bổ sung` nhảy vào Tab thiếu nội dung.
- **`REQ-EL-004` (Chế độ Kép Trắc nghiệm `US-EL-03`)**: Cung cấp Chế độ Rà soát đáp án (Admin/Chuyên gia tô xanh đáp án đúng) và Chế độ Làm bài tự kiểm tra tương tác (Học viên nộp bài chấm điểm).
- **`REQ-EL-005` (Gỡ bài có Lý do `US-EL-05`)**: Popup bắt buộc nhập Lý do gỡ bài ($\le 250$ ký tự), chuyển trạng thái sang `Đã gỡ`, ẩn khỏi Cổng học tập công khai, lưu vết Audit Log.
- **`REQ-EL-006` (Xóa mềm `US-EL-06`)**: Khóa xóa bài đang `Công khai`; chỉ cho phép xóa bài `Nháp`/`Đã gỡ`; đánh dấu `is_deleted = true`, ẩn khỏi giao diện nhưng bảo lưu trong CSDL.
- **`REQ-EL-007` (Kết nối Chuyên gia Tư vấn `HOME1 R50`)**: Thẻ Chuyên gia giảng dạy tại trang chi tiết tích hợp nút CTA "Gửi yêu cầu tư vấn" dẫn trực tiếp luồng tư vấn của `TASK-05`.
- **`REQ-EL-008` (Đào tạo Tri thức Cho Agent AI `HOME1 R51`)**: Khi bài học `Công khai`, tự động băm chunks và nhúng vector 1024 chiều vào `matching.search_chunks` (`subject_kind = 'LEARNING_MATERIAL'`); tự động xóa vector khi gỡ bài hoặc xóa mềm.
- **`REQ-EL-009` (Phân loại 6 Cụm Chuyên Đề, 8 Mô-Đun Năng Lực & 5 Lộ Trình Học `CR-2026-028`)**:
  1. Phân loại toàn bộ học liệu số theo 6 Cụm chuyên đề cốt lõi (Cụm A: 10 bài, Cụm B: 10 bài, Cụm C: 10 bài, Cụm D: 6 bài, Cụm E: 10 bài, Cụm F: 4 bài; tổng 50 video bài học).
  2. Quản lý cấu trúc theo 8 Mô-đun năng lực (`M1`–`M8`, tổng 31 giờ học) đáp ứng 10 Chuẩn đầu ra (`CĐR1`–`CĐR10`).
  3. Cung cấp bộ điều hướng theo 5 Lộ trình học (`LT1`: Nền tảng ~6h; `LT2`: Doanh nghiệp bên cầu 31h; `LT3`: Cán bộ hỗ trợ/Sở KH&CN ~29h; `LT4`: Viện/Trường bên cung ~20h; `LT5`: Chuyên đề tự chọn 2–6h/khóa).
  4. Phân nhóm theo 3 Nhóm chức năng: `Định hướng công nghệ` (15 bài), `Technology Spotlight` (10 bài), `Kỹ năng nghiệp vụ` (25 bài), kết hợp hình thức (`CG` vs `ĐH`) và cấp độ (`CB`, `TC`, `NC`).
- **`REQ-EL-010` (Khung 50 Bài Học, Playlist 3 Micro-Videos & In-Video Pop-up Quiz `CR-2026-028`)**:
  1. Hỗ trợ đầy đủ 50 bài học (30 bài Chuyên gia `CG` thời lượng 10–12 phút/bài và 20 bài Đồ họa `ĐH` thời lượng 6–8 phút hoặc 12–15 phút/bài).
  2. Đối với 30 bài `CG`, mỗi bài học phân rã thành Playlist 3 micro-videos (`Video X.1`, `Video X.2`, `Video X.3`) kèm kịch bản CALL SHEET (L1, L2, L3) phát qua HTTP 206.
  3. Trình phát video client MUST tự động giám sát thời gian phát (`currentTime`); khi chạm mốc `triggerSeconds`, tự động `pause()` video và kích hoạt Modal Pop-up Quiz (Q1–Q6); học viên chọn sai nhận giải thích và chọn lại, chọn đúng mới mở khóa nút xem tiếp.
- **`REQ-EL-011` (Không Gian Thực Hành 13 Biểu Mẫu, 5 Công Cụ Tự Đánh Giá & Bảng Tự Chấm 7 Tiêu Chí `CR-2026-028`)**:
  1. Cung cấp biểu mẫu thực hành trực tuyến chuẩn hóa tích hợp 13 Biểu mẫu (`BM01`–`BM13`) và 3 câu tự luận tình huống thực tế có nút xem *"Gợi ý đối chiếu của Chuyên gia"*.
  2. Tích hợp 5 Công cụ tự đánh giá trực tuyến (`TĐG01`–`TĐG05`) với Radar Chart 5 trục gợi ý lộ trình học.
  3. Bảng tự chấm điểm 7 tiêu chí định lượng (thang 0–1–2, tổng điểm 14 điểm).
  4. Khi tổng điểm tự chấm đạt $\ge 11/14$ điểm, hệ thống MUST tự động mở khóa 2 nút Call-To-Action (CTA):
     - Nút 1: *"Gửi Chuyên gia phản biện"* kết nối luồng tư vấn của Chuyên gia phụ trách cụm (`TASK-05` / Trụ cột `R50`).
     - Nút 2: *"Tạo Hồ sơ Nhu cầu Công nghệ"* pre-fill thông tin bài thực hành sang Phân hệ Nhu cầu (`TASK-03`).
- **`REQ-EL-012` (Pipeline ETL 30 Bài Thực Chiến, 4 Vai Trò Chuyên Gia, Đồng Bộ AI RAG & Chứng Nhận Số `CR-2026-028`)**:
  1. Dịch vụ ETL nạp toàn bộ 30 bài học thực chiến chuyên gia đứng giảng từ 30 file Excel chuẩn BA (90 micro-videos, 180 in-video quiz, 300 câu trắc nghiệm cuối bài, 240 FAQ, 210 tiêu chí tự chấm, 60 tài liệu đính kèm) vào PostgreSQL thật.
  2. Định danh và phân công 4 Vai trò Chuyên gia: Giảng dạy, Phản biện học liệu, Cố vấn (Mentor SLA $\le 3$ ngày), và Tư vấn theo yêu cầu (`TASK-05`).
  3. Tự động băm chunks nhúng vector 1024d vào `matching.search_chunks` phục vụ AI NacenTwin (`R51`).
  4. Hệ thống cấp tự động Chứng nhận hoàn thành trực tuyến của Viện Đổi mới sáng tạo Quốc gia (NACENTECH) theo các lộ trình `LT1`–`LT5` khi hoàn thành 100% bài học bắt buộc, tích hợp mã định danh duy nhất và QR xác thực trực tuyến.

---

### MỤC 4: QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

- **`BR-EL-01` (Validate theo Trạng thái Lưu `US-EL-02`)**:
  - Lưu `Nháp`: Chỉ bắt buộc `Tiêu đề bài học` + kiểm tra hợp lệ định dạng/dung lượng file và URL.
  - Lưu `Công khai`: Bắt buộc toàn bộ trường Tab A (gồm cả video bài học); công bố ngay lập tức không qua phê duyệt.
- **`BR-EL-02` (Chống Xung đột Cập nhật Optimistic Concurrency `US-EL-04`)**: Sử dụng token `version`. Nếu bản ghi đã bị cập nhật bởi phiên khác, trả về `409 Conflict` và toast thông báo *"Học liệu đã được người khác cập nhật trước đó. Vui lòng tải lại trang."*
- **`BR-EL-03` (Cảnh báo Chuyển về Nháp `US-EL-04`)**: Khi bài học đang `Công khai` mà người dùng chuyển sang `Nháp` và bấm Lưu, bắt buộc hiển thị Popup xác nhận cảnh báo ngừng cung cấp cho học viên.
- **`BR-EL-04` (Cảnh báo Chênh lệch Phương án Trắc nghiệm `US-EL-02`)**: Khi thêm/sửa câu hỏi trắc nghiệm, nếu $\max(\text{length}) > 2 \times \min(\text{length})$ giữa 4 phương án A/B/C/D, hiển thị cảnh báo vàng *"Độ dài các phương án chênh lệch lớn, có thể gợi ý đáp án"* nhưng không chặn lưu.
- **`BR-EL-05` (Giới hạn Số lượng Cấu phần)**:
  - Tối đa 10 Chuyên gia giảng dạy / bài học.
  - Tối đa 10 Câu hỏi trắc nghiệm / bài học (vượt quá 10 câu thì disable nút Thêm).
  - Tối đa 5 Liên kết cơ sở dữ liệu / bài học.
  - Tối đa 10 tệp Công cụ thực hành, 1 tệp Phiếu tóm tắt, 10 tệp Tài liệu khác.
- **`BR-EL-06` (Bảo vệ Quyền Sở Hữu Chính Chủ)**: Chỉ `ADMIN` hoặc chính Chuyên gia tạo bài học (`created_by == Actor.PersonId`) mới có quyền Sửa, Gỡ bài hoặc Xóa học liệu.
- **`BR-EL-07` (Dừng Hình & Khóa Video Chờ Trả Lời In-Video Quiz `CR-2026-028`)**:
  - Khi Modal In-Video Quiz xuất hiện tại mốc `triggerSeconds`, video player bị vô hiệu hóa các nút điều khiển tua/tiếp tục (`pointer-events: none` hoặc locked controls).
  - Nếu chọn sai: Hiển thị hộp giải thích chi tiết lý do sai, xóa lựa chọn và yêu cầu chọn lại; video tiếp tục bị khóa.
  - Nếu chọn đúng: Hiển thị thông báo chúc mừng, giải thích củng cố kiến thức, mở khóa nút *"Tiếp tục xem video"* và cho phép video phát tiếp.
- **`BR-EL-08` (Tự Chấm Điểm 7 Tiêu Chí & Kích Hoạt Mở Khóa CTA Kép `CR-2026-028`)**:
  - Điểm mỗi tiêu chí chỉ nhận 1 trong 3 giá trị nguyên: `0` (Chưa đạt), `1` (Đạt một phần), `2` (Đạt rõ ràng và có thể kiểm tra). Tổng điểm $S = \sum_{i=1}^{7} p_i$ ($0 \le S \le 14$).
  - Nếu $S < 11$: Hai nút CTA *"Gửi Chuyên gia phản biện"* và *"Tạo Hồ sơ Nhu cầu Công nghệ"* ở trạng thái vô hiệu hóa kèm thông báo: *"Cần đạt tối thiểu 11/14 điểm để mở khóa kết nối Chuyên gia hoặc niêm yết lên Sàn Nhu Cầu"*.
  - Nếu $S \ge 11$: Kích hoạt khả dụng cả 2 nút CTA, cho phép gửi dữ liệu nộp bài sang CSDL.
- **`BR-EL-09` (Đánh Giá Hoàn Thành & Cấp Chứng Nhận Số NACENTECH `CR-2026-028`)**:
  - Bài trắc nghiệm cuối bài gồm từ 5–10 câu hỏi (tối thiểu 50% câu hỏi tình huống). Ngưỡng đạt yêu cầu: $\ge 60\%$ (đúng tối thiểu 6/10 câu). Học viên được làm lại tối đa 3 lần; hệ thống hiển thị giải thích chi tiết cho từng phương án và dẫn link trực tiếp về đoạn video liên quan.
  - Khi đạt $\ge 60\%$, hệ thống cập nhật `learner_progress.is_completed = true`, ghi nhận `completed_at = DateTimeOffset.UtcNow` và tăng `completion_count += 1`.
  - Cấp Chứng nhận số trực tuyến của Viện Đổi mới sáng tạo Quốc gia (NACENTECH) theo lộ trình `LT1`–`LT5` khi hoàn thành 100% bài học bắt buộc của lộ trình đó. Xếp loại: `Đạt` (70–79 điểm), `Khá` (80–89 điểm), `Xuất sắc` (90–100 điểm).

---

### MỤC 5: YÊU CẦU DỮ LIỆU & GIAO DIỆN (DATA & UI/UX)

- **Chuẩn hóa 5 UX States**: 100% màn hình Cổng học tập và Bàn quản trị bọc qua component chuẩn `<Async>` (Loading skeleton, Empty state có nút xóa lọc, Error retry, Success, Updating).
- **Responsive 3 Viewports**: Mobile (375px), Tablet (768px), Desktop (1440px) không vỡ layout, table hỗ trợ cuộn ngang hoặc card view trên mobile.
- **Database Schema**: 8 bảng gốc thuộc schema `lms.*` mở rộng thêm:
  - Cột mới trong `lms.learning_materials`: `cluster_code`, `step_number`, `module_code`, `delivery_format`, `function_group`, `level_code`.
  - 6 bảng mới: `lms.learning_micro_videos`, `lms.learning_in_video_quizzes`, `lms.learning_practice_rubrics`, `lms.learning_practice_forms`, `lms.learning_faqs`, `lms.learning_certificates`.
  - Bảng vector: `matching.search_chunks` (1024d pgvector).

---

### MỤC 6: YÊU CẦU PHI CHỨC NĂNG (NFR)

- **Hiệu năng Streaming**: Trình phát video tải qua HTTP Range 206 với TTFB $\le 200\text{ms}$, không nạp toàn bộ file vào RAM server.
- **Dung lượng & An toàn**: Hỗ trợ tệp video $\le 1\text{GB}$, tài liệu $\le 25\text{MB}$/tệp; băm SHA-256 kiểm tra toàn vẹn.
- **Bảo mật**: Chống lỗ hổng IDOR trên toàn bộ API; áp dụng chuẩn chính sách bản quyền mã nguồn mở D2-146 (MIT, Apache 2.0).

---

### MỤC 7: MA TRẬN TRUY VẾT KHÉP KÍN (TRACEABILITY MATRIX)

| Yêu cầu Chức năng | Quy tắc Nghiệp vụ | Bảng CSDL | Endpoint API | Màn hình UI | Kiểm thử (Tests) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-EL-001` (Tra cứu Quản lý) | `BR-EL-01`, `06` | `lms.learning_materials` | `GET /api/v1/lms/materials` | `/portal/expert/elearning`, `/admin/elearning` | `test_lms_management_list` |
| `REQ-EL-002` (Form 4 Tabs) | `BR-EL-01`, `04`, `05` | `lms.learning_*` (5 bảng) | `POST/PUT /api/v1/lms/materials` | Form Modal 4 Tabs A–D | `test_lms_form_validation` |
| `REQ-EL-003` (Xem & Streaming) | `BR-EL-01` | `lms.learning_materials` | `GET /files/{key}`, `GET /api/v1/lms/materials/{id}` | `/elearning/[id]` | `test_lms_video_streaming_206` |
| `REQ-EL-004` (Quiz Chế độ kép) | `BR-EL-04`, `05` | `lms.learning_quiz_questions`, `lms.learner_*` | `POST /api/v1/lms/materials/{id}/quiz-attempts` | Tab Quiz `/elearning/[id]` | `test_lms_dual_mode_quiz` |
| `REQ-EL-005` (Gỡ bài có lý do) | `BR-EL-06` | `lms.learning_moderation_logs` | `POST /api/v1/lms/materials/{id}/unpublish` | Modal Gỡ bài | `test_lms_unpublish_audit` |
| `REQ-EL-006` (Xóa mềm) | `BR-EL-06` | `lms.learning_materials` | `DELETE /api/v1/lms/materials/{id}` | Modal Xóa mềm | `test_lms_soft_delete` |
| `REQ-EL-007` (Tư vấn `R50`) | - | `brokerage.expert_profiles` | `GET /api/v1/lms/instructors/lookup` | Thẻ Giảng viên `/elearning/[id]` | `test_lms_expert_consult_cta` |
| `REQ-EL-008` (AI RAG `R51`) | - | `matching.search_chunks` | Auto Index on Publish | Huy hiệu AI RAG `/elearning` | `test_lms_rag_indexing` |
| `REQ-EL-009` (6 Cụm, 8 Mô-đun & 5 Lộ trình) | - | `lms.learning_materials` (`cluster_code`, `module_code`, `delivery_format`) | `GET /api/v1/lms/catalog` | Bộ lọc Lộ trình LT1-LT5 & Mô-đun M1-M8 `/elearning` | `test_lms_curriculum_filters` |
| `REQ-EL-010` (Khung 50 bài, 3 Videos & In-Video Quiz) | `BR-EL-07` | `lms.learning_micro_videos`, `lms.learning_in_video_quizzes` | `GET /api/v1/lms/materials/{id}/interactive-player` | Player Video Playlist 3 Videos `/elearning/[id]` | `test_lms_in_video_quiz_lock` |
| `REQ-EL-011` (Thực Hành BM01–BM13, TĐG & Bảng Tự Chấm) | `BR-EL-08` | `lms.learning_practice_rubrics`, `lms.learning_practice_forms`, `lms.learner_practice_evaluations` | `POST /api/v1/lms/materials/{id}/practice-evaluations` | Tab Thực hành BM & Tự chấm 7 tiêu chí `/elearning/[id]` | `test_lms_practice_rubric_cta` |
| `REQ-EL-012` (Pipeline ETL 30 Bài, 4 Chuyên Gia & Chứng Nhận) | `BR-EL-09` | `lms.*`, `lms.learning_certificates` | `POST /api/v1/lms/certificates/claim`, CLI `Lms30CoursesEtl` | Modal Chứng nhận số NACENTECH `/elearning/[id]` | `test_lms_etl_and_certificate_flow` |

---

### MỤC 8: SPEC DELTA V1.1 — NÂNG CẤP KHÔNG GIAN HỌC TẬP TƯƠNG TÁC 8 THÀNH PHẦN, KHUNG 50 BÀI HỌC, 8 MÔ-ĐUN / 5 LỘ TRÌNH & PIPELINE ETL (CR-2026-028)

- **Căn cứ thay đổi**: Quyết định `PO-DEC-20261110-01` & `PO-DEC-20261110-02` tại Basic Design Mục 32; Báo cáo chuyên đề `Draft 1.docx` (theo QĐ 1993/QĐ-BKHCN); Delta Ledger `deltas/CR-2026-028_elearning_interactive_workbook_and_30_courses_etl.md`; Bộ 30 kịch bản BA `Specification/01_DATA_RAW/New temp/*.xlsx`.
- **Bổ sung Yêu cầu chức năng**: `REQ-EL-009`, `REQ-EL-010`, `REQ-EL-011`, `REQ-EL-012`.
- **Bổ sung Quy tắc nghiệp vụ**: `BR-EL-07`, `BR-EL-08`, `BR-EL-09`.
- **Kế hoạch kiểm chứng**: Bổ sung bộ kiểm thử 4 tầng (Unit test BR-EL-07/08/09, Contract test DTOs mới, DB Integration test nạp 30 bài, Playwright E2E Visual QA tương tác Pop-up quiz, Bảng tự chấm điểm và Modal Chứng nhận số NACENTECH).
