interface Step1OperationExpertInfoProps {
  data: {
    requestName: string;
    expertField: string;
    priority: string;
    description: string;
  };
  onChange: (data: Step1OperationExpertInfoProps['data']) => void;
}

export function Step1OperationExpertInfo({ data, onChange }: Step1OperationExpertInfoProps) {
  const handleChange = (field: keyof typeof data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const expertFields = [
    'Quản trị doanh nghiệp',
    'Vận hành sản xuất',
    'Chuyển đổi số',
    'Tài chính',
    'Chuỗi cung ứng',
    'Khác',
  ];

  const priorities = ['Thấp', 'Trung bình', 'Cao'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Thông tin yêu cầu
        </h2>

        {/* Request Name */}
        <div className="mb-6">
          <label htmlFor="requestName" className="mb-2 block text-sm font-medium text-foreground">
            Tên yêu cầu <span className="text-red-500">*</span>
          </label>
          <input
            id="requestName"
            type="text"
            value={data.requestName}
            onChange={(e) => handleChange('requestName', e.target.value)}
            placeholder="Ví dụ: Cần chuyên gia tư vấn chuyển đổi số cho doanh nghiệp"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Nhập tên gọi ngắn gọn cho yêu cầu của bạn
          </p>
        </div>

        {/* Expert Field */}
        <div className="mb-6">
          <label htmlFor="expertField" className="mb-2 block text-sm font-medium text-foreground">
            Lĩnh vực chuyên gia <span className="text-red-500">*</span>
          </label>
          <select
            id="expertField"
            value={data.expertField}
            onChange={(e) => handleChange('expertField', e.target.value)}
            className="w-full rounded-lg border border px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Chọn lĩnh vực chuyên môn</option>
            {expertFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Chọn lĩnh vực chuyên môn bạn cần hỗ trợ
          </p>
        </div>

        {/* Priority */}
        <div className="mb-6">
          <label htmlFor="priority" className="mb-2 block text-sm font-medium text-foreground">
            Mức độ ưu tiên
          </label>
          <select
            id="priority"
            value={data.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full rounded-lg border border px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Chọn mức độ ưu tiên</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mức độ khẩn cấp của yêu cầu (không bắt buộc)
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
            Mô tả chi tiết nhu cầu <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Mô tả chi tiết về nhu cầu kết nối chuyên gia của bạn..."
            rows={5}
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mô tả rõ ràng về vấn đề cần giải quyết, mục tiêu kỳ vọng
          </p>
        </div>
      </div>
    </div>
  );
}
