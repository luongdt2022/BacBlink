namespace NacenTech.Modules.Lms.Domain;

public static class LmsClusters
{
    public const string ClusterA = "CLUSTER_A";
    public const string ClusterB = "CLUSTER_B";
    public const string ClusterC = "CLUSTER_C";
    public const string ClusterD = "CLUSTER_D";
    public const string ClusterE = "CLUSTER_E";
    public const string ClusterF = "CLUSTER_F";

    public static readonly string[] All = [ClusterA, ClusterB, ClusterC, ClusterD, ClusterE, ClusterF];

    public static bool IsValid(string? cluster) =>
        cluster is null || All.Contains(cluster.Trim().ToUpperInvariant());
}

public static class LmsStatuses
{
    public const string Draft = "DRAFT";
    public const string Published = "PUBLISHED";
    public const string Unpublished = "UNPUBLISHED";
}

public static class LmsLessonTypes
{
    public const string TypeA = "Loại A";
    public const string TypeB = "Loại B";
    public const string TypeBPlus = "Loại B+";

    public static readonly string[] All = [TypeA, TypeB, TypeBPlus];

    public static bool IsValid(string? type) =>
        type is not null && (type == TypeA || type == TypeB || type == TypeBPlus ||
                             type == "TYPE_A" || type == "TYPE_B" || type == "TYPE_B_PLUS");
}

public static class LmsAttachmentCategories
{
    public const string PracticeTool = "PRACTICE_TOOL";
    public const string SummarySheet = "SUMMARY_SHEET";
    public const string PolicyDoc = "POLICY_DOC";

    public static readonly string[] All = [PracticeTool, SummarySheet, PolicyDoc];
}

public static class LmsModerationActions
{
    public const string Create = "CREATE";
    public const string Update = "UPDATE";
    public const string Publish = "PUBLISH";
    public const string Unpublish = "UNPUBLISH";
    public const string RevertToDraft = "REVERT_TO_DRAFT";
    public const string Delete = "DELETE";
}
