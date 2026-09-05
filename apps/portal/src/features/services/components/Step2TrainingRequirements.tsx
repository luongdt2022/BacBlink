interface Step2TrainingRequirementsProps {
  data: {
    objectives: string;
    duration: string;
    location: string;
    preferredTime: string;
    budget: string;
  };
  onChange: (data: Step2TrainingRequirementsProps['data']) => void;
}

export function Step2TrainingRequirements({ data, onChange }: Step2TrainingRequirementsProps) {
  const handleChange = (field: keyof typeof data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Yêu cầu chi tiết
        </h2>

        {/* Objectives */}
        <div className="mb-6">
          <label htmlFor="objectives" className="mb-2 block text-sm font-medium text-foreground">
            Mục tiêu chương trình <span className="text-red-500">*</span>
          </label>
          <textarea
            id="objectives"
            value={data.objectives}
            onChange={(e) => handleChange('objectives', e.target.value)}
            placeholder="Mô tả chi tiết mục tiêu, kết quả mong đợi từ chương trình..."
            rows={5}
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Nêu rõ mục tiêu và kết quả kỳ vọng của chương trình
          </p>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label htmlFor="duration" className="mb-2 block text-sm font-medium text-foreground">
            Thời lượng mong muốn
          </label>
          <input
            id="duration"
            type="text"
            value={data.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="Ví dụ: 3 ngày, 2 tuần, 6 tháng"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Thời gian dự kiến cho chương trình
          </p>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
            Địa điểm tổ chức
          </label>
          <input
            id="location"
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Ví dụ: Hà Nội, Hồ Chí Minh, hoặc Trực tuyến"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Địa điểm mong muốn tổ chức chương trình
          </p>
        </div>

        {/* Preferred Time */}
        <div className="mb-6">
          <label htmlFor="preferredTime" className="mb-2 block text-sm font-medium text-foreground">
            Thời gian dự kiến
          </label>
          <input
            id="preferredTime"
            type="text"
            value={data.preferredTime}
            onChange={(e) => handleChange('preferredTime', e.target.value)}
            placeholder="Ví dụ: Tháng 4/2026, Quý 2/2026"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Khung thời gian dự kiến triển khai
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
            placeholder="Ví dụ: 50.000.000 - 100.000.000"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ngân sách dự kiến cho chương trình (không bắt buộc)
          </p>
        </div>
      </div>
    </div>
  );
}
