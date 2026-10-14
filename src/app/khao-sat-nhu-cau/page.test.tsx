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

  it('renders Step 1 with clean blank defaults and header action buttons', () => {
    render(<DeepSurveyPage />);

    // Header and Step 1 title
    expect(screen.getByText('Khảo Sát Nhu Cầu Đổi Mới Công Nghệ & Điểm Nghẽn Kỹ Thuật')).toBeInTheDocument();
    expect(screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất')).toBeInTheDocument();

    // Check Stepper buttons
    expect(screen.getByText('A. Doanh Nghiệp')).toBeInTheDocument();
    expect(screen.getByText('B. Hiện Trạng')).toBeInTheDocument();
    expect(screen.getByText('C. Điểm Nghẽn')).toBeInTheDocument();
    expect(screen.getByText('D. Năng Lực TAR')).toBeInTheDocument();
    expect(screen.getByText('E. Nhu Cầu & TNI')).toBeInTheDocument();
    expect(screen.getByText('F. Định Hướng')).toBeInTheDocument();
    expect(screen.getByText('G. Xác Nhận')).toBeInTheDocument();

    // Action buttons in header
    expect(screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Làm mới \/ Xóa nháp/i })).toBeInTheDocument();

    // Verify fields start 100% BLANK
    const companyInput = screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i) as HTMLInputElement;
    const taxInput = screen.getByPlaceholderText(/0108992134/i) as HTMLInputElement;
    expect(companyInput.value).toBe('');
    expect(taxInput.value).toBe('');

    // Province starts unselected
    const provinceSelect = screen.getByDisplayValue('-- Chọn Tỉnh / Thành phố --') as HTMLSelectElement;
    expect(provinceSelect.value).toBe('');
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

  it('validates Step 1 required fields before allowing navigation to Step 2', () => {
    render(<DeepSurveyPage />);

    // Attempt to proceed without filling fields
    const nextBtn = screen.getByText(/Tiếp tục Bước 2/i);
    fireEvent.click(nextBtn);

    // Should stay on Step 1
    expect(screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất')).toBeInTheDocument();
  });

  it('fills sample data when clicking "Điền dữ liệu mẫu (Demo)" and can reset with "Làm mới / Xóa nháp"', () => {
    render(<DeepSurveyPage />);

    const demoBtn = screen.getByRole('button', { name: /Điền dữ liệu mẫu \(Demo\)/i });
    fireEvent.click(demoBtn);

    // Check that sample company info was populated
    const companyInput = screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i) as HTMLInputElement;
    expect(companyInput.value).toBe('Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh');

    const taxInput = screen.getByPlaceholderText(/0108992134/i) as HTMLInputElement;
    expect(taxInput.value).toBe('0108992134');

    // Reset via "Làm mới / Xóa nháp"
    const clearBtn = screen.getByRole('button', { name: /Làm mới \/ Xóa nháp/i });
    fireEvent.click(clearBtn);

    // Verify fields are blank again
    expect(companyInput.value).toBe('');
    expect(taxInput.value).toBe('');
  });

  it('navigates through all 7 steps using "Điền dữ liệu mẫu (Demo)" and submits successfully', async () => {
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

    // Step 4 -> Step 5
    await waitFor(() => screen.getByText(/Tiếp tục Bước 5/i));
    fireEvent.click(screen.getByText(/Tiếp tục Bước 5/i));

    // Step 5 -> Step 6
    await waitFor(() => screen.getByText(/Tiếp tục Bước 6/i));
    fireEvent.click(screen.getByText(/Tiếp tục Bước 6/i));

    // Step 6 -> Step 7
    await waitFor(() => screen.getByText(/Tiếp tục Bước 7/i));
    fireEvent.click(screen.getByText(/Tiếp tục Bước 7/i));

    // Step 7: Submit
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

    // Step 1: Fill required fields
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

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText(/Tiếp tục Bước 2/i));

    // Step 2: Fill equipment details
    await waitFor(() => screen.getByText('Danh Mục Thiết Bị & Dây Chuyền Sản Xuất Chủ Lực'));
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Đúc phôi, Tiện CNC/i), {
      target: { value: 'Đúc phôi' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Tên máy, model/i), {
      target: { value: 'Máy đúc áp lực 500T' }
    });

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText(/Tiếp tục Bước 3/i));

    // Step 3: Pick a bottleneck and specify hardest stage
    await waitFor(() => screen.getByText(/Nhận Diện Điểm Nghẽn Kỹ Thuật/i));
    const bottleneckCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(bottleneckCheckboxes[0]);
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Kiểm tra chất lượng \(QC\)/i), {
      target: { value: 'Kiểm tra bọt khí phôi đúc' }
    });

    // Step 3 -> Step 4
    fireEvent.click(screen.getByText(/Tiếp tục Bước 4/i));

    // Step 4: Verify D.1, D.2, D.3
    await waitFor(() => screen.getByText('Thống Kê Đội Ngũ Nhân Lực Kỹ Thuật'));
    expect(screen.getByText('Cơ Chế Quản Lý & Đổi Mới Công Nghệ Hiện Có Tại Doanh Nghiệp')).toBeInTheDocument();
    expect(screen.getByText('PHẦN D.3 • NĂNG LỰC HẤP THỤ CÔNG NGHỆ (TAR)')).toBeInTheDocument();

    // Fill personnel count
    const techInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(techInputs[0], { target: { value: '8' } });

    // Step 4 -> Step 5
    fireEvent.click(screen.getByText(/Tiếp tục Bước 5/i));

    // Step 5: Fill demand item
    await waitFor(() => screen.getByText(/Danh Mục Bài Toán Kỹ Thuật Cần Giải Quyết/i));
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Đóng gói dán nhãn/i), {
      target: { value: 'Kiểm định phôi đúc' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố/i), {
      target: { value: 'Tỷ lệ phôi rỗ khí vượt mức 4%' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Giảm 40% chi phí điện năng/i), {
      target: { value: 'Giảm tỷ lệ lỗi xuống dưới 0.5%' }
    });

    // Step 5 -> Step 6
    fireEvent.click(screen.getByText(/Tiếp tục Bước 6/i));

    // Step 6 -> Step 7
    await waitFor(() => screen.getByText('Nhu Cầu Tiếp Cận Công Nghệ Tiên Tiến Trong 3 Năm Tới'));
    fireEvent.click(screen.getByText(/Tiếp tục Bước 7/i));

    // Step 7: Sign and consent
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

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    // Verify success view
    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
      expect(screen.getByText('SUR-20261012-7A9B1C')).toBeInTheDocument();
    });
  });

  it('handles auto MST lookup and fills enterprise name, province, address (T-03.40)', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

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

  it('handles smart pre-fill for logged-in enterprises and displays sync banner (T-03.41)', async () => {
    setupFetch();
    authClient.setSession('fake-buyer-token', {
      id: 'usr-1',
      email: 'long.nh@nacentwin.vn',
      fullName: 'Nguyễn Hoàng Long',
      role: 'BUYER'
    });

    render(<DeepSurveyPage />);

    // Verify sync banner appears
    await waitFor(() => {
      expect(screen.getByText('Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký')).toBeInTheDocument();
    });

    // Verify inputs auto-populated from enterprise profile
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

    // Jump to Step 7
    fireEvent.click(screen.getByText('G. Xác Nhận'));

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
});

