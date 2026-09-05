import { apiFetch, API_BASE_PATH } from "./client";
import { AUTH_API_CODE, AUTH_API_MESSAGE } from "@/features/auth/constants/authApi";

const AUTH_PREFIX = `${API_BASE_PATH}/auth`;

type ApiError = Error & { code?: string; status?: number };

type ApiPayload = {
  code?: string;
  message?: string | string[];
  error?: string;
  data?: unknown;
};

function getVietnameseMessageByCode(code?: string): string | undefined {
  if (!code) return undefined;
  return AUTH_API_MESSAGE[code as keyof typeof AUTH_API_MESSAGE];
}

function normalizeMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) return fallback;
  const raw = (payload as ApiPayload).message;
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v)).join(", ");
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw;
  }
  return fallback;
}

function normalizeCode(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) return fallback;
  const raw = (payload as ApiPayload).code;
  if (typeof raw === "string" && raw.trim()) {
    return raw;
  }
  return fallback;
}

function buildApiError(
  payload: unknown,
  status: number,
  fallbackCode: string,
  fallbackMessage: string,
): ApiError {
  const resolvedCode = normalizeCode(payload, fallbackCode);
  const localized = getVietnameseMessageByCode(resolvedCode);
  const err = new Error(
    localized ?? normalizeMessage(payload, fallbackMessage),
  ) as ApiError;
  err.code = resolvedCode;
  err.status = status;
  return err;
}

function resolveSuccessMessage(
  payload: unknown,
  code: string | undefined,
  fallbackMessage: string,
): string {
  const localized = getVietnameseMessageByCode(code);
  if (localized) return localized;
  return normalizeMessage(payload, fallbackMessage);
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  data?: { token?: string; accessToken?: string };
}

export interface MeUser {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export async function login(
  body: LoginRequestBody,
): Promise<{ token: string }> {
  const { data, status } = await apiFetch<LoginResponse>(
    `${AUTH_PREFIX}/login`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  if (status === 401) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.INVALID_CREDENTIALS,
      AUTH_API_MESSAGE.INVALID_CREDENTIALS,
    );
  }
  if (status !== 200) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.LOGIN_FAILED,
      AUTH_API_MESSAGE.LOGIN_FAILED,
    );
  }
  const token =
    data?.token ??
    data?.accessToken ??
    (data as { data?: { token?: string; accessToken?: string } })?.data
      ?.token ??
    (data as { data?: { token?: string; accessToken?: string } })?.data
      ?.accessToken;
  if (!token || typeof token !== "string") {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.LOGIN_FAILED,
      AUTH_API_MESSAGE.LOGIN_FAILED,
    );
  }
  return { token };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  const { data: result, status } = await apiFetch<{ message?: string }>(
    `${AUTH_PREFIX}/change-password`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  if (status === 401) {
    throw buildApiError(
      result,
      status,
      AUTH_API_CODE.CURRENT_PASSWORD_INCORRECT,
      AUTH_API_MESSAGE.CURRENT_PASSWORD_INCORRECT,
    );
  }
  if (status === 400) {
    throw buildApiError(
      result,
      status,
      AUTH_API_CODE.VALIDATION_ERROR,
      AUTH_API_MESSAGE.VALIDATION_ERROR,
    );
  }
  if (status !== 200 && status !== 201) {
    throw buildApiError(
      result,
      status,
      AUTH_API_CODE.CHANGE_PASSWORD_FAILED,
      AUTH_API_MESSAGE.CHANGE_PASSWORD_FAILED,
    );
  }
  const resolvedCode =
    typeof result === 'object' && result !== null && 'code' in result
      ? (result as { code?: string }).code
      : AUTH_API_CODE.PASSWORD_CHANGED_SUCCESS;
  const message = resolveSuccessMessage(
    result,
    resolvedCode,
    AUTH_API_MESSAGE.CHANGE_PASSWORD_SUCCESS,
  );
  return { message };
}

export async function getMe(): Promise<MeUser> {
  const { data, status } = await apiFetch<MeUser | { data?: MeUser }>(
    `${AUTH_PREFIX}/me`,
  );
  if (status === 401) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.UNAUTHORIZED,
      AUTH_API_MESSAGE.UNAUTHORIZED,
    );
  }
  if (status !== 200) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.FETCH_ME_FAILED,
      AUTH_API_MESSAGE.FETCH_ME_FAILED,
    );
  }
  const user = (data as { data?: MeUser })?.data ?? (data as MeUser);
  return user ?? {};
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  organization?: string;
}

export async function register(
  body: RegisterRequestBody,
): Promise<{ code: string; message: string }> {
  const { data, status } = await apiFetch<{ code?: string; message?: string }>(
    `${AUTH_PREFIX}/register`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  if (status === 409) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.EMAIL_ALREADY_IN_USE,
      AUTH_API_MESSAGE.EMAIL_ALREADY_IN_USE,
    );
  }
  if (status === 400) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.VALIDATION_ERROR,
      AUTH_API_MESSAGE.VALIDATION_ERROR,
    );
  }
  if (status === 429) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.REGISTER_RATE_LIMITED,
      AUTH_API_MESSAGE.REGISTER_RATE_LIMITED,
    );
  }
  if (status !== 201) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.REGISTRATION_FAILED,
      AUTH_API_MESSAGE.REGISTRATION_FAILED,
    );
  }
  return {
    code: (data as { code: string }).code ?? AUTH_API_CODE.REGISTRATION_SUCCESS,
    message: resolveSuccessMessage(
      data,
      (data as { code?: string })?.code ??
        AUTH_API_CODE.REGISTER_SUCCESS_PENDING_ACTIVATION,
      AUTH_API_MESSAGE.REGISTRATION_SUCCESS,
    ),
  };
}

export async function verifyEmail(token: string): Promise<{
  code: string;
  message: string;
}> {
  const { data, status } = await apiFetch<{ code?: string; message?: string }>(
    `${AUTH_PREFIX}/activate`,
    {
      method: 'POST',
      body: JSON.stringify({ token }),
    },
  );
  if (status !== 200) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.ACTIVATION_TOKEN_INVALID,
      AUTH_API_MESSAGE.ACTIVATION_TOKEN_INVALID,
    );
  }
  return {
    code:
      (data as { code: string }).code ?? AUTH_API_CODE.ACCOUNT_ACTIVATED_SUCCESS,
    message: resolveSuccessMessage(
      data,
      (data as { code?: string })?.code ??
        AUTH_API_CODE.ACCOUNT_ACTIVATED_SUCCESS,
      AUTH_API_MESSAGE.ACTIVATION_VERIFY_SUCCESS,
    ),
  };
}

export async function resendActivation(
  email: string,
): Promise<{ code: string; message: string }> {
  const { data, status } = await apiFetch<{ code?: string; message?: string }>(
    `${AUTH_PREFIX}/resend-activation`,
    {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    },
  );

  if (status === 404) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.ACCOUNT_NOT_FOUND,
      AUTH_API_MESSAGE.ACCOUNT_NOT_FOUND,
    );
  }

  if (status === 429) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.RESEND_RATE_LIMITED,
      AUTH_API_MESSAGE.RESEND_RATE_LIMITED,
    );
  }

  if (status !== 200) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.RESEND_ACTIVATION_FAILED,
      AUTH_API_MESSAGE.RESEND_ACTIVATION_FAILED,
    );
  }

  return {
    code:
      (data as { code?: string })?.code ?? AUTH_API_CODE.ACTIVATION_EMAIL_RESENT,
    message: resolveSuccessMessage(
      data,
      (data as { code?: string })?.code ??
        AUTH_API_CODE.ACTIVATION_EMAIL_RESENT,
      AUTH_API_MESSAGE.ACTIVATION_EMAIL_RESENT,
    ),
  };
}

export async function forgotPassword(
  email: string,
): Promise<{ code: string; message: string }> {
  const { data, status } = await apiFetch<{ code?: string; message?: string }>(
    `${AUTH_PREFIX}/forgot-password`,
    {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    },
  );

  if (status === 429) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.FORGOT_PASSWORD_RATE_LIMITED,
      AUTH_API_MESSAGE.FORGOT_PASSWORD_RATE_LIMITED,
    );
  }

  if (status !== 200) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.FORGOT_PASSWORD_FAILED,
      AUTH_API_MESSAGE.FORGOT_PASSWORD_FAILED,
    );
  }

  return {
    code:
      (data as { code?: string })?.code ??
      AUTH_API_CODE.FORGOT_PASSWORD_SUCCESS,
    message:
      AUTH_API_MESSAGE.FORGOT_PASSWORD_SUCCESS,
  };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ code: string; message: string }> {
  const { data, status } = await apiFetch<{ code?: string; message?: string }>(
    `${AUTH_PREFIX}/reset-password`,
    {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    },
  );

  if (status === 400) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.RESET_PASSWORD_TOKEN_INVALID,
      AUTH_API_MESSAGE.RESET_PASSWORD_FAILED,
    );
  }

  if (status !== 200) {
    throw buildApiError(
      data,
      status,
      AUTH_API_CODE.RESET_PASSWORD_TOKEN_INVALID,
      AUTH_API_MESSAGE.RESET_PASSWORD_FAILED,
    );
  }

  return {
    code:
      (data as { code?: string })?.code ??
      AUTH_API_CODE.RESET_PASSWORD_SUCCESS,
    message:
      AUTH_API_MESSAGE.RESET_PASSWORD_SUCCESS,
  };
}
