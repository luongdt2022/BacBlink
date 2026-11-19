import { IntakeFormPage } from './IntakeFormPage';

export function CreateChallengePage() {
  return <IntakeFormPage forcedType="challenge" backPath="/challenges" successPath="/challenges" />;
}
