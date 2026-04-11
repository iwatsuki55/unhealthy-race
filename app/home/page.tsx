import Link from "next/link";
import { redirect } from "next/navigation";
import { CommentToneForm } from "@/app/home/comment-tone-form";
import { StartRaceForm } from "@/app/home/start-race-form";
import { GenerateInviteForm, JoinInviteForm } from "@/app/home/invite-forms";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getHomeSummary } from "@/lib/home-server";
import { getProfileByUserId } from "@/lib/profile-server";
import { getRaceInvites } from "@/lib/race-invite-server";
import {
  getLatestArchivedRaceResult,
  getRaceMemberSummaries,
} from "@/lib/race-summary-server";
import { getOrCreateCurrentRace } from "@/lib/race-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams?: Promise<{
    action_saved?: string;
    race_started?: string;
    invite_created?: string;
    invite_joined?: string;
    tone_updated?: string;
    result_closed?: string;
  }>;
};

function getRankAccent(index: number) {
  if (index === 0) {
    return {
      badge: "bg-amber-100 text-amber-700",
      ring: "border-amber-200 bg-amber-50",
      label: "首位",
      icon: "🥇",
    };
  }

  if (index === 1) {
    return {
      badge: "bg-slate-200 text-slate-700",
      ring: "border-slate-200 bg-slate-50",
      label: "2位",
      icon: "🥈",
    };
  }

  if (index === 2) {
    return {
      badge: "bg-orange-100 text-orange-700",
      ring: "border-orange-200 bg-orange-50",
      label: "3位",
      icon: "🥉",
    };
  }

  return {
    badge: "bg-primary-100 text-primary-800",
    ring: "border-slate-100 bg-slate-50",
    label: `${index + 1}位`,
    icon: `${index + 1}`,
  };
}

function getMomentumLabel(index: number, gapFromLeader: number) {
  if (index === 0 && gapFromLeader === 0) {
    return "優勝候補";
  }

  if (gapFromLeader <= 5) {
    return "追い上げ圏";
  }

  if (gapFromLeader <= 15) {
    return "射程内";
  }

  return "立て直し中";
}

function getResultVerdict(gapFromWinner: number, yourRank: number) {
  if (yourRank === 1 && gapFromWinner === 0) {
    return {
      label: "🏆 勝利",
      className: "bg-amber-100 text-amber-700",
      description: "前回レースはあなたがトップでした。",
    };
  }

  if (gapFromWinner <= 5) {
    return {
      label: "🔥 惜敗",
      className: "bg-rose-100 text-rose-700",
      description: "かなり僅差でした。次は十分ひっくり返せます。",
    };
  }

  return {
    label: "🌧 追走中",
    className: "bg-slate-200 text-slate-700",
    description: "差はつきましたが、次レースで巻き返せます。",
  };
}

function getShareHeadline({
  isLeader,
  leaderGap,
  participantCount,
}: {
  isLeader: boolean;
  leaderGap: number;
  participantCount: number;
}) {
  if (participantCount <= 1) {
    return "まずは参加者を増やしてレースを始めましょう";
  }

  if (isLeader) {
    return "現在トップです。このまま逃げ切れるかが見どころです";
  }

  if (leaderGap <= 5) {
    return "かなり接戦です。次の1件でひっくり返せます";
  }

  return "まだ巻き返せる差です。ここからが勝負です";
}

function formatRacePeriodLabel(startAt: string | null, endAt: string | null) {
  if (!startAt) {
    return "期間情報なし";
  }

  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : new Date(start);

  if (!endAt) {
    end.setDate(end.getDate() + 6);
  }

  return `${start.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  })} - ${end.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  })}`;
}

function formatFullDateLabel(dateString: string | null) {
  if (!dateString) {
    return "未設定";
  }

  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function getRaceScheduleSummary(startAt: string | null, endAt: string | null) {
  if (!startAt) {
    return {
      endAt: null,
      endDateLabel: "未設定",
      remainingLabel: "終了予定は未設定です",
      ruleLabel: "新しいレース開始時に終了",
      isEndingSoon: false,
      isPastDue: false,
      statusBadgeClassName: "bg-slate-100 text-slate-600",
      statusBadgeLabel: "終了日未設定",
    };
  }

  const end = endAt ? new Date(endAt) : new Date(startAt);

  if (!endAt) {
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let remainingLabel = "終了日を過ぎています";
  let isEndingSoon = false;
  let isPastDue = false;
  let statusBadgeClassName = "bg-emerald-100 text-emerald-700";
  let statusBadgeLabel = "進行中";

  if (diffDays >= 2) {
    remainingLabel = `終了目安まであと ${diffDays} 日です`;
  } else if (diffDays === 1) {
    remainingLabel = "終了目安は明日です";
    isEndingSoon = true;
    statusBadgeClassName = "bg-amber-100 text-amber-700";
    statusBadgeLabel = "まもなく終了";
  } else if (diffDays === 0) {
    remainingLabel = "終了目安は今日です";
    isEndingSoon = true;
    statusBadgeClassName = "bg-rose-100 text-rose-700";
    statusBadgeLabel = "本日終了目安";
  } else {
    isEndingSoon = true;
    isPastDue = true;
    statusBadgeClassName = "bg-slate-200 text-slate-700";
    statusBadgeLabel = "終了待ち";
  }

  return {
    endAt: end.toISOString(),
    endDateLabel: formatFullDateLabel(end.toISOString()),
    remainingLabel,
    ruleLabel: "7日想定、または新しいレース開始時に終了",
    isEndingSoon,
    isPastDue,
    statusBadgeClassName,
    statusBadgeLabel,
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id).catch(() => null);

  if (!profile?.nickname) {
    redirect("/profile/setup");
  }

  const currentRace = await getOrCreateCurrentRace(user.id);
  const invites = await getRaceInvites(currentRace.id, user.id).catch(() => []);
  const raceMembers = await getRaceMemberSummaries(currentRace.id).catch(() => []);
  const latestRaceResult = await getLatestArchivedRaceResult(user.id).catch(() => null);
  const hasRival = raceMembers.some(
    (member) => member.relationshipType === "rival" && member.userId !== user.id,
  );
  const hasFriend = raceMembers.some(
    (member) => member.relationshipType === "friend" && member.userId !== user.id,
  );

  const summary = await getHomeSummary({
    userId: user.id,
    raceId: currentRace.id,
    hasRival,
    hasFriend,
    commentTone:
      profile.comment_tone === "sarcastic" ? "sarcastic" : "gentle",
  }).catch(() => ({
    currentPoints: 0,
    todayDelta: 0,
    recentLogs: [],
    weekTrend: [],
    comment: hasRival
      ? "今日はどこまでポイントを伸ばすつもりですか"
      : "今日はここから立て直そう",
  }));
  const resolvedSearchParams = await searchParams;
  const actionSaved = resolvedSearchParams?.action_saved === "1";
  const raceStarted = resolvedSearchParams?.race_started === "1";
  const inviteCreated = resolvedSearchParams?.invite_created === "1";
  const inviteJoined = resolvedSearchParams?.invite_joined === "1";
  const toneUpdated = resolvedSearchParams?.tone_updated === "1";
  const resultClosed = resolvedSearchParams?.result_closed === "1";
  const maxTrendValue = Math.max(
    1,
    ...summary.weekTrend.map((item) => Math.abs(item.delta)),
  );
  const yourStandingIndex = raceMembers.findIndex((member) => member.userId === user.id);
  const yourStanding = yourStandingIndex >= 0 ? raceMembers[yourStandingIndex] : null;
  const leader = raceMembers[0] ?? null;
  const nearestRival = yourStanding
    ? raceMembers.find(
        (member) =>
          member.userId !== user.id &&
          member.relationshipType === "rival",
      ) ?? null
    : null;
  const leaderGap =
    yourStanding && leader ? Math.max(0, leader.totalPoints - yourStanding.totalPoints) : 0;
  const rivalGap =
    yourStanding && nearestRival
      ? nearestRival.totalPoints - yourStanding.totalPoints
      : null;
  const podiumMembers = raceMembers.slice(0, 3);
  const raceOwner =
    raceMembers.find((member) => member.relationshipType === "self") ?? null;
  const latestRaceVerdict = latestRaceResult
    ? getResultVerdict(latestRaceResult.gapFromWinner, latestRaceResult.yourRank)
    : null;
  const shareHeadline = getShareHeadline({
    isLeader: leaderGap === 0,
    leaderGap,
    participantCount: raceMembers.length,
  });
  const currentRacePeriod = formatRacePeriodLabel(currentRace.start_at, currentRace.end_at);
  const raceSchedule = getRaceScheduleSummary(currentRace.start_at, currentRace.end_at);
  const isCurrentUserRaceOwner = currentRace.relationship_type === "self";
  const shouldPromptRaceFinish = isCurrentUserRaceOwner && raceSchedule.isPastDue;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-primary-700">ホーム</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {profile.nickname} さん、今日はここから整えましょう
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              現在ポイント、今日の増減、最近の登録をまとめて見られるホーム画面です。
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              現在のレース: {currentRace.name}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                終了予定日: {raceSchedule.endDateLabel}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                {raceSchedule.remainingLabel}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${raceSchedule.statusBadgeClassName}`}
              >
                {raceSchedule.statusBadgeLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {isCurrentUserRaceOwner
                  ? "このレースの終了トリガーはあなたです"
                  : `終了トリガー: ${raceOwner?.nickname ?? "レースオーナー"}`}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/history"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              履歴を見る
            </Link>
            <Link
              href="/actions/new"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              行動を登録する
            </Link>
            <LogoutButton />
          </div>
        </header>

        {raceStarted && latestRaceResult && latestRaceVerdict && !resultClosed ? (
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(254,243,199,0.9),_rgba(255,255,255,1)_45%,_rgba(226,232,240,0.9)_100%)] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Previous Race Result
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    {latestRaceResult.raceName} が終了しました
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    新しいレースを開始したので、前回レースの結果をここにまとめています。
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${latestRaceVerdict.className}`}
                >
                  {latestRaceVerdict.label}
                </span>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href="/home?result_closed=1"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  結果を閉じる
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Winner
                  </p>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    🏆 {latestRaceResult.winner.nickname}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {latestRaceResult.winner.totalPoints} pt でフィニッシュしました。
                  </p>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Your Result
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {latestRaceResult.yourRank} 位
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {latestRaceResult.participantCount}人中の結果です。
                  </p>
                </div>

                <div className="rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Gap
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {latestRaceResult.gapFromWinner} pt
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {latestRaceVerdict.description}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {raceSchedule.isPastDue ? (
          <section
            className={`rounded-3xl border p-6 shadow-soft ${
              isCurrentUserRaceOwner
                ? "border-rose-200 bg-rose-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                    isCurrentUserRaceOwner ? "text-rose-700" : "text-amber-700"
                  }`}
                >
                  Race Finish Waiting
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {isCurrentUserRaceOwner
                    ? "このレースは結果確定のタイミングです"
                    : "このレースは終了待ちです"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
                  {isCurrentUserRaceOwner
                    ? "終了予定日を過ぎています。新しいレースを開始すると、このレースの結果が確定して次へ進みます。"
                    : `${raceOwner?.nickname ?? "レースオーナー"} が新しいレースを開始すると、このレースの結果が確定します。`}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                  それまでは記録を続けられますが、順位とポイントはまだ暫定です。
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${raceSchedule.statusBadgeClassName}`}
              >
                {raceSchedule.statusBadgeLabel}
              </span>
            </div>

            {yourStanding ? (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    暫定順位
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {yourStandingIndex + 1} 位
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {raceMembers.length}人中の現在位置です。
                  </p>
                </div>

                <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    トップとの差
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{leaderGap} pt</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {leaderGap === 0
                      ? "いまのところ先頭です。"
                      : "結果確定前の暫定差です。"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    終了トリガー
                  </p>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {isCurrentUserRaceOwner
                      ? "あなた"
                      : raceOwner?.nickname ?? "レースオーナー"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {isCurrentUserRaceOwner
                      ? "新しいレースを開始すると結果が確定します。"
                      : "この人の操作で結果が確定します。"}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          {actionSaved ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              行動を保存しました。
            </div>
          ) : null}
          {raceStarted ? (
            <div className="mb-5 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              新しいレースを開始しました。ここからポイントが再スタートします。
            </div>
          ) : null}
          {inviteCreated ? (
            <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
              招待コードを発行しました。
            </div>
          ) : null}
          {inviteJoined ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              招待コードでレースに参加しました。
            </div>
          ) : null}
          {toneUpdated ? (
            <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
              コメントトーンを更新しました。
            </div>
          ) : null}

          <div
            className={`mb-5 rounded-2xl px-4 py-4 ${
              raceSchedule.isEndingSoon
                ? "border border-amber-200 bg-amber-50"
                : "border border-sky-100 bg-sky-50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                    raceSchedule.isEndingSoon ? "text-amber-700" : "text-sky-700"
                  }`}
                >
                  Race Schedule
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  このレースの終了目安は {raceSchedule.endDateLabel} です
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {raceSchedule.remainingLabel}。オーナーが先に新しいレースを開始した場合は、
                  その時点で結果が確定します。
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isCurrentUserRaceOwner
                    ? "あなたが新しいレースを開始すると、このレースの結果が確定します。"
                    : `${raceOwner?.nickname ?? "レースオーナー"} が新しいレースを開始すると、このレースの結果が確定します。`}
                </p>
                {raceSchedule.isPastDue ? (
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                    {isCurrentUserRaceOwner
                      ? "終了予定日を過ぎています。結果を確定するなら、新しいレースを開始してください。"
                      : `終了予定日を過ぎています。${raceOwner?.nickname ?? "レースオーナー"} が次のレースを開始すると結果が確定します。`}
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full bg-white px-3 py-1 text-xs font-semibold ${
                  raceSchedule.isEndingSoon ? "text-amber-700" : "text-sky-700"
                }`}
              >
                {raceSchedule.ruleLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-primary-900 p-6 text-white">
              <p className="text-sm font-semibold tracking-[0.16em] text-primary-100">
                CURRENT POINTS
              </p>
              <p className="mt-4 text-4xl font-bold">{summary.currentPoints} pt</p>
              <p className="mt-3 text-sm leading-6 text-primary-100">{summary.comment}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">今日の増減</p>
              <p
                className={`mt-4 text-3xl font-bold ${
                  summary.todayDelta > 0
                    ? "text-amber-600"
                    : summary.todayDelta < 0
                      ? "text-emerald-600"
                      : "text-slate-900"
                }`}
              >
                {summary.todayDelta > 0 ? `+${summary.todayDelta}` : summary.todayDelta} pt
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                不健康行動で加算、健康行動で減算した今日の合計です。
              </p>
            </div>
          </div>

          {yourStanding ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  現在順位
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {yourStandingIndex + 1} 位
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {raceMembers.length}人中の現在位置です。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  トップとの差
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{leaderGap} pt</p>
                <p className="mt-2 text-sm text-slate-600">
                  {leaderGap === 0
                    ? "いまは先頭です。かなり仕上がっています。"
                    : "トップに追いつくまでの差です。"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  ライバルとの差
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {rivalGap === null ? "-" : `${rivalGap > 0 ? "+" : ""}${rivalGap} pt`}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {nearestRival
                    ? `${nearestRival.nickname} との現在差です。`
                    : "ライバル参加後に表示されます。"}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {latestRaceResult ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">前回レースの結果</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {latestRaceResult.raceName} の結果です。
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {latestRaceResult.endedAt
                  ? new Date(latestRaceResult.endedAt).toLocaleDateString("ja-JP")
                  : "終了済み"}
              </span>
            </div>

            {latestRaceVerdict ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${latestRaceVerdict.className}`}
                  >
                    {latestRaceVerdict.label}
                  </span>
                  <p className="text-sm text-slate-600">{latestRaceVerdict.description}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                  Winner
                </p>
                <p className="mt-3 text-lg font-bold text-slate-900">
                  🏆 {latestRaceResult.winner.nickname}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {latestRaceResult.winner.totalPoints} pt で前回トップでした。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  あなたの順位
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {latestRaceResult.yourRank} 位
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {latestRaceResult.participantCount}人中の結果です。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  勝者との差
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {latestRaceResult.gapFromWinner} pt
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {latestRaceResult.gapFromWinner === 0
                    ? "前回はあなたが勝者でした。かなり仕上がっています。"
                    : "次のレースでひっくり返せる差です。"}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">共有用サマリー</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                スクリーンショットで共有しやすい、今のレース状況まとめです。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {currentRace.name}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {currentRacePeriod}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${raceSchedule.statusBadgeClassName}`}
              >
                {raceSchedule.statusBadgeLabel}
              </span>
            </div>
          </div>

          <div
            className={`mt-5 overflow-hidden rounded-[28px] p-6 text-white ${
              raceSchedule.isEndingSoon
                ? "bg-[linear-gradient(135deg,#4a2b12_0%,#7c3f17_55%,#fff4e5_160%)]"
                : "bg-[linear-gradient(135deg,#163b30_0%,#244f42_60%,#eef6f1_160%)]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Unhealthy Race Snapshot
                </p>
                <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  {currentRace.name} / {currentRacePeriod}
                </p>
                <h3 className="mt-3 text-2xl font-bold">
                  {profile.nickname} の現在順位は{" "}
                  {yourStandingIndex >= 0 ? `${yourStandingIndex + 1}位` : "-"}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                  {shareHeadline}
                </p>
                <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  {raceSchedule.remainingLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  Current Points
                </p>
                <p className="mt-2 text-3xl font-bold">{summary.currentPoints} pt</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  Leader Gap
                </p>
                <p className="mt-3 text-2xl font-bold">{leaderGap} pt</p>
                <p className="mt-2 text-xs leading-5 text-white/70">トップとの差です。</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  Rival Gap
                </p>
                <p className="mt-3 text-2xl font-bold">
                  {rivalGap === null ? "-" : `${rivalGap > 0 ? "+" : ""}${rivalGap} pt`}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  {nearestRival ? `${nearestRival.nickname} との差` : "ライバル参加後に表示"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  Today Delta
                </p>
                <p className="mt-3 text-2xl font-bold">
                  {summary.todayDelta > 0 ? `+${summary.todayDelta}` : summary.todayDelta} pt
                </p>
                <p className="mt-2 text-xs leading-5 text-white/70">今日の増減です。</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {podiumMembers.map((member, index) => {
                const accent = getRankAccent(index);

                return (
                  <div
                    key={`${member.userId}-share`}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-2xl">{accent.icon}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80">
                        {accent.label}
                      </span>
                    </div>
                    <p className="mt-4 text-base font-semibold">
                      {member.nickname}
                      {member.userId === user.id ? " (あなた)" : ""}
                    </p>
                    <p className="mt-2 text-2xl font-bold">{member.totalPoints} pt</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">レース終了ルール</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            いつ結果が確定するかを、ホーム上で分かるようにしています。
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                現在の想定期間
              </p>
              <p className="mt-3 text-lg font-bold text-slate-900">{currentRacePeriod}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                選択した期間に応じて終了予定日を表示しています。
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                終了条件
              </p>
              <p className="mt-3 text-lg font-bold text-slate-900">{raceSchedule.endDateLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                選択した期間の終了目安です。オーナーが新しいレースを開始した時点でも、
                現在のレースは終了扱いになります。
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                結果の見直し
              </p>
              <p className="mt-3 text-lg font-bold text-slate-900">終了後に確認</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                前回レースの結果はホーム上部に出るので、次へ進む前に見直せます。
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">プロフィール</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">ニックネーム</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {profile.nickname}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">年代</dt>
                <dd className="mt-1 text-sm text-slate-700">
                  {profile.age_group || "未設定"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">性別</dt>
                <dd className="mt-1 text-sm text-slate-700">
                  {profile.gender || "未設定"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">直近の登録行動</h2>
              <div className="flex items-center gap-3">
                <Link
                  href="/history"
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  すべて見る
                </Link>
                <Link
                  href="/actions/new"
                  className="text-sm font-medium text-primary-700 transition hover:text-primary-800"
                >
                  新しく登録する
                </Link>
              </div>
            </div>

            {summary.recentLogs.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
                まだ登録がありません。まずは今日の行動を1つ記録してみましょう。
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {summary.recentLogs.map((log) => (
                  <article
                    key={log.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {log.action?.name ?? "不明な行動"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(log.action_at).toLocaleString("ja-JP")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          log.point_value > 0
                            ? "bg-amber-100 text-amber-700"
                            : log.point_value < 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {log.point_value > 0 ? `+${log.point_value}` : log.point_value} pt
                      </span>
                    </div>
                    {log.memo ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{log.memo}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">今日のひとこと</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{summary.comment}</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">コメントトーン設定</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ホームに出るひとことの雰囲気を切り替えられます。
          </p>
          <div className="mt-5 max-w-sm">
            <CommentToneForm
              defaultValue={
                profile.comment_tone === "sarcastic" ? "sarcastic" : "gentle"
              }
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">レース参加メンバー</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                同じレースに参加しているメンバーの現在ポイントです。
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${raceSchedule.statusBadgeClassName}`}
            >
              {raceSchedule.statusBadgeLabel}
            </span>
          </div>

          {raceSchedule.isEndingSoon ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              このレースは締切が近いです。{raceSchedule.remainingLabel}
            </div>
          ) : null}

          {raceMembers.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
              まだ参加メンバーがいません。招待コードを発行して友達やライバルを呼べます。
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {podiumMembers.map((member, index) => {
                  const accent = getRankAccent(index);
                  const gapFromLeader = Math.max(
                    0,
                    (leader?.totalPoints ?? 0) - member.totalPoints,
                  );

                  return (
                    <article
                      key={`${member.userId}-podium`}
                      className={`rounded-2xl border p-4 ${accent.ring}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accent.badge}`}
                        >
                          {accent.label}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {getMomentumLabel(index, gapFromLeader)}
                        </span>
                      </div>
                      <p className="mt-4 text-base font-semibold text-slate-900">
                        {member.nickname}
                        {member.userId === user.id ? " (あなた)" : ""}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {member.totalPoints} pt
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {gapFromLeader === 0
                          ? "いまのところ先頭をキープしています。"
                          : `トップまであと ${gapFromLeader} pt です。`}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="space-y-3">
                {raceMembers.map((member, index) => {
                  const isYou = member.userId === user.id;
                  const relationshipLabel =
                    member.relationshipType === "self"
                      ? "自分"
                      : member.relationshipType === "friend"
                        ? "友達"
                        : "ライバル";
                  const gapFromLeader = Math.max(
                    0,
                    (leader?.totalPoints ?? 0) - member.totalPoints,
                  );
                  const accent = getRankAccent(index);

                  const relationshipClass =
                    member.relationshipType === "rival"
                      ? "bg-rose-100 text-rose-700"
                      : member.relationshipType === "friend"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-200 text-slate-700";

                  return (
                    <article
                      key={member.userId}
                      className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 ${
                        isYou
                          ? "border-primary-200 bg-primary-50/60"
                          : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${accent.badge}`}
                        >
                          {accent.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {member.nickname}
                              {isYou ? " (あなた)" : ""}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${relationshipClass}`}
                            >
                              {relationshipLabel}
                            </span>
                            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getMomentumLabel(index, gapFromLeader)}
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                              {member.relationshipType === "rival"
                                ? "勝負モード"
                                : member.relationshipType === "friend"
                                  ? "ゆるく並走中"
                                  : "基準点"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {index === 0 ? "現在トップです" : `トップと ${gapFromLeader} pt 差`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-500">現在ポイント</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {member.totalPoints} pt
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">レースをリセットする</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            友達やライバルと同じスタートラインに立ちたいときは、新しいレースを開始します。
          </p>
          {raceSchedule.isPastDue ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
                isCurrentUserRaceOwner
                  ? "border border-rose-200 bg-rose-50 text-rose-800"
                  : "border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {isCurrentUserRaceOwner
                ? "このレースは終了予定日を過ぎています。新しいレースを開始すると、前回結果が確定して次へ進めます。"
                : `このレースは終了予定日を過ぎています。${raceOwner?.nickname ?? "レースオーナー"} が新しいレースを開始すると結果が確定します。`}
            </div>
          ) : null}
          <div className="mt-5">
            <StartRaceForm
              submitLabel={
                shouldPromptRaceFinish
                  ? "このレースを終了して次へ進む"
                  : "新しいレースを開始"
              }
              helperText={
                shouldPromptRaceFinish
                  ? "前回レースの結果を確定し、新しいレースへ切り替えます。過去ログ自体は削除されません。"
                  : undefined
              }
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">招待コードを発行する</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              友達またはライバルとして、このレースに参加してもらうためのコードを作れます。
            </p>
            <div className="mt-5">
              <GenerateInviteForm invites={invites} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">招待コードで参加する</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              受け取ったコードを入力すると、そのレースを現在のレースとして参加できます。
            </p>
            <div className="mt-5">
              <JoinInviteForm />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">今週の推移</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                1日ごとの増減ポイントをシンプルに表示しています。
              </p>
            </div>
          </div>

          {summary.weekTrend.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
              まだ今週の記録がありません。行動を登録すると推移が表示されます。
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-7 gap-3">
              {summary.weekTrend.map((item) => {
                const heightPercent = Math.max(
                  8,
                  (Math.abs(item.delta) / maxTrendValue) * 100,
                );

                return (
                  <div
                    key={`${item.dateLabel}-${item.label}`}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-36 w-full items-end justify-center rounded-2xl bg-slate-50 px-2 py-3">
                      <div
                        className={`w-full rounded-xl ${
                          item.delta > 0
                            ? "bg-amber-400"
                            : item.delta < 0
                              ? "bg-emerald-400"
                              : "bg-slate-300"
                        }`}
                        style={{ height: `${item.delta === 0 ? 10 : heightPercent}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-500">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.dateLabel}</p>
                      <p
                        className={`mt-2 text-sm font-semibold ${
                          item.delta > 0
                            ? "text-amber-600"
                            : item.delta < 0
                              ? "text-emerald-600"
                              : "text-slate-600"
                        }`}
                      >
                        {item.delta > 0 ? `+${item.delta}` : item.delta}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
