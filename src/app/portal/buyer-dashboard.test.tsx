import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BuyerDashboard } from '@/components/portal/buyer-dashboard';
import { brokerageApi } from '@/services/api/brokerage';
import { authClient } from '@/lib/auth-client';

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

  it('renders Executive Banner with welcome greeting and quick action buttons', async () => {
    render(<BuyerDashboard user={{ id: 'u1', fullName: 'Doanh Nghiệp An Phát', role: 'BUYER', email: 'anphat@corp.vn' }} />);

    expect(await screen.findByText(/Trung Tâm Điều Hành Mua Sắm & Kết Nối Công Nghệ/i)).toBeInTheDocument();
    expect(screen.getByText(/Xin chào, Doanh Nghiệp An Phát!/i)).toBeInTheDocument();

    // 3 Quick Action buttons
    const quickBtn = screen.getByRole('button', { name: /\+ Khai Báo Bài Toán Nhanh/i });
    expect(quickBtn).toBeInTheDocument();
    expect(quickBtn.className).toContain('bg-white');
    expect(quickBtn.className).toContain('text-brand-700');
    expect(screen.queryByRole('link', { name: /Khảo Sát Nhu Cầu \(TNI 4 Bước\)/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Radar Ghép Nối AI/i })).toHaveAttribute('href', '/portal/matching/radar');
  });

  it('renders 4 KPI metric cards as living interactive links to correct workspaces', async () => {
    render(<BuyerDashboard user={null} />);

    // Wait for data load
    expect(await screen.findByText('DEAL-2026-001')).toBeInTheDocument();

    // 4 KPI Cards
    const demandCard = screen.getByRole('link', { name: /Nhu Cầu Đang Tìm Cung/i });
    expect(demandCard).toHaveAttribute('href', '/portal/buyer/demands');

    const radarCard = screen.getByRole('link', { name: /Giải Pháp AI Gợi Ý/i });
    expect(radarCard).toHaveAttribute('href', '/portal/matching/radar');

    const dealsCard = screen.getByRole('link', { name: /Giao Dịch Đang Đàm Phán/i });
    expect(dealsCard).toHaveAttribute('href', '/portal/opportunities/pipeline');

    const mouCard = screen.getByRole('link', { name: /Thỏa Thuận Đã Ký MOU/i });
    expect(mouCard).toHaveAttribute('href', '/portal/opportunities/pipeline');
  });

  it('counts active DB demand statuses (PENDING, VERIFIED) with Bearer token and excludes CLOSED demands', async () => {
    vi.spyOn(authClient, 'getToken').mockReturnValue('jwt-buyer-token');
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/api/v1/buyer/demands')) {
        expect((init?.headers as Record<string, string>)?.Authorization).toBe('Bearer jwt-buyer-token');
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 'd1', itemCode: 'DMD-1', stageName: 'S1', technicalProblem: 'P1', sectorCode: 'LV01', budgetRange: '100M', tniScore: 80, tniClassification: 'HIGH', status: 'VERIFIED' },
              { id: 'd2', itemCode: 'DMD-2', stageName: 'S2', technicalProblem: 'P2', sectorCode: 'LV01', budgetRange: '200M', tniScore: 70, tniClassification: 'HIGH', status: 'PENDING' },
              { id: 'd3', itemCode: 'DMD-3', stageName: 'S3', technicalProblem: 'P3', sectorCode: 'LV01', budgetRange: '300M', tniScore: 60, tniClassification: 'MED', status: 'CLOSED' },
            ]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<BuyerDashboard user={{ id: 'u1', fullName: 'Demo Buyer', role: 'BUYER', email: 'buyer@corp.vn' }} />);

    const demandCard = await screen.findByRole('link', { name: /Nhu Cầu Đang Tìm Cung/i });
    expect(demandCard).toHaveTextContent('2');
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
    expect(screen.getByText(/Gia công nhiệt luyện/i)).toBeInTheDocument();
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
