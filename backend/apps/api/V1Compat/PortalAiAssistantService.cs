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
                "Chào bạn! Hiện tại tôi đã được kết nối trực tiếp với CSDL Cổng Kết nối Công nghiệp BACLINK Bắc Ninh để truy xuất dữ liệu thật theo thời gian thực.\n\n" +
                "Khi bạn yêu cầu (ví dụ: 'tìm cố vấn tự động hóa', 'lịch sự kiện BACLINK 2026', 'thống kê sàn'), tôi sẽ tra cứu ngay trong hệ thống và đưa ra danh sách cố vấn, sự kiện kèm đường dẫn truy cập trực tiếp.\n\n" +
                "Bạn hãy thử nhập: 'tìm cố vấn tự động hóa' hoặc 'lịch sự kiện BACLINK' để trải nghiệm nhé!",
                "SUPPORT_ASSISTANCE",
                "/experts",
                [
                    new("Tìm Cố vấn Kỹ thuật", "Tra cứu danh bạ cố vấn tự động hóa, cơ khí & MES", "/experts", "CỐ VẤN"),
                    new("Sự kiện & Kết nối FDI", "Lịch hội thảo & phiên kết nối chuỗi cung ứng Bắc Ninh", "/trien-lam", "SỰ KIỆN"),
                    new("Sản phẩm & Năng lực Hội viên", "Khám phá năng lực gia công và giải pháp công nghiệp", "/chao-ban-cong-nghe", "CHÀO BÁN")
                ]
            );
        }

        // 2. TRUY XUẤT CSDL CHUYÊN GIA (EXPERT RETRIEVAL)
        if (norm.Contains("chuyen gia") || norm.Contains("co van") || norm.Contains("nha khoa hoc") || norm.Contains("giao su") ||
            norm.Contains("tien si") || norm.Contains("expert") || norm.Contains("tu van 1-1") ||
            norm.Contains("bac si") || norm.Contains("thay ") || norm.Contains("co ") ||
            norm.Contains("ten ") ||
            (norm.StartsWith("tim ") && !norm.Contains("cong nghe") && !norm.Contains("mua") && !norm.Contains("su kien") && !norm.Contains("hoi cho") && !norm.Contains("gia")) ||
            (norm.Contains("tim") && (norm.Contains("it") || norm.Contains("ai") || norm.Contains("cntt") || norm.Contains("ky su"))))
        {
            return await HandleExpertQueryAsync(prompt, norm, ct);
        }

        // 3. TRUY XUẤT CSDL SỰ KIỆN (EVENTS RETRIEVAL)
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
                $"Số liệu thực tế trên Cổng Kết nối Chuỗi cung ứng BACLINK Bắc Ninh tính đến thời điểm hiện tại:\n\n" +
                $"• 🏢 **Doanh nghiệp Hội viên**: {stats.TotalEnterprises:N0} đơn vị sản xuất công nghiệp\n" +
                $"• 👨‍🔬 **Ban Cố vấn Kỹ thuật**: {stats.TotalExperts:N0} cố vấn chuyên môn\n" +
                $"• 🔍 **Nhu cầu đặt hàng**: {stats.TotalDemands:N0} bài toán kỹ thuật & tìm nhà cung ứng\n" +
                $"• 📦 **Sản phẩm & Năng lực**: {stats.TotalOffers:N0} giải pháp sẵn sàng cung ứng\n\n" +
                "Bạn đang cần tìm đối tác cung ứng hay muốn kết nối cố vấn kỹ thuật?",
                "PORTAL_STATS",
                "/chao-ban-cong-nghe",
                [
                    new("Khám phá Sản phẩm & Năng lực", $"{stats.TotalOffers} giải pháp từ hội viên Bắc Ninh", "/chao-ban-cong-nghe", "CUNG ỨNG"),
                    new("Khám phá Nhu cầu Đặt hàng", $"{stats.TotalDemands} bài toán cần tìm đối tác giải quyết", "/nhu-cau-cong-nghe", "NHU CẦU"),
                    new("Danh bạ Ban Cố vấn Kỹ thuật", $"{stats.TotalExperts} cố vấn chuyên ngành công nghiệp", "/experts", "CỐ VẤN")
                ]
            );
        }

        // 5. Lời chào tự nhiên
        if (norm == "hi" || norm == "hello" || norm == "halo" || norm == "alo" || norm == "hey" ||
            norm.StartsWith("chao") || norm.StartsWith("xin chao") || norm == "e" || norm == "ê" ||
            norm.Contains("chao ban") || norm.Contains("chao bot") || norm.Contains("chao em"))
        {
            return new AiQuickAssistResponseDto(
                "Xin chào! Tôi là Trợ lý Ảo AI của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK) — Hỗ trợ kết nối Chuỗi cung ứng Công nghiệp & Tư vấn Kỹ thuật.\n\n" +
                "Tôi có thể hỗ trợ trực tiếp bạn:\n" +
                "• 🔍 **Tìm cố vấn kỹ thuật** theo 8 ngành công nghiệp chủ lực Bắc Ninh\n" +
                "• 🎪 **Tra cứu sự kiện & diễn đàn kết nối FDI – Nội địa**\n" +
                "• 🎯 **Tra cứu mức độ hoàn thiện công nghệ TRL (1–9)**\n" +
                "• 💰 **Tư vấn báo giá gia công OEM/ODM & hợp tác chuyển giao**\n\n" +
                "Bạn cần tôi hỗ trợ nội dung nào?",
                "GREETING",
                "/chao-ban-cong-nghe",
                [
                    new("Tìm Cố vấn Kỹ thuật", "Kết nối trực tiếp cố vấn chuyên môn 1-1", "/experts", "CỐ VẤN"),
                    new("Sự kiện Hiệp hội BACLINK", "Lịch hội thảo & kết nối chuỗi cung ứng FDI", "/trien-lam", "SỰ KIỆN"),
                    new("Sản phẩm & Năng lực", "Tra cứu năng lực sản xuất của hội viên", "/chao-ban-cong-nghe", "CUNG ỨNG")
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
                "Tôi là Trợ lý Ảo AI BACLINK — tích hợp trực tiếp với CSDL Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh:\n\n" +
                "1. 👨‍🔬 **Truy xuất Ban Cố vấn Kỹ thuật**: Tra cứu cố vấn theo 8 ngành công nghiệp (Điện tử, Cơ khí CNC, Tự động hóa, Nhựa ESD, Vật liệu, MES/ERP, ESG, Logistics) và đặt lịch tư vấn 1-1.\n" +
                "2. 🎪 **Tra cứu Sự kiện Kết nối**: Cập nhật diễn đàn FDI – Nội địa, hội thảo bán dẫn và chuyển đổi xanh tại Bắc Ninh.\n" +
                "3. 🎯 **Định hướng Mức độ Sẵn sàng Công nghệ (TRL 1–9)**: Hỗ trợ đánh giá mức độ sẵn sàng thương mại và sản xuất hàng loạt.\n" +
                "4. 💰 **Tư vấn Hợp tác OEM/ODM & Chuyển giao**: Hướng dẫn phương pháp định giá và hợp đồng hợp tác kỹ thuật.\n" +
                "5. 🔍 **Ghép cặp Cung – Cầu Chuỗi cung ứng**: Kết nối năng lực gia công của hội viên với nhu cầu đặt hàng thực tế.\n\n" +
                "Bạn muốn tôi giải đáp chi tiết về phần nào?",
                "CAPABILITIES",
                "/chao-ban-cong-nghe",
                [
                    new("Tìm Cố vấn Kỹ thuật", "Tra cứu danh bạ cố vấn thực tế", "/experts", "CỐ VẤN"),
                    new("Lịch sự kiện BACLINK", "Xem các sự kiện sắp diễn ra tại Bắc Ninh", "/trien-lam", "SỰ KIỆN"),
                    new("Khóa học E-Learning Công nghiệp", "Lean/5S, IATF 16949, MES/ERP & ESG", "/elearning", "ĐÀO TẠO")
                ]
            );
        }

        // 7. Đánh giá cấp độ TRL
        if (norm.Contains("trl") || norm.Contains("muc do san sang") || norm.Contains("thang do") ||
            norm.Contains("cap do cong nghe") || norm.Contains("prototype") || norm.Contains("nguyen mau"))
        {
            return new AiQuickAssistResponseDto(
                "Thang đo TRL (Technology Readiness Level) chuẩn hóa 9 cấp độ sẵn sàng công nghệ ứng dụng trong sản xuất công nghiệp:\n\n" +
                "• **TRL 1–3**: Nghiên cứu nguyên lý và kiểm chứng trong phòng thí nghiệm.\n" +
                "• **TRL 4–6**: Hoàn thiện mô hình thực nghiệm (PoC), chế tạo nguyên mẫu (Prototype) tại xưởng thử nghiệm.\n" +
                "• **TRL 7–8**: Thử nghiệm dây chuyền thực tế tại nhà máy, kiểm định độ bền và chứng nhận tiêu chuẩn công nghiệp.\n" +
                "• **TRL 9**: Đã vận hành thương mại ổn định, sẵn sàng cung ứng OEM/ODM hàng loạt cho chuỗi FDI.\n\n" +
                "Các hồ sơ năng lực trên Cổng BACLINK được Ban Tiêu chuẩn & Thẩm định Chất lượng rà soát minh bạch.",
                "TRL_GUIDE",
                "/chao-ban-cong-nghe",
                [
                    new("Danh mục giải pháp TRL 8-9", "Các sản phẩm & năng lực sẵn sàng cung ứng", "/chao-ban-cong-nghe", "CUNG ỨNG"),
                    new("Đào tạo Tiêu chuẩn Công nghiệp", "Các khóa học IATF 16949, ISO 9001 & Lean/5S", "/elearning", "ĐÀO TẠO")
                ]
            );
        }

        // 8. Định giá & Chuyển giao công nghệ / Hợp tác OEM
        if (norm.Contains("dinh gia") || norm.Contains("gia ban") || norm.Contains("gia mua") ||
            norm.Contains("chuyen nhuong") || norm.Contains("bao nhieu tien") || norm.Contains("chi phi") ||
            norm.Contains("li-xang") || norm.Contains("lixang") || norm.Contains("licence") ||
            norm.Contains("nano") || norm.Contains("sang che"))
        {
            return new AiQuickAssistResponseDto(
                "Để xây dựng báo giá hợp tác gia công OEM/ODM hoặc chuyển giao giải pháp kỹ thuật trên BACLINK, doanh nghiệp có thể áp dụng 3 phương pháp chuẩn:\n\n" +
                "• **Phương pháp Chi phí (Cost-Plus)**: Bóc tách định mức vật tư, giờ máy CNC/SMT, chi phí khuôn gá và quản lý chất lượng.\n" +
                "• **Phương pháp Hiệu quả Đầu tư (ROI/DCF)**: Tính toán mức tiết giảm nhân công, giảm tỷ lệ phế phẩm và nâng hiệu suất OEE tại nhà máy.\n" +
                "• **Phương pháp Tham chiếu Thị trường**: Đối chiếu đơn giá cung ứng tương đương trong các KCN Bắc Ninh.\n\n" +
                "Bạn có thể kết nối trực tiếp Ban Cố vấn Kỹ thuật BACLINK để được hỗ trợ thẩm định kỹ thuật và phương án hợp tác.",
                "PRICING",
                "/chao-ban-cong-nghe",
                [
                    new("Kết nối Cố vấn Kỹ thuật", "Ban Cố vấn Kỹ thuật Hiệp hội BACLINK tư vấn 1-1", "/experts", "TƯ VẤN"),
                    new("Dịch vụ Hỗ trợ Hội viên", "Tư vấn tiêu chuẩn FDI, MES & chuyển đổi xanh", "/dich-vu-khac", "DỊCH VỤ")
                ]
            );
        }

        // 9. Chào bán công nghệ / Năng lực sản xuất
        if (norm.Contains("chao ban") || norm.Contains("ban cong nghe") || norm.Contains("dang cong nghe") ||
            norm.Contains("ban sang che") || norm.Contains("chuyen giao") || norm.Contains("muon ban"))
        {
            return new AiQuickAssistResponseDto(
                "Cổng BACLINK hỗ trợ các doanh nghiệp hội viên Bắc Ninh niêm yết sản phẩm, thiết bị và năng lực gia công qua 4 bước:\n\n" +
                "1. Đăng nhập tài khoản Doanh nghiệp Hội viên và hoàn tất xác thực hồ sơ năng lực.\n" +
                "2. Đăng tải thông số kỹ thuật, công suất nhà máy và chứng chỉ chất lượng (ISO 9001, IATF 16949, ESD...).\n" +
                "3. Ban Thẩm định Hiệp hội BACLINK rà soát và duyệt niêm yết.\n" +
                "4. Hồ sơ được công bố trên Sàn Cung ứng và tự động ghép cặp với nhu cầu đặt hàng từ đối tác.",
                "SELLER_OFFER",
                "/chao-ban-cong-nghe",
                [
                    new("Khám phá Sàn Cung ứng", "Xem sản phẩm & năng lực sản xuất hội viên", "/chao-ban-cong-nghe", "CUNG ỨNG")
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
                "Doanh nghiệp có nhu cầu tìm nhà cung ứng nội địa hoặc giải quyết bài toán kỹ thuật nhà máy có thể đăng bài toán đặt hàng trực tiếp trên Cổng BACLINK:\n\n" +
                "• Hệ thống tự động đối khớp với năng lực sản xuất của các doanh nghiệp hội viên trong các KCN Bắc Ninh.\n" +
                "• Ban Cố vấn Kỹ thuật BACLINK hỗ trợ kết nối và đồng hành khảo sát thực tế tại phân xưởng.",
                "BUYER_DEMAND",
                "/nhu-cau-cong-nghe",
                [
                    new("Xem Nhu cầu Đặt hàng", "Các bài toán kỹ thuật & tìm nhà cung ứng tại Bắc Ninh", "/nhu-cau-cong-nghe", "ĐẶT HÀNG"),
                    new("Tra cứu Năng lực Hội viên", "Các giải pháp & dịch vụ gia công sẵn sàng", "/chao-ban-cong-nghe", "CUNG ỨNG")
                ]
            );
        }

        // 11. Phản hồi thông minh mở (Smart Fallback kèm gợi ý tương tác)
        return new AiQuickAssistResponseDto(
            $"Tôi là Trợ lý Ảo AI BACLINK. Đối với câu hỏi của bạn: \"{prompt}\", tôi sẵn sàng hỗ trợ kết nối theo các phân hệ của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh:\n\n" +
            "• 🔍 Tra cứu năng lực gia công, thiết bị công nghiệp hoặc nhu cầu đặt hàng B2B\n" +
            "• 👨‍🔬 Kết nối trực tiếp với Ban Cố vấn Kỹ thuật theo 8 ngành công nghiệp chủ lực\n" +
            "• 🎪 Xem lịch hội thảo, diễn đàn kết nối chuỗi cung ứng FDI – Nội địa tại Bắc Ninh\n" +
            "• 📚 Tham gia các khóa đào tạo thực chiến Lean/5S, IATF 16949, MES/ERP và ESG\n\n" +
            "Hãy cho tôi biết thêm chi tiết để tôi hỗ trợ cụ thể cho bạn!",
            "GENERAL_DISCOVERY",
            "/chao-ban-cong-nghe",
            [
                new("Tìm Cố vấn theo ngành", "Tra cứu Ban Cố vấn Kỹ thuật BACLINK", "/experts", "CỐ VẤN"),
                new("Sự kiện Kết nối BACLINK", "Xem lịch sự kiện công nghiệp tại Bắc Ninh", "/trien-lam", "SỰ KIỆN"),
                new("Danh bạ Doanh nghiệp Hội viên", "Tra cứu hội viên sản xuất Bắc Ninh", "/enterprises", "HỘI VIÊN")
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
                $"Rất tiếc, tôi đã tra cứu CSDL BACLINK nhưng không tìm thấy Cố vấn Kỹ thuật nào khớp với từ khóa/tên: \"{searchKeyword}\".\n\n" +
                "Bạn có thể kiểm tra lại chính tả hoặc xem toàn bộ danh bạ Ban Cố vấn Kỹ thuật Hiệp hội BACLINK tại liên kết bên dưới:",
                "EXPERT_MATCH",
                "/experts",
                [
                    new("Xem toàn bộ danh bạ Cố vấn", "Tra cứu cố vấn kỹ thuật theo 8 ngành công nghiệp", "/experts", "CỐ VẤN")
                ]
            );
        }

        // 4. Định dạng kết quả trả về
        if (matchedExperts.Count > 0)
        {
            var sb = new StringBuilder();
            if (!string.IsNullOrWhiteSpace(searchKeyword))
            {
                sb.AppendLine($"Tôi đã truy xuất CSDL BACLINK và tìm thấy {matchedExperts.Count} Cố vấn Kỹ thuật phù hợp với từ khóa \"{searchKeyword}\":\n");
            }
            else
            {
                sb.AppendLine($"Dưới đây là {matchedExperts.Count} Cố vấn Kỹ thuật tiêu biểu sẵn sàng nhận tư vấn 1-1 trên Cổng BACLINK:\n");
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
                var sectors = exp.ExpertiseSectorNames is { Count: > 0 }
                    ? string.Join(", ", exp.ExpertiseSectorNames)
                    : (exp.PrimarySectorName ?? (exp.ExpertiseSectors.Count > 0 ? string.Join(", ", exp.ExpertiseSectors) : "Công nghiệp chế tạo"));
                sb.AppendLine($"• **Lĩnh vực**: {sectors}");
                sb.AppendLine($"• **Trạng thái**: {(exp.IsAcceptingConsultation ? "🟢 Sẵn sàng nhận tham vấn 1-1" : "Thành viên Ban Cố vấn Kỹ thuật BACLINK")}");
                sb.AppendLine($"👉 [Xem chi tiết hồ sơ & Đặt lịch tư vấn](/experts/{exp.ExpertCode})\n");

                suggestions.Add(new AiSuggestionItemDto(
                    displayName,
                    $"{exp.PositionTitle ?? "Cố vấn Kỹ thuật"} — {exp.OrganizationName}",
                    $"/experts/{exp.ExpertCode}",
                    exp.PrimarySectorName ?? exp.PrimarySectorCode ?? "CỐ VẤN"
                ));
                idx++;
            }

            sb.AppendLine("Bạn có thể bấm trực tiếp vào liên kết bên dưới để xem hồ sơ chuyên môn hoặc gửi yêu cầu tư vấn kỹ thuật 1-1 ngay nhé!");

            return new AiQuickAssistResponseDto(
                sb.ToString().Trim(),
                "EXPERT_MATCH",
                matchedExperts.Count == 1 ? $"/experts/{matchedExperts[0].ExpertCode}" : "/experts",
                suggestions
            );
        }

        return new AiQuickAssistResponseDto(
            "Hiện tại hệ thống đang cập nhật hồ sơ cố vấn theo tiêu chí bạn yêu cầu. Bạn có thể tra cứu toàn bộ danh bạ Ban Cố vấn Kỹ thuật Hiệp hội BACLINK tại:",
            "EXPERT_MATCH",
            "/experts",
            [
                new("Xem danh bạ Ban Cố vấn Kỹ thuật", "Tra cứu hồ sơ cố vấn theo 8 ngành công nghiệp Bắc Ninh", "/experts", "CỐ VẤN")
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
