import type { ConversationReviewItem } from "@/lib/conversation-coach-data";

const REVIEW_STORAGE_KEY = "conversation-coach-review-items";

export function loadConversationReviewItems() {
  if (typeof window === "undefined") {
    return [] as ConversationReviewItem[];
  }

  try {
    const rawValue = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!rawValue) {
      return [] as ConversationReviewItem[];
    }

    const parsed = JSON.parse(rawValue) as ConversationReviewItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as ConversationReviewItem[];
  }
}

export function saveConversationReviewItems(items: ConversationReviewItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(items));
}

export function appendConversationReviewItems(items: ConversationReviewItem[]) {
  const currentItems = loadConversationReviewItems();
  const merged = [...items, ...currentItems].filter(
    (item, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.themeSlug === item.themeSlug &&
          candidate.reason === item.reason &&
          candidate.recommendedPhrase === item.recommendedPhrase,
      ) === index,
  );

  saveConversationReviewItems(merged);
  return merged;
}
