import { useSearchParams } from 'react-router-dom';
import { Handshake, Inbox, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { SentRequestsTab } from '../components/SentRequestsTab';
import { ReceivedRequestsTab } from '../components/ReceivedRequestsTab';

type TabValue = 'sent' | 'received';

const VALID_TABS: TabValue[] = ['sent', 'received'];

function isValidTab(value: string | null): value is TabValue {
  return VALID_TABS.includes(value as TabValue);
}

export function CollaborationRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isValidTab(tabParam) ? tabParam : 'sent';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="min-h-svh bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Handshake className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Yêu cầu hợp tác</h1>
            <p className="text-sm text-gray-500">Quản lý các yêu cầu hợp tác đã gửi và nhận được</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 h-auto w-full justify-start gap-1 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="sent"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Send className="h-4 w-4" />
              Đã gửi
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Inbox className="h-4 w-4" />
              Nhận được
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent">
            <SentRequestsTab />
          </TabsContent>

          <TabsContent value="received">
            <ReceivedRequestsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
