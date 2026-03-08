import type { ApiResponse, Entry, EntryListItem } from "@spectra/shared";

async function getAuthHeaders(): Promise<HeadersInit> {
  // Clerk injects auth via cookies in same-origin requests
  return { "Content-Type": "application/json" };
}

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return {
      data: null,
      error: body?.error ?? {
        code: "REQUEST_FAILED",
        message: `Request failed with status ${res.status}`,
      },
    };
  }

  return res.json();
}

// ─── Entry API ──────────────────────────────────────────────

export const entriesApi = {
  list: () => apiFetch<EntryListItem[]>("/api/entries"),

  get: (id: string) => apiFetch<Entry>(`/api/entries/${id}`),

  create: (content: string, inputMode: "text" | "voice" = "text") =>
    apiFetch<Entry>("/api/entries", {
      method: "POST",
      body: JSON.stringify({ content, inputMode }),
    }),

  update: (id: string, data: { content?: string; title?: string }) =>
    apiFetch<Entry>(`/api/entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ id: string }>(`/api/entries/${id}`, { method: "DELETE" }),
};
