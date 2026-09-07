# TÀI LIỆU ĐÁNH GIÁ HỆ THỐNG VÀ DANH MỤC TÍNH NĂNG ĐỀ XUẤT
## HỆ THỐNG NỀN TẢNG DỮ LIỆU SỐ KẾT NỐI CUNG - CẦU ĐỔI MỚI SÁNG TẠO (NACENTECH)

> **Kính gửi:** Ban Lãnh đạo / Đối tác & Khách hàng dự án Nacentech  
> **Đơn vị lập:** Nhóm Phân tích Nghiệp vụ (Business Analyst Team)  
> **Mục đích tài liệu:** Đánh giá hiện trạng 12 màn hình giao diện mẫu, tổng hợp kết quả Phân tích Khoảng trống (Gap Analysis), và **xây dựng Danh mục Tính năng Hệ thống dạng Bảng chi tiết (kèm Gói Đề xuất Phase 2)** nhằm chuyển đổi toàn diện hệ thống từ bản Prototype sang Nền tảng Dữ liệu số Quốc gia.

---

## MỤC LỤC
1. [PHẦN 1: ĐÁNH GIÁ CHI TIẾT TỪNG TÍNH NĂNG HIỆN TẠI (AS-IS EVALUATION)](#phần-1-đánh-giá-chi-tiết-từng-tính-năng-hiện-tại-as-is-evaluation)
2. [PHẦN 2: TỔNG HỢP KHOẢNG TRỐNG (GAP ANALYSIS) VÀ GÓI ĐỀ XUẤT TÍNH NĂNG CHO PHASE 2](#phần-2-tổng-hợp-khoảng-trống-gap-analysis-và-gói-đề-xuất-tính-năng-cho-phase-2)
3. [PHẦN 3: TƯ VẤN KIẾN TRÚC & PHÂN QUYỀN THEO 4 NHÓM NGƯỜI DÙNG](#phần-3-tư-vấn-kiến-trúc--phân-quyền-theo-4-nhóm-người-dùng)
4. [PHẦN 4: DANH MỤC TÍNH NĂNG TOÀN DIỆN HỆ THỐNG DẠNG BẢNG (7 MODULES CHUẨN HÓA)](#phần-4-danh-mục-tính-năng-toàn-diện-hệ-thống-dạng-bảng-7-modules-chuẩn-hóa)
5. [PHẦN 5: MA TRẬN SO SÁNH GIÁ TRỊ TRƯỚC VÀ SAU CẢI TIẾN](#phần-5-ma-trận-so-sánh-giá-trị-trước-và-sau-cải-tiến)
6. [PHẦN 6: LỘ TRÌNH TRIỂN KHAI THEO TỪNG GIAI ĐOẠN (ROADMAP)](#phần-6-lộ-trình-triển-khai-theo-từng-giai-đoạn-roadmap)

---

## PHẦN 1: ĐÁNH GIÁ CHI TIẾT TỪNG TÍNH NĂNG HIỆN TẠI (AS-IS EVALUATION)

Dưới đây là phần đánh giá trực quan, sử dụng ngôn ngữ kinh tế - nghiệp vụ dễ hiểu để phân tích 12 màn hình giao diện mẫu hiện có:

### 1.1. Màn hình "Đăng tải Nguồn Cung Công nghệ" (`1-thêm mới cung.html`)
*Mô tả hiện tại: Người dùng nhập Tiêu đề, chọn Danh mục, tải ảnh đại diện và dán toàn bộ nội dung công nghệ vào 1 ô soạn thảo văn bản tự do (chia làm 3 tab bảo mật: Công khai, Mức 2, Mức 3).*

* **🌟 Ưu điểm (Điểm sáng hiện tại):**
  * Giao diện soạn thảo văn bản đẹp mắt, dễ gõ chữ, hỗ trợ chèn hình ảnh, bảng biểu thuận tiện.
  * Đã có ý tưởng rất tốt về việc **bảo vệ bí mật công nghệ** bằng cách chia làm 3 cấp độ (Công khai, Bảo mật mức 2, Bảo mật mức 3).
* **⚠️ Nhược điểm thực tế (Góc nhìn người dùng & Doanh nghiệp):**
  * **Chưa có số liệu định lượng về công nghệ**: Nhà khoa học chỉ viết được văn bản chung chung. Doanh nghiệp khi xem không biết được công nghệ này đang ở mức thử nghiệm trong phòng lab hay đã sẵn sàng sản xuất hàng loạt (thiếu thang đo TRL từ 1 đến 9).
  * **Thiếu thông tin mua bán cốt lõi**: Không có chỗ điền giá ước tính, hình thức chuyển giao (li-xăng, bán đứt hay hợp tác), và tình trạng bằng sáng chế (đã cấp bằng hay mới nộp đơn).
  * **Người dùng ngại nhập liệu**: Bắt buộc người đăng phải tự gõ hoặc copy từng trang tài liệu dài vào form.
  * **Rủi ro thông tin rác**: Có nút "Công khai" cho phép bài đăng hiển thị trực tiếp lên sàn mà không qua khâu kiểm tra/phê duyệt của chuyên gia.
* **💡 Đề xuất cải tiến:**
  * Thiết kế lại thành **Biểu mẫu thông minh 3 bước (Wizard Form)**: Có sẵn các thanh trượt chọn mức độ hoàn thiện công nghệ (TRL 1-9), chọn tình trạng Bằng sáng chế, chọn khung giá và hình thức chuyển giao.
  * Bổ sung tính năng **"Tải tài liệu lên để AI tự động điền form"**: Nhà khoa học chỉ cần tải file Word/PDF đề tài nghiên cứu lên, hệ thống sẽ tự đọc và điền sẵn thông tin.

---

### 1.2. Màn hình "Quản lý Danh sách Nguồn Cung" (`2-ds cung.html`)
*Mô tả hiện tại: Bảng hiển thị danh sách các công nghệ của đơn vị, có nút lọc theo trạng thái (Nháp, Đã công bố) và thanh tìm kiếm tên.*

* **🌟 Ưu điểm:**
  * Bố cục bảng gọn gàng, rõ ràng thời gian tạo và ngày cập nhật.
  * Có biểu tượng nhận diện công nghệ đã được hệ thống AI xử lý tóm tắt.
* **⚠️ Nhược điểm thực tế:**
  * **Thiếu các thông tin quan trọng nhất**: Bảng chỉ hiện tên và ngày tháng, không nhìn thấy ngay công nghệ thuộc lĩnh vực nào, đang ở mức TRL mấy, đơn vị sở hữu là ai.
  * **Khó tìm kiếm khi dữ liệu nhiều**: Chỉ tìm được bằng cách gõ đúng từ khóa tiêu đề; không lọc được theo mức giá hay cấp độ công nghệ.
* **💡 Đề xuất cải tiến:**
  * Bổ sung ngay trên bảng các cột: Mức độ sẵn sàng (TRL), Tình trạng sáng chế, Lĩnh vực chuyên môn, Đơn vị tác giả.
  * Thêm bộ lọc nâng cao và nút bấm Xuất báo cáo danh sách ra file Excel phục vụ thống kê quản lý.

---

### 1.3. Màn hình "Xem Chi tiết Công nghệ & Ghép nối" (`3-xem chi tiết.html`)
*Mô tả hiện tại: Trang hiển thị nội dung công nghệ với 2 cột so sánh: Nội dung gốc của tác giả và Nội dung do AI tóm tắt (Tổng quan, Thông số, Giá trị cốt lõi). Bên phải có thanh Sidebar "Matching Hub" hiển thị "5 kết quả" và nút "Tìm lại".*

* **🌟 Ưu điểm:**
  * Cách trình bày đối chiếu 2 cột rất hiện đại, giúp người đọc dễ so sánh giữa tài liệu gốc và bản tóm tắt nhanh của AI.
  * Đã dành sẵn một vị trí nổi bật cho "Matching Hub" (Khu vực gợi ý kết nối).
* **⚠️ Nhược điểm thực tế:**
  * **AI mới chỉ viết lại văn bản**: AI mới chỉ tóm tắt lại chữ viết, chưa rút trích ra được các thông số kỹ thuật dạng số liệu chuẩn để máy tính tự động so sánh.
  * **Matching Hub chưa phải là gợi ý thật**: Con số "5 kết quả" hiện tại chỉ là số cố định mẫu (giả lập). Người dùng không nhìn thấy danh sách 5 doanh nghiệp nào đang cần công nghệ này, không có điểm số tương thích (ví dụ: `Phù hợp 92%`) và không giải thích được vì sao 2 bên lại hợp nhau.
* **💡 Đề xuất cải tiến:**
  * Biến Matching Hub thành **Bộ gợi ý thông minh thực thụ**: Hiển thị danh sách Top các Doanh nghiệp đang có bài toán phù hợp nhất, kèm điểm số % tương thích và nút bấm `[Gửi đề xuất hợp tác ngay]`.

---

### 1.4. Màn hình "Quản lý Danh sách Bài toán / Nhu cầu Cầu" (`4-ds cầu.html`)
*Mô tả hiện tại: Bảng danh sách bài toán/thách thức công nghệ do doanh nghiệp đưa lên, lọc theo trạng thái Nháp và Đã công bố.*

* **🌟 Ưu điểm:**
  * Giúp doanh nghiệp quản lý tập trung các bài toán mình đã đưa lên sàn.
  * Giao diện đồng bộ, quen thuộc với màn hình quản lý Cung.
* **⚠️ Nhược điểm thực tế:**
  * **Không thể hiện được quy mô bài toán**: Bảng không cho thấy bài toán này dự kiến ngân sách bao nhiêu tiền, cần gấp trong bao lâu (hạn chót nhận hồ sơ).
  * **Chưa theo dõi được phản hồi**: Doanh nghiệp không biết hiện tại đã có bao nhiêu Viện/Trường gửi giải pháp về chào hàng cho bài toán của mình.
* **💡 Đề xuất cải tiến:**
  * Bổ sung thêm các cột: Khoảng ngân sách dự kiến, Hạn chót nhận giải pháp, Số lượng hồ sơ giải pháp đã nộp về để Doanh nghiệp dễ theo dõi.

---

### 1.5. Màn hình "Đăng tải Bài toán Doanh nghiệp" (`5-thêm mới cầu.html`)
*Mô tả hiện tại: Biểu mẫu gồm Tiêu đề, Danh mục và 1 ô soạn thảo văn bản tự do, tương tự như form đăng Cung.*

* **🌟 Ưu điểm:**
  * Thao tác nhanh, đơn giản nếu chỉ viết vài câu mô tả bài toán ngắn.
* **⚠️ Nhược điểm thực tế:**
  * **Cực kỳ thiếu thốn thông tin cho bên bán (Viện/Trường)**: Form không có chỗ điền mục tiêu cần đạt (ví dụ: muốn nâng năng suất lên bao nhiêu %, giảm chi phí bao nhiêu %), không có mức ngân sách dự chi, không có yêu cầu về hạ tầng hiện tại.
  * **Viện/Trường không biết đường nào để chào giá**: Vì thiếu tiêu chí định lượng, các nhà khoa học không thể biết giải pháp của mình có vừa vặn với túi tiền và yêu cầu kỹ thuật của doanh nghiệp hay không.
  * **Doanh nghiệp e ngại lộ bí mật kinh doanh**: Chưa có tính năng cho phép Doanh nghiệp đăng bài toán ở chế độ ẩn danh (chỉ nêu bài toán kỹ thuật mà không lộ tên công ty).
* **💡 Đề xuất cải tiến:**
  * Chuẩn hóa form theo **Phiếu khảo sát nhu cầu công nghệ**: Cho phép nhập mục tiêu KPI rõ ràng, chọn khoảng ngân sách (ví dụ: 100 - 500 triệu, 500 triệu - 2 tỷ), và cho phép bật chế độ **"Đăng bài toán Ẩn danh"**.

---

### 1.6. Màn hình "Xem Chi tiết Bài toán Doanh nghiệp" (`6-xem chi tiết cầu.html`)
*Mô tả hiện tại: Hiển thị nội dung bài toán sau khi AI phân tích, kèm widget Matching Hub ở thanh bên phải.*

* **🌟 Ưu điểm:**
  * Giúp các Viện/Trường nhanh chóng nắm bắt được tóm tắt vấn đề mà Doanh nghiệp đang gặp phải.
* **⚠️ Nhược điểm thực tế:**
  * Doanh nghiệp chưa có công cụ để xem và so sánh các giải pháp do nhiều Viện/Trường khác nhau gửi về ứng tuyển cho bài toán của mình.
* **💡 Đề xuất cải tiến:**
  * Tích hợp thêm **"Hộp thư Tiếp nhận Chào giải pháp"**: Doanh nghiệp mở ra là thấy danh sách các Viện/Trường đã nộp hồ sơ, có bảng so sánh xem giải pháp nào đáp ứng tốt nhất với chi phí hợp lý nhất.

---

### 1.7. Màn hình "Quản lý Yêu cầu Hợp tác" (`7-yêu cầu hợp tác.html`)
*Mô tả hiện tại: Quản lý yêu cầu kết nối với 2 tab "Đã gửi" và "Nhận được". Mỗi thẻ chỉ hiện tên 2 bên, trạng thái "Đang chờ" và 1 nút "Hủy yêu cầu".*

* **🌟 Ưu điểm:**
  * Thể hiện trực quan mối liên kết giữa Bên Cung (Công nghệ đề xuất) và Bên Cầu (Mục tiêu bài toán).
* **⚠️ Nhược điểm thực tế:**
  * **Bỏ trống toàn bộ quy trình giao dịch thực tế**: Chuyển giao công nghệ là một quá trình kéo dài nhiều tháng. Hệ thống hiện tại chỉ có trạng thái "Đang chờ" và "Hủy", hoàn toàn thiếu các bước:
    1. Làm sao để Ký thỏa thuận bảo mật (NDA) để xem tài liệu chi tiết của nhau?
    2. Đặt lịch họp trao đổi trực tiếp hoặc online ở đâu?
    3. Thảo luận hợp đồng mẫu và ghi nhận kết quả chuyển giao ở đâu?
* **💡 Đề xuất cải tiến:**
  * Xây dựng thành **Quy trình Hợp tác Chuyển giao 6 Bước chuẩn mực (Deal Room)**:
    * *Bước 1: Tiếp nhận yêu cầu* -> *Bước 2: Phê duyệt sơ bộ* -> *Bước 3: Ký Cam kết bảo mật điện tử (Digital NDA)* -> *Bước 4: Đặt lịch họp trao đổi* -> *Bước 5: Thảo luận hợp đồng mẫu* -> *Bước 6: Ghi nhận kết quả chuyển giao thành công*.

---

### 1.8. Phân hệ "Chia sẻ Câu chuyện Đổi mới Sáng tạo" (`8`, `9`, `10-câu chuyện.html`)
*Mô tả hiện tại: Danh sách, form viết bài và trang đọc bài viết về các câu chuyện thành công hoặc bài học thất bại trong ĐMST.*

* **🌟 Ưu điểm:**
  * Ý tưởng rất nhân văn và thực tế: Không chỉ tôn vinh thành công mà còn dám chia sẻ cả bài học từ thất bại để cộng đồng cùng học hỏi.
* **⚠️ Nhược điểm thực tế:**
  * **Mới chỉ là một trang Blog tin tức đơn thuần (CMS)**: Bài viết đứng riêng lẻ, không liên kết trực tiếp với công nghệ hay doanh nghiệp cụ thể nào trên sàn.
  * **Thiếu công cụ Đào tạo / Nâng cao năng lực**: Viện/Trường cần được học về định giá sáng chế, Doanh nghiệp cần học cách thẩm định công nghệ, nhưng hệ thống chưa có phân hệ đào tạo (E-Learning).
* **💡 Đề xuất cải tiến:**
  * Gắn trực tiếp thẻ (Tag) câu chuyện vào hồ sơ công nghệ trên Sàn để tăng uy tín.
  * Mở rộng thành **Cổng Tri thức & Phân hệ E-Learning Khóa học ĐMST**: Cung cấp các khóa học ngắn hạn trực tuyến, cẩm nang định giá và kho biểu mẫu hợp đồng pháp lý tải về miễn phí.

---

### 1.9. Màn hình "Sàn Giao dịch Công nghệ Quốc gia" (`11-sàn giao dịch.html`)
*Mô tả hiện tại: Trang tìm kiếm công nghệ với thanh gõ từ khóa + 2 ô chọn (Loại Cung/Cầu, Lĩnh vực) và danh sách thẻ card công nghệ.*

* **🌟 Ưu điểm:**
  * Bố cục sàn giao dịch hiện đại, thoáng đãng, mang dáng dấp của một sàn thương mại điện tử chuyên nghiệp.
* **⚠️ Nhược điểm thực tế:**
  * **Rất khó tìm kiếm chính xác**: Nếu sàn có hàng nghìn công nghệ, người mua chỉ có thể tìm bằng chữ hoặc lọc ngành chung chung. Không thể kéo thanh trượt để lọc "Chỉ xem công nghệ TRL 7-9 đã sẵn sàng thương mại", không lọc được "Công nghệ dưới 500 triệu", không lọc được "Công nghệ tại Hà Nội/TP.HCM".
  * **Chưa có công cụ So sánh**: Người mua thấy 3 công nghệ cùng ngành nhưng không thể bấm nút so sánh xem cái nào vượt trội hơn.
* **💡 Đề xuất cải tiến:**
  * Nâng cấp thành **Bộ lọc đa chiều (Faceted Search)**: Lọc đồng thời theo Cấp độ TRL (1-9), Khoảng ngân sách, Địa bàn tỉnh/thành, Tình trạng Bằng sáng chế.
  * Bổ sung tính năng **"So sánh 2-4 công nghệ cùng lúc"** trên một bảng ma trận đối chiếu.

---

### 1.10. Màn hình "Chi tiết Sản phẩm / Công nghệ trên Sàn" (`12-xem chi tiết sản phẩm.html`)
*Mô tả hiện tại: Trang thông tin công khai của sản phẩm trên Sàn, hiển thị mô tả giải pháp và tài liệu đính kèm.*

* **🌟 Ưu điểm:**
  * Trình bày hình ảnh và nội dung bài giới thiệu công nghệ rõ ràng, trang nhã.
* **⚠️ Nhược điểm thực tế:**
  * **Thiếu các nút bấm kêu gọi hành động (Call to Action)**: Khách xem xong thấy ưng ý nhưng không có nút bấm rõ ràng để `[Gửi yêu cầu hợp tác ngay]` hoặc `[Yêu cầu mở khóa tài liệu mật Mức 2 & 3]`.
* **💡 Đề xuất cải tiến:**
  * Bổ sung thanh tác vụ nổi bật: Nút `[Gửi Yêu cầu Kết nối]` và nút `[Yêu cầu xem Thông số Mật Mức 2/3 - Cần ký NDA]`.

---

## PHẦN 2: TỔNG HỢP KHOẢNG TRỐNG (GAP ANALYSIS) VÀ GÓI ĐỀ XUẤT TÍNH NĂNG CHO PHASE 2

Toàn bộ các khoảng trống nghiệp vụ phát hiện được qua quá trình **Gap Analysis (G-01 đến G-12)** được nhóm lại thành **6 GÓI TÍNH NĂNG ĐỘT PHÁ CỦA GIAI ĐOẠN 2 (PHASE 2 PROPOSAL)** để trình Ban Lãnh đạo / Khách hàng phê duyệt triển khai:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│              TỔNG HỢP 6 GÓI TÍNH NĂNG ĐỘT PHÁ ĐỀ XUẤT CHO GIAI ĐOẠN 2 (PHASE 2)                  │
├──────────────┬───────────────────────────────┬───────────────────────────────────────────────────┤
│ MÃ GAP       │ KHOẢNG TRỐNG PHÁT HIỆN        │ GÓI TÍNH NĂNG ĐỀ XUẤT TRIỂN KHAI TRONG PHASE 2    │
├──────────────┼───────────────────────────────┼───────────────────────────────────────────────────┤
│ G-01, G-02   │ Form nhập text tự do, người   │ 📦 GÓI 1: TRỢ LÝ AI BÓC TÁCH TÀI LIỆU TỰ ĐỘNG     │
│ & G-09       │ dùng ngại nhập liệu dài.      │ (AI Copilot Ingestion for Supply & Demand)        │
├──────────────┼───────────────────────────────┼───────────────────────────────────────────────────┤
│ G-04         │ Matching Hub chỉ là mockup số │ 📦 GÓI 2: ĐỘNG CƠ GHÉP NỐI AI ĐA CHIỀU            │
│              │ tĩnh (số 5), không có % thật. │ (Smart Hybrid Matching Engine & Breakdown Score)  │
├──────────────┼───────────────────────────────┼───────────────────────────────────────────────────┤
│ G-05         │ Thiếu quy trình ký bảo mật;   │ 📦 GÓI 3: KÝ THỎA THUẬN BẢO MẬT ĐIỆN TỬ (NDA)     │
│              │ rò rỉ bí quyết công nghệ.     │ & PHÒNG ĐÀM PHÁN HỢP TÁC 6 CHẶNG (Deal Room)      │
├──────────────┼───────────────────────────────┼───────────────────────────────────────────────────┤
│ G-06 & G-07  │ Sàn tìm kiếm nghèo nàn; không │ 📦 GÓI 4: BỘ LỌC ĐA CHIỀU (FACETED SEARCH)        │
│              │ so sánh đối chuẩn được.       │ & CÔNG CỤ SO SÁNH ĐỐI CHUẨN CÔNG NGHỆ (Compare)   │
├──────────────┼───────────────────────────────┼───────────────────────────────────────────────────┤
│ G-08 & G-10  │ Không kiểm duyệt; nguy cơ rác │ 📦 GÓI 5: HÀNG ĐỢI THẨM ĐỊNH CHUYÊN GIA ĐA CẤP    │
│              │ và vi phạm bản quyền sáng chế.│ (Expert Review Queue & RBAC Verification)         │
├──────────────┼───────────────────────────────┼───────────────────────────────────────────────────┤
│ G-12         │ Lãnh đạo không có số liệu     │ 📦 GÓI 6: BẢNG ĐIỀU KHIỂN BÁO CÁO ĐMST VĨ MÔ      │
│              │ tổng quan để điều hành.       │ (Executive National Analytics Dashboard)          │
└──────────────┴───────────────────────────────┴───────────────────────────────────────────────────┘
```

---

### CHI TIẾT 6 GÓI TÍNH NĂNG ĐỀ XUẤT CHO PHASE 2

#### 📦 GÓI 1: TRỢ LÝ AI BÓC TÁCH TÀI LIỆU TỰ ĐỘNG (AI COPILOT INGESTION)
*Giải quyết Gap: G-01, G-02, G-09 (Người dùng ngại nhập form dài, dữ liệu thiếu chuẩn hóa).*
* **Tính năng chi tiết:**
  * **Upload & Auto-fill**: Cho phép Nhà khoa học / Doanh nghiệp chỉ cần tải lên file Word đề tài nghiên cứu (.docx), Hồ sơ sáng chế (.pdf) hoặc Bản mô tả bài toán (SOW).
  * **AI trích xuất thông minh**: AI tự động đọc hiểu, bóc tách các trường: Cấp độ TRL (1-9), Tình trạng SHTT, Tiêu chuẩn kỹ thuật, Khung giá và Ma trận mục tiêu KPI để tự điền vào Form.
  * **Người dùng chỉ cần rà soát & xác nhận**: Giảm 85% thời gian nhập liệu thủ công, nâng cao tỷ lệ hoàn thiện hồ sơ chất lượng cao.
* **Giá trị mang lại cho Khách hàng:** Nhanh chóng số hóa và thu nạp hàng nghìn công nghệ từ các Viện/Trường mà không gây quá tải cho người nhập liệu.

#### 📦 GÓI 2: ĐỘNG CƠ GHÉP NỐI AI ĐA CHIỀU & BẢNG GIẢI TRÌNH % (SMART MATCHING ENGINE)
*Giải quyết Gap: G-04 (Thay thế con số tĩnh giả lập số 5 bằng thuật toán thật).*
* **Tính năng chi tiết:**
  * **Thuật toán Hybrid Matching**: Kết hợp phân tích ngữ nghĩa nội dung (Vector Embeddings) và bộ lọc ràng buộc số liệu (TRL, Ngân sách, Địa bàn, Lĩnh vực OECD).
  * **Điểm số Tương thích Minh bạch (% Match Score)**: Hiển thị điểm số thật (ví dụ: `94% Tương thích`) kèm thanh phân rã chi tiết: Điểm lĩnh vực (100%), Điểm TRL (90%), Điểm ngân sách (85%).
  * **AI Giải trình lý do**: Chỉ rõ điểm mạnh tương thích và điểm lệch cần thương thảo giữa 2 bên.
  * **Tự động gửi Thông báo (Smart Alert)**: Tự động gửi Email thông báo ngay khi có đối tác phù hợp xuất hiện trên Sàn.
* **Giá trị mang lại cho Khách hàng:** Tạo ra giá trị cốt lõi "kết nối thông minh" của Nền tảng ĐMST Quốc gia, giúp Doanh nghiệp tìm đúng công nghệ trong vài giây.

#### 📦 GÓI 3: KÝ THỎA THUẬN BẢO MẬT ĐIỆN TỬ (DIGITAL NDA) & PHÒNG ĐÀM PHÁN (DEAL ROOM)
*Giải quyết Gap: G-05 (Quy trình hợp tác sơ khai, thiếu cơ chế bảo vệ bí mật công nghệ).*
* **Tính năng chi tiết:**
  * **Ký Thỏa thuận Bảo mật NDA Trực tuyến**: Tích hợp mẫu cam kết bảo mật chuẩn pháp lý. Người đại diện 2 bên xác thực OTP/Chữ ký số online -> Hệ thống tự động xuất file PDF chứng thực và **tự động mở khóa quyền xem tài liệu chuyên sâu Mức 2 & 3**.
  * **Phòng Đàm phán Riêng tư (Deal Room)**: Không gian trao đổi bảo mật cho từng thương vụ: Nhắn tin, lưu biên bản họp, đặt lịch hẹn trao đổi, lưu trữ các phiên bản hợp đồng có dấu thời gian (Timestamp).
  * **Thư viện Hợp đồng Mẫu chuẩn Bộ KH&CN**: Cung cấp sẵn mẫu hợp đồng li-xăng, chuyển nhượng sáng chế, hợp đồng thử nghiệm PoC.
* **Giá trị mang lại cho Khách hàng:** Xóa bỏ rào cản e ngại mất cắp bản quyền của các Nhà khoa học; hỗ trợ khép kín giao dịch từ lúc kết nối đến khi ký hợp đồng chuyển giao.

#### 📦 GÓI 4: BỘ LỌC ĐA CHIỀU (FACETED SEARCH) & SO SÁNH ĐỐI CHUẨN CÔNG NGHỆ
*Giải quyết Gap: G-06, G-07 (Khó khăn trong tìm kiếm và đánh giá công nghệ trên Sàn).*
* **Tính năng chi tiết:**
  * **Bộ lọc Faceted Search đa tiêu chí**: Cho phép lọc tức thì theo: Thanh trượt TRL 1-9 (R&D / Thử nghiệm / Thương mại), Tình trạng SHTT (Đã cấp bằng / Đang thẩm định), Khung giá chuyển giao, Địa bàn tỉnh/thành.
  * **Ma trận So sánh Đối chuẩn (Compare Matrix)**: Chọn 2-4 công nghệ để so sánh trực quan cạnh nhau về: Thông số kỹ thuật, Độ hoàn thiện, Chi phí, Đội ngũ tác giả, Thời gian triển khai.
* **Giá trị mang lại cho Khách hàng:** Mang lại trải nghiệm tra cứu chuyên nghiệp như các sàn giao dịch công nghệ quốc tế, giúp Doanh nghiệp ra quyết định mua nhanh chóng.

#### 📦 GÓI 5: HÀNG ĐỢI THẨM ĐỊNH & KIỂM DUYỆT CHUYÊN GIA ĐA CẤP
*Giải quyết Gap: G-08, G-10 (Nguy cơ thông tin rác, xâm phạm bản quyền, thiếu phân quyền).*
* **Tính năng chi tiết:**
  * **Quy trình Thẩm định Chuyên môn (Approval Queue)**: Hồ sơ công nghệ/bài toán sau khi đăng sẽ chuyển vào hàng đợi kiểm duyệt. Cán bộ chuyên gia kiểm tra tính xác thực của Bằng sáng chế, tính hợp lý của cấp độ TRL trước khi duyệt hiển thị lên Sàn Quốc gia.
  * **Xác thực Định danh Doanh nghiệp & Viện/Trường (KYB)**: Xác thực tư cách pháp nhân qua mã số thuế và thẩm định năng lực đơn vị.
* **Giá trị mang lại cho Khách hàng:** Bảo đảm 100% dữ liệu trên Sàn Quốc gia là dữ liệu chuẩn xác, có giá trị khoa học và pháp lý cao.

#### 📦 GÓI 6: BẢNG ĐIỀU KHIỂN BÁO CÁO THỐNG KÊ ĐMST VĨ MÔ (EXECUTIVE DASHBOARD)
*Giải quyết Gap: G-12 (Thiếu số liệu đo lường phục vụ lãnh đạo và cơ quan quản lý).*
* **Tính năng chi tiết:**
  * **Bản đồ nhiệt Cung - Cầu 63 Tỉnh/Thành**: Trực quan hóa mật độ công nghệ và bài toán theo vùng kinh tế trọng điểm.
  * **Biểu đồ Cơ cấu TRL & Lĩnh vực**: Thống kê tỷ lệ công nghệ theo 9 cấp độ TRL và phân loại KH&CN (OECD).
  * **Chỉ số Hiệu quả Kết nối (ROI)**: Thống kê số thương vụ kết nối thành công, tổng giá trị chuyển giao công nghệ ước tính, xuất báo cáo PDF/Excel định kỳ.
* **Giá trị mang lại cho Khách hàng:** Cung cấp công cụ điều hành chiến lược cho Lãnh đạo cơ quan quản lý và hoạch định chính sách thúc đẩy ĐMST.

---

## PHẦN 3: TƯ VẤN KIẾN TRÚC & PHÂN QUYỀN THEO 4 NHÓM NGƯỜI DÙNG

### 3.1. Giải đáp thắc mắc: "Khách mua (Bên Cầu) nên dùng chung web này hay làm Landing Page riêng?"

> **Khuyến nghị từ chuyên gia BA:** **TUYỆT ĐỐI NÊN DÙNG CHUNG TRÊN MỘT NỀN TẢNG HỢP NHẤT**, KHÔNG NÊN LÀM LANDING PAGE BÁN HÀNG TÁCH RỜI.

* **Vì sao không nên làm Landing Page riêng?**
  * Giao dịch công nghệ là B2B phức tạp, không phải mua hàng online tiêu dùng. Khách mua không chỉ vào "xem hàng" mà còn cần **đăng bài toán của họ lên để 100+ Viện/Trường cùng chào giải pháp**.
  * Nếu tách riêng, hệ thống mất đi tính kết nối 2 chiều (Cung tìm Cầu và Cầu tìm Cung), lãng phí sức mạnh của thuật toán AI Matching Engine.
* **Mô hình hợp nhất đề xuất:**
  1. **Khách vãng lai / Khách xem công khai**: Vào xem Sàn giao dịch, tìm kiếm công nghệ, đọc câu chuyện ĐMST tự do không cần đăng nhập.
  2. **Doanh nghiệp (Bên Cầu)**: Đăng nhập vào Không gian Doanh nghiệp để đăng bài toán, nhận gợi ý giải pháp từ AI, ký NDA mở khóa tài liệu mật và đàm phán hợp đồng.
  3. **Viện/Trường (Bên Cung)**: Đăng nhập vào Không gian Bên Cung để đăng tải sáng chế TRL 1-9, thiết lập bảo mật 3 cấp, tiếp nhận bài toán doanh nghiệp gửi về.
  4. **Admin & Chuyên gia**: Kiểm duyệt tính xác thực của công nghệ trước khi cho phép xuất hiện trên Sàn Quốc gia.

```
                                  HỆ THỐNG NACENTECH
                                           │
         ┌───────────────────┬─────────────┴───────────────┬──────────────────┐
         ▼                   ▼                             ▼                  ▼
  [KHÁCH VÃNG LAI]       [BÊN CẦU]                     [BÊN CUNG]        [ADMIN & OPERATOR]
  (Public Visitor)       (Buyer Workspace)             (Supplier Space)  (Admin Portal)
  • Sàn công nghệ        • Đăng bài toán / KPI         • Đăng TRL 1-9    • Thẩm định Cung/Cầu
  • Tra cứu Faceted      • Nhận giải pháp AI Match     • Quản lý SHTT    • Duyệt xuất bản Sàn
  • Đọc Case studies     • Ký NDA & Thương thảo HĐ     • Học thương mại  • Dashboard thống kê
```

---

## PHẦN 4: DANH MỤC TÍNH NĂNG TOÀN DIỆN HỆ THỐNG DẠNG BẢNG (7 MODULES CHUẨN HÓA)

---

### MODULE 1: SÀN GIAO DỊCH CÔNG NGHỆ QUỐC GIA & SHOWCASE (PUBLIC MARKETPLACE)
*Phục vụ: Khách vãng lai, Doanh nghiệp mua, Nhà đầu tư, Viện/Trường.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-1.1** | **Trang chủ & Showcase ĐMST Quốc gia** | Giao diện hiện đại hiển thị công nghệ tiêu biểu, công nghệ sẵn sàng thương mại (TRL 7-9), bài toán nóng của doanh nghiệp và số liệu thống kê thời gian thực. | All Actors | P0 | Phase 1 & 2 | G-06 |
| **FEAT-1.2** | **Bộ lọc Đa chiều Thông minh (Faceted Search)** | Tìm kiếm thông minh kết hợp lọc đồng thời theo: Thang TRL (1-9), Ngành KH&CN (OECD), Tình trạng SHTT (Sáng chế/Đang nộp), Khung giá, Tỉnh/Thành, Tiêu chuẩn ISO/OCOP. | All Actors | P0 | **Phase 2 (Gói 4)** | **G-06** |
| **FEAT-1.3** | **Thẻ Card Công nghệ Chuẩn hóa** | Hiển thị thẻ giải pháp với các Badge trực quan: Badge TRL (`TRL 8 - Đã kiểm chứng`), Badge SHTT (`Bằng Độc quyền Sáng chế`), Badge Thẩm định (`Đã xác thực`). | All Actors | P0 | Phase 1 | G-01, G-06 |
| **FEAT-1.4** | **Trang Chi tiết Công nghệ Công khai (Mức 1)** | Trình bày mô tả giải pháp, video demo, hình ảnh thực tế, đơn vị chủ trì, khung giá và hình thức chuyển giao đề xuất (Li-xăng, Bán đứt, Hợp tác R&D). | All Actors | P0 | Phase 1 | G-01, G-03 |
| **FEAT-1.5** | **Công cụ So sánh Đối chuẩn (Compare Matrix)** | Tích chọn 2-4 công nghệ cùng ngành để mở bảng so sánh đối đầu các chỉ số kỹ thuật, TRL, chi phí, bản quyền, thời gian triển khai. | Bên Cầu | P1 | **Phase 2 (Gói 4)** | **G-07** |
| **FEAT-1.6** | **Thanh Nút Hành động Nhanh (Sticky CTA)** | Nút nổi bật cố định trên màn hình: `[Gửi Yêu cầu Hợp tác]`, `[Yêu cầu xem Thông tin Mật Mức 2/3 (Ký NDA)]`, `[Liên hệ Chuyên gia Sàn]`. | Bên Cầu | P0 | Phase 2 | G-05 |

---

### MODULE 2: QUẢN LÝ NGUỒN CUNG CÔNG NGHỆ (SUPPLY MANAGEMENT)
*Phục vụ: Viện nghiên cứu, Trường đại học, Nhà khoa học, Doanh nghiệp công nghệ.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-2.1** | **Biểu mẫu Đăng Cung 3 Bước (Wizard Form)** | Form thu thập chuẩn hóa theo `Phieu_khao_sat_nguon_cung`: Bước 1 (Thông tin chung) -> Bước 2 (Hồ sơ kỹ thuật: TRL 1-9, SHTT, Giá, Tiêu chuẩn) -> Bước 3 (Phân quyền 3 mức bảo mật). | Bên Cung | P0 | Phase 1 | G-01 |
| **FEAT-2.2** | **Quản trị Bảo mật Dữ liệu 3 Cấp độ** | Phân quyền truy cập tài liệu: Mức 1 (Công khai xem trên Sàn) -> Mức 2 (Mở khi gửi yêu cầu) -> Mức 3 (Chỉ mở sau khi ký Thỏa thuận Bảo mật NDA điện tử). | Bên Cung | P0 | Phase 1 | G-03, G-05 |
| **FEAT-2.3** | **Trợ lý AI Bóc tách File Nguồn Cung (AI Ingestion)**| Tải lên file Word đề tài nghiên cứu (.docx) hoặc hồ sơ sáng chế (.pdf); AI tự động đọc hiểu và điền sẵn thông tin vào các ô trong form để người dùng rà soát. | Bên Cung | P1 | **Phase 2 (Gói 1)** | **G-01, G-09** |
| **FEAT-2.4** | **Bảng Điều khiển Quản lý Nguồn Cung** | Quản lý toàn bộ công nghệ đã đăng: Lọc theo trạng thái (Nháp, Chờ thẩm định, Đã duyệt lên Sàn, Bị từ chối), theo dõi lượt xem, số yêu cầu hợp tác. | Bên Cung | P0 | Phase 1 | G-01 |
| **FEAT-2.5** | **Quản lý Lịch sử Nâng cấp TRL** | Cho phép cập nhật phiên bản mới và nâng cấp mức độ sẵn sàng công nghệ theo tiến trình nghiên cứu (ví dụ từ TRL 4 lab lên TRL 7 pilot). | Bên Cung | P1 | Phase 2 | G-01 |

---

### MODULE 3: QUẢN LÝ NHU CẦU & BÀI TOÁN DOANH NGHIỆP (DEMAND MANAGEMENT)
*Phục vụ: Doanh nghiệp có bài toán, Hiệp hội ngành hàng, Nhà đầu tư.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-3.1** | **Biểu mẫu Đăng Bài toán Chuẩn hóa** | Form thu thập chuẩn theo `Phieu_khao_sat_nhu_cau`: Nút thắt kỹ thuật, Ma trận KPI mục tiêu (Năng suất, Chi phí), TRL tối thiểu, Khung ngân sách, Thời hạn. | Bên Cầu | P0 | Phase 1 | G-02 |
| **FEAT-3.2** | **Chế độ Đăng Bài toán Ẩn danh (Blind Statement)** | Cho phép Doanh nghiệp giấu tên công ty, chỉ công khai yêu cầu kỹ thuật và ngân sách để bảo vệ bí mật chiến lược kinh doanh cho đến khi ký NDA. | Bên Cầu | P1 | **Phase 2 (Gói 1)** | **G-02, G-05** |
| **FEAT-3.3** | **Trợ lý AI Bóc tách Đề bài Doanh nghiệp** | Tải lên file SOW dự án hoặc hồ sơ mời thầu giải pháp; AI tự động bóc tách các chỉ số KPI kỹ thuật đưa vào form bài toán. | Bên Cầu | P1 | **Phase 2 (Gói 1)** | **G-02, G-09** |
| **FEAT-3.4** | **Bảng Điều khiển Quản lý Bài toán** | Doanh nghiệp theo dõi danh sách các bài toán đã đăng, hạn chót nhận hồ sơ và tiến độ thẩm định của chuyên gia sàn. | Bên Cầu | P0 | Phase 1 | G-02 |
| **FEAT-3.5** | **Cổng Tiếp nhận Chào giải pháp (Pitching Box)** | Hộp thư tiếp nhận các hồ sơ chào giải pháp do các Viện/Trường gửi tới; hỗ trợ doanh nghiệp chấm điểm, so sánh và chọn giải pháp khả thi nhất. | Bên Cầu | P1 | **Phase 2 (Gói 1)** | **G-02, G-07** |

---

### MODULE 4: CÔNG CỤ KHỚP NỐI THÔNG MINH (SMART MATCHING ENGINE)
*Phục vụ: Tự động hóa hệ thống, hỗ trợ Bên Cung và Bên Cầu.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-4.1** | **Thuật toán Khớp nối AI Đa chiều (Hybrid AI)** | Kết hợp tìm kiếm ngữ nghĩa thông minh (Vector Embeddings) với bộ lọc số liệu: Lĩnh vực OECD (30%), TRL (25%), Ngân sách (20%), Địa bàn (15%), Năng lực (10%). | Hệ thống AI | P0 | **Phase 2 (Gói 2)** | **G-04** |
| **FEAT-4.2** | **Widget Matching Hub với Điểm số % Thật** | Tích hợp trên trang chi tiết Cung/Cầu: Hiển thị danh sách Top 5 đối tác phù hợp nhất kèm điểm số tương thích thật (ví dụ: `94% Phù hợp`) và nút kết nối. | Cung & Cầu | P0 | **Phase 2 (Gói 2)** | **G-04** |
| **FEAT-4.3** | **Bảng Giải trình Tương thích (Score Breakdown)** | Hiển thị minh bạch lý do AI đánh giá phù hợp: Điểm mạnh tương thích kỹ thuật, điểm lệch cần thương thảo thêm (TRL, chi phí, khoảng cách địa lý). | Cung & Cầu | P0 | **Phase 2 (Gói 2)** | **G-04** |
| **FEAT-4.4** | **Thông báo Khớp nối Tự động (Smart Alert)** | Tự động gửi Email & In-app Notification cho Doanh nghiệp ngay khi có Nguồn Cung mới phù hợp với bài toán của họ (và ngược lại). | Hệ thống | P1 | **Phase 2 (Gói 2)** | **G-04** |
| **FEAT-4.5** | **Tùy chỉnh Trọng số Ưu tiên Khớp nối** | Cho phép người dùng tùy chỉnh tiêu chí: "Ưu tiên công nghệ có bằng sáng chế" hoặc "Ưu tiên đối tác cùng khu vực địa lý". | Bên Cầu, Admin | P2 | Phase 3 | G-04 |

---

### MODULE 5: QUẢN LÝ VÒNG ĐỜI HỢP TÁC & KÝ NDA (COLLABORATION & DEAL ROOM)
*Phục vụ: Bên Cung, Bên Cầu, Cán bộ Điều phối Sàn.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-5.1** | **Quy trình Hợp tác Chuyển giao 6 Bước** | Theo dõi toàn diện tiến trình: (1) Tiếp nhận -> (2) Phê duyệt sơ bộ -> (3) Ký NDA điện tử -> (4) Đặt lịch họp -> (5) Thảo luận hợp đồng mẫu -> (6) Đóng thương vụ. | Cung, Cầu, Admin | P0 | **Phase 2 (Gói 3)** | **G-05** |
| **FEAT-5.2** | **Ký Thỏa thuận Bảo mật Điện tử (Digital NDA)** | Mẫu NDA chuẩn pháp lý: Người đại diện 2 bên xác thực OTP/Chữ ký số online -> Xuất file PDF chứng thực -> Tự động mở khóa quyền xem tài liệu Mức 2 & 3. | Bên Cung, Bên Cầu | P0 | **Phase 2 (Gói 3)** | **G-03, G-05** |
| **FEAT-5.3** | **Phòng Đàm phán Riêng tư (Deal Room)** | Không gian trao đổi bảo mật cho từng thương vụ: Nhắn tin, lưu biên bản họp, đặt lịch hẹn trực tuyến, lưu trữ các phiên bản hợp đồng có dấu thời gian. | Bên Cung, Bên Cầu | P1 | **Phase 2 (Gói 3)** | **G-05** |
| **FEAT-5.4** | **Thư viện Hợp đồng Chuyển giao Mẫu** | Cung cấp sẵn các mẫu hợp đồng chuẩn Bộ KH&CN: Hợp đồng chuyển nhượng sáng chế, Hợp đồng li-xăng độc quyền, Hợp đồng thử nghiệm PoC. | Bên Cung, Bên Cầu | P1 | Phase 2 & 3 | G-05 |
| **FEAT-5.5** | **Ghi nhận Doanh số & Kết quả Chuyển giao** | Ghi nhận giá trị thương vụ thành công để phục vụ hạch toán, báo cáo thống kê chỉ số ĐMST quốc gia. | Cung, Cầu, Admin | P1 | **Phase 2 (Gói 3)** | **G-05, G-12** |

---

### MODULE 6: CỔNG TRI THỨC, CASE STUDIES & ĐÀO TẠO (KNOWLEDGE & E-LEARNING)
*Phục vụ: Khách vãng lai, Bên Cung, Bên Cầu.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-6.1** | **Kho Câu chuyện Thành công & Bài học ĐMST** | Quản lý và xuất bản các bài viết thực tế về thương vụ chuyển giao thành công và bài học thất bại; có gắn thẻ (Tagging) trực tiếp tới công nghệ trên Sàn. | All Actors | P1 | Phase 1 & 2 | G-11 |
| **FEAT-6.2** | **Phân hệ E-Learning Khóa học ĐMST Trực tuyến**| Khóa học ngắn hạn trực tuyến: Định giá tài sản trí tuệ (cho Nhà khoa học), Đánh giá mức độ sẵn sàng công nghệ & Quản trị rủi ro PoC (cho Doanh nghiệp). | Bên Cung, Bên Cầu | P2 | Phase 3 | G-11 |
| **FEAT-6.3** | **Thư viện Cẩm nang & Biểu mẫu Pháp lý Mở** | Kho tài liệu tải về miễn phí: Hướng dẫn đăng ký sáng chế, cẩm nang thương mại hóa, mẫu quy chế quản lý tài sản trí tuệ trong viện/trường. | All Actors | P1 | Phase 2 | G-11 |
| **FEAT-6.4** | **Mạng lưới Hỏi đáp với Chuyên gia (Q&A)** | Kênh kết nối hỏi đáp trực tiếp với các chuyên gia đầu ngành về sở hữu trí tuệ, đo lường chất lượng và định giá công nghệ. | Bên Cung, Bên Cầu | P2 | Phase 3 | G-11 |

---

### MODULE 7: QUẢN TRỊ HỆ THỐNG, KIỂM DUYỆT & THẨM ĐỊNH (ADMIN & GOVERNANCE)
*Phục vụ: Ban Quản trị, Chuyên gia Thẩm định, Lãnh đạo Cơ quan Quản lý.*

| Mã Feature | Tên Tính năng | Mô tả Nghiệp vụ Chi tiết | Đối tượng (Actor) | Ưu tiên | Giai đoạn | Gap giải quyết |
|---|---|---|:---:|:---:|:---:|:---:|
| **FEAT-7.1** | **Hàng đợi Kiểm duyệt & Thẩm định Chuyên môn** | Cán bộ chuyên gia kiểm tra tính hợp lệ của hồ sơ (bằng sáng chế thật, mức TRL hợp lý) trước khi duyệt hiển thị lên Sàn Quốc gia / Trả về yêu cầu bổ sung. | Admin, Operator | P0 | **Phase 2 (Gói 5)** | **G-08** |
| **FEAT-7.2** | **Quản lý Danh mục Chuẩn Quốc tế (Master Data)**| Quản lý bảng phân loại: Lĩnh vực KH&CN (OECD Frascati), Phân loại sáng chế (WIPO IPC), Nhóm ngành kinh tế (VSIC/NACE), Bảng 9 cấp độ TRL. | Admin | P1 | Phase 1 | G-10 |
| **FEAT-7.3** | **Quản lý Người dùng & Xác thực Doanh nghiệp (KYB)**| Xác thực mã số thuế doanh nghiệp, thẩm định đơn vị viện/trường, phân quyền truy cập nghiêm ngặt theo 4 nhóm vai trò. | Admin | P0 | Phase 1 & 2 | G-10 |
| **FEAT-7.4** | **Bảng Thống kê & Báo cáo ĐMST Quốc gia** | Biểu đồ trực quan hóa vĩ mô: Bản đồ nhiệt Cung-Cầu theo 63 tỉnh/thành, tỷ lệ khớp nối thành công, tổng giá trị chuyển giao công nghệ toàn quốc. | Admin, Lãnh đạo | P0 | **Phase 2 (Gói 6)** | **G-12** |
| **FEAT-7.5** | **Nhật ký An toàn Thông tin & Giám sát (Audit Log)**| Ghi lại toàn bộ hành vi truy cập dữ liệu nhạy cảm (Ai xem Dữ liệu Mức 2/3, Ai tải file sáng chế, Lịch sử ký NDA) bảo đảm an toàn cấp độ 3. | Admin | P1 | **Phase 2 (Gói 5)** | **G-03, G-10** |

---

## PHẦN 5: MA TRẬN SO SÁNH GIÁ TRỊ TRƯỚC VÀ SAU CẢI TIẾN

```
┌────────────────────────────┬───────────────────────────────┬─────────────────────────────────┬───────────────────┐
│ TIÊU CHÍ SO SÁNH           │ HIỆN TRẠNG (PROTOTYPE CŨ)     │ NỀN TẢNG CHUẨN HÓA ĐỀ XUẤT      │ GIÁ TRỊ TĂNG THÊM │
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 1. Cấu trúc Dữ liệu Cung   │ 1 ô gõ chữ tự do; thiếu TRL,  │ Form 3 bước có điểm TRL (1-9),  │ 🟢 Tăng 400% độ   │
│                            │ SHTT, Giá, Năng lực sản xuất. │ bằng sáng chế, giá, tiêu chuẩn. │ tin cậy dữ liệu   │
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 2. Cấu trúc Bài toán Cầu   │ Gõ chữ chung chung; không có  │ Ma trận KPI mục tiêu, ngân sách,│ 🟢 Viện/Trường    │
│                            │ ngân sách, không có tiêu chí. │ TRL tối thiểu, đăng ẩn danh.    │ chào đúng giá     │
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 3. Ghép nối Thông minh     │ Con số tĩnh giả lập (số 5);   │ Thuật toán AI Hybrid đa chiều,  │ 🟢 Chuyển đổi từ  │
│                            │ không có % điểm tương thích.  │ hiện Match Score %, giải trình. │ Mockup sang thật  │
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 4. Quy trình Hợp tác       │ Chỉ có 1 thẻ "Đang chờ" và nút│ Quy trình 6 bước (Deal Room) có │ 🟢 Bảo vệ tuyệt đối│
│                            │ "Hủy yêu cầu".                │ KÝ THỎA THUẬN NDA ĐIỆN TỬ.      │ bí mật sáng chế   │
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 5. Sàn Giao dịch           │ Tìm kiếm từ khóa cơ bản và    │ Bộ lọc Faceted đa chiều (TRL,   │ 🟢 Trải nghiệm mua│
│                            │ 2 ô chọn loại/lĩnh vực.       │ giá, SHTT, tỉnh thành) + So sánh│ dễ dàng, nhanh    │
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 6. Kiểm duyệt & Quản trị   │ Nút "Công khai" đăng bài ngay │ Hàng đợi thẩm định chuyên gia   │ 🟢 Loại bỏ tin rác│
│                            │ không qua kiểm duyệt.         │ trước khi duyệt lên Sàn.        │ và vi phạm bản quyền│
├────────────────────────────┼───────────────────────────────┼─────────────────────────────────┼───────────────────┤
│ 7. Đào tạo & Tri thức      │ Blog tin tức bài viết thường. │ Cổng Tri thức + Phân hệ Khóa học│ 🟢 Nâng tầm năng  │
│                            │                               │ E-Learning & Mẫu hợp đồng chuẩn.│ lực hệ sinh thái  │
└────────────────────────────┴───────────────────────────────┴─────────────────────────────────┴───────────────────┘
```

---

## PHẦN 6: LỘ TRÌNH TRIỂN KHAI THEO TỪNG GIAI ĐOẠN (ROADMAP)

```
┌───────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: NỀN TẢNG CỐT LÕI (Tháng 1 - 2)   │
│ • Cải tiến Form Đăng Cung (TRL 1-9, SHTT, Giá)│
│ • Cải tiến Form Đăng Cầu (KPIs, Ngân sách)    │
│ • Cập nhật Giao diện Sàn & Card Huy hiệu TRL  │
│ • Cấu hình Master Data (OECD, WIPO, VSIC)     │
│ • Phân quyền Tài khoản RBAC cơ bản            │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│ GIAI ĐOẠN 2: TRỌNG TÂM ĐỘT PHÁ (Tháng 3 - 4)  │
│ 🎯 Gói 1: AI Bóc tách File tự động (Ingestion)│
│ 🎯 Gói 2: Động cơ Ghép nối AI & % Match Score │
│ 🎯 Gói 3: Ký NDA Điện tử & Deal Room 6 Chặng  │
│ 🎯 Gói 4: Bộ lọc Faceted Search & So sánh Tech│
│ 🎯 Gói 5: Hàng đợi Thẩm định Chuyên gia Đa cấp│
│ 🎯 Gói 6: Dashboard Báo cáo ĐMST Vĩ mô        │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│ GIAI ĐOẠN 3: HỆ SINH THÁI MỞ RỘNG (Tháng 5 - 6)│
│ • Phân hệ E-Learning Khóa học ĐMST Trực tuyến │
│ • Mạng lưới Hỏi đáp Tư vấn Chuyên gia (Q&A)   │
│ • Tùy chỉnh Nâng cao Trọng số Khớp nối        │
│ • API Mở kết nối dữ liệu liên thông Bộ/Ngành  │
└───────────────────────────────────────────────┘
```
