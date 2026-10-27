import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GovDemandsPage from './page';
import { authClient } from '@/lib/auth-client';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getUser: vi.fn(),
    getToken: vi.fn().mockReturnValue('mock-token'),
  },
}));

const mockDemands = [
  {
    id: 'dmd-001',
    itemCode: 'DMD-2026-001',
    technicalProblem: 'Tự động hóa dây chuyền đóng gói bao bì sinh học',
    stageName: 'Đóng gói & Phân loại',
    budgetRange: '500 - 800 Tr',
    tniScore: 85,
    status: 'PENDING',
    createdAt: '2026-10-25T08:00:00Z',
  },
  {
    id: 'dmd-002',
    itemCode: 'DMD-2026-002',
    technicalProblem: 'Hệ thống sấy lạnh nông sản bảo tồn vi chất',
    stageName: 'Chế biến sau thu hoạch',
    budgetRange: '1.2 - 2 Tỷ',
    tniScore: 65,
    status: 'VERIFIED',
    createdAt: '2026-10-20T08:00:00Z',
  },
];

describe('T086 [FE-Gov-Screen5] GovDemandsPage Screen 5 Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authClient.getUser as any).mockReturnValue({
      id: 'user-hn-01',
      name: 'Lãnh đạo Sở KH&CN Hà Nội',
      role: 'PROVINCIAL_ADMIN',
      scopeId: 'HN',
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/gov/demands')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDemands),
        });
      }
      if (url.includes('/api/v1/gov/experts')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 'exp-real-99',
                fullName: 'GS. TS. Vũ Đình Thành',
                title: 'Chuyên gia Trưởng Tự động hóa',
                field: 'Cơ điện tử',
                organization: 'Đại học Bách Khoa Hà Nội',
                email: 'thanh.vd@hust.edu.vn',
                activeConsultationsCount: 1,
              },
            ]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders GovPageHeader with breadcrumbs, title, scope badge, and SLA chips', async () => {
    render(<GovDemandsPage />);

    expect(screen.getByText('Thẩm Định Bài Toán Kỹ Thuật & Điều Phối Chuyên Gia')).toBeInTheDocument();
    expect(screen.getByTestId('gov-sla-chip')).toBeInTheDocument();
    expect(screen.getByTestId('gov-maker-checker-chip')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('DMD-2026-001')).toBeInTheDocument();
      expect(screen.getByText('DMD-2026-002')).toBeInTheDocument();
    });

    // Resolves TNI urgency label from gov-label-resolver
    expect(screen.getByText('Cấp bách (Giải quyết trong quý)')).toBeInTheDocument();
  });

  it('filters demands by TNI urgency correctly', async () => {
    render(<GovDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('DMD-2026-001')).toBeInTheDocument();
      expect(screen.getByText('DMD-2026-002')).toBeInTheDocument();
    });

    const urgentFilterBtn = screen.getByTestId('filter-tni-urgent');
    fireEvent.click(urgentFilterBtn);

    // DMD-2026-001 has TNI 85 >= 80
    expect(screen.getByText('DMD-2026-001')).toBeInTheDocument();
    expect(screen.queryByText('DMD-2026-002')).not.toBeInTheDocument();
  });

  it('eliminates static mock UUID and selects real expert from directory modal', async () => {
    render(<GovDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('DMD-2026-001')).toBeInTheDocument();
    });

    // Click "Gán Chuyên Gia"
    const assignBtn = screen.getByTestId('btn-assign-expert-dmd-001');
    fireEvent.click(assignBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Chỉ Định Chuyên Gia Tư Vấn 1-1/i })).toBeInTheDocument();
    });

    // Expert from real API list is rendered
    await waitFor(() => {
      expect(screen.getByText('GS. TS. Vũ Đình Thành')).toBeInTheDocument();
    });

    // Select the expert
    const expertItem = screen.getByTestId('expert-item-exp-real-99');
    fireEvent.click(expertItem);

    // Confirm button is enabled and clicked
    const confirmBtn = screen.getByTestId('btn-confirm-assign-expert');
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    // Check fetch payload does NOT contain mock UUID '01a125a3-19cc-7e39-92c4-4bda036e8583'
    await waitFor(() => {
      const assignCall = (global.fetch as any).mock.calls.find((call: any[]) =>
        call[0].includes('/api/v1/gov/demands/dmd-001/assign-expert')
      );
      expect(assignCall).toBeDefined();
      const body = JSON.parse(assignCall[1].body);
      expect(body.expertId).toBe('exp-real-99');
      expect(body.expertId).not.toBe('01a125a3-19cc-7e39-92c4-4bda036e8583');
      expect(body.expertName).toBe('GS. TS. Vũ Đình Thành');
    });
  });
});
