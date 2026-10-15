// Khi chạy trên browser (CSR), nếu không có env base url rõ ràng hoặc truy cập qua LAN IP,
// dùng chuỗi rỗng "" để browser gọi relative URL (/api/v1/...) qua Next.js rewrite proxy,
// giúp các máy trong mạng LAN (192.168.x.x) gọi backend trơn tru không bị kẹt localhost hay CORS.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== "undefined" ? "" : "http://localhost:5080");

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
