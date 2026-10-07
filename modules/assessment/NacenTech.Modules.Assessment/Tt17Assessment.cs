using System;
using System.Collections.Generic;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Assessment;

public class Tt17Assessment : AggregateRoot
{
    public Guid EnterpriseId { get; private set; }
    public int AssessmentYear { get; private set; }
    public string ScopeType { get; private set; } = default!;
    public string Status { get; private set; } = default!;

    // 4 Hybrid JSONB dynamic lists
    public List<MachineryItem> Machineries { get; private set; } = new();
    public List<EquipmentItem> Equipments { get; private set; } = new();
    public List<MaterialItem> Materials { get; private set; } = new();
    public List<EvaluationCriterion> Criteria { get; private set; } = new();

    private Tt17Assessment() { } // EF Core

    public Tt17Assessment(Guid enterpriseId, int assessmentYear, string scopeType)
    {
        if (enterpriseId == Guid.Empty)
            throw new ArgumentException("Mã doanh nghiệp không được để trống.", nameof(enterpriseId));
        if (string.IsNullOrWhiteSpace(scopeType))
            throw new ArgumentException("Phạm vi đánh giá không được để trống.", nameof(scopeType));
        if (assessmentYear < 2000 || assessmentYear > DateTime.Now.Year + 1)
            throw new ArgumentOutOfRangeException(nameof(assessmentYear), "Năm đánh giá không hợp lệ.");

        Id = Guid.NewGuid();
        EnterpriseId = enterpriseId;
        AssessmentYear = assessmentYear;
        ScopeType = scopeType;
        Status = "DRAFT";
    }

    public void UpdateDraft(List<MachineryItem> machineries, List<EquipmentItem> equipments, List<MaterialItem> materials, List<EvaluationCriterion> criteria)
    {
        if (Status != "DRAFT") throw new InvalidOperationException("Chỉ cập nhật khi ở trạng thái nháp.");
        Machineries = machineries ?? new();
        Equipments = equipments ?? new();
        Materials = materials ?? new();
        Criteria = criteria ?? new();
        Touch();
    }

    public void Submit()
    {
        if (Status != "DRAFT") throw new InvalidOperationException("Chỉ có thể nộp từ trạng thái nháp.");
        Status = "SUBMITTED";
        Touch();
        // Bắn domain event if needed
    }
}

public class MachineryItem { public string Name { get; set; } = ""; public int Quantity { get; set; } }
public class EquipmentItem { public string Name { get; set; } = ""; public int Quantity { get; set; } }
public class MaterialItem { public string Name { get; set; } = ""; public double Quantity { get; set; } }
public class EvaluationCriterion { public string Code { get; set; } = ""; public double Score { get; set; } }
