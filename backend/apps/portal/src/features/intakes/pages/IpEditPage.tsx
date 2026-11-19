import { Navigate, useParams } from 'react-router-dom';
import { IntakeFormPage } from './IntakeFormPage';

export function IpEditPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/ips" replace />;
  }

  return <IntakeFormPage isEdit intakeId={id} forcedType="ip" backPath="/ips" successPath="/ips" />;
}
