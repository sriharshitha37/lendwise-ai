import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ChatInput } from "@/components/lendai/chat/ChatInput";
import { ChatMessageList } from "@/components/lendai/chat/ChatMessageList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChatAssistant } from "@/hooks/useChatAssistant";
import { getApiErrorMessage } from "@/lib/api";
import {
  toApiHistory,
  type ChatUiMessage,
} from "@/types/chat";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const WELCOME_MESSAGE: ChatUiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm LendWise AI, your loan assistant. I can help with eligibility, KYC documents, credit scores, EMI basics, and application steps. How can I help you today?",
};

function createMessage(role: ChatUiMessage["role"], content: string): ChatUiMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

export interface LoanAssistantChatProps {
  className?: string;
}

export function LoanAssistantChat({ className }: LoanAssistantChatProps) {
  const [messages, setMessages] = useState<ChatUiMessage[]>([WELCOME_MESSAGE]);
  const [lastError, setLastError] = useState<string | null>(null);

  const chatMutation = useChatAssistant();

  const handleSend = useCallback(
    (text: string) => {
      const userMessage = createMessage("user", text);
      setLastError(null);

      setMessages((prev) => {
        const history = toApiHistory(prev.filter((m) => m.id !== "welcome"));

        queueMicrotask(() => {
          chatMutation.mutate(
            { message: text, history },
            {
              onSuccess: (data) => {
                setMessages((current) => [
                  ...current,
                  createMessage("assistant", data.reply),
                ]);
              },
              onError: (error) => {
                const message = getApiErrorMessage(error);
                setLastError(message);
                toast.error(message);
              },
            },
          );
        });

        return [...prev, userMessage];
      });
    },
    [chatMutation],
  );

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
    setLastError(null);
    chatMutation.reset();
  };

  const isLoading = chatMutation.isPending;

  return (
    <Card
      className={cn(
        "border-border/70 flex flex-col overflow-hidden",
        "h-[min(720px,calc(100dvh-10rem))] md:h-[min(760px,calc(100dvh-11rem))]",
        className,
      )}
    >
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border/70 bg-muted/20">
        <div>
          <div className="text-sm font-semibold">LendWise AI Assistant</div>
          <div className="text-xs text-muted-foreground">
            Loan guidance · powered by Gemini
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isLoading}
          className="shrink-0"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">New chat</span>
        </Button>
      </div>

      {lastError && (
        <div className="shrink-0 px-4 sm:px-6 pt-3">
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Message failed</AlertTitle>
            <AlertDescription>{lastError}</AlertDescription>
          </Alert>
        </div>
      )}

      <ChatMessageList messages={messages} isLoading={isLoading} />

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </Card>
  );
}
