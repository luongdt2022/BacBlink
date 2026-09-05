interface Step2ValuationScopeProps {
  data: {
    serviceType: 'patent' | 'ip-assessment' | 'professional-report' | '';
    additionalServices: string[];
  };
  onChange: (data: Step2ValuationScopeProps['data']) => void;
}

export function Step2ValuationScope({ data, onChange }: Step2ValuationScopeProps) {
  const handleServiceTypeChange = (type: Step2ValuationScopeProps['data']['serviceType']) => {
    onChange({ ...data, serviceType: type });
  };

  const handleCheckboxChange = (service: string) => {
    const updated = data.additionalServices.includes(service)
      ? data.additionalServices.filter((s) => s !== service)
      : [...data.additionalServices, service];
    onChange({ ...data, additionalServices: updated });
  };

  return (
    <div className="space-y-8">
      {/* Loại dịch vụ chính */}
      <div>
        <label className="mb-4 block text-sm font-medium text-foreground">
          Loại dịch vụ định giá <span className="text-[#dc2626]">*</span>
        </label>
        <div className="space-y-3">
          {/* Định giá sáng chế */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 transition-colors hover:border-primary">
            <input
              type="radio"
              name="serviceType"
              value="patent"
              checked={data.serviceType === 'patent'}
              onChange={() => handleServiceTypeChange('patent')}
              className="mt-0.5 size-4 accent-primary"
            />
            <div>
              <div className="font-medium text-foreground">Định giá sáng chế</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Đánh giá giá trị của bằng sáng chế cụ thể
              </div>
            </div>
          </label>

          {/* Đánh giá tài sản trí tuệ */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 transition-colors hover:border-primary">
            <input
              type="radio"
              name="serviceType"
              value="ip-assessment"
              checked={data.serviceType === 'ip-assessment'}
              onChange={() => handleServiceTypeChange('ip-assessment')}
              className="mt-0.5 size-4 accent-primary"
            />
            <div>
              <div className="font-medium text-foreground">Đánh giá tài sản trí tuệ</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Đánh giá toàn diện danh mục tài sản trí tuệ
              </div>
            </div>
          </label>

          {/* Báo cáo định giá chuyên nghiệp */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 transition-colors hover:border-primary">
            <input
              type="radio"
              name="serviceType"
              value="professional-report"
              checked={data.serviceType === 'professional-report'}
              onChange={() => handleServiceTypeChange('professional-report')}
              className="mt-0.5 size-4 accent-primary"
            />
            <div>
              <div className="font-medium text-foreground">Báo cáo định giá chuyên nghiệp</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Báo cáo chi tiết với phương pháp định giá quốc tế
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Dịch vụ bổ sung */}
      <div>
        <label className="mb-4 block text-sm font-medium text-foreground">
          Dịch vụ bổ sung (Tùy chọn)
        </label>
        <div className="space-y-3">
          {[
            { id: 'risk-analysis', label: 'Phân tích rủi ro', desc: 'Đánh giá rủi ro pháp lý và thị trường' },
            { id: 'cash-flow', label: 'Dự báo dòng tiền', desc: 'Phân tích tiềm năng tài chính' },
            { id: 'market-comparison', label: 'So sánh thị trường', desc: 'Phân tích cạnh tranh và định vị' },
            { id: 'independent-audit', label: 'Hỗ trợ thẩm định độc lập', desc: 'Xác minh bởi chuyên gia độc lập' },
          ].map((service) => (
            <label
              key={service.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4 transition-colors hover:border-primary"
            >
              <input
                type="checkbox"
                checked={data.additionalServices.includes(service.id)}
                onChange={() => handleCheckboxChange(service.id)}
                className="mt-0.5 size-4 rounded accent-primary"
              />
              <div>
                <div className="font-medium text-foreground">{service.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{service.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
