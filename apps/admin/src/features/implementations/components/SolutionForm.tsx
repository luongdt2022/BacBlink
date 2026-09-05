import { Lightbulb, Upload, FileText, X } from 'lucide-react'

const TRL_LEVELS = ['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9']

interface SolutionFormProps {
  solutionName: string
  provider: string
  trlAtImplementation: string
  technicalDescription: string
  attachments: File[]
  onSolutionNameChange: (value: string) => void
  onProviderChange: (value: string) => void
  onTrlChange: (value: string) => void
  onTechnicalDescriptionChange: (value: string) => void
  onAttachmentsChange: (files: File[]) => void
}

export function SolutionForm({
  solutionName,
  provider,
  trlAtImplementation,
  technicalDescription,
  attachments,
  onSolutionNameChange,
  onProviderChange,
  onTrlChange,
  onTechnicalDescriptionChange,
  onAttachmentsChange,
}: SolutionFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAttachmentsChange([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-brand" />
        Giải pháp công nghệ
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên công nghệ/IP
            </label>
            <input
              type="text"
              value={solutionName}
              onChange={(e) => onSolutionNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Tên giải pháp công nghệ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn vị cung cấp
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Tên đơn vị/tổ chức"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TRL tại thời điểm triển khai
            </label>
            <select
              value={trlAtImplementation}
              onChange={(e) => onTrlChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="">Chọn TRL</option>
              {TRL_LEVELS.map((trl) => (
                <option key={trl} value={trl}>
                  {trl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả kỹ thuật
          </label>
          <textarea
            value={technicalDescription}
            onChange={(e) => onTechnicalDescriptionChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="Mô tả chi tiết về công nghệ, kỹ thuật triển khai"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tài liệu đính kèm
          </label>
          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand hover:bg-blue-50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Tải lên tài liệu (PDF, DOCX, XLSX)
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
