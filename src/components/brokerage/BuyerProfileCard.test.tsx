import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BuyerProfileCard from './BuyerProfileCard';
import { BuyerEnterpriseProfile } from '@/types/brokerage';

describe('BuyerProfileCard Component (CR-TASK-08-DELTA-02 / ADR-0016)', () => {
  it('renders INDIVIDUAL buyer variant without tax code or factory address', () => {
    const individualProfile: BuyerEnterpriseProfile = {
      companyName: 'Nguyễn Văn An',
      provinceName: 'Đà Nẵng',
      address: 'Quận Hải Châu, Đà Nẵng',
      buyerType: 'INDIVIDUAL',
    };

    render(<BuyerProfileCard profile={individualProfile} />);

    // Assert visible elements
    expect(screen.getByTestId('buyer-profile-individual')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText(/\[Khách Hàng Cá Nhân\]/i)).toBeInTheDocument();
    expect(screen.getByText(/Thành viên cá nhân đại chúng/i)).toBeInTheDocument();
    expect(screen.getByText(/Đà Nẵng/i)).toBeInTheDocument();

    // Invariants: MUST NOT render enterprise specific fields
    expect(screen.queryByText(/Mã số thuế/i)).toBeNull();
    expect(screen.queryByText(/Quy mô nhân sự/i)).toBeNull();
    expect(screen.queryByText(/Lĩnh vực hoạt động/i)).toBeNull();
    expect(screen.queryByText(/Trụ sở \/ Nhà máy/i)).toBeNull();
  });

  it('renders EXPERT buyer variant with academic title and institution, without enterprise fields', () => {
    const expertProfile: BuyerEnterpriseProfile = {
      companyName: 'GS. TSKH. Trần Đình Long',
      academicTitle: 'GS. TSKH',
      industry: 'Viện Hàn lâm KH&CN Việt Nam',
      specializedField: 'Năng lượng tái tạo & Lưới điện thông minh',
      expertProfileId: 'expert-tdlong-001',
      buyerType: 'EXPERT',
    };

    render(<BuyerProfileCard profile={expertProfile} />);

    expect(screen.getByTestId('buyer-profile-expert')).toBeInTheDocument();
    expect(screen.getByText('GS. TSKH. Trần Đình Long')).toBeInTheDocument();
    expect(screen.getByText(/\[Chuyên Gia KH&CN\]/i)).toBeInTheDocument();
    expect(screen.getByText('GS. TSKH')).toBeInTheDocument();
    expect(screen.getByText('Viện Hàn lâm KH&CN Việt Nam')).toBeInTheDocument();
    expect(screen.getByText('Năng lượng tái tạo & Lưới điện thông minh')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem hồ sơ lý lịch khoa học chuyên gia trên Cổng/i })).toHaveAttribute(
      'href',
      '/experts/expert-tdlong-001'
    );

    // Invariants: MUST NOT render enterprise specific fields
    expect(screen.queryByText(/Mã số thuế/i)).toBeNull();
    expect(screen.queryByText(/Quy mô nhân sự/i)).toBeNull();
  });

  it('renders ENTERPRISE buyer variant with complete corporate details', () => {
    const enterpriseProfile: BuyerEnterpriseProfile = {
      enterpriseId: 'ent-vin-01',
      companyName: 'TẬP ĐOÀN CÔNG NGHỆ BÁCH KHOA',
      taxCode: '0102030405',
      industry: 'Công nghệ thông tin & Viễn thông',
      scaleCategory: 'Doanh nghiệp lớn (> 500 nhân sự)',
      address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      buyerType: 'ENTERPRISE',
    };

    render(<BuyerProfileCard profile={enterpriseProfile} />);

    expect(screen.getByTestId('buyer-profile-enterprise')).toBeInTheDocument();
    expect(screen.getByText('TẬP ĐOÀN CÔNG NGHỆ BÁCH KHOA')).toBeInTheDocument();
    expect(screen.getByText(/\[Doanh Nghiệp \/ Tổ Chức\]/i)).toBeInTheDocument();
    expect(screen.getByText('0102030405')).toBeInTheDocument();
    expect(screen.getByText('Công nghệ thông tin & Viễn thông')).toBeInTheDocument();
    expect(screen.getByText('Doanh nghiệp lớn (> 500 nhân sự)')).toBeInTheDocument();
    expect(screen.getByText(/Số 1 Đại Cồ Việt/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem hồ sơ năng lực doanh nghiệp đầy đủ trên Cổng/i })).toHaveAttribute(
      'href',
      '/doanh-nghiep/ent-vin-01'
    );
  });
});
