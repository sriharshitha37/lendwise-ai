import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lendai/AppShell";
import { LoanAssistantChat } from "@/components/lendai/chat/LoanAssistantChat";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Loan Assistant — LendAI" },
      {
        name: "description",
        content:
          "Chat with the LendWise AI loan assistant for eligibility, documents, and application guidance.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell>
      <div className="flex flex-col px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-3xl mx-auto w-full min-h-[calc(100dvh-3.5rem)] md:min-h-0">
        <header className="shrink-0 mb-6">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            AI Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <MessageCircle className="size-7 text-primary shrink-0" />
            Loan Assistant
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-lg">
            Ask about personal loans, eligibility, KYC documents, credit scores, and repayment
            options. Responses are for guidance only—not a guarantee of approval.
          </p>
        </header>

        <LoanAssistantChat className="flex-1 w-full" />
      </div>
    </AppShell>
  );
}
