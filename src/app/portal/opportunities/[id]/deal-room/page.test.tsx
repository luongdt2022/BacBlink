import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import DealRoomPage from './page';
import { brokerageApi } from '@/services/api/brokerage';

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/components/common/toast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'opp-100' }),
}));

vi.mock('@/components/enterprise/SectorBannerBackground', () => ({
  SectorBannerBackground: () => <div data-testid="sector-banner-bg" />,
}));

const mockDealRoomData = {
  opportunity: {
    id: 'opp-100',
    opportunityCode: 'DEAL-2026-0100',
    demandId: 'dem-1',
    offerId: 'off-1',
    buyerOrganizationId: 'org-buyer-1',
    buyerOrgName: 'Công Ty Sản Xuất Cơ Khí Chính Xác',
    buyerContactName: 'Nguyễn Văn Mua',
    buyerContactPhone: '0912345678',
    buyerContactEmail: 'mua@cokhichinhxac.vn',
    sellerOrganizationId: 'org-seller-1',
    sellerOrgName: 'Viện Nghiên Cứu Cơ Khí',
    sellerContactName: 'Trần Văn Bán',
    sellerContactPhone: '0987654321',
    sellerContactEmail: 'ban@viennarime.gov.vn',
    assignedExpertId: 'exp-1',
    assignedExpertName: 'PGS.TS. Lê Quốc Hùng',
    stage: 'NEGOTIATION',
    title: 'Hợp tác chuyển giao Dây chuyền Robot Đúc Áp Lực ADC12',
    estimatedValueMillionVnd: 2500,
    expectedClosingDate: '2026-11-30',
    createdAt: '2026-10-15T08:00:00Z',
  },
  discussions: [
    {
      id: 'disc-1',
      senderName: 'Trần Văn Bán',
      senderRole: 'SELLER',
      message: 'Chúng tôi sẵn sàng cử đoàn kỹ thuật sang khảo sát mặt bằng tuần tới.',
      sentAt: '2026-10-16T09:00:00Z',
    },
  ],
  mou: null,
};

describe('DealRoomPage Component (/portal/opportunities/[id]/deal-room)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    vi.spyOn(brokerageApi, 'getDealRoomDetails').mockResolvedValue(mockDealRoomData as any);
    vi.spyOn(brokerageApi, 'postDealDiscussion').mockResolvedValue({
      id: 'disc-2',
      senderName: 'Kỹ sư Vũ Quang Hải',
      senderRole: 'BUYER',
      message: 'Bên mua đồng ý lịch khảo sát.',
      sentAt: '2026-10-16T10:00:00Z',
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Deal Room header and participant parties with unmasked PDPD contacts', async () => {
    render(<DealRoomPage />);

    expect(await screen.findByText(/Phòng Đàm Phán & Chuyển Giao 1-1/i)).toBeInTheDocument();
    expect(screen.getAllByText('DEAL-2026-0100').length).toBeGreaterThan(0);

    // Check Buyer and Seller organization names
    expect(screen.getByText('Công Ty Sản Xuất Cơ Khí Chính Xác')).toBeInTheDocument();
    expect(screen.getByText('Viện Nghiên Cứu Cơ Khí')).toBeInTheDocument();
    expect(screen.getByText(/0912345678/)).toBeInTheDocument();
    expect(screen.getByText(/0987654321/)).toBeInTheDocument();
  });

  it('submits discussion message and invokes toast.success without window.alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DealRoomPage />);

    expect(await screen.findByText(/Phòng Đàm Phán & Chuyển Giao 1-1/i)).toBeInTheDocument();

    // Enter discussion message
    const textarea = screen.getByPlaceholderText(/Nhập nội dung trao đổi, câu hỏi kỹ thuật/i);
    fireEvent.change(textarea, { target: { value: 'Bên mua đồng ý lịch khảo sát.' } });

    // Submit form
    const sendBtn = screen.getByRole('button', { name: /Gửi/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(brokerageApi.postDealDiscussion).toHaveBeenCalledWith('opp-100', {
        senderName: 'Kỹ sư Vũ Quang Hải',
        senderRole: 'BUYER',
        message: 'Bên mua đồng ý lịch khảo sát.',
      });
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Đã gửi thông điệp đàm phán thành công.',
        'Gửi Tin Nhắn'
      );
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });
});
