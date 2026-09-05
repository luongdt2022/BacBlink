import { useState } from 'react';
import { Info } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { ConversationList } from '../components/ConversationList';
import { DealRoomChat } from '../components/DealRoomChat';
import { DealRoomInfoPanel } from '../components/DealRoomInfoPanel';
import { InfraRequestModal } from '../components/InfraRequestModal';
import { PoCResultModal } from '../components/PoCResultModal';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { StepChangeModal } from '../components/StepChangeModal';
import { LeaveConfirmModal } from '../components/LeaveConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DealRoomPageProps {
  onNavigate?: (itemId: string) => void;
}

interface Message {
  id: string;
  type: 'text' | 'system-event';
  sender?: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
  eventType?: string;
  attachedFile?: { name: string; url: string };
}

interface PoCLog {
  id: string;
  date: string;
  title: string;
  result: string;
  file: { name: string; type: 'pdf' | 'excel' | 'word'; url: string };
}

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const mockConversations = [
  { id: '1', partnerName: 'Tập đoàn Viettel', projectName: 'Hệ thống xử lý nước thải dệt nhuộm', lastMessage: 'Chúng tôi đã xem xét kết quả PoC lần 1...', status: 'poc', unreadCount: 2, timestamp: '10:30' },
  { id: '2', partnerName: 'Vingroup', projectName: 'Công nghệ AI phân tích dữ liệu', lastMessage: 'Khi nào chúng ta có thể bắt đầu PoC?', status: 'negotiation', unreadCount: 0, timestamp: 'Hôm qua' },
  { id: '3', partnerName: 'FPT Corporation', projectName: 'Hệ thống IoT giám sát môi trường', lastMessage: 'Hợp đồng đã được ký kết thành công', status: 'completed', unreadCount: 0, timestamp: '28/01' },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', type: 'text', sender: 'Nguyễn Văn A', content: 'Xin chào, chúng tôi rất quan tâm đến giải pháp của bạn.', timestamp: '15/01/2026 09:00', isOwn: false },
    { id: 'm2', type: 'text', sender: 'Tôi', content: 'Cảm ơn anh đã quan tâm. Chúng tôi có thể sắp xếp một buổi demo chi tiết.', timestamp: '15/01/2026 09:15', isOwn: true },
    { id: 'm3', type: 'system-event', content: 'Đã gửi yêu cầu PoC lần 1', timestamp: '18/01/2026 14:30', eventType: 'poc-request' },
    { id: 'm4', type: 'system-event', content: 'Kết quả PoC lần 1: Đạt 90% chỉ tiêu kỹ thuật', timestamp: '22/01/2026 16:00', eventType: 'poc-result', attachedFile: { name: 'Bao_cao_PoC_lan_1.pdf', url: '#' } },
    { id: 'm5', type: 'text', sender: 'Nguyễn Văn A', content: 'Kết quả rất khả quan. Chúng tôi muốn tiến hành PoC lần 2 với quy mô lớn hơn.', timestamp: '23/01/2026 10:30', isOwn: false },
  ],
};

const mockPoCLogs: PoCLog[] = [
  { id: 'poc1', date: '22/01/2026', title: 'PoC lần 1: Thử nghiệm môi trường Lab', result: 'Đạt 90% chỉ tiêu kỹ thuật. Hiệu suất xử lý vượt mong đợi.', file: { name: 'Bao_cao_PoC_lan_1.pdf', type: 'pdf', url: '#' } },
  { id: 'poc2', date: '28/01/2026', title: 'PoC lần 2: Thử nghiệm quy mô pilot', result: 'Đạt 95% chỉ tiêu. Sẵn sàng triển khai thực tế.', file: { name: 'Bao_cao_PoC_lan_2.xlsx', type: 'excel', url: '#' } },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export function DealRoomPage({ onNavigate }: DealRoomPageProps) {
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [messageInput, setMessageInput] = useState('');
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showInfraModal, setShowInfraModal] = useState(false);
  const [showPoCResultModal, setShowPoCResultModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [infraFormData, setInfraFormData] = useState({ facility: '', startDate: '', endDate: '' });
  const [pocResultFormData, setPoCResultFormData] = useState({ result: '', file: null as File | null, confirmed: false });
  const [inviteEmail, setInviteEmail] = useState('');
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: 'Thỏa thuận', status: 'completed' },
    { id: 2, label: 'PoC', status: 'active' },
    { id: 3, label: 'Chốt Hợp đồng', status: 'pending' },
  ]);
  const [pocLogs] = useState<PoCLog[]>(mockPoCLogs);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const currentConversation = mockConversations.find((c) => c.id === selectedConversation);
  const currentMessages = messages[selectedConversation] ?? [];

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      type: 'text',
      sender: 'Tôi',
      content: messageInput,
      timestamp: new Date().toLocaleString('vi-VN'),
      isOwn: true,
    };
    setMessages({ ...messages, [selectedConversation]: [...currentMessages, newMsg] });
    setMessageInput('');
  };

  const handleInfraSubmit = () => {
    if (!infraFormData.facility || !infraFormData.startDate || !infraFormData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    toast.success('Đã gửi yêu cầu đến Admin');
    setShowInfraModal(false);
    setInfraFormData({ facility: '', startDate: '', endDate: '' });
  };

  const handlePoCResultSubmit = () => {
    if (!pocResultFormData.result || !pocResultFormData.file || !pocResultFormData.confirmed) {
      toast.error('Vui lòng điền đầy đủ thông tin và xác nhận');
      return;
    }
    const sysMsg: Message = {
      id: `m${Date.now()}`,
      type: 'system-event',
      content: `Kết quả PoC lần ${pocLogs.length + 1}: ${pocResultFormData.result}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      eventType: 'poc-result',
      attachedFile: { name: pocResultFormData.file.name, url: '#' },
    };
    setMessages({ ...messages, [selectedConversation]: [...currentMessages, sysMsg] });
    toast.success('Đã lưu và chia sẻ kết quả PoC');
    setShowPoCResultModal(false);
    setPoCResultFormData({ result: '', file: null, confirmed: false });
  };

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    toast.success(`Đã gửi lời mời đến ${inviteEmail}`);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleStepChange = (stepId: number) => {
    setSelectedStep(stepId);
    setShowStepModal(true);
  };

  const confirmStepChange = () => {
    if (selectedStep === null) return;
    setSteps((prev) =>
      prev.map((step) =>
        step.id === selectedStep
          ? { ...step, status: 'active' as const }
          : step.id < selectedStep
          ? { ...step, status: 'completed' as const }
          : { ...step, status: 'pending' as const },
      ),
    );
    const sysMsg: Message = {
      id: `m${Date.now()}`,
      type: 'system-event',
      content: `Đã chuyển sang giai đoạn: ${steps.find((s) => s.id === selectedStep)?.label}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      eventType: 'status-change',
    };
    setMessages({ ...messages, [selectedConversation]: [...currentMessages, sysMsg] });
    toast.success('Đã cập nhật trạng thái giai đoạn');
    setShowStepModal(false);
    setSelectedStep(null);
  };

  const handleInfraChange = (field: string, value: string) => {
    setInfraFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePoCChange = (field: string, value: string | File | boolean) => {
    setPoCResultFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="deal-room" onNavigate={onNavigate}>
      <div className="flex h-screen bg-[#f9fafb]">
        {/* Left: Conversation List */}
        <ConversationList
          conversations={mockConversations}
          selectedId={selectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={setSelectedConversation}
        />

        {/* Middle: Chat */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-3.5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {currentConversation?.partnerName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentConversation?.projectName}
              </p>
            </div>
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`rounded-lg p-2 transition-colors ${
                showRightSidebar ? 'bg-[#e0f2fe] text-primary' : 'text-muted-foreground hover:bg-[#f9fafb]'
              }`}
              title="Toggle info sidebar"
            >
              <Info className="size-5" />
            </button>
          </div>

          <DealRoomChat
            conversationName={currentConversation?.partnerName}
            conversationProject={currentConversation?.projectName}
            messages={currentMessages}
            messageInput={messageInput}
            onMessageChange={setMessageInput}
            onSend={handleSendMessage}
          />
        </div>

        {/* Right: Info Panel */}
        {showRightSidebar && (
          <DealRoomInfoPanel
            pocLogs={pocLogs}
            steps={steps}
            onInvite={() => setShowInviteModal(true)}
            onInfra={() => setShowInfraModal(true)}
            onPoCResult={() => setShowPoCResultModal(true)}
            onComplete={() => toast.success('Đã hoàn thành giao dịch và khóa phòng chat')}
            onStepChange={handleStepChange}
            onLeave={() => setShowLeaveModal(true)}
          />
        )}
      </div>

      {/* Modals */}
      <InfraRequestModal
        isOpen={showInfraModal}
        formData={infraFormData}
        onClose={() => setShowInfraModal(false)}
        onSubmit={handleInfraSubmit}
        onChange={handleInfraChange}
      />

      <PoCResultModal
        isOpen={showPoCResultModal}
        formData={pocResultFormData}
        onClose={() => setShowPoCResultModal(false)}
        onSubmit={handlePoCResultSubmit}
        onChange={handlePoCChange}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        email={inviteEmail}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteSubmit}
        onEmailChange={setInviteEmail}
      />

      <StepChangeModal
        isOpen={showStepModal}
        selectedStep={selectedStep}
        steps={steps}
        onClose={() => { setShowStepModal(false); setSelectedStep(null); }}
        onConfirm={confirmStepChange}
      />

      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={() => { setShowLeaveModal(false); toast.success('Đã rời khỏi cuộc trò chuyện'); }}
      />
    </DashboardLayout>
  );
}
