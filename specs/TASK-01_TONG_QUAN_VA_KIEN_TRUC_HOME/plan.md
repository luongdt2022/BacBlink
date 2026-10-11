# Kế Hoạch Thiết Kế Kỹ Thuật (plan.md) — TASK-01: Cổng Điều Hướng Home & Sự Kiện Techmart

> **Mã phân hệ**: `TASK-01`  
> **Ánh xạ Đặc tả**: [`spec.md`](spec.md)  
> **Kiến trúc áp dụng**: Clean Architecture (.NET Core API v1), Contract-First, Next.js 15 App Router, PostgreSQL Schema `portal`

---

## 1. CONTRACT-FIRST API & DTO SPECIFICATION

### 1.1. Portal Stats Contracts
- **Endpoint**: `GET /api/v1/portal/stats`
- **Output Contract**:
  ```csharp
  public record PortalOverviewStatsDto
  {
      public int TotalOffers { get; init; }
      public int TotalDemands { get; init; }
      public int TotalEnterprises { get; init; }
      public int TotalExperts { get; init; }
      public int TotalProvinces { get; init; } = 63;
      public DateTime UpdatedAt { get; init; }
  }
  ```

### 1.2. Techmart Event Contracts
- **Endpoint 1**: `GET /api/v1/events/techmart?status={upcoming|closed}&page={page}&pageSize={pageSize}`
- **Endpoint 2**: `GET /api/v1/events/techmart/{id}`
- **DTOs**:
  ```csharp
  public record TechmartEventDto
  {
      public Guid Id { get; init; }
      public string Title { get; init; } = default!;
      public string Description { get; init; } = default!;
      public string Location { get; init; } = default!;
      public DateTime StartDate { get; init; }
      public DateTime EndDate { get; init; }
      public string Status { get; init; } = "UPCOMING"; // UPCOMING, HAPPENING, CLOSED
      public int TechnologiesCount { get; init; }
      public string? PdfBrochureUrl { get; init; }
      public string? BannerUrl { get; init; }
  }
  ```
- **Endpoint 3**: `POST /api/v1/events/register`
- **Input Contract**:
  ```csharp
  public record EventRegistrationRequestDto
  {
      public Guid EventId { get; init; }
      public string OrganizationName { get; init; } = default!;
      public string ContactName { get; init; } = default!;
      public string PhoneNumber { get; init; } = default!;
      public string Email { get; init; } = default!;
      public string RoleType { get; init; } = "VISITOR"; // VISITOR, BUYER, SELLER_BOOTH
      public string? Notes { get; init; }
  }
  ```
- **Output Contract**:
  ```csharp
  public record EventRegistrationResponseDto
  {
      public string RegistrationCode { get; init; } = default!;
      public string Status { get; init; } = "CONFIRMED";
      public DateTime RegisteredAt { get; init; }
  }
  ```

### 1.3. AI Quick Assist Contracts
- **Endpoint**: `POST /api/v1/ai/quick-assist`
- **Contract**:
  ```csharp
  public record AiQuickAssistRequestDto
  {
      public string Prompt { get; init; } = default!;
  }
  
  public record AiQuickAssistResponseDto
  {
      public string Reply { get; init; } = default!;
      public string? SuggestedTopic { get; init; } // TRL_GUIDE, PRICING, EXPERT_MATCH
      public string? RedirectUrl { get; init; }
  }
  ```

---

## 2. DATABASE SCHEMA DESIGN (PostgreSQL)

Thiết kế lược đồ quan hệ trong schema `portal`:

```sql
CREATE SCHEMA IF NOT EXISTS portal;

CREATE TABLE IF NOT EXISTS portal.techmart_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING',
    technologies_count INT NOT NULL DEFAULT 0,
    pdf_brochure_url VARCHAR(500),
    banner_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES portal.techmart_events(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role_type VARCHAR(50) NOT NULL DEFAULT 'VISITOR',
    notes TEXT,
    registration_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_techmart_events_status ON portal.techmart_events(status);
CREATE INDEX IF NOT EXISTS idx_event_reg_code ON portal.event_registrations(registration_code);
```

---

## 3. FRONTEND ARCHITECTURE & 5 UX STATES

### 3.1. Các Màn Hình & Thành Phần Cần Xây Dựng / Nâng Cấp:
1. **`src/components/common/navbar.tsx`**:
   - Nâng cấp Mega-menu 7 mục khớp chính xác với `wireframe_home.html`.
   - Thêm dropdown cho "Chào bán" (Sản phẩm vs Chuyển giao) và "Dịch vụ khác" (Đánh giá TT17 & Tư vấn SHTT).
   - Tích hợp menu tài khoản đăng nhập (Cài đặt & Đăng xuất).
2. **`src/app/page.tsx`**:
   - Thay thế toàn bộ mảng tĩnh `offers` và `demands` bằng dữ liệu gọi từ API thật.
   - Bọc bộ đếm chỉ số và danh sách trong component `<Async>` chuẩn 5 trạng thái UX (Loading Skeleton, Empty State, Error Retry, Success Data).
3. **`src/app/trien-lam/page.tsx` & `src/app/trien-lam/dang-ky-tham-quan/page.tsx`**:
   - Dựng giao diện Lịch sự kiện & Phiên chào giá theo `wireframe_techmart_events.html`.
   - Tabs "Đang/Sắp mở" vs "Đã khép lại".
   - Form đăng ký tham quan/gian hàng có validation dữ liệu và feedback popup.
4. **`src/components/home/AIAssistantWidget.tsx`**:
   - Floating Action Button (FAB) góc phải màn hình kèm badge Trợ lý AI.
   - Hộp thoại hội thoại trượt, tích hợp các gợi ý truy vấn nhanh và kết nối API `/api/v1/ai/quick-assist`.

---

## 4. MA TRẬN RỦI RO & BẢO VỆ PHẠM VI (RISK & QUALITY CONTROL)

1. **Rủi ro rò rỉ mã Đấu giá & Escrow**: Cấm tiệt mọi logic liên quan đến nạp ví, đặt cọc tiền mặt hoặc auto-bid (chặn hoàn toàn theo `PO-DEC-20261008-06`).
2. **Rủi ro N+1 Query thống kê**: Sử dụng `COUNT(*)` trực tiếp hoặc cache in-memory 5 phút cho `PortalOverviewStats`.
3. **Rủi ro Broken Links**: Mọi link trong Mega-menu phải trỏ tới các route đang hoạt động trong hệ thống.
