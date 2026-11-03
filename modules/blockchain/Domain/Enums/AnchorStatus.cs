namespace NacenTech.Modules.Blockchain.Domain.Enums;

public enum AnchorStatus
{
    PENDING = 0,
    LOCAL_LEDGER_ANCHORED = 1,
    NDACHAIN_SUBMITTED = 2,
    NDACHAIN_CONFIRMED = 3,
    FAILED = 4
}
