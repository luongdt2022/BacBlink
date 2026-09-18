---
name: "speckit-update"
description: "Cập nhật, sửa đổi và mở rộng nghiệp vụ cho một Epic đã hoàn thiện theo chuẩn Spec Kit Delta (Impact Analysis -> Spec Delta -> Plan Delta -> Tasks Delta -> Implement Delta -> Converge Delta)."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "custom/speckit-update"
---

## User Input

```text
$ARGUMENTS
```

## Chỉ Dẫn Thực Thi

Đây là bí danh (alias) của skill `speckit-delta`.
Hãy đọc và tuân thủ toàn bộ quy trình cập nhật delta 6 giai đoạn chi tiết tại:
[`../speckit-delta/SKILL.md`](file:///Users/luongdt/Documents/M4U%20Project/.agents/skills/speckit-delta/SKILL.md)

1. **[1] Impact Analysis**: Phân tích bề mặt tác động (CSDL, Domain, API, và UI/UX Layout), bổ sung mục Spec Delta vào `spec.md`, và cập nhật trạng thái `🔄 Nâng cấp Delta (In Progress)` trong `specs/ROADMAP.md`.
2. **[1.1] Clarify Check**: 🛑 **DỪNG LẠI HỎI** nếu tài liệu mới mâu thuẫn hoặc thiếu dữ kiện. Nếu đã rõ -> Tự động đi tiếp.
3. **[2] Plan Delta**: Cập nhật `plan.md`, `data-model.md`, và UI/UX spec theo chiến lược non-destructive. 🛑 **DỪNG LẠI HỎI** nếu có breaking change.
4. **[3] Tasks Delta**: Append Phase mới vào cuối `tasks.md`, bảo toàn task cũ.
5. **[4] Implement Delta**: Chạy migration mới (v2, v3...), viết code, viết unit test mới, chạy `pnpm typecheck` / `pnpm test`. 🛑 **DỪNG LẠI HỎI** nếu gặp lỗi blocker.
6. **[5] Converge Delta**: Kiểm tra hội tụ 100%, Visual QA chụp ảnh màn hình Playwright, cập nhật tài liệu trực quan, cập nhật trạng thái `✅ 100% Hoàn thành (Delta vX)` cùng số tasks và kết quả test vào `specs/ROADMAP.md`, xuất báo cáo nghiệm thu.
