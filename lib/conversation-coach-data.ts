export type ConversationTheme = {
  slug: string;
  title: string;
  description: string;
  scene: string;
  tone: "Friendly" | "Casual" | "Simple";
  difficulty: "Beginner" | "Intermediate";
  estimatedMinutes: number;
  accent: string;
  openingLine: string;
  coachGoal: string;
  suggestedTopics: string[];
  fallbackReplies: string[];
  quickReplies: string[];
};

export type ConversationReviewItem = {
  themeSlug: string;
  themeTitle: string;
  reason: string;
  recommendedPhrase: string;
  nextReviewWindow: string;
};

export type ConversationSettings = {
  level: string;
  focus: string;
  sessionLength: string;
  feedbackStyle: string;
};

export const conversationCoachThemes: ConversationTheme[] = [
  {
    slug: "coffee-chat",
    title: "カフェで気軽に雑談する",
    description: "注文のあとに軽く会話が続く、短いカフェトークを練習する。",
    scene: "A friendly chat with someone you just met at a cafe.",
    tone: "Friendly",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    accent: "from-amber-400/20 via-white to-rose-400/10",
    openingLine:
      "Hey, is this seat free? I just grabbed a latte and wanted to sit for a minute.",
    coachGoal: "相手に返しながら、自分の好みやその場の話題を1つ足して会話を続ける。",
    suggestedTopics: ["coffee", "favorite drinks", "weekend plans", "why you came here"],
    fallbackReplies: [
      "Nice. I usually get something sweet, but today I wanted plain coffee.",
      "That sounds good. Do you come here often or is this your first time?",
      "Same here. I like places that are quiet enough to relax for a bit.",
      "That makes sense. It sounds like a nice way to spend the afternoon.",
    ],
    quickReplies: ["I like iced coffee.", "I came here to relax.", "What do you usually order?"],
  },
  {
    slug: "weekend-plans",
    title: "週末の予定を話す",
    description: "週末に何をするか、相手に聞き返しながら自然に雑談する。",
    scene: "A casual conversation with a coworker before the weekend.",
    tone: "Casual",
    difficulty: "Beginner",
    estimatedMinutes: 4,
    accent: "from-sky-400/20 via-white to-cyan-400/10",
    openingLine:
      "I can't believe it's already Friday. Do you have anything planned for the weekend?",
    coachGoal: "自分の予定を短く話しつつ、相手にも質問を返して会話を往復させる。",
    suggestedTopics: ["rest", "friends", "movies", "food", "small plans"],
    fallbackReplies: [
      "That sounds nice. I might just sleep in and maybe meet a friend for dinner.",
      "I like weekends that feel easy like that. Do you usually make plans in advance?",
      "That sounds fun. I have been trying to do more simple things lately.",
      "Yeah, sometimes a quiet weekend is exactly what you need.",
    ],
    quickReplies: ["I'm going to rest at home.", "I might see a friend.", "How about you?"],
  },
  {
    slug: "self-intro",
    title: "初対面で自己紹介する",
    description: "名前、仕事、最近気になっていることを軽く話す自己紹介練習。",
    scene: "A short first meeting at a language exchange event.",
    tone: "Simple",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    accent: "from-emerald-400/20 via-white to-teal-400/10",
    openingLine:
      "Hi, I'm Alex. I don't think we've met yet. What brings you to this event?",
    coachGoal: "自分のことを短く伝えたうえで、相手のことも聞き返して会話を広げる。",
    suggestedTopics: ["job", "hobbies", "why you study English", "recent interests"],
    fallbackReplies: [
      "That makes sense. I joined because I wanted more chances to speak English out loud.",
      "Nice. It is always easier when the group feels relaxed, right?",
      "I get that. I like meeting people who are also trying to improve little by little.",
      "That sounds really interesting. I would like to hear more about it.",
    ],
    quickReplies: ["I'm here to practice speaking.", "I work in Tokyo.", "What about you?"],
  },
];

export const conversationCoachThemeMap = Object.fromEntries(
  conversationCoachThemes.map((theme) => [theme.slug, theme]),
) as Record<string, ConversationTheme>;

export const prototypeConversationReviewItems: ConversationReviewItem[] = [
  {
    themeSlug: "coffee-chat",
    themeTitle: "カフェで気軽に雑談する",
    reason: "返答が短く終わりやすい",
    recommendedPhrase: "I usually get something sweet. What do you like to order?",
    nextReviewWindow: "次の会話前に見返す",
  },
  {
    themeSlug: "weekend-plans",
    themeTitle: "週末の予定を話す",
    reason: "自分の予定だけで終わりやすい",
    recommendedPhrase: "I'm keeping it simple this weekend. How about you?",
    nextReviewWindow: "今日の最後に再確認",
  },
];

export const prototypeConversationSettings: ConversationSettings = {
  level: "Beginner to lower-intermediate",
  focus: "会話を止めずに返すこと",
  sessionLength: "1回 3-5分",
  feedbackStyle: "短く、やさしく、すぐ使える形",
};
