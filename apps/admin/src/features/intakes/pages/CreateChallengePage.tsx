import { IntakeFormPage } from './IntakeFormPage'

export function CreateChallengePage() {
  return <IntakeFormPage isEdit={false} forcedType="challenge" basePath="/challenges" />
}
