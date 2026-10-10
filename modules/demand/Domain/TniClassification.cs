namespace NacenTech.Modules.Demand.Domain;

public enum TniClassification
{
    VeryHigh = 1, // >= 80: Nhu cầu rất cao (Ưu tiên đặc biệt / Tư vấn 1-1)
    High = 2,     // 65 - 79: Nhu cầu cao (Ghép nối tự động đợt 1)
    Medium = 3,   // 50 - 64: Nhu cầu trung bình (Gợi ý danh mục)
    Low = 4       // < 50: Nhu cầu thấp (Theo dõi hồ sơ)
}
