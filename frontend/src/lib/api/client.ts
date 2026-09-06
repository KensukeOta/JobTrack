import { ApiError } from "./api-error";
import { getCsrfToken } from "./csrf";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const CSRF_METHODS = new Set(["POST", "PATCH", "DELETE"]);

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (CSRF_METHODS.has(method)) {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let detail: unknown;

    try {
      const data = (await response.json()) as {
        detail?: unknown;
      };

      detail = data.detail;
    } catch {
      detail = response.statusText;
    }

    throw new ApiError(response.status, detail ?? response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
