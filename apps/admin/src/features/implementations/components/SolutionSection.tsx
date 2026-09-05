import { Lightbulb, Building2, Download, File, Image as ImageIcon, Video } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { ImplementationDetail } from '../types'

interface SolutionSectionProps {
  solution: ImplementationDetail['solution']
}

export function SolutionSection({ solution }: SolutionSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-brand" />
        Giải pháp công nghệ
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Tên công nghệ/IP</label>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {solution.name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Đơn vị cung cấp</label>
            <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              {solution.provider}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              TRL tại thời điểm triển khai
            </label>
            <p className="mt-1">
              <Badge variant="success">{solution.trlAtImplementation}</Badge>
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Mô tả kỹ thuật</label>
          <p className="mt-2 text-sm text-gray-900 leading-relaxed">
            {solution.technicalDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tài liệu đính kèm
            </label>
            <div className="space-y-2">
              {solution.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <File className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 flex-1">{file}</span>
                  <Download className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Hình ảnh & Video
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-900">
                  {solution.media.images} hình ảnh
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-900">
                  {solution.media.videos} video demo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
