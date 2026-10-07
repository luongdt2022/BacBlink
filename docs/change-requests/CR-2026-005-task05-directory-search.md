# YÊU CẦU THAY ĐỔI — CR-2026-005

| | |
| :--- | :--- |
| **Mã** | `CR-2026-005` |
| **Tiêu đề** | Hội tụ toàn bộ bề mặt ngành theo Master Data động và tinh gọn tìm kiếm chuyên gia |
| **Người đề xuất** | PO/User (đã xác nhận scope trong phiên làm việc 07/10/2026) |
| **Ngày đề xuất** | 07/10/2026 |
| **Mức độ khẩn** | Cao — P1 trong luồng tìm kiếm chuyên gia |
| **Trạng thái** | ĐÃ DUYỆT scope; ĐANG THỰC THI Delta; chờ Gate 4 và Gate 5 |

## 1. Nội dung đề xuất

**Hiện trạng:** Nhiều bề mặt đang giữ mảng ngành, số lượng và lựa chọn cố định; một số API trả fallback khi DB trống. Directory `/experts` cũng cần hội tụ filter với dữ liệu runtime và tinh gọn UX.

**Đề xuất thay đổi [CONFIRMED]:**

1. Mọi màn hình, biểu mẫu, bộ lọc, nhãn và projection ngành lấy code/name/count từ taxonomy đang hoạt động trong DB; không hardcode danh sách, số lượng, tên fallback hoặc sector selector. Baseline DB được PO xác nhận là 10, nhưng runtime count luôn do DB quyết định.
2. Lọc danh bạ theo đúng sector code và địa bàn có nguồn xác thực/scope tỉnh đã duyệt; không gán tỉnh mặc định.
3. Tinh gọn màn hình tìm kiếm desktop/mobile, giữ 5 trạng thái UX và chỉ hiển thị controls có tác dụng thật.
4. Nối yêu cầu kết nối với endpoint consultation hiện hữu và chỉ xác nhận tiếp nhận khi API trả thành công, diễn đạt đúng NacenTech/admin là đầu mối.
5. Đồng bộ Home, login, profile upgrade/CV parser, admin taxonomy/matrix, admin RBAC sector scope, GOV dashboard và public expert detail qua master-data runtime client/API; API không trả danh sách fallback khi DB rỗng.

**Lý do:** PO yêu cầu kiểm tra dữ liệu ngành chuẩn hóa trong DB và cải thiện màn tìm kiếm chuyên gia đang to, thô; việc đối soát cho thấy cần hội tụ UI/API và tài liệu living trước khi nghiệm thu.

## 2. Phân tích tác động

### 2.1. Yêu cầu bị ảnh hưởng

| Mã | Loại tác động | Mô tả |
| :--- | :--- | :--- |
| `REQ-EXP-DIR-003..006` | Bổ sung | Danh mục active runtime, bộ lọc xác thực, UI compact và 5 UX states |
| `BR-EXP-038..040` | Bổ sung | Control trung thực, retry/query state nhất quán, deny-list PII |
| `API-EXP-DIR-002..004` | Bổ sung | Query bộ lọc, public provinces projection, tái sử dụng consultation endpoint |
| `UI-EXP-DIR-002`, `NFR-EXP-DIR-001` | Bổ sung | Desktop/mobile density, responsive/accessibility |

### 2.2. Cross-Surface Impact Matrix (grep-first)

| Bề mặt / Màn hình / API / DB | File Path / Contract | Hiện trạng | Thay đổi |
| :--- | :--- | :--- | :--- |
| Basic Design/wireframe | `Specification/02_BASIC_DESIGN/TASK-05.../README.md`; `wireframe_danh_ba_chuyen_gia_v11.html` | Wireframe Delta v11 đã tạo | Đồng bộ quyết định DB active count, compact desktop/mobile, 5 states |
| Detail Spec/Plan/Tasks | `SourceCode/specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN/` | Delta v11 đã append; tasks đang mở | Rà coverage 1:1, giữ tasks chưa tick tới verification |
| Web directory | `SourceCode/frontend/src/app/experts/page.tsx` | Fetch danh mục, filters, modal, compact layout đã sửa | Kiểm tra real-data behavior, state, keyboard, 1440×900 và 390×844 |
| Home | `frontend/src/app/page.tsx` | Danh sách và tiêu đề ngành hardcoded | Đọc taxonomy active, count động, link lọc theo code |
| Upgrade/CV parser | `frontend/src/app/profile/upgrade/expert/page.tsx`; `frontend/src/app/api/cv-parser/route.ts` | Selector/default/prompt ngành tĩnh | Lưu code ngành; prompt AI lấy option hiện hành, lỗi nếu taxonomy unavailable |
| Admin taxonomy/matrix | `frontend/src/app/admin/sectors/page.tsx`; `backend/apps/api/V1Compat/MasterDataControllers.cs` | Seed fallback, local-only create, static TT17; matrix label tĩnh | CRUD taxonomy thật; bỏ CoreSectors fallback; category DB; matrix resolve label runtime |
| Admin RBAC | `frontend/src/app/admin/roles/page.tsx` | Nhập scope ngành tự do và hint code tĩnh | Sector scope chọn từ active taxonomy |
| Common labels | `frontend/src/app/admin/layout.tsx`; `admin/page.tsx`; `admin-nav.tsx`; login; GOV | Count/phrasing 10 cố định | Nhãn đếm động hoặc copy không gắn count; không claim số khi chưa nạp được DB |
| Public expert detail | `frontend/src/components/expert-detail/profile-detail.tsx` | Projection có thể hiển thị raw sector code | Resolve code thành taxonomy name; giữ keyword chuyên môn riêng |
| Web navigation alias | `src/app/[module]/page.tsx`, `src/components/common/navbar.tsx` | Navbar vào `/chuyen-gia`, alias route | Regression đường vào danh bạ |
| Public expert detail | `src/app/experts/[expertCode]/page.tsx`, `src/components/expert-detail/profile-detail.tsx` | Public profile và consultation CTA có sẵn | Regression điểm đến từ card; không đổi chức năng detail |
| Directory API/service | `backend/apps/api/V1Compat/ExpertController.cs`; `backend/modules/brokerage/Application/{Contracts,ExpertService}.cs` | Search API hiện có | Sector/accepting filter và province scope behavior |
| Public province projection | `backend/apps/api/V1Compat/GovernanceControllers.cs` | Projection công khai vừa bổ sung | Chỉ trả code/name/region; kiểm tra không lộ dữ liệu nội bộ |
| Master data SECTOR | `GET /api/v1/sectors`; taxonomy DB `policy.taxonomy_terms` | Migration trước đó seed baseline 10 LV; DB runtime chưa đo | UI đếm active response thật; so sánh count DB/API khi môi trường khả dụng |
| Expert profile/scope DB | `expert_profiles`, Identity `Person` scope | Schema và hồ sơ có sẵn | Không yêu cầu migration mới; lọc province theo scope thật |
| Consultation request | `POST /api/v1/public/experts/{expertCode}/consultation-requests` | Endpoint đã tồn tại | Tái sử dụng; success chỉ sau accepted response |
| Owner/admin/Zalo projections | Owner workspace, admin review, Zalo Mini App | Cần đối soát nguồn ngành trong mọi projection | Đồng bộ nơi tiêu thụ ngành theo scope PO; ghi evidence cho cả kênh không có selector/count ngành |

### 2.3. Tác động kỹ thuật

| Hạng mục | Có/Không | Chi tiết |
| :--- | :---: | :--- |
| Đổi lược đồ CSDL | Không | Tái sử dụng taxonomy và Person scope hiện có; không thêm migration |
| Đổi hợp đồng API phá vỡ tương thích | Không | Thêm query tùy chọn/projection công khai tối thiểu; giữ query cũ và consultation endpoint cũ |
| Đổi luồng giao diện | Có | Compact filters/cards, retry, query/pagination consistency, consultation modal |
| Ảnh hưởng dữ liệu hiện có | Đọc/ghi theo quyền hiện hữu | Directory chỉ đọc; quản trị ngành và nâng hạng chuyên gia dùng API thật, validation taxonomy active |
| Gửi lại dữ liệu cho cơ quan Nhà nước | Không | Không có dữ liệu hồ sơ được cập nhật bởi CR này |

### 2.4. Tác động pháp lý

| Câu hỏi | Trả lời |
| :--- | :--- |
| Giảm tuân thủ nghĩa vụ hiện có? | Không; giữ nguyên bảo vệ PII và public/approved projection |
| Nghĩa vụ mới? | Không; áp dụng deny-list PII đã có trong `BR-EXP-036/040` |
| Cần Pháp chế xác nhận? | Không phát sinh quy tắc pháp lý mới; nếu test phát hiện dữ liệu PII bị lộ thì chặn Gate 4 và xử lý incident/tuân thủ riêng |

### 2.5. Ước lượng [PROPOSAL]

| Hạng mục | Ước lượng |
| :--- | :--- |
| BA/SA và đồng bộ thiết kế | 0.5 ngày |
| Phát triển | 1 ngày |
| Kiểm thử/hồi quy | 1 ngày (chưa tính thời gian chờ môi trường) |
| **Tổng** | **2.5 ngày công** |

### 2.6. Rủi ro nếu không thực hiện

Count/ngành có thể lệch DB; filter hiển thị nhưng không lọc thật; province có thể bị gán suy đoán; UX dày và khó dùng trên mobile; CTA có thể báo thành công sai; nguy cơ public dữ liệu ngoài phạm vi cho phép.

## 3. Phương án thay thế

| # | Phương án | Ưu | Nhược | Kết luận |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Giữ danh mục/filter/UI Delta v10 | Không tốn công | Không bảo đảm nguồn active hiện hành và filter behavior | Không chọn |
| 2 | Nạp master data thật, lọc theo scope thật, compact UI | Nhất quán nguồn, đúng quyết định PO, không thêm schema | Cần xác minh môi trường thật và nhiều lớp test | Chọn |

## 4. Quyết định

| | |
| :--- | :--- |
| **Người quyết định** | PO/User |
| **Ngày quyết định** | 07/10/2026 |
| **Kết luận** | ĐỒNG Ý scope — xác nhận `XÁC NHẬN SCOPE` đã có trong phiên |
| **Lý do** | Hiển thị đúng số ngành có trong DB; baseline đã chuẩn hóa 10 ngành; giữ số liệu runtime theo active DB |
| **Điều kiện** | Chưa đóng CR cho tới khi backend build, DB/API verification, 4 tầng QC, traceability và PO Gate 5 có bằng chứng pass |

**SA finding cần hội tụ trước Gate 4:** Contract ban đầu gọi tham số từ khóa là `query`, trong khi client hiện hữu gửi `q`. Giữ `q` tương thích và hỗ trợ thêm alias `query`; nếu cả hai cùng có giá trị thì `q` ưu tiên. Chi tiết tại [Detail Design](../02-detail-design/DD-02-task05-expert-directory-v11.md).

## 5. Theo dõi thực hiện

| Việc | Vai trò | Trạng thái |
| :--- | :--- | :--- |
| Đồng bộ Basic Design, Detail Design, spec/plan/tasks | BA/SA | Đang đồng bộ |
| Hoàn thiện và kiểm chứng API/FE | Dev | Đã có thay đổi; backend build chưa xác nhận |
| Unit, contracts, PostgreSQL integration, Playwright/RBAC | EC/QC | Chưa chạy Gate 4 |
| Traceability và test evidence | BA/EC | Đang chuẩn bị |
| Gate 5 acceptance / đóng CR | PO/PM | Chưa đủ điều kiện |


## 6. Delta mở rộng do PO chỉ đạo đồng bộ toàn bộ ngành (07/10/2026)

Scope mở rộng bao gồm mọi nơi thể hiện hoặc nhận ngành trên Web và API. Danh mục taxonomy là nguồn sự thật duy nhất; các mã/tên legacy trong hồ sơ cũ chỉ được resolve qua taxonomy. Seed migration hiện hữu tiếp tục tạo dữ liệu nền DB, không được dùng thay thế API/runtime.

**Gate hiện tại:** triển khai Delta đang mở. Các checkbox thực thi và QC chưa đóng. Phân ngành TT17/category đã chuyển endpoint sang taxonomy `CATEGORY`; quan hệ tương thích lĩnh vực-công nghệ vẫn là bộ dữ liệu cấu hình riêng, nhưng tên lĩnh vực phải resolve từ taxonomy và mọi mã không còn tồn tại phải không xuất hiện như một ngành đang hoạt động.
