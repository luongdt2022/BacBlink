import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GovApprovalsPage from './page';
import { authClient } from '@/lib/auth-client';

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getUser: vi.fn(),
    getToken: vi.fn().mockReturnValue('mock-token'),
  },
}));

vi.mock('@/components/gov/gov-approval-queue', () => ({
  default: () => <div data-testid="mock-gov-approval-queue">Bàn Làm Việc Hàng Đợi Kiểm Duyệt Toàn Màn Hình</div>,
  GovApprovalQueue: () => <div data-testid="mock-gov-approval-queue">Bàn Làm Việc Hàng Đợi Kiểm Duyệt Toàn Màn Hình</div>,
}));

describe('T088 [FE-Gov-Screen7] GovApprovalsPage Screen 7 Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authClient.getUser as any).mockReturnValue({
      id: 'admin-hn-01',
      name: 'Lãnh đạo Sở KH&CN Hà Nội',
      role: 'PROVINCIAL_ADMIN',
      scopeId: 'HN',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders GovApprovalQueue workspace full screen on /gov/approvals route', () => {
    render(<GovApprovalsPage />);

    expect(screen.getByTestId('mock-gov-approval-queue')).toBeInTheDocument();
    expect(screen.getByText('Bàn Làm Việc Hàng Đợi Kiểm Duyệt Toàn Màn Hình')).toBeInTheDocument();
  });
});
