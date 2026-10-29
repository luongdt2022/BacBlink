import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GovOpportunitiesPage from './page';
import { brokerageApi } from '@/services/api/brokerage';
import { authClient } from '@/lib/auth-client';

vi.mock('@/services/api/brokerage', () => ({
  brokerageApi: {
    getGovOpportunities: vi.fn(),
    updateOpportunityStage: vi.fn(),
  },
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getUser: vi.fn(),
    getToken: vi.fn().mockReturnValue('mock-token'),
  },
}));

const mockGovOpportunitiesData = {
  statistics: {
    total: 2,
    suggested: 0,
    initiated: 1,
    negotiating: 1,
    mouSigned: 0,
    completed: 0,
    closedLost: 0,
    totalEstimatedValueMillionVnd: 5000,
  },
  opportunities: [
    {
      id: 'deal-1',
      opportunityCode: 'OPP-2026-001',
      title: 'Hợp tác chuyển giao giải pháp AI nhận diện sản phẩm lỗi',
      buyerOrgName: 'Công ty Cổ phần Chế tạo Máy Hải Phòng',
      buyerContactName: 'Nguyễn Văn An',
      buyerContactPhone: '0912345678',
      buyerContactEmail: 'an.nv@haiphongmach.vn',
      sellerOrgName: 'Viện Công nghệ Thông tin & Tự động hóa',
      sellerContactName: 'Trần Thị Bình',
      sellerContactPhone: '0987654321',
      sellerContactEmail: 'binh.tt@ioit.ac.vn',
      assignedExpertName: 'TS. Lê Hoàng Long',
      managingAuthorityId: 'HP',
      stage: 'NEGOTIATING',
      estimatedValueMillionVnd: 3500,
      isSlaWarning: true,
      createdAt: '2026-10-20T08:00:00Z',
      updatedAt: '2026-10-25T10:00:00Z',
    },
    {
      id: 'deal-2',
      opportunityCode: 'OPP-2026-002',
      title: 'Cung cấp hệ thống sấy nông sản thông minh tiết kiệm năng lượng',
      buyerOrgName: 'Hợp tác xã Nông nghiệp Hải Dương',
      buyerContactName: 'Vũ Quốc Cường',
      buyerContactPhone: '0901234567',
      buyerContactEmail: 'cuong.vq@htx.vn',
      sellerOrgName: 'Trung tâm Phát triển Công nghệ Cao',
      sellerContactName: 'Phạm Minh Đức',
      sellerContactPhone: '0933221100',
      sellerContactEmail: 'duc.pm@hightech.gov.vn',
      assignedExpertName: null,
      managingAuthorityId: 'HN',
      stage: 'INITIATED',
      estimatedValueMillionVnd: 1500,
      isSlaWarning: false,
      createdAt: '2026-10-24T08:00:00Z',
      updatedAt: '2026-10-26T08:00:00Z',
    },
  ],
};

describe('T085 [FE-Gov-Screen4] GovOpportunitiesPage Screen 4 Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authClient.getUser as any).mockReturnValue({
      id: 'user-hp-01',
      name: 'Lãnh đạo Sở KH&CN Hải Phòng',
      role: 'PROVINCIAL_ADMIN',
      scopeId: 'HP',
    });
    (brokerageApi.getGovOpportunities as any).mockResolvedValue(mockGovOpportunitiesData);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders GovPageHeader with breadcrumbs, title, scope badge, and SLA chips', async () => {
    render(<GovOpportunitiesPage />);

    expect(screen.getByText('Cổng Giám Sát Cung–Cầu Công Nghệ Địa Phương')).toBeInTheDocument();
    expect(screen.getByTestId('gov-sla-chip')).toBeInTheDocument();
    expect(screen.getByTestId('gov-maker-checker-chip')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('OPP-2026-001')).toBeInTheDocument();
      expect(screen.getByText('OPP-2026-002')).toBeInTheDocument();
    });

    // Resolves province name correctly
    expect(screen.getByText('Hải Phòng')).toBeInTheDocument();
  });

  it('keeps public officials in gov space without navigating away to /portal/ paths', async () => {
    const { container } = render(<GovOpportunitiesPage />);

    await waitFor(() => {
      expect(screen.getByText('OPP-2026-001')).toBeInTheDocument();
    });

    const portalLinks = container.querySelectorAll('a[href^="/portal"]');
    expect(portalLinks.length).toBe(0);
  });

  it('filters opportunities by SLA 48h breach correctly', async () => {
    render(<GovOpportunitiesPage />);

    await waitFor(() => {
      expect(screen.getByText('OPP-2026-001')).toBeInTheDocument();
      expect(screen.getByText('OPP-2026-002')).toBeInTheDocument();
    });

    const slaFilterBtn = screen.getByTestId('filter-sla-breached');
    fireEvent.click(slaFilterBtn);

    // Only OPP-2026-001 has isSlaWarning: true
    expect(screen.getByText('OPP-2026-001')).toBeInTheDocument();
    expect(screen.queryByText('OPP-2026-002')).not.toBeInTheDocument();
  });

  it('opens deal monitoring modal when clicking Giám sát Deal', async () => {
    render(<GovOpportunitiesPage />);

    await waitFor(() => {
      expect(screen.getByText('OPP-2026-001')).toBeInTheDocument();
    });

    const monitorButtons = screen.getAllByText('Giám sát Deal');
    fireEvent.click(monitorButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Giám Sát Tiến Trình Deal/i)).toBeInTheDocument();
      expect(screen.getByText(/Nguyễn Văn An/i)).toBeInTheDocument();
      expect(screen.getByText(/Trần Thị Bình/i)).toBeInTheDocument();
    });
  });

  it('allows gov officer to activate negotiation and open deal room (ADR-BROKERAGE-01)', async () => {
    (brokerageApi.updateOpportunityStage as any) = vi.fn().mockResolvedValue({
      id: 'deal-2',
      stage: 'NEGOTIATING',
    });

    render(<GovOpportunitiesPage />);

    await waitFor(() => {
      expect(screen.getByText('OPP-2026-002')).toBeInTheDocument();
    });

    const monitorButtons = screen.getAllByText('Giám sát Deal');
    // Click deal-2 (which has stage === 'INITIATED')
    fireEvent.click(monitorButtons[1]);

    await waitFor(() => {
      expect(screen.getByText(/Kích Hoạt Đàm Phán \(Mở Deal Room\)/i)).toBeInTheDocument();
    });

    const activateBtn = screen.getByText(/Kích Hoạt Đàm Phán \(Mở Deal Room\)/i);
    fireEvent.click(activateBtn);

    await waitFor(() => {
      expect(brokerageApi.updateOpportunityStage).toHaveBeenCalledWith('deal-2', 'NEGOTIATING');
    });
  });
});
