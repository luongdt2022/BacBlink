"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const FAIL_SAFE_TIMEOUT_MS = 15000;
const COMPLETE_HIDE_DELAY_MS = 250;

/**
 * Top Navigation Progress Bar cho toàn bộ cổng thông tin BACLINK.
 * Kích hoạt đồng bộ tức thì (<50ms) khi người dùng click liên kết nội bộ.
 */
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString() ?? "";
  const currentRouteKey = `${pathname}?${searchParamsKey}`;

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const visibleRef = useRef(false);
  const prevRouteKeyRef = useRef(currentRouteKey);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, []);

  // Khi pathname hoặc searchParams thay đổi (route mới đã mount), hoàn tất và ẩn thanh tiến trình
  useEffect(() => {
    if (prevRouteKeyRef.current === currentRouteKey) return;
    prevRouteKeyRef.current = currentRouteKey;

    if (!visibleRef.current) return;

    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
    }

    setProgress(100);
    completionTimerRef.current = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
      setProgress(0);
      completionTimerRef.current = null;
    }, COMPLETE_HIDE_DELAY_MS);
  }, [currentRouteKey]);

  // Bắt sự kiện click link nội bộ (capture phase) để kích hoạt đồng bộ tức thì
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        targetAttr === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      let currentUrl: URL;
      let targetUrl: URL;
      try {
        currentUrl = new URL(window.location.href);
        targetUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (targetUrl.origin !== currentUrl.origin) return;

      if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
        if (completionTimerRef.current) {
          clearTimeout(completionTimerRef.current);
          completionTimerRef.current = null;
        }
        visibleRef.current = true;
        setVisible(true);
        setProgress(25);
      } else if (visibleRef.current) {
        if (completionTimerRef.current) {
          clearTimeout(completionTimerRef.current);
          completionTimerRef.current = null;
        }
        visibleRef.current = false;
        setVisible(false);
        setProgress(0);
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, []);

  // Hiệu ứng tăng dần tiến độ khi đang tải
  useEffect(() => {
    if (!visible || progress >= 90) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (!visibleRef.current || prev === 0 || prev >= 85) return prev;
        if (prev < 50) return prev + 15;
        return prev + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [visible, progress]);

  // Fail-safe timeout tự đóng nếu điều hướng bị hủy hoặc quá hạn
  useEffect(() => {
    if (!visible) return;

    const failSafeTimer = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
      setProgress(0);
    }, FAIL_SAFE_TIMEOUT_MS);

    return () => clearTimeout(failSafeTimer);
  }, [visible]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Đang tải trang"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-brand-500 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(6,182,212,0.5)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <React.Suspense fallback={null}>
      <NavigationProgressInner />
    </React.Suspense>
  );
}
