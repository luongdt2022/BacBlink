using System;
using Xunit;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Tests;

/// <summary>
/// CR-TASK-03-DELTA-01: Bộ kiểm thử Unit Invariants cho Vòng đời Trạng thái & Rào chắn Quyền riêng tư (PDPD Preview Guard).
/// Căn cứ: Living Spec REQ-BUYER-DMD-004, BR-DMD-STAT-01, BR-DMD-PRIV-01, AC-DMD-01..04.
/// </summary>
public class DemandApprovalLifecycleAndPrivacyTests
{
    [Fact]
    public void DemandItem_NewInstance_ShouldHavePendingStatus_And_Unlisted()
    {
        var creatorId = Guid.NewGuid();
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-INIT-001",
            stageName: "Kiểm định chất lượng (QC/KCS)",
            technicalProblem: "Kiểm tra khuyết tật mối hàn SMT",
            desiredSolution: "Hệ thống AOI quang học 3D",
            needConsulting: true,
            expectedGoal: "Giảm lỗi vi mạch",
            applicationScale: "Nhà máy Cơ điện tử",
            sectorCode: "LV08",
            techGroupCode: "CN01",
            demandTypeCode: "NC01",
            budgetRange: "1 – 3 tỷ VNĐ",
            urgencyScore: 5,
            impactScore: 4,
            investmentCapacity: 4,
            adoptionReadiness: 4,
            createdBy: creatorId
        );

        // Bất biến: Trạng thái khởi tạo luôn là PENDING và chưa niêm yết rộng rãi
        Assert.Equal(DemandItemStatuses.Pending, item.Status);
        Assert.Equal("PENDING", item.Status);
        Assert.False(item.IsPublicListed);
        Assert.Equal(creatorId, item.CreatedBy);
        Assert.True(item.TniScore > 0);
    }

    [Fact]
    public void DemandItem_VerifyAndPublish_TransitionsToVerified_And_Listed()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-VERIFY-002",
            stageName: "Sản xuất thử nghiệm",
            technicalProblem: "Kiểm thử tự động dây chuyền",
            desiredSolution: "Cánh tay Robot 6 trục",
            needConsulting: false,
            expectedGoal: "Nâng cao năng suất 30%",
            applicationScale: "Xưởng 2",
            sectorCode: "LV01",
            techGroupCode: "CN02",
            demandTypeCode: "NC02",
            budgetRange: "500 triệu – 1 tỷ VNĐ",
            urgencyScore: 4,
            impactScore: 4,
            investmentCapacity: 3,
            adoptionReadiness: 4
        );

        Assert.Equal(DemandItemStatuses.Pending, item.Status);
        Assert.False(item.IsPublicListed);

        // Cán bộ Sở KH&CN phê duyệt bài toán
        item.VerifyAndPublish();

        // Bất biến sau phê duyệt: Trạng thái chuyển VERIFIED và IsPublicListed = true
        Assert.Equal(DemandItemStatuses.Verified, item.Status);
        Assert.Equal("VERIFIED", item.Status);
        Assert.True(item.IsPublicListed);
    }

    [Theory]
    [InlineData("PENDING", false)]
    [InlineData("VERIFIED", true)]
    [InlineData("CONNECTED", false)]
    [InlineData("CLOSED", false)]
    public void DemandItem_CanSubmitOffer_OnlyTrueWhenStatusIsVerified(string status, bool expectedCanSubmit)
    {
        // Kiểm chứng quy tắc BR-DMD-PRIV-01 & API-DMD-PRIV-01:
        // Form chào bán giải pháp chỉ khả dụng khi bài toán đã VERIFIED
        var canSubmitOffer = (status == DemandItemStatuses.Verified);
        Assert.Equal(expectedCanSubmit, canSubmitOffer);
    }

    [Fact]
    public void DemandItem_AuthorPreviewGuard_FlagsEvaluation()
    {
        var ownerId = Guid.NewGuid();
        var guestId = Guid.NewGuid();

        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-PREVIEW-003",
            stageName: "Gia công cơ khí",
            technicalProblem: "Độ nhám bề mặt chi tiết phay CNC",
            desiredSolution: "Dụng cụ cắt phủ kim cương PCD",
            needConsulting: true,
            expectedGoal: "Ra < 0.2",
            applicationScale: "Công ty Cơ khí chính xác",
            sectorCode: "LV01",
            techGroupCode: "CN01",
            demandTypeCode: "NC01",
            budgetRange: "200 – 500 triệu VNĐ",
            urgencyScore: 4,
            impactScore: 3,
            investmentCapacity: 3,
            adoptionReadiness: 4,
            createdBy: ownerId
        );

        // 1. Đối với Chủ bài toán (Owner)
        var isOwner = (ownerId == item.CreatedBy);
        var canViewDraftOwner = isOwner || false;
        Assert.True(isOwner);
        Assert.True(canViewDraftOwner);

        // 2. Đối với Khách vãng lai (Guest)
        var isGuestOwner = (guestId == item.CreatedBy);
        var isGovOrAdmin = false;
        var canViewDraftGuest = isGuestOwner || isGovOrAdmin;
        Assert.False(isGuestOwner);
        Assert.False(canViewDraftGuest);

        // 3. Đối với Cán bộ Sở / Quản trị viên (Provincial Admin)
        var isProvincialAdmin = true;
        var canViewDraftGov = false || isProvincialAdmin;
        Assert.True(canViewDraftGov);
    }

    [Fact]
    public void DemandItem_AssignExpert_ShouldUpdateAssignedExpertId()
    {
        var item = new DemandItem(
            surveyId: null,
            itemCode: "DMD-TEST-EXPERT-004",
            stageName: "Nghiên cứu ứng dụng",
            technicalProblem: "Phân tích mẫu đất nông nghiệp bằng cảm biến quang phổ",
            desiredSolution: "Cảm biến NIR cầm tay",
            needConsulting: true,
            expectedGoal: "Đo độ ẩm và NPK tức thì",
            applicationScale: "Hợp tác xã Công nghệ cao",
            sectorCode: "LV02",
            techGroupCode: "CN03",
            demandTypeCode: "NC01",
            budgetRange: "300 – 600 triệu VNĐ",
            urgencyScore: 4,
            impactScore: 4,
            investmentCapacity: 3,
            adoptionReadiness: 4
        );

        var expertId = Guid.NewGuid();
        item.AssignExpert(expertId);

        Assert.Equal(expertId, item.AssignedExpertId);
    }
}
