import { FileText, Building2, DollarSign, Calendar } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { ImplementationDetail } from '../types'

interface ChallengeInfoSectionProps {
  implementation: ImplementationDetail
}

export function ChallengeInfoSection({ implementation }: ChallengeInfoSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-brand" />
        Thông tin bài toán
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Tên bài toán</label>
          <p className="mt-1 text-sm text-gray-900">{implementation.challengeName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Lĩnh vực</label>
          <p className="mt-1">
            <Badge variant="default">{implementation.field}</Badge>
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Doanh nghiệp</label>
          <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            {implementation.company}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Ngân sách</label>
          <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {implementation.budget}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Thời gian triển khai</label>
          <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {implementation.implementationPeriod}
          </p>
        </div>
      </div>
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700">Mô tả ban đầu</label>
        <p className="mt-2 text-sm text-gray-900 leading-relaxed">
          {implementation.initialDescription}
        </p>
      </div>
    </div>
  )
}
