import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { ImplementationPhase } from '../types'

interface TimelineSectionProps {
  timeline: ImplementationPhase[]
}

export function TimelineSection({ timeline }: TimelineSectionProps) {
  const getPhaseIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    }
    return <AlertCircle className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-brand" />
        Quá trình triển khai
      </h2>

      <div className="space-y-6">
        {timeline.map((phase, index) => (
          <div key={index} className="relative">
            {/* Vertical line connector (except for last item) */}
            {index < timeline.length - 1 && (
              <div className="absolute left-2.5 top-8 w-0.5 h-full bg-gray-200"></div>
            )}

            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 mt-1">
                {getPhaseIcon(phase.status)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
                  <Badge variant="default">{phase.duration}</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-3">{phase.description}</p>

                {phase.issues && phase.issues.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">
                        Vấn đề gặp phải
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {phase.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="text-sm text-orange-800 pl-6">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
