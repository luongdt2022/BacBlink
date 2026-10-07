export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080";

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (Array.isArray(payload?.message)) return payload.message.join(" ");
  return payload?.message || payload?.title || fallback;
}

/** Lỗi fetch không có HTTP response (API chưa chạy/CORS/network) phải nói rõ cho người dùng, không lộ "Load failed". */
export function userFacingRequestError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "Load failed" || message === "Failed to fetch" || error instanceof TypeError) {
    return "Không thể kết nối máy chủ đăng ký. Vui lòng kiểm tra API NacenTech đang chạy rồi thử lại.";
  }
  return message || fallback;
}
