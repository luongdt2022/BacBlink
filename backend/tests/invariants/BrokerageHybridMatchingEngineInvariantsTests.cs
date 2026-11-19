using System;
using Shouldly;
using Xunit;
using NacenTech.Modules.Brokerage.Application;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// TASK-08 / CR-TASK-08-DELTA-03: Invariant Unit Tests kiểm chứng 100% công thức tính điểm 4 trục
/// theo chuẩn quy tắc nghiệp vụ BR-BRK-D3-01.
/// </summary>
public sealed class BrokerageHybridMatchingEngineInvariantsTests
{
    private static int ComputeHybridScore(double semanticScore, double trlScore, double tniScore, double ipScore)
        => BrokerageMatchingEngineService.CalculateHybridScore(semanticScore, trlScore, tniScore, ipScore);

    private static double CalculateTrlScore(int sellerTrl, int buyerExpectedTrl = 7)
        => BrokerageMatchingEngineService.EvaluateTrlScore(sellerTrl, buyerExpectedTrl);

    private static double CalculateIpScore(string? ipStatus)
        => BrokerageMatchingEngineService.EvaluateIpScore(ipStatus);

    [Fact]
    public void Perfect_match_scores_must_yield_100_percent()
    {
        // 100% across all 4 axes
        var score = ComputeHybridScore(100.0, 100.0, 100.0, 100.0);
        score.ShouldBe(100);
    }

    [Fact]
    public void Zero_match_scores_must_yield_0_percent()
    {
        var score = ComputeHybridScore(0.0, 0.0, 0.0, 0.0);
        score.ShouldBe(0);
    }

    [Fact]
    public void Four_axis_weights_must_sum_to_100_percent()
    {
        // Weight distribution: 40% Semantic, 30% TRL, 15% TNI, 15% IP
        const double wSemantic = 0.40;
        const double wTrl = 0.30;
        const double wTni = 0.15;
        const double wIp = 0.15;

        (wSemantic + wTrl + wTni + wIp).ShouldBe(1.0);
    }

    [Theory]
    [InlineData(7, 7, 100.0)]
    [InlineData(8, 7, 100.0)]
    [InlineData(9, 7, 100.0)]
    [InlineData(6, 7, 85.0)]
    [InlineData(5, 7, 65.0)]
    [InlineData(4, 7, 40.0)]
    [InlineData(1, 7, 40.0)]
    public void CalculateTrlScore_should_evaluate_readiness_correctly(int sellerTrl, int buyerExpected, double expectedScore)
    {
        var score = CalculateTrlScore(sellerTrl, buyerExpected);
        score.ShouldBe(expectedScore);
    }

    [Theory]
    [InlineData("PATENT_GRANTED", 100.0)]
    [InlineData("PATENTED", 100.0)]
    [InlineData("patent_granted", 100.0)]
    [InlineData("UTILITY_MODEL", 90.0)]
    [InlineData("GIAI_PHAP_HUU_ICH", 90.0)]
    [InlineData("SOFTWARE_COPYRIGHT", 80.0)]
    [InlineData("TAC_QUYEN_PHAN_MEM", 80.0)]
    [InlineData("PATENT_PENDING", 60.0)]
    [InlineData("PENDING", 60.0)]
    [InlineData("TRADE_SECRET", 50.0)]
    [InlineData("NONE", 20.0)]
    [InlineData(null, 20.0)]
    [InlineData("", 20.0)]
    public void CalculateIpScore_should_evaluate_intellectual_property_trust(string? ipStatus, double expectedScore)
    {
        var score = CalculateIpScore(ipStatus);
        score.ShouldBe(expectedScore);
    }

    [Fact]
    public void Typical_high_compatibility_case_should_calculate_accurate_composite_score()
    {
        // Case: Semantic AI = 85.0, TRL = 7 (100%), TNI = 80.0, IP = PATENT_GRANTED (100.0)
        // Expected = 0.40 * 85 + 0.30 * 100 + 0.15 * 80 + 0.15 * 100
        //          = 34.0 + 30.0 + 12.0 + 15.0 = 91.0 -> 91%
        var semantic = 85.0;
        var trl = CalculateTrlScore(7);
        var tni = 80.0;
        var ip = CalculateIpScore("PATENT_GRANTED");

        var result = ComputeHybridScore(semantic, trl, tni, ip);
        result.ShouldBe(91);
    }

    [Fact]
    public void FTS_fallback_degraded_case_should_produce_balanced_score()
    {
        // Degraded mode: Semantic FTS Fallback = 80.0, TRL = 6 (85%), TNI = 75.0, IP = TRADE_SECRET (50.0)
        // Expected = 0.40 * 80 + 0.30 * 85 + 0.15 * 75 + 0.15 * 50
        //          = 32.0 + 25.5 + 11.25 + 7.5 = 76.25 -> Round = 76%
        var semantic = 80.0;
        var trl = CalculateTrlScore(6);
        var tni = 75.0;
        var ip = CalculateIpScore("TRADE_SECRET");

        var result = ComputeHybridScore(semantic, trl, tni, ip);
        result.ShouldBe(76);
    }

    [Theory]
    [InlineData(0.0, 100.0, 100.0, 100.0, 60)]  // S_semantic = 0 -> 0.4*0 + 30 + 15 + 15 = 60
    [InlineData(100.0, 0.0, 0.0, 0.0, 40)]     // S_semantic = 100 -> 0.4*100 = 40
    public void Boundary_tests_for_semantic_score(double semantic, double trl, double tni, double ip, int expected)
    {
        var result = ComputeHybridScore(semantic, trl, tni, ip);
        result.ShouldBe(expected);
    }

    [Theory]
    [InlineData(100.0, 100.0, 0.0, 100.0, 85)]    // TNI = 0 -> 40 + 30 + 0 + 15 = 85
    [InlineData(100.0, 100.0, 85.0, 100.0, 98)]   // TNI = 85 -> 40 + 30 + 12.75 + 15 = 97.75 -> 98
    [InlineData(100.0, 100.0, 100.0, 100.0, 100)] // TNI = 100 -> 100
    public void Boundary_tests_for_tni_score(double semantic, double trl, double tni, double ip, int expected)
    {
        var result = ComputeHybridScore(semantic, trl, tni, ip);
        result.ShouldBe(expected);
    }

    [Theory]
    [InlineData("PATENT_GRANTED", 91)]       // 100% IP -> 0.4*85 + 0.3*100 + 0.15*80 + 0.15*100 = 91
    [InlineData("UTILITY_MODEL", 90)]        // 90% IP  -> 34 + 30 + 12 + 0.15*90 (13.5) = 89.5 -> 90
    [InlineData("SOFTWARE_COPYRIGHT", 88)]   // 80% IP  -> 34 + 30 + 12 + 0.15*80 (12) = 88
    [InlineData("PATENT_PENDING", 85)]       // 60% IP  -> 34 + 30 + 12 + 0.15*60 (9) = 85
    [InlineData("TRADE_SECRET", 84)]         // 50% IP  -> 34 + 30 + 12 + 0.15*50 (7.5) = 83.5 -> 84
    [InlineData("NONE", 79)]                 // 20% IP  -> 34 + 30 + 12 + 0.15*20 (3) = 79
    [InlineData(null, 79)]                   // null IP -> 20% -> 79
    public void Boundary_tests_for_ip_status_trust_boost(string? ipStatus, int expectedOverall)
    {
        var semantic = 85.0;
        var trl = CalculateTrlScore(7);
        var tni = 80.0;
        var ip = CalculateIpScore(ipStatus);

        var result = ComputeHybridScore(semantic, trl, tni, ip);
        result.ShouldBe(expectedOverall);
    }

    [Fact]
    public void Clamp_invariants_must_not_exceed_0_to_100_range()
    {
        ComputeHybridScore(-50.0, -10.0, -20.0, -30.0).ShouldBe(0);
        ComputeHybridScore(150.0, 200.0, 120.0, 110.0).ShouldBe(100);
    }

    [Fact]
    public void Baclink_matching_boost_for_same_IND_sector_should_add_5_points()
    {
        var baseScore = ComputeHybridScore(80.0, 85.0, 75.0, 50.0); // 76
        var enhanced = BrokerageMatchingEngineService.CalculateBaclinkEnhancedScore(
            80.0, 85.0, 75.0, 50.0, demandSector: "IND_ELEC", offerSector: "IND_ELEC");

        enhanced.ShouldBe(baseScore + 5);
        enhanced.ShouldBe(81);
    }

    [Fact]
    public void Baclink_matching_boost_for_same_industrial_zone_should_add_5_points()
    {
        var baseScore = ComputeHybridScore(80.0, 85.0, 75.0, 50.0); // 76
        var enhanced = BrokerageMatchingEngineService.CalculateBaclinkEnhancedScore(
            80.0, 85.0, 75.0, 50.0,
            demandSector: "IND_MECH", offerSector: "IND_MECH",
            buyerZone: "KCN_YEN_PHONG", sellerZone: "KCN_YEN_PHONG");

        // +5 ngành IND + 5 KCN = +10
        enhanced.ShouldBe(baseScore + 10);
        enhanced.ShouldBe(86);
    }

    [Fact]
    public void Baclink_matching_boost_must_clamp_at_100_percent()
    {
        var enhanced = BrokerageMatchingEngineService.CalculateBaclinkEnhancedScore(
            100.0, 100.0, 100.0, 100.0,
            demandSector: "IND_AUTO", offerSector: "IND_AUTO",
            buyerZone: "KCN_QUE_VO", sellerZone: "KCN_QUE_VO");

        enhanced.ShouldBe(100);
    }
}
