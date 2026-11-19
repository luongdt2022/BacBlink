namespace NacenTech.Contracts.Money;

/// <summary>
/// §10.8/§22.1: Money luôn có amountMinor + currency; không tồn tại số trần.
/// VND là ledger currency (D2-40); VND không có phần lẻ nên minor unit = 1.
/// </summary>
public readonly record struct Money(long AmountMinor, string Currency)
{
    public static Money Vnd(long amount) => new(amount, "VND");

    public static Money operator +(Money a, Money b)
    {
        EnsureSameCurrency(a, b);
        return new Money(a.AmountMinor + b.AmountMinor, a.Currency);
    }

    public static Money operator -(Money a, Money b)
    {
        EnsureSameCurrency(a, b);
        return new Money(a.AmountMinor - b.AmountMinor, a.Currency);
    }

    private static void EnsureSameCurrency(Money a, Money b)
    {
        if (!string.Equals(a.Currency, b.Currency, StringComparison.Ordinal))
            throw new InvalidOperationException($"Không cộng trừ hai tiền tệ khác nhau: {a.Currency} và {b.Currency}");
    }
}
