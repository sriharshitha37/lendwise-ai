import { cn } from "@/lib/utils";
import { Bot, Loader2 } from "lucide-react";

export function ChatTypingIndicator() {
  return (
    <div className="flex w-full justify-start gap-2 sm:gap-3" aria-live="polite" aria-busy>
      <div
        className="size-8 shrink-0 rounded-xl grid place-items-center bg-primary text-primary-foreground"
        aria-hidden
      >
        <Bot className="size-4" />
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/70",
          "bg-card px-4 py-3 text-sm text-muted-foreground",
        )}
      >
        <Loader2 className="size-4 animate-spin text-primary" />
        LendWise AI is thinking…
      </div>
    </div>
  );
}
