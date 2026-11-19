import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import {
  ChallengeInfoForm,
  SolutionForm,
  TimelineForm,
  ResultsForm,
} from '../components'

interface Phase {
  phase: string
  duration: string
  description: string
  issues: string[]
}

interface KPI {
  metric: string
  target: string
  achieved: string
  unit: string
}

const DEFAULT_TIMELINE: Phase[] = [
  { phase: 'Giai đoạn 1 – Phân tích', duration: '', description: '', issues: [] },
  { phase: 'Giai đoạn 2 – Thử nghiệm', duration: '', description: '', issues: [] },
  { phase: 'Giai đoạn 3 – Triển khai', duration: '', description: '', issues: [] },
  { phase: 'Giai đoạn 4 – Đánh giá', duration: '', description: '', issues: [] },
]

export function CreateImplementationPage() {
  const navigate = useNavigate()

  // Section 1 - Challenge Info
  const [challengeName, setChallengeName] = useState('')
  const [field, setField] = useState('')
  const [company, setCompany] = useState('')
  const [budget, setBudget] = useState('')
  const [implementationPeriod, setImplementationPeriod] = useState('')
  const [initialDescription, setInitialDescription] = useState('')

  // Section 2 - Solution
  const [solutionName, setSolutionName] = useState('')
  const [provider, setProvider] = useState('')
  const [trlAtImplementation, setTrlAtImplementation] = useState('')
  const [technicalDescription, setTechnicalDescription] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])

  // Section 3 - Timeline
  const [timeline, setTimeline] = useState<Phase[]>(DEFAULT_TIMELINE)

  // Section 4 - Results
  const [result, setResult] = useState('success')
  const [kpis, setKpis] = useState<KPI[]>([{ metric: '', target: '', achieved: '', unit: '' }])
  const [successAnalysis, setSuccessAnalysis] = useState('')
  const [lessonsLearned, setLessonsLearned] = useState<string[]>([''])
  const [recommendations, setRecommendations] = useState<string[]>([''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!challengeName || !field || !company || !budget) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const implementationData = {
      challengeName,
      field,
      company,
      budget,
      implementationPeriod,
      initialDescription,
      solution: {
        name: solutionName,
        provider,
        trlAtImplementation,
        technicalDescription,
        attachments: attachments.map((f) => f.name),
      },
      timeline,
      result,
      kpis,
      successAnalysis,
      lessonsLearned: lessonsLearned.filter((l) => l.trim() !== ''),
      recommendations: recommendations.filter((r) => r.trim() !== ''),
    }

    alert('Hồ sơ triển khai đã được tạo thành công!')
    navigate('/implementations')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <button
            onClick={() => navigate('/implementations')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại danh sách</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Tạo mới Hồ sơ triển khai
              </h1>
              <p className="text-sm text-gray-600">
                Ghi nhận chi tiết quá trình triển khai giải pháp công nghệ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section 1 - Challenge Info */}
        <ChallengeInfoForm
          challengeName={challengeName}
          field={field}
          company={company}
          budget={budget}
          implementationPeriod={implementationPeriod}
          initialDescription={initialDescription}
          onChallengeNameChange={setChallengeName}
          onFieldChange={setField}
          onCompanyChange={setCompany}
          onBudgetChange={setBudget}
          onImplementationPeriodChange={setImplementationPeriod}
          onInitialDescriptionChange={setInitialDescription}
        />

        {/* Section 2 - Solution */}
        <SolutionForm
          solutionName={solutionName}
          provider={provider}
          trlAtImplementation={trlAtImplementation}
          technicalDescription={technicalDescription}
          attachments={attachments}
          onSolutionNameChange={setSolutionName}
          onProviderChange={setProvider}
          onTrlChange={setTrlAtImplementation}
          onTechnicalDescriptionChange={setTechnicalDescription}
          onAttachmentsChange={setAttachments}
        />

        {/* Section 3 - Timeline */}
        <TimelineForm timeline={timeline} onTimelineChange={setTimeline} />

        {/* Section 4 - Results */}
        <ResultsForm
          result={result}
          kpis={kpis}
          successAnalysis={successAnalysis}
          lessonsLearned={lessonsLearned}
          recommendations={recommendations}
          onResultChange={setResult}
          onKpisChange={setKpis}
          onSuccessAnalysisChange={setSuccessAnalysis}
          onLessonsLearnedChange={setLessonsLearned}
          onRecommendationsChange={setRecommendations}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-lg border border-gray-200 p-6">
          <button
            type="button"
            onClick={() => navigate('/implementations')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            Lưu hồ sơ
          </button>
        </div>
      </form>
    </div>
  )
}
