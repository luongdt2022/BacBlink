using System;
using Xunit;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Tests;

public class DemandItemLifecycleTests
{
    [Fact]
    public void DemandItem_Create_ShouldInitializeWithPendingStatusAndCalculatedTni()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-001",
            stageName: "Gia công",
            technicalProblem: "Lỗi nhiệt luyện",
            desiredSolution: "Cải tiến lò",
            needConsulting: true,
            expectedGoal: "Giảm lỗi",
            applicationScale: "Xưởng 1",
            sectorCode: "LV01",
            techGroupCode: "CN01",
            demandTypeCode: "NC01",
            budgetRange: "500 triệu – 1 tỷ VNĐ",
            urgencyScore: 4,
            impactScore: 4,
            investmentCapacity: 3,
            adoptionReadiness: 4
        );

        Assert.Equal("PENDING", item.Status);
        Assert.False(item.IsPublicListed);
        Assert.True(item.TniScore > 0);
        Assert.Equal("DMD-TEST-001", item.ItemCode);
    }

    [Fact]
    public void DemandItem_Update_ShouldRecalculateTniAndPreserveCode()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-002",
            stageName: "Đúc phôi",
            technicalProblem: "Nứt khuôn",
            desiredSolution: null,
            needConsulting: false,
            expectedGoal: "Tăng độ bền",
            applicationScale: null,
            sectorCode: "LV01",
            techGroupCode: "CN01",
            demandTypeCode: "NC01",
            budgetRange: "100 – 300 triệu VNĐ",
            urgencyScore: 2,
            impactScore: 2,
            investmentCapacity: 2,
            adoptionReadiness: 2
        );

        var initialTni = item.TniScore; // 40 (Low)
        Assert.Equal(40, initialTni);

        // Update với các điểm cao hơn K=5, L=5, N=5, O=5
        item.Update(
            stageName: "Đúc phôi tự động",
            technicalProblem: "Nứt khuôn và co ngót",
            desiredSolution: "Công nghệ biến tính hạt",
            needConsulting: true,
            expectedGoal: "Triệt tiêu nứt",
            applicationScale: "Toàn bộ dây chuyền",
            sectorCode: "LV02",
            techGroupCode: "CN05",
            demandTypeCode: "NC03",
            budgetRange: "1 – 3 tỷ VNĐ",
            urgencyScore: 5,
            impactScore: 5,
            investmentCapacity: 5,
            adoptionReadiness: 5
        );

        Assert.Equal("Đúc phôi tự động", item.StageName);
        Assert.Equal("Nứt khuôn và co ngót", item.TechnicalProblem);
        Assert.Equal("LV02", item.SectorCode);
        Assert.Equal(100, item.TniScore); // Recalculated to 100
        Assert.Equal("VeryHigh", item.TniClassification);
        Assert.Equal("DMD-TEST-002", item.ItemCode);
    }

    [Fact]
    public void DemandItem_Close_ShouldSetStatusToClosedAndDelist()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-003",
            stageName: "Đóng gói",
            technicalProblem: "Tốc độ chậm",
            desiredSolution: null,
            needConsulting: false,
            expectedGoal: "Tự động hóa",
            applicationScale: null,
            sectorCode: "LV01",
            techGroupCode: "CN01",
            demandTypeCode: "NC01",
            budgetRange: "500 triệu – 1 tỷ VNĐ",
            urgencyScore: 4,
            impactScore: 4,
            investmentCapacity: 3,
            adoptionReadiness: 4
        );

        item.VerifyAndPublish();
        Assert.Equal("VERIFIED", item.Status);
        Assert.True(item.IsPublicListed);

        // Đóng bài toán
        item.Close();
        Assert.Equal(DemandItemStatuses.Closed, item.Status);
        Assert.False(item.IsPublicListed);
    }

    [Fact]
    public void DemandItem_VerifyAndPublish_ShouldUpdateTniVerificationStatusAndAuthority()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-004",
            stageName: "Kiểm thử",
            technicalProblem: "Độ chính xác cảm biến",
            desiredSolution: "Cảm biến quang học",
            needConsulting: true,
            expectedGoal: "Nâng độ chính xác",
            applicationScale: "Phòng LAB",
            sectorCode: "LV03",
            techGroupCode: "CN02",
            demandTypeCode: "NC02",
            budgetRange: "300 – 500 triệu VNĐ",
            urgencyScore: 4,
            impactScore: 5,
            investmentCapacity: 4,
            adoptionReadiness: 3
        );

        Assert.Equal("SELF_DECLARED", item.TniVerificationStatus);
        Assert.Null(item.VerifiedAuthorityName);

        item.VerifyAndPublish("Sở Khoa học và Công nghệ TP. Hà Nội");

        Assert.Equal("VERIFIED", item.Status);
        Assert.True(item.IsPublicListed);
        Assert.Equal("VERIFIED_BY_GOV", item.TniVerificationStatus);
        Assert.Equal("Sở Khoa học và Công nghệ TP. Hà Nội", item.VerifiedAuthorityName);
    }

    [Fact]
    public void DemandItem_VerifyTni_ShouldUpdateDecisionAndReviewNote()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-005",
            stageName: "Nghiên cứu",
            technicalProblem: "Thuật toán tối ưu",
            desiredSolution: "AI Engine",
            needConsulting: true,
            expectedGoal: "Rút ngắn thời gian",
            applicationScale: "Toàn quốc",
            sectorCode: "LV04",
            techGroupCode: "CN04",
            demandTypeCode: "NC01",
            budgetRange: "1 – 3 tỷ VNĐ",
            urgencyScore: 5,
            impactScore: 5,
            investmentCapacity: 4,
            adoptionReadiness: 4
        );

        Assert.Equal("SELF_DECLARED", item.TniVerificationStatus);

        // Whitelist check
        Assert.Throws<ArgumentException>(() => item.VerifyTni("UNKNOWN_STATUS", "Sở KH&CN"));
        Assert.Throws<ArgumentException>(() => item.VerifyTni(new string('X', 35), "Sở KH&CN"));

        item.VerifyTni("VERIFIED_BY_GOV", "Sở KH&CN Hà Nội", "Chỉ số TNI đạt loại VeryHigh (90 điểm), đã thẩm tra hồ sơ năng lực");

        Assert.Equal("VERIFIED_BY_GOV", item.TniVerificationStatus);
        Assert.Equal("Sở KH&CN Hà Nội", item.VerifiedAuthorityName);
        Assert.Equal("Chỉ số TNI đạt loại VeryHigh (90 điểm), đã thẩm tra hồ sơ năng lực", item.TniReviewNote);
    }
}
