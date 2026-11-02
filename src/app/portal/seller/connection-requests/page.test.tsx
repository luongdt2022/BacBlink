import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import SellerConnectionRequestsPage from './page';
import { brokerageApi } from '@/services/api/brokerage';
import { authClient } from '@/lib/auth-client';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/services/api/brokerage', () => ({
  brokerageApi: {
    getConnectionRequests: vi.fn(),
    respondConnectionRequest: vi.fn(),
  },
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getUser: vi.fn(),
  },
}));

vi.mock('@/components/common/toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock ConnectionRequestDetailModal to test modal triggering without rendering its full internals
vi.mock('@/app/portal/opportunities/pipeline/ConnectionRequestDetailModal', () => ({
  default: ({ isOpen, requestId, onClose, onResponded }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="detail-modal">
        <span>Modal Detail for {requestId}</span>
        <button type="button" onClick={onClose}>
          Đóng Modal
        </button>
        <button
          type="button"
          onClick={() => onResponded({ requestId, status: 'ACCEPTED', createdOpportunityId: 'opp-new-99' })}
        >
          Mock Chấp Thuận Trong Modal
        </button>
      </div>
    );
  },
}));

const mockConnectionRequests = [
  {
    id: 'req-01',
    requestCode: 'REQ-202610-A1B2C3',
    senderOrgName: 'Công ty Chế Tạo Máy Việt Thắng',
    senderRole: 'BUYER',
    receiverOrgName: 'Viện Cơ Điện Nông Nghiệp',
    offerCode: 'SP-DEMO-MUA-01',
    offerTitle: 'Máy kiểm tra khuyết tật mối hàn vi mạch SMT',
    offerTrlLevel: 8,
    message: 'Chúng tôi có giải pháp khuôn đúc và robot gắp phôi tự động phù hợp với bài toán của Quý đơn vị.',
    proposedBudgetRange: '1.5 - 2.5 tỷ đồng',
    status: 'PENDING',
    createdAt: '2026-10-21T08:00:00Z',
  },
  {
    id: 'req-02',
    requestCode: 'REQ-202610-D4E5F6',
    senderOrgName: 'CÔNG TY TNHH TRƯỜNG HOAN',
    senderRole: 'BUYER',
    receiverOrgName: 'Viện Cơ Điện Nông Nghiệp',
    offerCode: 'OFF-02',
    offerTitle: 'Bộ điều khiển IoT Gateway',
    offerTrlLevel: 7,
    message: 'Đề xuất tích hợp IoT Gateway vào nhà máy chế biến.',
    proposedBudgetRange: '800 Triệu VNĐ',
    status: 'ACCEPTED',
    createdAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'req-03',
    requestCode: 'REQ-202610-G7H8I9',
    senderOrgName: 'Tập đoàn Công nghệ Alpha',
    senderRole: 'BUYER',
    receiverOrgName: 'Viện Cơ Điện Nông Nghiệp',
    message: 'Hỏi thăm thông tin hợp tác nghiên cứu.',
    proposedBudgetRange: '500 Triệu VNĐ',
    status: 'REJECTED',
    createdAt: '2026-10-23T08:00:00Z',
  },
];

describe('SellerConnectionRequestsPage Component (/portal/seller/connection-requests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authClient.getUser).mockReturnValue({
      id: 'seller-user-1',
      email: 'seller@example.com',
      fullName: 'Trần Văn Seller',
      organizationName: 'Viện Cơ Điện Nông Nghiệp',
      role: 'SELLER',
    });
    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue(mockConnectionRequests as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Hero Banner, 3 KPI metric cards, and 4 status filter tabs with correct counts', async () => {
    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('Hộp Thư Tiếp Nhận Yêu Cầu Kết Nối')).toBeInTheDocument();
    });

    // 1. Kiểm tra 3 thẻ KPI
    expect(screen.getByText('Tổng Yêu Cầu Kết Nối Đến')).toBeInTheDocument();
    expect(screen.getByText('Đang Chờ Phản Hồi')).toBeInTheDocument();
    expect(screen.getByText('Đã Chấp Thuận Kết Nối')).toBeInTheDocument();

    // 2. Kiểm tra 4 Tabs bộ lọc
    expect(screen.getByRole('button', { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chờ phản hồi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đã chấp thuận/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đã từ chối/i })).toBeInTheDocument();

    // 3. Kiểm tra danh sách cards
    expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    expect(screen.getByText('REQ-202610-D4E5F6')).toBeInTheDocument();
    expect(screen.getByText('REQ-202610-G7H8I9')).toBeInTheDocument();

    // Kiểm tra thông tin enriched
    expect(screen.getByText(/Máy kiểm tra khuyết tật mối hàn vi mạch SMT/i)).toBeInTheDocument();
    expect(screen.getByText('Công ty Chế Tạo Máy Việt Thắng')).toBeInTheDocument();
    expect(screen.getByText(/1.5 - 2.5 tỷ đồng/i)).toBeInTheDocument();
  });

  it('filters requests when clicking on sub-tabs', async () => {
    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });

    // Lọc theo 'Chờ phản hồi' (PENDING)
    fireEvent.click(screen.getByRole('button', { name: /Chờ phản hồi/i }));
    expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    expect(screen.queryByText('REQ-202610-D4E5F6')).toBeNull();
    expect(screen.queryByText('REQ-202610-G7H8I9')).toBeNull();

    // Lọc theo 'Đã chấp thuận' (ACCEPTED)
    fireEvent.click(screen.getByRole('button', { name: /Đã chấp thuận/i }));
    expect(screen.queryByText('REQ-202610-A1B2C3')).toBeNull();
    expect(screen.getByText('REQ-202610-D4E5F6')).toBeInTheDocument();
    expect(screen.queryByText('REQ-202610-G7H8I9')).toBeNull();

    // Lọc theo 'Đã từ chối' (REJECTED)
    fireEvent.click(screen.getByRole('button', { name: /Đã từ chối/i }));
    expect(screen.queryByText('REQ-202610-A1B2C3')).toBeNull();
    expect(screen.queryByText('REQ-202610-D4E5F6')).toBeNull();
    expect(screen.getByText('REQ-202610-G7H8I9')).toBeInTheDocument();
  });

  it('opens detail modal when clicking "Xem chi tiết hồ sơ"', async () => {
    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole('button', { name: /Xem chi tiết hồ sơ/i });
    fireEvent.click(detailButtons[0]);

    expect(screen.getByTestId('detail-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Detail for req-01')).toBeInTheDocument();

    // Đóng modal
    fireEvent.click(screen.getByText('Đóng Modal'));
    expect(screen.queryByTestId('detail-modal')).toBeNull();
  });

  it('handles Accepting a connection request and redirects to Deal Room', async () => {
    vi.mocked(brokerageApi.respondConnectionRequest).mockResolvedValue({
      requestId: 'req-01',
      status: 'ACCEPTED',
      createdOpportunityId: 'opp-auto-123',
    });

    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Chấp Thuận & Mở Deal Room/i });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(brokerageApi.respondConnectionRequest).toHaveBeenCalledWith('req-01', 'ACCEPT');
      expect(mockPush).toHaveBeenCalledWith('/portal/opportunities/opp-auto-123/deal-room');
    });
  });

  it('handles Rejecting a connection request', async () => {
    vi.mocked(brokerageApi.respondConnectionRequest).mockResolvedValue({
      requestId: 'req-01',
      status: 'REJECTED',
    });

    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole('button', { name: /^Từ chối$/i });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(brokerageApi.respondConnectionRequest).toHaveBeenCalledWith('req-01', 'REJECT');
    });
  });

  it('displays empty state illustration when list has no records', async () => {
    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue([]);

    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('Chưa có yêu cầu kết nối nào gửi đến bạn')).toBeInTheDocument();
    });
  });

  it('displays error message and allows retry when API fails', async () => {
    vi.mocked(brokerageApi.getConnectionRequests).mockRejectedValue(new Error('Lỗi máy chủ nội bộ 500'));

    render(<SellerConnectionRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('Không thể tải danh sách yêu cầu')).toBeInTheDocument();
      expect(screen.getByText('Lỗi máy chủ nội bộ 500')).toBeInTheDocument();
    });

    // Bấm nút thử lại
    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue(mockConnectionRequests as any);
    fireEvent.click(screen.getByRole('button', { name: /Thử lại ngay/i }));

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });
  });
});
