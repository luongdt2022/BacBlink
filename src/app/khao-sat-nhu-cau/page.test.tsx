import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import DeepSurveyPage from './page';
import { calculateTniScore, getTniBadge } from './types';

const mockSurveyResponse = {
  success: true,
  surveyId: 'sur-uuid-1234',
  surveyCode: 'SUR-20261012-7A9B1C',
  createdTickets: ['DMD-20261012-A101-01', 'DMD-20261012-A101-02'],
  message: 'Tiếp nhận phiếu khảo sát nhu cầu công nghệ thành công.'
};

const setupFetch = () => {
  return vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/v1/demands/surveys')) {
      return {
        ok: true,
        json: async () => mockSurveyResponse
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

  it('renders Step 1 (Phần A: Thông Tin Doanh Nghiệp) with all required fields and stepper bar', () => {
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

    // Form inputs in Step 1
    expect(screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/0108992134/i)).toBeInTheDocument();
  });

  it('calculates TNI score correctly based on PO-DEC-20261008-01 formula', () => {
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

  it('navigates between steps when inputs are valid', async () => {
    render(<DeepSurveyPage />);

    // Fill required Step 1 fields
    const companyInput = screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i);
    const taxInput = screen.getByPlaceholderText(/0108992134/i);
    const contactInput = screen.getByPlaceholderText(/Họ và tên người đại diện/i);
    const phoneInput = screen.getByPlaceholderText(/0912 xxx xxx/i);
    const emailInput = screen.getByPlaceholderText(/contact@company.com.vn/i);

    fireEvent.change(companyInput, { target: { value: 'Công ty TNHH Thử Nghiệm Alpha' } });
    fireEvent.change(taxInput, { target: { value: '0109998888' } });
    fireEvent.change(contactInput, { target: { value: 'Nguyễn Văn Test' } });
    fireEvent.change(phoneInput, { target: { value: '0988776655' } });
    fireEvent.change(emailInput, { target: { value: 'alpha@test.vn' } });

    // Click "Tiếp tục Bước 2"
    const nextBtn = screen.getByText(/Tiếp tục Bước 2/i);
    fireEvent.click(nextBtn);

    // Verify Step 2 is active
    await waitFor(() => {
      expect(screen.getByText('Danh Mục Thiết Bị & Dây Chuyền Sản Xuất Chủ Lực')).toBeInTheDocument();
      expect(screen.getByText('Đánh Giá Hiện Trạng Trình Độ Công Nghệ (Thang 1–5)')).toBeInTheDocument();
    });
  });

  it('submits full 7-step survey and displays success result view', async () => {
    setupFetch();
    render(<DeepSurveyPage />);

    // Step 1: Fill company info
    fireEvent.change(screen.getByPlaceholderText(/Công ty Cổ phần Cơ điện/i), { target: { value: 'Công ty Chế Tạo Máy Việt' } });
    fireEvent.change(screen.getByPlaceholderText(/0108992134/i), { target: { value: '0101234567' } });
    fireEvent.change(screen.getByPlaceholderText(/Họ và tên người đại diện/i), { target: { value: 'Trần Kỹ Thuật' } });
    fireEvent.change(screen.getByPlaceholderText(/0912 xxx xxx/i), { target: { value: '0901234567' } });
    fireEvent.change(screen.getByPlaceholderText(/contact@company.com.vn/i), { target: { value: 'tech@vietmachine.vn' } });

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

    // Step 7: Fill confirmation name and submit
    await waitFor(() => screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i));
    const confirmNameInput = screen.getByPlaceholderText(/Người ký xác nhận/i);
    fireEvent.change(confirmNameInput, { target: { value: 'Trần Kỹ Thuật' } });

    // Click submit
    const submitBtn = screen.getByText(/Hoàn Tất & Nộp Khảo Sát/i);
    fireEvent.click(submitBtn);

    // Verify success view
    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
      expect(screen.getByText('SUR-20261012-7A9B1C')).toBeInTheDocument();
      expect(screen.getByText('DMD-20261012-A101-01')).toBeInTheDocument();
    });
  });
});
