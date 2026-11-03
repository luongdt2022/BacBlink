namespace NacenTech.PolicyEngine;

/// <summary>Tên action dùng trong DecisionTable. Thêm action = thêm rule, không thêm `if` trong service.</summary>
public static class Actions
{
    // identity
    public const string PersonReadSelf = "person.read_self";
    public const string PersonUpdateSelf = "person.update_self";
    public const string PersonAdminManage = "person.admin_manage";
    public const string PersonProvisionRole = "person.provision_role";

    // demand / technology (subject)
    public const string SubjectCreate = "subject.create";
    public const string SubjectReadPublic = "subject.read_public";
    public const string SubjectReadOwn = "subject.read_own";
    public const string SubjectReadAny = "subject.read_any";
    public const string SubjectUpdate = "subject.update";
    public const string SubjectDelete = "subject.delete";
    public const string SubjectPublish = "subject.publish";
    public const string SubjectBeautify = "subject.beautify";
    public const string SubjectComputeMatches = "subject.compute_matches";

    // data room
    public const string DocumentRead = "document.read";
    public const string DocumentWrite = "document.write";
    public const string DocumentDelete = "document.delete";
    public const string AccessGrantIssue = "access_grant.issue";

    // matching / search
    public const string SearchQuery = "search.query";
    public const string MatchRoundRead = "match_round.read";

    /// <summary>§26.6.5: gắn nhãn liên quan cho kết quả tìm kiếm. Người dùng đã đăng nhập gắn được nhãn ngầm
    /// và nhãn chấm cho lần tìm kiếm của chính họ; đây là nguồn duy nhất của golden set.</summary>
    public const string SearchFeedback = "search.feedback";

    // tín hiệu nhu cầu từ nguồn ngoài (ADR-0011)
    /// <summary>Nạp tín hiệu từ adapter. Chỉ tiến trình hệ thống và quản trị viên — đây là cửa dữ liệu vào.</summary>
    public const string SignalIngest = "signal.ingest";

    public const string SignalRead = "signal.read";

    /// <summary>Chuyển tín hiệu thành nhu cầu thật hoặc loại nó. Hành động của người có mandate (D2-87).</summary>
    public const string SignalTriage = "signal.triage";

    // quyền lợi thương mại (§20, bất biến 99/182)
    public const string AgreementManage = "agreement.manage";
    public const string AgreementRead = "agreement.read";

    // communication
    public const string InvitationCreate = "invitation.create";
    public const string InvitationRespond = "invitation.respond";
    public const string InvitationRead = "invitation.read";
    public const string InvitationReadAny = "invitation.read_any";
    public const string NotificationManageSelf = "notification.manage_self";
    public const string NotificationReadAny = "notification.read_any";

    // content
    public const string StoryCreate = "story.create";
    public const string StoryUpdateOwn = "story.update_own";
    public const string StoryModerate = "story.moderate";

    // taxonomy / policy config
    public const string TaxonomyManage = "taxonomy.manage";

    // stats / reporting
    public const string StatsRead = "stats.read";

    // ai
    public const string AiInvoke = "ai.invoke";

    // ─── Nhãn cho dòng kiểm toán SUCCESS (ADR-0006) — KHÔNG phải hành động của bảng quyết định ───
    // Cửa phân quyền vẫn dùng CaseTransition cho khoá tạm và AccessGrantIssue cho thu hồi; bốn nhãn dưới đây
    // chỉ để dòng "đã xảy ra" nói đúng việc đã xảy ra. Đừng thêm chúng vào rule set: không luật nào cấp chúng.
    public const string CaseHoldOpen = "case.hold_open";
    public const string CaseHoldRelease = "case.hold_release";
    public const string AccessGrantRevoke = "access_grant.revoke";

    // case
    public const string CaseCreate = "case.create";
    public const string CaseRead = "case.read";
    public const string CaseTransition = "case.transition";
    public const string CaseAssignBroker = "case.assign_broker";

    // lms (TASK-10)
    public const string LmsCreate = "lms.create";
    public const string LmsReadManagement = "lms.read_management";
    public const string LmsUpdate = "lms.update";
    public const string LmsUnpublish = "lms.unpublish";
    public const string LmsDelete = "lms.delete";
    public const string LmsSubmitQuiz = "lms.submit_quiz";
}
