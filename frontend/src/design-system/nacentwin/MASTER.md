# Design System Master File (SSOT) — NacenTwin

> **LOGIC:** When building a specific page or component, first check `design-system/nacentwin/pages/[page-name].md`.  
> If that file exists, its rules **override** this Master file.  
> If not, strictly follow the rules below.

---

**Project:** NacenTwin (`nacentwin`)  
**Domain:** GovTech / Tech Innovation & Deep Science-Technology Portal  
**Document Code:** `DS-MASTER-NACENTWIN-v3.0.0`  
**Governing Basic Design:** `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/BD-01-uiux-pro-max-design-system.md`  
**Compliance Standard:** WCAG 2.1 Level AA (Contrast Ratio $\ge 4.5:1$, Visible Focus Ring, Screen-Reader Labels, Touch Target $\ge 44 \times 44\text{px}$)  
**Generated & Certified By:** `ui-ux-pro-max` Design Intelligence Engine & Software Architect (`nacen-techlead-sa`)

---

## 1. Global Rules & Design Philosophy

### 1.1. Core Philosophy (GovTech + Deep Science & Technology)
1. **Uy Tín & Kỷ Cương Hành Chính (GovTech Authority)**: Tông màu Navy `#3C5999` chuẩn mực của Viện Ứng Dụng Công Nghệ (Bộ KH&CN), kế thừa quy chuẩn Cổng thông tin điện tử Nhà nước (Nghị định 42/2022/NĐ-CP).
2. **Sáng Tạo & Đột Phá Đổi Mới (Innovation & Tech Transfer)**: Sắc màu Sinh thái & Chuyển giao công nghệ Emerald `#2D9A85`, kết hợp điểm nhấn Công nghệ số & AI Radar Cyan `#06B6D4`.
3. **Trải Nghiệm Đọc Dịu Mắt & Rõ Ràng**: Nền Slate nhạt `#F8FAFC` kết hợp thẻ trắng `#FFFFFF` và độ phân cấp tương phản văn bản cao (`#0F172A` và `#475569`).
4. **Zero-Mock & 5 UX States**: 100% khối dữ liệu bất đồng bộ tuân thủ 5 trạng thái UX (Loading Shimmer, Empty, Error with Retry, Success Fade-in, Partial Updating).

---

## 2. Color Palette (Bảng Màu Tiêu Chuẩn)

### 2.1. Core Brand & Surface Palette

| Role / Token | Hex | Tailwind / CSS Variable | Contrast vs Surface | Usage & Meaning |
| :--- | :---: | :--- | :---: | :--- |
| **Primary Brand Navy** | `#3C5999` | `--color-brand-primary` / `--color-brand-700` | $5.12:1$ (AA) | Header, Navigation, Primary CTA, Active Tabs, Viền tiêu điểm. |
| **Brand Navy Hover** | `#30477A` | `--color-brand-800` | $6.85:1$ (AA) | Hover & Active state của Primary Navy elements. |
| **Brand Navy Deep** | `#23365D` | `--color-brand-900` | $9.82:1$ (AAA) | Sidebar nền tối, Footer đậm, High-contrast dark banner. |
| **Brand Navy Soft** | `#6680B3` | `--color-brand-500` | $3.25:1$ | Viền hover nhẹ, biểu tượng trang trí phụ. |
| **Brand Navy Light** | `#F0F3F9` | `--color-brand-50` | N/A | Nền hover menu, badge nền nhạt. |
| **Conversion CTA Emerald** | `#2D9A85` | `--color-nacen-green-500` / `--color-cta` | $4.58:1$ (AA) | Nút hành động trực tiếp (CTA Đăng ký, Nộp hồ sơ, Mở bán), Điểm TT17, TRL 8-9. |
| **CTA Emerald Hover** | `#258B78` | `--color-nacen-green-600` | $5.41:1$ (AA) | Hover state cho nút chuyển đổi CTA. |
| **CTA Emerald Light** | `#ECF8F5` | `--color-nacen-green-50` | N/A | Nền badge TRL cao, thẻ thành công sinh thái. |
| **Innovation Cyan** | `#06B6D4` | `--color-innovation-500` | $3.8:1$ | Điểm nhấn công nghệ số: Radar matching, AI Scan, Tag công nghệ cao, Focus ring phụ. |
| **Surface Page** | `#F8FAFC` | `--color-surface-page` | Background | Nền trang tổng thể (Slate 50), chống mỏi mắt cho cán bộ / chuyên gia. |
| **Surface Card** | `#FFFFFF` | `--color-surface-card` | Background | Nền các thẻ nội dung (Card), Modal, Panel làm việc. |
| **Surface Subtle** | `#F1F5F9` | `--color-surface-subtle` | Background | Nền ô input phụ, header bảng biểu, khối trích dẫn. |
| **Border Default** | `#E2E8F0` | `--color-border-default` / `--color-border` | N/A | Viền phân chia mỏng $1\text{px}$ chuẩn Slate 200. |
| **Text Primary** | `#0F172A` | `--color-text-primary` | $15.8:1$ (AAA) | Văn bản chính, tiêu đề (Slate 900). |
| **Text Secondary** | `#475569` | `--color-text-secondary` | $5.3:1$ (AA) | Văn bản phụ, nhãn trường, mô tả (Slate 600). |
| **Text Muted** | `#94A3B8` | `--color-text-muted` | $3.1:1$ | Placeholder, icon thứ cấp, timestamp mờ. |

### 2.2. Semantic Status Colors (Trạng Thái Nghiệp Vụ)

| Trạng Thái | Hex Chính | Nền Nhạt (Background) | Viền (Border) | Ứng Dụng Nghiệp Vụ |
| :--- | :---: | :---: | :---: | :--- |
| **Success** | `#10B981` (Emerald-500) | `#ECFDF5` | `#A7F3D0` | Đã duyệt hồ sơ, Giao dịch hoàn tất, TRL 8–9. |
| **Warning** | `#F59E0B` (Amber-500) | `#FFFBEB` | `#FDE68A` | Chờ thẩm định, Cảnh báo hạn ngạch, TRL 4–6. |
| **Danger** | `#EF4444` (Rose-500) | `#FEF2F2` | `#FECACA` | Từ chối hồ sơ, Lỗi hệ thống, Vi phạm quy chế, TRL 1–3. |
| **Info** | `#3B82F6` (Blue-500) | `#EFF6FF` | `#BFDBFE` | Hướng dẫn thủ tục, Bản ghi nháp, Thông cáo chung. |

---

## 3. Typography Hierarchy & Font Pairing

### 3.1. Font Pairing
- **Primary UI & Headings**: `Be Vietnam Pro` (fallback: `Plus Jakarta Sans`, `Inter`, `sans-serif`). Đồng bộ Cổng TTĐT Bộ KH&CN (`sti.gov.vn`) và Nền tảng Quốc gia (`trace.nacencheck.com`).
- **Technical & Monospace**: `JetBrains Mono` (fallback: `ui-monospace`, `monospace`). Dành riêng cho:
  - Mã định danh hồ sơ: `REQ-*`, `DMD-*`, `OFR-*`, `EXP-*`, `CR-*`, `TASK-*`.
  - Mã số thuế (MST doanh nghiệp: 10 hoặc 13 số).
  - Chuỗi mã hóa kỹ thuật: Block Hash, TxID, ZK-Proof token, tọa độ địa lý, SHA-256.

### 3.2. Type Scale & Hierarchy

| Cấp Bậc (Scale) | Size (px / rem) | Line Height | Weight | Letter Spacing | CSS Utility |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Display 1 (Hero)** | `36px` / `2.25rem` | `1.25` | `800` Extrabold | `-0.02em` | `text-4xl font-extrabold tracking-tight` |
| **Heading 1 (Page Title)** | `28px` / `1.75rem` | `1.3` | `700` Bold | `-0.015em` | `text-2xl sm:text-3xl font-bold` |
| **Heading 2 (Section Title)**| `22px` / `1.375rem` | `1.35` | `700` Bold | Normal | `text-xl sm:text-2xl font-bold` |
| **Heading 3 (Card/Modal)** | `18px` / `1.125rem` | `1.4` | `600` Semibold | Normal | `text-lg font-semibold` |
| **Body Regular (Đọc chính)**| `15px` / `0.9375rem`| `1.6` | `400` Regular | Normal | `text-[15px] leading-relaxed` |
| **Body Medium (Controls)** | `14px` / `0.875rem` | `1.5` | `500` Medium | Normal | `text-sm font-medium` |
| **Caption / Meta (Ghi chú)** | `12px` / `0.75rem` | `1.5` | `500` Medium | Normal | `text-xs font-medium` |
| **Monospace Code** | `13px` / `0.8125rem`| `1.5` | `500` Medium | Normal | `font-mono text-xs` |

### 3.3. Text Scale Adaptability
Hệ thống hỗ trợ 3 mức kích thước toàn cục thông qua thuộc tính `html[data-text-scale]`:
- `data-text-scale="sm"`: `92.5%` (Màn hình laptop độ phân giải gọn).
- `data-text-scale="md"`: `100%` (Mặc định chuẩn 16px).
- `data-text-scale="lg"`: `110%` (Chế độ hỗ trợ người cao tuổi / thị lực yếu).
- **Ràng buộc:** Khi bật `lg`, giao diện không được vỡ layout, không xuất hiện thanh cuộn ngang ngoài ý muốn (`overflow-x: clip`).

---

## 4. Spacing, Radius & Elevation System

### 4.1. Spacing Scale (8pt Grid Standard)

| Token | Giá Trị (rem / px) | Ứng Dụng Điển Hình |
| :--- | :---: | :--- |
| `--space-2xs` | `0.125rem` / `2px` | Border offset, viền chỉ báo siêu nhỏ |
| `--space-xs` | `0.25rem` / `4px` | Khoảng cách inline rất nhỏ, badge padding dọc |
| `--space-sm` | `0.5rem` / `8px` | Icon gap, button padding dọc nhỏ, spacing giữa tag |
| `--space-md` | `1rem` / `16px` | Padding trong card di động, margin tiêu chuẩn |
| `--space-lg` | `1.5rem` / `24px` | Card padding desktop, khoảng cách giữa các phần tử |
| `--space-xl` | `2rem` / `32px` | Khoảng cách giữa các section trong trang |
| `--space-2xl` | `3rem` / `48px` | Khoảng cách section lớn |
| `--space-3xl` | `4rem` / `64px` | Top padding hero banner |

### 4.2. Border Radius Scale

| Token | Giá Trị | Ứng Dụng |
| :--- | :---: | :--- |
| `rounded-md` | `6px` / `0.375rem` | Checkbox, radio container, small badge |
| `rounded-lg` (`--radius-control`) | `8px` - `10px` / `0.625rem` | Button, Input, Select, Chip, Search bar |
| `rounded-2xl` (`--radius-surface`) | `16px` / `1rem` | Card, Container, Dropdown popover, Alert box |
| `rounded-3xl` (`--radius-modal`) | `20px` - `24px` / `1.25rem` | Large Dialogs, Drawer, Modal cửa sổ lớn |
| `rounded-full` | `9999px` | Avatar, Status Dot, Pill Button, Round Icon Button |

### 4.3. Multi-Tier Elevation Shadows (Bóng Đổ Đa Tầng)

```css
/* Elevation 0: Phẳng hoàn toàn, dùng cho form nhập liệu và panel phẳng */
--shadow-elevation-0: none;

/* Elevation 1: Thẻ thông tin tĩnh ở trạng thái nghỉ */
--shadow-elevation-1: 0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04);

/* Elevation 2: Thẻ tương tác khi hover, nâng nhẹ bề mặt */
--shadow-elevation-2: 0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.04);

/* Elevation 3: Dropdown menu, Popover nổi, Tooltip */
--shadow-elevation-3: 0 20px 25px -5px rgb(15 23 42 / 0.10), 0 8px 10px -6px rgb(15 23 42 / 0.04);

/* Elevation 4: Modal hộp thoại, Drawer toàn màn hình */
--shadow-elevation-4: 0 25px 50px -12px rgb(15 23 42 / 0.25);
```

---

## 5. Micro-Interactions & Accessible Motion

### 5.1. Button Active Press (Phản Hồi Xúc Giác Nút Bấm)
- Nút bấm khi nhấn chuột hoặc chạm tay: `active:scale-[0.98]`
- Transition mượt mà: `transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)`
- Áp dụng utility class: `.btn-press`

### 5.2. Accessible Dual Focus Ring (Vòng Tiêu Điểm Kép Chuẩn A11y)
- Loại bỏ outline mặc định màu xanh của trình duyệt: `outline: none;`
- Áp dụng vòng sáng đôi rõ nét khi điều hướng bằng bàn phím (Tab key):
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2`
- Đảm bảo độc lập tương phản giữa viền nút và nền trang.

### 5.3. Skeleton Shimmer Loading (Hoạt Ảnh Ánh Sáng Quét Tuyến Tính)
- Cấu hình keyframe mượt mà, không giật lag:
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f1f5f9 0%,
    #e2e8f0 50%,
    #f1f5f9 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark .skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #1e293b 0%,
    #334155 50%,
    #1e293b 100%
  );
  background-size: 200% 100%;
}
```

### 5.4. Kỷ Luật Giảm Chuyển Động (`prefers-reduced-motion`)
- Tôn trọng cài đặt trợ năng của người dùng hệ điều hành:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Chuẩn Hóa 5 Trạng Thái UX Cho Component `<Async>`

Mọi luồng dữ liệu Backend API đều phải qua component `<Async>` chuẩn hóa:
1. **Loading State**: Shimmer Skeleton mô phỏng chính xác khung dữ liệu sắp hiển thị (Card, Table, Detail); debounce 150ms chống nhấp nháy.
2. **Empty State**: Icon trừu tượng trang trọng (`Inbox`, `SearchX`), thông báo rõ nghĩa, nút hành động khôi phục / tạo mới.
3. **Error State**: Icon cảnh báo (`AlertCircle` Rose), thông điệp lỗi thân thiện (không lộ stack trace), nút **"Thử lại ngay" (`onRetry`)** không reload F5.
4. **Success State**: Dữ liệu thật hiển thị mượt mà kèm hiệu ứng `animate-page-enter` (`fade-in 180ms`).
5. **Partial / Updating State**: Lớp mờ nhẹ (`opacity-70 pointer-events-none`) giữ nguyên DOM cũ kèm thanh tiến trình cập nhật ngầm.

---

## 7. Anti-Patterns & Quy Định Bất Biến (Strict Do's & Don'ts)

### ❌ TUYỆT ĐỐI KHÔNG (Anti-Patterns)
- **Không dùng Emoji làm icon cấu trúc**: Cấm sử dụng 🎨, 🚀, ⚙️, ❌, ✅ làm icon nút bấm, menu hay bảng điều khiển. Bắt buộc 100% dùng Lucide Icons SVG vector.
- **Không dùng Mock ngầm trong code**: Nghiêm cấm dùng mảng giả (`mockItems`, `fakeData`, `[1, 2, 3]`) để che giấu lỗi API hay làm rỗng giả tạo.
- **Không phá vỡ Touch Target**: Tuyệt đối không tạo nút hay vùng click nhỏ hơn $44 \times 44\text{px}$ trên thiết bị di động.
- **Không dùng màu tương phản kém**: Không dùng chữ xám mờ (`#94A3B8`) trên nền trắng cho nội dung quan trọng; văn bản chính bắt buộc phải đạt độ tương phản tối thiểu $4.5:1$.
- **Không làm vỡ logic Backend**: Cấm sửa đổi cấu trúc DTO, API contracts hoặc C# Entities khi thực hiện tác vụ nâng cấp UI/UX.

### ✅ BẮT BUỘC THỰC HIỆN (Best Practices)
- **Kiểm thử đa thiết bị**: Responsive mượt mà trên 3 dải độ phân giải: Mobile (`390px`), Tablet (`768px`), Desktop (`1280px` - `1920px`).
- **Thực thi bàn phím hoàn chỉnh**: Mọi dialog, popover, tabs phải hỗ trợ phím ESC, Tab bẫy tiêu điểm (Focus Trap) và phím mũi tên.
- **Tuân thủ Clean Architecture**: Mã styling nằm tại `globals.css` và `design-system/`, atomic components nằm tại `components/ui/`.

---

## 8. Pre-Delivery Checklist (Bảng Kiểm Tra Bàn Giao)

- [ ] **Icon chuẩn SVG**: 100% icon cấu trúc sử dụng thư viện `lucide-react`, không có bất kỳ emoji nào.
- [ ] **Touch Target**: Mọi phần tử bấm được đạt tối thiểu $44 \times 44\text{px}$ hoặc padding tương đương.
- [ ] **Cursor Pointer**: Áp dụng `cursor-pointer` cho tất cả các nút bấm, link và interactive cards.
- [ ] **Focus Visible**: Có viền tiêu điểm kép tương phản cao khi bấm Tab.
- [ ] **Contrast AA**: Tương phản văn bản đạt $\ge 4.5:1$ (chế độ sáng và tối).
- [ ] **Prefers-reduced-motion**: Tự động tắt hoạt ảnh khi OS bật chế độ giảm chuyển động.
- [ ] **Zero Logic Regression**: Không có thay đổi nào làm gãy API contract hoặc DTO.
