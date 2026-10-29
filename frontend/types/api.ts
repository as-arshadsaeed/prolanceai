export type GeneratorDocumentType = "proposal" | "cover_letter";

export type Tone = "professional" | "friendly" | "confident" | "technical";

export type ProposalLength = "short" | "medium" | "long";

export interface UsageCategory {
  used: number;
  limit: number;
  remaining?: number;
}

export interface UsageResponse {
  proposals?: UsageCategory;
  cover_letters?: UsageCategory;
  proposals_used?: number;
  proposals_limit?: number;
  cover_letters_used?: number;
  cover_letters_limit?: number;
}

export interface ProposalRequest {
  job_description: string;
  skills: string[];
  experience_summary: string;
  portfolio_evidence: string[];
  hourly_rate: string;
  tone: Tone;
  length: ProposalLength;
}

export interface CoverLetterRequest {
  job_description: string;
  skills: string[];
  tone: Tone;
}

export type GenerateRequest = ProposalRequest | CoverLetterRequest;

export interface GenerateResponse {
  [key: string]: unknown;
  content?: string;
  proposal?: string;
  cover_letter?: string;
  text?: string;
  message?: string;
  title?: string;
}

export interface ApiErrorResponse {
  detail?: string | { msg?: string }[];
  message?: string;
}
