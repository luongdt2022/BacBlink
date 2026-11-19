import { Navigate, useParams } from 'react-router-dom';
import { IntakeDetailPage } from './IntakeDetailPage';

export function IpDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/ips" replace />;
  }

  return <IntakeDetailPage intakeId={id} expectedType="ip" backPath="/ips" editPath={`/ips/${id}/edit`} />;
}
