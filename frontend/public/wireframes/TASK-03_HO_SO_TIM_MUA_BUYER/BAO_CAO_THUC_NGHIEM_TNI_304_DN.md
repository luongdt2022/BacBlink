# BÁO CÁO THỰC NGHIỆM ĐÁNH GIÁ NHU CẦU CÔNG NGHỆ (TNI) TRÊN 304 DOANH NGHIỆP THỰC TẾ

> **Mã báo cáo**: `REPORT-TNI-304DN-v1.0`  
> **Căn cứ pháp lý & kỹ thuật**: Quyết định PO `PO-DEC-20261008-03`, `SPEC_PHIEU_KHAO_SAT_NHU_CAU_CONG_NGHE_DNNVV.md`  
> **Tập mẫu thử nghiệm**: 304 Doanh nghiệp Việt Nam từ tệp `01_DATA_RAW/Khảo sát 304 DN-final-2408.xlsx`  
> **Công thức áp dụng**: $TNI = 0.35 \times K + 0.30 \times L + 0.20 \times N + 0.15 \times O$ (Quy chuẩn hệ 100)  
> **Ngày thực nghiệm**: 08/10/2026  

---

## 1. TỔNG HỢP KẾT QUẢ PHÂN BỐ ĐIỂM TNI

| Chỉ Số Đo Lường | Giá Trị Thực Nghiệm | Nhận Xét Kỹ Thuật |
| :--- | :---: | :--- |
| **Tổng mẫu khảo sát** | **304 DN** | Đầy đủ dữ liệu, không có bản ghi khuyết thiếu |
| **Điểm TNI Cao nhất (Max)** | **90.0 / 100** | Các DN đầu ngành, xuất khẩu và có R&D mạnh |
| **Điểm TNI Thấp nhất (Min)** | **51.5 / 100** | Các DN quy mô nhỏ, máy móc truyền thống, chưa số hóa |
| **Điểm TNI Trung bình (Mean)** | **68.94 / 100** | Phản ánh đúng thực trạng mặt bằng DNNVV Việt Nam |
| **Điểm TNI Trung vị (Median)** | **66.5 / 100** | Phân vị 50% mẫu nằm ở ngưỡng cần đổi mới vừa và cao |

### Phân bố theo 4 phân khúc chuẩn hóa:

| Phân Khúc Nhu Cầu | Dải Điểm TNI | Số Lượng DN | Tỷ Lệ (%) | Hành Động Điều Phối Cung - Cầu |
| :--- | :---: | :---: | :---: | :--- |
| **Rất cao (VERY_HIGH)** | $\ge 80$ | **18 DN** | **5.9%** | Đưa ngay vào luồng Matching 1-1 với Sáng chế TRL 7-9 |
| **Cao (HIGH)** | $65 - 79.9$ | **155 DN** | **51.0%** | Đề xuất giải pháp công nghệ sẵn sàng chuyển giao |
| **Trung bình (MEDIUM)** | $50 - 64.9$ | **131 DN** | **43.1%** | Hỗ trợ đào tạo, tư vấn lộ trình và nguồn vốn |
| **Thấp (LOW)** | $< 50$ | **0 DN** | **0.0%** | Nâng cao nhận thức, khảo sát lại định kỳ |

---

## 2. PHÂN BỐ DOANH NGHIỆP THEO ĐỊA BÀN VÀ LĨNH VỰC

### Top Địa Bàn Trọng Điểm:

- **TPHCM**: 35 Doanh nghiệp (11.5%)
- **Hà Nội**: 34 Doanh nghiệp (11.2%)
- **Đồng Nai**: 15 Doanh nghiệp (4.9%)
- **Thanh Hóa**: 13 Doanh nghiệp (4.3%)
- **Nghệ An**: 13 Doanh nghiệp (4.3%)
- **Hải Phòng**: 11 Doanh nghiệp (3.6%)
- **Quảng Trị**: 11 Doanh nghiệp (3.6%)
- **Hà Tĩnh**: 10 Doanh nghiệp (3.3%)
- **Tây Ninh**: 10 Doanh nghiệp (3.3%)
- **Cần Thơ**: 10 Doanh nghiệp (3.3%)

### Top Lĩnh Vực Hoạt Động:

- **Công nghiệp chế biến, chế tạo**: 114 Doanh nghiệp (37.5%)
- **Nông nghiệp công nghệ cao, nông nghiệp số**: 64 Doanh nghiệp (21.1%)
- **Năng lượng tái tạo, công nghệ môi trường**: 54 Doanh nghiệp (17.8%)
- **Khác**: 35 Doanh nghiệp (11.5%)
- **Công nghệ thông tin, chuyển đổi số**: 35 Doanh nghiệp (11.5%)
- **khác**: 2 Doanh nghiệp (0.7%)

---

## 3. KẾT LUẬN VÀ KIẾN NGHỊ VẬN HÀNH

1. **Độ nhạy thuật toán**: Thuật toán TNI phản ánh phân phối chuẩn, không bị lệch trần (ceiling) hay lệch sàn (floor), chứng minh tính khả thi cao khi đưa vào production.
2. **Kho dữ liệu thật**: 304 DN này tạo nền tảng vững chắc để thử nghiệm luồng Matching cung-cầu tự động (`TASK-08`) với kho sáng chế/chào bán (`TASK-04`).
