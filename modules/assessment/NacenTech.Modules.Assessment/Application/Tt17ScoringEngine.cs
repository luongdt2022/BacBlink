using System;
using System.Collections.Generic;
using System.Linq;

namespace NacenTech.Modules.Assessment.Application;

public sealed class Tt17ScoringEngine
{
    public static readonly Dictionary<string, IndustryBenchmarkDto> Benchmarks = new(StringComparer.OrdinalIgnoreCase)
    {
        ["C.10"] = new() { IndustryCode = "C.10", IndustryName = "Sản xuất chế biến thực phẩm", KChuan1 = 200, KChuan2 = 0.07, KChuan3 = 0.75, KChuan4 = 150 },
        ["C.11"] = new() { IndustryCode = "C.11", IndustryName = "Sản xuất đồ uống", KChuan1 = 200, KChuan2 = 0.05, KChuan3 = 0.20, KChuan4 = 150 },
        ["C.12"] = new() { IndustryCode = "C.12", IndustryName = "Sản xuất sản phẩm thuốc lá", KChuan1 = 200, KChuan2 = 0.07, KChuan3 = 0.45, KChuan4 = 200 },
        ["C.13"] = new() { IndustryCode = "C.13", IndustryName = "Dệt", KChuan1 = 200, KChuan2 = 0.05, KChuan3 = 0.40, KChuan4 = 75 },
        ["C.14"] = new() { IndustryCode = "C.14", IndustryName = "Sản xuất trang phục", KChuan1 = 200, KChuan2 = 0.05, KChuan3 = 0.65, KChuan4 = 75 },
        ["C.15"] = new() { IndustryCode = "C.15", IndustryName = "Sản xuất da và các sản phẩm có liên quan", KChuan1 = 200, KChuan2 = 0.05, KChuan3 = 0.35, KChuan4 = 75 },
        ["C.16"] = new() { IndustryCode = "C.16", IndustryName = "Chế biến gỗ và sản xuất sản phẩm từ gỗ, tre, nứa", KChuan1 = 150, KChuan2 = 0.05, KChuan3 = 0.65, KChuan4 = 100 },
        ["C.17"] = new() { IndustryCode = "C.17", IndustryName = "Sản xuất giấy và sản phẩm từ giấy", KChuan1 = 250, KChuan2 = 0.05, KChuan3 = 0.65, KChuan4 = 100 },
        ["C.18"] = new() { IndustryCode = "C.18", IndustryName = "In, sao chép bản ghi các loại", KChuan1 = 250, KChuan2 = 0.05, KChuan3 = 0.65, KChuan4 = 100 },
        ["C.19"] = new() { IndustryCode = "C.19", IndustryName = "Sản xuất than cốc, sản phẩm dầu mỏ tinh chế", KChuan1 = 300, KChuan2 = 0.10, KChuan3 = 0.75, KChuan4 = 150 },
        ["C.20"] = new() { IndustryCode = "C.20", IndustryName = "Sản xuất hóa chất và sản phẩm hóa chất", KChuan1 = 250, KChuan2 = 0.10, KChuan3 = 0.55, KChuan4 = 150 },
        ["C.21"] = new() { IndustryCode = "C.21", IndustryName = "Sản xuất thuốc, hóa dược và dược liệu", KChuan1 = 300, KChuan2 = 0.07, KChuan3 = 0.60, KChuan4 = 200 },
        ["C.22"] = new() { IndustryCode = "C.22", IndustryName = "Sản xuất sản phẩm từ cao su và plastic", KChuan1 = 250, KChuan2 = 0.10, KChuan3 = 0.55, KChuan4 = 150 },
        ["C.23"] = new() { IndustryCode = "C.23", IndustryName = "Sản xuất sản phẩm từ khoáng phi kim loại khác", KChuan1 = 250, KChuan2 = 0.10, KChuan3 = 0.40, KChuan4 = 100 },
        ["C.24"] = new() { IndustryCode = "C.24", IndustryName = "Sản xuất kim loại", KChuan1 = 300, KChuan2 = 0.10, KChuan3 = 0.65, KChuan4 = 150 },
        ["C.25"] = new() { IndustryCode = "C.25", IndustryName = "Sản xuất sản phẩm từ kim loại đúc sẵn (trừ máy móc, TB)", KChuan1 = 300, KChuan2 = 0.07, KChuan3 = 0.65, KChuan4 = 100 },
        ["C.26"] = new() { IndustryCode = "C.26", IndustryName = "Sản xuất sản phẩm điện tử, máy vi tính và quang học", KChuan1 = 300, KChuan2 = 0.05, KChuan3 = 0.45, KChuan4 = 100 },
        ["C.27"] = new() { IndustryCode = "C.27", IndustryName = "Sản xuất thiết bị điện", KChuan1 = 300, KChuan2 = 0.05, KChuan3 = 0.45, KChuan4 = 100 },
        ["C.28"] = new() { IndustryCode = "C.28", IndustryName = "Sản xuất máy móc, thiết bị chưa được phân vào đâu", KChuan1 = 300, KChuan2 = 0.07, KChuan3 = 0.55, KChuan4 = 150 },
        ["C.29"] = new() { IndustryCode = "C.29", IndustryName = "Sản xuất xe có động cơ", KChuan1 = 300, KChuan2 = 0.07, KChuan3 = 0.65, KChuan4 = 150 },
        ["C.30"] = new() { IndustryCode = "C.30", IndustryName = "Sản xuất phương tiện vận tải khác", KChuan1 = 300, KChuan2 = 0.07, KChuan3 = 0.65, KChuan4 = 150 },
        ["C.31"] = new() { IndustryCode = "C.31", IndustryName = "Sản xuất giường, tủ, bàn, ghế", KChuan1 = 150, KChuan2 = 0.05, KChuan3 = 0.55, KChuan4 = 100 },
        ["C.32"] = new() { IndustryCode = "C.32", IndustryName = "Công nghiệp chế biến, chế tạo khác", KChuan1 = 200, KChuan2 = 0.07, KChuan3 = 0.55, KChuan4 = 150 }
    };

    public Tt17ScoreResultDto Calculate(Tt17SurveyDataDto survey, string? industryCode = null)
    {
        var criteria = new List<CriterionScoreDto>();
        var bottlenecks = new List<string>();

        string indCode = !string.IsNullOrWhiteSpace(industryCode)
            ? industryCode
            : (!string.IsNullOrWhiteSpace(survey.IndustryCode) ? survey.IndustryCode : "C.28");

        var benchmark = Benchmarks.TryGetValue(indCode, out var bm) ? bm : Benchmarks["C.28"];

        // Dữ liệu tài chính năm gần nhất
        var series = survey.FinancialSeries ?? new List<FinancialSeriesDto>();
        var sortedSeries = series.OrderByDescending(f => f.Year).ToList();
        var latestFinancial = sortedSeries.FirstOrDefault();

        double gDt = latestFinancial != null && latestFinancial.NetRevenue > 0
            ? (double)latestFinancial.NetRevenue
            : 0;
        double gSp = latestFinancial != null && latestFinancial.IndustrialOutputValue > 0
            ? (double)latestFinancial.IndustrialOutputValue
            : gDt;

        int mTt = survey.DirectWorkers > 0
            ? survey.DirectWorkers
            : (latestFinancial != null && latestFinancial.DirectWorkersCount > 0
                ? latestFinancial.DirectWorkersCount
                : Math.Max(1, (int)Math.Round(survey.TotalWorkforce * 0.7)));

        int m = survey.TotalWorkforce > 0
            ? survey.TotalWorkforce
            : Math.Max(1, mTt + survey.IndirectStaff);

        int mGt = Math.Max(1, m - mTt);

        // -------------------------------------------------------------
        // NHÓM T: HIỆN TRẠNG CÔNG NGHỆ, THIẾT BỊ (MAX 30 ĐIỂM)
        // -------------------------------------------------------------
        // TC01: Khấu hao TBCN (K_kh) - Max 5đ
        double gBd = survey.OriginalCostEquipment;
        double gSx = survey.CurrentBookValueEquipment;
        double kKh = 0;
        if (gBd > 0)
        {
            kKh = ((gBd - gSx) / gBd) * 100.0;
        }
        else if (survey.DepreciationCoefficient > 0)
        {
            kKh = survey.DepreciationCoefficient * 100.0;
        }

        double s01 = 1.0;
        if (gBd > 0 || survey.DepreciationCoefficient > 0)
        {
            s01 = kKh switch
            {
                < 20.0 => 5.0,
                < 40.0 => 4.0,
                < 60.0 => 3.0,
                < 80.0 => 2.0,
                _ => 1.0
            };
        }
        criteria.Add(CreateCriterion("TC01", "T", "Mức độ khấu hao thiết bị, công nghệ (K_kh)", 5.0, s01, "Cần tăng cường đầu tư mới máy móc thiết bị thay thế tài sản đã khấu hao sâu."));

        // TC02: Cường độ vốn TBCN (K_cd) - Max 3đ
        double kCd = gDt > 0 ? (gSx / gDt) * 100.0 : 0;
        double s02 = 1.0;
        if (kCd >= 60.0) s02 = 3.0;
        else if (kCd >= 40.0) s02 = 2.0;
        else s02 = 1.0;
        criteria.Add(CreateCriterion("TC02", "T", "Cường độ vốn thiết bị, công nghệ (K_cđ)", 3.0, s02, "Nâng cao quy mô đầu tư máy móc trên mỗi đồng doanh thu."));

        // TC03: Mức độ đổi mới TBCN (K_dm) - Max 3đ
        double gTbm1 = survey.NewInvestEquipment3Years;
        double gTbm2 = survey.ReplacementEquipment3Years;
        double kDm = 0;
        if (gBd > 0)
        {
            kDm = ((gTbm1 + gTbm2) / gBd) * 100.0;
        }
        else if (survey.ModernEquipmentRatio > 0)
        {
            kDm = survey.ModernEquipmentRatio;
        }

        double s03 = kDm switch
        {
            >= 75.0 => 3.0,
            >= 50.0 => 2.0,
            >= 25.0 => 1.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC03", "T", "Mức độ đổi mới thiết bị, công nghệ (K_đm)", 3.0, s03, "Tiếp cận chuyển giao công nghệ mới và thay thế thiết bị định kỳ trong 3 năm."));

        // TC04: Mức độ tự động hóa & tích hợp sản xuất - Max 7đ (Tự động hóa 3đ + Tích hợp 4đ)
        double gSh = survey.DigitalEquipmentValue;
        double kChuan1 = benchmark.KChuan1;
        double kTdh = 0;
        if (mTt > 0 && gSh > 0)
        {
            kTdh = (gSh / 1_000_000.0) / mTt;
        }
        else if (survey.AutomationRatio > 0)
        {
            kTdh = (survey.AutomationRatio / 100.0) * 1.5 * kChuan1;
        }

        double s04Auto = kTdh switch
        {
            _ when kTdh >= 1.5 * kChuan1 => 3.0,
            _ when kTdh >= kChuan1 => 2.0,
            _ when kTdh >= 0.5 * kChuan1 => 1.0,
            _ => 0.0
        };

        var dataSys = survey.DataCollectionSystems ?? new List<string>();
        double s04Integ = 0;
        if (dataSys.Any(s => s.Contains("scada", StringComparison.OrdinalIgnoreCase) || s.Contains("pda", StringComparison.OrdinalIgnoreCase))) s04Integ += 1.0;
        if (dataSys.Any(s => s.Contains("mdc", StringComparison.OrdinalIgnoreCase))) s04Integ += 1.0;
        if (dataSys.Any(s => s.Contains("fms", StringComparison.OrdinalIgnoreCase) || s.Contains("dcs", StringComparison.OrdinalIgnoreCase))) s04Integ += 1.0;
        if (dataSys.Any(s => s.Contains("cim", StringComparison.OrdinalIgnoreCase))) s04Integ += 1.0;
        s04Integ = Math.Clamp(s04Integ, 0.0, 4.0);
        if (s04Integ == 0 && (survey.Machineries?.Any(m => m.IsAutomated) ?? false)) s04Integ = 2.0;

        double s04 = Math.Min(7.0, s04Auto + s04Integ);
        criteria.Add(CreateCriterion("TC04", "T", "Mức độ tự động hóa và tích hợp sản xuất (K_tđh & SCADA/CIM)", 7.0, s04, $"Đẩy mạnh ứng dụng thiết bị số hóa (SCADA, CIM) đạt chuẩn ngành {indCode} ({kChuan1} trđ/LĐ)."));

        // TC05: Tỷ lệ chi phí năng lượng sản xuất (K_nl) - Max 4đ
        double gNl = survey.EnergyCostYear;
        double kChuan2 = benchmark.KChuan2;
        double kNl = gSp > 0 ? gNl / gSp : 0;
        double s05 = 3.0; // fallback
        if (gSp > 0 && gNl > 0)
        {
            s05 = kNl switch
            {
                _ when kNl <= 0.25 * kChuan2 => 4.0,
                _ when kNl <= 0.5 * kChuan2 => 3.0,
                _ when kNl <= kChuan2 => 2.0,
                _ => 1.0
            };
        }
        criteria.Add(CreateCriterion("TC05", "T", "Tỷ lệ chi phí năng lượng sản xuất (K_nl)", 4.0, s05, $"Tối ưu hóa tiêu hao điện/nhiên liệu đạt chuẩn ngành ({kChuan2 * 100:F1}%)."));

        // TC06: Tỷ lệ chi phí nguyên vật liệu sản xuất (K_nvl) - Max 4đ
        double gNvl = survey.MaterialCostYear;
        double kChuan3 = benchmark.KChuan3;
        double kNvl = gSp > 0 ? gNvl / gSp : 0;
        double s06 = 3.0;
        if (gSp > 0 && gNvl > 0)
        {
            s06 = kNvl switch
            {
                _ when kNvl <= 0.25 * kChuan3 => 4.0,
                _ when kNvl <= 0.5 * kChuan3 => 3.0,
                _ when kNvl <= kChuan3 => 2.0,
                _ => 1.0
            };
        }
        criteria.Add(CreateCriterion("TC06", "T", "Tỷ lệ chi phí nguyên vật liệu sản xuất (K_nvl)", 4.0, s06, $"Giảm tiêu hao nguyên vật liệu theo định mức ngành ({kChuan3 * 100:F1}%)."));

        // TC07: Tiêu chuẩn sản phẩm của dây chuyền công nghệ - Max 4đ
        double s07 = survey.MainProductStandard switch
        {
            "co_so_vuot_quoc_te" => 4.0,
            "quoc_te" => 3.0,
            "quoc_gia" => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC07", "T", "Tiêu chuẩn sản phẩm của dây chuyền công nghệ", 4.0, s07, "Chuẩn hóa sản phẩm theo tiêu chuẩn quốc tế ISO, CE, FDA."));

        double scoreT = Math.Min(30.0, s01 + s02 + s03 + s04 + s05 + s06 + s07);

        // -------------------------------------------------------------
        // NHÓM E: HIỆU QUẢ KHAI THÁC CÔNG NGHỆ (MAX 20 ĐIỂM)
        // -------------------------------------------------------------
        // TC08: Năng suất lao động (K_ns) - Max 5đ
        double kChuan4 = benchmark.KChuan4;
        double kNs = (mTt > 0 && gSp > 0) ? (gSp / 1_000_000.0) / mTt : 0;
        double s08 = 1.0;
        if (kNs >= 3.0 * kChuan4) s08 = 5.0;
        else if (kNs >= 2.0 * kChuan4) s08 = 4.0;
        else if (kNs >= 1.0 * kChuan4) s08 = 3.0;
        else if (kNs >= 0.5 * kChuan4) s08 = 2.0;
        else s08 = 1.0;
        criteria.Add(CreateCriterion("TC08", "E", "Năng suất lao động bình quân (K_ns)", 5.0, s08, $"Nâng cao giá trị sản xuất trên đầu công nhân (chuẩn ngành = {kChuan4} trđ/người/năm)."));

        // TC09: Sáng kiến Kaizen - Max 3đ
        double s09 = 0;
        if (survey.HasKaizenPolicy) s09 += 1.0;
        if (survey.KaizenCount3Years >= 3) s09 += 1.0;
        if (survey.HasHighImpactKaizen) s09 += 1.0;
        s09 = Math.Clamp(s09, 1.0, 3.0);
        criteria.Add(CreateCriterion("TC09", "E", "Áp dụng sáng kiến, cải tiến kỹ thuật, hợp lý hóa sản xuất", 3.0, s09, "Xây dựng phong trào thi đua phát huy sáng kiến Kaizen trong nhà máy."));

        // TC10: Năng lực bảo dưỡng - Max 4đ
        double s10 = Math.Clamp(survey.MaintenanceLevel, 1, 4);
        criteria.Add(CreateCriterion("TC10", "E", "Năng lực bảo dưỡng, sửa chữa máy móc, thiết bị", 4.0, s10, "Nâng cao năng lực bảo dưỡng chẩn đoán tổng thể."));

        // TC11: Tiếp nhận chuyển giao công nghệ - Max 4đ
        var techTypes = survey.TransferredTechTypes ?? new List<string>();
        double s11 = 1.0;
        if (techTypes.Contains("sang_che")) s11 = 4.0;
        else if (techTypes.Contains("cai_tien")) s11 = 3.0;
        else if (techTypes.Contains("ban_quyen")) s11 = 2.0;
        else if (techTypes.Contains("dong_bo")) s11 = 1.0;
        criteria.Add(CreateCriterion("TC11", "E", "Khả năng tiếp nhận chuyển giao công nghệ", 4.0, s11, "Tiếp cận chuyển giao công nghệ bản quyền và sáng chế."));

        // TC12: Chất lượng nhân lực - Max 4đ
        double s12 = 0;
        if (mTt > 0 && ((double)survey.HighSkilledWorkers / mTt) >= 0.20) s12 += 1.0;
        if (mGt > 0 && ((double)survey.QualifiedManagers / mGt) >= 0.50) s12 += 1.0;
        if (mGt > 0 && ((double)survey.QualifiedProfessionals / mGt) >= 0.60) s12 += 1.0;
        if (mTt > 0 && ((double)survey.TrainedWorkers / mTt) >= 0.80) s12 += 1.0;
        s12 = Math.Clamp(s12, 1.0, 4.0);
        criteria.Add(CreateCriterion("TC12", "E", "Chất lượng nguồn nhân lực sản xuất", 4.0, s12, "Đào tạo nâng cao tay nghề thợ bậc cao và chuẩn hóa cán bộ quản lý."));

        double scoreE = Math.Min(20.0, s08 + s09 + s10 + s11 + s12);

        // -------------------------------------------------------------
        // NHÓM O: NĂNG LỰC TỔ CHỨC, QUẢN LÝ (MAX 19 ĐIỂM)
        // -------------------------------------------------------------
        // TC13: Chi phí đào tạo huấn luyện (K_dthl) - Max 3đ
        double gDthl = survey.TrainingCost3Years;
        double kDthl = gDt > 0 ? (gDthl / gDt) * 100.0 : 0;
        double s13 = kDthl switch
        {
            >= 2.0 => 3.0,
            >= 1.0 => 2.0,
            >= 0.5 => 1.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC13", "O", "Tỷ lệ chi phí cho đào tạo, huấn luyện (K_đthl)", 3.0, s13, "Dành tối thiểu 1% doanh thu cho ngân sách đào tạo huấn luyện nhân lực."));

        // TC14: Phần mềm quản lý (MES, ERP, SCM...) - Max 5đ
        var softList = survey.SoftwareApplications ?? new List<string>();
        double s14 = softList.Count switch
        {
            >= 5 => 5.0,
            4 => 4.0,
            3 => 3.0,
            2 => 2.0,
            1 => 1.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC14", "O", "Ứng dụng thông tin phục vụ sản xuất, quản lý (MES, ERP, SCM...)", 5.0, s14, "Triển khai các hệ thống MES, ERP, SCM kết nối dữ liệu xuyên suốt."));

        // TC15: Hiệu suất thiết bị tổng thể OEE - Max 5đ
        double pTt = latestFinancial != null && latestFinancial.ActualOutput > 0 ? (double)latestFinancial.ActualOutput : 85.0;
        double p = latestFinancial != null && latestFinancial.DesignedCapacity > 0 ? (double)latestFinancial.DesignedCapacity : 100.0;
        double oeeEst = p > 0 ? (pTt / p) * 100.0 : 75.0;
        double s15 = oeeEst switch
        {
            >= 85.0 => 5.0,
            >= 70.0 => 4.0,
            >= 60.0 => 3.0,
            >= 45.0 => 2.0,
            _ => 1.0
        };
        criteria.Add(CreateCriterion("TC15", "O", "Quản lý hiệu suất thiết bị tổng thể (OEE)", 5.0, s15, "Giảm thiểu thời gian dừng máy và nâng cao hiệu suất vận hành OEE lên trên 70%."));

        // TC16: Hệ thống QLCL tiên tiến - Max 3đ
        var isoList = survey.IsoCertifications ?? new List<string>();
        var prodTools = survey.ProductivityTools ?? new List<string>();
        double s16 = 0;
        if (isoList.Any(i => i.Contains("9001", StringComparison.OrdinalIgnoreCase) || i.Contains("22000", StringComparison.OrdinalIgnoreCase) || i.Contains("haccp", StringComparison.OrdinalIgnoreCase))) s16 += 2.0;
        if (prodTools.Any(pTool => pTool.Contains("5s", StringComparison.OrdinalIgnoreCase) || pTool.Contains("kaizen", StringComparison.OrdinalIgnoreCase) || pTool.Contains("lean", StringComparison.OrdinalIgnoreCase))) s16 += 1.0;
        s16 = Math.Clamp(s16, 1.0, 3.0);
        criteria.Add(CreateCriterion("TC16", "O", "Áp dụng tiêu chuẩn hệ thống quản lý chất lượng tiên tiến (ISO, 5S, Lean)", 3.0, s16, "Duy trì chứng chỉ ISO 9001 và thực hành liên tục 5S/Lean trong nhà xưởng."));

        // TC17: Bảo vệ môi trường - Max 3đ
        double s17 = 1.0;
        if (survey.HasIso14001 && survey.EnvironmentalCompliant && survey.HasWasteRecycling) s17 = 3.0;
        else if (survey.HasIso14001 && survey.EnvironmentalCompliant) s17 = 2.0;
        else if (survey.EnvironmentalCompliant) s17 = 1.0;
        criteria.Add(CreateCriterion("TC17", "O", "Bảo vệ môi trường và quản lý chất thải", 3.0, s17, "Xây dựng hệ thống xử lý chất thải đạt chuẩn và áp dụng chứng chỉ ISO 14001."));

        double scoreO = Math.Min(19.0, s13 + s14 + s15 + s16 + s17);

        // -------------------------------------------------------------
        // NHÓM R: NĂNG LỰC NGHIÊN CỨU, PHÁT TRIỂN (MAX 17 ĐIỂM)
        // -------------------------------------------------------------
        // TC18: Hạ tầng CNTT - Max 3đ
        double s18 = survey.ItInfrastructureLevel > 0
            ? Math.Clamp((double)survey.ItInfrastructureLevel, 1.0, 3.0)
            : 0.0;
        criteria.Add(CreateCriterion("TC18", "R", "Ứng dụng công nghệ thông tin (Hạ tầng phần cứng & phần mềm)", 3.0, s18, "Nâng cấp hạ tầng máy chủ, an ninh mạng và phần mềm tích hợp."));

        // TC19: Chi phí thông tin (K_tt) - Max 3đ
        double gTt = survey.ItExpenses3Years;
        double kTt = gDt > 0 ? (gTt / gDt) * 100.0 : 0;
        double s19 = kTt switch
        {
            >= 0.25 => 3.0,
            >= 0.05 => 2.0,
            >= 0.01 => 1.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC19", "R", "Chi phí thông tin và công nghệ thông tin (K_tt)", 3.0, s19, "Dành tối thiểu 0.05% doanh thu mua bản quyền phần mềm và dữ liệu KH&CN."));

        // TC20: Nhân lực R&D (M_r&d) - Max 4đ (Phân nhánh theo quy mô DN)
        int mRd = survey.RdWorkforceCount;
        double totalCap = survey.TotalCapital;
        double h5 = m > 0 ? ((double)mRd / m) * 100.0 : 0;
        double s20 = 0.0;
        if (mRd > 0)
        {
            if (totalCap >= 1_000_000_000_000 && m >= 3000)
            {
                if (h5 >= 1.0 && mRd >= 50) s20 = 4.0;
                else if (h5 >= 0.8 && mRd >= 40) s20 = 3.0;
                else if (h5 >= 0.6 && mRd >= 30) s20 = 2.0;
                else s20 = 1.0;
            }
            else if (totalCap >= 100_000_000_000 && m >= 200)
            {
                if (h5 >= 2.5 && mRd >= 15) s20 = 4.0;
                else if (h5 >= 2.0 && mRd >= 12) s20 = 3.0;
                else if (h5 >= 1.5 && mRd >= 9) s20 = 2.0;
                else s20 = 1.0;
            }
            else
            {
                if (h5 >= 5.0) s20 = 4.0;
                else if (h5 >= 4.0) s20 = 3.0;
                else if (h5 >= 3.0) s20 = 2.0;
                else s20 = 1.0;
            }
        }
        criteria.Add(CreateCriterion("TC20", "R", "Nhân lực dành cho nghiên cứu và phát triển (M_r&d)", 4.0, s20, "Xây dựng đội ngũ kỹ sư chuyên trách hoạt động nghiên cứu phát triển."));

        // TC21: Hạ tầng R&D - Max 3đ
        double s21 = survey.RdFacilityLevel > 0
            ? Math.Clamp((double)survey.RdFacilityLevel, 1.0, 3.0)
            : 0.0;
        criteria.Add(CreateCriterion("TC21", "R", "Hạ tầng dành cho nghiên cứu và phát triển (Phòng Lab/CAD/Testing)", 3.0, s21, "Thành lập phòng thí nghiệm, phòng thiết kế CAD/CAM riêng biệt."));

        // TC22: Quỹ KHCN & Chi phí R&D - Max 4đ
        double gRd = survey.RdExpenses3Years;
        double kRd = gDt > 0 ? (gRd / gDt) * 100.0 : 0;
        double s22 = 0;
        if (survey.HasSciTechFund) s22 += 1.0;
        if (kRd >= 1.5) s22 += 3.0;
        else if (kRd >= 0.8) s22 += 2.0;
        else if (kRd >= 0.4) s22 += 1.0;
        s22 = Math.Clamp(s22, 0.0, 4.0);
        criteria.Add(CreateCriterion("TC22", "R", "Quỹ phát triển KH&CN và đầu tư cho hoạt động R&D", 4.0, s22, "Trích lập Quỹ KH&CN và nâng tỷ lệ chi R&D lên trên 1% doanh thu."));

        double scoreR = Math.Min(17.0, s18 + s19 + s20 + s21 + s22);

        // -------------------------------------------------------------
        // NHÓM I: NĂNG LỰC ĐỔI MỚI SÁNG TẠO (MAX 14 ĐIỂM)
        // -------------------------------------------------------------
        // TC23: Kết quả nghiên cứu sản phẩm mới - Max 4đ
        double s23 = survey.NewProductType switch
        {
            "hoan_toan_moi" => 3.0,
            "tinh_nang" => 2.0,
            "kieu_dang" => 1.0,
            _ => 0.0
        };
        if (s23 > 0 && survey.NewProductRevenueRatio >= 20.0) s23 = Math.Min(4.0, s23 + 1.0);
        criteria.Add(CreateCriterion("TC23", "I", "Kết quả nghiên cứu, phát triển sản phẩm mới", 4.0, s23, "Đẩy mạnh thương mại hóa các sản phẩm mới có tính năng đột phá."));

        // TC24: Kết quả nghiên cứu công nghệ mới - Max 4đ
        double s24 = survey.RdTechnologyResult switch
        {
            "bang_sang_che" => 4.0,
            "giai_phap_huu_ich" => 3.0,
            "thu_nghiem_lab" => 2.0,
            "dang_nghien_cuu" => 1.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC24", "I", "Kết quả nghiên cứu, phát triển công nghệ (Bằng sáng chế, GPHI)", 4.0, s24, "Đăng ký bảo hộ sở hữu trí tuệ dưới dạng bằng sáng chế hoặc giải pháp hữu ích."));

        // TC25: Năng lực liên kết hợp tác R&D - Max 2đ
        double s25 = survey.AcademyPartnershipType switch
        {
            "du_an_rd" => 2.0,
            "chuyen_gia_dao_tao" => 1.0,
            _ => 0.0
        };
        criteria.Add(CreateCriterion("TC25", "I", "Năng lực liên kết, hợp tác nghiên cứu, phát triển với Viện/Trường", 2.0, s25, "Hợp tác nghiên cứu phát triển công nghệ với viện nghiên cứu, trường đại học."));

        // TC26: Chuyển đổi số - Max 4đ
        double s26Strat = survey.DigitalStrategyLevel switch
        {
            "da_xay_dung" => 1.0,
            "dang_thuc_hien" => 1.0,
            "chuan_bi" => 0.5,
            _ => 0.0
        };
        var digTechs = survey.DigitalTechnologies ?? new List<string>();
        double s26Tech = 0;
        if (digTechs.Count >= 3 && survey.DigitalAdoptionScope == "toan_nha_may") s26Tech = 3.0;
        else if (digTechs.Count >= 2 || survey.DigitalAdoptionScope == "mot_so_bo_phan") s26Tech = 2.0;
        else if (digTechs.Count >= 1 || survey.DigitalAdoptionScope == "nghien_cuu") s26Tech = 1.0;

        double s26 = Math.Min(4.0, Math.Round((s26Strat + s26Tech) * 10.0) / 10.0);
        criteria.Add(CreateCriterion("TC26", "I", "Năng lực chuyển đổi số trong sản xuất (Chiến lược & Công nghệ 4.0)", 4.0, s26, "Ban hành chiến lược chuyển đổi số và ứng dụng các công nghệ IoT, Robot, Big Data."));

        double scoreI = Math.Min(14.0, s23 + s24 + s25 + s26);

        // -------------------------------------------------------------
        // TỔNG KẾT & HỆ SỐ ĐỒNG BỘ T_DB
        // -------------------------------------------------------------
        double total = Math.Round((scoreT + scoreE + scoreO + scoreR + scoreI) * 10.0) / 10.0;
        double sync = 0;
        if (scoreT > 0 && scoreE > 0 && scoreO > 0 && scoreR > 0 && scoreI > 0)
        {
            sync = Math.Round(
                Math.Pow(scoreT / 30.0, 0.30) *
                Math.Pow(scoreE / 20.0, 0.20) *
                Math.Pow(scoreO / 19.0, 0.19) *
                Math.Pow(scoreR / 17.0, 0.17) *
                Math.Pow(scoreI / 14.0, 0.14) * 100.0
            ) / 100.0;
        }

        string classification = "CAN_THAM_DINH";
        string classificationLabel = "Cần thẩm định chuyên gia";

        if (total >= 75.0 && sync >= 0.65)
        {
            classification = "TIEN_TIEN";
            classificationLabel = "Tiên tiến";
        }
        else if (total >= 60.0 && total < 75.0 && sync >= 0.50)
        {
            classification = "TRUNG_BINH_TIEN_TIEN";
            classificationLabel = "Trung bình tiên tiến";
        }
        else if (total >= 35.0 && total < 60.0 && sync >= 0.30)
        {
            classification = "TRUNG_BINH";
            classificationLabel = "Trung bình";
        }
        else if (total < 35.0 && sync < 0.30)
        {
            classification = "LAC_HAU";
            classificationLabel = "Lạc hậu";
        }

        foreach (var c in criteria.Where(c => c.IsBottleneck))
        {
            bottlenecks.Add(c.Code);
        }

        return new Tt17ScoreResultDto
        {
            ScoreT = Math.Round(scoreT * 10.0) / 10.0,
            ScoreE = Math.Round(scoreE * 10.0) / 10.0,
            ScoreO = Math.Round(scoreO * 10.0) / 10.0,
            ScoreR = Math.Round(scoreR * 10.0) / 10.0,
            ScoreI = Math.Round(scoreI * 10.0) / 10.0,
            TotalScore = total,
            SyncCoefficient = sync,
            Classification = classification,
            ClassificationLabel = classificationLabel,
            Criteria = criteria,
            Bottlenecks = bottlenecks
        };
    }

    public static double CalculateLaborProductivityGrowth(List<FinancialSeriesDto>? series)
    {
        if (series == null || series.Count < 2) return 5.0;
        var ordered = series.OrderBy(f => f.Year).ToList();
        var y1 = ordered.First();
        var yLast = ordered.Last();

        double val1 = (double)(y1.IndustrialOutputValue > 0 ? y1.IndustrialOutputValue : y1.NetRevenue);
        int workers1 = y1.DirectWorkersCount;
        double prod1 = workers1 > 0 ? val1 / workers1 : 0;

        double valLast = (double)(yLast.IndustrialOutputValue > 0 ? yLast.IndustrialOutputValue : yLast.NetRevenue);
        int workersLast = yLast.DirectWorkersCount;
        double prodLast = workersLast > 0 ? valLast / workersLast : 0;

        if (prod1 <= 0) return 5.0;
        double totalGrowth = ((prodLast - prod1) / prod1) * 100.0;
        int years = Math.Max(1, yLast.Year - y1.Year);
        return Math.Round((totalGrowth / years) * 100.0) / 100.0;
    }

    private static CriterionScoreDto CreateCriterion(string code, string group, string name, double maxScore, double achieved, string recommendation)
    {
        return new CriterionScoreDto
        {
            Code = code,
            Group = group,
            Name = name,
            MaxScore = maxScore,
            AchievedScore = Math.Round(achieved * 10.0) / 10.0,
            IsBottleneck = achieved < (maxScore * 0.40),
            Recommendation = recommendation
        };
    }
}
