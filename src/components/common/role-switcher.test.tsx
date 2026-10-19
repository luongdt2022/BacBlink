import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { RoleSwitcher } from './role-switcher';
import { authClient } from '@/lib/auth-client';
import * as enterpriseClient from '@/lib/enterprise-client';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => '/portal',
}));

vi.mock('./toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe('RoleSwitcher Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    authClient.setSession('test-token', {
      id: 'buyer-user-id',
      email: 'buyer.user@demo.nacentech.vn',
      fullName: 'Demo Buyer',
      role: 'BUYER',
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders dual mode switcher buttons for dual capability enterprise', async () => {
    vi.spyOn(enterpriseClient, 'fetchMyEnterpriseProfile').mockResolvedValue({
      id: 'ent-1',
      name: 'Doanh Nghiệp Kép Alpha',
      capabilityTier: 'DUAL',
      isBuyer: true,
      isSeller: true,
      activeRole: 'BUYER',
    });

    render(<RoleSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Chế Độ Kép (Dual Mode)')).toBeInTheDocument();
      expect(screen.getByText('Bên Mua (Buyer)')).toBeInTheDocument();
      expect(screen.getByText('Bên Bán (Seller)')).toBeInTheDocument();
    });
  });

  it('switches role smoothly and saves active role to localStorage', async () => {
    vi.spyOn(enterpriseClient, 'fetchMyEnterpriseProfile').mockResolvedValue({
      id: 'ent-1',
      name: 'Doanh Nghiệp Kép Alpha',
      capabilityTier: 'DUAL',
      isBuyer: true,
      isSeller: true,
      activeRole: 'BUYER',
    });
    const switchSpy = vi.spyOn(enterpriseClient, 'switchEnterpriseActiveRole').mockResolvedValue({
      id: 'ent-1',
      activeRole: 'SELLER',
    });

    render(<RoleSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Bên Bán (Seller)')).toBeInTheDocument();
    });

    const sellerBtn = screen.getByRole('button', { name: /Bên Bán \(Seller\)/i });
    fireEvent.click(sellerBtn);

    await waitFor(() => {
      expect(switchSpy).toHaveBeenCalledWith('SELLER');
      expect(localStorage.getItem('nacentwin_active_role')).toBe('SELLER');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('renders compact mode with quick pill toggle in navbar', async () => {
    vi.spyOn(enterpriseClient, 'fetchMyEnterpriseProfile').mockResolvedValue({
      id: 'ent-1',
      name: 'Doanh Nghiệp Kép Alpha',
      capabilityTier: 'DUAL',
      isBuyer: true,
      isSeller: true,
      activeRole: 'BUYER',
    });

    render(<RoleSwitcher compact={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mua/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Bán/i })).toBeInTheDocument();
    });
  });
});
