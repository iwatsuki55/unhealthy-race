"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type {
  ConversationReviewItem,
  ConversationTheme,
} from "@/lib/conversation-coach-data";
import type {
  ConversationChatReply,
  ConversationHistoryTurn,
} from "@/lib/conversation-coach-chat";
import type { ConversationFeedback } from "@/lib/conversation-coach-feedback";
import { appendConversationReviewItems } from "@/lib/conversation-coach-review-store";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      0: {
        transcript: string;
      };
    };
    length: number;
  };
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechSynthesisVoiceShape = SpeechSynthesisVoice;

type ConversationSessionProps = {
  theme: ConversationTheme;
};

const MIN_TURNS_TO_FINISH = 3;

export function ConversationSession({ theme }: ConversationSessionProps) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoiceShape[]>([]);
  const [history, setHistory] = useState<ConversationHistoryTurn[]>([]);
  const [currentAiLine, setCurrentAiLine] = useState(theme.openingLine);
  const [textAnswer, setTextAnswer] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [autoPlayAiVoice, setAutoPlayAiVoice] = useState(true);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [speechStatus, setSpeechStatus] = useState(
    "マイク入力が使えるブラウザでは、話した内容をここに自動入力できます。",
  );
  const [isSending, setIsSending] = useState(false);
  const [hint, setHint] = useState("返答は短くても大丈夫です。理由や気分を1つ足すと続きやすくなります。");
  const [conversationError, setConversationError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
    };

    loadVoices();
    synth.addEventListener?.("voiceschanged", loadVoices);
    setTtsSupported(Boolean(synth));

    const recognitionApi = (
      window as Window & {
        SpeechRecognition?: BrowserSpeechRecognitionConstructor;
        webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
      }
    ).SpeechRecognition ??
      (
        window as Window & {
          SpeechRecognition?: BrowserSpeechRecognitionConstructor;
          webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;

    if (!recognitionApi) {
      setSpeechSupported(false);
      setSpeechStatus("このブラウザでは音声入力未対応です。テキスト入力で試せます。");
      return;
    }

    const recognition = new recognitionApi();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let combinedTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        combinedTranscript += event.results[index][0].transcript;
      }

      setTextAnswer(combinedTranscript.trim());
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setSpeechStatus("マイク権限がないため音声入力を開始できませんでした。");
        return;
      }

      setSpeechStatus(`音声入力でエラーが発生しました: ${event.error}`);
    };
    recognition.onend = () => {
      setIsListening(false);
      setSpeechStatus((currentStatus) =>
        currentStatus.startsWith("音声入力でエラー")
          ? currentStatus
          : "音声入力を停止しました。内容を確認して送信できます。",
      );
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      synth.cancel();
      synth.removeEventListener?.("voiceschanged", loadVoices);
      recognitionRef.current = null;
    };
  }, []);

  function speakAiLine(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.98;
    utterance.pitch = 1;

    const englishVoice =
      voicesRef.current.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? null;

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsSpeakingAi(true);
    };
    utterance.onend = () => {
      setIsSpeakingAi(false);
    };
    utterance.onerror = () => {
      setIsSpeakingAi(false);
    };

    synth.speak(utterance);
  }

  useEffect(() => {
    if (!ttsSupported || !autoPlayAiVoice || isCompleted) {
      return;
    }

    speakAiLine(currentAiLine);
  }, [autoPlayAiVoice, currentAiLine, isCompleted, ttsSupported]);

  function handleStartListening() {
    if (!recognitionRef.current || isCompleted || isSending) {
      return;
    }

    setTextAnswer("");
    setIsListening(true);
    setSpeechStatus("Listening... 英語でそのまま返してみてください。");
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.start();
  }

  function handleStopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setSpeechStatus("音声入力を止めました。必要なら少し整えてから送信できます。");
  }

  function handleReplayAiVoice() {
    speakAiLine(currentAiLine);
  }

  async function handleSendMessage() {
    if (!textAnswer.trim() || isSending || isCompleted) {
      return;
    }

    const userMessage = textAnswer.trim();
    setIsSending(true);
    setConversationError("");

    try {
      const response = await fetch("/api/conversation-coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          themeSlug: theme.slug,
          currentAiLine,
          userMessage,
          history,
        }),
      });

      const reply = (await response.json()) as ConversationChatReply;
      const nextHistory = [...history, { ai: currentAiLine, user: userMessage }];

      setHistory(nextHistory);
      setCurrentAiLine(reply.aiReply);
      setHint(reply.hint);
      setTextAnswer("");
      setSpeechStatus("次の返答も短くて大丈夫です。1つだけ情報を足してみましょう。");

      if (nextHistory.length >= MIN_TURNS_TO_FINISH) {
        await handleFinishConversation(nextHistory);
      }
    } catch {
      setConversationError("会話応答の取得に失敗しました。もう一度送信してください。");
    } finally {
      setIsSending(false);
    }
  }

  async function handleFinishConversation(
    finalHistory: ConversationHistoryTurn[] = history,
  ) {
    if (finalHistory.length === 0) {
      return;
    }

    setIsCompleted(true);
    setIsLoadingFeedback(true);

    try {
      const response = await fetch("/api/conversation-coach/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          themeTitle: theme.title,
          history: finalHistory,
        }),
      });

      const data = (await response.json()) as ConversationFeedback;
      setFeedback(data);
    } catch {
      setFeedback({
        summary: "会話を最後まで続けられました。",
        goodPoint: "短くても返答を出し続けられていました。",
        betterAlternative: "次は理由や気分を1つ足すと、もっと自然に聞こえます。",
        nextPhrase: "What about you?",
        reviewReason: "相手に質問を返す回数を増やしたい",
        source: "fallback",
      });
    } finally {
      setIsLoadingFeedback(false);
    }
  }

  function handleSaveReviewItem() {
    if (!feedback) {
      return;
    }

    const items: ConversationReviewItem[] = [
      {
        themeSlug: theme.slug,
        themeTitle: theme.title,
        reason: feedback.reviewReason,
        recommendedPhrase: feedback.nextPhrase,
        nextReviewWindow: "次の会話前に見返す",
      },
    ];

    appendConversationReviewItems(items);
    setSaveStatus("この端末に復習メモを保存しました。");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.34fr]">
      <section className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_18px_55px_rgba(249,115,22,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
              interactive session
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">
              {theme.title}
            </h3>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            {history.length} turns
          </span>
        </div>

        {!isCompleted ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-[1.75rem] border border-orange-100 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-orange-800">
                  <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                    Current AI Turn
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                    {theme.tone}
                  </span>
                </div>
                {ttsSupported ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReplayAiVoice}
                      className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                      {isSpeakingAi ? "読み上げ中..." : "AI音声を再生"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoPlayAiVoice((current) => !current)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                        autoPlayAiVoice
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:text-orange-700"
                      }`}
                    >
                      {autoPlayAiVoice ? "自動再生オン" : "自動再生オフ"}
                    </button>
                  </div>
                ) : null}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">{theme.scene}</p>
              <p className="mt-3 text-2xl font-semibold leading-tight text-slate-900">
                {currentAiLine}
              </p>
            </div>

            {history.length > 0 ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-200">
                  Conversation History
                </p>
                <div className="mt-4 space-y-3">
                  {history.map((turn, index) => (
                    <div key={`${turn.ai}-${index}`} className="rounded-[1.4rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
                        Turn {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-100">
                        <span className="font-semibold text-white">AI:</span> {turn.ai}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-100">
                        <span className="font-semibold text-white">You:</span> {turn.user}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <label className="block rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
                英語で返してみる
              </span>
              {speechSupported ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleStartListening}
                    disabled={isListening || isSending}
                    className="rounded-full bg-[linear-gradient(135deg,#f97316_0%,#ea580c_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isListening ? "聞き取り中..." : "マイクで話す"}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopListening}
                    disabled={!isListening}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    停止
                  </button>
                </div>
              ) : null}
              <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                {speechStatus}
              </p>
              <textarea
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.target.value)}
                rows={4}
                className="mt-4 w-full rounded-[1.6rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white"
                placeholder="Type or speak your reply in English."
              />
              <div className="mt-4 flex flex-wrap gap-3">
                {theme.quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => setTextAnswer(reply)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-200 hover:text-orange-700"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </label>

            {conversationError ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                {conversationError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!textAnswer.trim() || isSending}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSending ? "送信中..." : "返答を送る"}
              </button>
              <button
                type="button"
                onClick={() => handleFinishConversation()}
                disabled={history.length === 0 || isLoadingFeedback}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                ここで会話を終える
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-[1.75rem] border border-orange-100 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                Session Complete
              </p>
              <h4 className="mt-3 text-2xl font-semibold text-slate-900">
                会話を最後まで続けられました
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isLoadingFeedback
                  ? "会話後の一言フィードバックをまとめています。"
                  : feedback?.summary}
              </p>
            </div>

            {feedback ? (
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                    Good Point
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{feedback.goodPoint}</p>
                </article>
                <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                    Better Next Time
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {feedback.betterAlternative}
                  </p>
                </article>
                <article className="rounded-[1.6rem] border border-slate-200 bg-slate-950 p-5 text-white md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
                    Next Phrase
                  </p>
                  <p className="mt-3 text-xl font-semibold">{feedback.nextPhrase}</p>
                </article>
              </div>
            ) : null}

            {saveStatus ? (
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                {saveStatus}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveReviewItem}
                disabled={!feedback}
                className="rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-200"
              >
                この一文を復習に残す
              </button>
              <Link
                href={`/conversation-coach/theme/${theme.slug}/session`}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                同じテーマでもう一度
              </Link>
              <Link
                href="/conversation-coach"
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                別テーマを見る
              </Link>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Coach Note
          </p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">
            いま意識したいこと
          </h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">{hint}</p>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Goal
          </p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">
            この会話の狙い
          </h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">{theme.coachGoal}</p>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Topics
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {theme.suggestedTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
