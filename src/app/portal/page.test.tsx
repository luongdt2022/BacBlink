import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import PortalDashboard from './page';
import { authClient } from '@/lib/auth-client';

vi.mock('@/components/portal/buyer-dashboard', () => ({
  BuyerDashboard: ({ user }: { user: any }) => (
    <div data-testid="buyer-dashboard-mock">
      <h2>Buyer Dashboard Mock: {user?.fullName || 'Anonymous'}</h2>
      <button>+ Khai Báo Bài Toán Nhanh</button>
      <a href="/portal/buyer/demands">Bài Toán Đổi Mới Đang Mở</a>
    </div>
  ),
}));

vi.mock('@/components/portal/seller-dashboard', () => ({
  SellerDashboard: ({ user }: { user: any }) => (
    <div data-testid="seller-dashboard-mock">
      <h2>Seller Dashboard Mock: {user?.fullName || 'Anonymous'}</h2>
    </div>
  ),
}));

vi.mock('@/components/expert-detail/expert-dashboard', () => ({
  ExpertDashboard: () => (
    <div data-testid="expert-dashboard-mock">
      <h2>Expert Dashboard Mock</h2>
    </div>
  ),
}));

describe('PortalDashboard Component (Role-based Routing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders BuyerDashboard when active role is BUYER in localStorage', async () => {
    localStorage.setItem('nacentwin_active_role', 'BUYER');
    vi.spyOn(authClient, 'getUser').mockReturnValue({
      id: 'u-buyer',
      fullName: 'Doanh Nghiệp Mua Demo',
      role: 'BUYER',
      email: 'buyer@corp.vn',
    });

    render(<PortalDashboard />);

    expect(await screen.findByTestId('buyer-dashboard-mock')).toBeInTheDocument();
    expect(screen.getByText(/Buyer Dashboard Mock: Doanh Nghiệp Mua Demo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Khai Báo Bài Toán Nhanh/i })).toBeInTheDocument();
  });

  it('renders SellerDashboard when active role is SELLER in localStorage', async () => {
    localStorage.setItem('nacentwin_active_role', 'SELLER');
    vi.spyOn(authClient, 'getUser').mockReturnValue({
      id: 'u-seller',
      fullName: 'Nhà Cung Ứng Demo',
      role: 'SELLER',
      email: 'seller@corp.vn',
    });

    render(<PortalDashboard />);

    expect(await screen.findByTestId('seller-dashboard-mock')).toBeInTheDocument();
    expect(screen.getByText(/Seller Dashboard Mock: Nhà Cung Ứng Demo/i)).toBeInTheDocument();
  });
});
