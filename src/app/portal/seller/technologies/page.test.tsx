import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SellerTechnologiesPage from './page';

// Mock API
vi.mock('@/services/api/technology-offer', () => ({
  fetchSellerWorkspace: vi.fn(),
}));

import { fetchSellerWorkspace } from '@/services/api/technology-offer';

describe('SellerTechnologiesPage (Scoped Inventory & Pricing Polish)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders scoped KPI cards and handles pagination controls when totalPages > 1', async () => {
    vi.mocked(fetchSellerWorkspace).mockResolvedValue({
      kpi: {
        totalOffers: 10,
        publishedOffers: 1,
        pendingOffers: 9,
        draftOffers: 0,
        successfulConnections: 18,
      },
      data: [
        {
          id: 'offer-1',
          offerCode: 'SP-DEMO-MUA-01',
          title: 'Máy kiểm tra khuyết tật mối hàn vi mạch SMT',
          sectorName: 'Cơ khí chế tạo & Tự động hóa',
          offerType: 'PRODUCT',
          hasTechTransfer: true,
          trlLevel: 8,
          pricingType: 'FIXED',
          priceAmount: 250000000,
          status: 'APPROVED',
          successfulConnections: 18,
        } as any,
        {
          id: 'offer-2',
          offerCode: 'OFF-20261021-00023',
          title: 'Robot hàn thông minh AI Vision INTECH-R1',
          sectorName: 'Nông nghiệp',
          offerType: 'DEVICE',
          hasTechTransfer: true,
          trlLevel: 7,
          pricingType: 'CONTACT',
          status: 'PENDING',
        } as any,
        {
          id: 'offer-3',
          offerCode: 'OFF-20261021-00022',
          title: 'Hồ sơ nháp công nghệ không có giá xác định',
          sectorName: 'Công nghệ tổng hợp',
          offerType: 'PRODUCT',
          hasTechTransfer: false,
          pricingType: 'FIXED',
          priceAmount: undefined, // empty price
          status: 'DRAFT',
        } as any,
      ],
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    });

    render(<SellerTechnologiesPage />);

    // Wait for load
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // total offers KPI
    });

    expect(screen.getByText('18')).toBeInTheDocument(); // successful connections KPI
    expect(screen.getByText('Máy kiểm tra khuyết tật mối hàn vi mạch SMT')).toBeInTheDocument();
    expect(screen.getByText('250 Tr')).toBeInTheDocument();

    // Verify empty price falls back to "Thỏa thuận" instead of blank
    const contactPricings = screen.getAllByText('Thỏa thuận');
    expect(contactPricings.length).toBeGreaterThanOrEqual(2);

    // Verify pagination controls are visible
    expect(screen.getByText(/Trang 1\/3/i)).toBeInTheDocument();
    expect(screen.getByText('Trang trước')).toBeInTheDocument();
    expect(screen.getByText('Trang sau')).toBeInTheDocument();

    // Click "Trang sau"
    fireEvent.click(screen.getByText('Trang sau'));
    await waitFor(() => {
      expect(fetchSellerWorkspace).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });
});
