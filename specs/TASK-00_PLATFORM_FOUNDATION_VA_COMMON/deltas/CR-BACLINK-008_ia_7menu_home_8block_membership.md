# Change Request: CR-BACLINK-008 — Tái cấu trúc 7 Menu, Trang chủ 8 Khối & Gia nhập / Tư cách Hội viên

**CR-ID**: `CR-BACLINK-008`
**Epic**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON` (lan truyền `TASK-01` Home/Giới thiệu, `TASK-02` Hồ sơ DN & phê duyệt, `TASK-07` Admin)
**Status**: `IMPLEMENTED — GĐ0 + GĐ1 20/20 task (2026-11-19) · chờ Gate 3 SA review & Gate 4 QC E2E`
**Phạm vi**: Giai đoạn GĐ0 (sửa nhanh IA/Home/Shell) + GĐ1 (Gia nhập & Tư cách hội viên) của *Kế hoạch nâng cấp v2*
**Date**: `2026-11-19`

**Căn cứ**:
- `[VERIFIED]` `Specification/02_BASIC_DESIGN/260717_Góp ý website Baclink.docx` — góp ý chính thức của khách hàng BACLINK (7 menu, 4 nút header, 8 khối trang chủ, 3 hành trình).
- `[VERIFIED]` Website đối thủ `https://baclink.truyenthongtht.com/` (THT Media, đọc ngày 2026-11-19) — nguồn dữ kiện pháp nhân, 9 ban chuyên môn, form đăng ký hội viên.
- `[CONFIRMED]` Người dùng chốt ngày 2026-11-19: (1) dùng thông tin pháp nhân theo web THT; (2) 9 ban dùng bản demo, BACLINK sửa sau; (3) giữ nguyên 8 ngành `IND_*` hiện có; (4) phí/hạng hội viên dùng đề xuất của BA; `XÁC NHẬN KẾ HOẠCH V2`.

---

## 1. Bối cảnh (As-Is → To-Be)

**As-Is** (từ audit mã nguồn ngày 2026-11-19, website hiện đạt khoảng 50% góp ý):
1. Navbar có 8 mục mang tên kiểu công nghệ (Chào bán CN, Nhu cầu CN, Radar…). Menu công khai còn lộ trang nội bộ `/wireframes` và `/matrix`. Header chưa có nút Tìm kiếm và nút Gia nhập.
2. Trang chủ có 7 section, trong đó khối 5 tin tức viết cứng và khối "Quy trình 4 bước". Còn thiếu các khối *Bạn đang cần gì?*, *Sự kiện & đào tạo sắp tới*, *Chính sách & thông tin ngành*, *Hội viên tiêu biểu*, *Đối tác*.
3. Chân trang hiện số liệu không có nguồn: `2.689.450` lượt truy cập, `1.420 online`, "Chứng nhận an toàn thông tin Cấp độ 3 (NCSC)".
4. Thông tin pháp nhân `QĐ 1652/QĐ-UBND ngày 16/06/2025` và trụ sở `Số 7 Lý Thái Tổ` không khớp với web THT.
5. Đăng ký hội viên phải qua 2 bước rời nhau (`/register` rồi `/profile/upgrade`) và không có lối vào trên header.
6. Chưa có trang quyền lợi, loại hình, phí, quy trình. Duyệt xong là có quyền ENTERPRISE vĩnh viễn: không có thời hạn, phí, gia hạn hay chứng nhận.

**To-Be**:
1. Header: thanh trên cùng (Hotline · Email), 7 menu chính theo góp ý, 4 nút `Tìm kiếm | VI/EN | Đăng nhập | Gia nhập BACLINK`. Cụm nút nổi `Gọi · Zalo · Lên đầu trang`.
2. Trang chủ đúng 8 khối theo góp ý, có thêm dải Hội viên tiêu biểu và dải logo đối tác.
3. Chân trang không còn số liệu không có nguồn. Thông tin pháp nhân thống nhất trên toàn site.
4. Hành trình gia nhập 1 luồng: nút *Gia nhập BACLINK* → wizard 3 bước → Admin duyệt → cấp tư cách hội viên có hạng, thời hạn, số chứng nhận.
5. Hội viên tự xem tư cách, tải chứng nhận, gửi yêu cầu gia hạn. Admin ghi nhận phí, gia hạn, tạm ngưng.

---

## 2. Dữ kiện chuẩn (Master Facts)

### 2.1 Pháp nhân & liên hệ — `[CONFIRMED]` theo web THT
| Trường | Giá trị mới | Giá trị cũ (thay thế) |
|---|---|---|
| Quyết định thành lập | **589/QĐ-UBND ngày 27/06/2025** của UBND tỉnh Bắc Ninh | 1652/QĐ-UBND ngày 16/06/2025 |
| Trụ sở | **Lô 3 đường TS8, KCN Tiên Sơn, Tiên Du, Bắc Ninh** | Số 7 Lý Thái Tổ, P. Suối Hoa, TP Bắc Ninh |
| Điện thoại | **0889 156 999** | 0222.3888.686 · Hotline 1900 6886 |
| Email | **hhbaclink@gmail.com** | contact@baclink.org.vn |
| Tôn chỉ | "Kết nối sức mạnh – Nâng tầm tinh hoa Kinh Bắc" | — |

> ⚠️ **Lưu ý cần hỏi lại BACLINK**: QĐ 1652 và QĐ 589 có thể đều là thật, ví dụ một QĐ cho phép thành lập và một QĐ phê duyệt Điều lệ. Tạm thời hiển thị QĐ 589 theo quyết định của PO. Giá trị này phải đặt ở **một hằng số duy nhất** (`lib/constants/organization.ts`) để sau sửa một chỗ là xong.

### 2.2 Cơ cấu 9 ban chuyên môn — tên ban `[VERIFIED THT]`, chức năng `[PROPOSAL – DEMO]`
Trưởng ban hiển thị "Đang cập nhật". **Không bịa tên người** (Zero Hallucination).

| Mã | Khối | Ban | Chức năng demo | Dịch vụ / Menu liên kết |
|---|---|---|---|---|
| `BAN_TC_HV` | Hỗ trợ phát triển DN | Ban Tài chính & Phát triển Hội viên | Quản lý hội phí, kết nạp & chăm sóc hội viên, kết nối vốn/tín dụng | Hội viên |
| `BAN_DT_NL` | Hỗ trợ phát triển DN | Ban Đào tạo & Phát triển nhân lực | Tổ chức khóa đào tạo, kết nối trường nghề, chứng nhận đào tạo | Đào tạo & phát triển nhân lực; E-learning |
| `BAN_GT_XTTM` | Kết nối & Giao thương | Ban Giao thương & Xúc tiến thương mại | Hội chợ, phiên kết nối B2B, kết nối FDI – nội địa | Xúc tiến thương mại; Cơ hội kinh doanh |
| `BAN_DN_HTQT` | Kết nối & Giao thương | Ban Đối ngoại & Hợp tác quốc tế | Đoàn ra/vào, MOU quốc tế, đối tác nước ngoài | Hợp tác quốc tế |
| `BAN_CS_DTDT` | Chính sách & Kỹ thuật | Ban Chính sách & Đối thoại đầu tư | Tổng hợp kiến nghị, đối thoại với chính quyền, phổ biến chính sách | Hỗ trợ & tư vấn chính sách; Chính sách & tri thức |
| `BAN_CGCN_KT` | Chính sách & Kỹ thuật | Ban Hỗ trợ chuyển giao công nghệ & Kỹ thuật | Chuyển giao công nghệ, cố vấn kỹ thuật, năng suất – chất lượng | Công nghệ & CĐS; Năng suất & chất lượng; Ban Cố vấn |
| `BAN_CNX_DMST` | Chính sách & Kỹ thuật | Ban Công nghệ xanh & Đổi mới sáng tạo | Chuyển đổi xanh, ESG, tiết kiệm năng lượng | Chuyển đổi xanh & ESG |
| `BAN_VH_TT` | Văn hóa & Xã hội | Ban Văn hóa – Thể thao Doanh nghiệp | Giải thể thao, giao lưu văn hóa giữa hội viên | Tin hoạt động |
| `BAN_CSR` | Văn hóa & Xã hội | Ban CSR (Cộng đồng – Xã hội – An sinh) | Thiện nguyện, an sinh, trách nhiệm xã hội | Tin hoạt động |

### 2.3 Hạng hội viên & hội phí — `[PROPOSAL – DEMO]`, admin cấu hình được
**Lý do đề xuất:** dựa theo mô hình 3 loại hội viên phổ biến (chính thức / liên kết / danh dự) của các hội trong nước (quy định về hội: Nghị định 126/2024/NĐ-CP, cần đối chiếu Điều lệ BACLINK). Hội phí phân theo quy mô lao động để DN nhỏ dễ tham gia.

**Phương án khác đã cân nhắc:** (a) hội phí đồng giá: đơn giản nhưng bất lợi cho DN nhỏ; (b) phân theo doanh thu: DN ngại khai.

**Rủi ro:** mức phí thật của BACLINK chắc chắn khác. Vì vậy **không hardcode**: toàn bộ bảng dưới lưu ở bảng cấu hình, admin sửa được.

| Mã hạng | Loại hội viên | Đối tượng | Hội phí/năm (demo) |
|---|---|---|---|
| `OFFICIAL_L` | Chính thức – DN lớn | DN sản xuất tại Bắc Ninh, > 300 lao động | 10.000.000 đ |
| `OFFICIAL_M` | Chính thức – DN vừa | 100–300 lao động | 6.000.000 đ |
| `OFFICIAL_S` | Chính thức – DN nhỏ & siêu nhỏ | < 100 lao động | 3.000.000 đ |
| `ASSOCIATE` | Liên kết | DN ngoài tỉnh, DN FDI chưa đủ điều kiện chính thức, viện/trường, tổ chức hỗ trợ | 5.000.000 đ |
| `HONORARY` | Danh dự | Cá nhân/tổ chức có đóng góp, do Ban Chấp hành mời | Miễn phí |

- Lệ phí gia nhập (một lần): 1.000.000 đ (demo).
- **Chu kỳ**: theo năm dương lịch (01/01–31/12). Kết nạp sau 30/06 đóng 50% hội phí năm đầu.
- **Thời hạn đóng**: trước 31/03 hằng năm. Quá hạn 90 ngày → trạng thái `SUSPENDED`.

---

## 3. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| # | Bề mặt | File Path | Hiện trạng | Thay đổi |
|---|---|---|---|---|
| 1 | Hằng số tổ chức (mới) | `frontend/src/lib/constants/organization.ts` | Chưa có, thông tin rải rác 13 file | Tạo nguồn duy nhất: QĐ, trụ sở, SĐT, email, Zalo, 9 ban |
| 2 | Thông tin pháp nhân | `app/layout.tsx`, `app/page.tsx`, `app/gioi-thieu/page.tsx`, `components/common/{navbar,footer,i18n-provider}.tsx`, `lib/news-data.ts`, `app/huong-dan/guide-data.ts`, `app/wireframes/page.tsx`, `app/portal/expert/account/page.tsx`, `components/enterprise/EnterprisesDirectoryView.tsx` | `1652/QĐ-UBND`, `Lý Thái Tổ`, `3888.686`, `contact@baclink` | Thay bằng import từ `organization.ts`; grep về 0 |
| 3 | Seed / dump SQL | `backend/scripts/update_fb_events.sql`, `dump_baclink_latest.sql` | Chứa `1652/QĐ-UBND` trong nội dung sự kiện | Script idempotent mới `update_baclink_008_legal_facts.sql` (không sửa script cũ) |
| 4 | Navbar | `components/common/navbar.tsx` | 8 mục, lộ `/wireframes`, `/matrix` | Thanh trên cùng, 7 menu, 4 nút; chỉ hiện menu con có trang thật |
| 5 | Nút nổi | `components/common/floating-contact.tsx` (mới), `components/home/AIAssistantWidget.tsx` | Chỉ có AI widget | Cụm Gọi / Zalo / Lên đầu trang; AI widget dời vị trí, không đè nhau |
| 6 | Footer | `components/common/footer.tsx` | Số liệu không nguồn, link `/wireframes` | Gỡ số liệu và huy hiệu NCSC; 4 cột liên kết theo 7 menu; Zalo |
| 7 | Trang chủ | `app/page.tsx` + `components/home/*` (tách khối) | 7 section, tin viết cứng | 8 khối + Hội viên tiêu biểu + Đối tác; dữ liệu qua API thật |
| 8 | Tìm kiếm | `app/tim-kiem/page.tsx` (mới) | Chỉ có ô tìm trên hero | Trang tìm kiếm chung: DN · Cơ hội · Sự kiện · Tin |
| 9 | Về BACLINK | `app/gioi-thieu/**` | 1 trang | Trang con: Tổng quan, Tầm nhìn & sứ mệnh, Cơ sở pháp lý, Ban lãnh đạo, Cơ cấu tổ chức & 9 ban (tĩnh, chờ CMS GĐ2) |
| 10 | Hội viên (public) | `app/hoi-vien/**` (mới) | Không có | Quyền lợi, Loại hình & hội phí, Quy trình gia nhập, Hội viên tiêu biểu; danh bạ dùng route sẵn có |
| 11 | Wizard gia nhập | `app/hoi-vien/gia-nhap/page.tsx` (mới), tái sử dụng `app/(auth)/register`, `app/profile/upgrade` | 2 trang rời | Wizard 3 bước; `/profile/upgrade` redirect về wizard (giữ API cũ) |
| 12 | Liên hệ | `app/lien-he/page.tsx` (mới), `components/common/contact-modal.tsx` (mới) | Không có | Trang Liên hệ (bản đồ, đầu mối 9 ban, FAQ) + popup liên hệ dùng chung |
| 13 | Backend – Enterprise | `modules/enterprise/.../Domain/Enterprise.cs` + migration mới | Không có trường người đại diện / trợ lý | Thêm cột nullable (xem §5) |
| 14 | Backend – Membership | `modules/enterprise` (mở rộng, không tạo module mới) | Chưa có | Bảng `membership_tiers`, `memberships`; API public/my/admin |
| 15 | Backend – Phê duyệt | `modules/identity/Application/ApprovalService.cs` (nhánh `ENTERPRISE` ~L567) | Duyệt → cấp ENTERPRISE | Kèm tạo `membership` (`ACTIVE`, số chứng nhận, thời hạn) |
| 16 | Backend – Liên hệ | `modules/communication` hoặc `case` | Chưa có endpoint công khai | `POST /api/v1/public/contact-requests` (rate-limit, chống spam) |
| 17 | Portal hội viên | `app/portal/layout.tsx`, `app/portal/membership/page.tsx` (mới) | Không có mục hội viên | Mục "Tư cách hội viên": hạng, thời hạn, phí, chứng nhận PDF, gửi gia hạn |
| 18 | Admin | `app/admin/members/page.tsx` (mới), `app/admin/system-config` | Không có | Danh sách hội viên, ghi nhận phí, gia hạn, tạm ngưng, cấu hình hạng/phí, đánh dấu tiêu biểu, hộp thư liên hệ |
| 19 | Kiểm thử | `footer.test.tsx`, `navbar.test.tsx`, `gioi-thieu/page.test.tsx`, `test/navbar-footer-shell.test.tsx`, `portal-navigation-delta.test.tsx`, `e2e/*` | Assert chuỗi cũ | Cập nhật assert; thêm test wizard, membership, E2E 3 hành trình |

**Ngoài phạm vi CR này**: CMS (GĐ2), 8 trang dịch vụ & kiến nghị (GĐ3), cơ hội đầu tư / sự kiện thanh toán / trang từng ban (GĐ4), tiếng Anh đầy đủ & thông báo theo ngành (GĐ5), cổng thanh toán online, đổi bộ 8 ngành `IND_*`.

---

## 4. Mỏ Neo Truy Vết (Anchors)

### Chức năng (REQ)
- **`REQ-BL08-IA-001`**: Menu chính gồm đúng 7 mục: *Về BACLINK · Hội viên · Dịch vụ hỗ trợ DN · Cơ hội kinh doanh · Chính sách & tri thức · Sự kiện & tin tức · Liên hệ & hợp tác*. Chỉ hiển thị menu con đã có trang nội dung thật.
- **`REQ-BL08-HEADER-002`**: Header luôn có 4 nút `Tìm kiếm | VI/EN | Đăng nhập | Gia nhập BACLINK`; thanh trên cùng hiện Hotline và Email. Khi đã đăng nhập, nút *Gia nhập* được thay bằng menu tài khoản, nếu chưa là hội viên thì thay bằng "Hoàn tất hồ sơ hội viên".
- **`REQ-BL08-HOME-003`**: Trang chủ gồm 8 khối theo thứ tự:
  1. Thông điệp;
  2. Bạn đang cần gì? (6 lối tắt: Tìm nhà cung cấp, Đăng nhu cầu mua, Tìm đối tác công nghệ, Đăng ký sự kiện, Nhận hỗ trợ chính sách, Gia nhập hội viên);
  3. Tìm doanh nghiệp (ô tìm + 8 ngành);
  4. Cơ hội kinh doanh mới nhất;
  5. Dịch vụ cho DN;
  6. Sự kiện & đào tạo sắp tới (từ `events` + `lms`);
  7. Chính sách & thông tin ngành;
  8. Quyền lợi + nút Gia nhập.

  Sau khối 8 là dải Hội viên tiêu biểu và dải logo Đối tác.
- **`REQ-BL08-SEARCH-004`**: Trang `/tim-kiem?q=` trả kết quả theo 4 nhóm: Doanh nghiệp, Cơ hội (chào bán + nhu cầu), Sự kiện, Tin tức.
- **`REQ-BL08-JOIN-005`**: Wizard gia nhập gồm 3 bước:
  - **Bước 1 – Tài khoản**: họ tên, email, mật khẩu, SĐT. Bỏ qua nếu đã đăng nhập.
  - **Bước 2 – Doanh nghiệp & người đại diện**: MST (tra cứu tự động), tên công ty, danh xưng (Ông/Bà), tên người đại diện, chức danh, địa bàn, KCN, ngành `IND_*`, hạng hội viên đề xuất, giới thiệu công ty, sản phẩm nổi bật, website, giấy phép ĐKKD; trợ lý/thư ký (tùy chọn): họ tên, SĐT, email.
  - **Bước 3 – Xác nhận**: tích "Đã đọc Điều lệ & Quyền – Nghĩa vụ hội viên", cam kết hợp pháp, xem lại thông tin, gửi.
- **`REQ-BL08-MEMBER-PUBLIC-006`**: Các trang `/hoi-vien/quyen-loi`, `/hoi-vien/loai-hinh-va-hoi-phi`, `/hoi-vien/quy-trinh`, `/hoi-vien/tieu-bieu` công khai, đọc dữ liệu hạng/phí từ API.
- **`REQ-BL08-MEMBER-PORTAL-007`**: Hội viên xem hạng, số chứng nhận, ngày hiệu lực/hết hạn, trạng thái phí; tải chứng nhận PDF; gửi yêu cầu gia hạn.
- **`REQ-BL08-MEMBER-ADMIN-008`**: Admin xem danh sách hội viên (lọc theo hạng/trạng thái/hạn), ghi nhận đã đóng phí, gia hạn, tạm ngưng/khôi phục, đánh dấu *tiêu biểu*, cấu hình hạng và mức phí.
- **`REQ-BL08-CONTACT-009`**: Popup liên hệ (họ tên, SĐT, email, chủ đề, nội dung) mở được từ mọi trang. Yêu cầu gửi vào hộp thư Admin. Trang `/lien-he` có văn phòng, bản đồ, đầu mối 9 ban, FAQ.
- **`REQ-BL08-ABOUT-010`**: Trang Về BACLINK có các trang con Tổng quan, Tầm nhìn & sứ mệnh, Cơ sở pháp lý, Ban lãnh đạo, Cơ cấu tổ chức (9 ban / 4 khối theo §2.2).

### Quy tắc nghiệp vụ (BR)
- **`BR-BL08-SINGLE-SOURCE-001`**: Thông tin pháp nhân và liên hệ chỉ khai báo tại `lib/constants/organization.ts` (FE) và bảng cấu hình hệ thống (BE). Sau khi làm xong, grep `1652/QĐ|Lý Thái Tổ|3888.686|contact@baclink` = 0.
- **`BR-BL08-NO-UNSOURCED-STATS-002`**: Không hiển thị số liệu nào không lấy từ API thật hoặc không có nguồn được xác nhận.
- **`BR-BL08-MEMBER-LIFECYCLE-003`**: Trạng thái hội viên: `PENDING` (chờ duyệt) → `ACTIVE` (sau khi duyệt) → `EXPIRED` (quá ngày hết hạn) → `SUSPENDED` (quá hạn 90 ngày hoặc admin tạm ngưng) → `ACTIVE` (gia hạn/khôi phục). `REJECTED` là trạng thái kết thúc.
- **`BR-BL08-ROLE-DECOUPLE-004`**: Trạng thái hội viên **không thu hồi role `ENTERPRISE`**, để tránh hồi quy RBAC 3 cấp. Khi `EXPIRED` hoặc `SUSPENDED`: portal hiện banner gia hạn, DN không xuất hiện ở *Hội viên tiêu biểu*, danh bạ gắn nhãn "Hội viên hết hạn".
- **`BR-BL08-CERT-NO-005`**: Số chứng nhận có dạng `BL-{YYYY}-{NNNN}` (tăng dần theo năm, duy nhất), cấp khi chuyển sang `ACTIVE` lần đầu.
- **`BR-BL08-FEE-006`**: Hội phí lấy từ `membership_tiers` tại thời điểm duyệt. Kết nạp sau 30/06 thu 50% năm đầu. Admin ghi nhận phí thủ công (chưa có cổng thanh toán).
- **`BR-BL08-JOIN-DEDUP-007`**: Mỗi MST chỉ có tối đa 1 hồ sơ `PENDING` hoặc 1 membership `ACTIVE`/`EXPIRED`/`SUSPENDED`. Gửi trùng thì trả lỗi rõ ràng.

### Dữ liệu (DB) — non-destructive
- **`DB-BL08-ENT-COLS-001`**: Thêm cột nullable vào `enterprise.enterprises`: `representative_salutation varchar(10)`, `representative_title varchar(150)`, `highlight_products text`, `website varchar(300)` (nếu chưa có), `assistant_name varchar(150)`, `assistant_phone varchar(30)`, `assistant_email varchar(200)`, `is_featured_member boolean DEFAULT false`, `featured_order int`.
- **`DB-BL08-TIERS-002`**: Bảng mới `enterprise.membership_tiers(code PK, name, member_type, description, annual_fee numeric(14,0), joining_fee numeric(14,0), sort_order, is_active DEFAULT true)`, seed 5 hạng theo §2.3.
- **`DB-BL08-MEMBERSHIPS-003`**: Bảng mới `enterprise.memberships(id, enterprise_id FK, tier_code FK, status, certificate_no UNIQUE NULL, valid_from, valid_to, fee_amount, fee_paid_at NULL, fee_note, approved_by, created_at, updated_at, row_version)`, index `(enterprise_id)`, `(status, valid_to)`.
- **`DB-BL08-BACKFILL-004`**: Script backfill tạo membership `ACTIVE` hạng `OFFICIAL_M` cho 7 DN hội viên đã `VERIFIED`, hiệu lực đến 31/12/2026, số chứng nhận `BL-2026-0001..0007`. Chạy lại không sinh trùng (idempotent).
- **`DB-BL08-CONTACT-005`**: Bảng `communication.contact_requests(id, full_name, phone, email, topic, message, source_path, status DEFAULT 'NEW', created_at, handled_by, handled_at)`.

### API
- **`API-BL08-TIERS-001`**: `GET /api/v1/public/membership/tiers` (anonymous).
- **`API-BL08-FEATURED-002`**: `GET /api/v1/public/members/featured` (anonymous; chỉ membership `ACTIVE`, có `is_featured_member = true`).
- **`API-BL08-JOIN-003`**: Giữ `POST /api/v1/governance/approvals` (`requestType = ENTERPRISE`). `payloadJson` bổ sung `tierCode`, `representative*`, `assistant*`, `highlightProducts`, `website`, `acceptedCharterAt`. Payload cũ vẫn hợp lệ (tương thích ngược).
- **`API-BL08-MY-004`**: `GET /api/v1/my/membership`, `GET /api/v1/my/membership/certificate.pdf`, `POST /api/v1/my/membership/renewal-requests`.
- **`API-BL08-ADMIN-005`**: `GET /api/v1/admin/memberships`, `POST …/{id}/record-fee`, `POST …/{id}/renew`, `POST …/{id}/suspend`, `POST …/{id}/restore`, `PUT /api/v1/admin/membership/tiers/{code}`, `PUT /api/v1/admin/enterprises/{id}/featured`.
- **`API-BL08-CONTACT-006`**: `POST /api/v1/public/contact-requests` (anonymous, giới hạn 5 lần/IP/giờ, honeypot); `GET /api/v1/admin/contact-requests`.
- **`API-BL08-SEARCH-007`**: Tái sử dụng `GET /api/v1/search` nếu đủ phạm vi. Nếu thiếu thì thêm tham số `types=enterprise,offer,demand,event`.

### Giao diện (UI)
- **`UI-BL08-HEADER-001`**: Desktop 1440px: thanh trên cùng 32px + navbar. Mobile 390px: nút *Gia nhập* nằm cố định đầu drawer, nút Tìm kiếm hiện dạng icon.
- **`UI-BL08-HOME-002`**: Mỗi khối trang chủ có đủ 5 trạng thái UX qua `<Async>`. Khối trống thì ẩn hẳn, không hiện "0".
- **`UI-BL08-WIZARD-003`**: Wizard có stepper, lưu nháp vào `sessionStorage` (bọc try/catch), kiểm tra lỗi từng bước, mobile không cuộn ngang.
- **`UI-BL08-FLOAT-004`**: Cụm nút nổi không che CTA chính và không chồng lên AI widget.

### Phi chức năng (NFR)
- **`NFR-BL08-PERF-001`**: Trang chủ LCP ≤ 2,5 s (Lighthouse mobile, build production); tổng JS trang chủ không tăng quá 10% so với bản hiện tại.
- **`NFR-BL08-A11Y-002`**: Toàn bộ nút mới có `aria-label`; tương phản ≥ 4,5:1.
- **`NFR-BL08-REGRESSION-003`**: 100% test .NET (463) và vitest (875) cũ vẫn pass sau khi cập nhật assert chuỗi pháp nhân.

---

## 5. Tiêu chuẩn chấp thuận (Acceptance Criteria)

1. **Given** khách vãng lai ở trang chủ, **When** nhìn header, **Then** thấy 7 menu và 4 nút; bấm *Gia nhập BACLINK* mở wizard bước 1.
2. **Given** khách chưa có tài khoản, **When** hoàn tất 3 bước wizard, **Then** tài khoản được tạo, một hồ sơ approval `ENTERPRISE` ở trạng thái `PENDING` được sinh ra, và màn hình hiện mã hồ sơ.
3. **Given** admin duyệt hồ sơ, **When** bấm Phê duyệt, **Then** người dùng có role `ENTERPRISE` (`DUAL`) và có membership `ACTIVE` với số `BL-2026-NNNN`, `valid_to = 31/12/2026`.
4. **Given** hội viên `ACTIVE`, **When** vào Portal → Tư cách hội viên, **Then** thấy hạng, thời hạn, trạng thái phí và tải được chứng nhận PDF có số chứng nhận.
5. **Given** membership có `valid_to` < hôm nay, **When** job hằng ngày chạy, **Then** trạng thái chuyển `EXPIRED`; sau 90 ngày chuyển `SUSPENDED`; role `ENTERPRISE` vẫn giữ nguyên.
6. **Given** MST đã có hồ sơ `PENDING`, **When** gửi wizard lần nữa, **Then** nhận lỗi "Doanh nghiệp đã có hồ sơ đang chờ duyệt".
7. **Given** bất kỳ trang nào, **When** gửi popup liên hệ hợp lệ, **Then** admin thấy yêu cầu ở trạng thái `NEW`; gửi lần thứ 6 trong 1 giờ từ cùng IP thì bị chặn.
8. **Given** toàn bộ mã nguồn FE và BE, **When** grep `1652/QĐ|Lý Thái Tổ|3888.686|contact@baclink|2.689.450`, **Then** 0 kết quả (trừ migration/script lịch sử).
9. **Given** menu công khai, **When** crawl toàn bộ link, **Then** 0 link chết, 0 link tới `/wireframes` hoặc `/matrix`.

---

## 6. Phân rã việc dự kiến (append vào `TASK-00/tasks.md` sau khi XÁC NHẬN SCOPE)

### GĐ0 — Shell, IA & Trang chủ
- [ ] `T-00.BL08.01` [FE] Tạo `lib/constants/organization.ts`; thay thế 13 file (bảng §3 dòng 2); cập nhật test assert.
- [ ] `T-00.BL08.02` [PERSISTENCE] Script `update_baclink_008_legal_facts.sql` (idempotent) cho nội dung sự kiện/tin có QĐ cũ.
- [ ] `T-00.BL08.03` [FE] Navbar: thanh trên cùng, 7 menu, 4 nút, drawer mobile; gỡ `/wireframes`, `/matrix` khỏi menu.
- [ ] `T-00.BL08.04` [FE] Footer: gỡ số liệu không có nguồn & NCSC; cột liên kết theo 7 menu; Zalo.
- [ ] `T-00.BL08.05` [FE] Cụm nút nổi Gọi/Zalo/Lên đầu trang; dời AI widget.
- [ ] `T-00.BL08.06` [FE] Trang chủ 8 khối + Hội viên tiêu biểu + Đối tác (tách component `components/home/*`).
- [ ] `T-00.BL08.07` [FE][API] Trang `/tim-kiem` (4 nhóm kết quả).
- [ ] `T-00.BL08.08` [FE] Các trang con Về BACLINK (tĩnh) + Cơ cấu 9 ban demo.
- [ ] `T-00.BL08.09` [FE][API][PERSISTENCE] Popup liên hệ + `/lien-he` + `contact_requests` + hộp thư admin.

### GĐ1 — Gia nhập & Tư cách hội viên
- [ ] `T-00.BL08.10` [PERSISTENCE] Migration EF `AddMembershipAndRepresentativeFields` (DB-001..003, 005) + seed hạng + backfill 7 DN (DB-004).
- [ ] `T-00.BL08.11` [API] Membership public/my/admin APIs (API-001, 002, 004, 005) + policy RBAC.
- [ ] `T-00.BL08.12` [API] `ApprovalService` nhánh `ENTERPRISE`: đọc payload mở rộng, tạo membership, cấp số chứng nhận, chặn trùng MST (BR-005, 007).
- [ ] `T-00.BL08.13` [API] Job hằng ngày chuyển `EXPIRED`/`SUSPENDED` (BR-003) + thông báo nhắc trước 30 ngày qua module `notifications` sẵn có.
- [ ] `T-00.BL08.14` [API] Sinh chứng nhận PDF.
- [ ] `T-00.BL08.15` [FE] Trang `/hoi-vien/*` (quyền lợi, loại hình & hội phí, quy trình, tiêu biểu).
- [ ] `T-00.BL08.16` [FE] Wizard `/hoi-vien/gia-nhap` 3 bước; redirect `/profile/upgrade` → wizard.
- [ ] `T-00.BL08.17` [FE] Portal "Tư cách hội viên" + banner gia hạn.
- [ ] `T-00.BL08.18` [FE] Admin `/admin/members` + cấu hình hạng/phí + đánh dấu tiêu biểu.
- [ ] `T-00.BL08.19` [TEST] xUnit membership lifecycle/dedup/cert-no; vitest navbar/footer/home/wizard; Playwright E2E 3 hành trình (Tìm NCC · Gia nhập → Admin duyệt → Portal hội viên).
- [ ] `T-00.BL08.20` [DOC] Cập nhật `Specification/BASIC_DESIGN_BACLINK.md`, `specs/ROADMAP.md`, `specs/TRACEABILITY.md`.

**Ước lượng** `[PROPOSAL]`: GĐ0 ≈ 1,5 tuần · GĐ1 ≈ 2 tuần (1 dev full-stack).

---

## 7. Câu hỏi còn mở (không chặn thi công, dùng giá trị demo)
1. QĐ 589 và QĐ 1652: quan hệ thật giữa hai quyết định (§2.1).
2. Danh sách trưởng 9 ban và chức năng chính thức (§2.2).
3. Hạng hội viên, mức hội phí, chu kỳ và hạn đóng thật (§2.3).
4. Tài khoản Zalo OA / số Zalo chính thức để gắn vào nút Zalo (tạm dùng `0889156999`).
5. File PDF Điều lệ để gắn vào bước 3 của wizard (tạm hiển thị trang "Đang cập nhật").
