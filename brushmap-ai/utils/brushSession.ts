import {
  BRUSH_ZONES,
  EMPTY_ZONE_DURATIONS,
  GUIDE_SEGMENTS,
  WEEKDAY_LABELS,
} from '../constants/brush';
import {
  AIPredictionRecord,
  BrushEvent,
  BrushSession,
  BrushZone,
  WeeklySummary,
  ZoneDurations,
} from '../types/brush';

type BuildSessionInput = {
  startedAt: string;
  durationSec: number;
  events: BrushEvent[];
  aiPredictions?: BrushSession['aiPredictions'];
};

export function getZoneDisplayName(zone: BrushZone): string {
  return BRUSH_ZONES.find((item) => item.value === zone)?.label ?? zone;
}

export function getGuideZone(elapsedSec: number): BrushZone {
  return (
    GUIDE_SEGMENTS.find(
      (segment) => elapsedSec >= segment.startSec && elapsedSec < segment.endSec,
    )?.zone ?? GUIDE_SEGMENTS.at(-1)?.zone ?? 'lowerLeft'
  );
}

export function buildSession({
  startedAt,
  durationSec,
  events,
  aiPredictions = [],
}: BuildSessionInput): BrushSession {
  return {
    id: `${Date.now()}`,
    startedAt,
    durationSec,
    events,
    zoneDurations: calculateZoneDurations(events, startedAt, durationSec),
    aiPredictions,
  };
}

export function calculateZoneDurations(
  events: BrushEvent[],
  startedAt: string,
  durationSec: number,
): ZoneDurations {
  const totals: ZoneDurations = { ...EMPTY_ZONE_DURATIONS };

  if (events.length === 0) {
    return totals;
  }

  const sessionStart = new Date(startedAt).getTime();
  const sessionEnd = sessionStart + durationSec * 1000;

  events.forEach((event, index) => {
    const currentTs = clamp(event.timestamp, sessionStart, sessionEnd);
    const nextTs =
      index < events.length - 1
        ? clamp(events[index + 1].timestamp, sessionStart, sessionEnd)
        : sessionEnd;

    const duration = Math.max(Math.round((nextTs - currentTs) / 1000), 0);
    totals[event.zone] += duration;
  });

  return totals;
}

export function getBalanceComment(zoneDurations: ZoneDurations): string {
  return getDetailedComments(zoneDurations)[0] ?? '全体のバランスは良好です';
}

export function getDetailedComments(
  zoneDurations: ZoneDurations,
  events: BrushEvent[] = [],
): string[] {
  const entries = Object.entries(zoneDurations) as [BrushZone, number][];
  const total = entries.reduce((sum, [, sec]) => sum + sec, 0);

  if (total === 0) {
    return ['手動記録が少ないため、次回は磨いている部位をこまめにタップしてみましょう。'];
  }

  const sorted = [...entries].sort((a, b) => a[1] - b[1]);
  const lowest = sorted[0];
  const highest = sorted.at(-1);
  const comments: string[] = [];
  const average = total / entries.length;

  if (!highest) {
    return ['全体のバランスは良好です'];
  }

  if (highest[1] >= total * 0.38) {
    comments.push(`${getZoneDisplayName(highest[0])}に時間が偏っています`);
  }

  if (lowest[1] <= Math.max(5, average * 0.45)) {
    comments.push(`${getZoneDisplayName(lowest[0])}の時間が短めです`);
  }

  const underBrushedZones = entries.filter(([, sec]) => sec <= Math.max(5, average * 0.55));
  if (underBrushedZones.length >= 2) {
    comments.push(
      `${underBrushedZones
        .slice(0, 2)
        .map(([zone]) => getZoneDisplayName(zone))
        .join('・')}をもう少し意識すると、全体のバランスが整いやすいです`,
    );
  }

  const frontTotal = zoneDurations.upperFront + zoneDurations.lowerFront;
  const molarTotal =
    zoneDurations.upperRight +
    zoneDurations.upperLeft +
    zoneDurations.lowerRight +
    zoneDurations.lowerLeft;

  if (frontTotal >= total * 0.42) {
    comments.push('前歯に時間が集まりやすい傾向があります');
  } else if (frontTotal > 0 && frontTotal <= total * 0.12) {
    comments.push('前歯ゾーンの記録が少なめです');
  }

  if (molarTotal > 0 && molarTotal <= total * 0.45) {
    comments.push('奥歯エリアの記録がやや少なめです');
  }

  const sequenceComment = getSequenceComment(events);
  if (sequenceComment) {
    comments.push(sequenceComment);
  }

  if (comments.length === 0) {
    comments.push('全体のバランスは良好です');
  }

  return dedupeComments(comments).slice(0, 3);
}

export function getTimelineItems(events: BrushEvent[], startedAt: string | null) {
  if (!startedAt) {
    return [];
  }

  const sessionStart = new Date(startedAt).getTime();

  return events.map((event) => {
    const elapsed = Math.max(Math.round((event.timestamp - sessionStart) / 1000), 0);
    return {
      label: getZoneDisplayName(event.zone),
      time: formatClock(elapsed),
    };
  });
}

export function getAIPredictionSummary(predictions: AIPredictionRecord[]) {
  const predictedCounts: Partial<Record<BrushZone, number>> = {};
  const providerCounts: Record<string, number> = {};
  let matchedManualCount = 0;
  let manualComparisonCount = 0;
  let cameraReadyCount = 0;

  predictions.forEach((prediction) => {
    if (prediction.predictedZone) {
      predictedCounts[prediction.predictedZone] =
        (predictedCounts[prediction.predictedZone] ?? 0) + 1;
    }

    providerCounts[prediction.providerId] =
      (providerCounts[prediction.providerId] ?? 0) + 1;

    if (prediction.cameraReady) {
      cameraReadyCount += 1;
    }

    if (prediction.manualZone && prediction.predictedZone) {
      manualComparisonCount += 1;
      if (prediction.manualZone === prediction.predictedZone) {
        matchedManualCount += 1;
      }
    }
  });

  const topZoneEntry = (Object.entries(predictedCounts) as [BrushZone, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const topProviderEntry = Object.entries(providerCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    totalPredictions: predictions.length,
    topZone: topZoneEntry?.[0],
    topZoneCount: topZoneEntry?.[1] ?? 0,
    topProviderId: topProviderEntry?.[0],
    topProviderCount: topProviderEntry?.[1] ?? 0,
    manualComparisonCount,
    matchedManualCount,
    cameraReadyCount,
    predictedCounts,
  };
}

export function getAIPredictionTimelineItems(predictions: AIPredictionRecord[]) {
  return predictions
    .slice(-8)
    .reverse()
    .map((prediction) => {
      const topConfidence = [...prediction.confidences]
        .sort((a, b) => b.confidence - a.confidence)[0]?.confidence;

      return {
        id: `${prediction.timestamp}-${prediction.elapsedSec}`,
        time: formatClock(prediction.elapsedSec),
        predictedZone: prediction.predictedZone
          ? getZoneDisplayName(prediction.predictedZone)
          : '未推定',
        manualZone: prediction.manualZone
          ? getZoneDisplayName(prediction.manualZone)
          : null,
        confidenceLabel:
          typeof topConfidence === 'number'
            ? `${Math.round(topConfidence * 100)}%`
            : null,
        reasoning: prediction.reasoning,
        providerId: prediction.providerId,
        cameraReady: prediction.cameraReady,
      };
    });
}

export function getGuideAlignmentSummary(predictions: AIPredictionRecord[]) {
  const comparable = predictions.filter(
    (prediction) => prediction.predictedZone && prediction.source === 'camera-polling',
  );

  const matched = comparable.filter(
    (prediction) => prediction.predictedZone === getGuideZone(prediction.elapsedSec),
  ).length;
  const total = comparable.length;
  const matchRate = total > 0 ? Math.round((matched / total) * 100) : null;

  return {
    matched,
    total,
    matchRate,
    status:
      matchRate === null
        ? 'waiting'
        : matchRate >= 75
          ? 'good'
          : matchRate >= 45
            ? 'mixed'
            : 'low',
  };
}

export function getAIAlignmentComments(predictions: AIPredictionRecord[]): string[] {
  const comparable = predictions.filter(
    (prediction) => prediction.manualZone && prediction.predictedZone,
  );

  if (predictions.length === 0) {
    return ['AI推定ログはまだありません。今後は推定と手動記録の差分を比較できます。'];
  }

  if (comparable.length === 0) {
    return ['AI推定は保存されていますが、手動記録との比較データはまだ少なめです。'];
  }

  const total = comparable.length;
  const matched = comparable.filter(
    (prediction) => prediction.manualZone === prediction.predictedZone,
  ).length;
  const matchRate = Math.round((matched / total) * 100);
  const mismatches = comparable.filter(
    (prediction) => prediction.manualZone !== prediction.predictedZone,
  );
  const mismatchCounts: Record<BrushZone, number> = {
    upperRight: 0,
    upperFront: 0,
    upperLeft: 0,
    lowerRight: 0,
    lowerFront: 0,
    lowerLeft: 0,
  };

  mismatches.forEach((prediction) => {
    if (prediction.manualZone) {
      mismatchCounts[prediction.manualZone] += 1;
    }
  });

  const mismatchEntry = (Object.entries(mismatchCounts) as [BrushZone, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const comments: string[] = [];

  if (matchRate >= 85) {
    comments.push(`AI推定と手動記録の一致率は${matchRate}%で、かなり安定しています`);
  } else if (matchRate >= 60) {
    comments.push(`AI推定と手動記録の一致率は${matchRate}%で、まずまず揃っています`);
  } else {
    comments.push(`AI推定と手動記録の一致率は${matchRate}%で、まだズレが見られます`);
  }

  if (mismatchEntry && mismatchEntry[1] > 0) {
    comments.push(
      `${getZoneDisplayName(mismatchEntry[0])}でAI推定とのズレが出やすい傾向があります`,
    );
  }

  const cameraReadyComparisons = comparable.filter((prediction) => prediction.cameraReady).length;
  if (cameraReadyComparisons < comparable.length * 0.6) {
    comments.push('カメラ準備前の記録が多いため、実カメラ推定の比較はこれから精度を上げられます');
  } else {
    comments.push('カメラ準備後の比較データが増えてきており、今後のAI改善に活かしやすい状態です');
  }

  return comments.slice(0, 3);
}

export function formatClock(totalSec: number): string {
  const safe = Math.max(totalSec, 0);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function buildWeeklySummary(sessions: BrushSession[]): WeeklySummary {
  return buildSummaryForDays(sessions, 7, '直近7日間のサマリー');
}

export function buildMonthlySummary(sessions: BrushSession[]): WeeklySummary {
  return buildSummaryForDays(sessions, 30, '直近30日間のサマリー');
}

function buildSummaryForDays(
  sessions: BrushSession[],
  days: number,
  title: string,
): WeeklySummary {
  const now = Date.now();
  const fromTime = now - days * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter(
    (session) => new Date(session.startedAt).getTime() >= fromTime,
  );
  const weekdayCounts = WEEKDAY_LABELS.map((label) => ({
    label,
    count: 0,
  }));

  const zoneTotals: ZoneDurations = { ...EMPTY_ZONE_DURATIONS };
  let totalDurationSec = 0;

  recentSessions.forEach((session) => {
    totalDurationSec += session.durationSec;
    weekdayCounts[new Date(session.startedAt).getDay()].count += 1;
    (Object.entries(session.zoneDurations) as [BrushZone, number][]).forEach(
      ([zone, sec]) => {
        zoneTotals[zone] += sec;
      },
    );
  });

  const sessionCount = recentSessions.length;
  const averageDurationSec =
    sessionCount > 0 ? Math.round(totalDurationSec / sessionCount) : 0;

  return {
    title,
    sessionCount,
    totalDurationSec,
    averageDurationSec,
    zoneTotals,
    streakDays: getStreakDays(sessions),
    weekdayCounts,
    comment: getWeeklyComment({
      sessionCount,
      averageDurationSec,
      zoneTotals,
      streakDays: getStreakDays(sessions),
      days,
    }),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSequenceComment(events: BrushEvent[]): string | null {
  if (events.length < 3) {
    return null;
  }

  const uniqueZones = new Set(events.map((event) => event.zone));
  if (uniqueZones.size <= 2) {
    return '磨く部位の切り替えが少なめなので、次回はまんべんなく移動してみましょう';
  }

  const firstZone = events[0]?.zone;
  const lastZone = events.at(-1)?.zone;
  if (firstZone && lastZone && firstZone === lastZone && uniqueZones.size >= 3) {
    return `${getZoneDisplayName(firstZone)}から始めて同じ部位で終わっています`;
  }

  return null;
}

function dedupeComments(comments: string[]): string[] {
  return [...new Set(comments)];
}

function getWeeklyComment({
  sessionCount,
  averageDurationSec,
  zoneTotals,
  streakDays,
  days,
}: {
  sessionCount: number;
  averageDurationSec: number;
  zoneTotals: ZoneDurations;
  streakDays: number;
  days: number;
}) {
  if (sessionCount === 0) {
    return days <= 7
      ? 'まだ今週の記録がありません。まずは1回、記録を残してみましょう。'
      : 'まだ直近30日間の記録が少なめです。まずは数回続けてみましょう。';
  }

  const entries = Object.entries(zoneTotals) as [BrushZone, number][];
  const sorted = [...entries].sort((a, b) => a[1] - b[1]);
  const lowest = sorted[0];
  const highest = sorted.at(-1);

  if (averageDurationSec < 75) {
    return `今週は1回あたりの時間がやや短めです。まずは平均90秒以上を目安にしてみましょう。`;
  }

  if (streakDays >= 4) {
    return `今週は${streakDays}日連続で記録できています。この調子で続けましょう。`;
  }

  if (highest && lowest && highest[1] >= Math.max(lowest[1] * 2.2, 20)) {
    return `今週は${getZoneDisplayName(highest[0])}に寄りやすく、${getZoneDisplayName(
      lowest[0],
    )}が少なめです。`;
  }

  if (sessionCount >= 5) {
    return '今週は継続できています。部位バランスも安定していて良い流れです。';
  }

  return days <= 7
    ? '今週の記録は良好です。回数をもう少し積み上げると傾向が見えやすくなります。'
    : 'この1か月は安定して記録できています。次は部位バランスも見ていきましょう。';
}

function getStreakDays(sessions: BrushSession[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  const uniqueDays = [...new Set(
    sessions.map((session) => formatDateKey(new Date(session.startedAt))),
  )].sort((a, b) => (a < b ? 1 : -1));

  let compareDate = startOfDay(new Date());
  let streak = 0;

  for (const dayKey of uniqueDays) {
    const compareKey = formatDateKey(compareDate);
    if (dayKey === compareKey) {
      streak += 1;
      compareDate = addDays(compareDate, -1);
      continue;
    }

    if (streak === 0) {
      const yesterday = addDays(compareDate, -1);
      if (dayKey === formatDateKey(yesterday)) {
        streak += 1;
        compareDate = addDays(yesterday, -1);
      }
    }
    break;
  }

  return streak;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// TODO: MediaPipe Handsで手の位置を推定
// TODO: Face Detectionで口元位置を推定
// TODO: 手と口元の相対位置からブラッシング部位を推定
// TODO: Apple Watchのモーションセンサー連携
// TODO: 電動歯ブラシBluetooth連携
// TODO: 歯科医監修コメント機能
// TODO: 習慣化スコア
// TODO: 家族アカウント
// TODO: 子ども向けモード
