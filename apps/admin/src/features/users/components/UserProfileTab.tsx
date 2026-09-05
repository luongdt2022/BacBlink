import { Mail, Phone, FileText, User, MapPin, Building2 } from 'lucide-react'

interface UserProfileTabProps {
  user: {
    email: string
    phone: string
    taxCode: string
    representative: string
    address: string
    establishedYear: string
    website: string
  }
}

export function UserProfileTab({ user }: UserProfileTabProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin tổ chức</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field icon={<Mail className="w-5 h-5" />} label="Email liên hệ" value={user.email} />
        <Field icon={<Phone className="w-5 h-5" />} label="Số điện thoại" value={user.phone} />
        <Field icon={<FileText className="w-5 h-5" />} label="Mã số thuế" value={user.taxCode} />
        <Field icon={<User className="w-5 h-5" />} label="Người đại diện pháp lý" value={user.representative} />
        <Field icon={<MapPin className="w-5 h-5" />} label="Địa chỉ trụ sở" value={user.address} span />
        <Field icon={<Building2 className="w-5 h-5" />} label="Năm thành lập" value={user.establishedYear} />
        <Field
          icon={<FileText className="w-5 h-5" />}
          label="Website"
          value={
            <a href={`https://${user.website}`} className="text-brand hover:underline">
              {user.website}
            </a>
          }
        />
      </div>
    </div>
  )
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  span?: boolean
}

function Field({ icon, label, value, span }: FieldProps) {
  return (
    <div className={span ? 'md:col-span-2' : undefined}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-gray-500">{icon}</span>
        <span className="text-gray-900">{value}</span>
      </div>
    </div>
  )
}
