import { useEffect, useRef } from "react";
import { ChatMessageBubble } from "@/components/lendai/chat/ChatMessageBubble";
import { ChatTypingIndicator } from "@/components/lendai/chat/ChatTypingIndicator";
import type { ChatUiMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

export interface ChatMessageListProps {
  messages: ChatUiMessage[];
  isLoading?: boolean;
  className?: string;
}

export function ChatMessageList({
  messages,
  isLoading = false,
  className,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4",
        className,
      )}
    >
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <ChatTypingIndicator />}
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  );
}
