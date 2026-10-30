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

  it('renders GeneralPortalDashboard with 3 blocks for PUBLIC_USER role (Delta v10 CR-2026-006)', async () => {
    vi.spyOn(authClient, 'getUser').mockReturnValue({
      id: 'u-public',
      fullName: 'Nguyễn Văn Public',
      role: 'PUBLIC_USER',
      email: 'public@guest.vn',
    });

    render(<PortalDashboard />);

    // Khối 1: Hero Banner cá nhân hóa & 2 nút CTA nhanh
    expect(screen.getByText('Xin chào, Nguyễn Văn Public!')).toBeInTheDocument();
    expect(screen.getByText('Thành viên Khám phá / Bên Mua tiềm năng')).toBeInTheDocument();
    expect(screen.getByText('Khám phá công nghệ và kết nối giải pháp đổi mới sáng tạo.')).toBeInTheDocument();

    const demandBtn = screen.getByRole('link', { name: /\+ Gửi Nhu cầu Công nghệ mới/i });
    expect(demandBtn).toBeInTheDocument();
    expect(demandBtn).toHaveAttribute('href', '/khao-sat-nhu-cau');

    const exploreBtn = screen.getByRole('link', { name: /^Khám phá Sàn Công nghệ$/i });
    expect(exploreBtn).toBeInTheDocument();
    expect(exploreBtn).toHaveAttribute('href', '/chao-ban-cong-nghe');

    // Khối 2: Lưới 3 Thẻ Mua Sắm & Khám Phá AI
    const card1 = screen.getByRole('link', { name: /Khám phá Sàn Công nghệ.*Tiếp cận hàng trăm sáng chế/i });
    expect(card1).toBeInTheDocument();
    expect(card1).toHaveAttribute('href', '/chao-ban-cong-nghe');

    const card2 = screen.getByRole('link', { name: /Nhu cầu công nghệ của Bạn/i });
    expect(card2).toBeInTheDocument();
    expect(card2).toHaveAttribute('href', '/portal/buyer/demands');

    const card3 = screen.getByRole('link', { name: /Radar Ghép Nối AI/i });
    expect(card3).toBeInTheDocument();
    expect(card3).toHaveAttribute('href', '/portal/matching/radar');
    expect(screen.getByText('Chưa kích hoạt')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Thuật toán AI tự động đối sánh và đề xuất giải pháp khi bạn gửi ít nhất 01 nhu cầu công nghệ.'
      )
    ).toBeInTheDocument();

    // Khối 3: Banner Chuyển Đổi Nâng Hạng CTA
    expect(screen.getByText('Nâng hạng Vai trò & Kết nối Pháp nhân')).toBeInTheDocument();
    const upgradeCta = screen.getByRole('link', { name: /Đăng ký Nâng hạng Vai trò/i });
    expect(upgradeCta).toBeInTheDocument();
    expect(upgradeCta).toHaveAttribute('href', '/profile/upgrade');

    // Negative assertions: 4 old generalModules must NOT exist
    expect(screen.queryByText('Gian hàng Công nghệ')).not.toBeInTheDocument();
    expect(screen.queryByText('Đánh Giá Công Nghệ (TT17)')).not.toBeInTheDocument();
    expect(screen.queryByText('Hồ Sơ Doanh Nghiệp')).not.toBeInTheDocument();
  });
});
