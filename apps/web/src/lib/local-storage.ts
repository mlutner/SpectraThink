import { get, set, del } from "idb-keyval";

const DRAFT_PREFIX = "spectra-draft:";

/**
 * Save a draft to IndexedDB immediately on keystroke.
 * Content stays local until explicit server sync.
 */
export async function saveDraft(
  entryId: string,
  content: string
): Promise<void> {
  await set(`${DRAFT_PREFIX}${entryId}`, {
    content,
    savedAt: Date.now(),
  });
}

/**
 * Load a draft from IndexedDB (if newer than server version).
 */
export async function loadDraft(
  entryId: string
): Promise<{ content: string; savedAt: number } | null> {
  const draft = await get<{ content: string; savedAt: number }>(
    `${DRAFT_PREFIX}${entryId}`
  );
  return draft ?? null;
}

/**
 * Remove draft after successful server sync.
 */
export async function clearDraft(entryId: string): Promise<void> {
  await del(`${DRAFT_PREFIX}${entryId}`);
}

/**
 * Save a new entry draft (before it has a server ID).
 */
export async function saveNewDraft(content: string): Promise<void> {
  await set(`${DRAFT_PREFIX}new`, {
    content,
    savedAt: Date.now(),
  });
}

export async function loadNewDraft(): Promise<{
  content: string;
  savedAt: number;
} | null> {
  const draft = await get<{ content: string; savedAt: number }>(
    `${DRAFT_PREFIX}new`
  );
  return draft ?? null;
}

export async function clearNewDraft(): Promise<void> {
  await del(`${DRAFT_PREFIX}new`);
}
