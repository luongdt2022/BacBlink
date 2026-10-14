"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top Navigation Progress Bar cho toàn bộ dự án NacenTwin.
 * Kích hoạt tức thì khi người dùng click vào các liên kết nội bộ,
 * tạo cảm giác phản hồi nhanh <100ms chuẩn phong cách SaaS hiện đại.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  // Khi pathname hoặc searchParams thay đổi (trang đã tải xong), hoàn thành thanh tiến trình
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Bắt sự kiện click link nội bộ để kích hoạt loader ngay tức thì
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      // Bỏ qua các link ngoại tuyến, mở tab mới, anchor hash hoặc file download
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

      // Kiểm tra xem có phải link nội bộ và khác URL hiện tại không
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(href, window.location.href);

      if (
        targetUrl.origin === currentUrl.origin &&
        (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
      ) {
        startTransition(() => {
          setVisible(true);
          setProgress(25);
        });
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
        if (prev >= 85) return prev;
        if (prev < 50) return prev + 15;
        return prev + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [visible, progress]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Đang tải trang"
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-teal-400/80 via-emerald-400/70 to-brand-500/70 transition-all duration-200 ease-out shadow-[0_0_4px_rgba(45,154,133,0.3)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 0.9 : 0,
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}
