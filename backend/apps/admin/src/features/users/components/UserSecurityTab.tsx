import { Lock, KeyRound, Shield, CheckCircle } from 'lucide-react'

interface UserSecurityTabProps {
  onResetPassword: () => void
  onLockAccount: () => void
  onOpenPermissionModal: () => void
}

export function UserSecurityTab({ onResetPassword, onLockAccount, onOpenPermissionModal }: UserSecurityTabProps) {
  return (
    <div className="space-y-6">
      {/* Password & Authentication */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bảo mật & Xác thực</h2>
        <p className="text-sm text-gray-600 mb-6">Quản lý mật khẩu và các cài đặt bảo mật cho tài khoản.</p>

        <div className="space-y-4">
          <SecurityRow
            icon={<KeyRound className="w-5 h-5 text-blue-600" />}
            title="Đặt lại mật khẩu"
            description="Gửi email đặt lại mật khẩu đến người dùng"
            action={
              <button
                onClick={onResetPassword}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Gửi yêu cầu
              </button>
            }
          />

          <SecurityRow
            icon={<Lock className="w-5 h-5 text-red-600" />}
            title="Khóa tài khoản"
            description="Tạm thời vô hiệu hóa tài khoản người dùng"
            action={
              <button
                onClick={onLockAccount}
                className="px-4 py-2 bg-white border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                Khóa tài khoản
              </button>
            }
          />

          <SecurityRow
            icon={<Shield className="w-5 h-5 text-purple-600" />}
            title="Phân quyền Quản trị"
            description="Gán vai trò và quyền hạn quản trị cho người dùng"
            action={
              <button
                onClick={onOpenPermissionModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md font-semibold text-sm"
              >
                Phân quyền
              </button>
            }
          />
        </div>
      </div>

      {/* Login History (stub) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử đăng nhập</h2>
        <div className="space-y-3">
          <LoginHistoryRow
            ip="192.168.1.101"
            device="Chrome / Windows"
            location="Hà Nội, Việt Nam"
            time="10 phút trước"
            status="Thành công"
          />
          <LoginHistoryRow
            ip="10.0.0.45"
            device="Safari / macOS"
            location="TP. HCM, Việt Nam"
            time="2 giờ trước"
            status="Thành công"
          />
          <LoginHistoryRow
            ip="172.16.0.8"
            device="Firefox / Linux"
            location="Đà Nẵng, Việt Nam"
            time="1 ngày trước"
            status="Thành công"
          />
        </div>
      </div>
    </div>
  )
}

interface SecurityRowProps {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}

function SecurityRow({ icon, title, description, action }: SecurityRowProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      {action}
    </div>
  )
}

interface LoginHistoryRowProps {
  ip: string
  device: string
  location: string
  time: string
  status: string
}

function LoginHistoryRow({ ip, device, location, time, status }: LoginHistoryRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span className="font-mono font-medium text-gray-800">{ip}</span>
        <span>{device}</span>
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{time}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          <CheckCircle className="w-3 h-3" />
          {status}
        </span>
      </div>
    </div>
  )
}
