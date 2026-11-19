using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// BỘ KIỂM THỬ ĐẶC TẢ DELTA V17 (CR-2026-021):
/// Xác thực bắt buộc định danh pháp nhân (Enterprise vs Institution R&D),
/// kiểm tra tính hợp lệ của MST, Số Quyết định, Tệp PDF và cam kết SHTT khi mở gian hàng Seller.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class Task00DeltaV17ShopApprovalValidationTests(PostgresFixture fixture)
{
    private static (Guid id, string email) NewUser() => (Guid.NewGuid(), $"seller-test-{Guid.NewGuid():N}@nacentech.vn");

    private async Task<Person> SeedPersonAsync(NacenTechDbContext db, Guid id, string email)
    {
        var person = Person.Register(
            email,
            "hash-1234567890",
            "PBKDF2_V3",
            "Seller",
            "Applicant",
            "0988776655",
            "NacenTech Org",
            isActive: true,
            platformRole: PlatformRoles.PublicUser);

        typeof(Person).GetProperty(nameof(Person.Id))!.SetValue(person, id);
        person.Activate();
        db.Set<Person>().Add(person);
        await db.SaveChangesAsync();
        return person;
    }

    [Fact]
    public async Task Case1_ValidEnterprisePayload_SubmitsSuccessfully_SlaDeadline24Hours()
    {
        // 1. Payload hợp lệ cho Doanh nghiệp (Enterprise) -> Submit thành công, SLA deadline 24h
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, email) = NewUser();
        await SeedPersonAsync(db, userId, email);

        var payload = new SubmitShopApprovalPayload
        {
            EntityType = "ENTERPRISE",
            TaxCode = "0101234567",
            OrgName = "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST",
            LegalDocUrl = "https://storage.nacentech.vn/legal-docs/dkkd_0101234567.pdf",
            MainSector = "LV01",
            Province = "HN",
            Description = "Cung cấp nền tảng số và hệ sinh thái IoT công nghiệp đạt TRL 8.",
            PledgeAgreed = true,
            SubmittedAt = DateTimeOffset.UtcNow.ToString("O")
        };

        var cmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload));

        var created = await service.SubmitRequestAsync(cmd, CancellationToken.None);

        created.ShouldNotBeNull();
        created.Status.ShouldBe(ApprovalStatuses.PendingReview);
        created.RequestType.ShouldBe(ApprovalRequestTypes.Shop);

        // Kiểm tra SLA deadline = 24 giờ
        var diffHours = (created.SlaDeadlineUtc - created.CreatedAt).TotalHours;
        diffHours.ShouldBeGreaterThan(23.9);
        diffHours.ShouldBeLessThan(24.1);

        // Đối soát trực tiếp DB
        var dbRecord = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == created.Id);
        dbRecord.ShouldNotBeNull();
        dbRecord.Status.ShouldBe(ApprovalStatuses.PendingReview);
    }

    [Fact]
    public async Task Case2_ValidInstitutionPayload_SubmitsSuccessfully_SlaDeadline24Hours()
    {
        // 2. Payload hợp lệ cho Viện / Trường / R&D -> Submit thành công, SLA deadline 24h
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, email) = NewUser();
        await SeedPersonAsync(db, userId, email);

        var payload = new SubmitShopApprovalPayload
        {
            EntityType = "INSTITUTION_RND",
            EstablishmentDecisionNo = "128/QĐ-BKHCN",
            OrgName = "VIỆN NGHIÊN CỨU & ỨNG DỤNG CÔNG NGHỆ TIÊN TIẾN",
            LegalDocUrl = "https://storage.nacentech.vn/legal-docs/qd-thanh-lap-128.pdf",
            MainSector = "LV07",
            Province = "HN",
            Description = "Sở hữu 05 Bằng độc quyền sáng chế về vật liệu Graphene TRL 6-7.",
            PledgeAgreed = true,
            SubmittedAt = DateTimeOffset.UtcNow.ToString("O")
        };

        var cmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload));

        var created = await service.SubmitRequestAsync(cmd, CancellationToken.None);

        created.ShouldNotBeNull();
        created.Status.ShouldBe(ApprovalStatuses.PendingReview);
        created.RequestType.ShouldBe(ApprovalRequestTypes.Shop);
    }

    [Fact]
    public async Task Case3_EnterpriseWithoutTaxCode_ThrowsValidationException()
    {
        // 3. Thiếu hoặc sai TaxCode khi là Enterprise -> Bị chặn với ValidationException
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, email) = NewUser();
        await SeedPersonAsync(db, userId, email);

        var payload = new SubmitShopApprovalPayload
        {
            EntityType = "ENTERPRISE",
            TaxCode = "ABC1234", // Sai định dạng (không phải 10 hoặc 13 số)
            OrgName = "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST",
            LegalDocUrl = "https://storage.nacentech.vn/legal-docs/dkkd.pdf",
            MainSector = "LV01",
            Province = "HN",
            Description = "Cung cấp nền tảng số và hệ sinh thái IoT công nghiệp đạt TRL 8.",
            PledgeAgreed = true
        };

        var cmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload));

        var ex = await Should.ThrowAsync<ValidationException>(() => service.SubmitRequestAsync(cmd, CancellationToken.None));
        ex.Message.ShouldContain("Mã số thuế doanh nghiệp không được để trống và phải gồm 10 hoặc 13 chữ số.");
    }

    [Fact]
    public async Task Case4_InstitutionWithoutDecisionNo_ThrowsValidationException()
    {
        // 4. Thiếu DecisionNo khi là Institution -> Bị chặn với ValidationException
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, email) = NewUser();
        await SeedPersonAsync(db, userId, email);

        var payload = new SubmitShopApprovalPayload
        {
            EntityType = "INSTITUTION_RND",
            EstablishmentDecisionNo = "", // Rỗng
            OrgName = "VIỆN NGHIÊN CỨU & ỨNG DỤNG CÔNG NGHỆ TIÊN TIẾN",
            LegalDocUrl = "https://storage.nacentech.vn/legal-docs/qd.pdf",
            MainSector = "LV07",
            Province = "HN",
            Description = "Sở hữu 05 Bằng độc quyền sáng chế về vật liệu Graphene TRL 6-7.",
            PledgeAgreed = true
        };

        var cmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload));

        var ex = await Should.ThrowAsync<ValidationException>(() => service.SubmitRequestAsync(cmd, CancellationToken.None));
        ex.Message.ShouldContain("Số Quyết định thành lập / Giấy phép KH&CN không được để trống và phải từ 5 ký tự trở lên.");
    }

    [Fact]
    public async Task Case5_NonPdfFile_ThrowsValidationException()
    {
        // 5. File pháp lý không phải PDF -> Bị chặn với ValidationException
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, email) = NewUser();
        await SeedPersonAsync(db, userId, email);

        var payload = new SubmitShopApprovalPayload
        {
            EntityType = "ENTERPRISE",
            TaxCode = "0101234567",
            OrgName = "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST",
            LegalDocUrl = "https://storage.nacentech.vn/legal-docs/virus.exe", // Không phải PDF
            MainSector = "LV01",
            Province = "HN",
            Description = "Cung cấp nền tảng số và hệ sinh thái IoT công nghiệp đạt TRL 8.",
            PledgeAgreed = true
        };

        var cmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload));

        var ex = await Should.ThrowAsync<ValidationException>(() => service.SubmitRequestAsync(cmd, CancellationToken.None));
        ex.Message.ShouldContain("Tệp văn bản pháp lý minh chứng bắt buộc phải là định dạng PDF.");
    }

    [Fact]
    public async Task Case6_PledgeNotAgreed_ThrowsValidationException()
    {
        // 6. Chưa tích cam kết SHTT -> Bị chặn với ValidationException
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, email) = NewUser();
        await SeedPersonAsync(db, userId, email);

        var payload = new SubmitShopApprovalPayload
        {
            EntityType = "ENTERPRISE",
            TaxCode = "0101234567",
            OrgName = "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST",
            LegalDocUrl = "https://storage.nacentech.vn/legal-docs/dkkd.pdf",
            MainSector = "LV01",
            Province = "HN",
            Description = "Cung cấp nền tảng số và hệ sinh thái IoT công nghiệp đạt TRL 8.",
            PledgeAgreed = false // Chưa cam kết
        };

        var cmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload));

        var ex = await Should.ThrowAsync<ValidationException>(() => service.SubmitRequestAsync(cmd, CancellationToken.None));
        ex.Message.ShouldContain("Đơn vị bắt buộc phải cam kết tuân thủ quy chế và quyền SHTT.");
    }
}
