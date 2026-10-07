using System;
using System.Threading.Tasks;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Application;

public interface IEnterpriseRepository
{
    Task<bool> ExistsByTaxCodeAsync(string taxCode);
}

public class EnterpriseService
{
    private readonly IEnterpriseRepository _repository;

    public EnterpriseService(IEnterpriseRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateEnterpriseAsync(Domain.Enterprise enterprise, string taxCode)
    {
        if (await _repository.ExistsByTaxCodeAsync(taxCode))
        {
            throw new InvalidOperationException("BR-02-001: Tax code must be unique");
        }
    }
    
    public bool CanViewRevenueAndFunding(string actorRole, bool isOwner)
    {
        if (isOwner) return true;
        if (actorRole == "ADMIN" || actorRole == "OPERATOR_ADMIN") return true;
        return false;
    }
}
