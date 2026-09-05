import { TrendingUp, X } from 'lucide-react'

interface Phase {
  phase: string
  duration: string
  description: string
  issues: string[]
}

interface TimelineFormProps {
  timeline: Phase[]
  onTimelineChange: (timeline: Phase[]) => void
}

export function TimelineForm({ timeline, onTimelineChange }: TimelineFormProps) {
  const updatePhase = (index: number, field: keyof Phase, value: string | string[]) => {
    const newTimeline = [...timeline]
    newTimeline[index] = { ...newTimeline[index], [field]: value }
    onTimelineChange(newTimeline)
  }

  const addPhaseIssue = (phaseIndex: number) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].issues.push('')
    onTimelineChange(newTimeline)
  }

  const updatePhaseIssue = (phaseIndex: number, issueIndex: number, value: string) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].issues[issueIndex] = value
    onTimelineChange(newTimeline)
  }

  const removePhaseIssue = (phaseIndex: number, issueIndex: number) => {
    const newTimeline = [...timeline]
    newTimeline[phaseIndex].issues = newTimeline[phaseIndex].issues.filter(
      (_, i) => i !== issueIndex
    )
    onTimelineChange(newTimeline)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-brand" />
        Quá trình triển khai
      </h2>
      <div className="space-y-6">
        {timeline.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{phase.phase}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời lượng
                </label>
                <input
                  type="text"
                  value={phase.duration}
                  onChange={(e) => updatePhase(phaseIndex, 'duration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="VD: 2 tuần"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={phase.description}
                  onChange={(e) => updatePhase(phaseIndex, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Mô tả các hoạt động trong giai đoạn này"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vấn đề gặp phải
                  </label>
                  <button
                    type="button"
                    onClick={() => addPhaseIssue(phaseIndex)}
                    className="text-sm text-brand hover:underline"
                  >
                    + Thêm vấn đề
                  </button>
                </div>
                <div className="space-y-2">
                  {phase.issues.map((issue, issueIndex) => (
                    <div key={issueIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={issue}
                        onChange={(e) =>
                          updatePhaseIssue(phaseIndex, issueIndex, e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                        placeholder="Mô tả vấn đề"
                      />
                      <button
                        type="button"
                        onClick={() => removePhaseIssue(phaseIndex, issueIndex)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
