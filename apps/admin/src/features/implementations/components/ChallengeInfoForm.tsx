import { FileText } from 'lucide-react'
import { RESEARCH_FIELDS } from '../hooks/useImplementationsList'

interface ChallengeInfoFormProps {
  challengeName: string
  field: string
  company: string
  budget: string
  implementationPeriod: string
  initialDescription: string
  onChallengeNameChange: (value: string) => void
  onFieldChange: (value: string) => void
  onCompanyChange: (value: string) => void
  onBudgetChange: (value: string) => void
  onImplementationPeriodChange: (value: string) => void
  onInitialDescriptionChange: (value: string) => void
}

export function ChallengeInfoForm({
  challengeName,
  field,
  company,
  budget,
  implementationPeriod,
  initialDescription,
  onChallengeNameChange,
  onFieldChange,
  onCompanyChange,
  onBudgetChange,
  onImplementationPeriodChange,
  onInitialDescriptionChange,
}: ChallengeInfoFormProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-brand" />
        Thông tin bài toán
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên bài toán <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={challengeName}
              onChange={(e) => onChallengeNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Nhập tên bài toán"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lĩnh vực <span className="text-red-500">*</span>
            </label>
            <select
              value={field}
              onChange={(e) => onFieldChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              required
            >
              <option value="">Chọn lĩnh vực</option>
              {RESEARCH_FIELDS.filter((f) => f !== 'Tất cả').map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doanh nghiệp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Tên doanh nghiệp"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngân sách <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="VD: 15 tỷ VNĐ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian triển khai
            </label>
            <input
              type="text"
              value={implementationPeriod}
              onChange={(e) => onImplementationPeriodChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="VD: 01/2025 - 06/2025"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả ban đầu
          </label>
          <textarea
            value={initialDescription}
            onChange={(e) => onInitialDescriptionChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="Mô tả chi tiết về bài toán và yêu cầu ban đầu"
          />
        </div>
      </div>
    </div>
  )
}
