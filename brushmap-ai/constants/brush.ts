import { BrushZone, GuideSegment, ZoneOption } from '../types/brush';

export const SESSION_LENGTH_SEC = 120;

export const colors = {
  background: '#f3fbff',
  card: '#ffffff',
  surface: '#eaf7fd',
  accent: '#2e9dd6',
  textPrimary: '#10354a',
  textSecondary: '#557488',
  notice: '#e3f5ff',
};

export const APP_COPY = {
  disclaimer:
    '本アプリは医療診断ではありません。ブラッシング習慣の可視化を目的としています。',
};

export const BRUSH_ZONES: ZoneOption[] = [
  { value: 'upperRight', label: '右上' },
  { value: 'upperFront', label: '前上' },
  { value: 'upperLeft', label: '左上' },
  { value: 'lowerRight', label: '右下' },
  { value: 'lowerFront', label: '前下' },
  { value: 'lowerLeft', label: '左下' },
];

export const GUIDE_SEGMENTS: GuideSegment[] = [
  { label: '0-30秒 右上', zone: 'upperRight', startSec: 0, endSec: 30 },
  { label: '30-60秒 左上', zone: 'upperLeft', startSec: 30, endSec: 60 },
  { label: '60-90秒 右下', zone: 'lowerRight', startSec: 60, endSec: 90 },
  { label: '90-120秒 左下', zone: 'lowerLeft', startSec: 90, endSec: 120 },
];

export const EMPTY_ZONE_DURATIONS: Record<BrushZone, number> = {
  upperRight: 0,
  upperFront: 0,
  upperLeft: 0,
  lowerRight: 0,
  lowerFront: 0,
  lowerLeft: 0,
};

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;
