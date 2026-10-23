import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SellerTechnologiesPage from './seller/technologies/page';
import EnterpriseOwnerProfilePage from './enterprise/profile/page';

// Mock dependencies
vi.mock('@/services/api/technology-offer', () => ({
  fetchSellerWorkspace: vi.fn().mockResolvedValue({
    kpi: {
      totalOffers: 3,
      publishedOffers: 2,
      pendingOffers: 1,
      successfulConnections: 0,
    },
    data: [
      {
        id: 'tech-1',
        offerCode: 'TECH-001',
        title: 'Công nghệ Lọc Nước Màng RO',
        sectorName: 'Môi trường',
        offerType: 'SOLUTION',
        hasTechTransfer: true,
        trlLevel: 3,
        pricingType: 'CONTACT',
        status: 'APPROVED',
      },
      {
        id: 'tech-2',
        offerCode: 'TECH-002',
        title: 'Hệ thống IoT Nông nghiệp',
        sectorName: 'Nông nghiệp',
        offerType: 'DEVICE',
        hasTechTransfer: true,
        trlLevel: 5,
        pricingType: 'FIXED',
        priceAmount: 150000000,
        status: 'PENDING',
      },
      {
        id: 'tech-3',
        offerCode: 'TECH-003',
        title: 'Dây chuyền Chế biến Thảo dược',
        sectorName: 'Y Dược',
        offerType: 'SOLUTION',
        hasTechTransfer: true,
        trlLevel: 8,
        pricingType: 'FIXED',
        priceAmount: 500000000,
        status: 'APPROVED',
      },
    ],
  }),
}));

vi.mock('../../../../lib/enterprise-client', () => ({
  fetchMyEnterpriseProfile: vi.fn().mockResolvedValue({
    id: 'ent-1',
    name: 'Công ty Cổ phần Công nghệ Mới',
    subjectType: 'DN ĐMST',
    highQualificationRatio: '',
    status: 'Draft',
  }),
  updateMyEnterpriseProfile: vi.fn().mockResolvedValue({ success: true }),
  submitEnterpriseVerification: vi.fn().mockResolvedValue({
    success: true,
    message: 'Đã nộp hồ sơ thẩm định thành công!',
  }),
}));

vi.mock('@/components/common/searchable-province-combobox', () => ({
  SearchableProvinceCombobox: () => <div data-testid="province-combobox" />,
}));

describe('Wave 2 & Wave 3 QC Verification Suite: Seller Workspace Delta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Item 2: Kho Công nghệ (TRL) & Zero Dev Badges', () => {
    it('QC-TEST-02A: renders TRL filter dropdown and filters offers by TRL range', async () => {
      render(<SellerTechnologiesPage />);

      // Wait for data load
      await waitFor(() => {
        expect(screen.getByText('Công nghệ Lọc Nước Màng RO')).toBeInTheDocument();
      });

      expect(screen.getByText('Hệ thống IoT Nông nghiệp')).toBeInTheDocument();
      expect(screen.getByText('Dây chuyền Chế biến Thảo dược')).toBeInTheDocument();

      // Find TRL filter
      const trlSelect = screen.getByTestId('trl-filter-select');
      expect(trlSelect).toBeInTheDocument();

      // Filter by TRL 1-3
      fireEvent.change(trlSelect, { target: { value: 'TRL_1_3' } });
      expect(screen.getByText('Công nghệ Lọc Nước Màng RO')).toBeInTheDocument();
      expect(screen.queryByText('Hệ thống IoT Nông nghiệp')).not.toBeInTheDocument();
      expect(screen.queryByText('Dây chuyền Chế biến Thảo dược')).not.toBeInTheDocument();

      // Filter by TRL 7-9
      fireEvent.change(trlSelect, { target: { value: 'TRL_7_9' } });
      expect(screen.queryByText('Công nghệ Lọc Nước Màng RO')).not.toBeInTheDocument();
      expect(screen.getByText('Dây chuyền Chế biến Thảo dược')).toBeInTheDocument();
    });

    it('QC-TEST-02B: does NOT leak dev badges (TASK-04, SELLER WORKSPACE)', async () => {
      render(<SellerTechnologiesPage />);
      await waitFor(() => {
        expect(screen.getAllByText('Quản Lý Kho Giải Pháp & Công Nghệ Chào Bán')[0]).toBeInTheDocument();
      });

      expect(screen.queryByText(/TASK-04/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/SELLER WORKSPACE/i)).not.toBeInTheDocument();
    });
  });

  describe('Item 7: Hồ sơ Doanh nghiệp (Clean State & ConfirmModal)', () => {
    it('QC-TEST-07A: does not hardcode highQualificationRatio to 40%', async () => {
      render(<EnterpriseOwnerProfilePage />);
      await waitFor(() => {
        expect(screen.getByText(/Kê Khai Hồ Sơ Chủ Thể & Năng Lực/i)).toBeInTheDocument();
      });

      // Switch to HR tab (Lao động & Trình độ)
      const hrTab = screen.getByText(/3\. Lao động & Trình độ/i);
      fireEvent.click(hrTab);

      // Check input does not have default '40%'
      const ratioInput = screen.getByPlaceholderText('VD: 45%, 70%...') as HTMLInputElement;
      expect(ratioInput.value).toBe('');
    });

    it('QC-TEST-07B: uses ConfirmModal instead of window.confirm for submission', async () => {
      const windowConfirmSpy = vi.spyOn(window, 'confirm');
      render(<EnterpriseOwnerProfilePage />);

      await waitFor(() => {
        expect(screen.getAllByText(/🚀 Nộp hồ sơ thẩm định/i)[0]).toBeInTheDocument();
      });

      // Click submit button
      const submitBtn = screen.getAllByText(/🚀 Nộp hồ sơ thẩm định/i)[0];
      fireEvent.click(submitBtn);

      // Native window.confirm must NOT be called
      expect(windowConfirmSpy).not.toHaveBeenCalled();

      // Modern modal must be shown
      expect(screen.getByText('Xác nhận nộp hồ sơ thẩm định')).toBeInTheDocument();
      expect(screen.getByText('Xác nhận nộp hồ sơ')).toBeInTheDocument();
    });
  });
});
