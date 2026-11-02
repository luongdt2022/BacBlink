# Change Request: CR-2026-021 Nâng Cao Độ Chính Xác & Làm Giàu Ngữ Cảnh Bóc Tách AI CV Scan Cho Hồ Sơ Chuyên Gia KH&CN (AI CV Scan Precision & Context Enrichment)

**CR-ID**: CR-2026-021  
**Epic**: TASK-05_HO_SO_CHUYEN_GIA_KHCN  
**Status**: APPLIED  
**Target Version**: 1.19.0  
**Author**: Senior Business Analyst (`nacen-ba`)  
**Date**: 2026-11-02  
**Baseline Commit / Hash**: Living Spec v1.18.0  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định PO `PO-DEC-20261102-03` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 20 & Mục 10 (PO-DEC-20261008-07).
- Dữ liệu kiểm chứng thực tế: Tệp lý lịch khoa học `Specification/01_DATA_RAW/LLKH CN/1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc`.
- Khung biểu mẫu chuẩn B1-4 của Bộ KH&CN và Sheet `C.gia` trong Master Excel.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

Trong quá trình người dùng thực hiện nâng hạng chuyên gia tại `/profile/upgrade/expert` bằng tệp LLKH thực tế (`1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc`), hệ thống phát hiện 4 khiếm khuyết lớn làm suy giảm độ chính xác và trải nghiệm tự động hóa:

1. **Khiếm khuyết 1 — Họ và tên bị chặn ghi đè, giữ nguyên tên demo "Dang Lanm"**:
   - *Hiện trạng cũ (As-Is)*: Dịch vụ AI bóc tách chính xác tên nhà khoa học là "Bành Quốc Tuấn", nhưng hàm xử lý tại Frontend kiểm tra điều kiện form cứng nhắc (`if (!form.fullName)`), dẫn đến việc dữ liệu AI không được ghi đè lên tên mặc định/demo ("Dang Lanm"). Người dùng sau khi scan tệp vẫn thấy tên demo hiển thị trên form.
   - *Đề xuất mới (To-Be)*: Thiết lập quy tắc `BR-EXP-CV-011`: Cho phép ghi đè giá trị Họ tên trích xuất từ CV nếu giá trị hiện tại là chuỗi rỗng hoặc là tên demo/placeholder hệ thống.
2. **Khiếm khuyết 2 — Thiếu trường Năm đạt học vị trong Schema & Prompt, UI rơi về mặc định 2026**:
   - *Hiện trạng cũ (As-Is)*: Trong tệp CV mẫu, học vị Tiến sĩ được cấp năm 2011. Tuy nhiên, JSON Schema và Prompt gửi sang Google Gemini Multimodal API không định nghĩa trường `degreeYear` / `degree_year`. Dữ liệu trả về thiếu trường này, khiến Frontend fallback về `new Date().getFullYear()` (năm 2026).
   - *Đề xuất mới (To-Be)*: Bổ sung quy tắc `BR-EXP-CV-012`: Bắt buộc định nghĩa trường `degree_year` kiểu Integer (YYYY) trong Schema và Prompt trích xuất, ánh xạ chính xác vào form Bước 1.
3. **Khiếm khuyết 3 — Cơ quan thẩm định (Cấp 2) bị gán cứng 'HP', thiếu suy luận ngữ cảnh**:
   - *Hiện trạng cũ (As-Is)*: Dropdown cơ quan tiếp nhận thẩm định Cấp 2 bị hardcode mặc định là Hải Phòng (`'HP'`), dù chuyên gia công tác tại "Viện Ứng dụng Công nghệ - Bộ Khoa học và Công nghệ" (địa chỉ Hà Nội). Hồ sơ này phải thuộc thẩm quyền của Hội đồng NacenTech/Trung ương (`GLOBAL`) hoặc Sở KH&CN Hà Nội (`HN`).
   - *Đề xuất mới (To-Be)*: Thiết lập quy tắc `BR-EXP-CV-013`: Tự động phân tích tên và địa chỉ cơ quan công tác để suy luận mã cơ quan thẩm định Cấp 2 phù hợp (`GLOBAL` cho các đơn vị trực thuộc Bộ/Viện Trung ương, hoặc mã tỉnh/thành `HN`, `HCM`, `HP`, `DN`...).
4. **Khiếm khuyết 4 — Lĩnh vực trụ cột công nghệ bị xóa trắng do đối soát cứng 100%**:
   - *Hiện trạng cũ (As-Is)*: CV mô tả lĩnh vực chuyên môn bằng văn phong tự nhiên ("Quang điện tử, laser, đo lường điều khiển, vật liệu bán dẫn"). Backend thực hiện so khớp chuỗi 100% tuyệt đối (Exact String Match) với bảng taxonomy code. Khi không trùng khớp y hệt, backend xóa sạch mảng lĩnh vực (`sectors = []`).
   - *Đề xuất mới (To-Be)*: Thiết lập quy tắc `BR-EXP-CV-014`: Áp dụng chiến lược đối soát phân tầng (Exact -> Alias/Keyword Dictionary -> Fuzzy Semantic Similarity $\ge 0.60$). Nếu không khớp, giữ nguyên mảng văn bản thô `raw_extracted_sectors` để gợi ý cho người dùng, tuyệt đối không xóa trắng.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

#### [ADD] `REQ-EXP-CV-010`: Nâng Cấp Năng Lực Trích Xuất & Tự Động Điền Dữ Liệu Thông Minh Từ Tệp CV/LLKH
Hệ thống nâng cấp toàn trình luồng AI CV Scan tại Bước 1 Wizard `/profile/upgrade/expert`:
1. Hỗ trợ bóc tách in-memory chuẩn xác từ các định dạng tệp .doc, .docx, .pdf, .png, .jpg (dung lượng $\le 20$MB).
2. Trích xuất đầy đủ các thực thể cốt lõi theo chuẩn B1-4: Họ và tên, Năm đạt học vị cao nhất, Cơ quan công tác, Địa chỉ cơ quan, và Lĩnh vực chuyên môn thế mạnh.
3. Tự động suy luận Cơ quan tiếp nhận thẩm định Cấp 2 (`suggested_review_scope`) và đối soát ngữ nghĩa lĩnh vực công nghệ vào 10 Lĩnh vực TT17 (`LV01` - `LV17`).
4. Gắn badge trực quan `"✨ AI Gợi Ý"` tại các ô được điền tự động.

#### [ADD] `BR-EXP-CV-011`: Quy Tắc Ưu Tiên Cập Nhật Họ Tên Từ CV & Ghi Đè Dữ Liệu Demo/Mặc Định
- Khi AI CV Scan trích xuất thành công trường họ tên (`extracted_full_name`), hệ thống MUST tự động điền vào ô "Họ và tên" nếu giá trị hiện tại trên form là:
  1. Chuỗi rỗng, null hoặc chưa được khởi tạo.
  2. Giá trị demo/placeholder mặc định của hệ thống (ví dụ: `"Dang Lanm"`, `"Người dùng"`, `"Chuyên gia"`, `"User"`).
  3. Hoặc khi người dùng chủ động nhấn nút "Quét lại CV" / "Tải CV mới".
- Frontend TUYỆT ĐỐI KHÔNG được chặn ghi đè đối với các giá trị placeholder/demo này.
- Trường hợp người dùng đã tự tay chỉnh sửa một tên riêng hợp lệ khác với tên demo, hệ thống hiển thị tooltip/banner xác nhận: *"AI phát hiện tên trong CV: [extracted_full_name]. Bấm để áp dụng."*

#### [ADD] `BR-EXP-CV-012`: Quy Tắc Trích Xuất Bắt Buộc Năm Đạt Học Vị (`degreeYear` / `degree_year`) Trong Schema & Prompt
- Schema trích xuất có cấu trúc (Structured Outputs JSON Schema) gửi lên Gemini Multimodal API và System Prompt BẮT BUỘC định nghĩa trường:
  ```json
  "degree_year": {
    "type": "integer",
    "description": "Năm tốt nghiệp hoặc năm cấp bằng của học vị cao nhất (ví dụ: 2011)"
  }
  ```
- Prompt chỉ dẫn: *"Tìm kiếm năm cấp bằng tốt nghiệp hoặc năm bảo vệ luận án thành công của học vị cao nhất trong phần Đào tạo hoặc Văn bằng chứng chỉ. Ví dụ: 'Tiến sĩ Quang học năm 2011' -> degree_year = 2011"*.
- Frontend Form Wizard Bước 1 bắt buộc ánh xạ trường `degree_year` vào ô "Năm đạt học vị". TUYỆT ĐỐI KHÔNG fallback về năm hiện tại (2026) nếu AI đã trích xuất được giá trị hợp lệ.

#### [ADD] `BR-EXP-CV-013`: Quy Tắc Tự Động Gợi Ý Cơ Quan Tiếp Nhận Thẩm Định Cấp 2 (Target Review Scope Auto-mapping)
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

#### [ADD] `BR-EXP-CV-014`: Quy Tắc Đối Soát Ngữ Nghĩa Cho Lĩnh Vực Trụ Cột Công Nghệ (Semantic/Fuzzy Taxonomy Matching)
- Backend TUYỆT ĐỐI KHÔNG xóa trắng khi chuyên ngành từ CV không khớp chính xác 100% chuỗi ký tự danh mục TT17.
- Quy trình đối soát phân tầng:
  1. *Tầng 1 (Exact Match)*: Khớp chính xác mã ngành (`LV01`..) hoặc tên ngành tiếng Việt.
  2. *Tầng 2 (Keyword/Alias Dictionary)*: Tra cứu từ điển từ khóa chuyên ngành (ví dụ: `"quang điện tử"`, `"laser"`, `"bán dẫn"` $\rightarrow$ `LV08` Vật liệu & Vi điện tử; `"phần mềm"`, `"trí tuệ nhân tạo"`, `"AI"`, `"IoT"` $\rightarrow$ `LV01` CNTT & Truyền thông; `"cảm biến y sinh"` $\rightarrow$ `LV14` Y dược).
  3. *Tầng 3 (Fuzzy Semantic Similarity)*: Tính toán khoảng cách Levenshtein / Token Similarity với ngưỡng tin cậy $\ge 0.60$.
  4. *Tầng 4 (Preserve Raw Extraction)*: Nếu không tự động map được với độ tin cậy cao, Backend MUST giữ nguyên mảng văn bản thô (`raw_extracted_sectors`), trả về cho Frontend hiển thị dưới dạng Badge gợi ý màu vàng để Chuyên gia nhấp chọn 1 click, không làm mất thông tin.

#### [ADD] `UI-EXP-CV-003`: Giao Diện Hiển Thị AI Gợi Ý & Phản Hồi Trực Quan
- Trường Họ và tên, Năm đạt học vị, Cơ quan công tác, Cơ quan thẩm định Cấp 2 hiển thị nhãn `"✨ AI Gợi Ý"` và viền xanh nhạt khi được điền tự động.
- Khối Lĩnh vực công nghệ hiển thị danh sách ngành đã tự động map kèm danh sách các từ khóa phát hiện từ CV (`raw_extracted_sectors`) dạng thẻ tag có thể nhấp để thêm nhanh.

#### [ADD] `TEST-EXP-CV-005`: Bộ Kịch Bản Kiểm Thử Bóc Tách Tệp LLKH Thực Tế B1-4
- **TC-EXP-01 (Override Demo Name)**: Tải tệp CV `Bành Quốc Tuấn.doc` $\rightarrow$ Form thay thế tên "Dang Lanm" bằng "Bành Quốc Tuấn".
- **TC-EXP-02 (Degree Year Precision)**: Trích xuất `degree_year = 2011` từ CV $\rightarrow$ Input Năm đạt học vị hiển thị `2011`, không phải `2026`.
- **TC-EXP-03 (Review Scope Auto-mapping)**: Cơ quan "Viện Ứng dụng Công nghệ, Bộ KH&CN, C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội" $\rightarrow$ Gợi ý Cấp 2 là `GLOBAL` hoặc `HN`, không phải `HP`.
- **TC-EXP-04 (Fuzzy Tech Sector Mapping)**: Lĩnh vực "Quang điện tử, laser, bán dẫn" $\rightarrow$ Tự động map vào `LV08` (hoặc `LV01`), mảng `raw_extracted_sectors` không bị rỗng.
- **TC-EXP-05 (Zero-Lock Fallback)**: Giả lập lỗi API AI $\rightarrow$ Form vẫn mở 100% cho nhập tay, không bị đóng băng.

---

### 3. Ma Trận Tác Động (Cross-Surface & Cross-Epic Impact)

| Bề Mặt Tác Động (Surface) | Vị Trí Tệp Mã Nguồn / Schema | Bản Chất Tác Động | Chi Tiết Cần Triển Khai |
| :--- | :--- | :--- | :--- |
| **Basic Design (`Specification`)** | `Specification/BASIC_DESIGN_NACENTECH.md` Mục 20 & Mục 10 | Nghiệp vụ SSOT | Đã cập nhật `PO-DEC-20261102-03`, `REQ-EXP-CV-010`, `BR-EXP-CV-011..014`. |
| **Living Spec (`SourceCode`)** | `SourceCode/specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN/spec.md` | Living Spec | Bổ sung Mục 25 (Delta v1.5), cập nhật bảng quy tắc và bump version lên `1.19.0`. |
| **AI Contract & Schema** | `DD-02-ai-extractor-contracts.md` & `GeminiResumeExtractor.cs` | DTO & Prompt Contract | Bổ sung `degree_year`, `suggested_review_scope`, `raw_extracted_sectors` vào DTO. |
| **Backend Service** | `ExpertService.cs` & `TaxonomyMatcher.cs` | Business Logic | Bổ sung hàm Fuzzy Matcher cho sectors và Scope Inference dựa trên địa chỉ cơ quan. |
| **Frontend Form Wizard** | `SourceCode/frontend/src/app/(auth)/profile/upgrade/expert/page.tsx` | View & State Logic | Cho phép ghi đè tên demo "Dang Lanm"; map `degreeYear`; tự động chọn scope; render thẻ tag unmapped sectors. |
| **Consuming Epics** | `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN` | Governance Queue | Hàng đợi thẩm định Cấp 2 nhận đúng `scope_id` (`GLOBAL` hoặc `HN`) thay vì bị dồn hết về `HP`. |

---

### 4. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-CR-021.1**: Khi tải tệp `1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc`, họ tên trên form đổi từ "Dang Lanm" thành "Bành Quốc Tuấn".
- [ ] **AC-CR-021.2**: Năm đạt học vị hiển thị đúng số `2011`, tuyệt đối không rơi về `2026`.
- [ ] **AC-CR-021.3**: Cơ quan tiếp nhận thẩm định Cấp 2 tự động được chọn là `GLOBAL` (hoặc `HN`), không còn bị mặc định `HP`.
- [ ] **AC-CR-021.4**: Các lĩnh vực công nghệ từ CV (Quang điện tử, laser, bán dẫn...) được map chính xác hoặc hiển thị thẻ tag gợi ý, không bị xóa trắng.
- [ ] **AC-CR-021.5**: Khi ngắt kết nối dịch vụ AI, giao diện vẫn mở 100% cho nhập tay và nộp hồ sơ bình thường.
- [ ] **AC-CR-021.6**: 100% test cases trong `TEST-EXP-CV-005` đạt trạng thái PASS trên môi trường kiểm thử.
