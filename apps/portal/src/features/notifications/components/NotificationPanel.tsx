import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Handshake, X, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  type Notification,
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
} from '../api/notification';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { cn } from '@/shared/components/ui/utils';
import { buildDetailPathByType } from '@/features/intakes/utils/intakeRoutes';

const PAGE_SIZE = 15;

interface NotificationPanelProps {
  onClose: () => void;
  onUnreadChange: (delta: number) => void;
  panelRef?: RefObject<HTMLDivElement>;
}

export function NotificationPanel({ onClose, onUnreadChange, panelRef }: NotificationPanelProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const hasMore = currentPage < totalPages;

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    getNotifications(1, PAGE_SIZE)
      .then((res) => {
        setNotifications(res.data);
        setTotalPages(res.totalPages);
        setCurrentPage(1);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  // Load next page
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const res = await getNotifications(nextPage, PAGE_SIZE);
      setNotifications((prev) => [...prev, ...res.data]);
      setCurrentPage(nextPage);
      setTotalPages(res.totalPages);
    } catch {
      // silent
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: scrollRef.current, rootMargin: '80px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleItemClick = async (n: Notification) => {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
      onUnreadChange(-1);
      try {
        await markRead(n.id);
      } catch {
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: false } : item)),
        );
        onUnreadChange(1);
        toast.error('Không thể đánh dấu đã đọc. Vui lòng thử lại.');
      }
    }

    let path = n.payload?.navigationPath ?? '/ips';
    if (n.type === 'match_found') {
      const payload = n.payload as { intakeId?: string; intakeType?: 'ip' | 'challenge' };
      if (payload.intakeId && payload.intakeType) {
        path = `${buildDetailPathByType(payload.intakeType, payload.intakeId)}?tab=matches`;
      }
    } else if (n.type === 'collaboration_request_received') {
      path = '/my/collaboration-requests?tab=received';
    } else if (
      n.type === 'collaboration_request_accepted' ||
      n.type === 'collaboration_request_rejected'
    ) {
      path = '/my/collaboration-requests?tab=sent';
    }

    navigate(path);
    onClose();
  };

  const handleMarkAllRead = async () => {
    const prev = notifications;
    const unreadWas = notifications.filter((n) => !n.isRead).length;
    if (unreadWas === 0) return;

    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    onUnreadChange(-unreadWas);

    try {
      await markAllRead();
    } catch {
      setNotifications(prev);
      onUnreadChange(unreadWas);
      toast.error('Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (n: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = notifications;
    const wasUnread = !n.isRead;

    setNotifications((list) => list.filter((item) => item.id !== n.id));
    if (wasUnread) onUnreadChange(-1);

    try {
      await deleteNotification(n.id);
    } catch {
      setNotifications(prev);
      if (wasUnread) onUnreadChange(1);
      toast.error('Không thể xóa thông báo. Vui lòng thử lại.');
    }
  };

  const executeDeleteAll = async () => {
    const prev = notifications;
    const unreadWas = notifications.filter((n) => !n.isRead).length;
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteAll(false);
    setNotifications([]);
    onUnreadChange(-unreadWas);

    try {
      await deleteAllNotifications();
    } catch {
      setNotifications(prev);
      onUnreadChange(unreadWas);
      toast.error('Không thể xóa tất cả thông báo. Vui lòng thử lại.');
    }
  };

  const handleDeleteAllClick = () => {
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      confirmTimerRef.current = setTimeout(() => setConfirmDeleteAll(false), 4000);
    } else {
      void executeDeleteAll();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute right-0 top-[calc(100%+0.625rem)] z-50',
        'flex w-[min(24rem,calc(100vw-1rem))] flex-col',
        'overflow-hidden rounded-2xl border border-border/60 bg-card',
        'shadow-xl shadow-black/[0.08]',
        // Slide-down entrance
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150',
      )}
      style={{ maxHeight: 'min(32rem, calc(100svh - var(--header-height) - 2rem))' }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-4 py-3">
        <h3 className="flex-1 text-sm font-semibold text-foreground">
          Thông báo
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              title="Đánh dấu tất cả đã đọc"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Body — scrollable */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="space-y-px p-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[4.5rem] animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Bell className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Chưa có thông báo nào</p>
          </div>
        ) : (
          <ul className="p-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <div
                  onClick={() => void handleItemClick(n)}
                  className={cn(
                    'group flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60',
                    !n.isRead && 'bg-primary/[0.04] hover:bg-primary/[0.07]',
                  )}
                >
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'collaboration_request_received' ||
                    n.type === 'collaboration_request_accepted' ||
                    n.type === 'collaboration_request_rejected' ? (
                      <div
                        className={cn(
                          'flex size-7 items-center justify-center rounded-lg',
                          !n.isRead
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Handshake className="size-3.5" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex size-7 items-center justify-center rounded-lg',
                          !n.isRead
                            ? 'bg-blue-50 text-blue-500'
                            : 'bg-muted text-muted-foreground/50',
                        )}
                      >
                        <Bell className="size-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        !n.isRead ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {n.payload?.message ?? 'Thông báo mới'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot + delete */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                    {!n.isRead && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                    <button
                      onClick={(e) => void handleDelete(n, e)}
                      className="size-5 rounded flex items-center justify-center text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              </li>
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore && (
              <div className="flex items-center justify-center py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border/50 px-4 py-2.5">
          {!confirmDeleteAll ? (
            <button
              onClick={handleDeleteAllClick}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3" />
              Xóa tất cả
            </button>
          ) : (
            <span className="flex items-center gap-2 text-xs">
              <span className="text-destructive">Xác nhận xóa tất cả?</span>
              <button
                onClick={() => void executeDeleteAll()}
                className="font-medium text-destructive hover:underline"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
                  setConfirmDeleteAll(false);
                }}
                className="text-muted-foreground hover:underline"
              >
                Hủy
              </button>
            </span>
          )}
          {hasMore && !isLoadingMore && (
            <span className="text-[11px] text-muted-foreground/50">Cuộn để xem thêm</span>
          )}
        </div>
      )}
    </div>
  );
}
