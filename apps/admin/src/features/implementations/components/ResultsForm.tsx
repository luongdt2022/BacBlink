import { Award, Plus, X } from 'lucide-react'
import { DynamicListField } from './DynamicListField'

interface KPI {
  metric: string
  target: string
  achieved: string
  unit: string
}

interface ResultsFormProps {
  result: string
  kpis: KPI[]
  successAnalysis: string
  lessonsLearned: string[]
  recommendations: string[]
  onResultChange: (value: string) => void
  onKpisChange: (kpis: KPI[]) => void
  onSuccessAnalysisChange: (value: string) => void
  onLessonsLearnedChange: (lessons: string[]) => void
  onRecommendationsChange: (recommendations: string[]) => void
}

const RESULT_OPTIONS = [
  { value: 'success', label: 'Thành công' },
  { value: 'partial', label: 'Thành công một phần' },
  { value: 'failed', label: 'Không thành công' },
]

export function ResultsForm({
  result,
  kpis,
  successAnalysis,
  lessonsLearned,
  recommendations,
  onResultChange,
  onKpisChange,
  onSuccessAnalysisChange,
  onLessonsLearnedChange,
  onRecommendationsChange,
}: ResultsFormProps) {
  const addKPI = () => {
    onKpisChange([...kpis, { metric: '', target: '', achieved: '', unit: '' }])
  }

  const updateKPI = (index: number, field: keyof KPI, value: string) => {
    const newKpis = [...kpis]
    newKpis[index][field] = value
    onKpisChange(newKpis)
  }

  const removeKPI = (index: number) => {
    onKpisChange(kpis.filter((_, i) => i !== index))
  }

  const addLesson = () => {
    onLessonsLearnedChange([...lessonsLearned, ''])
  }

  const updateLesson = (index: number, value: string) => {
    const newLessons = [...lessonsLearned]
    newLessons[index] = value
    onLessonsLearnedChange(newLessons)
  }

  const removeLesson = (index: number) => {
    onLessonsLearnedChange(lessonsLearned.filter((_, i) => i !== index))
  }

  const addRecommendation = () => {
    onRecommendationsChange([...recommendations, ''])
  }

  const updateRecommendation = (index: number, value: string) => {
    const newRecs = [...recommendations]
    newRecs[index] = value
    onRecommendationsChange(newRecs)
  }

  const removeRecommendation = (index: number) => {
    onRecommendationsChange(recommendations.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-brand" />
        Kết quả & Bài học
      </h2>

      <div className="space-y-6">
        {/* Result */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kết quả tổng thể
          </label>
          <select
            value={result}
            onChange={(e) => onResultChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {RESULT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* KPIs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              KPI đạt được
            </label>
            <button
              type="button"
              onClick={addKPI}
              className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
            >
              <Plus className="w-4 h-4" />
              Thêm KPI
            </button>
          </div>
          <div className="space-y-3">
            {kpis.map((kpi, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={kpi.metric}
                    onChange={(e) => updateKPI(index, 'metric', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                    placeholder="Tên chỉ số"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={kpi.target}
                    onChange={(e) => updateKPI(index, 'target', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                    placeholder="Mục tiêu"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={kpi.achieved}
                    onChange={(e) => updateKPI(index, 'achieved', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                    placeholder="Đạt được"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={kpi.unit}
                    onChange={(e) => updateKPI(index, 'unit', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                    placeholder="Đơn vị"
                  />
                  <button
                    type="button"
                    onClick={() => removeKPI(index)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phân tích nguyên nhân thành công/thất bại
          </label>
          <textarea
            value={successAnalysis}
            onChange={(e) => onSuccessAnalysisChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            placeholder="Phân tích chi tiết về các yếu tố dẫn đến kết quả"
          />
        </div>

        {/* Lessons Learned */}
        <DynamicListField
          label="Bài học rút ra"
          items={lessonsLearned}
          onAdd={addLesson}
          onRemove={removeLesson}
          onChange={updateLesson}
          placeholder="Nhập bài học kinh nghiệm"
          addButtonText="+ Thêm bài học"
        />

        {/* Recommendations */}
        <DynamicListField
          label="Khuyến nghị"
          items={recommendations}
          onAdd={addRecommendation}
          onRemove={removeRecommendation}
          onChange={updateRecommendation}
          placeholder="Nhập khuyến nghị"
          addButtonText="+ Thêm khuyến nghị"
        />
      </div>
    </div>
  )
}
