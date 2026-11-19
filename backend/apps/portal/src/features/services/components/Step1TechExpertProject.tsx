interface Step1TechExpertProjectProps {
  data: {
    projectName: string;
    techField: string;
    trlLevel: number;
    description: string;
  };
  onChange: (data: Step1TechExpertProjectProps['data']) => void;
}

export function Step1TechExpertProject({ data, onChange }: Step1TechExpertProjectProps) {
  const handleChange = (field: keyof typeof data, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const techFields = [
    'Công nghệ Y tế',
    'Công nghệ Sinh học',
    'Công nghệ Thông tin',
    'Công nghệ Nông nghiệp',
    'Năng lượng tái tạo',
    'Công nghệ Vật liệu',
    'Khác',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Thông tin dự án
        </h2>

        {/* Project Name */}
        <div className="mb-6">
          <label htmlFor="projectName" className="mb-2 block text-sm font-medium text-foreground">
            Tên dự án/công nghệ <span className="text-red-500">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            value={data.projectName}
            onChange={(e) => handleChange('projectName', e.target.value)}
            placeholder="Ví dụ: Phát triển hệ thống AI chẩn đoán bệnh từ xa"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tên gọi của dự án hoặc công nghệ cần hỗ trợ
          </p>
        </div>

        {/* Tech Field */}
        <div className="mb-6">
          <label htmlFor="techField" className="mb-2 block text-sm font-medium text-foreground">
            Lĩnh vực công nghệ <span className="text-red-500">*</span>
          </label>
          <select
            id="techField"
            value={data.techField}
            onChange={(e) => handleChange('techField', e.target.value)}
            className="w-full rounded-lg border border px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Chọn lĩnh vực công nghệ</option>
            {techFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Chọn lĩnh vực công nghệ phù hợp nhất
          </p>
        </div>

        {/* TRL Level */}
        <div className="mb-6">
          <label htmlFor="trlLevel" className="mb-2 block text-sm font-medium text-foreground">
            Mức độ sẵn sàng công nghệ (TRL) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <input
              id="trlLevel"
              type="range"
              min="1"
              max="9"
              value={data.trlLevel}
              onChange={(e) => handleChange('trlLevel', parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">TRL {data.trlLevel}</span>
              <span className="text-sm text-muted-foreground">
                {data.trlLevel <= 3 && 'Nghiên cứu cơ bản'}
                {data.trlLevel >= 4 && data.trlLevel <= 6 && 'Phát triển công nghệ'}
                {data.trlLevel >= 7 && data.trlLevel <= 8 && 'Thử nghiệm hệ thống'}
                {data.trlLevel === 9 && 'Sẵn sàng thương mại'}
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Đánh giá mức độ sẵn sàng công nghệ hiện tại (1-9)
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
            Mô tả dự án <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Mô tả chi tiết về dự án, mục tiêu nghiên cứu, kết quả mong đợi..."
            rows={5}
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mô tả tổng quan về dự án và vấn đề cần giải quyết
          </p>
        </div>
      </div>
    </div>
  );
}
