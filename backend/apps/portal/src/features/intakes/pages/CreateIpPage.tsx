import { IntakeFormPage } from './IntakeFormPage';

export function CreateIpPage() {
  return <IntakeFormPage forcedType="ip" backPath="/ips" successPath="/ips" />;
}
