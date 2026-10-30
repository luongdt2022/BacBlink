/**
 * Tiện ích định dạng tiền tệ Triệu / Tỷ VNĐ dùng chung cho sàn NacenTech.
 * Quy đổi:
 * - null / undefined / 0 -> "0 VNĐ" (hoặc "0 Tr" nếu compact, hoặc emptyLabel nếu được cấu hình)
 * - value >= 1000 -> (value / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + (" Tỷ" hoặc " Tỷ VNĐ")
 * - value < 1000 -> Math.round(value).toLocaleString('vi-VN') + (" Tr" hoặc " Triệu VNĐ")
 */

export interface FormatCurrencyOptions {
  compact?: boolean;
  emptyLabel?: string;
}

export function formatCurrencyMillionVnd(
  valueInMillion: number | null | undefined,
  options?: FormatCurrencyOptions
): string {
  if (valueInMillion === null || valueInMillion === undefined || valueInMillion === 0) {
    if (options?.emptyLabel !== undefined) {
      return options.emptyLabel;
    }
    return options?.compact ? '0 Tr' : '0 VNĐ';
  }

  const isCompact = options?.compact ?? false;

  if (Math.abs(valueInMillion) >= 1000) {
    const billionValue = valueInMillion / 1000;
    const formatted = billionValue.toLocaleString('vi-VN', {
      maximumFractionDigits: 1,
    });
    return `${formatted}${isCompact ? ' Tỷ' : ' Tỷ VNĐ'}`;
  }

  const formatted = Math.round(valueInMillion).toLocaleString('vi-VN');
  return `${formatted}${isCompact ? ' Tr' : ' Triệu VNĐ'}`;
}
