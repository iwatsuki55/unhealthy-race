import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CameraPanel } from './components/CameraPanel';
import { AIProviderSelectorCard } from './components/AIProviderSelectorCard';
import { AIPredictionHistoryCard } from './components/AIPredictionHistoryCard';
import { AIFoundationCard } from './components/AIFoundationCard';
import { BadgeCard } from './components/BadgeCard';
import { GoalProgressCard } from './components/GoalProgressCard';
import { GoalSettingsCard } from './components/GoalSettingsCard';
import { HeatmapCard } from './components/HeatmapCard';
import { HistorySessionCard } from './components/HistorySessionCard';
import { PrimaryButton } from './components/PrimaryButton';
import { ReminderSettingsCard } from './components/ReminderSettingsCard';
import { StatCard } from './components/StatCard';
import { TimelineCard } from './components/TimelineCard';
import { WeeklySummaryCard } from './components/WeeklySummaryCard';
import { ZoneSelector } from './components/ZoneSelector';
import {
  APP_COPY,
  BRUSH_ZONES,
  GUIDE_SEGMENTS,
  SESSION_LENGTH_SEC,
  colors,
} from './constants/brush';
import {
  loadSessions,
  replaceSessions,
  saveSession,
} from './storage/sessionStorage';
import {
  DEFAULT_AI_SETTINGS,
  loadAISettings,
  saveAISettings,
  type AISettings,
} from './storage/aiSettingsStorage';
import { DEFAULT_GOALS, loadGoals, saveGoals } from './storage/goalStorage';
import {
  DEFAULT_REMINDER_SETTINGS,
  loadReminderSettings,
  saveReminderSettings,
} from './storage/reminderStorage';
import {
  AIProviderId,
  AISessionState,
  AIPredictionRecord,
  BrushBadge,
  BrushGoals,
  BrushEvent,
  BrushSession,
  BrushZone,
  CameraTelemetry,
  ReminderSettings,
  ScreenName,
} from './types/brush';
import {
  buildAISensorFrame,
  createDefaultCameraTelemetry,
} from './ai/frameFactory';
import { getAIProviderOptions } from './ai/registry';
import {
  createInitialAIState,
  runAIPrediction,
  toAIPredictionRecord,
} from './ai/session';
import { getEarnedBadges } from './utils/badges';
import {
  buildSession,
  getAIAlignmentComments,
  buildMonthlySummary,
  buildWeeklySummary,
  formatClock,
  getBalanceComment,
  getDetailedComments,
  getGuideAlignmentSummary,
  getGuideZone,
  getTimelineItems,
  getZoneDisplayName,
} from './utils/brushSession';
import { syncDailyReminder } from './utils/reminders';

type SessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [events, setEvents] = useState<BrushEvent[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<BrushSession | null>(null);
  const [sessions, setSessions] = useState<BrushSession[]>([]);
  const [selectedHistorySession, setSelectedHistorySession] =
    useState<BrushSession | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [goals, setGoals] = useState<BrushGoals>(DEFAULT_GOALS);
  const [aiSettings, setAISettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [aiState, setAIState] = useState<AISessionState>(
    createInitialAIState(DEFAULT_AI_SETTINGS.providerId),
  );
  const [aiPredictionLog, setAIPredictionLog] = useState<AIPredictionRecord[]>([]);
  const [cameraReady, setCameraReady] = useState(Platform.OS === 'web');
  const [cameraTelemetry, setCameraTelemetry] = useState<CameraTelemetry>(
    createDefaultCameraTelemetry(Platform.OS === 'web' ? 'web-placeholder' : 'native-preview'),
  );
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(
    DEFAULT_REMINDER_SETTINGS,
  );
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiPredictionLogRef = useRef<AIPredictionRecord[]>([]);
  const eventsRef = useRef<BrushEvent[]>([]);
  const startedAtRef = useRef<string | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    void initializeHistory();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (aiPollingRef.current) {
        clearInterval(aiPollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    elapsedRef.current = elapsedSec;
  }, [elapsedSec]);

  useEffect(() => {
    aiPredictionLogRef.current = aiPredictionLog;
  }, [aiPredictionLog]);

  useEffect(() => {
    if (status !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (aiPollingRef.current) {
        clearInterval(aiPollingRef.current);
        aiPollingRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSec((current) => {
        const next = current + 1;
        if (next >= SESSION_LENGTH_SEC) {
          void finalizeSession(SESSION_LENGTH_SEC);
          return SESSION_LENGTH_SEC;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || !cameraReady) {
      if (aiPollingRef.current) {
        clearInterval(aiPollingRef.current);
        aiPollingRef.current = null;
      }
      return;
    }

    aiPollingRef.current = setInterval(() => {
      void updateAIFoundation();
    }, 2500);

    return () => {
      if (aiPollingRef.current) {
        clearInterval(aiPollingRef.current);
        aiPollingRef.current = null;
      }
    };
  }, [status, cameraReady]);

  const currentGuideZone = useMemo(
    () => getGuideZone(elapsedSec),
    [elapsedSec],
  );
  const remainingSec = Math.max(SESSION_LENGTH_SEC - elapsedSec, 0);
  const timelineItems = useMemo(() => getTimelineItems(events, startedAt), [events, startedAt]);

  async function initializeHistory() {
    const [sessions, goals, reminderSettings, aiSettings] = await Promise.all([
      loadSessions(),
      loadGoals(),
      loadReminderSettings(),
      loadAISettings(),
    ]);
    setSessions(sessions);
    setGoals(goals);
    setReminderSettings(reminderSettings);
    setAISettings(aiSettings);
    setAIState(createInitialAIState(aiSettings.providerId));
    setSavedCount(sessions.length);
    if (sessions.length > 0) {
      setLastSession(sessions[0]);
    }
  }

  async function updateGoals(nextGoals: BrushGoals) {
    setGoals(nextGoals);
    await saveGoals(nextGoals);
  }

  async function updateReminder(nextSettings: ReminderSettings) {
    setReminderSettings(nextSettings);
    await saveReminderSettings(nextSettings);
    const statusMessage = await syncDailyReminder(nextSettings);
    setReminderStatus(statusMessage);
  }

  async function updateAISettings(nextSettings: AISettings) {
    setAISettings(nextSettings);
    setAIState(createInitialAIState(nextSettings.providerId));
    await saveAISettings(nextSettings);
  }

  function startSession() {
    const nextStartedAt = new Date().toISOString();
    setEvents([]);
    setElapsedSec(0);
    eventsRef.current = [];
    elapsedRef.current = 0;
    startedAtRef.current = nextStartedAt;
    setStartedAt(nextStartedAt);
    setAIState(createInitialAIState(aiSettings.providerId));
    setAIPredictionLog([]);
    aiPredictionLogRef.current = [];
    setCameraReady(Platform.OS === 'web');
    setCameraTelemetry(
      createDefaultCameraTelemetry(Platform.OS === 'web' ? 'web-placeholder' : 'native-preview'),
    );
    setStatus('running');
    setScreen('brushing');
  }

  function pauseSession() {
    setStatus('paused');
  }

  function resumeSession() {
    setStatus('running');
  }

  function handleZonePress(zone: BrushZone) {
    if (status !== 'running' || !startedAt) {
      return;
    }

    const timestamp = Date.now();
    setEvents((current) => [
      ...(current ?? []),
      {
        zone,
        timestamp,
      },
    ]);

    void updateAIFoundation(zone, timestamp);
  }

  async function updateAIFoundation(manualZone?: BrushZone, timestamp?: number) {
    const frame = buildAISensorFrame({
      timestamp: timestamp ?? Date.now(),
      elapsedSec: elapsedRef.current,
      cameraReady,
      manualZone,
      guideZone: getGuideZone(elapsedRef.current),
      source: manualZone ? 'manual-tap' : 'camera-polling',
      cameraTelemetry,
    });

    const nextState = await runAIPrediction(
      frame,
      manualZone,
      aiSettings.providerId,
    );
    const predictionRecord = toAIPredictionRecord(frame, nextState);

    setAIState((current) => ({
      ...current,
      ...nextState,
      predictionCount:
        (current.predictionCount ?? 0) + (nextState.latestPrediction ? 1 : 0),
    }));

    if (predictionRecord) {
      setAIPredictionLog((current) => [...current, predictionRecord].slice(-120));
    }
  }

  async function finalizeSession(durationOverride?: number) {
    if (!startedAtRef.current) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (aiPollingRef.current) {
      clearInterval(aiPollingRef.current);
      aiPollingRef.current = null;
    }

    const durationSec = durationOverride ?? elapsedRef.current;
    const session = buildSession({
      startedAt: startedAtRef.current,
      durationSec,
      events: eventsRef.current,
      aiPredictions: aiPredictionLogRef.current,
    });

    await saveSession(session);
    const nextSessions = [session, ...sessions].slice(0, 30);
    setSessions(nextSessions);
    setLastSession(session);
    setSavedCount(nextSessions.length);
    setStatus('completed');
    setScreen('result');
  }

  function endSessionEarly() {
    if (Platform.OS === 'web') {
      const shouldEnd = window.confirm('ここまでの記録で結果を表示しますか？');
      if (shouldEnd) {
        void finalizeSession(elapsedRef.current);
      }
      return;
    }

    Alert.alert(
      'セッションを終了しますか？',
      'ここまでの記録で結果を表示します。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了',
          style: 'destructive',
          onPress: () => {
            void finalizeSession(elapsedRef.current);
          },
        },
      ],
    );
  }

  function resetToHome() {
    setScreen('home');
    setStatus('idle');
    setElapsedSec(0);
    setEvents([]);
    eventsRef.current = [];
    elapsedRef.current = 0;
    startedAtRef.current = null;
    setStartedAt(null);
    setSelectedHistorySession(null);
    setAIPredictionLog([]);
    aiPredictionLogRef.current = [];
    setCameraReady(Platform.OS === 'web');
    setCameraTelemetry(
      createDefaultCameraTelemetry(Platform.OS === 'web' ? 'web-placeholder' : 'native-preview'),
    );
  }

  function deleteSession(sessionId: string) {
    const runDelete = async () => {
      const nextSessions = sessions.filter((session) => session.id !== sessionId);
      setSessions(nextSessions);
      setSavedCount(nextSessions.length);
      setLastSession(nextSessions[0] ?? null);

      if (selectedHistorySession?.id === sessionId) {
        setSelectedHistorySession(null);
        setScreen('history');
      }

      await replaceSessions(nextSessions);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('この履歴を削除しますか？');
      if (confirmed) {
        void runDelete();
      }
      return;
    }

    Alert.alert('履歴を削除しますか？', 'この操作は元に戻せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          void runDelete();
        },
      },
    ]);
  }

  function renderHomeScreen() {
    const badges: BrushBadge[] = getEarnedBadges(sessions, goals);
    const aiProviders = getAIProviderOptions();
    const lastGuideAlignment = lastSession
      ? getGuideAlignmentSummary(lastSession.aiPredictions ?? [])
      : null;

    return (
      <View style={styles.screenContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Brushing Motion Visualizer</Text>
          <Text style={styles.appTitle}>BrushMap AI</Text>
          <Text style={styles.heroDescription}>
            毎日の歯みがきを、見える習慣に。普通の歯ブラシでも電動歯ブラシでも、
            手動入力とタイマーでブラッシングの偏りを確認できます。
          </Text>
          <PrimaryButton label="ブラッシングを開始" onPress={startSession} />
          <PrimaryButton
            label="履歴を見る"
            onPress={() => setScreen('history')}
            variant="secondary"
          />
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>ご利用前の注意</Text>
          <Text style={styles.noticeText}>{APP_COPY.disclaimer}</Text>
          <Text style={styles.noticeSubtext}>
            カメラ映像は端末内でプレビュー表示するだけで、画像・動画として保存しません。
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>MVPの使い方</Text>
          <Text style={styles.summaryBody}>
            1. 画面のガイド部位に合わせて磨きます。
          </Text>
          <Text style={styles.summaryBody}>
            2. 実際に磨いている場所を下の部位ボタンで記録します。
          </Text>
          <Text style={styles.summaryBody}>
            3. 終了後に偏り、履歴、ガイド一致率を振り返ります。
          </Text>
        </View>

        <View style={styles.betaCard}>
          <Text style={styles.betaTitle}>AI補助モードについて</Text>
          <Text style={styles.betaBody}>
            現在のAI推定はフォーム改善の補助表示です。医療判断や精密判定ではなく、
            まずは習慣化と見える化の体験確認を目的にしています。
          </Text>
        </View>

        <View style={styles.homeStatsRow}>
          <StatCard label="標準時間" value="2分" helper="30秒ごとに部位ガイド" />
          <StatCard
            label="保存済み"
            value={`${savedCount}件`}
            helper="AsyncStorage に端末保存"
          />
        </View>

        <GoalProgressCard goals={goals} sessions={sessions} />
        <BadgeCard badges={badges} />
        <GoalSettingsCard goals={goals} onChange={(nextGoals) => {
          void updateGoals(nextGoals);
        }} />
        <AIProviderSelectorCard
          providers={aiProviders}
          selectedProviderId={aiSettings.providerId}
          onSelect={(providerId) => {
            void updateAISettings({ providerId });
          }}
        />
        <ReminderSettingsCard
          settings={reminderSettings}
          statusMessage={reminderStatus}
          onChange={(nextSettings) => {
            void updateReminder(nextSettings);
          }}
        />

        {lastSession ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>前回のセッション</Text>
            <Text style={styles.summaryBody}>
              {new Date(lastSession.startedAt).toLocaleString('ja-JP')}
            </Text>
            <Text style={styles.summaryBody}>
              総時間 {lastSession.durationSec}秒 / コメント:
              {' '}
              {getBalanceComment(lastSession.zoneDurations)}
            </Text>
            <Text style={styles.summaryBody}>
              {lastGuideAlignment && lastGuideAlignment.total > 0
                ? `ガイド一致率 ${lastGuideAlignment.matched}/${lastGuideAlignment.total} (${lastGuideAlignment.matchRate}%)`
                : 'ガイド一致率はまだ比較データがありません'}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  function renderBrushingScreen() {
    const aiProviders = getAIProviderOptions();
    const guideAlignment = getGuideAlignmentSummary(aiPredictionLog);

    return (
      <View style={styles.screenContent}>
        <CameraPanel
          onCameraReadyChange={setCameraReady}
          onTelemetryChange={setCameraTelemetry}
          predictedZone={aiState.latestPrediction?.primaryZone}
          guideZone={currentGuideZone}
        />

        <View style={styles.timerCard}>
          <Text style={styles.sectionLabel}>ガイド部位</Text>
          <View style={styles.currentZoneHero}>
            <Text style={styles.currentZoneHint}>いま磨く場所</Text>
            <Text style={styles.currentZoneText}>
              {getZoneDisplayName(currentGuideZone)}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max((elapsedSec / SESSION_LENGTH_SEC) * 100, 4)}%` },
              ]}
            />
          </View>
          <Text style={styles.timerText}>{formatClock(remainingSec)}</Text>
          <Text style={styles.timerSubtext}>
            {elapsedSec}秒経過 / 30秒ごとに切り替え
          </Text>
          <View
            style={[
              styles.alignmentPill,
              guideAlignment.status === 'good' && styles.alignmentPillGood,
              guideAlignment.status === 'mixed' && styles.alignmentPillMixed,
              guideAlignment.status === 'low' && styles.alignmentPillLow,
            ]}
          >
            <Text style={styles.alignmentPillText}>
              {guideAlignment.total === 0
                ? '一致率を計測中'
                : `ガイド一致 ${guideAlignment.matched}/${guideAlignment.total} (${guideAlignment.matchRate}%)`}
            </Text>
          </View>
          <View style={styles.segmentRow}>
            {GUIDE_SEGMENTS.map((segment) => {
              const active =
                elapsedSec >= segment.startSec && elapsedSec < segment.endSec;
              return (
                <View
                  key={segment.label}
                  style={[
                    styles.segmentPill,
                    active && styles.segmentPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {segment.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <ZoneSelector
          zones={BRUSH_ZONES}
          activeZone={events.at(-1)?.zone}
          onSelect={handleZonePress}
        />

        <AIFoundationCard aiState={aiState} />
        <AIProviderSelectorCard
          providers={aiProviders}
          selectedProviderId={aiSettings.providerId}
          onSelect={(providerId) => {
            void updateAISettings({ providerId });
          }}
        />

        <View style={styles.controlRow}>
          {status === 'running' ? (
            <PrimaryButton
              label="一時停止"
              onPress={pauseSession}
              variant="secondary"
            />
          ) : (
            <PrimaryButton
              label="再開"
              onPress={resumeSession}
              variant="secondary"
            />
          )}
          <PrimaryButton
            label="終了"
            onPress={endSessionEarly}
            variant="danger"
          />
        </View>

        <View style={styles.liveLogCard}>
          <Text style={styles.liveLogTitle}>手動記録</Text>
          <Text style={styles.liveLogBody}>
            現在の部位をタップすると、部位と時刻を記録します。
          </Text>
          <Text style={styles.liveLogCount}>記録数: {events.length}件</Text>
        </View>
      </View>
    );
  }

  function renderResultScreen() {
    if (!lastSession) {
      return null;
    }

    const comment = getDetailedComments(lastSession.zoneDurations, lastSession.events);
    const aiComments = getAIAlignmentComments(lastSession.aiPredictions ?? []);
    const guideAlignment = getGuideAlignmentSummary(lastSession.aiPredictions ?? []);

    return (
      <View style={styles.screenContent}>
        <View style={styles.resultHero}>
          <Text style={styles.sectionLabel}>結果</Text>
          <Text style={styles.resultTitle}>今回のブラッシング</Text>
          <Text style={styles.resultDuration}>
            総ブラッシング時間 {lastSession.durationSec}秒
          </Text>
          {comment.map((line) => (
            <Text key={line} style={styles.resultComment}>
              {line}
            </Text>
          ))}
        </View>

        <HeatmapCard zoneDurations={lastSession.zoneDurations} />
        <TimelineCard events={lastSession.events} startedAt={lastSession.startedAt} />
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>AIとの差分メモ</Text>
          {aiComments.map((line) => (
            <Text key={line} style={styles.timelineSummaryText}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ガイド一致率</Text>
          <Text style={styles.summaryBody}>
            {guideAlignment.total === 0
              ? 'まだガイド一致率の比較データはありません。'
              : `AI推定とガイドが一致した回数は ${guideAlignment.matched}/${guideAlignment.total} 回 (${guideAlignment.matchRate}%) です。`}
          </Text>
          {guideAlignment.total > 0 ? (
            <View
              style={[
                styles.alignmentPill,
                guideAlignment.status === 'good' && styles.alignmentPillGood,
                guideAlignment.status === 'mixed' && styles.alignmentPillMixed,
                guideAlignment.status === 'low' && styles.alignmentPillLow,
              ]}
            >
              <Text style={styles.alignmentPillText}>
                {guideAlignment.status === 'good'
                  ? 'ガイドにかなり沿えています'
                  : guideAlignment.status === 'mixed'
                    ? 'ガイドへの追従はまずまずです'
                    : 'ガイドとの差がややあります'}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.resultGrid}>
          {BRUSH_ZONES.map((zone) => (
            <StatCard
              key={zone.value}
              label={zone.label}
              value={`${lastSession.zoneDurations[zone.value]}秒`}
              helper="部位別の推定滞在時間"
            />
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>磨き順序</Text>
          {timelineItems.length > 0 ? (
            timelineItems.map((item) => (
              <Text key={`${item.label}-${item.time}`} style={styles.timelineSummaryText}>
                {item.time} - {item.label}
              </Text>
            ))
          ) : (
            <Text style={styles.timelineSummaryText}>
              記録がないため、順序は表示されません。
            </Text>
          )}
        </View>

        <PrimaryButton label="ホームへ戻る" onPress={resetToHome} />
        <PrimaryButton
          label="履歴を見る"
          onPress={() => setScreen('history')}
          variant="secondary"
        />
      </View>
    );
  }

  function renderSessionDetail(session: BrushSession, fromHistory = false) {
    const comment = getDetailedComments(session.zoneDurations, session.events);
    const timelineItems = getTimelineItems(session.events, session.startedAt);
    const aiComments = getAIAlignmentComments(session.aiPredictions ?? []);
    const guideAlignment = getGuideAlignmentSummary(session.aiPredictions ?? []);

    return (
      <View style={styles.screenContent}>
        <View style={styles.resultHero}>
          <Text style={styles.sectionLabel}>
            {fromHistory ? '履歴詳細' : '結果'}
          </Text>
          <Text style={styles.resultTitle}>今回のブラッシング</Text>
          <Text style={styles.resultDuration}>
            総ブラッシング時間 {session.durationSec}秒
          </Text>
          {comment.map((line) => (
            <Text key={line} style={styles.resultComment}>
              {line}
            </Text>
          ))}
        </View>

        <HeatmapCard zoneDurations={session.zoneDurations} />
        <TimelineCard events={session.events} startedAt={session.startedAt} />
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>AIとの差分メモ</Text>
          {aiComments.map((line) => (
            <Text key={line} style={styles.timelineSummaryText}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ガイド一致率</Text>
          <Text style={styles.summaryBody}>
            {guideAlignment.total === 0
              ? 'まだガイド一致率の比較データはありません。'
              : `AI推定とガイドが一致した回数は ${guideAlignment.matched}/${guideAlignment.total} 回 (${guideAlignment.matchRate}%) です。`}
          </Text>
          {guideAlignment.total > 0 ? (
            <View
              style={[
                styles.alignmentPill,
                guideAlignment.status === 'good' && styles.alignmentPillGood,
                guideAlignment.status === 'mixed' && styles.alignmentPillMixed,
                guideAlignment.status === 'low' && styles.alignmentPillLow,
              ]}
            >
              <Text style={styles.alignmentPillText}>
                {guideAlignment.status === 'good'
                  ? 'ガイドにかなり沿えています'
                  : guideAlignment.status === 'mixed'
                    ? 'ガイドへの追従はまずまずです'
                    : 'ガイドとの差がややあります'}
              </Text>
            </View>
          ) : null}
        </View>
        <AIPredictionHistoryCard predictions={session.aiPredictions ?? []} />

        <View style={styles.resultGrid}>
          {BRUSH_ZONES.map((zone) => (
            <StatCard
              key={zone.value}
              label={zone.label}
              value={`${session.zoneDurations[zone.value]}秒`}
              helper="部位別の推定滞在時間"
            />
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>磨き順序</Text>
          {timelineItems.length > 0 ? (
            timelineItems.map((item) => (
              <Text key={`${item.label}-${item.time}`} style={styles.timelineSummaryText}>
                {item.time} - {item.label}
              </Text>
            ))
          ) : (
            <Text style={styles.timelineSummaryText}>
              記録がないため、順序は表示されません。
            </Text>
          )}
        </View>

        <PrimaryButton
          label={fromHistory ? '履歴一覧へ戻る' : 'ホームへ戻る'}
          onPress={() => {
            if (fromHistory) {
              setScreen('history');
              return;
            }
            resetToHome();
          }}
        />
        {fromHistory ? (
          <PrimaryButton
            label="この履歴を削除"
            onPress={() => deleteSession(session.id)}
            variant="danger"
          />
        ) : null}
      </View>
    );
  }

  function renderHistoryScreen() {
    const weeklySummary = buildWeeklySummary(sessions);
    const monthlySummary = buildMonthlySummary(sessions);

    return (
      <View style={styles.screenContent}>
        <View style={styles.resultHero}>
          <Text style={styles.sectionLabel}>履歴</Text>
          <Text style={styles.resultTitle}>ブラッシング記録</Text>
          <Text style={styles.resultComment}>
            保存済みセッションを新しい順に表示しています。
          </Text>
        </View>

        <WeeklySummaryCard summary={weeklySummary} />
        <WeeklySummaryCard summary={monthlySummary} />

        {sessions.length > 0 ? (
          sessions.map((session) => (
            <HistorySessionCard
              key={session.id}
              session={session}
              onPress={() => {
                setSelectedHistorySession(session);
                setScreen('historyDetail');
              }}
              onDelete={() => deleteSession(session.id)}
            />
          ))
        ) : (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>まだ履歴がありません</Text>
            <Text style={styles.summaryBody}>
              ブラッシングを開始して、最初のセッションを保存してみましょう。
            </Text>
          </View>
        )}

        <PrimaryButton label="ホームへ戻る" onPress={resetToHome} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {screen === 'home' && renderHomeScreen()}
        {screen === 'brushing' && renderBrushingScreen()}
          {screen === 'result' && renderResultScreen()}
          {screen === 'history' && renderHistoryScreen()}
          {screen === 'historyDetail' && selectedHistorySession
            ? renderSessionDetail(selectedHistorySession, true)
            : null}
      </ScrollView>
    </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  screenContent: {
    gap: 16,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    gap: 14,
    shadowColor: '#7fb7d6',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textSecondary,
  },
  noticeCard: {
    backgroundColor: colors.notice,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  noticeText: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  noticeSubtext: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  homeStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  betaCard: {
    backgroundColor: '#eaf7fd',
    borderRadius: 24,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#c3e9fb',
  },
  betaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  betaBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  timerCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 20,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  currentZoneText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  currentZoneHero: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 6,
    shadowColor: '#2e9dd6',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  currentZoneHint: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dff5ff',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  timerText: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.accent,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#d9eef9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  timerSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  alignmentPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eaf3f8',
  },
  alignmentPillGood: {
    backgroundColor: '#dff7ea',
  },
  alignmentPillMixed: {
    backgroundColor: '#fff2d9',
  },
  alignmentPillLow: {
    backgroundColor: '#ffe2d9',
  },
  alignmentPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentPill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  segmentPillActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  liveLogCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 6,
  },
  liveLogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  liveLogBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  liveLogCount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  resultHero: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    gap: 8,
  },
  resultTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  resultDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  resultComment: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textSecondary,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timelineSummaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
