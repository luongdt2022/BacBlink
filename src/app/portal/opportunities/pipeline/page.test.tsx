import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import OpportunitiesPipelinePage from './page';
import { brokerageApi } from '@/services/api/brokerage';

let mockSearchParams = new URLSearchParams('');
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/services/api/brokerage', () => ({
  brokerageApi: {
    getOpportunities: vi.fn(),
    getConnectionRequests: vi.fn(),
    getConnectionRequestDetail: vi.fn(),
    updateOpportunityStage: vi.fn(),
    respondConnectionRequest: vi.fn(),
  },
}));

const mockOpportunities = [
  {
    id: 'opp-1',
    opportunityCode: 'DEAL-2026-0784',
    title: 'Hợp tác chuyển giao Dây chuyền Robot Đúc Áp Lực ADC12 Tự Động',
    buyerOrgName: 'CÔNG TY TNHH SẢN XUẤT VÀ THƯƠNG MẠI CƠ KHÍ CHÍNH XÁC',
    sellerOrgName: 'Viện Nghiên Cứu Cơ Khí (NARIME)',
    assignedExpertName: 'PGS.TS. Lê Quốc Hùng',
    stage: 'INITIATED',
    estimatedValueMillionVnd: 2400,
  },
  {
    id: 'opp-2',
    opportunityCode: 'DEAL-2026-0042',
    title: 'Hợp tác chuyển giao Dây chuyền Robot Delta phân loại nông sản AI 3D',
    buyerOrgName: 'Công ty CP Nông Nghiệp Xanh Hà Nội',
    sellerOrgName: 'Viện Cơ Điện Nông Nghiệp & Công Nghệ Sau Thu Hoạch',
    assignedExpertName: 'GS. TS. Trần Đình Long',
    stage: 'NEGOTIATING',
    estimatedValueMillionVnd: 1200,
  },
  {
    id: 'opp-3',
    opportunityCode: 'DEAL-2026-5543',
    title: 'Ký kết MOU thử nghiệm Hệ thống IoT Quan Trắc Nước Thải & Tuần Hoàn Nước',
    buyerOrgName: 'CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ NƯỚC SẠCH',
    sellerOrgName: 'Viện Công Nghệ Môi Trường - VAST',
    assignedExpertName: 'TS. Vũ Mạnh Cường',
    stage: 'MOU_SIGNED',
    estimatedValueMillionVnd: 1850,
  },
];

const mockConnectionRequests = [
  {
    id: 'req-01',
    requestCode: 'REQ-202610-A1B2C3',
    senderOrgName: 'Công ty Chế Tạo Máy Việt Thắng',
    senderRole: 'BUYER',
    receiverOrgName: 'Nhà máy Sản xuất Phụ tùng Ô tô',
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
    receiverOrgName: 'Nhà máy Sản xuất Phụ tùng Ô tô',
    offerCode: 'OFF-02',
    offerTitle: 'Bộ điều khiển IoT Gateway',
    offerTrlLevel: 7,
    message: 'Đề xuất tích hợp IoT Gateway vào nhà máy chế biến.',
    proposedBudgetRange: '800 Triệu VNĐ',
    status: 'ACCEPTED',
    createdAt: '2026-10-22T08:00:00Z',
  },
];

describe('OpportunitiesPipelinePage Component (/portal/opportunities/pipeline)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('');
    vi.mocked(brokerageApi.getOpportunities).mockResolvedValue(mockOpportunities as any);
    vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue(mockConnectionRequests as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Hero Banner, 3 KPI metric cards, and 5 Kanban columns with correct counts', async () => {
    render(<OpportunitiesPipelinePage />);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Vòng Đời Cơ Hội Hợp Tác')).toBeInTheDocument();
    });

    // Kiểm tra 3 thẻ KPI
    expect(screen.getByText(/Tổng cơ hội trong phễu/i)).toBeInTheDocument();
    expect(screen.getByText('Deal')).toBeInTheDocument();
    expect(screen.getByText(/Tổng giá trị dự kiến/i)).toBeInTheDocument();
    expect(screen.getByText(/Tỷ VNĐ/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã ký MOU \/ Hoàn thành/i)).toBeInTheDocument();

    // Kiểm tra các cột Kanban
    expect(screen.getByText('Gợi Ý AI')).toBeInTheDocument();
    expect(screen.getByText('Đã Tiếp Cận')).toBeInTheDocument();
    expect(screen.getByText('Đang Đàm Phán')).toBeInTheDocument();
    expect(screen.getByText('Đã Ký MOU')).toBeInTheDocument();
    expect(screen.getByText('Hoàn Thành')).toBeInTheDocument();

    // Kiểm tra các deal
    expect(screen.getByText('DEAL-2026-0784')).toBeInTheDocument();
    expect(screen.getByText('DEAL-2026-0042')).toBeInTheDocument();
    expect(screen.getByText('DEAL-2026-5543')).toBeInTheDocument();
  });

  it('switches to Inbound Requests tab and shows 4 sub-tabs filter with incoming connection requests', async () => {
    mockSearchParams = new URLSearchParams('tab=inbound');
    render(<OpportunitiesPipelinePage />);

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });

    // Kiểm tra 4 Sub-tabs bộ lọc trạng thái
    expect(screen.getByRole('button', { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chờ phản hồi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đã chấp thuận/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đã từ chối/i })).toBeInTheDocument();

    // Kiểm tra thông tin công nghệ mục tiêu enriched
    expect(screen.getByText(/Máy kiểm tra khuyết tật mối hàn vi mạch SMT/i)).toBeInTheDocument();
    expect(screen.getByText('Công ty Chế Tạo Máy Việt Thắng')).toBeInTheDocument();
    expect(screen.getByText(/1.5 - 2.5 tỷ đồng/i)).toBeInTheDocument();

    // Kiểm tra nút Xem chi tiết hồ sơ
    const detailButtons = screen.getAllByRole('button', { name: /Xem chi tiết hồ sơ/i });
    expect(detailButtons.length).toBe(2);

    // Kiểm tra nút phản hồi cho yêu cầu PENDING
    expect(screen.getByRole('button', { name: /Chấp Thuận & Mở Deal Room/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Từ chối$/i })).toBeInTheDocument();
  });

  it('filters connection requests when clicking on sub-tabs', async () => {
    mockSearchParams = new URLSearchParams('tab=inbound');
    render(<OpportunitiesPipelinePage />);

    await waitFor(() => {
      expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    });

    // Nhấp chọn tab 'Chờ phản hồi'
    fireEvent.click(screen.getByRole('button', { name: /Chờ phản hồi/i }));

    // Chỉ còn REQ-202610-A1B2C3 (PENDING), không còn REQ-202610-D4E5F6 (ACCEPTED)
    expect(screen.getByText('REQ-202610-A1B2C3')).toBeInTheDocument();
    expect(screen.queryByText('REQ-202610-D4E5F6')).toBeNull();

    // Nhấp chọn tab 'Đã chấp thuận'
    fireEvent.click(screen.getByRole('button', { name: /Đã chấp thuận/i }));
    expect(screen.queryByText('REQ-202610-A1B2C3')).toBeNull();
    expect(screen.getByText('REQ-202610-D4E5F6')).toBeInTheDocument();
  });

  it('allows moving an opportunity to the next stage', async () => {
    vi.mocked(brokerageApi.updateOpportunityStage).mockResolvedValue({} as any);

    render(<OpportunitiesPipelinePage />);

    await waitFor(() => {
      expect(screen.getByText('DEAL-2026-0784')).toBeInTheDocument();
    });

    // Bấm nút chuyển tiếp giai đoạn
    const nextButtons = screen.getAllByTitle('Chuyển tiếp giai đoạn kế tiếp');
    expect(nextButtons.length).toBeGreaterThan(0);
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(brokerageApi.updateOpportunityStage).toHaveBeenCalledWith('opp-1', 'NEGOTIATING');
    });
  });
});
