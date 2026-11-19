interface Step1ValuationTechInfoProps {
  data: {
    name: string;
    field: string;
    description: string;
    patentNumber: string;
    trlLevel: number;
  };
  onChange: (data: Step1ValuationTechInfoProps['data']) => void;
}

export function Step1ValuationTechInfo({ data, onChange }: Step1ValuationTechInfoProps) {
  return (
    <div className="space-y-6">
      {/* Tên công nghệ */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Tên công nghệ <span className="text-[#dc2626]">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="VD: Hệ thống chẩn đoán bệnh thông minh AI"
          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Lĩnh vực */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Lĩnh vực <span className="text-[#dc2626]">*</span>
        </label>
        <select
          value={data.field}
          onChange={(e) => onChange({ ...data, field: e.target.value })}
          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">-- Chọn lĩnh vực --</option>
          <option value="medical">Công nghệ Y tế</option>
          <option value="ai">AI & Machine Learning</option>
          <option value="energy">Năng lượng tái tạo</option>
          <option value="biotech">Công nghệ Sinh học</option>
          <option value="agriculture">Công nghệ Nông nghiệp</option>
          <option value="mechanical">Công nghệ Cơ khí</option>
          <option value="environment">Công nghệ Môi trường</option>
        </select>
      </div>

      {/* Mô tả chi tiết */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Mô tả chi tiết <span className="text-[#dc2626]">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={6}
          placeholder="Mô tả tổng quan về công nghệ, tính năng chính, ứng dụng và giá trị thương mại..."
          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Số bằng sáng chế */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Số bằng sáng chế
        </label>
        <input
          type="text"
          value={data.patentNumber}
          onChange={(e) => onChange({ ...data, patentNumber: e.target.value })}
          placeholder="VD: VN123456"
          className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Mức độ TRL */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Mức độ TRL (Technology Readiness Level)
        </label>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">TRL 1</span>
            <span className="text-lg font-semibold text-primary">TRL {data.trlLevel}</span>
            <span className="text-sm text-muted-foreground">TRL 9</span>
          </div>
          <input
            type="range"
            min="1"
            max="9"
            value={data.trlLevel}
            onChange={(e) => onChange({ ...data, trlLevel: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {data.trlLevel <= 3 && 'Nghiên cứu cơ bản'}
            {data.trlLevel >= 4 && data.trlLevel <= 6 && 'Phát triển công nghệ'}
            {data.trlLevel >= 7 && data.trlLevel <= 9 && 'Triển khai hệ thống'}
          </p>
        </div>
      </div>
    </div>
  );
}
