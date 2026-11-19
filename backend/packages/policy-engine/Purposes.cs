namespace NacenTech.PolicyEngine;

/// <summary>Taxonomy purpose đóng (§23.2). Purpose là thuộc tính của AccessGrant, không do client khai.</summary>
public static class Purposes
{
    public const string EnterpriseInnovationAdmin = "ENTERPRISE_INNOVATION_ADMIN";
    public const string DemandAdvisory = "DEMAND_ADVISORY";
    public const string BrokerCaseAssistance = "BROKER_CASE_ASSISTANCE";
    public const string TechnicalService = "TECHNICAL_SERVICE";
    public const string ProfessionalService = "PROFESSIONAL_SERVICE";
    public const string RegulatoryReadiness = "REGULATORY_READINESS";
    public const string ExternalAssessment = "EXTERNAL_ASSESSMENT";
    public const string ExpertBusinessAdmin = "EXPERT_BUSINESS_ADMIN";
    public const string ExpertRepresentation = "EXPERT_REPRESENTATION";
    public const string Evaluation = "EVALUATION";
    public const string DueDiligence = "DUE_DILIGENCE";
    public const string TalentSearch = "TALENT_SEARCH";
    public const string FractionalAssignment = "FRACTIONAL_ASSIGNMENT";
    public const string ManagedSquadDelivery = "MANAGED_SQUAD_DELIVERY";
    public const string InternationalSourcing = "INTERNATIONAL_SOURCING";
    public const string LocalizationDueDiligence = "LOCALIZATION_DUE_DILIGENCE";
    public const string Negotiation = "NEGOTIATION";
    public const string ExecutionDelivery = "EXECUTION_DELIVERY";
    public const string AdoptionSupport = "ADOPTION_SUPPORT";
    public const string EvidenceReuse = "EVIDENCE_REUSE";
    public const string Verification = "VERIFICATION";
    public const string Audit = "AUDIT";
    public const string FinanceReview = "FINANCE_REVIEW";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.Ordinal)
    {
        EnterpriseInnovationAdmin, DemandAdvisory, BrokerCaseAssistance, TechnicalService, ProfessionalService,
        RegulatoryReadiness, ExternalAssessment, ExpertBusinessAdmin, ExpertRepresentation, Evaluation, DueDiligence,
        TalentSearch, FractionalAssignment, ManagedSquadDelivery, InternationalSourcing, LocalizationDueDiligence,
        Negotiation, ExecutionDelivery, AdoptionSupport, EvidenceReuse, Verification, Audit, FinanceReview,
    };
}
