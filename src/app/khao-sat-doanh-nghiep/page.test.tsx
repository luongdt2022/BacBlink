import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import EnterpriseSurveyPage from './page';

const mockSurveyResponse = {
  success: true,
  surveyId: 'sur-enterprise-9999',
  surveyCode: 'SUR-20261021-9B8A7C',
  createdTickets: ['DMD-20261021-B201-01'],
  message: 'Tiếp nhận phiếu khảo sát nhu cầu công nghệ thành công.'
};

const setupFetch = (override?: {
  surveyResponse?: any;
  lookupResponse?: any;
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
            name: 'Công ty Cổ phần Cơ khí Công nghệ Cao Hà Nội',
            province: 'Hà Nội',
            address: 'Lô CN-08 KCN Nam Từ Liêm, Hà Nội'
          }
        }
      } as Response;
    }
    return {
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' })
    } as Response;
  });
};

describe('EnterpriseSurveyPage Component (/khao-sat-doanh-nghiep)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders standalone header without "Điền dữ liệu mẫu (Demo)" button and without demo sync banner', () => {
    setupFetch();
    render(<EnterpriseSurveyPage />);

    expect(screen.getByText('Khảo Sát Nhu Cầu Đổi Mới Công Nghệ & Điểm Nghẽn Kỹ Thuật')).toBeInTheDocument();
    expect(screen.getByText('Lưu bản nháp')).toBeInTheDocument();
    expect(screen.getByText('Làm mới / Xóa nháp')).toBeInTheDocument();

    // Verify demo buttons and demo text banners are strictly removed
    expect(screen.queryByText(/Điền dữ liệu mẫu/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/demo\.nacentech\.vn/i)).not.toBeInTheDocument();

    // Verify Step 1 TNI Engine section is present
    expect(screen.getByText(/BƯỚC 1\.1 • DEMAND TICKETS & TNI ENGINE/i)).toBeInTheDocument();
  });

  it('allows filling real enterprise demand data and calculates TNI in real-time', () => {
    setupFetch();
    render(<EnterpriseSurveyPage />);

    const techNameInput = screen.getByPlaceholderText(/Ứng dụng KH&CN xây dựng mô hình/i);
    fireEvent.change(techNameInput, { target: { value: 'Dây chuyền tự động đóng gói trà túi lọc' } });
    expect(techNameInput).toHaveValue('Dây chuyền tự động đóng gói trà túi lọc');

    // Verify TNI score badge and title are displayed
    expect(screen.getByText('Technology Need Index')).toBeInTheDocument();
    expect(screen.getByText('(TNI)')).toBeInTheDocument();
    expect(screen.getByText(/\/100/i)).toBeInTheDocument();
  });

  it('completes multi-step survey submission to backend API and displays survey code and ticket code', async () => {
    const fetchSpy = setupFetch();
    render(<EnterpriseSurveyPage />);

    // Step 1: Điền thông tin nhu cầu công nghệ
    fireEvent.change(screen.getByPlaceholderText(/Đúc và Nhiệt luyện kim loại/i), {
      target: { value: 'Gia công & Hàn kết cấu' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Mô tả cụ thể sự cố, tỷ lệ phế phẩm/i), {
      target: { value: 'Mối hàn thủ công không đồng đều, năng suất thấp' }
    });

    // Click Tiếp tục Bước 2
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục Bước 2/i }));

    // Step 2: Nhập thông tin doanh nghiệp
    await waitFor(() => {
      expect(screen.getByText('Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất')).toBeInTheDocument();
    });

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

    // Step 2 -> Step 3 (Hoặc bỏ qua sang Bước 4)
    fireEvent.click(screen.getByRole('button', { name: /Bỏ qua bước tùy chọn & Đến nộp phiếu/i }));

    // Step 4: Xác nhận và nộp
    await waitFor(() => {
      expect(screen.getByText(/Bản Tóm Tắt Phiếu Khảo Sát/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Người ký xác nhận/i), {
      target: { value: 'Lê Văn Nam' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Chức vụ người ký/i), {
      target: { value: 'Giám đốc Điều hành' }
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

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Hoàn Tất & Nộp Khảo Sát/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/v1/demands/surveys',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    // Check success screen
    await waitFor(() => {
      expect(screen.getByText('Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!')).toBeInTheDocument();
      expect(screen.getByText('SUR-20261021-9B8A7C')).toBeInTheDocument();
      expect(screen.getByText('DMD-20261021-B201-01')).toBeInTheDocument();
    });
  });
});
