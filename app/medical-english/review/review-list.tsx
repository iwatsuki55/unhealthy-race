"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PrototypeReviewItem } from "@/lib/medical-english-data";
import { fetchPersistedReviewItems } from "@/lib/medical-english-review-store";

type ReviewListProps = {
  defaultItems: PrototypeReviewItem[];
};

export function ReviewList({ defaultItems }: ReviewListProps) {
  const [items, setItems] = useState<PrototypeReviewItem[]>(defaultItems);

  useEffect(() => {
    let isActive = true;

    async function loadItems() {
      const savedItems = await fetchPersistedReviewItems();

      if (isActive) {
        setItems([...savedItems.items, ...defaultItems]);
      }
    }

    void loadItems();

    return () => {
      isActive = false;
    };
  }, [defaultItems]);

  return (
    <div className="mt-6 space-y-4">
      {items.map((item, index) => (
        <article
          key={`${item.lessonSlug}-${item.mode}-${item.reason}-${index}`}
          className="rounded-[1.7rem] border border-slate-200 p-5"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              {item.mode}
            </span>
            <span>{item.nextReviewWindow}</span>
          </div>
          <h4 className="mt-4 text-xl font-semibold text-slate-900">
            {item.lessonTitle}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            苦手理由: {item.reason}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            次にやること: {item.recommendedAction}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/medical-english/lesson/${item.lessonSlug}`}
              className="rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              レッスンへ戻る
            </Link>
            <Link
              href={`/medical-english/lesson/${item.lessonSlug}/${item.mode}`}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              そのまま再挑戦
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
