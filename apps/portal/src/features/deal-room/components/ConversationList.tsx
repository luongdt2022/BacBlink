import { Search } from 'lucide-react';

interface Conversation {
  id: string;
  partnerName: string;
  projectName: string;
  lastMessage: string;
  status: string;
  unreadCount: number;
  timestamp: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  negotiation: { label: 'Thương thảo', bgColor: 'bg-[#ffedd5]', textColor: 'text-[#ea580c]' },
  poc: { label: 'PoC', bgColor: 'bg-[#e0e7ff]', textColor: 'text-[#6366f1]' },
  completed: { label: 'Hoàn thành', bgColor: 'bg-[#d1fae5]', textColor: 'text-[#059669]' },
};

export function ConversationList({
  conversations,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="w-80 border-r border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] p-4">
        <h2 className="mb-3 text-lg font-medium text-foreground">Phòng Đàm phán</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm đối tác hoặc dự án..."
            className="w-full rounded-lg border border-[#e5e7eb] bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 137px)' }}>
        {conversations
          .filter((c) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              c.partnerName.toLowerCase().includes(q) ||
              c.projectName.toLowerCase().includes(q)
            );
          })
          .map((conv) => {
            const cfg = statusConfig[conv.status] ?? statusConfig.negotiation;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full border-b border-[#e5e7eb] p-4 text-left transition-colors hover:bg-[#f9fafb] ${
                  selectedId === conv.id ? 'bg-[#e0f2fe]' : ''
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">{conv.partnerName}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="mb-1 text-sm text-muted-foreground">{conv.projectName}</p>
                <div className="flex items-center justify-between">
                  <p className="line-clamp-1 text-sm text-[#9ca3af]">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-xs font-medium text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#9ca3af]">{conv.timestamp}</p>
              </button>
            );
          })}
      </div>
    </div>
  );
}
