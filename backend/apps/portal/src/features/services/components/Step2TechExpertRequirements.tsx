interface Step2TechExpertRequirementsProps {
  data: {
    expertiseNeeded: string[];
    duration: string;
    budget: string;
    expectedOutcome: string;
  };
  onChange: (data: Step2TechExpertRequirementsProps['data']) => void;
}

export function Step2TechExpertRequirements({ data, onChange }: Step2TechExpertRequirementsProps) {
  const handleChange = (field: keyof typeof data, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const expertiseOptions = [
    'Nghiên cứu & Phát triển',
    'Thiết kế hệ thống',
    'Phân tích kỹ thuật',
    'Tối ưu hóa quy trình',
    'Thử nghiệm & Đánh giá',
    'Chuyển giao công nghệ',
    'Tư vấn chiến lược',
  ];

  const handleExpertiseToggle = (expertise: string) => {
    const current = data.expertiseNeeded;
    if (current.includes(expertise)) {
      handleChange('expertiseNeeded', current.filter((e) => e !== expertise));
    } else {
      handleChange('expertiseNeeded', [...current, expertise]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Yêu cầu hỗ trợ
        </h2>

        {/* Expertise Needed */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Lĩnh vực chuyên môn cần hỗ trợ <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {expertiseOptions.map((expertise) => (
              <label
                key={expertise}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border p-3 transition-colors hover:bg-[#f9fafb]"
              >
                <input
                  type="checkbox"
                  checked={data.expertiseNeeded.includes(expertise)}
                  onChange={() => handleExpertiseToggle(expertise)}
                  className="size-4 rounded border-[#d1d5db] text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{expertise}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Chọn một hoặc nhiều lĩnh vực chuyên môn bạn cần hỗ trợ
          </p>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label htmlFor="duration" className="mb-2 block text-sm font-medium text-foreground">
            Thời gian hợp tác dự kiến
          </label>
          <input
            id="duration"
            type="text"
            value={data.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="Ví dụ: 3 tháng, 6 tháng, 1 năm"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Thời gian dự kiến hợp tác với chuyên gia
          </p>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <label htmlFor="budget" className="mb-2 block text-sm font-medium text-foreground">
            Ngân sách dự kiến (VNĐ)
          </label>
          <input
            id="budget"
            type="text"
            value={data.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            placeholder="Ví dụ: 100.000.000 - 200.000.000"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Khung ngân sách dự kiến cho dự án (không bắt buộc)
          </p>
        </div>

        {/* Expected Outcome */}
        <div className="mb-6">
          <label htmlFor="expectedOutcome" className="mb-2 block text-sm font-medium text-foreground">
            Kết quả mong đợi
          </label>
          <textarea
            id="expectedOutcome"
            value={data.expectedOutcome}
            onChange={(e) => handleChange('expectedOutcome', e.target.value)}
            placeholder="Mô tả kết quả, sản phẩm, hoặc mục tiêu cụ thể bạn mong đợi..."
            rows={4}
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mô tả kết quả hoặc deliverable mong đợi từ chuyên gia
          </p>
        </div>
      </div>
    </div>
  );
}
