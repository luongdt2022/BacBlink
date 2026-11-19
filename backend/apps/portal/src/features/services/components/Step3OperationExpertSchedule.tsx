interface Step3OperationExpertScheduleProps {
  data: {
    startDate: string;
    estimatedBudget: string;
    workMode: string;
  };
  onChange: (data: Step3OperationExpertScheduleProps['data']) => void;
}

export function Step3OperationExpertSchedule({ data, onChange }: Step3OperationExpertScheduleProps) {
  const handleChange = (field: keyof typeof data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const workModes = [
    { value: 'Online', label: 'Online', description: 'Làm việc từ xa qua các công cụ trực tuyến' },
    { value: 'Offline', label: 'Offline', description: 'Làm việc trực tiếp tại văn phòng' },
    { value: 'Hybrid', label: 'Hybrid', description: 'Kết hợp cả online và offline' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Thời gian & Ngân sách
        </h2>

        {/* Start Date */}
        <div className="mb-6">
          <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-foreground">
            Thời gian mong muốn bắt đầu
          </label>
          <input
            id="startDate"
            type="date"
            value={data.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full rounded-lg border border px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Thời điểm dự kiến bắt đầu hợp tác (không bắt buộc)
          </p>
        </div>

        {/* Estimated Budget */}
        <div className="mb-6">
          <label htmlFor="estimatedBudget" className="mb-2 block text-sm font-medium text-foreground">
            Ngân sách dự kiến (VNĐ)
          </label>
          <input
            id="estimatedBudget"
            type="text"
            value={data.estimatedBudget}
            onChange={(e) => handleChange('estimatedBudget', e.target.value)}
            placeholder="Ví dụ: 50.000.000 - 100.000.000"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Khung ngân sách dự kiến cho dự án (không bắt buộc)
          </p>
        </div>

        {/* Work Mode */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Hình thức làm việc
          </label>
          <div className="space-y-3">
            {workModes.map((mode) => (
              <label
                key={mode.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border p-4 transition-colors hover:bg-[#f9fafb]"
              >
                <input
                  type="radio"
                  name="workMode"
                  value={mode.value}
                  checked={data.workMode === mode.value}
                  onChange={(e) => handleChange('workMode', e.target.value)}
                  className="mt-1 size-4 border-[#d1d5db] text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{mode.label}</div>
                  <div className="text-sm text-muted-foreground">{mode.description}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Chọn hình thức làm việc phù hợp với tổ chức của bạn
          </p>
        </div>

        {/* Confirmation Notice */}
        <div className="rounded-lg border border bg-[#f9fafb] p-4">
          <div className="text-sm text-[#4b5563]">
            <p className="mb-2 font-medium text-foreground">Lưu ý:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Yêu cầu sẽ được gửi đến bộ phận phụ trách để xem xét</li>
              <li>Chúng tôi sẽ liên hệ với bạn trong vòng 2-3 ngày làm việc</li>
              <li>Bạn có thể theo dõi trạng thái yêu cầu tại trang "Chuyên gia vận hành"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
