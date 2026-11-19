# Change Request: CR-2026-022 Chuyển Đổi Typography Toàn Hệ Thống Sang Be Vietnam Pro Đồng Bộ sti.gov.vn và trace.nacencheck.com

**CR-ID**: CR-2026-022  
**Epic**: TASK-00_PLATFORM_FOUNDATION_VA_COMMON  
**Status**: APPROVED  
**Target Version**: 1.18.0  
**Author**: PO kiêm Lead BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-03  
**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định PO-DEC-20261103-03 tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 7.3 & Mục 10; Hệ sinh thái Cục Thông tin KH&CN Quốc gia (`sti.gov.vn`) và Nền tảng Truy xuất Nguồn gốc Quốc gia (`trace.nacencheck.com`).  

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why & Technical Context)

- **Hiện trạng cũ (As-Is)**:
  - Hệ thống trước đây định hướng sử dụng mô hình font song hành `Nunito Sans` (cho phần thân, controls, tables) và `Lora` (cho tiêu đề hành chính, banners).
  - Tuy nhiên, trong toàn bộ hệ sinh thái của Bộ Khoa học và Công nghệ và Viện Ứng Dụng Công Nghệ NacenTech:
    * Cổng Thông tin điện tử Cục Thông tin KH&CN Quốc gia (`https://sti.gov.vn` - NASATI) sử dụng font **`Be Vietnam Pro`**.
    * Nền tảng Hệ sinh thái Số Quốc gia Trace.NacenCheck (`https://trace.nacencheck.com`) sử dụng font **`Be Vietnam Pro`**.
  - Việc tồn tại font `Nunito Sans` + `Lora` tạo ra sự không đồng nhất về mặt nhận diện thương hiệu số (Brand Identity) giữa các nền tảng công nghệ số trực thuộc Bộ và Viện.
- **Đề xuất mới (To-Be)**:
  - Chuẩn hóa toàn bộ typography giao diện người dùng và tiêu đề sang **`Be Vietnam Pro`** làm font chính thức đồng bộ 100% với `sti.gov.vn` và `trace.nacencheck.com`.
  - Tích hợp thêm font **`JetBrains Mono`** làm font monospaced kỹ thuật dành riêng cho các trường dữ liệu đặc thù: Mã số thuế (MST), Mã định danh hồ sơ (`REQ-*`, `DMD-*`, `OFR-*`), Hash bảo mật, Blockchain / ZK-Proof Hash.
  - Bảo toàn 100% các tiêu chí chất lượng khắt khe: Zero Layout Shift (CLS = 0) với `display: swap`, Zero Horizontal Overflow ở nấc co giãn cỡ chữ A+ 110%, Touch Target tối thiểu $\ge 44 \times 44\text{px}$.

---

### 2. Các Điểm Neo Nghiệp Vụ Bất Biến (Invariant Business Requirements & Rules)

#### [ADD] REQ-UI-FONT-01: Chuẩn Hóa Font Be Vietnam Pro Toàn Hệ Thống
Hệ thống Frontend MUST sử dụng font chữ **`Be Vietnam Pro`** làm font chữ chính thức duy nhất cho toàn bộ giao diện người dùng (body text, inputs, buttons, tables, badges, cards, dialogs) và toàn bộ các cấp tiêu đề (headings `h1` đến `h6`, display banners, quốc hiệu, tiêu ngữ), nạp trực tiếp qua `next/font/google` với đầy đủ subset `vietnamese` và `latin`.

#### [ADD] REQ-UI-FONT-02: Chuẩn Hóa Font JetBrains Mono Cho Dữ Liệu Kỹ Thuật
Hệ thống Frontend MUST sử dụng font chữ **`JetBrains Mono`** cho các khối dữ liệu kỹ thuật, mã định danh, số liệu blockchain/zk-proof, mã số thuế (MST), mã hồ sơ và mã hash bảo mật, đảm bảo độ rộng ký tự đồng đều (monospace) và phân biệt tuyệt đối giữa số 0 và chữ O, số 1 và chữ l.

#### [ADD] BR-UI-01: Kỷ Luật Zero Cumulative Layout Shift (Zero CLS)
Khi nạp và hiển thị các bộ font tĩnh thông qua Next.js font optimization, hệ thống MUST cấu hình cờ `display: 'swap'` và định nghĩa các CSS variables tĩnh trên thẻ `<html>` gốc để triệt tiêu hoàn toàn hiện tượng giật khung hình tải trang ban đầu (Cumulative Layout Shift = 0).

#### [ADD] BR-UI-02: Kỷ Luật Zero Horizontal Overflow Khi Co Giãn Chữ A+ (110%)
Tại mọi độ phân giải màn hình từ di động (320px) đến 4K, khi người dùng kích hoạt nấc phóng to cỡ chữ toàn cục A+ (110% qua `html[data-text-scale="lg"]`), hệ thống MUST bảo đảm không xuất hiện thanh cuộn ngang ngoài ý muốn (`overflow-x: clip` trên `html`, `body`), không vỡ khối điều hướng và không đè chữ lẫn nhau.

#### [ADD] UI-FONT-01: Cấu Hình Token CSS Variables Nền Tảng
Hệ thống thiết lập các biến CSS design tokens toàn cục tại `src/app/globals.css`:
- `--font-sans`: trỏ về `var(--font-be-vietnam-pro), ui-sans-serif, system-ui, sans-serif;`
- `--font-heading`: trỏ về `var(--font-be-vietnam-pro), ui-sans-serif, system-ui, sans-serif;`
- `--font-mono`: trỏ về `var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;`
- `--font-be-vietnam-pro`: biến kế thừa tương thích ngược.

#### [ADD] TEST-FONT-01: Bộ Kiểm Thử Đơn Vị QC Gate 4 Typography Đạt 100% Pass
Toàn bộ các tiêu chí kiểm chứng kỹ thuật typography (nạp font Be Vietnam Pro, JetBrains Mono, gán token CSS, 3 nấc scale font A-/A/A+, Touch Target $\ge 44\text{px}$, chống tràn menu `xl:flex` và `overflow-x: clip`) được tích hợp trong bộ kiểm thử `src/test/qc-gate4-typography.test.ts` và bắt buộc phải đạt kết quả 100% PASS (Green).

---

### 3. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Analysis)

| STT | Tệp Tin / Bề Mặt | Bản Chất Thay Đổi Kỹ Thuật | Trách Nhiệm Thực Thi |
|:---:|:---|:---|:---:|
| **1** | `Specification/BASIC_DESIGN_NACENTECH.md` | Cập nhật Mục 7.3 & Mục 10 (Quyết định PO-DEC-20261103-03), xác lập Be Vietnam Pro + JetBrains Mono làm SSOT. | **ĐÃ HOÀN TẤT (BA)** |
| **2** | `SourceCode/specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/spec.md` | Cập nhật Mục Spec Delta CR-2026-022, bổ sung REQ-UI-FONT-01, REQ-UI-FONT-02, BR-UI-01, BR-UI-02, UI-FONT-01, TEST-FONT-01. | **ĐÃ HOÀN TẤT (BA)** |
| **3** | `SourceCode/specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/plan.md` | Bổ sung kiến trúc font và kế hoạch triển khai Next.js Google Fonts cho Be Vietnam Pro + JetBrains Mono. | **ĐÃ HOÀN TẤT (BA & SA)** |
| **4** | `SourceCode/specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/tasks.md` | Phân rã Giai đoạn Delta CR-2026-022 với các task kỹ thuật [FE], [Test] chi tiết. | **ĐÃ HOÀN TẤT (BA)** |
| **5** | `SourceCode/frontend/src/app/layout.tsx` | Nhập khẩu `Be_Vietnam_Pro` và `JetBrains_Mono` từ `next/font/google`, gắn biến CSS `--font-be-vietnam-pro` và `--font-jetbrains-mono` lên thẻ `<html>`. | **ĐỢT 2 (Frontend Dev)** |
| **6** | `SourceCode/frontend/src/app/globals.css` | Ánh xạ `--font-sans` và `--font-heading` về `var(--font-be-vietnam-pro)`, `--font-mono` về `var(--font-jetbrains-mono)`. | **ĐỢT 2 (Frontend Dev)** |
| **7** | `SourceCode/frontend/src/test/qc-gate4-typography.test.ts` | Cập nhật các assertion kiểm tra `Be_Vietnam_Pro` và `JetBrains_Mono`, chạy Vitest xác nhận 100% PASS. | **ĐỢT 2 (QC Tester)** |

---

### 4. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-CR-022.1**: Tệp `src/app/layout.tsx` nạp đúng `Be_Vietnam_Pro` (weights: 400, 500, 600, 700, 800) và `JetBrains_Mono` (weights: 400, 500, 600) với `display: 'swap'` và `subsets: ['vietnamese', 'latin']`.
- [ ] **AC-CR-022.2**: Tệp `src/app/globals.css` khai báo chính xác các biến `--font-sans`, `--font-heading`, `--font-mono`.
- [ ] **AC-CR-022.3**: Giao diện người dùng trên toàn hệ thống áp dụng font Be Vietnam Pro đồng bộ, không còn class hoặc khai báo rác trỏ tới Nunito Sans hoặc Lora.
- [ ] **AC-CR-022.4 (Zero Horizontal Overflow)**: Kích hoạt nút cỡ chữ A+ (110%) không xuất hiện cuộn ngang (`window.scrollX === 0`) trên các độ phân giải từ 320px đến 4K.
- [ ] **AC-CR-022.5 (Touch Targets $\ge 44\text{px}$)**: Các nút điều khiển cỡ chữ và các nút tương tác đạt diện tích chạm tối thiểu $44 \times 44\text{px}$.
- [ ] **AC-CR-022.6 (QC Verification)**: Bộ kiểm thử `qc-gate4-typography.test.ts` đạt kết quả 100% Green (PASS).
- [ ] **AC-CR-022.7 (Build Success)**: Lệnh `pnpm build` tại `SourceCode/frontend` kết thúc thành công với mã lỗi 0.
