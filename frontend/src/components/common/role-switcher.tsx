'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, ArrowLeftRight, Check, Loader2, Sparkles } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { fetchMyEnterpriseProfile, switchEnterpriseActiveRole, activateEnterpriseCapability } from '@/lib/enterprise-client';
import { useToast } from './toast';

interface RoleSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function RoleSwitcher({ compact = false, className = '' }: RoleSwitcherProps) {
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [activeRole, setActiveRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [isDual, setIsDual] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  useEffect(() => {
    const user = authClient.getUser();
    if (!user) return;

    const userUpper = user.role?.toUpperCase() ?? '';
    if (userUpper === 'ENTERPRISE') {
      setIsDual(true);
    }

    // Load active role from cache first for fast render (<300ms)
    const cachedRole = localStorage.getItem('nacentwin_active_role') as 'BUYER' | 'SELLER' | null;
    if (cachedRole) {
      setActiveRole(cachedRole);
    } else if (userUpper === 'SELLER') {
      setActiveRole('SELLER');
    } else {
      setActiveRole('BUYER');
    }

    // Fetch live profile to check capability tier
    fetchMyEnterpriseProfile()
      .then((p) => {
        if (p) {
          setProfile(p);
          const dual = p.capabilityTier === 'DUAL' || (p.isBuyer && p.isSeller) || userUpper === 'ENTERPRISE';
          setIsDual(dual);
          const currentRole = (p.activeRole?.toUpperCase() === 'SELLER' ? 'SELLER' : 'BUYER') as 'BUYER' | 'SELLER';
          setActiveRole(currentRole);
          localStorage.setItem('nacentwin_active_role', currentRole);
        }
      })
      .catch(() => {
        // Fallback for non-enterprise or offline
      });
  }, []);

  const handleSwitchRole = async (targetRole: 'BUYER' | 'SELLER') => {
    if (activeRole === targetRole || isSwitching) return;

    setIsSwitching(true);
    // 1. Optimistic client update (<300ms response)
    setActiveRole(targetRole);
    localStorage.setItem('nacentwin_active_role', targetRole);

    try {
      // Tự động kích hoạt năng lực nếu chưa bật trên hồ sơ
      if (targetRole === 'BUYER' && profile && !profile.isBuyer) {
        try {
          const updated = await activateEnterpriseCapability('BUYER');
          setProfile(updated);
        } catch {
          // Bỏ qua nếu backend đã tự hồi phục năng lực
        }
      } else if (targetRole === 'SELLER' && profile && !profile.isSeller) {
        try {
          const updated = await activateEnterpriseCapability('SELLER');
          setProfile(updated);
        } catch {
          // Bỏ qua nếu backend đã tự hồi phục năng lực
        }
      }

      await switchEnterpriseActiveRole(targetRole);

      // Giữ nguyên user.role (ENTERPRISE) trong session, chỉ đồng bộ activeRole (BUYER | SELLER) theo ADR-0018
      // Phát sự kiện toàn cục để layout và menu sidebar đồng bộ ngay lập tức
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nacentwin_role_switched', { detail: { role: targetRole } }));
      }

      toast.success(
        `Đã chuyển sang không gian ${targetRole === 'BUYER' ? 'Bên Mua (Tìm Mua Công Nghệ)' : 'Bên Bán (Gian Hàng & Chuyển Giao)'}.`,
        'Chuyển vai trò thành công'
      );

      // Trigger navigation / reload portal state
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (targetRole === 'SELLER' && currentPath.startsWith('/portal/buyer')) {
          router.push('/portal');
          return;
        }
        if (targetRole === 'BUYER' && currentPath.startsWith('/portal/seller')) {
          router.push('/portal');
          return;
        }
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Không thể chuyển đổi vai trò. Vui lòng thử lại.', 'Lỗi');
      // Revert optimistic update
      const reverted = targetRole === 'BUYER' ? 'SELLER' : 'BUYER';
      setActiveRole(reverted);
      localStorage.setItem('nacentwin_active_role', reverted);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleActivateMissingCapability = async (cap: 'BUYER' | 'SELLER') => {
    setIsLoading(true);
    try {
      const updated = await activateEnterpriseCapability(cap);
      setProfile(updated);
      setIsDual(true);
      toast.success(
        `Đã kích hoạt thành công năng lực ${cap === 'BUYER' ? 'Bên Mua' : 'Bên Bán'}. Bạn hiện có thể chuyển đổi linh hoạt chế độ Kép (Dual Mode).`,
        'Kích hoạt thành công'
      );
      await handleSwitchRole(cap);
    } catch (err: any) {
      toast.error(err.message || 'Kích hoạt năng lực thất bại.', 'Lỗi kích hoạt');
    } finally {
      setIsLoading(false);
    }
  };

  // Only render for enterprise personas (ENTERPRISE + legacy BUYER, SELLER, INNOVATION_ENTITY)
  const user = authClient.getUser();
  if (!user) return null;
  const userRole = (user.role ?? '').toUpperCase();
  const isEnterpriseRole = ['ENTERPRISE', 'BUYER', 'SELLER', 'INNOVATION_ENTITY'].includes(userRole);
  if (!isEnterpriseRole) return null;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 ${className}`}>
        <button
          type="button"
          onClick={() => isDual ? handleSwitchRole('BUYER') : handleActivateMissingCapability('BUYER')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
            activeRole === 'BUYER'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
          }`}
          title={isDual ? 'Chuyển sang Bên Mua' : 'Kích hoạt vai trò Bên Mua'}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Mua</span>
        </button>
        <button
          type="button"
          onClick={() => isDual ? handleSwitchRole('SELLER') : handleActivateMissingCapability('SELLER')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
            activeRole === 'SELLER'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300'
          }`}
          title={isDual ? 'Chuyển sang Bên Bán' : 'Kích hoạt vai trò Bên Bán'}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Bán</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`p-2.5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3 text-teal-500" />
          {isDual ? 'Chế Độ Kép (Dual Mode)' : 'Vai Trò Chủ Thể'}
        </span>
        {isDual ? (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-extrabold">
            DUAL
          </span>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleActivateMissingCapability(activeRole === 'BUYER' ? 'SELLER' : 'BUYER')}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold flex items-center gap-0.5"
          >
            <Sparkles className="w-2.5 h-2.5" />
            + Mở Dual Mode
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          disabled={isSwitching}
          onClick={() => isDual ? handleSwitchRole('BUYER') : handleActivateMissingCapability('BUYER')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition ${
            activeRole === 'BUYER'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Bên Mua</span>
          {activeRole === 'BUYER' && <Check className="w-3 h-3 shrink-0 ml-auto" />}
        </button>

        <button
          type="button"
          disabled={isSwitching}
          onClick={() => isDual ? handleSwitchRole('SELLER') : handleActivateMissingCapability('SELLER')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition ${
            activeRole === 'SELLER'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <Store className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Bên Bán</span>
          {activeRole === 'SELLER' && <Check className="w-3 h-3 shrink-0 ml-auto" />}
        </button>
      </div>
    </div>
  );
}
