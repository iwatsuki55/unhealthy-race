import type { ConversationHistoryTurn } from "@/lib/conversation-coach-chat";

export type ConversationFeedbackInput = {
  themeTitle: string;
  history: ConversationHistoryTurn[];
};

export type ConversationFeedback = {
  summary: string;
  goodPoint: string;
  betterAlternative: string;
  nextPhrase: string;
  reviewReason: string;
  source: "ai" | "fallback";
};

function lastUserMessage(history: ConversationHistoryTurn[]) {
  return history[history.length - 1]?.user?.trim() ?? "";
}

export function buildFallbackConversationFeedback(
  input: ConversationFeedbackInput,
): ConversationFeedback {
  const lastLine = lastUserMessage(input.history);
  const shortReply = lastLine.split(/\s+/).length < 5;

  return {
    summary: `${input.themeTitle} の会話を最後まで続けられました。`,
    goodPoint: shortReply
      ? "短くても返答を止めずに出せていました。"
      : "自分の情報を足して返せていたので、会話が広がりやすかったです。",
    betterAlternative: shortReply
      ? "一言で終わったら、理由や気分を1つ足すと自然さが上がります。"
      : "最後に相手への質問を1つ戻すと、さらに会話が続きやすくなります。",
    nextPhrase: shortReply
      ? "I usually do that because it helps me relax."
      : "What about you?",
    reviewReason: shortReply
      ? "返答が短く終わりやすい"
      : "相手へ質問を返す回数を増やしたい",
    source: "fallback",
  };
}
