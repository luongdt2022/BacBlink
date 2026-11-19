// Khi chạy trên browser (CSR), nếu không có env base url rõ ràng hoặc truy cập qua LAN IP,
// dùng chuỗi rỗng "" để browser gọi relative URL (/api/v1/...) qua Next.js rewrite proxy,
// giúp các máy trong mạng LAN (192.168.x.x) gọi backend trơn tru không bị kẹt localhost hay CORS.
const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
export const API_BASE =
  envBase && envBase.length > 0
    ? envBase
    : typeof window !== "undefined"
      ? ""
      : "http://localhost:5080";

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (Array.isArray(payload?.message)) return payload.message.join(" ");
  if (payload?.message) return payload.message;
  if (payload?.title) return payload.title;

  if (response.status === 401) {
    return "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (response.status === 403) {
    return "Truy cập bị từ chối (403 Forbidden). Tài khoản không có thẩm quyền quản trị hoặc phiên đã hết hạn.";
  }
  return fallback;
}

/** Lỗi fetch không có HTTP response (API chưa chạy/CORS/network) phải nói rõ cho người dùng, không lộ "Load failed". */
export function userFacingRequestError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "Load failed" || message === "Failed to fetch" || error instanceof TypeError) {
    return "Không thể kết nối máy chủ hệ thống. Vui lòng kiểm tra dịch vụ API BACLINK đang hoạt động rồi thử lại.";
  }
  return message || fallback;
}
