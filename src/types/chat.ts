/** Message role supported by POST /chat history */
export type ChatRole = "user" | "assistant";

/** Single turn in API request history */
export interface ChatApiMessage {
  role: ChatRole;
  content: string;
}

/** Request body for POST /chat */
export interface ChatRequest {
  message: string;
  history: ChatApiMessage[];
}

/** Response from POST /chat */
export interface ChatResponse {
  reply: string;
}

/** Message rendered in the chat UI */
export interface ChatUiMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export function toApiHistory(messages: ChatUiMessage[]): ChatApiMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}
