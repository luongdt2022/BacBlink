import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** Vai trò nền tảng mà máy chủ trả về ở shape v1 (`RoleV1`) là chữ thường. */
const ADMIN_ROLE = "admin";

/**
 * B-18: lớp này trước đây chỉ hỏi "đã đăng nhập chưa". Việc chỉ quản trị viên vào được bảng quản trị được bảo
 * đảm ở **tầng đăng nhập** — nó không cấp token cho vai trò khác — chứ không ở tầng định tuyến. Nghĩa là một
 * token `USER` hợp lệ nhét thủ công vào cookie `admin_token` sẽ dựng được toàn bộ giao diện quản trị; chỉ từng
 * lời gọi API mới bị chặn riêng. Không lộ dữ liệu, nhưng phòng thủ chỉ có một lớp.
 *
 * Nay kiểm luôn vai trò trong tài khoản đã tải. `AuthContext` lấy tài khoản từ `/admin/auth/me`, mà endpoint
 * đó **có** gọi `RequireAdmin()`, nên trường vai trò ở đây là thứ máy chủ đã công nhận, không phải thứ trình
 * duyệt tự khai.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role?.toLowerCase() !== ADMIN_ROLE) {
    // Cùng đích đến với chưa đăng nhập, nhưng lý do khác — trang đăng nhập nói ra sự khác biệt đó, vì một
    // người vào nhầm cổng cần biết mình vào nhầm cổng chứ không phải tưởng mình gõ sai mật khẩu.
    return <Navigate to="/login" state={{ from: location, reason: "not-admin" }} replace />;
  }

  return <>{children}</>;
}
