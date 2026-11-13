# Change Request: CR-2026-032 Tinh Gọn Danh Bạ Chuyên Gia (`/experts`), Khắc Phục Empty State 1.051 Hồ Sơ Khảo Sát & Liên Kết 2 Chiều Khóa Học LMS

**CR-ID**: CR-2026-032  
**Epic**: `TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Status**: APPROVED  
**Target Version**: 1.20.0  
**Author**: Senior BA (`nacen-ba` — `nacen-basic-design`, `speckit-delta`)  
**Date**: 2026-11-13  
**Baseline**: Living Spec v1.19.0 (`CR-2026-021`, `CR-2026-022`)  
**Căn cứ Thiết kế cơ sở**:
- `Specification/BASIC_DESIGN_NACENTECH.md` Mục 36 (`PO-DEC-20261113-01`).

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

1. **Hiển thị thiếu thông tin & lặp nhiễu trên Danh bạ Chuyên gia (`/experts`)**:
   - *Hiện trạng cũ (As-Is)*: Hero banner có dòng breadcrumb `"Trang chủ > Danh bạ Chuyên gia KH&CN"` chiếm không gian. Trên 1.051 hồ sơ khảo sát (`GOOGLE_FORM_SURVEY`), `masteredTechCodes` rỗng nên toàn bộ card lặp chữ `"Đang cập nhật công nghệ"`, trong khi 1.045/1.051 chuyên gia đã có `specializedKeywords` và `consultingSummary`. Ngoài ra, 100% card lặp pill `"Đã xác thực"`, lặp học hàm/học vị ở tiêu đề tên, thiếu địa bàn công tác (`organizationAddress`/tỉnh thành), thiếu badge giảng viên LMS, và khối `"Chuyên gia tiêu biểu & nổi bật"` lấy trùng 3 card đầu của danh sách chính ngay cả khi đang tìm kiếm/lọc.
   - *Đề xuất mới (To-Be)*: Tinh gọn hero & card, fallback 3 tầng (`masteredTechCodes` → tối đa 3 chip `specializedKeywords` → 1 dòng `consultingSummary`/fallback ngắn), bổ sung địa bàn công tác & badge `"Giảng viên LMS (N khóa học)"`, tách khối nổi bật không trùng danh sách chính và ẩn khi đang tìm kiếm/lọc.
2. **Thiếu liên kết 2 chiều Chuyên gia ↔ LMS & Empty State lớn trên `/experts/[expertCode]`**:
   - *Hiện trạng cũ (As-Is)*: Trang chi tiết chuyên gia chưa truy vấn và hiển thị các khóa học/tài liệu LMS mà chuyên gia giảng dạy (`lms.learning_material_instructors` join `lms.learning_materials`). Các hồ sơ khảo sát chưa có đào tạo/công tác/5 loại thành tựu bị render khung tab và timeline trống lớn, còn khối tóm tắt năng lực & từ khóa chuyên môn chưa nổi bật.
   - *Đề xuất mới (To-Be)*: Bổ sung query LMS `PUBLISHED` và section `"Khóa học & Tài liệu giảng dạy (LMS)"` liên kết tới `/lms/[id]`; làm nổi bật khối `"Tóm tắt năng lực & Từ khóa chuyên môn"`; thêm bộ đếm `(N)` trên `AchievementTabs` và thu gọn Empty State thông minh cho `AchievementTabs` và `TimelineCard`.

---

### 2. Chi Tiết Thay Đổi Yêu Cầu Kỹ Thuật (Standardized Requirements)

#### [ADD] `REQ-EXP-DIR-007`: Tinh Gọn Hero Banner & Fallback Hiển Thị Năng Lực Trên Danh Bạ `/experts`
- Bỏ dòng breadcrumb `"Trang chủ > Danh bạ Chuyên gia KH&CN"` ở đầu hero banner của `/experts` để mở rộng không gian hiển thị.
- Trên mỗi card chuyên gia, hiển thị tag công nghệ/năng lực theo cơ chế fallback:
  1. Nếu `masteredTechCodes` có dữ liệu: hiển thị theo quy chuẩn hiện hành.
  2. Nếu `masteredTechCodes` rỗng: fallback hiển thị tối đa 3 chip từ `specializedKeywords`.
  3. Chỉ hiển thị 1 dòng tóm tắt `consultingSummary` (hoặc dòng fallback ngắn) nếu cả `masteredTechCodes` và `specializedKeywords` đều rỗng; loại bỏ hoàn toàn tình trạng lặp chữ `"Đang cập nhật công nghệ"` hàng loạt.

#### [ADD] `REQ-EXP-DIR-008`: Tinh Gọn Thẻ Chuyên Gia (`/experts`) & Bổ Sung Địa Bàn / Badge LMS
- Bỏ lặp badge `"Đã xác thực"` dạng pill trên 100% card (vì directory chỉ niêm yết hồ sơ `APPROVED`); giữ icon tick xanh xác thực trên avatar hoặc cạnh tên chuyên gia.
- Bỏ lặp học hàm/học vị ở tiêu đề tên nếu đã hiển thị ở badge phía trên (hiển thị nhất quán, không lặp).
- Hiển thị thêm Địa bàn công tác (`organizationAddress` hoặc `provinceName`) nếu có dữ liệu.
- Hiển thị badge `"Giảng viên LMS (N khóa học)"` khi `courseCount > 0`.

#### [ADD] `REQ-EXP-DIR-009`: Tái Cấu Trúc Khối "Chuyên Gia Tiêu Biểu & Nổi Bật"
- Khối `"Chuyên gia tiêu biểu & nổi bật"` trên `/experts` MUST không lấy trùng 3 card đầu tiên của danh sách chính bên dưới.
- Ưu tiên lựa chọn các chuyên gia có hồ sơ nổi bật thực chất: có khóa học LMS (`courseCount > 0`), công trình công bố/sáng chế (`publicationCount > 0` hoặc `patentCount > 0`), hoặc lượt kết nối (`connectionCount > 0`).
- Tự động ẩn khối `"Chuyên gia tiêu biểu & nổi bật"` khi người dùng đang áp dụng từ khóa tìm kiếm (`q`/`query`) hoặc bất kỳ bộ lọc nào (học vị, ngành, địa bàn, sẵn sàng tư vấn).

#### [ADD] `REQ-EXP-LMS-001`: Liên Kết 2 Chiều Chuyên Gia ↔ Khóa Học LMS Trên `/experts/[expertCode]`
- Backend MUST truy vấn các tài liệu/khóa học LMS có trạng thái `PUBLISHED` (`IsDeleted == false`) liên kết với chuyên gia thông qua `lms.learning_material_instructors.expert_profile_id == profile.Id` join `lms.learning_materials`.
- Frontend `/experts/[expertCode]` hiển thị section `"Khóa học & Tài liệu giảng dạy (LMS)"` (chỉ render khi `courses.length > 0`). Mỗi item hiển thị tiêu đề (`title`), loại/thời lượng/cấp độ (hoặc cụm/ngành nếu có) và link chuyển sang trang chi tiết khóa học `/lms/[id]`.

#### [ADD] `REQ-EXP-DETAIL-007`: Tối Ưu Hiển Thị Năng Lực & Empty State Trên `/experts/[expertCode]`
- Hiển thị nổi bật khối `"Tóm tắt năng lực & Từ khóa chuyên môn"` sử dụng `publicBio` / `consultingSummary` và `specializedKeywords`.
- Trên `AchievementTabs`: hiển thị bộ đếm `(N)` trên từng tab trong 5 tab; nếu tất cả 5 tab đều có `0` mục thì thu gọn thành 1 thông báo ngắn gọn thay vì render khung tab trống lớn.
- Trên `TimelineCard` (`Quá trình đào tạo` / `Quá trình công tác`): nếu cả hai đều rỗng thì thu gọn hợp lý, tránh chiếm diện tích trống lớn.

#### [ADD] `BR-EXP-DIR-044`: Quy Tắc Fallback Từ Khóa & Tóm Tắt Năng Lực Card Chuyên Gia
- Thứ tự ưu tiên hiển thị trên card: `masteredTechCodes` (nếu `length > 0`) → `specializedKeywords.slice(0, 3)` (nếu `length > 0`) → `consultingSummary` (1 dòng rút gọn) hoặc thông báo ngắn khi cả ba rỗng. Cấm render cứng `"Đang cập nhật công nghệ"` cho mọi hồ sơ khảo sát có `specializedKeywords`.

#### [ADD] `BR-EXP-DIR-045`: Quy Tắc Chống Trùng Lặp & Ẩn Khối Tiêu Biểu Khi Lọc
- Khi không có filter/search active, danh sách nổi bật loại trừ `expertCode` đã xuất hiện ở 3 vị trí đầu danh sách chính (hoặc sắp xếp danh sách nổi bật độc lập dựa trên điểm nổi bật thực chất: `courseCount`, `publicationCount`, `patentCount`, `connectionCount` sao cho không trùng 3 card đầu danh sách dưới). Khi có `q` hoặc bất kỳ filter nào active, khối nổi bật MUST ẩn hoàn toàn.

#### [ADD] `BR-EXP-LMS-001`: Quy Tắc Truy Vấn & Bảo Mật Liên Kết Khóa Học LMS Công Khai
- Chỉ trả về và hiển thị các học liệu LMS có `Status == "PUBLISHED"` và `IsDeleted == false`. Tuyệt đối không lộ học liệu `DRAFT`, `ARCHIVED` hoặc đã xóa mềm.

#### [ADD] `BR-EXP-DETAIL-001`: Quy Tắc Thu Gọn Empty State Thông Minh Trên Chi Tiết Chuyên Gia
- Tổng số lượng thành tựu across 5 tab bằng `0` → render 1 compact empty notice thay cho khung tab đầy đủ. Khi ít nhất 1 tab có `> 0` mục → render đầy đủ `AchievementTabs` kèm nhãn đếm `(N)` trên mỗi tab. Khi `training.length == 0 && employment.length == 0` → render compact summary/notice thay cho 2 thẻ timeline trống lớn.

#### [ADD] `API-EXP-DIR-006`: Mở Rộng Public DTO Cho Directory & Detail Chuyên Gia
- `ExpertPublicCardDto`: bổ sung `ConsultingSummary` (`string?`), `OrganizationAddress` (`string?`), `CourseCount` (`int`).
- `ExpertPublicDetailDto`: bổ sung `ConsultingSummary` (`string?`), `OrganizationAddress` (`string?`), `Courses` (`IReadOnlyList<ExpertLmsCourseDto>` gồm `Id`, `MaterialCode`, `Title`, `LessonType`, `DurationMinutes`, `ClusterName`/`SectorCode`).

#### [ADD] `UI-EXP-DIR-003`: Quy Chuẩn Giao Diện Danh Bạ & Card Chuyên Gia Tinh Gọn (`/experts`)
- Không breadcrumb trên hero; icon tick xanh xác thực gắn trên avatar/cạnh tên; không lặp học vị; hiển thị địa bàn & badge LMS; card fallback 3 tầng; khối nổi bật ẩn khi tìm kiếm/lọc.

#### [ADD] `UI-EXP-DETAIL-002`: Quy Chuẩn Giao Diện Chi Tiết Chuyên Gia (`/experts/[expertCode]`)
- Nổi bật khối `"Tóm tắt năng lực & Từ khóa chuyên môn"`; thêm section `"Khóa học & Tài liệu giảng dạy (LMS)"` (chỉ hiện khi `courses.length > 0`) link `/lms/[id]`; `AchievementTabs` có `(N)` và compact empty state; `TimelineCard` thu gọn khi cả hai rỗng.

---

### 3. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- **AC-CR-032.1**: Truy cập `/experts` không còn dòng breadcrumb `"Trang chủ > Danh bạ Chuyên gia KH&CN"` ở đầu hero banner.
- **AC-CR-032.2**: Các chuyên gia khảo sát (`GOOGLE_FORM_SURVEY`) có `specializedKeywords` hiển thị tối đa 3 chip từ khóa trên card; không còn tình trạng lặp `"Đang cập nhật công nghệ"` hàng loạt.
- **AC-CR-032.3**: Card chuyên gia không lặp badge pill `"Đã xác thực"` và không lặp học hàm/học vị ở tiêu đề tên; hiển thị địa bàn công tác (nếu có) và badge `"Giảng viên LMS (N khóa học)"` khi `courseCount > 0`.
- **AC-CR-032.4**: Khối `"Chuyên gia tiêu biểu & nổi bật"` không trùng 3 card đầu danh sách bên dưới, ưu tiên chuyên gia nổi bật thực chất và tự động ẩn khi nhập từ khóa hoặc chọn bộ lọc.
- **AC-CR-032.5**: Truy cập `/experts/[expertCode]` của chuyên gia có khóa học LMS `PUBLISHED` hiển thị section `"Khóa học & Tài liệu giảng dạy (LMS)"` với link `/lms/[id]` hoạt động; chuyên gia không có khóa học LMS thì không hiển thị section này.
- **AC-CR-032.6**: Trên `/experts/[expertCode]` của hồ sơ khảo sát: khối `"Tóm tắt năng lực & Từ khóa chuyên môn"` hiển thị nổi bật; `AchievementTabs` có bộ đếm `(N)` và thu gọn khi cả 5 tab bằng `0`; `TimelineCard` thu gọn hợp lý khi cả Đào tạo và Công tác đều rỗng.
