# 07-references — Tài liệu tham khảo

Tài liệu tham khảo bên ngoài, benchmark, so sánh sản phẩm/công nghệ liên quan.

| Tài liệu | Nội dung |
|---|---|
| [`KOREA_MODEL_ANALYSIS.md`](./KOREA_MODEL_ANALYSIS.md) | Phân tích mô hình đổi mới sáng tạo Hàn Quốc |
| [`huong-dong-tien-va-chi-phi-nguon-cung.md`](./huong-dong-tien-va-chi-phi-nguon-cung.md) | Đối chiếu hướng dòng tiền giữa khách hàng, nền tảng và chuyên gia: §13.11 ngược hướng với mọi mô hình trong §34 |
| [`mo-hinh-dauthau-net.md`](./mo-hinh-dauthau-net.md) | Học từ DauThau.net: lớp mô hình tổng hợp dữ liệu công khai + thuê bao cảnh báo chưa có trong register §34; ba bài học, ba anti-pattern và lý do không sao chép được |
| [`bao-cao-ra-soat-08-2026/`](./bao-cao-ra-soat-08-2026/) | Báo cáo rà soát tháng 08/2026 (5 file .docx): phân tích tổng thể & lộ trình, tóm tắt tiến độ, đối chiếu 15 module dự kiến, phân tích Zalo Mini App, phân tích thiết kế Figma |
| [`NACENTECH_FEATURE_LIST_VA_DANH_GIA.md`](./NACENTECH_FEATURE_LIST_VA_DANH_GIA.md) | Đánh giá 12 màn hình và đề xuất 6 gói tính năng Phase 2, do một nhóm BA lập. Xem lưu ý về nguồn ở dưới |

## Lưu ý về `NACENTECH_FEATURE_LIST_VA_DANH_GIA.md`

Tài liệu này **rà từ ngoài vào**: tác giả bấm qua cổng người dùng đang chạy (12 màn hình được đặt tên như tệp `.html`, không tệp nào tồn tại trong kho này), cộng một bộ phiếu khảo sát nghiệp vụ cũng không có trong kho. Không đọc mã, không đọc [`../02-requirements/san-pham-v2/`](../02-requirements/san-pham-v2/). Đọc và dùng nó với ba giới hạn:

- **Phạm vi là 4 trong 12 khu vực của cổng người dùng.** Bảng quản trị (27 route), toàn bộ `/api/v2`, hồ sơ vụ việc 12 giai đoạn và cơ chế ghép cặp thật đều nằm ngoài tầm nhìn của tài liệu. Mọi kết luận về "năng lực hệ thống" trong đó suy từ một phần tư bề mặt cổng.
- **Nó không phải nguồn đúng cho hành vi.** Nguồn đúng vẫn là [`../02-requirements/san-pham-v2/`](../02-requirements/san-pham-v2/) và OpenAPI sinh khi API chạy. Chỗ tài liệu này mô tả cơ chế, nó đang đoán từ bề mặt — và ít nhất một lần đoán sai: nó gọi con số 5 của Matching Hub là "số giả lập", trong khi đó là một trần cứng có thật ([B-49](../02-requirements/san-pham-v2/bug-triage.md#b-49-cổng-chỉ-hiện-năm-ứng-viên-đầu-dù-vòng-có-mười-và-đường-phân-trang-đã-tồn-tại)).
- **Ba gói đề xuất trong đó va vào quyết định đã chốt**, không phải việc chưa làm: NDA tự động mở khoá tài liệu mật trái bất biến 40 và `NACENTECH_ARCHITECTURE_V2.md:1652` (*"NDA không tự cấp quyền đọc"*); KPI "tổng giá trị chuyển giao" gộp hai làn mà [ADR-0014](../04-technical/adr/0014-cong-cu-tai-chinh-quyet-dinh-loi-ra-hop-phap.md) tách ra; định vị sàn tự phục vụ đang bị [ADR-0012](../04-technical/adr/0012-be-mat-ket-noi-co-thu-phi.md) chặn sau cổng pháp lý.

Giá trị đã lấy được từ nó: bốn mục lỗi [B-49…B-52](../02-requirements/san-pham-v2/bug-triage.md#tóm-tắt), và một phép đo về việc người ngoài đọc sản phẩm này ra sao khi chỉ nhìn thấy cổng.
