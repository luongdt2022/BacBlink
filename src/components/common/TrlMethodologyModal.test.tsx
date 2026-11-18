import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TrlMethodologyModal, TRL_LEVEL_DETAILS } from './TrlMethodologyModal';

describe('TrlMethodologyModal Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    render(<TrlMethodologyModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Phương Pháp Luận Cấp Độ Sẵn Sàng Công Nghệ/i)).not.toBeInTheDocument();
  });

  it('renders correctly with NASA TRL and ISO 16290 industrial standards without TT17 references', () => {
    render(<TrlMethodologyModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Phương Pháp Luận Cấp Độ Sẵn Sàng Công Nghệ \(TRL 1–9\)/i)).toBeInTheDocument();
    expect(screen.getByText(/NASA TRL \(1974 \/ 1989\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ISO 16290:2013/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ISO 9001 & IATF 16949/i)).toBeInTheDocument();
    expect(screen.queryByText(/Thông tư 17/i)).not.toBeInTheDocument();
    expect(screen.getByText(/TẦNG 1: TỰ KÊ KHAI/i)).toBeInTheDocument();
    expect(screen.getByText(/TẦNG 2: THẨM ĐỊNH CHUYÊN SÂU/i)).toBeInTheDocument();
  });

  it('renders NASA hardware, software descriptions, exit criteria and TRL scoring section', () => {
    render(<TrlMethodologyModal isOpen={true} onClose={vi.fn()} />);
    // Check TRL Scoring section
    expect(screen.getByText(/Cách Tính Điểm Sẵn Sàng Công Nghệ \(TRL Score\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Trọng số TRL: 30% tổng điểm Matching/i)).toBeInTheDocument();

    // Check Hardware and Software tracks
    expect(screen.getAllByText(/Mô tả phần cứng \(Hardware\):/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mô tả phần mềm \(Software\):/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tiêu chí hoàn thành cấp độ \(NASA Exit Criteria\):/i).length).toBeGreaterThan(0);
  });

  it('renders all 9 TRL levels and displays required evidence for TRL >= 7', () => {
    render(<TrlMethodologyModal isOpen={true} onClose={vi.fn()} />);
    for (let lvl = 1; lvl <= 9; lvl++) {
      expect(screen.getByText(new RegExp(`TRL ${lvl}:`, 'i'))).toBeInTheDocument();
    }
    // Check evidence requirement tags for TRL 7, 8, 9
    const evidenceBadges = screen.getAllByText(/Cần Bằng SHTT \/ Test Report/i);
    expect(evidenceBadges.length).toBe(3);
  });

  it('filters stages by clicking stage filter tabs', () => {
    render(<TrlMethodologyModal isOpen={true} onClose={vi.fn()} />);
    const labTab = screen.getByText(/TRL 1–3: Lab & Khái niệm/i);
    fireEvent.click(labTab);

    // TRL 1 should be visible, TRL 9 should not
    expect(screen.getByText(/TRL 1:/i)).toBeInTheDocument();
    expect(screen.queryByText(/TRL 9:/i)).not.toBeInTheDocument();
  });

  it('toggles view track between ALL, HARDWARE and SOFTWARE', () => {
    render(<TrlMethodologyModal isOpen={true} onClose={vi.fn()} />);
    const hwTrackBtn = screen.getByRole('button', { name: /Phần cứng/i });
    fireEvent.click(hwTrackBtn);

    // Only hardware description should be visible
    expect(screen.getAllByText(/Mô tả phần cứng \(Hardware\):/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Mô tả phần mềm \(Software\):/i)).not.toBeInTheDocument();

    const swTrackBtn = screen.getByRole('button', { name: /Phần mềm/i });
    fireEvent.click(swTrackBtn);
    expect(screen.queryByText(/Mô tả phần cứng \(Hardware\):/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Mô tả phần mềm \(Software\):/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button or dismiss button is clicked', () => {
    const handleClose = vi.fn();
    render(<TrlMethodologyModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /Đã hiểu & Đóng/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
