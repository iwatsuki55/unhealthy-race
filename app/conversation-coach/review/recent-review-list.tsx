"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ConversationReviewItem } from "@/lib/conversation-coach-data";
import { loadConversationReviewItems } from "@/lib/conversation-coach-review-store";

type ConversationRecentReviewListProps = {
  defaultItems: ConversationReviewItem[];
};

export function ConversationRecentReviewList({
  defaultItems,
}: ConversationRecentReviewListProps) {
  const [items, setItems] = useState<ConversationReviewItem[]>(defaultItems);

  useEffect(() => {
    const savedItems = loadConversationReviewItems();
    setItems([...savedItems, ...defaultItems].slice(0, 4));
  }, [defaultItems]);

  return (
    <>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <Link
            key={`${item.themeSlug}-${item.reason}-${index}`}
            href="/conversation-coach/review"
            className="block rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)] p-4 transition hover:border-orange-200 hover:bg-orange-50/60"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                {item.nextReviewWindow}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {item.themeTitle}
            </p>
            <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
          </Link>
        ))}
      </div>
      <Link
        href="/conversation-coach/review"
        className="mt-4 inline-flex text-sm font-semibold text-orange-700"
      >
        復習画面を開く
      </Link>
    </>
  );
}
