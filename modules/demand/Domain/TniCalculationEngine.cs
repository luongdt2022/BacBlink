namespace NacenTech.Modules.Demand.Domain;

public static class TniCalculationEngine
{
    /// <summary>
    /// Tính toán chỉ số TNI (Technology Need Index) dựa trên 4 tham số định lượng:
    /// K (Cấp thiết 35%), L (Tác động 30%), N (Khả năng đầu tư 20%), O (Sẵn sàng tiếp nhận 15%).
    /// Công thức chính thức theo Quyết định PO: TNI = ROUND((K*35 + L*30 + N*20 + O*15) / 5)
    /// </summary>
    public static TniResult Calculate(int urgency, int impact, int investment, int readiness)
    {
        ValidateDimension(urgency, nameof(urgency));
        ValidateDimension(impact, nameof(impact));
        ValidateDimension(investment, nameof(investment));
        ValidateDimension(readiness, nameof(readiness));

        double rawScore = (urgency * 35.0 + impact * 30.0 + investment * 20.0 + readiness * 15.0) / 5.0;
        int finalScore = (int)Math.Round(rawScore, MidpointRounding.AwayFromZero);

        TniClassification classification = finalScore switch
        {
            >= 80 => TniClassification.VeryHigh,
            >= 65 => TniClassification.High,
            >= 50 => TniClassification.Medium,
            _ => TniClassification.Low
        };

        return new TniResult(finalScore, classification);
    }

    private static void ValidateDimension(int value, string paramName)
    {
        if (value < 1 || value > 5)
            throw new ArgumentOutOfRangeException(paramName, $"Chỉ số {paramName} phải có giá trị từ 1 đến 5.");
    }
}
