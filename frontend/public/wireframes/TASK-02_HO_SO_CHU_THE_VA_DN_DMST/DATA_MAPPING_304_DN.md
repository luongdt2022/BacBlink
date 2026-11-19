# BÁO CÁO ĐỐI SOÁT VÀ BẢN ĐỒ ÁNH XẠ DỮ LIỆU 304 DOANH NGHIỆP KHẢO SÁT VÀO HỆ THỐNG CSDL NACENTWIN

> **Mã tài liệu**: `DATA-MAPPING-304-DN-v1.0`  
> **Căn cứ pháp lý & Kỹ thuật**: Quyết định PO `PO-DEC-20261008-04`, `DD-01-database-erd.md`, `THIET_KE_CSDL_DEMAND_VA_TNI.md`  
> **Nguồn dữ liệu gốc**: `Specification/01_DATA_RAW/Khảo sát 304 DN-final-2408.xlsx` (Sheet: `Du_lieu_da_lam_sach`, 304 bản ghi, 61 cột)  
> **Hệ quản trị CSDL đích**: PostgreSQL 16+ / Schema `enterprise` & `demand`  
> **Ngày phê duyệt**: 08/10/2026  
> **Trạng thái**: 🟢 APPROVED BY PO (Chấp thuận nạp CSDL & Thống kê thực nghiệm)

---

## 1. TỔNG QUAN TẬP DỮ LIỆU & NGUYÊN TẮC THIẾT KẾ HYBRID

Tệp dữ liệu thực tế `Khảo sát 304 DN-final-2408.xlsx` phản ánh trung thực thực trạng của 304 Doanh nghiệp Việt Nam (phủ khắp các tỉnh thành từ Lạng Sơn, Hà Nội, TP.HCM đến Đà Nẵng, Bình Dương...).

Để đảm bảo **không thất thoát dữ liệu** (Zero Data Loss) và **không làm phình to Schema quan hệ** (tránh tạo ra bảng hơn 60 cột với nhiều trường null), hệ thống áp dụng mô hình **Hybrid Schema**:
1. **Các trường Relational chuẩn (Structured Columns)**: Dùng để lập chỉ mục (B-Tree Index), tìm kiếm, phân trang và tổng hợp nhanh: Mã số thuế (`tax_code`), Tên doanh nghiệp (`name`), Tỉnh/Thành phố (`province_city`), Ngành hoạt động chính (`main_sector_name`), Hình thức sở hữu (`ownership_type`), Quy mô lao động (`workforce_scale`), Dải doanh thu (`revenue_range`), Vùng hoạt động (`operating_zone`), Điểm TNI (`tni_score`), Xếp hạng TNI (`tni_classification`).
2. **Các trường JSONB linh hoạt (Semi-Structured JSONB)**: Lưu toàn bộ chi tiết 43 câu hỏi khảo sát chuyên sâu (hoạt động R&D, chuyển đổi số, mạng lưới hợp tác, loại tài sản trí tuệ, 8 chỉ số nhu cầu thông tin, kiến nghị) vào trường `demand_surveys.survey_answers` với chỉ mục `GIN Index`.

---

## 2. BẢNG ĐỐI SOÁT CHI TIẾT 61 CỘT EXCEL SANG DATABASE

| STT Excel | Tên Cột Excel (304 DN) | Bảng DB Đích | Cột DB Tương Ứng | Kiểu Dữ Liệu | Đánh Giá Tương Thích | Chiến Lược ETL & Làm Sạch |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `STT` | - | - | - | Bỏ qua | Số thứ tự dòng Excel |
| **02** | `1. Tên doanh nghiệp` | `enterprises` | `name` | `VARCHAR(255)` | 🟢 Khớp 1:1 | Trim khoảng trắng, chuẩn hóa tiếng Việt NFC |
| **03** | `2. Mã số thuế` | `enterprises` | `tax_code` | `VARCHAR(20)` | 🟢 Khớp 1:1 | Khóa định danh doanh nghiệp (Unique), chuẩn hóa chuỗi giữ số 0 đầu |
| **04** | `5. Tỉnh/Thành phố` | `enterprises` | `province_city` | `VARCHAR(100)` | 🟢 Khớp 1:1 | Map danh mục 63 tỉnh/thành chuẩn TCTK |
| **05** | `6. Ngành hoạt động chính` | `enterprises` | `main_sector_name` | `VARCHAR(255)` | 🟢 Khớp 1:1 | Lưu tên ngành, đồng thời map sang mã `sector_id` nếu có |
| **06** | `7. Hình thức sở hữu của doanh nghiệp` | `enterprises` | `ownership_type` | `VARCHAR(50)` | 🟢 Khớp 1:1 | Chuẩn hóa Enum (Nhà nước, Tư nhân, FDI, Cổ phần) |
| **07** | `8. Quy mô lao động` | `enterprises` | `workforce_scale` | `VARCHAR(50)` | 🟢 Khớp 1:1 | Dưới 10 người, 10-49, 50-100, trên 100 |
| **08** | `9. Doanh thu năm gần nhất` | `enterprises` | `revenue_range` | `VARCHAR(50)` | 🟢 Khớp 1:1 | Dưới 3 tỷ, 3-10 tỷ, 10-50 tỷ, trên 50 tỷ |
| **09** | `10. Doanh nghiệp đang hoạt động tại` | `enterprises` | `operating_zone` | `VARCHAR(50)` | 🟢 Khớp 1:1 | KCN, KCNC, Cụm CN, Ngoài khu |
| **10** | `11. Tỷ lệ lao động CĐ, ĐH trở lên` | `enterprises` | `high_qualification_ratio` | `VARCHAR(20)` | 🟢 Khớp 1:1 | Dưới 10%, 10-30%, 30-50%, trên 50% |
| **11** | `12. Bộ phận/nhân sự phụ trách công nghệ, ĐMST, CĐS` | `demand_surveys` | `has_rd_unit` | `BOOLEAN` | 🟢 Khớp 1:1 | Map "Có" -> True, "Không" -> False |
| **12** | `13. Đào tạo chuyên môn, kỹ thuật, công nghệ 12 tháng` | `demand_surveys` | `has_tech_training` | `BOOLEAN` | 🟢 Khớp 1:1 | Map "Có" -> True, "Không" -> False |
| **13** | `14. Đầu tư nâng cấp thiết bị, máy móc trong 3 năm` | `demand_surveys` | `has_machinery_upgrade` | `BOOLEAN` | 🟢 Khớp 1:1 | Map "Có" -> True, "Không" -> False |
| **14** | `15. Kế hoạch hoặc ngân sách riêng cho ĐMST` | `demand_surveys` | `has_rd_budget` | `BOOLEAN` | 🟢 Khớp 1:1 | Map "Có" -> True, "Không" -> False |
| **15** | `16. Nền tảng quản trị đang sử dụng` | `demand_surveys` | `survey_answers->'governance_platforms'` | `JSONB` | 🟡 Nhiều giá trị | Parse tách dấu chấm phẩy `;` thành mảng JSON |
| **16** | `17. Phát triển sản phẩm hoặc dịch vụ mới` | `demand_surveys` | `survey_answers->'new_products'` | `VARCHAR(10)` | 🟢 Khớp | Lưu giá trị "Có" / "Không" |
| **17** | `18. Cải tiến đáng kể sản phẩm hiện có` | `demand_surveys` | `survey_answers->'improved_products'` | `VARCHAR(10)` | 🟢 Khớp | Lưu giá trị "Có" / "Không" |
| **18** | `19. Đổi mới quy trình sản xuất / dịch vụ` | `demand_surveys` | `survey_answers->'process_innovation'` | `VARCHAR(10)` | 🟢 Khớp | Lưu giá trị "Có" / "Không" |
| **19** | `20. Đổi mới quản trị hoặc tổ chức` | `demand_surveys` | `survey_answers->'org_innovation'` | `VARCHAR(10)` | 🟢 Khớp | Lưu giá trị "Có" / "Không" |
| **20** | `21. Đổi mới marketing hoặc thị trường` | `demand_surveys` | `survey_answers->'marketing_innovation'` | `VARCHAR(10)` | 🟢 Khớp | Lưu giá trị "Có" / "Không" |
| **21** | `22. Hoạt động nhận chuyển giao / mua công nghệ` | `demand_surveys` | `survey_answers->'tech_acquisition'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **22** | `23. Hiệu quả ĐMST mang lại rõ rệt nhất` | `demand_surveys` | `survey_answers->'impact_outcomes'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **23** | `24. Chiến lược hoặc kế hoạch chuyển đổi số` | `demand_surveys` | `survey_answers->'digital_strategy'` | `VARCHAR(50)` | 🟢 Khớp | Đã có / Chưa có / Đang xây dựng |
| **24** | `25. Tự đánh giá mức độ chuyển đổi số` | `demand_surveys` | `survey_answers->'digital_maturity_level'` | `VARCHAR(50)` | 🟢 Khớp | Khởi đầu / Nâng cao / Toàn diện |
| **25** | `26. Hoạt động đang số hóa` | `demand_surveys` | `survey_answers->'digitized_activities'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **26** | `27. Ứng dụng công nghệ số nào` | `demand_surveys` | `survey_answers->'digital_technologies'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **27-33** | `28. Hợp tác 3 năm (Trường, Viện, DN, Quỹ, CQNN...)` | `demand_surveys` | `survey_answers->'collaborations'` | `JSONB` | 🟢 7 trường con | Lưu Object JSON gồm 7 đối tượng |
| **34** | `29. Nhận hỗ trợ từ Nhà nước về KH&CN, ĐMST` | `demand_surveys` | `survey_answers->'public_support_received'` | `VARCHAR(10)` | 🟢 Khớp | "Có" / "Không" |
| **35** | `30. Tiếp cận quỹ đầu tư, tổ chức tài chính ĐMST` | `demand_surveys` | `survey_answers->'funding_access'` | `VARCHAR(10)` | 🟢 Khớp | "Có" / "Không" |
| **36** | `31. Loại tài sản trí tuệ (SHTT) hiện có` | `demand_surveys` | `survey_answers->'ip_assets'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **37** | `32. Kết quả ĐMST đạt được trong 3 năm` | `demand_surveys` | `survey_answers->'innovation_results'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **38** | `33. Tỷ lệ doanh thu từ sản phẩm mới/cải tiến` | `demand_surveys` | `survey_answers->'new_product_revenue_ratio'` | `VARCHAR(50)` | 🟢 Khớp | Dưới 10%, 10-30%, trên 30% |
| **39** | `34. Tác động từ ĐMST ghi nhận được` | `demand_surveys` | `survey_answers->'recorded_impacts'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **40** | `35. Hoạt động xuất khẩu` | `demand_surveys` | `is_exporting` | `BOOLEAN` | 🟢 Khớp 1:1 | "Có" -> True, "Không" -> False |
| **41** | `36. Tham gia chuỗi giá trị trong nước/quốc tế` | `demand_surveys` | `in_value_chain` | `BOOLEAN` | 🟢 Khớp 1:1 | "Có" -> True, "Không" -> False |
| **42** | `37. Khó khăn lớn nhất trong hoạt động ĐMST` | `demand_surveys` | `top_bottlenecks` | `TEXT[]` | 🟡 Nhiều giá trị | Tách `;` thành mảng `TEXT[]` của PostgreSQL |
| **43** | `38. Nhu cầu hỗ trợ những nội dung nào` | `demand_surveys` | `support_needs` | `TEXT[]` | 🟡 Nhiều giá trị | Tách `;` thành mảng `TEXT[]` của PostgreSQL |
| **44-51** | `39. Mức độ cần thiết 8 loại thông tin` | `demand_surveys` | `survey_answers->'info_needs'` | `JSONB` | 🟢 8 trường con | Lưu Object JSON gồm 8 loại thông tin và mức độ (1-5) |
| **52** | `40. Sẵn sàng tham gia phỏng vấn sâu` | `demand_surveys` | `is_willing_deep_interview` | `VARCHAR(50)` | 🟢 Khớp | Có / Không / Cân nhắc |
| **53** | `41. Sẵn sàng tham gia & cập nhật CSDL định kỳ` | `demand_surveys` | `is_willing_update_database` | `VARCHAR(50)` | 🟢 Khớp | Có / Không / Cần tìm hiểu thêm |
| **54** | `Câu 42. Mong muốn chức năng trên hệ thống CSDL` | `demand_surveys` | `survey_answers->'requested_features'` | `JSONB` | 🟡 Nhiều giá trị | Tách `;` thành mảng JSON |
| **55-56** | `Câu 43. Đề xuất, kiến nghị` (gồm Col 55 và tràn Col 56) | `demand_surveys` | `recommendations` | `TEXT` | 🟡 Nối chuỗi | Nối văn bản Col 55 và Col 56 |
| **57-61** | `Col 57 - Col 61` | - | - | - | Bỏ qua | Cột rỗng |

---

## 3. CÁC TRƯỜNG DB THIẾU Ở PHÍA EXCEL VÀ CHIẾN LƯỢC FALLBACK

| Cột CSDL | Bảng DB | Nullable | Chiến Lược Xử Lý (Fallback) |
| :--- | :--- | :---: | :--- |
| `email` | `enterprises` | `YES` | Để `NULL` hoặc tự động gán `info@<tax_code>.mst.vn` |
| `phone` | `enterprises` | `YES` | Để `NULL` (Bảo mật PII cá nhân theo NĐ 13) |
| `contact_person` | `enterprises` | `YES` | Gán `"Đại diện Doanh nghiệp"` |
| `address_detail` | `enterprises` | `YES` | Sử dụng chính giá trị `province_city` làm địa chỉ tóm lược |
| `website` | `enterprises` | `YES` | Để `NULL` |
| `created_by` | `demand_surveys` | `YES` | Gán ID của System Admin / ETL Migration Bot |

---

## 4. KẾT LUẬN NGHIỆM THU TƯƠNG THÍCH

1. **Ràng buộc toàn vẹn**: 100% các cột bắt buộc (`NOT NULL`) của bảng `enterprises` và `demand_surveys` đều được cung cấp đầy đủ từ tệp Excel hoặc có giá trị mặc định chuẩn xác.
2. **Khả năng tra cứu & phân tích**: Các truy vấn SQL phục vụ thống kê theo tỉnh thành, theo ngành, theo quy mô và lọc theo điểm TNI hoàn toàn vận hành trên các cột vật lý có Index, đạt hiệu năng tối ưu.
