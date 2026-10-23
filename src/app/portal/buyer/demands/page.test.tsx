import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import BuyerDemandsPage from './page';
import { authClient, ROLES } from '@/lib/auth-client';

const mockDemands = [
  {
    id: 'dmd-01',
    itemCode: 'DMD-202610-001',
    stageName: 'Đúc áp lực',
    technicalProblem: 'Khắc phục hiện tượng rỗ khí',
    sectorCode: 'LV01',
    budgetRange: '500 triệu – 1 tỷ VNĐ',
    tniScore: 85,
    tniClassification: 'VERY_HIGH',
    status: 'VERIFIED',
  },
];

const mockBookmarkedDemands = [
  {
    id: 'dmd-bm-01',
    itemCode: 'DMD-202610-BM01',
    stageName: 'Gia công CNC',
    technicalProblem: 'Tự động hóa hiệu chuẩn dao cắt bằng laser',
    sectorCode: 'LV01',
    budgetRange: '1 – 3 tỷ VNĐ',
    tniScore: 92,
    tniClassification: 'VERY_HIGH',
    status: 'VERIFIED',
    bookmarkedAt: '2026-10-22T08:00:00Z',
  },
];

describe('BuyerDemandsPage Component (/portal/buyer/demands)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authClient.setSession('test-token-jwt', {
      id: 'buyer-01',
      fullName: 'Doanh Nghiệp Buyer Demo',
      email: 'buyer@test.com',
      role: ROLES.BUYER,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    authClient.clearSession();
  });

  it('renders buyer workspace and bookmarked demands tab with untrack functionality', async () => {
    let unbookmarkCalled = false;
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return {
          ok: true,
          json: async () => mockDemands,
        } as Response;
      }
      if (url.includes('/api/v1/demands/bookmarked')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: mockBookmarkedDemands,
            total: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
          }),
        } as Response;
      }
      if (url.includes('/api/v1/demands/dmd-bm-01/bookmark') && init?.method === 'POST') {
        unbookmarkCalled = true;
        return {
          ok: true,
          json: async () => ({ isBookmarked: false, message: 'Đã bỏ lưu bài toán.' }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    render(<BuyerDemandsPage />);

    // Chờ tải danh sách ban đầu
    await waitFor(() => {
      expect(screen.getByText('Khắc phục hiện tượng rỗ khí')).toBeInTheDocument();
    });

    // Tab "Đang theo dõi" có hiển thị số lượng 1
    const bookmarkedTab = screen.getByRole('button', { name: /Đang theo dõi/i });
    expect(bookmarkedTab).toBeInTheDocument();
    expect(bookmarkedTab).toHaveTextContent('1');

    // Chuyển sang tab "Đang theo dõi"
    fireEvent.click(bookmarkedTab);

    // Bài toán đã bookmark hiển thị trên bảng
    await waitFor(() => {
      expect(screen.getByText('Tự động hóa hiệu chuẩn dao cắt bằng laser')).toBeInTheDocument();
    });

    // Nút "Bỏ theo dõi" hiển thị cho bài toán
    const untrackButton = screen.getByTitle('Hủy theo dõi bài toán này');
    expect(untrackButton).toBeInTheDocument();

    // Bấm hủy theo dõi
    fireEvent.click(untrackButton);

    await waitFor(() => {
      expect(unbookmarkCalled).toBe(true);
    });
  });

  it('renders clean subheader with zero dev badge TASK-03 and standardized title', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return {
        ok: true,
        json: async () => mockDemands,
      } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ')).toBeInTheDocument();
      expect(screen.getByText('BÊN MUA CÔNG NGHỆ')).toBeInTheDocument();
    });

    // Zero Dev Badge
    expect(screen.queryByText('TASK-03')).not.toBeInTheDocument();
  });

  it('supports pagination controls when demands exceed pageSize of 5', async () => {
    const manyDemands = Array.from({ length: 8 }, (_, i) => ({
      id: `dmd-page-${i + 1}`,
      itemCode: `DMD-PAGE-${i + 1}`,
      stageName: `Công đoạn ${i + 1}`,
      technicalProblem: `Vấn đề bài toán số ${i + 1}`,
      sectorCode: 'LV01',
      budgetRange: '500 triệu – 1 tỷ VNĐ',
      tniScore: 80,
      tniClassification: 'HIGH',
      status: 'VERIFIED',
    }));

    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return {
        ok: true,
        json: async () => manyDemands,
      } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Vấn đề bài toán số 1')).toBeInTheDocument();
      expect(screen.getByText('Vấn đề bài toán số 5')).toBeInTheDocument();
    });

    // Item 6 should NOT be on Page 1
    expect(screen.queryByText('Vấn đề bài toán số 6')).not.toBeInTheDocument();

    // Check pagination controls
    const nextPageBtn = screen.getByRole('button', { name: /Trang sau/i });
    expect(nextPageBtn).toBeInTheDocument();
    expect(nextPageBtn).not.toBeDisabled();

    // Click next page
    fireEvent.click(nextPageBtn);

    await waitFor(() => {
      expect(screen.getByText('Vấn đề bài toán số 6')).toBeInTheDocument();
      expect(screen.getByText('Vấn đề bài toán số 8')).toBeInTheDocument();
    });
    expect(screen.queryByText('Vấn đề bài toán số 1')).not.toBeInTheDocument();
  });
});
