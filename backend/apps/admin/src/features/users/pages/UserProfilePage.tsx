import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  Shield,
  Lock,
  KeyRound,
  Mail,
  Phone,
} from 'lucide-react'

import { AdminPermissionModal } from '../components/AdminPermissionModal'
import { UserProfileTab } from '../components/UserProfileTab'
import { UserActivityTab } from '../components/UserActivityTab'
import { UserCollaborationHistoryTab } from '../components/UserCollaborationHistoryTab'
import { useUserProfile } from '../hooks/useUserProfile'
import type { TabType } from '../hooks/useUserProfile'

const TABS: { key: TabType; label: string }[] = [
  { key: 'info', label: 'Thông tin chung' },
  { key: 'activity', label: 'Hoạt động' },
  { key: 'history', label: 'Lịch sử cung cầu' },
]

export function UserProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)

  const { data, isLoading, error, lockAccount } = useUserProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error ?? 'Không tìm thấy người dùng'}</p>
      </div>
    )
  }

  const { user, ipIntakes, challengeIntakes, collaborationHistory } = data
  const displayName = user.organization || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  const statusText = user.isActive ? 'Đang hoạt động' : 'Đã khóa'
  const statusClass = user.isActive
    ? 'px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200'
    : 'px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200'

  const profileUser = {
    email: user.email,
    phone: user.phone ?? '—',
    taxCode: '—',
    representative: [user.firstName, user.lastName].filter(Boolean).join(' ') || '—',
    address: '—',
    establishedYear: '—',
    website: '—',
  }

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-gray-600 hover:text-brand mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại Quản lý Người dùng</span>
          </button>

          <div className="flex items-start justify-between">
            {/* Avatar + Identity */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0 bg-brand flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                    {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  </span>
                  <span className={statusClass}>
                    {user.isActive ? '✓ ' : ''}{statusText}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{user.email}</span>
                  {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{user.phone}</span>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={lockAccount}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <Lock className="w-4 h-4" /><span>Khóa tài khoản</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                <KeyRound className="w-4 h-4" /><span>Đặt lại mật khẩu</span>
              </button>
              <button
                onClick={() => setIsPermissionModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-semibold text-sm"
              >
                <Shield className="w-4 h-4" /><span>Phân quyền Quản trị</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            {TABS.map(({ key, label }) => {
              const count =
                key === 'activity' ? ipIntakes.length + challengeIntakes.length
                : key === 'history' ? collaborationHistory.length
                : undefined
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-brand text-brand'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}{count !== undefined ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'info' && <UserProfileTab user={profileUser} />}
        {activeTab === 'activity' && <UserActivityTab ipIntakes={ipIntakes} challengeIntakes={challengeIntakes} />}
        {activeTab === 'history' && <UserCollaborationHistoryTab collaborationHistory={collaborationHistory} />}
      </div>

      {/* ── Admin Permission Modal ─────────────────────────────────────── */}
      <AdminPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        userName={profileUser.representative}
      />
    </div>
  )
}
