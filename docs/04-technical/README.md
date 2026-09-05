# 04-technical — Tài liệu kỹ thuật

Kiến trúc hệ thống, Architecture Decision Records (ADR), đặc tả API, sơ đồ dữ liệu.

| Tài liệu | Nội dung |
|---|---|
| [`NACENTECH_ARCHITECTURE_V2.md`](./NACENTECH_ARCHITECTURE_V2.md) | Kiến trúc đích V2.20 — nguồn đúng cho thiết kế hệ thống |
| [`NACENTECH_KIEN_TRUC_HE_THONG_CHUAN.md`](./NACENTECH_KIEN_TRUC_HE_THONG_CHUAN.md) | Tài liệu kiến trúc chuẩn (bản biên soạn để phát hành) |
| [`adr/`](./adr/) | 10 ADR — quyết định kiến trúc đã chốt |
| [`CONVENTIONS.md`](./CONVENTIONS.md) | Quy ước viết mã backend .NET |
| [`keys.md`](./keys.md) | Registry key/secret — **chỉ metadata**, không bao giờ chứa giá trị thật |

## Phần kỹ thuật nằm trong `san-pham-v2/`

Hợp đồng API, mô hình nền tảng và thuật ngữ là một phần của khối `docs/02-requirements/san-pham-v2/` (giữ nguyên khối để không vỡ ~1900 link chéo):

| Tài liệu | Nội dung |
|---|---|
| [`san-pham-v2/glossary.md`](../02-requirements/san-pham-v2/glossary.md) | Thuật ngữ nghiệp vụ dùng xuyên suốt — 15 tài liệu trong khối trỏ tới nó |
| [`san-pham-v2/api-v2/`](../02-requirements/san-pham-v2/api-v2/) | Đặc tả 18 nhóm endpoint `/api/v2`, mô tả ở mức người dùng cần gì |
| [`san-pham-v2/nen-tang/`](../02-requirements/san-pham-v2/nen-tang/) | Mô hình dữ liệu, xác thực & vai trò, điều hướng & URL, lưu & phiên bản, hợp đồng API hiện hành |
| [`san-pham-v2/xuyen-suot/`](../02-requirements/san-pham-v2/xuyen-suot/) | Hành vi xuyên suốt: đồng thời & `If-Match`, quyền & vai trò, lỗi & thông báo, di trú v1→v2 |

Schema OpenAPI sinh tự động ở `http://127.0.0.1:5199/openapi/v2.json` khi API chạy — đó là nguồn đúng cho schema; tài liệu trên là nguồn đúng cho hành vi.
