import { Send, Paperclip } from 'lucide-react';

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

interface DealRoomChatProps {
  conversationName?: string;
  conversationProject?: string;
  messages: Message[];
  messageInput: string;
  onMessageChange: (v: string) => void;
  onSend: () => void;
}

export function DealRoomChat({
  conversationName,
  conversationProject,
  messages,
  messageInput,
  onMessageChange,
  onSend,
}: DealRoomChatProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-3.5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{conversationName}</h2>
          <p className="text-xs text-muted-foreground">{conversationProject}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto bg-[#f9fafb] p-6"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <div className="space-y-4">
          {messages.map((msg) => {
            if (msg.type === 'system-event') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="max-w-md rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-full bg-[#e0f2fe] p-2">
                        <svg
                          className="size-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium text-foreground">{msg.content}</span>
                    </div>
                    {msg.attachedFile && (
                      <div className="flex items-center gap-2 rounded-lg bg-[#f9fafb] p-3">
                        <svg className="size-5 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="flex-1 text-sm text-[#4b5563]">{msg.attachedFile.name}</span>
                        <button className="text-primary hover:text-[#0047b3]">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-[#9ca3af]">{msg.timestamp}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md rounded-lg px-4 py-3 ${
                    msg.isOwn
                      ? 'bg-primary text-white'
                      : 'border border-[#e5e7eb] bg-white text-foreground'
                  }`}
                >
                  {!msg.isOwn && (
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{msg.sender}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`mt-1 text-xs ${msg.isOwn ? 'text-[#93c5fd]' : 'text-[#9ca3af]'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#e5e7eb] bg-white p-4">
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground transition-colors hover:text-primary">
            <Paperclip className="size-5" />
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend();
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={onSend}
            className="rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary/90"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
