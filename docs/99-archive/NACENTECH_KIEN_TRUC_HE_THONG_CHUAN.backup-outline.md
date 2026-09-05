---
title: "KIẾN TRÚC HỆ THỐNG NACENTECH"
subtitle: "Tài liệu kiến trúc chuẩn phục vụ lập kế hoạch triển khai"
author: "Cơ quan chủ trì: NacenTech — Đơn vị vận hành: NacenX"
date: "02/09/2026"
lang: "vi-VN"
---

Tài liệu này mô tả duy nhất kiến trúc hiện hành của hệ thống NacenTech. Tài liệu không trình bày lịch sử thay đổi, không so sánh phiên bản và không coi mọi năng lực nêu trong kiến trúc là chức năng phải triển khai đồng thời.

Nền tảng sử dụng ASP.NET Core trên .NET 10 hỗ trợ dài hạn, triển khai ban đầu theo kiến trúc nguyên khối phân hệ và chuyển đổi cuốn chiếu từ hệ thống NacenTwin hiện có.

---

## 1. Kết luận kiến trúc

NacenTech không phải là một trang danh mục công nghệ và cũng không phải một sàn tự phục vụ. Hệ thống là hạ tầng quản lý toàn bộ vòng đời một nhu cầu đổi mới sáng tạo hoặc thương mại hóa công nghệ, từ khi xác định bài toán cho đến khi kết quả được kiểm chứng.

Đơn vị nghiệp vụ trung tâm là hồ sơ thương mại hóa. Mọi công nghệ, chuyên gia, tổ chức nghiên cứu, phòng thử nghiệm, nguồn vốn, hợp đồng và bằng chứng đều tham gia phục vụ một hồ sơ cụ thể. Chúng không được tổ chức thành các sàn rời rạc thiếu người chịu trách nhiệm.

NacenTech giữ vai trò phía Nhà nước:

- xác lập định hướng, chuẩn dùng chung và yêu cầu vì lợi ích công;
- giám sát đơn vị vận hành;
- phê duyệt những chính sách thuộc thẩm quyền;
- điều phối quan hệ với cơ quan, chương trình và nguồn dữ liệu nhà nước;
- bảo đảm khả năng thay đơn vị vận hành khi cần.

NacenX giữ vai trò đơn vị vận hành:

- phát triển và vận hành hệ thống;
- tiếp nhận, điều phối và theo dõi hồ sơ;
- tổ chức mạng chuyên gia và đối tác;
- cung cấp dịch vụ thương mại theo hợp đồng;
- quản lý bằng chứng, tiến độ và cam kết mức dịch vụ;
- xuất hóa đơn và thu phí cho các dịch vụ hợp pháp của mình.

NacenX không có thẩm quyền ban hành chính sách nhà nước, cấp chứng nhận, quyết định tài trợ, quyết định mua sắm công, phê duyệt tín dụng hoặc tự xác nhận kết quả do chính mình thực hiện.

Kiến trúc được tổ chức theo nguyên tắc:

> Một bài toán — một hồ sơ — một người điều phối chính — một chuỗi quyết định — một bộ bằng chứng — một kết quả được kiểm chứng.

Hệ thống sử dụng mô hình lõi ổn định, cấu hình có phiên bản và mở rộng bằng phân hệ hoặc bộ kết nối. Toàn bộ năng lực dài hạn được giữ trong kiến trúc, nhưng mỗi lần triển khai chỉ kích hoạt những năng lực có người trả tiền, người chịu trách nhiệm, căn cứ pháp lý, đối tác thực hiện và tiêu chí nghiệm thu rõ ràng.

---

## 2. Mục tiêu và giới hạn

### 2.1 Mục tiêu

Hệ thống phải giúp:

- biến vấn đề của doanh nghiệp hoặc cơ quan thành nhu cầu có thể xử lý;
- xác định chủ sở hữu vấn đề, người có quyền quyết định và đường ngân sách;
- tìm công nghệ, chuyên gia và hạ tầng phù hợp;
- tổ chức thẩm định kỹ thuật, thị trường, quyền sở hữu trí tuệ và khả năng tiếp nhận;
- thiết kế thử nghiệm có mục tiêu, số liệu gốc và điều kiện nghiệm thu;
- kết nối nguồn hỗ trợ, tổ chức tài chính và khách hàng mua thử;
- quản lý thỏa thuận, mốc công việc, bằng chứng và nghĩa vụ;
- hỗ trợ chuyển giao, đào tạo và đưa công nghệ vào vận hành;
- đo kết quả sau 6, 12 và 24 tháng;
- cung cấp số liệu tổng hợp phục vụ quản lý và hoạch định chính sách theo đúng thẩm quyền.

### 2.2 Phạm vi nghiệp vụ

Phạm vi bao gồm:

- tiếp nhận và xác nhận nhu cầu;
- chuẩn hóa hồ sơ công nghệ;
- điều phối viên công nghệ và mạng chuyên gia;
- tìm kiếm và đề xuất phương án;
- thẩm định, định giá và rà soát chuyên sâu;
- phòng dữ liệu và quản lý quyền truy cập;
- thiết kế thỏa thuận và hợp đồng;
- thử nghiệm, chuyển giao và nghiệm thu;
- kết nối tài chính và chương trình hỗ trợ;
- vận hành sau chuyển giao;
- dịch vụ chuyên môn;
- bảo đảm chuyển đổi số và đổi mới sáng tạo;
- kết nối địa phương và quốc tế;
- quản lý bằng chứng và báo cáo kết quả.

### 2.3 Những việc hệ thống không thực hiện

Hệ thống không:

- tự cấp chứng nhận, giấy phép hoặc quyết định công nhận;
- tự quyết định cấp vốn, cho vay, bảo lãnh hoặc đầu tư;
- trực tiếp giữ tiền của khách hàng;
- tự sở hữu công nghệ chỉ vì công nghệ được đưa lên hệ thống;
- bảo đảm mọi công nghệ đều thương mại hóa thành công;
- bán thứ hạng ưu tiên, kết luận thẩm định hoặc quyền tiếp cận dữ liệu mật;
- thay cơ quan đăng ký sở hữu trí tuệ, cơ quan mua sắm, quỹ, ngân hàng, phòng thử nghiệm hoặc tổ chức chứng nhận;
- cho trí tuệ nhân tạo tự lựa chọn nhà cung cấp, tự ký hợp đồng hoặc tự nghiệm thu;
- xây một hệ thống riêng cho từng tỉnh hoặc từng khách hàng;
- mở đồng thời mọi ngành, mọi dịch vụ và mọi kết nối chỉ để tạo cảm giác hệ thống có nhiều chức năng.

---

## 3. Mô hình tổ chức và phân vai

### 3.1 Các bên tham gia

| Bên tham gia | Trách nhiệm chính |
|---|---|
| NacenTech | Định hướng, chuẩn, giám sát, yêu cầu vì lợi ích công và quan hệ liên cơ quan |
| NacenX | Phát triển, vận hành, điều phối hồ sơ và cung cấp dịch vụ thương mại |
| Doanh nghiệp có nhu cầu | Xác nhận bài toán, dữ liệu gốc, ngân sách, người quyết định và tiếp nhận kết quả |
| Chủ sở hữu công nghệ | Cung cấp bằng chứng về quyền, năng lực, điều kiện chuyển giao và hỗ trợ |
| Đơn vị chuyển giao công nghệ | Chuẩn hóa tài sản, làm rõ quyền và phối hợp thương mại hóa |
| Chuyên gia | Cung cấp ý kiến, sản phẩm chuyên môn hoặc năng lực thực hiện theo phạm vi được giao |
| Tổ chức thẩm định độc lập | Đưa ra kết luận theo nhiệm vụ, phạm vi và tiêu chuẩn độc lập |
| Phòng thử nghiệm hoặc tổ chức chứng nhận | Thực hiện hoạt động trong đúng phạm vi được công nhận hoặc chỉ định |
| Quỹ, ngân hàng và tổ chức tài chính | Quyết định tài trợ, tín dụng, bảo lãnh hoặc sản phẩm tài chính |
| Cơ quan nhà nước | Thực hiện thẩm quyền quản lý, phê duyệt, mua sắm hoặc công nhận theo pháp luật |
| Trung tâm địa phương | Tiếp nhận nhu cầu, hỗ trợ thực hiện và cung cấp năng lực chuyên ngành tại địa bàn |
| Đối tác quốc tế | Cung cấp công nghệ, chuyên gia, hạ tầng và hỗ trợ bản địa hóa |

### 3.2 Tách quyền bắt buộc

Các quyền sau không được giao cho cùng một chủ thể nếu có xung đột:

- đặt chính sách và vận hành chính sách;
- cung cấp giải pháp và thẩm định độc lập giải pháp đó;
- nhận tiền và tự xác nhận điều kiện thanh toán;
- điều phối hồ sơ và tự xác nhận kết quả cuối;
- tư vấn chuẩn bị hồ sơ và ban hành quyết định công nhận;
- quản trị hệ thống và tự cấp thẩm quyền nghiệp vụ.

Mọi trường hợp kiêm nhiệm phải có căn cứ rõ ràng, công khai quan hệ lợi ích, người phê duyệt độc lập và dấu vết kiểm tra.

### 3.3 Thỏa thuận vận hành nền tảng

Quan hệ NacenTech và NacenX phải được ràng buộc bằng thỏa thuận vận hành, tối thiểu gồm:

- phạm vi nhiệm vụ và thẩm quyền;
- cam kết mức dịch vụ;
- cách tính và công khai mức phí;
- vai trò đối với dữ liệu;
- quyền sở hữu và quyền sử dụng phần mềm;
- yêu cầu an toàn, kiểm tra và xử lý sự cố;
- quyền truy cập mã nguồn, bản dựng, khóa và bản sao lưu;
- quyền can thiệp tạm thời khi đơn vị vận hành không đáp ứng;
- điều kiện chấm dứt và chuyển giao cho đơn vị kế nhiệm.

---

## 4. Nguyên tắc thiết kế

1. Bắt đầu từ nhu cầu thật, không bắt đầu từ danh mục công nghệ.
2. Mỗi hồ sơ có một điều phối viên chính và thời hạn xử lý.
3. Mọi quyết định quan trọng phải có người chịu trách nhiệm.
4. Thành công được đo bằng thỏa thuận, thử nghiệm, chuyển giao và kết quả, không đo bằng số tài khoản hoặc lượt xem.
5. Hệ thống giữ nguồn sự thật về quy trình; dữ liệu chuyên ngành vẫn thuộc nguồn có thẩm quyền.
6. Mọi dữ liệu từ bên ngoài phải có nguồn, thời điểm, quyền sử dụng và dấu vết thay đổi.
7. Quyền truy cập được cấp theo nhiệm vụ, mục đích và thời hạn.
8. Trí tuệ nhân tạo chỉ hỗ trợ; quyền quyết định vẫn thuộc con người hoặc cơ quan có thẩm quyền.
9. Hệ thống được mở rộng theo bằng chứng về nhu cầu và hiệu quả kinh tế.
10. Không cải thiện lợi nhuận bằng cách hạ chuẩn an toàn, độc lập hoặc liêm chính.
11. Không sao chép hệ thống theo địa phương; dùng chung lõi và cấu hình theo phạm vi.
12. Tích hợp bên ngoài không được làm mất khả năng vận hành độc lập của lõi.
13. Chuyển đổi hệ thống theo từng phần, không viết lại toàn bộ một lần.
14. Mọi khả năng quan trọng phải kiểm thử được và kiểm tra lại được.

---

## 5. Đơn vị nghiệp vụ trung tâm

### 5.1 Hồ sơ thương mại hóa

Hồ sơ thương mại hóa là đối tượng trung tâm xuyên suốt hệ thống. Một hồ sơ tối thiểu có:

- mã định danh ổn định;
- tổ chức có nhu cầu;
- chủ sở hữu vấn đề;
- người có quyền quyết định;
- bản mô tả nhu cầu đang có hiệu lực;
- loại giao dịch;
- điều phối viên chính;
- giai đoạn hiện tại;
- chính sách áp dụng đã được đóng băng;
- các bên tham gia;
- danh sách nghĩa vụ;
- tài liệu và quyền truy cập;
- lịch sử quyết định;
- nguồn tài chính dự kiến;
- tiêu chí kết quả;
- trạng thái kết thúc và lý do.

### 5.2 Quy tắc bất biến

Hệ thống phải bảo đảm:

- không thể xác nhận hồ sơ khi thiếu chủ sở hữu vấn đề, người quyết định hoặc đường ngân sách;
- không thể chuyển giai đoạn khi thiếu bằng chứng bắt buộc;
- không được xóa hoặc sửa ngầm quyết định cũ;
- thay đổi phạm vi phải tạo bản mới và ghi lý do;
- một hồ sơ chỉ có một giai đoạn có hiệu lực tại một thời điểm;
- tài liệu mật không tự động mở cho mọi người tham gia hồ sơ;
- người cung cấp giải pháp không được tự xác nhận kết quả của chính mình;
- mọi khoản phí phải gắn với thỏa thuận và điều kiện phát sinh rõ ràng.

### 5.3 Hồ sơ dịch vụ độc lập

Những nhu cầu không phải giao dịch công nghệ không được ép vào hồ sơ thương mại hóa. Hệ thống sử dụng hồ sơ dịch vụ riêng cho:

- tuyển dụng hoặc bố trí lãnh đạo công nghệ bán thời gian;
- tư vấn ISO, hợp chuẩn, hợp quy hoặc chuẩn bị hồ sơ công nhận;
- chẩn đoán chuyển đổi số độc lập;
- dịch vụ vận hành định kỳ không gắn một giao dịch công nghệ cụ thể.

Các hồ sơ dịch vụ có thể dẫn đến hồ sơ thương mại hóa khi xuất hiện nhu cầu thử nghiệm, chuyển giao hoặc mua giải pháp thật.

---

## 6. Các loại giao dịch

### 6.1 Giải quyết bài toán bằng thử nghiệm

Áp dụng khi doanh nghiệp hoặc cơ quan có một bài toán cần tìm giải pháp.

Kết quả tối thiểu:

- bài toán và số liệu gốc được xác nhận;
- danh sách phương án phù hợp;
- thỏa thuận thử nghiệm;
- tiêu chí nghiệm thu;
- báo cáo kết quả độc lập;
- quyết định triển khai, điều chỉnh hoặc dừng.

### 6.2 Chuyển giao công nghệ

Áp dụng khi có nhu cầu mua, nhận chuyển giao hoặc cấp quyền sử dụng công nghệ và bí quyết.

Kết quả tối thiểu:

- quyền sở hữu và quyền chuyển giao được làm rõ;
- phạm vi quyền sử dụng;
- điều kiện tài chính;
- kế hoạch bàn giao;
- tài liệu, đào tạo và hỗ trợ;
- bằng chứng tiếp nhận và vận hành.

### 6.3 Sử dụng hạ tầng và năng lực dùng chung

Áp dụng khi doanh nghiệp cần phòng thử nghiệm, thiết bị, chuyên gia hoặc dịch vụ nghiên cứu.

Kết quả tối thiểu:

- phạm vi dịch vụ;
- năng lực và điều kiện sử dụng;
- thỏa thuận dịch vụ;
- sản phẩm bàn giao;
- kết quả được xác nhận.

### 6.4 Các lớp hỗ trợ dùng chung

Ba loại giao dịch cùng sử dụng:

- mạng địa phương;
- hợp tác quốc tế;
- kết nối cơ quan nhà nước;
- mạng chuyên gia;
- phòng dữ liệu;
- tài chính và chương trình hỗ trợ;
- vận hành sau chuyển giao;
- quản lý bằng chứng.

Các lớp hỗ trợ không tạo thêm loại giao dịch mới.

---

## 7. Vòng đời hồ sơ và cổng kiểm soát

### 7.1 Các giai đoạn

| Giai đoạn | Mục đích | Điều kiện ra |
|---|---|---|
| Tiếp nhận | Ghi nhận vấn đề và nguồn yêu cầu | Có tổ chức, người liên hệ và mô tả ban đầu |
| Xác nhận nhu cầu | Làm rõ vấn đề, mục tiêu, người quyết định và đường ngân sách | Nhu cầu được người có thẩm quyền xác nhận |
| Tìm kiếm phương án | Tìm công nghệ, chuyên gia hoặc hạ tầng | Có danh sách phương án và lý do |
| Trao đổi có kiểm soát | Cho phép các bên làm rõ thông tin | Có cam kết bảo mật và quyền truy cập phù hợp |
| Thẩm định | Đánh giá kỹ thuật, quyền, thị trường, tài chính và rủi ro | Có báo cáo và khuyến nghị |
| Thiết kế thỏa thuận | Chốt phạm vi, giá, trách nhiệm, quyền và kết quả | Có bản thiết kế giao dịch được phê duyệt |
| Ký kết | Hoàn tất thỏa thuận | Chữ ký và điều kiện có hiệu lực đầy đủ |
| Thực hiện | Thử nghiệm, cung cấp dịch vụ hoặc chuyển giao | Các mốc được thực hiện và ghi bằng chứng |
| Xác minh kết quả | So sánh kết quả với số liệu gốc và mục tiêu | Có kết luận của người xác minh phù hợp |
| Theo dõi sau thực hiện | Đo khả năng vận hành và giá trị dài hạn | Có số liệu 6, 12 hoặc 24 tháng |
| Kết thúc | Đóng hồ sơ hoặc dừng có lý do | Nghĩa vụ còn lại được xử lý hoặc chuyển giao |

### 7.2 Quyết định chuyển giai đoạn

Mỗi lần chuyển giai đoạn phải ghi:

- giai đoạn cũ và giai đoạn mới;
- người yêu cầu;
- người phê duyệt;
- chính sách áp dụng;
- bằng chứng được sử dụng;
- điều kiện chưa hoàn tất;
- thời gian;
- lý do.

Hai yêu cầu chuyển giai đoạn đồng thời chỉ được chấp nhận một yêu cầu. Yêu cầu còn lại phải nhận được thông báo xung đột và dữ liệu hiện hành.

### 7.3 Tạm dừng và mở lại

Hồ sơ phải tạm dừng khi:

- thiếu người chịu trách nhiệm;
- quyền sở hữu trí tuệ chưa rõ;
- có xung đột lợi ích chưa xử lý;
- dữ liệu hoặc quyền truy cập không hợp lệ;
- nguồn vốn không còn;
- yêu cầu pháp lý chưa được làm rõ;
- có sự cố an toàn nghiêm trọng.

Mở lại hồ sơ cần quyết định mới, người chịu trách nhiệm và bằng chứng đã xử lý nguyên nhân.

---

## 8. Kiến trúc tổng thể

Hệ thống được chia thành sáu lớp.

### 8.1 Lớp người sử dụng

- cổng doanh nghiệp;
- cổng đơn vị cung cấp công nghệ;
- bàn làm việc của điều phối viên;
- bàn làm việc của chuyên gia;
- bàn vận hành sau chuyển giao;
- cổng đối tác địa phương và quốc tế;
- cổng quản trị và giám sát.

### 8.2 Lớp nghiệp vụ

- nhu cầu;
- công nghệ;
- hồ sơ thương mại hóa;
- chuyên gia;
- tìm kiếm và thẩm định;
- phòng dữ liệu;
- thỏa thuận;
- thực hiện và kết quả;
- tài chính và chương trình;
- dịch vụ chuyên môn;
- vận hành sau chuyển giao.

### 8.3 Lớp dùng chung

- định danh và phân quyền;
- thông báo và trao đổi;
- tài liệu;
- lập lịch;
- quản lý cấu hình;
- quản lý biểu mẫu;
- sổ kiểm tra;
- báo cáo.

### 8.4 Lớp dữ liệu và trí tuệ nhân tạo

- cơ sở dữ liệu giao dịch;
- kho tệp;
- chỉ mục tìm kiếm;
- kho tri thức được phép sử dụng;
- công cụ gợi ý và trích xuất;
- bộ kiểm thử chất lượng mô hình;
- kho báo cáo tổng hợp.

### 8.5 Lớp tích hợp

- cơ sở dữ liệu nhà nước;
- tổ chức tài chính;
- phòng thử nghiệm và tổ chức chứng nhận;
- ký số;
- hóa đơn;
- thư điện tử, Zalo và lịch;
- đối tác địa phương và quốc tế.

### 8.6 Lớp hạ tầng

- máy chủ ứng dụng;
- cơ sở dữ liệu;
- hàng đợi xử lý;
- kho tệp;
- quản lý khóa và bí mật;
- giám sát;
- sao lưu và phục hồi;
- bảo vệ mạng.

---

## 9. Các miền nghiệp vụ

| Miền nghiệp vụ | Trách nhiệm |
|---|---|
| Định danh | Cá nhân, tổ chức, thành viên và vai trò |
| Chính sách | Chính sách, cấu hình, điều kiện và phạm vi áp dụng |
| Nhu cầu | Vấn đề doanh nghiệp, mô tả nhu cầu, xác nhận và danh mục sáng kiến |
| Công nghệ | Tài sản công nghệ, bằng chứng quyền và gói chuyển giao |
| Điều phối | Phân công điều phối viên, thời hạn và hàng đợi công việc |
| Chuyên gia | Hồ sơ, năng lực, chứng chỉ, nhiệm vụ và sản phẩm chuyên môn |
| Dịch vụ chuyên môn | Nhiệm vụ tư vấn, yêu cầu, lộ trình thủ tục và sản phẩm bàn giao |
| Nhân lực công nghệ | Nhu cầu tuyển dụng, bố trí bán thời gian và nhóm chuyên gia |
| Mạng đối tác | Nút đối tác, năng lực, giới thiệu hồ sơ và hành lang hợp tác |
| Tìm kiếm | Lọc, xếp hạng có giải thích và danh sách phương án |
| Trao đổi | Lời mời, hội thoại, tin nhắn và trạng thái gửi |
| Phòng dữ liệu | Tài liệu, quyền truy cập, cam kết bảo mật và nhật ký đọc |
| Thẩm định | Nhiệm vụ, báo cáo, kết luận và ý kiến định giá |
| Hồ sơ thương mại hóa | Giai đoạn, các bên, quyết định và nghĩa vụ |
| Thỏa thuận | Điều khoản, hợp đồng và trạng thái ký |
| Thực hiện | Kế hoạch, mốc công việc, sản phẩm và bằng chứng |
| Kết quả | Mục tiêu, tuyên bố, xác minh và theo dõi |
| Vận hành sau chuyển giao | Kế hoạch áp dụng, vấn đề vận hành, đào tạo và giữ năng lực |
| Tài chính | Nhu cầu vốn, hồ sơ giới thiệu và trạng thái từ đối tác |
| Chương trình | Thách thức, điều kiện, hạn mức và phân bổ |
| Liên kết công | Nhiệm vụ liên cơ quan, bài toán công, kết quả nghiên cứu và phản hồi chính sách |
| Tính phí | Thỏa thuận phí, hóa đơn, thanh toán tham chiếu và phân chia |
| Tích hợp | Bộ kết nối, nhận dữ liệu, gửi dữ liệu và đối soát |
| Báo cáo | Dữ liệu đọc, chỉ số và báo cáo tổng hợp |
| Kiểm tra | Nhật ký bất biến và kiểm tra tính toàn vẹn |

Mỗi miền sở hữu dữ liệu và quy tắc của mình. Miền khác chỉ gọi qua giao diện nghiệp vụ công khai, không ghi trực tiếp vào bảng dữ liệu của nhau.

---

## 10. Kiến trúc cấu hình và mở rộng

### 10.1 Bốn lớp thay đổi

| Lớp | Cách thay đổi | Nội dung |
|---|---|---|
| Bất biến lõi | Sửa mã nguồn, kiểm tra kiến trúc và kiểm thử | Giai đoạn, giao dịch, thẩm quyền, phân quyền, tiền, bằng chứng, kiểm tra và giới hạn trí tuệ nhân tạo |
| Cấu hình có phiên bản | Kiểm tra cấu trúc, chạy thử, phê duyệt và đặt thời điểm hiệu lực | Ngành, tiêu chí, biểu mẫu, bằng chứng, thời hạn, mức phí và năng lực được bật |
| Phân hệ mở rộng | Bổ sung theo hợp đồng nội bộ và cổng kích hoạt | Chuyên gia, dịch vụ chuyên môn, vận hành sau chuyển giao, tài chính, liên kết công |
| Bộ kết nối | Kết nối qua giao diện, hàng đợi và đối soát | Ngân hàng, quỹ, phòng thử nghiệm, cơ sở dữ liệu, ký số, địa phương và quốc tế |

Nguyên tắc bắt buộc:

> Viết chắc các bất biến; cấu hình hóa điểm thay đổi; mở rộng bằng phân hệ và bộ kết nối.

### 10.2 Bốn mức kích hoạt năng lực

| Mức | Ý nghĩa |
|---|---|
| Lõi phải có | Luôn bật để bảo đảm tính toàn vẹn của hồ sơ |
| Thử nghiệm khi có nhu cầu | Chỉ bật khi có người trả tiền, người phụ trách, đối tác và tiêu chí nghiệm thu |
| Mở rộng sau khi có bằng chứng | Chỉ bật sau khi có khách hàng mua lại, kết quả và hiệu quả kinh tế |
| Để dành | Có trong kiến trúc dài hạn nhưng chưa nằm trong phạm vi phát triển hoặc ngân sách |

Một năng lực có trong tài liệu không đồng nghĩa năng lực đó phải xuất hiện trên màn hình hoặc được phép gọi trong môi trường vận hành.

### 10.3 Hồ sơ cấu hình

Mỗi tổ chức, nút địa phương, chương trình hoặc ngành được gắn với một hồ sơ cấu hình có:

- mã và số thứ tự bản cấu hình;
- phạm vi tổ chức, ngành và chương trình;
- danh sách năng lực theo bốn mức kích hoạt;
- chính sách và bộ cấu hình được tham chiếu;
- người phê duyệt;
- thời điểm bắt đầu và hết hiệu lực;
- bản cấu hình dùng để quay lại khi có sự cố.

Sau khi công bố, bản cấu hình không được sửa. Thay đổi phải tạo bản mới.

### 10.4 Quy trình quản lý cấu hình

Trạng thái cấu hình gồm:

1. Soạn thảo.
2. Kiểm tra cấu trúc.
3. Chạy thử trên dữ liệu mẫu.
4. Phê duyệt.
5. Lập lịch kích hoạt.
6. Có hiệu lực.
7. Bị thay thế hoặc thu hồi.

Thay đổi quan trọng về điều kiện xác nhận nhu cầu, mức phí, quyền truy cập, thời hạn lưu dữ liệu hoặc hành động của trí tuệ nhân tạo cần hai cấp phê duyệt phù hợp.

### 10.5 Những việc cấu hình không được phép làm

Cấu hình không được:

- tạo thẩm quyền mới;
- bỏ qua phân quyền;
- tạo loại giao dịch hoặc trạng thái tùy ý;
- sửa quyết định đã đóng băng;
- thay đổi số tiền sau khi phát sinh điều kiện tính phí;
- chạy câu lệnh dữ liệu tùy ý;
- cấp thêm công cụ cho trí tuệ nhân tạo ngoài danh sách cho phép;
- bỏ qua yêu cầu về nguồn, bằng chứng hoặc kiểm tra;
- mở chức năng cho tổ chức không thuộc phạm vi.

### 10.6 Không sao chép theo địa phương hoặc khách hàng

Mọi địa phương và khách hàng sử dụng cùng mã nguồn, cấu trúc dữ liệu chuẩn và giao diện tích hợp. Khác biệt được thể hiện bằng:

- hồ sơ cấu hình;
- chính sách;
- trường mở rộng có cấu trúc;
- biểu mẫu;
- bộ kết nối;
- quyền và phạm vi dữ liệu.

Trường hợp phải dùng cơ sở dữ liệu vật lý riêng vì yêu cầu pháp lý hoặc an toàn vẫn phải tuân thủ cùng cấu trúc chuẩn, quy trình nâng cấp và bộ kiểm tra tương thích.

### 10.7 Bộ kết nối và phương án dự phòng

Mọi kết nối bên ngoài phải:

- có tổ chức sở hữu;
- có mục đích và căn cứ sử dụng dữ liệu;
- chống xử lý trùng;
- có giới hạn thời gian và số lần thử lại;
- lưu dấu vết yêu cầu và phản hồi;
- đối soát được;
- có phương án ngắt;
- có cách xử lý thủ công khi hệ thống nguồn không sẵn sàng.

Khi chưa có giao diện kết nối, hệ thống sử dụng tài liệu hoặc tệp xuất có chữ ký, mã kiểm tra, thời điểm và nguồn rõ ràng. Hệ thống không được tự giả lập quyết định của bên ngoài.

---

## 11. Mô hình dữ liệu cốt lõi

### 11.1 Định danh và tổ chức

| Đối tượng | Nội dung chính |
|---|---|
| Tổ chức | Định danh pháp lý, loại hình, chủ sở hữu và trạng thái xác minh |
| Cá nhân | Định danh, thông tin liên hệ, sự đồng ý và trạng thái |
| Thành viên tổ chức | Quan hệ cá nhân với tổ chức, chức danh và hiệu lực |
| Phân công vai trò | Quyền theo nền tảng, chương trình, hồ sơ và thời hạn |
| Ràng buộc vai trò vận hành | Gắn NacenTech và NacenX vào đúng vai trò, phạm vi và căn cứ |
| Hồ sơ cấu hình năng lực | Năng lực được bật, phạm vi, hiệu lực và người phê duyệt |
| Bộ cấu hình | Nội dung có cấu trúc, nguồn, bản thay đổi, chạy thử và thời điểm hiệu lực |
| Tuyên bố xung đột lợi ích | Quan hệ, lợi ích, phạm vi và cách xử lý |

### 11.2 Nhu cầu

| Đối tượng | Nội dung chính |
|---|---|
| Nhu cầu | Định danh ổn định của bài toán |
| Bản nhu cầu | Vấn đề, số liệu gốc, mục tiêu, ràng buộc, người quyết định và đường ngân sách |
| Đầu mối vấn đề | Yêu cầu thô từ biểu mẫu, thư, Zalo hoặc cuộc họp |
| Danh mục sáng kiến | Sáng kiến, người bảo trợ, giá trị kỳ vọng, chi phí, rủi ro và quyết định tiếp theo |
| Quyết định xác nhận | Người xác nhận, bằng chứng và lý do đạt hoặc không đạt |

### 11.3 Công nghệ

| Đối tượng | Nội dung chính |
|---|---|
| Tài sản công nghệ | Sáng chế, bí quyết, sản phẩm, quy trình hoặc năng lực |
| Gói công nghệ | Mô tả, mức sẵn sàng, trường hợp sử dụng, yêu cầu triển khai và hỗ trợ |
| Bằng chứng quyền | Chủ sở hữu, quyền khai thác, giấy phép, hạn chế và nguồn |
| Hồ sơ nguồn | Hệ thống nguồn, mã ngoài, thời điểm, mã kiểm tra và quyền sử dụng |
| Dịch vụ năng lực | Dịch vụ phòng thử nghiệm, chuyên gia hoặc thiết bị, kèm điều kiện và mức giá |

Một gói công nghệ chỉ được đánh dấu sẵn sàng giao dịch khi:

- chủ sở hữu và quyền khai thác rõ;
- bằng chứng mức sẵn sàng phù hợp;
- phạm vi chuyển giao xác định được;
- yêu cầu triển khai và hỗ trợ được mô tả;
- hạn chế pháp lý và dữ liệu được khai báo;
- có đầu mối chịu trách nhiệm.

### 11.4 Chuyên gia

| Đối tượng | Nội dung chính |
|---|---|
| Hồ sơ chuyên gia | Định danh ổn định gắn với cá nhân |
| Bản hồ sơ chuyên gia | Chuyên ngành, kinh nghiệm, ngành, khu vực, ngôn ngữ và cách cung cấp dịch vụ |
| Chứng chỉ và bằng chứng | Nơi cấp, phạm vi, hiệu lực và tài liệu xác minh |
| Dịch vụ chuyên gia | Loại dịch vụ, thời gian đáp ứng, mức giá và điều kiện |
| Yêu cầu chuyên gia | Vai trò, phạm vi, sản phẩm, thời hạn, ngân sách và chứng chỉ bắt buộc |
| Lần tìm chuyên gia | Tập ứng viên, điều kiện loại, lý do phù hợp và kiểm tra xung đột |
| Nhiệm vụ chuyên gia | Vai trò, mục đích, hồ sơ liên quan, quyền truy cập, thỏa thuận và trạng thái |
| Sản phẩm chuyên gia | Nội dung, điều kiện chấp nhận, tài liệu và trạng thái nghiệm thu |
| Lịch sử có bằng chứng | Dữ liệu tổng hợp từ nhiệm vụ đã hoàn thành, không phải đánh giá tự khai |

### 11.5 Thẩm định và thực hiện

| Đối tượng | Nội dung chính |
|---|---|
| Nhiệm vụ thẩm định | Phạm vi, câu hỏi, người thực hiện, xung đột và điều kiện độc lập |
| Báo cáo thẩm định | Phương pháp, nguồn, giả định, hạn chế, kết luận và chữ ký |
| Bản thiết kế giao dịch | Giá, quyền, nghĩa vụ, phân bổ rủi ro và điều kiện |
| Thỏa thuận | Loại hợp đồng, các bên, nội dung đóng băng và trạng thái ký |
| Kế hoạch thực hiện | Công việc, người phụ trách, thời hạn và phụ thuộc |
| Mốc công việc | Điều kiện nghiệm thu, giá trị, hạn và trạng thái |
| Gói bằng chứng | Nguồn, người tạo, thời gian, mã kiểm tra và mức bảo mật |
| Định nghĩa kết quả | Chỉ số, số liệu gốc, mục tiêu, cách đo và người xác minh |
| Kết luận kết quả | Đạt, đạt một phần, không đạt hoặc chưa đủ cơ sở |

### 11.6 Tài chính và tính phí

| Đối tượng | Nội dung chính |
|---|---|
| Nhu cầu vốn | Mục đích, giá trị, loại tiền và thời điểm |
| Hồ sơ giới thiệu tài chính | Đối tác, sự đồng ý, mã tham chiếu và trạng thái ngoài |
| Chương trình | Đơn vị bảo trợ, điều kiện, hạn mức và thời hạn |
| Phân bổ hỗ trợ | Hồ sơ, khoản chi đủ điều kiện và trạng thái |
| Thỏa thuận phí | Người trả, căn cứ tính, mức, trần và điều kiện phát sinh |
| Phân chia phí | Bên nhận, tỷ lệ hoặc giá trị và căn cứ |
| Tham chiếu hóa đơn | Số hóa đơn, đơn vị phát hành và trạng thái |
| Tham chiếu thanh toán | Mã ngân hàng hoặc đơn vị thanh toán và trạng thái |

Mọi giá trị tiền phải có loại tiền. Giá trị quy đổi phải giữ nguyên số tiền gốc, tỷ giá, nguồn tỷ giá và thời điểm.

### 11.7 Quy tắc tạo bản mới

Những nội dung sau không được sửa trực tiếp sau khi có hiệu lực:

- nhu cầu đã xác nhận;
- gói công nghệ đã công bố;
- chính sách áp dụng cho hồ sơ;
- yêu cầu và tiêu chí thẩm định;
- tiêu chí thử nghiệm;
- bản thiết kế giao dịch;
- điều kiện tính phí;
- định nghĩa kết quả;
- báo cáo và kết luận đã ký.

Thay đổi phải tạo bản mới, liên kết bản cũ và ghi quyết định cho phép thay đổi.

---

## 12. Tiếp nhận và xác nhận nhu cầu

### 12.1 Kênh tiếp nhận

Nhu cầu có thể đến từ:

- cổng thông tin;
- biểu mẫu trực tuyến;
- Zalo;
- thư điện tử;
- cuộc họp;
- trung tâm địa phương;
- chương trình thách thức;
- tổ chức ngành nghề;
- cơ quan nhà nước;
- kết quả khảo sát của điều phối viên.

Mọi kênh phải tạo cùng một bản ghi đầu mối để không mất dấu nguồn.

### 12.2 Thông tin tối thiểu

Một nhu cầu chỉ được xác nhận khi có:

- vấn đề cụ thể;
- người sử dụng hoặc bộ phận chịu ảnh hưởng;
- số liệu gốc hoặc cách thu số liệu;
- kết quả mong muốn;
- mức độ cấp thiết;
- người chịu trách nhiệm;
- người có quyền quyết định;
- khả năng cung cấp địa điểm, dữ liệu và nhân lực;
- đường ngân sách hoặc người có quyền bố trí ngân sách;
- quyền sử dụng dữ liệu đưa vào hệ thống.

### 12.3 Phân loại kết quả tiếp nhận

| Kết quả | Cách xử lý |
|---|---|
| Đủ điều kiện | Tạo hồ sơ thương mại hóa và phân công điều phối viên |
| Cần bổ sung | Giao danh sách thông tin thiếu và thời hạn |
| Chuyển dịch vụ chuyên môn | Tạo hồ sơ dịch vụ độc lập |
| Chuyển chương trình hỗ trợ | Giới thiệu theo điều kiện và thẩm quyền |
| Từ chối | Ghi lý do, không xóa dữ liệu gốc |
| Để theo dõi | Chưa có ngân sách hoặc người quyết định, không đưa vào chỉ số hồ sơ đủ điều kiện |

### 12.4 Bàn đổi mới sáng tạo của doanh nghiệp

Doanh nghiệp có thể sử dụng một không gian làm việc để:

- ghi nhận vấn đề;
- quản lý danh mục sáng kiến;
- theo dõi quyết định;
- yêu cầu chuyên gia;
- xem tiến độ hồ sơ;
- quản lý tài liệu và bằng chứng;
- nhận cảnh báo về nghĩa vụ và kết quả;
- theo dõi chi phí và giá trị.

Trí tuệ nhân tạo có thể giúp tóm tắt, đặt câu hỏi và phát hiện thông tin thiếu, nhưng không được tự xác nhận nhu cầu hoặc mở thủ tục mua sắm.

---

## 13. Nguồn cung công nghệ và đơn vị chuyển giao

### 13.1 Chuẩn hóa tài sản công nghệ

Mỗi công nghệ cần được mô tả theo:

- vấn đề giải quyết;
- người sử dụng mục tiêu;
- mức sẵn sàng;
- bằng chứng kỹ thuật;
- quyền sở hữu và quyền chuyển giao;
- thành phần được bàn giao;
- yêu cầu hạ tầng;
- dữ liệu cần sử dụng;
- yêu cầu tích hợp;
- đào tạo và hỗ trợ;
- chi phí dự kiến;
- thời gian đưa vào vận hành;
- hạn chế và rủi ro.

### 13.2 Bàn làm việc của đơn vị chuyển giao

Đơn vị chuyển giao công nghệ có thể:

- quản lý danh mục tài sản;
- kiểm tra hồ sơ quyền;
- đóng gói công nghệ;
- trả lời yêu cầu làm rõ;
- theo dõi cơ hội;
- tham gia thẩm định;
- chuẩn bị điều kiện chuyển giao;
- theo dõi nghĩa vụ và doanh thu từ quyền sở hữu trí tuệ.

### 13.3 Kiểm soát chất lượng nguồn cung

Không đưa công nghệ vào danh sách đề xuất chính thức khi:

- quyền sở hữu chưa rõ;
- bằng chứng kỹ thuật chỉ là tuyên bố;
- người cung cấp không có khả năng hỗ trợ;
- chi phí triển khai bị bỏ trống;
- không làm rõ dữ liệu hoặc an toàn;
- không có phương án bàn giao;
- công nghệ không phù hợp mức sẵn sàng mà nhu cầu yêu cầu.

### 13.4 Kết quả nghiên cứu dùng ngân sách nhà nước

Kết quả nghiên cứu dùng ngân sách chỉ được đưa vào thương mại hóa khi có:

- thông tin nghiệm thu từ nguồn có thẩm quyền;
- tổ chức chủ trì và chủ sở hữu;
- căn cứ khai thác tài sản và quyền sở hữu trí tuệ;
- hạn chế sử dụng;
- người có quyền thương lượng;
- gói chuyển giao;
- doanh nghiệp tiếp nhận hoặc bài toán phù hợp.

Hệ thống không sao chép toàn bộ cơ sở dữ liệu nhiệm vụ nghiên cứu. Hệ thống lưu mã tham chiếu, bản chụp có thời điểm và dấu vết nguồn.

---

## 14. Mạng chuyên gia

### 14.1 Nhóm vai trò

| Vai trò | Trách nhiệm |
|---|---|
| Chuyên gia ngành | Hiểu vấn đề, thị trường, quy trình và khả năng tiếp nhận |
| Chuyên gia kỹ thuật | Đánh giá giải pháp, thiết kế và điều kiện triển khai |
| Chuyên gia phòng thử nghiệm | Thực hiện đo, thử hoặc phân tích chuyên ngành |
| Chuyên gia sở hữu trí tuệ | Rà soát quyền, phạm vi sử dụng và rủi ro |
| Chuyên gia định giá | Đưa ra ý kiến định giá theo nhiệm vụ |
| Chuyên gia pháp lý | Xác định yêu cầu pháp lý và hợp đồng |
| Người thẩm định độc lập | Đưa kết luận không phụ thuộc bên cung cấp |
| Người xác minh kết quả | Xác nhận kết quả theo phương pháp đã thống nhất |
| Lãnh đạo công nghệ bán thời gian | Đồng hành quản trị và triển khai trong một thời kỳ |

### 14.2 Kiểm tra trước khi giao nhiệm vụ

Hệ thống phải kiểm tra:

- danh tính;
- chứng chỉ và phạm vi;
- thời hạn hiệu lực;
- kinh nghiệm phù hợp;
- khả năng nhận việc;
- hạn chế từ đơn vị sử dụng lao động;
- quan hệ lợi ích;
- vai trò đã thực hiện trong cùng hồ sơ;
- trách nhiệm nghề nghiệp và bảo hiểm khi cần.

### 14.3 Quyền truy cập

Chuyên gia chỉ được xem tài liệu:

- thuộc đúng nhiệm vụ;
- phục vụ đúng mục đích;
- trong thời gian được giao;
- sau khi hoàn tất cam kết bảo mật;
- không bị hạn chế bởi xung đột lợi ích.

Việc là thành viên hồ sơ không tự tạo quyền đọc toàn bộ phòng dữ liệu.

### 14.4 Bàn điều hành chuyên gia

Mỗi chuyên gia có thể sử dụng không gian riêng để:

- nhận và sàng lọc yêu cầu;
- quản lý lịch;
- chuẩn bị phạm vi và báo giá;
- theo dõi thỏa thuận;
- quản lý sản phẩm bàn giao;
- theo dõi hóa đơn;
- lưu tri thức được phép sử dụng;
- chăm sóc khách hàng.

Trí tuệ nhân tạo chỉ làm việc trong phạm vi tri thức, chính sách thương lượng và quyền đại diện của chuyên gia. Dữ liệu của chuyên gia này không được dùng cho chuyên gia khác nếu thiếu quyền.

### 14.5 Dịch vụ nhân lực công nghệ

NacenX có thể cung cấp:

- chuyên gia theo nhu cầu;
- lãnh đạo công nghệ bán thời gian;
- tìm kiếm nhân sự công nghệ cấp cao;
- nhóm chuyên gia thực hiện nhiệm vụ;
- thẩm định kỹ thuật độc lập.

Dịch vụ tuyển dụng hoặc cung ứng nhân lực chỉ được kích hoạt sau khi xác định đúng loại hình pháp lý, giấy phép, hợp đồng, thuế, bảo hiểm, sở hữu trí tuệ và trách nhiệm lao động.

---

## 15. Dịch vụ chuyên môn và bảo đảm chuyển đổi số

### 15.1 Dịch vụ chuyên môn

Danh mục có thể bao gồm:

- đánh giá và định giá công nghệ;
- rà soát kỹ thuật, thị trường và sở hữu trí tuệ;
- xây dựng và áp dụng hệ thống quản lý ISO;
- xây dựng tiêu chuẩn cơ sở;
- chuẩn bị hợp chuẩn, hợp quy và công bố sản phẩm;
- chuẩn bị hồ sơ doanh nghiệp khoa học và công nghệ;
- chuẩn bị hồ sơ doanh nghiệp công nghệ cao;
- rà soát an toàn, môi trường, dữ liệu và an ninh mạng;
- duy trì nghĩa vụ và theo dõi thời hạn.

### 15.2 Ba tầng trách nhiệm

| Tầng | Sản phẩm | Chủ thể chịu trách nhiệm |
|---|---|---|
| Tư vấn và chuẩn bị | Lộ trình, đánh giá khoảng cách, quy trình, kế hoạch khắc phục và dự thảo hồ sơ | Chuyên gia hoặc tổ chức tư vấn |
| Đánh giá độc lập | Thử nghiệm, giám định, đánh giá hoặc chứng nhận | Tổ chức hoặc người đủ điều kiện |
| Công nhận chính thức | Giấy phép, chứng nhận, công nhận hoặc quyết định hành chính | Cơ quan hoặc tổ chức có thẩm quyền |

NacenX mặc định chỉ tư vấn, chuẩn bị và điều phối. NacenX không được quảng cáo là đơn vị cấp ISO, cấp hợp quy hoặc công nhận doanh nghiệp khoa học và công nghệ nếu không có thẩm quyền riêng.

### 15.3 Bảo đảm chuyển đổi số và đổi mới sáng tạo

NacenX đóng vai trò trung gian điều phối và bảo đảm chất lượng quyết định, không mặc định là đơn vị tổng thầu công nghệ.

Sản phẩm gồm:

- văn phòng chuyển đổi số và đổi mới sáng tạo thuê ngoài;
- chẩn đoán năng lực số;
- xây dựng lộ trình;
- rà soát kiến trúc;
- thẩm định phương án và nhà cung cấp;
- tìm giải pháp đến thử nghiệm;
- lãnh đạo chuyển đổi số hoặc công nghệ bán thời gian;
- quản lý thực hiện và quản trị thay đổi;
- hỗ trợ áp dụng sau triển khai;
- rà soát quản trị dữ liệu và trí tuệ nhân tạo.

### 15.4 Ba thời điểm thẩm định chuyển đổi số

1. Trước đầu tư: kiểm tra vấn đề, yêu cầu, phương án tự làm hoặc mua, tổng chi phí, khả năng rút lui, dữ liệu, an toàn và khả năng tiếp nhận.
2. Trong thử nghiệm: đóng băng số liệu gốc, mục tiêu, dữ liệu thử, cách đo và điều kiện nghiệm thu trước khi thực hiện.
3. Sau triển khai: đo mức sử dụng, năng suất, chất lượng, chi phí, doanh thu, rủi ro và giá trị sau 6 hoặc 12 tháng.

### 15.5 Tách tư vấn, thực hiện và xác minh

Trong cùng một phạm vi:

- bên tư vấn có thể giúp xác định yêu cầu;
- bên cung cấp có thể triển khai giải pháp;
- bên xác minh độc lập phải tách khỏi bên cung cấp;
- mọi khoản giới thiệu, bán lại hoặc hoa hồng từ nhà cung cấp phải được công khai;
- người thẩm định không được nhận khoản tiền phụ thuộc vào việc một nhà cung cấp được chọn hoặc kết luận thuận lợi;
- tiêu chí và trọng số phải được đóng băng trước khi biết kết quả.

### 15.6 Gói triển khai ưu tiên

Gói ưu tiên là văn phòng chuyển đổi số và đổi mới sáng tạo cho doanh nghiệp sản xuất:

1. Thu thập số liệu gốc.
2. Chọn tối đa ba bài toán có người chịu trách nhiệm và đường ngân sách.
3. Xác định mục tiêu và cách đo.
4. Tìm chuyên gia và công nghệ.
5. Thẩm định phương án.
6. Thực hiện một thử nghiệm trả phí.
7. Quyết định triển khai hoặc dừng.
8. Hỗ trợ áp dụng, đào tạo và xử lý vấn đề.
9. Đo giá trị sau 6 và 12 tháng.

Không cam kết chuyển đổi toàn diện ngay từ đầu. Phạm vi đầu tiên chỉ nên là một địa điểm hoặc một nhóm quy trình.

---

## 16. Tìm kiếm, thẩm định và định giá

### 16.1 Tìm kiếm theo ba bước

1. Loại các phương án không đạt điều kiện bắt buộc.
2. Chấm mức phù hợp theo tiêu chí có giải thích.
3. Điều phối viên và người có thẩm quyền rà soát danh sách trước khi gửi lời mời.

Điều kiện bắt buộc có thể gồm:

- quyền chuyển giao;
- ngành và mục đích sử dụng;
- mức sẵn sàng;
- khu vực và yêu cầu lưu dữ liệu;
- thời hạn;
- năng lực cung cấp;
- chứng chỉ;
- mức ngân sách;
- xung đột lợi ích.

### 16.2 Giải thích kết quả

Mỗi phương án phải nêu:

- tiêu chí đạt;
- tiêu chí chưa rõ;
- bằng chứng được dùng;
- dữ liệu đã hết hạn;
- lý do bị loại;
- số thứ tự bản quy tắc và mô hình;
- điều chỉnh của con người.

Không bán vị trí trong danh sách và không để bên trả phí làm thay đổi thứ tự bí mật.

### 16.3 Thẩm định

Nội dung thẩm định có thể gồm:

- kỹ thuật;
- mức sẵn sàng;
- khả năng tích hợp;
- an toàn và dữ liệu;
- quyền sở hữu trí tuệ;
- thị trường;
- năng lực của bên cung cấp;
- tổng chi phí;
- khả năng vận hành và bảo trì;
- khả năng tiếp nhận của doanh nghiệp;
- rủi ro và phương án thoát.

### 16.4 Định giá

Hệ thống chỉ hỗ trợ quy trình định giá:

- xác định mục đích;
- chọn phương pháp;
- thu thập nguồn;
- ghi giả định;
- phân tích kịch bản;
- rà soát độc lập;
- ký báo cáo.

Kết luận định giá thuộc người hoặc tổ chức có nhiệm vụ phù hợp, không thuộc thuật toán.

---

## 17. Phòng dữ liệu, sở hữu trí tuệ và hợp đồng

### 17.1 Phòng dữ liệu

Tài liệu được quản lý theo:

- hồ sơ;
- nhóm tài liệu;
- bản tài liệu;
- mức bảo mật;
- chủ sở hữu;
- mục đích sử dụng;
- người nhận;
- thời hạn;
- quyền xem, tải hoặc chia sẻ;
- mã kiểm tra;
- nhật ký truy cập.

Tệp đính kèm trong hội thoại chỉ là tham chiếu đến tài liệu trong phòng dữ liệu. Khi quyền bị thu hồi, tin nhắn cũ không còn mở được tệp.

### 17.2 Bảo vệ thông tin

Hệ thống hỗ trợ:

- cam kết bảo mật;
- đánh dấu nhận diện người xem;
- hạn chế tải xuống;
- thời hạn truy cập;
- ghi nhận việc chia sẻ ra ngoài;
- mã hóa;
- khóa riêng theo tài liệu nhạy cảm;
- hủy khả năng giải mã khi có yêu cầu hợp lệ;
- giữ lại dấu vết kiểm tra cần thiết.

### 17.3 Quyền sở hữu trí tuệ

Trước khi thiết kế giao dịch phải xác định:

- chủ sở hữu;
- người có quyền thương lượng;
- loại quyền;
- phạm vi địa lý;
- lĩnh vực sử dụng;
- độc quyền hoặc không độc quyền;
- quyền cải tiến;
- quyền đối với dữ liệu;
- nghĩa vụ bảo mật;
- quyền cấp lại;
- điều kiện chấm dứt;
- hạn chế từ nguồn ngân sách hoặc hợp đồng trước.

### 17.4 Hợp đồng

Hợp đồng phải tham chiếu đúng bản đã đóng băng của:

- nhu cầu;
- gói công nghệ;
- phạm vi;
- giá và loại tiền;
- tiêu chí nghiệm thu;
- định nghĩa kết quả;
- kế hoạch thực hiện;
- trách nhiệm các bên;
- quyền dữ liệu và sở hữu trí tuệ;
- điều kiện thay đổi;
- điều kiện kết thúc.

Hệ thống không tự ký thay các bên. Chữ ký được thực hiện qua dịch vụ ký số hoặc được ghi nhận từ nguồn hợp lệ.

---

## 18. Thử nghiệm, chuyển giao và vận hành sau chuyển giao

### 18.1 Thiết kế thử nghiệm

Trước khi bắt đầu phải có:

- vấn đề;
- số liệu gốc;
- mục tiêu;
- phạm vi;
- địa điểm;
- dữ liệu thử;
- bên cung cấp;
- người phụ trách phía tiếp nhận;
- điều kiện nghiệm thu;
- cách đo;
- người xác minh;
- ngân sách;
- thời gian;
- cách xử lý thay đổi;
- phương án dừng.

### 18.2 Quản lý mốc công việc

Mỗi mốc có:

- sản phẩm phải giao;
- tiêu chí chấp nhận;
- người nộp;
- người kiểm tra;
- người phê duyệt;
- thời hạn;
- giá trị thanh toán nếu có;
- bằng chứng;
- trạng thái;
- lịch sử làm lại.

Không xóa bằng chứng không đạt. Việc làm lại phải tạo lần nộp mới.

### 18.3 Xác minh kết quả

Kết quả được phân biệt:

- bên thực hiện tự báo cáo;
- hệ thống quan sát;
- chuyên gia rà soát;
- bên độc lập xác minh;
- cơ quan có thẩm quyền công nhận.

Các trạng thái này không được gộp thành một nhãn chung.

### 18.4 Chuyển giao

Chuyển giao chỉ được coi là hoàn tất khi có đủ thành phần theo hợp đồng:

- quyền sử dụng;
- tài liệu kỹ thuật;
- mã nguồn hoặc cấu hình nếu có;
- dữ liệu và cấu trúc dữ liệu;
- bí quyết;
- đào tạo;
- tiêu chí năng lực;
- phụ tùng và bảo trì;
- đầu mối hỗ trợ;
- kế hoạch kết thúc hỗ trợ;
- bằng chứng bên nhận có thể vận hành.

Mua thiết bị hoặc tham dự đào tạo riêng lẻ không tự được coi là chuyển giao công nghệ.

### 18.5 Bàn vận hành sau chuyển giao

Dịch vụ sau chuyển giao có thể kéo dài từ 6 đến 24 tháng, gồm:

- đưa quy trình vào sử dụng;
- đào tạo và hướng dẫn;
- theo dõi mức sử dụng;
- quản lý vấn đề;
- theo dõi cam kết của bên cung cấp;
- theo dõi chỉ số;
- đánh giá năng lực còn lại;
- chuẩn bị bàn giao hoàn toàn cho doanh nghiệp.

Người vận hành sau chuyển giao không được là người duy nhất xác minh kết quả của chính dịch vụ mình cung cấp.

---

## 19. Tài chính, chương trình hỗ trợ và liên kết cơ quan nhà nước

### 19.1 Kết nối tài chính

Hệ thống hỗ trợ:

- xác định nhu cầu vốn;
- chuẩn bị hồ sơ;
- xin sự đồng ý chia sẻ dữ liệu;
- giới thiệu đến đối tác;
- theo dõi trạng thái;
- ghi nhận quyết định từ nguồn;
- đối soát cam kết và giải ngân.

Quyết định tín dụng, bảo lãnh hoặc đầu tư luôn thuộc đối tác tài chính. Điều kiện sơ bộ không được hiển thị như phê duyệt.

### 19.2 Chương trình hỗ trợ

Mỗi chương trình phải có:

- đơn vị có thẩm quyền;
- mục tiêu;
- đối tượng;
- điều kiện;
- hạn mức;
- khoản chi đủ điều kiện;
- phương pháp lựa chọn;
- mốc thanh toán;
- người xác minh;
- thời hạn;
- cách xử lý tài sản và kết quả khi kết thúc.

Hệ thống chống sử dụng cùng một khoản chi hoặc cùng một bằng chứng để nhận hỗ trợ trùng.

### 19.3 Sổ theo dõi tách biệt

Phải tách:

- nguồn và khoản chi chương trình công;
- doanh thu dịch vụ thương mại của NacenX;
- khoản thu hộ, chi hộ;
- phí của chuyên gia và đối tác;
- tiền doanh nghiệp đóng góp;
- đóng góp không bằng tiền.

Không được dùng doanh thu gộp hoặc giá trị cam kết để làm tăng giả hiệu quả tài chính.

### 19.4 Mạng liên kết cơ quan nhà nước

Mạng liên kết có nhiệm vụ nối:

- bài toán công và nhu cầu doanh nghiệp;
- kết quả nhiệm vụ khoa học và công nghệ;
- sở hữu trí tuệ;
- tiêu chuẩn, đo lường và chất lượng;
- nguồn vốn và ưu đãi;
- khách hàng mua thử;
- thử nghiệm có kiểm soát;
- vận hành và phản hồi chính sách.

Hệ thống chỉ điều phối quy trình và bằng chứng. Cơ quan, quỹ, cơ sở dữ liệu, phòng thử nghiệm và đơn vị mua vẫn giữ nguồn dữ liệu và thẩm quyền của mình.

### 19.5 Nhiệm vụ liên cơ quan

Mỗi kết nối cơ quan phải xác định:

- cơ quan;
- vai trò cung cấp nguồn, quyết định, thực hiện hoặc giám sát;
- mục đích;
- trường dữ liệu;
- hành động được phép;
- thời hạn;
- cam kết xử lý;
- người chịu trách nhiệm;
- cách thu hồi;
- cách kết thúc.

Tài khoản quản trị hệ thống không được bỏ qua giới hạn này.

### 19.6 Ba chuỗi ưu tiên

1. Kết quả nghiên cứu đã nghiệm thu đến doanh nghiệp tiếp nhận.
2. Tiêu chuẩn, đo lường, thử nghiệm và đánh giá sự phù hợp đến khả năng tiếp cận thị trường.
3. Bài toán của cơ quan hoặc doanh nghiệp nhà nước đến thử nghiệm trả phí và quyết định mua riêng.

Không mở kết nối liên cơ quan đại trà trước khi ba chuỗi trên tạo kết quả thật trong một ngành.

---

## 20. Mạng địa phương và hợp tác quốc tế

### 20.1 Mạng địa phương

Một trung tâm địa phương tham gia theo năng lực cụ thể:

- tiếp nhận nhu cầu;
- điều phối;
- chuyên gia;
- phòng thử nghiệm;
- hỗ trợ doanh nghiệp;
- chương trình;
- kết nối mua thử;
- theo dõi sau chuyển giao.

Năng lực có phạm vi, mức, bằng chứng, thời hạn và kỳ rà soát. Không công nhận chung một tổ chức cho mọi ngành và mọi vai trò.

### 20.2 Nguyên tắc một lõi dùng chung

- không xây 34 nền tảng riêng;
- không yêu cầu mọi địa phương có cùng mô hình tổ chức;
- một địa phương có thể dùng năng lực của vùng khác;
- một hồ sơ chỉ có một mã, một giai đoạn và một điều phối viên chính;
- đơn vị địa phương chỉ đọc dữ liệu cần thiết cho nhiệm vụ;
- kết quả được ghi vào cùng hồ sơ.

### 20.3 Giới thiệu hồ sơ qua mạng

Quy trình gồm:

1. Chỉ gửi thông tin tối thiểu.
2. Nút nhận kiểm tra năng lực và xung đột.
3. Chấp nhận hoặc từ chối có lý do.
4. Cấp quyền truy cập theo nhiệm vụ.
5. Phân công người phối hợp.
6. Theo dõi thời hạn và bàn giao.

Không tạo bản sao hồ sơ tại nút gửi và nút nhận.

### 20.4 Hợp tác quốc tế

Hợp tác quốc tế là lớp bổ sung cho giao dịch hiện có, bao gồm:

- tìm công nghệ;
- kiểm tra quyền chuyển giao;
- kiểm soát hạn chế xuất khẩu và sử dụng;
- đánh giá khả năng tiếp nhận tại Việt Nam;
- bản địa hóa;
- đồng tài trợ;
- thử nghiệm;
- chuyển giao bí quyết;
- đào tạo;
- hỗ trợ vận hành.

### 20.5 Điều kiện mở một hành lang hợp tác

Chỉ mở khi có:

- nhu cầu đã xác nhận;
- doanh nghiệp Việt Nam tiếp nhận;
- đối tác có năng lực;
- quyền và hạn chế sơ bộ rõ;
- người phụ trách hai phía;
- nguồn chi trả;
- kế hoạch bản địa hóa;
- cách đo kết quả.

Biên bản ghi nhớ, chuyến khảo sát hoặc danh mục công nghệ không được tính là kết quả.

### 20.6 Dữ liệu xuyên biên giới

Dữ liệu mặc định lưu tại Việt Nam. Truy cập từ nước ngoài phải ghi:

- người nhận;
- quốc gia;
- mục đích;
- tài liệu và bản cụ thể;
- căn cứ;
- thời điểm;
- thời hạn;
- trạng thái thu hồi hoặc xác nhận xóa.

---

## 21. Mô hình doanh thu và hiệu quả kinh tế

### 21.1 Nguyên tắc

NacenX bán năng lực thực hiện, điều phối, trách nhiệm và kết quả; không bán nội dung do trí tuệ nhân tạo tạo ra, quyền truy cập danh mục hoặc ảnh hưởng đến quyết định công.

Doanh thu được chia thành:

- hợp đồng định kỳ;
- phí dự án hoặc mốc công việc;
- phí theo kết quả có trần;
- dịch vụ thử nghiệm quy mô nhỏ.

Nguồn thu nền phải là hợp đồng định kỳ. Phí theo kết quả chỉ là phần bổ sung.

### 21.2 Sản phẩm ưu tiên

| Sản phẩm | Người trả tiền | Cách thu |
|---|---|---|
| Văn phòng chuyển đổi số và đổi mới sáng tạo thuê ngoài | Doanh nghiệp, hiệp hội, chương trình hoặc trung tâm | Hợp đồng 6–12 tháng, cam kết mức dịch vụ và số hồ sơ |
| Chẩn đoán và tìm công nghệ đến thử nghiệm | Doanh nghiệp có bài toán và ngân sách | Phí chẩn đoán, thẩm định và mốc thử nghiệm |
| Chuyên gia và lãnh đạo công nghệ theo nhu cầu | Doanh nghiệp hoặc chương trình | Phí nhiệm vụ hoặc phí định kỳ |
| Dịch vụ chuyên môn | Doanh nghiệp, viện, trường hoặc chương trình | Phí đánh giá, mốc tư vấn và duy trì |
| Vận hành sau chuyển giao | Doanh nghiệp tiếp nhận hoặc đơn vị bảo trợ | Phí định kỳ 6–24 tháng |
| Văn phòng thương mại hóa thuê ngoài | Viện, trường và chủ sở hữu công nghệ | Phí năm, phí đóng gói và phí kết quả có trần |
| Vận hành chương trình thử thách | Doanh nghiệp lớn hoặc đơn vị bảo trợ | Phí quản lý, phí hồ sơ và mốc nghiệm thu |
| Điều phối công nghệ quốc tế | Doanh nghiệp hoặc chương trình | Phí đánh giá, điều phối và mốc công việc |

### 21.3 Chi phí trên một hồ sơ

Chi phí phải tính đủ:

- giờ điều phối ở mọi giai đoạn;
- giờ chuyên gia và người rà soát;
- tìm kiếm;
- thu thập và làm sạch dữ liệu;
- công cụ và trí tuệ nhân tạo;
- liên lạc;
- đi lại;
- làm lại;
- hồ sơ không thành công;
- dự phòng trách nhiệm;
- chi phí thu tiền;
- chi phí trực tiếp khác.

Không chỉ tính chi phí của hồ sơ thành công.

### 21.4 Phần đóng góp của một dịch vụ

Phần đóng góp bằng doanh thu được ghi nhận trừ toàn bộ chi phí trực tiếp và dự phòng liên quan. Khoản thu hộ cho chuyên gia, phòng thử nghiệm, nhà cung cấp hoặc cơ quan không phải doanh thu của NacenX.

Sau đó mới phân bổ chi phí cố định để tính kết quả đầy đủ. Một khoản chi chỉ được tính một lần.

### 21.5 Cổng mở rộng

Một dòng dịch vụ chỉ được mở rộng khi:

- có ít nhất ba nhiệm vụ trả tiền từ hai người trả tiền;
- có ít nhất một lần mua lại, gia hạn hoặc mua giai đoạn tiếp theo;
- sản phẩm được chấp nhận theo tiêu chí;
- phần đóng góp dương;
- thời gian thu tiền trong giới hạn;
- không có sự cố nghiêm trọng chưa xử lý;
- khách hàng trả tiền cho giá trị thực hiện, không phải vì ảnh hưởng đến thẩm quyền.

Nếu không đạt, dòng dịch vụ phải tăng giá, thu hẹp phạm vi, thiết kế lại hoặc dừng.

### 21.6 Kiểm soát nguy cơ bị trí tuệ nhân tạo thay thế

Những công việc dễ bị giảm giá:

- tìm kiếm thông tin phổ thông;
- tóm tắt;
- nhập dữ liệu;
- soạn biểu mẫu;
- tạo danh sách ban đầu;
- nhắc việc;
- tạo báo cáo mô tả.

Những giá trị NacenX phải giữ:

- nhiệm vụ và ủy quyền thật;
- mạng chuyên gia đã kiểm tra;
- dữ liệu có quyền và nguồn;
- điều phối nhiều tổ chức;
- khảo sát và thực hiện ngoài thực tế;
- trách nhiệm nghề nghiệp;
- thẩm định độc lập;
- kết quả được kiểm chứng.

Mỗi quý phải so sánh dịch vụ với khả năng tự phục vụ bằng công cụ trí tuệ nhân tạo phổ biến. Phần khách hàng có thể tự làm được phải được tự động hóa, gộp vào dịch vụ lớn hơn hoặc dừng bán riêng.

---

## 22. Dữ liệu, sự kiện và tích hợp

### 22.1 Nguồn dữ liệu gốc có thẩm quyền

| Dữ liệu | Nguồn có thẩm quyền |
|---|---|
| Định danh pháp lý của tổ chức | Cơ sở đăng ký hoặc cơ quan có thẩm quyền |
| Tình trạng quyền sở hữu trí tuệ | Cơ sở đăng ký, chủ sở hữu hoặc đơn vị chuyển giao |
| Nhu cầu và số liệu gốc doanh nghiệp | Người sở hữu vấn đề và hệ thống của doanh nghiệp |
| Giai đoạn hồ sơ | Hệ thống NacenTech theo chính sách đã đóng băng |
| Hồ sơ và chứng chỉ chuyên gia | Chuyên gia, nơi cấp và nguồn xác minh |
| Báo cáo chuyên môn | Chuyên gia hoặc tổ chức chịu trách nhiệm |
| Kết quả thử nghiệm và chứng nhận | Phòng thử nghiệm hoặc tổ chức có thẩm quyền |
| Quyết định tài chính | Quỹ, ngân hàng hoặc tổ chức tài chính |
| Quyết định mua sắm | Đơn vị mua và người có thẩm quyền |
| Hóa đơn và thanh toán | Đơn vị phát hành, ngân hàng hoặc đơn vị thanh toán |
| Kết quả thực hiện | Báo cáo xác minh và bằng chứng |
| Chính sách | Cơ quan hoặc người có thẩm quyền ban hành |
| Hồ sơ cấu hình | Chủ sở hữu chính sách và quản trị nền tảng theo phạm vi |

Hệ thống chỉ lưu bản chụp, mã tham chiếu và dấu vết khi nguồn dữ liệu nằm ngoài hệ thống.

### 22.2 Yêu cầu đối với dữ liệu nhập

Mỗi bản ghi từ bên ngoài có:

- hệ thống nguồn;
- mã tại nguồn;
- mức thẩm quyền của nguồn;
- thời điểm lấy;
- thời điểm cập nhật tại nguồn;
- mã kiểm tra nội dung;
- quyền sử dụng;
- vị trí bản dữ liệu thô;
- số thứ tự cách ánh xạ;
- trạng thái kiểm tra.

Không tự gộp các bản ghi còn nghi ngờ. Trường hợp không chắc chắn phải vào hàng đợi rà soát.

### 22.3 Sự kiện nghiệp vụ

Mọi thay đổi quan trọng tạo sự kiện, ví dụ:

- nhu cầu được xác nhận;
- hồ sơ được phân công;
- chuyên gia chấp nhận nhiệm vụ;
- danh sách phương án được phê duyệt;
- quyền truy cập tài liệu được cấp;
- báo cáo thẩm định được nộp;
- thỏa thuận được ký;
- thử nghiệm bắt đầu;
- mốc công việc được nộp;
- kết quả được xác minh;
- dịch vụ sau chuyển giao được kích hoạt;
- cấu hình được kích hoạt hoặc thu hồi;
- hồ sơ được kết thúc.

Thay đổi dữ liệu và ghi sự kiện phải hoàn tất trong cùng một giao dịch cơ sở dữ liệu. Việc gửi ra ngoài được thực hiện sau đó, có cơ chế chống gửi trùng.

### 22.4 Nguyên tắc giao diện tích hợp

- mọi lệnh ghi phải có mã chống xử lý trùng;
- lệnh sửa đối tượng đã tồn tại phải kèm số thứ tự bản đang biết;
- sai bản phải trả thông báo xung đột, không ghi đè;
- ngày giờ lưu theo giờ quốc tế và hiển thị theo múi giờ người dùng;
- giá trị tiền luôn có loại tiền;
- tệp được tải qua địa chỉ tạm thời và kiểm tra mã nội dung;
- lỗi trả về theo một cấu trúc thống nhất;
- danh sách lớn dùng phân trang theo con trỏ;
- giao diện phải kiểm tra đúng năng lực đang có hiệu lực.

### 22.5 Nguyên tắc bộ kết nối

Mỗi bộ kết nối có:

- tổ chức sở hữu;
- người phụ trách;
- phạm vi dữ liệu và hành động;
- cách xác thực;
- giới hạn tần suất;
- thời hạn chờ;
- số lần thử lại;
- cơ chế chống trùng;
- bản ánh xạ;
- hàng đợi lỗi;
- đối soát;
- ngắt khẩn cấp;
- cam kết mức dịch vụ;
- phương án thủ công.

Bộ kết nối không được ghi trực tiếp vào bảng nghiệp vụ.

### 22.6 Nhật ký kiểm tra

Nhật ký gồm:

- người thực hiện;
- tổ chức;
- hồ sơ;
- hành động;
- đối tượng và số thứ tự bản;
- mục đích;
- địa chỉ mạng hoặc thiết bị khi cần;
- mã liên kết yêu cầu;
- thời gian.

Nhật ký được ghi nối tiếp, không sửa. Việc sửa dữ liệu nghiệp vụ phải dùng bản điều chỉnh hoặc giao dịch bù trừ.

---

## 23. Trí tuệ nhân tạo

### 23.1 Vai trò

Trí tuệ nhân tạo được dùng để:

- tóm tắt hồ sơ và cuộc họp;
- phát hiện dữ liệu thiếu;
- trích xuất thông tin;
- tạo câu hỏi làm rõ;
- đề xuất từ khóa tìm kiếm;
- tạo danh sách sơ bộ;
- so sánh phương án theo tiêu chí đã đóng băng;
- soạn dự thảo thư, báo cáo và danh sách kiểm tra;
- cảnh báo thời hạn và rủi ro;
- theo dõi chỉ số;
- hỗ trợ truy xuất tri thức.

Trí tuệ nhân tạo không sở hữu hồ sơ và không có quyền quyết định cuối.

### 23.2 Phân loại công việc

| Nhóm công việc | Cách xử lý |
|---|---|
| Có thể tự động | Chỉ tự chạy khi dữ liệu có cấu trúc, rủi ro thấp và đã kiểm thử |
| Tự phục vụ phổ thông | Không phát hành như ý kiến chuyên gia và không thu phí chuyên môn riêng |
| Trí tuệ nhân tạo làm trước, người rà soát | Luôn ở trạng thái dự thảo, có nguồn và người duyệt |
| Con người chịu trách nhiệm | Người có nhiệm vụ phải quyết định hoặc ký |
| Công việc ngoài thực tế | Hệ thống chỉ hỗ trợ lịch, danh sách kiểm tra và thu bằng chứng |
| Thẩm quyền bên ngoài | Chỉ ghi nhận quyết định từ nguồn có thẩm quyền |

Không được đổi công việc cần con người hoặc cơ quan thành công việc tự động chỉ bằng thay cấu hình hoặc thay mô hình.

### 23.3 Cổng hành động

Mô hình không gọi trực tiếp thư điện tử, Zalo, lịch, báo giá, hợp đồng hoặc hóa đơn. Mọi hành động đi qua cổng kiểm soát:

1. Kiểm tra người sử dụng và tổ chức.
2. Kiểm tra nhiệm vụ và mục đích.
3. Kiểm tra phân loại dữ liệu.
4. Kiểm tra chính sách hành động.
5. Xác định có cần người duyệt.
6. Ghi dấu vết.
7. Thực hiện qua bộ kết nối.
8. Ghi kết quả hoặc lỗi.

### 23.4 Hành động bị cấm

Trí tuệ nhân tạo không được:

- tự ký hoặc chấp nhận hợp đồng;
- tự cam kết giá, trách nhiệm hoặc quyền sở hữu trí tuệ;
- tự xác nhận nhu cầu đủ điều kiện;
- tự chuyển giai đoạn hồ sơ;
- tự chọn công nghệ, chuyên gia hoặc nhà cung cấp;
- tự quyết định tín dụng hoặc tài trợ;
- tự kết luận định giá;
- tự ký ý kiến chuyên môn;
- tự nghiệm thu;
- tự công nhận kết quả;
- tự nộp hồ sơ ra cơ quan ngoài;
- tự thay số liệu gốc hoặc tiêu chí sau khi biết kết quả;
- tự mở rộng quyền truy cập;
- sử dụng dữ liệu của tổ chức này cho tổ chức khác khi thiếu quyền.

### 23.5 Không gian tri thức riêng

Tri thức được tách theo:

- tổ chức;
- không gian làm việc;
- hồ sơ;
- mục đích;
- nguồn;
- quyền sử dụng;
- thời hạn;
- mức bảo mật.

Thu hồi một nguồn phải làm nguồn đó ngừng được truy xuất ngay. Bộ nhớ tạm và chỉ mục liên quan phải được xóa theo chính sách, trong khi dấu vết của nội dung đã gửi hợp pháp vẫn được giữ.

### 23.6 Kiểm thử trí tuệ nhân tạo

Bộ kiểm thử phải bao gồm:

- bịa nguồn;
- dùng quy định hết hiệu lực;
- dùng sai ngành hoặc địa bàn;
- bỏ sót ngoại lệ;
- làm lộ dữ liệu giữa tổ chức;
- bị nội dung tài liệu điều khiển trái phép;
- gọi hành động ngoài quyền;
- thiên vị nhà cung cấp;
- tạo chứng chỉ hoặc thẩm quyền giả;
- sửa số liệu gốc;
- tính trùng lợi ích;
- che giấu kết quả không thuận lợi.

Thay mô hình chỉ được thực hiện sau khi so sánh chất lượng, an toàn, chi phí và phương án quay lại.

---

## 24. Định danh, phân quyền và an toàn

### 24.1 Định danh

Hệ thống sử dụng nhà cung cấp định danh tập trung, hỗ trợ:

- đăng nhập nhiều lớp đối với tài khoản quan trọng;
- liên kết tài khoản với tổ chức;
- vòng đời mời, kích hoạt, khóa và thu hồi;
- quản lý phiên;
- thu hồi thiết bị và khóa truy cập;
- đăng nhập liên kết khi có đối tác đủ điều kiện.

Không tự xây cơ chế mật khẩu riêng nếu không cần thiết.

### 24.2 Mô hình phân quyền

Quyền được quyết định theo:

- người sử dụng;
- tổ chức;
- vai trò;
- hồ sơ hoặc chương trình;
- nhiệm vụ;
- mục đích;
- loại dữ liệu;
- phạm vi tài liệu;
- thời hạn;
- xung đột lợi ích;
- năng lực đang được kích hoạt.

Quyết định quyền nằm tại lớp nghiệp vụ, không chỉ tại đường dẫn bên ngoài.

### 24.3 Nguyên tắc quyền tối thiểu

- thuộc một tổ chức không đồng nghĩa được xem mọi dữ liệu của tổ chức;
- tham gia một hồ sơ không đồng nghĩa được xem toàn bộ tài liệu;
- điều phối viên không mặc định có quyền ký;
- quản trị kỹ thuật không mặc định có quyền quyết định nghiệp vụ;
- NacenX không được dùng tài khoản vận hành để thay NacenTech;
- quyền hết hạn phải bị thu hồi tự động;
- quyền khẩn cấp phải có lý do, thời hạn và rà soát sau sử dụng.

### 24.4 Bảo vệ dữ liệu

Dữ liệu được phân loại:

- công khai;
- nội bộ;
- hạn chế;
- bí mật kinh doanh;
- dữ liệu cá nhân;
- dữ liệu nhạy cảm;
- dữ liệu thuộc yêu cầu lưu trữ đặc biệt.

Mỗi loại có quy tắc về:

- mã hóa;
- vị trí lưu;
- người được xem;
- tải xuống;
- chia sẻ;
- thời hạn lưu;
- sao lưu;
- xóa;
- ghi nhật ký.

### 24.5 Bảo vệ tệp và khóa

- tệp được mã hóa;
- tài liệu đặc biệt nhạy cảm có khóa riêng;
- khóa được quản lý tách khỏi kho tệp;
- bản sao lưu được mã hóa;
- việc hủy khóa được kiểm soát;
- kho lưu giữ không cho sửa phải đi cùng khả năng hủy quyền giải mã khi có yêu cầu hợp lệ;
- mã kiểm tra nội dung được xác minh khi nhận và đọc định kỳ.

### 24.6 Bí mật hệ thống

- không đặt mật khẩu hoặc khóa trong mã nguồn;
- bí mật được lấy từ kho quản lý;
- có lịch thay khóa;
- tài khoản dịch vụ tách theo môi trường;
- quyền của tài khoản dịch vụ ở mức tối thiểu;
- việc sử dụng bí mật được ghi nhận và cảnh báo.

### 24.7 An toàn tích hợp

- xác thực hai phía khi phù hợp;
- giới hạn địa chỉ và tần suất;
- ký yêu cầu hoặc sự kiện quan trọng;
- kiểm tra thời gian và mã chống phát lại;
- cách ly dữ liệu đầu vào;
- quét tệp;
- chặn ghi trực tiếp;
- ngắt bộ kết nối khi có sự cố;
- đối soát sau khi phục hồi.

### 24.8 Xử lý sự cố

Kế hoạch xử lý sự cố phải xác định:

- mức độ;
- người trực;
- cách cô lập;
- cách thu hồi quyền;
- cách bảo toàn bằng chứng;
- cách thông báo;
- cách phục hồi;
- cách đánh giá dữ liệu bị ảnh hưởng;
- cách khắc phục;
- cách rà soát sau sự cố.

Sự cố liên quan trí tuệ nhân tạo phải hạ mức tự động hóa về chỉ soạn dự thảo cho đến khi được phê duyệt lại.

---

## 25. Yêu cầu chất lượng hệ thống

| Yêu cầu | Mục tiêu ban đầu |
|---|---|
| Thời gian sẵn sàng | 99,9% theo tháng sau giai đoạn thử nghiệm |
| Mất dữ liệu cho phép | Không quá 15 phút đối với cơ sở dữ liệu giao dịch |
| Thời gian phục hồi | Không quá 4 giờ |
| Phản hồi đọc thông thường | 95% yêu cầu dưới 500 mili giây, không tính hệ thống ngoài |
| Phản hồi lệnh thông thường | 95% yêu cầu dưới 1 giây khi xử lý đồng bộ |
| Tìm kiếm | 95% yêu cầu dưới 2 giây |
| Ghi dấu vết | 100% lệnh nhạy cảm |
| Kiểm soát hành động trí tuệ nhân tạo | 100% đề xuất, phê duyệt và thực hiện liên kết được với nhau |
| Kiểm soát cấu hình | 100% cấu hình có bản, phê duyệt, hiệu lực và cách quay lại |
| Tách dữ liệu | Không rò dữ liệu giữa tổ chức, hồ sơ, chuyên gia hoặc mục đích |
| Toàn vẹn tệp | Kiểm tra mã nội dung khi nhận và theo lịch |
| Gửi sự kiện | Có thể nhận lặp nhưng bên nhận phải chống xử lý trùng |
| Quy mô năm đầu | 500 tổ chức, 5.000 người dùng, 1.000 hồ sơ đang hoạt động |
| Phiên đồng thời | 300 phiên tại thời điểm cao nhất |
| Tăng trưởng dữ liệu | Không quá 200 GB dữ liệu giao dịch và 2 TB tệp mỗi năm trong giả định đầu |

Mục tiêu cuối cùng phải được chốt lại bằng số liệu giai đoạn đầu. Không mua hạ tầng cho quy mô chưa được chứng minh.

### 25.1 Khả năng quan sát

Hệ thống phải thu thập:

- nhật ký có cấu trúc;
- số đo;
- dấu vết qua nhiều phân hệ;
- mã liên kết yêu cầu;
- hàng đợi lỗi;
- trạng thái bộ kết nối;
- thời gian xử lý;
- tỷ lệ lỗi;
- cảnh báo an toàn;
- cảnh báo nghĩa vụ quá hạn;
- chi phí trí tuệ nhân tạo.

### 25.2 Sao lưu và phục hồi

- sao lưu cơ sở dữ liệu theo lịch;
- sao lưu kho tệp và cấu hình;
- giữ bản sao tách biệt;
- kiểm tra phục hồi định kỳ;
- ghi kết quả kiểm tra;
- diễn tập mất vùng hoặc mất đơn vị vận hành;
- bảo đảm NacenTech có quyền nhận gói chuyển giao khi cần.

---

## 26. Công nghệ, triển khai và chuyển đổi hệ thống

### 26.1 Dịch vụ phía máy chủ

Sử dụng ASP.NET Core trên .NET 10 hỗ trợ dài hạn với kiến trúc nguyên khối theo phân hệ trong giai đoạn đầu.

Lý do:

- giao dịch xuyên nhiều phân hệ cần tính nguyên tử;
- đội ngũ vận hành chưa cần độ phức tạp của nhiều dịch vụ triển khai riêng;
- dễ kiểm tra quyền, giao dịch và dấu vết;
- giảm chi phí hạ tầng và triển khai;
- vẫn có ranh giới phân hệ để tách sau này khi có nhu cầu thật.

Một phân hệ chỉ được tách thành dịch vụ độc lập khi:

- không còn phụ thuộc giao dịch chung;
- có giao diện rõ;
- có nhu cầu mở rộng riêng;
- có đội sở hữu;
- có cơ chế xử lý bù trừ;
- có kiểm thử lỗi mạng và xử lý trùng.

### 26.2 Thành phần công nghệ

| Thành phần | Công nghệ hoặc định hướng |
|---|---|
| Dịch vụ phía máy chủ | ASP.NET Core, .NET 10 hỗ trợ dài hạn |
| Cơ sở dữ liệu giao dịch | PostgreSQL |
| Kho tệp | Kho đối tượng đặt tại Việt Nam, hỗ trợ giữ bản không cho sửa |
| Hàng đợi | Công nghệ hàng đợi phù hợp với quy mô và năng lực vận hành |
| Tìm kiếm | Giữ Elasticsearch trong giai đoạn chuyển đổi, chỉ hội tụ khi kiểm thử tiếng Việt đạt yêu cầu |
| Trí tuệ nhân tạo | Giữ dịch vụ truy xuất tri thức hiện có sau lớp giao diện chuẩn |
| Định danh | Nhà cung cấp định danh hỗ trợ chuẩn liên kết và xác thực nhiều lớp |
| Ký số | Kết nối tổ chức cung cấp dịch vụ chứng thực và ký số phù hợp |
| Giám sát | Nhật ký, số đo, dấu vết và cảnh báo tập trung |
| Đóng gói | Thùng chứa ứng dụng và quy trình triển khai tự động |

### 26.3 Cấu trúc phân hệ

Mỗi phân hệ có:

- lớp nghiệp vụ;
- lớp điều phối trường hợp sử dụng;
- lớp lưu trữ;
- giao diện công khai;
- kiểm thử;
- cấu trúc dữ liệu riêng trong cùng cơ sở dữ liệu;
- quyền sở hữu rõ.

Phân hệ không được:

- truy cập trực tiếp bảng của phân hệ khác trên đường ghi;
- mở giao dịch lồng riêng;
- gọi hệ thống ngoài trong giao dịch cơ sở dữ liệu;
- dùng chung đối tượng lưu trữ không có chủ sở hữu;
- tạo phụ thuộc vòng.

### 26.4 Môi trường

Tối thiểu có:

- môi trường phát triển;
- môi trường kiểm thử;
- môi trường kiểm thử chấp nhận;
- môi trường vận hành;
- môi trường xem trước cho chức năng dùng dữ liệu giả.

Màn hình dùng dữ liệu giả phải có dấu nhận biết và không được mở như chức năng vận hành.

### 26.5 Chuyển đổi từ hệ thống hiện có

Nguyên tắc:

- dịch vụ NestJS hiện tại tiếp tục sở hữu giao diện cũ trong thời gian chuyển đổi;
- dịch vụ .NET sở hữu giao diện mới;
- một đối tượng không được hai hệ thống cùng ghi;
- chuyển từng năng lực;
- dùng bộ kết nối chống xử lý trùng;
- kiểm tra hợp đồng giao diện cũ trong từng lần phát hành;
- đối soát dữ liệu;
- diễn tập quay lại;
- chỉ dừng phần cũ sau thời gian quan sát.

### 26.6 Trình tự chuyển đổi

1. Kiểm kê giao diện, bảng, tệp, hàng đợi và chỉ mục.
2. Phân loại dữ liệu.
3. Xác định hệ thống sở hữu từng đối tượng.
4. Xây lớp định danh, phân quyền và kiểm tra.
5. Xây lõi hồ sơ và nhu cầu.
6. Chuyển phòng dữ liệu và trao đổi.
7. Chuyển chuyên gia, tìm kiếm và thẩm định.
8. Chuyển thỏa thuận, thực hiện và kết quả.
9. Chuyển tài chính, chương trình và báo cáo.
10. Đối soát, diễn tập và dừng từng phần cũ.

Không chuyển toàn bộ trong một lần.

---

## 27. Lộ trình triển khai

### 27.1 Giai đoạn chuẩn bị an toàn

Thời gian dự kiến: 2 tuần.

Nội dung:

- thay toàn bộ tài khoản và khóa mặc định;
- đóng điểm quản trị công khai;
- kiểm kê hệ thống và dữ liệu;
- xác định quyền sở hữu từng phần;
- xây kiểm thử cho giao diện cũ;
- chốt cấu trúc phân hệ;
- xây khung phân quyền;
- xây kho kiểm tra và sự kiện;
- xây danh mục năng lực và cấu trúc cấu hình;
- chốt dự thảo thỏa thuận vận hành NacenTech–NacenX.

Điều kiện hoàn thành:

- không còn tài khoản mặc định;
- phục hồi bản sao thành công;
- giao diện cũ có kiểm thử;
- cấu hình không thể vượt bất biến;
- quyền sở hữu tài khoản, mã nguồn, khóa, tên miền và sao lưu rõ.

### 27.2 Giai đoạn thiết kế thể chế và vận hành thủ công

Thời gian dự kiến: 2 tháng.

Nội dung:

- chọn một ngành sản xuất;
- chọn 3–5 doanh nghiệp và ít nhất hai người trả tiền;
- chọn tối đa ba bài toán;
- chọn 3–5 đơn vị cung cấp công nghệ;
- xây mạng chuyên gia ban đầu;
- chọn một phòng thử nghiệm hoặc địa điểm thử;
- xác định một nguồn tài chính hoặc chương trình nếu cần;
- chạy toàn bộ quy trình bằng công cụ thủ công;
- đo thời gian và chi phí từng bước;
- thử báo giá ba sản phẩm ưu tiên;
- lập hồ sơ cấu hình đầu tiên;
- làm rõ quyền dữ liệu, phí và xung đột lợi ích.

Điều kiện hoàn thành:

- ít nhất 10 nhu cầu đủ điều kiện;
- ít nhất 3 nhu cầu có đường ngân sách;
- ít nhất 5 chuyên gia được kiểm tra;
- có người trả tiền cho thử nghiệm;
- có số liệu chi phí phục vụ ban đầu;
- có một thỏa thuận thử nghiệm dự kiến ký;
- có căn cứ pháp lý cho dữ liệu và dịch vụ mở đầu.

### 27.3 Giai đoạn lõi điều phối

Thời gian dự kiến: tháng 3–5.

Xây:

- tổ chức, cá nhân và vai trò;
- nhu cầu;
- hồ sơ thương mại hóa;
- giai đoạn và quyết định;
- điều phối viên;
- chuyên gia;
- trao đổi;
- phòng dữ liệu;
- tìm kiếm có giải thích;
- sổ kiểm tra;
- cấu hình năng lực;
- tính phí cơ bản;
- bàn đổi mới sáng tạo ở mức hỗ trợ thủ công.

Điều kiện kinh doanh:

- 10 hồ sơ đủ điều kiện trên hệ thống;
- 5 danh sách phương án được doanh nghiệp rà soát;
- 3 đề xuất;
- 1 thỏa thuận trả tiền;
- 3 nhiệm vụ chuyên gia;
- 2 sản phẩm chuyên gia được chấp nhận.

### 27.4 Giai đoạn giao dịch

Thời gian dự kiến: tháng 6–9.

Xây:

- gói công nghệ;
- thẩm định;
- phòng dữ liệu đầy đủ;
- thiết kế giao dịch;
- hợp đồng;
- kế hoạch thực hiện;
- mốc công việc;
- bằng chứng;
- xác minh kết quả;
- vận hành sau chuyển giao;
- chia sẻ bằng chứng có kiểm soát;
- một thử nghiệm chuyển đổi số trả phí.

Điều kiện hoàn thành:

- 3 lần thực hiện hoàn tất;
- 2 kết quả được xác minh độc lập;
- ít nhất một dòng dịch vụ có mức giá thật và phần đóng góp tính được;
- không có rò dữ liệu hoặc xung đột nghiêm trọng chưa xử lý.

### 27.5 Giai đoạn tài chính và chương trình

Thời gian dự kiến: tháng 10–12.

Xây:

- nhu cầu vốn;
- một bộ kết nối tài chính;
- một chương trình hỗ trợ;
- sổ theo dõi tách biệt;
- tính phí và hóa đơn;
- báo cáo kết quả;
- một kết nối tham chiếu đến nguồn dữ liệu công nếu có nhiệm vụ hợp lệ.

Không mở rộng nếu mọi dòng dịch vụ đều có phần đóng góp âm hoặc nguồn thu định kỳ không đủ bù chi phí cố định theo ngưỡng đã chốt.

### 27.6 Giai đoạn mạng liên kết

Thời gian dự kiến: tháng 13–18.

Chỉ thực hiện khi các giai đoạn trước đạt kết quả:

- 3–5 nút địa phương hoặc cơ quan;
- một hồ sơ dùng nhiều nút;
- một hành lang quốc tế nếu có nhu cầu;
- tối đa ba cơ chế công–tư;
- kiểm thử tương thích bộ kết nối;
- theo dõi kết quả 6 và 12 tháng.

Không mở rộng bằng số biên bản ghi nhớ, số tài khoản hoặc số kết nối.

---

## 28. Chỉ số đánh giá

### 28.1 Chỉ số trung tâm

Chỉ số trung tâm là:

> Số hồ sơ thương mại hóa đạt kết quả được xác minh và tiếp tục được áp dụng sau 12 tháng.

Trong năm đầu có thể dùng chỉ số thay thế:

> Số hồ sơ có thỏa thuận thật, thực hiện hoàn tất và kết quả được xác minh.

### 28.2 Chỉ số theo chuỗi

| Khâu | Chỉ số |
|---|---|
| Tiếp nhận | Tỷ lệ đầu mối thành nhu cầu đủ điều kiện |
| Xác nhận | Thời gian xác nhận và tỷ lệ có ngân sách |
| Tìm kiếm | Thời gian có danh sách và tỷ lệ được chấp nhận |
| Chuyên gia | Thời gian tìm chuyên gia, tỷ lệ nhận việc và tỷ lệ sản phẩm được chấp nhận |
| Thẩm định | Thời gian, số lần làm lại và mức đầy đủ của bằng chứng |
| Thỏa thuận | Tỷ lệ đề xuất thành hợp đồng và giá trị hợp đồng |
| Thực hiện | Tỷ lệ mốc đúng hạn và tỷ lệ tranh chấp |
| Kết quả | Đạt, đạt một phần, không đạt và chưa đủ cơ sở |
| Sau chuyển giao | Mức sử dụng, thời gian xử lý vấn đề và năng lực còn lại |
| Mạng địa phương | Thời gian phản hồi, tỷ lệ tiếp nhận và tỷ lệ hồ sơ thành kết quả |
| Quốc tế | Tỷ lệ tìm được nguồn, tỷ lệ làm rõ quyền, thử nghiệm và áp dụng |
| Liên kết công | Mức bao phủ nhiệm vụ, thời gian liên cơ quan và sự cố thẩm quyền |

### 28.3 Chỉ số tài chính

- doanh thu trên hồ sơ hoàn tất;
- chi phí phục vụ trên hồ sơ hoàn tất có điều chỉnh hồ sơ rơi;
- phần đóng góp theo dòng dịch vụ;
- tỷ lệ khách hàng mua lại;
- tỷ lệ doanh thu định kỳ;
- mức tập trung vào một người trả tiền;
- mức phụ thuộc hỗ trợ vận hành;
- số ngày thu tiền;
- số tháng tiền mặt còn lại;
- tỷ lệ sử dụng thời gian của điều phối viên;
- chi phí và lợi ích sau khi dùng trí tuệ nhân tạo.

### 28.4 Chỉ số liêm chính

- số trường hợp truy cập sai;
- số xung đột lợi ích không công khai;
- số kết luận sai thẩm quyền;
- số bằng chứng hết hạn bị dùng lại;
- số hành động trái phép của trí tuệ nhân tạo;
- số khoản hỗ trợ bị tính trùng;
- số hồ sơ tự xác minh;
- số thay đổi cấu hình không đủ phê duyệt;
- số quyết định ngoài hệ thống bị trình bày sai.

Ngưỡng của các sự cố nghiêm trọng là bằng không.

### 28.5 Chống chỉ số hình thức

Không dùng các số sau làm kết quả chính:

- số tài khoản;
- lượt xem;
- số công nghệ đăng;
- số chuyên gia đăng ký;
- số biên bản ghi nhớ;
- số sự kiện;
- số địa phương kết nối;
- số hồ sơ được tạo;
- giá trị vốn đề xuất;
- tổng giá trị hàng hóa hoặc tiền thu hộ.

---

## 29. Tổ chức vận hành

### 29.1 Nhóm sản phẩm và kỹ thuật NacenX

| Vai trò | Số lượng ban đầu |
|---|---:|
| Phụ trách sản phẩm và chương trình | 1 |
| Kiến trúc sư và trưởng kỹ thuật | 1 |
| Lập trình dịch vụ phía máy chủ | 3–4 |
| Lập trình giao diện | 2 |
| Kiểm thử | 1–2 |
| Hạ tầng và an toàn | 1 |
| Dữ liệu và tích hợp | 1 |
| Thiết kế trải nghiệm và dịch vụ | 1 |

### 29.2 Nhóm nghiệp vụ NacenX

| Vai trò | Nguyên tắc kích hoạt |
|---|---|
| Trưởng vận hành | Có từ đầu |
| Điều phối viên công nghệ | Tuyển theo số hồ sơ và năng lực thực tế |
| Quản lý mạng chuyên gia | Có từ giai đoạn đầu |
| Phụ trách dịch vụ chuyên môn | Chỉ chuyên trách sau khi có dịch vụ trả tiền lặp lại |
| Phụ trách bảo đảm chuyển đổi số | Chỉ chuyên trách sau ba nhiệm vụ trả tiền và một lần mua tiếp |
| Phụ trách nhân lực công nghệ | Chỉ có sau khi đạt cổng pháp lý và kinh tế |
| Phụ trách tài chính đối tác | Có khi bắt đầu kết nối tài chính |
| Pháp lý, sở hữu trí tuệ và chính sách | 1–2 người hoặc dịch vụ thuê ngoài |
| Vận hành chương trình | 1–2 người theo số chương trình |
| Quản lý sau chuyển giao | Chỉ chuyên trách sau hai hợp đồng trả tiền |
| Quản trị dữ liệu và an toàn | 1 |
| Phụ trách mạng địa phương và quốc tế | Kích hoạt khi mở mạng thật |

Nếu thiếu người, phải giảm ngành, số hồ sơ hoặc số năng lực; không thay người chịu trách nhiệm bằng trí tuệ nhân tạo.

### 29.3 Nhóm giám sát NacenTech

| Vai trò | Trách nhiệm |
|---|---|
| Chủ sở hữu nền tảng công | Nhiệm vụ, chính sách và giám sát đơn vị vận hành |
| Phụ trách chuẩn dữ liệu | Chuẩn, công bố chính thức và liên thông |
| Phụ trách chương trình và mua sắm | Thẩm quyền, điều kiện chương trình và đường mua sắm |
| Đầu mối liên cơ quan | Nhiệm vụ, nguồn dữ liệu, chất lượng và xử lý vướng mắc |
| Giám sát pháp lý, riêng tư và an toàn | Kiểm tra, sự cố và quan hệ cơ quan |
| Phụ trách kết quả và hiệu quả đơn vị vận hành | Chỉ số công, cam kết mức dịch vụ và kiến nghị gia hạn hoặc thay thế |

Nhóm NacenTech không xử lý hỗ trợ hằng ngày, không triển khai phần mềm và không xuất hóa đơn dịch vụ.

### 29.4 Nhịp vận hành

- hằng ngày: rà soát hàng đợi quá hạn và hồ sơ bị chặn;
- hằng tuần: rà soát hồ sơ, chuyên gia và đối tác;
- hằng tháng: rà soát kết quả, sự cố và tài chính;
- hằng quý: rà soát dòng dịch vụ, trí tuệ nhân tạo, cấu hình và khả năng mở rộng;
- hằng năm: rà soát chiến lược, đơn vị vận hành, an toàn và kế hoạch chuyển giao.

---

## 30. Rủi ro và biện pháp kiểm soát

| Rủi ro | Biện pháp |
|---|---|
| Hệ thống ôm quá nhiều chức năng | Bốn mức kích hoạt, một ngành đầu tiên và cổng bằng chứng |
| Xây phần mềm trước khi có người trả tiền | Vận hành thủ công và bán dịch vụ trước |
| Biến thành sàn đăng tin | Một hồ sơ, một điều phối viên và kết quả được xác minh |
| Biến NacenX thành đơn vị tổng thầu mọi việc | Giới hạn vai trò và dùng đối tác thực hiện |
| Xung đột giữa tư vấn, cung cấp và xác minh | Tách vai trò, công khai lợi ích và người phê duyệt độc lập |
| Dùng ảnh hưởng nhà nước để bán dịch vụ | Tách NacenTech–NacenX, công khai phí và cấm bán quyết định |
| Phụ thuộc một nhà cung cấp phần mềm hoặc trí tuệ nhân tạo | Giao diện chuẩn, khả năng thay thế và gói chuyển giao |
| Sao chép hệ thống theo tỉnh | Một lõi dùng chung, hồ sơ cấu hình và bộ kết nối |
| Mở rộng theo biên bản ghi nhớ | Chỉ mở rộng sau hồ sơ, doanh thu và kết quả |
| Dữ liệu không có nguồn | Bắt buộc nguồn, thời điểm, mã kiểm tra và quyền sử dụng |
| Rò dữ liệu | Quyền theo nhiệm vụ, tách không gian, mã hóa và kiểm thử |
| Trí tuệ nhân tạo hành động ngoài quyền | Cổng hành động, danh sách cấm và người duyệt |
| Báo cáo hiệu quả giả | Đóng băng số liệu gốc, tách tự báo cáo và xác minh độc lập |
| Tính doanh thu và chi phí sai | Tách sổ, tách thu hộ và chống tính chi phí hai lần |
| Không thể thay đơn vị vận hành | Quyền truy cập mã nguồn, dữ liệu, khóa, bản dựng, sao lưu và diễn tập chuyển giao |

---

## 31. Tiêu chí nghiệm thu kiến trúc

Hệ thống chỉ được coi là triển khai đúng kiến trúc khi đáp ứng toàn bộ nhóm tiêu chí sau.

### 31.1 Hồ sơ và quyết định

1. Không xác nhận hồ sơ khi thiếu chủ sở hữu vấn đề, người quyết định, bản nhu cầu và đường ngân sách.
2. Không đưa công nghệ vào danh sách chính thức khi chưa sẵn sàng giao dịch.
3. Mọi phương án có lý do, nguồn và điều kiện loại.
4. Điều chỉnh của con người không xóa kết quả gốc của công cụ.
5. Mọi chuyển giai đoạn có quyết định, chính sách và bằng chứng.
6. Hai lệnh chuyển đồng thời chỉ tạo một quyết định.
7. Hồ sơ mất người phụ trách bị đưa vào trạng thái tạm dừng.
8. Hồ sơ có thể xuất thành gói dữ liệu để người kiểm tra độc lập đối chiếu.

### 31.2 Dữ liệu và tài liệu

9. Dữ liệu ngoài hệ thống luôn có nguồn và thời điểm.
10. Tài liệu mật không mở khi thiếu nhiệm vụ, mục đích và quyền.
11. Thu hồi quyền làm tài liệu trong hội thoại không còn đọc được.
12. Mã kiểm tra của tệp và gói xuất có thể tính lại.
13. Yêu cầu xóa hợp lệ làm dữ liệu không còn giải mã được nhưng không phá dấu vết cần giữ.
14. Không có đường đọc dữ liệu chéo tổ chức, hồ sơ hoặc chuyên gia.
15. Bằng chứng hết hạn hoặc bị thu hồi không được dùng lại.
16. Mọi lần chia sẻ bằng chứng có người nhận, mục đích và thời hạn.

### 31.3 Chuyên gia và độc lập

17. Chuyên gia chưa được kiểm tra hoặc chứng chỉ hết hạn không vào danh sách chính thức.
18. Chuyên gia chỉ đọc tài liệu thuộc nhiệm vụ.
19. Người thiết kế hoặc cung cấp giải pháp không tự làm người xác minh độc lập duy nhất.
20. Đổi vai trò trong cùng hồ sơ phải tạo nhiệm vụ mới và kiểm tra lại xung đột.
21. Chỉ sản phẩm được chấp nhận mới tạo điều kiện tính phí và lịch sử có bằng chứng.
22. Quan hệ lợi ích và phí từ nhà cung cấp phải được công khai.
23. Người thẩm định không nhận khoản tiền phụ thuộc vào kết luận thuận lợi.

### 31.4 Thực hiện và kết quả

24. Không bắt đầu thực hiện khi thiếu thỏa thuận, kế hoạch và định nghĩa kết quả.
25. Thử nghiệm không bắt đầu khi thiếu số liệu gốc, mục tiêu, cách đo, điều kiện nghiệm thu và người xác minh.
26. Bằng chứng không đạt và việc làm lại không bị xóa.
27. Tự báo cáo không tự trở thành kết quả được xác minh.
28. Bên hưởng lợi không tự xác nhận mốc thanh toán hoặc kết quả của chính mình.
29. Chuyển giao không hoàn tất khi thiếu quyền, tài liệu, đào tạo và bằng chứng bên nhận vận hành được.
30. Theo dõi 6, 12 và 24 tháng tiếp tục hoạt động sau khi triển khai lại hệ thống.

### 31.5 Tài chính

31. Mọi giá trị tiền có loại tiền.
32. Tỷ giá đã đóng băng không bị tính lại hồi tố.
33. Tổng phân chia phí bằng đúng khoản phí đến đơn vị tiền nhỏ nhất.
34. Phân bổ chương trình không vượt hạn mức.
35. Một khoản chi không được nhận hỗ trợ trùng.
36. Khoản thu hộ không được ghi thành doanh thu NacenX.
37. Một nhóm chi phí không được tính hai lần.
38. Chi phí trên hồ sơ bao gồm cả hồ sơ dừng và không thành công.
39. Dòng dịch vụ không được mở rộng khi phần đóng góp không dương.

### 31.6 Cấu hình và mở rộng

40. Năng lực tùy chọn không hoạt động khi thiếu hồ sơ cấu hình được phê duyệt và còn hiệu lực.
41. Cấu hình có trường hoặc hành động ngoài cấu trúc cho phép bị chặn.
42. Cấu hình và cờ kích hoạt không thể bỏ qua thẩm quyền, phân quyền, giao dịch, tiền, bằng chứng hoặc giới hạn trí tuệ nhân tạo.
43. Thay đổi cấu hình quan trọng phải chạy thử, hiển thị tác động và có cách quay lại.
44. Cấu hình mới không sửa hồi tố hồ sơ, quyết định hoặc thỏa thuận đã đóng băng.
45. Hai tổ chức khác cấu hình vẫn dùng cùng mã nguồn và cấu trúc chuẩn.
46. Chức năng không được bật không xuất hiện và không gọi được.
47. Năng lực dành cho mở rộng không được kích hoạt khi thiếu bằng chứng kinh doanh và an toàn.
48. Bộ kết nối hỏng phải hạ về quy trình thủ công, không giả lập quyết định ngoài.

### 31.7 Trí tuệ nhân tạo

49. Mỗi trường hợp sử dụng có phân loại công việc, nguồn, tiêu chí, người chịu trách nhiệm và cách quay lại.
50. Nội dung tự phục vụ không được phát hành như ý kiến chuyên gia.
51. Trí tuệ nhân tạo không thể chuyển giai đoạn, sửa quyết định hoặc chọn phương án cuối.
52. Trí tuệ nhân tạo không thể ký hợp đồng, định giá cuối, nghiệm thu hoặc công nhận.
53. Mô hình không gọi trực tiếp kênh gửi hoặc hệ thống giao dịch.
54. Dữ liệu và bộ nhớ không rò giữa các tổ chức hoặc chuyên gia.
55. Thu hồi nguồn làm nguồn đó ngừng được truy xuất.
56. Nội dung tài liệu không thể điều khiển mô hình vượt quyền.
57. Thay mô hình phải qua kiểm thử chất lượng, an toàn, chi phí và phương án quay lại.

### 31.8 An toàn và liên tục

58. Không còn tài khoản hoặc mật khẩu mặc định.
59. Không có điểm quản trị công khai ngoài chính sách.
60. Mọi lệnh nhạy cảm được ghi dấu vết.
61. Sao lưu có thể phục hồi trong mục tiêu đã chốt.
62. Tài khoản dịch vụ chỉ có quyền tối thiểu.
63. Bí mật không nằm trong mã nguồn hoặc tài liệu chia sẻ.
64. Sự cố có thể thu hồi quyền và cô lập bộ kết nối.
65. NacenTech nhận được dữ liệu, mã nguồn, bản dựng, khóa, tài liệu vận hành và lịch sử sự cố theo điều kiện chuyển giao.

### 31.9 Kinh doanh và kết quả

66. Không dùng lượt xem, tài khoản, công nghệ đăng hoặc biên bản ghi nhớ làm chỉ số trung tâm.
67. Nhu cầu miễn phí hoặc sự kiện không được tính là kiểm chứng người trả tiền.
68. Một dòng dịch vụ có giá, chi phí trực tiếp, phần đóng góp và tỷ lệ mua lại.
69. Mở rộng mạng cần hồ sơ hoàn tất và kết quả, không chỉ cần số nút kết nối.
70. Doanh thu định kỳ và số tháng tiền mặt còn lại được theo dõi.
71. Không cải thiện lợi nhuận bằng cách hạ chuẩn độc lập, an toàn hoặc quyền dữ liệu.
72. Sau mỗi giai đoạn phải có quyết định tiếp tục, định giá lại, thiết kế lại hoặc dừng.

---

## Kết luận

Kiến trúc NacenTech giữ toàn bộ năng lực cần thiết của một hạ tầng thương mại hóa công nghệ, chuyển đổi số và đổi mới sáng tạo, nhưng không yêu cầu triển khai đồng thời.

Lõi hệ thống tập trung vào hồ sơ, quyết định, bằng chứng, thẩm quyền và kết quả. Các dịch vụ chuyên môn, tài chính, mạng địa phương, hợp tác quốc tế và trí tuệ nhân tạo được kích hoạt theo hồ sơ cấu hình và cổng bằng chứng.

Phạm vi triển khai đầu tiên phải đủ sâu để đi hết chuỗi từ nhu cầu đến kết quả, nhưng đủ hẹp để đo được người trả tiền, chi phí, trách nhiệm và giá trị:

> Một ngành sản xuất — một nhóm doanh nghiệp — một chuỗi từ chẩn đoán đến thử nghiệm và vận hành — một bộ bằng chứng — một kết quả được xác minh.

Đây là cách giữ được giá trị của các mô hình quốc tế mà không biến hệ thống thành một chương trình ôm đồm hoặc một phần mềm không thể hoàn thành.

---
