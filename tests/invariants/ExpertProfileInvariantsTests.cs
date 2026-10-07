using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using Shouldly;
using System.Text.Json;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class ExpertProfileInvariantsTests
{
    [Fact]
    public void Legacy_profile_can_be_linked_once_to_its_authenticated_person_only()
    {
        var owner = Guid.NewGuid();
        var profile = new ExpertProfile(
            null, "TS. Nguyễn Văn C", 1980, "male", "001080012345", new DateOnly(2021, 5, 20), "NONE", null,
            "DOCTOR", 2015, "Viện NacenTech", null, null, null, [], null, null, null, null, false, false, DateTimeOffset.UtcNow);

        profile.LinkToPerson(owner);
        profile.LinkToPerson(owner); // fixture phải idempotent khi khởi động lại
        profile.PersonId.ShouldBe(owner);
        Should.Throw<ValidationException>(() => profile.LinkToPerson(Guid.NewGuid()));
    }

    [Fact]
    public void Creating_valid_expert_profile_sets_status_to_pending_review()
    {
        var personId = Guid.NewGuid();
        var profile = new ExpertProfile(
            personId: personId,
            fullName: "TS. Trần Văn Minh",
            birthYear: 1980,
            gender: "male",
            idCardNumber: "001080012345",
            idCardDate: new DateOnly(2021, 5, 20),
            academicRank: "PGS",
            academicRankYear: 2023,
            degree: "DOCTOR",
            degreeYear: 2015,
            organizationName: "Đại học Bách Khoa Hà Nội",
            organizationAddress: "1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
            researchTitle: "Giảng viên cao cấp",
            positionTitle: "Trưởng bộ môn Tự động hóa",
            expertiseSectors: ["Cơ khí chế tạo & Tự động hóa", "Công nghệ thông tin & Chuyển đổi số"],
            trainingHistoryJson: "[{\"level\":\"Tiến sĩ\",\"year\":2015}]",
            employmentHistoryJson: "[{\"org\":\"ĐHBK Hà Nội\",\"period\":\"2005-nay\"}]",
            publicationsJson: "[{\"title\":\"Paper 1\",\"year\":2022}]",
            consultingSummary: "Tư vấn điều khiển robot và tự động hóa nhà máy.",
            isProjectLeader: true,
            isMainContributor: true,
            pdpdConsentAtUtc: DateTimeOffset.UtcNow);

        profile.PersonId.ShouldBe(personId);
        profile.FullName.ShouldBe("TS. Trần Văn Minh");
        profile.Status.ShouldBe(ExpertStatuses.PendingReview);
        profile.AcademicRank.ShouldBe("PGS");
        profile.Degree.ShouldBe("DOCTOR");
        profile.IsProjectLeader.ShouldBeTrue();
        profile.ExpertiseSectors.Length.ShouldBe(2);
    }

    [Theory]
    [InlineData("", "001080012345", "DOCTOR", "ĐHBK Hà Nội")]
    [InlineData("TS. Trần Văn Minh", "001080012345", "", "ĐHBK Hà Nội")]
    [InlineData("TS. Trần Văn Minh", "001080012345", "DOCTOR", "")]
    public void Missing_mandatory_fields_throws_validation_exception(string name, string idCard, string degree, string org)
    {
        Should.Throw<ValidationException>(() => new ExpertProfile(
            personId: Guid.NewGuid(),
            fullName: name,
            birthYear: 1980,
            gender: "male",
            idCardNumber: idCard,
            idCardDate: new DateOnly(2021, 5, 20),
            academicRank: "NONE",
            academicRankYear: null,
            degree: degree,
            degreeYear: 2015,
            organizationName: org,
            organizationAddress: null,
            researchTitle: null,
            positionTitle: null,
            expertiseSectors: [],
            trainingHistoryJson: null,
            employmentHistoryJson: null,
            publicationsJson: null,
            consultingSummary: null,
            isProjectLeader: false,
            isMainContributor: false,
            pdpdConsentAtUtc: DateTimeOffset.UtcNow));
    }

    [Fact]
    public void Identity_card_is_optional_for_current_expert_self_service()
    {
        var profile = new ExpertProfile(Guid.NewGuid(), "TS. Nguyễn Văn A", 1982, "male", null, null, "NONE", null,
            "DOCTOR", 2018, "Viện Hàn Lâm KH&CN", null, null, null, [], null, null, null, null, false, false, DateTimeOffset.UtcNow);
        profile.IdCardNumber.ShouldBeNull();
        profile.IdCardDate.ShouldBeNull();
    }

    [Fact]
    public void Missing_pdpd_consent_throws_validation_exception()
    {
        Should.Throw<ValidationException>(() => new ExpertProfile(
            personId: Guid.NewGuid(),
            fullName: "TS. Nguyễn Văn A",
            birthYear: 1982,
            gender: "male",
            idCardNumber: "001082001122",
            idCardDate: new DateOnly(2021, 1, 1),
            academicRank: "NONE",
            academicRankYear: null,
            degree: "DOCTOR",
            degreeYear: 2018,
            organizationName: "Viện Hàn Lâm KH&CN",
            organizationAddress: null,
            researchTitle: null,
            positionTitle: null,
            expertiseSectors: [],
            trainingHistoryJson: null,
            employmentHistoryJson: null,
            publicationsJson: null,
            consultingSummary: null,
            isProjectLeader: false,
            isMainContributor: false,
            pdpdConsentAtUtc: default));
    }

    [Fact]
    public void Missing_legal_oath_throws_validation_exception()
    {
        Should.Throw<ValidationException>(() => new ExpertProfile(
            personId: Guid.NewGuid(),
            fullName: "TS. Nguyễn Văn A",
            birthYear: 1982,
            gender: "male",
            idCardNumber: "001082001122",
            idCardDate: new DateOnly(2021, 1, 1),
            academicRank: "NONE",
            academicRankYear: null,
            degree: "DOCTOR",
            degreeYear: 2018,
            organizationName: "Viện Hàn Lâm KH&CN",
            organizationAddress: null,
            researchTitle: null,
            positionTitle: null,
            expertiseSectors: [],
            trainingHistoryJson: null,
            employmentHistoryJson: null,
            publicationsJson: null,
            consultingSummary: null,
            isProjectLeader: false,
            isMainContributor: false,
            pdpdConsentAtUtc: DateTimeOffset.UtcNow,
            legalOath: false));
    }

    [Fact]
    public void Profile_approval_flow_and_note_handling()
    {
        var profile = new ExpertProfile(
            personId: Guid.NewGuid(),
            fullName: "TS. Nguyễn Văn B",
            birthYear: 1985,
            gender: "female",
            idCardNumber: "001085003344",
            idCardDate: new DateOnly(2020, 10, 10),
            academicRank: "NONE",
            academicRankYear: null,
            degree: "DOCTOR",
            degreeYear: 2019,
            organizationName: "Đại học Quốc gia",
            organizationAddress: null,
            researchTitle: null,
            positionTitle: null,
            expertiseSectors: ["Công nghệ sinh học & Y dược"],
            trainingHistoryJson: null,
            employmentHistoryJson: null,
            publicationsJson: null,
            consultingSummary: null,
            isProjectLeader: false,
            isMainContributor: false,
            pdpdConsentAtUtc: DateTimeOffset.UtcNow);

        profile.Status.ShouldBe(ExpertStatuses.PendingReview);

        profile.RequestChanges("Đề nghị tải lại bản scan văn bằng Tiến sĩ rõ nét hơn.");
        profile.Status.ShouldBe(ExpertStatuses.ChangesRequested);
        profile.ReviewerNote.ShouldBe("Đề nghị tải lại bản scan văn bằng Tiến sĩ rõ nét hơn.");

        profile.Approve("Đã kiểm tra văn bằng hợp lệ.");
        profile.Status.ShouldBe(ExpertStatuses.Approved);
        profile.ReviewerNote.ShouldBe("Đã kiểm tra văn bằng hợp lệ.");
        profile.ExpertCode.ShouldStartWith("CG-NACEN-");

        profile.SetPublicListing(true, true, "Chuyên gia công nghệ sinh học.");
        profile.VisibilityStatus.ShouldBe(ExpertVisibilityStatuses.Public);
        profile.IsAcceptingConsultation.ShouldBeTrue();
        profile.PublicBio.ShouldBe("Chuyên gia công nghệ sinh học.");
    }

    [Fact]
    public void Public_detail_contract_does_not_serialize_private_identity_or_financial_fields()
    {
        var detail = new ExpertPublicDetailDto(
            "CG-NACEN-00000001", "TS. Nguyễn Văn A", "NONE", "DOCTOR", 1982, "male", "Viện NacenTech", "Nghiên cứu viên", "Bio",
            ["01"], ["CN06"], true, true, [], [], [], [], [], [], []);

        var json = JsonSerializer.Serialize(detail, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        json.ShouldNotContain("idCard");
        json.ShouldNotContain("phone");
        json.ShouldNotContain("email");
        json.ShouldNotContain("bank");
        json.ShouldNotContain("document");
    }

    [Fact]
    public void Owner_detail_contract_does_not_serialize_identity_card()
    {
        var publicDetail = new ExpertPublicDetailDto("CG-NACEN-00000001", "TS. Nguyễn Văn A", "NONE", "DOCTOR", 1982, "male", "Viện NacenTech", null, null, [], [], true, false, [], [], [], [], [], [], []);
        var ownerDetail = new ExpertPrivateDetailDto(publicDetail, null, null, null, true, true, ExpertStatuses.Approved, []);
        JsonSerializer.Serialize(ownerDetail, new JsonSerializerOptions(JsonSerializerDefaults.Web)).ShouldNotContain("idCard");
    }

    [Fact]
    public void Public_directory_card_dto_does_not_serialize_private_pii_fields()
    {
        var card = new ExpertPublicCardDto(
            ExpertCode: "CG-NACEN-00000001",
            FullName: "GS.TS. Nguyễn Văn An",
            AcademicRank: "GS",
            Degree: "DOCTOR",
            OrganizationName: "Viện Ứng Dụng Công Nghệ",
            PositionTitle: "Viện trưởng",
            PrimarySectorCode: "03",
            PrimarySectorName: "Điện tử & Viễn thông",
            ExpertiseSectors: ["03", "04"],
            MasteredTechCodes: ["CN01", "CN02"],
            ProvinceCode: "HN",
            ProvinceName: "Hà Nội",
            PublicationCount: 45,
            PatentCount: 3,
            ProjectCount: 12,
            IsVerified: true,
            IsAcceptingConsultation: true);

        var json = JsonSerializer.Serialize(card, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        json.ShouldNotContain("idCard");
        json.ShouldNotContain("phone");
        json.ShouldNotContain("email");
        json.ShouldNotContain("cccd");
        json.ShouldNotContain("password");
        card.IsVerified.ShouldBeTrue();
    }
}

