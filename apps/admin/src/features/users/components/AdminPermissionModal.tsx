import { useState } from "react";
import { X, AlertTriangle, Shield } from "lucide-react";

interface AdminPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function AdminPermissionModal({ isOpen, onClose, userName }: AdminPermissionModalProps) {
  const [accountType, setAccountType] = useState<string>("member");
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const provinces = [
    "TP. Hà Nội",
    "TP. Hồ Chí Minh",
    "TP. Đà Nẵng",
    "TP. Hải Phòng",
    "TP. Cần Thơ",
    "Tỉnh An Giang",
    "Tỉnh Bà Rịa - Vũng Tàu",
    "Tỉnh Bắc Giang",
    "Tỉnh Bắc Kạn",
    "Tỉnh Bạc Liêu",
    "Tỉnh Bắc Ninh",
    "Tỉnh Bến Tre",
    "Tỉnh Bình Định",
    "Tỉnh Bình Dương",
    "Tỉnh Bình Phước",
    "Tỉnh Bình Thuận",
    "Tỉnh Cà Mau",
    "Tỉnh Cao Bằng",
    "Tỉnh Đắk Lắk",
    "Tỉnh Đắk Nông",
    "Tỉnh Điện Biên",
    "Tỉnh Đồng Nai",
    "Tỉnh Đồng Tháp",
    "Tỉnh Gia Lai",
    "Tỉnh Hà Giang",
    "Tỉnh Hà Nam",
    "Tỉnh Hà Tĩnh",
    "Tỉnh Hải Dương",
    "Tỉnh Hậu Giang",
    "Tỉnh Hòa Bình",
    "Tỉnh Hưng Yên",
    "Tỉnh Khánh Hòa",
    "Tỉnh Kiên Giang",
    "Tỉnh Kon Tum",
    "Tỉnh Lai Châu",
    "Tỉnh Lâm Đồng",
    "Tỉnh Lạng Sơn",
    "Tỉnh Lào Cai",
    "Tỉnh Long An",
    "Tỉnh Nam Định",
    "Tỉnh Nghệ An",
    "Tỉnh Ninh Bình",
    "Tỉnh Ninh Thuận",
    "Tỉnh Phú Thọ",
    "Tỉnh Phú Yên",
    "Tỉnh Quảng Bình",
    "Tỉnh Quảng Nam",
    "Tỉnh Quảng Ngãi",
    "Tỉnh Quảng Ninh",
    "Tỉnh Quảng Trị",
    "Tỉnh Sóc Trăng",
    "Tỉnh Sơn La",
    "Tỉnh Tây Ninh",
    "Tỉnh Thái Bình",
    "Tỉnh Thái Nguyên",
    "Tỉnh Thanh Hóa",
    "Tỉnh Thừa Thiên Huế",
    "Tỉnh Tiền Giang",
    "Tỉnh Trà Vinh",
    "Tỉnh Tuyên Quang",
    "Tỉnh Vĩnh Long",
    "Tỉnh Vĩnh Phúc",
    "Tỉnh Yên Bái",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header với Warning Style */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Thiết lập Quyền Quản trị viên
                </h2>
                <p className="text-purple-100 mt-1 text-sm">
                  Phân quyền cho tài khoản <span className="font-semibold text-white">{userName}</span> để quản lý hệ thống tại địa phương
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mx-8 mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">
                Lưu ý quan trọng về phân quyền
              </h3>
              <p className="text-amber-800 text-xs mt-1">
                Việc cấp quyền quản trị sẽ cho phép người dùng này quản lý toàn bộ dữ liệu và hoạt động trong phạm vi được chỉ định. Hãy chắc chắn rằng bạn tin tưởng người này.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Loại tài khoản */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Loại tài khoản <span className="text-red-500">*</span>
            </label>
            <select
              value={accountType}
              onChange={(e) => {
                setAccountType(e.target.value);
                if (e.target.value !== "provincial_admin") {
                  setSelectedProvince("");
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium"
            >
              <option value="member">User thường (Member)</option>
              <option value="provincial_admin">Admin Tỉnh/Sở</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Quyền hạn của user sẽ thay đổi theo loại tài khoản được chọn
            </p>
          </div>

          {/* Phạm vi Quản lý - Chỉ hiện khi chọn Admin Tỉnh/Sở */}
          {accountType === "provincial_admin" && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wide">
                  Cấu hình Admin Địa phương
                </h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Chọn Tỉnh/Thành phố phụ trách <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  required={accountType === "provincial_admin"}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium bg-white"
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                <div className="mt-3 p-3 bg-purple-100 rounded-lg border border-purple-300">
                  <p className="text-xs text-purple-900 font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Tài khoản này sẽ có <span className="font-bold">toàn quyền quản lý</span> các IP và Giao dịch thuộc địa bàn đã chọn.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary box khi đã chọn đầy đủ */}
          {accountType !== "member" && (accountType !== "provincial_admin" || selectedProvince) && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Tóm tắt phân quyền
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tài khoản:</span>
                  <span className="font-semibold text-gray-900">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại quyền:</span>
                  <span className="font-semibold text-purple-600">
                    Admin Tỉnh/Sở
                  </span>
                </div>
                {accountType === "provincial_admin" && selectedProvince && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phạm vi:</span>
                    <span className="font-semibold text-purple-600">{selectedProvince}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={accountType === "provincial_admin" && !selectedProvince}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Lưu & Cấp quyền
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
