import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BuyerDashboard } from '@/components/portal/buyer-dashboard';
import { brokerageApi } from '@/services/api/brokerage';

vi.mock('@/components/demand/QuickDemandModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="quick-demand-modal">
        <span>Modal Khai Báo Nhu Cầu Nhanh</span>
        <button onClick={onClose}>Đóng Modal</button>
      </div>
    ) : null,
}));

const mockOpportunities = [
  {
    id: 'opp-1',
    opportunityCode: 'DEAL-2026-001',
    title: 'Chuyển giao Robot Hàn Tự Động',
    sellerOrgName: 'Viện Cơ Khí NARIME',
    estimatedValueMillionVnd: 1500,
    stage: 'NEGOTIATING',
  },
  {
    id: 'opp-2',
    opportunityCode: 'DEAL-2026-002',
    title: 'Hệ thống Sấy Thăng Hoa Chân Không',
    sellerOrgName: 'Viện Công Nghệ Sau Thu Hoạch',
    estimatedValueMillionVnd: 2800,
    stage: 'MOU_SIGNED',
  },
];

const mockRadarCandidates = [
  {
    id: 'cand-1',
    demandId: 'dem-1',
    demandTitle: 'Hệ thống sấy nông sản',
    offerId: 'off-1',
    offerTitle: 'Máy sấy chân không tiết kiệm năng lượng',
    matchScore: 95,
  },
];

describe('BuyerDashboard Component (/portal for BUYER role)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/buyer/demands')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 'dmd-1',
                itemCode: 'DMD-202610-01',
                stageName: 'Gia công nhiệt luyện',
                technicalProblem: 'Hiện tượng nứt gãy vật liệu khi tăng công suất tôi cao tần',
                budgetRange: '500 triệu - 1 tỷ đồng',
                tniScore: 88,
                tniClassification: 'CẤP THIẾT',
                matchingCount: 4,
                status: 'OPEN',
              },
            ]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    vi.spyOn(brokerageApi, 'getOpportunities').mockResolvedValue(mockOpportunities as any);
    vi.spyOn(brokerageApi, 'getRadarCandidates').mockResolvedValue(mockRadarCandidates as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Executive Banner with welcome greeting and 3 quick action buttons', async () => {
    render(<BuyerDashboard user={{ id: 'u1', fullName: 'Doanh Nghiệp An Phát', role: 'BUYER', email: 'anphat@corp.vn' }} />);

    expect(await screen.findByText(/Trung Tâm Điều Hành Mua Sắm & Đổi Mới Công Nghệ/i)).toBeInTheDocument();
    expect(screen.getByText(/Xin chào, Doanh Nghiệp An Phát!/i)).toBeInTheDocument();

    // 3 Quick Action buttons
    expect(screen.getByRole('button', { name: /\+ Khai Báo Bài Toán Nhanh/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Khảo Sát Nhu Cầu \(TNI 4 Bước\)/i })).toHaveAttribute('href', '/khao-sat-nhu-cau');
    expect(screen.getByRole('link', { name: /Radar Ghép Nối AI/i })).toHaveAttribute('href', '/portal/matching/radar');
  });

  it('renders 4 KPI metric cards as living interactive links to correct workspaces', async () => {
    render(<BuyerDashboard user={null} />);

    // Wait for data load
    expect(await screen.findByText('DEAL-2026-001')).toBeInTheDocument();

    // 4 KPI Cards
    const demandCard = screen.getByRole('link', { name: /Bài Toán Đổi Mới Đang Mở/i });
    expect(demandCard).toHaveAttribute('href', '/portal/buyer/demands');

    const radarCard = screen.getByRole('link', { name: /Ứng Viên Ghép Đôi AI/i });
    expect(radarCard).toHaveAttribute('href', '/portal/matching/radar');

    const dealsCard = screen.getByRole('link', { name: /Deals Đang Trao Đổi/i });
    expect(dealsCard).toHaveAttribute('href', '/portal/opportunities/pipeline');

    const mouCard = screen.getByRole('link', { name: /Thỏa Thuận Đã Ký MOU/i });
    expect(mouCard).toHaveAttribute('href', '/portal/opportunities/pipeline');
  });

  it('renders active deals list and newest demand items with TNI score', async () => {
    render(<BuyerDashboard user={null} />);

    // Check Active Deal Widget
    expect(await screen.findByText('DEAL-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Chuyển giao Robot Hàn Tự Động')).toBeInTheDocument();
    expect(screen.getByText(/Viện Cơ Khí NARIME/i)).toBeInTheDocument();

    // Check Demand Widget
    expect(screen.getByText('DMD-202610-01')).toBeInTheDocument();
    expect(screen.getByText(/Hiện tượng nứt gãy vật liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/TNI: 88\/100/i)).toBeInTheDocument();
  });

  it('opens QuickDemandModal when clicking "+ Khai Báo Bài Toán Nhanh" button', async () => {
    render(<BuyerDashboard user={null} />);

    const quickBtn = screen.getByRole('button', { name: /\+ Khai Báo Bài Toán Nhanh/i });
    fireEvent.click(quickBtn);

    expect(await screen.findByTestId('quick-demand-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Khai Báo Nhu Cầu Nhanh')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Đóng Modal'));
    expect(screen.queryByTestId('quick-demand-modal')).not.toBeInTheDocument();
  });
});
