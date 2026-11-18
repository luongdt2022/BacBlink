import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { SellerDashboard } from '@/components/portal/seller-dashboard';
import SellerTechnologiesPage from './seller/technologies/page';
import EnterpriseOwnerProfilePage from './enterprise/profile/page';
import { brokerageApi } from '@/services/api/brokerage';
import { fetchSellerWorkspace } from '@/services/api/technology-offer';
import { authClient } from '@/lib/auth-client';
import {
  fetchMyEnterpriseProfile,
  updateMyEnterpriseProfile,
  submitEnterpriseVerification,
} from '@/lib/enterprise-client';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/portal',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/auth-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-client')>();
  return {
    ...actual,
    authClient: {
      ...actual.authClient,
      getUser: vi.fn(),
      getToken: vi.fn().mockReturnValue('mock-jwt-token'),
    },
  };
});

vi.mock('@/services/api/brokerage', () => ({
  brokerageApi: {
    getOpportunities: vi.fn(),
    getConnectionRequests: vi.fn(),
    updateOpportunityStage: vi.fn(),
    respondConnectionRequest: vi.fn(),
  },
}));

vi.mock('@/services/api/technology-offer', () => ({
  fetchSellerWorkspace: vi.fn(),
}));

vi.mock('@/lib/enterprise-client', () => ({
  fetchMyEnterpriseProfile: vi.fn(),
  updateMyEnterpriseProfile: vi.fn(),
  submitEnterpriseVerification: vi.fn(),
}));

vi.mock('@/components/common/searchable-province-combobox', () => ({
  SearchableProvinceCombobox: () => <div data-testid="province-combobox" />,
}));

vi.mock('@/services/api/assessment-tt17', () => ({
  getAssessmentHistory: vi.fn().mockResolvedValue([
    {
      id: 'asm-001',
      evaluationYear: 2024,
      sectorCode: 'C.28',
      scoreResult: {
        scoreT: 25,
        scoreE: 18,
        scoreO: 16,
        scoreR: 15,
        scoreI: 12,
        totalScore: 86,
        syncCoefficient: 0.92,
        classificationLabel: 'Trình độ Tiên tiến',
      },
      status: 'SUBMITTED',
      createdAt: '2024-10-15T08:00:00Z',
    },
  ]),
}));

const mockSellerUser = {
  id: 'u-seller-01',
  email: 'seller@nacentech.vn',
  fullName: 'Viện Công Nghệ Mới',
  role: 'SELLER',
};

describe('DEEP INTERACTIVE QC TEST SUITE: 7 SELLER WORKSPACE ITEMS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authClient.getUser).mockReturnValue(mockSellerUser as any);
  });

  afterEach(() => {
    cleanup();
  });

  /* =========================================================================
   * ITEM 1: TỔNG QUAN GIAN HÀNG (<SellerDashboard />)
   * ========================================================================= */
  describe('FLOW-01 to FLOW-03: Item 1 - Tổng quan Gian hàng Interactive Flows', () => {
    beforeEach(() => {
      vi.mocked(brokerageApi.getOpportunities).mockResolvedValue([]);
      vi.mocked(fetchSellerWorkspace).mockResolvedValue({
        kpi: {
          totalOffers: 8,
          publishedOffers: 6,
          pendingOffers: 2,
          successfulConnections: 5,
        },
        data: [
          {
            id: 'offer-1',
            offerCode: 'TECH-2026-001',
            title: 'Hệ Thống Sấy Thăng Hoa Chân Không Công Suất Cao',
            sectorName: 'Cơ khí - Tự động hóa',
            offerType: 'SOLUTION',
            hasTechTransfer: true,
            trlLevel: 7,
            pricingType: 'CONTACT',
            status: 'APPROVED',
          } as any,
        ],
      });

      vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue([
        {
          id: 'lead-1',
          requestCode: 'REQ-202610-001',
          senderOrgName: 'Công ty Cổ phần Thực phẩm An Khang',
          technologyTitle: 'Hệ Thống Sấy Thăng Hoa Chân Không',
          status: 'PENDING',
          message: 'Chúng tôi muốn đặt lịch demo và thương thảo báo giá sỉ.',
          createdAt: '2026-10-23T08:30:00Z',
        } as any,
      ]);
    });

    it('FLOW-01: renders 4 business KPIs and verified action links', async () => {
      render(<SellerDashboard user={mockSellerUser as any} />);

      await waitFor(() => {
        expect(screen.getByText('Giải pháp Chào bán')).toBeInTheDocument();
      });

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText(/6 niêm yết/i)).toBeInTheDocument();
      expect(screen.getByText(/2 chờ duyệt/i)).toBeInTheDocument();
      expect(screen.getByText('Yêu Cầu Kết Nối Mới')).toBeInTheDocument();
      expect(screen.getByText('Lượt Quan Tâm Gian Hàng')).toBeInTheDocument();

      // Quick action buttons
      const addTechBtn = screen.getByText('Đăng Giải Pháp Mới');
      expect(addTechBtn.closest('a')).toHaveAttribute('href', '/portal/seller/technologies/create');

      const radarBtn = screen.getByText('Săn Nhu Cầu Bằng AI');
      expect(radarBtn.closest('a')).toHaveAttribute('href', '/portal/matching/radar');
    });

    it('FLOW-02: inbound lead card displays sender, SLA, and response CTA linking to pipeline tab', async () => {
      render(<SellerDashboard user={mockSellerUser as any} />);

      await waitFor(() => {
        expect(screen.getByText('Công ty Cổ phần Thực phẩm An Khang')).toBeInTheDocument();
      });

      expect(screen.getByText('REQ-202610-001')).toBeInTheDocument();
      expect(screen.getByText(/Chúng tôi muốn đặt lịch demo/i)).toBeInTheDocument();

      // Response link
      const respondLink = screen.getByText('Phản hồi');
      expect(respondLink.closest('a')).toHaveAttribute('href', '/portal/opportunities/pipeline?tab=inbound');
    });

    it('FLOW-03: displays friendly empty state when no inbound requests are found', async () => {
      vi.mocked(brokerageApi.getConnectionRequests).mockResolvedValue([]);
      render(<SellerDashboard user={mockSellerUser as any} />);

      await waitFor(() => {
        expect(screen.getByText('Chưa có yêu cầu hỏi mua mới nào')).toBeInTheDocument();
      });

      const exploreBtn = screen.getByText('Khám phá Nhu Cầu Bên Mua');
      expect(exploreBtn.closest('a')).toHaveAttribute('href', '/portal/matching/radar');
    });
  });

  /* =========================================================================
   * ITEM 2: KHO CÔNG NGHỆ (TRL) (/portal/seller/technologies)
   * ========================================================================= */
  describe('FLOW-04 to FLOW-08: Item 2 - Kho Công nghệ (TRL) Interactive Flows', () => {
    beforeEach(() => {
      vi.mocked(fetchSellerWorkspace).mockResolvedValue({
        kpi: { totalOffers: 3, publishedOffers: 1, pendingOffers: 1, successfulConnections: 1 },
        data: [
          {
            id: 't1',
            offerCode: 'TECH-RO',
            title: 'Hệ thống Lọc Nước Màng RO',
            sectorName: 'Môi trường',
            offerType: 'SOLUTION',
            hasTechTransfer: true,
            trlLevel: 2,
            pricingType: 'CONTACT',
            status: 'DRAFT',
          } as any,
          {
            id: 't2',
            offerCode: 'TECH-IOT',
            title: 'Cảm Biến Giám Sát Độ Ẩm Đất IoT',
            sectorName: 'Nông nghiệp',
            offerType: 'DEVICE',
            hasTechTransfer: true,
            trlLevel: 5,
            pricingType: 'FIXED',
            priceAmount: 85000000,
            status: 'PENDING',
          } as any,
          {
            id: 't3',
            offerCode: 'TECH-MED',
            title: 'Dây Chuyền Chiết Xuất Tinh Dầu Tràm',
            sectorName: 'Y Dược',
            offerType: 'SOLUTION',
            hasTechTransfer: true,
            trlLevel: 8,
            pricingType: 'FIXED',
            priceAmount: 450000000,
            status: 'APPROVED',
          } as any,
        ],
      });
    });

    it('FLOW-04: real-time search filters offers by keyword or code', async () => {
      render(<SellerTechnologiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Hệ thống Lọc Nước Màng RO')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Tìm kiếm công nghệ...');
      fireEvent.change(searchInput, { target: { value: 'IoT' } });

      expect(screen.queryByText('Hệ thống Lọc Nước Màng RO')).not.toBeInTheDocument();
      expect(screen.getByText('Cảm Biến Giám Sát Độ Ẩm Đất IoT')).toBeInTheDocument();
      expect(screen.queryByText('Dây Chuyền Chiết Xuất Tinh Dầu Tràm')).not.toBeInTheDocument();
    });

    it('FLOW-05: status filter filters offers by APPROVED / PENDING / DRAFT', async () => {
      render(<SellerTechnologiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Hệ thống Lọc Nước Màng RO')).toBeInTheDocument();
      });

      const statusSelect = screen.getByDisplayValue('Tất cả trạng thái');
      fireEvent.change(statusSelect, { target: { value: 'APPROVED' } });

      expect(screen.queryByText('Hệ thống Lọc Nước Màng RO')).not.toBeInTheDocument();
      expect(screen.queryByText('Cảm Biến Giám Sát Độ Ẩm Đất IoT')).not.toBeInTheDocument();
      expect(screen.getByText('Dây Chuyền Chiết Xuất Tinh Dầu Tràm')).toBeInTheDocument();
    });

    it('FLOW-06: TRL dropdown filters offers by TRL 1-3, 4-6, 7-9', async () => {
      render(<SellerTechnologiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Hệ thống Lọc Nước Màng RO')).toBeInTheDocument();
      });

      const trlSelect = screen.getByTestId('trl-filter-select');
      fireEvent.change(trlSelect, { target: { value: 'TRL_4_6' } });

      expect(screen.queryByText('Hệ thống Lọc Nước Màng RO')).not.toBeInTheDocument();
      expect(screen.getByText('Cảm Biến Giám Sát Độ Ẩm Đất IoT')).toBeInTheDocument();
      expect(screen.queryByText('Dây Chuyền Chiết Xuất Tinh Dầu Tràm')).not.toBeInTheDocument();
    });

    it('FLOW-07: refresh button reloads dataset from API', async () => {
      render(<SellerTechnologiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Hệ thống Lọc Nước Màng RO')).toBeInTheDocument();
      });

      const refreshBtn = screen.getByTitle('Tải lại');
      fireEvent.click(refreshBtn);

      expect(fetchSellerWorkspace).toHaveBeenCalledTimes(2);
    });

    it('FLOW-08: row action buttons provide proper navigation links to view and edit', async () => {
      render(<SellerTechnologiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Hệ thống Lọc Nước Màng RO')).toBeInTheDocument();
      });

      const viewLinks = screen.getAllByTitle('Xem chi tiết');
      expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/chao-ban-cong-nghe/t1');

      const editLinks = screen.getAllByTitle('Chỉnh sửa');
      expect(editLinks[0].closest('a')).toHaveAttribute('href', '/portal/seller/technologies/t1/edit');
    });
  });

  /* =========================================================================
   * ITEM 7: HỒ SƠ DOANH NGHIỆP (/portal/enterprise/profile)
   * ========================================================================= */
  describe('FLOW-11 to FLOW-14: Item 7 - Hồ sơ Doanh nghiệp Interactive Flows', () => {
    beforeEach(() => {
      vi.mocked(fetchMyEnterpriseProfile).mockResolvedValue({
        id: 'ent-001',
        name: 'Công ty Cổ phần Cơ khí Chính xác Kinh Bắc',
        subjectType: 'Doanh nghiệp Hội viên',
        provinceCity: 'Bắc Ninh',
        highQualificationRatio: '',
        status: 'Draft',
        topBottlenecks: ['Thiếu vốn đầu tư công nghệ mới'],
        supportNeeds: ['Hỗ trợ kết nối Ban Cố vấn Kỹ thuật BACLINK và Viện - Trường'],
      });
      vi.mocked(updateMyEnterpriseProfile).mockResolvedValue({ success: true } as any);
      vi.mocked(submitEnterpriseVerification).mockResolvedValue({
        success: true,
        message: 'Đã nộp hồ sơ thẩm định thành công!',
      } as any);
    });

    it('FLOW-11: tab navigation switches seamlessly between legal, sector, HR, and bottlenecks without TT17', async () => {
      render(<EnterpriseOwnerProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/Kê Khai Hồ Sơ Chủ Thể/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/2\. Ngành sản xuất & Sở hữu/i)).toBeInTheDocument();
      expect(screen.queryByText(/TT17/i)).not.toBeInTheDocument();

      // Tab 3: HR
      const hrTab = screen.getByText(/3\. Lao động & Trình độ/i);
      fireEvent.click(hrTab);
      expect(screen.getByText('Tỷ lệ nhân sự ĐH và Sau Đại học')).toBeInTheDocument();

      // Tab 9: Bottlenecks
      const bottleneckTab = screen.getByText(/9\. Điểm nghẽn thực tế/i);
      fireEvent.click(bottleneckTab);
      expect(screen.getByText(/Nhóm 9: Điểm nghẽn lớn nhất trong hoạt động sản xuất & công nghệ/i)).toBeInTheDocument();
    });

    it('FLOW-12: save draft executes updateMyEnterpriseProfile without opening modal', async () => {
      render(<EnterpriseOwnerProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/Kê Khai Hồ Sơ Chủ Thể/i)).toBeInTheDocument();
      });

      const saveBtn = screen.getAllByText('💾 Lưu nháp')[0];
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateMyEnterpriseProfile).toHaveBeenCalled();
        expect(screen.getByText(/Lưu nháp hồ sơ thành công!/i)).toBeInTheDocument();
      });
    });

    it('FLOW-13: cancel in ConfirmModal closes modal without calling submission API', async () => {
      render(<EnterpriseOwnerProfilePage />);

      await waitFor(() => {
        expect(screen.getAllByText(/🚀 Nộp hồ sơ thẩm định/i)[0]).toBeInTheDocument();
      });

      // Click submit
      const submitBtn = screen.getAllByText(/🚀 Nộp hồ sơ thẩm định/i)[0];
      fireEvent.click(submitBtn);

      // ConfirmModal should be open
      expect(screen.getByText('Xác nhận nộp hồ sơ thẩm định')).toBeInTheDocument();

      // Click cancel
      const cancelBtn = screen.getByText('Để tôi kiểm tra lại');
      fireEvent.click(cancelBtn);

      // Verification API must not have been called
      expect(submitEnterpriseVerification).not.toHaveBeenCalled();
    });

    it('FLOW-14: confirm in ConfirmModal triggers submission and displays success message', async () => {
      render(<EnterpriseOwnerProfilePage />);

      await waitFor(() => {
        expect(screen.getAllByText(/🚀 Nộp hồ sơ thẩm định/i)[0]).toBeInTheDocument();
      });

      // Click submit
      const submitBtn = screen.getAllByText(/🚀 Nộp hồ sơ thẩm định/i)[0];
      fireEvent.click(submitBtn);

      // Confirm in modal
      const confirmBtn = screen.getByText('Xác nhận nộp hồ sơ');
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(updateMyEnterpriseProfile).toHaveBeenCalled();
        expect(submitEnterpriseVerification).toHaveBeenCalled();
        expect(screen.getByText(/Đã nộp hồ sơ thẩm định thành công!/i)).toBeInTheDocument();
      });
    });
  });
});
