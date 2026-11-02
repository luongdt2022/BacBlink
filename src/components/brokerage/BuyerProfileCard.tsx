'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  User,
  GraduationCap,
  MapPin,
  ExternalLink,
  Award,
  Layers,
  Users,
} from 'lucide-react';
import { BuyerEnterpriseProfile, BuyerType } from '@/types/brokerage';

interface BuyerProfileCardProps {
  profile: BuyerEnterpriseProfile;
  buyerType?: BuyerType;
  className?: string;
}

export default function BuyerProfileCard({
  profile,
  buyerType: buyerTypeProp,
  className = '',
}: BuyerProfileCardProps) {
  // Xác định chính xác loại hình bên mua (ưu tiên prop, rồi tới profile.buyerType, fallback theo đặc trưng)
  const resolvedBuyerType: BuyerType =
    buyerTypeProp ||
    profile.buyerType ||
    (profile.expertProfileId || profile.academicTitle ? 'EXPERT' : profile.taxCode ? 'ENTERPRISE' : 'ENTERPRISE');

  // =========================================================================
  // BIẾN THỂ 1: CÁ NHÂN (INDIVIDUAL)
  // =========================================================================
  if (resolvedBuyerType === 'INDIVIDUAL') {
    return (
      <div
        data-testid="buyer-profile-individual"
        className={`bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" /> 👤 Hồ Sơ Khách Hàng Cá Nhân
          </span>
          <span className="inline-flex items-center gap-1 text-caption font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            <User className="w-3 h-3" /> [Khách Hàng Cá Nhân]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Họ và tên người mua:</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
              {profile.companyName}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Phân loại chủ thể:</span>
            <div className="font-semibold text-blue-700 dark:text-blue-300">
              Thành viên cá nhân đại chúng
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <span className="text-slate-400 font-medium">Tỉnh / Thành phố sinh sống:</span>
            <div className="font-medium text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{profile.provinceName || profile.address || 'Toàn quốc'}</span>
            </div>
          </div>
        </div>

        {/* TUYỆT ĐỐI ẨN BỎ: MST, Quy mô nhân sự, Lĩnh vực hoạt động doanh nghiệp, Trụ sở nhà máy, Link hồ sơ doanh nghiệp */}
      </div>
    );
  }

  // =========================================================================
  // BIẾN THỂ 2: CHUYÊN GIA KH&CN (EXPERT)
  // =========================================================================
  if (resolvedBuyerType === 'EXPERT') {
    return (
      <div
        data-testid="buyer-profile-expert"
        className={`bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-purple-600" /> 🎓 Hồ Sơ Chuyên Gia KH&CN
          </span>
          <span className="inline-flex items-center gap-1 text-caption font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
            <GraduationCap className="w-3 h-3" /> [Chuyên Gia KH&CN]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Họ và tên chuyên gia:</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
              {profile.companyName}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Học hàm / Học vị:</span>
            <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{profile.academicTitle || 'Chuyên gia nghiên cứu'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Cơ quan / Viện / Trường công tác:</span>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {profile.industry || 'Cơ quan / Viện nghiên cứu'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Lĩnh vực chuyên môn:</span>
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{profile.specializedField || 'Nghiên cứu & Chuyển giao KH&CN'}</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <span className="text-slate-400 font-medium">Địa bàn hoạt động:</span>
            <div className="font-medium text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{profile.provinceName || profile.address || 'Toàn quốc'}</span>
            </div>
          </div>
        </div>

        {profile.expertProfileId && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <Link
              href={`/experts/${profile.expertProfileId}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
            >
              <span>Xem hồ sơ lý lịch khoa học chuyên gia trên Cổng</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* TUYỆT ĐỐI ẨN BỎ: MST, Quy mô doanh nghiệp, Trụ sở nhà máy */}
      </div>
    );
  }

  // =========================================================================
  // BIẾN THỂ 3: DOANH NGHIỆP / TỔ CHỨC (ENTERPRISE)
  // =========================================================================
  return (
    <div
      data-testid="buyer-profile-enterprise"
      className={`bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-600" /> 🏢 Hồ Sơ Pháp Nhân Doanh Nghiệp
        </span>
        <span className="inline-flex items-center gap-1 text-caption font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <Building2 className="w-3.5 h-3.5" /> [Doanh Nghiệp / Tổ Chức]
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Tên doanh nghiệp:</span>
          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
            {profile.companyName}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Mã số thuế:</span>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {profile.taxCode || 'Đang cập nhật'}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Lĩnh vực hoạt động:</span>
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {profile.industry || 'Đa ngành nghề'}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 font-medium">Quy mô nhân sự:</span>
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.scaleCategory || 'Doanh nghiệp vừa và nhỏ (SME)'}</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-1">
          <span className="text-slate-400 font-medium">Địa chỉ trụ sở / Nhà máy:</span>
          <div className="font-medium text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{profile.address || profile.provinceName || 'Toàn quốc'}</span>
          </div>
        </div>
      </div>

      {profile.enterpriseId && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <Link
            href={`/doanh-nghiep/${profile.enterpriseId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline"
          >
            <span>Xem hồ sơ năng lực doanh nghiệp đầy đủ trên Cổng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
