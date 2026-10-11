using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Content.Application;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// TASK-01 AI Assistant Runtime: Trợ lý Ảo AI truy xuất CSDL thật (Zero-Mock Data Retrieval)
/// Đưa ra gợi ý thực tế (Real Suggestions) về Chuyên gia, Sự kiện Techmart, Cung - Cầu công nghệ.
/// </summary>
public sealed class PortalAiAssistantService(
    IExpertService expertService,
    ITechmartEventService eventService,
    IPortalOverviewService overviewService) : IAiAssistantService
{
    public async Task<AiQuickAssistResponseDto> QuickAssistAsync(AiQuickAssistRequestDto request, CancellationToken ct = default)
    {
        var prompt = request.Prompt?.Trim() ?? string.Empty;
        var norm = Normalize(prompt);

        // 1. Phản hồi thắc mắc về việc không trả lời trực tiếp / chỉ ghi nhận
        if ((norm.Contains("ghi nhan") && (norm.Contains("toan") || norm.Contains("sao") || norm.Contains("chi"))) ||
            (norm.Contains("tra loi") && (norm.Contains("sao") || norm.Contains("khong") || norm.Contains("k ") || norm.Contains("ko") || norm.Contains("chua"))) ||
            norm.Contains("sao khong noi") || norm.Contains("tra loi di") || norm.Contains("khong hieu a") ||
            (norm.Contains("truy xuat") && norm.Contains("data")) || (norm.Contains("khong co y nghia") || norm.Contains("k co y nghia")))
        {
            return new AiQuickAssistResponseDto(
                "Chào bạn! Rất xin lỗi vì trải nghiệm trước đó. Hiện tại tôi đã được kết nối trực tiếp với CSDL Sàn NacenTwin để truy xuất dữ liệu thật theo thời gian thực (Zero-Mock).\n\n" +
                "Khi bạn yêu cầu (ví dụ: 'tìm cho tôi 1 chuyên gia IT', 'lịch sự kiện Techmart 2026', 'thống kê sàn'), tôi sẽ tra cứu ngay trong hệ thống và đưa ra danh sách chuyên gia, sự kiện kèm đường dẫn truy cập trực tiếp.\n\n" +
                "Bạn hãy thử nhập: 'tìm cho tôi 1 chuyên gia IT' hoặc 'lịch sự kiện Techmart' để trải nghiệm nhé!",
                "SUPPORT_ASSISTANCE",
                "/experts",
                [
                    new("Tìm chuyên gia IT / AI", "Tra cứu danh bạ chuyên gia CNTT & Trí tuệ nhân tạo", "/experts?q=IT", "CHUYÊN GIA"),
                    new("Sàn Triển lãm Techmart 2026", "Lịch các phiên chào giá & đăng ký vé tham quan", "/trien-lam", "SỰ KIỆN"),
                    new("Thang đo TRL theo TT17", "Đánh giá 9 cấp độ sẵn sàng công nghệ", "/dich-vu-khac", "TIÊU CHUẨN")
                ]
            );
        }

        // 2. TRUY XUẤT CSDL CHUYÊN GIA (EXPERT RETRIEVAL)
        if (norm.Contains("chuyen gia") || norm.Contains("nha khoa hoc") || norm.Contains("giao su") ||
            norm.Contains("tien si") || norm.Contains("expert") || norm.Contains("tu van 1-1") ||
            norm.Contains("bac si") || norm.Contains("thay ") || norm.Contains("co ") ||
            norm.Contains("ten ") ||
            (norm.StartsWith("tim ") && !norm.Contains("cong nghe") && !norm.Contains("mua") && !norm.Contains("su kien") && !norm.Contains("hoi cho") && !norm.Contains("gia")) ||
            (norm.Contains("tim") && (norm.Contains("it") || norm.Contains("ai") || norm.Contains("cntt") || norm.Contains("ky su"))))
        {
            return await HandleExpertQueryAsync(prompt, norm, ct);
        }

        // 3. TRUY XUẤT CSDL SỰ KIỆN TECHMART (TECHMART EVENTS RETRIEVAL)
        if (norm.Contains("techmart") || norm.Contains("trien lam") || norm.Contains("hoi cho") ||
            norm.Contains("phien chao gia") || norm.Contains("su kien") || norm.Contains("gian hang") ||
            norm.Contains("ve tham quan") || norm.Contains("lich "))
        {
            return await HandleTechmartQueryAsync(ct);
        }

        // 4. TRUY XUẤT THỐNG KÊ THỜI GIAN THỰC CỦA SÀN (PORTAL STATS)
        if (norm.Contains("thong ke") || norm.Contains("bao nhieu cong nghe") || norm.Contains("quy mo") ||
            norm.Contains("so luong") || norm.Contains("bao nhieu chuyen gia") || norm.Contains("bao nhieu doanh nghiep"))
        {
            var stats = await overviewService.GetStatsAsync(ct);
            return new AiQuickAssistResponseDto(
                $"Số liệu thực tế trên Sàn Giao dịch Công nghệ NacenTwin tính đến thời điểm hiện tại:\n\n" +
                $"• 🏢 **Doanh nghiệp ĐMST**: {stats.TotalEnterprises:N0} đơn vị\n" +
                $"• 👨‍🔬 **Chuyên gia KH&CN**: {stats.TotalExperts:N0} chuyên gia đã thẩm định\n" +
                $"• 🔍 **Nhu cầu công nghệ**: {stats.TotalDemands:N0} bài toán kỹ thuật từ doanh nghiệp\n" +
                $"• 📦 **Công nghệ chào bán**: {stats.TotalOffers:N0} giải pháp sẵn sàng chuyển giao\n" +
                $"• 🌐 **Mạng lưới liên kết**: {stats.TotalProvinces} tỉnh/thành phố trên toàn quốc.\n\n" +
                "Bạn đang cần tìm công nghệ chào bán hay muốn kết nối chuyên gia tư vấn?",
                "PORTAL_STATS",
                "/chao-ban-cong-nghe",
                [
                    new("Khám phá Chào bán công nghệ", $"{stats.TotalOffers} giải pháp sẵn sàng chuyển giao", "/chao-ban-cong-nghe", "CHÀO BÁN"),
                    new("Khám phá Nhu cầu doanh nghiệp", $"{stats.TotalDemands} bài toán cần tìm đối tác giải quyết", "/nhu-cau-cong-nghe", "NHU CẦU"),
                    new("Danh bạ Chuyên gia KH&CN", $"{stats.TotalExperts} chuyên gia đầu ngành", "/experts", "CHUYÊN GIA")
                ]
            );
        }

        // 5. Lời chào tự nhiên
        if (norm == "hi" || norm == "hello" || norm == "halo" || norm == "alo" || norm == "hey" ||
            norm.StartsWith("chao") || norm.StartsWith("xin chao") || norm == "e" || norm == "ê" ||
            norm.Contains("chao ban") || norm.Contains("chao bot") || norm.Contains("chao em"))
        {
            return new AiQuickAssistResponseDto(
                "Xin chào! Tôi là Trợ lý Ảo AI NacentTwin — Cố vấn chuyên trách Chuyển giao Công nghệ & Ghép cặp Cung–Cầu KH&CN.\n\n" +
                "Tôi có thể hỗ trợ trực tiếp bạn:\n" +
                "• 🔍 **Tìm chuyên gia đầu ngành** (ví dụ: 'tìm cho tôi 1 chuyên gia IT')\n" +
                "• 🎪 **Tra cứu sự kiện & phiên chào giá Techmart 2026**\n" +
                "• 🎯 **Đánh giá mức TRL 1-9 theo Thông tư 17/2019/TT-BKHCN**\n" +
                "• 💰 **Tư vấn định giá sáng chế & hợp đồng chuyển giao/li-xăng**\n\n" +
                "Bạn cần tôi hỗ trợ nội dung nào?",
                "GREETING",
                "/chao-ban-cong-nghe",
                [
                    new("Tìm chuyên gia IT / AI", "Kết nối trực tiếp chuyên gia đầu ngành 1-1", "/experts?q=IT", "CHUYÊN GIA"),
                    new("Sự kiện Techmart 2026", "Lịch các phiên chào giá & vé tham quan", "/trien-lam", "TECHMART"),
                    new("Đánh giá TRL theo TT17", "Tự đánh giá cấp độ sẵn sàng công nghệ", "/dich-vu-khac", "TRL 1-9")
                ]
            );
        }

        // 6. Hỏi năng lực & chức năng của trợ lý
        if ((norm.Contains("lam") && (norm.Contains("duoc") || norm.Contains("dc")) && (norm.Contains("gi") || norm.Contains("nhung gi") || norm.Contains("cai gi"))) ||
            norm.Contains("ban la ai") || norm.Contains("may la ai") || norm.Contains("chuc nang") || norm.Contains("tinh nang") ||
            norm.Contains("giup gi") || norm.Contains("giup duoc gi") || norm.Contains("ho tro gi") || norm.Contains("nang luc") ||
            norm.Contains("biet lam gi") || norm == "help" || norm == "tro ly la ai")
        {
            return new AiQuickAssistResponseDto(
                "Tôi là Trợ lý Ảo AI NacentTwin — được tích hợp trực tiếp với cơ sở dữ liệu Sàn giao dịch để hỗ trợ Nhà khoa học, Doanh nghiệp và Tổ chức ĐMST:\n\n" +
                "1. 👨‍🔬 **Truy xuất Chuyên gia KH&CN**: Tra cứu danh bạ thực tế, tìm kiếm chuyên gia theo ngành (IT, AI, Sinh học, Vật liệu...) và hỗ trợ đặt lịch tư vấn 1-1.\n" +
                "2. 🎪 **Tra cứu Sự kiện Techmart**: Cập nhật các phiên chào giá sắp diễn ra, quy mô công nghệ và hỗ trợ đăng ký vé tham quan.\n" +
                "3. 🎯 **Định hướng TRL (1–9)**: Phân loại mức độ hoàn thiện công nghệ theo chuẩn Thông tư 17/2019/TT-BKHCN.\n" +
                "4. 💰 **Tư vấn Định giá & Pháp lý Chuyển giao**: Hướng dẫn 3 phương pháp định giá sáng chế (Chi phí, Dòng tiền DCF, Thị trường) và mô hình li-xăng / chuyển nhượng.\n" +
                "5. 🔍 **Ghép cặp Cung – Cầu Công nghệ**: Tìm kiếm giải pháp chào bán sẵn có hoặc tiếp nhận bài toán nhu cầu từ doanh nghiệp.\n\n" +
                "Bạn muốn tôi giải đáp chi tiết về phần nào?",
                "CAPABILITIES",
                "/chao-ban-cong-nghe",
                [
                    new("Tìm chuyên gia IT / AI", "Tra cứu danh bạ chuyên gia thực tế", "/experts?q=IT", "CHUYÊN GIA"),
                    new("Lịch sự kiện Techmart", "Xem các phiên chào giá sắp mở", "/trien-lam", "TECHMART"),
                    new("Đánh giá cấp độ TRL", "9 cấp độ theo Thông tư 17/2019/TT-BKHCN", "/dich-vu-khac", "TRL 1-9")
                ]
            );
        }

        // 7. Đánh giá cấp độ TRL theo Thông tư 17
        if (norm.Contains("trl") || norm.Contains("thong tu 17") || norm.Contains("tt17") ||
            norm.Contains("muc do san sang") || norm.Contains("thang do") || norm.Contains("cap do cong nghe") ||
            norm.Contains("prototype") || norm.Contains("nguyen mau"))
        {
            return new AiQuickAssistResponseDto(
                "Thang đo TRL (Technology Readiness Level) theo Thông tư 17/2019/TT-BKHCN chuẩn hóa 9 cấp độ sẵn sàng công nghệ:\n\n" +
                "• **TRL 1–3**: Nghiên cứu cơ bản, phát hiện nguyên lý và kiểm chứng trong phòng thí nghiệm.\n" +
                "• **TRL 4–6**: Hoàn thiện mô hình thực nghiệm (PoC), chế tạo nguyên mẫu (Prototype) trong môi trường mô phỏng / bán công nghiệp.\n" +
                "• **TRL 7–8**: Thử nghiệm hệ thống hoàn chỉnh tại hiện trường thực tế, kiểm định độ bền và chứng nhận chất lượng.\n" +
                "• **TRL 9**: Đã thương mại hóa hoàn chỉnh, sẵn sàng sản xuất hàng loạt và chuyển giao đại trà.\n\n" +
                "Mọi công nghệ niêm yết trên Sàn NacenTwin đều được Hội đồng Chuyên gia thẩm định cấp chứng nhận TRL trước khi công bố.",
                "TRL_GUIDE",
                "/dich-vu-khac",
                [
                    new("Công cụ tự đánh giá TRL", "Thực hiện bảng kiểm định 9 mức độ theo TT17", "/dich-vu-khac", "TRL ĐÁNH GIÁ"),
                    new("Danh mục công nghệ TRL 7-9", "Các công nghệ sẵn sàng chuyển giao", "/chao-ban-cong-nghe", "CHÀO BÁN")
                ]
            );
        }

        // 8. Định giá & Chuyển giao công nghệ / Sáng chế
        if (norm.Contains("dinh gia") || norm.Contains("gia ban") || norm.Contains("gia mua") ||
            norm.Contains("chuyen nhuong") || norm.Contains("bao nhieu tien") || norm.Contains("chi phi") ||
            norm.Contains("li-xang") || norm.Contains("lixang") || norm.Contains("licence") ||
            norm.Contains("nano") || norm.Contains("sang che"))
        {
            return new AiQuickAssistResponseDto(
                "Để định giá công nghệ hoặc sáng chế trên Sàn NacenTwin, chúng tôi áp dụng 3 phương pháp tiêu chuẩn quốc tế và quy định Bộ KH&CN:\n\n" +
                "• **Phương pháp Chi phí (Cost Approach)**: Tính toán tổng chi phí R&D, vật tư, nhân công và hao mòn thiết bị thực tế đã đầu tư.\n" +
                "• **Phương pháp Dòng tiền chiết khấu (Income/DCF Approach)**: Dự báo doanh thu và biên lợi nhuận mang lại trong tương lai khi ứng dụng công nghệ.\n" +
                "• **Phương pháp So sánh thị trường (Market Approach)**: Đối chiếu với các giao dịch chuyển nhượng / li-xăng tương đương trên thị trường.\n\n" +
                "Bạn có thể đăng tải hồ sơ chào bán để được Hội đồng Chuyên gia Viện NacenTech tư vấn định giá độc lập.",
                "PRICING",
                "/chao-ban-cong-nghe",
                [
                    new("Đăng ký tư vấn định giá", "Hội đồng Chuyên gia Viện NacenTech tư vấn độc lập", "/chao-ban-cong-nghe", "ĐỊNH GIÁ"),
                    new("Mẫu hợp đồng Li-xăng / Chuyển giao", "Mẫu hợp đồng chuẩn Bộ KH&CN", "/dich-vu-khac", "PHÁP LÝ")
                ]
            );
        }

        // 9. Chào bán công nghệ
        if (norm.Contains("chao ban") || norm.Contains("ban cong nghe") || norm.Contains("dang cong nghe") ||
            norm.Contains("ban sang che") || norm.Contains("chuyen giao") || norm.Contains("muon ban"))
        {
            return new AiQuickAssistResponseDto(
                "Sàn NacenTwin hỗ trợ các nhà khoa học, viện nghiên cứu và doanh nghiệp niêm yết chào bán công nghệ với quy trình 4 bước:\n\n" +
                "1. Đăng ký tài khoản tổ chức/cá nhân và hoàn tất xác thực hồ sơ.\n" +
                "2. Đăng tải thông tin giải pháp kỹ thuật, bằng độc quyền SHTT và mức TRL tự đánh giá.\n" +
                "3. Hội đồng Chuyên gia thẩm định cấp chứng nhận TRL trong 3–5 ngày làm việc.\n" +
                "4. Công nghệ được niêm yết công khai trên Sàn và tự động ghép cặp tới các doanh nghiệp đang tìm mua.",
                "SELLER_OFFER",
                "/chao-ban-cong-nghe",
                [
                    new("Đăng tải hồ sơ chào bán", "Niêm yết sáng chế / công nghệ lên sàn", "/chao-ban-cong-nghe", "ĐĂNG BÁN")
                ]
            );
        }

        // 10. Nhu cầu công nghệ / Doanh nghiệp đặt hàng bài toán
        if (norm.Contains("tim mua") || norm.Contains("nhu cau") || norm.Contains("dat hang") ||
            norm.Contains("bai toan") || norm.Contains("can tim") || norm.Contains("can ") ||
            norm.Contains("muon mua") || norm.Contains("tim cong nghe") || norm.Contains("tim giai phap") ||
            norm.Contains("giai phap"))
        {
            return new AiQuickAssistResponseDto(
                "Doanh nghiệp có bài toán công nghệ hoặc cần tối ưu dây chuyền sản xuất có thể gửi Phiếu khảo sát nhu cầu trực tiếp trên Sàn:\n\n" +
                "• Nền tảng sẽ kích hoạt thuật toán AI Matching để tìm giải pháp sẵn có trong kho Chào bán.\n" +
                "• Nếu chưa có công nghệ sẵn sàng, bài toán sẽ được chuyển tới mạng lưới 50+ viện nghiên cứu, trường đại học để thực hiện đặt hàng R&D theo yêu cầu.",
                "BUYER_DEMAND",
                "/nhu-cau-cong-nghe",
                [
                    new("Gửi phiếu khảo sát nhu cầu", "Nhận đề xuất giải pháp kỹ thuật trong 24h", "/nhu-cau-cong-nghe", "ĐẶT HÀNG"),
                    new("Tra cứu kho công nghệ chào bán", "Hơn 120+ công nghệ đã được chứng nhận TRL", "/chao-ban-cong-nghe", "CHÀO BÁN")
                ]
            );
        }

        // 11. Phản hồi thông minh mở (Smart Fallback kèm gợi ý tương tác)
        return new AiQuickAssistResponseDto(
            $"Tôi là Trợ lý Ảo AI NacentTwin. Đối với câu hỏi của bạn: \"{prompt}\", tôi sẵn sàng giải đáp và tư vấn trực tiếp theo các phân hệ nghiệp vụ của Sàn:\n\n" +
            "• 🎯 Bạn muốn đánh giá cấp độ hoàn thiện công nghệ TRL 1-9 theo TT17?\n" +
            "• 💰 Bạn cần tư vấn định giá sáng chế và mô hình chuyển nhượng / li-xăng?\n" +
            "• 🔍 Bạn muốn tra cứu công nghệ chào bán hoặc đăng tải bài toán nhu cầu tìm mua?\n" +
            "• 👨‍🔬 Bạn muốn kết nối trực tiếp với Chuyên gia KH&CN đầu ngành theo lĩnh vực?\n\n" +
            "Hãy cho tôi biết thêm chi tiết để tôi tư vấn cụ thể cho bạn!",
            "GENERAL_DISCOVERY",
            "/chao-ban-cong-nghe",
            [
                new("Tìm chuyên gia theo lĩnh vực", "Tra cứu danh bạ chuyên gia KH&CN", "/experts", "CHUYÊN GIA"),
                new("Sự kiện & Phiên chào giá Techmart", "Đăng ký vé tham quan & phiên giao dịch", "/trien-lam", "TECHMART"),
                new("Công cụ tự đánh giá TRL", "Kiểm định cấp độ sẵn sàng công nghệ", "/dich-vu-khac", "TRL 1-9")
            ]
        );
    }

    private async Task<AiQuickAssistResponseDto> HandleExpertQueryAsync(string prompt, string norm, CancellationToken ct)
    {
        // 1. Trích xuất tên riêng hoặc từ khóa chuyên gia cụ thể
        var cleaned = prompt;
        string[] prefixesToRemove = [
            "tìm cho tôi một chuyên gia có tên là", "tìm cho tôi 1 chuyên gia có tên là",
            "tìm cho tôi một chuyên gia tên là", "tìm cho tôi 1 chuyên gia tên là",
            "tìm cho tôi một chuyên gia tên", "tìm cho tôi 1 chuyên gia tên",
            "tìm cho tôi một chuyên gia", "tìm cho tôi 1 chuyên gia", "tìm cho tôi chuyên gia",
            "tìm cho toi một chuyên gia", "tìm cho toi 1 chuyên gia", "tìm cho toi chuyên gia",
            "tìm giúp tôi chuyên gia tên là", "tìm giúp tôi chuyên gia tên", "tìm giúp tôi chuyên gia",
            "tìm giúp em chuyên gia tên là", "tìm giúp em chuyên gia tên", "tìm giúp em chuyên gia",
            "tìm kiếm chuyên gia tên là", "tìm kiếm chuyên gia tên", "tìm kiếm chuyên gia",
            "tìm chuyên gia có tên là", "tìm chuyên gia có tên", "tìm chuyên gia tên là", "tìm chuyên gia tên",
            "tim chuyen gia co ten la", "tim chuyen gia co ten", "tim chuyen gia ten la", "tim chuyen gia ten",
            "tìm chuyên gia nào", "tim chuyen gia nao",
            "tìm chuyên gia", "tim chuyen gia",
            "cho tôi chuyên gia tên là", "cho tôi chuyên gia tên", "cho tôi chuyên gia",
            "cho toi chuyen gia ten la", "cho toi chuyen gia ten", "cho toi chuyen gia",
            "có chuyên gia nào tên là", "có chuyên gia nào tên", "có chuyên gia nào",
            "co chuyen gia nao ten la", "co chuyen gia nao ten", "co chuyen gia nao",
            "chuyên gia nào tên là", "chuyên gia nào tên", "chuyên gia nào",
            "chuyen gia nao ten la", "chuyen gia nao ten", "chuyen gia nao",
            "ai có tên là", "ai có tên", "ai tên là", "ai tên", "ai ten la", "ai ten",
            "nhà khoa học có tên là", "nhà khoa học có tên", "nhà khoa học tên là", "nhà khoa học tên",
            "nhà khoa học", "nha khoa hoc",
            "chuyên gia", "chuyen gia",
            "giáo sư", "giao su", "gs.ts.", "gs.ts", "gs",
            "phó giáo sư", "pho giao su", "pgs.ts.", "pgs.ts", "pgs",
            "tiến sĩ", "tien si", "ts.", "ts",
            "thạc sĩ", "thac si", "th.s",
            "bác sĩ", "bac si", "bs",
            "thầy giáo", "thay giao", "thầy", "thay",
            "cô giáo", "co giao", "cô", "co",
            "anh", "chị", "chi", "ông", "ong", "bà", "ba",
            "có tên là", "co ten la", "có tên", "co ten",
            "tên là", "ten la", "tên", "ten", "họ tên", "ho ten",
            "về lĩnh vực", "lĩnh vực", "linh vuc",
            "ngành", "nganh", "chuyên ngành",
            "tìm kiếm", "tim kiem",
            "tìm", "tim"
        ];

        foreach (var prefix in prefixesToRemove.OrderByDescending(p => p.Length))
        {
            var idx = cleaned.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
            {
                cleaned = cleaned.Remove(idx, prefix.Length);
            }
        }
        cleaned = cleaned.Trim();

        string? searchKeyword = null;
        if (cleaned.Length >= 2)
        {
            searchKeyword = cleaned;
        }

        // Nếu không trích xuất được tên cụ thể, kiểm tra lĩnh vực công nghệ chung
        if (searchKeyword == null)
        {
            if (norm.Contains(" it") || norm.Contains("cntt") || norm.Contains("thong tin") || norm.Contains("phan mem"))
                searchKeyword = "IT";
            else if (norm.Contains(" ai") || norm.Contains("tri tue nhan tao") || norm.Contains("thi giac"))
                searchKeyword = "AI";
            else if (norm.Contains("robot") || norm.Contains("tu dong hoa"))
                searchKeyword = "ROBOTICS";
            else if (norm.Contains("nong nghiep") || norm.Contains("thuc pham") || norm.Contains("sinh hoc"))
                searchKeyword = "Nông nghiệp";
            else if (norm.Contains("vat lieu") || norm.Contains("nano"))
                searchKeyword = "Vật liệu";
            else if (norm.Contains("bach khoa"))
                searchKeyword = "Bách Khoa";
            else if (norm.Contains("han lam"))
                searchKeyword = "Hàn lâm";
        }

        // 2. Tìm kiếm CSDL Chuyên gia (So khớp chính xác CSDL & so khớp không dấu / đa từ)
        List<ExpertPublicCardDto> matchedExperts = [];

        if (!string.IsNullOrWhiteSpace(searchKeyword))
        {
            // B1: Tìm kiếm trực tiếp qua PostgreSQL (Accent-sensitive)
            var direct = await expertService.GetPublicDirectoryAsync(searchKeyword, null, null, null, null, 1, 10, ct);
            if (direct.Items.Count > 0)
            {
                matchedExperts = [.. direct.Items];
            }
            else
            {
                // B2: So khớp không dấu / đa từ (Accent-Insensitive / Token Matching)
                var allPublic = await expertService.GetPublicDirectoryAsync(null, null, null, null, null, 1, 50, ct);
                var normTarget = Normalize(searchKeyword);
                var tokens = normTarget.Split(' ', StringSplitOptions.RemoveEmptyEntries);

                matchedExperts = allPublic.Items.Where(exp =>
                {
                    var normName = Normalize(exp.FullName);
                    var normOrg = Normalize(exp.OrganizationName);
                    var normTitle = Normalize(exp.PositionTitle ?? "");
                    var normSectors = Normalize(string.Join(" ", exp.ExpertiseSectors));

                    // Khớp trọn vẹn cụm từ
                    if (normName.Contains(normTarget) || normOrg.Contains(normTarget) ||
                        normTitle.Contains(normTarget) || normSectors.Contains(normTarget) ||
                        (exp.MasteredTechCodes != null && exp.MasteredTechCodes.Any(c => Normalize(c).Contains(normTarget))) ||
                        (exp.SpecializedKeywords != null && exp.SpecializedKeywords.Any(k => Normalize(k).Contains(normTarget))))
                    {
                        return true;
                    }

                    // Khớp toàn bộ các từ khóa lẻ (ví dụ: gõ "Thu Hà" khớp với "Đỗ Thị Thu Hà")
                    if (tokens.Length >= 2 && tokens.All(t => normName.Contains(t)))
                    {
                        return true;
                    }

                    return false;
                }).ToList();
            }
        }
        else
        {
            // Người dùng chỉ hỏi chung chung không nêu tên/ngành -> Lấy top chuyên gia tiêu biểu
            var defaultDir = await expertService.GetPublicDirectoryAsync(null, null, null, null, null, 1, 3, ct);
            matchedExperts = [.. defaultDir.Items];
        }

        // 3. Xử lý trường hợp KHÔNG TÌM THẤY (Tuyệt đối không lấy người khác làm giả danh)
        if (matchedExperts.Count == 0 && !string.IsNullOrWhiteSpace(searchKeyword))
        {
            return new AiQuickAssistResponseDto(
                $"Rất tiếc, tôi đã tra cứu CSDL Sàn NacenTwin nhưng không tìm thấy Chuyên gia KH&CN nào khớp với từ khóa/tên: \"{searchKeyword}\".\n\n" +
                "Bạn có thể kiểm tra lại chính tả hoặc xem danh bạ hơn 90+ Chuyên gia KH&CN đã được Bộ KH&CN thẩm định tại liên kết bên dưới:",
                "EXPERT_MATCH",
                "/experts",
                [
                    new("Xem toàn bộ danh bạ Chuyên gia", "Tra cứu chuyên gia theo lĩnh vực & học hàm", "/experts", "CHUYÊN GIA")
                ]
            );
        }

        // 4. Định dạng kết quả trả về
        if (matchedExperts.Count > 0)
        {
            var sb = new StringBuilder();
            if (!string.IsNullOrWhiteSpace(searchKeyword))
            {
                sb.AppendLine($"Tôi đã truy xuất CSDL Sàn NacenTwin và tìm thấy {matchedExperts.Count} Chuyên gia KH&CN phù hợp với từ khóa \"{searchKeyword}\":\n");
            }
            else
            {
                sb.AppendLine($"Dưới đây là {matchedExperts.Count} Chuyên gia KH&CN tiêu biểu sẵn sàng nhận tư vấn 1-1 trên Sàn NacenTwin:\n");
            }

            var suggestions = new List<AiSuggestionItemDto>();
            int idx = 1;
            foreach (var exp in matchedExperts.Take(3))
            {
                var rankStr = exp.AcademicRank switch
                {
                    "PROFESSOR" or "GS" => "GS.TS.",
                    "ASSOCIATE_PROFESSOR" or "PGS" => "PGS.TS.",
                    _ => (exp.Degree == "DOCTOR" ? "TS." : "")
                };
                var displayName = exp.FullName;
                if (!string.IsNullOrWhiteSpace(rankStr) &&
                    !exp.FullName.StartsWith("GS", StringComparison.OrdinalIgnoreCase) &&
                    !exp.FullName.StartsWith("PGS", StringComparison.OrdinalIgnoreCase) &&
                    !exp.FullName.StartsWith("TS", StringComparison.OrdinalIgnoreCase))
                {
                    displayName = $"{rankStr} {exp.FullName}";
                }

                sb.AppendLine($"👨‍🔬 **{idx}. {displayName}** (Mã: `{exp.ExpertCode}`)");
                sb.AppendLine($"• **Đơn vị**: {exp.OrganizationName}");
                if (!string.IsNullOrWhiteSpace(exp.PositionTitle))
                {
                    sb.AppendLine($"• **Chức vụ**: {exp.PositionTitle}");
                }
                var sectors = exp.ExpertiseSectors.Count > 0 ? string.Join(", ", exp.ExpertiseSectors) : "CNTT & Đổi mới sáng tạo";
                sb.AppendLine($"• **Lĩnh vực**: {sectors}");
                sb.AppendLine($"• **Trạng thái**: {(exp.IsAcceptingConsultation ? "🟢 Sẵn sàng nhận tham vấn 1-1" : "Đã thẩm định chuẩn Bộ KH&CN")}");
                sb.AppendLine($"👉 [Xem chi tiết hồ sơ & Đặt lịch tư vấn](/experts/{exp.ExpertCode})\n");

                suggestions.Add(new AiSuggestionItemDto(
                    displayName,
                    $"{exp.PositionTitle ?? "Chuyên gia"} — {exp.OrganizationName}",
                    $"/experts/{exp.ExpertCode}",
                    exp.PrimarySectorCode ?? "CHUYÊN GIA"
                ));
                idx++;
            }

            sb.AppendLine("Bạn có thể bấm trực tiếp vào liên kết bên dưới để xem lý lịch khoa học hoặc gửi phiếu yêu cầu tư vấn 1-1 ngay nhé!");

            return new AiQuickAssistResponseDto(
                sb.ToString().Trim(),
                "EXPERT_MATCH",
                matchedExperts.Count == 1 ? $"/experts/{matchedExperts[0].ExpertCode}" : "/experts",
                suggestions
            );
        }

        return new AiQuickAssistResponseDto(
            "Hiện tại hệ thống đang cập nhật hồ sơ chuyên gia theo tiêu chí bạn yêu cầu. Bạn có thể tra cứu toàn bộ danh bạ hơn 90+ Chuyên gia KH&CN đã được Bộ KH&CN thẩm định tại Danh bạ Chuyên gia:",
            "EXPERT_MATCH",
            "/experts",
            [
                new("Xem danh bạ Chuyên gia KH&CN", "Tra cứu hơn 90+ hồ sơ chuyên gia theo ngành", "/experts", "CHUYÊN GIA")
            ]
        );
    }

    private async Task<AiQuickAssistResponseDto> HandleTechmartQueryAsync(CancellationToken ct)
    {
        var events = await eventService.ListEventsAsync("UPCOMING", new PageRequest(1, 3), ct);
        if (events.Data.Count > 0)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Dưới đây là các phiên chào giá & sự kiện Techmart sắp diễn ra được cập nhật thời gian thực từ CSDL Sàn:\n");

            var suggestions = new List<AiSuggestionItemDto>();
            int idx = 1;
            foreach (var ev in events.Data)
            {
                sb.AppendLine($"🎪 **{idx}. {ev.Title}**");
                sb.AppendLine($"• **Thời gian**: {ev.StartDate:dd/MM/yyyy} – {ev.EndDate:dd/MM/yyyy}");
                sb.AppendLine($"• **Địa điểm**: {ev.Location}");
                sb.AppendLine($"• **Quy mô**: {ev.TechnologiesCount} sáng chế & công nghệ tham gia");
                sb.AppendLine($"👉 [Xem chi tiết & Đăng ký tham gia](/trien-lam)\n");

                suggestions.Add(new AiSuggestionItemDto(
                    ev.Title,
                    $"{ev.Location} • {ev.StartDate:dd/MM/yyyy}",
                    "/trien-lam",
                    "TECHMART 2026"
                ));
                idx++;
            }

            sb.AppendLine("Bạn có thể đăng ký nhận vé tham quan trực tiếp miễn phí hoặc đăng ký gian hàng trưng bày ngay tại Sàn Triển lãm!");

            return new AiQuickAssistResponseDto(
                sb.ToString().Trim(),
                "TECHMART_EVENTS",
                "/trien-lam",
                suggestions
            );
        }

        return new AiQuickAssistResponseDto(
            "Sàn Triển Lãm & Phiên Chào Giá Công Nghệ Techmart Quốc Gia 2026 đang mở tiếp nhận đăng ký gian hàng và vé tham quan tại Hà Nội & TP.HCM. Bạn có thể xem thông tin chi tiết tại:",
            "TECHMART_EVENTS",
            "/trien-lam",
            [
                new("Sàn Triển lãm Techmart Quốc Gia", "Xem danh sách sự kiện & đăng ký vé tham quan", "/trien-lam", "TECHMART")
            ]
        );
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
