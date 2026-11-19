using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Blockchain.Domain.Invariants;

public static class BlockchainBusinessRules
{
    public const string GenesisPreviousHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

    public const string CodeBrBc01 = "BR_BC_01_INVALID_TRIGGER_STATUS";
    public const string CodeBrBc02 = "BR_BC_02_DUPLICATE_ACTIVE_ANCHOR";
    public const string CodeBrBc03 = "BR_BC_03_INVALID_GENESIS_BLOCK";
    public const string CodeBrBc04 = "BR_BC_04_DISCONTINUOUS_BLOCK_NUMBER";
    public const string CodeBrBc05 = "BR_BC_05_LEDGER_BLOCK_IMMUTABLE";
    public const string CodeBrBc06 = "BR_BC_06_BLOCK_SIGNATURE_REQUIRED";
    public const string CodeBrBc07 = "BR_BC_07_CONCURRENCY_TOKEN_MISMATCH";
    public const string CodeBrBc08 = "BR_BC_08_RAW_PII_NOT_PERMITTED";

    public static void EnsureTriggerStatusMatches(string entityStatus, string policyTriggerStatus)
    {
        if (!string.Equals(entityStatus, policyTriggerStatus, StringComparison.OrdinalIgnoreCase))
        {
            throw ValidationException.WithCode(
                CodeBrBc01,
                $"Quy tắc BR-BC-01 vi phạm: Trạng thái thực thể '{entityStatus}' không khớp trigger_status '{policyTriggerStatus}' của chính sách neo."
            );
        }
    }

    public static void EnsureGenesisBlockValid(long blockNumber, string previousHash)
    {
        if (blockNumber == 0)
        {
            if (!string.Equals(previousHash, GenesisPreviousHash, StringComparison.OrdinalIgnoreCase))
            {
                throw ValidationException.WithCode(
                    CodeBrBc03,
                    $"Quy tắc BR-BC-03 vi phạm: Khối Genesis #0 bắt buộc phải có previous_hash là 64 số 0 '{GenesisPreviousHash}', nhận được: '{previousHash}'."
                );
            }
        }
    }

    public static void EnsureBlockNumberSequential(long previousBlockNumber, long newBlockNumber)
    {
        if (newBlockNumber != previousBlockNumber + 1)
        {
            throw ValidationException.WithCode(
                CodeBrBc04,
                $"Quy tắc BR-BC-04 vi phạm: Số thứ tự khối không liên tục. Khối trước là #{previousBlockNumber}, khối mới phải là #{previousBlockNumber + 1}, nhận được: #{newBlockNumber}."
            );
        }
    }

    public static void EnsureBlockSignatureProvided(string? blockSignature)
    {
        if (string.IsNullOrWhiteSpace(blockSignature))
        {
            throw ValidationException.WithCode(
                CodeBrBc06,
                "Quy tắc BR-BC-06 vi phạm: Bản ghi neo chỉ được chuyển sang LOCAL_LEDGER_ANCHORED khi khối sổ cái đã có chữ ký số hợp lệ."
            );
        }
    }

    public static void EnsureNoRawPiiInField(string fieldName, string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;

        // Phát hiện các mẫu số điện thoại VN (10 số), email, số CCCD (12 số)
        if (System.Text.RegularExpressions.Regex.IsMatch(value, @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b") ||
            System.Text.RegularExpressions.Regex.IsMatch(value, @"\b(0[3|5|7|8|9])[0-9]{8}\b") ||
            System.Text.RegularExpressions.Regex.IsMatch(value, @"\b[0-9]{12}\b"))
        {
            throw ValidationException.WithCode(
                CodeBrBc08,
                $"Quy tắc BR-BC-08 vi phạm: Phát hiện thông tin định danh cá nhân nhạy cảm (PII) trong trường '{fieldName}'. Chỉ được lưu trữ băm cam kết ZKP."
            );
        }
    }
}
