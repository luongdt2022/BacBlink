# QC Black-box Blueprint — CR-2026-005 Delta v12 (Cross-Surface)

**Trạng thái:** User authorized execution on 07/10/2026: "vậy làm nốt đi" following the 50-case blueprint approval request. Results require separate evidence; no automatic acceptance.
**Nguồn nghiệp vụ:** TASK-05 `spec.md` Delta v11 (REQ-EXP-DIR-003..006, BR-EXP-036..040, API-EXP-DIR-002..004, UI-EXP-DIR-002, NFR-EXP-DIR-001), `plan.md` và Basic Design mục 2.3.  
**Nguyên tắc:** QC chỉ dùng tài liệu nghiệp vụ và hệ thống chạy thật; không dựa vào cấu trúc code để suy ra expected result, không mock dữ liệu/hệ thống.

## 1. Kiểm kê bề mặt

| Bề mặt | Vai trò | Phạm vi quan sát | Quyết định |
|---|---|---|---|
| `/experts` + `/chuyen-gia` | Khách truy cập/Doanh nghiệp | Tìm kiếm, lọc, taxonomy, tỉnh, phân trang, cards, 5 UX states | In-scope |
| Home | Khách truy cập | Dynamic taxonomy count/cards and route filter | In-scope |
| Expert upgrade + CV parser | Chuyên gia/ẩn danh phù hợp | Dynamic sector option, stored code, AI prompt source/failure behavior | In-scope |
| Admin sectors/category/matrix | Admin | Runtime list/count/filter/create, category taxonomy, dynamic matrix labels | In-scope |
| Admin role sector scope + GOV/review/dashboard/login | Admin/State reviewer | Sector selection/projection/count copy resolves DB and honors active state | In-scope |
| `/chuyen-gia` | Khách truy cập/Doanh nghiệp | Alias/điều hướng tới danh bạ | In-scope regression |
| `/experts/[expertCode]` | Khách truy cập/Doanh nghiệp | Điểm đến CTA xem hồ sơ; xác nhận điều hướng và dữ liệu public/PII | Chỉ regression điểm chạm, không test toàn bộ chi tiết |
| API danh bạ và danh mục công khai | Anonymous caller | Tìm/lọc, taxonomy active, tỉnh public, gửi yêu cầu tư vấn | In-scope black-box contract/behavior |
| Notification/quy trình xử lý yêu cầu trong admin | NacenTech/Admin | Tiếp nhận và xử lý sau POST | Chỉ regression CTA/API; không nghiệm thu quy trình TASK-08 |
| Zalo Mini App, owner workspace, approval/governance | Các vai trò tương ứng | Regression sector fields/projections only where consumed; unrelated flows excluded | In-scope regression for sector data; unrelated features excluded |

## 2. Đề xuất định lượng

| Cấp | Nội dung | Số case |
|---|---|---:|
| 1 | Control / field / query validation | 12 |
| 2 | Màn hình, tương tác, responsive, 5 trạng thái UX + cross-surface runtime displays | 14 |
| 3 | Luồng nghiệp vụ con: filters, admin writes, upgrade/CV, RBAC, retry | 16 |
| 4 | Hành trình end-to-end theo public/expert/admin roles | 8 |
| **Tổng** |  | **50** |

## 3. Cấp 1 — Control & query validation (12)

| ID | Thao tác hộp đen | PASS | FAIL |
|---|---|---|---|
| TC-C1-01 | Mở danh bạ với query rỗng | Hiển thị trạng thái mặc định, không lỗi | Màn hình/API lỗi |
| TC-C1-02 | Nhập từ khóa tiếng Việt có dấu | Từ khóa được áp dụng và kết quả phù hợp | Bỏ dấu/lệch hoặc không áp dụng |
| TC-C1-03 | Nhập từ khóa không có kết quả | Empty state và nút đặt lại xuất hiện | Trang trắng/kết quả cũ |
| TC-C1-04 | Chọn một ngành trong danh sách | Ngành có mã/tên từ danh mục hiện hành | Có lựa chọn tự tạo/hardcode sai |
| TC-C1-05 | Chọn mã ngành không thuộc danh mục active qua request hợp lệ của UI/API | Không trả kết quả trái bộ lọc; không lỗi kỹ thuật | Chấp nhận tùy tiện hoặc 500 |
| TC-C1-06 | Chọn tỉnh từ danh sách địa bàn | Chỉ mã tỉnh có trong danh mục công khai được dùng | Cho phép mã không xác thực |
| TC-C1-07 | Đổi trang sau khi đang lọc | Trang mới vẫn giữ tiêu chí lọc | Mất lọc hoặc trang lỗi |
| TC-C1-08 | Chọn bộ lọc trạng thái tư vấn | Control có lựa chọn rõ ràng và áp dụng lên kết quả | Chỉ đổi giao diện, kết quả không đổi |
| TC-C1-09 | Xóa một chip tiêu chí | Chỉ tiêu chí đó được xóa và kết quả cập nhật | Xóa sai/không cập nhật |
| TC-C1-10 | Xóa toàn bộ tiêu chí | Từ khóa/bộ lọc/phân trang trở về mặc định | Còn tiêu chí ẩn hoặc trang cũ |
| TC-C1-11 | Dùng bàn phím focus và thao tác filter/CTA | Focus nhìn thấy, label/điều khiển dùng được | Mất focus hoặc không thao tác được |
| TC-C1-12 | Mở card và kiểm tra nội dung public | Không hiển thị CCCD, SĐT cá nhân, email riêng | Có bất kỳ PII bị cấm nào |

## 4. Cấp 2 — Màn hình & tương tác (10)

| ID | Thao tác hộp đen | PASS | FAIL |
|---|---|---|---|
| TC-C2-01 | Tải `/experts` ở 1440×900 | Hero/search/filter/card gọn, không tràn hoặc chồng lấn | Vỡ layout/cắt nội dung |
| TC-C2-02 | Tải `/experts` ở 390×844 | Bộ lọc mở bằng drawer phù hợp, không cuộn ngang | Tràn ngang/che CTA |
| TC-C2-03 | Quan sát lúc dữ liệu đang tải | Skeleton/loading rõ, không nháy nội dung sai | Trang trắng hoặc layout nhảy lớn |
| TC-C2-04 | Đợi tải thành công | Grid và số kết quả khớp dữ liệu nhận được | Tổng số/kết quả không khớp |
| TC-C2-05 | Tạo truy vấn không có kết quả | Empty state có hướng khôi phục/đặt lại | Không có chỉ dẫn hoặc còn kết quả cũ |
| TC-C2-06 | Làm danh mục lỗi rồi thử lại | Thông báo rõ, có retry, tiêu chí hiện tại được giữ | Danh sách giả hoặc mất tiêu chí |
| TC-C2-07 | Đổi nhanh 2 bộ lọc liên tiếp | Updating thể hiện đúng truy vấn mới nhất | Kết quả cũ bị gán cho truy vấn mới |
| TC-C2-08 | Mở/đóng bộ lọc mobile và gỡ chip | Trạng thái panel/chip nhất quán | Mất lựa chọn ngoài ý muốn |
| TC-C2-09 | Nhấn xem hồ sơ từ card | Điều hướng đúng mã chuyên gia | Sai route/sai mã |
| TC-C2-10 | Mở alias `/chuyen-gia` | Đến đúng danh bạ và vẫn dùng được | 404/khác nội dung |

## 5. Cấp 3 — Sub-workflows (8)

| ID | Luồng | PASS | FAIL |
|---|---|---|---|
| TC-C3-01 | Nạp ngành → đối chiếu danh sách và số lượng với response API active | UI khớp đúng số mục và mã/tên dữ liệu thật (baseline seed dự kiến 10; số chạy lấy từ DB/API) | UI cố định 10 hoặc lệch nguồn hiện hành |
| TC-C3-02 | Chọn ngành → tìm → kiểm tra kết quả → bỏ ngành | Chỉ hồ sơ khớp ngành, sau bỏ lọc trở về tập đúng | Ngành không tác động hoặc kết quả cũ |
| TC-C3-03 | Chọn tỉnh → tìm | Kết quả chỉ gồm chuyên gia có scope tỉnh tương ứng | Gán tỉnh mặc định/không lọc |
| TC-C3-04 | Kết hợp từ khóa + ngành + tỉnh + sẵn sàng tư vấn | Mọi tiêu chí cùng được áp dụng | Có tiêu chí bị bỏ qua |
| TC-C3-05 | Đổi bộ lọc ở trang >1 | Trang được reset về trang hợp lệ đầu tiên | Empty giả do đứng ở trang vượt biên |
| TC-C3-06 | API danh mục/lần tìm lỗi → retry | Lỗi được báo, tiêu chí giữ nguyên, retry khôi phục kết quả đúng | Báo success giả hoặc mất tiêu chí |
| TC-C3-07 | Gửi yêu cầu kết nối với dữ liệu hợp lệ | Chỉ khi dịch vụ chấp nhận mới báo đã tiếp nhận; nội dung nêu NacenTech/admin điều phối | Success giả hoặc nói chuyên gia đã nhận trực tiếp |
| TC-C3-08 | Gửi yêu cầu thiếu/sai thông tin hoặc dịch vụ từ chối | Báo lỗi có thể hiểu và cho sửa/thử lại; không tạo thông báo thành công | Lọt dữ liệu sai hoặc success giả |

## 6. Cấp 4 — E2E journeys (4)

| ID | Actor & hành trình | PASS | FAIL |
|---|---|---|---|
| TC-C4-01 | Khách ẩn danh: vào menu/alias → tìm theo từ khóa → mở hồ sơ công khai | Hành trình liền mạch, dữ liệu public đúng, không PII | Gãy route hoặc lộ dữ liệu riêng |
| TC-C4-02 | Doanh nghiệp: tìm → lọc ngành và tỉnh → phân trang → xem hồ sơ | Bộ lọc/phân trang giữ đúng qua các bước | Tiêu chí mất hoặc hồ sơ sai |
| TC-C4-03 | Doanh nghiệp: tìm chuyên gia → gửi yêu cầu kết nối | Response thật quyết định thông báo; nói đúng đầu mối tiếp nhận | Success không có căn cứ hoặc gửi sai chuyên gia |
| TC-C4-04 | Người dùng mobile: mở danh bạ → lọc trong drawer → gỡ tiêu chí → xem hồ sơ | Toàn hành trình tại 390×844 không tràn, thao tác hoàn thành được | Layout/CTA/filter cản trở hành trình |

## 7. Điều kiện thực thi sau khi duyệt

- Dùng môi trường API + PostgreSQL thật có dữ liệu được phê duyệt; QC ghi nhận build/version, thời điểm, endpoint và số taxonomy thực tế. Không dùng fixture/mock làm bằng chứng nghiệm thu.
- Chạy tuần tự Level 1 → 2 → 3 → 4; mỗi case có PASS/FAIL, evidence (request/response hoặc ảnh màn hình đã che PII), và defect ID nếu lỗi.
- Nếu không có môi trường/dữ liệu/tài khoản phù hợp, ghi BLOCKED; không tự tạo dữ liệu nghiệp vụ và không ký Gate 4.
- Trước sign-off phải xử lý các lỗi P0/P1 và chạy regression các case liên quan. Gate 4 vẫn độc lập với build/unit test.

## 8. Quyết định cần PO/User

Đề nghị duyệt **50 case (12/14/16/8)** cùng kiểm kê bề mặt ở mục 1 để QC chuyển Pha 2. Có thể trả lời `DUYỆT BLUEPRINT 50 CASE` hoặc chỉ rõ số cấp/bề mặt cần điều chỉnh. Đây là cổng sign-off test của quy trình `nacen-qc-study`; trước sign-off chỉ lập thiết kế kiểm thử, chưa thực thi black-box.


## 9. Delta v12 — bổ sung 16 case cross-surface (đã tính trong tổng 50)

| ID | Bề mặt / thao tác hộp đen | PASS | FAIL |
|---|---|---|---|
| TC-C2-11 | Home nạp taxonomy active | Count/card bằng response DB; chọn card mở directory với đúng code | Số/ngành cố định hoặc sai filter |
| TC-C2-12 | Login/admin copy khi count chưa tải | Không khẳng định số ngành chưa xác minh | Hardcode count runtime |
| TC-C2-13 | Admin taxonomy loading/empty/error | State tương ứng, không seed fallback | Danh sách/count giả |
| TC-C2-14 | Profile detail với sector code active/retired | Code active resolve name hiện hành; retired không được gọi active | Label stale |
| TC-C3-09 | Tạo ngành admin qua UI | Chỉ persist thành công mới hiển thị và còn sau reload | Local-only create |
| TC-C3-10 | Đổi tên ngành DB rồi reload surfaces | Tất cả dùng tên/mã hiện hành | Bề mặt stale |
| TC-C3-11 | Deactivate ngành, kiểm tra filter/home/form | Biến mất khỏi active options/count; hồ sơ cũ không đổi | Inactive selectable |
| TC-C3-12 | DB rỗng/API lỗi | Empty/error; CV parser trả service error; không fallback | Static list dùng tiếp |
| TC-C3-13 | TT17 categories | List/count khớp taxonomy CATEGORY active | Static count/list |
| TC-C3-14 | Matrix sau rename/deactivate | Label runtime; inactive/unknown không hiển thị như active | Label cũ như active |
| TC-C3-15 | Gán RBAC SECTOR | Chỉ chọn sector active, lưu code hợp lệ | Cho nhập tùy tiện ngành inactive/unknown |
| TC-C3-16 | Upgrade wizard submit | Payload chỉ có active sector code, keyword không bị gửi như sector | Label cũ/keyword trong sector IDs |
| TC-C4-05 | Admin tạo ngành → Home/directory/upgrade | Cùng taxonomy phản ánh qua bề mặt | Lệch hoặc local-only |
| TC-C4-06 | Admin deactivate → filter + role | Không gán/chọn ngành inactive, lịch sử không bị rewrite | Ngành inactive selectable |
| TC-C4-07 | CV scan với taxonomy có/không có | Prompt dùng runtime options; unavailable báo lỗi rõ | Prompt hardcode/success giả |
| TC-C4-08 | Matrix + profile sau taxonomy rename | Cùng code hiển thị tên hiện hành | Stale/mismatch |

**Cổng sign-off:** Tổng 50 case; đề nghị PO/User duyệt `DUYỆT BLUEPRINT 50 CASE` trước black-box. Unit/build không thay thế QC study sign-off.
