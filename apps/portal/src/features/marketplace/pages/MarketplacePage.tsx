import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import { SearchInput } from '@/shared/components/SearchInput';
import { Pagination } from '@/shared/components/Pagination';
import {
  ChallengeFilters,
  IPFilters,
  type MarketplaceSectorOption,
} from '@/features/marketplace/components/MarketplaceFilters';
import { IPCard, type IPCardData } from '@/features/marketplace/components/IPCard';
import {
  getMarketplaceIntakes,
  getSectors,
  type MarketplaceIntakeDetail,
  type IntakeStatus,
  type IntakeType,
} from '@/features/intakes/api/intake';

const PAGE_SIZE = 9;
const DEFAULT_INTAKE_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 750'%3E%3Crect width='1200' height='750' fill='%23f1f8f0'/%3E%3Cg transform='rotate(-15, 600, 375)'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23137F79' font-family='Inter, system-ui, sans-serif' font-size='180' font-weight='900' letter-spacing='0.05em' opacity='0.07'%3ENACENTECH%3C/text%3E%3C/g%3E%3C/svg%3E";

type MarketplaceIntake = {
  id: string;
  title: string;
  type: IntakeType;
  status: IntakeStatus;
  imageUrl: string;
  sectors: Array<{ id: string; name: string }>;
  createdAt: string;
};

interface MarketplacePageProps {
  onViewIPDetail: (id: string) => void;
  onViewChallengeDetail: (id: string) => void;
  onNavigate?: (itemId: string) => void;
  onActionClick?: (id: string, action: string) => void;
}

function formatPublishedLabel(createdAt: string) {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Ngày tạo chưa xác định';
  }

  return `Cập nhật ${new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)}`;
}


function toMarketplaceIntake(item: MarketplaceIntakeDetail): MarketplaceIntake {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    status: item.status,
    imageUrl: item.profilePicUrl || DEFAULT_INTAKE_IMAGE,
    sectors:
      item.intakeSectors?.map((s) => ({ id: s.sectorId, name: s.sector.name })) ?? [],
    createdAt: item.createdAt,
  };
}

export function MarketplacePage({
  onViewIPDetail,
  onViewChallengeDetail,
  onNavigate,
  onActionClick,
}: MarketplacePageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'ip' | 'challenge'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIpSectorId, setSelectedIpSectorId] = useState<string | null>(null);
  const [selectedChallengeSectorId, setSelectedChallengeSectorId] = useState<string | null>(null);
  const [selectedAllSectorId, setSelectedAllSectorId] = useState<string | null>(null);
  const [ipPage, setIpPage] = useState(1);
  const [challengePage, setChallengePage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [marketplaceIntakes, setMarketplaceIntakes] = useState<MarketplaceIntake[]>([]);
  const [sectorOptions, setSectorOptions] = useState<MarketplaceSectorOption[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [sectorError, setSectorError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadSectors = async () => {
      try {
        const sectors = await getSectors();
        if (isCancelled) return;

        setSectorOptions(
          sectors.map((sector) => ({
            id: sector.id,
            label: sector.name,
          }))
        );
        setSectorError(null);
      } catch {
        if (!isCancelled) {
          setSectorOptions([]);
          setSectorError('Không tải được danh mục lĩnh vực. Bạn vẫn có thể xem dữ liệu hiện có.');
        }
      }
    };

    void loadSectors();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setIpPage(1);
    setChallengePage(1);
    setAllPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setIpPage(1);
  }, [selectedIpSectorId]);

  useEffect(() => {
    setChallengePage(1);
  }, [selectedChallengeSectorId]);

  useEffect(() => {
    let isCancelled = false;

    const loadMarketplaceData = async () => {
      setIsLoading(true);
      setPageError(null);

      const currentPage = activeTab === 'ip' ? ipPage : activeTab === 'challenge' ? challengePage : allPage;
      const selectedSectorId =
        activeTab === 'ip' ? selectedIpSectorId : activeTab === 'challenge' ? selectedChallengeSectorId : selectedAllSectorId;

      try {
        const response = await getMarketplaceIntakes({
          page: currentPage,
          limit: PAGE_SIZE,
          type: activeTab === 'all' ? undefined : activeTab,
          search: searchQuery.trim() || undefined,
          sectorId: selectedSectorId ?? undefined,
        });

        if (isCancelled) return;

        setMarketplaceIntakes(response.data.map(toMarketplaceIntake));
        setTotalPages(Math.max(response.totalPages, 1));
        setTotalResults(response.total);
      } catch (error) {
        if (!isCancelled) {
          setPageError(error instanceof Error ? error.message : 'Không tải được dữ liệu marketplace.');
          setMarketplaceIntakes([]);
          setTotalPages(1);
          setTotalResults(0);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMarketplaceData();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, ipPage, challengePage, allPage, searchQuery, selectedIpSectorId, selectedChallengeSectorId, selectedAllSectorId]);

  const currentPage = activeTab === 'ip' ? ipPage : activeTab === 'challenge' ? challengePage : allPage;
  const setCurrentPage = activeTab === 'ip' ? setIpPage : activeTab === 'challenge' ? setChallengePage : setAllPage;

  const ipData: IPCardData[] = marketplaceIntakes.map((intake) => ({
    id: intake.id,
    title: intake.title,
    owner: 'Đơn vị đăng tải trên DMST',
    imageUrl: intake.imageUrl,
    sectors: intake.sectors.map((sector) => sector.name),
    publishedLabel: formatPublishedLabel(intake.createdAt),
  }));


  const renderLoadingState = () => (
    <ResponsivePageSection className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="h-4 w-20 rounded-full bg-slate-200" />
        <div className="mt-3 h-7 w-44 rounded-full bg-slate-200 sm:w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="aspect-[16/10] bg-slate-100" />
            <div className="space-y-3 p-4 sm:p-5">
              <div className="h-5 w-5/6 rounded-full bg-slate-100" />
              <div className="h-4 w-3/5 rounded-full bg-slate-100" />
              <div className="h-10 w-28 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </ResponsivePageSection>
  );

  const renderErrorState = () => (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50/70 px-4 py-8 text-center sm:min-h-[320px] sm:px-6">
      <AlertCircle className="size-10 text-red-500" />
      <h2 className="mt-4 text-lg font-semibold text-slate-950">Không tải được dữ liệu marketplace</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{pageError}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        <RefreshCw className="size-4" />
        Tải lại trang
      </button>
    </div>
  );

  return (
    <DashboardLayout contentOnly activeMenuItem="marketplace" onNavigate={onNavigate}>
      <div className="responsive-page-stack px-4 py-4 sm:px-6 sm:py-5 lg:px-6 lg:py-6">
        <ResponsivePageSection className="border-slate-200/70 bg-white/80 p-4 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Sàn giao dịch Công nghệ Quốc gia
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Khám phá công nghệ sẵn sàng chuyển giao và các bài toán doanh nghiệp đang cần lời giải.
              </p>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm công nghệ, bài toán, hoặc lĩnh vực..."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Loại</label>
                <Select value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'ip' | 'challenge')}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="ip">Cung</SelectItem>
                    <SelectItem value="challenge">Cầu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                {activeTab === 'ip' ? (
                  <IPFilters
                    sectors={sectorOptions}
                    selectedSectorId={selectedIpSectorId}
                    onSectorChange={setSelectedIpSectorId}
                  />
                ) : activeTab === 'challenge' ? (
                  <ChallengeFilters
                    sectors={sectorOptions}
                    selectedSectorId={selectedChallengeSectorId}
                    onSectorChange={setSelectedChallengeSectorId}
                  />
                ) : (
                  <IPFilters
                    sectors={sectorOptions}
                    selectedSectorId={selectedAllSectorId}
                    onSectorChange={setSelectedAllSectorId}
                  />
                )}
                {sectorError && <p className="mt-1 text-xs text-amber-700">{sectorError}</p>}
              </div>
            </div>
          </div>
        </ResponsivePageSection>

        {pageError ? (
          <ResponsivePageSection className="p-4 sm:p-6">{renderErrorState()}</ResponsivePageSection>
        ) : isLoading ? (
          renderLoadingState()
        ) : (
          <ResponsivePageSection className="p-4 sm:p-6">
            <div className="mb-5 sm:mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Kết quả</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                {totalResults} kết quả phù hợp
              </h2>
            </div>

            {marketplaceIntakes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {marketplaceIntakes.map((intake) => (
                  <IPCard
                    key={intake.id}
                    data={ipData.find((ip) => ip.id === intake.id)!}
                    onClick={intake.type === 'challenge' ? onViewChallengeDetail : onViewIPDetail}
                    onActionClick={onActionClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center sm:h-64">
                <p className="text-sm text-muted-foreground">Không tìm thấy kết quả phù hợp</p>
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-8" />
          </ResponsivePageSection>
        )}
      </div>
    </DashboardLayout>
  );
}
