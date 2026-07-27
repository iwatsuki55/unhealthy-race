"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ConversationReviewItem } from "@/lib/conversation-coach-data";
import { loadConversationReviewItems } from "@/lib/conversation-coach-review-store";

type ConversationReviewListProps = {
  defaultItems: ConversationReviewItem[];
};

export function ConversationReviewList({
  defaultItems,
}: ConversationReviewListProps) {
  const [items, setItems] = useState<ConversationReviewItem[]>(defaultItems);

  useEffect(() => {
    const savedItems = loadConversationReviewItems();
    setItems([...savedItems, ...defaultItems]);
  }, [defaultItems]);

  return (
    <div className="mt-6 space-y-4">
      {items.map((item, index) => (
        <article
          key={`${item.themeSlug}-${item.reason}-${index}`}
          className="rounded-[1.7rem] border border-slate-200 p-5"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              {item.nextReviewWindow}
            </span>
          </div>
          <h4 className="mt-4 text-xl font-semibold text-slate-900">
            {item.themeTitle}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            気になった点: {item.reason}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            次にそのまま言いたい一文: {item.recommendedPhrase}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/conversation-coach/theme/${item.themeSlug}`}
              className="rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              テーマへ戻る
            </Link>
            <Link
              href={`/conversation-coach/theme/${item.themeSlug}/session`}
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
