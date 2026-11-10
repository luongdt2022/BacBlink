import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IndexVerificationBadge } from './IndexVerificationBadge';

describe('IndexVerificationBadge Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders verified TRL badge correctly with Emerald color style and checkmark', () => {
    render(
      <IndexVerificationBadge
        type="TRL"
        status="VERIFIED_BY_GOV"
        value={8}
        authorityName="Sở KH&CN Hà Nội"
        variant="compact"
      />
    );

    expect(screen.getByText(/✓ TRL 8\/9 · Đã thẩm định/i)).toBeInTheDocument();
  });

  it('renders full variant with authority name suffix', () => {
    render(
      <IndexVerificationBadge
        type="TRL"
        status="VERIFIED_BY_GOV"
        value={7}
        authorityName="Cục Sở hữu trí tuệ"
        variant="full"
      />
    );

    expect(screen.getByText(/✓ TRL 7\/9 · Đã thẩm định/i)).toBeInTheDocument();
    expect(screen.getByText('(Cục Sở hữu trí tuệ)')).toBeInTheDocument();
  });

  it('renders self-declared status with amber style and unverified label', () => {
    render(
      <IndexVerificationBadge
        type="TRL"
        status="SELF_DECLARED"
        value={5}
      />
    );

    expect(screen.getByText(/TRL 5\/9 · Tự kê khai \(Chưa kiểm định\)/i)).toBeInTheDocument();
  });

  it('renders verified TNI badge correctly', () => {
    render(
      <IndexVerificationBadge
        type="TNI"
        status="VERIFIED_BY_GOV"
        value={85}
      />
    );

    expect(screen.getByText(/✓ TNI 85\/100 · Đã thẩm định/i)).toBeInTheDocument();
  });

  it('renders self-declared TNI badge correctly with urgency band', () => {
    render(
      <IndexVerificationBadge
        type="TNI"
        status="SELF_DECLARED"
        value={72}
      />
    );

    expect(screen.getByText(/TNI 72\/100 · Cấp thiết/i)).toBeInTheDocument();
  });

  it('renders high urgency TNI badge correctly for score >= 80', () => {
    render(
      <IndexVerificationBadge
        type="TNI"
        status="SELF_DECLARED"
        value={87}
      />
    );

    expect(screen.getByText(/TNI 87\/100 · Rất cấp thiết/i)).toBeInTheDocument();
  });

  it('renders IP verification badge for IP type', () => {
    render(
      <IndexVerificationBadge
        type="IP"
        status="VERIFIED_BY_GOV"
        authorityName="Cục SHTT"
      />
    );

    expect(screen.getByText(/✓ SHTT · Đã xác thực cơ quan QLNN/i)).toBeInTheDocument();
  });

  it('triggers onOpenMethodology callback when question mark button is clicked', () => {
    const handleOpen = vi.fn();
    render(
      <IndexVerificationBadge
        type="TRL"
        status="VERIFIED_BY_GOV"
        value={9}
        onOpenMethodology={handleOpen}
      />
    );

    const helpBtn = screen.getByLabelText(/Xem phương pháp luận TRL/i);
    fireEvent.click(helpBtn);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
