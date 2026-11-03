namespace NacenTech.Modules.Blockchain.Domain.Enums;

public enum VerificationVerdict
{
    VERIFIED = 0,
    TAMPERED = 1,
    NOT_ANCHORED = 2,
    BLOCK_UNCONFIRMED = 3
}
