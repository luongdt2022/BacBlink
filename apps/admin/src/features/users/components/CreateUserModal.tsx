import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { toast } from 'sonner'
import { ADMIN_CREATE_PASSWORD_MIN_LENGTH, createUser } from '@/services/userService'
import type { CreateUserForm } from '@/services/userService'
import { getErrorMessage } from '@/lib/api/client'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [form, setForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
  })
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetAndClose = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', organization: '' })
    setEmailError('')
    setPasswordError('')
    setShowPassword(false)
    onClose()
  }

  const validateEmail = (email: string): string => {
    if (!emailRegex.test(email)) return 'Email không đúng định dạng'
    return ''
  }

  const validatePassword = (password: string): string => {
    if (!password) return 'Vui lòng đặt mật khẩu'
    if (password.length < ADMIN_CREATE_PASSWORD_MIN_LENGTH)
      return `Mật khẩu phải có ít nhất ${ADMIN_CREATE_PASSWORD_MIN_LENGTH} ký tự`
    return ''
  }

  const handleEmailChange = (email: string) => {
    setForm((prev) => ({ ...prev, email }))
    if (email) {
      setEmailError(validateEmail(email))
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async () => {
    if (!form.email) {
      toast.error('Vui lòng điền email')
      return
    }
    const emailErr = validateEmail(form.email)
    const passwordErr = validatePassword(form.password)
    if (emailErr || passwordErr) {
      setEmailError(emailErr)
      setPasswordError(passwordErr)
      return
    }

    setIsSubmitting(true)
    try {
      await createUser(form)
      toast.success('Người dùng đã được tạo thành công')
      onSuccess?.()
      resetAndClose()
    } catch (error) {
      // Câu của máy chủ nói đúng nguyên nhân — email trùng, mật khẩu thiếu, hay thứ khác. Câu đoán mò
      // "Email có thể đã được sử dụng" trước đây che mất chính lỗi đã làm hộp thoại này không bao giờ chạy.
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (

    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={resetAndClose}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tạo mới người dùng</h3>
          <button onClick={resetAndClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Thông tin đăng nhập</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@company.com"
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                    if (passwordError) setPasswordError(validatePassword(e.target.value))
                  }}
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={`Tối thiểu ${ADMIN_CREATE_PASSWORD_MIN_LENGTH} ký tự`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError ? (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Người dùng đăng nhập bằng mật khẩu này. Hãy gửi cho họ qua một kênh riêng và nhắc họ đổi lại.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Thông tin cá nhân</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Nguyễn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Văn A"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên tổ chức</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm((prev) => ({ ...prev, organization: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="Công ty/Viện/Trường..."
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={resetAndClose}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo người dùng'}
          </button>
        </div>
      </div>
    </div>
  )
}
