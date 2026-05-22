import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ChatApiMessage, ChatResponse } from "@/types/chat";

export interface SendChatVariables {
  message: string;
  history: ChatApiMessage[];
}

export function useChatAssistant() {
  return useMutation<ChatResponse, Error, SendChatVariables>({
    mutationKey: queryKeys.chat.all,
    mutationFn: ({ message, history }) => sendChatMessage({ message, history }),
  });
}
