# Rà soát giao diện Web — 29/09/2026

Chuẩn áp dụng: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Không thay text, trường, API, dữ liệu, quyền hoặc luồng nghiệp vụ. Yêu cầu PO: áp dụng chuẩn cho toàn bộ màn còn lại.

## Ma trận tác động trước triển khai

| Bề mặt | Quyết định / tác động |
| --- | --- |
| Basic Design/wireframe | Đối chiếu nguồn TASK-01/05/07; không thay wireframe hay tự bổ sung nghiệp vụ còn thiếu |
| Detail Spec | Không thay yêu cầu nghiệp vụ; ghi nhận rollout giao diện tại tài liệu này |
| API/DTO, domain validation, DB/migration | Không thay đổi |
| Web common | Token Navy, typography, input/button/link, focus/hover/disabled, light/dark |
| Public | 7 route module đang là trang giới thiệu phân hệ; login/register; chi tiết chuyên gia |
| Owner | Workspace thường, dashboard chuyên gia, hồ sơ riêng tư, wizard nâng hạng 3 bước |
| Admin/Gov | Dashboard, sidebar, scope bar, bảng hàng đợi; giữ quyền hiện tại |
| Zalo/Mobile app | Không sửa app riêng; kiểm tra responsive Web trên mobile theo phạm vi PO yêu cầu Web |
| Test | Typecheck, unit/regression, style guard và Visual QA; phân biệt dữ liệu thật, trang giữ chỗ và màn bị chặn đăng nhập |

## Kiểm kê mã nguồn thực tế

PO xác nhận áp dụng tất cả màn đã có, không yêu cầu đúng con số 24. Kiểm kê: 15 route ngoài trang chủ, 16 màn/biến thể (workspace có 2 biến thể theo role), từ 9 page entry và 7 slug public:

| # | Route / biến thể | Hiện trạng |
| --- | --- | --- |
| 1 | `/gioi-thieu` | Trang giới thiệu phân hệ |
| 2 | `/chao-ban-cong-nghe` | Trang giữ chỗ phân hệ, chưa có danh sách đầy đủ |
| 3 | `/nhu-cau-cong-nghe` | Trang giữ chỗ phân hệ |
| 4 | `/doanh-nghiep-dmst` | Trang giữ chỗ phân hệ |
| 5 | `/elearning` | Trang giữ chỗ phân hệ |
| 6 | `/chuyen-gia` | Trang giữ chỗ phân hệ |
| 7 | `/dich-vu-khac` | Trang giữ chỗ phân hệ |
| 8 | `/login` | Form đăng nhập |
| 9 | `/register` | Form đăng ký |
| 10 | `/portal` — thông thường | Dashboard |
| 11 | `/portal` — VERIFIED_EXPERT | Dashboard gọi API |
| 12 | `/experts/[expertCode]` | Hồ sơ public gọi API |
| 13 | `/portal/expert/profile` | Hồ sơ owner gọi API |
| 14 | `/profile/upgrade/expert` | Wizard 3 bước và trạng thái |
| 15 | `/admin` | Dashboard quản trị |
| 16 | `/gov` | Dashboard kiểm duyệt |

Các menu hiện chưa có page: `/portal/technologies`, `/portal/demands`, `/portal/enterprise`, `/admin/users`, `/admin/org-tree`, `/admin/audit-logs`, `/admin/master-data`. Theo PO xác nhận, không tạo chức năng mới hoặc tính route chưa tồn tại vào phạm vi nghiệm thu.

## Nghiệm thu

### Kết quả triển khai

- Áp dụng palette Navy/Emerald cho tất cả 15 route / 16 biến thể hiện có; banner workspace dùng họa tiết khoa học cùng trang chủ. Bỏ gradient Indigo/Purple, màu đỏ/vàng trang trí cấp quyền. Màu SLA, cảnh báo, lỗi và thành công được giữ đúng ngữ nghĩa.
- Typography dùng Be Vietnam Pro từ root; page heading 30/36px, card heading 18px, body 16px, label 14px, meta 12px. Form/control dùng rem, có light/dark, focus và disabled.
- Common AppButton/AppLink dùng cùng variants; sửa `tailwind-merge` để không nhầm token cỡ chữ thành màu chữ. Nút nghiệp vụ tối thiểu 44×44px; input 16px / cao ≥44px.
- Sidebar co thành hàng dọc trên mobile, nội dung có `min-w-0`; form đăng ký về một cột; bước wizard có nhãn trên mobile; hàng action wrap. Bảng và tab thành tựu cuộn trong vùng riêng, không che tràn bằng overflow toàn trang.
- Giữ nguyên text, danh sách trường, validation, callback và API. Đối chiếu cấu trúc 28 file TSX với bản sao trước thay đổi: không đổi JSX text, thuộc tính dữ liệu/handler và lời gọi nghiệp vụ (loại trừ class/variant/presentation).

### Bằng chứng kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript `npx tsc --noEmit` | Pass |
| Vitest | 26 test pass: 6 file; login, public/owner expert, dashboard, 5 Async states, variants, disabled, form đăng ký, 3 bước wizard, role guard và guard chống tái xuất palette/cỡ chữ cũ |
| Production build | Pass trong bản sao tạm riêng; không ghi đè `.next` của dev server đang chạy |
| Public thực tế | 7 module, login/register, wizard và hồi quy home: không tràn ngang ở 390px; public/module/form thêm 1280px, 1440px |
| Nghiệp vụ cần đăng nhập | HTML render từ component thật bằng Vitest, session/API mock riêng: admin/gov/workspace/expert public/owner/dashboard, consultation và 3 bước wizard |
| Responsive nghiệp vụ | 390px, 1280px, 1440px đều không tràn ngang toàn trang |
| Dark + A+ | 11 fixture/state ở 390px: root 17.6px, không tràn ngang; đăng ký live kiểm tra dark + A+ ở desktop |
| Visual screenshots | Đã xem các ảnh trong browser QA; chưa lưu bộ PNG vào repo |

Không gọi thao tác đăng ký/nộp/duyệt thực tế để kiểm thử UI. Không coi mock là nghiệm thu tích hợp backend. Các trang public còn là khung giới thiệu và menu chưa triển khai không được biến thành chức năng giả.

### Ma trận tác động sau triển khai

Web public/owner/admin/gov và common đã cập nhật theo phạm vi trên. Wireframe nguồn, Detail Spec nghiệp vụ, API/DTO, domain validation, DB/migration và Zalo app không thay đổi. Test và tài liệu rule đã cập nhật. Phạm vi Web hiện có được PO xác nhận trong hội thoại; không phát sinh màn nghiệp vụ mới.
