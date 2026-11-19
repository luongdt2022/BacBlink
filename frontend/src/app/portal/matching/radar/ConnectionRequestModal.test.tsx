import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ConnectionRequestModal from './ConnectionRequestModal';
import { brokerageApi } from '@/services/api/brokerage';
import { authClient } from '@/lib/auth-client';
import { MatchCandidate } from '@/types/brokerage';

const mockCandidate: MatchCandidate = {
  id: 'cand-001',
  demandId: 'dem-001',
  demandCode: 'DEM-001',
  demandTitle: 'Hệ thống sấy nông sản bằng năng lượng mặt trời',
  buyerOrganizationId: null,
  buyerOrganizationName: 'Công Ty CP Nông Sản Sạch An Giang',
  offerId: 'off-001',
  offerCode: 'OFF-001',
  offerTitle: 'Công nghệ sấy bơm nhiệt kết hợp đối lưu cưỡng bức',
  sellerOrganizationId: null,
  sellerOrganizationName: 'Viện Khoa Học Năng Lượng',
  matchScore: 92,
  tniScore: 85,
  sectorCode: 'LV01',
  trlLevel: 7,
  ipStatus: 'PATENT_GRANTED',
  isActive: true,
  createdAt: '2026-10-01T00:00:00Z',
};

describe('ConnectionRequestModal (TASK-08 T027)', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    vi.spyOn(authClient, 'getUser').mockReturnValue({
      organizationName: 'Doanh Nghiệp Hội Viên Thử Nghiệm',
    } as any);
    vi.spyOn(brokerageApi, 'createConnectionRequest').mockResolvedValue({
      id: 'req-123',
      requestCode: 'REQ-20261030-001',
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders modal with initial state, pre-populating org name from authClient and keeping budget/message clean', () => {
    render(
      <ConnectionRequestModal
        isOpen={true}
        candidate={mockCandidate}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Khởi tạo Yêu cầu Kết nối Cung–Cầu/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doanh Nghiệp Hội Viên Thử Nghiệm')).toBeInTheDocument();

    const budgetInput = screen.getByPlaceholderText(/Ví dụ: 500 triệu - 1 tỷ VNĐ/i) as HTMLInputElement;
    expect(budgetInput.value).toBe('');

    const messageTextarea = screen.getByPlaceholderText(/Mô tả mục tiêu kết nối/i) as HTMLTextAreaElement;
    expect(messageTextarea.value).toBe('');
  });

  it('validates senderOrgName >= 3 characters (Zero-Mock Validation)', async () => {
    render(
      <ConnectionRequestModal
        isOpen={true}
        candidate={mockCandidate}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const orgInput = screen.getByDisplayValue('Doanh Nghiệp Hội Viên Thử Nghiệm');
    fireEvent.change(orgInput, { target: { value: 'AB' } });

    const messageTextarea = screen.getByPlaceholderText(/Mô tả mục tiêu kết nối/i);
    fireEvent.change(messageTextarea, { target: { value: 'Nội dung đề xuất hợp tác dài trên 10 ký tự.' } });

    const submitBtn = screen.getByRole('button', { name: /Gửi Yêu Cầu Kết Nối/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Tên tổ chức gửi yêu cầu phải có ít nhất 3 ký tự.')).toBeInTheDocument();
    expect(brokerageApi.createConnectionRequest).not.toHaveBeenCalled();
  });

  it('validates message >= 10 characters (Zero-Mock Validation)', async () => {
    render(
      <ConnectionRequestModal
        isOpen={true}
        candidate={mockCandidate}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const messageTextarea = screen.getByPlaceholderText(/Mô tả mục tiêu kết nối/i);
    fireEvent.change(messageTextarea, { target: { value: 'Quá ngắn' } });

    const submitBtn = screen.getByRole('button', { name: /Gửi Yêu Cầu Kết Nối/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Nội dung đề xuất hợp tác phải có ít nhất 10 ký tự.')).toBeInTheDocument();
    expect(brokerageApi.createConnectionRequest).not.toHaveBeenCalled();
  });

  it('submits connection request successfully when inputs are valid', async () => {
    render(
      <ConnectionRequestModal
        isOpen={true}
        candidate={mockCandidate}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const messageTextarea = screen.getByPlaceholderText(/Mô tả mục tiêu kết nối/i);
    fireEvent.change(messageTextarea, { target: { value: 'Chúng tôi muốn thử nghiệm công nghệ trong quý 1.' } });

    const budgetInput = screen.getByPlaceholderText(/Ví dụ: 500 triệu - 1 tỷ VNĐ/i);
    fireEvent.change(budgetInput, { target: { value: '800 Triệu VNĐ' } });

    const submitBtn = screen.getByRole('button', { name: /Gửi Yêu Cầu Kết Nối/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(brokerageApi.createConnectionRequest).toHaveBeenCalledWith({
        demandId: 'dem-001',
        offerId: 'off-001',
        senderOrgName: 'Doanh Nghiệp Hội Viên Thử Nghiệm',
        senderRole: 'BUYER',
        receiverOrgName: 'Viện Khoa Học Năng Lượng',
        message: 'Chúng tôi muốn thử nghiệm công nghệ trong quý 1.',
        proposedBudgetRange: '800 Triệu VNĐ',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
