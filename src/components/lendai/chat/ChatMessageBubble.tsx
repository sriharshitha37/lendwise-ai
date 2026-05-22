import type { ChatUiMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface ChatMessageBubbleProps {
  message: ChatUiMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2 sm:gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div
          className="size-8 shrink-0 rounded-xl grid place-items-center bg-primary text-primary-foreground shadow-sm"
          aria-hidden
        >
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[min(100%,85%)] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/70 bg-card text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {isUser && (
        <div
          className="size-8 shrink-0 rounded-xl grid place-items-center bg-muted border border-border/70"
          aria-hidden
        >
          <User className="size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
