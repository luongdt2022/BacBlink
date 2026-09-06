using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Entitlement.Application;
using NacenTech.Modules.Entitlement.Domain;
using NacenTech.Modules.Integration.Application;
using NacenTech.Modules.Integration.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// ADR-0011 và ADR-0012. Ba luật quan trọng nhất ở đây đều là luật **chặn**, nên chúng chỉ chứng minh được bằng
/// cách thử vi phạm: dữ liệu ngoài không có license thì không vào được, tín hiệu không tự thành nhu cầu, và
/// hết quota thì cưỡng chế thấy nhưng chế độ chỉ đo vẫn cho chạy — có ghi lại.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class SignalAndEntitlementTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>
    /// `source_records.(source, external_id)` và `managed_service_agreements.reference` là khoá **duy nhất** —
    /// đó là điều bộ này đang kiểm. Cơ sở dữ liệu test thì tồn tại qua nhiều lần chạy, nên khoá cố định sẽ đụng
    /// dữ liệu của lần chạy trước và làm bài test hỏng vì lý do không liên quan tới thứ nó kiểm.
    /// </summary>
    private readonly string _run = Guid.NewGuid().ToString("N")[..8];

    private IngestSignalCommand Signal(string externalId, string signalClass = DemandSignalClasses.UnmetTender,
        string license = SourceLicenses.InternalOnly, string title = "Gói thầu hệ thống quan trắc nước thải") => new(
        Source: $"TENDER_FEED_{_run}",
        ExternalId: externalId,
        ContentHash: "a1b2c3",
        License: license,
        AuthorityLevel: SourceAuthorityLevels.Aggregator,
        FetchedAt: DateTimeOffset.UtcNow,
        SourceUrl: "https://example.invalid/tender/1",
        PayloadJson: """{"raw":"x"}""",
        SignalClass: signalClass,
        Title: title,
        Summary: "Không có nhà thầu tham gia, đã gia hạn hai lần rồi hủy",
        BuyerName: "Ban quản lý khu công nghiệp X",
        SectorIds: [],
        BudgetAmount: 4_200_000_000m,
        BudgetCurrency: "VND",
        ObservedAt: DateTimeOffset.UtcNow.AddDays(-3));

    // ─── ADR-0011: lineage bắt buộc, nạp lại không sinh trùng ───────────────────────────────────

    [Fact]
    public async Task Ingesting_the_same_external_record_twice_updates_it_instead_of_duplicating()
    {
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);

        Guid firstId;
        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            firstId = (await signals.IngestAsync(Signal("TBMT-0001"), Ct)).Id;
        }

        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            var again = await signals.IngestAsync(Signal("TBMT-0001", title: "Tiêu đề đã đổi ở nguồn"), Ct);
            again.Id.ShouldBe(firstId);
            again.Title.ShouldBe("Tiêu đề đã đổi ở nguồn");
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var sourceIds = await db.Set<SourceRecord>().AsNoTracking()
                .Where(s => s.Source == $"TENDER_FEED_{_run}").Select(s => s.Id).ToListAsync(Ct);
            sourceIds.Count.ShouldBe(1);
            (await db.Set<DemandSignal>().CountAsync(d => sourceIds.Contains(d.SourceRecordId), Ct)).ShouldBe(1);
        }
    }

    [Fact]
    public async Task External_data_without_a_known_license_or_authority_is_refused()
    {
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);
        using var scope = provider.CreateScope();
        var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();

        await Should.ThrowAsync<ValidationException>(async () =>
            await signals.IngestAsync(Signal("TBMT-0002") with { License = "WHATEVER" }, Ct));

        await Should.ThrowAsync<ValidationException>(async () =>
            await signals.IngestAsync(Signal("TBMT-0003") with { AuthorityLevel = "TRUST_ME" }, Ct));
    }

    /// <summary>
    /// Nguyên tắc 1 và D2-87. Không có đường nào biến tín hiệu thành nhu cầu mà không có người quyết định:
    /// `MarkConvertedAsync` **nhận** id của một `DemandBrief` đã tồn tại, nó không tạo ra cái nào.
    /// </summary>
    [Fact]
    public async Task A_signal_never_becomes_a_demand_by_itself_and_rejection_requires_a_reason()
    {
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);

        Guid signalId;
        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            var created = await signals.IngestAsync(Signal("TBMT-0004"), Ct);
            created.Status.ShouldBe(DemandSignalStatuses.New);
            created.ConvertedDemandBriefId.ShouldBeNull();
            signalId = created.Id;
        }

        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            await Should.ThrowAsync<ValidationException>(async () =>
                await signals.RejectAsync(signalId, "   ", null, Ct));

            var rejected = await signals.RejectAsync(signalId, "Ngoài lĩnh vực đang phục vụ", null, Ct);
            rejected.Status.ShouldBe(DemandSignalStatuses.Rejected);
            rejected.DecisionReason.ShouldBe("Ngoài lĩnh vực đang phục vụ");
        }
    }

    /// <summary>Cửa dữ liệu vào không mở cho người dùng cuối chừng nào cổng pháp lý ADR-0011 chưa đóng.</summary>
    [Fact]
    public async Task Ordinary_users_cannot_ingest_or_read_external_signals()
    {
        var user = new TestActor().AsUser(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(user);
        using var scope = provider.CreateScope();
        var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();

        await Should.ThrowAsync<ForbiddenException>(async () => await signals.IngestAsync(Signal("TBMT-0005"), Ct));
        await Should.ThrowAsync<ForbiddenException>(async () =>
            await signals.ListAsync(new DemandSignalFilter(null, null), SignalAudience.Internal, PageRequest.Of(1, 20), Ct));
    }

    // ─── ADR-0011: license quyết định ai được nhìn thấy ─────────────────────────────────────────

    /// <summary>
    /// Bốn mức license ánh xạ ranh giới thật: đọc nội bộ không phải xuất bản lại, hiển thị lại có tổ chức thì
    /// phải có quyền. Mức hẹp nhất — `INTERNAL_ONLY` — **không được lọt ra bất kỳ bề mặt hiển thị nào**, kể cả
    /// bề mặt cần đăng nhập.
    /// </summary>
    [Theory]
    [InlineData(SourceLicenses.InternalOnly, false, false)]
    [InlineData(SourceLicenses.DisplayInProduct, true, false)]
    [InlineData(SourceLicenses.DisplayPublic, true, true)]
    [InlineData(SourceLicenses.Redistribute, true, true)]
    public async Task License_decides_which_audience_can_see_a_signal(string license, bool inProduct, bool publicly)
    {
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);

        Guid signalId;
        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            signalId = (await signals.IngestAsync(Signal($"LIC-{license}", license: license), Ct)).Id;
        }

        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();

            // Nội bộ luôn đọc được — đó là điều kiện để tính năng dùng được ngay ở mức hẹp nhất.
            (await signals.GetAsync(signalId, SignalAudience.Internal, Ct)).Id.ShouldBe(signalId);

            await AssertVisibility(signals, signalId, SignalAudience.InProduct, inProduct);
            await AssertVisibility(signals, signalId, SignalAudience.Public, publicly);
        }
    }

    /// <summary>
    /// Lọc phải nằm **trong truy vấn**, trước phân trang. Nếu lọc sau khi lấy về thì `total` nói dối: người xem
    /// thấy một con số rồi đếm được ít hơn, và chênh lệch đó chính là thông tin license không cho họ có.
    /// </summary>
    [Fact]
    public async Task Total_count_does_not_leak_the_existence_of_records_the_audience_cannot_see()
    {
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);

        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            await signals.IngestAsync(Signal("VIS-1", license: SourceLicenses.InternalOnly), Ct);
            await signals.IngestAsync(Signal("VIS-2", license: SourceLicenses.InternalOnly), Ct);
            await signals.IngestAsync(Signal("VIS-3", license: SourceLicenses.DisplayPublic), Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var signals = scope.ServiceProvider.GetRequiredService<ISignalIngestService>();
            var filter = new DemandSignalFilter(DemandSignalStatuses.New, null);

            var mine = await signals.ListAsync(filter, SignalAudience.Internal, PageRequest.Of(1, 100), Ct);
            var visible = await signals.ListAsync(filter, SignalAudience.Public, PageRequest.Of(1, 100), Ct);

            // So tương đối, không tuyệt đối: cơ sở dữ liệu test dùng chung nên có thể có dòng của lần chạy khác.
            var mineFromThisRun = mine.Data.Count(d => d.Source == $"TENDER_FEED_{_run}");
            var visibleFromThisRun = visible.Data.Count(d => d.Source == $"TENDER_FEED_{_run}");
            mineFromThisRun.ShouldBe(3);
            visibleFromThisRun.ShouldBe(1);
            visible.Total.ShouldBeLessThan(mine.Total);
        }
    }

    private static async Task AssertVisibility(ISignalIngestService signals, Guid signalId, SignalAudience audience, bool expected)
    {
        if (expected)
        {
            (await signals.GetAsync(signalId, audience, Ct)).Id.ShouldBe(signalId);
        }
        else
        {
            var ex = await Should.ThrowAsync<ForbiddenException>(async () => await signals.GetAsync(signalId, audience, Ct));
            ex.Code.ShouldBe("SOURCE_LICENSE_FORBIDS_DISPLAY");
        }
    }

    // ─── ADR-0012 / §20: quyền lợi thương mại ───────────────────────────────────────────────────

    [Fact]
    public async Task An_agreement_without_entitlements_cannot_be_activated()
    {
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);
        using var scope = provider.CreateScope();
        var agreements = scope.ServiceProvider.GetRequiredService<IAgreementService>();

        var created = await agreements.CreateAsync(new CreateAgreementCommand(
            PayerRef.Person(Guid.CreateVersion7()), "INNOVATION_OFFICE", $"HD-{_run}-001",
            DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddYears(1), "INV-1", []), Ct);

        await Should.ThrowAsync<UnprocessableException>(async () =>
            await agreements.ActivateAsync(created.Id, created.Version, Ct));
    }

    /// <summary>
    /// Chế độ mặc định là chỉ đo (nguyên tắc 14). Thao tác **vẫn chạy** khi không có hợp đồng, nhưng để lại
    /// `WOULD_DENY` — đó là con số duy nhất trả lời được câu "bật cưỡng chế thì gãy bao nhiêu".
    /// </summary>
    [Fact]
    public async Task Meter_only_mode_allows_the_call_but_records_that_enforcement_would_deny_it()
    {
        var payer = PayerRef.Person(Guid.CreateVersion7());
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin);

        using (var scope = provider.CreateScope())
        {
            var gate = scope.ServiceProvider.GetRequiredService<IEntitlementGate>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var decision = await gate.CheckAndMeterAsync(payer, PlatformCapabilities.CaseIntake, 1, Ct);
            await uow.CommitAsync(Ct);

            decision.Allowed.ShouldBeTrue();
            decision.WouldDenyInEnforceMode.ShouldBeTrue();
            decision.Reason.ShouldBe("Không có hợp đồng còn hiệu lực");
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var usage = await db.Set<UsageRecord>().AsNoTracking().SingleAsync(u => u.PayerKind == payer.Kind && u.PayerId == payer.Id, Ct);
            usage.Outcome.ShouldBe(UsageOutcomes.WouldDeny);
        }
    }

    [Fact]
    public async Task Enforce_mode_denies_when_quota_is_exhausted_and_consumption_is_recorded()
    {
        var payer = PayerRef.Person(Guid.CreateVersion7());
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(admin,
            settings: new Dictionary<string, string?> { ["Entitlement:Mode"] = EntitlementModes.Enforce });

        using (var scope = provider.CreateScope())
        {
            var agreements = scope.ServiceProvider.GetRequiredService<IAgreementService>();
            var created = await agreements.CreateAsync(new CreateAgreementCommand(
                payer, "INNOVATION_OFFICE", $"HD-{_run}-002",
                DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddYears(1), "INV-2",
                [new CreateEntitlementCommand(PlatformCapabilities.CaseIntake, 2)]), Ct);
            await agreements.ActivateAsync(created.Id, created.Version, Ct);
        }

        for (var i = 0; i < 2; i++)
        {
            using var scope = provider.CreateScope();
            var gate = scope.ServiceProvider.GetRequiredService<IEntitlementGate>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var decision = await gate.CheckAndMeterAsync(payer, PlatformCapabilities.CaseIntake, 1, Ct);
            decision.Allowed.ShouldBeTrue();
            await uow.CommitAsync(Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var gate = scope.ServiceProvider.GetRequiredService<IEntitlementGate>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var decision = await gate.CheckAndMeterAsync(payer, PlatformCapabilities.CaseIntake, 1, Ct);
            await uow.CommitAsync(Ct);

            decision.Allowed.ShouldBeFalse();
            decision.Reason.ShouldBe("Hết quota");
            decision.Remaining.ShouldBe(0);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var records = await db.Set<UsageRecord>().AsNoTracking()
                .Where(u => u.PayerKind == payer.Kind && u.PayerId == payer.Id).ToListAsync(Ct);
            records.Count(r => r.Outcome == UsageOutcomes.Allowed).ShouldBe(2);
            records.Count(r => r.Outcome == UsageOutcomes.Denied).ShouldBe(1);

            var agreementId = await db.Set<ManagedServiceAgreement>().AsNoTracking()
                .Where(a => a.PayerKind == payer.Kind && a.PayerId == payer.Id).Select(a => a.Id).SingleAsync(Ct);
            var entitlement = await db.Set<NacenTech.Modules.Entitlement.Domain.Entitlement>().AsNoTracking()
                .SingleAsync(e => e.AgreementId == agreementId && e.CapabilityCode == PlatformCapabilities.CaseIntake, Ct);
            entitlement.Consumed.ShouldBe(2); // lần bị chặn KHÔNG trừ quota
        }
    }

    /// <summary>
    /// Cổng quyền lợi phải được gọi từ **đường sản xuất**, không chỉ từ test. Bất biến 99 nói gói vận hành ghi
    /// quota case; chỗ duy nhất quota đó bị tiêu thụ là lúc mở hồ sơ, nên nếu không đo ở đó thì `usage_records`
    /// rỗng vĩnh viễn và cả module chỉ là mã chết.
    ///
    /// Đo theo **chủ bài toán**, không theo người bấm nút: ở Phase 1 người tạo hồ sơ thường là môi giới.
    /// </summary>
    [Fact]
    public async Task Opening_a_case_meters_the_problem_owner_not_the_person_who_clicked()
    {
        var problemOwner = Guid.CreateVersion7();
        var brokerActor = Guid.CreateVersion7();
        var admin = new TestActor().AsAdmin(brokerActor);
        await using var provider = fixture.BuildProvider(admin);

        using (var scope = provider.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<NacenTech.Modules.Case.Application.ICaseService>();
            await cases.CreateAsync(new NacenTech.Modules.Case.Application.CreateCaseCommand(
                NacenTech.Modules.Case.Application.Tracks.ChallengePilot, "Hồ sơ đo quota",
                problemOwner, Guid.CreateVersion7(), 1, "CONFIDENTIAL", null), Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

            var owned = await db.Set<UsageRecord>().AsNoTracking()
                .SingleAsync(u => u.PayerKind == PayerKinds.Person && u.PayerId == problemOwner, Ct);
            owned.CapabilityCode.ShouldBe(PlatformCapabilities.CaseIntake);
            owned.Amount.ShouldBe(1);
            // Chưa có hợp đồng nào: chế độ mặc định là chỉ đo, nên hồ sơ vẫn mở được và để lại đúng con số cần
            // nhìn trước khi bật cưỡng chế.
            owned.Outcome.ShouldBe(UsageOutcomes.WouldDeny);
            owned.ActorRef.ShouldBe(brokerActor);

            (await db.Set<UsageRecord>().AsNoTracking().CountAsync(u => u.PayerId == brokerActor, Ct)).ShouldBe(0);
        }
    }

    /// <summary>
    /// Phép giao profile ∩ entitlement chỉ đi một chiều. Hợp đồng bán được nhiều hơn thứ profile cho phép là hợp
    /// đồng bán thứ không tồn tại; hệ thống phải trả phần hẹp hơn.
    /// </summary>
    [Theory]
    [InlineData(true, true, true)]
    [InlineData(true, false, false)]
    [InlineData(false, true, false)]
    [InlineData(false, false, false)]
    public void Entitlement_can_only_narrow_the_capability_profile(bool profile, bool entitlement, bool expected)
        => NacenTech.Modules.Entitlement.Domain.Entitlement.NarrowsOnly(profile, entitlement).ShouldBe(expected);
}
