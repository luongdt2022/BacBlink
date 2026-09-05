import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // Standard Vite plugins

    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Ba client, ba cổng cố định: 5173 cổng người dùng, 5174 bảng quản trị, 5175 trang này. Không đặt thì Vite
  // lấy 5173 — trùng cổng người dùng, và khi cả hai cùng chạy, trang này trôi sang 5174/5176 tuỳ thứ tự khởi
  // động, tức là rơi ra ngoài danh sách origin mà máy chủ cho phép (B-41). `strictPort` để nó thất bại to
  // tiếng thay vì lặng lẽ đổi cổng.
  server: {
    port: 5175,
    strictPort: true,
  },
});
