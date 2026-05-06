"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MedicalEnglishLesson } from "@/lib/medical-english-data";
import {
  buildFallbackEvaluation,
  type EvaluationFeedback,
} from "@/lib/medical-english-evaluation";
import {
  buildFallbackRoleplayReply,
  type RoleplayHistoryTurn,
  type RoleplayReply,
} from "@/lib/medical-english-roleplay";
import { persistReviewItems } from "@/lib/medical-english-review-store";

type PracticeMode = "speaking" | "reading" | "roleplay";

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

type PracticePrototypeProps = {
  lesson: MedicalEnglishLesson;
  mode: PracticeMode;
};

type RoleplayTurnResult = {
  checkpoint: string;
  score: number;
  askedQuestion: string;
  idealQuestion: string;
};

type SpeakingTurnResult = {
  promptJa: string;
  score: number;
  askedQuestion: string;
  idealQuestion: string;
  safeAlternative: string;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function getWordOverlapScore(answer: string, expected: string) {
  const answerWords = new Set(normalize(answer).split(/\s+/).filter(Boolean));
  const expectedWords = normalize(expected).split(/\s+/).filter(Boolean);

  if (expectedWords.length === 0) {
    return 0;
  }

  const matched = expectedWords.filter((word) => answerWords.has(word)).length;
  return Math.round((matched / expectedWords.length) * 100);
}

export function PracticePrototype({
  lesson,
  mode,
}: PracticePrototypeProps) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState(
    "マイク入力が使えるブラウザでは、話した内容をここに自動入力できます。",
  );
  const [evaluationFeedback, setEvaluationFeedback] =
    useState<EvaluationFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");
  const [speakingTurnResults, setSpeakingTurnResults] = useState<SpeakingTurnResult[]>([]);
  const [roleplayReply, setRoleplayReply] = useState<RoleplayReply | null>(null);
  const [roleplayError, setRoleplayError] = useState("");
  const [roleplayHistory, setRoleplayHistory] = useState<RoleplayHistoryTurn[]>([]);
  const [roleplayTurnResults, setRoleplayTurnResults] = useState<RoleplayTurnResult[]>([]);
  const [currentPatientLine, setCurrentPatientLine] = useState(
    lesson.roleplayCase.openingLine,
  );
  const [reviewSaveStatus, setReviewSaveStatus] = useState("");
  const [sessionSaveStatus, setSessionSaveStatus] = useState("");
  const [hasSavedSession, setHasSavedSession] = useState(false);

  const items = useMemo(() => {
    if (mode === "speaking") {
      return lesson.speakingPrompts;
    }

    if (mode === "reading") {
      return lesson.readingQuestions;
    }

    return lesson.roleplayCase.turns;
  }, [lesson, mode]);

  const totalCount = items.length;
  const isLastStep = stepIndex === totalCount - 1;
  const isCompleted = completedCount === totalCount;

  const speakingPrompt = mode === "speaking" ? lesson.speakingPrompts[stepIndex] : null;
  const readingQuestion = mode === "reading" ? lesson.readingQuestions[stepIndex] : null;
  const roleplayTurn = mode === "roleplay" ? lesson.roleplayCase.turns[stepIndex] : null;

  async function handleCheck() {
    if (mode === "reading" && selectedChoice === null) {
      return;
    }

    if (mode !== "reading" && !textAnswer.trim()) {
      return;
    }

    if (mode === "speaking" && speakingPrompt) {
      const fallback = buildFallbackEvaluation({
        mode,
        userAnswer: textAnswer,
        expectedAnswer: speakingPrompt.expectedAnswer,
        safeAlternative: speakingPrompt.safeAlternative,
        promptJa: speakingPrompt.promptJa,
        situation: speakingPrompt.situation,
      });

      setIsEvaluating(true);
      setEvaluationError("");

      try {
        const response = await fetch("/api/medical-english/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode,
            userAnswer: textAnswer,
            expectedAnswer: speakingPrompt.expectedAnswer,
            safeAlternative: speakingPrompt.safeAlternative,
            promptJa: speakingPrompt.promptJa,
            situation: speakingPrompt.situation,
          }),
        });

        if (!response.ok) {
          setEvaluationFeedback(fallback);
          setEvaluationError("AI評価を使えなかったため、簡易評価で表示しています。");
        } else {
          const feedback = (await response.json()) as EvaluationFeedback;
          setEvaluationFeedback(feedback);
          if (feedback.source === "fallback") {
            setEvaluationError("APIキー未設定のため、簡易評価で表示しています。");
          }
        }
      } catch {
        setEvaluationFeedback(fallback);
        setEvaluationError("AI評価に失敗したため、簡易評価で表示しています。");
      } finally {
        setIsEvaluating(false);
      }
    } else if (mode === "roleplay" && roleplayTurn) {
      const fallback = buildFallbackEvaluation({
        mode,
        userAnswer: textAnswer,
        expectedAnswer: roleplayTurn.idealQuestion,
        checkpoint: roleplayTurn.checkpoint,
      });
      const fallbackPatientReply = buildFallbackRoleplayReply({
        lessonTitle: lesson.title,
        caseGoal: lesson.roleplayCase.goal,
        currentPatientLine,
        userQuestion: textAnswer,
        fallbackReply: roleplayTurn.patientLine,
        checkpoint: roleplayTurn.checkpoint,
        history: roleplayHistory,
      });

      setIsEvaluating(true);
      setEvaluationError("");
      setRoleplayError("");

      try {
        const [evaluationResponse, roleplayResponse] = await Promise.all([
          fetch("/api/medical-english/evaluate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mode,
              userAnswer: textAnswer,
              expectedAnswer: roleplayTurn.idealQuestion,
              checkpoint: roleplayTurn.checkpoint,
            }),
          }),
          fetch("/api/medical-english/roleplay", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lessonTitle: lesson.title,
              caseGoal: lesson.roleplayCase.goal,
              currentPatientLine,
              userQuestion: textAnswer,
              fallbackReply: roleplayTurn.patientLine,
              checkpoint: roleplayTurn.checkpoint,
              history: roleplayHistory,
            }),
          }),
        ]);

        if (!evaluationResponse.ok) {
          setEvaluationFeedback(fallback);
          setEvaluationError("AI評価を使えなかったため、簡易評価で表示しています。");
        } else {
          const feedback = (await evaluationResponse.json()) as EvaluationFeedback;
          setEvaluationFeedback(feedback);
          if (feedback.source === "fallback") {
            setEvaluationError("APIキー未設定のため、簡易評価で表示しています。");
          }
        }

        if (!roleplayResponse.ok) {
          setRoleplayReply(fallbackPatientReply);
          setRoleplayError("患者応答は固定シナリオで表示しています。");
        } else {
          const reply = (await roleplayResponse.json()) as RoleplayReply;
          setRoleplayReply(reply);
          if (reply.source === "fallback") {
            setRoleplayError("APIキー未設定のため、患者応答は固定シナリオです。");
          }
        }
      } catch {
        setEvaluationFeedback(fallback);
        setEvaluationError("AI評価に失敗したため、簡易評価で表示しています。");
        setRoleplayReply(fallbackPatientReply);
        setRoleplayError("患者応答の生成に失敗したため、固定シナリオで表示しています。");
      } finally {
        setIsEvaluating(false);
      }
    }

    setShowEvaluation(true);
  }

  function handleNext() {
    let currentScore = 0;

    if (mode === "speaking" && speakingPrompt) {
      currentScore =
        evaluationFeedback?.score ??
        getWordOverlapScore(textAnswer, speakingPrompt.expectedAnswer);
    } else if (mode === "reading" && readingQuestion) {
      currentScore = selectedChoice === readingQuestion.correctIndex ? 100 : 35;
    } else if (mode === "roleplay" && roleplayTurn) {
      currentScore =
        evaluationFeedback?.score ??
        getWordOverlapScore(textAnswer, roleplayTurn.idealQuestion);
    }

    const nextCompletedCount = completedCount + 1;
    setAccumulatedScore((prev) => prev + currentScore);
    setCompletedCount(nextCompletedCount);
    setShowEvaluation(false);
    const submittedAnswer = textAnswer;
    setTextAnswer("");
    setSelectedChoice(null);
    setEvaluationFeedback(null);
    setEvaluationError("");

    if (mode === "speaking" && speakingPrompt) {
      setSpeakingTurnResults((previous) => [
        ...previous,
        {
          promptJa: speakingPrompt.promptJa,
          score: currentScore,
          askedQuestion: submittedAnswer,
          idealQuestion: speakingPrompt.expectedAnswer,
          safeAlternative: speakingPrompt.safeAlternative,
        },
      ]);
    }

    if (mode === "roleplay" && roleplayReply) {
      const roleplayScore =
        evaluationFeedback?.score ??
        getWordOverlapScore(submittedAnswer, roleplayTurn?.idealQuestion || "");

      setRoleplayHistory((previous) => [
        ...previous,
        {
          patient: currentPatientLine,
          user: submittedAnswer,
        },
      ]);
      if (roleplayTurn) {
        setRoleplayTurnResults((previous) => [
          ...previous,
          {
            checkpoint: roleplayTurn.checkpoint,
            score: roleplayScore,
            askedQuestion: submittedAnswer,
            idealQuestion: roleplayTurn.idealQuestion,
          },
        ]);
      }
      setCurrentPatientLine(roleplayReply.patientReply);
      setRoleplayReply(null);
      setRoleplayError("");
    }

    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
    }
  }

  const averageScore =
    completedCount > 0 ? Math.round(accumulatedScore / completedCount) : 0;
  const speakingNeedsReview = speakingTurnResults.filter((result) => result.score < 65);
  const roleplayStrongCheckpoints = roleplayTurnResults.filter(
    (result) => result.score >= 65,
  );
  const roleplayNeedsFollowUp = roleplayTurnResults.filter(
    (result) => result.score < 65,
  );

  useEffect(() => {
    if (!isCompleted || hasSavedSession) {
      return;
    }

    async function persistSession() {
      const summary =
        mode === "speaking"
          ? "患者向けに短く言い換えるスピーキング練習を完了。"
          : mode === "reading"
            ? "症状文から重要情報を拾うリーディング練習を完了。"
            : "AI患者とのロールプレイ練習を完了。";

      const reviewItemCount =
        mode === "speaking"
          ? speakingNeedsReview.length
          : mode === "roleplay"
            ? roleplayNeedsFollowUp.length
            : 0;

      try {
        const response = await fetch("/api/medical-english/practice-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
            mode,
            averageScore,
            completedCount,
            totalCount,
            reviewItemCount,
            summary,
          }),
        });

        if (response.ok) {
          setSessionSaveStatus("この練習結果を Supabase に保存しました。");
        } else if (response.status === 401) {
          setSessionSaveStatus(
            "練習結果はこの場で確認できます。あとで残したくなったらログインして保存をオンにできます。",
          );
        } else {
          setSessionSaveStatus("練習結果の保存はまだ完了していません。");
        }
      } catch {
        setSessionSaveStatus("練習結果の保存はまだ完了していません。");
      } finally {
        setHasSavedSession(true);
      }
    }

    void persistSession();
  }, [
    averageScore,
    completedCount,
    hasSavedSession,
    isCompleted,
    lesson.slug,
    lesson.title,
    mode,
    roleplayNeedsFollowUp.length,
    speakingNeedsReview.length,
    totalCount,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
          : "音声入力を停止しました。内容を確認してチェックできます。",
      );
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!speechSupported) {
      return;
    }

    setTextAnswer("");
    setIsListening(false);
    setSpeechStatus("新しい問題です。マイク入力かテキスト入力で回答できます。");
    setEvaluationFeedback(null);
    setEvaluationError("");
    setRoleplayReply(null);
    setRoleplayError("");
    setSpeakingTurnResults([]);
    setRoleplayTurnResults([]);
    setSessionSaveStatus("");
    setHasSavedSession(false);
    recognitionRef.current?.stop();
  }, [speechSupported, stepIndex, mode]);

  useEffect(() => {
    if (mode !== "roleplay") {
      return;
    }

    if (stepIndex === 0 && roleplayHistory.length === 0) {
      setCurrentPatientLine(lesson.roleplayCase.openingLine);
    }
  }, [lesson.roleplayCase.openingLine, mode, roleplayHistory.length, stepIndex]);

  function handleStartListening() {
    if (!recognitionRef.current || mode === "reading" || showEvaluation) {
      return;
    }

    setTextAnswer("");
    setIsListening(true);
    setSpeechStatus("Listening... 英語でそのまま話してください。");
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.start();
  }

  function handleStopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setSpeechStatus("音声入力を止めました。必要ならテキストを手直ししてからチェックできます。");
  }

  async function handleSaveRoleplayReviewItems() {
    if (mode !== "roleplay" || roleplayNeedsFollowUp.length === 0) {
      return;
    }

    const result = await persistReviewItems(
      roleplayNeedsFollowUp.map((item) => ({
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        reason: `${item.checkpoint} の確認が弱かった`,
        mode: "roleplay" as const,
        recommendedAction: `次は "${item.idealQuestion}" のように短く確認する。`,
        nextReviewWindow: "次の学習前に再確認",
      })),
    );

    setReviewSaveStatus(
      result.source === "database"
        ? "Supabase に復習項目を保存しました。"
        : "この端末に復習項目を保存しました。別の端末でも続けたい時だけログインしてください。",
    );
  }

  async function handleSaveSpeakingReviewItems() {
    if (mode !== "speaking" || speakingNeedsReview.length === 0) {
      return;
    }

    const result = await persistReviewItems(
      speakingNeedsReview.map((item) => ({
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        reason: `${item.promptJa} の英語化が不安定`,
        mode: "speaking" as const,
        recommendedAction: `次は "${item.safeAlternative || item.idealQuestion}" を声に出して言い直す。`,
        nextReviewWindow: "次の学習前に再確認",
      })),
    );

    setReviewSaveStatus(
      result.source === "database"
        ? "Supabase に復習項目を保存しました。"
        : "この端末に復習項目を保存しました。別の端末でも続けたい時だけログインしてください。",
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.34fr]">
      <section className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_18px_55px_rgba(15,118,110,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {mode}
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">
              {lesson.title}
            </h3>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
            {Math.min(stepIndex + 1, totalCount)} / {totalCount}
          </span>
        </div>

        {!isCompleted ? (
          <div className="mt-6">
            {mode === "speaking" && speakingPrompt ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(180deg,#effdfa_0%,#ffffff_100%)] p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-teal-800">
                    <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                      Speaking Prompt
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                      Patient-safe wording
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    {speakingPrompt.situation}
                  </p>
                  <p className="mt-3 text-2xl font-semibold leading-tight text-slate-900">
                    {speakingPrompt.promptJa}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    ヒント: {speakingPrompt.hint}
                  </p>
                </div>

                <label className="block rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
                    英語で回答
                  </span>
                  {speechSupported ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleStartListening}
                        disabled={isListening || showEvaluation}
                        className="rounded-full bg-[linear-gradient(135deg,#0f766e_0%,#115e59_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300"
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
                    className="mt-4 w-full rounded-[1.6rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                    placeholder="Type the question you would ask the patient."
                  />
                </label>
              </div>
            ) : null}

            {mode === "reading" && readingQuestion ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-sky-100 bg-[linear-gradient(180deg,#f3fbff_0%,#ffffff_100%)] p-5">
                  <p className="text-sm leading-7 text-slate-700">
                    {readingQuestion.passage}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {readingQuestion.question}
                  </p>
                  <div className="mt-4 space-y-3">
                    {readingQuestion.choices.map((choice, index) => (
                      <label
                        key={choice}
                        className={`flex cursor-pointer items-start gap-3 rounded-[1.5rem] border px-4 py-3 text-sm transition ${
                          selectedChoice === index
                            ? "border-teal-400 bg-teal-50 shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={readingQuestion.id}
                          checked={selectedChoice === index}
                          onChange={() => setSelectedChoice(index)}
                          className="mt-1"
                        />
                        <span className="leading-6 text-slate-700">{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {mode === "roleplay" && roleplayTurn ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-teal-900/20 bg-[linear-gradient(135deg,#03141b_0%,#0f172a_55%,#164e63_100%)] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
                    Case Goal
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {lesson.roleplayCase.goal}
                  </p>
                  {roleplayHistory.length > 0 ? (
                    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                        Conversation History
                      </p>
                      <div className="mt-3 space-y-3">
                        {roleplayHistory.map((turn, index) => (
                          <div
                            key={`${turn.patient}-${index}`}
                            className="rounded-[1.4rem] bg-white/5 p-3"
                          >
                            <p className="text-xs uppercase tracking-[0.16em] text-teal-200">
                              Turn {index + 1}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-100">
                              <span className="font-semibold text-white">Patient:</span>{" "}
                              {turn.patient}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-100">
                              <span className="font-semibold text-white">You:</span>{" "}
                              {turn.user}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-5 rounded-[1.5rem] bg-white/10 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Current Patient Turn
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white">
                      {currentPatientLine}
                    </p>
                  </div>
                </div>

                <label className="block rounded-[1.75rem] border border-slate-200 bg-white p-5">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
                    次に聞く質問を英語で入力
                  </span>
                  {speechSupported ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleStartListening}
                        disabled={isListening || showEvaluation}
                        className="rounded-full bg-[linear-gradient(135deg,#0f766e_0%,#115e59_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300"
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
                    className="mt-4 w-full rounded-[1.6rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                    placeholder="Type the next question you would ask."
                  />
                </label>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={handleCheck}
                disabled={
                  showEvaluation ||
                  isEvaluating ||
                  (mode === "reading" ? selectedChoice === null : !textAnswer.trim())
                }
                className="rounded-full bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isEvaluating ? "評価中..." : "チェックする"}
              </button>

              <Link
                href={`/medical-english/lesson/${lesson.slug}`}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                レッスンへ戻る
              </Link>
            </div>

            {showEvaluation ? (
              <div className="mt-6 rounded-[1.8rem] border border-teal-200 bg-[linear-gradient(180deg,#ecfffb_0%,#ffffff_100%)] p-5 shadow-[0_14px_30px_rgba(20,184,166,0.08)]">
                <p className="text-sm font-semibold text-teal-900">フィードバック</p>
                {evaluationError ? (
                  <p className="mt-2 text-xs leading-5 text-amber-700">
                    {evaluationError}
                  </p>
                ) : null}
                {evaluationFeedback ? (
                  <div className="mt-2 space-y-3 text-sm leading-6 text-slate-700">
                    <p>{evaluationFeedback.summary}</p>
                    <p>
                      <span className="font-semibold text-slate-900">改善候補:</span>{" "}
                      {evaluationFeedback.betterPhrase}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">安全メモ:</span>{" "}
                      {evaluationFeedback.safetyNote}
                    </p>
                    <p className="text-xs text-slate-500">
                      score: {evaluationFeedback.score} / source: {evaluationFeedback.source}
                    </p>
                  </div>
                ) : mode === "reading" ? (
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedChoice === readingQuestion?.correctIndex
                      ? "正解です。重要情報をしっかり拾えています。"
                      : "この設問では、症状と期間の表現に注目すると読みやすくなります。"}
                  </p>
                ) : null}

                {mode === "speaking" && speakingPrompt ? (
                  <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">模範:</span>{" "}
                      {speakingPrompt.expectedAnswer}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">やさしい言い換え:</span>{" "}
                      {speakingPrompt.safeAlternative}
                    </p>
                  </div>
                ) : null}

                {mode === "reading" && readingQuestion ? (
                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    解説: {readingQuestion.explanation}
                  </p>
                ) : null}

                {mode === "roleplay" && roleplayTurn ? (
                  <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">優先したい確認項目:</span>{" "}
                      {roleplayTurn.checkpoint}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">想定質問:</span>{" "}
                      {roleplayTurn.idealQuestion}
                    </p>
                    {roleplayReply ? (
                      <p>
                        <span className="font-semibold text-slate-900">患者の返答:</span>{" "}
                        {roleplayReply.patientReply}
                      </p>
                    ) : null}
                    {roleplayReply ? (
                      <p>
                        <span className="font-semibold text-slate-900">会話メモ:</span>{" "}
                        {roleplayReply.coachNote}
                      </p>
                    ) : null}
                    {roleplayError ? (
                      <p className="text-xs text-amber-700">{roleplayError}</p>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  {isLastStep ? "結果を見る" : "次へ進む"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f6fbfa_0%,#ffffff_100%)] p-6 shadow-[0_14px_32px_rgba(15,118,110,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Session Result
            </p>
            <h4 className="mt-3 text-3xl font-semibold text-slate-900">
              ひとまず流れは完了です
            </h4>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              このたたき台では、{mode} モードの導線と簡易評価を確認できます。
              本番版ではここに音声認識結果、AI評価、不足質問の構造化フィードバックを追加できます。
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Average Score
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {averageScore}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Completed
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {completedCount}/{totalCount}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Suggested Review
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  優先確認: patient-friendly wording
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
              {mode === "roleplay"
                ? lesson.roleplayCase.wrapUp
                : "次の段階では、この結果画面から復習登録や次レッスン推薦へつなげられます。"}
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
              {sessionSaveStatus || "練習結果の保存状態を確認しています。"}
            </div>

            {mode === "roleplay" ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-teal-700">
                    Covered Well
                  </p>
                  <h5 className="mt-2 text-lg font-semibold text-slate-900">
                    押さえられた確認項目
                  </h5>
                  <div className="mt-4 space-y-3">
                    {roleplayStrongCheckpoints.length > 0 ? (
                      roleplayStrongCheckpoints.map((result) => (
                        <div
                          key={`${result.checkpoint}-${result.askedQuestion}`}
                          className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-emerald-900">
                            {result.checkpoint}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            あなたの質問: {result.askedQuestion}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        まだ十分に押さえられた項目はありません。次回は重要項目を短く先に聞く流れを意識すると安定します。
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-700">
                    Next Follow-up
                  </p>
                  <h5 className="mt-2 text-lg font-semibold text-slate-900">
                    次回の不足質問
                  </h5>
                  <div className="mt-4 space-y-3">
                    {roleplayNeedsFollowUp.length > 0 ? (
                      roleplayNeedsFollowUp.map((result) => (
                        <div
                          key={`${result.checkpoint}-${result.idealQuestion}`}
                          className="rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-amber-900">
                            {result.checkpoint}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            次はこんな聞き方が自然: {result.idealQuestion}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        大きな確認漏れはありません。次は質問の順番や言い換えの自然さを磨く段階です。
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {mode === "roleplay" ? (
              <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveRoleplayReviewItems}
                    disabled={roleplayNeedsFollowUp.length === 0}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    不足質問を復習一覧に追加
                  </button>
                  <Link
                    href="/medical-english/review"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    復習一覧を見る
                  </Link>
                </div>
                {reviewSaveStatus ? (
                  <p className="mt-3 text-sm leading-6 text-teal-700">
                    {reviewSaveStatus}
                  </p>
                ) : null}
              </div>
            ) : null}

            {mode === "speaking" ? (
              <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveSpeakingReviewItems}
                    disabled={speakingNeedsReview.length === 0}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    苦手表現を復習一覧に追加
                  </button>
                  <Link
                    href="/medical-english/review"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    復習一覧を見る
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {speakingNeedsReview.length > 0 ? (
                    speakingNeedsReview.map((result) => (
                      <div
                        key={`${result.promptJa}-${result.idealQuestion}`}
                        className="rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-amber-900">
                          {result.promptJa}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          次はこんな言い方が自然: {result.safeAlternative || result.idealQuestion}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-slate-600">
                      大きく崩れた表現はありません。次は自然さと安定感を上げる段階です。
                    </p>
                  )}
                </div>
                {reviewSaveStatus ? (
                  <p className="mt-3 text-sm leading-6 text-teal-700">
                    {reviewSaveStatus}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/medical-english/lesson/${lesson.slug}`}
                className="rounded-full bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
              >
                レッスン詳細へ戻る
              </Link>
              <Link
                href="/medical-english"
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                ホームへ戻る
              </Link>
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          Mode Notes
        </p>
        <div className="mt-4 rounded-[1.6rem] bg-[linear-gradient(180deg,#f8fcfb_0%,#ffffff_100%)] p-4">
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
          <li>今は音声入力の代わりにテキストで学習フローを再現しています。</li>
          <li>評価ロジックは簡易版で、模範表現との語句一致をベースにしています。</li>
          <li>OpenAI API キーがあると、患者応答も AI で生成して流れを続けます。</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
