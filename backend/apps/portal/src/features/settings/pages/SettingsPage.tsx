import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/shared/components/ui/switch';
import { getMySettings, updateMySettings, type UserSettings } from '../api/settings';

// T005: SettingsPage with loading / error / success states
// T006: matchingAuto optimistic toggle with revert-on-failure
// T007: sonner toasts for save feedback
// T013: page heading consistent with other pages

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getMySettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải cài đặt');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMatchingAutoToggle(newValue: boolean) {
    if (!settings || isSaving) return;

    // Optimistic update
    const previous = settings.matchingAuto;
    setSettings({ ...settings, matchingAuto: newValue });
    setIsSaving(true);

    try {
      await updateMySettings({ matchingAuto: newValue });
      toast.success('Đã lưu cài đặt');
    } catch {
      // Revert optimistic update on failure
      setSettings({ ...settings, matchingAuto: previous });
      toast.error('Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Cài đặt</h1>
          <p className="mt-1 text-sm text-gray-600">Quản lý các tùy chọn cá nhân của bạn</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-medium text-gray-900">Tự động khớp (Auto-Matching)</h2>

          {isLoading && (
            <div className="flex items-center gap-3 py-2">
              <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
              <span className="text-sm text-gray-500">Đang tải...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isLoading && !error && settings && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700">
                  Tự động chạy khớp khi đăng ký Cung hoặc Cầu mới
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Khi tắt, hệ thống sẽ không tự động tìm kiếm kết quả khớp cho các đăng ký mới.
                </p>
              </div>
              <Switch
                checked={settings.matchingAuto}
                onCheckedChange={handleMatchingAutoToggle}
                disabled={isSaving}
                aria-label="Bật/tắt tự động khớp"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
