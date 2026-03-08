import type {
  ApiResponse,
  Entry,
  EntryListItem,
  MirrorAnalysis,
  Assumption,
} from "@spectra/shared";

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

// ─── Mirror API ─────────────────────────────────────────────

export type MirrorWithAssumptions = MirrorAnalysis & {
  assumptions: Assumption[];
};

export const mirrorApi = {
  get: (entryId: string) =>
    apiFetch<MirrorWithAssumptions>(`/api/mirror/${entryId}`),

  trigger: (entryId: string) =>
    apiFetch<MirrorWithAssumptions>("/api/mirror/analyze", {
      method: "POST",
      body: JSON.stringify({ entryId }),
    }),
};
