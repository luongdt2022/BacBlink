# Change Request: CR-2026-028 Nâng Cấp Không Gian Học Tập Tương Tác 8 Thành Phần, Khung 50 Bài Học (30 CG + 20 ĐH), 8 Mô-Đun / 5 Lộ Trình & Pipeline ETL E-Learning

**CR-ID**: CR-2026-028  
**Epic**: TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING  
**Status**: MERGED / COMPLETED (Gate 4 & Gate 5 Verified — 2026-11-10)  
**Target Version**: 1.1.0  
**Author**: PO kiêm Senior BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-10  
**Căn cứ pháp lý & Thiết kế cơ sở**:  
- Quyết định số 1993/QĐ-BKHCN ngày 01/8/2025 của Bộ trưởng Bộ Khoa học và Công nghệ và Báo cáo chuyên đề: `Specification/01_DATA_RAW/Bao cao chuyen de Khung chuong trinh dao tao so NV nguon cung cong nghe_Draft 1.docx`.  
- Quyết định kiến trúc `PO-DEC-20261110-01` & `PO-DEC-20261110-02` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 32 và `Specification/02_BASIC_DESIGN/TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING/README.md`.  
- Master Excel: `Tài liệu BA phần mềm Nacentwin 19.10.xlsx` — Sheet `HOME1`, Dòng `R48`–`R51` (E-Learning, Học liệu số, Kết nối chuyên gia tư vấn `R50`, Đào tạo tri thức cho Agent AI `R51`).  
- Bộ 30 kịch bản chi tiết chuẩn BA: `Specification/01_DATA_RAW/New temp/*.xlsx` (30 bài học thực chiến chuyên gia đứng giảng từ BÀI 02 đến BÀI 49).  
- Wireframe HTML tương tác: `Specification/XUAT_MAN_HINH_WEB_HTML/09_elearning_dao_tao.html`.  
- Hiến pháp Quản trị Đặc tả `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md` và Kỷ luật Zero-Mock & Hội tụ Đa bề mặt.  

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is - v1.0)**:
  - Phân hệ `TASK-10` v1.0 được thiết kế theo mô hình học liệu số 5 thành phần đơn giản: 1 video dài đơn lẻ (`.mp4 <= 1GB`), 1 bài trắc nghiệm cuối bài (10 câu hỏi), cẩm nang thực hành, phiếu tóm tắt và liên kết CSDL.
  - Phân loại bài học mới chỉ dựa trên 3 cấp độ chung chung (`TYPE_A`, `TYPE_B`, `TYPE_B_PLUS`), chưa gắn với các Cụm năng lực công nghệ chuyên biệt và chưa có lộ trình sư phạm phân tầng.
  - Học viên xem video thụ động, không có tương tác trực tiếp trong luồng phát video, không có không gian làm bài tập tình huống thực tế có đối chiếu chuyên gia, và thiếu thang đo định lượng tự đánh giá chất lượng bài toán công nghệ.
  - CSDL chưa có dữ liệu thực tế của 30 bài học đã được đội ngũ BA biên soạn công phu.
- **Yêu cầu & Đề xuất mới (Proposed State / To-Be - v1.1 theo PO-DEC-20261110-01 & PO-DEC-20261110-02)**:
  - Chuyển đổi toàn diện từ "Kho lưu trữ video học liệu thụ động" sang **"Không Gian Học Tập Tương Tác 8 Thành Phần (Interactive Learning Workbook)"** đồng bộ với Khung chương trình đào tạo số cấp quốc gia (QĐ 1993/QĐ-BKHCN & Báo cáo chuyên đề `Draft 1.docx`):
    1. Cấu trúc danh mục trọn vẹn gồm **50 video bài học** (kết hợp 30 video Chuyên gia đứng giảng `CG` và 20 video Đồ họa/Slide lồng tiếng `ĐH`) phân bổ vào **6 Cụm chuyên đề (Cụm A $\rightarrow$ Cụm F)**.
    2. Tổ chức kiến trúc 3 chiều (Lĩnh vực – Cấp độ – Nhu cầu) thành **8 Mô-đun năng lực (`M1`–`M8`, tổng 31 giờ học)**, đáp ứng **10 Chuẩn đầu ra (`CĐR1`–`CĐR10`)** và điều hướng theo **5 Lộ trình học chuyên biệt (`LT1`–`LT5`)**.
    3. Phân loại theo **3 Nhóm chức năng video**: `Định hướng công nghệ` (15 bài), `Giới thiệu công nghệ - Technology Spotlight` (10 bài), `Kỹ năng nghiệp vụ` (25 bài), kết hợp cấp độ kỹ năng (`Cơ bản CB`, `Trung cấp TC`, `Nâng cao NC`).
    4. Đối với 30 bài học Chuyên gia (`CG`): Mỗi bài học phân rã thành **Playlist 3 Micro-Videos** (Video X.1, X.2, X.3; 10–12 phút/bài) có thông tin kịch bản CALL SHEET (L1: Giảng viên toàn khung; L2: Slide toàn khung + Giảng viên góc; L3: Slide + Viết tay).
    5. Tích hợp tính năng **In-Video Pop-up Quiz (Q1–Q6)**: Trình phát tự động tạm dừng tại mốc giây chỉ định (`triggerSeconds`), học viên trả lời sai hiện giải thích và chọn lại, trả lời đúng mới mở khóa phát tiếp.
    6. **Không gian Thực hành trực tuyến** tích hợp **13 Biểu mẫu thực hành chuẩn (`BM01`–`BM13`)**, 3 câu tự luận tình huống thực tế có nút xem **Gợi ý đối chiếu của Chuyên gia**, và tích hợp **5 Công cụ Tự đánh giá trực tuyến (`TĐG01`–`TĐG05`)** với biểu đồ Radar Chart 5 trục.
    7. **Bảng Tự chấm điểm thực hành 7 tiêu chí** (thang 0–1–2, tổng 14 điểm). Khi đạt $\ge 11/14$ điểm, hệ thống tự động **mở khóa 2 nút CTA chiến lược**:
       * *"Gửi Chuyên gia phản biện"* (kết nối trực tiếp với Chuyên gia phụ trách cụm qua Trụ cột `R50` của `TASK-05`).
       * *"Tạo Hồ sơ Nhu cầu Công nghệ"* (chuyển đổi bài toán thực hành thành bài toán nhu cầu chính thức sang `TASK-03`).
    8. **Bảng Tóm tắt kiến thức cốt lõi** và **Khung Hỏi đáp thường gặp (8 câu FAQ/bài)**.
    9. Định vị rõ nét **4 Vai trò Chuyên gia** trong đào tạo: (1) Chuyên gia giảng dạy, (2) Chuyên gia phản biện học liệu, (3) Chuyên gia cố vấn (Mentor), (4) Chuyên gia tư vấn theo yêu cầu (`R50`).
    10. **Bài trắc nghiệm cuối bài** từ 5–10 câu với **ngưỡng đạt chuẩn $\ge 60\%$** (làm lại tối đa 3 lần, giải thích từng phương án và dẫn về video) và cấp **Chứng nhận hoàn thành trực tuyến của Viện Đổi mới sáng tạo Quốc gia (NACENTECH)** theo các lộ trình `LT1`–`LT5` (xếp loại Đạt, Khá, Xuất sắc).
    11. **Pipeline ETL nạp toàn bộ 30 bài học thực chiến** từ 30 file Excel chuẩn của BA vào PostgreSQL thật, sẵn sàng cấu trúc cho 20 bài ĐH, và tự động băm chunks nhúng vector 1024d vào `matching.search_chunks` huấn luyện Trợ lý ảo AI NacenTwin (`R51`).

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

#### [ADD] REQ-EL-009: Phân Loại 6 Cụm Chuyên Đề, 8 Mô-Đun Năng Lực (M1–M8) & 5 Lộ Trình Học (LT1–LT5)
1. Hệ thống MUST phân loại toàn bộ học liệu số theo 6 Cụm chuyên đề cốt lõi (Bảng 4.2 của `Draft 1.docx`):
   - `CLUSTER_A`: Nhận diện nhu cầu và bài toán công nghệ của doanh nghiệp (10 video: 1–10; 9 CG + 1 ĐH, thời lượng ≈ 106 phút). Lead Expert: *Nguyễn Hoàng Hiệp*.
   - `CLUSTER_B`: Tìm kiếm, khai thác và đánh giá nguồn cung công nghệ (10 video: 11–20; 4 CG + 6 ĐH, thời lượng ≈ 86 phút). Lead Expert: *Vũ Quang Sơn*.
   - `CLUSTER_C`: Lựa chọn, kết nối, thử nghiệm và tiếp nhận công nghệ (10 video: 21–30; 10 CG, thời lượng ≈ 110 phút). Lead Expert: *Bùi Diệu Linh*.
   - `CLUSTER_D`: Định hướng, xu hướng và lộ trình đổi mới công nghệ (6 video: 31–36; 4 CG + 2 ĐH, thời lượng ≈ 58 phút). Lead Expert: *Vũ Quang Sơn*.
   - `CLUSTER_E`: Technology Spotlight – giới thiệu các nhóm công nghệ tiêu biểu (10 video: 37–46; 1 CG + 9 ĐH, thời lượng ≈ 100 phút). Lead Expert: *Nguyễn Hoàng Hiệp*.
   - `CLUSTER_F`: Giao dịch công nghệ và bên cung công nghệ (4 video: 47–50; 2 CG + 2 ĐH, thời lượng ≈ 36 phút). Lead Expert: *Trương Đình Trang*.
2. Cung cấp bộ lọc theo 8 Mô-đun năng lực (`M1`–`M8`, tổng 31 giờ học) đáp ứng 10 Chuẩn đầu ra (`CĐR1`–`CĐR10`):
   - `M1` (3.0h, CB): Nền tảng về công nghệ, đổi mới công nghệ và hệ sinh thái cung – cầu (Video 1, 2, 11, 12, 31, 32).
   - `M2` (4.0h, CB): Chẩn đoán nhu cầu công nghệ và năng lực hấp thụ (Video 3–10).
   - `M3` (4.0h, TC): Tìm kiếm và khai thác dữ liệu nguồn cung công nghệ (Video 13–15, 19, 20, 47).
   - `M4` (3.0h, TC): TRL và đánh giá mức độ sẵn sàng công nghệ (Video 16, 17).
   - `M5` (5.0h, TC): Đánh giá, so sánh và lựa chọn công nghệ (Video 18, 21–25).
   - `M6` (3.0h, TC): Kết nối chuyên gia, nhà cung cấp và chuẩn bị chuyển giao (Video 26, 27, 48).
   - `M7` (5.0h, NC): PoC, pilot, tiếp nhận, giao dịch và quản trị rủi ro (Video 28–30, 49, 50).
   - `M8` (4.0h, NC): Lộ trình đổi mới công nghệ và dự án cuối khóa (Video 33–36; Spotlight 37–46).
3. Hỗ trợ điều hướng và ghi nhận tiến độ theo 5 Lộ trình học (`LT1`–`LT5`):
   - `LT1`: Lộ trình nền tảng (~6 giờ, M1 và M2 rút gọn; Video 1, 2, 7, 11, 12, 13, 16, 20, 31).
   - `LT2`: Lộ trình cho doanh nghiệp bên cầu (31 giờ, M1–M8; Video 1–36, 49, 50 và $\ge 2$ video Cụm E).
   - `LT3`: Lộ trình cho cán bộ hỗ trợ, tổ chức trung gian, Sở KH&CN (~29 giờ, M1–M7; Video 1–30, 47–50).
   - `LT4`: Lộ trình cho viện, trường, bên cung công nghệ (~20 giờ, M1, M3, M4, M6, M7; Video 11, 12, 14–18, 26–28, 47–50).
   - `LT5`: Lộ trình chuyên đề công nghệ tự chọn (2–6 giờ/khóa, Cụm D, E).
4. Phân loại theo 3 Nhóm chức năng video: `Định hướng công nghệ` (15 bài), `Giới thiệu công nghệ - Technology Spotlight` (10 bài), `Kỹ năng nghiệp vụ` (25 bài), kết hợp hình thức thể hiện (`CG` vs `ĐH`) và cấp độ (`CB`, `TC`, `NC`).

#### [ADD] REQ-EL-010: Khung 50 Bài Học (30 CG + 20 ĐH), Playlist 3 Micro-Videos & Trình Phát In-Video Pop-up Quiz
1. Cấu trúc danh mục học liệu số gồm đầy đủ 50 bài học:
   - 30 bài Chuyên gia đứng giảng (`CG`, thời lượng 10–12 phút/bài) được phân rã thành Playlist 3 Micro-Videos (`Video X.1`, `Video X.2`, `Video X.3`) phát qua HTTP 206 Partial Content, kèm kịch bản CALL SHEET (L1, L2, L3).
   - 20 bài Đồ họa/Slide lồng tiếng/Screencast (`ĐH`, thời lượng 6–8 phút hoặc 12–15 phút/bài) chuẩn bị sẵn cấu trúc đề cương 05 ý chính theo Phụ lục 1 của `Draft 1.docx`.
2. Tích hợp từ 1 đến 2 câu hỏi In-Video Quiz trên mỗi micro-video (tổng 6 câu Q1–Q6 / bài học CG).
3. Trình phát video client MUST tự động giám sát thời gian phát (`currentTime`); khi chạm mốc `triggerSeconds`, tự động `pause()` video và kích hoạt hiển thị Modal Pop-up Quiz phủ mờ màn hình.

#### [ADD] REQ-EL-011: Không Gian Thực Hành 13 Biểu Mẫu (BM01–BM13), 5 Công Cụ Tự Đánh Giá (TĐG01–TĐG05) & Bảng Tự Chấm Điểm 7 Tiêu Chí
1. Cung cấp không gian thực hành trực tuyến tích hợp hệ thống 13 Biểu mẫu thực hành chuẩn (`BM01`–`BM13`):
   - `BM01`: Phiếu chẩn đoán hiện trạng và nhu cầu công nghệ (Video 3, 4, 5).
   - `BM02`: Technology Need Brief – Bản mô tả nhu cầu công nghệ (Video 7, 8, 10).
   - `BM03`: Phiếu đánh giá năng lực hấp thụ công nghệ 4 trụ cột (Video 6).
   - `BM04`: Checklist đọc và kiểm chứng hồ sơ công nghệ (Video 15, 17).
   - `BM05`: Phiếu đánh giá TRL và bằng chứng mức sẵn sàng công nghệ (Video 16, 17).
   - `BM06`: Ma trận đánh giá, so sánh và lựa chọn công nghệ (Video 21–24).
   - `BM07`: Expert/Supplier Matching Brief – Đề xuất kết nối chuyên gia / nhà cung cấp (Video 26, 27).
   - `BM08`: Đề cương PoC/pilot và bảng KPI thử nghiệm (Video 28, 29).
   - `BM09`: Ma trận rủi ro tiếp nhận công nghệ (Video 25, 30).
   - `BM10`: Technology Action Plan – Kế hoạch hành động đổi mới công nghệ 6–12 tháng (Video 35, 36).
   - `BM11`: Hồ sơ công nghệ chuẩn hóa cho bên cung (Video 47, 48).
   - `BM12`: Checklist rà soát hợp đồng chuyển giao công nghệ và định giá (Video 49).
   - `BM13`: Bảng đối chiếu kênh hỗ trợ, điều kiện và hồ sơ đề xuất nguồn vốn (Video 50).
2. Tích hợp 5 Công cụ tự đánh giá trực tuyến (`TĐG01`–`TĐG05`):
   - `TĐG01`: Chẩn đoán mức sẵn sàng đổi mới công nghệ của DN (20–25 câu, Radar Chart 5 trục gợi ý lộ trình LT1–LT5).
   - `TĐG02`: Năng lực hấp thụ công nghệ (4 trụ cột thang 1–5).
   - `TĐG03`: Tự đánh giá TRL và bằng chứng mức độ sẵn sàng công nghệ.
   - `TĐG04`: Mức sẵn sàng thương mại hóa và độ hoàn thiện hồ sơ công nghệ.
   - `TĐG05`: Sẵn sàng giao dịch công nghệ (Pháp lý, SHTT, định giá, tài chính, tiếp nhận).
3. Cung cấp 3 câu tự luận tình huống thực tế cho phép học viên nhập phương án và bấm xem *"Gợi ý đối chiếu của Chuyên gia"*.
4. Bảng tự chấm điểm gồm đúng 7 tiêu chí định lượng (thang điểm 0–1–2/tiêu chí, tổng điểm tối đa 14 điểm).
5. Khi tổng điểm tự chấm đạt $\ge 11/14$ điểm, hệ thống MUST tự động mở khóa 2 nút Call-To-Action (CTA):
   - Nút 1: *"Gửi Chuyên gia phản biện"* kết nối luồng tư vấn của Chuyên gia phụ trách cụm (`TASK-05` / Trụ cột `R50`).
   - Nút 2: *"Tạo Hồ sơ Nhu cầu Công nghệ"* pre-fill thông tin bài thực hành sang Phân hệ Nhu cầu (`TASK-03`).

#### [ADD] REQ-EL-012: Pipeline ETL 30 Bài Học Thực Chiến, 4 Vai Trò Chuyên Gia, Đồng Bộ AI RAG & Chứng Nhận Số NACENTECH
1. Xây dựng dịch vụ ETL tự động trích xuất toàn bộ dữ liệu từ 30 file Excel (`Specification/01_DATA_RAW/New temp/*.xlsx`) nạp vào CSDL PostgreSQL 16:
   - 30 bản ghi bài học chính (`lms.learning_materials`) có gắn mã Cụm A–F, Mô-đun M1–M8, Lộ trình LT1–LT5.
   - 90 micro-videos (`lms.learning_micro_videos`).
   - 180 câu hỏi In-Video Quiz (`lms.learning_in_video_quizzes`).
   - 300 câu trắc nghiệm cuối bài (`lms.learning_quiz_questions`).
   - 210 tiêu chí tự chấm điểm (`lms.learning_practice_rubrics`).
   - 240 câu hỏi đáp FAQ (`lms.learning_faqs`).
   - 60 tệp tài liệu cẩm nang đính kèm (`.pdf` tóm tắt và `.docx` phiếu thực hành).
   - Cấu trúc sẵn sàng cho 20 bài ĐH bổ sung trong các đợt tiếp theo.
2. Thiết lập cơ chế định danh 4 vai trò chuyên gia: Giảng dạy, Phản biện học liệu, Cố vấn (Mentor SLA $\le 3$ ngày), và Tư vấn theo yêu cầu (`TASK-05`).
3. Khi bài học ở trạng thái `PUBLISHED`, tự động băm chunks văn bản tóm tắt, FAQ và nội dung thực hành để nhúng vector 1024 chiều vào bảng `matching.search_chunks` phục vụ Trợ lý ảo AI NacenTwin (`R51`).
4. Hệ thống cấp tự động Chứng nhận hoàn thành trực tuyến của Viện Đổi mới sáng tạo Quốc gia (NACENTECH) theo các lộ trình `LT1`–`LT5` khi học viên đạt các tiêu chí hoàn thành, tích hợp mã định danh và QR xác thực trực tuyến.

#### [ADD] BR-EL-07: Quy Tắc Dừng Hình & Khóa Video Chờ Trả Lời In-Video Quiz
- Khi Modal In-Video Quiz xuất hiện, video player bị vô hiệu hóa các nút điều khiển tua/tiếp tục (`pointer-events: none` hoặc locked controls).
- Nếu học viên chọn đáp án sai: Hiển thị hộp thông báo màu đỏ/vàng giải thích chi tiết lý do sai, xóa lựa chọn và yêu cầu học viên chọn lại; video tiếp tục bị khóa.
- Nếu học viên chọn đáp án đúng: Hiển thị thông báo chúc mừng màu xanh ngọc, hiển thị giải thích củng cố kiến thức, mở khóa nút *"Tiếp tục xem video"* và cho phép video phát tiếp.

#### [ADD] BR-EL-08: Quy Tắc Tự Chấm Điểm 7 Tiêu Chí & Kích Hoạt Mở Khóa CTA Kép
- Điểm mỗi tiêu chí chỉ nhận 1 trong 3 giá trị nguyên: `0` (Chưa đạt), `1` (Đạt một phần), `2` (Đạt rõ ràng và có thể kiểm tra). Tổng điểm $S = \sum_{i=1}^{7} p_i$ ($0 \le S \le 14$).
- Nếu $S < 11$: Hai nút CTA *"Gửi Chuyên gia phản biện"* và *"Tạo Hồ sơ Nhu cầu Công nghệ"* ở trạng thái vô hiệu hóa (disabled) kèm thông báo hướng dẫn: *"Cần đạt tối thiểu 11/14 điểm để mở khóa kết nối Chuyên gia hoặc niêm yết lên Sàn Nhu Cầu"*.
- Nếu $S \ge 11$: Kích hoạt trạng thái khả dụng cho cả 2 nút CTA, cho phép gửi dữ liệu nộp bài sang CSDL.

#### [ADD] BR-EL-09: Quy Tắc Đánh Giá Hoàn Thành Bài Học & Cấp Chứng Nhận Số NACENTECH
- Bài trắc nghiệm cuối bài gồm từ 5–10 câu hỏi (tối thiểu 50% câu hỏi tình huống). Ngưỡng đạt yêu cầu: $\ge 60\%$ (đúng tối thiểu 6/10 câu). Học viên được làm lại tối đa 3 lần; hệ thống hiển thị giải thích chi tiết cho từng phương án và dẫn link trực tiếp về đoạn video liên quan.
- Khi đạt $\ge 60\%$, hệ thống cập nhật `learner_progress.is_completed = true`, ghi nhận ngày hoàn thành `completed_at = DateTimeOffset.UtcNow` và tăng `learning_materials.completion_count += 1`.
- Cấp Chứng nhận số trực tuyến của Viện Đổi mới sáng tạo Quốc gia (NACENTECH) theo lộ trình `LT1`–`LT5` khi hoàn thành 100% bài học bắt buộc của lộ trình đó. Xếp loại: `Đạt` (70–79 điểm), `Khá` (80–89 điểm), `Xuất sắc` (90–100 điểm).

---

### 3. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Tác Động | Hiện Trạng Cũ (v1.0) | Đề Xuất Mới (v1.1 / CR-2026-028) | Trạng Thái Đồng Bộ |
| :--- | :--- | :--- | :---: |
| **Basic Design (`Specification`)** | LMS 5 thành phần đơn giản | Mục 32 & README.md TASK-10: 50 bài (30 CG + 20 ĐH), 6 Cụm, 8 Mô-đun (M1-M8), 5 Lộ trình (LT1-LT5), 13 Biểu mẫu (BM01-BM13), 5 TĐG, 4 vai trò chuyên gia, Chứng nhận NACENTECH | ✅ Đã đồng bộ |
| **Wireframe HTML (`Specification`)** | `09_elearning_dao_tao.html` chỉ có placeholder sơ khai | Viết lại hoàn chỉnh wireframe tương tác: Bộ lọc Lộ trình LT1-LT5, Mô-đun M1-M8, Chức năng video (Định hướng/Spotlight/Kỹ năng), Hình thức CG/ĐH, Chips 6 Cụm, Grid bài học, Player 3 micro-videos, Pop-up In-video quiz, Tab Thực hành BM01-BM13 & Tự chấm 7 tiêu chí, Tab TĐG01-TĐG05, Chứng nhận số | ✅ Đã đồng bộ |
| **Living Spec (`spec.md`)** | Version 1.0 (REQ-EL-001..008, BR-EL-01..06) | Bump Version 1.1: Bổ sung REQ-EL-009..012, BR-EL-07..09 (tích hợp đầy đủ M1-M8, LT1-LT5, BM01-BM13, TĐG01-TĐG05, 4 vai trò chuyên gia, Quiz 60% & Chứng nhận số), cập nhật Ma trận Truy vết Mục 7 | ✅ Đã hoàn tất (Gate 1 Pass) |
| **CSDL PostgreSQL (`lms.*`)** | 8 bảng schema đơn | Bổ sung migration: cột `cluster_code`, `step_number`, `module_code` (M1-M8), `delivery_format` (CG/DH), `function_group`, `level_code` (CB/TC/NC), bảng `learning_micro_videos`, `learning_in_video_quizzes`, `learning_practice_rubrics`, `lms.learning_faqs`, `lms.learner_practice_evaluations` | ✅ Đã hoàn tất (Gate 2/3 Pass) |
| **Backend API (.NET Core 10)** | DTOs & Services video đơn lẻ | Mở rộng DTOs, Controllers và tạo ETL Service nạp 50 bài học thực tế (`EL-001`..`EL-050`), hỗ trợ lọc M1-M8, LT1-LT5, micro-videos, in-video quiz, nộp bài thực hành BM/TĐG & cấp chứng nhận | ✅ Đã hoàn tất (Gate 2/3 Pass) |
| **Frontend Public (`/elearning`)** | Chỉ lọc 3 loại bài A/B/B+ | Nâng cấp bộ lọc đa chiều: 5 Lộ trình LT1-LT5, 8 Mô-đun M1-M8, 6 Cụm A-F, Hình thức CG/ĐH, hiển thị 50 bài học với huy hiệu chuẩn hóa | ✅ Đã hoàn tất (Gate 3/4 Pass) |
| **Frontend Classroom (`/elearning/[id]`)** | 1 video đơn, thiếu thực hành & tự chấm | Playlist 3 micro-videos có Call Sheet, Player tạm dừng bật In-video Quiz, Tab Thực hành BM01-BM13, Tab Tự đánh giá TĐG01-TĐG05, Bảng tự chấm 7 tiêu chí mở CTA kép, Tab Tóm tắt, Tab FAQ, 4 vai trò chuyên gia | ✅ Đã hoàn tất (Gate 3/4 Pass) |
| **Kiểm Thử 4 Tầng** | Test suites video đơn và quiz 10 câu | Thêm test case cho In-video quiz lock, Rubric 7 tiêu chí ngưỡng 11/14, Quiz 60%, ETL 50 bài, Chứng nhận số và E2E Playwright (379/379 checks PASS 100%, phát hiện & sửa triệt để 9 bugs) | ✅ Đã hoàn tất (Gate 4/5 Pass) |

---

### 4. Lộ Trình Triển Khai Phân Kỳ (Implementation Roadmap)

- **Đợt 1 (Wave 1 - Basic Design & Spec Delta Gate 1)**: Hoàn tất đồng bộ Basic Design, Wireframe HTML, khởi tạo Delta Ledger `CR-2026-028` và cập nhật living `spec.md` v1.1 tích hợp toàn bộ các điểm của PO-DEC-20261110-01 và PO-DEC-20261110-02.
- **Đợt 2 (Wave 2 - Plan Delta & Backend Architecture Gate 2)**: Cập nhật `plan.md`, tạo EF Core Migration mở rộng schema `lms.*`, bổ sung DTOs/Services và script ETL nạp 30 bài học.
- **Đợt 3 (Wave 3 - Tasks Delta, Frontend UI/UX & QC Verification Gate 3–5)**: Phân rã `tasks.md`, thi công UI Next.js 15, tích hợp In-Video Quiz, Không gian thực hành BM01–BM13, Bảng tự chấm 7 tiêu chí, cấp Chứng nhận số, chạy kiểm thử 4 tầng đạt 100% Green.
