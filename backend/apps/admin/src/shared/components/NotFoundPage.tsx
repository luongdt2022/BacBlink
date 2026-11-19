import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Không tìm thấy trang</p>
      <Link 
        to="/" 
        className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
