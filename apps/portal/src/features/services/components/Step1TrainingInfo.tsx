interface Step1TrainingInfoProps {
  data: {
    programName: string;
    serviceType: "training" | "consulting" | "technical-support" | "";
    targetAudience: string;
    participantCount: string;
  };
  onChange: (data: Step1TrainingInfoProps["data"]) => void;
}

export function Step1TrainingInfo({ data, onChange }: Step1TrainingInfoProps) {
  const handleChange = (field: keyof typeof data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Thông tin chương trình
        </h2>

        {/* Program Name */}
        <div className="mb-6">
          <label
            htmlFor="programName"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Tên chương trình <span className="text-red-500">*</span>
          </label>
          <input
            id="programName"
            type="text"
            value={data.programName}
            onChange={(e) => handleChange("programName", e.target.value)}
            placeholder="Ví dụ: Đào tạo quản lý dự án nghiên cứu khoa học"
            className="w-full rounded-lg border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Nhập tên chương trình đào tạo hoặc dịch vụ hỗ trợ bạn cần
          </p>
        </div>

        {/* Service Type */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Loại hình dịch vụ <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border p-4 transition-colors hover:bg-[#f9fafb]">
              <input
                type="radio"
                name="serviceType"
                value="training"
                checked={data.serviceType === "training"}
                onChange={(e) => handleChange("serviceType", e.target.value)}
                className="mt-1 size-4 border-[#d1d5db] text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">Đào tạo</div>
                <div className="text-sm text-muted-foreground">
                  Chương trình đào tạo, workshop, hội thảo chuyên sâu
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border p-4 transition-colors hover:bg-[#f9fafb]">
              <input
                type="radio"
                name="serviceType"
                value="consulting"
                checked={data.serviceType === "consulting"}
                onChange={(e) => handleChange("serviceType", e.target.value)}
                className="mt-1 size-4 border-[#d1d5db] text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">Tư vấn</div>
                <div className="text-sm text-muted-foreground">
                  Tư vấn chuyên sâu về chiến lược, quy trình, hệ sinh thái đổi
                  mới
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border p-4 transition-colors hover:bg-[#f9fafb]">
              <input
                type="radio"
                name="serviceType"
                value="technical-support"
                checked={data.serviceType === "technical-support"}
                onChange={(e) => handleChange("serviceType", e.target.value)}
                className="mt-1 size-4 border-[#d1d5db] text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  Hỗ trợ kỹ thuật
                </div>
                <div className="text-sm text-muted-foreground">
                  Hỗ trợ triển khai, vận hành phòng thí nghiệm, thiết bị
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-6">
          <label
            htmlFor="targetAudience"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Đối tượng tham gia <span className="text-red-500">*</span>
          </label>
          <input
            id="targetAudience"
            type="text"
            value={data.targetAudience}
            onChange={(e) => handleChange("targetAudience", e.target.value)}
            placeholder="Ví dụ: Nhà nghiên cứu, giảng viên, cán bộ quản lý"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Mô tả đối tượng sẽ tham gia chương trình
          </p>
        </div>

        {/* Participant Count */}
        <div className="mb-6">
          <label
            htmlFor="participantCount"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Số lượng học viên dự kiến
          </label>
          <input
            id="participantCount"
            type="text"
            value={data.participantCount}
            onChange={(e) => handleChange("participantCount", e.target.value)}
            placeholder="Ví dụ: 20-30 người"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Số lượng người dự kiến tham gia (không bắt buộc)
          </p>
        </div>
      </div>
    </div>
  );
}
