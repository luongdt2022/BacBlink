import React from 'react';
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import OrderTrackingStepper, {
  ORDER_STEPS,
  mapStatusToStepIndex,
} from './OrderTrackingStepper';

describe('OrderTrackingStepper (CR-TASK-03-DELTA-02 / Task 6.3)', () => {
  afterEach(() => {
    cleanup();
  });

  it('mapStatusToStepIndex correctly maps all domain statuses', () => {
    expect(mapStatusToStepIndex('SUBMITTED').stepIndex).toBe(0);
    expect(mapStatusToStepIndex('PENDING').stepIndex).toBe(0);
    expect(mapStatusToStepIndex('PROCESSING').stepIndex).toBe(1);
    expect(mapStatusToStepIndex('VERIFIED').stepIndex).toBe(1);
    expect(mapStatusToStepIndex('NEGOTIATING').stepIndex).toBe(2);
    expect(mapStatusToStepIndex('COMPLETED').stepIndex).toBe(3);

    const cancelled = mapStatusToStepIndex('CANCELLED');
    expect(cancelled.stepIndex).toBe(-1);
    expect(cancelled.isCancelled).toBe(true);

    const rejected = mapStatusToStepIndex('REJECTED');
    expect(rejected.stepIndex).toBe(-1);
    expect(rejected.isRejected).toBe(true);
  });

  it('renders all 4 linear steps in detailed view with labels', () => {
    render(<OrderTrackingStepper status="SUBMITTED" compact={false} />);

    expect(screen.getByText(/1\.\s*Tiếp nhận đơn/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.\s*Xử lý & Báo giá/i)).toBeInTheDocument();
    expect(screen.getByText(/3\.\s*Thỏa thuận giao dịch/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.\s*Hoàn tất/i)).toBeInTheDocument();
    expect(ORDER_STEPS[1].description).toBe('Bên bán đã tiếp nhận & đang kiểm tra năng lực / lập báo giá');
  });

  it('renders correctly for PROCESSING status (step 2 active, step 1 completed with checkmark)', () => {
    const { container } = render(<OrderTrackingStepper status="PROCESSING" compact={false} />);

    expect(screen.getByText(/2\.\s*Xử lý & Báo giá/i)).toBeInTheDocument();
    expect(screen.getByText(/Bên bán đã tiếp nhận & đang kiểm tra năng lực \/ lập báo giá/i)).toBeInTheDocument();

    // Bước 1 có icon hoàn tất CheckCircle2 trong nền xanh ngọc emerald
    const completedBadge = container.querySelector('.bg-emerald-600');
    expect(completedBadge).not.toBeNull();

    // Bước 2 có hiệu ứng active pulse ring
    const activePulse = container.querySelector('.animate-pulse');
    expect(activePulse).not.toBeNull();
  });

  it('renders correctly for NEGOTIATING status (step 3 active, step 1 & 2 completed)', () => {
    render(<OrderTrackingStepper status="NEGOTIATING" compact={false} />);

    expect(screen.getByText(/3\.\s*Thỏa thuận giao dịch/i)).toBeInTheDocument();
  });

  it('renders CANCELLED exception state with warning message', () => {
    render(
      <OrderTrackingStepper
        status="CANCELLED"
        compact={false}
        cancelReason="Bên mua thay đổi kế hoạch"
      />
    );

    expect(screen.getByText(/Đơn hàng đã được hủy/i)).toBeInTheDocument();
    expect(screen.getByText(/Bên mua thay đổi kế hoạch/i)).toBeInTheDocument();
  });

  it('renders REJECTED exception state with alert', () => {
    render(
      <OrderTrackingStepper
        status="REJECTED"
        compact={false}
        cancelReason="Kho tạm thời hết hàng"
      />
    );

    expect(screen.getByText(/Đơn hàng bị từ chối/i)).toBeInTheDocument();
    expect(screen.getByText(/Kho tạm thời hết hàng/i)).toBeInTheDocument();
  });

  it('renders compact mode for table views', () => {
    render(<OrderTrackingStepper status="PROCESSING" compact={true} />);

    expect(screen.getByText('Xử lý & Báo giá')).toBeInTheDocument();
  });

  it('renders compact mode with CANCELLED badge', () => {
    render(<OrderTrackingStepper status="CANCELLED" compact={true} />);

    expect(screen.getByText('Đã hủy đơn')).toBeInTheDocument();
  });
});
