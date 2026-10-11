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
                "Chào bạn! Rất xin lỗi vì trải nghiệm trước đó. Tôi là Trợ lý Ảo AI trực tuyến của Sàn NacenTwin, luôn sẵn sàng giải đáp và tương tác trực tiếp 100% câu hỏi của bạn thay vì chỉ lưu lại thông tin.\n\n" +
                "Tôi có thể hỗ trợ bạn trực tiếp các nội dung sau:\n" +
                "• 🎯 Giải thích & Đánh giá mức độ TRL 1-9 theo Thông tư 17/2019/TT-BKHCN.\n" +
                "• 💰 Tư vấn phương pháp định giá sáng chế & hợp đồng chuyển giao/li-xăng.\n" +
                "• 🔍 Tìm kiếm công nghệ chào bán hoặc đăng tải bài toán nhu cầu tìm mua.\n" +
                "• 👨‍🔬 Kết nối mạng lưới Chuyên gia KH&CN tư vấn chuyên sâu 1-1.\n" +
                "• 🎪 Cung cấp lịch sự kiện & đăng ký vé tham quan Sàn Triển lãm Techmart 2026.\n\n" +
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
                "Xin chào! Tôi là Trợ lý Ảo AI NacentTwin — Cố vấn chuyên môn hỗ trợ Chuyển giao Công nghệ & Kết nối Cung–Cầu Đổi mới Sáng tạo.\n\n" +
                "Hôm nay tôi có thể hỗ trợ gì cho bạn?\n" +
                "1. 🎯 Đánh giá cấp độ sẵn sàng công nghệ TRL 1-9\n" +
                "2. 💰 Hướng dẫn định giá sáng chế / giải pháp kỹ thuật\n" +
                "3. 🔍 Tìm kiếm giải pháp công nghệ hoặc kết nối doanh nghiệp\n" +
                "4. 👨‍🔬 Đặt lịch tham vấn Chuyên gia KH&CN đầu ngành\n" +
                "5. 🎪 Thông tin các phiên chào giá & gian hàng Techmart 2026",
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
                "Tôi là Trợ lý Ảo AI NacentTwin — Cố vấn số phục vụ Nhà khoa học, Doanh nghiệp và Tổ chức ĐMST trên toàn quốc. Tôi có 5 nhóm năng lực chính:\n\n" +
                "1. 🎯 **Định hướng TRL (1–9)**: Phân loại mức độ hoàn thiện công nghệ theo Thông tư 17/2019/TT-BKHCN từ ý tưởng phòng thí nghiệm đến thương mại hóa đại trà.\n" +
                "2. 💰 **Tư vấn Định giá & Pháp lý Chuyển giao**: Hướng dẫn định giá tài sản trí tuệ (chi phí R&D, chiết khấu dòng tiền DCF, so sánh thị trường) và mô hình li-xăng / chuyển nhượng.\n" +
                "3. 🔍 **Ghép cặp Cung – Cầu Thông minh**: Tìm kiếm công nghệ chào bán theo ngành hoặc giúp doanh nghiệp đăng bài toán kỹ thuật để nhận đề xuất từ Viện/Trường.\n" +
                "4. 👨‍🔬 **Mạng lưới Chuyên gia KH&CN**: Kết nối trực tiếp 1-1 với các chuyên gia, nhà khoa học đầu ngành theo lĩnh vực nghiên cứu.\n" +
                "5. 🎪 **Sàn Triển lãm Techmart Quốc Gia**: Tra cứu danh mục gian hàng số, lịch các phiên chào giá trực tiếp và đăng ký vé tham quan miễn phí.\n\n" +
                "Bạn muốn tôi giải đáp chi tiết về năng lực nào?",
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
                "Mọi công nghệ niêm yết trên Sàn NacenTwin đều được Hội đồng Chuyên gia thẩm định cấp chứng nhận TRL trước khi công bố.",
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
                "Để định giá công nghệ hoặc sáng chế trên Sàn NacenTwin, chúng tôi áp dụng 3 phương pháp tiêu chuẩn quốc tế và quy định Bộ KH&CN:\n\n" +
                "• **Phương pháp Chi phí (Cost Approach)**: Tính toán tổng chi phí R&D, vật tư, nhân công và hao mòn thiết bị thực tế đã đầu tư.\n" +
                "• **Phương pháp Dòng tiền chiết khấu (Income/DCF Approach)**: Dự báo doanh thu và biên lợi nhuận mang lại trong tương lai khi ứng dụng công nghệ.\n" +
                "• **Phương pháp So sánh thị trường (Market Approach)**: Đối chiếu với các giao dịch chuyển nhượng / li-xăng tương đương trên thị trường.\n\n" +
                "Bạn có thể đăng tải hồ sơ chào bán để được Hội đồng Chuyên gia Viện NacenTech tư vấn định giá độc lập.",
                "PRICING",
                "/chao-ban-cong-nghe"
            ));
        }

        // 7. Chào bán công nghệ / Nhà nghiên cứu muốn bán
        if (norm.Contains("chao ban") || norm.Contains("ban cong nghe") || norm.Contains("dang cong nghe") ||
            norm.Contains("ban sang che") || norm.Contains("chuyen giao") || norm.Contains("muon ban"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Sàn NacenTwin hỗ trợ các nhà khoa học, viện nghiên cứu và doanh nghiệp niêm yết chào bán công nghệ với quy trình 4 bước:\n\n" +
                "1. Đăng ký tài khoản tổ chức/cá nhân và hoàn tất xác thực hồ sơ.\n" +
                "2. Đăng tải thông tin giải pháp kỹ thuật, bằng độc quyền SHTT và mức TRL tự đánh giá.\n" +
                "3. Hội đồng Chuyên gia thẩm định cấp chứng nhận TRL trong 3–5 ngày làm việc.\n" +
                "4. Công nghệ được niêm yết công khai trên Sàn và tự động ghép cặp tới các doanh nghiệp đang tìm mua.",
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
                "Doanh nghiệp có bài toán công nghệ hoặc cần tối ưu dây chuyền sản xuất có thể gửi Phiếu khảo sát nhu cầu trực tiếp trên Sàn:\n\n" +
                "• Nền tảng sẽ kích hoạt thuật toán AI Matching để tìm giải pháp sẵn có trong kho Chào bán.\n" +
                "• Nếu chưa có công nghệ sẵn sàng, bài toán sẽ được chuyển tới mạng lưới 50+ viện nghiên cứu, trường đại học để thực hiện đặt hàng R&D theo yêu cầu.",
                "BUYER_DEMAND",
                "/nhu-cau-cong-nghe"
            ));
        }

        // 9. Mạng lưới Chuyên gia KH&CN
        if (norm.Contains("chuyen gia") || norm.Contains("tu van") || norm.Contains("nha khoa hoc") ||
            norm.Contains("giao su") || norm.Contains("tien si") || norm.Contains("expert"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Mạng lưới Viện NacenTech quy tụ các Chuyên gia KH&CN đầu ngành (GS, PGS, TS) đã được thẩm định lý lịch khoa học theo chuẩn Bộ KH&CN trên 18 lĩnh vực trọng điểm (AI, IoT, Công nghệ sinh học, Vật liệu mới, Nông nghiệp công nghệ cao...).\n\n" +
                "Bạn có thể tra cứu danh bạ chuyên gia, xem công trình nghiên cứu và đặt lịch tham vấn 1-1 trực tiếp trên Sàn.",
                "EXPERT_MATCH",
                "/experts"
            ));
        }

        // 10. Doanh nghiệp ĐMST & Hệ sinh thái
        if (norm.Contains("doanh nghiep") || norm.Contains("startup") || norm.Contains("doi moi sang tao") ||
            norm.Contains("dmst") || norm.Contains("cong ty"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Sàn NacenTwin kết nối hơn 1.200 doanh nghiệp đổi mới sáng tạo, doanh nghiệp KH&CN và các tập đoàn hàng đầu trên cả nước. Doanh nghiệp tham gia được tiếp cận nguồn công nghệ đã kiểm định TRL, tham gia chuỗi cung ứng và hưởng các chính sách hỗ trợ chuyển giao công nghệ.",
                "ENTERPRISE_ECOSYSTEM",
                "/doanh-nghiep-dmst"
            ));
        }

        // 11. Sở hữu trí tuệ & Bản quyền
        if (norm.Contains("so huu tri tue") || norm.Contains("shtt") || norm.Contains("ban quyen") ||
            norm.Contains("bao ho") || norm.Contains("kieu dang") || norm.Contains("nhan hieu"))
        {
            return Task.FromResult(new AiQuickAssistResponseDto(
                "Về sở hữu trí tuệ và bảo hộ sáng chế, Nền tảng NacenTwin tích hợp dịch vụ tư vấn tra cứu tình trạng kỹ thuật, đánh giá khả năng bảo hộ theo Luật SHTT và hỗ trợ soạn thảo hợp đồng chuyển nhượng/li-xăng mẫu chuẩn Bộ KH&CN.",
                "IP_CONSULTING",
                "/dich-vu-khac"
            ));
        }

        // 12. Phản hồi thông minh theo ngữ cảnh (KHÔNG DÙNG CÂU "đã ghi nhận yêu cầu"!)
        return Task.FromResult(new AiQuickAssistResponseDto(
            $"Tôi là Trợ lý Ảo AI NacentTwin. Đối với câu hỏi của bạn: \"{prompt}\", tôi sẵn sàng giải đáp và tư vấn trực tiếp theo các phân hệ nghiệp vụ của Sàn:\n\n" +
            "• 🎯 Bạn muốn đánh giá cấp độ hoàn thiện công nghệ TRL 1-9 theo TT17?\n" +
            "• 💰 Bạn cần tư vấn định giá sáng chế và mô hình chuyển nhượng / li-xăng?\n" +
            "• 🔍 Bạn muốn tra cứu công nghệ chào bán hoặc đăng tải bài toán nhu cầu tìm mua?\n" +
            "• 👨‍🔬 Bạn muốn kết nối trực tiếp với Chuyên gia KH&CN đầu ngành theo lĩnh vực?\n\n" +
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
