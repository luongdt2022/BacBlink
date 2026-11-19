import { useState, useEffect } from 'react';
import { getUnreadCount } from '../api/notification';

const POLL_INTERVAL_MS = 10_000;

export function useNotificationPolling(): { unreadCount: number } {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const count = await getUnreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // Silently retain last known count on error
      }
    };

    fetchCount();
    const intervalId = setInterval(fetchCount, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return { unreadCount };
}
