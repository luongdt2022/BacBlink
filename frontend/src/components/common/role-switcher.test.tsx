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

describe('RoleSwitcher Component (BACLINK ENTERPRISE Dual-Mode)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockRefresh.mockReset();
    localStorage.clear();
    authClient.setSession('test-token', {
      id: 'ent-user-id',
      email: 'member@baclink.vn',
      fullName: 'Công ty TNHH Điện tử Bắc Ninh',
      role: 'ENTERPRISE',
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders dual mode switcher buttons for ENTERPRISE role', async () => {
    vi.spyOn(enterpriseClient, 'fetchMyEnterpriseProfile').mockResolvedValue({
      id: 'ent-1',
      name: 'Công ty TNHH Điện tử Bắc Ninh',
      capabilityTier: 'DUAL',
      isBuyer: true,
      isSeller: true,
      activeRole: 'BUYER',
    });

    render(<RoleSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Chế Độ Kép (Dual Mode)')).toBeInTheDocument();
      expect(screen.getByText('Bên Mua')).toBeInTheDocument();
      expect(screen.getByText('Bên Bán')).toBeInTheDocument();
    });
  });

  it('switches activeRole between BUYER and SELLER without overwriting user.role = ENTERPRISE', async () => {
    vi.spyOn(enterpriseClient, 'fetchMyEnterpriseProfile').mockResolvedValue({
      id: 'ent-1',
      name: 'Công ty TNHH Điện tử Bắc Ninh',
      capabilityTier: 'DUAL',
      isBuyer: true,
      isSeller: true,
      activeRole: 'BUYER',
    });
    const switchSpy = vi.spyOn(enterpriseClient, 'switchEnterpriseActiveRole').mockResolvedValue({
      id: 'ent-1',
      activeRole: 'SELLER',
    });

    const eventListener = vi.fn();
    window.addEventListener('nacentwin_role_switched', eventListener);

    render(<RoleSwitcher />);

    await waitFor(() => {
      expect(screen.getByText('Bên Bán')).toBeInTheDocument();
    });

    const sellerBtn = screen.getByRole('button', { name: /Bên Bán/i });
    fireEvent.click(sellerBtn);

    await waitFor(() => {
      expect(switchSpy).toHaveBeenCalledWith('SELLER');
      expect(localStorage.getItem('nacentwin_active_role')).toBe('SELLER');
      expect(authClient.getUser()?.role).toBe('ENTERPRISE');
      expect(eventListener).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });

    window.removeEventListener('nacentwin_role_switched', eventListener);
  });

  it('renders compact mode with quick pill toggle in navbar for ENTERPRISE', async () => {
    vi.spyOn(enterpriseClient, 'fetchMyEnterpriseProfile').mockResolvedValue({
      id: 'ent-1',
      name: 'Công ty TNHH Điện tử Bắc Ninh',
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
