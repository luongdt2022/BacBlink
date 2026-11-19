import { IntakeFormPage } from './IntakeFormPage'

export function CreateIpPage() {
  return <IntakeFormPage isEdit={false} forcedType="ip" basePath="/ips" />
}
