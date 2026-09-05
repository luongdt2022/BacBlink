# 05-testing — Kiểm thử

Kế hoạch test, test case, checklist QA, báo cáo kết quả kiểm thử.

## Nội dung hiện có nằm trong `san-pham-v2/`

Bộ tài liệu kiểm thử là một phần của khối `docs/02-requirements/san-pham-v2/` (giữ nguyên khối để không vỡ ~1920 link chéo). Các phần thuộc về kiểm thử:

| Tài liệu | Nội dung |
|---|---|
| [`san-pham-v2/bug-triage.md`](../02-requirements/san-pham-v2/bug-triage.md) | Sổ lỗi duy nhất — 34 mục, 12 mức cao. Sửa mục nào thì cập nhật dòng đó **cùng PR** |
| [`san-pham-v2/verification/`](../02-requirements/san-pham-v2/verification/) | Tiêu chí nghiệm thu viết trước, tách theo bề mặt (admin, portal+landing, nền tảng, api-v2+mới) |
| [`san-pham-v2/verification/api-v2-va-moi.md`](../02-requirements/san-pham-v2/verification/api-v2-va-moi.md) | 487 tiêu chí cho phần chưa xây; chạy nhóm tương ứng **trước** khi nhận sprint |
| [`san-pham-v2/bmad/`](../02-requirements/san-pham-v2/bmad/) | Snapshot vòng rà BMAD (chỉ trỏ mã lỗi, không chép danh sách) |

Test tự động của backend .NET nằm ở [`tests/`](../../tests/) tại root repo — xem lệnh chạy trong [README chính](../../README.md#test).
