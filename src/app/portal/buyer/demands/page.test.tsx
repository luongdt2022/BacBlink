import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import BuyerDemandsPage from './page';
import { authClient, ROLES } from '@/lib/auth-client';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

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
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/portal/buyer/demands');
    }
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
      expect(screen.getByText('Quản lý Nhu cầu Công nghệ')).toBeInTheDocument();
      expect(screen.getByText('BÊN MUA CÔNG NGHỆ')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\+ Gửi Nhu cầu Công nghệ mới/i })).toBeInTheDocument();
      expect(screen.getByText(/Quản lý các nhu cầu công nghệ, chỉ số cấp thiết TNI/i)).toBeInTheDocument();
    });

    // Zero Dev Badge
    expect(screen.queryByText('TASK-03')).not.toBeInTheDocument();
  });

  it('displays dynamic KPI summary cards correctly when demands data exists (Zero-Mock)', async () => {
    const activeDemands = [
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
        matchingCount: 3,
        needConsulting: true,
      },
      {
        id: 'dmd-02',
        itemCode: 'DMD-202610-002',
        stageName: 'Gia công nhiệt',
        technicalProblem: 'Tối ưu hóa nhiệt luyện',
        sectorCode: 'LV01',
        budgetRange: '1 tỷ VNĐ',
        tniScore: 75,
        tniClassification: 'HIGH',
        status: 'PENDING',
        matchingCount: 5,
        needConsulting: false,
      },
    ];

    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => activeDemands } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      // Card 1
      const card1 = screen.getByText('Tổng nhu cầu đã gửi').closest('.surface-card');
      expect(card1).toBeInTheDocument();
      expect(card1).toHaveTextContent('2');
      expect(card1).toHaveTextContent('1 nhu cầu đã duyệt niêm yết');

      // Card 2: avgTni = round((85 + 75) / 2) = 80
      const card2 = screen.getByText('Điểm TNI trung bình').closest('.surface-card');
      expect(card2).toBeInTheDocument();
      expect(card2).toHaveTextContent('80');
      expect(card2).toHaveTextContent('Nhu cầu rất cao');

      // Card 3: matchingCount = 3 + 5 = 8
      const card3 = screen.getByText('Nguồn cung tiềm năng').closest('.surface-card');
      expect(card3).toBeInTheDocument();
      expect(card3).toHaveTextContent('8');
      expect(card3).toHaveTextContent('Tự động gợi ý từ Radar');

      // Card 4: needConsulting count = 1
      const card4 = screen.getByText('Ban Cố Vấn BACLINK').closest('.surface-card');
      expect(card4).toBeInTheDocument();
      expect(card4).toHaveTextContent('1');
      expect(card4).toHaveTextContent('Nhu cầu đăng ký tư vấn 1-1');
    });
  });

  it('displays Zero-Mock KPI summary defaults (0, --, 0, 0) and friendly subtext when demands list is empty', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => [] } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      // Card 1: 0, "0 nhu cầu đã duyệt niêm yết"
      const card1 = screen.getByText('Tổng nhu cầu đã gửi').closest('.surface-card');
      expect(card1).toBeInTheDocument();
      expect(card1).toHaveTextContent('0');
      expect(card1).toHaveTextContent('0 nhu cầu đã duyệt niêm yết');

      // Card 2: "--", "Chưa có dữ liệu đánh giá"
      const card2 = screen.getByText('Điểm TNI trung bình').closest('.surface-card');
      expect(card2).toBeInTheDocument();
      expect(card2).toHaveTextContent('--');
      expect(card2).toHaveTextContent('Chưa có dữ liệu đánh giá');

      // Card 3: 0, "Chưa kích hoạt ghép nối"
      const card3 = screen.getByText('Nguồn cung tiềm năng').closest('.surface-card');
      expect(card3).toBeInTheDocument();
      expect(card3).toHaveTextContent('0');
      expect(card3).toHaveTextContent('Chưa kích hoạt ghép nối');

      // Card 4: 0, "Chưa đăng ký tư vấn"
      const card4 = screen.getByText('Ban Cố Vấn BACLINK').closest('.surface-card');
      expect(card4).toBeInTheDocument();
      expect(card4).toHaveTextContent('0');
      expect(card4).toHaveTextContent('Chưa đăng ký tư vấn');
    });

    // Tuyệt đối không xuất hiện các số mock hardcode cũ: 80, 14, 1
    expect(screen.queryByText('80')).not.toBeInTheDocument();
    expect(screen.queryByText('14')).not.toBeInTheDocument();
    expect(screen.queryByText('Mức Rất Cao (Ưu tiên P0)')).not.toBeInTheDocument();
    expect(screen.queryByText('Đã gán tư vấn 1-1')).not.toBeInTheDocument();
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

  it('includes Authorization header when fetching demands and displays friendly prompt when unauthenticated', async () => {
    let capturedHeaders: any = null;
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        capturedHeaders = init?.headers;
        return {
          ok: true,
          json: async () => mockDemands,
        } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Khắc phục hiện tượng rỗ khí')).toBeInTheDocument();
    });

    expect(capturedHeaders).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer test-token-jwt',
      })
    );

    // Unauthenticated state
    cleanup();
    authClient.clearSession();

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Yêu cầu đăng nhập Doanh nghiệp')).toBeInTheDocument();
      expect(screen.getByText('Đăng Nhập Ngay')).toBeInTheDocument();
    });
  });

  it('isolates commercial orders into Tab 1 and R&D demands into Tab 2 (CR-TASK-03-DELTA-02 / Task 6.3)', async () => {
    const mixedDemands = [
      {
        id: 'ord-comm-01',
        itemCode: 'ORD-202610-001',
        stageName: 'Sản xuất & Chuyển giao',
        technicalProblem: '[DN: Demo] Nhu cầu đặt mua / kết nối thương phẩm: Dây chuyền sấy chè Thái Nguyên',
        desiredSolution: '[Đề xuất thương mại: PURCHASE_COMMERCIAL] Khách hàng mua sản phẩm TECH-01',
        budgetRange: '500 triệu VNĐ',
        status: 'SUBMITTED',
        isCommercialOrder: true,
      },
      {
        id: 'rd-01',
        itemCode: 'DMD-202610-999',
        stageName: 'Nghiên cứu & Thiết kế',
        technicalProblem: 'Nghiên cứu thuật toán AI tối ưu sấy chân không',
        desiredSolution: 'Tìm kiếm viện nghiên cứu hợp tác R&D',
        budgetRange: '1 – 3 tỷ VNĐ',
        tniScore: 88,
        tniClassification: 'VERY_HIGH',
        status: 'VERIFIED',
      },
    ];

    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => mixedDemands } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    // Mặc định do có đơn thương mại nên Tab 1 (Đơn mua sản phẩm thương mại) được chọn
    await waitFor(() => {
      expect(screen.getByText('Dây chuyền sấy chè Thái Nguyên')).toBeInTheDocument();
      expect(screen.getByText('ORD-202610-001')).toBeInTheDocument();
      expect(screen.getByText('Tiếp nhận đơn')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Hủy đơn/i })).toBeInTheDocument();
    });

    // Bài toán R&D không xuất hiện trong Tab 1
    expect(screen.queryByText('Nghiên cứu thuật toán AI tối ưu sấy chân không')).not.toBeInTheDocument();

    // Chuyển sang Tab 2: "Nhu cầu R&D / Bài toán công nghệ"
    const rdTabBtn = screen.getByRole('button', { name: /Nhu cầu R&D \/ Bài toán công nghệ/i });
    fireEvent.click(rdTabBtn);

    // Tab 2 hiển thị bài toán R&D và không có đơn mua thương mại
    await waitFor(() => {
      expect(screen.getByText('Nghiên cứu thuật toán AI tối ưu sấy chân không')).toBeInTheDocument();
      expect(screen.getByText('DMD-202610-999')).toBeInTheDocument();
    });
    expect(screen.queryByText('Dây chuyền sấy chè Thái Nguyên')).not.toBeInTheDocument();
  });

  it('allows cancelling a SUBMITTED commercial order via confirmation modal', async () => {
    let cancelCalled = false;
    const commercialList = [
      {
        id: 'ord-comm-02',
        itemCode: 'ORD-CANCEL-002',
        stageName: 'Sản xuất & Chuyển giao',
        technicalProblem: 'Nhu cầu đặt mua / kết nối thương phẩm: Trà Tân Cương Thượng Hạng',
        desiredSolution: '[Đề xuất thương mại: PURCHASE_COMMERCIAL] Đặt mua mẫu',
        budgetRange: '20 triệu VNĐ',
        status: 'SUBMITTED',
        isCommercialOrder: true,
      },
    ];

    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands/ord-comm-02/close') && init?.method === 'POST') {
        cancelCalled = true;
        return { ok: true, json: async () => ({ success: true }) } as Response;
      }
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => commercialList } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Trà Tân Cương Thượng Hạng')).toBeInTheDocument();
    });

    // Click nút "Hủy đơn"
    const cancelBtn = screen.getByRole('button', { name: /Hủy đơn/i });
    fireEvent.click(cancelBtn);

    // Modal xác nhận xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Xác nhận hủy đơn đặt mua')).toBeInTheDocument();
    });

    // Bấm nút "Xác nhận hủy đơn" trong modal
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận hủy đơn/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(cancelCalled).toBe(true);
      expect(screen.getByText('Đã hủy đơn')).toBeInTheDocument();
    });
  });

  it('renders expert customized subheader and title when user has VERIFIED_EXPERT role (CR-2026-012 Delta v1.4)', async () => {
    authClient.setSession('test-token-jwt', {
      id: 'exp-01',
      email: 'expert@tech.vn',
      fullName: 'GS.TS Nguyễn Văn Nghiên Cứu',
      role: 'VERIFIED_EXPERT',
    });

    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return {
        ok: true,
        json: async () => mockDemands,
      } as Response;
    });

    render(<BuyerDemandsPage />);

    await waitFor(() => {
      expect(screen.getByText('Quản lý Đơn hàng & Nhu cầu Đặt mua')).toBeInTheDocument();
      expect(screen.getByText('CHUYÊN GIA KH&CN')).toBeInTheDocument();
      expect(screen.getByText(/Quản lý các đơn đặt mua sản phẩm thương mại, mẫu thử nghiệm/i)).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
    });
  });

  it('renders clickable product title, icon, and modal links to view product detail (Tab 1 & Modal)', async () => {
    const commercialItem = [
      {
        id: 'ord-comm-scan-01',
        itemCode: 'DMD-20261102-1D30F8',
        stageName: 'Sản xuất & Chuyển giao',
        technicalProblem: '[DN: Dang Luong Luong] Nhu cầu ứng dụng / chuyển giao: Máy quét 3D nha khoa',
        desiredSolution: '[Đề xuất thương mại: PURCHASE_COMMERCIAL] Khách hàng mua sản phẩm OFF-20261021-00023 - Máy quét 3D',
        budgetRange: '20M_100M',
        status: 'SUBMITTED',
        isCommercialOrder: true,
      },
    ];

    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => commercialItem } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    // 1. Tên sản phẩm được làm sạch và là một liên kết dẫn tới chi tiết sản phẩm chào bán
    await waitFor(() => {
      const productLink = screen.getByRole('link', { name: /Máy quét 3D nha khoa/i });
      expect(productLink).toBeInTheDocument();
      expect(productLink).toHaveAttribute('href', '/chao-ban-cong-nghe/OFF-20261021-00023');
    });

    // 2. Nút thao tác trực tiếp "Sản phẩm" ở cột Thao tác cũng liên kết đến sản phẩm
    const actionProductLink = screen.getByRole('link', { name: /^Sản phẩm$/i });
    expect(actionProductLink).toHaveAttribute('href', '/chao-ban-cong-nghe/OFF-20261021-00023');

    // 3. Phân biệt rõ đơn mua hàng, không hiển thị nhầm liên kết hồ sơ bài toán R&D
    expect(screen.getByText('Đơn mua hàng')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Xem hồ sơ nhu cầu/i })).not.toBeInTheDocument();

    // 4. Bấm vào nút "Chi tiết" mở Modal chi tiết đơn hàng
    const detailBtn = screen.getByRole('button', { name: /Chi tiết/i });
    fireEvent.click(detailBtn);

    // 5. Trong Modal, nút CTA mở chi tiết sản phẩm xuất hiện, không chứa nút Phiếu Nhu Cầu
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Xem Chi Tiết Sản Phẩm/i })).toHaveAttribute(
        'href',
        '/chao-ban-cong-nghe/OFF-20261021-00023'
      );
      expect(screen.queryByRole('link', { name: /Xem Phiếu Nhu Cầu/i })).not.toBeInTheDocument();
    });
  });

  it('renders clickable technical problem title and itemCode in Tab 2 to open demand details', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => mockDemands } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    // Mặc định do chỉ có mockDemands (R&D) nên tự động chọn Tab 2
    await waitFor(() => {
      const problemLink = screen.getByRole('link', { name: /Khắc phục hiện tượng rỗ khí/i });
      expect(problemLink).toBeInTheDocument();
      expect(problemLink).toHaveAttribute('href', '/nhu-cau-cong-nghe/dmd-01');

      const codeLink = screen.getByRole('link', { name: /DMD-202610-001/i });
      expect(codeLink).toBeInTheDocument();
      expect(codeLink).toHaveAttribute('href', '/nhu-cau-cong-nghe/dmd-01');
    });
  });

  it('renders Deal Room CTA and disables Cancel Order button when order is PROCESSING (T050 / CR-TASK-08-DELTA-02)', async () => {
    const acceptedOrder = [
      {
        id: 'ord-comm-accepted-01',
        itemCode: 'DMD-20261102-ACCEPTED',
        stageName: 'Sản xuất & Chuyển giao',
        technicalProblem: '[DN: Công ty ABC] Nhu cầu ứng dụng / chuyển giao: Dây chuyền chiết rót tự động',
        desiredSolution: '[Đơn hàng thương mại] Khách hàng đặt mua sản phẩm OFF-20261021-00088',
        budgetRange: '500M_1B',
        status: 'PROCESSING',
        isCommercialOrder: true,
      },
    ];

    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/buyer/demands')) {
        return { ok: true, json: async () => acceptedOrder } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });

    render(<BuyerDemandsPage />);

    // Đơn hàng xuất hiện trong Tab 1
    await waitFor(() => {
      expect(screen.getByText('Dây chuyền chiết rót tự động')).toBeInTheDocument();
    });

    // Mở modal chi tiết đơn hàng
    const detailBtn = screen.getByRole('button', { name: /Chi tiết/i });
    fireEvent.click(detailBtn);

    // Kiểm tra trong Modal
    await waitFor(() => {
      // 1. Nút CTA "Vào Deal Room Thảo Luận ->" xuất hiện và trỏ tới pipeline Deal Room
      const dealRoomBtn = screen.getByRole('link', { name: /Vào Deal Room Thảo Luận/i });
      expect(dealRoomBtn).toBeInTheDocument();
      expect(dealRoomBtn).toHaveAttribute('href', '/portal/opportunities/pipeline');

      // 2. Nút "Hủy đơn" tuyệt đối bị khóa/ẩn, hiển thị thông báo ghi chú
      expect(screen.queryByRole('button', { name: /Hủy đơn/i })).not.toBeInTheDocument();
      expect(screen.getByText('Đơn hàng đã được bên bán tiếp nhận và đang xử lý.')).toBeInTheDocument();
    });
  });
});
