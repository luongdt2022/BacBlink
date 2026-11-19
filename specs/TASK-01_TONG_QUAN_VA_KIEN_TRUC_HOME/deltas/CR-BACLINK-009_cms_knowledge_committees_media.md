# Change Request: CR-BACLINK-009 — CMS Nội dung Hiệp hội: Tin tức, Chính sách & Tri thức, Tài liệu, Các ban, Thư viện, Đối tác

**CR-ID**: `CR-BACLINK-009`
**Epic**: `TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME` (lan truyền `TASK-07` Admin)
**Status**: `APPROVED — XÁC NHẬN SCOPE 2026-11-19 → In Progress`
**Phạm vi**: GĐ2 của *Kế hoạch nâng cấp v2* (nối tiếp `CR-BACLINK-008`)
**Date**: `2026-11-19`

**Căn cứ**:
- `[VERIFIED]` Góp ý khách hàng `260717` — Menu 1 (Điều lệ & quy chế, Thành tựu & báo cáo thường niên), Menu 5 (Chính sách mới, Giải thích chính sách, Ý kiến & kiến nghị của BACLINK, Báo cáo ngành, Dữ liệu công nghiệp Bắc Ninh, Cẩm nang & biểu mẫu, Case study), Menu 6 (Tin hội viên, Hoạt động các ban, Thư viện ảnh & video), Menu 7 (Hợp tác & tài trợ, Truyền thông & báo chí), §1 "Tìm thông tin ngành".
- `[VERIFIED]` Web THT: tin tức gắn theo ban ("Hoạt động Ban Công nghệ sản xuất", "Xúc tiến thương mại"), dải logo đối tác.
- `[CONFIRMED]` "làm tiếp các giai đoạn đến xong" (2026-11-19).

---

## 1. As-Is → To-Be

**As-Is**:
- Tin tức là 13 bài viết cứng trong `frontend/src/lib/news-data.ts`; Admin không đăng/sửa được.
- Module `content` chỉ có `stories` (0 bản ghi), `techmart_events`, `event_registrations`.
- Menu "Chính sách & tri thức" tạm trỏ về danh mục tin + cẩm nang sử dụng cổng.
- Chưa có Điều lệ, báo cáo thường niên, tài liệu/biểu mẫu, thư viện ảnh/video, trang từng ban, dải đối tác. FAQ viết cứng ở `/lien-he`.

**To-Be**:
- Admin tự quản lý **bài viết** (tin & chính sách), **tài liệu** (tệp tải về), **album ảnh/video**, **FAQ**, **đối tác**. Có nháp/xuất bản, gắn danh mục và gắn ban.
- 13 bài viết hiện có được chuyển vào CSDL, giữ nguyên `slug` để không gãy link.
- Có trang hub **Chính sách & tri thức** và trang chi tiết từng ban.
- Có thư viện ảnh/video, trang Điều lệ, trang Báo cáo thường niên.
- Dải đối tác trên trang chủ **chỉ hiện khi Admin đã nhập đối tác thật**.
- **Không tự tạo nội dung chính sách, báo cáo hay số liệu** (Zero Hallucination). Mục chưa có dữ liệu thì hiển thị trạng thái trống "Đang cập nhật", kèm lối liên hệ.

---

## 2. Ma trận tác động

| # | Bề mặt | File | Thay đổi |
|---|---|---|---|
| 1 | DB | migration `AddBaclinkCms` | Bảng `content.cms_articles`, `cms_documents`, `cms_media`, `cms_faqs`, `cms_partners` (tạo mới, IF NOT EXISTS) + seed 13 bài từ `news-data.ts` và 5 FAQ hiện có |
| 2 | API public | `apps/api/V1Compat/CmsControllers.cs` (mới) | `GET public/cms/articles` (category, committee, q, page), `GET public/cms/articles/{slug}`, `GET public/cms/documents`, `GET public/cms/media`, `GET public/cms/faqs`, `GET public/cms/partners` |
| 3 | API admin | như trên | CRUD đầy đủ cho 5 loại nội dung, bài viết có `PUBLISHED`/`DRAFT`, chỉ ADMIN |
| 4 | Tin tức | `app/tin-tuc/page.tsx`, `app/tin-tuc/[slug]/page.tsx` | Đọc từ API, thêm danh mục mới: Tin hội viên, Hoạt động các ban, Chính sách mới, Giải thích chính sách, Kiến nghị BACLINK, Case study, Truyền thông & báo chí |
| 5 | Chính sách & tri thức | `app/chinh-sach/page.tsx` (mới) | Hub 7 mục; mỗi mục lấy bài viết hoặc tài liệu theo loại |
| 6 | Tài liệu | `app/tai-lieu/page.tsx` (mới) | Báo cáo ngành, cẩm nang, biểu mẫu, văn bản chính sách; lọc và tải về |
| 7 | Về BACLINK | `app/gioi-thieu/dieu-le`, `app/gioi-thieu/bao-cao-thuong-nien` (mới) | Lấy tài liệu loại `DIEU_LE`, `BAO_CAO_THUONG_NIEN` |
| 8 | Các ban | `app/gioi-thieu/co-cau-to-chuc/[code]/page.tsx` (mới) | Chức năng ban, tin hoạt động gắn `committee_code`, tài liệu của ban, nút liên hệ |
| 9 | Thư viện | `app/thu-vien/page.tsx` (mới) | Album ảnh, video nhúng YouTube |
| 10 | Trang chủ | `components/home/home-blocks.tsx` | Khối Chính sách & ngành lấy từ API; thêm `PartnerStrip` (ẩn khi rỗng) |
| 11 | Liên hệ | `app/lien-he/page.tsx` | FAQ lấy từ API; thêm mục Hợp tác & tài trợ, Truyền thông & báo chí (đổ vào form chủ đề tương ứng) |
| 12 | Admin | `app/admin/cms/page.tsx` (mới) + sidebar | 5 tab: Bài viết, Tài liệu, Thư viện, FAQ, Đối tác; tải ảnh/tệp qua `files/upload` |
| 13 | Menu | `lib/constants/navigation.ts` | Menu 5 và menu 6 trỏ tới các trang mới |
| 14 | Kiểm thử | xUnit tích hợp CMS · vitest trang/admin · E2E API | |

**Ngoài phạm vi**: soạn thảo rich-text WYSIWYG (dùng Markdown có xem trước), bản tiếng Anh của bài viết (GĐ5), "Dữ liệu công nghiệp Bắc Ninh" dạng dashboard (chờ nguồn số liệu chính thức; tạm làm mục tài liệu `DU_LIEU_CONG_NGHIEP`).

---

## 3. Mỏ neo

- **`REQ-BL09-CMS-ARTICLE-001`**: Admin tạo/sửa/xuất bản/gỡ bài viết. Mỗi bài có slug duy nhất, danh mục, ban (tùy chọn), ảnh bìa, tóm tắt, nội dung Markdown, nguồn, ngày đăng.
- **`REQ-BL09-CMS-DOC-002`**: Tài liệu có loại (`DIEU_LE`, `BAO_CAO_THUONG_NIEN`, `BAO_CAO_NGANH`, `CAM_NANG`, `BIEU_MAU`, `VAN_BAN_CHINH_SACH`, `DU_LIEU_CONG_NGHIEP`), tệp, mô tả, ngày ban hành, ban (tùy chọn), cờ công khai.
- **`REQ-BL09-KNOWLEDGE-HUB-003`**: `/chinh-sach` có đủ 7 mục theo góp ý Menu 5.
- **`REQ-BL09-COMMITTEE-PAGE-004`**: Mỗi ban có trang riêng `/gioi-thieu/co-cau-to-chuc/{code}`.
- **`REQ-BL09-MEDIA-005`**: `/thu-vien` hiển thị album ảnh và video.
- **`REQ-BL09-PARTNER-006`**: Dải đối tác trên trang chủ chỉ lấy từ `cms_partners`.
- **`BR-BL09-NO-FABRICATION-001`**: Không seed bài chính sách, báo cáo, đối tác hay số liệu tự soạn. Chỉ chuyển 13 bài hiện có và 5 FAQ quy trình.
- **`BR-BL09-SLUG-STABLE-002`**: Giữ nguyên slug của 13 bài cũ; slug mới tự sinh từ tiêu đề (bỏ dấu), trùng thì thêm hậu tố.
- **`BR-BL09-PUBLIC-ONLY-003`**: API public chỉ trả bài `PUBLISHED` có `published_at` ≤ hiện tại và tài liệu `is_public = true`.
- **`DB-BL09-CMS-001`**: 5 bảng mới trong schema `content`, non-destructive.
- **`API-BL09-CMS-001`**: Public đọc ẩn danh; ghi chỉ ADMIN (`RequireAdmin`).
- **`NFR-BL09-SAFE-HTML-001`**: Nội dung Markdown hiển thị qua trình render không cho chạy HTML/JS (chặn XSS).

---

## 4. Ước lượng `[PROPOSAL]`
≈ 2 tuần (1 dev full-stack). Bảng task chi tiết `T-01.BL09.01..14` sẽ append vào `TASK-01/tasks.md` sau khi XÁC NHẬN SCOPE.

## 5. Cần BACLINK cung cấp (không chặn thi công)
1. PDF Điều lệ, báo cáo thường niên (nếu có), cẩm nang và biểu mẫu thường dùng.
2. Danh sách đối tác kèm logo, có đồng ý hiển thị.
3. Ảnh/video các sự kiện đã tổ chức.
4. Văn bản chính sách hoặc kiến nghị Hiệp hội muốn công bố.
