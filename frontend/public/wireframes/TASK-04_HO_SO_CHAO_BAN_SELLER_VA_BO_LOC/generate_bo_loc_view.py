import openpyxl
import json
import os

def generate_html():
    excel_path = 'Specification/02_BASIC_DESIGN/DỮ_LIỆU_GỐC_MASTER/Nacentwin_20260924_bo_loc_da_sua.xlsx'
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb['Bo_loc_Cban']

    records = []
    industries_set = {}
    
    for r in range(5, 1484):
        ma_nganh = str(ws.cell(row=r, column=1).value or '').strip()
        ten_nganh = str(ws.cell(row=r, column=2).value or '').strip()
        ma_truong = str(ws.cell(row=r, column=3).value or '').strip()
        lop = str(ws.cell(row=r, column=4).value or '').strip()
        ten_truong = str(ws.cell(row=r, column=5).value or '').strip()
        dang_nhap = str(ws.cell(row=r, column=6).value or '').strip()
        san_pham = str(ws.cell(row=r, column=7).value or '').strip()
        thiet_bi = str(ws.cell(row=r, column=8).value or '').strip()
        giai_phap = str(ws.cell(row=r, column=9).value or '').strip()
        hien_thi = str(ws.cell(row=r, column=10).value or '').strip()
        bat_buoc = str(ws.cell(row=r, column=11).value or '').strip()
        mo_ta = str(ws.cell(row=r, column=12).value or '').strip()
        trang_thai = str(ws.cell(row=r, column=13).value or '').strip()
        nguon = str(ws.cell(row=r, column=14).value or '').strip()
        chi_cg = str(ws.cell(row=r, column=15).value or 'Không').strip()
        thu_tu = ws.cell(row=r, column=16).value or 0

        # Classification logic
        bb_str = bat_buoc.strip()
        if bb_str.startswith('Không bắt buộc') or bb_str.startswith('Được bổ sung') or 'không coi là trường bắt buộc' in bb_str:
            req_type = 'OPTIONAL'
            req_label = 'Bổ sung sau'
            badge_color = 'bg-emerald-50 text-emerald-700 border-emerald-200'
        elif bb_str.startswith('Bắt buộc ban đầu') or bb_str.startswith('Đề xuất bắt buộc'):
            req_type = 'MANDATORY'
            req_label = 'Bắt buộc ban đầu'
            badge_color = 'bg-rose-50 text-rose-700 border-rose-200'
        elif 'Bắt buộc' in bb_str:
            req_type = 'CONDITIONAL'
            req_label = 'Bắt buộc có điều kiện'
            badge_color = 'bg-amber-50 text-amber-700 border-amber-200'
        else:
            req_type = 'OPTIONAL'
            req_label = 'Bổ sung sau'
            badge_color = 'bg-slate-50 text-slate-700 border-slate-200'

        # Layer classification
        if '1. Chung' in lop:
            layer_code = 'L1'
            layer_name = 'Lớp 1: Chung'
            layer_badge = 'bg-blue-50 text-blue-700 border-blue-200'
        elif '2. Theo loại' in lop:
            layer_code = 'L2'
            layer_name = 'Lớp 2: Theo loại'
            layer_badge = 'bg-purple-50 text-purple-700 border-purple-200'
        elif '3. Theo ngành' in lop:
            layer_code = 'L3'
            layer_name = 'Lớp 3: Theo ngành'
            layer_badge = 'bg-indigo-50 text-indigo-700 border-indigo-200'
        else:
            layer_code = 'OTHER'
            layer_name = lop
            layer_badge = 'bg-gray-50 text-gray-700 border-gray-200'

        records.append({
            'id': r - 4,
            'ma_nganh': ma_nganh,
            'ten_nganh': ten_nganh,
            'ma_truong': ma_truong,
            'lop': lop,
            'layer_code': layer_code,
            'layer_name': layer_name,
            'layer_badge': layer_badge,
            'ten_truong': ten_truong,
            'dang_nhap': dang_nhap,
            'san_pham': san_pham,
            'thiet_bi': thiet_bi,
            'giai_phap': giai_phap,
            'hien_thi': hien_thi,
            'bat_buoc': bat_buoc,
            'req_type': req_type,
            'req_label': req_label,
            'badge_color': badge_color,
            'mo_ta': mo_ta,
            'trang_thai': trang_thai,
            'nguon': nguon,
            'chi_cg': chi_cg,
            'thu_tu': thu_tu
        })

        if ten_nganh:
            industries_set[ten_nganh] = industries_set.get(ten_nganh, 0) + 1

    # Sort industries
    industries_list = sorted([{'name': k, 'count': v} for k, v in industries_set.items()], key=lambda x: x['name'])

    json_data = json.dumps(records, ensure_ascii=False)
    json_industries = json.dumps(industries_list, ensure_ascii=False)

    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Review Bộ Lọc Hồ Sơ Chào Bán (Seller) — Basic Design Task 04</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }}
    /* Custom scrollbars */
    ::-webkit-scrollbar {{
      width: 8px;
      height: 8px;
    }}
    ::-webkit-scrollbar-track {{
      background: #f1f5f9;
    }}
    ::-webkit-scrollbar-thumb {{
      background: #cbd5e1;
      border-radius: 4px;
    }}
    ::-webkit-scrollbar-thumb:hover {{
      background: #94a3b8;
    }}
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- TOP HEADER -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold text-slate-900 leading-tight">Review Bộ Lọc Hồ Sơ Chào Bán (Seller)</h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">TASK-04</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">1,479 Quy tắc chuẩn</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Dự án Nacentwin | Nguồn SSOT: <code class="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Nacentwin_20260924_bo_loc_da_sua.xlsx</code></p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5">
        <button onclick="resetFilters()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm">
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Đặt lại bộ lọc
        </button>

        <button onclick="exportCSV()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Xuất CSV kết quả
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

    <!-- METRICS CARDS -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Total Filtered -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số trường</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-total" class="text-2xl font-extrabold text-slate-900 font-mono">0</span>
          <span class="text-[10px] text-slate-400">/ 1,479</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div id="bar-total" class="bg-indigo-600 h-full rounded-full" style="width: 100%"></div>
        </div>
      </div>

      <!-- Mandatory Initial -->
      <div class="bg-white p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider">Bắt buộc ban đầu</span>
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        </div>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-mandatory" class="text-2xl font-extrabold text-rose-700 font-mono">0</span>
          <span id="percent-mandatory" class="text-[10px] font-medium text-rose-600">0%</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">Cần có ngay khi đăng</p>
      </div>

      <!-- Conditional -->
      <div class="bg-white p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Bắt buộc theo Đ/K</span>
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        </div>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-conditional" class="text-2xl font-extrabold text-amber-700 font-mono">0</span>
          <span id="percent-conditional" class="text-[10px] font-medium text-amber-600">0%</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">TRL / Giá cụ thể / File</p>
      </div>

      <!-- Optional / Later -->
      <div class="bg-white p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Bổ sung sau</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-optional" class="text-2xl font-extrabold text-emerald-700 font-mono">0</span>
          <span id="percent-optional" class="text-[10px] font-medium text-emerald-600">0%</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">Hoàn thiện dần sau</p>
      </div>

      <!-- Layer 1 Breakdown -->
      <div class="bg-white p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-blue-700 uppercase tracking-wider">Lớp 1: Chung</span>
          <span class="text-[10px] font-mono text-blue-600 bg-blue-100 px-1 rounded">L1</span>
        </div>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-l1" class="text-2xl font-extrabold text-blue-700 font-mono">0</span>
          <span class="text-[10px] text-slate-500">Dùng chung</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">45 trường chuẩn hóa</p>
      </div>

      <!-- Layer 3 Breakdown -->
      <div class="bg-white p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/20 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Lớp 3: Ngành</span>
          <span class="text-[10px] font-mono text-indigo-600 bg-indigo-100 px-1 rounded">L3</span>
        </div>
        <div class="mt-2 flex items-baseline justify-between">
          <span id="metric-l3" class="text-2xl font-extrabold text-indigo-700 font-mono">0</span>
          <span class="text-[10px] text-slate-500">Đặc thù</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">Thông số chuyên ngành</p>
      </div>
    </div>

    <!-- FILTER CONTROL PANEL -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Bảng Điều Khiển Bộ Lọc Động (Interactive Filters)</h2>
        </div>
        <span class="text-xs text-slate-500 italic">Mô phỏng logic 3 ô vàng cột P:R trong sheet C.bán SP</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 1. Ngành nghề -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            1. Ngành nghề công nghiệp (18 nhóm)
          </label>
          <select id="filter-industry" onchange="applyFilters()" class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 font-medium transition">
            <option value="ALL">-- Tất cả 18 ngành nghề (Toàn bộ ma trận) --</option>
          </select>
        </div>

        <!-- 2. Loại chào bán -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            2. Loại chào bán
          </label>
          <select id="filter-type" onchange="applyFilters()" class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 font-medium transition">
            <option value="ALL">-- Tất cả loại chào bán --</option>
            <option value="Sản phẩm">Sản phẩm (Vật lý / Thương mại)</option>
            <option value="Thiết bị" selected>Thiết bị (Máy móc / Dây chuyền)</option>
            <option value="Giải pháp công nghệ">Giải pháp công nghệ (Phần mềm / Quy trình)</option>
          </select>
        </div>

        <!-- 3. Có chuyển giao công nghệ -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            3. Có chuyển giao công nghệ?
          </label>
          <select id="filter-transfer" onchange="applyFilters()" class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 font-medium transition">
            <option value="Tất cả">-- Tất cả (Cả chuyển giao & không) --</option>
            <option value="Không" selected>Không (Chỉ cung cấp/bán thương mại)</option>
            <option value="Có">Có (Bắt buộc khai báo mức TRL 1-9)</option>
          </select>
        </div>
      </div>

      <!-- SECONDARY FILTERS -->
      <div class="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        <!-- Filter Requirement -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Mức độ bắt buộc</label>
          <select id="filter-req" onchange="applyFilters()" class="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 text-slate-700">
            <option value="ALL">Tất cả mức độ</option>
            <option value="MANDATORY">🔴 Bắt buộc ban đầu</option>
            <option value="CONDITIONAL">🟡 Bắt buộc có điều kiện</option>
            <option value="OPTIONAL">🟢 Bổ sung sau</option>
          </select>
        </div>

        <!-- Filter Layer -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Phân lớp dữ liệu</label>
          <select id="filter-layer" onchange="applyFilters()" class="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 text-slate-700">
            <option value="ALL">Tất cả các lớp</option>
            <option value="L1">Lớp 1: Trường chung</option>
            <option value="L2">Lớp 2: Theo loại đối tượng</option>
            <option value="L3">Lớp 3: Đặc thù chuyên ngành</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="sm:col-span-2">
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tìm kiếm nhanh</label>
          <div class="relative">
            <input type="text" id="filter-search" oninput="applyFilters()" placeholder="Tìm theo mã trường (CHUNG-*, KT-*), tên trường, dạng nhập..." class="w-full bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW TABS -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
      <div class="flex items-center gap-2">
        <button id="tab-btn-table" onclick="switchView('table')" class="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition">
          Bảng Chi Tiết Bộ Lọc (Data Table)
        </button>
        <button id="tab-btn-matrix" onclick="switchView('matrix')" class="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition">
          Ma Trận So Sánh 18 Ngành (Industry Matrix)
        </button>
        <button id="tab-btn-assessment" onclick="switchView('assessment')" class="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition">
          Đánh Giá Mức Độ Đáp Ứng (Gap Assessment)
        </button>
      </div>

      <div class="text-xs text-slate-500">
        Hiển thị: <span id="count-showing" class="font-bold text-slate-900 font-mono">0</span> trường
      </div>
    </div>

    <!-- VIEW 1: DATA TABLE -->
    <div id="view-table" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto max-h-[700px]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200 shadow-sm">
            <tr>
              <th scope="col" class="py-3 px-3 w-12 text-center">STT</th>
              <th scope="col" class="py-3 px-3 w-28">Mã trường</th>
              <th scope="col" class="py-3 px-4 w-52">Tên trường</th>
              <th scope="col" class="py-3 px-3 w-32">Phân lớp</th>
              <th scope="col" class="py-3 px-3 w-28">Dạng nhập</th>
              <th scope="col" class="py-3 px-3 w-40 text-center">Tính chất bắt buộc</th>
              <th scope="col" class="py-3 px-4 w-60">Điều kiện hiển thị</th>
              <th scope="col" class="py-3 px-4 w-64">Điều kiện bắt buộc</th>
              <th scope="col" class="py-3 px-4">Mô tả / Ghi chú nghiệp vụ</th>
            </tr>
          </thead>
          <tbody id="table-body" class="divide-y divide-slate-100 text-slate-700">
            <!-- Dynamic rows will be inserted here -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 2: INDUSTRY MATRIX -->
    <div id="view-matrix" class="hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div>
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Bảng Ma Trận Phân Bổ Quy Tắc Theo 18 Nhóm Ngành</h3>
        <p class="text-xs text-slate-500 mt-1">So sánh số lượng trường cơ bản (Lớp 1), trường theo loại (Lớp 2) và thông số kỹ thuật riêng (Lớp 3) trên từng ngành.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse border border-slate-200">
          <thead class="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-3 border-r border-slate-200 w-12 text-center">STT</th>
              <th class="p-3 border-r border-slate-200">Mã ngành</th>
              <th class="p-3 border-r border-slate-200">Tên ngành công nghiệp</th>
              <th class="p-3 border-r border-slate-200 text-center">Tổng Rules</th>
              <th class="p-3 border-r border-slate-200 text-center text-rose-700">Bắt buộc ban đầu</th>
              <th class="p-3 border-r border-slate-200 text-center text-amber-700">Bắt buộc có Đ/K</th>
              <th class="p-3 border-r border-slate-200 text-center text-emerald-700">Bổ sung sau</th>
              <th class="p-3 border-r border-slate-200 text-center text-blue-700">Lớp 1 (Chung)</th>
              <th class="p-3 border-r border-slate-200 text-center text-purple-700">Lớp 2 (Loại)</th>
              <th class="p-3 text-center text-indigo-700">Lớp 3 (Ngành)</th>
            </tr>
          </thead>
          <tbody id="matrix-body" class="divide-y divide-slate-100">
            <!-- Dynamic matrix rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW 3: GAP ASSESSMENT -->
    <div id="view-assessment" class="hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h3 class="text-base font-bold text-slate-900">Báo Cáo Đánh Giá Mức Độ Đáp Ứng Của Thiết Kế Cơ Sở (Gap Analysis)</h3>
        <p class="text-xs text-slate-500 mt-1">Đối chiếu cấu trúc dữ liệu Task 04 với tiêu chuẩn đăng bán công nghệ sàn Nacentwin.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Checklist 1 -->
        <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
          <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            1. Khung Trường Cơ Bản (Lớp 1)
          </div>
          <p class="text-xs text-slate-600">Đã chuẩn hóa 45 trường dùng chung bao phủ đầy đủ: Tên, Phân loại, Mô tả, Giá, Bên cung cấp, Bảo mật liên hệ và Tài liệu.</p>
          <div class="text-xs font-semibold text-emerald-700 bg-emerald-100/60 p-2 rounded-lg">
            Trạng thái: 🟢 Đã đáp ứng 100%
          </div>
        </div>

        <!-- Checklist 2 -->
        <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
          <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            2. Logic Chuyển Giao & TRL
          </div>
          <p class="text-xs text-slate-600">Quy tắc vàng: Tách biệt Loại chào bán khỏi việc Chuyển giao. Chỉ khi chọn "Có chuyển giao" mới kích hoạt mức TRL 1-9 và hồ sơ chuyển giao.</p>
          <div class="text-xs font-semibold text-emerald-700 bg-emerald-100/60 p-2 rounded-lg">
            Trạng thái: 🟢 Đã đáp ứng 100%
          </div>
        </div>

        <!-- Checklist 3 -->
        <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
          <div class="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            3. Các Điểm Đề Xuất Cần PO Chốt
          </div>
          <ul class="text-xs text-slate-600 space-y-1 list-disc list-inside">
            <li>Trường Đánh giá sao (<code class="font-mono text-slate-800">SYS-25</code>): dạng Text hay Rating Widget?</li>
            <li>Phạm vi hiển thị tài liệu (<code class="font-mono text-slate-800">TL-110</code>): Mặc định là Public hay Sau kết nối?</li>
            <li>Quy trình nộp bổ sung minh chứng TRL sau.</li>
          </ul>
          <div class="text-xs font-semibold text-amber-700 bg-amber-100/60 p-2 rounded-lg">
            Trạng thái: 🟡 Cần PO xác nhận
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- DETAIL DRAWER / MODAL -->
  <div id="detail-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span id="modal-code" class="font-mono text-sm font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">CODE</span>
          <h3 id="modal-title" class="text-base font-bold text-slate-900">Tên trường</h3>
        </div>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-slate-500 font-semibold block mb-0.5">Phân lớp dữ liệu:</span>
            <span id="modal-layer" class="font-medium text-slate-800">Lớp 1</span>
          </div>
          <div>
            <span class="text-slate-500 font-semibold block mb-0.5">Dạng nhập liệu:</span>
            <span id="modal-input" class="font-medium text-slate-800 font-mono">Text</span>
          </div>
          <div>
            <span class="text-slate-500 font-semibold block mb-0.5">Ngành áp dụng:</span>
            <span id="modal-industry" class="font-medium text-slate-800">Nông nghiệp</span>
          </div>
          <div>
            <span class="text-slate-500 font-semibold block mb-0.5">Mức độ bắt buộc:</span>
            <span id="modal-req-badge" class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border">Bắt buộc</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100">
          <span class="text-slate-500 font-semibold block mb-1">Điều kiện hiển thị:</span>
          <p id="modal-display" class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px]"></p>
        </div>

        <div>
          <span class="text-slate-500 font-semibold block mb-1">Điều kiện bắt buộc:</span>
          <p id="modal-required" class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 text-[11px]"></p>
        </div>

        <div>
          <span class="text-slate-500 font-semibold block mb-1">Mô tả / Hướng dẫn nghiệp vụ:</span>
          <p id="modal-desc" class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 text-[11px] leading-relaxed"></p>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-[11px]">
          <div>
            <span class="text-slate-400 block">Nguồn gốc:</span>
            <span id="modal-source" class="font-mono text-slate-600"></span>
          </div>
          <div>
            <span class="text-slate-400 block">Chỉ khi chuyển giao:</span>
            <span id="modal-transfer" class="font-semibold text-slate-700"></span>
          </div>
        </div>
      </div>

      <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button onclick="closeModal()" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100">Đóng</button>
      </div>
    </div>
  </div>

  <!-- SCRIPT LOGIC -->
  <script>
    const ALL_DATA = {json_data};
    const INDUSTRIES = {json_industries};

    let filteredData = [...ALL_DATA];

    // Initialize Industry Select
    function initIndustrySelect() {{
      const select = document.getElementById('filter-industry');
      INDUSTRIES.forEach(ind => {{
        const opt = document.createElement('option');
        opt.value = ind.name;
        opt.textContent = `${{ind.name}} (${{ind.count}} rules)`;
        if (ind.name === 'Nông nghiệp') {{
          opt.selected = true;
        }}
        select.appendChild(opt);
      }});
    }}

    // Apply Filter Logic (mimicking Excel C.bán SP columns P:R)
    function applyFilters() {{
      const industry = document.getElementById('filter-industry').value;
      const type = document.getElementById('filter-type').value;
      const transfer = document.getElementById('filter-transfer').value;
      const req = document.getElementById('filter-req').value;
      const layer = document.getElementById('filter-layer').value;
      const search = document.getElementById('filter-search').value.toLowerCase().trim();

      filteredData = ALL_DATA.filter(row => {{
        // 1. Industry check
        if (industry !== 'ALL' && row.ten_nganh !== industry) {{
          return false;
        }}

        // 2. Type check
        if (type === 'Sản phẩm') {{
          if (row.san_pham === 'Không') return false;
        }} else if (type === 'Thiết bị') {{
          if (row.thiet_bi === 'Không') return false;
        }} else if (type === 'Giải pháp công nghệ') {{
          if (row.giai_phap === 'Không') return false;
        }}

        // 3. Transfer check
        if (transfer === 'Không') {{
          if (row.chi_cg === 'Có') return false;
        }}

        // 4. Requirement check
        if (req !== 'ALL' && row.req_type !== req) {{
          return false;
        }}

        // 5. Layer check
        if (layer !== 'ALL' && row.layer_code !== layer) {{
          return false;
        }}

        // 6. Search check
        if (search) {{
          const target = (row.ma_truong + ' ' + row.ten_truong + ' ' + row.dang_nhap + ' ' + row.mo_ta + ' ' + row.ten_nganh).toLowerCase();
          if (!target.includes(search)) return false;
        }}

        return true;
      }});

      updateMetrics();
      renderTable();
    }}

    // Update Metrics
    function updateMetrics() {{
      const total = filteredData.length;
      const mandatory = filteredData.filter(r => r.req_type === 'MANDATORY').length;
      const conditional = filteredData.filter(r => r.req_type === 'CONDITIONAL').length;
      const optional = filteredData.filter(r => r.req_type === 'OPTIONAL').length;
      const l1 = filteredData.filter(r => r.layer_code === 'L1').length;
      const l3 = filteredData.filter(r => r.layer_code === 'L3').length;

      document.getElementById('metric-total').textContent = total;
      document.getElementById('metric-mandatory').textContent = mandatory;
      document.getElementById('metric-conditional').textContent = conditional;
      document.getElementById('metric-optional').textContent = optional;
      document.getElementById('metric-l1').textContent = l1;
      document.getElementById('metric-l3').textContent = l3;
      document.getElementById('count-showing').textContent = total;

      const pMandatory = total > 0 ? Math.round((mandatory / total) * 100) : 0;
      const pConditional = total > 0 ? Math.round((conditional / total) * 100) : 0;
      const pOptional = total > 0 ? Math.round((optional / total) * 100) : 0;

      document.getElementById('percent-mandatory').textContent = pMandatory + '%';
      document.getElementById('percent-conditional').textContent = pConditional + '%';
      document.getElementById('percent-optional').textContent = pOptional + '%';
    }}

    // Render Table
    function renderTable() {{
      const tbody = document.getElementById('table-body');
      tbody.innerHTML = '';

      if (filteredData.length === 0) {{
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center py-12 text-slate-400">
              <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm font-medium">Không tìm thấy trường nào phù hợp với bộ lọc.</p>
              <p class="text-xs mt-1">Hãy thử đổi ngành nghề hoặc đặt lại điều kiện lọc.</p>
            </td>
          </tr>
        `;
        return;
      }}

      filteredData.forEach((row, idx) => {{
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-indigo-50/40 transition cursor-pointer';
        tr.onclick = () => openModal(row);

        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">${{idx + 1}}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-slate-900 text-xs">${{row.ma_truong}}</td>
          <td class="py-2.5 px-4 font-semibold text-slate-800">${{row.ten_truong}}</td>
          <td class="py-2.5 px-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${{row.layer_badge}}">
              ${{row.layer_name}}
            </span>
          </td>
          <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600">${{row.dang_nhap}}</td>
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${{row.badge_color}}">
              ${{row.req_label}}
            </span>
          </td>
          <td class="py-2.5 px-4 text-slate-600 text-[11px] leading-tight">${{row.hien_thi}}</td>
          <td class="py-2.5 px-4 text-slate-600 text-[11px] leading-tight">${{row.bat_buoc}}</td>
          <td class="py-2.5 px-4 text-slate-500 text-[11px] line-clamp-2 leading-tight" title="${{row.mo_ta}}">${{row.mo_ta}}</td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    // Render Matrix
    function renderMatrix() {{
      const tbody = document.getElementById('matrix-body');
      tbody.innerHTML = '';

      INDUSTRIES.forEach((ind, idx) => {{
        const indRows = ALL_DATA.filter(r => r.ten_nganh === ind.name);
        const mandatory = indRows.filter(r => r.req_type === 'MANDATORY').length;
        const conditional = indRows.filter(r => r.req_type === 'CONDITIONAL').length;
        const optional = indRows.filter(r => r.req_type === 'OPTIONAL').length;
        const l1 = indRows.filter(r => r.layer_code === 'L1').length;
        const l2 = indRows.filter(r => r.layer_code === 'L2').length;
        const l3 = indRows.filter(r => r.layer_code === 'L3').length;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = `
          <td class="p-3 text-center text-slate-400 font-mono border-r border-slate-200">${{idx + 1}}</td>
          <td class="p-3 font-mono font-bold text-slate-800 border-r border-slate-200">${{indRows[0] ? indRows[0].ma_nganh : ''}}</td>
          <td class="p-3 font-semibold text-slate-900 border-r border-slate-200">${{ind.name}}</td>
          <td class="p-3 text-center font-mono font-extrabold text-slate-800 border-r border-slate-200 bg-slate-50/50">${{ind.count}}</td>
          <td class="p-3 text-center font-mono font-bold text-rose-600 border-r border-slate-200 bg-rose-50/20">${{mandatory}}</td>
          <td class="p-3 text-center font-mono font-bold text-amber-600 border-r border-slate-200 bg-amber-50/20">${{conditional}}</td>
          <td class="p-3 text-center font-mono font-bold text-emerald-600 border-r border-slate-200 bg-emerald-50/20">${{optional}}</td>
          <td class="p-3 text-center font-mono font-semibold text-blue-600 border-r border-slate-200">${{l1}}</td>
          <td class="p-3 text-center font-mono font-semibold text-purple-600 border-r border-slate-200">${{l2}}</td>
          <td class="p-3 text-center font-mono font-semibold text-indigo-600">${{l3}}</td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    // Switch View Tabs
    function switchView(viewName) {{
      const btnTable = document.getElementById('tab-btn-table');
      const btnMatrix = document.getElementById('tab-btn-matrix');
      const btnAssessment = document.getElementById('tab-btn-assessment');

      const viewTable = document.getElementById('view-table');
      const viewMatrix = document.getElementById('view-matrix');
      const viewAssessment = document.getElementById('view-assessment');

      [btnTable, btnMatrix, btnAssessment].forEach(b => {{
        b.className = 'px-4 py-2 text-xs font-semibold rounded-lg bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition';
      }});

      [viewTable, viewMatrix, viewAssessment].forEach(v => v.classList.add('hidden'));

      if (viewName === 'table') {{
        btnTable.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition';
        viewTable.classList.remove('hidden');
      }} else if (viewName === 'matrix') {{
        btnMatrix.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition';
        viewMatrix.classList.remove('hidden');
        renderMatrix();
      }} else if (viewName === 'assessment') {{
        btnAssessment.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition';
        viewAssessment.classList.remove('hidden');
      }}
    }}

    // Reset Filters
    function resetFilters() {{
      document.getElementById('filter-industry').value = 'Nông nghiệp';
      document.getElementById('filter-type').value = 'Thiết bị';
      document.getElementById('filter-transfer').value = 'Không';
      document.getElementById('filter-req').value = 'ALL';
      document.getElementById('filter-layer').value = 'ALL';
      document.getElementById('filter-search').value = '';
      applyFilters();
    }}

    // Modal Details
    function openModal(row) {{
      document.getElementById('modal-code').textContent = row.ma_truong;
      document.getElementById('modal-title').textContent = row.ten_truong;
      document.getElementById('modal-layer').textContent = row.layer_name;
      document.getElementById('modal-input').textContent = row.dang_nhap;
      document.getElementById('modal-industry').textContent = row.ten_nganh + ' (' + row.ma_nganh + ')';
      
      const badge = document.getElementById('modal-req-badge');
      badge.textContent = row.req_label;
      badge.className = 'inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ' + row.badge_color;

      document.getElementById('modal-display').textContent = row.hien_thi || '(Luôn hiển thị)';
      document.getElementById('modal-required').textContent = row.bat_buoc || '(Không bắt buộc)';
      document.getElementById('modal-desc').textContent = row.mo_ta || '(Chưa có mô tả chi tiết)';
      document.getElementById('modal-source').textContent = row.nguon;
      document.getElementById('modal-transfer').textContent = row.chi_cg === 'Có' ? 'Có (Chỉ hiện khi chuyển giao)' : 'Không (Hiện cả khi không chuyển giao)';

      document.getElementById('detail-modal').classList.remove('hidden');
    }}

    function closeModal() {{
      document.getElementById('detail-modal').classList.add('hidden');
    }}

    // Export CSV
    function exportCSV() {{
      if (filteredData.length === 0) return alert('Không có dữ liệu để xuất!');
      
      const headers = ['STT', 'Mã ngành', 'Tên ngành', 'Mã trường', 'Lớp', 'Tên trường', 'Dạng nhập', 'Tính chất bắt buộc', 'Điều kiện hiển thị', 'Điều kiện bắt buộc', 'Mô tả'];
      const rows = filteredData.map((r, i) => [
        i + 1,
        `"${{r.ma_nganh}}"`,
        `"${{r.ten_nganh}}"`,
        `"${{r.ma_truong}}"`,
        `"${{r.lop}}"`,
        `"${{r.ten_truong.replace(/"/g, '""')}}"`,
        `"${{r.dang_nhap}}"`,
        `"${{r.req_label}}"`,
        `"${{r.hien_thi.replace(/"/g, '""')}}"`,
        `"${{r.bat_buoc.replace(/"/g, '""')}}"`,
        `"${{r.mo_ta.replace(/"/g, '""')}}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
      const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bo_loc_Cban_export_${{new Date().toISOString().slice(0,10)}}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }}

    // On Load
    window.addEventListener('DOMContentLoaded', () => {{
      initIndustrySelect();
      resetFilters();
    }});
  </script>
</body>
</html>
"""

    out_file = 'Specification/02_BASIC_DESIGN/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/bo_loc_cban_view.html'
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Generated {out_file} successfully! Size: {os.path.getsize(out_file):,} bytes")

if __name__ == '__main__':
    generate_html()
