/**
 * Implementation feature types
 */

export interface Implementation {
  id: string
  challengeName: string
  company: string
  solution: string
  provider: string
  implementationPeriod: string
  result: 'success' | 'partial' | 'failed'
  field: string
}

export interface ImplementationDetail {
  id: string
  challengeName: string
  field: string
  company: string
  budget: string
  implementationPeriod: string
  initialDescription: string
  solution: {
    name: string
    provider: string
    trlAtImplementation: string
    technicalDescription: string
    attachments: string[]
    media: {
      images: number
      videos: number
    }
  }
  timeline: ImplementationPhase[]
  results: ImplementationResult
}

export interface ImplementationPhase {
  phase: string
  duration: string
  description: string
  issues: string[]
  status: 'completed' | 'in_progress' | 'pending'
}

export interface ImplementationResult {
  effectiveness: string
  userSatisfaction: string
  lessons: string[]
  nextSteps: string[]
}

export type ImplementationResultStatus = 'success' | 'partial' | 'failed'

