import { Award, CheckCircle2, Target, Lightbulb } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { ImplementationResultStatus } from '../types'

interface KPI {
  metric: string
  target: string
  achieved: string
  unit: string
}

interface ResultsSectionProps {
  result: ImplementationResultStatus
  kpis: KPI[]
  successAnalysis: string
  lessonsLearned: string[]
  recommendations: string[]
}

export function ResultsSection({
  result,
  kpis,
  successAnalysis,
  lessonsLearned,
  recommendations,
}: ResultsSectionProps) {
  const getResultConfig = (res: string) => {
    switch (res) {
      case 'success':
        return {
          badge: <Badge variant="success">Thành công</Badge>,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
        }
      case 'partial':
        return {
          badge: <Badge variant="warning">Thành công một phần</Badge>,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
        }
      case 'failed':
        return {
          badge: <Badge variant="danger">Không thành công</Badge>,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
        }
      default:
        return {
          badge: null,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
        }
    }
  }

  const resultConfig = getResultConfig(result)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-brand" />
        Kết quả & Bài học
      </h2>

      {/* Result Badge */}
      <div
        className={`rounded-lg border ${resultConfig.borderColor} ${resultConfig.bgColor} p-6 mb-6`}
      >
        <div className="flex items-center gap-4">
          {result === 'success' && (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          )}
          {result === 'partial' && (
            <span className="text-4xl">⚠️</span>
          )}
          {result === 'failed' && (
            <span className="text-4xl">❌</span>
          )}
          <div className="flex-1">
            <div className="text-2xl font-bold mb-1">{resultConfig.badge}</div>
            <p className={`text-sm ${resultConfig.textColor}`}>
              {result === 'success' && 'Dự án đã hoàn thành với kết quả vượt mong đợi'}
              {result === 'partial' && 'Dự án hoàn thành với kết quả chưa đạt kỳ vọng'}
              {result === 'failed' && 'Dự án không đạt được mục tiêu đề ra'}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs Achieved */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">KPI đạt được</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">{kpi.metric}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{kpi.achieved}</span>
                {kpi.unit && <span className="text-sm text-gray-600">{kpi.unit}</span>}
              </div>
              <div className="text-xs text-gray-500 mt-1">Mục tiêu: {kpi.target}</div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Đạt mục tiêu</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Analysis */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          Phân tích nguyên nhân thành công/thất bại
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-900 leading-relaxed">
            {successAnalysis}
          </p>
        </div>
      </div>

      {/* Lessons Learned */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Bài học rút ra</h3>
        <ul className="space-y-2">
          {lessonsLearned.map((lesson, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-900">{lesson}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Khuyến nghị</h3>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-sm text-gray-900">{rec}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
