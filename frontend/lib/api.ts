import type {
  ApiErrorResponse,
  CoverLetterRequest,
  GenerateResponse,
  ProposalRequest,
  UsageResponse,
} from "@/types/api";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check that the API server is running.",
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const error = (await response.json()) as ApiErrorResponse;

      if (typeof error.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error.detail)) {
        message = error.detail
          .map((item: { msg?: string }) => item.msg ?? "Invalid input")
          .join(", ");
      } else if (error.message) {
        message = error.message;
      }
    } catch {
      // Keep the default HTTP error message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getUsage(): Promise<UsageResponse> {
  return request<UsageResponse>("/api/v1/usage");
}

export function generateProposal(
  payload: ProposalRequest,
): Promise<GenerateResponse> {
  return request<GenerateResponse>("/api/v1/proposals/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateCoverLetter(
  payload: CoverLetterRequest,
): Promise<GenerateResponse> {
  return request<GenerateResponse>("/api/v1/cover-letters/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
