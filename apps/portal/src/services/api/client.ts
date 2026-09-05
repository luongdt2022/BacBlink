import axios, { type AxiosRequestConfig } from 'axios';
import type { AxiosResponse } from 'axios';
import { getAccessToken, removeAccessToken } from '@/shared/utils/authCookie';
import { ApiError } from './ApiError';
import { API_GONE_EVENT, API_SUNSET_EVENT, readSunset } from './sunset';

/** Phát khi máy chủ trả 401 — phiên hết hạn hoặc chưa đăng nhập. Tầng phiên nghe và đưa về trang đăng nhập. */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Khoá chống lặp của **một lần bấm nút** (ADR-0004). Bắt buộc với mọi lệnh ghi trên `/api/v2`. */
    idempotencyKey?: string;
    /**
     * Số phiên bản đọc được từ lần tải bản ghi (§7.5). Máy chủ hiện **không đọc** header `If-Match`; cơ chế
     * thật chạy qua trường `expectedVersion` trong thân request — xem B-40.
     */
    expectedVersion?: number;
  }
}

const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? 'api';
const API_VERSION = import.meta.env.VITE_API_VERSION ?? 'v1';

export const API_BASE_PATH = `/${API_PREFIX}/${API_VERSION}`;

/**
 * B-14: giá trị mặc định cũ là `http://localhost:3001` — cổng của NacenTwin/NestJS, hệ đã bị thay thế. Nó nằm
 * trong **mã**, không chỉ trong `.env.example`, nên thiếu biến môi trường thì ứng dụng gọi sang một cổng chết
 * và hỏng im lặng.
 *
 * Rơi về chuỗi rỗng nghĩa là dùng chính origin đang phục vụ trang — tức là cần một proxy đứng trước, **giống
 * hệt hành vi mặc định của bảng quản trị**. Hai client cùng một sản phẩm không nên hỏng theo hai kiểu khác nhau
 * khi thiếu cùng một biến.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
});

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/**
 * Ba cơ chế của v2 nằm ở đây và chỉ ở đây (ADR-0004 luật 4). Màn hình chỉ cung cấp dữ liệu; nếu một màn hình
 * phải tự nhớ gắn header thì sẽ có một màn hình quên.
 */
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (WRITE_METHODS.has((config.method ?? 'get').toLowerCase())) {
    if (config.idempotencyKey) config.headers['Idempotency-Key'] = config.idempotencyKey;
    // Gắn theo đúng hợp đồng đã đặc tả. Máy chủ hiện **bỏ qua** header này (B-40); cơ chế thật là trường
    // `expectedVersion` trong thân request.
    if (typeof config.expectedVersion === 'number') {
      config.headers['If-Match'] = `"${config.expectedVersion}"`;
    }
  }

  return config;
});

function announceSunset(headers: unknown): void {
  const info = readSunset(headers as Record<string, unknown>);
  if (!info?.isApproaching || typeof document === 'undefined') return;
  document.dispatchEvent(
    new CustomEvent(API_SUNSET_EVENT, { bubbles: true, detail: info }),
  );
}

apiClient.interceptors.response.use(
  (response) => {
    announceSunset(response.headers);
    return response;
  },
  (error) => {
    const apiError = ApiError.from(error);

    if (apiError.isUnauthorized && typeof document !== 'undefined') {
      // Phiên hết hạn: xoá token rồi báo cho tầng phiên. Không tự điều hướng ở đây — bộ chặn không biết gì về
      // định tuyến, và một lần điều hướng phát từ đây sẽ chạy cả trong những lời gọi nền mà người dùng không thấy.
      removeAccessToken();
      document.dispatchEvent(
        new CustomEvent(AUTH_UNAUTHORIZED_EVENT, { bubbles: true, detail: apiError }),
      );
    }

    if (apiError.isGone && typeof document !== 'undefined') {
      document.dispatchEvent(
        new CustomEvent(API_GONE_EVENT, { bubbles: true, detail: apiError }),
      );
    }

    if (error?.response) announceSunset(error.response.headers);

    return Promise.reject(apiError);
  },
);

type ApiFetchConfig = Omit<AxiosRequestConfig, 'body'> & { body?: string };

export async function apiFetch<T = unknown>(
  path: string,
  config?: ApiFetchConfig,
): Promise<{ data: T; status: number }> {
  const { body, ...rest } = config ?? {};
  let res: AxiosResponse<T>;
  try {
    res = await apiClient.request<T>({
      url: path,
      data: body !== undefined ? JSON.parse(body) : rest.data,
      ...rest,
    });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { data: err.response.data as T, status: err.response.status };
    }
    throw err;
  }
  return { data: res.data, status: res.status };
}
