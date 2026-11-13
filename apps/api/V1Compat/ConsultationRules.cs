using System.Data.Common;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using NacenTech.Kernel.Domain;

namespace NacenTech.Api.V1Compat;

public static partial class ConsultationRules
{
    private const string TicketAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public static class Statuses
    {
        public const string Pending = "PENDING";
        public const string Scheduled = "SCHEDULED";
        public const string Rejected = "REJECTED";
        public const string Completed = "COMPLETED";
    }

    public static class Actions
    {
        public const string Accept = "ACCEPT";
        public const string Reject = "REJECT";
        public const string Complete = "COMPLETE";
    }

    [GeneratedRegex(@"^REQ-CON-\d{4}-[A-Z0-9]{6}$", RegexOptions.CultureInvariant)]
    private static partial Regex TicketCodeRegex();

    public static string GenerateTicketCode(DateTimeOffset? now = null)
    {
        var year = (now ?? DateTimeOffset.UtcNow).Year;
        Span<char> suffix = stackalloc char[6];
        for (var i = 0; i < suffix.Length; i++)
        {
            suffix[i] = TicketAlphabet[RandomNumberGenerator.GetInt32(TicketAlphabet.Length)];
        }
        return $"REQ-CON-{year:D4}-{new string(suffix)}";
    }

    public static bool IsValidTicketCode(string? ticketCode)
        => !string.IsNullOrWhiteSpace(ticketCode) && TicketCodeRegex().IsMatch(ticketCode.Trim());

    public static bool ShouldUnmaskPii(string? status)
        => string.Equals(status?.Trim(), Statuses.Scheduled, StringComparison.OrdinalIgnoreCase)
        || string.Equals(status?.Trim(), Statuses.Completed, StringComparison.OrdinalIgnoreCase);

    public static string? MaskPhone(string? phone, string? status)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;
        var trimmed = phone.Trim();
        if (ShouldUnmaskPii(status)) return trimmed;

        if (trimmed.Length >= 7)
            return $"{trimmed[..4]}{new string('*', trimmed.Length - 6)}{trimmed[^2..]}";
        if (trimmed.Length >= 3)
            return $"{trimmed[0]}{new string('*', trimmed.Length - 2)}{trimmed[^1]}";
        return "***";
    }

    public static string? MaskEmail(string? email, string? status)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        var trimmed = email.Trim();
        if (ShouldUnmaskPii(status)) return trimmed;

        var atIdx = trimmed.IndexOf('@');
        if (atIdx <= 0 || atIdx == trimmed.Length - 1)
            return MaskPhone(trimmed, status);

        var local = trimmed[..atIdx];
        var domain = trimmed[(atIdx + 1)..];
        var prefix = local.Length <= 1 ? "*" : $"{local[0]}***";
        return $"{prefix}@{domain}";
    }

    public static string ResolveTransition(string? currentStatus, string? action, string? rejectionReason)
    {
        var normalizedAction = action?.Trim().ToUpperInvariant();
        var normalizedStatus = currentStatus?.Trim().ToUpperInvariant() ?? string.Empty;

        return normalizedAction switch
        {
            Actions.Accept => normalizedStatus == Statuses.Pending
                ? Statuses.Scheduled
                : throw new ConflictException(
                    $"Không thể tiếp nhận phiếu đang ở trạng thái {normalizedStatus}.",
                    "CONSULTATION_INVALID_STATE"),

            Actions.Reject => ValidateRejectTransition(normalizedStatus, rejectionReason),

            Actions.Complete => normalizedStatus == Statuses.Scheduled
                ? Statuses.Completed
                : throw new ConflictException(
                    $"Chỉ có thể hoàn thành phiếu đang ở trạng thái SCHEDULED (hiện tại: {normalizedStatus}).",
                    "CONSULTATION_INVALID_STATE"),

            _ => throw ValidationException.WithCode(
                "INVALID_CONSULTATION_ACTION",
                "Hành động xử lý phải là ACCEPT, REJECT hoặc COMPLETE.")
        };
    }

    private static string ValidateRejectTransition(string normalizedStatus, string? rejectionReason)
    {
        if (normalizedStatus != Statuses.Pending)
        {
            throw new ConflictException(
                $"Không thể từ chối phiếu đang ở trạng thái {normalizedStatus}.",
                "CONSULTATION_INVALID_STATE");
        }

        if (string.IsNullOrWhiteSpace(rejectionReason) || rejectionReason.Trim().Length < 10)
        {
            throw ValidationException.WithCode(
                "REJECTION_REASON_TOO_SHORT",
                "Lý do từ chối phải có ít nhất 10 ký tự.");
        }

        return Statuses.Rejected;
    }

    public static void EnsureExpertOwnership(Guid consultationExpertPersonId, Guid actorPersonId)
    {
        if (consultationExpertPersonId != actorPersonId)
        {
            throw new ForbiddenException(
                "Bạn không có quyền xử lý yêu cầu tư vấn của chuyên gia khác.",
                "CONSULTATION_EXPERT_FORBIDDEN")
            {
                RuleId = "BR-CON-004"
            };
        }
    }

    public static void EnsureBuyerOwnership(Guid? requesterPersonId, Guid actorPersonId)
    {
        if (requesterPersonId != actorPersonId)
        {
            throw new ForbiddenException(
                "Bạn không có quyền truy cập hoặc đánh giá yêu cầu tư vấn của người khác.",
                "CONSULTATION_BUYER_FORBIDDEN")
            {
                RuleId = "BR-CON-003"
            };
        }
    }

    public static void ValidateReviewInput(int rating)
    {
        if (rating < 1 || rating > 5)
        {
            throw ValidationException.WithCode(
                "INVALID_RATING",
                "Số sao đánh giá phải từ 1 đến 5.");
        }
    }

    public static DomainException ResolveReviewZeroRowsError(
        bool exists,
        Guid? requesterPersonId,
        Guid actorPersonId,
        string? status,
        DateTimeOffset? reviewedAt)
    {
        if (!exists)
            return new NotFoundException("Không tìm thấy phiếu yêu cầu tư vấn.", "CONSULTATION_NOT_FOUND");

        if (requesterPersonId != actorPersonId)
        {
            return new ForbiddenException(
                "Bạn không có quyền đánh giá yêu cầu tư vấn của người khác.",
                "CONSULTATION_BUYER_FORBIDDEN")
            {
                RuleId = "BR-CON-003"
            };
        }

        if (!string.Equals(status?.Trim(), Statuses.Completed, StringComparison.OrdinalIgnoreCase))
        {
            return new ConflictException(
                "Chỉ có thể đánh giá sau khi buổi tư vấn đã hoàn thành (COMPLETED).",
                "CONSULTATION_NOT_COMPLETED");
        }

        if (reviewedAt is not null)
        {
            return new ConflictException(
                "Phiếu tư vấn này đã được đánh giá trước đó.",
                "CONSULTATION_ALREADY_REVIEWED");
        }

        return new ConflictException(
            "Không thể gửi đánh giá cho phiếu tư vấn này.",
            "CONSULTATION_REVIEW_CONFLICT");
    }

    public static async Task EnsureConsultationsSchemaAsync(DbConnection conn, CancellationToken ct)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE SCHEMA IF NOT EXISTS brokerage;
            CREATE TABLE IF NOT EXISTS brokerage.expert_consultations (
                id UUID PRIMARY KEY,
                person_id UUID NOT NULL,
                ticket_code VARCHAR(100) NOT NULL,
                source VARCHAR(50) NOT NULL,
                assigned_by_department VARCHAR(255),
                enterprise_name VARCHAR(255) NOT NULL,
                demand_title VARCHAR(500) NOT NULL,
                contact_person VARCHAR(255),
                contact_phone VARCHAR(50),
                contact_email VARCHAR(255),
                requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                sla_deadline_hours INT NOT NULL DEFAULT 48,
                status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                meeting_date VARCHAR(50),
                meeting_time VARCHAR(100),
                meeting_type VARCHAR(100),
                meeting_url VARCHAR(500),
                advisory_fee_vnd NUMERIC(18, 2) DEFAULT 0,
                fee_payer VARCHAR(255),
                disbursement_status VARCHAR(50) DEFAULT 'NONE',
                disbursement_amount_vnd NUMERIC(18, 2) DEFAULT 0,
                enterprise_tni_score NUMERIC(5, 2) DEFAULT 80,
                description TEXT,
                location VARCHAR(255),
                duration VARCHAR(100),
                expires_at TIMESTAMPTZ,
                remaining_hours INT DEFAULT 48,
                can_join_meeting BOOLEAN DEFAULT false,
                meeting_countdown_text VARCHAR(255),
                pre_read_materials TEXT,
                completed_at TIMESTAMPTZ,
                moa_document_url VARCHAR(500),
                moa_document_name VARCHAR(255),
                enterprise_rating INT,
                enterprise_review TEXT,
                expert_evaluation TEXT,
                expert_note TEXT,
                rejection_reason_category VARCHAR(255),
                rejection_note TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            ALTER TABLE brokerage.expert_consultations
                ADD COLUMN IF NOT EXISTS requester_person_id UUID NULL,
                ADD COLUMN IF NOT EXISTS expert_code VARCHAR(64) NULL,
                ADD COLUMN IF NOT EXISTS expert_name VARCHAR(255) NULL,
                ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NULL,
                ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500) NULL,
                ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
                ADD COLUMN IF NOT EXISTS rating SMALLINT NULL,
                ADD COLUMN IF NOT EXISTS review_comment TEXT NULL,
                ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL;

            CREATE INDEX IF NOT EXISTS idx_expert_consultations_requester
                ON brokerage.expert_consultations (requester_person_id);
            CREATE INDEX IF NOT EXISTS idx_expert_consultations_person_status
                ON brokerage.expert_consultations (person_id, status);
            CREATE UNIQUE INDEX IF NOT EXISTS uq_expert_consultations_ticket_code
                ON brokerage.expert_consultations (ticket_code);";
        await cmd.ExecuteNonQueryAsync(ct);
    }
}
