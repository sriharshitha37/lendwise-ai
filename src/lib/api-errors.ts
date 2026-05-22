import { isAxiosError } from "axios";

export interface FieldValidationError {
  field: string;
  message: string;
}

/** Parse FastAPI 422 validation errors into per-field messages */
export function parseApiValidationErrors(error: unknown): FieldValidationError[] {
  if (!isAxiosError(error) || error.response?.status !== 422) {
    return [];
  }

  const detail = error.response.data?.detail;
  if (!Array.isArray(detail)) return [];

  return detail
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const loc = "loc" in item && Array.isArray(item.loc) ? item.loc : [];
      const field = loc[loc.length - 1];
      const message = "msg" in item && typeof item.msg === "string" ? item.msg : null;
      if (typeof field !== "string" || !message) return null;
      return { field, message };
    })
    .filter((item): item is FieldValidationError => item !== null);
}

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const validation = parseApiValidationErrors(error);
    if (validation.length > 0) {
      return validation.map((v) => v.message).join(" ");
    }

    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) =>
          typeof d === "object" && d !== null && "msg" in d && typeof d.msg === "string"
            ? d.msg
            : JSON.stringify(d),
        )
        .join(", ");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
