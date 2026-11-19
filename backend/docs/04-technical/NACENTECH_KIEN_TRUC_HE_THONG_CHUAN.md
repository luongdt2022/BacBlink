---
title: "KIẾN TRÚC NỀN TẢNG NACENTWIN"
subtitle: "Tài liệu kiến trúc chuẩn phục vụ lập kế hoạch triển khai — kế thừa hệ thống hiện hành"
author: "Cơ quan chủ trì: NacenTech — Đơn vị vận hành: NacenX"
date: "03/09/2026"
lang: "vi-VN"
---

## Lời nói đầu

Tài liệu này mô tả kiến trúc của **NacenTwin** — nền tảng chính thức của NacenTech cho giao dịch và thương mại hóa công nghệ. NacenTech giữ vai trò cơ quan chủ trì phía Nhà nước; NacenX giữ vai trò đơn vị phát triển và vận hành. Tài liệu trình bày mô hình nghiệp vụ, kiến trúc phần mềm, mô hình dữ liệu, các quy tắc bất biến và lộ trình triển khai — đủ để đội ngũ sản phẩm, kỹ thuật và vận hành lập backlog, thiết kế chi tiết và kế hoạch chuyển đổi.

Kiến trúc trình bày ở đây **không phải một hệ thống mới thay thế NacenTwin, mà là bước phát triển tiếp theo của chính nền tảng đó**. Bộ mã nguồn hiện hành do SotaTek phát triển được kế thừa toàn bộ và chuyển đổi dần. Hiện trạng thực tế của nền tảng — cái gì đang chạy thật, cái gì mới có giao diện, cái gì chưa bắt đầu — được mô tả tại mục 26.1 theo đúng mức độ hoàn thiện đã kiểm chứng, không theo mức độ đã cam kết trong hồ sơ đề án.

Tài liệu không trình bày lịch sử thay đổi, không so sánh phiên bản và không coi mọi năng lực nêu trong kiến trúc là chức năng phải triển khai đồng thời. Một năng lực có mặt trong tài liệu nghĩa là nó thuộc kiến trúc đích và đã có chỗ đứng rõ ràng trong mô hình; thời điểm xây dựng và kích hoạt năng lực đó do cơ chế cấu hình và các cổng bằng chứng ở mục 10 và mục 27 quyết định.

**Đối tượng đọc.** Tài liệu phục vụ bốn nhóm: lãnh đạo NacenTech và NacenX cần hiểu mô hình vận hành và ranh giới trách nhiệm; kiến trúc sư và trưởng kỹ thuật cần căn cứ để ra quyết định thiết kế chi tiết; đội phát triển cần hiểu cấu trúc phân hệ, mô hình dữ liệu và quy tắc tích hợp; đội vận hành, pháp chế và giám sát cần nắm các bất biến về thẩm quyền, dữ liệu, tiền và trí tuệ nhân tạo.

**Cách đọc.** Mục 1 đến mục 7 trình bày mô hình nghiệp vụ: hệ thống tồn tại để làm gì, ai tham gia, đơn vị nghiệp vụ trung tâm là gì và vòng đời của nó ra sao. Mục 8 đến mục 11 trình bày kiến trúc phần mềm: các lớp, các miền nghiệp vụ, cơ chế cấu hình và mô hình dữ liệu. Mục 12 đến mục 24 đi sâu từng nhóm năng lực theo đúng trình tự một hồ sơ đi qua hệ thống. Mục 25 đến mục 31 trình bày yêu cầu chất lượng, công nghệ, lộ trình, chỉ số, tổ chức, rủi ro và tiêu chí nghiệm thu kiến trúc. Mục 32 là phần đối chiếu quốc tế — căn cứ bằng chứng đứng sau các lựa chọn thiết kế của toàn tài liệu; người đọc muốn hiểu *vì sao* kiến trúc được chọn như vậy có thể đọc mục này trước.

**Nền tảng công nghệ.** Lõi nghiệp vụ mới sử dụng ASP.NET Core trên .NET 10 hỗ trợ dài hạn, triển khai theo kiến trúc nguyên khối phân hệ. Máy chủ dịch vụ NacenTwin hiện hành được đóng băng và thay một lần bằng lõi mới tại một thời điểm cắt chuyển có diễn tập; dữ liệu và hành vi giao diện đang dùng được kế thừa, mã chạy thì không. Hiện trạng kế thừa, căn cứ lựa chọn và trình tự chuyển đổi được trình bày tại mục 26.

**Quy ước thuật ngữ.** Tài liệu dùng tiếng Việt cho mọi khái niệm nghiệp vụ. Một số thuật ngữ trung tâm được dùng thống nhất như sau:

| Thuật ngữ | Nghĩa trong tài liệu |
|---|---|
| NacenTwin | Tên nền tảng — sản phẩm được mô tả trong tài liệu này, gồm cả phần đang vận hành lẫn kiến trúc đích |
| NacenTech | Viện Đổi mới sáng tạo Quốc gia — cơ quan chủ trì, chủ sở hữu nền tảng |
| NacenX | Đơn vị phát triển và vận hành nền tảng theo thỏa thuận vận hành |
| Hồ sơ thương mại hóa | Đơn vị nghiệp vụ trung tâm: một bài toán được theo đuổi từ lúc xác nhận nhu cầu đến khi có kết quả được kiểm chứng |
| Điều phối viên | Người của đơn vị vận hành chịu trách nhiệm chính về tiến độ và chất lượng một hồ sơ |
| Giai đoạn | Một bước trong vòng đời hồ sơ; chuyển giai đoạn phải qua cổng kiểm soát có người phê duyệt |
| Bản | Một phiên bản bất biến của nội dung nghiệp vụ; thay đổi tạo bản mới thay vì sửa đè |
| Đóng băng | Chốt nội dung một bản để mọi quyết định về sau tham chiếu đúng nội dung đó |
| Bằng chứng | Tài liệu, số liệu hoặc xác nhận có nguồn, thời điểm và mã kiểm tra, dùng làm căn cứ quyết định |
| Phân hệ | Đơn vị cấu trúc phần mềm có ranh giới dữ liệu và giao diện riêng trong khối nguyên khối |
| Bộ kết nối | Thành phần tích hợp với một hệ thống bên ngoài, có chủ sở hữu, đối soát và phương án ngắt |
| Hồ sơ cấu hình | Bản khai báo có phiên bản về những năng lực được bật cho một phạm vi tổ chức, ngành hoặc chương trình |

---

## 1. Kết luận kiến trúc

### 1.1 Hệ thống là gì và không là gì

NacenTech không phải là một trang danh mục công nghệ và cũng không phải một sàn giao dịch tự phục vụ. Kinh nghiệm trong nước và quốc tế cho thấy các cổng thông tin chỉ đăng tải công nghệ và chờ hai bên tự tìm nhau hầu như không tạo ra giao dịch thật: doanh nghiệp không mô tả được bài toán của mình theo ngôn ngữ công nghệ, chủ sở hữu công nghệ không chứng minh được quyền và mức sẵn sàng, và không ai chịu trách nhiệm đưa hai phía đi hết quãng đường thẩm định, hợp đồng, thử nghiệm và nghiệm thu.

Vì vậy hệ thống được thiết kế là **hạ tầng quản lý toàn bộ vòng đời của một nhu cầu đổi mới sáng tạo hoặc thương mại hóa công nghệ**, từ khi bài toán được xác định cho đến khi kết quả được kiểm chứng ngoài đời. Đơn vị nghiệp vụ trung tâm là hồ sơ thương mại hóa. Mọi công nghệ, chuyên gia, tổ chức nghiên cứu, phòng thử nghiệm, nguồn vốn, hợp đồng và bằng chứng đều tham gia hệ thống để phục vụ một hồ sơ cụ thể, có người điều phối và có thời hạn — chúng không được tổ chức thành các sàn rời rạc thiếu người chịu trách nhiệm.

Toàn bộ kiến trúc được tổ chức theo một nguyên tắc xuyên suốt:

> Một bài toán — một hồ sơ — một người điều phối chính — một chuỗi quyết định — một bộ bằng chứng — một kết quả được kiểm chứng.

Nguyên tắc này chi phối mọi lựa chọn trong tài liệu: vì cần một chuỗi quyết định liền mạch nên hồ sơ có vòng đời và cổng kiểm soát (mục 7); vì cần một bộ bằng chứng tin được nên dữ liệu có nguồn, phiên bản và nhật ký bất biến (mục 11, mục 22); vì cần người chịu trách nhiệm nên trí tuệ nhân tạo chỉ hỗ trợ chứ không quyết định (mục 23); và vì kết quả phải kiểm chứng được nên bên hưởng lợi không bao giờ tự xác nhận kết quả của chính mình (mục 18).

### 1.2 Phân vai NacenTech và NacenX

Hệ thống do hai chủ thể cùng vận hành với ranh giới trách nhiệm rõ ràng, vì hai lý do: nền tảng cần thẩm quyền và độ tin cậy của phía Nhà nước để kết nối cơ quan, chương trình và dữ liệu công; đồng thời cần kỷ luật thương mại của một đơn vị vận hành tư nhân để dịch vụ có chất lượng, có giá và có người chịu trách nhiệm doanh thu — chi phí.

**NacenTech giữ vai trò phía Nhà nước:** xác lập định hướng, chuẩn dùng chung và yêu cầu vì lợi ích công; giám sát đơn vị vận hành; phê duyệt những chính sách thuộc thẩm quyền; điều phối quan hệ với cơ quan, chương trình và nguồn dữ liệu nhà nước; và bảo đảm khả năng thay đơn vị vận hành khi cần.

**NacenX giữ vai trò đơn vị vận hành:** phát triển và vận hành hệ thống; tiếp nhận, điều phối và theo dõi hồ sơ; tổ chức mạng chuyên gia và đối tác; cung cấp dịch vụ thương mại theo hợp đồng; quản lý bằng chứng, tiến độ và cam kết mức dịch vụ; xuất hóa đơn và thu phí cho các dịch vụ hợp pháp của mình.

Ranh giới quan trọng nhất là ranh giới thẩm quyền: NacenX không có quyền ban hành chính sách nhà nước, cấp chứng nhận, quyết định tài trợ, quyết định mua sắm công, phê duyệt tín dụng hoặc tự xác nhận kết quả do chính mình thực hiện. Mọi thiết kế phân quyền, tính phí và kiểm tra trong tài liệu đều được xây để ranh giới này không thể bị vượt qua bằng cấu hình, tài khoản quản trị hay trí tuệ nhân tạo.

### 1.3 Mô hình tiến hóa của hệ thống

Hệ thống sử dụng mô hình **lõi ổn định — cấu hình có phiên bản — mở rộng bằng phân hệ và bộ kết nối** (chi tiết tại mục 10). Lõi giữ những bất biến không được phép thay đổi bằng cấu hình: vòng đời hồ sơ, thẩm quyền, phân quyền, tiền, bằng chứng, kiểm tra và giới hạn của trí tuệ nhân tạo. Mọi điểm khác biệt theo ngành, địa phương, chương trình hoặc khách hàng được thể hiện bằng cấu hình có phê duyệt và có hiệu lực theo thời điểm. Toàn bộ năng lực dài hạn được giữ trong kiến trúc, nhưng mỗi lần triển khai chỉ kích hoạt những năng lực có người trả tiền, người chịu trách nhiệm, căn cứ pháp lý, đối tác thực hiện và tiêu chí nghiệm thu rõ ràng.

Cách tiếp cận này trả lời trực tiếp hai rủi ro lớn nhất của các dự án nền tảng công: xây quá nhiều chức năng trước khi có ai dùng, và nhân bản hệ thống theo từng địa phương đến mức không thể bảo trì. Hệ thống chỉ có một mã nguồn, một cấu trúc dữ liệu chuẩn; sự đa dạng nằm ở cấu hình, không nằm ở các bản sao.

---

## 2. Mục tiêu và giới hạn

### 2.1 Mục tiêu

Thước đo cuối cùng của hệ thống không phải là số tài khoản hay số công nghệ được đăng, mà là số bài toán thật được giải quyết với kết quả kiểm chứng được. Để đạt điều đó, hệ thống phải giúp thực hiện trọn một chuỗi công việc mà hiện nay đang đứt gãy giữa nhiều tổ chức:

- biến vấn đề của doanh nghiệp hoặc cơ quan thành nhu cầu có thể xử lý, với chủ sở hữu vấn đề, người có quyền quyết định và đường ngân sách được xác định;
- tìm công nghệ, chuyên gia và hạ tầng phù hợp, có giải thích và có bằng chứng;
- tổ chức thẩm định kỹ thuật, thị trường, quyền sở hữu trí tuệ và khả năng tiếp nhận;
- thiết kế thử nghiệm có mục tiêu, số liệu gốc và điều kiện nghiệm thu được chốt trước;
- kết nối nguồn hỗ trợ, tổ chức tài chính và khách hàng mua thử;
- quản lý thỏa thuận, mốc công việc, bằng chứng và nghĩa vụ của các bên;
- hỗ trợ chuyển giao, đào tạo và đưa công nghệ vào vận hành;
- đo kết quả sau 6, 12 và 24 tháng;
- cung cấp số liệu tổng hợp phục vụ quản lý và hoạch định chính sách theo đúng thẩm quyền.

Chuỗi này chính là khung của vòng đời hồ sơ tại mục 7; mỗi gạch đầu dòng ở trên tương ứng với một hoặc một vài giai đoạn có cổng kiểm soát riêng.

### 2.2 Phạm vi nghiệp vụ

Phạm vi của hệ thống bao trùm các nhóm năng lực sau, được trình bày chi tiết ở các mục 12 đến 20: tiếp nhận và xác nhận nhu cầu; chuẩn hóa hồ sơ công nghệ; điều phối viên công nghệ và mạng chuyên gia; tìm kiếm và đề xuất phương án; thẩm định, định giá và rà soát chuyên sâu; phòng dữ liệu và quản lý quyền truy cập; thiết kế thỏa thuận và hợp đồng; thử nghiệm, chuyển giao và nghiệm thu; kết nối tài chính, chương trình hỗ trợ và đầu tư; vận hành sau chuyển giao; đào tạo và nhân rộng mô hình đã kiểm chứng; dịch vụ chuyên môn; bảo đảm chuyển đổi số và đổi mới sáng tạo; kết nối địa phương và quốc tế; quản lý bằng chứng và báo cáo kết quả.

### 2.3 Những việc hệ thống không thực hiện

Danh sách phủ định dưới đây quan trọng không kém danh sách mục tiêu, vì phần lớn rủi ro pháp lý và rủi ro liêm chính của một nền tảng công — tư nằm ở việc nền tảng lấn sang thẩm quyền của tổ chức khác hoặc tự xác nhận kết quả của chính mình. Hệ thống không:

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

Mỗi điều cấm ở đây đều có cơ chế kỹ thuật bảo đảm tương ứng: mô hình phân quyền theo nhiệm vụ (mục 24), sổ theo dõi tách biệt (mục 19), cổng hành động của trí tuệ nhân tạo (mục 23), nguyên tắc một lõi dùng chung (mục 10) và các tiêu chí nghiệm thu tại mục 31.

---

## 3. Mô hình tổ chức và phân vai

### 3.1 Bức tranh tổng thể

Hệ thống nằm ở giao điểm của nhiều tổ chức vốn hoạt động độc lập: doanh nghiệp có bài toán, viện trường có công nghệ, chuyên gia có năng lực, phòng thử nghiệm có thẩm quyền đo kiểm, tổ chức tài chính có vốn và cơ quan nhà nước có chính sách. Giá trị của nền tảng nằm ở chỗ nối các bên này lại quanh từng hồ sơ cụ thể — trong khi mỗi bên vẫn giữ nguyên thẩm quyền và nguồn dữ liệu của mình. Sơ đồ dưới đây thể hiện quan hệ đó.

<figure class="fig">
<svg viewBox="0 0 680 480" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#52687a"/>
    </marker>
  </defs>
  <!-- NacenTech / NacenX -->
  <rect x="50" y="18" width="200" height="60" rx="6" fill="#dbe7f1" stroke="#12365a"/>
  <text x="150" y="42" text-anchor="middle" font-size="13" font-weight="bold" fill="#12365a">NacenTech</text>
  <text x="150" y="60" text-anchor="middle" font-size="11" fill="#3e5265">Cơ quan chủ trì phía Nhà nước</text>
  <rect x="430" y="18" width="200" height="60" rx="6" fill="#dbe7f1" stroke="#12365a"/>
  <text x="530" y="42" text-anchor="middle" font-size="13" font-weight="bold" fill="#12365a">NacenX</text>
  <text x="530" y="60" text-anchor="middle" font-size="11" fill="#3e5265">Đơn vị phát triển và vận hành</text>
  <line x1="250" y1="48" x2="430" y2="48" stroke="#52687a" marker-end="url(#ar)" marker-start="url(#ar)"/>
  <text x="340" y="40" text-anchor="middle" font-size="10.5" fill="#52687a">thỏa thuận vận hành — giám sát</text>
  <!-- Platform core -->
  <rect x="215" y="150" width="250" height="120" rx="8" fill="#12365a"/>
  <text x="340" y="182" text-anchor="middle" font-size="14" font-weight="bold" fill="#ffffff">Nền tảng NacenTech</text>
  <text x="340" y="204" text-anchor="middle" font-size="11" fill="#cfe0ee">Hồ sơ thương mại hóa · vòng đời và cổng kiểm soát</text>
  <text x="340" y="222" text-anchor="middle" font-size="11" fill="#cfe0ee">Phòng dữ liệu · bằng chứng · quyết định</text>
  <text x="340" y="240" text-anchor="middle" font-size="11" fill="#cfe0ee">Điều phối · tính phí · nhật ký kiểm tra</text>
  <!-- links from principals -->
  <line x1="150" y1="78" x2="255" y2="150" stroke="#52687a" marker-end="url(#ar)"/>
  <text x="150" y="118" text-anchor="middle" font-size="10.5" fill="#52687a">chính sách, chuẩn, giám sát</text>
  <line x1="530" y1="78" x2="425" y2="150" stroke="#52687a" marker-end="url(#ar)"/>
  <text x="530" y="118" text-anchor="middle" font-size="10.5" fill="#52687a">phát triển, vận hành, dịch vụ</text>
  <!-- Left actors -->
  <rect x="15" y="152" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="97" y="171" text-anchor="middle" font-size="11.5" fill="#12365a">Doanh nghiệp</text>
  <text x="97" y="187" text-anchor="middle" font-size="11.5" fill="#12365a">có nhu cầu</text>
  <rect x="15" y="216" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="97" y="235" text-anchor="middle" font-size="11.5" fill="#12365a">Chủ sở hữu công nghệ,</text>
  <text x="97" y="251" text-anchor="middle" font-size="11.5" fill="#12365a">viện, trường</text>
  <rect x="15" y="280" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="97" y="299" text-anchor="middle" font-size="11.5" fill="#12365a">Chuyên gia và</text>
  <text x="97" y="315" text-anchor="middle" font-size="11.5" fill="#12365a">tổ chức thẩm định</text>
  <line x1="180" y1="175" x2="215" y2="185" stroke="#52687a" marker-end="url(#ar)"/>
  <line x1="180" y1="239" x2="215" y2="215" stroke="#52687a" marker-end="url(#ar)"/>
  <line x1="180" y1="303" x2="215" y2="250" stroke="#52687a" marker-end="url(#ar)"/>
  <!-- Right actors -->
  <rect x="500" y="152" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="582" y="171" text-anchor="middle" font-size="11.5" fill="#12365a">Quỹ, ngân hàng,</text>
  <text x="582" y="187" text-anchor="middle" font-size="11.5" fill="#12365a">tổ chức tài chính</text>
  <rect x="500" y="216" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="582" y="235" text-anchor="middle" font-size="11.5" fill="#12365a">Phòng thử nghiệm,</text>
  <text x="582" y="251" text-anchor="middle" font-size="11.5" fill="#12365a">tổ chức chứng nhận</text>
  <rect x="500" y="280" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="582" y="299" text-anchor="middle" font-size="11.5" fill="#12365a">Cơ quan nhà nước,</text>
  <text x="582" y="315" text-anchor="middle" font-size="11.5" fill="#12365a">chương trình hỗ trợ</text>
  <line x1="500" y1="175" x2="465" y2="185" stroke="#52687a" marker-end="url(#ar)"/>
  <line x1="500" y1="239" x2="465" y2="215" stroke="#52687a" marker-end="url(#ar)"/>
  <line x1="500" y1="303" x2="465" y2="250" stroke="#52687a" marker-end="url(#ar)"/>
  <!-- Bottom actors -->
  <rect x="150" y="390" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="232" y="409" text-anchor="middle" font-size="11.5" fill="#12365a">Trung tâm địa phương</text>
  <text x="232" y="425" text-anchor="middle" font-size="11.5" fill="#12365a">(mạng trong nước)</text>
  <rect x="365" y="390" width="165" height="46" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="447" y="409" text-anchor="middle" font-size="11.5" fill="#12365a">Đối tác quốc tế</text>
  <text x="447" y="425" text-anchor="middle" font-size="11.5" fill="#12365a">(hành lang hợp tác)</text>
  <line x1="270" y1="390" x2="300" y2="270" stroke="#52687a" marker-end="url(#ar)"/>
  <line x1="420" y1="390" x2="390" y2="270" stroke="#52687a" marker-end="url(#ar)"/>
  <text x="340" y="462" text-anchor="middle" font-size="10.5" fill="#52687a">giới thiệu hồ sơ · năng lực theo địa bàn · nguồn công nghệ</text>
</svg>
<figcaption>Hình 1. Sơ đồ ngữ cảnh: nền tảng nối các bên quanh hồ sơ thương mại hóa; mỗi bên giữ nguyên thẩm quyền và nguồn dữ liệu của mình.</figcaption>
</figure>

### 3.2 Các bên tham gia và trách nhiệm

Bảng dưới đây liệt kê đầy đủ các bên trong sơ đồ trên cùng trách nhiệm chính của từng bên. Điểm cần lưu ý: các bên bên phải sơ đồ (tài chính, thử nghiệm, cơ quan nhà nước) là những chủ thể **ra quyết định ngoài hệ thống**; nền tảng chỉ ghi nhận quyết định của họ từ nguồn hợp lệ, không bao giờ thay họ quyết định.

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
| Doanh nghiệp khởi nghiệp | Đưa công nghệ hoặc giải pháp ở giai đoạn sớm, tìm khách hàng đầu tiên, năng lực triển khai và vốn |
| Nhà đầu tư | Quyết định rót vốn theo tiêu chí riêng; sử dụng hồ sơ đã chuẩn hóa để rút ngắn thẩm định |

Hai bên cuối được tách riêng khỏi "doanh nghiệp có nhu cầu" và "tổ chức tài chính" vì họ tham gia theo cách khác: doanh nghiệp khởi nghiệp vừa là bên cung công nghệ vừa là bên cần vốn và khách hàng đầu tiên; nhà đầu tư ra quyết định theo khẩu vị rủi ro riêng chứ không theo quy trình tín dụng. Cả hai đều thuộc nhóm **ra quyết định ngoài hệ thống** — nền tảng chuẩn bị hồ sơ và ghi nhận kết quả, không bao giờ thay họ quyết định (mục 19.7).

### 3.3 Tách quyền bắt buộc

Khi một nền tảng vừa điều phối, vừa cung cấp dịch vụ, vừa tiếp cận dữ liệu của nhiều bên, rủi ro lớn nhất là xung đột lợi ích: bên bán giải pháp tự thẩm định giải pháp của mình, bên thu phí tự xác nhận điều kiện thanh toán, hay đơn vị vận hành dùng vị thế nền tảng để bán dịch vụ riêng. Kiến trúc xử lý rủi ro này bằng nguyên tắc tách quyền: các cặp quyền sau không được giao cho cùng một chủ thể khi có xung đột:

- đặt chính sách và vận hành chính sách;
- cung cấp giải pháp và thẩm định độc lập giải pháp đó;
- nhận tiền và tự xác nhận điều kiện thanh toán;
- điều phối hồ sơ và tự xác nhận kết quả cuối;
- tư vấn chuẩn bị hồ sơ và ban hành quyết định công nhận;
- quản trị hệ thống và tự cấp thẩm quyền nghiệp vụ.

Mọi trường hợp buộc phải kiêm nhiệm phải có căn cứ rõ ràng, công khai quan hệ lợi ích, có người phê duyệt độc lập và để lại dấu vết kiểm tra. Nguyên tắc này được thi hành bằng mô hình phân quyền tại mục 24 và được kiểm chứng bằng nhóm tiêu chí nghiệm thu 31.3.

### 3.4 Thỏa thuận vận hành nền tảng

Quan hệ giữa NacenTech và NacenX không thể chỉ dựa trên thiện chí; nó phải được ràng buộc bằng một thỏa thuận vận hành nền tảng, vì hai lý do. Thứ nhất, đơn vị vận hành nắm hệ thống, dữ liệu và quan hệ khách hàng hằng ngày — nếu thiếu ràng buộc, phía Nhà nước sẽ mất khả năng giám sát thực chất và mất khả năng thay thế đơn vị vận hành. Thứ hai, đơn vị vận hành cần sự bảo đảm ngược lại về phạm vi nhiệm vụ và cơ chế phí để dám đầu tư dài hạn.

Thỏa thuận tối thiểu phải quy định: phạm vi nhiệm vụ và thẩm quyền; cam kết mức dịch vụ; cách tính và công khai mức phí; vai trò đối với dữ liệu; quyền sở hữu và quyền sử dụng phần mềm; yêu cầu an toàn, kiểm tra và xử lý sự cố; quyền truy cập mã nguồn, bản dựng, khóa và bản sao lưu; quyền can thiệp tạm thời khi đơn vị vận hành không đáp ứng; và điều kiện chấm dứt kèm nghĩa vụ chuyển giao cho đơn vị kế nhiệm. Yêu cầu kỹ thuật tương ứng — gói chuyển giao gồm dữ liệu, mã nguồn, bản dựng, khóa và tài liệu vận hành — được nêu tại mục 25.2 và tiêu chí nghiệm thu 65.

---

## 4. Nguyên tắc thiết kế

Mười bốn nguyên tắc dưới đây là căn cứ để phân xử mọi tranh luận thiết kế trong quá trình triển khai. Khi hai phương án cùng khả thi, phương án phù hợp nguyên tắc được chọn; khi một yêu cầu mới mâu thuẫn với nguyên tắc, yêu cầu đó phải được đưa lên cấp có thẩm quyền quyết định thay vì âm thầm phá vỡ nguyên tắc.

**Về nghiệp vụ:**

1. **Bắt đầu từ nhu cầu thật, không bắt đầu từ danh mục công nghệ.** Danh mục không có người mua chỉ tạo chi phí duy trì; một nhu cầu có ngân sách kéo theo mọi thứ còn lại.
2. **Mỗi hồ sơ có một điều phối viên chính và thời hạn xử lý.** Trách nhiệm không chia được cho một tập thể vô danh.
3. **Mọi quyết định quan trọng phải có người chịu trách nhiệm.** Hệ thống ghi lại ai quyết định, dựa trên bằng chứng nào, theo chính sách nào.
4. **Thành công được đo bằng thỏa thuận, thử nghiệm, chuyển giao và kết quả** — không đo bằng số tài khoản hoặc lượt xem (mục 28).

**Về dữ liệu và nguồn sự thật:**

5. **Hệ thống giữ nguồn sự thật về quy trình; dữ liệu chuyên ngành vẫn thuộc nguồn có thẩm quyền.** Giai đoạn hồ sơ do hệ thống quyết định; tình trạng bằng sáng chế do cơ quan đăng ký quyết định.
6. **Mọi dữ liệu từ bên ngoài phải có nguồn, thời điểm, quyền sử dụng và dấu vết thay đổi** (mục 22.2).
7. **Quyền truy cập được cấp theo nhiệm vụ, mục đích và thời hạn** — không cấp theo tư cách thành viên chung chung (mục 24).

**Về trí tuệ nhân tạo:**

8. **Trí tuệ nhân tạo chỉ hỗ trợ; quyền quyết định vẫn thuộc con người hoặc cơ quan có thẩm quyền.** Toàn bộ mục 23 là sự cụ thể hóa nguyên tắc này.

**Về tăng trưởng và hiệu quả kinh tế:**

9. **Hệ thống được mở rộng theo bằng chứng về nhu cầu và hiệu quả kinh tế**, không mở rộng theo biên bản ghi nhớ hoặc số kết nối (mục 21.5, mục 27).
10. **Không cải thiện lợi nhuận bằng cách hạ chuẩn an toàn, độc lập hoặc liêm chính.**

**Về kỹ thuật:**

11. **Không sao chép hệ thống theo địa phương; dùng chung lõi và cấu hình theo phạm vi** (mục 10.6).
12. **Tích hợp bên ngoài không được làm mất khả năng vận hành độc lập của lõi.** Bộ kết nối hỏng thì hạ về quy trình thủ công, không kéo sập nghiệp vụ chính (mục 10.7).
13. **Thay máy chủ dịch vụ một lần có diễn tập; kế thừa dữ liệu và hành vi giao diện, không kế thừa mã chạy** (mục 26.6). Cắt một lần là quyết định về nền tảng chạy, không phải về phạm vi chức năng: năng lực vẫn chỉ được bật theo hồ sơ cấu hình (mục 10).
14. **Mọi khả năng quan trọng phải kiểm thử được và kiểm tra lại được.** Nếu không viết được kịch bản kiểm thử cho một quy tắc, quy tắc đó chưa đủ rõ để triển khai.

---

## 5. Đơn vị nghiệp vụ trung tâm

### 5.1 Hồ sơ thương mại hóa

Hồ sơ thương mại hóa là đối tượng trung tâm xuyên suốt hệ thống — tương đương "bệnh án" của một bài toán đổi mới sáng tạo. Mọi phân hệ khác đều đọc hoặc ghi vào hồ sơ; mọi màn hình nghiệp vụ đều là một góc nhìn khác nhau lên cùng dữ liệu hồ sơ; mọi khoản phí đều gắn với một hồ sơ hoặc một dịch vụ độc lập có định danh riêng. Thiết kế này bảo đảm rằng khi có tranh chấp hoặc kiểm tra, toàn bộ chuỗi sự việc — ai yêu cầu, ai quyết định, dựa trên bằng chứng nào, tốn bao nhiêu tiền, kết quả ra sao — có thể được dựng lại từ một điểm truy cập duy nhất.

Một hồ sơ tối thiểu bao gồm: mã định danh ổn định; tổ chức có nhu cầu; chủ sở hữu vấn đề; người có quyền quyết định; bản mô tả nhu cầu đang có hiệu lực; loại giao dịch; điều phối viên chính; giai đoạn hiện tại; chính sách áp dụng đã được đóng băng; danh sách các bên tham gia; danh sách nghĩa vụ; tài liệu và quyền truy cập; lịch sử quyết định; nguồn tài chính dự kiến; tiêu chí kết quả; và trạng thái kết thúc kèm lý do.

Ba thành phần trong danh sách trên đáng giải thích thêm. **Chính sách đóng băng** nghĩa là tại thời điểm hồ sơ được xác nhận, hệ thống chụp lại toàn bộ chính sách áp dụng (tiêu chí, mức phí, thời hạn, yêu cầu bằng chứng) thành một bản bất biến; chính sách thay đổi về sau không làm thay đổi luật chơi của hồ sơ đang chạy. **Lịch sử quyết định** là chuỗi ghi nối tiếp không sửa được — nền tảng của khả năng kiểm tra. **Tiêu chí kết quả** được chốt trước khi thực hiện, để không ai có thể định nghĩa lại thành công sau khi đã biết kết quả.

### 5.2 Quy tắc bất biến của hồ sơ

Các quy tắc sau được thi hành trong mã nguồn lõi và không thể bị vô hiệu bằng cấu hình (xem mục 10.5):

- không thể xác nhận hồ sơ khi thiếu chủ sở hữu vấn đề, người quyết định hoặc đường ngân sách;
- không thể chuyển giai đoạn khi thiếu bằng chứng bắt buộc;
- không được xóa hoặc sửa ngầm quyết định cũ;
- thay đổi phạm vi phải tạo bản mới và ghi lý do;
- một hồ sơ chỉ có một giai đoạn có hiệu lực tại một thời điểm;
- tài liệu mật không tự động mở cho mọi người tham gia hồ sơ;
- người cung cấp giải pháp không được tự xác nhận kết quả của chính mình;
- mọi khoản phí phải gắn với thỏa thuận và điều kiện phát sinh rõ ràng.

Đây không phải quy ước vận hành mà là bất biến kiến trúc: mỗi quy tắc có kiểm thử tự động tương ứng và xuất hiện lại trong tiêu chí nghiệm thu tại mục 31.1.

### 5.3 Hồ sơ dịch vụ độc lập

Không phải nhu cầu nào cũng là một giao dịch công nghệ. Doanh nghiệp có thể chỉ cần tuyển một lãnh đạo công nghệ bán thời gian, tư vấn ISO, hoặc một đợt chẩn đoán chuyển đổi số. Nếu ép các nhu cầu này vào hồ sơ thương mại hóa, hệ thống sẽ tạo ra những "giao dịch giả" làm sai lệch chỉ số và làm nặng quy trình. Vì vậy hệ thống có loại **hồ sơ dịch vụ độc lập** dành cho: tuyển dụng hoặc bố trí lãnh đạo công nghệ bán thời gian; tư vấn ISO, hợp chuẩn, hợp quy hoặc chuẩn bị hồ sơ công nhận; chẩn đoán chuyển đổi số độc lập; và dịch vụ vận hành định kỳ không gắn một giao dịch công nghệ cụ thể.

Hồ sơ dịch vụ có vòng đời đơn giản hơn nhưng dùng chung nền tảng phân quyền, tài liệu, tính phí và kiểm tra. Khi trong quá trình phục vụ xuất hiện nhu cầu thử nghiệm, chuyển giao hoặc mua giải pháp thật, hồ sơ dịch vụ dẫn đến việc mở một hồ sơ thương mại hóa mới, có liên kết hai chiều.

---

## 6. Các loại giao dịch

Hồ sơ thương mại hóa thuộc một trong ba loại giao dịch. Ba loại này khác nhau ở điểm xuất phát và ở sản phẩm cuối, nhưng dùng chung vòng đời, phòng dữ liệu, mạng chuyên gia và cơ chế bằng chứng — nhờ đó hệ thống không phải xây ba quy trình riêng.

### 6.1 Giải quyết bài toán bằng thử nghiệm

Đây là loại giao dịch chủ đạo và là lý do hệ thống được xây theo hướng "nhu cầu đi trước": doanh nghiệp hoặc cơ quan có một bài toán cụ thể và cần tìm, thử, rồi quyết định áp dụng một giải pháp. Chuỗi giá trị của loại này là chẩn đoán → tìm phương án → thẩm định → thử nghiệm trả phí → quyết định triển khai. Kết quả tối thiểu phải đạt: bài toán và số liệu gốc được xác nhận; danh sách phương án phù hợp; thỏa thuận thử nghiệm; tiêu chí nghiệm thu; báo cáo kết quả độc lập; và quyết định triển khai, điều chỉnh hoặc dừng.

### 6.2 Chuyển giao công nghệ

Áp dụng khi có nhu cầu mua, nhận chuyển giao hoặc cấp quyền sử dụng công nghệ và bí quyết — thường phát sinh sau một thử nghiệm thành công hoặc khi doanh nghiệp đã xác định rõ công nghệ cần mua. Trọng tâm của loại này là quyền: kết quả tối thiểu gồm quyền sở hữu và quyền chuyển giao được làm rõ; phạm vi quyền sử dụng; điều kiện tài chính; kế hoạch bàn giao; tài liệu, đào tạo và hỗ trợ; và bằng chứng bên nhận đã tiếp nhận, vận hành được (chi tiết tại mục 18.4).

### 6.3 Sử dụng hạ tầng và năng lực dùng chung

Áp dụng khi doanh nghiệp cần phòng thử nghiệm, thiết bị, chuyên gia hoặc dịch vụ nghiên cứu — không mua công nghệ mà mua năng lực thực hiện. Kết quả tối thiểu gồm phạm vi dịch vụ; năng lực và điều kiện sử dụng; thỏa thuận dịch vụ; sản phẩm bàn giao; và kết quả được xác nhận.

### 6.4 Các lớp hỗ trợ dùng chung

Cả ba loại giao dịch cùng sử dụng các lớp hỗ trợ: mạng địa phương, hợp tác quốc tế, kết nối cơ quan nhà nước, mạng chuyên gia, phòng dữ liệu, tài chính và chương trình hỗ trợ, kết nối đầu tư, vận hành sau chuyển giao, đào tạo và nhân rộng, và quản lý bằng chứng. Điểm cần nhấn mạnh về mặt kiến trúc: **các lớp hỗ trợ không tạo thêm loại giao dịch mới**. Hợp tác quốc tế không phải là "giao dịch quốc tế" riêng — nó là một hồ sơ thuộc một trong ba loại trên, có thêm các bước kiểm soát xuyên biên giới. Tương tự, kết nối đầu tư (mục 19.7) không phải "giao dịch đầu tư" và đào tạo, nhân rộng (mục 18.6) không phải "giao dịch đào tạo": cả hai gắn vào một hồ sơ đã có, hoặc vào một hồ sơ dịch vụ độc lập theo mục 5.3. Quy tắc này giữ cho mô hình dữ liệu và vòng đời không phình ra theo mỗi sáng kiến mới.

---

## 7. Vòng đời hồ sơ và cổng kiểm soát

### 7.1 Tổng quan

Vòng đời hồ sơ là "xương sống" của toàn hệ thống: nó xác định thứ tự công việc, điều kiện được đi tiếp và điểm dừng của mỗi hồ sơ. Mười một giai đoạn được thiết kế theo nguyên tắc **mỗi lần chuyển giai đoạn là một quyết định có người phê duyệt, có chính sách áp dụng và có bằng chứng** — không phải một thao tác kéo thả tự do. Nhờ đó, tiến độ của hồ sơ đồng thời là dấu vết trách nhiệm.

<figure class="fig">
<svg viewBox="0 0 680 320" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#3e5265"/>
    </marker>
  </defs>
  <!-- Row 1 -->
  <rect x="10" y="22" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="80" y="48" text-anchor="middle" font-size="11.5" fill="#12365a">1. Tiếp nhận</text>
  <rect x="180" y="22" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="250" y="42" text-anchor="middle" font-size="11.5" fill="#12365a">2. Xác nhận</text>
  <text x="250" y="57" text-anchor="middle" font-size="11.5" fill="#12365a">nhu cầu</text>
  <rect x="350" y="22" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="420" y="42" text-anchor="middle" font-size="11.5" fill="#12365a">3. Tìm kiếm</text>
  <text x="420" y="57" text-anchor="middle" font-size="11.5" fill="#12365a">phương án</text>
  <rect x="520" y="22" width="150" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="595" y="42" text-anchor="middle" font-size="11.5" fill="#12365a">4. Trao đổi</text>
  <text x="595" y="57" text-anchor="middle" font-size="11.5" fill="#12365a">có kiểm soát</text>
  <line x1="150" y1="44" x2="180" y2="44" stroke="#3e5265" marker-end="url(#ar2)"/>
  <line x1="320" y1="44" x2="350" y2="44" stroke="#3e5265" marker-end="url(#ar2)"/>
  <line x1="490" y1="44" x2="520" y2="44" stroke="#3e5265" marker-end="url(#ar2)"/>
  <!-- Down to row 2 -->
  <line x1="595" y1="66" x2="595" y2="96" stroke="#3e5265" marker-end="url(#ar2)"/>
  <!-- Row 2 (right to left) -->
  <rect x="520" y="96" width="150" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="595" y="122" text-anchor="middle" font-size="11.5" fill="#12365a">5. Thẩm định</text>
  <rect x="350" y="96" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="420" y="116" text-anchor="middle" font-size="11.5" fill="#12365a">6. Thiết kế</text>
  <text x="420" y="131" text-anchor="middle" font-size="11.5" fill="#12365a">thỏa thuận</text>
  <rect x="180" y="96" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="250" y="122" text-anchor="middle" font-size="11.5" fill="#12365a">7. Ký kết</text>
  <rect x="10" y="96" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="80" y="122" text-anchor="middle" font-size="11.5" fill="#12365a">8. Thực hiện</text>
  <line x1="520" y1="118" x2="490" y2="118" stroke="#3e5265" marker-end="url(#ar2)"/>
  <line x1="350" y1="118" x2="320" y2="118" stroke="#3e5265" marker-end="url(#ar2)"/>
  <line x1="180" y1="118" x2="150" y2="118" stroke="#3e5265" marker-end="url(#ar2)"/>
  <!-- Down to row 3 -->
  <line x1="80" y1="140" x2="80" y2="170" stroke="#3e5265" marker-end="url(#ar2)"/>
  <!-- Row 3 -->
  <rect x="10" y="170" width="140" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="80" y="190" text-anchor="middle" font-size="11.5" fill="#12365a">9. Xác minh</text>
  <text x="80" y="205" text-anchor="middle" font-size="11.5" fill="#12365a">kết quả</text>
  <rect x="180" y="170" width="160" height="44" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="260" y="190" text-anchor="middle" font-size="11.5" fill="#12365a">10. Theo dõi</text>
  <text x="260" y="205" text-anchor="middle" font-size="11.5" fill="#12365a">sau thực hiện (6–24 th.)</text>
  <rect x="370" y="170" width="120" height="44" rx="6" fill="#12365a"/>
  <text x="430" y="196" text-anchor="middle" font-size="11.5" fill="#ffffff">11. Kết thúc</text>
  <line x1="150" y1="192" x2="180" y2="192" stroke="#3e5265" marker-end="url(#ar2)"/>
  <line x1="340" y1="192" x2="370" y2="192" stroke="#3e5265" marker-end="url(#ar2)"/>
  <!-- Suspended state -->
  <rect x="520" y="170" width="150" height="44" rx="6" fill="#fdf3e3" stroke="#b45309" stroke-dasharray="5,3"/>
  <text x="595" y="190" text-anchor="middle" font-size="11.5" fill="#8a4a08">Tạm dừng</text>
  <text x="595" y="205" text-anchor="middle" font-size="10" fill="#8a4a08">(từ mọi giai đoạn)</text>
  <!-- Legend -->
  <rect x="10" y="248" width="660" height="56" rx="6" fill="#f4f7fa" stroke="#c6d3de"/>
  <text x="24" y="270" font-size="11" fill="#3e5265">Mỗi mũi tên là một cổng kiểm soát: có người yêu cầu, người phê duyệt, chính sách áp dụng và bằng chứng kèm theo.</text>
  <text x="24" y="290" font-size="11" fill="#3e5265">Một hồ sơ chỉ có một giai đoạn hiệu lực tại một thời điểm; hai yêu cầu chuyển đồng thời chỉ một yêu cầu được chấp nhận.</text>
</svg>
<figcaption>Hình 2. Vòng đời hồ sơ thương mại hóa: mười một giai đoạn nối bằng cổng kiểm soát, kèm trạng thái tạm dừng có thể kích hoạt từ mọi giai đoạn.</figcaption>
</figure>

### 7.2 Các giai đoạn và điều kiện ra

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

Điều kiện ra của mỗi giai đoạn không phải danh sách kiểm tra hình thức: bằng chứng đáp ứng điều kiện được gắn vào quyết định chuyển giai đoạn và không thể thay thế hồi tố. Hai giai đoạn "Xác nhận nhu cầu" và "Xác minh kết quả" là hai cổng nghiêm ngặt nhất — cổng đầu chặn việc hệ thống tiêu tốn nguồn lực cho nhu cầu không có thật, cổng cuối chặn việc tuyên bố thành công không có căn cứ.

### 7.3 Quyết định chuyển giai đoạn

Mỗi lần chuyển giai đoạn tạo một bản ghi quyết định gồm: giai đoạn cũ và mới; người yêu cầu; người phê duyệt; chính sách áp dụng; bằng chứng được sử dụng; điều kiện chưa hoàn tất (nếu chuyển có điều kiện); thời gian; và lý do. Bản ghi này thuộc lịch sử quyết định bất biến của hồ sơ.

Về mặt kỹ thuật, chuyển giai đoạn dùng cơ chế khóa lạc quan: hai yêu cầu chuyển đồng thời trên cùng hồ sơ chỉ được chấp nhận một; yêu cầu còn lại nhận thông báo xung đột kèm dữ liệu hiện hành để người dùng quyết định lại. Cơ chế này loại bỏ khả năng hồ sơ "nhảy" hai giai đoạn hoặc hai người cùng phê duyệt chồng nhau.

### 7.4 Tạm dừng và mở lại

Tạm dừng là trạng thái đặc biệt có thể kích hoạt từ mọi giai đoạn, dùng khi hồ sơ không còn đủ điều kiện để tiếp tục một cách chính đáng: thiếu người chịu trách nhiệm; quyền sở hữu trí tuệ chưa rõ; có xung đột lợi ích chưa xử lý; dữ liệu hoặc quyền truy cập không hợp lệ; nguồn vốn không còn; yêu cầu pháp lý chưa được làm rõ; hoặc có sự cố an toàn nghiêm trọng.

Tạm dừng không phải là kết thúc mềm: hồ sơ tạm dừng vẫn giữ nguyên nghĩa vụ bảo mật và dấu vết, và việc mở lại đòi hỏi một quyết định mới, một người chịu trách nhiệm và bằng chứng rằng nguyên nhân tạm dừng đã được xử lý. Hồ sơ mất người phụ trách bị hệ thống tự động đưa vào tạm dừng (tiêu chí nghiệm thu 7) — không tồn tại hồ sơ "trôi" không ai chịu trách nhiệm.

---

## 8. Kiến trúc tổng thể

Hệ thống được tổ chức thành sáu lớp, từ điểm tiếp xúc người dùng xuống đến hạ tầng. Cách phân lớp này phục vụ hai mục đích: thứ nhất, mỗi lớp có thể thay đổi công nghệ hoặc mở rộng quy mô mà không kéo theo các lớp khác; thứ hai, các quy tắc an toàn được đặt đúng tầng — phân quyền nằm ở lớp nghiệp vụ chứ không chỉ ở cổng vào, tích hợp bên ngoài bị cách ly ở lớp riêng chứ không len vào giữa nghiệp vụ.

<figure class="fig">
<svg viewBox="0 0 680 480" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <!-- Layer 1 -->
  <rect x="10" y="14" width="660" height="66" rx="6" fill="#dbe7f1" stroke="#12365a"/>
  <text x="24" y="38" font-size="12" font-weight="bold" fill="#12365a">1. Lớp người sử dụng</text>
  <text x="24" y="56" font-size="11" fill="#3e5265">Cổng doanh nghiệp · Cổng đơn vị cung cấp công nghệ · Bàn làm việc điều phối viên · Bàn làm việc chuyên gia</text>
  <text x="24" y="72" font-size="11" fill="#3e5265">Bàn vận hành sau chuyển giao · Cổng đối tác địa phương, quốc tế · Cổng quản trị và giám sát</text>
  <!-- Layer 2 -->
  <rect x="10" y="90" width="660" height="66" rx="6" fill="#e8eef5" stroke="#12365a"/>
  <text x="24" y="114" font-size="12" font-weight="bold" fill="#12365a">2. Lớp nghiệp vụ (các phân hệ trong khối nguyên khối)</text>
  <text x="24" y="132" font-size="11" fill="#3e5265">Nhu cầu · Công nghệ · Hồ sơ thương mại hóa · Chuyên gia · Tìm kiếm và thẩm định · Phòng dữ liệu</text>
  <text x="24" y="148" font-size="11" fill="#3e5265">Thỏa thuận · Thực hiện và kết quả · Tài chính, chương trình và đầu tư · Dịch vụ chuyên môn · Sau chuyển giao</text>
  <!-- Layer 3 -->
  <rect x="10" y="166" width="660" height="66" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="24" y="190" font-size="12" font-weight="bold" fill="#12365a">3. Lớp dùng chung</text>
  <text x="24" y="208" font-size="11" fill="#3e5265">Định danh và phân quyền · Thông báo và trao đổi · Tài liệu · Lập lịch</text>
  <text x="24" y="224" font-size="11" fill="#3e5265">Quản lý cấu hình · Quản lý biểu mẫu · Sổ kiểm tra · Báo cáo</text>
  <!-- Layer 4 -->
  <rect x="10" y="242" width="660" height="66" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="24" y="266" font-size="12" font-weight="bold" fill="#12365a">4. Lớp dữ liệu và trí tuệ nhân tạo</text>
  <text x="24" y="284" font-size="11" fill="#3e5265">Cơ sở dữ liệu giao dịch · Kho tệp · Chỉ mục tìm kiếm · Kho tri thức được phép sử dụng</text>
  <text x="24" y="300" font-size="11" fill="#3e5265">Công cụ gợi ý và trích xuất · Bộ kiểm thử chất lượng mô hình · Kho báo cáo tổng hợp</text>
  <!-- Layer 5 -->
  <rect x="10" y="318" width="660" height="66" rx="6" fill="#f4ede3" stroke="#8a6d3b"/>
  <text x="24" y="342" font-size="12" font-weight="bold" fill="#6b5423">5. Lớp tích hợp (mọi kết nối ra ngoài đi qua đây)</text>
  <text x="24" y="360" font-size="11" fill="#6b5423">Cơ sở dữ liệu nhà nước · Tổ chức tài chính · Phòng thử nghiệm và tổ chức chứng nhận · Ký số</text>
  <text x="24" y="376" font-size="11" fill="#6b5423">Hóa đơn · Thư điện tử, Zalo, lịch · Đối tác địa phương và quốc tế</text>
  <!-- Layer 6 -->
  <rect x="10" y="394" width="660" height="66" rx="6" fill="#e9ecef" stroke="#52687a"/>
  <text x="24" y="418" font-size="12" font-weight="bold" fill="#3e5265">6. Lớp hạ tầng</text>
  <text x="24" y="436" font-size="11" fill="#52687a">Máy chủ ứng dụng · Cơ sở dữ liệu · Hàng đợi xử lý · Kho tệp · Quản lý khóa và bí mật</text>
  <text x="24" y="452" font-size="11" fill="#52687a">Giám sát · Sao lưu và phục hồi · Bảo vệ mạng</text>
</svg>
<figcaption>Hình 3. Sáu lớp kiến trúc. Lớp tích hợp (màu nâu nhạt) là ranh giới duy nhất với thế giới bên ngoài; lớp nghiệp vụ không gọi thẳng hệ thống ngoài.</figcaption>
</figure>

Cách các lớp phối hợp với nhau tuân theo mấy quy tắc cố định:

- **Lớp người sử dụng** chỉ là các góc nhìn: mọi cổng và bàn làm việc đều gọi vào cùng lớp nghiệp vụ, không có logic nghiệp vụ nằm riêng trong giao diện. Nhờ vậy doanh nghiệp, điều phối viên và chuyên gia nhìn thấy cùng một hồ sơ theo quyền của mình, không có ba "phiên bản sự thật".
- **Lớp nghiệp vụ** là nơi duy nhất quyết định quyền và trạng thái. Kiểm tra phân quyền diễn ra tại đây (mục 24.2), không phó mặc cho cổng vào.
- **Lớp dùng chung** cung cấp năng lực ngang (định danh, tài liệu, thông báo, cấu hình, sổ kiểm tra) để các phân hệ nghiệp vụ không tự chế lại từng thứ.
- **Lớp dữ liệu và trí tuệ nhân tạo** tách kho tri thức được phép sử dụng khỏi dữ liệu giao dịch, làm nền cho quy tắc "không rò dữ liệu giữa các không gian" tại mục 23.5.
- **Lớp tích hợp** là ranh giới duy nhất với bên ngoài: mọi kết nối đi và đến đều qua bộ kết nối có chủ sở hữu, có đối soát và có phương án ngắt (mục 22.5). Lớp nghiệp vụ không bao giờ gọi thẳng một hệ thống ngoài trong giao dịch cơ sở dữ liệu.
- **Lớp hạ tầng** phục vụ tất cả các lớp trên và là nơi thi hành các yêu cầu sao lưu, giám sát và bảo vệ tại mục 24 và 25.

---

## 9. Các miền nghiệp vụ

Bên trong lớp nghiệp vụ, hệ thống được chia thành các miền — mỗi miền sở hữu một cụm dữ liệu và quy tắc gắn bó với nhau. Ranh giới miền là ranh giới trách nhiệm của mã nguồn: **mỗi miền sở hữu dữ liệu và quy tắc của mình; miền khác chỉ gọi qua giao diện nghiệp vụ công khai, không ghi trực tiếp vào bảng dữ liệu của nhau.** Quy tắc này là điều kiện tiên quyết để về sau có thể tách một miền thành dịch vụ độc lập nếu cần (mục 26.2) mà không phải gỡ rối các phụ thuộc ngầm.

<figure class="fig">
<svg viewBox="0 0 680 452" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <!-- Core group -->
  <rect x="10" y="14" width="410" height="212" rx="8" fill="#f4f7fa" stroke="#12365a"/>
  <text x="24" y="36" font-size="12" font-weight="bold" fill="#12365a">Lõi hồ sơ</text>
  <rect x="22" y="48" width="180" height="30" rx="5" fill="#12365a"/>
  <text x="112" y="67" text-anchor="middle" font-size="11" fill="#ffffff">Hồ sơ thương mại hóa</text>
  <rect x="214" y="48" width="92" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="260" y="67" text-anchor="middle" font-size="11" fill="#12365a">Nhu cầu</text>
  <rect x="318" y="48" width="92" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="364" y="67" text-anchor="middle" font-size="11" fill="#12365a">Công nghệ</text>
  <rect x="22" y="90" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="81" y="109" text-anchor="middle" font-size="11" fill="#12365a">Điều phối</text>
  <rect x="152" y="90" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="211" y="109" text-anchor="middle" font-size="11" fill="#12365a">Tìm kiếm</text>
  <rect x="282" y="90" width="128" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="346" y="109" text-anchor="middle" font-size="11" fill="#12365a">Trao đổi</text>
  <rect x="22" y="132" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="81" y="151" text-anchor="middle" font-size="11" fill="#12365a">Phòng dữ liệu</text>
  <rect x="152" y="132" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="211" y="151" text-anchor="middle" font-size="11" fill="#12365a">Thẩm định</text>
  <rect x="282" y="132" width="128" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="346" y="151" text-anchor="middle" font-size="11" fill="#12365a">Thỏa thuận</text>
  <rect x="22" y="174" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="81" y="193" text-anchor="middle" font-size="11" fill="#12365a">Thực hiện</text>
  <rect x="152" y="174" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="211" y="193" text-anchor="middle" font-size="11" fill="#12365a">Kết quả</text>
  <!-- Network group -->
  <rect x="440" y="14" width="230" height="212" rx="8" fill="#f4f7fa" stroke="#12365a"/>
  <text x="454" y="36" font-size="12" font-weight="bold" fill="#12365a">Mạng lưới</text>
  <rect x="452" y="48" width="206" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="555" y="67" text-anchor="middle" font-size="11" fill="#12365a">Chuyên gia</text>
  <rect x="452" y="86" width="206" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="555" y="105" text-anchor="middle" font-size="11" fill="#12365a">Dịch vụ chuyên môn</text>
  <rect x="452" y="124" width="206" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="555" y="143" text-anchor="middle" font-size="11" fill="#12365a">Nhân lực công nghệ</text>
  <rect x="452" y="162" width="98" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="501" y="181" text-anchor="middle" font-size="11" fill="#12365a">Mạng đối tác</text>
  <rect x="560" y="162" width="98" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="609" y="181" text-anchor="middle" font-size="11" fill="#12365a">Liên kết công</text>
  <!-- Finance group -->
  <rect x="10" y="246" width="410" height="80" rx="8" fill="#f4f7fa" stroke="#12365a"/>
  <text x="24" y="268" font-size="12" font-weight="bold" fill="#12365a">Tài chính và phí</text>
  <rect x="22" y="280" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="81" y="299" text-anchor="middle" font-size="11" fill="#12365a">Tài chính</text>
  <rect x="152" y="280" width="118" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="211" y="299" text-anchor="middle" font-size="11" fill="#12365a">Chương trình</text>
  <rect x="282" y="280" width="128" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="346" y="299" text-anchor="middle" font-size="11" fill="#12365a">Tính phí</text>
  <!-- Post-deal group -->
  <rect x="440" y="246" width="230" height="80" rx="8" fill="#f4f7fa" stroke="#12365a"/>
  <text x="454" y="268" font-size="12" font-weight="bold" fill="#12365a">Sau giao dịch</text>
  <rect x="452" y="280" width="206" height="30" rx="5" fill="#ffffff" stroke="#3e5265"/>
  <text x="555" y="299" text-anchor="middle" font-size="11" fill="#12365a">Vận hành sau chuyển giao</text>
  <!-- Shared group -->
  <rect x="10" y="346" width="660" height="80" rx="8" fill="#e9ecef" stroke="#52687a"/>
  <text x="24" y="368" font-size="12" font-weight="bold" fill="#3e5265">Nền tảng dùng chung</text>
  <rect x="22" y="380" width="118" height="30" rx="5" fill="#ffffff" stroke="#52687a"/>
  <text x="81" y="399" text-anchor="middle" font-size="11" fill="#3e5265">Định danh</text>
  <rect x="152" y="380" width="118" height="30" rx="5" fill="#ffffff" stroke="#52687a"/>
  <text x="211" y="399" text-anchor="middle" font-size="11" fill="#3e5265">Chính sách</text>
  <rect x="282" y="380" width="118" height="30" rx="5" fill="#ffffff" stroke="#52687a"/>
  <text x="341" y="399" text-anchor="middle" font-size="11" fill="#3e5265">Tích hợp</text>
  <rect x="412" y="380" width="118" height="30" rx="5" fill="#ffffff" stroke="#52687a"/>
  <text x="471" y="399" text-anchor="middle" font-size="11" fill="#3e5265">Báo cáo</text>
  <rect x="542" y="380" width="118" height="30" rx="5" fill="#ffffff" stroke="#52687a"/>
  <text x="601" y="399" text-anchor="middle" font-size="11" fill="#3e5265">Kiểm tra</text>
</svg>
<figcaption>Hình 4. Bản đồ miền nghiệp vụ. Miền "Hồ sơ thương mại hóa" là trung tâm; các miền mạng lưới, tài chính và sau giao dịch phục vụ hồ sơ; nền tảng dùng chung phục vụ tất cả.</figcaption>
</figure>

Trách nhiệm cụ thể của từng miền:

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
| Đầu tư | Nhu cầu vốn góp, hồ sơ sẵn sàng đầu tư, vòng gọi vốn và trạng thái từ nhà đầu tư |
| Đào tạo và nhân rộng | Chương trình đào tạo, học liệu có phiên bản, kết quả đào tạo và mô hình tham chiếu |
| Liên kết công | Nhiệm vụ liên cơ quan, bài toán công, kết quả nghiên cứu và phản hồi chính sách |
| Tính phí | Thỏa thuận phí, hóa đơn, thanh toán tham chiếu và phân chia |
| Tích hợp | Bộ kết nối, nhận dữ liệu, gửi dữ liệu và đối soát |
| Báo cáo | Dữ liệu đọc, chỉ số và báo cáo tổng hợp |
| Kiểm tra | Nhật ký bất biến và kiểm tra tính toàn vẹn |

---

## 10. Kiến trúc cấu hình và mở rộng

### 10.1 Bốn lớp thay đổi

Một nền tảng phục vụ nhiều ngành, nhiều địa phương và nhiều chương trình sẽ liên tục nhận yêu cầu thay đổi. Nếu mọi thay đổi đều phải sửa mã nguồn, hệ thống sẽ tắc; nếu mọi thứ đều cấu hình được, các bất biến về thẩm quyền và tiền sẽ bị xói mòn dần bởi những "tùy chỉnh nhỏ". Kiến trúc giải quyết mâu thuẫn này bằng cách phân mọi thay đổi vào bốn lớp, mỗi lớp có cơ chế và kỷ luật thay đổi riêng:

<figure class="fig">
<svg viewBox="0 0 680 260" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <rect x="10" y="14" width="660" height="232" rx="10" fill="#f4ede3" stroke="#8a6d3b"/>
  <text x="26" y="36" font-size="11.5" font-weight="bold" fill="#6b5423">Bộ kết nối — thay đổi bằng ghép nối qua giao diện, hàng đợi và đối soát</text>
  <rect x="90" y="50" width="500" height="162" rx="10" fill="#eef3f8" stroke="#3e5265"/>
  <text x="106" y="72" font-size="11.5" font-weight="bold" fill="#12365a">Phân hệ mở rộng — bổ sung theo hợp đồng nội bộ và cổng kích hoạt</text>
  <rect x="170" y="86" width="340" height="92" rx="10" fill="#dbe7f1" stroke="#12365a"/>
  <text x="186" y="108" font-size="11.5" font-weight="bold" fill="#12365a">Cấu hình có phiên bản — kiểm tra,</text>
  <text x="186" y="124" font-size="11.5" font-weight="bold" fill="#12365a">chạy thử, phê duyệt, hiệu lực</text>
  <rect x="250" y="132" width="180" height="36" rx="8" fill="#12365a"/>
  <text x="340" y="155" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#ffffff">Bất biến lõi (mã nguồn)</text>
  <text x="340" y="232" text-anchor="middle" font-size="10.5" fill="#6b5423">Càng vào trong càng khó thay đổi — và càng không được phép thay đổi bằng cấu hình</text>
</svg>
<figcaption>Hình 5. Bốn lớp thay đổi: bất biến nằm trong mã nguồn; sự khác biệt theo ngành, địa phương và đối tác nằm ở các vòng ngoài.</figcaption>
</figure>

| Lớp | Cách thay đổi | Nội dung |
|---|---|---|
| Bất biến lõi | Sửa mã nguồn, kiểm tra kiến trúc và kiểm thử | Giai đoạn, giao dịch, thẩm quyền, phân quyền, tiền, bằng chứng, kiểm tra và giới hạn trí tuệ nhân tạo |
| Cấu hình có phiên bản | Kiểm tra cấu trúc, chạy thử, phê duyệt và đặt thời điểm hiệu lực | Ngành, tiêu chí, biểu mẫu, bằng chứng, thời hạn, mức phí và năng lực được bật |
| Phân hệ mở rộng | Bổ sung theo hợp đồng nội bộ và cổng kích hoạt | Chuyên gia, dịch vụ chuyên môn, vận hành sau chuyển giao, tài chính, liên kết công |
| Bộ kết nối | Kết nối qua giao diện, hàng đợi và đối soát | Ngân hàng, quỹ, phòng thử nghiệm, cơ sở dữ liệu, ký số, địa phương và quốc tế |

Nguyên tắc bắt buộc rút gọn thành một câu:

> Viết chắc các bất biến; cấu hình hóa điểm thay đổi; mở rộng bằng phân hệ và bộ kết nối.

### 10.2 Bốn mức kích hoạt năng lực

Kiến trúc đích chứa nhiều năng lực hơn những gì được xây và bật tại một thời điểm. Để quyết định "xây gì, bật gì, cho ai", mỗi năng lực được xếp vào một trong bốn mức:

| Mức | Ý nghĩa |
|---|---|
| Lõi phải có | Luôn bật để bảo đảm tính toàn vẹn của hồ sơ |
| Thử nghiệm khi có nhu cầu | Chỉ bật khi có người trả tiền, người phụ trách, đối tác và tiêu chí nghiệm thu |
| Mở rộng sau khi có bằng chứng | Chỉ bật sau khi có khách hàng mua lại, kết quả và hiệu quả kinh tế |
| Để dành | Có trong kiến trúc dài hạn nhưng chưa nằm trong phạm vi phát triển hoặc ngân sách |

Hệ quả thực tiễn: một năng lực có trong tài liệu này không đồng nghĩa năng lực đó phải xuất hiện trên màn hình hoặc được phép gọi trong môi trường vận hành. Chức năng không được bật thì không hiển thị và không gọi được (tiêu chí nghiệm thu 46) — không tồn tại chức năng "ẩn nhưng vẫn chạy được nếu biết đường dẫn".

### 10.3 Hồ sơ cấu hình

Hồ sơ cấu hình là công cụ hiện thực hóa hai mục trên. Mỗi tổ chức, nút địa phương, chương trình hoặc ngành được gắn với một hồ sơ cấu hình gồm: mã và số thứ tự bản cấu hình; phạm vi tổ chức, ngành và chương trình; danh sách năng lực theo bốn mức kích hoạt; chính sách và bộ cấu hình được tham chiếu; người phê duyệt; thời điểm bắt đầu và hết hiệu lực; và bản cấu hình dùng để quay lại khi có sự cố.

Hồ sơ cấu hình tuân theo cùng kỷ luật phiên bản như mọi nội dung nghiệp vụ khác: sau khi công bố, bản cấu hình không được sửa; thay đổi phải tạo bản mới. Nhờ vậy, tại bất kỳ thời điểm nào trong quá khứ, hệ thống trả lời được câu hỏi "lúc đó năng lực nào đang bật, theo quyết định của ai".

### 10.4 Quy trình quản lý cấu hình

Một bản cấu hình đi qua bảy trạng thái: soạn thảo → kiểm tra cấu trúc → chạy thử trên dữ liệu mẫu → phê duyệt → lập lịch kích hoạt → có hiệu lực → bị thay thế hoặc thu hồi. Bước chạy thử trên dữ liệu mẫu là bắt buộc đối với thay đổi quan trọng: người phê duyệt phải nhìn thấy tác động dự kiến trước khi ký, không phê duyệt "trên giấy". Những thay đổi chạm đến điều kiện xác nhận nhu cầu, mức phí, quyền truy cập, thời hạn lưu dữ liệu hoặc hành động của trí tuệ nhân tạo cần hai cấp phê duyệt phù hợp.

### 10.5 Những việc cấu hình không được phép làm

Ranh giới giữa lớp cấu hình và lớp bất biến được thi hành bằng danh sách cấm rõ ràng. Cấu hình không được: tạo thẩm quyền mới; bỏ qua phân quyền; tạo loại giao dịch hoặc trạng thái tùy ý; sửa quyết định đã đóng băng; thay đổi số tiền sau khi phát sinh điều kiện tính phí; chạy câu lệnh dữ liệu tùy ý; cấp thêm công cụ cho trí tuệ nhân tạo ngoài danh sách cho phép; bỏ qua yêu cầu về nguồn, bằng chứng hoặc kiểm tra; hoặc mở chức năng cho tổ chức không thuộc phạm vi.

Danh sách này không phải hướng dẫn sử dụng mà là yêu cầu kiểm thử: bộ kiểm thử kiến trúc phải chứng minh rằng một bản cấu hình chứa nội dung vượt cấm bị hệ thống từ chối từ bước kiểm tra cấu trúc (tiêu chí nghiệm thu 41, 42).

### 10.6 Không sao chép theo địa phương hoặc khách hàng

Mọi địa phương và khách hàng sử dụng cùng mã nguồn, cấu trúc dữ liệu chuẩn và giao diện tích hợp. Sự khác biệt được thể hiện bằng hồ sơ cấu hình, chính sách, trường mở rộng có cấu trúc, biểu mẫu, bộ kết nối, và quyền cùng phạm vi dữ liệu — không bằng nhánh mã nguồn riêng. Đây là bài học đắt giá từ các nền tảng bị "nhân bản theo tỉnh": sau vài năm, mỗi bản sao một kiểu, không bản nào nâng cấp được, và chi phí bảo trì nuốt toàn bộ ngân sách phát triển.

Trường hợp bắt buộc phải dùng cơ sở dữ liệu vật lý riêng vì yêu cầu pháp lý hoặc an toàn, bản triển khai đó vẫn phải tuân thủ cùng cấu trúc chuẩn, cùng quy trình nâng cấp và cùng bộ kiểm tra tương thích.

### 10.7 Bộ kết nối và phương án dự phòng

Mọi kết nối bên ngoài phải có: tổ chức sở hữu; mục đích và căn cứ sử dụng dữ liệu; cơ chế chống xử lý trùng; giới hạn thời gian và số lần thử lại; dấu vết yêu cầu và phản hồi; khả năng đối soát; phương án ngắt; và cách xử lý thủ công khi hệ thống nguồn không sẵn sàng.

Yêu cầu cuối cùng đáng nhấn mạnh: khi chưa có giao diện kết nối, hệ thống sử dụng tài liệu hoặc tệp xuất có chữ ký, mã kiểm tra, thời điểm và nguồn rõ ràng — tức là quy trình thủ công có kỷ luật, không phải "chờ tích hợp xong mới làm". Ngược lại, hệ thống không bao giờ tự giả lập quyết định của bên ngoài: bộ kết nối ngân hàng hỏng không có nghĩa là hệ thống tự đánh dấu "đã giải ngân".

---

## 11. Mô hình dữ liệu cốt lõi

Mô hình dữ liệu được trình bày theo cụm, đúng theo ranh giới miền tại mục 9. Trước khi đi vào từng cụm, sơ đồ dưới đây cho thấy các đối tượng chính quan hệ với hồ sơ thương mại hóa như thế nào — mọi đường trong sơ đồ đều mang nghĩa "phục vụ hồ sơ", đúng với nguyên tắc trung tâm của kiến trúc.

<figure class="fig">
<svg viewBox="0 0 680 440" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#52687a"/>
    </marker>
  </defs>
  <!-- Top row -->
  <rect x="40" y="28" width="140" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="110" y="52" text-anchor="middle" font-size="11" fill="#12365a">Bản nhu cầu</text>
  <rect x="270" y="28" width="140" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="340" y="46" text-anchor="middle" font-size="11" fill="#12365a">Chính sách</text>
  <text x="340" y="60" text-anchor="middle" font-size="11" fill="#12365a">đóng băng</text>
  <rect x="500" y="28" width="140" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="570" y="52" text-anchor="middle" font-size="11" fill="#12365a">Gói công nghệ</text>
  <!-- Middle sides -->
  <rect x="20" y="150" width="160" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="100" y="174" text-anchor="middle" font-size="11" fill="#12365a">Nhiệm vụ chuyên gia</text>
  <rect x="20" y="220" width="160" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="100" y="244" text-anchor="middle" font-size="11" fill="#12365a">Nhiệm vụ thẩm định</text>
  <rect x="500" y="150" width="160" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="580" y="174" text-anchor="middle" font-size="11" fill="#12365a">Bản thiết kế giao dịch</text>
  <rect x="500" y="220" width="160" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="580" y="244" text-anchor="middle" font-size="11" fill="#12365a">Thỏa thuận, hợp đồng</text>
  <line x1="580" y1="190" x2="580" y2="220" stroke="#52687a" marker-end="url(#ar3)"/>
  <!-- Center -->
  <rect x="265" y="168" width="150" height="56" rx="8" fill="#12365a"/>
  <text x="340" y="192" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Hồ sơ</text>
  <text x="340" y="210" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">thương mại hóa</text>
  <!-- Bottom rows -->
  <rect x="30" y="310" width="150" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="105" y="334" text-anchor="middle" font-size="11" fill="#12365a">Kế hoạch thực hiện</text>
  <rect x="210" y="310" width="130" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="275" y="334" text-anchor="middle" font-size="11" fill="#12365a">Mốc công việc</text>
  <rect x="370" y="310" width="130" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="435" y="334" text-anchor="middle" font-size="11" fill="#12365a">Gói bằng chứng</text>
  <rect x="530" y="310" width="140" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="600" y="328" text-anchor="middle" font-size="11" fill="#12365a">Định nghĩa</text>
  <text x="600" y="342" text-anchor="middle" font-size="11" fill="#12365a">kết quả</text>
  <rect x="210" y="382" width="190" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="305" y="406" text-anchor="middle" font-size="11" fill="#12365a">Thỏa thuận phí → hóa đơn</text>
  <rect x="530" y="382" width="140" height="40" rx="6" fill="#eef3f8" stroke="#3e5265"/>
  <text x="600" y="406" text-anchor="middle" font-size="11" fill="#12365a">Kết luận kết quả</text>
  <line x1="180" y1="330" x2="210" y2="330" stroke="#52687a" marker-end="url(#ar3)"/>
  <line x1="340" y1="330" x2="370" y2="330" stroke="#52687a" marker-end="url(#ar3)"/>
  <line x1="600" y1="350" x2="600" y2="382" stroke="#52687a" marker-end="url(#ar3)"/>
  <!-- Links to center -->
  <line x1="110" y1="68" x2="290" y2="168" stroke="#52687a"/>
  <line x1="340" y1="68" x2="340" y2="168" stroke="#52687a"/>
  <line x1="570" y1="68" x2="392" y2="168" stroke="#52687a"/>
  <line x1="180" y1="170" x2="265" y2="188" stroke="#52687a"/>
  <line x1="180" y1="240" x2="265" y2="212" stroke="#52687a"/>
  <line x1="500" y1="170" x2="415" y2="188" stroke="#52687a"/>
  <line x1="290" y1="224" x2="120" y2="310" stroke="#52687a"/>
  <line x1="390" y1="224" x2="580" y2="310" stroke="#52687a"/>
  <line x1="330" y1="224" x2="308" y2="382" stroke="#52687a"/>
</svg>
<figcaption>Hình 6. Các đối tượng dữ liệu chính quanh hồ sơ thương mại hóa. Chuỗi bên phải và phía dưới thể hiện dòng chảy: thiết kế giao dịch → thỏa thuận → kế hoạch → mốc → bằng chứng → kết luận kết quả.</figcaption>
</figure>

Hai quy ước xuyên suốt mô hình dữ liệu: thứ nhất, các đối tượng nghiệp vụ quan trọng đều tách thành **định danh ổn định + các bản có phiên bản** (ví dụ "Nhu cầu" và "Bản nhu cầu") — định danh không bao giờ đổi, nội dung thay đổi tạo bản mới; thứ hai, mọi dữ liệu lấy từ ngoài hệ thống đều kèm **hồ sơ nguồn** ghi hệ thống nguồn, thời điểm, mã kiểm tra và quyền sử dụng.

### 11.1 Định danh và tổ chức

| Đối tượng | Nội dung chính |
|---|---|
| Tổ chức | Định danh pháp lý, loại hình, chủ sở hữu và trạng thái xác minh |
| Cá nhân | Định danh, thông tin liên hệ, sự đồng ý và trạng thái |
| Thành viên tổ chức | Quan hệ cá nhân với tổ chức, chức danh và hiệu lực |
| Địa bàn | Tỉnh, thành phố và vùng kinh tế – xã hội của tổ chức; dùng cho lọc, điều phối và báo cáo |
| Phân công vai trò | Quyền theo nền tảng, chương trình, hồ sơ và thời hạn |
| Ràng buộc vai trò vận hành | Gắn NacenTech và NacenX vào đúng vai trò, phạm vi và căn cứ |
| Hồ sơ cấu hình năng lực | Năng lực được bật, phạm vi, hiệu lực và người phê duyệt |
| Bộ cấu hình | Nội dung có cấu trúc, nguồn, bản thay đổi, chạy thử và thời điểm hiệu lực |
| Tuyên bố xung đột lợi ích | Quan hệ, lợi ích, phạm vi và cách xử lý |

### 11.2 Nhu cầu

| Đối tượng | Nội dung chính |
|---|---|
| Nhu cầu | Định danh ổn định của bài toán |
| Bản nhu cầu | Vấn đề, số liệu gốc, mục tiêu, ràng buộc, người quyết định, đường ngân sách và địa bàn triển khai |
| Đầu mối vấn đề | Yêu cầu thô từ biểu mẫu, thư, Zalo hoặc cuộc họp |
| Danh mục sáng kiến | Sáng kiến, người bảo trợ, giá trị kỳ vọng, chi phí, rủi ro và quyết định tiếp theo |
| Quyết định xác nhận | Người xác nhận, bằng chứng và lý do đạt hoặc không đạt |

### 11.3 Công nghệ

| Đối tượng | Nội dung chính |
|---|---|
| Tài sản công nghệ | Sáng chế, bí quyết, sản phẩm, quy trình hoặc năng lực |
| Gói công nghệ | Mô tả, mức sẵn sàng theo thang TRL 1–9, trường hợp sử dụng, yêu cầu triển khai và hỗ trợ |
| Bằng chứng quyền | Chủ sở hữu, quyền khai thác, giấy phép, hạn chế và nguồn |
| Hồ sơ nguồn | Hệ thống nguồn, mã ngoài, thời điểm, mã kiểm tra và quyền sử dụng |
| Dịch vụ năng lực | Dịch vụ phòng thử nghiệm, chuyên gia hoặc thiết bị, kèm điều kiện và mức giá |

Trạng thái "sẵn sàng giao dịch" của một gói công nghệ là một cổng chất lượng, không phải cờ đánh dấu tùy ý. Gói chỉ được đánh dấu sẵn sàng khi: chủ sở hữu và quyền khai thác rõ; bằng chứng mức sẵn sàng phù hợp; phạm vi chuyển giao xác định được; yêu cầu triển khai và hỗ trợ được mô tả; hạn chế pháp lý và dữ liệu được khai báo; và có đầu mối chịu trách nhiệm.

Mức sẵn sàng dùng thang TRL 1–9 làm chuẩn chung để tiêu chí lọc tại mục 16.1 và nội dung thẩm định tại mục 16.3 đánh giá được nhất quán. Thang này là thuộc tính mô tả; nó **không** thay thế cổng "sẵn sàng giao dịch" ở trên — một công nghệ TRL cao vẫn không được vào danh sách đề xuất nếu quyền chưa rõ.

Cổng này cũng là **ranh giới giữa dữ liệu đã thu thập và dữ liệu được đưa vào giao dịch** (mục 11.8): công tác thu thập, số hóa đổ bản ghi vào kho; chỉ bản ghi qua được cổng mới bước vào luồng giao dịch. Số bản ghi đã số hóa và số bản ghi qua cổng là hai chỉ số khác nhau, không được trộn khi báo cáo.

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

Đối tượng cuối cùng thể hiện một lựa chọn thiết kế quan trọng: uy tín chuyên gia trên hệ thống được xây từ nhiệm vụ đã hoàn thành và sản phẩm đã được nghiệm thu — dữ liệu hệ thống tự ghi nhận — chứ không từ phần tự giới thiệu hoặc đánh giá sao kiểu sàn thương mại.

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
| Nhu cầu vốn | Mục đích, giá trị, loại tiền, hình thức (vay, bảo lãnh hoặc vốn góp) và thời điểm |
| Hồ sơ giới thiệu tài chính | Đối tác, sự đồng ý, mã tham chiếu và trạng thái ngoài |
| Hồ sơ sẵn sàng đầu tư | Góc nhìn có kiểm soát lên dữ liệu hồ sơ, phạm vi chia sẻ đã được doanh nghiệp đồng ý và thời hạn hiệu lực |
| Vòng gọi vốn | Giai đoạn, giá trị mục tiêu, nhà đầu tư được giới thiệu, trạng thái do nguồn ngoài cập nhật và kết quả |
| Chương trình | Đơn vị bảo trợ, điều kiện, hạn mức và thời hạn |
| Phân bổ hỗ trợ | Hồ sơ, khoản chi đủ điều kiện và trạng thái |
| Thỏa thuận phí | Người trả, căn cứ tính, mức, trần và điều kiện phát sinh |
| Phân chia phí | Bên nhận, tỷ lệ hoặc giá trị và căn cứ |
| Tham chiếu hóa đơn | Số hóa đơn, đơn vị phát hành và trạng thái |
| Tham chiếu thanh toán | Mã ngân hàng hoặc đơn vị thanh toán và trạng thái |

Quy tắc tiền tệ áp dụng cho toàn bộ cụm này: mọi giá trị tiền phải có loại tiền; giá trị quy đổi phải giữ nguyên số tiền gốc, tỷ giá, nguồn tỷ giá và thời điểm quy đổi. Tỷ giá đã đóng băng theo sự kiện không bị tính lại hồi tố (tiêu chí nghiệm thu 32).

### 11.7 Quy tắc tạo bản mới

Danh sách các nội dung không được sửa trực tiếp sau khi có hiệu lực: nhu cầu đã xác nhận; gói công nghệ đã công bố; chính sách áp dụng cho hồ sơ; yêu cầu và tiêu chí thẩm định; tiêu chí thử nghiệm; bản thiết kế giao dịch; điều kiện tính phí; định nghĩa kết quả; báo cáo và kết luận đã ký.

Lý do chung của danh sách này: mỗi mục đều là căn cứ của một quyết định hoặc một khoản tiền. Nếu nội dung có thể sửa đè, dấu vết quyết định trở nên vô nghĩa — người đọc sau không biết quyết định dựa trên nội dung nào. Vì vậy mọi thay đổi phải tạo bản mới, liên kết bản cũ và ghi quyết định cho phép thay đổi.

### 11.8 Dữ liệu thu thập và số hóa

Công tác điều tra, khảo sát và số hóa tạo ra một loại dữ liệu khác với dữ liệu phát sinh trong quá trình xử lý hồ sơ: nó là **ảnh chụp năng lực và hiện trạng tại một thời điểm**, thu theo lô, chưa gắn với một giao dịch cụ thể nào. Cụm đối tượng dưới đây dành riêng cho loại dữ liệu đó.

| Đối tượng | Nội dung chính |
|---|---|
| Hồ sơ năng lực đổi mới | Định danh ổn định gắn với một tổ chức |
| Bản hồ sơ năng lực | Ngành, địa bàn, quy mô, hiện trạng công nghệ, năng lực nghiên cứu và phát triển, nhu cầu công nghệ, mức độ đổi mới theo bộ tiêu chí đang áp dụng |
| Đợt thu thập | Nhóm công việc, phương pháp, phạm vi, thời gian, đơn vị thực hiện và đơn vị xác nhận tại địa phương |
| Phiếu khai báo | Bản biểu mẫu đã dùng, câu trả lời, người khai, thời điểm và trạng thái xác nhận |
| Bản ghi nhà cung cấp | Tổ chức hoặc cá nhân cung cấp công nghệ, dịch vụ; lĩnh vực, địa bàn và thông tin liên hệ |

Bốn quy tắc giữ cho cụm này không làm xáo trộn lõi hồ sơ:

1. **Không có đối tượng nào ở đây tham gia trực tiếp vào vòng đời hồ sơ thương mại hóa.** Chúng là nguồn để tạo nhu cầu, gói công nghệ hoặc hồ sơ chuyên gia, nhưng bản thân chúng không có giai đoạn, không có cổng kiểm soát và không tạo nghĩa vụ.
2. **Mỗi bản ghi mang đầy đủ thuộc tính nguồn theo mục 22.2** và tuân quy tắc tạo bản mới tại mục 11.7, để khảo sát định kỳ tạo bản mới thay vì ghi đè bản cũ.
3. **Đường vào luồng giao dịch chỉ có một**: qua cổng "sẵn sàng giao dịch" đối với công nghệ (mục 11.3), qua khâu xác nhận nhu cầu đối với nhu cầu (mục 12.2), và qua bộ kiểm tra trước khi giao nhiệm vụ đối với chuyên gia (mục 14.2). Dữ liệu đã số hóa nhưng chưa qua các cổng này nằm ở trạng thái theo dõi (mục 12.3), không được tính vào chỉ số hồ sơ đủ điều kiện.
4. **Bản ghi nhà cung cấp và bản hồ sơ chuyên gia là hai thứ khác nhau.** Bản ghi nhà cung cấp là dữ liệu danh mục đã thu thập; hồ sơ chuyên gia tại mục 11.4 chỉ hình thành sau khi có kiểm tra danh tính, chứng chỉ và xung đột lợi ích. Một sổ đăng ký đã thu thập không tự trở thành mạng chuyên gia được phép giao việc.

---

## 12. Tiếp nhận và xác nhận nhu cầu

### 12.1 Kênh tiếp nhận

Nhu cầu đến với hệ thống từ nhiều kênh có mức độ cấu trúc rất khác nhau: cổng thông tin, biểu mẫu trực tuyến, Zalo, thư điện tử, cuộc họp, trung tâm địa phương, chương trình thách thức, tổ chức ngành nghề, cơ quan nhà nước, và kết quả khảo sát chủ động của điều phối viên. Yêu cầu kiến trúc duy nhất đối với mọi kênh: **tất cả đều tạo cùng một loại bản ghi đầu mối**, để không mất dấu nguồn và để chỉ số chuyển đổi từ đầu mối thành nhu cầu đủ điều kiện đo được trên toàn hệ thống, không phụ thuộc kênh nào.

### 12.2 Thông tin tối thiểu để xác nhận

Cổng "xác nhận nhu cầu" là cổng quan trọng nhất của cả vòng đời, vì mọi chi phí phía sau — tìm kiếm, chuyên gia, thẩm định — đều tiêu tốn trên nền một nhu cầu. Một nhu cầu chỉ được xác nhận khi có đủ: vấn đề cụ thể; người sử dụng hoặc bộ phận chịu ảnh hưởng; số liệu gốc hoặc cách thu số liệu; kết quả mong muốn; mức độ cấp thiết; người chịu trách nhiệm; người có quyền quyết định; khả năng cung cấp địa điểm, dữ liệu và nhân lực; đường ngân sách hoặc người có quyền bố trí ngân sách; và quyền sử dụng dữ liệu đưa vào hệ thống.

Bốn yếu tố then chốt trong danh sách là **chủ sở hữu vấn đề, người có quyền quyết định, số liệu gốc và đường ngân sách**. Thiếu một trong bốn, "nhu cầu" chỉ là mối quan tâm — hệ thống vẫn ghi nhận để theo dõi nhưng không đưa vào quy trình phục vụ tốn nguồn lực.

### 12.3 Phân loại kết quả tiếp nhận

Không phải đầu mối nào cũng thành hồ sơ, và việc phân loại minh bạch giúp chỉ số không bị thổi phồng:

| Kết quả | Cách xử lý |
|---|---|
| Đủ điều kiện | Tạo hồ sơ thương mại hóa và phân công điều phối viên |
| Cần bổ sung | Giao danh sách thông tin thiếu và thời hạn |
| Chuyển dịch vụ chuyên môn | Tạo hồ sơ dịch vụ độc lập |
| Chuyển chương trình hỗ trợ | Giới thiệu theo điều kiện và thẩm quyền |
| Từ chối | Ghi lý do, không xóa dữ liệu gốc |
| Để theo dõi | Chưa có ngân sách hoặc người quyết định, không đưa vào chỉ số hồ sơ đủ điều kiện |

### 12.4 Bàn đổi mới sáng tạo của doanh nghiệp

Về phía doanh nghiệp, điểm tiếp xúc chính là một không gian làm việc dài hạn — không chỉ là biểu mẫu gửi yêu cầu một lần. Tại đây doanh nghiệp ghi nhận vấn đề, quản lý danh mục sáng kiến, theo dõi quyết định, yêu cầu chuyên gia, xem tiến độ hồ sơ, quản lý tài liệu và bằng chứng, nhận cảnh báo về nghĩa vụ và kết quả, và theo dõi chi phí cùng giá trị thu được. Không gian này biến quan hệ với nền tảng từ giao dịch đơn lẻ thành hợp tác liên tục — nền của các dòng dịch vụ định kỳ tại mục 21.

Trí tuệ nhân tạo hỗ trợ doanh nghiệp trong không gian này bằng cách tóm tắt, đặt câu hỏi làm rõ và phát hiện thông tin thiếu; nhưng theo đúng cổng hành động tại mục 23, nó không được tự xác nhận nhu cầu hoặc tự mở thủ tục mua sắm.

---

## 13. Nguồn cung công nghệ và đơn vị chuyển giao

### 13.1 Chuẩn hóa tài sản công nghệ

Phía cung của hệ thống bắt đầu từ một thực tế: phần lớn công nghệ trong viện, trường được mô tả theo ngôn ngữ nghiên cứu, không theo ngôn ngữ của người mua. Việc chuẩn hóa vì vậy không phải là "đăng tin" mà là đóng gói lại theo góc nhìn tiếp nhận. Mỗi công nghệ được mô tả theo: vấn đề giải quyết; người sử dụng mục tiêu; mức sẵn sàng; bằng chứng kỹ thuật; quyền sở hữu và quyền chuyển giao; thành phần được bàn giao; yêu cầu hạ tầng; dữ liệu cần sử dụng; yêu cầu tích hợp; đào tạo và hỗ trợ; chi phí dự kiến; thời gian đưa vào vận hành; và hạn chế cùng rủi ro.

Bộ khung này buộc bên cung trả lời trước những câu hỏi mà mọi doanh nghiệp tiếp nhận sẽ hỏi — và là đầu vào trực tiếp cho tìm kiếm có giải thích tại mục 16.

### 13.2 Bàn làm việc của đơn vị chuyển giao

Đơn vị chuyển giao công nghệ (của viện, trường hoặc doanh nghiệp sở hữu công nghệ) có không gian làm việc riêng để: quản lý danh mục tài sản; kiểm tra hồ sơ quyền; đóng gói công nghệ; trả lời yêu cầu làm rõ; theo dõi cơ hội; tham gia thẩm định; chuẩn bị điều kiện chuyển giao; và theo dõi nghĩa vụ cùng doanh thu từ quyền sở hữu trí tuệ. Cũng như bàn đổi mới sáng tạo của doanh nghiệp, đây là một góc nhìn lên dữ liệu hồ sơ chung, không phải hệ thống riêng.

### 13.3 Kiểm soát chất lượng nguồn cung

Danh sách đề xuất gửi cho doanh nghiệp là bộ mặt của nền tảng; một danh sách chứa công nghệ không đủ điều kiện làm mất lòng tin nhanh hơn mọi chiến dịch truyền thông. Vì vậy hệ thống chặn việc đưa công nghệ vào danh sách đề xuất chính thức khi: quyền sở hữu chưa rõ; bằng chứng kỹ thuật chỉ là tuyên bố; người cung cấp không có khả năng hỗ trợ; chi phí triển khai bị bỏ trống; không làm rõ dữ liệu hoặc an toàn; không có phương án bàn giao; hoặc công nghệ không phù hợp mức sẵn sàng mà nhu cầu yêu cầu.

### 13.4 Kết quả nghiên cứu dùng ngân sách nhà nước

Kết quả nghiên cứu dùng ngân sách là nguồn cung quan trọng nhưng có ràng buộc pháp lý riêng về quyền khai thác. Kết quả loại này chỉ được đưa vào thương mại hóa khi có: thông tin nghiệm thu từ nguồn có thẩm quyền; tổ chức chủ trì và chủ sở hữu; căn cứ khai thác tài sản và quyền sở hữu trí tuệ; hạn chế sử dụng; người có quyền thương lượng; gói chuyển giao; và doanh nghiệp tiếp nhận hoặc bài toán phù hợp.

Về dữ liệu, hệ thống không sao chép toàn bộ cơ sở dữ liệu nhiệm vụ nghiên cứu của cơ quan quản lý; hệ thống chỉ lưu mã tham chiếu, bản chụp có thời điểm và dấu vết nguồn — đúng nguyên tắc "nguồn sự thật thuộc cơ quan có thẩm quyền" tại mục 22.1.

---

## 14. Mạng chuyên gia

### 14.1 Vai trò của chuyên gia trong mô hình

Chuyên gia là nguồn lực co giãn của hệ thống: điều phối viên giữ trách nhiệm quy trình, còn chiều sâu chuyên môn — kỹ thuật, thị trường, sở hữu trí tuệ, định giá, pháp lý — đến từ mạng chuyên gia được huy động theo từng nhiệm vụ. Điểm khác biệt căn bản so với một sàn freelancer: chuyên gia không có "quyền chuyên gia" toàn cục trên hệ thống; mọi quyền phát sinh từ **nhiệm vụ cụ thể trên hồ sơ cụ thể**, có phạm vi và thời hạn.

Các nhóm vai trò và trách nhiệm tương ứng:

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

Trước khi một chuyên gia nhận nhiệm vụ, hệ thống kiểm tra: danh tính; chứng chỉ và phạm vi; thời hạn hiệu lực; kinh nghiệm phù hợp; khả năng nhận việc; hạn chế từ đơn vị sử dụng lao động; quan hệ lợi ích; vai trò đã thực hiện trong cùng hồ sơ; và trách nhiệm nghề nghiệp cùng bảo hiểm khi cần.

Hai kiểm tra cuối cần giải thích: một chuyên gia đã tư vấn cho bên cung cấp trong hồ sơ không thể sau đó làm người thẩm định độc lập trong cùng hồ sơ — đổi vai trò phải tạo nhiệm vụ mới và kiểm tra lại xung đột (tiêu chí nghiệm thu 20). Đây là cách nguyên tắc tách quyền tại mục 3.3 được thi hành ở cấp từng con người.

### 14.3 Quyền truy cập theo nhiệm vụ

Chuyên gia chỉ được xem tài liệu thuộc đúng nhiệm vụ, phục vụ đúng mục đích, trong thời gian được giao, sau khi hoàn tất cam kết bảo mật, và không bị hạn chế bởi xung đột lợi ích. Việc là thành viên hồ sơ không tự tạo quyền đọc toàn bộ phòng dữ liệu — quy tắc này bảo vệ bí mật kinh doanh của doanh nghiệp và cũng bảo vệ chính chuyên gia khỏi cáo buộc tiếp cận thông tin ngoài phạm vi.

### 14.4 Bàn điều hành chuyên gia

Để mạng chuyên gia hoạt động bền, hệ thống cung cấp cho mỗi chuyên gia một không gian điều hành riêng: nhận và sàng lọc yêu cầu; quản lý lịch; chuẩn bị phạm vi và báo giá; theo dõi thỏa thuận; quản lý sản phẩm bàn giao; theo dõi hóa đơn; lưu tri thức được phép sử dụng; và chăm sóc khách hàng. Trợ lý trí tuệ nhân tạo trong không gian này giúp chuyên gia giảm thời gian hành chính — nhưng chỉ làm việc trong phạm vi tri thức, chính sách thương lượng và quyền đại diện của đúng chuyên gia đó. Dữ liệu của chuyên gia này không được dùng cho chuyên gia khác nếu thiếu quyền: mỗi chuyên gia là một không gian tri thức riêng theo mục 23.5.

### 14.5 Dịch vụ nhân lực công nghệ

Trên nền mạng chuyên gia, NacenX có thể cung cấp các dịch vụ nhân lực công nghệ: chuyên gia theo nhu cầu; lãnh đạo công nghệ bán thời gian; tìm kiếm nhân sự công nghệ cấp cao; nhóm chuyên gia thực hiện nhiệm vụ; và thẩm định kỹ thuật độc lập. Mô hình khởi đầu là mạng được tuyển chọn và quản lý, không phải danh bạ mở.

Ràng buộc pháp lý đi kèm: dịch vụ tuyển dụng hoặc cung ứng nhân lực chỉ được kích hoạt sau khi xác định đúng loại hình pháp lý, giấy phép, hợp đồng, thuế, bảo hiểm, sở hữu trí tuệ và trách nhiệm lao động. Đây là một ví dụ điển hình của mức kích hoạt "thử nghiệm khi có nhu cầu" kèm cổng pháp lý tại mục 10.2.

---

## 15. Dịch vụ chuyên môn và bảo đảm chuyển đổi số

### 15.1 Dịch vụ chuyên môn

Bên cạnh chuỗi giao dịch công nghệ, hệ thống hỗ trợ một danh mục dịch vụ chuyên môn mà doanh nghiệp thường cần trên đường đưa sản phẩm ra thị trường: đánh giá và định giá công nghệ; rà soát kỹ thuật, thị trường và sở hữu trí tuệ; xây dựng và áp dụng hệ thống quản lý ISO; xây dựng tiêu chuẩn cơ sở; chuẩn bị hợp chuẩn, hợp quy và công bố sản phẩm; chuẩn bị hồ sơ doanh nghiệp khoa học và công nghệ; chuẩn bị hồ sơ doanh nghiệp công nghệ cao; rà soát an toàn, môi trường, dữ liệu và an ninh mạng; và duy trì nghĩa vụ cùng theo dõi thời hạn.

Các dịch vụ này chạy trên hồ sơ dịch vụ độc lập (mục 5.3), do chuyên gia dẫn dắt với trí tuệ nhân tạo hỗ trợ phần chuẩn bị, và là nguồn doanh thu định kỳ quan trọng của đơn vị vận hành.

### 15.2 Ba tầng trách nhiệm

Rủi ro lớn nhất của nhóm dịch vụ này là nhầm lẫn — vô tình hoặc cố ý — giữa việc *chuẩn bị* hồ sơ và việc *cấp* chứng nhận. Kiến trúc tách bạch ba tầng trách nhiệm và gắn mỗi sản phẩm dịch vụ vào đúng tầng:

| Tầng | Sản phẩm | Chủ thể chịu trách nhiệm |
|---|---|---|
| Tư vấn và chuẩn bị | Lộ trình, đánh giá khoảng cách, quy trình, kế hoạch khắc phục và dự thảo hồ sơ | Chuyên gia hoặc tổ chức tư vấn |
| Đánh giá độc lập | Thử nghiệm, giám định, đánh giá hoặc chứng nhận | Tổ chức hoặc người đủ điều kiện |
| Công nhận chính thức | Giấy phép, chứng nhận, công nhận hoặc quyết định hành chính | Cơ quan hoặc tổ chức có thẩm quyền |

NacenX mặc định chỉ hoạt động ở tầng thứ nhất: tư vấn, chuẩn bị và điều phối. NacenX không được quảng cáo là đơn vị cấp ISO, cấp hợp quy hoặc công nhận doanh nghiệp khoa học và công nghệ nếu không có thẩm quyền riêng — và hệ thống hiển thị rõ ràng cho khách hàng biết sản phẩm họ mua thuộc tầng nào.

### 15.3 Bảo đảm chuyển đổi số và đổi mới sáng tạo

Ngành dọc này trả lời một nhu cầu thị trường lớn: doanh nghiệp muốn chuyển đổi số nhưng không đủ năng lực đánh giá nhà cung cấp, dễ mua nhầm giải pháp và không đo được hiệu quả. Vai trò của NacenX ở đây là **trung gian điều phối và bảo đảm chất lượng quyết định** — không mặc định là đơn vị tổng thầu công nghệ. Danh mục sản phẩm gồm: văn phòng chuyển đổi số và đổi mới sáng tạo thuê ngoài; chẩn đoán năng lực số; xây dựng lộ trình; rà soát kiến trúc; thẩm định phương án và nhà cung cấp; tìm giải pháp đến thử nghiệm; lãnh đạo chuyển đổi số hoặc công nghệ bán thời gian; quản lý thực hiện và quản trị thay đổi; hỗ trợ áp dụng sau triển khai; và rà soát quản trị dữ liệu cùng trí tuệ nhân tạo.

### 15.4 Ba thời điểm thẩm định chuyển đổi số

Giá trị "bảo đảm" nằm ở ba thời điểm thẩm định gắn với vòng đời một khoản đầu tư số:

1. **Trước đầu tư:** kiểm tra vấn đề, yêu cầu, phương án tự làm hoặc mua, tổng chi phí, khả năng rút lui, dữ liệu, an toàn và khả năng tiếp nhận — chặn sai lầm trước khi tiền được chi.
2. **Trong thử nghiệm:** đóng băng số liệu gốc, mục tiêu, dữ liệu thử, cách đo và điều kiện nghiệm thu trước khi thực hiện — bảo đảm kết quả thử nghiệm không thể bị "diễn giải lại".
3. **Sau triển khai:** đo mức sử dụng, năng suất, chất lượng, chi phí, doanh thu, rủi ro và giá trị sau 6 hoặc 12 tháng — trả lời câu hỏi khoản đầu tư có đáng không.

### 15.5 Tách tư vấn, thực hiện và xác minh

Trong cùng một phạm vi công việc: bên tư vấn có thể giúp xác định yêu cầu; bên cung cấp có thể triển khai giải pháp; nhưng bên xác minh độc lập phải tách khỏi bên cung cấp. Mọi khoản giới thiệu, bán lại hoặc hoa hồng từ nhà cung cấp phải được công khai; người thẩm định không được nhận khoản tiền phụ thuộc vào việc một nhà cung cấp được chọn hoặc một kết luận thuận lợi; và tiêu chí cùng trọng số đánh giá phải được đóng băng trước khi biết kết quả. Không có các ràng buộc này, dịch vụ "thẩm định" trở thành kênh bán hàng trá hình — đúng loại xung đột mà mục 3.3 cấm.

### 15.6 Gói triển khai ưu tiên

Gói được chọn bán trước là **văn phòng chuyển đổi số và đổi mới sáng tạo thuê ngoài cho doanh nghiệp sản xuất**, vì nó tạo doanh thu định kỳ, sinh ra nhu cầu cho mọi năng lực khác của hệ thống, và đo được. Quy trình chín bước của gói: thu thập số liệu gốc; chọn tối đa ba bài toán có người chịu trách nhiệm và đường ngân sách; xác định mục tiêu và cách đo; tìm chuyên gia và công nghệ; thẩm định phương án; thực hiện một thử nghiệm trả phí; quyết định triển khai hoặc dừng; hỗ trợ áp dụng, đào tạo và xử lý vấn đề; đo giá trị sau 6 và 12 tháng.

Kỷ luật phạm vi: không cam kết chuyển đổi toàn diện ngay từ đầu; phạm vi đầu tiên chỉ nên là một địa điểm hoặc một nhóm quy trình.

---

## 16. Tìm kiếm, thẩm định và định giá

### 16.1 Tìm kiếm theo ba bước

Tìm kiếm phương án không phải là một ô tìm kiếm tự do mà là một quy trình có kiểm soát ba bước: (1) loại các phương án không đạt điều kiện bắt buộc; (2) chấm mức phù hợp theo tiêu chí có giải thích; (3) điều phối viên và người có thẩm quyền rà soát danh sách trước khi gửi lời mời. Máy lọc và xếp hạng; con người chịu trách nhiệm về danh sách cuối cùng.

Điều kiện bắt buộc ở bước một có thể gồm: quyền chuyển giao; ngành và mục đích sử dụng; mức sẵn sàng; khu vực và yêu cầu lưu dữ liệu; thời hạn; năng lực cung cấp; chứng chỉ; mức ngân sách; và xung đột lợi ích. Đây là các điều kiện "một phiếu phủ quyết" — không có điểm phù hợp cao nào bù được việc thiếu quyền chuyển giao.

### 16.2 Giải thích kết quả

Mỗi phương án trong danh sách phải nêu được: tiêu chí đạt; tiêu chí chưa rõ; bằng chứng được dùng; dữ liệu đã hết hạn; lý do bị loại (với phương án bị loại); số thứ tự bản quy tắc và mô hình đã dùng; và điều chỉnh của con người (nếu có). Yêu cầu ghi số bản quy tắc và mô hình bảo đảm kết quả tái lập được khi kiểm tra: cùng đầu vào, cùng bản quy tắc phải cho cùng danh sách.

Hai điều cấm tuyệt đối: không bán vị trí trong danh sách, và không để bên trả phí làm thay đổi thứ tự một cách bí mật. Điều chỉnh thứ tự của con người là hợp lệ — nhưng phải hiển thị và không xóa kết quả gốc của công cụ (tiêu chí nghiệm thu 4).

### 16.3 Thẩm định

Phạm vi thẩm định được thiết kế theo nhiệm vụ, có thể gồm: kỹ thuật; mức sẵn sàng; khả năng tích hợp; an toàn và dữ liệu; quyền sở hữu trí tuệ; thị trường; năng lực của bên cung cấp; tổng chi phí; khả năng vận hành và bảo trì; khả năng tiếp nhận của doanh nghiệp; và rủi ro cùng phương án thoát. Mỗi nhiệm vụ thẩm định có phạm vi, câu hỏi, người thực hiện và điều kiện độc lập được chốt trước; báo cáo phải ghi phương pháp, nguồn, giả định, hạn chế, kết luận và chữ ký (mục 11.5).

### 16.4 Định giá

Định giá công nghệ là lĩnh vực nhiều tranh chấp, nên vai trò của hệ thống được giới hạn có chủ đích: hệ thống hỗ trợ **quy trình** định giá — xác định mục đích; chọn phương pháp; thu thập nguồn; ghi giả định; phân tích kịch bản; rà soát độc lập; ký báo cáo — còn **kết luận** định giá thuộc người hoặc tổ chức có nhiệm vụ phù hợp, không thuộc thuật toán. Máy có thể chuẩn bị dữ liệu và tính các kịch bản; con số cuối cùng phải có người ký tên chịu trách nhiệm.

---

## 17. Phòng dữ liệu, sở hữu trí tuệ và hợp đồng

### 17.1 Phòng dữ liệu

Giao dịch công nghệ sống bằng tài liệu nhạy cảm: hồ sơ kỹ thuật, tài chính, bí quyết. Phòng dữ liệu là nơi duy nhất các tài liệu này tồn tại trong hệ thống, được quản lý theo: hồ sơ; nhóm tài liệu; bản tài liệu; mức bảo mật; chủ sở hữu; mục đích sử dụng; người nhận; thời hạn; quyền xem, tải hoặc chia sẻ; mã kiểm tra; và nhật ký truy cập.

Một quyết định kiến trúc quan trọng: **tệp đính kèm trong hội thoại chỉ là tham chiếu đến tài liệu trong phòng dữ liệu**, không phải bản sao. Nhờ vậy khi quyền bị thu hồi, tin nhắn cũ không còn mở được tệp — đóng con đường rò tài liệu phổ biến nhất trong các hệ thống có tính năng trao đổi (tiêu chí nghiệm thu 11).

### 17.2 Bảo vệ thông tin

Tùy mức bảo mật của tài liệu, hệ thống hỗ trợ: cam kết bảo mật trước khi truy cập; đánh dấu nhận diện người xem trên tài liệu; hạn chế tải xuống; thời hạn truy cập; ghi nhận việc chia sẻ ra ngoài; mã hóa; khóa mã hóa riêng theo tài liệu nhạy cảm; hủy khả năng giải mã khi có yêu cầu hợp lệ; và giữ lại dấu vết kiểm tra cần thiết.

Cặp năng lực cuối giải quyết một mâu thuẫn cố hữu: hệ thống vừa phải giữ nhật ký không sửa được, vừa phải đáp ứng quyền yêu cầu xóa dữ liệu. Lời giải là mã hóa với khóa riêng — khi có yêu cầu xóa hợp lệ, khóa bị hủy khiến nội dung không còn giải mã được, trong khi dấu vết kiểm tra (ai đã làm gì, khi nào) vẫn nguyên vẹn (tiêu chí nghiệm thu 13).

### 17.3 Quyền sở hữu trí tuệ

Trước khi thiết kế giao dịch, hồ sơ phải làm rõ toàn bộ khung quyền: chủ sở hữu; người có quyền thương lượng; loại quyền; phạm vi địa lý; lĩnh vực sử dụng; độc quyền hoặc không độc quyền; quyền cải tiến; quyền đối với dữ liệu; nghĩa vụ bảo mật; quyền cấp lại; điều kiện chấm dứt; và hạn chế từ nguồn ngân sách hoặc hợp đồng trước. Danh sách này là đầu vào bắt buộc của bản thiết kế giao dịch — hồ sơ có quyền sở hữu trí tuệ chưa rõ bị tạm dừng theo mục 7.4.

### 17.4 Hợp đồng

Hợp đồng là điểm hội tụ của mọi nội dung đã đóng băng. Hợp đồng phải tham chiếu đúng bản đã đóng băng của: nhu cầu; gói công nghệ; phạm vi; giá và loại tiền; tiêu chí nghiệm thu; định nghĩa kết quả; kế hoạch thực hiện; trách nhiệm các bên; quyền dữ liệu và sở hữu trí tuệ; điều kiện thay đổi; và điều kiện kết thúc. Nhờ tham chiếu theo bản, tranh chấp về sau luôn quy về được đúng nội dung hai bên đã nhìn thấy lúc ký.

Hệ thống không tự ký thay các bên. Chữ ký được thực hiện qua dịch vụ ký số hoặc được ghi nhận từ nguồn hợp lệ — nhất quán với nguyên tắc "hệ thống ghi nhận quyết định, không thay quyết định".

---

## 18. Thử nghiệm, chuyển giao và vận hành sau chuyển giao

### 18.1 Thiết kế thử nghiệm

Chất lượng của một thử nghiệm được quyết định trước khi nó bắt đầu. Hồ sơ thử nghiệm phải chốt đủ trước khi thực hiện: vấn đề; số liệu gốc; mục tiêu; phạm vi; địa điểm; dữ liệu thử; bên cung cấp; người phụ trách phía tiếp nhận; điều kiện nghiệm thu; cách đo; người xác minh; ngân sách; thời gian; cách xử lý thay đổi; và phương án dừng.

Nguyên tắc nền: **số liệu gốc và tiêu chí được đóng băng trước, kết quả được so với chúng sau** — không ai được thay số liệu gốc hoặc tiêu chí sau khi đã biết kết quả (tiêu chí nghiệm thu 25 và hành động cấm của trí tuệ nhân tạo tại mục 23.4).

### 18.2 Quản lý mốc công việc

Mỗi mốc công việc có: sản phẩm phải giao; tiêu chí chấp nhận; người nộp; người kiểm tra; người phê duyệt; thời hạn; giá trị thanh toán nếu có; bằng chứng; trạng thái; và lịch sử làm lại. Vì mốc gắn với thanh toán, tính toàn vẹn của nó được bảo vệ chặt: không xóa bằng chứng không đạt, và việc làm lại phải tạo lần nộp mới — lịch sử thất bại là một phần của hồ sơ, không phải thứ được dọn dẹp.

### 18.3 Xác minh kết quả

Hệ thống phân biệt năm mức tin cậy của một tuyên bố kết quả, theo thứ tự tăng dần: bên thực hiện tự báo cáo; hệ thống quan sát; chuyên gia rà soát; bên độc lập xác minh; cơ quan có thẩm quyền công nhận. Các trạng thái này không được gộp thành một nhãn chung — báo cáo tổng hợp phải nói rõ "kết quả tự báo cáo" khác "kết quả được xác minh độc lập". Tự báo cáo không bao giờ tự động trở thành kết quả được xác minh (tiêu chí nghiệm thu 27), và bên hưởng lợi không tự xác nhận mốc thanh toán hoặc kết quả của chính mình (tiêu chí 28).

### 18.4 Chuyển giao

Chuyển giao công nghệ chỉ được coi là hoàn tất khi có đủ các thành phần theo hợp đồng: quyền sử dụng; tài liệu kỹ thuật; mã nguồn hoặc cấu hình nếu có; dữ liệu và cấu trúc dữ liệu; bí quyết; đào tạo; tiêu chí năng lực; phụ tùng và bảo trì; đầu mối hỗ trợ; kế hoạch kết thúc hỗ trợ; và bằng chứng bên nhận có thể vận hành.

Điều kiện cuối là thước đo thật của chuyển giao: không phải "đã bàn giao xong" mà là "bên nhận vận hành được". Mua thiết bị hoặc tham dự đào tạo riêng lẻ không tự được coi là chuyển giao công nghệ.

### 18.5 Bàn vận hành sau chuyển giao

Phần lớn giá trị của một công nghệ chỉ xuất hiện — hoặc mất đi — trong 6 đến 24 tháng sau chuyển giao. Bàn vận hành sau chuyển giao cung cấp dịch vụ trong giai đoạn này: đưa quy trình vào sử dụng; đào tạo và hướng dẫn; theo dõi mức sử dụng; quản lý vấn đề; theo dõi cam kết của bên cung cấp; theo dõi chỉ số; đánh giá năng lực còn lại; và chuẩn bị bàn giao hoàn toàn cho doanh nghiệp. Với đơn vị vận hành, đây là dòng doanh thu định kỳ; với hệ thống, đây là nguồn số liệu 6–24 tháng nuôi chỉ số trung tâm tại mục 28.

Ràng buộc độc lập vẫn áp dụng: người vận hành sau chuyển giao không được là người duy nhất xác minh kết quả của chính dịch vụ mình cung cấp.

### 18.6 Đào tạo và nhân rộng

Đây là bước cuối của chuỗi sau giao dịch, và là chỗ một hồ sơ đã hoàn tất tạo ra giá trị lần thứ hai. Nó gồm hai việc khác nhau, hay bị gộp làm một.

**Đào tạo gắn với chuyển giao.** Đào tạo đã là thành phần bắt buộc của gói chuyển giao (mục 18.4) và của bàn vận hành sau chuyển giao (mục 18.5). Phần bổ sung ở đây là quản lý nó như một sản phẩm có thể lặp lại thay vì một hoạt động riêng lẻ: chương trình đào tạo gắn với một gói công nghệ, học liệu có phiên bản và quyền sử dụng, danh sách người được đào tạo, tiêu chí đạt, và bằng chứng năng lực còn lại sau đào tạo.

Giới hạn phạm vi cần nói rõ: **nền tảng tổ chức nội dung và theo dõi kết quả đào tạo, không tự xây một hệ thống học trực tuyến đầy đủ.** Việc phát nội dung có thể dùng bộ kết nối tới nền tảng học tập bên ngoài theo mục 22.5. Lý do là kỷ luật phạm vi tại mục 10.2: một hệ thống học trực tuyến hoàn chỉnh là sản phẩm riêng với chi phí và vòng đời riêng, không nên gánh vào lõi khi chưa có bằng chứng nhu cầu.

Kết quả đào tạo được ghi vào hồ sơ như mọi bằng chứng khác, và **không tự tạo ra chứng nhận năng lực có giá trị pháp lý** — việc công nhận thuộc tổ chức có thẩm quyền theo ba tầng trách nhiệm tại mục 15.2.

**Nhân rộng mô hình đã kiểm chứng.** Một hồ sơ có kết quả được xác minh và còn được áp dụng sau 12 tháng là ứng viên trở thành **mô hình tham chiếu** cho địa phương hoặc doanh nghiệp khác có bài toán tương tự. Mô hình tham chiếu gồm: bài toán gốc và bối cảnh áp dụng; giải pháp và mức sẵn sàng; số liệu gốc và kết quả đã xác minh; chi phí và thời gian thực tế; điều kiện tiên quyết để lặp lại; những gì đã sai và cách xử lý; và mức độ khái quát hóa được.

Ba ràng buộc giữ cho việc nhân rộng không thành quảng bá:

- Chỉ hồ sơ có **kết quả được bên độc lập xác minh** mới được nâng thành mô hình tham chiếu; kết quả tự báo cáo không đủ (mục 18.3).
- Mô hình tham chiếu phải ghi rõ **điều kiện tiên quyết và giới hạn khái quát hóa**. Một kết quả đạt ở một nhà máy không đương nhiên lặp lại ở nhà máy khác; nêu kết quả mà giấu điều kiện là tạo kỳ vọng sai.
- **Trường hợp thất bại cũng được giữ và dùng**, kèm bài học. Thư viện chỉ có chuyện thành công là công cụ tiếp thị, không phải công cụ học hỏi — và mâu thuẫn với chỉ số liêm chính tại mục 28.4.

Việc nhân rộng đi qua mạng địa phương theo cơ chế giới thiệu hồ sơ tại mục 20.3: một mô hình tham chiếu tạo ra nhu cầu mới ở nút khác, và nhu cầu đó lại đi từ đầu vòng đời như mọi hồ sơ khác — không có đường tắt bỏ qua khâu xác nhận nhu cầu.

---

## 19. Tài chính, chương trình hỗ trợ và liên kết cơ quan nhà nước

### 19.1 Kết nối tài chính

Vốn là điều kiện sống còn của phần lớn giao dịch công nghệ, nhưng nền tảng không phải tổ chức tài chính. Vai trò của hệ thống được giới hạn ở khâu chuẩn bị và kết nối: xác định nhu cầu vốn; chuẩn bị hồ sơ; xin sự đồng ý chia sẻ dữ liệu; giới thiệu đến đối tác; theo dõi trạng thái; ghi nhận quyết định từ nguồn; và đối soát cam kết cùng giải ngân.

Ranh giới không được vượt: quyết định tín dụng, bảo lãnh hoặc đầu tư luôn thuộc đối tác tài chính; nền tảng không cho vay, không bảo lãnh, không giữ tiền của khách hàng. Điều kiện sơ bộ từ đối tác không được hiển thị như phê duyệt — sự khác biệt giữa "đủ điều kiện nộp hồ sơ" và "được duyệt vay" phải rõ ràng trên mọi màn hình.

### 19.2 Chương trình hỗ trợ

Với các chương trình hỗ trợ công (voucher, thách thức, đồng tài trợ), hệ thống đóng vai trò vận hành quy trình cho đơn vị có thẩm quyền. Mỗi chương trình phải khai báo đủ: đơn vị có thẩm quyền; mục tiêu; đối tượng; điều kiện; hạn mức; khoản chi đủ điều kiện; phương pháp lựa chọn; mốc thanh toán; người xác minh; thời hạn; và cách xử lý tài sản cùng kết quả khi kết thúc.

Kiểm soát quan trọng nhất của phân hệ chương trình là **chống hỗ trợ trùng**: hệ thống phát hiện việc cùng một khoản chi hoặc cùng một bằng chứng được dùng để nhận hỗ trợ từ hai nguồn (tiêu chí nghiệm thu 35).

### 19.3 Sổ theo dõi tách biệt

Vì nền tảng chạm vào nhiều loại tiền có bản chất pháp lý khác nhau, kế toán quản trị phải tách rõ: nguồn và khoản chi chương trình công; doanh thu dịch vụ thương mại của NacenX; khoản thu hộ, chi hộ; phí của chuyên gia và đối tác; tiền doanh nghiệp đóng góp; và đóng góp không bằng tiền.

Quy tắc chống thổi phồng đi kèm: không được dùng doanh thu gộp hoặc giá trị cam kết để làm tăng giả hiệu quả tài chính. Khoản thu hộ cho chuyên gia hay phòng thử nghiệm không phải doanh thu của NacenX (tiêu chí nghiệm thu 36) — nhầm lẫn này là nguồn phổ biến nhất của báo cáo tài chính sai trong các mô hình nền tảng.

### 19.4 Mạng liên kết cơ quan nhà nước

Ở tầm hệ sinh thái, hệ thống đóng vai trò lớp điều phối nối các mắt xích vốn rời rạc: bài toán công và nhu cầu doanh nghiệp; kết quả nhiệm vụ khoa học và công nghệ; sở hữu trí tuệ; tiêu chuẩn, đo lường và chất lượng; nguồn vốn và ưu đãi; khách hàng mua thử; thử nghiệm có kiểm soát; và vận hành cùng phản hồi chính sách.

Nguyên tắc liên kết: **hệ thống chỉ điều phối quy trình và bằng chứng**. Cơ quan, quỹ, cơ sở dữ liệu, phòng thử nghiệm và đơn vị mua vẫn giữ nguồn dữ liệu và thẩm quyền của mình. Lớp liên kết không biến nền tảng thành "cơ quan liên thông tự quyết" — nó là đường ống có kiểm soát, không phải trung tâm quyền lực mới.

### 19.5 Nhiệm vụ liên cơ quan

Mỗi kết nối với một cơ quan phải được định nghĩa như một nhiệm vụ có phạm vi, gồm: cơ quan; vai trò (cung cấp nguồn, quyết định, thực hiện hoặc giám sát); mục đích; trường dữ liệu; hành động được phép; thời hạn; cam kết xử lý; người chịu trách nhiệm; cách thu hồi; và cách kết thúc. Tài khoản quản trị hệ thống không được bỏ qua giới hạn này — quyền kỹ thuật không tạo ra thẩm quyền nghiệp vụ.

### 19.6 Ba chuỗi ưu tiên

Thay vì mở kết nối liên cơ quan đại trà, hệ thống tập trung làm thật ba chuỗi có giá trị chứng minh được:

1. Kết quả nghiên cứu đã nghiệm thu → doanh nghiệp tiếp nhận.
2. Tiêu chuẩn, đo lường, thử nghiệm và đánh giá sự phù hợp → khả năng tiếp cận thị trường.
3. Bài toán của cơ quan hoặc doanh nghiệp nhà nước → thử nghiệm trả phí và quyết định mua riêng.

Chỉ khi ba chuỗi này tạo kết quả thật trong ít nhất một ngành, mạng liên kết mới được mở rộng — đúng nguyên tắc mở rộng theo bằng chứng tại mục 4.

### 19.7 Kết nối đầu tư

Mục 19.1 xử lý đường vốn vay và bảo lãnh, nơi bên quyết định là tổ chức tài chính theo quy trình tín dụng. Mục này xử lý đường vốn góp, nơi bên quyết định là nhà đầu tư theo khẩu vị rủi ro riêng. Hai đường khác nhau về bên quyết định và về hồ sơ, nhưng **giống nhau ở một điểm cốt lõi: nền tảng chuẩn bị và giới thiệu, không quyết định và không giữ tiền.**

Lý do cần đường riêng: đề án xác định điểm nghẽn tài chính là một trong các rào cản hệ thống, với biểu hiện cụ thể là "vốn sẵn có nhưng thiếu dự án được chuẩn hóa, thiếu hồ sơ sẵn sàng đầu tư". Đây đúng là loại vấn đề nền tảng giải được — chuẩn hóa hồ sơ và giảm bất cân xứng thông tin — mà không cần chạm vào quyết định đầu tư.

**Hệ thống hỗ trợ:** xác định nhu cầu vốn góp và giai đoạn gọi vốn; chuẩn bị hồ sơ sẵn sàng đầu tư trên nền dữ liệu đã có của hồ sơ; xin sự đồng ý của doanh nghiệp về phạm vi chia sẻ; mở quyền truy cập phòng dữ liệu cho nhà đầu tư theo từng nhiệm vụ và thời hạn; theo dõi trạng thái do nhà đầu tư cập nhật; và ghi nhận kết quả vòng gọi vốn từ nguồn hợp lệ.

**Hồ sơ sẵn sàng đầu tư** không phải một bộ hồ sơ mới mà là một góc nhìn có kiểm soát lên dữ liệu đã có: bài toán và thị trường; công nghệ và mức sẵn sàng theo TRL; quyền sở hữu trí tuệ đã làm rõ; kết quả thử nghiệm đã được xác minh; đội ngũ; nhu cầu vốn và mục đích sử dụng; và các rủi ro đã biết. Giá trị nằm ở chỗ những nội dung này **đã được kiểm chứng trong quá trình xử lý hồ sơ**, không phải do doanh nghiệp tự khai khi đi gọi vốn.

Sáu điều nền tảng không làm, kế thừa nguyên tắc tại mục 2.3 và ranh giới của đơn vị vận hành trong đề án:

- không quyết định đầu tư, không khuyến nghị đầu tư và không tư vấn đầu tư;
- không xếp hạng nhà đầu tư hoặc doanh nghiệp theo mức độ hấp dẫn đầu tư;
- không giữ tiền, không làm trung gian thanh toán cho giao dịch vốn góp;
- không bán quyền truy cập dòng thương vụ — nhà đầu tư trả phí dịch vụ nếu có, nhưng phí không mua được quyền xem hồ sơ mật; mỗi lần mở quyền đều cần sự đồng ý của doanh nghiệp;
- không nhận phí phụ thuộc vào việc một nhà đầu tư cụ thể được chọn;
- không tự tuyên bố định giá doanh nghiệp; định giá thuộc bên có nhiệm vụ phù hợp theo mục 16.4.

Hoạt động môi giới chứng khoán, huy động vốn cộng đồng và tư vấn đầu tư là ngành nghề có điều kiện. Năng lực này **chỉ được kích hoạt sau khi có kết luận pháp chế về loại hình và giấy phép cần thiết**, hoặc thực hiện qua đối tác được cấp phép — cùng cơ chế cổng pháp lý áp dụng cho dịch vụ nhân lực tại mục 14.5.

---

## 20. Mạng địa phương và hợp tác quốc tế

### 20.1 Mạng địa phương

Các trung tâm địa phương tham gia mạng theo **năng lực cụ thể được công nhận**, không theo tư cách chung chung: tiếp nhận nhu cầu; điều phối; chuyên gia; phòng thử nghiệm; hỗ trợ doanh nghiệp; chương trình; kết nối mua thử; hoặc theo dõi sau chuyển giao. Mỗi năng lực có phạm vi, mức, bằng chứng, thời hạn và kỳ rà soát. Cách làm này tránh tình trạng "công nhận một lần, làm mọi việc mãi mãi": một trung tâm giỏi thử nghiệm cơ khí không tự động đủ điều kiện thẩm định công nghệ sinh học.

### 20.2 Nguyên tắc một lõi dùng chung

Mạng địa phương chạy trên đúng một hệ thống — hệ quả trực tiếp của mục 10.6: không xây 34 nền tảng riêng; không yêu cầu mọi địa phương có cùng mô hình tổ chức; một địa phương có thể dùng năng lực của vùng khác; một hồ sơ chỉ có một mã, một giai đoạn và một điều phối viên chính dù bao nhiêu nút tham gia; đơn vị địa phương chỉ đọc dữ liệu cần thiết cho nhiệm vụ; và kết quả được ghi vào cùng hồ sơ.

### 20.3 Giới thiệu hồ sơ qua mạng

Khi một nút cần chuyển hồ sơ cho nút khác có năng lực phù hợp hơn, quy trình giới thiệu diễn ra sáu bước: chỉ gửi thông tin tối thiểu; nút nhận kiểm tra năng lực và xung đột; chấp nhận hoặc từ chối có lý do; cấp quyền truy cập theo nhiệm vụ; phân công người phối hợp; theo dõi thời hạn và bàn giao. Nguyên tắc dữ liệu: không tạo bản sao hồ sơ tại nút gửi và nút nhận — cả hai làm việc trên cùng một hồ sơ với quyền khác nhau.

### 20.4 Hợp tác quốc tế

Hợp tác quốc tế là **lớp bổ sung** cho ba loại giao dịch hiện có, không phải loại giao dịch thứ tư (mục 6.4). Lớp này thêm vào hồ sơ các bước: tìm công nghệ ngoài nước; kiểm tra quyền chuyển giao; kiểm soát hạn chế xuất khẩu và sử dụng; đánh giá khả năng tiếp nhận tại Việt Nam; bản địa hóa; đồng tài trợ; thử nghiệm; chuyển giao bí quyết; đào tạo; và hỗ trợ vận hành.

### 20.5 Điều kiện mở một hành lang hợp tác

Một hành lang hợp tác quốc tế chỉ được mở khi có đủ: nhu cầu đã xác nhận; doanh nghiệp Việt Nam tiếp nhận; đối tác có năng lực; quyền và hạn chế sơ bộ rõ; người phụ trách hai phía; nguồn chi trả; kế hoạch bản địa hóa; và cách đo kết quả. Quy tắc chống hình thức: biên bản ghi nhớ, chuyến khảo sát hoặc danh mục công nghệ không được tính là kết quả.

### 20.6 Dữ liệu xuyên biên giới

Dữ liệu mặc định lưu tại Việt Nam. Mỗi lần truy cập từ nước ngoài phải ghi: người nhận; quốc gia; mục đích; tài liệu và bản cụ thể; căn cứ; thời điểm; thời hạn; và trạng thái thu hồi hoặc xác nhận xóa. Cần lưu ý ranh giới thật của cam kết: với tài liệu đã được xuất hợp pháp ra ngoài biên hệ thống, việc "xóa" là nghĩa vụ hợp đồng của bên nhận, không còn là bảo đảm kỹ thuật của nền tảng — hệ thống ghi nhận trạng thái xác nhận xóa thay vì hứa điều nó không kiểm soát được.

---

## 21. Mô hình doanh thu và hiệu quả kinh tế

### 21.1 Nguyên tắc

NacenX bán **năng lực thực hiện, điều phối, trách nhiệm và kết quả** — không bán nội dung do trí tuệ nhân tạo tạo ra, không bán quyền truy cập danh mục, và tuyệt đối không bán ảnh hưởng đến quyết định công. Doanh thu chia thành bốn loại: hợp đồng định kỳ; phí dự án hoặc mốc công việc; phí theo kết quả có trần; và dịch vụ thử nghiệm quy mô nhỏ.

Cơ cấu bắt buộc: **nguồn thu nền phải là hợp đồng định kỳ; phí theo kết quả chỉ là phần bổ sung.** Lý do: chu kỳ một giao dịch công nghệ kéo dài nhiều tháng đến nhiều năm và tỷ lệ rơi cao — một tổ chức sống bằng phí thành công sẽ phá sản trước khi các giao dịch đầu tiên đóng, hoặc tệ hơn, sẽ chịu áp lực bóp méo kết quả để thu phí.

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
| Đào tạo và nhân rộng mô hình | Doanh nghiệp tiếp nhận, địa phương hoặc đơn vị bảo trợ | Phí chương trình đào tạo và phí gói nhân rộng |
| Chuẩn bị hồ sơ sẵn sàng đầu tư | Doanh nghiệp gọi vốn hoặc đơn vị bảo trợ | Phí chuẩn bị hồ sơ theo mốc, **không** phí phụ thuộc nhà đầu tư được chọn |

Ba dòng đầu là các gói bán trước; các dòng còn lại kích hoạt theo cổng mở rộng tại mục 21.5.

### 21.3 Chi phí trên một hồ sơ

Để biết một dòng dịch vụ có lãi hay không, chi phí phục vụ phải được tính đủ, gồm: giờ điều phối ở mọi giai đoạn; giờ chuyên gia và người rà soát; tìm kiếm; thu thập và làm sạch dữ liệu; công cụ và trí tuệ nhân tạo; liên lạc; đi lại; làm lại; **hồ sơ không thành công**; dự phòng trách nhiệm; chi phí thu tiền; và chi phí trực tiếp khác.

Khoản in đậm là điểm hay bị bỏ sót: nếu cứ ba hồ sơ mới có một hồ sơ hoàn tất, chi phí thật của một hồ sơ hoàn tất phải gánh cả hai hồ sơ rơi. Không chỉ tính chi phí của hồ sơ thành công (tiêu chí nghiệm thu 38).

### 21.4 Phần đóng góp của một dịch vụ

Phần đóng góp của một dịch vụ bằng doanh thu được ghi nhận trừ toàn bộ chi phí trực tiếp và dự phòng liên quan. Hai quy tắc kế toán bắt buộc: khoản thu hộ cho chuyên gia, phòng thử nghiệm, nhà cung cấp hoặc cơ quan không phải doanh thu của NacenX; và một khoản chi chỉ được tính một lần — không phân bổ trùng giữa chi phí phục vụ hồ sơ và chi phí cố định. Sau khi có phần đóng góp mới phân bổ chi phí cố định để tính kết quả đầy đủ.

### 21.5 Cổng mở rộng

Một dòng dịch vụ chỉ được mở rộng khi vượt qua toàn bộ cổng bằng chứng: có ít nhất ba nhiệm vụ trả tiền từ hai người trả tiền khác nhau; có ít nhất một lần mua lại, gia hạn hoặc mua giai đoạn tiếp theo; sản phẩm được chấp nhận theo tiêu chí; phần đóng góp dương; thời gian thu tiền trong giới hạn; không có sự cố nghiêm trọng chưa xử lý; và khách hàng trả tiền cho giá trị thực hiện, không phải vì ảnh hưởng đến thẩm quyền.

Dòng dịch vụ không đạt cổng phải chọn một trong bốn: tăng giá, thu hẹp phạm vi, thiết kế lại, hoặc dừng. Không có lựa chọn "tiếp tục và hy vọng".

### 21.6 Kiểm soát nguy cơ bị trí tuệ nhân tạo thay thế

Mô hình kinh doanh phải giả định rằng các công việc thông tin phổ thông sẽ ngày càng rẻ: tìm kiếm thông tin, tóm tắt, nhập dữ liệu, soạn biểu mẫu, tạo danh sách ban đầu, nhắc việc, tạo báo cáo mô tả. NacenX không xây doanh thu trên các công việc này; chúng được tự động hóa để hạ chi phí phục vụ.

Giá trị mà khách hàng trả tiền — và trí tuệ nhân tạo phổ thông không thay được — nằm ở: nhiệm vụ và ủy quyền thật; mạng chuyên gia đã kiểm tra; dữ liệu có quyền và nguồn; điều phối nhiều tổ chức; khảo sát và thực hiện ngoài thực tế; trách nhiệm nghề nghiệp; thẩm định độc lập; và kết quả được kiểm chứng.

Kỷ luật rà soát: mỗi quý phải so sánh từng dịch vụ với khả năng khách hàng tự phục vụ bằng công cụ trí tuệ nhân tạo phổ biến. Phần khách hàng tự làm được phải được tự động hóa, gộp vào dịch vụ lớn hơn, hoặc dừng bán riêng.

---

## 22. Dữ liệu, sự kiện và tích hợp

### 22.1 Nguồn dữ liệu gốc có thẩm quyền

Hệ thống làm việc với dữ liệu từ hàng chục nguồn, và câu hỏi "ai là nguồn sự thật của trường dữ liệu này" phải có câu trả lời duy nhất cho từng loại. Bảng phân định dưới đây là hợp đồng dữ liệu của toàn kiến trúc:

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

Với mọi dữ liệu có nguồn nằm ngoài hệ thống, nền tảng chỉ lưu bản chụp, mã tham chiếu và dấu vết — không bao giờ tự coi bản sao của mình là sự thật mới nhất.

### 22.2 Yêu cầu đối với dữ liệu nhập

Mỗi bản ghi từ bên ngoài mang theo đầy đủ ngữ cảnh của nó: hệ thống nguồn; mã tại nguồn; mức thẩm quyền của nguồn; thời điểm lấy; thời điểm cập nhật tại nguồn; mã kiểm tra nội dung; quyền sử dụng; vị trí bản dữ liệu thô; số thứ tự cách ánh xạ; và trạng thái kiểm tra. Nhờ vậy, khi dữ liệu nguồn thay đổi hoặc bị nghi ngờ, hệ thống truy được đúng bản đã dùng cho từng quyết định.

Nguyên tắc xử lý nghi ngờ: không tự gộp các bản ghi còn nghi ngờ trùng nhau; trường hợp không chắc chắn phải vào hàng đợi rà soát để con người quyết định. Một lần gộp sai hai tổ chức khác nhau gây hậu quả nặng hơn nhiều so với việc tồn tại tạm thời hai bản ghi.

#### 22.2.1 Nhập dữ liệu theo lô

Công tác số hóa đưa dữ liệu vào hệ thống theo lô chứ không theo từng bản ghi. Đường nhập lô **dùng lại đúng các cơ chế đã có**, không mở lối tắt riêng: nó gọi qua giao diện nghiệp vụ của miền sở hữu như mọi nguồn khác, và không được ghi thẳng vào bảng dữ liệu (mục 22.5).

Một lô đi qua sáu bước: kiểm tra cấu trúc và bắt buộc trường theo biểu mẫu đang có hiệu lực; kiểm tra trùng với dữ liệu hiện có; ghi thuộc tính nguồn cho từng bản ghi theo mục 22.2; đưa bản ghi không chắc chắn vào hàng đợi rà soát; ghi nhận kết quả nhập gồm số bản ghi nhận, từ chối và chờ rà soát; và giữ lại bản dữ liệu thô để đối soát về sau.

Ba ràng buộc: lô nhập phải chống xử lý trùng để nhập lại cùng một tệp không tạo bản ghi nhân đôi; nhập lô **không được bỏ qua** bất kỳ điều kiện nào của các cổng tại mục 11.3, 12.2 và 14.2 — nó chỉ đổ dữ liệu vào kho, không tự đẩy bản ghi qua cổng; và mỗi lô phải truy được về một đợt thu thập cụ thể (mục 11.8) để biết dữ liệu do ai thu, theo phương pháp nào và ai xác nhận.

### 22.3 Sự kiện nghiệp vụ

Mọi thay đổi quan trọng trong hệ thống tạo một sự kiện nghiệp vụ — ví dụ: nhu cầu được xác nhận; hồ sơ được phân công; chuyên gia chấp nhận nhiệm vụ; danh sách phương án được phê duyệt; quyền truy cập tài liệu được cấp; báo cáo thẩm định được nộp; thỏa thuận được ký; thử nghiệm bắt đầu; mốc công việc được nộp; kết quả được xác minh; dịch vụ sau chuyển giao được kích hoạt; cấu hình được kích hoạt hoặc thu hồi; hồ sơ được kết thúc.

Cơ chế bảo đảm tin cậy của dòng sự kiện: **thay đổi dữ liệu và ghi sự kiện phải hoàn tất trong cùng một giao dịch cơ sở dữ liệu**; việc gửi ra ngoài được thực hiện sau đó bởi một bộ phát riêng, có cơ chế chống gửi trùng. Nhờ vậy không bao giờ xảy ra tình trạng dữ liệu đã đổi mà sự kiện thất lạc, hoặc sự kiện được gửi cho thay đổi chưa thành.

<figure class="fig">
<svg viewBox="0 0 680 280" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#3e5265"/>
    </marker>
  </defs>
  <!-- Transaction boundary -->
  <rect x="10" y="30" width="245" height="160" rx="8" fill="#f4f7fa" stroke="#12365a" stroke-width="1.5"/>
  <text x="132" y="54" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#12365a">Một giao dịch cơ sở dữ liệu</text>
  <rect x="28" y="70" width="210" height="40" rx="6" fill="#ffffff" stroke="#3e5265"/>
  <text x="133" y="94" text-anchor="middle" font-size="11" fill="#12365a">Ghi dữ liệu nghiệp vụ</text>
  <rect x="28" y="128" width="210" height="40" rx="6" fill="#ffffff" stroke="#3e5265"/>
  <text x="133" y="152" text-anchor="middle" font-size="11" fill="#12365a">Ghi sự kiện chờ gửi</text>
  <line x1="133" y1="110" x2="133" y2="128" stroke="#3e5265" marker-end="url(#ar4)"/>
  <!-- Publisher chain -->
  <rect x="290" y="90" width="110" height="50" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="345" y="112" text-anchor="middle" font-size="11" fill="#12365a">Bộ phát</text>
  <text x="345" y="127" text-anchor="middle" font-size="11" fill="#12365a">sự kiện</text>
  <rect x="430" y="90" width="95" height="50" rx="6" fill="#eef3f8" stroke="#12365a"/>
  <text x="477" y="120" text-anchor="middle" font-size="11" fill="#12365a">Hàng đợi</text>
  <rect x="555" y="90" width="110" height="50" rx="6" fill="#f4ede3" stroke="#8a6d3b"/>
  <text x="610" y="120" text-anchor="middle" font-size="11" fill="#6b5423">Bộ kết nối</text>
  <rect x="555" y="185" width="110" height="50" rx="6" fill="#ffffff" stroke="#8a6d3b" stroke-dasharray="5,3"/>
  <text x="610" y="207" text-anchor="middle" font-size="11" fill="#6b5423">Hệ thống ngoài</text>
  <text x="610" y="222" text-anchor="middle" font-size="10" fill="#6b5423">(ngân hàng, cơ quan…)</text>
  <line x1="255" y1="148" x2="290" y2="118" stroke="#3e5265" marker-end="url(#ar4)"/>
  <line x1="400" y1="115" x2="430" y2="115" stroke="#3e5265" marker-end="url(#ar4)"/>
  <line x1="525" y1="115" x2="555" y2="115" stroke="#3e5265" marker-end="url(#ar4)"/>
  <line x1="610" y1="140" x2="610" y2="185" stroke="#3e5265" marker-end="url(#ar4)"/>
  <!-- Error queue and reconciliation -->
  <rect x="430" y="185" width="95" height="50" rx="6" fill="#fdf3e3" stroke="#b45309" stroke-dasharray="5,3"/>
  <text x="477" y="207" text-anchor="middle" font-size="11" fill="#8a4a08">Hàng đợi lỗi</text>
  <text x="477" y="222" text-anchor="middle" font-size="10" fill="#8a4a08">thử lại, đối soát</text>
  <line x1="555" y1="210" x2="525" y2="210" stroke="#b45309" stroke-dasharray="4,3" marker-end="url(#ar4)"/>
  <text x="345" y="165" text-anchor="middle" font-size="10.5" fill="#52687a">chống gửi trùng</text>
  <text x="132" y="215" font-size="10.5" fill="#52687a">Cam kết: dữ liệu đổi thì chắc chắn có sự kiện;</text>
  <text x="132" y="231" font-size="10.5" fill="#52687a">sự kiện chỉ phát sau khi giao dịch thành công.</text>
</svg>
<figcaption>Hình 7. Cơ chế phát sự kiện tin cậy: sự kiện được ghi cùng giao dịch với dữ liệu, gửi ra ngoài sau bằng bộ phát có chống trùng, lỗi rơi vào hàng đợi lỗi để thử lại và đối soát.</figcaption>
</figure>

### 22.4 Nguyên tắc giao diện tích hợp

Mọi giao diện đối ngoại của hệ thống tuân theo một bộ quy tắc thống nhất: mọi lệnh ghi phải có mã chống xử lý trùng; lệnh sửa đối tượng đã tồn tại phải kèm số thứ tự bản đang biết — sai bản thì trả thông báo xung đột, không ghi đè; ngày giờ lưu theo giờ quốc tế và hiển thị theo múi giờ người dùng; giá trị tiền luôn có loại tiền; tệp được tải qua địa chỉ tạm thời và kiểm tra mã nội dung; lỗi trả về theo một cấu trúc thống nhất; danh sách lớn dùng phân trang theo con trỏ; và giao diện phải kiểm tra đúng năng lực đang có hiệu lực theo hồ sơ cấu hình.

### 22.5 Nguyên tắc bộ kết nối

Mỗi bộ kết nối là một đơn vị vận hành hoàn chỉnh, có: tổ chức sở hữu; người phụ trách; phạm vi dữ liệu và hành động; cách xác thực; giới hạn tần suất; thời hạn chờ; số lần thử lại; cơ chế chống trùng; bản ánh xạ; hàng đợi lỗi; đối soát; ngắt khẩn cấp; cam kết mức dịch vụ; và phương án thủ công.

Ràng buộc kiến trúc quan trọng nhất: **bộ kết nối không được ghi trực tiếp vào bảng nghiệp vụ** — mọi dữ liệu vào phải đi qua giao diện nghiệp vụ của miền sở hữu, nơi các quy tắc và phân quyền được thi hành.

### 22.6 Nhật ký kiểm tra

Nhật ký kiểm tra ghi lại: người thực hiện; tổ chức; hồ sơ; hành động; đối tượng và số thứ tự bản; mục đích; địa chỉ mạng hoặc thiết bị khi cần; mã liên kết yêu cầu; và thời gian. Nhật ký được ghi nối tiếp, không sửa. Hệ quả cho toàn hệ thống: không tồn tại thao tác "sửa thẳng dữ liệu" cho nghiệp vụ đã ghi nhận — việc sửa phải dùng bản điều chỉnh hoặc giao dịch bù trừ, để cả giá trị sai lẫn hành động sửa đều nhìn thấy được khi kiểm tra.

---

## 23. Trí tuệ nhân tạo

### 23.1 Vai trò và ranh giới

Trí tuệ nhân tạo trong hệ thống là công cụ hạ chi phí phục vụ, không phải chủ thể nghiệp vụ. Nó được dùng để: tóm tắt hồ sơ và cuộc họp; phát hiện dữ liệu thiếu; trích xuất thông tin; tạo câu hỏi làm rõ; đề xuất từ khóa tìm kiếm; tạo danh sách sơ bộ; so sánh phương án theo tiêu chí đã đóng băng; soạn dự thảo thư, báo cáo và danh sách kiểm tra; cảnh báo thời hạn và rủi ro; theo dõi chỉ số; và hỗ trợ truy xuất tri thức.

Ranh giới bất di bất dịch: trí tuệ nhân tạo không sở hữu hồ sơ và không có quyền quyết định cuối. Ranh giới này không phải cam kết đạo đức mà là cấu trúc kỹ thuật — được thi hành bằng phân loại công việc, cổng hành động và danh sách cấm dưới đây.

### 23.2 Phân loại công việc

Mỗi trường hợp sử dụng trí tuệ nhân tạo phải được xếp vào một trong sáu nhóm, và cách xử lý đi theo nhóm:

| Nhóm công việc | Cách xử lý |
|---|---|
| Có thể tự động | Chỉ tự chạy khi dữ liệu có cấu trúc, rủi ro thấp và đã kiểm thử |
| Tự phục vụ phổ thông | Không phát hành như ý kiến chuyên gia và không thu phí chuyên môn riêng |
| Trí tuệ nhân tạo làm trước, người rà soát | Luôn ở trạng thái dự thảo, có nguồn và người duyệt |
| Con người chịu trách nhiệm | Người có nhiệm vụ phải quyết định hoặc ký |
| Công việc ngoài thực tế | Hệ thống chỉ hỗ trợ lịch, danh sách kiểm tra và thu bằng chứng |
| Thẩm quyền bên ngoài | Chỉ ghi nhận quyết định từ nguồn có thẩm quyền |

Quy tắc chống trượt phân loại: không được đổi công việc thuộc nhóm "con người chịu trách nhiệm" hoặc "thẩm quyền bên ngoài" thành công việc tự động chỉ bằng thay cấu hình hoặc thay mô hình — thay đổi phân loại là thay đổi bất biến lõi, phải qua quy trình sửa mã nguồn và kiểm thử.

### 23.3 Cổng hành động

Mô hình không bao giờ gọi trực tiếp thư điện tử, Zalo, lịch, báo giá, hợp đồng hoặc hóa đơn. Mọi hành động có tác động ra ngoài đi qua một cổng kiểm soát tám bước:

<figure class="fig">
<svg viewBox="0 0 680 310" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="ar5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#3e5265"/>
    </marker>
  </defs>
  <rect x="10" y="100" width="150" height="60" rx="8" fill="#eef3f8" stroke="#12365a"/>
  <text x="85" y="126" text-anchor="middle" font-size="11.5" fill="#12365a">Trợ lý trí tuệ nhân tạo</text>
  <text x="85" y="142" text-anchor="middle" font-size="10.5" fill="#3e5265">(chỉ đề xuất hành động)</text>
  <line x1="160" y1="130" x2="195" y2="130" stroke="#3e5265" marker-end="url(#ar5)"/>
  <rect x="195" y="26" width="230" height="230" rx="8" fill="#f4f7fa" stroke="#12365a" stroke-width="1.5"/>
  <text x="310" y="48" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#12365a">Cổng hành động</text>
  <text x="210" y="72" font-size="10.5" fill="#3e5265">1. Kiểm tra người sử dụng, tổ chức</text>
  <text x="210" y="92" font-size="10.5" fill="#3e5265">2. Kiểm tra nhiệm vụ và mục đích</text>
  <text x="210" y="112" font-size="10.5" fill="#3e5265">3. Kiểm tra phân loại dữ liệu</text>
  <text x="210" y="132" font-size="10.5" fill="#3e5265">4. Kiểm tra chính sách hành động</text>
  <text x="210" y="152" font-size="10.5" fill="#3e5265">5. Xác định có cần người duyệt</text>
  <text x="210" y="172" font-size="10.5" fill="#3e5265">6. Ghi dấu vết</text>
  <text x="210" y="192" font-size="10.5" fill="#3e5265">7. Thực hiện qua bộ kết nối</text>
  <text x="210" y="212" font-size="10.5" fill="#3e5265">8. Ghi kết quả hoặc lỗi</text>
  <line x1="425" y1="90" x2="460" y2="90" stroke="#3e5265" marker-end="url(#ar5)"/>
  <rect x="460" y="62" width="205" height="56" rx="8" fill="#fdf3e3" stroke="#b45309"/>
  <text x="562" y="86" text-anchor="middle" font-size="11" fill="#8a4a08">Người duyệt</text>
  <text x="562" y="102" text-anchor="middle" font-size="10.5" fill="#8a4a08">(khi chính sách yêu cầu)</text>
  <line x1="562" y1="118" x2="562" y2="160" stroke="#3e5265" marker-end="url(#ar5)"/>
  <line x1="425" y1="190" x2="460" y2="190" stroke="#3e5265" marker-end="url(#ar5)"/>
  <rect x="460" y="160" width="205" height="60" rx="8" fill="#f4ede3" stroke="#8a6d3b"/>
  <text x="562" y="186" text-anchor="middle" font-size="11" fill="#6b5423">Bộ kết nối → kênh ngoài</text>
  <text x="562" y="203" text-anchor="middle" font-size="10.5" fill="#6b5423">thư điện tử · Zalo · lịch · hóa đơn</text>
  <rect x="10" y="272" width="655" height="30" rx="6" fill="#e9ecef" stroke="#52687a"/>
  <text x="337" y="291" text-anchor="middle" font-size="10.5" fill="#3e5265">Sổ kiểm tra: 100% hành động liên kết được chuỗi đề xuất — phê duyệt — thực hiện (mục 25)</text>
</svg>
<figcaption>Hình 8. Cổng hành động của trí tuệ nhân tạo: mô hình chỉ đề xuất; mọi tác động ra ngoài đi qua tám bước kiểm soát, có người duyệt khi chính sách yêu cầu, và luôn để lại dấu vết.</figcaption>
</figure>

Chỉ các hành động rủi ro thấp đã kiểm thử (xác nhận lịch, nhắc việc) được tự động hoàn toàn; phần còn lại dừng ở bước 5 chờ người duyệt.

### 23.4 Hành động bị cấm

Danh sách cấm tuyệt đối — không cấu hình nào mở được: trí tuệ nhân tạo không được tự ký hoặc chấp nhận hợp đồng; tự cam kết giá, trách nhiệm hoặc quyền sở hữu trí tuệ; tự xác nhận nhu cầu đủ điều kiện; tự chuyển giai đoạn hồ sơ; tự chọn công nghệ, chuyên gia hoặc nhà cung cấp; tự quyết định tín dụng hoặc tài trợ; tự kết luận định giá; tự ký ý kiến chuyên môn; tự nghiệm thu; tự công nhận kết quả; tự nộp hồ sơ ra cơ quan ngoài; tự thay số liệu gốc hoặc tiêu chí sau khi biết kết quả; tự mở rộng quyền truy cập; hoặc sử dụng dữ liệu của tổ chức này cho tổ chức khác khi thiếu quyền.

### 23.5 Không gian tri thức riêng

Tri thức phục vụ trí tuệ nhân tạo được tách theo: tổ chức; không gian làm việc; hồ sơ; mục đích; nguồn; quyền sử dụng; thời hạn; và mức bảo mật. Không có "kho tri thức chung" học chéo giữa các khách hàng: dữ liệu của doanh nghiệp này không cải thiện câu trả lời cho doanh nghiệp khác, và tri thức của chuyên gia này không rò sang trợ lý của chuyên gia khác.

Khi một nguồn bị thu hồi, nguồn đó phải ngừng được truy xuất ngay; bộ nhớ tạm và chỉ mục liên quan được xóa theo chính sách, trong khi dấu vết của nội dung đã gửi hợp pháp trước đó vẫn được giữ để phục vụ kiểm tra.

### 23.6 Kiểm thử trí tuệ nhân tạo

Trước khi đưa vào vận hành và trước mỗi lần thay mô hình, bộ kiểm thử phải bao phủ các kịch bản thất bại đặc thù: bịa nguồn; dùng quy định hết hiệu lực; dùng sai ngành hoặc địa bàn; bỏ sót ngoại lệ; làm lộ dữ liệu giữa tổ chức; bị nội dung tài liệu điều khiển trái phép; gọi hành động ngoài quyền; thiên vị nhà cung cấp; tạo chứng chỉ hoặc thẩm quyền giả; sửa số liệu gốc; tính trùng lợi ích; và che giấu kết quả không thuận lợi.

Việc thay mô hình được đối xử như thay một cấu phần hạ tầng quan trọng: chỉ thực hiện sau khi so sánh chất lượng, an toàn, chi phí và có phương án quay lại.

---

## 24. Định danh, phân quyền và an toàn

### 24.1 Định danh

Hệ thống sử dụng nhà cung cấp định danh tập trung thay vì tự xây cơ chế mật khẩu riêng, với các năng lực: đăng nhập nhiều lớp đối với tài khoản quan trọng; liên kết tài khoản với tổ chức; vòng đời mời, kích hoạt, khóa và thu hồi; quản lý phiên; thu hồi thiết bị và khóa truy cập; và đăng nhập liên kết khi có đối tác đủ điều kiện.

### 24.2 Mô hình phân quyền

Phân quyền trong hệ thống nhiều chiều hơn mô hình vai trò thông thường, vì cùng một người có thể là chuyên gia trong hồ sơ này và bên cung cấp trong hồ sơ khác. Quyền được quyết định theo tổ hợp: người sử dụng; tổ chức; vai trò; hồ sơ hoặc chương trình; nhiệm vụ; mục đích; loại dữ liệu; phạm vi tài liệu; thời hạn; xung đột lợi ích; và năng lực đang được kích hoạt.

Vị trí thi hành là quyết định kiến trúc then chốt: **quyết định quyền nằm tại lớp nghiệp vụ**, không chỉ tại đường dẫn bên ngoài. Cổng vào có thể chặn thô, nhưng câu trả lời cuối cùng "người này có được làm việc này trên đối tượng này không" thuộc về miền nghiệp vụ sở hữu đối tượng — nơi có đủ ngữ cảnh về nhiệm vụ, mục đích và xung đột.

#### 24.2.1 Quyền khai thác dữ liệu tổng hợp

Việc khai thác số liệu tổng hợp phục vụ quản lý, nghiên cứu và hoạch định chính sách (mục 2.1) trả lời một câu hỏi khác với câu hỏi ở trên: không phải "được xem tài liệu nào" mà "được truy vấn ở mức tổng hợp nào". Quyền này **không tạo trục phân quyền mới**; nó được diễn đạt bằng đúng hai chiều đã có trong mô hình là *mục đích* và *loại dữ liệu*, cộng thêm một thuộc tính mức tổng hợp.

Bốn quy tắc:

- Người được cấp quyền khai thác tổng hợp **không đồng thời có quyền đọc bản ghi gốc**; hai loại quyền cấp riêng, có mục đích và thời hạn riêng.
- Kết quả truy vấn tổng hợp phải đạt ngưỡng số lượng tối thiểu trước khi hiển thị, để không suy ngược ra được dữ liệu của một doanh nghiệp đơn lẻ.
- Dữ liệu cá nhân và bí mật kinh doanh không xuất hiện trong kết quả tổng hợp dưới bất kỳ dạng nào, kể cả khi người truy vấn có quyền đọc chúng ở luồng hồ sơ.
- Mọi truy vấn khai thác được ghi nhật ký theo mục 22.6 với người thực hiện, mục đích và phạm vi — cùng chuẩn với các lệnh nhạy cảm khác.

Việc xuất báo cáo tuân đúng các quy tắc trên: bản xuất mang theo phạm vi, thời điểm và mức tổng hợp của nó, để người nhận biết con số được tính trên tập dữ liệu nào.

### 24.3 Nguyên tắc quyền tối thiểu

Các hệ quả cụ thể của quyền tối thiểu trong bối cảnh này: thuộc một tổ chức không đồng nghĩa được xem mọi dữ liệu của tổ chức; tham gia một hồ sơ không đồng nghĩa được xem toàn bộ tài liệu; điều phối viên không mặc định có quyền ký; quản trị kỹ thuật không mặc định có quyền quyết định nghiệp vụ; NacenX không được dùng tài khoản vận hành để thay NacenTech; quyền hết hạn phải bị thu hồi tự động; và quyền khẩn cấp phải có lý do, thời hạn và rà soát sau sử dụng.

### 24.4 Bảo vệ dữ liệu

Dữ liệu được phân loại thành: công khai; nội bộ; hạn chế; bí mật kinh doanh; dữ liệu cá nhân; dữ liệu nhạy cảm; và dữ liệu thuộc yêu cầu lưu trữ đặc biệt. Mỗi loại có quy tắc riêng về mã hóa, vị trí lưu, người được xem, tải xuống, chia sẻ, thời hạn lưu, sao lưu, xóa và ghi nhật ký. Phân loại được gắn từ lúc dữ liệu vào hệ thống và đi theo dữ liệu qua mọi phân hệ — tài liệu bí mật kinh doanh trong phòng dữ liệu vẫn là bí mật kinh doanh khi được trích dẫn trong báo cáo.

### 24.5 Bảo vệ tệp và khóa

Tệp được mã hóa khi lưu; tài liệu đặc biệt nhạy cảm có khóa riêng; khóa được quản lý tách khỏi kho tệp; bản sao lưu được mã hóa; việc hủy khóa được kiểm soát; và mã kiểm tra nội dung được xác minh khi nhận và đọc định kỳ. Kho lưu giữ không cho sửa (phục vụ bằng chứng) đi cùng khả năng hủy quyền giải mã khi có yêu cầu hợp lệ — cơ chế dung hòa giữa bất biến và quyền xóa đã nêu tại mục 17.2.

### 24.6 Bí mật hệ thống

Không đặt mật khẩu hoặc khóa trong mã nguồn; bí mật được lấy từ kho quản lý; có lịch thay khóa; tài khoản dịch vụ tách theo môi trường và chỉ có quyền tối thiểu; việc sử dụng bí mật được ghi nhận và cảnh báo bất thường.

### 24.7 An toàn tích hợp

Lớp tích hợp áp dụng: xác thực hai phía khi phù hợp; giới hạn địa chỉ và tần suất; ký yêu cầu hoặc sự kiện quan trọng; kiểm tra thời gian và mã chống phát lại; cách ly dữ liệu đầu vào; quét tệp; chặn ghi trực tiếp vào bảng nghiệp vụ; ngắt bộ kết nối khi có sự cố; và đối soát sau khi phục hồi.

### 24.8 Xử lý sự cố

Kế hoạch xử lý sự cố xác định trước: mức độ; người trực; cách cô lập; cách thu hồi quyền; cách bảo toàn bằng chứng; cách thông báo; cách phục hồi; cách đánh giá dữ liệu bị ảnh hưởng; cách khắc phục; và cách rà soát sau sự cố.

Quy tắc riêng cho trí tuệ nhân tạo: sự cố liên quan trí tuệ nhân tạo phải hạ mức tự động hóa về "chỉ soạn dự thảo" cho đến khi được phê duyệt lại — hệ thống thoái lui về trạng thái an toàn thay vì tiếp tục chạy với niềm tin đã mất.

---

## 25. Yêu cầu chất lượng hệ thống

Các mục tiêu chất lượng ban đầu được đặt ở mức một hệ thống nghiệp vụ quan trọng nhưng chưa phải hạ tầng thời gian thực; nguyên tắc chung là **không mua hạ tầng cho quy mô chưa được chứng minh** — mục tiêu cuối cùng sẽ được chốt lại bằng số liệu giai đoạn đầu.

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

Đáng chú ý là bốn dòng giữa bảng — dấu vết, kiểm soát trí tuệ nhân tạo, kiểm soát cấu hình và tách dữ liệu — có mục tiêu 100% hoặc "không": đây là các yêu cầu liêm chính, không phải yêu cầu hiệu năng, và không được đánh đổi lấy tốc độ hay chi phí.

### 25.1 Khả năng quan sát

Hệ thống thu thập: nhật ký có cấu trúc; số đo; dấu vết yêu cầu qua nhiều phân hệ; mã liên kết yêu cầu; hàng đợi lỗi; trạng thái bộ kết nối; thời gian xử lý; tỷ lệ lỗi; cảnh báo an toàn; cảnh báo nghĩa vụ quá hạn; và chi phí trí tuệ nhân tạo. Hai mục cuối phản ánh đặc thù nghiệp vụ: hệ thống giám sát cả nghĩa vụ của con người (mốc quá hạn, hồ sơ bị chặn) lẫn chi phí biến đổi của trí tuệ nhân tạo — thứ có thể âm thầm phá vỡ mô hình chi phí nếu không đo.

### 25.2 Sao lưu, phục hồi và khả năng chuyển giao

Ngoài sao lưu cơ sở dữ liệu, kho tệp và cấu hình theo lịch với bản sao tách biệt và kiểm tra phục hồi định kỳ có ghi kết quả, kiến trúc yêu cầu một năng lực ít gặp: **diễn tập mất đơn vị vận hành**. NacenTech phải có quyền và khả năng thực tế nhận gói chuyển giao — dữ liệu, mã nguồn, bản dựng, khóa, tài liệu vận hành — khi cần thay đơn vị vận hành (mục 3.4). Khả năng này phải được diễn tập, không chỉ ghi trong hợp đồng.

---

## 26. Công nghệ, triển khai và chuyển đổi hệ thống

### 26.1 Hiện trạng nền tảng NacenTwin kế thừa

#### 26.1.1 Quan hệ giữa tài liệu này và nền tảng đang chạy

Nền tảng chính thức của NacenTech là **NacenTwin**. Kiến trúc trình bày trong tài liệu này không phải một hệ thống mới thay thế NacenTwin, mà là **bước phát triển tiếp theo của chính nền tảng đó**. Bộ mã nguồn do SotaTek phát triển được kế thừa toàn bộ, tiếp tục vận hành và chuyển đổi dần theo lộ trình tại mục 26.6 và 26.7.

Nguyên tắc kế thừa áp dụng cho mọi phần của tài liệu: **những gì đã có được ghi nhận đúng mức độ hoàn thiện thật, không ghi theo mức độ đã cam kết trong hồ sơ đề án.** Một màn hình chạy dữ liệu giả không được tính là năng lực đã có. Một module có tên trong danh sách chức năng dự kiến không được tính là đã triển khai. Kỷ luật này quan trọng vì khoảng cách giữa "trông có vẻ xong" và "thực sự chạy" là chỗ dễ gây hiểu nhầm nhất khi báo cáo tiến độ, và là rủi ro lớn nhất với uy tín của một nền tảng lấy niềm tin làm sản phẩm.

Hai điểm về danh xưng cần ghi rõ để tránh nhầm lẫn khi đội kỹ thuật đọc mã nguồn. Thứ nhất, **tên "NacenTwin" không xuất hiện trong mã nguồn**; các kho và gói phần mềm đều mang tiền tố `dmst`, và gói backend tự đặt tên `dmst-poc-be`. Thứ hai, bộ mã **tự nhận là bản chứng minh khả thi**, không phải sản phẩm hoàn chỉnh. Việc chuẩn hóa lại danh xưng giữa tài liệu, mã nguồn và hạ tầng là một hạng mục phải làm trong quá trình chuyển đổi.

Các mô tả trong mục này là kết quả rà soát trực tiếp mã nguồn cả năm kho cùng bản đang chạy công khai, thực hiện cuối tháng 8 năm 2026. Đây là ảnh chụp tại một thời điểm; trước mỗi lần chuyển giai đoạn phải kiểm kê lại theo mục 26.7.

#### 26.1.2 Các cấu phần đang vận hành

NacenTwin hiện chạy công khai trên bốn địa chỉ, phục vụ bởi năm kho mã nguồn:

| Kho mã nguồn | Vai trò thực tế | Địa chỉ công khai | Quy mô mã |
|---|---|---|---:|
| `dmst-backend-main` | Máy chủ dịch vụ, sở hữu toàn bộ nghiệp vụ và cơ sở dữ liệu | `nacentwin-api.nacenx.com` | ~13.500 dòng |
| `dmst-user-main` | Giao diện người dùng | `nacentwin-app.nacenx.com` | ~27.500 dòng |
| `dmst-admin-main` | Giao diện quản trị | `nacentwin-admin.nacenx.com` | ~15.500 dòng |
| `dmst-landing-page-main` | Trang giới thiệu nền tảng | `nacentwin.nacenx.com` | ~6.300 dòng |
| `dmst-rag-master` | **Dịch vụ nhúng vector**, không phải dịch vụ truy xuất tri thức | nội bộ, không mở ra ngoài | ~200 dòng |

Ba điểm phải đính chính so với cách hệ thống thường được mô tả:

- **Kho `dmst-rag-master` không phải hệ thống truy xuất tri thức tăng cường.** Đây là một máy chủ nhúng vector khoảng 200 dòng, nạp mô hình nhúng BGE-M3 và trả về vector 1024 chiều. Nó không có mô hình ngôn ngữ, không có cơ sở dữ liệu vector, không có kho tri thức và không có bước truy xuất. Tên kho gây hiểu nhầm; **hệ thống hiện tại không có năng lực truy xuất tri thức tăng cường nào.**
- **Vector không lưu bằng phần mở rộng vector của PostgreSQL.** Cột nhúng trong cơ sở dữ liệu là mảng số thực thường; toàn bộ tìm kiếm vector thực tế chạy trên Elasticsearch. Tài liệu nội bộ của kho backend ghi ngược lại điểm này và cần được sửa.
- Trang tại `nacentwin.nacenx.com` là **trang giới thiệu nền tảng**, không phải trang thông tin của Viện. Đây là hai sản phẩm khác nhau, không được tính gộp khi báo cáo khối lượng.

#### 26.1.3 Ngăn xếp công nghệ thực tế

| Thành phần | Hiện trạng | Quan hệ với kiến trúc đích |
|---|---|---|
| Máy chủ dịch vụ | NestJS 11 trên Node.js 22 | Đóng băng từ tuần 0, thay một lần bằng ASP.NET Core trên .NET 10 tại thời điểm cắt chuyển (mục 26.2, 26.6) |
| Cơ sở dữ liệu | PostgreSQL 16, truy cập qua TypeORM | Giữ công nghệ; dữ liệu chuyển một chiều sang cấu trúc chuẩn mới bằng công cụ chuyển đổi có đối soát (mục 26.6) |
| Hàng đợi | BullMQ trên Redis 7 | Thay bằng hàng đợi trong PostgreSQL cùng lúc cắt chuyển, để việc xếp hàng nằm trong cùng giao dịch với ghi dữ liệu |
| Tìm kiếm | Elasticsearch 8.17, kết hợp tìm vector và từ khóa | Giữ, đúng định hướng tại mục 26.3 |
| Xác thực | JWT một lớp, mã hóa mật khẩu bằng bcrypt | Thay bằng nhà cung cấp định danh tập trung (mục 24.1) |
| Trí tuệ nhân tạo | Bốn nhà cung cấp mô hình sau một giao diện chung | Đưa sau cổng hành động tại mục 23.3 |
| Lưu trữ tệp | **Đĩa cục bộ của máy chủ ứng dụng** | Chuyển sang kho đối tượng có kiểm tra toàn vẹn (mục 26.3, 24.5) |
| Thư điện tử | Nodemailer qua SMTP, gửi bất đồng bộ qua hàng đợi | Giữ, bổ sung dấu vết theo mục 22.6 |
| Giao diện người dùng, quản trị | React 18 với Vite 6 | Giữ, nối dần sang giao diện nghiệp vụ mới |
| Trang giới thiệu | **React 19 với Vite 8** | Khác bản phát hành so với hai giao diện kia |

Hai khoản nợ kỹ thuật cần ghi nhận ngay từ khâu kế thừa. **Ngăn xếp giao diện không thống nhất**: trang giới thiệu dùng bản phát hành React và công cụ dựng khác hẳn hai cổng còn lại. Ngoài ra hai cổng người dùng và quản trị cùng lúc dùng hai hệ thành phần giao diện chồng nhau, làm tăng kích thước gói và chi phí bảo trì. **Lưu tệp trên đĩa cục bộ** khiến máy chủ ứng dụng có trạng thái, cản trở việc nhân bản và không đáp ứng yêu cầu toàn vẹn tệp tại mục 25.

#### 26.1.4 Mô hình dữ liệu hiện có

Cơ sở dữ liệu hiện có mười bốn bảng, xoay quanh một bảng trung tâm duy nhất:

| Nhóm | Bảng | Nội dung |
|---|---|---|
| Người dùng | `users`, `user_settings` | Tài khoản, vai trò, tùy chọn tự động tìm ghép cặp |
| Nội dung trung tâm | `intakes` | Hồ sơ đăng tải, dùng chung cho cả công nghệ và bài toán, phân biệt bằng trường loại |
| Phân loại | `sectors`, `categories`, `intake_sectors` | Lĩnh vực và danh mục |
| Tệp và nội dung | `intake_attachments`, `intake_chunks` | Tệp đính kèm theo mức bảo mật; đoạn văn bản kèm vector nhúng |
| Ghép cặp | `intake_matches` | Cặp công nghệ – bài toán kèm điểm số tiền tính |
| Hợp tác | `collaboration_requests` | Lời mời hợp tác và trạng thái chấp nhận, từ chối |
| Thông báo | `notifications` | Bốn loại sự kiện |
| Nội dung khác | `stories` | Thư viện câu chuyện thành công và thất bại |
| Hạ tầng tài khoản | `account_activation_tokens`, `password_reset_tokens` | Mã kích hoạt và đặt lại mật khẩu |

Bảng `intakes` đã có sẵn ba mức bảo mật nội dung: phần công khai bắt buộc cộng hai tầng thông tin bí mật tùy chọn. **Đây là nền móng đúng hướng cho yêu cầu phòng dữ liệu tại mục 17.1, nhưng hiện chưa có cơ chế nào kiểm soát ai được xem tầng nào** — cấu trúc đã có, quy trình chưa có.

Một chi tiết lịch sử quan trọng cho việc lập kế hoạch: bản khởi tạo cơ sở dữ liệu từng có các bảng `experts`, `owners`, `research_fields`, `ips`, `challenges` cùng các bảng phụ trợ, nhưng **toàn bộ tám bảng này đã bị gỡ bỏ trong một lần dọn dẹp**, hợp nhất về mô hình `intakes` duy nhất. Nghĩa là khi xây mạng chuyên gia theo mục 14, đội phát triển làm lại từ đầu chứ không khôi phục cái đã có.

Đối chiếu với mô hình dữ liệu đích tại mục 11, hệ hiện tại chưa có bất kỳ thực thể nào cho: hồ sơ thương mại hóa, giai đoạn và quyết định, chuyên gia và nhiệm vụ, thẩm định, thỏa thuận, mốc công việc, bằng chứng, kết quả, tài chính, chương trình, tính phí, cấu hình năng lực và nhật ký kiểm tra.

#### 26.1.5 Mức độ hoàn thiện thực tế theo 15 module dự kiến

| # | Module | Mức đáp ứng | Thực trạng |
|---|---|---:|---|
| 1 | Đăng tải và quản lý bài toán, giải pháp | 55% | Đăng và phân loại đã tốt; thiếu trường nghiệp vụ và vòng đời |
| 2 | Ghép nối bằng trí tuệ nhân tạo | 60% | Mạnh nhất hệ thống; thiếu vòng học từ phản hồi |
| 3 | Hồ sơ và xác thực năng lực | 5% | Gần như chưa có gì ngoài kích hoạt qua thư điện tử |
| 4 | Giao dịch, hợp đồng và ký quỹ | 0% | Chưa có dòng nào |
| 5 | Cho thuê hạ tầng dùng chung | 15% | Chỉ có giao diện chạy dữ liệu giả, đang bị ẩn |
| 6 | Môi trường thử nghiệm | 0% | Chưa có dòng nào |
| 7 | Thẩm định và bảo vệ sở hữu trí tuệ | 10% | Mới có ba tầng bảo mật nội dung, chưa có quy trình |
| 8 | Đào tạo và nhân rộng | 15% | Thư viện câu chuyện chạy thật; còn lại là giao diện giả |
| 9 | Ghép nối đầu tư | 0% | Chưa có dòng nào |
| 10 | Chuyển giao công nghệ | 5% | Chỉ có giao diện định giá chạy dữ liệu giả |
| 11 | Mạng chuyên gia | 0% | Bảng dữ liệu chuyên gia đã bị gỡ khỏi hệ thống |
| 12 | Bảng điều khiển quản trị và báo cáo | 30% | Có thống kê cơ bản; thiếu chỉ số nghiệp vụ và xuất báo cáo |
| 13 | Chương trình tăng trưởng và ưu đãi | 5% | Chỉ là nội dung quảng bá, không có cơ chế phía sau |
| 14 | Tài khoản và phân quyền | 40% | Đăng nhập tốt; thiếu vai trò, xác thực hai lớp, nhật ký |
| 15 | Tích hợp và liên thông dữ liệu quốc gia | 5% | Có giao diện nội bộ, chưa liên thông hệ thống nào |

Mức trung bình khoảng 16%, nhưng con số trung bình che mất bức tranh thật vì phân bố rất lệch: hai module lõi đạt 55–60%, trong khi bốn module ở đúng 0% và năm module khác dưới 10%. Hệ thống đã đi rất sâu vào một nhánh và gần như chưa chạm vào các nhánh còn lại.

Các mức phần trăm là ước lượng theo tỷ lệ đầu mục chức năng hoạt động thật trên tổng số đầu mục yêu cầu, không phải theo khối lượng công sức. Một module ở mức 0% không có nghĩa là khó làm, và một module ở mức 60% không có nghĩa là sắp xong.

#### 26.1.6 Điểm đứt của dòng nghiệp vụ

Đây là phát hiện quan trọng nhất của đợt rà soát, và là căn cứ trực tiếp cho thứ tự ưu tiên trong lộ trình.

<figure class="fig">
<svg viewBox="0 0 680 300" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="arN" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#12365a"/>
    </marker>
    <marker id="arG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#9aa8b5"/>
    </marker>
  </defs>
  <text x="24" y="24" font-size="11.5" font-weight="bold" fill="#12365a">Phần đang chạy thật</text>
  <rect x="16" y="34" width="128" height="46" rx="5" fill="#dbe7f1" stroke="#12365a"/>
  <text x="80" y="53" text-anchor="middle" font-size="10.5" fill="#12365a">Đăng công nghệ</text>
  <text x="80" y="68" text-anchor="middle" font-size="10.5" fill="#12365a">hoặc bài toán</text>
  <rect x="164" y="34" width="128" height="46" rx="5" fill="#dbe7f1" stroke="#12365a"/>
  <text x="228" y="53" text-anchor="middle" font-size="10.5" fill="#12365a">AI đọc hiểu và</text>
  <text x="228" y="68" text-anchor="middle" font-size="10.5" fill="#12365a">ghép cặp</text>
  <rect x="312" y="34" width="128" height="46" rx="5" fill="#dbe7f1" stroke="#12365a"/>
  <text x="376" y="53" text-anchor="middle" font-size="10.5" fill="#12365a">Thông báo và</text>
  <text x="376" y="68" text-anchor="middle" font-size="10.5" fill="#12365a">lời mời hợp tác</text>
  <rect x="460" y="34" width="128" height="46" rx="5" fill="#dbe7f1" stroke="#12365a"/>
  <text x="524" y="53" text-anchor="middle" font-size="10.5" fill="#12365a">Đồng ý</text>
  <text x="524" y="68" text-anchor="middle" font-size="10.5" fill="#12365a">hoặc từ chối</text>
  <line x1="144" y1="57" x2="164" y2="57" stroke="#12365a" marker-end="url(#arN)"/>
  <line x1="292" y1="57" x2="312" y2="57" stroke="#12365a" marker-end="url(#arN)"/>
  <line x1="440" y1="57" x2="460" y2="57" stroke="#12365a" marker-end="url(#arN)"/>
  <line x1="608" y1="26" x2="608" y2="92" stroke="#b45309" stroke-width="2.5" stroke-dasharray="6,4"/>
  <text x="643" y="52" text-anchor="middle" font-size="12" font-weight="bold" fill="#8a4a08">ĐỨT</text>
  <text x="643" y="70" text-anchor="middle" font-size="9.5" fill="#8a4a08">tại đây</text>
  <text x="24" y="128" font-size="11.5" font-weight="bold" fill="#8a4a08">Phần chưa có — hai bên rời nền tảng và tự làm việc với nhau</text>
  <rect x="16" y="138" width="122" height="46" rx="5" fill="#ffffff" stroke="#9aa8b5" stroke-dasharray="5,3"/>
  <text x="77" y="157" text-anchor="middle" font-size="10.5" fill="#6b7c8c">Trao đổi,</text>
  <text x="77" y="172" text-anchor="middle" font-size="10.5" fill="#6b7c8c">phòng đàm phán</text>
  <rect x="150" y="138" width="122" height="46" rx="5" fill="#ffffff" stroke="#9aa8b5" stroke-dasharray="5,3"/>
  <text x="211" y="157" text-anchor="middle" font-size="10.5" fill="#6b7c8c">Thẩm định,</text>
  <text x="211" y="172" text-anchor="middle" font-size="10.5" fill="#6b7c8c">hồ sơ năng lực</text>
  <rect x="284" y="138" width="122" height="46" rx="5" fill="#ffffff" stroke="#9aa8b5" stroke-dasharray="5,3"/>
  <text x="345" y="157" text-anchor="middle" font-size="10.5" fill="#6b7c8c">Hợp đồng</text>
  <text x="345" y="172" text-anchor="middle" font-size="10.5" fill="#6b7c8c">điện tử, ký số</text>
  <rect x="418" y="138" width="122" height="46" rx="5" fill="#ffffff" stroke="#9aa8b5" stroke-dasharray="5,3"/>
  <text x="479" y="157" text-anchor="middle" font-size="10.5" fill="#6b7c8c">Ký quỹ theo mốc,</text>
  <text x="479" y="172" text-anchor="middle" font-size="10.5" fill="#6b7c8c">thanh toán</text>
  <rect x="552" y="138" width="112" height="46" rx="5" fill="#ffffff" stroke="#9aa8b5" stroke-dasharray="5,3"/>
  <text x="608" y="157" text-anchor="middle" font-size="10.5" fill="#6b7c8c">Xác minh</text>
  <text x="608" y="172" text-anchor="middle" font-size="10.5" fill="#6b7c8c">kết quả</text>
  <g stroke="#9aa8b5" stroke-dasharray="4,3">
    <line x1="138" y1="161" x2="150" y2="161" marker-end="url(#arG)"/>
    <line x1="272" y1="161" x2="284" y2="161" marker-end="url(#arG)"/>
    <line x1="406" y1="161" x2="418" y2="161" marker-end="url(#arG)"/>
    <line x1="540" y1="161" x2="552" y2="161" marker-end="url(#arG)"/>
  </g>
  <rect x="16" y="208" width="648" height="76" rx="6" fill="#fdf3e3" stroke="#b45309"/>
  <text x="30" y="230" font-size="11" font-weight="bold" fill="#8a4a08">Hệ quả của điểm đứt</text>
  <text x="30" y="250" font-size="10.5" fill="#6b3a06">Nền tảng mất dữ liệu giao dịch — không có lịch sử để cải thiện ghép nối, không có bằng chứng kết quả.</text>
  <text x="30" y="267" font-size="10.5" fill="#6b3a06">Nền tảng mất luôn nguồn thu, vì mọi mô hình doanh thu đều giả định giao dịch diễn ra trên hệ thống.</text>
</svg>
<figcaption>Hình 9. Dòng nghiệp vụ hiện tại của NacenTwin dừng ngay sau khi hai bên tìm thấy nhau. Toàn bộ chuỗi tạo ra giá trị và doanh thu nằm ở phần chưa có.</figcaption>
</figure>

Phần lõi đã hoạt động: một viện có thể đăng công nghệ, một doanh nghiệp có thể đăng bài toán, hệ thống tự đọc hiểu nội dung cả hai phía, viết lại cho mạch lạc rồi tìm ngược sang phía đối diện để gợi ý các bên phù hợp; người dùng nhận thông báo và gửi lời mời hợp tác; bên kia đồng ý hoặc từ chối. **Đến đây là hết.**

Nói đúng bản chất, hệ thống hiện tại là **một sàn ghép cặp công nghệ với bài toán, có trợ giúp của trí tuệ nhân tạo** — đúng phần lõi của đề án và đã dùng được thật, nhưng mới là lõi. Đây chính là mắt xích đứt khiến phần đã làm xong không tạo ra được kết quả thật nào, và là lý do kiến trúc trong tài liệu này đặt hồ sơ thương mại hóa với vòng đời đầy đủ (mục 7) làm trung tâm thay vì dừng ở chức năng ghép nối.

#### 26.1.7 Ba nhóm tài sản và cách xếp loại

Khi kế thừa, mọi thứ đang có được xếp vào đúng một trong ba nhóm, không có nhóm thứ tư:

**Nhóm một — đang chạy thật, có người dùng và dữ liệu thật.** Vòng đời tài khoản đầy đủ gồm đăng ký, kích hoạt qua thư điện tử, quên và đổi mật khẩu có chặn tái sử dụng mật khẩu cũ, quản trị viên khoá và mở lại. Đăng tải hai chiều kèm tệp đính kèm và phân loại. Ba mức bảo mật nội dung. Cỗ máy ghép nối kết hợp tìm kiếm vector với khớp từ khóa. Thông báo tự động. Đề xuất hợp tác kèm gửi thư và thông báo. Thư viện câu chuyện. Ba nhóm thống kê cho quản trị viên.

**Nhóm hai — chỉ có giao diện, chạy dữ liệu giả ghi cứng trong mã nguồn, đã bị gỡ khỏi điều hướng.** Khoảng **hai mươi lăm trang** thuộc các mảng phòng đàm phán, hạ tầng và phòng thí nghiệm, định giá công nghệ, nhóm dịch vụ hỗ trợ, cùng ba nút đề xuất – đàm phán – dùng thử tại trang giao dịch; bên quản trị có thêm màn hồ sơ triển khai cũng chạy dữ liệu giả. Nhóm này chiếm phần lớn khối lượng mã của cổng người dùng nhưng **không được tính là năng lực hệ thống** cho tới khi nối được giao diện nghiệp vụ thật.

**Nhóm ba — chưa bắt đầu.** Ký quỹ và thanh toán, hợp đồng điện tử và ký số, phân xử tranh chấp, môi trường thử nghiệm, hồ sơ định danh đầy đủ theo nhiều loại vai trò, điểm uy tín, chỉ số mức độ sẵn sàng công nghệ, nhắn tin, nhật ký hệ thống, và toàn bộ nhóm dịch vụ trong mô hình đã đề ra.

Quy tắc bắt buộc khi phát hành: **mỗi màn hình đưa vào hệ thống phải hoặc nối được giao diện nghiệp vụ thật ngay trong đợt đó, hoặc được dán nhãn rõ ràng là bản xem trước và ẩn sau cờ tính năng.** Không có lựa chọn thứ ba là để tạm đấy như thật. Quy tắc này cũng đã được ghi thành yêu cầu môi trường tại mục 26.5.

#### 26.1.8 Nợ kỹ thuật, an toàn và chất lượng

Các phát hiện dưới đây đến từ kiểm tra trực tiếp mã nguồn và bản đang chạy. Nhóm đầu phải xử lý trước khi mời người dùng ngoài Viện vào sử dụng thật.

| Vấn đề | Mức độ | Bản chất |
|---|---|---|
| Nhóm giao diện gọi mô hình ngôn ngữ không yêu cầu xác thực | Cao | Bất kỳ ai cũng gọi được mô hình bằng khóa của hệ thống — rủi ro lạm dụng chi phí |
| Giao diện tìm kiếm ngữ nghĩa không yêu cầu xác thực | Cao | Cho phép truy vấn toàn bộ nội dung đã lập chỉ mục |
| Trang quản trị mở công khai ra internet | Cao | Ai có đường liên kết đều tới được màn hình đăng nhập |
| Mật khẩu quản trị mặc định dùng chung, ghi sẵn trong dữ liệu mẫu | Cao | Thành cửa hậu nếu chạy dữ liệu mẫu trên môi trường thật |
| Không có giới hạn tần suất cho đăng nhập | Cao | Thư viện giới hạn tần suất có cài nhưng không được dùng ở đâu |
| Dịch vụ nhúng vector không xác thực và mở mọi nguồn gọi | Cao | Ai tới được cổng dịch vụ đều dùng được tài nguyên tính toán |
| Elasticsearch chạy không bật bảo mật, không mã hóa đường truyền | Cao | Cổng dịch vụ ánh xạ ra máy chủ |
| Toàn bộ địa chỉ công khai chạy qua đường hầm từ một máy cá nhân | Cao | Tắt máy là toàn hệ thống ngừng phục vụ |
| Thẻ phiên lưu ở trình duyệt một năm, không đặt cờ bảo vệ | Trung bình | Dài hơn hạn sống thật của thẻ; đọc được bằng mã kịch bản |
| Container dịch vụ nhúng chạy bằng quyền quản trị hệ điều hành | Trung bình | Khác thông lệ đã áp dụng ở máy chủ dịch vụ chính |
| Sửa hồ sơ là ghi đè, không lưu vết phiên bản | Trung bình | Khác biệt kiến trúc, không phải lỗi vận hành |

Các mục trong bảng tương ứng trực tiếp với tiêu chí nghiệm thu 58 đến 64 tại mục 31.8, và với yêu cầu mọi giao diện phải kiểm tra quyền tại lớp nghiệp vụ ở mục 24.2. Riêng hai dòng đầu đáng chú ý vì chúng cho thấy **giao diện gọi mô hình ngôn ngữ đang nằm ngoài mọi cổng kiểm soát** — trái với yêu cầu tại mục 23.3 rằng mô hình không được gọi trực tiếp mà phải đi qua cổng hành động có kiểm tra người dùng, nhiệm vụ, mục đích và dấu vết.

Về chất lượng, cần ghi nhận thẳng thắn: **hệ thống gần như không có kiểm thử tự động.** Máy chủ dịch vụ có đúng một tệp kiểm thử mặc định sinh kèm khung ứng dụng; bốn kho còn lại không có tệp kiểm thử nào. Quy trình tích hợp liên tục có tồn tại nhưng chỉ làm nhiệm vụ triển khai, không chạy dựng, kiểm thử hay rà lỗi tĩnh. Điều này mâu thuẫn trực tiếp với nguyên tắc 14 tại mục 4 — mọi khả năng quan trọng phải kiểm thử được và kiểm tra lại được — và phải được khắc phục ngay trong đợt 0, bắt đầu từ bản ghi hành vi chuẩn của các giao diện hiện có để phát lại lên máy chủ mới (mục 26.6); máy chủ mới thì có kiểm thử kiến trúc, bất biến và phát lại trong quy trình phát hành từ ngày đầu.

Ngoài ra, **các kho mã nguồn không được quản lý bằng hệ quản lý phiên bản phân tán** trong bản bàn giao, nên không có lịch sử thay đổi, không truy được tác giả và không có cơ sở để rà soát mã. Việc đưa toàn bộ mã vào kho có lịch sử là điều kiện tiên quyết trước khi bắt đầu chuyển đổi.

#### 26.1.9 Khoảng cách kiến trúc giữa hệ hiện tại và kiến trúc đích

Bảng dưới đây là bản đồ công việc chuyển đổi thực chất — không phải danh sách tính năng còn thiếu, mà là những chỗ hệ hiện tại và kiến trúc trong tài liệu này khác nhau về nguyên tắc:

| Chủ đề | Hệ NacenTwin hiện tại | Kiến trúc đích | Mục |
|---|---|---|---|
| Đơn vị nghiệp vụ | Một bảng nội dung dùng chung, phân biệt bằng trường loại | Hồ sơ thương mại hóa xuyên suốt vòng đời | 5 |
| Vòng đời | Hai trạng thái: nháp và công khai | Mười một giai đoạn có cổng kiểm soát | 7 |
| Vai trò | Hai vai trò: người dùng và quản trị viên | Phân quyền theo nhiệm vụ, mục đích và thời hạn | 24.2 |
| Phiên bản dữ liệu | Sửa là ghi đè | Nội dung là căn cứ quyết định phải tạo bản mới | 11.7 |
| Bảo mật tài liệu | Ba tầng nội dung nhưng chưa kiểm soát ai xem tầng nào | Quyền theo nhiệm vụ, có thời hạn và nhật ký đọc | 17.1 |
| Người chịu trách nhiệm | Không có khái niệm điều phối viên | Mỗi hồ sơ có một điều phối viên chính và thời hạn | 4 |
| Vai trò của AI | Ghép cặp là chức năng trung tâm, giao diện gọi mô hình để mở | AI hỗ trợ, đi qua cổng hành động, không quyết định | 23 |
| Kết quả | Không ghi nhận giao dịch hay kết quả nào | Kết quả được xác minh, theo dõi 6–24 tháng | 18.3 |
| Nhật ký kiểm tra | Chưa có | Ghi nối tiếp, không sửa | 22.6 |
| Cấu hình năng lực | Bật tắt bằng cách chú thích mã điều hướng | Hồ sơ cấu hình có phiên bản và phê duyệt | 10.3 |
| Kiểm thử | Gần như không có | Mọi khả năng quan trọng phải kiểm thử được | 4 |

Điểm đáng chú ý ở dòng về vai trò của trí tuệ nhân tạo: hệ hiện tại đặt ghép cặp làm chức năng trung tâm, còn kiến trúc đích đặt nó ở vị trí công cụ hỗ trợ. Đây không phải hạ thấp phần đã làm tốt nhất của hệ thống — cỗ máy ghép nối vẫn được giữ và tiếp tục phát triển — mà là đặt nó đúng chỗ trong một chuỗi dài hơn, nơi giá trị thật nằm ở những bước sau khi hai bên đã tìm thấy nhau.

Dòng cuối cùng về cấu hình cũng đáng lưu ý: hiện các mảng chưa sẵn sàng được ẩn bằng cách chú thích mã điều hướng. Cách này chấp nhận được cho một bản chứng minh khả thi, nhưng không đáp ứng yêu cầu tại mục 10.3 rằng năng lực phải bật tắt bằng hồ sơ cấu hình có phiên bản, có người phê duyệt và có thời điểm hiệu lực — và cũng không đáp ứng tiêu chí nghiệm thu 46 rằng chức năng không được bật thì không gọi được.

### 26.2 Lựa chọn kiến trúc dịch vụ phía máy chủ

Hệ thống sử dụng ASP.NET Core trên .NET 10 hỗ trợ dài hạn, với kiến trúc **nguyên khối theo phân hệ** trong giai đoạn đầu. Lựa chọn nguyên khối — thay vì vi dịch vụ — dựa trên các căn cứ: giao dịch xuyên nhiều phân hệ (hồ sơ + quyết định + sự kiện + phí) cần tính nguyên tử mà chỉ giao dịch cơ sở dữ liệu chung mới bảo đảm rẻ và chắc; đội ngũ vận hành chưa cần và chưa kham nổi độ phức tạp của nhiều dịch vụ triển khai riêng; khối duy nhất dễ kiểm tra quyền, giao dịch và dấu vết; chi phí hạ tầng và triển khai thấp hơn; và ranh giới phân hệ vẫn được giữ nghiêm để tách sau này khi có nhu cầu thật.

Điều kiện để tách một phân hệ thành dịch vụ độc lập được định nghĩa trước, tránh tranh luận cảm tính về sau: không còn phụ thuộc giao dịch chung; có giao diện rõ; có nhu cầu mở rộng riêng; có đội sở hữu; có cơ chế xử lý bù trừ; và có kiểm thử lỗi mạng cùng xử lý trùng.

### 26.3 Thành phần công nghệ

| Thành phần | Công nghệ hoặc định hướng |
|---|---|
| Dịch vụ phía máy chủ | ASP.NET Core, .NET 10 hỗ trợ dài hạn |
| Cơ sở dữ liệu giao dịch | PostgreSQL |
| Kho tệp | Kho đối tượng đặt tại Việt Nam, hỗ trợ giữ bản không cho sửa |
| Hàng đợi | Bảng hàng đợi trong PostgreSQL, xếp hàng trong cùng giao dịch với ghi dữ liệu; hàng đợi chuyên dụng chỉ thêm khi có nhu cầu mở rộng đo được |
| Tìm kiếm | Giữ Elasticsearch tại thời điểm cắt chuyển máy chủ, chỉ hội tụ về PostgreSQL khi kiểm thử tiếng Việt đạt yêu cầu; không đổi máy chủ và đổi máy tìm kiếm trong cùng một bước |
| Trí tuệ nhân tạo | Giữ dịch vụ truy xuất tri thức hiện có sau lớp giao diện chuẩn |
| Định danh | Nhà cung cấp định danh hỗ trợ chuẩn liên kết và xác thực nhiều lớp |
| Ký số | Kết nối tổ chức cung cấp dịch vụ chứng thực và ký số phù hợp |
| Giám sát | Nhật ký, số đo, dấu vết và cảnh báo tập trung |
| Đóng gói | Thùng chứa ứng dụng và quy trình triển khai tự động |

### 26.4 Cấu trúc phân hệ

Mỗi phân hệ trong khối nguyên khối có: lớp nghiệp vụ; lớp điều phối trường hợp sử dụng; lớp lưu trữ; giao diện công khai; kiểm thử; cấu trúc dữ liệu riêng trong cùng cơ sở dữ liệu; và quyền sở hữu rõ (một đội chịu trách nhiệm).

Danh sách cấm giữ cho ranh giới không mục ruỗng theo thời gian — phân hệ không được: truy cập trực tiếp bảng của phân hệ khác trên đường ghi; mở giao dịch lồng riêng; gọi hệ thống ngoài trong giao dịch cơ sở dữ liệu; dùng chung đối tượng lưu trữ không có chủ sở hữu; hoặc tạo phụ thuộc vòng. Các quy tắc này được kiểm bằng kiểm thử kiến trúc tự động trong quy trình phát hành, không trông vào rà soát thủ công.

### 26.5 Môi trường

Tối thiểu có năm môi trường: phát triển; kiểm thử; kiểm thử chấp nhận; vận hành; và xem trước cho chức năng dùng dữ liệu giả. Màn hình dùng dữ liệu giả phải có dấu nhận biết rõ và không được mở như chức năng vận hành — tránh tình trạng bản trình diễn bị hiểu nhầm (hoặc cố ý trình bày) như năng lực đã có thật.

### 26.6 Chiến lược kế thừa và chuyển đổi

NacenTwin đang chạy thật, có dữ liệu và người dùng; vì vậy cái phải được kế thừa là **dữ liệu** và **hành vi của các giao diện đang được cổng người dùng gọi**. Cái không được kế thừa là mã máy chủ dịch vụ: hệ hiện tại nhỏ (mười bốn bảng, chín mươi lăm giao diện, gần như không có kiểm thử) và khác kiến trúc đích về nguyên tắc (mục 26.1.9), nên chạy hai máy chủ song song chỉ tạo thêm cổng định tuyến, cầu nối phiên và tranh chấp quyền ghi mà không mua được gì. Chiến lược là **thay máy chủ dịch vụ một lần, có diễn tập**: NestJS đóng băng từ tuần đầu và chỉ nhận sửa lỗi an toàn cùng việc bật nhật ký truy vấn tìm kiếm; ASP.NET Core được dựng trong hai tháng đầu, phục vụ cả giao diện cũ (qua lớp tương thích có ngày dừng) lẫn giao diện mới từ ngày cắt chuyển; dữ liệu chuyển một chiều bằng công cụ có đối soát; NestJS ngừng hẳn sau cửa sổ quay lại. Ba cổng giao diện được giữ nguyên và trỏ sang máy chủ mới tại ngày cắt chuyển, không dựng lại giao diện từ đầu.

Đây là quyết định đi ngược khuyến nghị "cuốn chiếu" rút từ bài học NPfIT tại mục 32.5. Nó chấp nhận được vì phạm vi cắt là một máy chủ nhỏ đã đóng băng với vài trăm người dùng, không phải một chương trình thay đồng loạt trên toàn quốc; và vì hai tháng đầu là vận hành thủ công (mục 27.3) nên không có tính năng mới nào cần máy chủ cũ trong thời gian dựng máy chủ mới. Điều không đổi: hồ sơ cấu hình năng lực vẫn quyết định cái gì được bật; dịch vụ truy xuất tri thức và Elasticsearch không nằm trong cú cắt.

<figure class="fig">
<svg viewBox="0 0 680 324" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="ar6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#3e5265"/>
    </marker>
  </defs>
  <text x="24" y="30" font-size="10.5" font-weight="bold" fill="#3e5265">Trước cắt chuyển (tháng 1–2)</text>
  <rect x="24" y="40" width="300" height="60" rx="8" fill="#eef3f8" stroke="#3e5265"/>
  <text x="174" y="62" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#12365a">dmst-backend — NestJS 11 (đóng băng)</text>
  <text x="174" y="80" text-anchor="middle" font-size="10.5" fill="#3e5265">phục vụ người dùng hiện có · chỉ sửa an toàn</text>
  <text x="174" y="94" text-anchor="middle" font-size="10.5" fill="#3e5265">bật nhật ký truy vấn · ghi hành vi giao diện làm chuẩn</text>
  <rect x="356" y="40" width="300" height="60" rx="8" fill="#dbe7f1" stroke="#12365a"/>
  <text x="506" y="62" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#12365a">ASP.NET Core — .NET 10 (đang dựng)</text>
  <text x="506" y="80" text-anchor="middle" font-size="10.5" fill="#3e5265">khung · phân quyền · phân hệ đợt 1</text>
  <text x="506" y="94" text-anchor="middle" font-size="10.5" fill="#3e5265">lớp tương thích giao diện cũ · công cụ chuyển dữ liệu</text>
  <line x1="324" y1="70" x2="356" y2="70" stroke="#3e5265" stroke-dasharray="5,3" marker-end="url(#ar6)"/>
  <text x="340" y="115" text-anchor="middle" font-size="10" fill="#b45309">bản ghi hành vi chuẩn · phát lại để chứng minh tương đương</text>

  <rect x="24" y="132" width="632" height="58" rx="8" fill="#fdf3e3" stroke="#b45309"/>
  <text x="340" y="150" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#8a4a08">Ngày cắt chuyển — một lần, sau hai lần diễn tập</text>
  <text x="340" y="167" text-anchor="middle" font-size="10.5" fill="#6b3a06">đóng ghi → rút hết hàng đợi → chụp bản sao → chuyển dữ liệu một chiều → đối soát từng bảng</text>
  <text x="340" y="182" text-anchor="middle" font-size="10.5" fill="#6b3a06">→ phát lại bản ghi hành vi chuẩn → trỏ cổng giao diện sang máy chủ mới → mở lại</text>

  <text x="24" y="214" font-size="10.5" font-weight="bold" fill="#3e5265">Sau cắt chuyển</text>
  <rect x="24" y="224" width="300" height="60" rx="8" fill="#e9ecef" stroke="#52687a" stroke-dasharray="4,3"/>
  <text x="174" y="246" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#52687a">NestJS + bản sao dữ liệu cũ</text>
  <text x="174" y="264" text-anchor="middle" font-size="10.5" fill="#52687a">chỉ đọc, giữ 48 giờ để quay lại</text>
  <text x="174" y="278" text-anchor="middle" font-size="10.5" fill="#52687a">rồi ngừng hẳn, lưu trữ theo thời hạn</text>
  <rect x="356" y="224" width="300" height="60" rx="8" fill="#dbe7f1" stroke="#12365a"/>
  <text x="506" y="246" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#12365a">ASP.NET Core — .NET 10</text>
  <text x="506" y="264" text-anchor="middle" font-size="10.5" fill="#3e5265">phục vụ cả giao diện cũ (tương thích, có ngày dừng)</text>
  <text x="506" y="278" text-anchor="middle" font-size="10.5" fill="#3e5265">lẫn giao diện mới · một hệ duy nhất được ghi</text>
  <text x="340" y="310" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#3e5265">Quy tắc vàng: không có lúc nào hai máy chủ cùng nhận lệnh ghi; không đọc chung cơ sở dữ liệu</text>
</svg>
<figcaption>Hình 10. Thay máy chủ dịch vụ một lần: NestJS đóng băng trong khi ASP.NET Core được dựng và chứng minh tương đương bằng bản ghi hành vi chuẩn; một ngày cắt chuyển có đối soát; máy chủ cũ chỉ còn để quay lại trong cửa sổ ngắn rồi ngừng.</figcaption>
</figure>

Các nguyên tắc chuyển đổi: máy chủ cũ đóng băng từ tuần đầu, chỉ nhận sửa lỗi an toàn và bật nhật ký truy vấn tìm kiếm; máy chủ mới phục vụ cả giao diện cũ lẫn giao diện mới từ ngày cắt chuyển; không có lúc nào hai máy chủ cùng nhận lệnh ghi và không đọc chung cơ sở dữ liệu; dữ liệu chuyển một chiều bằng công cụ chạy lặp lại được, giữ mã định danh cũ và mã kiểm tra nguồn cho mọi bản ghi; mỗi bảng có báo cáo đối soát được người chịu trách nhiệm ký; diễn tập ít nhất hai lần trên bản sao dữ liệu thật; cửa sổ quay lại 48 giờ bằng khôi phục bản sao và bật lại máy chủ cũ, chấp nhận mất dữ liệu ghi trong cửa sổ và phải báo trước; hết cửa sổ thì chỉ sửa tiến, máy chủ cũ ngừng hẳn. Lớp tương thích giao diện cũ sống trong máy chủ mới, chỉ phủ các giao diện được giữ, không nhận giao diện mới và có ngày dừng mặc định sáu tháng sau cắt chuyển.

Ba điều kiện tiên quyết riêng của trường hợp NacenTwin, xuất phát từ hiện trạng tại mục 26.1.8. **Thứ nhất, toàn bộ mã nguồn phải được đưa vào kho có lịch sử thay đổi** trước mọi việc khác, để bản ghi hành vi chuẩn gắn được với một phiên bản mã xác định. **Thứ hai, phải ghi hành vi của toàn bộ giao diện đang chạy làm chuẩn trước khi cắt chuyển.** Hệ hiện tại gần như không có kiểm thử tự động; vì cắt một lần nên không thể "kiểm thử theo phần sắp chuyển" như cách cuốn chiếu, mà phải phủ hết. Cách rẻ là ghi lại yêu cầu và phản hồi của từng giao diện trên một bộ dữ liệu mẫu cố định rồi phát lại lên máy chủ mới, thay cho việc viết kiểm thử tay; đồng thời phân loại chín mươi lăm giao diện thành giữ nguyên, giữ có thay đổi chủ ý, hoặc bỏ, để chỉ phủ phần cần phủ. **Thứ ba, mật khẩu và phiên đăng nhập phải có lời giải trước:** mã mật khẩu bcrypt được nhập nguyên dạng vào nhà cung cấp định danh mới và đổi sang cơ chế chuẩn ở lần đăng nhập đầu, không đặt lại hàng loạt; mọi phiên cũ hết hiệu lực tại ngày cắt chuyển và người dùng được báo trước.

Về phạm vi kế thừa, cần phân biệt rõ ba loại tài sản theo mục 26.1.7. Phần đang chạy thật được giữ và chuyển dần. Phần chỉ có giao diện chạy dữ liệu giả được giữ lại **như tài sản thiết kế**, không phải như năng lực: mỗi màn hình chỉ được đưa ra khỏi trạng thái xem trước khi đã có giao diện nghiệp vụ thật phía sau. Phần chưa bắt đầu được xây mới theo kiến trúc đích, không tìm cách chắp vá lên mô hình dữ liệu hiện có.

### 26.7 Trình tự chuyển đổi

Trình tự dưới đây hợp nhất hai nguồn: thứ tự kiến trúc (đi từ nền móng lên nghiệp vụ, trong nghiệp vụ đi theo dòng chảy hồ sơ) và thứ tự ưu tiên rút ra từ đợt rà soát hiện trạng tại mục 26.1.

**Bước 0 — xử lý nợ an toàn.** Đóng trang quản trị khỏi truy cập công khai, đổi toàn bộ mật khẩu mặc định, và chốt thời điểm rời hạ tầng tạm. Ba việc này không phụ thuộc bất kỳ quyết định kiến trúc nào và phải xong trước khi mở rộng người dùng (tiêu chí nghiệm thu 58, 59).

**Bước 1 — kiểm kê và xác định quyền sở hữu dữ liệu.** Kiểm kê giao diện, bảng, tệp, hàng đợi và chỉ mục hiện có; phân loại dữ liệu theo mục 24.4; xác định hệ thống nào sở hữu đường ghi cho từng đối tượng. Không viết dòng mã chuyển đổi nào trước khi bảng kiểm kê này hoàn tất.

**Bước 2 — nền móng định danh và phân quyền.** Xây lớp định danh, mô hình phân quyền theo nhiệm vụ (mục 24.2) và nhật ký kiểm tra (mục 22.6). Đây đồng thời là lời giải cho nút thắt lớn nhất của hệ hiện tại: chưa phân biệt được các loại vai trò. Càng để lâu càng khó sửa vì dữ liệu người dùng tích lũy thêm mỗi ngày.

**Bước 3 — lõi hồ sơ và nhu cầu.** Xây hồ sơ thương mại hóa với vòng đời và cổng kiểm soát (mục 7), quy tắc tạo bản mới (mục 11.7), và khâu xác nhận nhu cầu (mục 12). Bước này thay thế mô hình tin đăng hai trạng thái của hệ hiện tại, và là chỗ khớp lại cỗ máy ghép nối đã có vào đúng vị trí công cụ hỗ trợ trong một chuỗi dài hơn.

**Bước 4 — nối tiếp đoạn sau khi ghép cặp.** Trao đổi có kiểm soát, phòng dữ liệu và quyền truy cập theo nhiệm vụ (mục 17.1). Đây là mắt xích đứt số một của hệ hiện tại: chừng nào chưa nối, toàn bộ phần lõi đã làm xong vẫn không tạo ra kết quả thật nào.

**Bước 5 — hồ sơ năng lực, chuyên gia và thẩm định.** Hồ sơ có minh chứng, mạng chuyên gia theo nhiệm vụ (mục 14) và quy trình thẩm định (mục 16.3). Bước này bắt đầu tích lũy lịch sử hợp tác — dữ liệu mà cỗ máy ghép nối hiện chưa có để học.

**Bước 6 — thỏa thuận, thực hiện và kết quả.** Thiết kế giao dịch, hợp đồng tham chiếu bản đóng băng (mục 17.4), mốc công việc, bằng chứng và xác minh kết quả (mục 18). Bước này mở đường cho mô hình doanh thu, vốn hiện chưa có cách nào triển khai.

**Bước 7 — tài chính, chương trình và báo cáo.** Nhu cầu vốn, bộ kết nối tài chính, sổ theo dõi tách biệt (mục 19.3) và báo cáo kết quả.

**Bước 8 — đối soát, diễn tập và cắt chuyển.** Công cụ chuyển dữ liệu chạy trên bản sao dữ liệu thật, báo cáo đối soát từng bảng sạch, hai lần diễn tập đủ trình tự, rồi cắt chuyển một lần theo mục 26.6; máy chủ cũ ngừng hẳn sau cửa sổ quay lại.

Các bước 2 và 3 phải xong trước ngày cắt chuyển, vì lớp tương thích giao diện cũ cần định danh, phân quyền và lõi hồ sơ để cài lên. Các bước 4 đến 7 là nghiệp vụ mới trên máy chủ mới, không phụ thuộc máy chủ cũ, và vẫn mở theo cổng bằng chứng của mục 27. Với các mảng đã có sẵn giao diện trong hệ hiện tại — hạ tầng, định giá, đào tạo — nguyên tắc là **nối phần xử lý cho một đến hai mảng cho tới khi có người dùng thật, thay vì mở cả sáu cùng lúc**. Thay máy chủ một lần không có nghĩa nối tất cả màn hình một lần; hoàn thành hẳn một dịch vụ có khách dùng thật giá trị hơn nhiều so với sáu dịch vụ dở dang, và phù hợp với kỷ luật phạm vi hẹp tại mục 27.

---

## 27. Lộ trình triển khai sáu tháng

### 27.1 Nguyên tắc nén phạm vi

Lộ trình được nén từ mười tám tháng xuống **sáu tháng**. Việc nén này không thực hiện bằng cách làm nhanh gấp ba lần — điều đó không khả thi với một đội mười đến mười ba người và sẽ dẫn thẳng đến kiểu thất bại đã mô tả tại mục 32.5.5. Nó thực hiện bằng ba đòn bẩy, theo đúng thứ tự ưu tiên:

**Đòn bẩy thứ nhất — cắt phạm vi.** Sáu tháng chỉ làm **một chuỗi hoàn chỉnh nhưng hẹp**: từ nhu cầu có ngân sách đến kết quả được xác minh, cho một ngành, một nhóm doanh nghiệp. Mọi năng lực không nằm trên chuỗi đó bị đẩy ra ngoài cửa sổ sáu tháng và ghi rõ tại mục 27.6. Đây là đòn bẩy chính; hai đòn bẩy còn lại không đủ nếu thiếu nó.

**Đòn bẩy thứ hai — chạy song song thay vì tuần tự.** Trong lộ trình mười tám tháng, vận hành thủ công là một giai đoạn riêng kéo dài hai tháng *trước khi* xây phần mềm lõi. Nay hai việc chạy cùng nhau từ tuần đầu. Điều này chấp nhận được vì phần xây trong hai tháng đầu là **nền móng ít hối tiếc** — định danh, phân quyền, nhật ký kiểm tra, lõi hồ sơ — những thứ cần đến bất kể vận hành thủ công phát hiện ra điều gì. Các quyết định về tính năng cụ thể vẫn phải chờ bằng chứng từ vận hành thủ công, đúng nguyên tắc tại mục 4.

**Đòn bẩy thứ ba — tận dụng phần đã kế thừa.** Đây là lý do sáu tháng khả thi với NacenTwin mà sẽ không khả thi nếu bắt đầu từ con số không. Vòng đời tài khoản, đăng tải hai chiều, phân loại, cỗ máy ghép nối, thông báo và đề xuất hợp tác đã chạy thật. Khoảng hai mươi lăm trang giao diện cho phòng đàm phán, hạ tầng, định giá và nhóm dịch vụ đã dựng xong, chỉ thiếu phần xử lý phía sau (mục 26.1.7). Cơ chế ba mức bảo mật nội dung đã có sẵn trong cơ sở dữ liệu làm nền cho phòng dữ liệu.

<figure class="fig">
<svg viewBox="0 0 680 336" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <!-- month axis -->
  <text x="24" y="26" font-size="10.5" font-weight="bold" fill="#3e5265">Tháng</text>
  <g font-size="10" fill="#52687a" text-anchor="middle">
    <text x="60" y="26">0</text><text x="160" y="26">1</text><text x="260" y="26">2</text>
    <text x="360" y="26">3</text><text x="460" y="26">4</text><text x="560" y="26">5</text><text x="660" y="26">6</text>
  </g>
  <line x1="60" y1="34" x2="660" y2="34" stroke="#c6d3de"/>
  <g stroke="#c6d3de">
    <line x1="60" y1="34" x2="60" y2="40"/><line x1="160" y1="34" x2="160" y2="40"/>
    <line x1="260" y1="34" x2="260" y2="40"/><line x1="360" y1="34" x2="360" y2="40"/>
    <line x1="460" y1="34" x2="460" y2="40"/><line x1="560" y1="34" x2="560" y2="40"/>
    <line x1="660" y1="34" x2="660" y2="40"/>
  </g>
  <!-- build track -->
  <text x="24" y="66" font-size="10.5" font-weight="bold" fill="#12365a">Xây</text>
  <text x="24" y="79" font-size="10.5" font-weight="bold" fill="#12365a">dựng</text>
  <rect x="60" y="50" width="50" height="44" rx="4" fill="#12365a"/>
  <text x="85" y="68" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Đợt 0</text>
  <text x="85" y="82" text-anchor="middle" font-size="8.5" fill="#cfe0ee">an toàn</text>
  <rect x="114" y="50" width="144" height="44" rx="4" fill="#dbe7f1" stroke="#12365a"/>
  <text x="186" y="66" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#12365a">Đợt 1 — nền móng</text>
  <text x="186" y="82" text-anchor="middle" font-size="9" fill="#3e5265">vai trò · lõi hồ sơ · kiểm tra</text>
  <rect x="262" y="50" width="196" height="44" rx="4" fill="#e8eef5" stroke="#12365a"/>
  <text x="360" y="66" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#12365a">Đợt 2 — nối mắt xích đứt</text>
  <text x="360" y="82" text-anchor="middle" font-size="9" fill="#3e5265">trao đổi · phòng dữ liệu · chuyên gia</text>
  <rect x="462" y="50" width="198" height="44" rx="4" fill="#dbe7f1" stroke="#12365a"/>
  <text x="561" y="66" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#12365a">Đợt 3 — giao dịch, kết quả</text>
  <text x="561" y="82" text-anchor="middle" font-size="9" fill="#3e5265">thỏa thuận · mốc · xác minh</text>
  <!-- concierge track -->
  <text x="24" y="122" font-size="10.5" font-weight="bold" fill="#8a4a08">Vận</text>
  <text x="24" y="135" font-size="10.5" font-weight="bold" fill="#8a4a08">hành</text>
  <rect x="60" y="108" width="600" height="40" rx="4" fill="#fdf3e3" stroke="#b45309"/>
  <text x="360" y="125" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#8a4a08">Vận hành thủ công liên tục — chạy song song từ tuần đầu, không chờ phần mềm</text>
  <text x="360" y="140" text-anchor="middle" font-size="9" fill="#6b3a06">một ngành · 3–5 doanh nghiệp · đo giờ và chi phí từng bước · bán dịch vụ thật</text>
  <!-- gates -->
  <g stroke="#b45309" stroke-width="1.8" stroke-dasharray="4,3">
    <line x1="111" y1="44" x2="111" y2="156"/>
    <line x1="259" y1="44" x2="259" y2="156"/>
    <line x1="459" y1="44" x2="459" y2="156"/>
    <line x1="660" y1="44" x2="660" y2="156"/>
  </g>
  <g font-size="8.5" fill="#8a4a08" text-anchor="middle">
    <text x="111" y="170">cổng A</text>
    <text x="259" y="170">cổng B</text>
    <text x="459" y="170">cổng C</text>
    <text x="660" y="170">cổng D</text>
  </g>
  <!-- gate detail -->
  <rect x="16" y="180" width="648" height="58" rx="6" fill="#f4f7fa" stroke="#c6d3de"/>
  <text x="30" y="198" font-size="9.5" fill="#3e5265"><tspan font-weight="bold">A</tspan> — hết tài khoản mặc định, hết giao diện mở không xác thực, mã vào kho có lịch sử, có bản ghi hành vi chuẩn, máy chủ cũ đóng băng</text>
  <text x="30" y="213" font-size="9.5" fill="#3e5265"><tspan font-weight="bold">B</tspan> — 10 nhu cầu đủ điều kiện, 3 có đường ngân sách, 1 người trả tiền thật; lõi hồ sơ chạy trên dữ liệu thật</text>
  <text x="30" y="228" font-size="9.5" fill="#3e5265"><tspan font-weight="bold">C</tspan> — hồ sơ đi hết đến thẩm định trên hệ thống; không còn màn hình dữ liệu giả lộ ra người dùng</text>
  <!-- outcome -->
  <rect x="16" y="248" width="648" height="76" rx="6" fill="#dbe7f1" stroke="#12365a"/>
  <text x="30" y="268" font-size="10.5" font-weight="bold" fill="#12365a">Cổng D — kết quả phải đạt ở tháng thứ sáu</text>
  <text x="30" y="286" font-size="10" fill="#12365a">Ít nhất một hồ sơ đi trọn vòng đời trên hệ thống: nhu cầu đã xác nhận → thẩm định → thỏa thuận trả tiền thật</text>
  <text x="30" y="301" font-size="10" fill="#12365a">→ thực hiện theo mốc → kết quả được người xác minh độc lập kết luận. Kèm số liệu chi phí phục vụ thật.</text>
  <text x="30" y="317" font-size="9.5" font-style="italic" fill="#3e5265">Không đạt cổng D thì không mở rộng phạm vi, bất kể đã tiêu bao nhiêu ngân sách.</text>
</svg>
<figcaption>Hình 11. Lộ trình sáu tháng với hai luồng chạy song song: xây dựng theo bốn đợt và vận hành thủ công liên tục. Bốn cổng bằng chứng giữ nguyên vai trò chặn, không phải mốc báo cáo.</figcaption>
</figure>

### 27.2 Đợt 0 — Chuẩn bị an toàn (2 tuần)

Nội dung: đưa toàn bộ mã nguồn vào kho có lịch sử thay đổi trước mọi việc khác; thay toàn bộ tài khoản và khóa mặc định; đóng điểm quản trị công khai; **đặt xác thực và giới hạn tần suất cho các giao diện đang mở — nhóm gọi mô hình ngôn ngữ, tìm kiếm ngữ nghĩa và dịch vụ nhúng vector (mục 26.1.8)**; bật giới hạn tần suất cho đăng nhập; bật nhật ký truy vấn tìm kiếm; **tuyên bố đóng băng máy chủ cũ** — từ đây không nhận thay đổi nào ngoài danh sách trên; kiểm kê hệ thống và dữ liệu; xác định quyền sở hữu từng phần; phân loại chín mươi lăm giao diện thành giữ, giữ có thay đổi, bỏ; ghi bản ghi hành vi chuẩn cho giao diện được giữ; chốt cấu trúc phân hệ; chốt dự thảo thỏa thuận vận hành NacenTech–NacenX.

**Cổng A:** không còn tài khoản mặc định; không còn giao diện nào gọi được mô hình hoặc truy vấn dữ liệu mà không qua xác thực; toàn bộ mã nằm trong kho có lịch sử thay đổi; bản ghi hành vi chuẩn của giao diện cũ đã có và gắn với phiên bản mã; bảng kiểm kê không còn bảng, tệp, hàng đợi hay chỉ mục chưa có người sở hữu; phục hồi bản sao thành công; quyền sở hữu tài khoản, mã nguồn, khóa, tên miền và sao lưu rõ.

Đây là đợt duy nhất **không được rút gọn dù chậm tiến độ**. Toàn bộ nội dung là điều kiện tiên quyết kỹ thuật, chi phí thấp nhưng rủi ro cao nếu bỏ qua. Một hệ thống lấy niềm tin làm sản phẩm không được phép mời người dùng vào khi trang quản trị còn mở.

### 27.3 Đợt 1 — Nền móng và vận hành song song (tháng 1–2)

**Luồng xây dựng.** Định danh, tổ chức, cá nhân và mô hình phân quyền theo nhiệm vụ; nhật ký kiểm tra ghi nối tiếp; lõi hồ sơ thương mại hóa gồm giai đoạn, quyết định, chính sách đóng băng và khóa lạc quan; nhu cầu và khâu xác nhận; phân công điều phối viên và hàng đợi công việc; quy tắc tạo bản mới. Đây là phần thay thế mô hình tin đăng hai trạng thái của hệ hiện tại, và là chỗ khớp lại cỗ máy ghép nối đã có vào đúng vị trí công cụ hỗ trợ. Song song: lớp tương thích cho giao diện cũ cài trên các phân hệ trên, công cụ chuyển dữ liệu có đối soát, hai lần diễn tập, và **cắt chuyển máy chủ vào cuối tháng thứ hai** theo mục 26.6. Trong hai tháng này máy chủ cũ vẫn phục vụ người dùng hiện có ở trạng thái đóng băng; đây là lý do cắt một lần khớp được với lộ trình mà không làm ai mất dịch vụ.

**Luồng vận hành thủ công.** Chạy ngay từ tuần đầu, không chờ phần mềm: chọn một ngành sản xuất; chọn 3–5 doanh nghiệp và ít nhất hai người trả tiền; chọn tối đa ba bài toán; chọn 3–5 đơn vị cung cấp công nghệ; xây mạng chuyên gia ban đầu; chọn một phòng thử nghiệm hoặc địa điểm thử; chạy toàn bộ quy trình bằng công cụ thủ công; đo thời gian và chi phí từng bước; thử báo giá ba sản phẩm ưu tiên; làm rõ quyền dữ liệu, phí và xung đột lợi ích.

**Cổng B:** ít nhất 10 nhu cầu đủ điều kiện; ít nhất 3 nhu cầu có đường ngân sách; ít nhất 5 chuyên gia được kiểm tra; **có ít nhất một người trả tiền thật cho một dịch vụ**; có số liệu chi phí phục vụ ban đầu; lõi hồ sơ chạy được trên dữ liệu thật của các case đang vận hành thủ công; có căn cứ pháp lý cho dữ liệu và dịch vụ mở đầu; **cắt chuyển máy chủ đã hoàn tất**: hai cổng người dùng chạy trên máy chủ mới, phát lại bản ghi hành vi chuẩn đạt, báo cáo đối soát mọi bảng đã ký, máy chủ cũ ở trạng thái chỉ đọc trong cửa sổ quay lại.

Cổng B là cổng quan trọng nhất của cả lộ trình. Nếu đến cuối tháng thứ hai chưa có ai trả tiền, vấn đề không nằm ở phần mềm và không được giải bằng cách xây thêm tính năng.

### 27.4 Đợt 2 — Nối mắt xích đứt (tháng 3–4)

Đợt này giải quyết điểm đứt tại mục 26.1.6 — chỗ khiến toàn bộ phần lõi đã làm xong không tạo ra kết quả thật nào.

Xây: trao đổi có kiểm soát và theo dõi tiến độ thương vụ, tận dụng giao diện phòng đàm phán đã dựng sẵn; phòng dữ liệu với quyền theo nhiệm vụ, mục đích và thời hạn, xây trên nền ba mức bảo mật nội dung đã có; cam kết bảo mật và nhật ký truy cập; hồ sơ năng lực có minh chứng ở mức cơ bản; mạng chuyên gia với nhiệm vụ có phạm vi, kiểm tra xung đột lợi ích và sản phẩm bàn giao; nhiệm vụ thẩm định và báo cáo có chữ ký; gói công nghệ với điều kiện sẵn sàng giao dịch.

**Cổng C:** ít nhất 3 hồ sơ đi được đến bước thẩm định hoàn toàn trên hệ thống; 3 nhiệm vụ chuyên gia và 2 sản phẩm được chấp nhận; tài liệu mật không mở được khi thiếu nhiệm vụ và mục đích; thu hồi quyền làm tài liệu trong hội thoại không còn đọc được; **không còn màn hình chạy dữ liệu giả nào lộ ra người dùng**.

### 27.5 Đợt 3 — Giao dịch và kết quả (tháng 5–6)

Xây: bản thiết kế giao dịch; thỏa thuận và hợp đồng tham chiếu đúng bản đã đóng băng; kế hoạch thực hiện và mốc công việc với tiêu chí chấp nhận; gói bằng chứng có mã kiểm tra; định nghĩa kết quả và xác minh kết quả với người xác minh độc lập; thỏa thuận phí, tham chiếu hóa đơn và tham chiếu thanh toán; hồ sơ cấu hình năng lực; và nối phần xử lý cho **một** mảng dịch vụ đã có giao diện.

Về tiền, trong sáu tháng nền tảng **ghi nhận** trạng thái thanh toán từ nguồn hợp lệ chứ không giữ tiền — nhất quán với ranh giới tại mục 2.3. Cơ chế ký quỹ đòi hỏi cổng pháp lý và một đối tác được cấp phép, nên nằm ngoài cửa sổ này (mục 27.6).

**Cổng D — kết quả phải đạt ở tháng thứ sáu:** ít nhất một hồ sơ đi trọn vòng đời trên hệ thống, từ nhu cầu đã xác nhận qua thẩm định, thỏa thuận trả tiền thật, thực hiện theo mốc, đến kết quả được người xác minh độc lập kết luận. Kèm theo: 10 hồ sơ đủ điều kiện trên hệ thống; ít nhất 3 thỏa thuận; số liệu chi phí phục vụ thật trên một hồ sơ có tính cả hồ sơ rơi; không có rò dữ liệu hoặc xung đột lợi ích nghiêm trọng chưa xử lý.

### 27.6 Ngoài phạm vi sáu tháng

Danh sách này là phần giá phải trả cho việc nén tiến độ. Ghi rõ ở đây để không ai hiểu nhầm rằng sáu tháng cho ra một nền tảng đầy đủ:

| Năng lực | Lý do đẩy ra ngoài | Điều kiện để mở lại |
|---|---|---|
| Ký quỹ và thanh toán qua nền tảng | Cần cổng pháp lý và đối tác được cấp phép | Có kết luận pháp chế và đối tác ký hợp đồng |
| Kết nối tổ chức tài chính | Phụ thuộc đối tác ngoài, không kiểm soát được tiến độ | Có đối tác và đầu mối xử lý hồ sơ |
| Chương trình hỗ trợ, phiếu ưu đãi | Cần quy chế và thẩm quyền của đơn vị bảo trợ | Có chương trình thật với ngân sách |
| Mạng địa phương nhiều nút | Chưa có bằng chứng một nút chạy hiệu quả | Đạt cổng D và có nhu cầu từ địa phương |
| Hành lang hợp tác quốc tế | Chưa đủ điều kiện mở theo mục 20.5 | Có ba nhu cầu cùng ngành và doanh nghiệp tiếp nhận |
| Bàn điều hành chuyên gia và trợ lý riêng | Không nằm trên chuỗi tối thiểu | Mạng chuyên gia đạt quy mô cần tự phục vụ |
| Vận hành sau chuyển giao 6–24 tháng | Chỉ khởi động được sau khi có chuyển giao hoàn tất | Có hồ sơ đầu tiên hoàn tất chuyển giao |
| Kết nối đầu tư (mục 19.7) | Cần cổng pháp lý về ngành nghề có điều kiện; không nằm trên chuỗi tối thiểu | Có kết luận pháp chế và ít nhất một hồ sơ đủ chín để gọi vốn |
| Đào tạo và nhân rộng (mục 18.6) | Mô hình tham chiếu chỉ hình thành từ hồ sơ đã có kết quả xác minh | Sau cổng D, khi có hồ sơ đầu tiên đạt kết quả |
| Môi trường thử nghiệm | Không nằm trên chuỗi tối thiểu | Xét lại sau cổng D |
| Liên thông dữ liệu quốc gia | Phụ thuộc mandate và thẩm quyền ngoài | Có nhiệm vụ liên cơ quan hợp lệ |
| Hồ sơ bằng chứng tái sử dụng | Cần có bằng chứng tích lũy trước đã | Sau khi có vài chục hồ sơ hoàn tất |

Hai năng lực mới bổ sung vào kiến trúc — kết nối đầu tư và đào tạo, nhân rộng — đều nằm ở mức kích hoạt **"mở rộng sau khi có bằng chứng"** theo mục 10.2, không phải mức lõi. Chúng có mặt trong kiến trúc đích để đề án không thiếu cấu phần, nhưng **không được đưa vào phạm vi sáu tháng**. Lý do không phải là ưu tiên mà là phụ thuộc: mô hình tham chiếu chỉ tồn tại sau khi có hồ sơ đạt kết quả xác minh, và hồ sơ sẵn sàng đầu tư chỉ có giá trị khi các nội dung trong đó đã được kiểm chứng qua quá trình xử lý hồ sơ. Bật sớm hai năng lực này chỉ tạo ra thêm màn hình chạy dữ liệu giả — đúng cái bẫy tại mục 26.1.7.

Một mất mát cần gọi tên riêng: trong lộ trình mười tám tháng có một **cổng khả thi tài chính** ở tháng thứ mười đến mười hai, nơi trả lời câu hỏi mô hình có bù được chi phí cố định hay không. Cửa sổ sáu tháng không đủ dài để trả lời câu hỏi đó. Sáu tháng chỉ đủ để **bắt đầu đo** chi phí phục vụ và phần đóng góp của một dòng dịch vụ. Kết luận về tính bền vững tài chính phải được lên lịch riêng sau cổng D, và không được trình bày như thể đã có lời đáp.

### 27.7 Điều kiện khả thi và rủi ro của việc nén

Sáu tháng là **khả thi có điều kiện**. Bốn điều kiện dưới đây phải đúng đồng thời; thiếu một điều là phải giãn tiến độ hoặc cắt tiếp phạm vi, không được bù bằng cách làm ẩu:

1. **Phạm vi được bảo vệ.** Danh sách tại mục 27.6 không được rút ngắn giữa chừng. Mỗi yêu cầu mới phát sinh phải đánh đổi bằng một hạng mục đang có trong phạm vi, không được cộng thêm.
2. **Đội hình đủ và ổn định.** Định biên tại mục 29.1 không có dự phòng cho sáu tháng nén: một người chủ chốt nghỉ dài là trượt tiến độ. Nếu muốn giữ cả tiến độ lẫn phạm vi, phải bổ sung năng lực ngay từ đầu chứ không phải khi đã chậm.
3. **Người trả tiền có mặt từ tháng đầu.** Luồng vận hành thủ công không phải hoạt động phụ trợ; nó là nguồn duy nhất cung cấp case thật cho phần mềm và bằng chứng cho cổng B.
4. **Quyết định pháp lý sẵn sàng khi cần.** Căn cứ về quyền dữ liệu, mức phí và xung đột lợi ích phải có trước đợt 2, không chờ đến khi cần dùng.

Ba rủi ro riêng của việc nén, kèm cách kiểm soát:

| Rủi ro | Vì sao nén làm tăng | Cách kiểm soát |
|---|---|---|
| Xây sai thứ không ai cần | Ít bằng chứng tích lũy trước khi xây hơn lộ trình dài | Đợt 1 chỉ xây phần ít hối tiếc; quyết định tính năng vẫn chờ bằng chứng từ vận hành thủ công |
| Nợ kỹ thuật và kiểm thử bị hy sinh | Áp lực tiến độ luôn dồn vào chỗ không ai nhìn thấy ngay | Bản ghi hành vi chuẩn là điều kiện của cổng A và phát lại đạt là điều kiện của cổng B; mỗi cổng đều kiểm lại, không dồn về cuối |
| Cắt chuyển máy chủ trượt hoặc hỏng | Cắt một lần dồn mọi rủi ro chuyển đổi vào một cửa sổ; đội không có dự phòng (mục 29.1) | Hai lần diễn tập trên dữ liệu thật, báo cáo đối soát ký trước, cửa sổ quay lại 48 giờ có diễn tập; trượt thì lùi ngày cắt, không mở hai máy chủ chạy song song |
| Báo cáo tiến độ lệch thực tế | Sáu tháng ít thời gian sửa sai, dễ có động cơ trình bày màn hình thay cho năng lực | Giữ nguyên quy tắc tại mục 26.1.7: mỗi màn hình hoặc nối API thật, hoặc dán nhãn bản xem trước |

Cuối cùng, nguyên tắc không đổi dù tiến độ nào: **sau mỗi đợt phải có một quyết định tiếp tục, thiết kế lại hoặc dừng** (tiêu chí nghiệm thu 72). Cổng bằng chứng bị nén về số lượng và thời gian, nhưng không bị hạ về bản chất — chúng vẫn là điều kiện chặn, không phải mốc báo cáo. Một lộ trình sáu tháng mà các cổng chỉ còn là hình thức thì tệ hơn lộ trình mười tám tháng, vì nó cho ra cảm giác đã xong sớm mà không có gì kiểm chứng được.

---

## 28. Chỉ số đánh giá

### 28.1 Chỉ số trung tâm

Toàn hệ thống hướng về một chỉ số duy nhất:

> Số hồ sơ thương mại hóa đạt kết quả được xác minh và tiếp tục được áp dụng sau 12 tháng.

Chỉ số này cố ý đặt điểm đo ở 12 tháng sau khi kết thúc — nơi phần lớn giá trị thật hoặc thất bại thật lộ ra. Vì chu kỳ dài, trong năm đầu có thể dùng chỉ số thay thế: số hồ sơ có thỏa thuận thật, thực hiện hoàn tất và kết quả được xác minh.

### 28.2 Chỉ số theo chuỗi

Để chẩn đoán được chỗ tắc trong phễu, mỗi khâu có chỉ số riêng:

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

Sức khỏe kinh doanh của đơn vị vận hành được theo dõi bằng: doanh thu trên hồ sơ hoàn tất; chi phí phục vụ trên hồ sơ hoàn tất có điều chỉnh hồ sơ rơi; phần đóng góp theo dòng dịch vụ; tỷ lệ khách hàng mua lại; tỷ lệ doanh thu định kỳ; mức tập trung vào một người trả tiền; mức phụ thuộc hỗ trợ vận hành; số ngày thu tiền; số tháng tiền mặt còn lại; tỷ lệ sử dụng thời gian của điều phối viên; và chi phí cùng lợi ích sau khi dùng trí tuệ nhân tạo.

Hai chỉ số cần tách bạch dù dễ lẫn: **mức tập trung doanh thu công** (bao nhiêu phần doanh thu đến từ hợp đồng với khu vực công — rủi ro tập trung khách hàng) khác với **mức phụ thuộc trợ cấp vận hành** (bao nhiêu phần chi phí được bù bằng hỗ trợ không gắn dịch vụ — rủi ro mô hình không tự đứng được). Một hợp đồng công có sản phẩm, giá và nghiệm thu là doanh thu thật, không phải trợ cấp.

### 28.4 Chỉ số liêm chính

Nhóm chỉ số này đo những điều tuyệt đối không được xảy ra: số trường hợp truy cập sai; số xung đột lợi ích không công khai; số kết luận sai thẩm quyền; số bằng chứng hết hạn bị dùng lại; số hành động trái phép của trí tuệ nhân tạo; số khoản hỗ trợ bị tính trùng; số hồ sơ tự xác minh; số thay đổi cấu hình không đủ phê duyệt; và số quyết định ngoài hệ thống bị trình bày sai. **Ngưỡng của các sự cố nghiêm trọng là bằng không** — đây là chỉ số theo dõi sự cố, không phải chỉ tiêu chấp nhận được một tỷ lệ nào đó.

### 28.5 Chống chỉ số hình thức

Danh sách các con số không được dùng làm kết quả chính, vì chúng dễ tăng mà không tạo giá trị: số tài khoản; lượt xem; số công nghệ đăng; số chuyên gia đăng ký; số biên bản ghi nhớ; số sự kiện; số địa phương kết nối; số hồ sơ được tạo; giá trị vốn đề xuất; và tổng giá trị hàng hóa hoặc tiền thu hộ. Các con số này vẫn được thu thập cho vận hành nội bộ, nhưng không xuất hiện như thành tích trong báo cáo kết quả.

---

## 29. Tổ chức vận hành

### 29.1 Nhóm sản phẩm và kỹ thuật NacenX

Đội hình khởi điểm được giữ nhỏ có chủ đích — khoảng 11 đến 13 người — đủ cho một khối nguyên khối và một ngành đầu tiên:

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

Định biên này được tính cho lộ trình dài. Với cửa sổ sáu tháng tại mục 27 **và** việc cắt chuyển máy chủ một lần vào cuối tháng thứ hai (mục 26.6), **đội hình trên không có dự phòng**: toàn bộ năng lực lập trình phía máy chủ đã được đặt vào chuỗi tối thiểu, và trong hai tháng đầu còn phải làm thêm lớp tương thích giao diện cũ, công cụ chuyển dữ liệu và hai lần diễn tập. Một người chủ chốt nghỉ dài hoặc một hạng mục phát sinh ngoài dự kiến đều đủ đẩy ngày cắt chuyển sang giữa đợt 2. Vì vậy việc bổ sung từ một đến hai lập trình viên phía máy chủ **ngay từ đợt 0** là điều kiện cứng để giữ mốc cắt chuyển, không còn là khuyến nghị; và không được bù bằng cách kéo dài máy chủ cũ thành hệ chạy song song — đó chính là điều cắt một lần nhằm tránh. Bổ sung người vào một dự án đang trễ thường làm nó trễ thêm.

Đội thiết kế trải nghiệm có thể giữ ở mức thấp hơn thông lệ trong sáu tháng đầu, vì phần lớn giao diện của chuỗi tối thiểu đã được dựng sẵn và chỉ cần nối phần xử lý (mục 26.1.7).

### 29.2 Nhóm nghiệp vụ NacenX

Nhân sự nghiệp vụ không tuyển trước theo sơ đồ tổ chức lý tưởng mà kích hoạt theo bằng chứng — cùng logic với cổng mở rộng dịch vụ tại mục 21.5:

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

Quy tắc cân bằng tải: nếu thiếu người, phải giảm ngành, số hồ sơ hoặc số năng lực — không thay người chịu trách nhiệm bằng trí tuệ nhân tạo.

### 29.3 Nhóm giám sát NacenTech

Phía NacenTech duy trì một nhóm giám sát gọn, tập trung vào thẩm quyền thay vì vận hành:

| Vai trò | Trách nhiệm |
|---|---|
| Chủ sở hữu nền tảng công | Nhiệm vụ, chính sách và giám sát đơn vị vận hành |
| Phụ trách chuẩn dữ liệu | Chuẩn, công bố chính thức và liên thông |
| Phụ trách chương trình và mua sắm | Thẩm quyền, điều kiện chương trình và đường mua sắm |
| Đầu mối liên cơ quan | Nhiệm vụ, nguồn dữ liệu, chất lượng và xử lý vướng mắc |
| Giám sát pháp lý, riêng tư và an toàn | Kiểm tra, sự cố và quan hệ cơ quan |
| Phụ trách kết quả và hiệu quả đơn vị vận hành | Chỉ số công, cam kết mức dịch vụ và kiến nghị gia hạn hoặc thay thế |

Ranh giới hoạt động: nhóm NacenTech không xử lý hỗ trợ hằng ngày, không triển khai phần mềm và không xuất hóa đơn dịch vụ — làm những việc đó là xóa nhòa chính ranh giới giám sát mà mô hình cần.

### 29.4 Nhịp vận hành

Kỷ luật vận hành theo năm nhịp: hằng ngày rà soát hàng đợi quá hạn và hồ sơ bị chặn; hằng tuần rà soát hồ sơ, chuyên gia và đối tác; hằng tháng rà soát kết quả, sự cố và tài chính; hằng quý rà soát dòng dịch vụ, trí tuệ nhân tạo, cấu hình và khả năng mở rộng; hằng năm rà soát chiến lược, đơn vị vận hành, an toàn và kế hoạch chuyển giao. Nhịp quý là nơi thực hiện phép so sánh với công cụ trí tuệ nhân tạo phổ biến (mục 21.6) và rà soát cổng mở rộng của từng dòng dịch vụ.

---

## 30. Rủi ro và biện pháp kiểm soát

Bảng dưới đây tổng hợp các rủi ro chính của mô hình và chỉ ra biện pháp kiến trúc tương ứng — mỗi biện pháp đều đã được mô tả trong các mục trước, ở đây quy về một mối để phục vụ rà soát định kỳ:

| Rủi ro | Biện pháp |
|---|---|
| Hệ thống ôm quá nhiều chức năng | Bốn mức kích hoạt, một ngành đầu tiên và cổng bằng chứng (mục 10.2, 27) |
| Xây phần mềm trước khi có người trả tiền | Vận hành thủ công song song và bán dịch vụ trước (mục 27.3) |
| Biến thành sàn đăng tin | Một hồ sơ, một điều phối viên và kết quả được xác minh (mục 1, 5) |
| Biến NacenX thành đơn vị tổng thầu mọi việc | Giới hạn vai trò và dùng đối tác thực hiện (mục 15.3) |
| Xung đột giữa tư vấn, cung cấp và xác minh | Tách vai trò, công khai lợi ích và người phê duyệt độc lập (mục 3.3, 15.5) |
| Dùng ảnh hưởng nhà nước để bán dịch vụ | Tách NacenTech–NacenX, công khai phí và cấm bán quyết định (mục 1.2, 21.1) |
| Phụ thuộc một nhà cung cấp phần mềm hoặc trí tuệ nhân tạo | Giao diện chuẩn, khả năng thay thế và gói chuyển giao (mục 23.6, 25.2) |
| Sao chép hệ thống theo tỉnh | Một lõi dùng chung, hồ sơ cấu hình và bộ kết nối (mục 10.6, 20.2) |
| Mở rộng theo biên bản ghi nhớ | Chỉ mở rộng sau hồ sơ, doanh thu và kết quả (mục 21.5, 27.6) |
| Dữ liệu không có nguồn | Bắt buộc nguồn, thời điểm, mã kiểm tra và quyền sử dụng (mục 22.2) |
| Rò dữ liệu | Quyền theo nhiệm vụ, tách không gian, mã hóa và kiểm thử (mục 17, 23.5, 24) |
| Trí tuệ nhân tạo hành động ngoài quyền | Cổng hành động, danh sách cấm và người duyệt (mục 23.3, 23.4) |
| Báo cáo hiệu quả giả | Đóng băng số liệu gốc, tách tự báo cáo và xác minh độc lập (mục 18.1, 18.3) |
| Tính doanh thu và chi phí sai | Tách sổ, tách thu hộ và chống tính chi phí hai lần (mục 19.3, 21.4) |
| Không thể thay đơn vị vận hành | Quyền truy cập mã nguồn, dữ liệu, khóa, bản dựng, sao lưu và diễn tập chuyển giao (mục 3.4, 25.2) |

---

## 31. Tiêu chí nghiệm thu kiến trúc

Bảy mươi hai tiêu chí dưới đây là hợp đồng giữa tài liệu kiến trúc và hệ thống được xây ra: hệ thống chỉ được coi là triển khai đúng kiến trúc khi đáp ứng toàn bộ. Mỗi tiêu chí được viết ở dạng kiểm chứng được — đội kiểm thử phải xây được kịch bản chứng minh đạt hoặc không đạt, và các tiêu chí quan trọng phải có kiểm thử tự động chạy trong quy trình phát hành.

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

## 32. Đối chiếu mô hình quốc tế: vì sao thành công, vì sao thất bại

### 32.1 Mục đích và chuẩn bằng chứng

Mục này trả lời câu hỏi nền tảng nhất của cả tài liệu: **căn cứ nào để tin rằng kiến trúc trên tạo ra kết quả?** Thương mại hóa công nghệ đã được nhiều quốc gia thử trong bốn thập kỷ, với đủ cả thành công bền vững lẫn thất bại tốn kém. Không có lý do gì để Việt Nam trả lại học phí cho những sai lầm đã được ghi chép đầy đủ.

Cần nói rõ giới hạn: đây là đối chiếu các cơ chế đại diện, không phải khảo sát toàn bộ chương trình đổi mới sáng tạo trên thế giới. Điều được học là **cơ chế tạo ra kết quả**, không phải tên tổ chức hay cơ cấu pháp lý. Sao chép tên gọi mà bỏ cơ chế là cách thất bại phổ biến nhất khi nhập khẩu mô hình.

Vấn đề lớn nhất khi đọc tài liệu về đổi mới sáng tạo là hầu hết bên vận hành đều tự tuyên bố mình thành công. Vì vậy tài liệu này áp dụng một chuẩn bằng chứng bắt buộc: **không coi một mô hình là thành công chỉ vì nó có ngân sách lớn, tồn tại lâu, có nhiều thành viên, ký nhiều biên bản ghi nhớ, hay được chính đơn vị vận hành gọi là thành công.**

<figure class="fig">
<svg viewBox="0 0 680 262" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <text x="24" y="22" font-size="11" font-weight="bold" fill="#12365a">Mức bằng chứng</text>
  <text x="150" y="22" font-size="11" font-weight="bold" fill="#12365a">Điều kiện tối thiểu</text>
  <text x="492" y="22" font-size="11" font-weight="bold" fill="#12365a">Được phép dùng để</text>
  <!-- E3 -->
  <rect x="16" y="32" width="120" height="48" rx="5" fill="#12365a"/>
  <text x="76" y="52" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#ffffff">E3</text>
  <text x="76" y="68" text-anchor="middle" font-size="10" fill="#cfe0ee">Đã kiểm chứng</text>
  <rect x="142" y="32" width="340" height="48" rx="5" fill="#f4f7fa" stroke="#3e5265"/>
  <text x="154" y="51" font-size="10.5" fill="#3e5265">Kết quả nhiều năm, có kiểm toán hoặc đánh giá độc lập;</text>
  <text x="154" y="67" font-size="10.5" fill="#3e5265">cơ chế và giới hạn quy thuộc được nêu rõ</text>
  <rect x="488" y="32" width="176" height="48" rx="5" fill="#dbe7f1" stroke="#12365a"/>
  <text x="576" y="61" text-anchor="middle" font-size="11" font-weight="bold" fill="#12365a">Áp dụng</text>
  <!-- E2 -->
  <rect x="16" y="86" width="120" height="48" rx="5" fill="#3e5265"/>
  <text x="76" y="106" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#ffffff">E2</text>
  <text x="76" y="122" text-anchor="middle" font-size="10" fill="#dbe7f1">Có đo lường</text>
  <rect x="142" y="86" width="340" height="48" rx="5" fill="#f4f7fa" stroke="#3e5265"/>
  <text x="154" y="105" font-size="10.5" fill="#3e5265">Bên vận hành công bố kết quả nhất quán, có khách hàng</text>
  <text x="154" y="121" font-size="10.5" fill="#3e5265">quay lại; nhưng quy thuộc nhân quả còn hạn chế</text>
  <rect x="488" y="86" width="176" height="48" rx="5" fill="#e8eef5" stroke="#12365a"/>
  <text x="576" y="107" text-anchor="middle" font-size="11" font-weight="bold" fill="#12365a">Thử nghiệm có</text>
  <text x="576" y="123" text-anchor="middle" font-size="11" font-weight="bold" fill="#12365a">đối chứng</text>
  <!-- E1 -->
  <rect x="16" y="140" width="120" height="48" rx="5" fill="#8a7a5a"/>
  <text x="76" y="160" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#ffffff">E1</text>
  <text x="76" y="176" text-anchor="middle" font-size="10" fill="#f4ede3">Mới là tuyên bố</text>
  <rect x="142" y="140" width="340" height="48" rx="5" fill="#f4f7fa" stroke="#3e5265"/>
  <text x="154" y="159" font-size="10.5" fill="#3e5265">Chủ yếu là số hoạt động, câu chuyện chọn lọc, định giá</text>
  <text x="154" y="175" font-size="10.5" fill="#3e5265">hoặc số liệu truyền thông tự công bố</text>
  <rect x="488" y="140" width="176" height="48" rx="5" fill="#f4ede3" stroke="#8a6d3b"/>
  <text x="576" y="169" text-anchor="middle" font-size="11" font-weight="bold" fill="#6b5423">Chỉ quan sát</text>
  <!-- E0 -->
  <rect x="16" y="194" width="120" height="48" rx="5" fill="#8a4a08"/>
  <text x="76" y="214" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#ffffff">E0</text>
  <text x="76" y="230" text-anchor="middle" font-size="10" fill="#fdf3e3">Bằng chứng ngược</text>
  <rect x="142" y="194" width="340" height="48" rx="5" fill="#f4f7fa" stroke="#3e5265"/>
  <text x="154" y="213" font-size="10.5" fill="#3e5265">Thất bại, thua lỗ lớn, chồng lấn thẩm quyền, phá sản</text>
  <text x="154" y="229" font-size="10.5" fill="#3e5265">hoặc kết quả trái mục tiêu ban đầu</text>
  <rect x="488" y="194" width="176" height="48" rx="5" fill="#fdf3e3" stroke="#b45309"/>
  <text x="576" y="215" text-anchor="middle" font-size="11" font-weight="bold" fill="#8a4a08">Chỉ rút bài học,</text>
  <text x="576" y="231" text-anchor="middle" font-size="11" font-weight="bold" fill="#8a4a08">thành điều cấm</text>
</svg>
<figcaption>Hình 12. Thang bằng chứng và quyền sử dụng tương ứng. Một mô hình chỉ được dùng làm căn cứ kiến trúc khi đạt mức E2 trở lên, và cơ chế tương tự xuất hiện ở ít nhất hai hệ thống độc lập.</figcaption>
</figure>

Bốn quy tắc đi kèm thang bằng chứng:

1. Mô hình nhà nước chỉ được coi là chuẩn thành công khi đạt tối thiểu E2 **và** cơ chế tương tự xuất hiện ở ít nhất hai hệ thống độc lập. Chưa đạt thì chỉ được thử nghiệm hẹp hoặc ghi nhận bài học.
2. Mô hình tư nhân phải chứng minh có người trả tiền thật, khách hàng quay lại, doanh thu hoặc kết quả đã hiện thực hóa. Định giá doanh nghiệp và số lượng dự án trong danh mục không phải bằng chứng.
3. Không suy ra thành công của cả tổ chức từ một chương trình con; ngược lại cũng không bác bỏ một cơ chế tốt chỉ vì tổ chức đó thất bại ở mảng khác.
4. Số liệu do bên vận hành tự công bố phải được ghi rõ là tự công bố. Toàn bộ danh mục đối chiếu được rà lại hằng năm và trước mọi quyết định mở rộng (mục 32.9).

### 32.2 Mẫu số chung: hai chuỗi trái ngược

Khi xếp cạnh nhau các hệ thống có kết quả kiểm chứng được và các hệ thống thất bại, khác biệt không nằm ở công nghệ phần mềm, giao diện hay chất lượng thuật toán so khớp. Khác biệt nằm ở **điểm xuất phát và ở chỗ có hay không có người chịu trách nhiệm đưa việc đi đến cùng**.

<figure class="fig">
<svg viewBox="0 0 680 430" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <defs>
    <marker id="arF" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#b45309"/>
    </marker>
    <marker id="arS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#12365a"/>
    </marker>
  </defs>
  <!-- Headers -->
  <rect x="16" y="12" width="310" height="34" rx="5" fill="#fdf3e3" stroke="#b45309"/>
  <text x="171" y="34" text-anchor="middle" font-size="12" font-weight="bold" fill="#8a4a08">Chuỗi thất bại — bắt đầu từ nguồn cung</text>
  <rect x="354" y="12" width="310" height="34" rx="5" fill="#dbe7f1" stroke="#12365a"/>
  <text x="509" y="34" text-anchor="middle" font-size="12" font-weight="bold" fill="#12365a">Chuỗi thành công — bắt đầu từ nhu cầu</text>
  <!-- Left chain -->
  <rect x="26" y="60" width="290" height="44" rx="5" fill="#ffffff" stroke="#b45309"/>
  <text x="171" y="79" text-anchor="middle" font-size="11" fill="#6b3a06">Đăng danh mục công nghệ lên cổng</text>
  <text x="171" y="95" text-anchor="middle" font-size="10" fill="#8a6d3b">supply-first</text>
  <rect x="26" y="126" width="290" height="44" rx="5" fill="#ffffff" stroke="#b45309"/>
  <text x="171" y="145" text-anchor="middle" font-size="11" fill="#6b3a06">Đo bằng lượt xem, tài khoản, tin đăng</text>
  <text x="171" y="161" text-anchor="middle" font-size="10" fill="#8a6d3b">chỉ số hình thức</text>
  <rect x="26" y="192" width="290" height="44" rx="5" fill="#ffffff" stroke="#b45309"/>
  <text x="171" y="211" text-anchor="middle" font-size="11" fill="#6b3a06">Hai bên tự liên hệ, tự đàm phán</text>
  <text x="171" y="227" text-anchor="middle" font-size="10" fill="#8a6d3b">không ai chịu trách nhiệm</text>
  <rect x="26" y="258" width="290" height="44" rx="5" fill="#ffffff" stroke="#b45309"/>
  <text x="171" y="277" text-anchor="middle" font-size="11" fill="#6b3a06">Tắc ở quyền, giá, thẩm định, vốn</text>
  <text x="171" y="293" text-anchor="middle" font-size="10" fill="#8a6d3b">không bên nào gỡ được</text>
  <rect x="26" y="324" width="290" height="44" rx="5" fill="#fdf3e3" stroke="#b45309" stroke-width="1.5"/>
  <text x="171" y="343" text-anchor="middle" font-size="11" font-weight="bold" fill="#8a4a08">Giao dịch không hình thành</text>
  <text x="171" y="359" text-anchor="middle" font-size="10" fill="#8a4a08">cổng vẫn sống, thị trường thì không</text>
  <g stroke="#b45309" stroke-width="1.2">
    <line x1="171" y1="104" x2="171" y2="126" marker-end="url(#arF)"/>
    <line x1="171" y1="170" x2="171" y2="192" marker-end="url(#arF)"/>
    <line x1="171" y1="236" x2="171" y2="258" marker-end="url(#arF)"/>
    <line x1="171" y1="302" x2="171" y2="324" marker-end="url(#arF)"/>
  </g>
  <!-- Right chain -->
  <rect x="364" y="60" width="290" height="44" rx="5" fill="#ffffff" stroke="#12365a"/>
  <text x="509" y="79" text-anchor="middle" font-size="11" fill="#12365a">Nhu cầu có chủ, có người quyết định</text>
  <text x="509" y="95" text-anchor="middle" font-size="10" fill="#52687a">và có đường ngân sách</text>
  <rect x="364" y="126" width="290" height="44" rx="5" fill="#ffffff" stroke="#12365a"/>
  <text x="509" y="145" text-anchor="middle" font-size="11" fill="#12365a">Trung gian chịu trách nhiệm theo case</text>
  <text x="509" y="161" text-anchor="middle" font-size="10" fill="#52687a">điều phối viên, cố vấn, môi giới</text>
  <rect x="364" y="192" width="290" height="44" rx="5" fill="#ffffff" stroke="#12365a"/>
  <text x="509" y="211" text-anchor="middle" font-size="11" fill="#12365a">Thẩm định độc lập và thử nghiệm trả phí</text>
  <text x="509" y="227" text-anchor="middle" font-size="10" fill="#52687a">tiêu chí chốt trước khi biết kết quả</text>
  <rect x="364" y="258" width="290" height="44" rx="5" fill="#ffffff" stroke="#12365a"/>
  <text x="509" y="277" text-anchor="middle" font-size="11" fill="#12365a">Hợp đồng, vốn theo mốc, hấp thụ tại chỗ</text>
  <text x="509" y="293" text-anchor="middle" font-size="10" fill="#52687a">quyền và trách nhiệm phân bổ rõ</text>
  <rect x="364" y="324" width="290" height="44" rx="5" fill="#dbe7f1" stroke="#12365a" stroke-width="1.5"/>
  <text x="509" y="343" text-anchor="middle" font-size="11" font-weight="bold" fill="#12365a">Kết quả được xác minh, còn dùng sau 12 tháng</text>
  <text x="509" y="359" text-anchor="middle" font-size="10" fill="#12365a">và mua tiếp lần sau</text>
  <g stroke="#12365a" stroke-width="1.2">
    <line x1="509" y1="104" x2="509" y2="126" marker-end="url(#arS)"/>
    <line x1="509" y1="170" x2="509" y2="192" marker-end="url(#arS)"/>
    <line x1="509" y1="236" x2="509" y2="258" marker-end="url(#arS)"/>
    <line x1="509" y1="302" x2="509" y2="324" marker-end="url(#arS)"/>
  </g>
  <rect x="16" y="386" width="648" height="34" rx="5" fill="#f4f7fa" stroke="#c6d3de"/>
  <text x="340" y="407" text-anchor="middle" font-size="10.5" fill="#3e5265">Khác biệt quyết định không nằm ở phần mềm, mà ở điểm xuất phát và ở chỗ có người chịu trách nhiệm đưa việc đến cùng.</text>
</svg>
<figcaption>Hình 13. Hai chuỗi trái ngược rút ra từ đối chiếu quốc tế. Kiến trúc trong tài liệu này được thiết kế để buộc mọi hồ sơ đi theo chuỗi bên phải.</figcaption>
</figure>

Diễn đạt lại mẫu số chung của các hệ thống có bằng chứng tốt:

> Nhu cầu đã xác nhận + trung gian chịu trách nhiệm + năng lực nghiên cứu ứng dụng hoặc thử nghiệm + vốn chia theo giai đoạn + quyền sở hữu trí tuệ và hợp đồng rõ + doanh nghiệp đủ sức hấp thụ + người trả tiền hoặc thẩm quyền tài trợ hợp pháp + động cơ minh bạch + bằng chứng và theo dõi đến cùng = kết quả thương mại hóa.

Không mô hình công hay tư nào chứng minh được rằng một sàn tự phục vụ có thể thay thế toàn bộ chuỗi này. Đó là căn cứ trực tiếp của kết luận tại mục 1 và của việc chọn hồ sơ thương mại hóa làm đơn vị nghiệp vụ trung tâm thay vì tin đăng.

### 32.3 Sáu cơ chế lặp lại được

Đáng tin hơn tên tổ chức là các cơ chế xuất hiện lặp lại ở nhiều hệ thống độc lập với nhau. Sáu cơ chế dưới đây có bằng chứng mạnh nhất, và mỗi cơ chế đều đã được đưa vào một mục cụ thể của tài liệu này:

<figure class="fig">
<svg viewBox="0 0 680 316" width="680" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
  <g>
    <rect x="16" y="16" width="208" height="132" rx="7" fill="#f4f7fa" stroke="#12365a"/>
    <rect x="16" y="16" width="208" height="26" rx="7" fill="#12365a"/>
    <text x="120" y="34" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">1. Khách hàng neo</text>
    <text x="28" y="60" font-size="10.5" fill="#3e5265">Cơ quan hoặc doanh nghiệp lớn</text>
    <text x="28" y="75" font-size="10.5" fill="#3e5265">cam kết mua nếu đạt tiêu chí,</text>
    <text x="28" y="90" font-size="10.5" fill="#3e5265">trả theo mốc đã nghiệm thu</text>
    <text x="28" y="114" font-size="10" fill="#52687a">NASA COTS · Gavi AMC ·</text>
    <text x="28" y="128" font-size="10" fill="#52687a">BMW Startup Garage</text>
    <text x="28" y="142" font-size="10" font-style="italic" fill="#8a6d3b">→ mục 19.2, 21.2</text>
  </g>
  <g>
    <rect x="236" y="16" width="208" height="132" rx="7" fill="#f4f7fa" stroke="#12365a"/>
    <rect x="236" y="16" width="208" height="26" rx="7" fill="#12365a"/>
    <text x="340" y="34" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">2. Cố vấn vào tận nơi</text>
    <text x="248" y="60" font-size="10.5" fill="#3e5265">Người có nghề đến tận doanh</text>
    <text x="248" y="75" font-size="10.5" fill="#3e5265">nghiệp chẩn đoán và theo việc,</text>
    <text x="248" y="90" font-size="10.5" fill="#3e5265">không chờ doanh nghiệp tự tìm</text>
    <text x="248" y="114" font-size="10" fill="#52687a">NIST MEP · NRC IRAP ·</text>
    <text x="248" y="128" font-size="10" fill="#52687a">Thailand ITAP · UK KTP</text>
    <text x="248" y="142" font-size="10" font-style="italic" fill="#8a6d3b">→ mục 4, 14, 15.3</text>
  </g>
  <g>
    <rect x="456" y="16" width="208" height="132" rx="7" fill="#f4f7fa" stroke="#12365a"/>
    <rect x="456" y="16" width="208" height="26" rx="7" fill="#12365a"/>
    <text x="560" y="34" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">3. Vốn chia giai đoạn</text>
    <text x="468" y="60" font-size="10.5" fill="#3e5265">Mỗi khoản vốn có giả thuyết,</text>
    <text x="468" y="75" font-size="10.5" fill="#3e5265">mốc và quyết định dừng;</text>
    <text x="468" y="90" font-size="10.5" fill="#3e5265">không cấp một gói cho cả đời</text>
    <text x="468" y="114" font-size="10" fill="#52687a">US SBIR/STTR · Israel IIA ·</text>
    <text x="468" y="128" font-size="10" fill="#52687a">Japan NEDO, JST</text>
    <text x="468" y="142" font-size="10" font-style="italic" fill="#8a6d3b">→ mục 19.1, 19.2</text>
  </g>
  <g>
    <rect x="16" y="160" width="208" height="132" rx="7" fill="#f4f7fa" stroke="#12365a"/>
    <rect x="16" y="160" width="208" height="26" rx="7" fill="#3e5265"/>
    <text x="120" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">4. Viện thu hỗn hợp</text>
    <text x="28" y="204" font-size="10.5" fill="#3e5265">Ngân sách giữ năng lực nền,</text>
    <text x="28" y="219" font-size="10.5" fill="#3e5265">doanh thu hợp đồng buộc phải</text>
    <text x="28" y="234" font-size="10.5" fill="#3e5265">bám nhu cầu thị trường thật</text>
    <text x="28" y="258" font-size="10" fill="#52687a">Fraunhofer · Đài Loan ITRI ·</text>
    <text x="28" y="272" font-size="10" fill="#52687a">Đan Mạch GTS · Pháp Carnot</text>
    <text x="28" y="286" font-size="10" font-style="italic" fill="#8a6d3b">→ mục 20.1, 21.1</text>
  </g>
  <g>
    <rect x="236" y="160" width="208" height="132" rx="7" fill="#f4f7fa" stroke="#12365a"/>
    <rect x="236" y="160" width="208" height="26" rx="7" fill="#3e5265"/>
    <text x="340" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">5. Quyền IP rõ từ đầu</text>
    <text x="248" y="204" font-size="10.5" fill="#3e5265">Ai sở hữu, ai được thương lượng,</text>
    <text x="248" y="219" font-size="10.5" fill="#3e5265">chia lợi ích thế nào — quyết</text>
    <text x="248" y="234" font-size="10.5" fill="#3e5265">trong chính sách, không tùy vụ</text>
    <text x="248" y="258" font-size="10" fill="#52687a">US Bayh-Dole · TTO Israel ·</text>
    <text x="248" y="272" font-size="10" fill="#52687a">Nhật Bản, luật TLO</text>
    <text x="248" y="286" font-size="10" font-style="italic" fill="#8a6d3b">→ mục 13.4, 17.3</text>
  </g>
  <g>
    <rect x="456" y="160" width="208" height="132" rx="7" fill="#f4f7fa" stroke="#12365a"/>
    <rect x="456" y="160" width="208" height="26" rx="7" fill="#3e5265"/>
    <text x="560" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">6. Thẩm định nối vốn</text>
    <text x="468" y="204" font-size="10.5" fill="#3e5265">Kết quả đánh giá công nghệ là</text>
    <text x="468" y="219" font-size="10.5" fill="#3e5265">đầu vào cho quyết định tài chính,</text>
    <text x="468" y="234" font-size="10.5" fill="#3e5265">nhưng không thay quyết định đó</text>
    <text x="468" y="258" font-size="10" fill="#52687a">Hàn Quốc KOTEC ·</text>
    <text x="468" y="272" font-size="10" fill="#52687a">Ấn Độ TDB, BIRAC</text>
    <text x="468" y="286" font-size="10" font-style="italic" fill="#8a6d3b">→ mục 16.4, 19.1</text>
  </g>
</svg>
<figcaption>Hình 14. Sáu cơ chế có bằng chứng lặp lại ở nhiều hệ thống độc lập, và mục tương ứng trong tài liệu này.</figcaption>
</figure>

### 32.4 Các mô hình thành công và lý do thành công

#### 32.4.1 Viện nghiên cứu ứng dụng có nguồn thu hỗn hợp

**Fraunhofer (Đức)** và **ITRI (Đài Loan)** là hai tham chiếu mạnh nhất cho năng lực kỹ thuật đủ sâu để chuyển giao thật. Fraunhofer kết hợp một phần ngân sách nền cho nghiên cứu tiền cạnh tranh với phần lớn doanh thu đến từ hợp đồng công nghiệp và dự án cạnh tranh. ITRI đi xa hơn: nghiên cứu ứng dụng, dây chuyền thử nghiệm, kiểm định độ tin cậy, sản xuất thử, chuyển giao công nghệ và ươm tạo nằm trong cùng một chuỗi — và đã tách ra được những doanh nghiệp bán dẫn hàng đầu thế giới. **GTS (Đan Mạch)** và **Carnot (Pháp)** là biến thể nhẹ hơn: nhà nước ký hợp đồng mua năng lực dùng chung, phần thưởng biến đổi gắn với doanh thu dịch vụ tư nhân đã được đối soát.

**Vì sao thành công:** cơ cấu nguồn thu hỗn hợp tạo ra một kỷ luật kép mà thuần công hoặc thuần tư đều không có. Nếu chỉ sống bằng ngân sách, viện sẽ nghiên cứu thứ không ai mua. Nếu chỉ sống bằng hợp đồng, viện sẽ mất năng lực dài hạn và biến thành công ty dịch vụ. Buộc phải kiếm phần lớn doanh thu từ doanh nghiệp nghĩa là mỗi năm viện phải chứng minh lại rằng năng lực của mình đáng tiền — nhưng ngân sách nền cho phép giữ thiết bị hiếm và đội ngũ qua những chu kỳ mà thị trường chưa trả tiền.

Bài học thứ hai từ ITRI: **chuyển giao thành công cần kỹ sư và dây chuyền, không chỉ cần văn phòng chuyển giao**. Một hợp đồng ký xong mà không có người làm được quy trình ở nhà máy thì không phải chuyển giao. Đây là căn cứ của yêu cầu "bằng chứng bên nhận có thể vận hành" tại mục 18.4, và của việc tài liệu này không đặt mục tiêu tự xây viện — mà kết nối và đặt hàng các đơn vị đã có năng lực (mục 20.1).

#### 32.4.2 Cố vấn đi vào tận doanh nghiệp

**NIST MEP (Mỹ)**, **NRC IRAP (Canada)** và **ITAP (Thái Lan)** cùng dùng một cơ chế: một chuyên gia công nghiệp đến tận doanh nghiệp, chẩn đoán bài toán, tìm chuyên gia hoặc công nghệ phù hợp, quản lý dự án và theo đến khi áp dụng. **KTP (Anh)** là biến thể mạnh nhất — một người được cắm làm việc toàn thời gian tại doanh nghiệp trong 1–3 năm để chuyển tri thức của viện, trường thành quy trình và năng lực, dưới sự giám sát chung của doanh nghiệp và người hướng dẫn học thuật. KTP đã trải qua đánh giá độc lập nhiều năm.

**Vì sao thành công:** doanh nghiệp vừa và nhỏ thường không diễn đạt được vấn đề của mình bằng ngôn ngữ công nghệ, và cũng không có ai đủ thời gian để đi hết quãng đường từ vấn đề đến giải pháp. Vốn không thay được quan hệ tin cậy và khảo sát tại chỗ. Một cố vấn ngồi trong nhà máy phát hiện ra vấn đề thật — thường khác vấn đề doanh nghiệp tự khai — và biết giải pháp nào khả thi với năng lực thực tế của họ.

Đây là căn cứ trực tiếp của nguyên tắc "mỗi hồ sơ có một điều phối viên chính" (mục 4), của mô hình mạng chuyên gia phục vụ theo nhiệm vụ (mục 14), và của việc gói bán ưu tiên là văn phòng chuyển đổi số thuê ngoài chứ không phải quyền truy cập hệ thống (mục 15.6).

#### 32.4.3 Vốn chia theo giai đoạn, mỗi giai đoạn một cổng

**SBIR/STTR (Mỹ)** dành một tỷ lệ ngân sách nghiên cứu liên bang cho doanh nghiệp nhỏ, chia thành các giai đoạn: nghiên cứu khả thi, phát triển, rồi thương mại hóa bằng nguồn khác. **Israel Innovation Authority** dùng tài trợ có điều kiện, không lấy cổ phần, thu hồi theo thành công thương mại. **NEDO và JST (Nhật Bản)** quản lý dự án xuyên suốt từ nghiên cứu đến trình diễn và triển khai xã hội, có cổng chuyển giai đoạn.

**Vì sao thành công:** thương mại hóa công nghệ có tỷ lệ thất bại cao và điều đó là bình thường. Vấn đề không phải là tránh thất bại mà là **thất bại sớm với chi phí nhỏ**. Chia vốn theo giai đoạn biến mỗi khoản chi thành một phép thử có giả thuyết, có mốc và có quyền dừng. Cấp một gói lớn cho toàn vòng đời thì đến khi biết là sai, tiền đã tiêu hết và không ai muốn thừa nhận.

Cơ chế này là nguồn gốc của toàn bộ thiết kế cổng kiểm soát tại mục 7, của các cổng bằng chứng trong lộ trình (mục 27) và của cổng mở rộng dịch vụ tại mục 21.5.

#### 32.4.4 Quyền sở hữu trí tuệ được định đoạt trong chính sách

**Đạo luật Bayh-Dole (Mỹ, 1980)** cho phép tổ chức nhận tài trợ liên bang giữ quyền đối với sáng chế hình thành từ nghiên cứu đó, kèm nghĩa vụ khai thác và bảo lưu quyền lợi công. Kết quả là các trường đại học có động lực lập văn phòng chuyển giao và cấp phép. **Nhật Bản** ban hành luật về tổ chức chuyển giao công nghệ cuối thập niên 1990 theo hướng tương tự. Các văn phòng chuyển giao của đại học Israel cho thấy mô hình chỉ hiệu quả khi tổ chức trao mandate độc quyền rõ ràng và có đội ngũ cấp phép chuyên nghiệp.

**Vì sao thành công:** khi không ai biết chắc mình sở hữu cái gì và được hưởng gì, không ai bỏ công thương mại hóa. Quyền mơ hồ làm tê liệt cả bên bán lẫn bên mua — bên mua sợ tranh chấp về sau, bên bán không dám đầu tư vào đóng gói. Điểm cốt lõi không phải là "trao quyền cho ai" mà là **quyết định trong chính sách, một lần, thay vì đàm phán lại ở từng vụ**.

Đây là căn cứ của yêu cầu làm rõ toàn bộ khung quyền trước khi thiết kế giao dịch (mục 17.3), của điều kiện riêng cho kết quả nghiên cứu dùng ngân sách nhà nước (mục 13.4), và của nguyên tắc nền tảng không nhận quyền thay chủ sở hữu (mục 2.3).

#### 32.4.5 Thẩm định nối với tài chính

**KOTEC (Hàn Quốc)** đánh giá năng lực công nghệ, thị trường và khả thi kinh doanh để làm đầu vào cho bảo lãnh, cho vay và đầu tư; nền tảng Smart Tech-Bridge của họ vận hành theo hướng đi từ nhu cầu, có mạng môi giới và dịch vụ giao dịch đi kèm. Theo công bố của phía Hàn Quốc, nền tảng này ghi nhận 1.627 giao dịch công nghệ trong năm 2023, doanh nghiệp nhỏ và vừa chiếm trên 99%. **KIAT** vận hành hạ tầng dữ liệu công nghệ quốc gia riêng, tách khỏi khâu giao dịch.

**Vì sao thành công:** đây là lời giải cho một thất bại thị trường cụ thể — doanh nghiệp tìm được công nghệ phù hợp nhưng không vay được vốn để mua và triển khai, vì ngân hàng không định giá được tài sản vô hình. Ghép năng lực thẩm định công nghệ với năng lực tài chính khiến kết quả đánh giá có chỗ dùng thật thay vì nằm trong ngăn kéo. Quan trọng không kém: kết luận vẫn thuộc về người đánh giá và tổ chức tài chính, không phải một điểm số tự động.

Bài học thứ hai từ Hàn Quốc là **phân vai rành mạch**: hạ tầng dữ liệu, giao dịch và tài chính, chuẩn bị nguồn cung, đánh giá, môi giới đều có chủ thể riêng. Đây là mô hình cho bảng phân vai tại mục 3.2 và bảng nguồn dữ liệu có thẩm quyền tại mục 22.1.

#### 32.4.6 Khách hàng neo và đồng đầu tư theo mốc

**NASA COTS (Mỹ)** thay vì đặt hàng theo cơ chế hoàn chi phí, đã ký thỏa thuận trả một khoản cố định sau mỗi mốc được nghiệm thu độc lập, với điều kiện doanh nghiệp tự bỏ phần vốn đáng kể. **Gavi AMC** là biến thể về phía cầu: nhà tài trợ không trả tiền phát triển mà cam kết mua trong tương lai nếu sản phẩm đạt tiêu chuẩn, giá và năng lực cung ứng. **BMW Startup Garage** áp dụng logic tương tự trong khu vực tư: đơn vị kinh doanh có bài toán thật cấp mã nhà cung cấp và đơn đặt hàng để chạy thử nghiệm trả phí, mục tiêu là trở thành nhà cung cấp lâu dài chứ không phải đổi lấy cổ phần.

**Vì sao thành công:** rào cản lớn nhất của công nghệ mới không phải là thiếu ý tưởng mà là **thiếu người mua đầu tiên**. Một cam kết mua có điều kiện làm giảm rủi ro thị trường đủ để tư nhân dám bỏ vốn phát triển, trong khi bên công chỉ trả cho kết quả thực sự đạt. Trả theo mốc đã nghiệm thu độc lập cũng loại bỏ động cơ tiêu hết ngân sách.

Điều kiện áp dụng rất chặt: phải có thẩm quyền mua thật, tiêu chí nghiệm thu chuẩn hóa được, và có cạnh tranh. Không dùng cho bài toán còn mơ hồ hoặc khi chỉ có một nhà cung cấp được chỉ định không căn cứ.

#### 32.4.7 Đóng gói công nghệ thành sản phẩm dùng được

**Arm** cho thấy cấp phép sở hữu trí tuệ có thể là mô hình kinh doanh lặp lại: phí cấp phép và bảo trì, kèm tài liệu, công cụ hỗ trợ thiết kế, rồi phí bản quyền theo sản phẩm bán ra. Báo cáo tài chính công khai cho thấy doanh thu cấp phép và bản quyền thật, không chỉ định giá hay số lượng bằng sáng chế. **TSMC Open Innovation Platform** kết nối công nghệ chế tạo, bộ công cụ thiết kế, đối tác EDA, thư viện IP và đóng gói dưới một giao diện và chuẩn kiểm định chung.

**Vì sao thành công:** lợi thế không nằm ở việc sở hữu nhiều bằng sáng chế mà ở khả năng đưa khách hàng đến kết quả dùng được ngay lần đầu. Một bằng sáng chế là một tờ giấy; một gói công nghệ có thiết kế tham chiếu, ma trận tương thích, bộ kiểm định, giới hạn đã biết, tài liệu, đào tạo và lộ trình phiên bản là một sản phẩm.

Đây là căn cứ của bộ khung chuẩn hóa tài sản công nghệ tại mục 13.1 và của điều kiện "sẵn sàng giao dịch" tại mục 11.3 — danh sách bằng sáng chế không kèm gói triển khai không được coi là sẵn sàng.

#### 32.4.8 Tìm kiếm có người điều phối, không phải sàn tự phục vụ

**P&G Connect + Develop** dùng đội tìm kiếm chủ động đi tìm nhà sáng chế, chủ bằng sáng chế và nhà cung cấp quanh nhu cầu kinh doanh cụ thể; cổng thông tin chỉ là một kênh tiếp nhận. **yet2** đã chuyển từ mô hình sàn đăng tin sang dịch vụ có quy trình xác định nhu cầu, tìm và lọc, rồi kết nối và theo đến khi có mẫu thử hoặc thỏa thuận. **InnoCentive** dùng chuyên viên đóng gói bài toán, quy tắc và tiêu chí đánh giá trước khi mở cuộc thi.

**Vì sao thành công:** công nghệ phù hợp thường không nằm trong danh mục có sẵn, và bài toán mà khách hàng tự mô tả thường chưa phải bài toán thật. Người điều phối có quyền phản biện lại đề bài, tìm ra ngoài danh mục, tiếp cận ẩn danh, sàng lọc và chuẩn bị cho cả hai phía. Đây chính xác là lý do mục 16.1 quy định tìm kiếm ba bước với con người rà soát trước khi gửi lời mời, và mục 12 đặt nặng khâu xác nhận nhu cầu.

### 32.5 Các mô hình thất bại và lý do thất bại

#### 32.5.1 Sàn danh mục thuần túy

Đây là dạng thất bại phổ biến nhất và cũng là dạng nguy hiểm nhất, vì nó **không sụp đổ ồn ào** — cổng vẫn chạy, vẫn có tin đăng, vẫn có báo cáo, chỉ là không có giao dịch. Nhiều cổng thông tin công nghệ quốc gia và sàn giao dịch bằng sáng chế đã đi theo con đường này.

Trường hợp rõ nhất là **IPXI (Intellectual Property Exchange International)**, sàn giao dịch quyền sở hữu trí tuệ đặt tại Chicago, thiết kế để chuẩn hóa quyền sử dụng bằng sáng chế thành đơn vị giao dịch được như hàng hóa. Sàn ngừng hoạt động năm 2015. Nguyên nhân không phải công nghệ: chủ sở hữu công nghệ tốt không muốn đưa tài sản giá trị lên sàn với giá chuẩn hóa, còn bên mua không có động cơ trả tiền cho thứ họ có thể thương lượng riêng hoặc chờ bị kiện. Thiếu cả hai phía, thanh khoản không bao giờ hình thành.

**Vì sao thất bại:** sàn giả định rằng vấn đề của thị trường công nghệ là *thiếu thông tin về nhau*. Vấn đề thật là **thiếu người chịu trách nhiệm gỡ các nút thắt** — quyền chưa rõ, giá không có tham chiếu, kỹ thuật chưa được kiểm chứng, doanh nghiệp không đủ năng lực tiếp nhận, và không ai có vốn để đi hết chặng. Công khai thông tin không gỡ được nút nào trong số đó. Ngược lại, công nghệ có giá trị thường không được công khai vì lý do cạnh tranh, nên sàn có xu hướng chỉ còn lại tài sản mà không ai muốn.

Bài học được đưa vào tài liệu này ở mức bất biến: hệ thống không phải sàn tự phục vụ (mục 1.1), mỗi hồ sơ phải có điều phối viên chịu trách nhiệm (mục 5.2), và số tin đăng bị cấm dùng làm chỉ số kết quả (mục 28.5).

#### 32.5.2 Nền tảng ôm rủi ro ngoài năng lực

**Quirky** khởi đầu là nền tảng cộng đồng đề xuất ý tưởng sản phẩm, nhưng sau đó tự đứng ra chọn, sản xuất, giữ tồn kho và phân phối hàng loạt. Công ty nộp đơn phá sản theo Chương 11 năm 2015 sau khi không quản lý nổi chi phí triển khai.

**Vì sao thất bại:** hai lỗi chồng lên nhau. Thứ nhất, **nhầm bình chọn của cộng đồng với nhu cầu thật** — số người bấm thích một ý tưởng không phải số người sẽ trả tiền. Thứ hai, một nền tảng điều phối chuyển sang gánh rủi ro sản xuất và tồn kho là chuyển sang một ngành khác hẳn, với cấu trúc vốn và năng lực hoàn toàn khác.

Đây là căn cứ của ranh giới tại mục 2.3: hệ thống không giữ tiền của khách hàng, không tự sở hữu công nghệ, không bảo đảm thương mại hóa thành công; và của mục 15.3: đơn vị vận hành là trung gian bảo đảm chất lượng quyết định, không mặc định là tổng thầu công nghệ.

#### 32.5.3 Thiết chế chồng lấn thẩm quyền

Hệ thống các định chế phát triển của **Nga** — bao gồm sáng kiến công nghệ quốc gia và cụm đổi mới sáng tạo Skolkovo — được ghi nhận trong chính nguồn của Chính phủ Nga là đã từng chồng lấn chức năng và phải tái cơ cấu. Vì thiếu bằng chứng kết quả độc lập và ổn định, nhóm này không được dùng làm chuẩn thành công trong tài liệu.

**Vì sao thất bại:** khi nhiều tổ chức cùng có mandate gần giống nhau, hệ quả không phải là cạnh tranh lành mạnh mà là phân tán nguồn lực, đùn đẩy trách nhiệm và cạnh tranh xin ngân sách. Doanh nghiệp đối mặt với nhiều cửa, mỗi cửa một biểu mẫu, không cửa nào chịu trách nhiệm đến cùng.

Bài học trực tiếp cho Việt Nam: **không sinh thêm pháp nhân, quỹ hoặc trung tâm mới khi mandate trùng với thiết chế đã có**. Dùng quy chế phối hợp và bộ kết nối trước. Đây là căn cứ của nguyên tắc hệ thống chỉ điều phối quy trình và bằng chứng, còn cơ quan, quỹ, phòng thử nghiệm giữ nguyên thẩm quyền của mình (mục 19.4), và của yêu cầu định nghĩa từng nhiệm vụ liên cơ quan có phạm vi rõ (mục 19.5).

#### 32.5.4 Mạng lưới rộng nhưng không tự nuôi được

Các cộng đồng tri thức và đổi mới sáng tạo thuộc **EIT (Liên minh châu Âu)** tạo được mạng lưới rộng và một số kết quả ban đầu, nhưng đánh giá cho thấy mức độ tự chủ tài chính không đồng đều giữa các cộng đồng, kèm rủi ro về quản trị. Tương tự, **Enterprise Europe Network** vận hành nhiều năm với chỉ số khách hàng và tác động, nhưng bị phê bình vì phần lớn số liệu do chính mạng lưới công bố và vì số hồ sơ, số thỏa thuận hợp tác không đồng nghĩa với chuyển giao thật.

**Vì sao có vấn đề:** mở rộng mạng lưới là việc dễ đo và dễ báo cáo — thêm thành viên, thêm sự kiện, thêm biên bản ghi nhớ. Nhưng quy mô mạng không tự tạo ra kết quả, và mỗi nút thêm vào đều làm tăng chi phí điều phối. Nếu từng dịch vụ không có kinh tế đơn vị dương, mạng càng lớn thì lỗ càng nhiều.

Đây là căn cứ của quy tắc "không mở rộng bằng số biên bản ghi nhớ, số tài khoản hoặc số kết nối" (mục 27.6), của cổng mở rộng dịch vụ đòi phần đóng góp dương (mục 21.5), và của việc công nhận năng lực nút theo từng phạm vi có thời hạn và kỳ rà soát thay vì công nhận chung (mục 20.1).

#### 32.5.5 Dự án công nghệ thông tin công làm một lần

**Chương trình quốc gia về công nghệ thông tin cho Y tế Anh (NPfIT)** khởi động năm 2002 với tham vọng thay thế đồng loạt hệ thống hồ sơ bệnh án trên toàn quốc, và bị giải thể năm 2011 sau khi tiêu tốn khoảng mười tỷ bảng. Đây là một trong những thất bại công nghệ thông tin khu vực công được ghi chép kỹ nhất, qua nhiều báo cáo kiểm toán và điều trần.

**Vì sao thất bại:** thiết kế tập trung từ trên xuống, triển khai đồng loạt thay vì cuốn chiếu, và thiếu sự tham gia của chính những người sẽ dùng hệ thống. Khi phạm vi quá lớn, không ai có thể kiểm chứng giả định nào sai cho đến khi đã quá muộn để sửa; và vì đã cam kết chính trị, dự án tiếp tục chạy rất lâu sau khi các dấu hiệu hỏng đã rõ.

Đây là căn cứ trực tiếp và mạnh nhất cho hai lựa chọn kỹ thuật của tài liệu: vận hành thủ công song song với xây dựng (mục 27.3), và mỗi giai đoạn phải kết thúc bằng một quyết định tiếp tục, thiết kế lại hoặc dừng (tiêu chí nghiệm thu 72). Bài học này cũng là lý do tài liệu phải nói rõ vì sao vẫn chọn **thay máy chủ dịch vụ một lần** tại mục 26.6 thay vì cuốn chiếu: điểm chung của NPfIT là thay đồng loạt một hệ đang phục vụ hàng vạn đơn vị với giả định chưa kiểm chứng; điểm khác của NacenTwin là máy chủ bị thay rất nhỏ, đã đóng băng, phục vụ vài trăm người dùng, hành vi được ghi thành chuẩn và phát lại được, dữ liệu có đối soát từng bảng, có cửa sổ quay lại. Cái NPfIT cảnh báo là thay đồng loạt **phạm vi nghiệp vụ**; tài liệu này vẫn giữ nguyên bài học đó bằng hồ sơ cấu hình năng lực và cổng bằng chứng, chỉ cắt một lần ở **nền tảng chạy**.

#### 32.5.6 Lấy quy mô vốn và định giá làm thước đo

**SoftBank Vision Fund** từng công bố khoản lỗ đầu tư lũy kế rất lớn, cho thấy quy mô quỹ, mức định giá và số lượng thương vụ không thay thế được quản trị, giới hạn tập trung rủi ro, cổng theo giai đoạn và lợi nhuận đã hiện thực hóa.

**Vì sao có vấn đề:** định giá là ý kiến, còn dòng tiền là sự thật. Một hệ thống lấy vốn cam kết hoặc định giá làm chỉ số thành công sẽ tối ưu hóa cho việc gọi thêm vốn thay vì tạo ra kết quả. Trong bối cảnh nền tảng công, biến thể của lỗi này là báo cáo "tổng giá trị cam kết" hoặc "tổng giá trị hàng hóa" như thể đó là doanh thu.

Đây là căn cứ của mục 19.3 về sổ theo dõi tách biệt và cấm dùng doanh thu gộp hoặc giá trị cam kết để làm tăng giả hiệu quả, của tiêu chí 36 về khoản thu hộ, và của danh sách chỉ số hình thức bị cấm tại mục 28.5.

#### 32.5.7 Bảng tổng hợp nguyên nhân thất bại

| Dạng thất bại | Cơ chế hỏng | Điều khoản bảo vệ trong tài liệu |
|---|---|---|
| Sàn danh mục thuần túy | Giả định vấn đề là thiếu thông tin, trong khi vấn đề là thiếu người chịu trách nhiệm | Mục 1.1, 5.2; tiêu chí 66 |
| Bắt đầu từ nguồn cung | Nhập dữ liệu công nghệ trước khi biết phục vụ nhu cầu nào | Mục 4 nguyên tắc 1; mục 12.2 |
| Nền tảng ôm rủi ro ngoài năng lực | Chuyển từ điều phối sang sản xuất, tồn kho, giữ tiền | Mục 2.3, 15.3 |
| Thiết chế chồng lấn mandate | Nhiều cửa, không cửa nào chịu trách nhiệm đến cùng | Mục 19.4, 19.5 |
| Mạng rộng không tự nuôi được | Quy mô tăng nhanh hơn kinh tế đơn vị | Mục 20.1, 21.5, 27.6 |
| Triển khai công nghệ thông tin một lần | Không kiểm chứng được giả định nào sai trước khi quá muộn | Mục 26.6, 27.3; tiêu chí 72 |
| Định giá thay cho dòng tiền | Tối ưu cho gọi vốn thay vì cho kết quả | Mục 19.3, 21.4; tiêu chí 36 |
| Chỉ số hình thức | Đo cái dễ tăng thay vì cái tạo giá trị | Mục 28.1, 28.5 |
| Tư vấn kiêm thẩm định | Bên bán tự chấm điểm mình | Mục 3.3, 15.5; tiêu chí 19, 23 |
| Nhân bản hệ thống theo địa phương | Mỗi bản một kiểu, không bản nào nâng cấp được | Mục 10.6, 20.2; tiêu chí 45 |

### 32.6 Những gì Việt Nam không nên sao chép

Ngay cả từ các mô hình thành công, có những phần không nên mang về:

- **Khu đổi mới sáng tạo quy mô lớn như giải pháp mặc định.** Cơ sở vật chất là kết quả của nhu cầu đã chứng minh, không phải nguyên nhân tạo ra nhu cầu.
- **Tự nhận vai trò "ITRI Việt Nam" hoặc "Fraunhofer Việt Nam".** Các viện đó có hàng nghìn kỹ sư và hạ tầng tích lũy nhiều thập kỷ. Việc cần làm trước là kết nối và đặt hàng các đơn vị đã có năng lực.
- **Sao chép tỷ lệ tài trợ, tỷ lệ bản quyền hoặc hạn chế chuyển giao của nước khác** khi chưa có căn cứ trong pháp luật Việt Nam.
- **Điểm tín nhiệm công nghệ dùng chung cho mọi mục đích.** Kết quả đánh giá phải có phạm vi và mục đích cụ thể, không thay quyết định chuyên môn hay quyết định tín dụng.
- **Ba mươi tư nền tảng, cơ sở dữ liệu và danh mục độc lập** cho ba mươi tư đơn vị hành chính cấp tỉnh.
- **Nội địa hóa hiểu là lắp ráp hoặc mua máy** mà không kèm bí quyết, đội ngũ và quyền cải tiến.

### 32.7 Đánh giá khả năng thành công theo điều kiện

Kết hợp các phát hiện trên, khả năng thành công của NacenTech không phải một con số cố định mà phụ thuộc vào việc hội đủ bao nhiêu cấu phần của chuỗi tại mục 32.2:

| Điều kiện hội đủ | Đánh giá định tính |
|---|---|
| Chỉ xây nền tảng phần mềm và nhập dữ liệu công nghệ | Thấp |
| Có đơn vị bảo trợ và mạng điều phối viên, nhưng chưa có đối tác tài chính | Trung bình thấp |
| Có nhu cầu đã xác nhận, điều phối viên, đơn vị chuyển giao, thẩm định và đối tác tài chính | Trung bình khá |
| Có thêm mandate dữ liệu, dòng chương trình lặp lại và kết quả đã được kiểm chứng | Khá |

Đây là đánh giá chiến lược có điều kiện, không phải dự báo thống kê. Giá trị của bảng nằm ở chỗ nó chỉ rõ: **phần quyết định thành công nằm ngoài phần mềm**. Nếu chỉ hoàn thành hệ thống mà không có liên minh thể chế, người trả tiền và đối tác tài chính, xác suất hình thành thị trường bền vững vẫn thấp — dù phần mềm được xây tốt đến đâu.

Hệ quả cho việc lập kế hoạch: các cổng tại mục 27 không phải thủ tục hành chính mà là phép đo xem những cấu phần ngoài phần mềm đã có mặt hay chưa.

### 32.8 Nghĩa vụ duy trì

Phần đối chiếu này là tài liệu sống, không phải khảo cứu làm một lần:

- Mỗi mô hình được viện dẫn phải có một mục trong danh mục bằng chứng, ghi cơ chế, mức bằng chứng, nguồn, chỉ số kết quả, giới hạn quy thuộc, khả năng chuyển sang Việt Nam, quyết định áp dụng, thời điểm đánh giá và kỳ rà soát tiếp theo.
- Số liệu do bên vận hành tự công bố phải được ghi rõ là tự công bố, kèm ngày và nguồn.
- Danh mục được rà lại hằng năm, và bắt buộc rà trước mọi quyết định mở rộng mạng lưới, mở hành lang hợp tác quốc tế hoặc mở một dòng dịch vụ mới.
- Khi một mô hình đang được viện dẫn xuất hiện bằng chứng ngược, mục tương ứng phải được hạ mức và các quyết định kiến trúc dựa trên nó phải được rà lại.

Trước khi công bố tài liệu ra ngoài, mọi số liệu định lượng trong mục này cần được đối chiếu lại với nguồn gốc và ghi kèm trích dẫn. Các con số hiện có trong tài liệu được dùng để minh họa cơ chế, không phải để làm căn cứ pháp lý hay tài chính.

---

## Kết luận

Kiến trúc NacenTech giữ toàn bộ năng lực cần thiết của một hạ tầng thương mại hóa công nghệ, chuyển đổi số và đổi mới sáng tạo, nhưng không yêu cầu triển khai đồng thời. Lõi hệ thống tập trung vào hồ sơ, quyết định, bằng chứng, thẩm quyền và kết quả; các dịch vụ chuyên môn, tài chính, mạng địa phương, hợp tác quốc tế và trí tuệ nhân tạo được kích hoạt theo hồ sơ cấu hình và cổng bằng chứng.

Ba lựa chọn định hình toàn bộ tài liệu đáng nhắc lại ở đây, và cả ba đều rút ra từ đối chiếu quốc tế tại mục 32. Thứ nhất, hệ thống là hạ tầng quản lý vòng đời có người chịu trách nhiệm, không phải sàn đăng tin — mọi cấu trúc dữ liệu và phân quyền đều phục vụ điều đó, vì các sàn danh mục thuần túy đã thất bại ở nhiều nước mà không giải quyết được một nút thắt nào. Thứ hai, thẩm quyền thật luôn nằm ở đúng chủ thể: cơ quan, quỹ, phòng thử nghiệm, con người — hệ thống điều phối và ghi nhận, không thay thế, vì các thiết chế chồng lấn mandate tạo ra phân tán chứ không tạo ra kết quả. Thứ ba, mọi sự mở rộng — chức năng, dịch vụ, mạng lưới, nhân sự — đều đi qua cổng bằng chứng, để hệ thống lớn lên theo giá trị thật thay vì theo kỳ vọng.

Cần nói thẳng một điều mà mục 32.7 đã chỉ ra: **phần quyết định thành công nằm ngoài phần mềm.** Hoàn thành hệ thống này là điều kiện cần. Điều kiện đủ là liên minh thể chế, người trả tiền thật, đối tác tài chính và mạng chuyên gia có năng lực — những thứ phải được xây song song, không phải sau khi phần mềm chạy.

Phạm vi triển khai đầu tiên phải đủ sâu để đi hết chuỗi từ nhu cầu đến kết quả, nhưng đủ hẹp để đo được người trả tiền, chi phí, trách nhiệm và giá trị:

> Một ngành sản xuất — một nhóm doanh nghiệp — một chuỗi từ chẩn đoán đến thử nghiệm và vận hành — một bộ bằng chứng — một kết quả được xác minh.

Cửa sổ triển khai được chốt ở **sáu tháng** (mục 27). Cần nói rõ sáu tháng đó cho ra cái gì và không cho ra cái gì. Nó cho ra một chuỗi hoàn chỉnh nhưng hẹp chạy thật trên hệ thống, với ít nhất một hồ sơ đi trọn vòng đời và có kết quả được xác minh độc lập — đủ để chứng minh mô hình vận hành được, và đủ để bắt đầu đo chi phí phục vụ thật. Nó **không** cho ra câu trả lời về tính bền vững tài chính, không cho ra mạng lưới nhiều nút, không cho ra cơ chế ký quỹ, và không cho ra một nền tảng đầy đủ theo danh sách chức năng dự kiến. Trình bày sáu tháng như thể đạt được những thứ đó là tái phạm đúng lỗi mà mục 26.1.1 đặt ra để phòng.

Đây là cách giữ được giá trị của các mô hình quốc tế mà không biến hệ thống thành một chương trình ôm đồm hoặc một phần mềm không thể hoàn thành.
