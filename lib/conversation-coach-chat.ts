import { conversationCoachThemeMap, type ConversationTheme } from "@/lib/conversation-coach-data";

export type ConversationHistoryTurn = {
  ai: string;
  user: string;
};

export type ConversationChatInput = {
  themeSlug: string;
  currentAiLine: string;
  userMessage: string;
  history: ConversationHistoryTurn[];
};

export type ConversationChatReply = {
  aiReply: string;
  hint: string;
  source: "ai" | "fallback";
};

function getTheme(themeSlug: string): ConversationTheme | null {
  return conversationCoachThemeMap[themeSlug] ?? null;
}

export function buildFallbackConversationReply(
  input: ConversationChatInput,
): ConversationChatReply {
  const theme = getTheme(input.themeSlug);
  const fallbackReply =
    theme?.fallbackReplies[input.history.length] ??
    "That sounds nice. Tell me a little more about that.";
  const hintTopic =
    theme?.suggestedTopics[input.history.length] ?? "your next small detail";

  return {
    aiReply: fallbackReply,
    hint: `次は ${hintTopic} を1つ足して返すと会話が続きやすいです。`,
    source: "fallback",
  };
}
