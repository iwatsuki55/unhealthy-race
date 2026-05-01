import type { PrototypeReviewItem } from "@/lib/medical-english-data";

const REVIEW_STORAGE_KEY = "medical-english-prototype-review-items";

export function loadSavedReviewItems() {
  if (typeof window === "undefined") {
    return [] as PrototypeReviewItem[];
  }

  try {
    const rawValue = window.localStorage.getItem(REVIEW_STORAGE_KEY);

    if (!rawValue) {
      return [] as PrototypeReviewItem[];
    }

    const parsed = JSON.parse(rawValue) as PrototypeReviewItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as PrototypeReviewItem[];
  }
}

export function saveReviewItems(items: PrototypeReviewItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(items));
}

export function appendReviewItems(items: PrototypeReviewItem[]) {
  const currentItems = loadSavedReviewItems();
  const merged = [...items, ...currentItems].filter(
    (item, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.lessonSlug === item.lessonSlug &&
          candidate.mode === item.mode &&
          candidate.reason === item.reason,
      ) === index,
  );

  saveReviewItems(merged);
  return merged;
}

export async function fetchPersistedReviewItems() {
  try {
    const response = await fetch("/api/medical-english/review-items", {
      method: "GET",
    });

    if (!response.ok) {
      return {
        source: "local" as const,
        items: loadSavedReviewItems(),
        authenticated: false,
      };
    }

    const data = (await response.json()) as {
      authenticated: boolean;
      items: PrototypeReviewItem[];
    };

    if (data.authenticated && Array.isArray(data.items)) {
      return {
        source: "database" as const,
        items: data.items,
        authenticated: true,
      };
    }

    return {
      source: "local" as const,
      items: loadSavedReviewItems(),
      authenticated: false,
    };
  } catch {
    return {
      source: "local" as const,
      items: loadSavedReviewItems(),
      authenticated: false,
    };
  }
}

export async function persistReviewItems(items: PrototypeReviewItem[]) {
  try {
    const response = await fetch("/api/medical-english/review-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (response.ok) {
      return {
        source: "database" as const,
      };
    }

    appendReviewItems(items);

    if (response.status === 401) {
      return {
        source: "local" as const,
        reason: "unauthenticated" as const,
      };
    }

    return {
      source: "local" as const,
      reason: "database_error" as const,
    };
  } catch {
    appendReviewItems(items);
    return {
      source: "local" as const,
      reason: "network_error" as const,
    };
  }
}
