namespace NacenTech.Kernel.Application;

public sealed record PagedResult<T>(IReadOnlyList<T> Data, int Total, int Page, int Limit)
{
    public int TotalPages => Limit <= 0 ? 0 : (int)Math.Ceiling(Total / (double)Limit);

    public PagedResult<TOut> Map<TOut>(Func<T, TOut> map) => new(Data.Select(map).ToList(), Total, Page, Limit);
}

public readonly record struct PageRequest(int Page, int Limit)
{
    public static PageRequest Of(int? page, int? limit, int defaultLimit = 20, int maxLimit = 100)
    {
        var p = page is > 0 ? page.Value : 1;
        var l = limit is > 0 ? Math.Min(limit.Value, maxLimit) : defaultLimit;
        return new PageRequest(p, l);
    }

    public int Skip => (Page - 1) * Limit;
}
