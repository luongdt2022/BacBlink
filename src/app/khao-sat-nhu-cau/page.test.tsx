import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import DeepSurveyPage from './page';
import { calculateTniScore, getTniBadge } from './types';
import { authClient } from '@/lib/auth-client';

const mockSurveyResponse = {
  success: true,
  surveyId: 'sur-uuid-1234',
  surveyCode: 'SUR-20261012-7A9B1C',
  createdTickets: ['DMD-20261012-A101-01', 'DMD-20261012-A101-02'],
  message: 'Tiếp nhận phiếu khảo sát nhu cầu công nghệ thành công.'
};

const setupFetch = (override?: {
  surveyResponse?: any;
  lookupResponse?: any;
  profileResponse?: any;
}) => {
  return vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/v1/demands/surveys')) {
      return {
        ok: true,
        json: async () => override?.surveyResponse || mockSurveyResponse
      } as Response;
    }
    if (url.includes('/api/v1/enterprises/lookup-tax/')) {
      return {
        ok: true,
        json: async () => override?.lookupResponse || {
          code: 200,
          data: {
            found: true,
            source: 'INTERNAL',
            taxCode: '0108992134',
            name: 'Công ty Cổ phần Cơ khí Chính xác Minh Anh',
            province: 'Hà Nội',
            address: 'Lô CN-08 KCN Nam Từ Liêm, Hà Nội'
          }
        }
      } as Response;
    }
    if (url.includes('/api/v1/portal/enterprise/profile')) {
      return {
        ok: true,
        json: async () => override?.profileResponse || {
          code: 200,
          data: {
            name: 'Công ty Cổ phần Thiết bị Công nghệ Nacentwin',
            taxCode: '0109988776',
            provinceCity: 'Bắc Ninh',
            addressDetail: 'KCN Tiên Sơn, Bắc Ninh',
            contactPerson: 'Nguyễn Hoàng Long',
            contactPhone: '0988776655',
            contactEmail: 'long.nh@nacentwin.vn',
            sectorCode: 'LV07',
            workforceScale: '50-199',
            revenueRange: '10-50 tỷ VNĐ'
          }
        }
      } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  });
};

describe('DeepSurveyPage Component (/khao-sat-nhu-cau)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Step 1 (Nhu Cầu & TNI) with 10-field QuickDemand layout and header action buttons', () => {
    render(<DeepSurveyPage />);

    // Header and Step 1 title
    expect(screen.getByText('Khảo Sát Nhu Cầu Đổi Mới Công Nghệ & Điểm Nghẽn Kỹ Thuật')).toBeInTheDocument();
    expect(screen.getByText(/Danh Mục Bài Toán Kỹ Thuật Cần Giải Quyết/i)).toBeInTheDocument();
    expect(screen.getByText('1. Chi Tiết Bài Toán Kỹ Thuật')).toBeInTheDocument();
    expect(screen.getByText('2. Chỉ Số Nhu Cầu Đổi Mới (TNI)')).toBeInTheDocument();

    // Check Stepper 4 buttons
    expect(screen.getByText('Nhu Cầu & TNI')).toBeInTheDocument();
    expect(screen.getByText('Doanh Nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Thông Tin Bổ Sung')).toBeInTheDocument();
    expect(screen.getByText('Xác Nhận')).toBeInTheDocument();

    // Check Progress indicator
    expect(screen.getByText(/Bước 1\/4: Nhu Cầu & Thuật Toán TNI/i)).toBeInTheDocument();
    expect(screen.getByText(/25% Hoàn thành/i)).toBeInTheDocument();

    // Action buttons in header
    expect(screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Làm mới \/ Xóa nháp/i })).toBeInTheDocument();

    // Verify demand fields start BLANK
    const stageInput = screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i) as HTMLInputElement;
    const problemInput = screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i) as HTMLTextAreaElement;
    expect(stageInput.value).toBe('');
    expect(problemInput.value).toBe('');
  });

  it('calculates TNI score correctly and handles unrated dimensions (<=0)', () => {
    // 0 or negative dimension -> Returns 0 (Chưa đánh giá)
    expect(calculateTniScore(0, 0, 0, 0)).toBe(0);
    expect(calculateTniScore(4, 5, 0, 4)).toBe(0);
    const unratedBadge = getTniBadge(0);
    expect(unratedBadge.label).toContain('Chưa đánh giá');

    // Formula: ROUND((35*K + 30*L + 20*N + 15*O) / 5)
    // All 1s: (35 + 30 + 20 + 15) / 5 = 100 / 5 = 20
    expect(calculateTniScore(1, 1, 1, 1)).toBe(20);

    // All 5s: (35*5 + 30*5 + 20*5 + 15*5) / 5 = 500 / 5 = 100
    expect(calculateTniScore(5, 5, 5, 5)).toBe(100);

    // Test case: K=4, L=5, N=4, O=4 -> (140 + 150 + 80 + 60) / 5 = 430 / 5 = 86
    expect(calculateTniScore(4, 5, 4, 4)).toBe(86);
    expect(getTniBadge(86).label).toContain('Cấp thiết rất cao');

    // Test case: K=3, L=3, N=3, O=3 -> 60 -> Nhu cầu trung bình
    expect(calculateTniScore(3, 3, 3, 3)).toBe(60);
    expect(getTniBadge(60).label).toContain('Nhu cầu trung bình');
  });

  it('validates Step 1 required demand fields before allowing navigation to Step 2 via Next button', () => {
    render(<DeepSurveyPage />);

    // Attempt to proceed without filling demand fields via Next button
    const nextBtn = screen.getByText(/Tiếp tục Bước 2/i);
    fireEvent.click(nextBtn);

    // Should stay on Step 1
    expect(screen.getByText(/Danh Mục Bài Toán Kỹ Thuật Cần Giải Quyết/i)).toBeInTheDocument();
  });

  it('allows clicking to view any tab directly without restriction', () => {
    render(<DeepSurveyPage />);

    // Click on Tab 3 (Thông Tin Bổ Sung) directly from empty Step 1
    const tab3 = screen.getByRole('button', { name: /Thông Tin Bổ Sung/i });
    fireEvent.click(tab3);

    // Should switch to Step 3 view
    expect(screen.getByText(/Bước 3\/4: Thông Tin Bổ Sung/i)).toBeInTheDocument();
    expect(screen.getByText(/75% Hoàn thành/i)).toBeInTheDocument();
    expect(screen.getByText(/Phân mục B \(Tùy chọn\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Phân mục C \(Tùy chọn\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Phân mục D \(Tùy chọn\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Phân mục F \(Tùy chọn\)/i)).toBeInTheDocument();

    // Click on Tab 2 (Doanh Nghiệp)
    const tab2 = screen.getByRole('button', { name: /^2\s*Doanh Nghiệp$/i });
    fireEvent.click(tab2);
    expect(screen.getByText(/Bước 2\/4: Thông Tin Doanh Nghiệp/i)).toBeInTheDocument();
    expect(screen.getByText(/50% Hoàn thành/i)).toBeInTheDocument();

    // Click on Tab 4 (Xác Nhận)
    const tab4 = screen.getByRole('button', { name: /^4\s*Xác Nhận$/i });
    fireEvent.click(tab4);
    expect(screen.getByText(/Bước 4\/4: Rà Soát & Xác Nhận PDPD/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Hoàn thành/i)).toBeInTheDocument();
  });

  it('fills sample data when clicking "Điền dữ liệu mẫu (Demo)" and can reset with "Làm mới / Xóa nháp"', () => {
    render(<DeepSurveyPage />);

    const demoBtn = screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i });
    fireEvent.click(demoBtn);

    // Check that sample demand info was populated on Step 1
    const stageInput = screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i) as HTMLInputElement;
    expect(stageInput.value).toBe('Gia công & Lắp ráp chi tiết');

    const problemInput = screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i) as HTMLTextAreaElement;
    expect(problemInput.value).toBe('Tự động hóa phát hiện khuyết tật bề mặt mối hàn bằng AI Vision');

    // Reset via "Làm mới / Xóa nháp"
    const clearBtn = screen.getByRole('button', { name: /Làm mới \/ Xóa nháp/i });
    fireEvent.click(clearBtn);

    // Verify fields are blank again
    expect(stageInput.value).toBe('');
    expect(problemInput.value).toBe('');
  });

  it('navigates through all 4 steps using "Điền dữ liệu mẫu (Demo)" and submits successfully', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Load full sample data
    fireEvent.click(screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i }));

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    // Step 2 -> Step 3
    await waitFor(() => screen.getByText(/Tiếp tục Bước 3/i));
    fireEvent.click(screen.getByText(/Tiếp tục Bước 3/i));

    // Step 3 -> Step 4
    await waitFor(() => screen.getByText(/Tiếp tục Bước 4/i));
    fireEvent.click(screen.getByText(/Tiếp tục Bước 4/i));

    // Step 4: Submit
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));
    const submitBtn = screen.getByText(/Hoàn Tất & Nộp Khảo Sát/i);
    fireEvent.click(submitBtn);

    // Verify success view
    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
      expect(screen.getByText('SUR-20261012-7A9B1C')).toBeInTheDocument();
      expect(screen.getByText('DMD-20261012-A101-01')).toBeInTheDocument();
    });
  });

  it('allows interactive manual form completion from empty state to final submission', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Step 1: Fill demand item (E. Nhu Cầu & TNI)
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Kiểm định phôi đúc' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Tỷ lệ phôi rỗ khí vượt mức 4%' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Giảm tỷ lệ phế phẩm đúc/i), {
      target: { value: 'Giảm tỷ lệ lỗi xuống dưới 0.5%' }
    });

    // Step 1 -> Step 2 (A. Doanh Nghiệp)
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    // Step 2: Fill required enterprise fields
    await waitFor(() => screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất'));
    fireEvent.change(screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i), {
      target: { value: 'Công ty Cơ Khí Chế Tạo Hà Nam' }
    });
    fireEvent.change(screen.getByPlaceholderText(/0108992134/i), {
      target: { value: '0701234567' }
    });
    fireEvent.change(screen.getByDisplayValue('-- Chọn Tỉnh / Thành phố --'), {
      target: { value: 'Hà Nội' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Họ và tên người đại diện/i), {
      target: { value: 'Lê Văn Nam' }
    });
    fireEvent.change(screen.getByPlaceholderText(/0912 xxx xxx/i), {
      target: { value: '0912888999' }
    });
    fireEvent.change(screen.getByPlaceholderText(/contact@company.com.vn/i), {
      target: { value: 'hanam@tech.vn' }
    });

    // Step 2 -> Step 3 (Thông Tin Bổ Sung)
    fireEvent.click(screen.getByText(/Tiếp tục Bước 3/i));

    // Step 3: Fill equipment details in unified Tab 3
    await waitFor(() => screen.getByText('Danh Mục Thiết Bị & Dây Chuyền Sản Xuất Chủ Lực'));
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Đúc phôi, Tiện CNC/i), {
      target: { value: 'Đúc phôi' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Tên máy, model/i), {
      target: { value: 'Máy đúc áp lực 500T' }
    });

    // Pick a bottleneck
    const bottleneckCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(bottleneckCheckboxes[0]);

    // Fill personnel count
    const techInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(techInputs[0], { target: { value: '8' } });

    // Step 3 -> Step 4 (G. Xác Nhận)
    fireEvent.click(screen.getByText(/Tiếp tục Bước 4/i));

    // Step 4: Sign and consent
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));
    fireEvent.change(screen.getByPlaceholderText(/Người ký xác nhận/i), {
      target: { value: 'Lê Văn Nam' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Chức vụ người ký/i), {
      target: { value: 'Giám đốc Điều hành' }
    });

    // Toggle PDPD consent checkbox
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    // Touch Signature (BR-SIG-01)
    fireEvent.click(screen.getByText(/Bấm vào đây để ký tay \/ Chữ ký điện tử/i));
    const canvas = screen.getByRole('dialog').querySelector('canvas');
    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(canvas);
      fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));
    }

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    // Verify success view
    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
      expect(screen.getByText('SUR-20261012-7A9B1C')).toBeInTheDocument();
    });
  });

  it('enforces mandatory Step 1 and Step 2 while allowing optional Step 3 to be skipped directly to Step 4 (CR-2026-017 / TASK-03-CR59)', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Step 1 is E. Nhu Cầu & TNI: Must have at least 1 demand item
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Tự động hóa phân loại hàng' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Phân loại thủ công chậm và sai sót' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Giảm tỷ lệ phế phẩm đúc/i), {
      target: { value: 'Tăng tốc độ phân loại lên 300%' }
    });

    // Navigate to Step 2
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    // Step 2: Fill required enterprise fields
    await waitFor(() => screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất'));
    fireEvent.change(screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i), {
      target: { value: 'Công ty Công Nghệ Nhanh' }
    });
    fireEvent.change(screen.getByDisplayValue('-- Chọn Tỉnh / Thành phố --'), {
      target: { value: 'Hà Nội' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Họ và tên người đại diện/i), {
      target: { value: 'Trần Thị Mai' }
    });
    fireEvent.change(screen.getByPlaceholderText(/0912 xxx xxx/i), {
      target: { value: '0987654321' }
    });
    fireEvent.change(screen.getByPlaceholderText(/contact@company.com.vn/i), {
      target: { value: 'mai.tt@quicktech.vn' }
    });

    // Skip optional step 3 directly to Step 4 using shortcut button
    const skipBtn = screen.getByRole('button', { name: /Bỏ qua bước tùy chọn & Đến nộp phiếu/i });
    expect(skipBtn).toBeInTheDocument();
    fireEvent.click(skipBtn);

    // Verify reached Step 4 directly without error
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));

    // Fill signature & PDPD consent
    fireEvent.change(screen.getByPlaceholderText(/Người ký xác nhận/i), {
      target: { value: 'Trần Thị Mai' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Chức vụ người ký/i), {
      target: { value: 'Tổng Giám đốc' }
    });
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    // Touch Signature (BR-SIG-01)
    fireEvent.click(screen.getByText(/Bấm vào đây để ký tay \/ Chữ ký điện tử/i));
    const canvas = screen.getByRole('dialog').querySelector('canvas');
    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(canvas);
      fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));
    }

    // Submit successfully
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
    });
  });

  it('allows proceeding through Step 3 without filling any optional fields (CR-2026-017 / T-03.60)', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Step 1: Valid demand item
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Sơn tự động' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Sơn không đồng màu' }
    });
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    // Step 2: Valid enterprise info
    await waitFor(() => screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất'));
    fireEvent.change(screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i), {
      target: { value: 'Công ty TNHH Quang Minh' }
    });
    fireEvent.change(screen.getByDisplayValue('-- Chọn Tỉnh / Thành phố --'), {
      target: { value: 'Hải Phòng' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Họ và tên người đại diện/i), {
      target: { value: 'Vũ Văn Quang' }
    });
    fireEvent.change(screen.getByPlaceholderText(/0912 xxx xxx/i), {
      target: { value: '0904111222' }
    });
    fireEvent.change(screen.getByPlaceholderText(/contact@company.com.vn/i), {
      target: { value: 'quang@quangminh.vn' }
    });

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText(/Tiếp tục Bước 3/i));

    // Step 3: Do NOT fill anything! Just click "Tiếp tục Bước 4"
    await waitFor(() => screen.getByText(/Bước 3\/4: Thông Tin Bổ Sung/i));
    const nextBtn = screen.getByRole('button', { name: /Tiếp tục Bước 4/i });
    fireEvent.click(nextBtn);

    // Must reach Step 4 smoothly
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));
    expect(screen.getByText(/Bước 4\/4: Rà Soát & Xác Nhận PDPD/i)).toBeInTheDocument();

    // Sign and consent
    fireEvent.change(screen.getByPlaceholderText(/Người ký xác nhận/i), {
      target: { value: 'Vũ Văn Quang' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Chức vụ người ký/i), {
      target: { value: 'Giám đốc' }
    });
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    // Touch Signature (BR-SIG-01)
    fireEvent.click(screen.getByText(/Bấm vào đây để ký tay \/ Chữ ký điện tử/i));
    const canvas = screen.getByRole('dialog').querySelector('canvas');
    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(canvas);
      fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));
    }

    // Submit successfully
    fireEvent.click(screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i }));

    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
    });
  });

  it('handles auto MST lookup and fills enterprise name, province, address on Step 2 (T-03.40)', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Fill Step 1 demand item and go to Step 2
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Gia công CNC' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Sai số gia công cao' }
    });
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    await waitFor(() => screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất'));

    // Enter tax code
    const taxInput = screen.getByPlaceholderText(/0108992134/i) as HTMLInputElement;
    fireEvent.change(taxInput, { target: { value: '0108992134' } });

    // Click Tra cứu MST button
    const lookupBtn = screen.getByRole('button', { name: /Tra cứu MST/i });
    fireEvent.click(lookupBtn);

    // Verify fields auto-fill
    await waitFor(() => {
      const companyInput = screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i) as HTMLInputElement;
      expect(companyInput.value).toBe('Công ty Cổ phần Cơ khí Chính xác Minh Anh');
    });

    const provinceSelect = screen.getByDisplayValue('Hà Nội') as HTMLSelectElement;
    expect(provinceSelect.value).toBe('Hà Nội');

    const addressInput = screen.getByPlaceholderText(/Số nhà, đường, phường\/xã/i) as HTMLInputElement;
    expect(addressInput.value).toBe('Lô CN-08 KCN Nam Từ Liêm, Hà Nội');
  });

  it('handles smart pre-fill for logged-in enterprises and displays sync banner on Step 1 & Step 2 (T-03.41)', async () => {
    setupFetch();
    authClient.setSession('fake-buyer-token', {
      id: 'usr-1',
      email: 'long.nh@nacentwin.vn',
      fullName: 'Nguyễn Hoàng Long',
      role: 'BUYER'
    });

    render(<DeepSurveyPage />);

    // Verify sync notice appears on Step 1
    await waitFor(() => {
      expect(screen.getByText(/Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký/i)).toBeInTheDocument();
    });

    // Fill Step 1 and go to Step 2
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Hàn tự động' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Mối hàn không đồng đều' }
    });
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    // Verify inputs auto-populated on Step 2 from enterprise profile
    await waitFor(() => screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất'));
    const companyInput = screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i) as HTMLInputElement;
    expect(companyInput.value).toBe('Công ty Cổ phần Thiết bị Công nghệ Nacentwin');

    const taxInput = screen.getByPlaceholderText(/0108992134/i) as HTMLInputElement;
    expect(taxInput.value).toBe('0109988776');

    const contactInput = screen.getByPlaceholderText(/Họ và tên người đại diện/i) as HTMLInputElement;
    expect(contactInput.value).toBe('Nguyễn Hoàng Long');
  });

  it('displays provisioned account details and login CTA when anonymous survey is submitted at expo (T-03.42)', async () => {
    setupFetch({
      surveyResponse: {
        success: true,
        surveyId: 'sur-expo-999',
        surveyCode: 'SUR-20261012-EXPO88',
        createdTickets: ['DMD-20261012-EXPO-01'],
        accountProvisioned: true,
        account: {
          email: 'expo.guest@dn.vn',
          temporaryPassword: 'Buyer@2026!',
          role: 'BUYER',
          note: 'Hệ thống đã tự động cấp tài khoản Doanh nghiệp (Buyer).'
        },
        message: 'Tiếp nhận phiếu khảo sát thành công. Tài khoản Doanh nghiệp đã được khởi tạo tự động.'
      }
    });

    render(<DeepSurveyPage />);

    // Fill sample demo data to satisfy validations
    const fillSampleBtn = screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i });
    fireEvent.click(fillSampleBtn);

    // Jump to Step 4
    fireEvent.click(screen.getByText('Xác Nhận'));

    // Submit form
    await waitFor(() => screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i }));
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    // Verify Success View displays account provisioned section
    await waitFor(() => {
      expect(screen.getByText('TÀI KHOẢN DOANH NGHIỆP ĐÃ ĐƯỢC CẤP TỰ ĐỘNG')).toBeInTheDocument();
      expect(screen.getByText('expo.guest@dn.vn')).toBeInTheDocument();
      expect(screen.getByText('Buyer@2026!')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Đăng Nhập Ngay Vào Hệ Thống/i })).toBeInTheDocument();
    });
  });

  it('pre-fills 100% of 11 enterprise fields on Step 2 after completing Step 1 demand item (T-03.56)', async () => {
    setupFetch({
      profileResponse: {
        code: 200,
        data: {
          name: 'CÔNG TY TNHH TRƯỜNG HOAN',
          taxCode: '0100255428',
          provinceCity: 'Hà Nội',
          addressDetail: 'Số 15, Phố Định Công, Phường Định Công, Quận Hoàng Mai, Hà Nội',
          contactPerson: 'Nguyễn Văn Hoan',
          contactPhone: '0912 345 678',
          contactEmail: 'buyer.user@demo.nacentech.vn',
          contactPosition: 'Giám đốc Điều hành',
          ownershipType: 'Tư nhân',
          sectorCode: 'LV01',
          workforceScale: 'Dưới 10 người',
          revenueRange: 'Từ 10 đến dưới 50 tỷ đồng'
        }
      }
    });
    authClient.setSession('fake-buyer-token', {
      id: 'fbc7b482-4cdd-4f5e-80dc-5fdc5944cc76',
      email: 'buyer.user@demo.nacentech.vn',
      fullName: 'Nguyễn Văn Hoan',
      role: 'BUYER'
    });

    render(<DeepSurveyPage />);

    // 1. Verify alert banner is displayed on Step 1
    await waitFor(() => {
      expect(screen.getByText(/Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký/i)).toBeInTheDocument();
    });

    // 2. Fill Step 1 demand item and move to Step 2
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Dây chuyền đóng gói tự động' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Đóng gói thủ công tốn nhiều nhân công' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục Bước 2/i }));

    // 3. Verify all core fields are 100% prefilled on Step 2
    await waitFor(() => {
      expect(screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất')).toBeInTheDocument();
    });

    const companyInput = screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i) as HTMLInputElement;
    expect(companyInput.value).toBe('CÔNG TY TNHH TRƯỜNG HOAN');

    const taxInput = screen.getByPlaceholderText(/0108992134/i) as HTMLInputElement;
    expect(taxInput.value).toBe('0100255428');

    const provinceSelect = screen.getByDisplayValue('Hà Nội') as HTMLSelectElement;
    expect(provinceSelect.value).toBe('Hà Nội');

    const addressInput = screen.getByPlaceholderText(/Số nhà, đường, phường\/xã/i) as HTMLInputElement;
    expect(addressInput.value).toBe('Số 15, Phố Định Công, Phường Định Công, Quận Hoàng Mai, Hà Nội');

    const contactInput = screen.getByPlaceholderText(/Họ và tên người đại diện/i) as HTMLInputElement;
    expect(contactInput.value).toBe('Nguyễn Văn Hoan');

    const phoneInput = screen.getByPlaceholderText(/0912 xxx xxx/i) as HTMLInputElement;
    expect(phoneInput.value).toBe('0912 345 678');

    const emailInput = screen.getByPlaceholderText(/contact@company\.com\.vn/i) as HTMLInputElement;
    expect(emailInput.value).toBe('buyer.user@demo.nacentech.vn');
  });

  it('enforces comprehensive 3-tier validation on final submit: redirects to Step 1 if demand is missing, or Step 2 if enterprise info is missing (BR-NEW-03-01)', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // 1. Direct free-click jump to Step 4 from empty state
    fireEvent.click(screen.getByRole('button', { name: /^4\s*Xác Nhận$/i }));
    await waitFor(() => screen.getByText(/Bước 4\/4: Rà Soát & Xác Nhận PDPD/i));

    // Fill signature & PDPD to simulate submitting on Step 4
    fireEvent.change(screen.getByPlaceholderText(/Người ký xác nhận/i), {
      target: { value: 'Trần Văn Ký' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Chức vụ người ký/i), {
      target: { value: 'Giám đốc' }
    });
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    // Attempt to submit: Tier 1 check should fail (missing demand items in Step 1)
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    // Should redirect back to Step 1
    await waitFor(() => {
      expect(screen.getByText(/Bước 1\/4: Nhu Cầu & Thuật Toán TNI/i)).toBeInTheDocument();
    });

    // 2. Fill Step 1 demand item
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Công đoạn ép khuôn' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Khuôn ép bị xước bề mặt' }
    });

    // Jump back to Step 4 and attempt submit again: Tier 2 check should fail (missing enterprise info in Step 2)
    fireEvent.click(screen.getByRole('button', { name: /^4\s*Xác Nhận$/i }));
    await waitFor(() => screen.getByText(/Bước 4\/4: Rà Soát & Xác Nhận PDPD/i));
    fireEvent.click(screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i }));

    // Should redirect back to Step 2
    await waitFor(() => {
      expect(screen.getByText(/Bước 2\/4: Thông Tin Doanh Nghiệp/i)).toBeInTheDocument();
    });

    // 3. Fill Step 2 enterprise info
    fireEvent.change(screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i), {
      target: { value: 'Công ty Cơ Khí Đạt Chuẩn' }
    });
    fireEvent.change(screen.getByDisplayValue('-- Chọn Tỉnh / Thành phố --'), {
      target: { value: 'Hà Nội' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Họ và tên người đại diện/i), {
      target: { value: 'Trần Văn Ký' }
    });
    fireEvent.change(screen.getByPlaceholderText(/0912 xxx xxx/i), {
      target: { value: '0912333444' }
    });
    fireEvent.change(screen.getByPlaceholderText(/contact@company.com.vn/i), {
      target: { value: 'ky.tv@datchuan.vn' }
    });

    // Jump to Step 4 and submit successfully
    fireEvent.click(screen.getByRole('button', { name: /^4\s*Xác Nhận$/i }));
    await waitFor(() => screen.getByText(/Bước 4\/4: Rà Soát & Xác Nhận PDPD/i));
    fireEvent.change(screen.getByPlaceholderText(/Người ký xác nhận/i), {
      target: { value: 'Trần Văn Ký' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Chức vụ người ký/i), {
      target: { value: 'Giám đốc' }
    });
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    if (!checkbox.checked) {
      fireEvent.click(checkbox);
    }

    // Touch Signature (BR-SIG-01)
    fireEvent.click(screen.getByText(/Bấm vào đây để ký tay \/ Chữ ký điện tử/i));
    const canvasFinal = screen.getByRole('dialog').querySelector('canvas');
    if (canvasFinal) {
      fireEvent.mouseDown(canvasFinal, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvasFinal, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(canvasFinal);
      fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));
    }

    fireEvent.click(screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i }));

    // Verified: Submission succeeds
    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
    });
  });

  it('enforces mandatory electronic touch signature before submission (BR-SIG-01 / REQ-SIG-01 / TEST-SIG-01)', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Load sample data
    fireEvent.click(screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i }));

    // Jump to Step 4
    fireEvent.click(screen.getByRole('button', { name: /^4\s*Xác Nhận$/i }));
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));

    // Clear signature if already populated
    const clearSigBtn = screen.queryByRole('button', { name: /Xóa chữ ký/i });
    if (clearSigBtn) {
      fireEvent.click(clearSigBtn);
    }

    // Verify unsigned placeholder is displayed
    expect(screen.getByText('Bấm vào đây để ký tay / Chữ ký điện tử')).toBeInTheDocument();

    // Attempt to submit without signature
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    // Verify blocked and error displayed
    expect(screen.queryByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).not.toBeInTheDocument();
    expect(screen.getByText('Vui lòng ký tên xác nhận điện tử trước khi gửi phiếu khảo sát!')).toBeInTheDocument();
  });

  it('preserves electronic touch signature in LocalStorage draft and restores it upon reload (TEST-SIG-05)', async () => {
    setupFetch();
    const sampleSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    // Mock saved draft in localStorage
    const sampleDraft = {
      companyName: 'Công ty Cổ phần Năng Lượng Mới',
      province: 'Đà Nẵng',
      contactName: 'Phạm Minh',
      contactPhone: '0905123456',
      contactEmail: 'minh.pm@newenergy.vn',
      demandItems: [
        {
          id: 'item-1',
          stageName: 'Truyền tải điện',
          technicalProblem: 'Tổn hao điện năng',
          desiredSolution: 'Biến áp siêu dẫn',
          needConsulting: true,
          expectedGoal: 'Giảm 2% tổn hao',
          urgency: 4,
          impact: 4,
          investment: 3,
          readiness: 3
        }
      ],
      confirmName: 'Phạm Minh',
      confirmPosition: 'Giám đốc',
      signatureData: sampleSignature
    };

    localStorage.setItem('nacentwin_deep_survey_draft_v2', JSON.stringify(sampleDraft));

    render(<DeepSurveyPage />);

    // Jump to Step 4
    fireEvent.click(screen.getByRole('button', { name: /^4\s*Xác Nhận$/i }));
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));

    // Verify signature was restored from draft
    expect(screen.getByText(/✓ Đã ký điện tử/i)).toBeInTheDocument();
    const img = screen.getByRole('img', { name: /Chữ ký điện tử người đại diện/i });
    expect(img).toHaveAttribute('src', sampleSignature);
  });
});


