/** Response from POST /upload-document */
export interface UploadDocumentResponse {
  filename: string;
}

/** Extraction data source from POST /extract-document */
export type ExtractionSource = "gemini" | "fallback_mock" | (string & {});

/** Response from POST /extract-document */
export interface ExtractedDocument {
  name: string | null;
  dob: string | null;
  pan: string | null;
  aadhaar: string | null;
  address: string | null;
  source: ExtractionSource;
}

/** UI-friendly view of extracted document fields */
export interface ExtractedDocumentFields {
  fullName: string | null;
  dob: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  address: string | null;
  source: ExtractionSource;
}

export function toExtractedDocumentFields(
  doc: ExtractedDocument,
): ExtractedDocumentFields {
  return {
    fullName: doc.name,
    dob: doc.dob,
    aadhaarNumber: doc.aadhaar,
    panNumber: doc.pan,
    address: doc.address,
    source: doc.source,
  };
}

export function isFallbackExtraction(source: ExtractionSource): boolean {
  return source === "fallback_mock" || source.startsWith("fallback");
}
