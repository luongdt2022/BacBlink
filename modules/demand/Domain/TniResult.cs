namespace NacenTech.Modules.Demand.Domain;

public sealed record TniResult
{
    public int Score { get; }
    public TniClassification Classification { get; }
    public string ClassificationName => Classification switch
    {
        TniClassification.VeryHigh => "Nhu cầu rất cao",
        TniClassification.High => "Nhu cầu cao",
        TniClassification.Medium => "Nhu cầu trung bình",
        TniClassification.Low => "Nhu cầu thấp",
        _ => "Chưa xác định"
    };

    public TniResult(int score, TniClassification classification)
    {
        if (score < 0 || score > 100)
            throw new ArgumentOutOfRangeException(nameof(score), "Điểm TNI phải nằm trong khoảng 0 - 100.");
            
        Score = score;
        Classification = classification;
    }
}
