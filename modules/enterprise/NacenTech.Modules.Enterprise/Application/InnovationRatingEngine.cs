using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Application;

public class InnovationEvaluationCalculationResult
{
    public decimal TotalScore { get; set; }
    public string Classification { get; set; } = "UNRATED";
    public string ClassificationLabel { get; set; } = "Chưa đánh giá";
    public string BadgeName { get; set; } = "Chưa xếp hạng";
    public List<InnovationGroupScoreDto> GroupScores { get; set; } = [];
    public List<RadarAxisDto> RadarChartData { get; set; } = [];
    public List<InnovationCriteriaDetailDto> CriteriaDetails { get; set; } = [];
}

public static class InnovationRatingEngine
{
    public static InnovationEvaluationCalculationResult Calculate(
        Domain.Enterprise enterprise,
        string? surveyAnswersJson = null,
        bool hasMachineryUpgrade = false,
        bool hasTechTraining = false)
    {
        using var jsonDoc = ParseJsonSafe(surveyAnswersJson);
        var root = jsonDoc?.RootElement;

        var criteria = new List<InnovationCriteriaDetailDto>();

        // 1. Quản trị ĐMST (QT - 12đ)
        decimal scoreQT1 = CalculateQT1(enterprise, root);
        decimal scoreQT2 = CalculateQT2(enterprise, root);
        decimal scoreQT3 = CalculateQT3(root);
        decimal scoreQT4 = CalculateQT4(root);
        decimal totalQT = Math.Min(12.0m, scoreQT1 + scoreQT2 + scoreQT3 + scoreQT4);

        criteria.Add(new("QT1", "Kế hoạch/ngân sách ĐMST", 4.0m, scoreQT1, "C15"));
        criteria.Add(new("QT2", "Bộ phận/nhân sự ĐMST", 3.0m, scoreQT2, "C12"));
        criteria.Add(new("QT3", "Nền tảng quản trị", 2.0m, scoreQT3, "C16"));
        criteria.Add(new("QT4", "Đổi mới quản trị/tổ chức", 3.0m, scoreQT4, "C20"));

        // 2. R&D và Công nghệ (CN - 18đ)
        decimal scoreCN1 = CalculateCN1(root);
        decimal scoreCN2 = CalculateCN2(enterprise, hasMachineryUpgrade, root);
        decimal scoreCN3 = CalculateCN3(root);
        decimal scoreCN4 = CalculateCN4(root);
        decimal scoreCN5 = CalculateCN5(root);
        decimal totalCN = Math.Min(18.0m, scoreCN1 + scoreCN2 + scoreCN3 + scoreCN4 + scoreCN5);

        criteria.Add(new("CN1", "Hoạt động R&D nội bộ", 5.0m, scoreCN1, "C22"));
        criteria.Add(new("CN2", "Đầu tư nâng cấp công nghệ", 4.0m, scoreCN2, "C14"));
        criteria.Add(new("CN3", "Mua công nghệ bên ngoài", 3.0m, scoreCN3, "C22"));
        criteria.Add(new("CN4", "Tiếp nhận/chuyển giao công nghệ", 4.0m, scoreCN4, "C22"));
        criteria.Add(new("CN5", "Kết quả công nghệ đạt được", 2.0m, scoreCN5, "C31"));

        // 3. Sản phẩm / Quy trình (SP - 20đ)
        decimal scoreSP1 = CalculateSP1(root);
        decimal scoreSP2 = CalculateSP2(root);
        decimal scoreSP3 = CalculateSP3(root);
        decimal scoreSP4 = CalculateSP4(root);
        decimal scoreSP5 = CalculateSP5(root);
        decimal totalSP = Math.Min(20.0m, scoreSP1 + scoreSP2 + scoreSP3 + scoreSP4 + scoreSP5);

        criteria.Add(new("SP1", "Sản phẩm/dịch vụ mới", 5.0m, scoreSP1, "C17"));
        criteria.Add(new("SP2", "Cải tiến đáng kể SP/DV", 4.0m, scoreSP2, "C18"));
        criteria.Add(new("SP3", "Đổi mới quy trình sản xuất/vận hành", 5.0m, scoreSP3, "C19"));
        criteria.Add(new("SP4", "Kết quả ĐMST rõ rệt", 3.0m, scoreSP4, "C32"));
        criteria.Add(new("SP5", "Hiệu quả thực tế", 3.0m, scoreSP5, "C23+C34"));

        // 4. Sở hữu trí tuệ (IP - 10đ)
        decimal scoreIP1 = CalculateIP1(enterprise, root);
        decimal scoreIP2 = CalculateIP2(root);
        decimal scoreIP3 = CalculateIP3(root);
        decimal totalIP = Math.Min(10.0m, scoreIP1 + scoreIP2 + scoreIP3);

        criteria.Add(new("IP1", "Tài sản trí tuệ đăng ký", 5.0m, scoreIP1, "C31"));
        criteria.Add(new("IP2", "Bí quyết kỹ thuật / Trade secrets", 3.0m, scoreIP2, "C31"));
        criteria.Add(new("IP3", "Khai thác & thương mại hóa SHTT", 2.0m, scoreIP3, "Tự kê khai"));

        // 5. Chuyển đổi số (S - 10đ)
        decimal scoreS1 = CalculateS1(root);
        decimal scoreS2 = CalculateS2(root);
        decimal scoreS3 = CalculateS3(root);
        decimal scoreS4 = CalculateS4(root);
        decimal scoreS5 = CalculateS5(root);
        decimal totalS = Math.Min(10.0m, scoreS1 + scoreS2 + scoreS3 + scoreS4 + scoreS5);

        criteria.Add(new("S1", "Chiến lược chuyển đổi số", 2.0m, scoreS1, "C24"));
        criteria.Add(new("S2", "Mức độ chuyển đổi số tự đánh giá", 2.0m, scoreS2, "C25"));
        criteria.Add(new("S3", "Phạm vi số hóa các khâu", 2.0m, scoreS3, "C26"));
        criteria.Add(new("S4", "Ứng dụng công nghệ số tiên tiến", 3.0m, scoreS4, "C27"));
        criteria.Add(new("S5", "Quản trị vận hành số", 1.0m, scoreS5, "C16"));

        // 6. Thị trường (TT - 15đ)
        decimal scoreTT1 = CalculateTT1(root);
        decimal scoreTT2 = CalculateTT2(root);
        decimal scoreTT3 = CalculateTT3(root);
        decimal scoreTT4 = CalculateTT4(enterprise, root);
        decimal scoreTT5 = CalculateTT5(enterprise, root);
        decimal scoreTT6 = CalculateTT6(root);
        decimal totalTT = Math.Min(15.0m, scoreTT1 + scoreTT2 + scoreTT3 + scoreTT4 + scoreTT5 + scoreTT6);

        criteria.Add(new("TT1", "Doanh thu từ SP mới/cải tiến", 5.0m, scoreTT1, "C33"));
        criteria.Add(new("TT2", "Đổi mới thị trường & Marketing", 2.0m, scoreTT2, "C21"));
        criteria.Add(new("TT3", "Tác động kinh tế từ ĐMST", 3.0m, scoreTT3, "C34"));
        criteria.Add(new("TT4", "Năng lực xuất khẩu", 2.0m, scoreTT4, "C35"));
        criteria.Add(new("TT5", "Tham gia chuỗi giá trị", 2.0m, scoreTT5, "C36"));
        criteria.Add(new("TT6", "Vị thế thị trường từ ĐMST", 1.0m, scoreTT6, "C32+C34"));

        // 7. Nhân lực (NL - 7đ)
        decimal scoreNL1 = CalculateNL1(enterprise, root);
        decimal scoreNL2 = CalculateNL2(enterprise, root);
        decimal scoreNL3 = CalculateNL3(enterprise, hasTechTraining, root);
        decimal totalNL = Math.Min(7.0m, scoreNL1 + scoreNL2 + scoreNL3);

        criteria.Add(new("NL1", "Trình độ học vấn lao động", 2.0m, scoreNL1, "C11"));
        criteria.Add(new("NL2", "Nhân sự chuyên trách công nghệ/ĐMST", 3.0m, scoreNL2, "C12"));
        criteria.Add(new("NL3", "Đào tạo bồi dưỡng công nghệ", 2.0m, scoreNL3, "C13"));

        // 8. Liên kết (LK - 8đ)
        decimal scoreLK1 = CalculateLK1(root);
        decimal scoreLK2 = CalculateLK2(root);
        decimal scoreLK3 = CalculateLK3(root);
        decimal scoreLK4 = CalculateLK4(root);
        decimal scoreLK5 = CalculateLK5(root);
        decimal scoreLK6 = CalculateLK6(root);
        decimal totalLK = Math.Min(8.0m, scoreLK1 + scoreLK2 + scoreLK3 + scoreLK4 + scoreLK5 + scoreLK6);

        criteria.Add(new("LK1", "Liên kết Viện nghiên cứu / Trường ĐH", 2.0m, scoreLK1, "C28"));
        criteria.Add(new("LK2", "Hợp tác Doanh nghiệp trong ngành", 1.0m, scoreLK2, "C28"));
        criteria.Add(new("LK3", "Hợp tác Tổ chức hỗ trợ ĐMST", 1.0m, scoreLK3, "C28"));
        criteria.Add(new("LK4", "Tiếp cận Nguồn vốn / Quỹ đầu tư", 1.0m, scoreLK4, "C28+C30"));
        criteria.Add(new("LK5", "Hợp tác Cơ quan Nhà nước", 1.0m, scoreLK5, "C28+C29"));
        criteria.Add(new("LK6", "Hợp tác Quốc tế", 2.0m, scoreLK6, "C28"));

        var groups = new List<InnovationGroupScoreDto>
        {
            new("QT", "Quản trị", 12.0m, totalQT, Math.Round(totalQT / 12.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("QT")).ToList()),
            new("CN", "R&D và Công nghệ", 18.0m, totalCN, Math.Round(totalCN / 18.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("CN")).ToList()),
            new("SP", "Sản phẩm / Quy trình", 20.0m, totalSP, Math.Round(totalSP / 20.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("SP")).ToList()),
            new("IP", "Sở hữu trí tuệ", 10.0m, totalIP, Math.Round(totalIP / 10.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("IP")).ToList()),
            new("S",  "Chuyển đổi số", 10.0m, totalS, Math.Round(totalS / 10.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("S")).ToList()),
            new("TT", "Thị trường", 15.0m, totalTT, Math.Round(totalTT / 15.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("TT")).ToList()),
            new("NL", "Nhân lực", 7.0m, totalNL, Math.Round(totalNL / 7.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("NL")).ToList()),
            new("LK", "Liên kết", 8.0m, totalLK, Math.Round(totalLK / 8.0m * 100, 1), criteria.Where(c => c.CriteriaCode.StartsWith("LK")).ToList())
        };

        var radar = new List<RadarAxisDto>
        {
            new("Quản trị", totalQT, 12.0m, 100),
            new("R&D & CN", totalCN, 18.0m, 100),
            new("SP / Quy trình", totalSP, 20.0m, 100),
            new("Sở hữu trí tuệ", totalIP, 10.0m, 100),
            new("Chuyển đổi số", totalS, 10.0m, 100),
            new("Thị trường", totalTT, 15.0m, 100),
            new("Nhân lực", totalNL, 7.0m, 100),
            new("Liên kết", totalLK, 8.0m, 100)
        };

        decimal rawTotal = totalQT + totalCN + totalSP + totalIP + totalS + totalTT + totalNL + totalLK;
        decimal totalScore = Math.Round(Math.Min(100.0m, Math.Max(0.0m, rawTotal)), 1);

        // Kiểm tra UNRATED: Nếu không có survey answers và không có hoạt động R&D/SHTT
        bool hasAnyData = root.HasValue || enterprise.HasRdUnit || enterprise.HasRdBudget || 
                          enterprise.IntellectualProperties.Count > 0 || enterprise.IsExporting || 
                          enterprise.InValueChain || !string.IsNullOrWhiteSpace(enterprise.HighQualificationRatio);

        if (!hasAnyData || totalScore == 0.0m)
        {
            return new InnovationEvaluationCalculationResult
            {
                TotalScore = 0.0m,
                Classification = "UNRATED",
                ClassificationLabel = "Chưa đánh giá",
                BadgeName = "Chưa xếp hạng",
                GroupScores = groups,
                RadarChartData = radar,
                CriteriaDetails = criteria
            };
        }

        string classification;
        string label;
        string badge;

        if (totalScore >= 75.0m)
        {
            classification = "LEADING";
            label = "Dẫn đầu";
            badge = "Huy hiệu Vàng ĐMST";
        }
        else if (totalScore >= 50.0m)
        {
            classification = "DEVELOPING";
            label = "Đang phát triển";
            badge = "Huy hiệu Bạc ĐMST";
        }
        else
        {
            classification = "POTENTIAL";
            label = "Tiềm năng";
            badge = "Huy hiệu Đồng ĐMST";
        }

        return new InnovationEvaluationCalculationResult
        {
            TotalScore = totalScore,
            Classification = classification,
            ClassificationLabel = label,
            BadgeName = badge,
            GroupScores = groups,
            RadarChartData = radar,
            CriteriaDetails = criteria
        };
    }

    #region Criteria Calculators

    // QT1 (4đ - C15): Có ngân sách R&D cố định: 4đ; Có nhưng không cố định: 2đ; Chưa có: 0đ
    private static decimal CalculateQT1(Domain.Enterprise enterprise, JsonElement? root)
    {
        if (enterprise.HasRdBudget && enterprise.RdBudgetAmount > 0) return 4.0m;
        if (enterprise.HasRdBudget) return 4.0m;

        if (root.HasValue)
        {
            if (TryGetBool(root.Value, "c15_has_rd_budget", "has_rd_budget")) return 4.0m;
            var str = TryGetString(root.Value, "rd_budget_status", "c15_rd_budget_status") ?? "";
            if (str.Contains("cố định", StringComparison.OrdinalIgnoreCase)) return 4.0m;
            if (str.Contains("có", StringComparison.OrdinalIgnoreCase)) return 2.0m;
        }

        return 0.0m;
    }

    // QT2 (3đ - C12): Có bộ phận chuyên trách: 3đ; Nhân sự kiêm nhiệm: 1.5đ; Không có: 0đ
    private static decimal CalculateQT2(Domain.Enterprise enterprise, JsonElement? root = null)
    {
        if (enterprise.HasRdUnit) return 3.0m;
        if (root.HasValue && TryGetBool(root.Value, "c12_has_rd_unit", "has_rd_unit")) return 3.0m;
        if (enterprise.RdPersonnelCount.HasValue && enterprise.RdPersonnelCount.Value > 0) return 1.5m;
        return 0.0m;
    }

    // QT3 (2đ - C16): >= 2 nền tảng: 2đ; 1 nền tảng: 1đ; Không: 0đ
    private static decimal CalculateQT3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var platforms = ExtractStringArray(root.Value, "c16_governance_platforms", "governance_platforms");
        var valid = platforms.Where(p => !p.Equals("Khác", StringComparison.OrdinalIgnoreCase) && 
                                         !p.Equals("Không", StringComparison.OrdinalIgnoreCase) &&
                                         !p.Contains("Chưa áp dụng", StringComparison.OrdinalIgnoreCase)).ToList();
        if (valid.Count >= 2) return 2.0m;
        if (valid.Count == 1 || platforms.Count >= 2) return 1.0m;
        return 0.0m;
    }

    // QT4 (3đ - C20): Đổi mới quản trị/tổ chức trong 3 năm: 3đ
    private static decimal CalculateQT4(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetBool(root.Value, "c20_org_innovation", "org_innovation")) return 3.0m;
        if (root.Value.TryGetProperty("innovation_activities", out var act) && 
            act.ValueKind == JsonValueKind.Object &&
            act.TryGetProperty("organization", out var org) && 
            (org.GetString() == "Có" || org.ValueKind == JsonValueKind.True))
        {
            return 3.0m;
        }
        return 0.0m;
    }

    // CN1 (5đ - C22): Tự thực hiện hoạt động R&D nội bộ
    private static decimal CalculateCN1(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c22_tech_acquisition", "tech_acquisition");
        if (list.Any(x => x.Contains("R&D", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("nội bộ", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("tự nghiên cứu", StringComparison.OrdinalIgnoreCase)))
        {
            return 5.0m;
        }
        return 0.0m;
    }

    // CN2 (4đ - C14): Đầu tư máy móc/công nghệ mới trong 3 năm
    private static decimal CalculateCN2(Domain.Enterprise enterprise, bool hasMachineryUpgrade, JsonElement? root = null)
    {
        if (hasMachineryUpgrade) return 4.0m;
        if (root.HasValue && TryGetBool(root.Value, "c14_has_machinery_upgrade", "has_machinery_upgrade")) return 4.0m;
        return 0.0m;
    }

    // CN3 (3đ - C22): Mua công nghệ bên ngoài (bí quyết, bản quyền, máy móc mới)
    private static decimal CalculateCN3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c22_tech_acquisition", "tech_acquisition");
        if (list.Any(x => x.Contains("Mua", StringComparison.OrdinalIgnoreCase)))
        {
            return 3.0m;
        }
        return 0.0m;
    }

    // CN4 (4đ - C22): Tiếp nhận/chuyển giao công nghệ từ Viện/Trường/Đối tác
    private static decimal CalculateCN4(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c22_tech_acquisition", "tech_acquisition");
        if (list.Any(x => x.Contains("Chuyển giao", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("Viện", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Trường", StringComparison.OrdinalIgnoreCase)))
        {
            return 4.0m;
        }
        return 0.0m;
    }

    // CN5 (2đ - C31): Kết quả công nghệ đạt được (giải pháp kỹ thuật, quy trình mới)
    private static decimal CalculateCN5(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c32_innovation_results", "innovation_results", "c31_ip_assets", "ip_assets");
        if (list.Any(x => !x.Equals("Không có", StringComparison.OrdinalIgnoreCase) && 
                          !x.Contains("Chưa", StringComparison.OrdinalIgnoreCase) &&
                          (x.Contains("Quy trình", StringComparison.OrdinalIgnoreCase) || 
                           x.Contains("giải pháp", StringComparison.OrdinalIgnoreCase) ||
                           x.Contains("kỹ thuật", StringComparison.OrdinalIgnoreCase) ||
                           x.Contains("Sáng chế", StringComparison.OrdinalIgnoreCase) ||
                           x.Contains("Giải pháp hữu ích", StringComparison.OrdinalIgnoreCase) ||
                           x.Contains("bảo hộ SHTT", StringComparison.OrdinalIgnoreCase))))
        {
            return 2.0m;
        }
        return 0.0m;
    }

    // SP1 (5đ - C17): Sản phẩm/dịch vụ mới
    private static decimal CalculateSP1(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetBool(root.Value, "c17_new_products", "new_products")) return 5.0m;
        if (root.Value.TryGetProperty("innovation_activities", out var act) && 
            act.ValueKind == JsonValueKind.Object &&
            act.TryGetProperty("new_product", out var val) && 
            (val.GetString() == "Có" || val.ValueKind == JsonValueKind.True))
        {
            return 5.0m;
        }
        return 0.0m;
    }

    // SP2 (4đ - C18): Cải tiến đáng kể SP/DV
    private static decimal CalculateSP2(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetBool(root.Value, "c18_improved_products", "improved_products")) return 4.0m;
        if (root.Value.TryGetProperty("innovation_activities", out var act) && 
            act.ValueKind == JsonValueKind.Object &&
            act.TryGetProperty("improved_product", out var val) && 
            (val.GetString() == "Có" || val.ValueKind == JsonValueKind.True))
        {
            return 4.0m;
        }
        return 0.0m;
    }

    // SP3 (5đ - C19): Đổi mới quy trình sản xuất/vận hành
    private static decimal CalculateSP3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetBool(root.Value, "c19_process_innovation", "process_innovation")) return 5.0m;
        if (root.Value.TryGetProperty("innovation_activities", out var act) && 
            act.ValueKind == JsonValueKind.Object &&
            act.TryGetProperty("process", out var val) && 
            (val.GetString() == "Có" || val.ValueKind == JsonValueKind.True))
        {
            return 5.0m;
        }
        return 0.0m;
    }

    // SP4 (3đ - C32): Kết quả ĐMST rõ rệt (>= 2: 3đ; 1: 1.5đ)
    private static decimal CalculateSP4(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c32_innovation_results", "innovation_results")
            .Where(x => !x.Equals("Không có", StringComparison.OrdinalIgnoreCase) && !x.Contains("Chưa", StringComparison.OrdinalIgnoreCase)).ToList();
        if (list.Count >= 2) return 3.0m;
        if (list.Count == 1) return 1.5m;
        return 0.0m;
    }

    // SP5 (3đ - C23+C34): Hiệu quả thực tế (tăng năng suất, giảm chi phí: >=2: 3đ, 1: 1.5đ)
    private static decimal CalculateSP5(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c23_impact_outcomes", "c34_recorded_impacts", "recorded_impacts");
        var valid = list.Where(x => x.Contains("năng suất", StringComparison.OrdinalIgnoreCase) || 
                                    x.Contains("chi phí", StringComparison.OrdinalIgnoreCase) ||
                                    x.Contains("chất lượng", StringComparison.OrdinalIgnoreCase) ||
                                    x.Contains("doanh thu", StringComparison.OrdinalIgnoreCase) ||
                                    x.Contains("lợi nhuận", StringComparison.OrdinalIgnoreCase)).ToList();
        if (valid.Count >= 2) return 3.0m;
        if (valid.Count == 1 || list.Count >= 2) return 1.5m;
        return 0.0m;
    }

    // IP1 (5đ - C31 & Entity IntellectualProperties): Sáng chế/GPHI: 5đ; Nhãn hiệu/Kiểu dáng: 3đ
    private static decimal CalculateIP1(Domain.Enterprise enterprise, JsonElement? root)
    {
        var ips = enterprise.IntellectualProperties ?? [];
        if (ips.Any(x => x.Type.Contains("PATENT", StringComparison.OrdinalIgnoreCase) || 
                         x.Type.Contains("Sáng chế", StringComparison.OrdinalIgnoreCase) ||
                         x.Type.Contains("Giải pháp hữu ích", StringComparison.OrdinalIgnoreCase)))
        {
            return 5.0m;
        }

        if (ips.Count > 0) return 3.0m;

        if (root.HasValue)
        {
            var list = ExtractStringArray(root.Value, "c31_ip_assets", "ip_assets");
            if (list.Any(x => x.Contains("Sáng chế", StringComparison.OrdinalIgnoreCase) || 
                              x.Contains("Giải pháp hữu ích", StringComparison.OrdinalIgnoreCase)))
            {
                return 5.0m;
            }
            if (list.Any(x => !x.Equals("Không có", StringComparison.OrdinalIgnoreCase) && 
                              !x.Contains("Chưa", StringComparison.OrdinalIgnoreCase) &&
                              (x.Contains("Nhãn hiệu", StringComparison.OrdinalIgnoreCase) || 
                               x.Contains("Kiểu dáng", StringComparison.OrdinalIgnoreCase) ||
                               x.Contains("Bản quyền", StringComparison.OrdinalIgnoreCase))))
            {
                return 3.0m;
            }
        }

        return 0.0m;
    }

    // IP2 (3đ - C31): Bí quyết kỹ thuật / Trade secrets / Phần mềm nội bộ
    private static decimal CalculateIP2(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c31_ip_assets", "ip_assets");
        if (list.Any(x => x.Contains("Bí quyết", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("Phần mềm", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Trade Secrets", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Bản quyền", StringComparison.OrdinalIgnoreCase)))
        {
            return 3.0m;
        }
        return 0.0m;
    }

    // IP3 (2đ - Tự kê khai): Khai thác & thương mại hóa SHTT (Mặc định 0đ trong khảo sát cũ)
    private static decimal CalculateIP3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetBool(root.Value, "ip_commercialization")) return 2.0m;
        var results = ExtractStringArray(root.Value, "c32_innovation_results", "innovation_results");
        if (results.Any(x => x.Contains("Thương mại hóa", StringComparison.OrdinalIgnoreCase))) return 2.0m;
        return 0.0m;
    }

    // S1 (2đ - C24): Chiến lược CĐS: Đã ban hành/Đã có: 2đ; Đang xây dựng: 1đ; Chưa: 0đ
    private static decimal CalculateS1(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var str = TryGetString(root.Value, "c24_digital_strategy", "digital_strategy") ?? "";
        if (str.Contains("Đã có", StringComparison.OrdinalIgnoreCase) || str.Contains("Đã ban hành", StringComparison.OrdinalIgnoreCase)) return 2.0m;
        if (str.Contains("Đang", StringComparison.OrdinalIgnoreCase) || str.Contains("định hướng", StringComparison.OrdinalIgnoreCase)) return 1.0m;
        return 0.0m;
    }

    // S2 (2đ - C25): Mức độ CĐS: Nâng cao/Toàn diện: 2đ; Cơ bản/Đang mở rộng/Khởi đầu: 1đ
    private static decimal CalculateS2(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var str = TryGetString(root.Value, "c25_digital_maturity", "digital_maturity") ?? "";
        if (str.Contains("Toàn diện", StringComparison.OrdinalIgnoreCase)) return 2.0m;
        if (str.Contains("Nâng cao", StringComparison.OrdinalIgnoreCase)) return 2.0m;
        if (str.Contains("Cơ bản", StringComparison.OrdinalIgnoreCase) || 
            str.Contains("mở rộng", StringComparison.OrdinalIgnoreCase) ||
            str.Contains("khởi đầu", StringComparison.OrdinalIgnoreCase)) return 1.0m;
        return 0.0m;
    }

    // S3 (2đ - C26): Phạm vi số hóa các khâu (>= 3: 2đ; 1-2: 1đ)
    private static decimal CalculateS3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c26_digitized_activities", "digitized_activities");
        if (list.Count >= 3) return 2.0m;
        if (list.Count >= 1) return 1.0m;
        return 0.0m;
    }

    // S4 (3đ - C27): Ứng dụng công nghệ số tiên tiến (Cloud/AI/IoT/Big Data: 3đ; Phần mềm khác: 1.5đ)
    private static decimal CalculateS4(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c27_digital_technologies", "applied_technologies");
        if (list.Any(x => x.Contains("Cloud", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("Điện toán đám mây", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("AI", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("Trí tuệ nhân tạo", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("IoT", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("Internet vạn vật", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Big Data", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Dữ liệu lớn", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Robot", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Blockchain", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("Chuỗi khối", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("ERP", StringComparison.OrdinalIgnoreCase)))
        {
            return 3.0m;
        }
        if (list.Any(x => !x.Equals("Không áp dụng", StringComparison.OrdinalIgnoreCase) && !x.Contains("Chưa", StringComparison.OrdinalIgnoreCase)))
        {
            return 1.5m;
        }
        return 0.0m;
    }

    // S5 (1đ - C16): Quản trị vận hành số
    private static decimal CalculateS5(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c16_governance_platforms", "governance_platforms");
        if (list.Any(x => !x.Equals("Khác", StringComparison.OrdinalIgnoreCase) && 
                          !x.Equals("Không", StringComparison.OrdinalIgnoreCase) &&
                          !x.Contains("Chưa áp dụng", StringComparison.OrdinalIgnoreCase)))
        {
            return 1.0m;
        }
        var digitized = ExtractStringArray(root.Value, "c26_digitized_activities", "digitized_activities");
        if (digitized.Count >= 2) return 1.0m;
        return 0.0m;
    }

    // TT1 (5đ - C33): Doanh thu từ SP mới/cải tiến (>= 30%: 5đ; 10-29%: 3đ; < 10%: 1đ)
    private static decimal CalculateTT1(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var str = TryGetString(root.Value, "c33_new_product_revenue_ratio", "revenue_ratio_from_innovation") ?? "";
        if (str.Contains("Trên 50%", StringComparison.OrdinalIgnoreCase) || 
            str.Contains("Từ 50%", StringComparison.OrdinalIgnoreCase) ||
            str.Contains("Từ 30%", StringComparison.OrdinalIgnoreCase)) return 5.0m;
        if (str.Contains("Từ 10%", StringComparison.OrdinalIgnoreCase)) return 3.0m;
        if (str.Contains("Dưới 10%", StringComparison.OrdinalIgnoreCase)) return 1.0m;
        return 0.0m;
    }

    // TT2 (2đ - C21): Đổi mới tiếp thị, mở rộng thị trường mới
    private static decimal CalculateTT2(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetBool(root.Value, "c21_marketing_innovation", "marketing_innovation")) return 2.0m;
        if (root.Value.TryGetProperty("innovation_activities", out var act) && 
            act.ValueKind == JsonValueKind.Object &&
            act.TryGetProperty("marketing", out var val) && 
            (val.GetString() == "Có" || val.ValueKind == JsonValueKind.True))
        {
            return 2.0m;
        }
        return 0.0m;
    }

    // TT3 (3đ - C34): Tác động kinh tế từ ĐMST (tăng doanh thu, mở rộng thị phần: 3đ; khác: 1.5đ)
    private static decimal CalculateTT3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var list = ExtractStringArray(root.Value, "c34_recorded_impacts", "c23_impact_outcomes", "recorded_impacts");
        if (list.Any(x => x.Contains("doanh thu", StringComparison.OrdinalIgnoreCase) || 
                          x.Contains("thị phần", StringComparison.OrdinalIgnoreCase) ||
                          x.Contains("lợi nhuận", StringComparison.OrdinalIgnoreCase)))
        {
            return 3.0m;
        }
        if (list.Count > 0) return 1.5m;
        return 0.0m;
    }

    // TT4 (2đ - C35): Năng lực xuất khẩu
    private static decimal CalculateTT4(Domain.Enterprise enterprise, JsonElement? root = null)
    {
        if (enterprise.IsExporting) return 2.0m;
        if (root.HasValue && TryGetBool(root.Value, "c35_is_exporting", "is_exporting")) return 2.0m;
        return 0.0m;
    }

    // TT5 (2đ - C36): Tham gia chuỗi giá trị
    private static decimal CalculateTT5(Domain.Enterprise enterprise, JsonElement? root = null)
    {
        if (enterprise.InValueChain) return 2.0m;
        if (root.HasValue && TryGetBool(root.Value, "c36_in_value_chain", "in_value_chain")) return 2.0m;
        return 0.0m;
    }

    // TT6 (1đ - C32+C34): Vị thế thị trường từ ĐMST
    private static decimal CalculateTT6(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        var impacts = ExtractStringArray(root.Value, "c34_recorded_impacts", "recorded_impacts");
        if (impacts.Any(x => x.Contains("thương hiệu", StringComparison.OrdinalIgnoreCase) || 
                             x.Contains("uy tín", StringComparison.OrdinalIgnoreCase) ||
                             x.Contains("cạnh tranh", StringComparison.OrdinalIgnoreCase)))
        {
            return 1.0m;
        }
        var results = ExtractStringArray(root.Value, "c32_innovation_results", "innovation_results")
            .Where(x => !x.Equals("Không có", StringComparison.OrdinalIgnoreCase) && !x.Contains("Chưa", StringComparison.OrdinalIgnoreCase)).ToList();
        if (results.Count >= 2) return 1.0m;
        return 0.0m;
    }

    // NL1 (2đ - C11): Trình độ học vấn lao động (> 30%: 2đ; 10-30%: 1đ; < 10%: 0.5đ)
    private static decimal CalculateNL1(Domain.Enterprise enterprise, JsonElement? root = null)
    {
        var ratio = enterprise.HighQualificationRatio;
        if (string.IsNullOrWhiteSpace(ratio) && root.HasValue)
        {
            ratio = TryGetString(root.Value, "c11_high_qual_ratio", "high_qualification_ratio");
        }
        ratio ??= "";
        if (ratio.Contains("> 30%", StringComparison.OrdinalIgnoreCase) || 
            ratio.Contains("Trên 50%", StringComparison.OrdinalIgnoreCase) ||
            ratio.Contains("30 - 50%", StringComparison.OrdinalIgnoreCase) ||
            ratio.Contains("Trên 30%", StringComparison.OrdinalIgnoreCase)) return 2.0m;
        if (ratio.Contains("10–30%", StringComparison.OrdinalIgnoreCase) || 
            ratio.Contains("10-30%", StringComparison.OrdinalIgnoreCase) ||
            ratio.Contains("10 - dưới 30%", StringComparison.OrdinalIgnoreCase)) return 1.0m;
        if (ratio.Contains("< 10%", StringComparison.OrdinalIgnoreCase) || 
            ratio.Contains("Dưới 10%", StringComparison.OrdinalIgnoreCase)) return 0.5m;
        return 0.0m;
    }

    // NL2 (3đ - C12): Nhân sự chuyên trách công nghệ/ĐMST
    private static decimal CalculateNL2(Domain.Enterprise enterprise, JsonElement? root = null)
    {
        if (enterprise.HasRdUnit) return 3.0m;
        if (root.HasValue && TryGetBool(root.Value, "c12_has_rd_unit", "has_rd_unit")) return 3.0m;
        if (enterprise.RdPersonnelCount.HasValue && enterprise.RdPersonnelCount.Value > 0) return 1.5m;
        return 0.0m;
    }

    // NL3 (2đ - C13): Đào tạo bồi dưỡng công nghệ
    private static decimal CalculateNL3(Domain.Enterprise enterprise, bool hasTechTraining, JsonElement? root = null)
    {
        if (hasTechTraining) return 2.0m;
        if (root.HasValue && TryGetBool(root.Value, "c13_has_training", "has_tech_training")) return 2.0m;
        return 0.0m;
    }

    // LK1 (2đ - C28 ĐH+Viện): Hợp tác Viện/Trường
    private static decimal CalculateLK1(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetCollab(root.Value, "universities", "research_institutes")) return 2.0m;
        return 0.0m;
    }

    // LK2 (1đ - C28 DN): Hợp tác Doanh nghiệp trong ngành
    private static decimal CalculateLK2(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetCollab(root.Value, "same_industry", "other_enterprises", "supply_chain")) return 1.0m;
        return 0.0m;
    }

    // LK3 (1đ - C28 Tổ chức hỗ trợ): Hợp tác Vườn ươm / Trung tâm ĐMST
    private static decimal CalculateLK3(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetCollab(root.Value, "incubators", "innovation_centers")) return 1.0m;
        return 0.0m;
    }

    // LK4 (1đ - C28 Quỹ + C30): Tiếp cận Quỹ đầu tư / Quỹ KH&CN
    private static decimal CalculateLK4(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetCollab(root.Value, "funds", "investment_funds")) return 1.0m;
        var funding = TryGetString(root.Value, "c30_funding_access", "accessed_funds") ?? "";
        if (!string.IsNullOrWhiteSpace(funding) && !funding.Contains("Chưa từng", StringComparison.OrdinalIgnoreCase) && !funding.Equals("Không", StringComparison.OrdinalIgnoreCase))
        {
            return 1.0m;
        }
        return 0.0m;
    }

    // LK5 (1đ - C28 NN + C29): Hợp tác Cơ quan Nhà nước
    private static decimal CalculateLK5(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetCollab(root.Value, "gov_agencies", "state_agencies")) return 1.0m;
        var supportList = ExtractStringArray(root.Value, "c29_public_support", "received_public_support");
        if (supportList.Any(x => !x.Contains("Chưa", StringComparison.OrdinalIgnoreCase) && !x.Equals("Không", StringComparison.OrdinalIgnoreCase)))
        {
            return 1.0m;
        }
        return 0.0m;
    }

    // LK6 (2đ - C28 Quốc tế): Hợp tác Quốc tế
    private static decimal CalculateLK6(JsonElement? root)
    {
        if (!root.HasValue) return 0.0m;
        if (TryGetCollab(root.Value, "international", "international_orgs")) return 2.0m;
        return 0.0m;
    }

    private static bool TryGetCollab(JsonElement root, params string[] fieldNames)
    {
        if (root.TryGetProperty("c28_collaborations", out var col) || root.TryGetProperty("collaborations", out col))
        {
            if (col.ValueKind == JsonValueKind.Object)
            {
                foreach (var fn in fieldNames)
                {
                    if (col.TryGetProperty(fn, out var val))
                    {
                        var s = val.GetString();
                        if (!string.IsNullOrWhiteSpace(s) && 
                            !s.Equals("Không", StringComparison.OrdinalIgnoreCase) && 
                            !s.Equals("Không có", StringComparison.OrdinalIgnoreCase))
                        {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    #endregion

    #region Helpers

    private static JsonDocument? ParseJsonSafe(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonDocument.Parse(json);
        }
        catch
        {
            return null;
        }
    }

    private static List<string> ExtractStringArray(JsonElement root, params string[] propertyNames)
    {
        var result = new List<string>();
        foreach (var propertyName in propertyNames)
        {
            if (root.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in prop.EnumerateArray())
                {
                    var s = item.GetString();
                    if (!string.IsNullOrWhiteSpace(s) && !result.Contains(s))
                    {
                        result.Add(s);
                    }
                }
            }
        }
        return result;
    }

    private static bool TryGetBool(JsonElement root, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (root.TryGetProperty(propertyName, out var prop))
            {
                if (prop.ValueKind == JsonValueKind.True) return true;
                if (prop.ValueKind == JsonValueKind.False) return false;
                if (prop.ValueKind == JsonValueKind.String)
                {
                    var s = prop.GetString();
                    if (string.Equals(s, "true", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(s, "Có", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(s, "yes", StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private static string? TryGetString(JsonElement root, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (root.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.String)
            {
                return prop.GetString();
            }
        }
        return null;
    }

    #endregion
}
