import { useSearchParams } from 'react-router'
import { IntakeFormPage } from './IntakeFormPage'

export function EditChallengePage() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  if (!id) return null

  return <IntakeFormPage isEdit={true} intakeId={id} forcedType="challenge" basePath="/challenges" />
}
