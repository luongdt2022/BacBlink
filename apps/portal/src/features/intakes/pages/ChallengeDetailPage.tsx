import { Navigate, useParams } from 'react-router-dom';
import { IntakeDetailPage } from './IntakeDetailPage';

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/challenges" replace />;
  }

  return (
    <IntakeDetailPage
      intakeId={id}
      expectedType="challenge"
      backPath="/challenges"
      editPath={`/challenges/${id}/edit`}
    />
  );
}
