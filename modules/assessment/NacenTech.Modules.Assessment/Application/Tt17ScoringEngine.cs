using System;
using System.Collections.Generic;
using System.Linq;

namespace NacenTech.Modules.Assessment.Application;

public sealed class Tt17ScoringEngine
{
    public Tt17ScoreResultDto Calculate(Tt17SurveyDataDto survey)
    {
        var criteria = new List<CriterionScoreDto>();
        var bottlenecks = new List<string>();

        // -------------------------------------------------------------
        // NHÓM T: HIỆN TRẠNG CÔNG NGHỆ, THIẾT BỊ (MAX 30 ĐIỂM)
        // -------------------------------------------------------------
        // TC01: Hệ số hao mòn K_kh (Max 4đ)
        // K_kh <= 0.3: 4đ; <= 0.5: 3đ; <= 0.7: 2đ; > 0.7: 1đ
        double s01 = survey.DepreciationCoefficient switch
        {
            <= 0.3 => 4.0,
            <= 0.5 => 3.0,
            <= 0.7 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC01", "T", "Hệ số hao mòn máy móc, thiết bị (K_kh)", 4.0, s01, "Cần tăng cường đầu tư mới máy móc thiết bị thay thế tài sản đã khấu hao sâu."));

        // TC02: Tỷ lệ thiết bị thế hệ mới (Max 5đ)
        // >= 70%: 5đ; >= 50%: 4đ; >= 30%: 3đ; >= 15%: 2đ; < 15%: 1đ
        double s02 = survey.ModernEquipmentRatio switch
        {
            >= 70.0 => 5.0,
            >= 50.0 => 4.0,
            >= 30.0 => 3.0,
            >= 15.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC02", "T", "Tỷ lệ máy móc, thiết bị thế hệ mới", 5.0, s02, "Nâng cấp dây chuyền công nghệ thế hệ mới để tăng năng suất."));

        // TC03: Tỷ lệ máy móc nhập khẩu từ nước tiên tiến / G7 / OECD (Max 5đ)
        double s03 = survey.AdvancedCountryEquipmentRatio switch
        {
            >= 60.0 => 5.0,
            >= 40.0 => 4.0,
            >= 20.0 => 3.0,
            >= 10.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC03", "T", "Tỷ lệ máy móc nhập khẩu từ nước tiên tiến", 5.0, s03, "Tiếp cận chuyển giao công nghệ nguồn từ các quốc gia G7/OECD."));

        // TC04: Mức độ tự động hóa máy móc thiết bị (Max 5đ)
        double s04 = survey.AutomationRatio switch
        {
            >= 70.0 => 5.0,
            >= 50.0 => 4.0,
            >= 30.0 => 3.0,
            >= 15.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC04", "T", "Mức độ tự động hóa máy móc, thiết bị", 5.0, s04, "Đẩy mạnh ứng dụng máy CNC, điều khiển tự động PLC và robot công nghiệp."));

        // TC05: Tuổi bình quân của máy móc, thiết bị chính (Max 4đ)
        // <= 5 năm: 4đ; <= 10 năm: 3đ; <= 15 năm: 2đ; > 15 năm: 1đ
        double s05 = survey.AverageEquipmentAge switch
        {
            <= 5.0 => 4.0,
            <= 10.0 => 3.0,
            <= 15.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC05", "T", "Tuổi trung bình của máy móc, thiết bị", 4.0, s05, "Hiện đại hóa và thanh lý các thiết bị có tuổi đời trên 10 năm."));

        // TC06: Mức độ đồng bộ của dây chuyền công nghệ (Max 3đ)
        double s06 = Math.Clamp(survey.LineSynchronizationLevel * 0.6, 0.6, 3.0);
        criteria.Add(CreateCriterion("TC06", "T", "Mức độ đồng bộ của dây chuyền công nghệ", 3.0, s06, "Đồng bộ hóa các công đoạn để giảm thiểu tình trạng nghẽn cổ chai sản xuất."));

        // TC07: Tiêu hao nguyên vật liệu so với định mức (Max 4đ)
        // <= 95%: 4đ; <= 100%: 3đ; <= 105%: 2đ; > 105%: 1đ
        double s07 = survey.MaterialConsumptionRatio switch
        {
            <= 95.0 => 4.0,
            <= 100.0 => 3.0,
            <= 105.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC07", "T", "Mức tiêu hao nguyên vật liệu so với định mức", 4.0, s07, "Cải tiến quy trình công nghệ nhằm giảm thiểu hao hụt nguyên vật liệu."));

        double scoreT = Math.Min(30.0, s01 + s02 + s03 + s04 + s05 + s06 + s07);

        // -------------------------------------------------------------
        // NHÓM E: HIỆU QUẢ KHAI THÁC CÔNG NGHỆ (MAX 20 ĐIỂM)
        // -------------------------------------------------------------
        // TC08: Tốc độ tăng năng suất lao động (Max 5đ)
        double laborGrowth = CalculateLaborProductivityGrowth(survey.FinancialSeries);
        double s08 = laborGrowth switch
        {
            >= 15.0 => 5.0,
            >= 10.0 => 4.0,
            >= 5.0 => 3.0,
            >= 0.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC08", "E", "Tốc độ tăng năng suất lao động bình quân", 5.0, s08, "Đào tạo kỹ năng vận hành và áp dụng công cụ cải tiến năng suất."));

        // TC09: Tỷ lệ sản phẩm hỏng/lỗi (Max 4đ)
        // <= 1%: 4đ; <= 3%: 3đ; <= 5%: 2đ; > 5%: 1đ
        double s09 = survey.DefectProductRatio switch
        {
            <= 1.0 => 4.0,
            <= 3.0 => 3.0,
            <= 5.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC09", "E", "Tỷ lệ sản phẩm hỏng, lỗi trong sản xuất", 4.0, s09, "Áp dụng kiểm soát chất lượng thống kê SQC và công cụ Poka-Yoke."));

        // TC10: Mức độ sử dụng công suất thiết kế (Max 4đ)
        // >= 85%: 4đ; >= 70%: 3đ; >= 50%: 2đ; < 50%: 1đ
        double s10 = survey.CapacityUtilizationRatio switch
        {
            >= 85.0 => 4.0,
            >= 70.0 => 3.0,
            >= 50.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC10", "E", "Mức độ sử dụng công suất thiết kế", 4.0, s10, "Mở rộng thị trường tiêu thụ và tối ưu hóa kế hoạch vận hành máy móc."));

        // TC11: Tỷ lệ sản phẩm xuất khẩu / tham gia chuỗi giá trị (Max 4đ)
        double s11 = survey.ExportRevenueRatio switch
        {
            >= 50.0 => 4.0,
            >= 30.0 => 3.0,
            >= 10.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC11", "E", "Tỷ lệ xuất khẩu và tham gia chuỗi giá trị", 4.0, s11, "Xây dựng tiêu chuẩn chất lượng đáp ứng chuỗi cung ứng toàn cầu."));

        // TC12: Mức độ tiết kiệm năng lượng (Max 3đ)
        double s12 = survey.EnergySavingRatio switch
        {
            >= 10.0 => 3.0,
            >= 5.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC12", "E", "Hiệu quả tiết kiệm năng lượng", 3.0, s12, "Đầu tư giải pháp công nghệ xanh và kiểm toán năng lượng định kỳ."));

        double scoreE = Math.Min(20.0, s08 + s09 + s10 + s11 + s12);

        // -------------------------------------------------------------
        // NHÓM O: NĂNG LỰC TỔ CHỨC, QUẢN LÝ (MAX 19 ĐIỂM)
        // -------------------------------------------------------------
        // TC13: Hệ thống quản lý chất lượng ISO (Max 5đ)
        int isoCount = survey.IsoCertifications?.Count ?? 0;
        double s13 = isoCount switch
        {
            >= 3 => 5.0,
            2 => 4.0,
            1 => 3.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC13", "O", "Áp dụng hệ thống quản lý chất lượng (ISO...)", 5.0, s13, "Áp dụng các hệ thống quản lý quốc tế ISO 9001, ISO 14001, HACCP."));

        // TC14: Ứng dụng phần mềm quản trị ERP, MES (Max 5đ)
        int softCount = survey.SoftwareApplications?.Count ?? 0;
        double s14 = softCount switch
        {
            >= 3 => 5.0,
            2 => 4.0,
            1 => 3.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC14", "O", "Ứng dụng phần mềm quản trị ERP / MES", 5.0, s14, "Triển khai phần mềm ERP và MES để liên thông dữ liệu sản xuất."));

        // TC15: Công cụ cải tiến năng suất 5S, Kaizen (Max 3đ)
        int toolCount = survey.ProductivityTools?.Count ?? 0;
        double s15 = toolCount switch
        {
            >= 2 => 3.0,
            1 => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC15", "O", "Áp dụng công cụ cải tiến (5S, Kaizen, Lean)", 3.0, s15, "Thực hành văn hóa cải tiến liên tục 5S và Kaizen tại phân xưởng."));

        // TC16: Mức độ chuyển đổi số (Max 3đ)
        double s16 = Math.Clamp(survey.DigitalMaturityLevel * 0.6, 0.0, 3.0);
        criteria.Add(CreateCriterion("TC16", "O", "Mức độ chuyển đổi số trong vận hành", 3.0, s16, "Đẩy nhanh lộ trình số hóa dữ liệu và tự động hóa quy trình nghiệp vụ."));

        // TC17: Bảo vệ môi trường & xử lý chất thải (Max 3đ)
        double s17 = survey.EnvironmentalCompliant ? 3.0 : 0.0;
        criteria.Add(CreateCriterion("TC17", "O", "Tuân thủ quy định bảo vệ môi trường", 3.0, s17, "Đầu tư hoàn thiện hệ thống quan trắc và xử lý chất thải đạt chuẩn."));

        double scoreO = Math.Min(19.0, s13 + s14 + s15 + s16 + s17);

        // -------------------------------------------------------------
        // NHÓM R: NĂNG LỰC NGHIÊN CỨU, PHÁT TRIỂN (MAX 17 ĐIỂM)
        // -------------------------------------------------------------
        // TC18: Tỷ lệ nhân lực R&D (Max 4đ)
        double rdRatio = survey.TotalWorkforce > 0 ? (survey.RdWorkforceCount * 100.0 / survey.TotalWorkforce) : 0;
        double s18 = rdRatio switch
        {
            >= 5.0 => 4.0,
            >= 3.0 => 3.0,
            >= 1.0 => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC18", "R", "Tỷ lệ nhân lực hoạt động R&D", 4.0, s18, "Thu hút và đào tạo đội ngũ kỹ sư chuyên trách nghiên cứu R&D."));

        // TC19: Cơ sở vật chất R&D (Phòng Lab) (Max 3đ)
        double s19 = survey.HasLabOrTestingFacility ? 3.0 : 0.0;
        criteria.Add(CreateCriterion("TC19", "R", "Cơ sở vật chất phục vụ R&D (Phòng Lab/CAD)", 3.0, s19, "Trang bị phòng thử nghiệm và trạm thiết kế mô phỏng CAD/CAM."));

        // TC20: Tỷ lệ kinh phí R&D / doanh thu (Max 4đ)
        double s20 = survey.RdExpenseRatio switch
        {
            >= 2.0 => 4.0,
            >= 1.0 => 3.0,
            >= 0.5 => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC20", "R", "Tỷ lệ kinh phí dành cho R&D trên doanh thu", 4.0, s20, "Dành tối thiểu 1.5 - 2% doanh thu hàng năm cho quỹ phát triển KH&CN."));

        // TC21: Số lượng đề tài/dự án R&D (Max 3đ)
        double s21 = survey.RdProjectsCount switch
        {
            >= 3 => 3.0,
            >= 1 => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC21", "R", "Số lượng đề tài, dự án R&D đã thực hiện", 3.0, s21, "Đẩy mạnh đăng ký tham gia các nhiệm vụ KH&CN cấp tỉnh và quốc gia."));

        // TC22: Khả năng làm chủ công nghệ sản xuất (Max 3đ)
        double s22 = Math.Clamp(survey.TechnologyMasteryLevel * 0.6, 0.0, 3.0);
        criteria.Add(CreateCriterion("TC22", "R", "Khả năng làm chủ và cải tiến công nghệ", 3.0, s22, "Nâng cao năng lực giải mã công nghệ và thiết kế chế tạo nội bộ."));

        double scoreR = Math.Min(17.0, s18 + s19 + s20 + s21 + s22);

        // -------------------------------------------------------------
        // NHÓM I: NĂNG LỰC ĐỔI MỚI SÁNG TẠO (MAX 14 ĐIỂM)
        // -------------------------------------------------------------
        // TC23: Tài sản trí tuệ (Sáng chế, GPHI) (Max 4đ)
        double s23 = (survey.GrantedPatentsCount, survey.RegisteredIpCount) switch
        {
            ( >= 2, _) => 4.0,
            (1, _) => 3.5,
            (0, >= 2) => 3.0,
            (0, 1) => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC23", "I", "Số lượng tài sản trí tuệ (Sáng chế, GPHI)", 4.0, s23, "Đăng ký bảo hộ sở hữu trí tuệ cho các sáng kiến và bí quyết kỹ thuật."));

        // TC24: Doanh thu từ sản phẩm mới 3 năm (Max 4đ)
        double s24 = survey.NewProductRevenueRatio switch
        {
            >= 30.0 => 4.0,
            >= 20.0 => 3.0,
            >= 10.0 => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC24", "I", "Tỷ lệ doanh thu từ sản phẩm mới thương mại hóa", 4.0, s24, "Tăng tốc độ đưa sản phẩm mới ra thị trường để đón đầu thị hiếu."));

        // TC25: Hợp tác ĐMST với Viện / Trường (Max 3đ)
        double s25 = survey.AcademyPartnershipCount switch
        {
            >= 2 => 3.0,
            1 => 2.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC25", "I", "Hợp tác ĐMST với Viện nghiên cứu, Trường ĐH", 3.0, s25, "Ký kết thỏa thuận liên kết nghiên cứu và nhận chuyển giao từ Viện/Trường."));

        // TC26: Chính sách khuyến khích sáng kiến nội bộ (Max 3đ)
        double s26 = survey.HasInternalInnovationPolicy ? 3.0 : 0.0;
        criteria.Add(CreateCriterion("TC26", "I", "Chính sách khuyến khích sáng kiến, cải tiến", 3.0, s26, "Xây dựng quỹ khen thưởng và quy chế ghi nhận sáng kiến cải tiến nội bộ."));

        double scoreI = Math.Min(14.0, s23 + s24 + s25 + s26);

        // -------------------------------------------------------------
        // TỔNG ĐIỂM VÀ HỆ SỐ ĐỒNG BỘ
        // -------------------------------------------------------------
        double totalScore = Math.Round(scoreT + scoreE + scoreO + scoreR + scoreI, 2);

        // T_ĐB = (T/30)^0.30 * (E/20)^0.20 * (O/19)^0.19 * (R/17)^0.17 * (I/14)^0.14
        double syncCoefficient = 0.0;
        if (scoreT > 0 && scoreE > 0 && scoreO > 0 && scoreR > 0 && scoreI > 0)
        {
            syncCoefficient = Math.Round(
                Math.Pow(scoreT / 30.0, 0.30) *
                Math.Pow(scoreE / 20.0, 0.20) *
                Math.Pow(scoreO / 19.0, 0.19) *
                Math.Pow(scoreR / 17.0, 0.17) *
                Math.Pow(scoreI / 14.0, 0.14),
                2
            );
        }

        // Xếp loại 4 mức theo Điều 9 TT17: Thỏa mãn đồng thời cả 2 điều kiện trong từng dải điểm
        string classification;
        string classificationLabel;

        if (totalScore >= 75.0 && syncCoefficient >= 0.65)
        {
            classification = "TIEN_TIEN";
            classificationLabel = "Tiên tiến";
        }
        else if (totalScore >= 60.0 && totalScore < 75.0 && syncCoefficient >= 0.50)
        {
            classification = "TRUNG_BINH_TIEN_TIEN";
            classificationLabel = "Trung bình tiên tiến";
        }
        else if (totalScore >= 35.0 && totalScore < 60.0 && syncCoefficient >= 0.30)
        {
            classification = "TRUNG_BINH";
            classificationLabel = "Trung bình";
        }
        else if (totalScore < 35.0 && syncCoefficient < 0.30)
        {
            classification = "LAC_HAU";
            classificationLabel = "Lạc hậu";
        }
        else
        {
            classification = "CAN_THAM_DINH";
            classificationLabel = "Cần thẩm định chuyên gia (Lệch pha giữa tổng điểm và hệ số đồng bộ)";
        }

        // Bóc tách điểm nghẽn
        foreach (var c in criteria.Where(c => c.IsBottleneck))
        {
            bottlenecks.Add(c.Code);
        }

        return new Tt17ScoreResultDto
        {
            ScoreT = Math.Round(scoreT, 2),
            ScoreE = Math.Round(scoreE, 2),
            ScoreO = Math.Round(scoreO, 2),
            ScoreR = Math.Round(scoreR, 2),
            ScoreI = Math.Round(scoreI, 2),
            TotalScore = totalScore,
            SyncCoefficient = syncCoefficient,
            Classification = classification,
            ClassificationLabel = classificationLabel,
            Criteria = criteria,
            Bottlenecks = bottlenecks
        };
    }

    private static CriterionScoreDto CreateCriterion(string code, string group, string name, double max, double achieved, string recommendation)
    {
        double clamped = Math.Clamp(achieved, 0, max);
        bool isBottleneck = clamped < (max * 0.40); // Dưới 40% điểm coi là điểm nghẽn
        return new CriterionScoreDto
        {
            Code = code,
            Group = group,
            Name = name,
            MaxScore = max,
            AchievedScore = Math.Round(clamped, 2),
            IsBottleneck = isBottleneck,
            Recommendation = recommendation
        };
    }

    private static double CalculateLaborProductivityGrowth(List<FinancialSeriesDto>? series)
    {
        if (series == null || series.Count < 2) return 5.0; // Mặc định 5% nếu chưa đủ chuỗi
        var ordered = series.OrderBy(s => s.Year).ToList();
        var y1 = ordered.First();
        var yLast = ordered.Last();

        double prod1 = y1.DirectWorkersCount > 0 ? (double)y1.IndustrialOutputValue / y1.DirectWorkersCount : 0;
        double prodLast = yLast.DirectWorkersCount > 0 ? (double)yLast.IndustrialOutputValue / yLast.DirectWorkersCount : 0;

        if (prod1 <= 0) return 5.0;
        double totalGrowth = ((prodLast - prod1) / prod1) * 100.0;
        int years = Math.Max(1, yLast.Year - y1.Year);
        return Math.Round(totalGrowth / years, 2);
    }
}
