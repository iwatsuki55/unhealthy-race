"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PrototypeReviewItem } from "@/lib/medical-english-data";
import { fetchPersistedReviewItems } from "@/lib/medical-english-review-store";

type RecentReviewListProps = {
  defaultItems: PrototypeReviewItem[];
};

export function RecentReviewList({ defaultItems }: RecentReviewListProps) {
  const [items, setItems] = useState<PrototypeReviewItem[]>(defaultItems);

  useEffect(() => {
    let isActive = true;

    async function loadItems() {
      const savedItems = await fetchPersistedReviewItems();
      const merged = [...savedItems.items, ...defaultItems].slice(0, 4);

      if (isActive) {
        setItems(merged);
      }
    }

    void loadItems();

    return () => {
      isActive = false;
    };
  }, [defaultItems]);

  return (
    <>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <Link
            key={`${item.lessonSlug}-${item.mode}-${item.reason}-${index}`}
            href="/medical-english/review"
            className="block rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbfa_100%)] p-4 transition hover:border-teal-200 hover:bg-teal-50/60"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                {item.mode}
              </span>
              <span>{item.nextReviewWindow}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {item.lessonTitle}
            </p>
            <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
          </Link>
        ))}
      </div>
      <Link
        href="/medical-english/review"
        className="mt-4 inline-flex text-sm font-semibold text-teal-700"
      >
        復習画面を開く
      </Link>
    </>
  );
}
