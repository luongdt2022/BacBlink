interface Step2OperationExpertOrganizationProps {
  data: {
    organizationName: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  onChange: (data: Step2OperationExpertOrganizationProps['data']) => void;
}

export function Step2OperationExpertOrganization({ data, onChange }: Step2OperationExpertOrganizationProps) {
  const handleChange = (field: keyof typeof data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Thông tin tổ chức
        </h2>

        {/* Organization Name */}
        <div className="mb-6">
          <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-foreground">
            Tên tổ chức <span className="text-red-500">*</span>
          </label>
          <input
            id="organizationName"
            type="text"
            value={data.organizationName}
            onChange={(e) => handleChange('organizationName', e.target.value)}
            placeholder="Ví dụ: Công ty TNHH ABC"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tên đầy đủ của tổ chức/doanh nghiệp
          </p>
        </div>

        {/* Contact Person */}
        <div className="mb-6">
          <label htmlFor="contactPerson" className="mb-2 block text-sm font-medium text-foreground">
            Người liên hệ <span className="text-red-500">*</span>
          </label>
          <input
            id="contactPerson"
            type="text"
            value={data.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            placeholder="Họ và tên người liên hệ"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Người đại diện liên hệ chính
          </p>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="example@email.com"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Địa chỉ email để nhận thông báo và liên hệ
          </p>
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="0123456789"
            className="w-full rounded-lg border border px-4 py-3 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1.5 text-sm text-muted-foreground">
            Số điện thoại di động hoặc cố định
          </p>
        </div>
      </div>
    </div>
  );
}
