export type EvaluationMode = "speaking" | "roleplay";

export type EvaluationInput = {
  mode: EvaluationMode;
  userAnswer: string;
  expectedAnswer: string;
  safeAlternative?: string;
  promptJa?: string;
  situation?: string;
  checkpoint?: string;
};

export type EvaluationFeedback = {
  score: number;
  summary: string;
  betterPhrase: string;
  safetyNote: string;
  source: "ai" | "fallback";
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

export function buildFallbackEvaluation(
  input: EvaluationInput,
): EvaluationFeedback {
  const score = getWordOverlapScore(input.userAnswer, input.expectedAnswer);

  if (input.mode === "speaking") {
    if (score >= 75) {
      return {
        score,
        summary: "十分伝わる形です。次は語順を安定させるとさらに自然です。",
        betterPhrase: input.safeAlternative || input.expectedAnswer,
        safetyNote: "一文を短く保つと、患者により通じやすくなります。",
        source: "fallback",
      };
    }

    if (score >= 45) {
      return {
        score,
        summary:
          "意味は近いです。主語や時制を少し整えると現場で使いやすくなります。",
        betterPhrase: input.expectedAnswer,
        safetyNote: "一度に複数の質問を重ねず、1つずつ確認すると安全です。",
        source: "fallback",
      };
    }

    return {
      score,
      summary:
        "直訳寄りです。短い基本形に寄せると、患者に通じやすくなります。",
      betterPhrase: input.expectedAnswer,
      safetyNote: "やさしい語彙で短く聞く方が誤解を減らしやすいです。",
      source: "fallback",
    };
  }

  if (score >= 65) {
    return {
      score,
      summary:
        "質問の方向性はかなり良いです。次の確認項目へ自然につながります。",
      betterPhrase: input.expectedAnswer,
      safetyNote: "症状の重症度と緊急性に関わる項目を先に確認すると安定します。",
      source: "fallback",
    };
  }

  return {
    score,
    summary:
      "会話としては成立しますが、この場面では優先して聞きたい項目があります。",
    betterPhrase: input.expectedAnswer,
    safetyNote: `まず ${input.checkpoint || "重要項目"} を押さえてから詳細へ進むと安全です。`,
    source: "fallback",
  };
}
