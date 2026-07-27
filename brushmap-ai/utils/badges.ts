import { BrushBadge, BrushGoals, BrushSession } from '../types/brush';

export function getEarnedBadges(
  sessions: BrushSession[],
  goals: BrushGoals,
): BrushBadge[] {
  const badges: BrushBadge[] = [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((session) =>
    session.startedAt.slice(0, 10) === todayKey,
  );

  if (todaySessions.length >= goals.dailySessionsTarget) {
    badges.push({
      id: 'daily-goal',
      label: '今日の回数達成',
      description: '今日の目標回数をクリアしています。',
    });
  }

  if (
    todaySessions.some((session) => session.durationSec >= goals.targetDurationSec)
  ) {
    badges.push({
      id: 'duration-goal',
      label: '時間目標達成',
      description: '1回の目標時間を満たした記録があります。',
    });
  }

  const streak = getCurrentStreak(sessions);
  if (streak >= 3) {
    badges.push({
      id: 'streak-3',
      label: `${streak}日連続`,
      description: '連続記録を継続できています。',
    });
  }

  if (sessions.length >= 10) {
    badges.push({
      id: 'history-10',
      label: '10セッション達成',
      description: '記録の積み上げが順調です。',
    });
  }

  return badges;
}

function getCurrentStreak(sessions: BrushSession[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  const uniqueDays = [...new Set(
    sessions.map((session) => session.startedAt.slice(0, 10)),
  )].sort((a, b) => (a < b ? 1 : -1));

  let compareDate = new Date();
  compareDate.setHours(0, 0, 0, 0);
  let streak = 0;

  for (const dayKey of uniqueDays) {
    const compareKey = compareDate.toISOString().slice(0, 10);
    if (dayKey === compareKey) {
      streak += 1;
      compareDate.setDate(compareDate.getDate() - 1);
      continue;
    }

    if (streak === 0) {
      const yesterday = new Date(compareDate);
      yesterday.setDate(yesterday.getDate() - 1);
      if (dayKey === yesterday.toISOString().slice(0, 10)) {
        streak += 1;
      }
    }
    break;
  }

  return streak;
}
