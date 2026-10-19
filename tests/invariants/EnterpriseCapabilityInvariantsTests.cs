using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NacenTech.Modules.Enterprise.Application;
using NacenTech.Modules.Enterprise.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class EnterpriseCapabilityInvariantsTests
{
    private sealed class InMemoryEnterpriseRepository : IEnterpriseRepository
    {
        private readonly List<Enterprise> _enterprises = new();

        public InMemoryEnterpriseRepository(IEnumerable<Enterprise>? initial = null)
        {
            if (initial != null) _enterprises.AddRange(initial);
        }

        public Task<bool> ExistsByTaxCodeAsync(string taxCode, Guid? excludeId = null, CancellationToken ct = default)
        {
            var exists = _enterprises.Any(x => x.TaxCode == taxCode && (!excludeId.HasValue || x.Id != excludeId.Value));
            return Task.FromResult(exists);
        }

        public Task<Enterprise?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.Id == id);
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByTaxCodeAsync(string taxCode, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.TaxCode == taxCode);
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByOwnerPersonIdAsync(Guid personId, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.OwnerPersonId == personId);
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByIdentifierAsync(string type, string value, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.Identifiers.Any(i => i.Type == type && i.Value == value));
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByContactEmailAsync(string email, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.ContactEmail != null && string.Equals(x.ContactEmail.Trim(), email.Trim(), StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(item);
        }

        public Task AddAsync(Enterprise enterprise, CancellationToken ct = default)
        {
            _enterprises.Add(enterprise);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Enterprise enterprise, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }

        public Task<(IReadOnlyList<Enterprise> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, CancellationToken ct = default)
        {
            return Task.FromResult(((IReadOnlyList<Enterprise>)_enterprises.ToList(), _enterprises.Count));
        }

        public Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
        {
            return Task.FromResult(new EnterpriseDashboardStatsDto(0, 0, [], [], [], []));
        }

        public Task<EnterpriseInnovationEvaluation?> GetInnovationEvaluationAsync(string taxCode, int? evaluationYear = null, CancellationToken ct = default)
        {
            return Task.FromResult<EnterpriseInnovationEvaluation?>(null);
        }

        public Task AddInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }

        public Task UpdateInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }

        public Task<(string? SurveyAnswersJson, bool HasMachineryUpgrade, bool HasTechTraining)> GetSurveyAnswersAsync(Guid enterpriseId, string taxCode, CancellationToken ct = default)
        {
            return Task.FromResult<(string?, bool, bool)>((null, false, false));
        }

        public Task<IReadOnlyList<Enterprise>> GetAllEnterprisesForRatingAsync(CancellationToken ct = default)
        {
            return Task.FromResult<IReadOnlyList<Enterprise>>(_enterprises.ToList());
        }
    }

    [Fact]
    public void TaxCode_empty_or_whitespace_is_automatically_converted_to_null()
    {
        var ent = new Enterprise();
        ent.TaxCode = "";
        ent.TaxCode.ShouldBeNull();

        ent.TaxCode = "   ";
        ent.TaxCode.ShouldBeNull();

        ent.TaxCode = "  0100255428  ";
        ent.TaxCode.ShouldBe("0100255428");

        ent.TaxCode = null;
        ent.TaxCode.ShouldBeNull();
    }

    [Fact]
    public async Task UpsertProfile_with_duplicate_tax_code_throws_DuplicateTaxCodeException()
    {
        var existing = new Enterprise(Guid.NewGuid())
        {
            Name = "Doanh nghiệp đã có",
            TaxCode = "0100255428"
        };
        var repo = new InMemoryEnterpriseRepository(new[] { existing });
        var service = new EnterpriseService(repo);

        var newEntId = Guid.NewGuid();
        var req = new UpsertEnterpriseProfileRequest
        {
            Name = "Doanh nghiệp mới",
            TaxCode = "0100255428" // Trùng MST
        };

        var ex = await Should.ThrowAsync<DuplicateTaxCodeException>(async () =>
        {
            await service.UpsertProfileAsync(newEntId, req);
        });

        ex.Message.ShouldContain("BR-02-006");
        ex.Message.ShouldContain("0100255428");
    }

    [Fact]
    public void Capability_lifecycle_activation_and_tier_upgrade()
    {
        var ent = new Enterprise(Guid.NewGuid());
        ent.CapabilityTier.ShouldBe("BASIC");
        ent.IsBuyer.ShouldBeFalse();
        ent.IsSeller.ShouldBeFalse();

        // Kích hoạt BUYER
        ent.ActivateCapability("BUYER");
        ent.IsBuyer.ShouldBeTrue();
        ent.IsSeller.ShouldBeFalse();
        ent.CapabilityTier.ShouldBe("BUYER");
        ent.ActiveRole.ShouldBe("BUYER");

        // Kích hoạt thêm SELLER -> Trở thành DUAL
        ent.ActivateCapability("SELLER");
        ent.IsBuyer.ShouldBeTrue();
        ent.IsSeller.ShouldBeTrue();
        ent.CapabilityTier.ShouldBe("DUAL");

        // Kích hoạt năng lực không hợp lệ
        Should.Throw<ArgumentException>(() => ent.ActivateCapability("INVALID_ROLE"));
    }

    [Fact]
    public void Switch_active_role_guards_and_execution()
    {
        var ent = new Enterprise(Guid.NewGuid());
        ent.ActivateCapability("BUYER");

        // Chỉ mới là BUYER, chuyển sang SELLER phải bị chặn (BR-02-014)
        var ex = Should.Throw<InvalidOperationException>(() => ent.SwitchActiveRole("SELLER"));
        ex.Message.ShouldContain("BR-02-014");

        // Kích hoạt thêm SELLER -> Chuyển đổi tự do
        ent.ActivateCapability("SELLER");
        ent.CapabilityTier.ShouldBe("DUAL");

        ent.SwitchActiveRole("SELLER");
        ent.ActiveRole.ShouldBe("SELLER");

        ent.SwitchActiveRole("BUYER");
        ent.ActiveRole.ShouldBe("BUYER");
    }

    [Fact]
    public async Task Multi_strategy_resolution_resolves_enterprise_accurately()
    {
        var personId = Guid.NewGuid();
        var email = "buyer.user@demo.nacentech.vn";

        // Strategy 2: OwnerPersonId
        var ent2 = new Enterprise(Guid.NewGuid())
        {
            Name = "DN Theo OwnerPersonId",
            OwnerPersonId = personId,
            TaxCode = "0100255428"
        };
        var repo2 = new InMemoryEnterpriseRepository(new[] { ent2 });
        var service2 = new EnterpriseService(repo2);

        var res2 = await service2.GetOwnerProfileAsync(personId);
        res2.ShouldNotBeNull();
        res2.Name.ShouldBe("DN Theo OwnerPersonId");

        // Strategy 3: Identifiers USER_ID
        var ent3 = new Enterprise(Guid.NewGuid())
        {
            Name = "DN Theo Identifier",
            TaxCode = "0108992134",
            Identifiers = new List<EnterpriseIdentifier>
            {
                new EnterpriseIdentifier { Type = "USER_ID", Value = personId.ToString() }
            }
        };
        var repo3 = new InMemoryEnterpriseRepository(new[] { ent3 });
        var service3 = new EnterpriseService(repo3);

        var res3 = await service3.GetOwnerProfileAsync(personId);
        res3.ShouldNotBeNull();
        res3.Name.ShouldBe("DN Theo Identifier");

        // Strategy 4: ContactEmail
        var ent4 = new Enterprise(Guid.NewGuid())
        {
            Name = "DN Theo ContactEmail",
            ContactEmail = email
        };
        var repo4 = new InMemoryEnterpriseRepository(new[] { ent4 });
        var service4 = new EnterpriseService(repo4);

        var res4 = await service4.GetOwnerProfileAsync(Guid.NewGuid(), email);
        res4.ShouldNotBeNull();
        res4.Name.ShouldBe("DN Theo ContactEmail");
    }
}
