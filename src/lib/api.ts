import axios from "axios";
import type { ExtractedDocument, UploadDocumentResponse } from "@/types/api";
import type { ChatRequest, ChatResponse } from "@/types/chat";
import type { EligibilityRequest, EligibilityResponse } from "@/types/eligibility";
import { getApiErrorMessage } from "@/lib/api-errors";

export { getApiErrorMessage, parseApiValidationErrors } from "@/lib/api-errors";
export type { FieldValidationError } from "@/lib/api-errors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", payload);
  return data;
}

export async function checkEligibility(
  payload: EligibilityRequest,
): Promise<EligibilityResponse> {
  const { data } = await api.post<EligibilityResponse>("/eligibility", payload);
  return data;
}

export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadDocumentResponse>(
    "/upload-document",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data;
}

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ExtractedDocument>("/extract-document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
