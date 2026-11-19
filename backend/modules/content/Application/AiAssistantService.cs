using System.Globalization;
using System.Text;

namespace NacenTech.Modules.Content.Application;

public sealed class AiAssistantService : IAiAssistantService
{
    public Task<AiQuickAssistResponseDto> QuickAssistAsync(AiQuickAssistRequestDto request, CancellationToken ct = default)
    {
        var prompt = request.Prompt?.Trim() ?? string.Empty;
        var lower = prompt.ToLowerInvariant();
        var norm = Normalize(prompt);

        // 1. Phản hồi thắc mắc / khiếu nại về việc không trả lời trực tiếp hoặc chỉ ghi nhận
        if ((norm.Contains("ghi nhan") && (norm.Contains("toan") || norm.Contains("sao") || norm.Contains("chi"))) ||
            (norm.Contains("tra loi") && (norm.Contains("sao") || norm.Contains("khong") || norm.Contains("k ") || norm.Contains("ko") || norm.Contains("chua"))) ||
            norm.Contains("sao khong noi") || norm.Contains("tra loi di") || norm.Contains("khong hieu a"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Chào bạn! Tôi là Trợ lý Ảo AI trực tuyến của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK), luôn sẵn sàng giải đáp và tương tác trực tiếp 100% câu hỏi của bạn thay vì chỉ lưu lại thông tin.\n\n" +
                "Tôi có thể hỗ trợ bạn trực tiếp các nội dung sau:\n" +
                "• 🎯 Tra cứu năng lực sản xuất 8 ngành công nghiệp trọng điểm Bắc Ninh.\n" +
                "• 🏭 Kết nối Doanh nghiệp Hội viên BACLINK tại các KCN Yên Phong, Quế Võ, VSIP, Tiên Sơn, Thuận Thành...\n" +
                "• 🔍 Tìm kiếm sản phẩm linh kiện chào bán hoặc đăng tải bài toán đặt hàng gia công B2B.\n" +
                "• 👨‍🔬 Kết nối Ban Cố vấn Kỹ thuật BACLINK tư vấn chuyên sâu 1-1.\n" +
                "• 🎪 Cung cấp lịch sự kiện & xúc tiến giao thương B2B BACLINK 2026.\n\n" +
                "Bạn đang cần giải đáp cụ thể về vấn đề nào, hãy cho tôi biết nhé!",
                "SUPPORT_ASSISTANCE",
                "/chao-ban-cong-nghe"
            ));
        }

        // 2. Lời chào tự nhiên
        if (norm == "hi" || norm == "hello" || norm == "halo" || norm == "alo" || norm == "hey" ||
            norm.StartsWith("chao") || norm.StartsWith("xin chao") || norm == "e" || norm == "ê" ||
            norm.Contains("chao ban") || norm.Contains("chao bot") || norm.Contains("chao em"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Xin chào! Tôi là Trợ lý Ảo AI BACLINK — Cố vấn hỗ trợ Kết nối Chuỗi Cung Ứng & Sản Xuất Công Nghiệp Tỉnh Bắc Ninh.\n\n" +
                "Hôm nay tôi có thể hỗ trợ gì cho bạn?\n" +
                "1. 🎯 Tra cứu sản phẩm & năng lực gia công của Doanh nghiệp Hội viên BACLINK\n" +
                "2. 🏭 Đăng bài toán đặt hàng gia công hoặc tìm nhà cung ứng cấp 1, cấp 2 FDI\n" +
                "3. 🔍 Đánh giá năng lực nhà máy & CĐS theo Thông tư 17/2019/TT-BKHCN\n" +
                "4. 👨‍🔬 Đặt lịch tham vấn Ban Cố vấn Kỹ thuật BACLINK\n" +
                "5. 🎪 Thông tin xúc tiến giao thương B2B và sự kiện kết nối công nghiệp Bắc Ninh",
                "GREETING",
                "/chao-ban-cong-nghe"
            ));
        }

        // 3. Hỏi năng lực & chức năng của trợ lý
        if ((norm.Contains("lam") && (norm.Contains("duoc") || norm.Contains("dc")) && (norm.Contains("gi") || norm.Contains("nhung gi") || norm.Contains("cai gi"))) ||
            norm.Contains("ban la ai") || norm.Contains("may la ai") || norm.Contains("chuc nang") || norm.Contains("tinh nang") ||
            norm.Contains("giup gi") || norm.Contains("giup duoc gi") || norm.Contains("ho tro gi") || norm.Contains("nang luc") ||
            norm.Contains("biet lam gi") || norm == "help" || norm == "tro ly la ai")
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Tôi là Trợ lý Ảo AI BACLINK — Cố vấn số của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh. Tôi có 5 nhóm năng lực chính:\n\n" +
                "1. 🎯 **Chuỗi Cung Ứng 8 Ngành Trọng Điểm**: Kết nối cung cầu Điện tử, Bán dẫn, Cơ khí chính xác, Tự động hóa, Nhựa kỹ thuật, Công nghệ số, Logistics, Vật liệu mới.\n" +
                "2. 🏭 **Bản Đồ KCN Bắc Ninh**: Định vị doanh nghiệp hội viên tại 13 KCN (Yên Phong, Quế Võ, VSIP, Tiên Sơn, Gia Bình, Thuận Thành...).\n" +
                "3. 🔍 **Đánh Giá Năng Lực Nhà Máy**: Khảo sát cấp độ TRL 1-9 và 5 nhóm tiêu chí THIOC phục vụ audit nhà máy từ các tập đoàn FDI lớn.\n" +
                "4. 👨‍🔬 **Ban Cố Vấn Kỹ Thuật**: Kết nối 1-1 với các chuyên gia kỹ thuật và giảng viên đào tạo Lean/5S, IATF 16949, MES, ESG.\n" +
                "5. 🎪 **Xúc Tiến Thương Mại B2B**: Lịch sự kiện kết nối cung cầu, hội thảo công nghiệp và ký kết MOU số.",
                "CAPABILITIES",
                "/chao-ban-cong-nghe"
            ));
        }

        // 4. Sự kiện & Phiên chào giá Techmart
        if (norm.Contains("techmart") || norm.Contains("trien lam") || norm.Contains("hoi cho") ||
            norm.Contains("phien chao gia") || norm.Contains("su kien") || norm.Contains("gian hang") ||
            norm.Contains("ve tham quan") || norm.Contains("dang ky tham gia"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Sàn Triển Lãm & Phiên Chào Giá Công Nghệ Techmart Quốc Gia 2026 đang diễn ra:\n\n" +
                "• **Địa điểm Trực tiếp**: Cung Văn Hóa Hữu Nghị Việt Xô (Hà Nội) & SECC (TP.HCM).\n" +
                "• **Khu vực Trực tuyến**: Gian hàng số 3D/VR, phòng pitching chào giá trực tiếp giữa bên Bán và bên Mua.\n" +
                "• **Quyền lợi**: Đăng ký nhận vé tham quan miễn phí, tiếp cận hồ sơ thể lệ & TRL chi tiết của hơn 40+ công nghệ tiêu biểu.",
                "TECHMART_EVENTS",
                "/trien-lam"
            ));
        }

        // 5. Đánh giá cấp độ TRL theo Thông tư 17
        if (norm.Contains("trl") || norm.Contains("thong tu 17") || norm.Contains("tt17") ||
            norm.Contains("muc do san sang") || norm.Contains("thang do") || norm.Contains("cap do cong nghe") ||
            norm.Contains("prototype") || norm.Contains("nguyen mau"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Thang đo TRL (Technology Readiness Level) theo Thông tư 17/2019/TT-BKHCN chuẩn hóa 9 cấp độ sẵn sàng công nghệ:\n\n" +
                "• **TRL 1–3**: Nghiên cứu cơ bản, phát hiện nguyên lý và kiểm chứng trong phòng thí nghiệm.\n" +
                "• **TRL 4–6**: Hoàn thiện mô hình thực nghiệm (PoC), chế tạo nguyên mẫu (Prototype) trong môi trường mô phỏng / bán công nghiệp.\n" +
                "• **TRL 7–8**: Thử nghiệm hệ thống hoàn chỉnh tại hiện trường thực tế, kiểm định độ bền và chứng nhận chất lượng.\n" +
                "• **TRL 9**: Đã thương mại hóa hoàn chỉnh, sẵn sàng sản xuất hàng loạt và chuyển giao đại trà.\n\n" +
                "Mọi sản phẩm và công nghệ niêm yết trên Cổng BACLINK đều được Ban Cố vấn Kỹ thuật thẩm định hồ sơ năng lực nhà máy trước khi công bố.",
                "TRL_GUIDE",
                "/dich-vu-khac"
            ));
        }

        // 6. Định giá & Chuyển giao công nghệ / Sáng chế
        if (norm.Contains("dinh gia") || norm.Contains("gia ban") || norm.Contains("gia mua") ||
            norm.Contains("chuyen nhuong") || norm.Contains("bao nhieu tien") || norm.Contains("chi phi") ||
            norm.Contains("li-xang") || norm.Contains("lixang") || norm.Contains("licence") ||
            norm.Contains("nano") || norm.Contains("sang che"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Để định giá công nghệ hoặc hợp đồng gia công chuỗi cung ứng trên Cổng BACLINK, chúng tôi áp dụng 3 phương pháp tiêu chuẩn:\n\n" +
                "• **Phương pháp Chi phí (Cost Approach)**: Tính toán tổng chi phí R&D, vật tư, nhân công và khấu hao dây chuyền sản xuất thực tế.\n" +
                "• **Phương pháp Dòng tiền chiết khấu (Income/DCF Approach)**: Dự báo doanh thu và biên lợi nhuận mang lại khi ứng dụng công nghệ vào nhà máy.\n" +
                "• **Phương pháp So sánh thị trường (Market Approach)**: Đối chiếu với các giao dịch chuyển nhượng / gia công tương đương trong các KCN Bắc Ninh.\n\n" +
                "Bạn có thể đăng tải hồ sơ để được Ban Cố vấn Kỹ thuật BACLINK tư vấn định giá độc lập.",
                "PRICING",
                "/chao-ban-cong-nghe"
            ));
        }

        // 7. Chào bán công nghệ / Nhà nghiên cứu muốn bán
        if (norm.Contains("chao ban") || norm.Contains("ban cong nghe") || norm.Contains("dang cong nghe") ||
            norm.Contains("ban sang che") || norm.Contains("chuyen giao") || norm.Contains("muon ban"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Cổng BACLINK hỗ trợ các doanh nghiệp hội viên và nhà khoa học niêm yết chào bán sản phẩm & năng lực với quy trình 4 bước:\n\n" +
                "1. Đăng ký tài khoản Doanh nghiệp Hội viên BACLINK và hoàn tất xác thực hồ sơ.\n" +
                "2. Đăng tải thông tin giải pháp kỹ thuật, năng lực dây chuyền và chứng chỉ nhà máy (ISO, IATF 16949, ESD).\n" +
                "3. Ban Cố vấn Kỹ thuật thẩm định hồ sơ năng lực trong 3–5 ngày làm việc.\n" +
                "4. Sản phẩm/năng lực được niêm yết công khai và tự động ghép cặp tới các đối tác FDI đang tìm mua.",
                "SELLER_OFFER",
                "/chao-ban-cong-nghe"
            ));
        }

        // 8. Nhu cầu công nghệ / Doanh nghiệp đặt hàng bài toán
        if (norm.Contains("tim mua") || norm.Contains("nhu cau") || norm.Contains("dat hang") ||
            norm.Contains("bai toan") || norm.Contains("can tim") || norm.Contains("can ") ||
            norm.Contains("muon mua") || norm.Contains("tim cong nghe") || norm.Contains("tim giai phap") ||
            norm.Contains("giai phap"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Doanh nghiệp có bài toán tìm kiếm nhà cung ứng hoặc tối ưu dây chuyền sản xuất có thể gửi Phiếu khảo sát nhu cầu trực tiếp trên Cổng BACLINK:\n\n" +
                "• Nền tảng kích hoạt Radar AI Matching tìm kiếm nhà cung ứng phù hợp trong mạng lưới Hội viên BACLINK.\n" +
                "• Nếu chưa có nhà máy đáp ứng, bài toán sẽ được chuyển tới Ban Cố vấn Kỹ thuật và mạng lưới viện trường để hỗ trợ cải tiến quy trình.",
                "BUYER_DEMAND",
                "/nhu-cau-cong-nghe"
            ));
        }

        // 9. Mạng lưới Chuyên gia KH&CN
        if (norm.Contains("chuyen gia") || norm.Contains("tu van") || norm.Contains("nha khoa hoc") ||
            norm.Contains("giao su") || norm.Contains("tien si") || norm.Contains("expert"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Ban Cố vấn Kỹ thuật BACLINK quy tụ các chuyên gia đầu ngành (GS, PGS, TS, Kỹ sư trưởng) chuyên sâu về tự động hóa, cơ khí chính xác, vật liệu mới, chuyển đổi số MES/ERP, Lean/5S và ESG kiểm kê khí nhà kính.\n\n" +
                "Bạn có thể tra cứu danh bạ chuyên gia, xem hồ sơ năng lực và đặt lịch tham vấn 1-1 trực tiếp trên Cổng.",
                "EXPERT_MATCH",
                "/experts"
            ));
        }

        // 10. Doanh nghiệp ĐMST & Hệ sinh thái
        if (norm.Contains("doanh nghiep") || norm.Contains("startup") || norm.Contains("doi moi sang tao") ||
            norm.Contains("dmst") || norm.Contains("cong ty"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Hiệp hội BACLINK quy tụ mạng lưới các doanh nghiệp sản xuất công nghiệp, công nghiệp hỗ trợ tại các KCN trọng điểm tỉnh Bắc Ninh. Doanh nghiệp tham gia được tiếp cận chuỗi cung ứng FDI, tham gia các chương trình đào tạo chuyển đổi số và nâng cao năng lực nhà máy.",
                "ENTERPRISE_ECOSYSTEM",
                "/doanh-nghiep-dmst"
            ));
        }

        // 11. Sở hữu trí tuệ & Bản quyền
        if (norm.Contains("so huu tri tue") || norm.Contains("shtt") || norm.Contains("ban quyen") ||
            norm.Contains("bao ho") || norm.Contains("kieu dang") || norm.Contains("nhan hieu"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Về sở hữu trí tuệ và bảo hộ sáng chế, Cổng BACLINK tích hợp dịch vụ tư vấn tra cứu tình trạng kỹ thuật, đánh giá khả năng bảo hộ theo Luật SHTT và hỗ trợ ký kết biên bản ghi nhớ hợp tác MOU số có chứng thực.",
                "IP_CONSULTING",
                "/dich-vu-khac"
            ));
        }

        // 12. Phản hồi thông minh theo ngữ cảnh (KHÔNG DÙNG CÂU "đã ghi nhận yêu cầu"!)
        return Task.FromResult(new AiQuickAssistResponseDto(
            $"Tôi là Trợ lý Ảo AI BACLINK. Đối với câu hỏi của bạn: \"{prompt}\", tôi sẵn sàng giải đáp và tư vấn trực tiếp theo các phân hệ của Hiệp hội:\n\n" +
            "• 🎯 Bạn muốn tra cứu năng lực sản xuất 8 ngành công nghiệp trọng điểm Bắc Ninh?\n" +
            "• 🏭 Bạn cần tìm nhà cung ứng linh kiện hoặc đăng bài toán đặt hàng gia công B2B?\n" +
            "• 🔍 Bạn muốn đánh giá năng lực nhà máy & chuyển đổi số theo Thông tư 17?\n" +
            "• 👨‍🔬 Bạn muốn kết nối trực tiếp với Ban Cố vấn Kỹ thuật BACLINK?\n\n" +
            "Hãy cho tôi biết thêm chi tiết để tôi tư vấn cụ thể cho bạn!",
            "GENERAL_DISCOVERY",
            "/chao-ban-cong-nghe"
        ));
    }

    private static string Normalize(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var normalized = text.ToLowerInvariant().Trim();
        var decomposed = normalized.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in decomposed)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(ch);
            }
        }
        return sb.ToString()
            .Normalize(NormalizationForm.FormC)
            .Replace("đ", "d");
    }
}
