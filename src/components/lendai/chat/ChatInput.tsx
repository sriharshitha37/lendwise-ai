import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  className,
}: ChatInputProps) {
  const [draft, setDraft] = useState("");

  const submit = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || disabled || isLoading) return;
    onSend(trimmed);
    setDraft("");
  }, [draft, disabled, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/70 bg-card/80 backdrop-blur px-4 sm:px-6 py-4",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about loans, eligibility, documents, EMI…"
          disabled={disabled || isLoading}
          rows={2}
          className="min-h-[52px] max-h-32 resize-none flex-1"
          aria-label="Chat message"
        />
        <Button
          type="button"
          onClick={submit}
          disabled={disabled || isLoading || !draft.trim()}
          className="w-full sm:w-auto shrink-0 shadow-[var(--shadow-elegant)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send
            </>
          )}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 hidden sm:block">
        Press Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
