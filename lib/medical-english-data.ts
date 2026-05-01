export type MedicalEnglishCategory = {
  slug: string;
  name: string;
  description: string;
  lessonCount: number;
  accent: string;
};

export type SpeakingPrompt = {
  id: string;
  situation: string;
  promptJa: string;
  expectedAnswer: string;
  safeAlternative: string;
  hint: string;
};

export type ReadingQuestion = {
  id: string;
  passage: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type RoleplayTurn = {
  patientLine: string;
  idealQuestion: string;
  checkpoint: string;
};

export type RoleplayCase = {
  openingLine: string;
  goal: string;
  turns: RoleplayTurn[];
  wrapUp: string;
};

export type MedicalEnglishLesson = {
  slug: string;
  categorySlug: string;
  title: string;
  difficulty: "Beginner" | "Intermediate";
  estimatedMinutes: number;
  objective: string;
  patientFriendlyTip: string;
  keyPhrases: string[];
  speakingPrompts: SpeakingPrompt[];
  readingQuestions: ReadingQuestion[];
  roleplayCase: RoleplayCase;
};

export type PrototypeReviewItem = {
  lessonSlug: string;
  lessonTitle: string;
  reason: string;
  mode: "speaking" | "reading" | "roleplay";
  recommendedAction: string;
  nextReviewWindow: string;
};

export type PrototypeUserProfile = {
  role: string;
  englishLevel: string;
  primaryContexts: string[];
  weeklyGoal: string;
  learningFocus: string;
};

export const medicalEnglishCategories: MedicalEnglishCategory[] = [
  {
    slug: "intake-basics",
    name: "初診の入り口",
    description: "最初のあいさつ、受診理由、症状の始まりを確認する練習。",
    lessonCount: 2,
    accent: "from-teal-500/20 via-white to-cyan-500/10",
  },
  {
    slug: "respiratory",
    name: "発熱・咳・息苦しさ",
    description: "頻度の高い呼吸器症状で、重症度と経過を確かめる。",
    lessonCount: 2,
    accent: "from-emerald-500/20 via-white to-lime-500/10",
  },
  {
    slug: "pain-history",
    name: "痛み・既往歴・薬",
    description: "痛みの評価や、既往歴と内服の確認をやさしい英語で行う。",
    lessonCount: 2,
    accent: "from-amber-500/20 via-white to-rose-500/10",
  },
];

export const medicalEnglishLessons: MedicalEnglishLesson[] = [
  {
    slug: "fever-first-visit",
    categorySlug: "intake-basics",
    title: "発熱で来院した患者の初診問診",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    objective: "受診理由、発熱の開始時期、随伴症状を短く確認できるようになる。",
    patientFriendlyTip:
      "専門用語よりも、short, clear, one-question-at-a-time を優先する。",
    keyPhrases: [
      "What brought you in today?",
      "When did the fever start?",
      "Do you have a cough or sore throat?",
    ],
    speakingPrompts: [
      {
        id: "s1",
        situation: "最初の受診理由を聞く場面",
        promptJa: "今日はどうされましたか？",
        expectedAnswer: "What brought you in today?",
        safeAlternative: "How can I help you today?",
        hint: "受診理由をやさしく開く質問。",
      },
      {
        id: "s2",
        situation: "発熱の始まりを確認する場面",
        promptJa: "熱はいつからありますか？",
        expectedAnswer: "When did the fever start?",
        safeAlternative: "When did you first notice the fever?",
        hint: "start または first notice を使う。",
      },
      {
        id: "s3",
        situation: "随伴症状を確認する場面",
        promptJa: "咳や喉の痛みはありますか？",
        expectedAnswer: "Do you have a cough or sore throat?",
        safeAlternative: "Have you had any cough or sore throat?",
        hint: "Have you had any... でも伝わる。",
      },
    ],
    readingQuestions: [
      {
        id: "r1",
        passage:
          "I have had a fever since yesterday evening, and my throat feels sore when I swallow.",
        question: "患者が訴えている症状として最も適切なのはどれですか？",
        choices: ["腹痛と吐き気", "発熱と咽頭痛", "胸痛と動悸", "頭痛と視力低下"],
        correctIndex: 1,
        explanation: "fever と sore throat when swallowing が主要情報。",
      },
      {
        id: "r2",
        passage:
          "I started coughing this morning, but I do not feel short of breath.",
        question: "この英文から読み取れるものはどれですか？",
        choices: [
          "息切れがある",
          "咳は昨日から続いている",
          "今朝から咳があり、息苦しさはない",
          "発熱はないと明言している",
        ],
        correctIndex: 2,
        explanation: "this morning と do not feel short of breath が鍵。",
      },
      {
        id: "r3",
        passage:
          "My son had the flu last week, so I am worried this might be the same thing.",
        question: "患者の背景として重要なのはどれですか？",
        choices: ["海外渡航歴", "家族内の感染疑い", "薬剤アレルギー", "既往歴の悪化"],
        correctIndex: 1,
        explanation: "同居家族の flu は接触歴として重要。",
      },
    ],
    roleplayCase: {
      openingLine: "Hi, doctor. I have had a fever since last night and I feel tired.",
      goal: "発熱の開始、咳の有無、喉の痛み、呼吸苦の有無を確認する。",
      turns: [
        {
          patientLine: "It started last night after dinner.",
          idealQuestion: "Do you have a cough or sore throat?",
          checkpoint: "発熱の開始時期",
        },
        {
          patientLine: "Yes, my throat hurts, but I do not really have a cough.",
          idealQuestion: "Are you having any trouble breathing?",
          checkpoint: "咳と喉の痛み",
        },
        {
          patientLine: "No, breathing is okay. I just feel weak.",
          idealQuestion: "Have you taken any medicine for the fever?",
          checkpoint: "呼吸苦の有無",
        },
      ],
      wrapUp:
        "Great job. In the real app, this screen would score missing checkpoints and suggest follow-up questions.",
    },
  },
  {
    slug: "cough-shortness-of-breath",
    categorySlug: "respiratory",
    title: "咳と息苦しさの重症度確認",
    difficulty: "Intermediate",
    estimatedMinutes: 8,
    objective: "呼吸器症状の重症度と緊急性をやさしい英語で確認する。",
    patientFriendlyTip:
      "呼吸症状では severity を詰め込みすぎず、息苦しさ・胸痛・話せるかを順に確認する。",
    keyPhrases: [
      "Are you short of breath right now?",
      "Does it get worse when you walk?",
      "Do you have any chest pain?",
    ],
    speakingPrompts: [
      {
        id: "s1",
        situation: "現在の息苦しさを確認する場面",
        promptJa: "今、息苦しさはありますか？",
        expectedAnswer: "Are you short of breath right now?",
        safeAlternative: "Are you having trouble breathing right now?",
        hint: "short of breath と trouble breathing の両方が使える。",
      },
      {
        id: "s2",
        situation: "歩行時悪化を確認する場面",
        promptJa: "歩くと悪化しますか？",
        expectedAnswer: "Does it get worse when you walk?",
        safeAlternative: "Is it worse when you are walking?",
        hint: "activity と関連づける。",
      },
      {
        id: "s3",
        situation: "胸痛を確認する場面",
        promptJa: "胸の痛みはありますか？",
        expectedAnswer: "Do you have any chest pain?",
        safeAlternative: "Are you feeling any pain in your chest?",
        hint: "any chest pain は医療現場でよく使う。",
      },
    ],
    readingQuestions: [
      {
        id: "r1",
        passage:
          "I can speak in full sentences, but I feel more short of breath when I climb stairs.",
        question: "重症度の判断として最も近いものはどれですか？",
        choices: [
          "安静時も会話困難な強い呼吸苦",
          "労作時に増悪する呼吸苦",
          "胸痛のみで呼吸症状なし",
          "呼吸症状は改善傾向",
        ],
        correctIndex: 1,
        explanation: "climb stairs で悪化し、full sentences は比較的保たれている。",
      },
      {
        id: "r2",
        passage:
          "There is no fever, but I have had a dry cough for five days and mild chest tightness.",
        question: "この患者に追加で確認したい内容として最も自然なのはどれですか？",
        choices: [
          "皮疹の有無",
          "呼吸苦の程度",
          "腹部手術歴",
          "視力低下の有無",
        ],
        correctIndex: 1,
        explanation: "dry cough と chest tightness があるため呼吸状態の評価が優先。",
      },
      {
        id: "r3",
        passage:
          "I used my inhaler twice today, but it did not help much.",
        question: "読み取れる背景として正しいものはどれですか？",
        choices: ["吸入薬を使っていない", "薬の効果が十分でない", "症状は完全に改善した", "発熱が主訴である"],
        correctIndex: 1,
        explanation: "did not help much から効果不十分が分かる。",
      },
    ],
    roleplayCase: {
      openingLine:
        "I have been coughing for a few days, and I feel a little tight in my chest.",
      goal: "現在の呼吸苦、労作時増悪、胸痛、吸入薬使用を確認する。",
      turns: [
        {
          patientLine: "I am okay sitting here, but stairs make it worse.",
          idealQuestion: "Do you have any chest pain?",
          checkpoint: "安静時と労作時の差",
        },
        {
          patientLine: "Not really pain, more like pressure.",
          idealQuestion: "Have you used any inhaler or medicine today?",
          checkpoint: "胸部症状の内容",
        },
        {
          patientLine: "Yes, I used my inhaler twice, but it did not help much.",
          idealQuestion: "Are you able to speak in full sentences without stopping?",
          checkpoint: "薬剤使用と効果",
        },
      ],
      wrapUp:
        "This prototype shows the conversation shape first. Triage scoring and safety flags can be added next.",
    },
  },
  {
    slug: "abdominal-pain-history",
    categorySlug: "pain-history",
    title: "腹痛と既往歴・内服確認",
    difficulty: "Beginner",
    estimatedMinutes: 7,
    objective: "腹痛の部位と強さ、既往歴と内服を簡潔に確認する。",
    patientFriendlyTip:
      "痛み評価では location, severity, medication を分けて聞くと通じやすい。",
    keyPhrases: [
      "Where exactly is the pain?",
      "How strong is the pain from zero to ten?",
      "Do you take any medicine every day?",
    ],
    speakingPrompts: [
      {
        id: "s1",
        situation: "痛みの場所を特定する場面",
        promptJa: "どこが痛いですか？",
        expectedAnswer: "Where exactly is the pain?",
        safeAlternative: "Can you show me where it hurts?",
        hint: "show me where it hurts も患者向けにやさしい。",
      },
      {
        id: "s2",
        situation: "痛みの強さを数値で確認する場面",
        promptJa: "痛みの強さを0から10で教えてください。",
        expectedAnswer: "How strong is the pain from zero to ten?",
        safeAlternative: "How bad is the pain on a scale of zero to ten?",
        hint: "on a scale of zero to ten が定番。",
      },
      {
        id: "s3",
        situation: "内服を確認する場面",
        promptJa: "毎日飲んでいる薬はありますか？",
        expectedAnswer: "Do you take any medicine every day?",
        safeAlternative: "Are you on any regular medicine?",
        hint: "regular medicine も使いやすい。",
      },
    ],
    readingQuestions: [
      {
        id: "r1",
        passage:
          "The pain is mostly on the right side of my lower belly, and it started this morning.",
        question: "腹痛の情報として正しいのはどれですか？",
        choices: [
          "上腹部痛で昨日から",
          "右下腹部痛で今朝から",
          "左背部痛で夜から",
          "全腹部痛で1週間前から",
        ],
        correctIndex: 1,
        explanation: "right side of my lower belly と this morning が鍵。",
      },
      {
        id: "r2",
        passage:
          "It is about seven out of ten, and I threw up once after lunch.",
        question: "追加情報として読み取れるものはどれですか？",
        choices: ["痛みは軽度", "昼食後に一度嘔吐", "朝から下痢が続く", "食欲は保たれている"],
        correctIndex: 1,
        explanation: "threw up once after lunch が重要。",
      },
      {
        id: "r3",
        passage:
          "I take medicine for blood pressure, and I am allergic to penicillin.",
        question: "問診上の重要情報はどれですか？",
        choices: ["高血圧治療薬の内服とペニシリンアレルギー", "糖尿病治療中と造影剤アレルギー", "精神科通院歴のみ", "サプリメントのみ服用"],
        correctIndex: 0,
        explanation: "blood pressure medicine と penicillin allergy が主要情報。",
      },
    ],
    roleplayCase: {
      openingLine: "My stomach hurts on the lower right side, and it is getting worse.",
      goal: "痛みの場所、強さ、嘔吐の有無、常用薬を確認する。",
      turns: [
        {
          patientLine: "It is here on the lower right side.",
          idealQuestion: "How bad is the pain on a scale of zero to ten?",
          checkpoint: "痛みの場所",
        },
        {
          patientLine: "Maybe seven out of ten.",
          idealQuestion: "Have you had any vomiting?",
          checkpoint: "痛みの強さ",
        },
        {
          patientLine: "Yes, once after lunch.",
          idealQuestion: "Do you take any medicine every day?",
          checkpoint: "嘔吐の有無",
        },
      ],
      wrapUp:
        "Nice. A future version can branch into urgent abdominal pain support while keeping the learning mode separate.",
    },
  },
];

export const prototypeReviewItems: PrototypeReviewItem[] = [
  {
    lessonSlug: "fever-first-visit",
    lessonTitle: "発熱で来院した患者の初診問診",
    reason: "受診理由の聞き方が直訳寄り",
    mode: "speaking",
    recommendedAction: "最初の1問を短く言い直してから、開始時期を聞く流れを反復する。",
    nextReviewWindow: "今日のうちに再挑戦",
  },
  {
    lessonSlug: "cough-shortness-of-breath",
    lessonTitle: "咳と息苦しさの重症度確認",
    reason: "呼吸苦の確認順が少し不自然",
    mode: "roleplay",
    recommendedAction: "安静時か労作時かを先に確認してから、胸痛や吸入薬へ進む。",
    nextReviewWindow: "明日もう一度",
  },
  {
    lessonSlug: "abdominal-pain-history",
    lessonTitle: "腹痛と既往歴・内服確認",
    reason: "痛み評価のスケール表現を復習したい",
    mode: "speaking",
    recommendedAction: "痛みの場所を聞いた後に、zero to ten の言い方を続けて練習する。",
    nextReviewWindow: "48時間以内",
  },
];

export const prototypeUserProfile: PrototypeUserProfile = {
  role: "看護師",
  englishLevel: "CEFR A2-B1",
  primaryContexts: ["外来", "初診対応", "発熱・咳の一次対応"],
  weeklyGoal: "週4回、1回5分のレッスンを続ける",
  learningFocus: "患者向けにやさしい英語で問診の最初の流れを安定させる",
};

export function getMedicalEnglishCategory(slug: string) {
  return medicalEnglishCategories.find((category) => category.slug === slug) ?? null;
}

export function getMedicalEnglishLesson(slug: string) {
  return medicalEnglishLessons.find((lesson) => lesson.slug === slug) ?? null;
}

export function getLessonsByCategory(slug: string) {
  return medicalEnglishLessons.filter((lesson) => lesson.categorySlug === slug);
}
