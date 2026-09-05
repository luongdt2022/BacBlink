import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { deleteCookie, getCookie } from '@/lib/cookies'
import { AUTH_UNAUTHORIZED_EVENT } from '@/lib/auth/events'
import { COOKIE_TOKEN_NAME } from '@/lib/auth/constants'
import { normalizeError } from '@/lib/api/problem'
import { API_GONE_EVENT, API_SUNSET_EVENT, readSunset } from '@/lib/api/sunset'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Khoá chống lặp của **một lần bấm nút** (ADR-0004). Bắt buộc với mọi lệnh ghi trên `/api/v2` — thiếu nó
     * máy chủ trả 428. Lấy từ `beginOperation()` và dùng lại cho mọi lần thử lại của cùng thao tác.
     */
    idempotencyKey?: string
    /**
     * Số phiên bản đọc được từ lần tải bản ghi, để ghi có điều kiện (§7.5).
     *
     * CẢNH BÁO đã đo ngày 2026-09-04: **máy chủ hiện không đọc header `If-Match` ở bất kỳ đâu**, và không chỗ
     * nào phát `ETag`. Cơ chế thật chạy qua trường `expectedVersion` trong **thân request**. Header vẫn được
     * gắn ở đây để đúng hợp đồng đã đặc tả và để ngày máy chủ cài đặt thì client đã sẵn sàng — nhưng đừng dựa
     * vào nó để bảo vệ dữ liệu chừng nào B-40 còn mở.
     */
    expectedVersion?: number
  }
}

function trimSlash(value: string): string {
  return value.replace(/^\/+|\/+$/g, '')
}

/**
 * `version` bỏ trống nghĩa là lấy `VITE_API_VERSION` (mặc định của repo, `v1`). Truyền `'v2'` để trỏ vào bề
 * mặt mới — hai bề mặt cùng một máy chủ nhưng khác hình dạng lỗi và khác luật phân trang, nên chúng là hai
 * client riêng chứ không phải một client với đường dẫn khác nhau.
 */
function buildApiBaseUrl(version?: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const prefix = import.meta.env.VITE_API_PREFIX?.trim()
  const configuredVersion = version ?? import.meta.env.VITE_API_VERSION?.trim()

  if (!baseUrl) {
    return `/api/${trimSlash(version ?? 'v1')}`
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/g, '')

  if (prefix && configuredVersion) {
    return `${normalizedBaseUrl}/${trimSlash(prefix)}/${trimSlash(configuredVersion)}`
  }

  if (prefix) {
    return `${normalizedBaseUrl}/${trimSlash(prefix)}`
  }

  return normalizedBaseUrl
}

const API_BASE_URL = buildApiBaseUrl()

function getToken(): string | null {
  return getCookie(COOKIE_TOKEN_NAME)
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete'])

function isWrite(config: InternalAxiosRequestConfig): boolean {
  return WRITE_METHODS.has((config.method ?? 'get').toLowerCase())
}

/**
 * Ba cơ chế của v2 nằm **ở đây và chỉ ở đây** (ADR-0004 luật 4). Màn hình chỉ cung cấp dữ liệu; nếu một màn
 * hình phải tự nhớ gắn header thì sẽ có một màn hình quên.
 */
function attachRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      ;(config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`
    }

    const headers = config.headers as AxiosRequestHeaders | undefined
    if (headers && isWrite(config)) {
      if (config.idempotencyKey) headers['Idempotency-Key'] = config.idempotencyKey
      // Gắn theo đúng hợp đồng đã đặc tả. Máy chủ hiện **bỏ qua** header này (B-40); cơ chế thật là trường
      // `expectedVersion` trong thân request, và chỗ gọi phải tự đặt nó vào thân.
      if (typeof config.expectedVersion === 'number') headers['If-Match'] = `"${config.expectedVersion}"`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
  )
}

/**
 * Response interceptor - handle errors
 */
function announceSunset(headers: unknown): void {
  const info = readSunset(headers as Record<string, unknown>)
  if (!info?.isApproaching || typeof document === 'undefined') return
  document.dispatchEvent(
    new CustomEvent(API_SUNSET_EVENT, { bubbles: true, detail: info })
  )
}

function attachResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
  (response: AxiosResponse) => {
    announceSunset(response.headers)
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
      deleteCookie(COOKIE_TOKEN_NAME)
      document.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT, { bubbles: true }))
    }

    // 410: `/api/v1` đã dừng phục vụ. Không có nhánh này thì nó hiện ra như một lỗi lạ không giải thích được,
    // và người dùng sẽ thử lại mãi một thứ không bao giờ chạy nữa.
    if (status === 410 && typeof document !== 'undefined') {
      document.dispatchEvent(
        new CustomEvent(API_GONE_EVENT, { bubbles: true, detail: normalizeError(error) })
      )
    }

    if (error.response) announceSunset(error.response.headers)

    return Promise.reject(error)
  }
  )
}

attachRequestInterceptor(apiClient)
attachResponseInterceptor(apiClient)

/**
 * Client cho bề mặt `/api/v2`.
 *
 * Là một instance **riêng**, không phải `apiClient` với đường dẫn khác: hai bề mặt khác nhau ở hình dạng lỗi
 * (`message` so với `detail`), ở phân trang (`success: true` so với không có), và một trong hai sẽ bị xoá
 * nguyên khối tại sunset 31/03/2027. Trộn chúng vào một client là cách hành vi v1 rò sang v2 — cùng loại lỗi
 * mà [ADR-0009](../../../../nacentech/docs/adr/0009-noi-dat-endpoint-v2.md) chặn ở phía máy chủ.
 *
 * Bộ chặn thì dùng chung, vì xác thực, khoá chống lặp, 401, 410 và `Sunset` là **cùng một luật** trên cả hai.
 */
export const apiClientV2 = axios.create({
  baseURL: buildApiBaseUrl('v2'),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

attachRequestInterceptor(apiClientV2)
attachResponseInterceptor(apiClientV2)

export { getErrorMessage, normalizeError } from '@/lib/api/problem'
export { beginOperation, createOperationKey } from '@/lib/api/idempotency'
export type { Operation } from '@/lib/api/idempotency'

export default apiClient
