import { IntakeSeedData, runSectorSeed } from './shared';

export const SEEDS: IntakeSeedData[] = [
  {
    title:
      'Nền tảng AI khám phá thuốc mới rút ngắn chu kỳ nghiên cứu phát triển',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Công nghệ thông tin'],
    content: `<h2>AI Drug Discovery - Rút Ngắn Hành Trình Từ Phòng Lab Đến Thị Trường</h2>
<p>Nền tảng AI chuyên dụng cho nghiên cứu phát triển dược phẩm, kết hợp machine learning và dữ liệu sinh học phân tử để dự đoán hoạt tính, độc tính và dược động học của hợp chất mới trong vài giờ thay vì vài năm.</p>
<h3>Chi phí khổng lồ của R&D dược phẩm</h3>
<p>Phát triển một loại thuốc mới trung bình tốn 2.6 tỷ USD và 12-15 năm. Tỷ lệ thất bại từ giai đoạn tiền lâm sàng đến phê duyệt lên đến 90%. AI có thể giảm 30-40% chi phí R&D và rút ngắn 30-50% thời gian phát triển bằng cách sàng lọc hàng triệu hợp chất in-silico trước khi thử nghiệm thực tế.</p>
<h3>Khả năng của nền tảng</h3>
<p>Molecular docking simulation: mô phỏng tương tác thuốc-protein mục tiêu bằng deep learning. ADMET prediction: dự đoán hấp thu, phân phối, chuyển hóa, bài tiết và độc tính. De novo drug design: AI thiết kế cấu trúc phân tử mới có đặc tính mong muốn. Drug repurposing: khám phá công dụng mới của thuốc đã có trên thị trường. Generative chemistry: tối ưu cấu trúc hóa học theo mục tiêu sinh học.</p>
<h3>Dữ liệu và hạ tầng</h3>
<p>Database 150 triệu hợp chất hóa học từ PubChem, ChEMBL, ZINC. Graph neural network xử lý cấu trúc phân tử 3D. HPC cluster 500 GPU cho molecular dynamics simulation. Tích hợp với robot tổng hợp hóa học tự động cho vòng lặp design-make-test-analyze.</p>
<h3>Kết quả R&D</h3>
<p>Đã xác định 8 hợp chất tiềm năng chống ung thư phổi trong 6 tháng (thay vì 3 năm thông thường). 3 hợp chất đang trong giai đoạn tiền lâm sàng. Partnership với 12 công ty dược quốc tế và 3 viện nghiên cứu trong nước.</p>`,
  },
  {
    title: 'Hệ thống sản xuất dược phẩm thông minh đáp ứng chuẩn GMP quốc tế',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Sản xuất & Công nghiệp'],
    content: `<h2>Smart GMP Manufacturing - Nâng Cấp Sản Xuất Dược Phẩm Lên Tiêu Chuẩn EU-GMP</h2>
<p>Hệ thống tích hợp cho nhà máy sản xuất dược phẩm thông minh, bao gồm MES (Manufacturing Execution System), QMS và LIMS, đáp ứng đầy đủ yêu cầu GMP EU, WHO và FDA.</p>
<h3>Yêu cầu xuất khẩu dược phẩm</h3>
<p>Thị trường dược phẩm toàn cầu trị giá 1,600 tỷ USD nhưng dược phẩm Việt Nam chiếm chưa đến 0.1%. Để xuất khẩu vào EU, Mỹ cần đạt chuẩn EU-GMP hoặc FDA cGMP - yêu cầu kiểm soát quy trình sản xuất nghiêm ngặt với hồ sơ điện tử đầy đủ. Kiểm tra FDA có thể từ chối toàn bộ lô hàng nếu thiếu dữ liệu integrity.</p>
<h3>Module MES cho nhà máy dược</h3>
<p>Electronic Batch Record (eBR) thay thế hồ sơ lô giấy. Quản lý quy trình sản xuất theo SOP chuẩn hóa điện tử. In-process control tự động thu thập thông số từ thiết bị. Quản lý nhân viên, thiết bị, nguyên liệu và môi trường theo GDP. Audit trail 21 CFR Part 11 đầy đủ và bất biến.</p>
<h3>QMS và LIMS tích hợp</h3>
<p>Quản lý deviation, CAPA, change control điện tử. Stability testing management với cảnh báo hạn kiểm định. Lab Information Management System kết nối thiết bị phân tích tự động. CoA (Certificate of Analysis) tự động generate với chữ ký điện tử. Supplier qualification và audit management.</p>
<h3>Kết quả xuất khẩu</h3>
<p>3 nhà máy khách hàng đạt chứng nhận EU-GMP sau 18 tháng triển khai. Xuất khẩu tổng cộng 45 triệu USD dược phẩm sang châu Âu năm 2024. Giảm 40% thời gian chuẩn bị hồ sơ đăng ký thuốc.</p>`,
  },
  {
    title: 'Công nghệ phân tích gen và xét nghiệm di truyền ứng dụng lâm sàng',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Y tế & Chăm sóc sức khỏe'],
    content: `<h2>GenomicsVN - Xét Nghiệm Di Truyền Chính Xác Cho Y Học Cá Nhân Hóa</h2>
<p>Dịch vụ phân tích gen và xét nghiệm di truyền ứng dụng công nghệ NGS (Next Generation Sequencing), cung cấp thông tin di truyền chính xác để hỗ trợ chẩn đoán, điều trị ung thư và sàng lọc bệnh di truyền.</p>
<h3>Xu hướng y học cá nhân hóa</h3>
<p>Y học chính xác (precision medicine) đang thay đổi cách điều trị ung thư, từ phác đồ chung sang điều trị dựa trên profile di truyền khối u của từng bệnh nhân. Thuốc nhắm trúng đích (targeted therapy) hiệu quả hơn 3-5 lần hóa chất truyền thống nhưng cần xét nghiệm gen trước để xác định phù hợp.</p>
<h3>Dịch vụ xét nghiệm</h3>
<p>Panel ung thư toàn diện: phân tích 500+ gen liên quan đến 50 loại ung thư phổ biến. Liquid biopsy: phát hiện đột biến gen từ máu ngoại vi không cần sinh thiết mô. Sàng lọc trước sinh NIPT: phát hiện bất thường nhiễm sắc thể thai nhi từ tuần 10. Xét nghiệm di truyền bệnh hiếm gặp cho trẻ em. Pharmacogenomics: dự đoán phản ứng thuốc dựa trên gen.</p>
<h3>Công nghệ và quy trình</h3>
<p>Máy giải trình tự gen thế hệ mới Illumina NovaSeq 6000. Bioinformatics pipeline tự động phân tích variant. Database 50,000 bệnh nhân Việt Nam xây dựng từ 2018. Báo cáo giải thích kết quả bằng tiếng Việt cho bác sĩ và bệnh nhân. Tư vấn di truyền (genetic counseling) 1-1 sau xét nghiệm.</p>
<h3>Thị trường và tác động</h3>
<p>Thực hiện 25,000 xét nghiệm/năm, tốc độ tăng 80%/năm. Phát hiện 1,200+ bệnh nhân được hưởng lợi từ targeted therapy. Chi phí xét nghiệm giảm 60% so với gửi mẫu ra nước ngoài. Đối tác của 30 bệnh viện ung thư và bệnh viện nhi hàng đầu.</p>`,
  },
  {
    title:
      'Giải pháp bioprocessing và lên men công nghiệp cho sản xuất sinh học',
    sectorNames: ['Dược phẩm & Công nghệ sinh học'],
    content: `<h2>BioPro Solutions - Tối Ưu Hóa Quy Trình Lên Men Và Sản Xuất Sinh Học</h2>
<p>Hệ thống tự động hóa và tối ưu hóa bioprocess cho sản xuất kháng sinh, enzyme công nghiệp, probiotic, và các sản phẩm sinh học khác ứng dụng PAT (Process Analytical Technology) và AI.</p>
<h3>Thách thức sản xuất sinh học</h3>
<p>Quy trình lên men rất nhạy cảm với nhiều biến số (pH, nhiệt độ, DO, tốc độ khuấy, dinh dưỡng) tương tác phức tạp. Batch-to-batch variation thường 15-25% gây lãng phí nguyên liệu và sản phẩm không đạt chất lượng. Thiếu dữ liệu real-time dẫn đến kiểm soát bằng kinh nghiệm, không tối ưu.</p>
<h3>PAT và digital twin</h3>
<p>Mạng lưới sensor inline đo 20+ thông số liên tục (biomass, substrate, product concentration). Digital twin của bioreactor mô phỏng và dự đoán kết quả trước khi thực hiện. Model predictive control tự động điều chỉnh thông số feeding. Real-time release testing giảm thời gian kiểm định batch từ 3 tuần xuống 3 ngày.</p>
<h3>Tối ưu hóa AI</h3>
<p>Machine learning học từ 500+ batch lịch sử để tối ưu điều kiện nuôi cấy. Anomaly detection phát hiện sớm batch có vấn đề, can thiệp trước khi thất bại. Bayesian optimization tìm điều kiện tối ưu với số thí nghiệm tối thiểu. Scale-up simulation từ 2L lab đến 10,000L production với độ chính xác cao.</p>
<h3>Kết quả sản xuất</h3>
<p>Tăng năng suất lên men trung bình 35%. Giảm batch failure rate từ 8% xuống 1.5%. Tiết kiệm 20% nguyên liệu dinh dưỡng nhờ feeding tối ưu. Đang phục vụ 5 nhà máy dược phẩm và 3 công ty enzyme công nghiệp.</p>`,
  },
  {
    title: 'Nền tảng thử nghiệm lâm sàng điện tử eClinical tích hợp AI',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Y tế & Chăm sóc sức khỏe'],
    content: `<h2>eClinical Platform - Số Hóa Toàn Diện Thử Nghiệm Lâm Sàng Thuốc Mới</h2>
<p>Nền tảng quản lý thử nghiệm lâm sàng điện tử (eClinical) bao gồm EDC, eConsent, CTMS, eTMF và safety reporting, tuân thủ ICH GCP E6(R2) và FDA 21 CFR Part 11.</p>
<h3>Thực trạng thử nghiệm lâm sàng</h3>
<p>Chi phí một thử nghiệm lâm sàng Phase III trung bình 50-150 triệu USD. Quy trình thủ công với CRF giấy chậm và nhiều lỗi: 30% dữ liệu cần query khi nhập EDC sau. Site monitoring tốn kém do di chuyển thực địa. Recruitment thử nghiệm chậm do khó tìm bệnh nhân đủ tiêu chí.</p>
<h3>EDC và eConsent</h3>
<p>Electronic Data Capture với validation rule tự động ngay lúc nhập liệu. eConsent: bệnh nhân ký chấp thuận bằng màn hình cảm ứng hoặc iPad với video giải thích quy trình. Remote patient monitoring: thu thập dữ liệu từ thiết bị đeo, app mobile của bệnh nhân. Risk-based monitoring: AI xác định site cần audit thực địa dựa trên quality indicator.</p>
<h3>AI hỗ trợ thử nghiệm</h3>
<p>Protocol feasibility AI: dự đoán tốc độ tuyển bệnh nhân theo tiêu chí inclusion/exclusion. Patient matching: xác định bệnh nhân phù hợp trong HIS network đối tác. Safety signal detection: phát hiện bất thường SAE pattern sớm. Adaptive trial design: điều chỉnh thiết kế thử nghiệm dựa trên interim data.</p>
<h3>Hiệu quả thử nghiệm</h3>
<p>Giảm 40% thời gian database lock sau khi kết thúc thử nghiệm. Tiết kiệm 35% chi phí monitoring. Rút ngắn 25% thời gian tuyển bệnh nhân. Đang hỗ trợ 8 thử nghiệm lâm sàng Phase I-III tại Việt Nam.</p>`,
  },
  {
    title: 'Công nghệ sản xuất và kiểm định vaccine tại Việt Nam',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Y tế & Chăm sóc sức khỏe'],
    content: `<h2>VaccineVN - Nâng Cao Năng Lực Sản Xuất Vaccine Nội Địa</h2>
<p>Công nghệ và thiết bị chuyên dụng cho sản xuất vaccine thế hệ mới (mRNA, protein tái tổ hợp, viral vector) tại Việt Nam, bao gồm hệ thống lọc tiệt trùng, đóng lọ vô trùng và kiểm định chất lượng.</p>
<h3>Nhu cầu vaccine nội địa</h3>
<p>Dịch COVID-19 cho thấy phụ thuộc vaccine nhập khẩu là rủi ro an ninh quốc gia. Việt Nam hiện sản xuất được 10 loại vaccine trong Chương trình TCMR nhưng chưa có năng lực sản xuất vaccine mRNA hoặc protein tái tổ hợp hiện đại. Thị trường vaccine Việt Nam trị giá 500 triệu USD/năm, chủ yếu nhập khẩu.</p>
<h3>Công nghệ sản xuất</h3>
<p>Bioreactor GMP class A cho nuôi cấy tế bào sản xuất kháng nguyên. Lipid nanoparticle (LNP) formulation system cho vaccine mRNA. Tangential flow filtration hệ thống lọc tinh chế protein. Vial filling và lyophilization (đông khô) tự động trong điều kiện vô trùng. Fill-and-finish capacity 10 triệu liều/năm giai đoạn 1.</p>
<h3>Hệ thống kiểm định</h3>
<p>QC lab đáp ứng WHO prequalification. Test panels: sterility, potency, identity, purity, endotoxin, particle size. Stability testing program theo ICH Q5C cho vaccine sinh học. Sinh phẩm đối chiếu (reference standard) quản lý nghiêm ngặt. Độc lập kiểm tra batch tại Viện Kiểm định Quốc gia Vắc-xin.</p>
<h3>Lộ trình phát triển</h3>
<p>Giai đoạn 1 (2024-2026): sản xuất vaccine phòng cúm mùa và vaccine phòng viêm não Nhật Bản tái tổ hợp. Giai đoạn 2: chuyển giao công nghệ vaccine COVID-19 mRNA từ đối tác quốc tế. Mục tiêu tự chủ 50% vaccine sử dụng trong nước vào 2030.</p>`,
  },
  {
    title: 'Giải pháp quản lý phòng thí nghiệm LIMS cho nghiên cứu sinh học',
    sectorNames: ['Dược phẩm & Công nghệ sinh học'],
    content: `<h2>LabIQ - LIMS Thế Hệ Mới Cho Phòng Thí Nghiệm Sinh Học Hiện Đại</h2>
<p>Hệ thống quản lý thông tin phòng thí nghiệm (LIMS) chuyên biệt cho R&D dược phẩm và sinh học, tích hợp với thiết bị phân tích tự động và nền tảng nghiên cứu cloud.</p>
<h3>Thực trạng quản lý lab R&D</h3>
<p>Phòng lab nghiên cứu sử dụng sổ tay giấy và Excel lưu trữ dữ liệu thí nghiệm - dễ thất lạc và khó tra cứu. FDA 483 observation phổ biến nhất là "thiếu data integrity" trong hồ sơ điện tử. Chia sẻ dữ liệu giữa nhóm nghiên cứu chậm và kém hiệu quả. Khó quản lý mẫu và hóa chất theo chuẩn GLP.</p>
<h3>Tính năng LIMS</h3>
<p>Electronic Lab Notebook (ELN): ghi chép thí nghiệm có cấu trúc, tìm kiếm toàn văn, version control. Sample management: tracking mẫu từ nhận đến hủy, barcode/RFID. Instrument integration: tự động import kết quả từ HPLC, MS, PCR, reader. Workflow automation: protocol điện tử hướng dẫn kỹ thuật viên từng bước. Inventory: quản lý hóa chất, thuốc thử, SDS safety.</p>
<h3>Tuân thủ và bảo mật</h3>
<p>21 CFR Part 11: audit trail, electronic signatures, access control. GLP data integrity theo OECD GLP Principles. Backup tự động, disaster recovery, role-based permissions. Integration với SAP ERP cho procurement hóa chất.</p>
<h3>Hiệu quả nghiên cứu</h3>
<p>Tiết kiệm 2 giờ/nhà khoa học/ngày từ việc tự động hóa nhập liệu và báo cáo. Tìm kiếm kết quả thí nghiệm cũ giảm từ 2 giờ xuống 5 phút. 100% audit trail đầy đủ cho submission FDA/EMA. Đang phục vụ 15 phòng lab tại các viện nghiên cứu và công ty dược.</p>`,
  },
  {
    title:
      'Hệ thống chiết xuất và tiêu chuẩn hóa dược liệu từ thảo dược Việt Nam',
    sectorNames: ['Dược phẩm & Công nghệ sinh học'],
    content: `<h2>HerbTech - Công Nghệ Hiện Đại Cho Dược Liệu Truyền Thống Việt Nam</h2>
<p>Công nghệ chiết xuất, phân tích và tiêu chuẩn hóa hoạt chất từ dược liệu Việt Nam theo chuẩn GMP, tạo nguyên liệu dược phẩm chất lượng cao phục vụ sản xuất thuốc đông dược hiện đại và xuất khẩu.</p>
<h3>Tiềm năng dược liệu Việt Nam</h3>
<p>Việt Nam có hơn 5,000 loài cây dược liệu, nguồn tài nguyên phong phú nhưng phần lớn được xuất khẩu thô với giá trị thấp. Thị trường dược liệu toàn cầu đạt 140 tỷ USD/năm. Sản phẩm chiết xuất tiêu chuẩn hóa có giá trị cao gấp 10-30 lần nguyên liệu thô.</p>
<h3>Công nghệ chiết xuất</h3>
<p>Siêu âm assisted extraction tối ưu hiệu suất chiết hoạt chất. Supercritical CO2 extraction cho hoạt chất nhạy nhiệt (tinh dầu, omega-3). Membrane filtration tinh chế loại tạp chất. Spray drying và freeze drying tạo bột chiết xuất ổn định. Nano-encapsulation tăng sinh khả dụng hoạt chất.</p>
<h3>Kiểm soát chất lượng</h3>
<p>Fingerprint chromatography (HPLC/UHPLC) kiểm soát hoạt chất marker. DNA barcoding xác thực nguồn gốc loài thực vật. Kiểm tra dư lượng thuốc trừ sâu, kim loại nặng, nấm mốc. Certificate of Analysis theo tiêu chuẩn EP (European Pharmacopoeia). Truy xuất nguồn gốc từ vùng trồng đến sản phẩm cuối.</p>
<h3>Sản phẩm và thị trường</h3>
<p>12 chiết xuất tiêu chuẩn hóa: diệp hạ châu (silymarin), nghệ (curcumin), tía tô (rosmarinic acid), trinh nữ hoàng cung, actiso. Xuất khẩu 8 triệu USD/năm sang EU, Nhật, Hàn Quốc. Cung cấp nguyên liệu cho 30 công ty dược trong nước.</p>`,
  },
  {
    title:
      'Nền tảng quản lý chất lượng QMS cho ngành dược phẩm và thực phẩm chức năng',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Thực phẩm & Đồ uống'],
    content: `<h2>QualityHub - QMS Toàn Diện Cho Ngành Dược Và Thực Phẩm Chức Năng</h2>
<p>Hệ thống quản lý chất lượng (QMS) điện tử cho nhà máy dược phẩm và thực phẩm chức năng, quản lý toàn bộ vòng đời chất lượng từ nhà cung cấp đến sản phẩm đến tay người tiêu dùng.</p>
<h3>Áp lực tuân thủ chất lượng</h3>
<p>Bộ Y tế tăng cường kiểm tra GMP, nhiều nhà máy bị đình chỉ hoặc thu hồi giấy phép. Yêu cầu xuất khẩu ASEAN và toàn cầu ngày càng nghiêm ngặt. Số lượng SOP, tài liệu chất lượng lên đến hàng nghìn bản khó quản lý hiệu quả. Sự cố chất lượng xử lý chậm do quy trình CAPA thủ công.</p>
<h3>Module QMS</h3>
<p>Document Control: quản lý SOP, specification, form với version control và phân phối điện tử. CAPA: xử lý deviation, complaint, OOS với root cause analysis có hướng dẫn. Change Control: quy trình phê duyệt thay đổi đa cấp có risk assessment. Training Management: quản lý đào tạo GMP, cảnh báo GEP expiry. Supplier Qualification: đánh giá và audit nhà cung cấp định kỳ.</p>
<h3>Phân tích chất lượng</h3>
<p>Quality metrics dashboard: batch acceptance rate, CAPA cycle time, complaint trend. Statistical process control biểu đồ kiểm soát real-time. Annual Product Review (APR) tự động tổng hợp dữ liệu cả năm. Risk management module theo ICH Q9.</p>
<h3>Kết quả kiểm định</h3>
<p>5 khách hàng đạt WHO-GMP sau 12 tháng triển khai. Giảm 50% thời gian chuẩn bị hồ sơ cho đợt thanh tra. Không có major observation trong 8 lần thanh tra Bộ Y tế năm 2024. Phục vụ 45 nhà máy dược phẩm và thực phẩm chức năng.</p>`,
  },
  {
    title:
      'Giải pháp công nghệ sinh học nông nghiệp giống cây trồng biến đổi gen',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Nông nghiệp'],
    content: `<h2>AgriGenetics - Công Nghệ Sinh Học Tạo Giống Cây Trồng Thích Nghi Biến Đổi Khí Hậu</h2>
<p>Nghiên cứu và phát triển giống cây trồng cải tiến bằng công nghệ CRISPR và marker-assisted selection, tạo ra giống lúa, ngô, đậu tương kháng bệnh, chịu hạn và năng suất cao phù hợp điều kiện Việt Nam.</p>
<h3>Thách thức an ninh lương thực</h3>
<p>Biến đổi khí hậu khiến hạn hán, lũ lụt và sâu bệnh ngày càng nghiêm trọng. Năng suất lúa vùng ĐBSCL giảm 15-20% trong thập kỷ qua do nhiễm mặn và hạn hán. Nhu cầu lương thực toàn cầu tăng 70% đến 2050 nhưng diện tích canh tác không tăng.</p>
<h3>Công nghệ tạo giống</h3>
<p>CRISPR-Cas9 chỉnh sửa gen chính xác không để lại dấu vết ngoại lai. Marker-assisted backcrossing (MABC) đưa gen kháng bệnh vào giống địa phương nhanh hơn 5-7 năm. Genomic selection dự đoán hiệu suất giống dựa trên 50,000 SNP marker. High-throughput phenotyping robot chụp ảnh và đo 100+ đặc tính cây trồng tự động.</p>
<h3>Giống đã phát triển</h3>
<p>Lúa OM18-CR: kháng đạo ôn cổ bông, năng suất tăng 12%, thích nghi ĐBSCL. Ngô NK7328-B: kháng sâu đục thân, giảm 80% thuốc trừ sâu. Đậu tương DT2024: chịu hạn giai đoạn ra hoa, ổn định năng suất trên đất thiếu nước. Đang thử nghiệm giống lúa chịu mặn 6‰ cho vùng duyên hải.</p>
<h3>Hợp tác và thương mại hóa</h3>
<p>Partnership với Viện Lúa ĐBSCL, Cục Trồng trọt và các tỉnh thành. 45,000 ha diện tích gieo trồng giống mới trong 2024. Bản quyền giống tại 5 quốc gia ASEAN. Xuất khẩu hạt giống 3 triệu USD/năm.</p>`,
  },
];

export const SEEDS_EXTRA: IntakeSeedData[] = [
  {
    title:
      'Giải pháp quản lý đăng ký thuốc và nộp hồ sơ số hóa cơ quan quản lý',
    sectorNames: ['Dược phẩm & Công nghệ sinh học'],
    content: `<h2>RegTech Pharma - Số Hóa Quy Trình Đăng Ký Và Cấp Phép Dược Phẩm</h2>
<p>Nền tảng regulatory affairs số hóa toàn bộ quy trình đăng ký thuốc, xin cấp phép và nộp hồ sơ với Cục Quản lý Dược (DAV) theo định dạng eCTD chuẩn quốc tế.</p>
<h3>Thực trạng đăng ký thuốc tại Việt Nam</h3>
<p>Quy trình đăng ký thuốc tại Việt Nam trung bình mất 18-36 tháng, một trong những lâu nhất khu vực ASEAN. Hồ sơ đăng ký một thuốc generic có thể lên đến 5,000-10,000 trang tài liệu. Thiếu hệ thống theo dõi tiến trình và thông báo yêu cầu bổ sung từ DAV. Sai sót format hồ sơ gây chậm trễ thêm 6-12 tháng.</p>
<h3>Tính năng hệ thống</h3>
<p>eCTD builder: tổ chức hồ sơ đúng cấu trúc Module 1-5 theo ICH M4. Validation tự động phát hiện lỗi format trước khi nộp. Template thư từ trao đổi với DAV theo quy định. Tracking hồ sơ real-time: biết chính xác hồ sơ đang ở bước nào. Gap analysis so sánh hồ sơ với dossier đã được phê duyệt tương tự. License expiry alert nhắc gia hạn đăng ký trước 6 tháng.</p>
<h3>Quản lý danh mục thuốc</h3>
<p>Database toàn bộ thuốc đăng ký của công ty với trạng thái, hạn đăng ký. Theo dõi thay đổi sau đăng ký (variation): thành phần, nhà sản xuất, bao bì. Dossier archive tìm kiếm toàn văn trong hàng nghìn tài liệu. So sánh cross-country registration với các nước trong khu vực.</p>
<h3>Hiệu quả đăng ký</h3>
<p>Giảm 40% thời gian chuẩn bị hồ sơ đăng ký. Giảm 60% tỷ lệ hồ sơ bị trả lại do lỗi format. Đang hỗ trợ 20 công ty dược trong nước và đa quốc gia quản lý 5,000+ số đăng ký.</p>`,
  },
  {
    title:
      'Hệ thống quản lý và phân tích pharmacovigilance tín hiệu an toàn thuốc',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Y tế & Chăm sóc sức khỏe'],
    content: `<h2>PharmaVigilance AI - Phát Hiện Sớm Tín Hiệu An Toàn Thuốc Bảo Vệ Người Dùng</h2>
<p>Hệ thống pharmacovigilance thế hệ mới ứng dụng AI phân tích báo cáo ADR (Adverse Drug Reaction), phát hiện sớm tín hiệu an toàn thuốc và quản lý Risk Management Plan theo yêu cầu GVP.</p>
<h3>Tầm quan trọng của pharmacovigilance</h3>
<p>Phản ứng có hại của thuốc (ADR) là nguyên nhân thứ 5 gây tử vong tại bệnh viện toàn cầu. Phát hiện muộn tín hiệu an toàn gây thiệt hại lớn: thu hồi thuốc, kiện tụng, mất uy tín. Quy định ICH E2E, CIOMS yêu cầu hệ thống PV toàn diện là điều kiện duy trì đăng ký thuốc. Báo cáo SUSAR (Serious Unexpected SAR) phải gửi WHO trong 7-15 ngày.</p>
<h3>Thu thập và quản lý báo cáo ADR</h3>
<p>Intake từ nhiều nguồn: bác sĩ, bệnh nhân, y văn, mạng xã hội. NLP phân loại và coding ADR tự động theo MedDRA. Duplicate detection loại báo cáo trùng lặp. E2B(R3) XML export gửi WHO VigiBase, FDA FAERS, EMA EudraVigilance. ICSR workflow quản lý follow-up báo cáo thiếu thông tin.</p>
<h3>Phân tích tín hiệu AI</h3>
<p>Disproportionality analysis (PRR, ROR, EBGM) tự động. AI phát hiện tín hiệu mới nổi trong 48 giờ. Literature monitoring tự động quét PubMed hàng ngày. PBRER/PSUR tự động tổng hợp dữ liệu an toàn định kỳ. Signal review workflow cho ủy ban an toàn dược phẩm.</p>
<h3>Tuân thủ và báo cáo</h3>
<p>Hỗ trợ tuân thủ GVP Module VI, IX, XV của EMA. Dashboard compliance theo dõi deadline báo cáo. Đang hỗ trợ 15 công ty dược đa quốc gia và trong nước quản lý PV system.</p>`,
  },
  {
    title: 'Giải pháp chiết xuất và sản xuất collagen từ nguồn biển Việt Nam',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Thực phẩm & Đồ uống'],
    content: `<h2>MarineCollagen VN - Khai Thác Giá Trị Từ Phụ Phẩm Thủy Sản Việt Nam</h2>
<p>Công nghệ chiết xuất và tinh chế collagen thủy phân từ da cá, vảy cá và xương cá tận dụng phụ phẩm chế biến thủy sản, sản xuất collagen tiêu chuẩn dược phẩm và thực phẩm chức năng xuất khẩu.</p>
<h3>Cơ hội từ phụ phẩm thủy sản</h3>
<p>Việt Nam xuất khẩu 10 tỷ USD thủy sản/năm nhưng phụ phẩm (40-60% khối lượng) thường bán làm bột cá giá thấp. Da và vảy cá chứa 70-80% collagen type I tương tự collagen người. Thị trường collagen toàn cầu đạt 8.6 tỷ USD, tăng 7%/năm. Collagen biển được ưa chuộng hơn collagen bò do không lo dịch bệnh và phù hợp người ăn chay (cá).</p>
<h3>Công nghệ sản xuất</h3>
<p>Enzyme-assisted extraction tối ưu hiệu suất chiết và bảo toàn cấu trúc. Ultrafiltration membrane tinh chế loại tạp protein. Hydrolysis kiểm soát tạo peptide molecular weight 500-10,000 Da tối ưu sinh khả dụng. Spray drying tạo bột collagen hòa tan tốt. Kiểm tra trình tự amino acid bằng LC-MS/MS.</p>
<h3>Tiêu chuẩn chất lượng</h3>
<p>Collagen tinh khiết >90%, hydroxyproline >10%. Không chứa heavy metal, PCB, dioxin. Kiểm tra vi sinh và allergen. Certificate of Analysis theo EP/USP. HALAL và KOSHER certification cho xuất khẩu Trung Đông và Israel.</p>
<h3>Thị trường và xuất khẩu</h3>
<p>Xuất khẩu 5 triệu USD/năm sang Nhật, Hàn, EU. Cung cấp nguyên liệu cho 25 công ty thực phẩm chức năng trong nước. Đang đăng ký bảo hộ quy trình sản xuất độc quyền tại 8 quốc gia.</p>`,
  },
  {
    title:
      'Nền tảng quản lý và phân phối dược phẩm B2B kết nối nhà máy và nhà thuốc',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Thương mại điện tử'],
    content: `<h2>PharmaB2B - Marketplace Dược Phẩm Kết Nối Nhà Sản Xuất Với Bệnh Viện Và Nhà Thuốc</h2>
<p>Nền tảng thương mại điện tử B2B chuyên biệt cho ngành dược phẩm, kết nối 200+ nhà sản xuất/nhập khẩu với 20,000+ bệnh viện và nhà thuốc trên toàn quốc, đặt hàng và thanh toán online minh bạch.</p>
<h3>Phân phối dược phẩm truyền thống</h3>
<p>Chuỗi phân phối dược phẩm Việt Nam có quá nhiều tầng trung gian (nhà nhập khẩu → tổng đại lý → đại lý → nhà thuốc) đẩy giá thuốc lên 30-50% so với giá xuất xưởng. Đặt hàng qua điện thoại, zalo thủ công dễ nhầm lẫn. Không có giá thống nhất và minh bạch, nhà thuốc khó so sánh nhà cung cấp.</p>
<h3>Tính năng marketplace</h3>
<p>Catalog 50,000+ SKU dược phẩm với thông tin đầy đủ, ảnh, tờ hướng dẫn. So sánh giá thời gian thực từ nhiều nhà cung cấp. Đặt hàng tự động theo định kỳ (standing order). Kiểm tra COA và chứng từ nhập khẩu trực tuyến. Thanh toán sau 30/45/60 ngày theo hạn mức tín dụng được duyệt.</p>
<h3>Logistics và giao hàng</h3>
<p>Kho lạnh 2-8°C tại Hà Nội và TP.HCM đảm bảo chuỗi lạnh. Giao hàng trong 24-48 giờ toàn quốc. Real-time tracking đơn hàng. Reverse logistics: trả hàng hết hạn, hàng lỗi dễ dàng. Báo cáo thống kê mua hàng cho nhà thuốc tối ưu tồn kho.</p>
<h3>Quy mô và tăng trưởng</h3>
<p>GMV 2,000 tỷ đồng/năm sau 3 năm hoạt động. 8,000 nhà thuốc và 500 bệnh viện đặt hàng thường xuyên. Giúp nhà thuốc tiết kiệm trung bình 8% chi phí mua hàng. Series A 15 triệu USD từ quỹ đầu tư chuyên y tế.</p>`,
  },
  {
    title:
      'Công nghệ sản xuất thực phẩm chức năng và nutraceuticals từ nguồn nội địa',
    sectorNames: ['Dược phẩm & Công nghệ sinh học', 'Thực phẩm & Đồ uống'],
    content: `<h2>NutriTech VN - Sản Xuất Thực Phẩm Chức Năng Chất Lượng Cao Từ Nguyên Liệu Việt</h2>
<p>Công nghệ và thiết bị sản xuất thực phẩm chức năng (nutraceuticals) chuẩn GMP, từ vitamin tổng hợp, probiotic, chiết xuất thảo mộc đến collagen và omega-3, phục vụ thị trường nội địa và xuất khẩu.</p>
<h3>Thị trường thực phẩm chức năng</h3>
<p>Thị trường thực phẩm chức năng Việt Nam đạt 1.2 tỷ USD, tăng 15%/năm. 70% sản phẩm trên thị trường là nhập khẩu với giá cao. Người tiêu dùng ngày càng quan tâm sức khỏe phòng ngừa sau COVID-19. Tiêu chuẩn sản xuất thực phẩm chức năng theo Nghị định 15/2018/NĐ-CP yêu cầu GMP.</p>
<h3>Công nghệ sản xuất</h3>
<p>Dây chuyền viên nang cứng và mềm (softgel) tự động 200,000 viên/giờ. Granulation và tablet compression với kiểm soát dissolution rate. Microencapsulation cho probiotic sống sót qua dạ dày. Liposomal delivery tăng sinh khả dụng vitamin C, curcumin. Spray drying bột hòa tan từ chiết xuất thảo mộc.</p>
<h3>Kiểm soát chất lượng</h3>
<p>Kiểm tra hoạt chất bằng HPLC, ICP-MS (khoáng chất), PCR (vi sinh). Stability testing 6-24 tháng ở điều kiện thực và gia tốc. Kiểm tra vi sinh, dư lượng dung môi, kim loại nặng. Certificate of Analysis theo US Pharmacopeia, British Pharmacopeia. HACCP và GMP được kiểm định định kỳ.</p>
<h3>OEM/ODM và thương mại</h3>
<p>Nhận OEM/ODM từ minimum 3,000 đơn vị. Hỗ trợ R&D formulation, đăng ký công bố sản phẩm. Đang sản xuất cho 80+ thương hiệu trong nước và 15 đơn hàng xuất khẩu sang Mỹ, Canada, Australia.</p>`,
  },
];

export const ALL_SEEDS = [...SEEDS, ...SEEDS_EXTRA];

if (require.main === module) {
  runSectorSeed('Dược phẩm & Công nghệ sinh học', ALL_SEEDS).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
