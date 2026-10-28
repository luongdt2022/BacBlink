using System;

namespace NacenTech.Modules.Enterprise.Application;

public static class InnovationSurveyInvariants
{
    public const string ErrTaxCodeMismatch = "ERR_TAX_CODE_MISMATCH";

    /// <summary>
    /// BR-02-015: Khi User đã xác thực (isAuthenticated == true) và có doanh nghiệp liên kết,
    /// mã số thuế gửi lên phiếu submit bắt buộc phải trùng khớp với mã số thuế của doanh nghiệp đã xác thực.
    /// Nếu sai khác, hệ thống từ chối với lỗi ERR_TAX_CODE_MISMATCH.
    /// </summary>
    public static void ValidateTaxCodeSubmission(bool isAuthenticated, string? authenticatedEnterpriseTaxCode, string? submissionTaxCode)
    {
        if (!isAuthenticated) return;
        if (string.IsNullOrWhiteSpace(authenticatedEnterpriseTaxCode)) return;

        var cleanExpected = authenticatedEnterpriseTaxCode.Trim();
        var cleanSubmitted = submissionTaxCode?.Trim() ?? "";

        if (!string.Equals(cleanExpected, cleanSubmitted, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"BR-02-015: Mã số thuế '{cleanSubmitted}' không trùng khớp với mã số thuế '{cleanExpected}' của hồ sơ doanh nghiệp đã xác thực ({ErrTaxCodeMismatch}).");
        }
    }

    /// <summary>
    /// BR-02-015: Khi User đã xác thực và có doanh nghiệp liên kết, cờ isTaxCodeLocked trên form là true.
    /// </summary>
    public static bool DetermineIsTaxCodeLocked(bool isAuthenticated, bool hasLinkedEnterpriseWithTaxCode)
    {
        return isAuthenticated && hasLinkedEnterpriseWithTaxCode;
    }
}
