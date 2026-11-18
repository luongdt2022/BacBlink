import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TniMethodologyModal } from './TniMethodologyModal';

describe('TniMethodologyModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    render(<TniMethodologyModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Phương Pháp Luận Chỉ Số Nhu Cầu Công Nghệ/i)).not.toBeInTheDocument();
  });

  it('renders formula tab with exact mathematical equation and weight distribution', () => {
    render(<TniMethodologyModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Phương Pháp Luận Chỉ Số Nhu Cầu Công Nghệ \(TNI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TNI = ROUND\( \(35×K \+ 30×L \+ 20×N \+ 15×O\) \/ 5 \)/i)).toBeInTheDocument();
    expect(screen.getByText(/Trục K · Urgency/i)).toBeInTheDocument();
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(screen.getByText(/Trục L · Impact/i)).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText(/Trục N · Investment/i)).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText(/Trục O · Readiness/i)).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('switches to 4 Dimensions tab and verifies 1-5 scale details', () => {
    render(<TniMethodologyModal isOpen={true} onClose={vi.fn()} />);
    const dimTab = screen.getByRole('button', { name: /2. 4 Trục Đo K-L-N-O/i });
    fireEvent.click(dimTab);

    expect(screen.getByText(/Trục K: Mức độ cấp thiết \(Urgency\) — Trọng số 35%/i)).toBeInTheDocument();
    expect(screen.getByText(/Trục L: Tầm ảnh hưởng doanh thu\/chi phí \(Impact\) — Trọng số 30%/i)).toBeInTheDocument();
    expect(screen.getByText(/Trục N: Khả năng đầu tư & Ngân sách \(Investment\) — Trọng số 20%/i)).toBeInTheDocument();
    expect(screen.getByText(/Trục O: Năng lực tiếp nhận & hấp thụ \(Adoption Readiness\) — Trọng số 15%/i)).toBeInTheDocument();
  });

  it('switches to Industrial Benchmark tab and checks SLA priority tiers without legacy 304 survey references', () => {
    render(<TniMethodologyModal isOpen={true} onClose={vi.fn()} />);
    const benchmarkTab = screen.getByRole('button', { name: /4\. Chuẩn Đối Chiếu Công Nghiệp/i });
    fireEvent.click(benchmarkTab);

    expect(screen.getByText(/Thang Chuẩn Đối Chiếu Mức Ưu Tiên Đặt Hàng Công Nghiệp BACLINK/i)).toBeInTheDocument();
    expect(screen.getByText(/80 – 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Trong 24 giờ/i)).toBeInTheDocument();
    expect(screen.getByText(/Radar AI \+ Cố vấn 1-1/i)).toBeInTheDocument();
    expect(screen.queryByText(/304 Doanh Nghiệp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PO-DEC/i)).not.toBeInTheDocument();
  });

  it('calls onClose callback when clicked close button', () => {
    const handleClose = vi.fn();
    render(<TniMethodologyModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /Đã hiểu & Đóng/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
