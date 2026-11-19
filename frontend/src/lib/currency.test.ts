import { describe, it, expect } from 'vitest';
import { formatCurrencyMillionVnd } from './currency';

describe('formatCurrencyMillionVnd', () => {
  describe('Giá trị rỗng, 0 hoặc null/undefined', () => {
    it('trả về "0 VNĐ" mặc định khi giá trị là null hoặc undefined hoặc 0', () => {
      expect(formatCurrencyMillionVnd(null)).toBe('0 VNĐ');
      expect(formatCurrencyMillionVnd(undefined)).toBe('0 VNĐ');
      expect(formatCurrencyMillionVnd(0)).toBe('0 VNĐ');
    });

    it('trả về "0 Tr" khi options.compact là true', () => {
      expect(formatCurrencyMillionVnd(null, { compact: true })).toBe('0 Tr');
      expect(formatCurrencyMillionVnd(undefined, { compact: true })).toBe('0 Tr');
      expect(formatCurrencyMillionVnd(0, { compact: true })).toBe('0 Tr');
    });

    it('trả về options.emptyLabel nếu được chỉ định', () => {
      expect(formatCurrencyMillionVnd(null, { emptyLabel: 'Chưa xác định' })).toBe('Chưa xác định');
      expect(formatCurrencyMillionVnd(0, { emptyLabel: 'Miễn phí' })).toBe('Miễn phí');
    });
  });

  describe('Giá trị < 1.000 triệu VNĐ', () => {
    it('định dạng chuẩn "X Triệu VNĐ"', () => {
      expect(formatCurrencyMillionVnd(500)).toBe('500 Triệu VNĐ');
      expect(formatCurrencyMillionVnd(850.4)).toBe('850 Triệu VNĐ');
      expect(formatCurrencyMillionVnd(999)).toBe('999 Triệu VNĐ');
    });

    it('định dạng compact "X Tr"', () => {
      expect(formatCurrencyMillionVnd(500, { compact: true })).toBe('500 Tr');
      expect(formatCurrencyMillionVnd(850, { compact: true })).toBe('850 Tr');
    });
  });

  describe('Giá trị >= 1.000 triệu VNĐ (quy đổi sang Tỷ)', () => {
    it('định dạng chuẩn "X,X Tỷ VNĐ"', () => {
      expect(formatCurrencyMillionVnd(1000)).toBe('1 Tỷ VNĐ');
      expect(formatCurrencyMillionVnd(1200)).toBe('1,2 Tỷ VNĐ');
      expect(formatCurrencyMillionVnd(5500)).toBe('5,5 Tỷ VNĐ');
      expect(formatCurrencyMillionVnd(10000)).toBe('10 Tỷ VNĐ');
    });

    it('định dạng compact "X,X Tỷ"', () => {
      expect(formatCurrencyMillionVnd(1000, { compact: true })).toBe('1 Tỷ');
      expect(formatCurrencyMillionVnd(1200, { compact: true })).toBe('1,2 Tỷ');
      expect(formatCurrencyMillionVnd(5500, { compact: true })).toBe('5,5 Tỷ');
    });
  });
});
