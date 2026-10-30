import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ConnectionRequestDetailModal from './ConnectionRequestDetailModal';
import { brokerageApi } from '@/services/api/brokerage';
import { ConnectionRequestDetail } from '@/types/brokerage';

vi.mock('@/services/api/brokerage', () => ({
  brokerageApi: {
    getConnectionRequestDetail: vi.fn(),
    respondConnectionRequest: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockDetailPending: ConnectionRequestDetail = {
  id: 'req-001',
  requestCode: 'REQ-20261030-E4128A',
  status: 'PENDING',
  rejectionReason: null,
  message: 'Chúng tôi đang tìm kiếm giải pháp kiểm tra khuyết tật mối hàn SMT tự động cho dây chuyền sản xuất bo mạch.',
  proposedBudgetRange: '1.2 - 1.5 Tỷ VNĐ',
  createdAt: '2026-10-30T08:10:51.274Z',
  respondedAt: null,
  slaDeadline: '2026-11-01T08:40:32.147Z',
  isSlaWarning: false,
  createdOpportunityId: null,
  createdOpportunityCode: null,
  targetOffer: {
    offerId: 'offer-smt-01',
    offerCode: 'SP-DEMO-MUA-01',
    offerTitle: 'Máy kiểm tra khuyết tật mối hàn vi mạch SMT tự động tích hợp AI Vision Nacen-Check 4.0',
    trlLevel: 8,
    trlStage: 'Commercial',
    ipStatus: 'PATENT_GRANTED',
    sectorCode: 'LV05',
    sectorName: 'Cơ khí chế tạo & Tự động hóa',
    priceMillionVnd: 250,
  },
  buyerProfile: {
    enterpriseId: 'ent-buyer-01',
    buyerOrganizationId: 'ent-buyer-01',
    companyName: 'CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN',
    taxCode: '0108992134',
    industry: 'Cơ khí chế tạo, tự động hóa',
    provinceCode: 'HN',
    provinceName: 'Hà Nội',
    address: 'Cụm CN vừa và nhỏ Từ Liêm, Minh Khai, Bắc Từ Liêm, Hà Nội',
    scaleCategory: '50-dưới 100 người',
    employeeCountRange: 80,
  },
  contactInfo: {
    contactPersonName: 'Trần Tiến Dũng',
    phoneNumber: '09**** 432',
    email: 's***r@demo.nacentech.vn',
    identityNumber: '[Được bảo vệ theo NĐ 13/2023/NĐ-CP]',
    isMasked: true,
    pdpdNotice: 'Số điện thoại và Email được bảo vệ theo Nghị định 13/2023/NĐ-CP (PDPD) cho đến khi Bên Bán chấp thuận kết nối.',
  },
};

const mockDetailAccepted: ConnectionRequestDetail = {
  ...mockDetailPending,
  status: 'ACCEPTED',
  createdOpportunityId: 'opp-deal-01',
  createdOpportunityCode: 'DEAL-2026-A1B2',
  contactInfo: {
    contactPersonName: 'Trần Tiến Dũng',
    phoneNumber: '0987654321',
    email: 'seller@demo.nacentech.vn',
    identityNumber: null,
    isMasked: false,
    pdpdNotice: 'Thông tin liên hệ đã được mở khóa do yêu cầu kết nối đã được chấp thuận.',
  },
};

describe('ConnectionRequestDetailModal Component (UI-CONN-REQ-DETAIL-001)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConnectionRequestDetailModal
        isOpen={false}
        requestId="req-001"
        onClose={vi.fn()}
        onResponded={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('fetches and renders all 3 structured blocks with PDPD masking in PENDING state', async () => {
    vi.mocked(brokerageApi.getConnectionRequestDetail).mockResolvedValue(mockDetailPending);

    render(
      <ConnectionRequestDetailModal
        isOpen={true}
        requestId="req-001"
        onClose={vi.fn()}
        onResponded={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('REQ-20261030-E4128A')).toBeInTheDocument();
    });

    // Khối 1: Công nghệ mục tiêu
    expect(screen.getByText(/Máy kiểm tra khuyết tật mối hàn vi mạch SMT/i)).toBeInTheDocument();
    expect(screen.getByText(/TRL 8 • Commercial/i)).toBeInTheDocument();
    expect(screen.getByText(/SP-DEMO-MUA-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Cơ khí chế tạo & Tự động hóa/i)).toBeInTheDocument();

    // Khối 2: Hồ sơ pháp nhân bên mua
    expect(screen.getByText('CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN')).toBeInTheDocument();
    expect(screen.getByText('0108992134')).toBeInTheDocument();
    expect(screen.getByText(/Cụm CN vừa và nhỏ Từ Liêm/i)).toBeInTheDocument();

    // Khối 3: Đề xuất & Bảo vệ PDPD
    expect(screen.getByText('1.2 - 1.5 Tỷ VNĐ')).toBeInTheDocument();
    expect(screen.getByText(/Bảo vệ dữ liệu cá nhân theo Nghị định 13\/2023\/NĐ-CP/i)).toBeInTheDocument();
    expect(screen.getByText(/09\*\*\*\* 432/i)).toBeInTheDocument();
    expect(screen.getByText(/s\*\*\*r@demo\.nacentech\.vn/i)).toBeInTheDocument();

    // Action buttons khi PENDING
    expect(screen.getByRole('button', { name: /Chấp Thuận & Mở Deal Room/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Từ chối yêu cầu/i })).toBeInTheDocument();
  });

  it('handles rejection flow with validation constraint >= 10 characters', async () => {
    vi.mocked(brokerageApi.getConnectionRequestDetail).mockResolvedValue(mockDetailPending);
    vi.mocked(brokerageApi.respondConnectionRequest).mockResolvedValue({
      requestId: 'req-001',
      status: 'REJECTED',
    } as any);

    const onRespondedMock = vi.fn();

    render(
      <ConnectionRequestDetailModal
        isOpen={true}
        requestId="req-001"
        onClose={vi.fn()}
        onResponded={onRespondedMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Từ chối yêu cầu/i })).toBeInTheDocument();
    });

    // Mở form từ chối
    fireEvent.click(screen.getByRole('button', { name: /Từ chối yêu cầu/i }));

    const textarea = screen.getByPlaceholderText(/Ví dụ: Công nghệ hiện tại chưa phù hợp/i);
    expect(textarea).toBeInTheDocument();

    const submitRejectBtn = screen.getByRole('button', { name: /Xác Nhận Từ Chối/i });
    expect(submitRejectBtn).toBeDisabled();

    // Nhập lý do quá ngắn (< 10 ký tự, ví dụ 7 ký tự)
    fireEvent.change(textarea, { target: { value: 'Từ chối' } });
    expect(submitRejectBtn).toBeDisabled();

    // Nhập lý do đầy đủ >= 10 ký tự
    fireEvent.change(textarea, {
      target: { value: 'Công nghệ chưa tương thích với quy chuẩn sản xuất của đơn vị chúng tôi.' },
    });
    expect(submitRejectBtn).not.toBeDisabled();

    // Bấm xác nhận từ chối
    fireEvent.click(submitRejectBtn);

    await waitFor(() => {
      expect(brokerageApi.respondConnectionRequest).toHaveBeenCalledWith(
        'req-001',
        'REJECT',
        undefined,
        'Công nghệ chưa tương thích với quy chuẩn sản xuất của đơn vị chúng tôi.'
      );
      expect(onRespondedMock).toHaveBeenCalled();
    });
  });

  it('renders unmasked contact details and Deal Room CTA in ACCEPTED state', async () => {
    vi.mocked(brokerageApi.getConnectionRequestDetail).mockResolvedValue(mockDetailAccepted);

    render(
      <ConnectionRequestDetailModal
        isOpen={true}
        requestId="req-001"
        onClose={vi.fn()}
        onResponded={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/DEAL-2026-A1B2/i)).toBeInTheDocument();
    });

    // Thông tin thật đã unmask
    expect(screen.getByText(/0987654321/i)).toBeInTheDocument();
    expect(screen.getByText(/seller@demo\.nacentech\.vn/i)).toBeInTheDocument();
    expect(screen.getByText(/Truy Cập Deal Room 1-1/i)).toBeInTheDocument();
  });
});
