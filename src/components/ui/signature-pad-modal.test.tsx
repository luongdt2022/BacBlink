import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SignaturePadModal, TouchSignatureField } from './signature-pad-modal';

afterEach(() => {
  cleanup();
});

describe('SignaturePadModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <SignaturePadModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true with default title', () => {
    render(
      <SignaturePadModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ký Tên Xác Nhận Điện Tử')).toBeInTheDocument();
    expect(screen.getByText(/Ký tên vào khung này/i)).toBeInTheDocument();
  });

  it('triggers onClose when clicking cancel or close button', () => {
    const handleClose = vi.fn();
    render(
      <SignaturePadModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: /Hủy bỏ/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click X button
    fireEvent.click(screen.getByLabelText('Đóng bảng ký'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('blocks confirmation and displays anti-blank warning when nothing has been drawn (BR-SIG-02)', () => {
    const handleConfirm = vi.fn();
    render(
      <SignaturePadModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    // Click confirm without drawing
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));

    expect(screen.getByText('Vui lòng ký tên vào khung trước khi xác nhận!')).toBeInTheDocument();
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('allows drawing with mouse drag and confirms signature exporting Base64 (REQ-SIG-01 / TEST-SIG-02)', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();
    render(
      <SignaturePadModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    const canvas = screen.getByRole('dialog').querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    if (canvas) {
      // Simulate drawing
      fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(canvas);
    }

    // Now confirm should succeed
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.stringContaining('data:image/png;base64,')
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('clears canvas and resets hasDrawn state when clicking [Xóa nét / Ký lại]', () => {
    const handleConfirm = vi.fn();
    render(
      <SignaturePadModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    const canvas = screen.getByRole('dialog').querySelector('canvas');
    if (canvas) {
      fireEvent.mouseDown(canvas, { clientX: 20, clientY: 20 });
      fireEvent.mouseMove(canvas, { clientX: 60, clientY: 60 });
      fireEvent.mouseUp(canvas);
    }

    // Click clear button
    fireEvent.click(screen.getByRole('button', { name: /Xóa nét \/ Ký lại/i }));

    // Now confirm should be blocked again due to anti-blank check
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Sử dụng chữ ký/i }));
    expect(screen.getByText('Vui lòng ký tên vào khung trước khi xác nhận!')).toBeInTheDocument();
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});

describe('TouchSignatureField / SignatureBoxPreview Component', () => {
  it('renders unsigned placeholder state when value is empty (State 1)', () => {
    const handleChange = vi.fn();
    render(
      <TouchSignatureField
        value=""
        onChange={handleChange}
        label="Chữ ký điện tử người đại diện"
        required={true}
      />
    );

    expect(screen.getByText('Chữ ký điện tử người đại diện')).toBeInTheDocument();
    expect(screen.getByText('Bấm vào đây để ký tay / Chữ ký điện tử')).toBeInTheDocument();
    expect(screen.getByText(/Hỗ trợ ngón tay\/bút cảm ứng/i)).toBeInTheDocument();
  });

  it('opens signature modal when clicking on the unsigned placeholder box', () => {
    render(
      <TouchSignatureField
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Bấm vào đây để ký tay / Chữ ký điện tử'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders signed preview box with badge and image when value is provided (State 3)', () => {
    const handleChange = vi.fn();
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    render(
      <TouchSignatureField
        value={sampleDataUrl}
        onChange={handleChange}
      />
    );

    expect(screen.getByText(/✓ Đã ký điện tử/i)).toBeInTheDocument();
    const img = screen.getByRole('img', { name: /Chữ ký điện tử người đại diện/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', sampleDataUrl);

    // Has action buttons
    expect(screen.getByRole('button', { name: /Ký lại/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xóa chữ ký/i })).toBeInTheDocument();
  });

  it('calls onChange with empty string when clicking [Xóa chữ ký]', () => {
    const handleChange = vi.fn();
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    render(
      <TouchSignatureField
        value={sampleDataUrl}
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Xóa chữ ký/i }));
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('displays validation error message when errorMessage prop is passed (State 5)', () => {
    render(
      <TouchSignatureField
        value=""
        onChange={vi.fn()}
        errorMessage="Vui lòng ký tên xác nhận điện tử trước khi gửi phiếu khảo sát!"
      />
    );

    expect(screen.getByText('Vui lòng ký tên xác nhận điện tử trước khi gửi phiếu khảo sát!')).toBeInTheDocument();
  });
});
