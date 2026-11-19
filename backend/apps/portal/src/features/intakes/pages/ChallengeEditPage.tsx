import { Navigate, useParams } from 'react-router-dom';
import { IntakeFormPage } from './IntakeFormPage';

export function ChallengeEditPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/challenges" replace />;
  }

  return <IntakeFormPage isEdit intakeId={id} forcedType="challenge" backPath="/challenges" successPath="/challenges" />;
}
