/** Trạng thái **hiển thị của một dòng**. Không phải bộ lọc — xem {@link UserStatusFilter}. */
export type UserStatus = 'pending' | 'active' | 'locked'

/**
 * Bộ từ vựng của **ô lọc**, đúng ba giá trị máy chủ nhận (`GET /admin/users?status=`). Trước đây ô lọc mượn
 * `UserStatus` và phát ra `'inactive'` — một giá trị không nằm trong kiểu đó — lọt qua nhờ một phép ép kiểu,
 * rồi một hàm ánh xạ phải đoán `'pending'` → `'all'` để bù. Hai từ vựng, hai kiểu (B-38).
 */
export type UserStatusFilter = 'all' | 'active' | 'inactive'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  organization: string
  registeredDate: string
  status: UserStatus
}

export interface IPRecord {
  id: string | number
  name: string
  trl: string
  status: string
  category: string
  date: string
}

export interface LabRecord {
  id: string | number
  name: string
  type: string
  certification: string
  capacity: string
  equipment: string
}

export interface ChallengeRecord {
  id: string | number
  title: string
  category: string
  budget: string
  deadline: string
  status: string
}

export interface UserIntakes {
  ipRecords: IPRecord[]
  labRecords: LabRecord[]
  challengeRecords: ChallengeRecord[]
}
