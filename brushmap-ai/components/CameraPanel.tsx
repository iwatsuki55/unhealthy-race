import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { BRUSH_ZONES, colors } from '../constants/brush';
import { BrushZone, CameraTelemetry } from '../types/brush';
import { PrimaryButton } from './PrimaryButton';

type CameraPanelProps = {
  onCameraReadyChange?: (ready: boolean) => void;
  onTelemetryChange?: (telemetry: CameraTelemetry) => void;
  predictedZone?: BrushZone;
  guideZone?: BrushZone;
};

export function CameraPanel({
  onCameraReadyChange,
  onTelemetryChange,
  predictedZone,
  guideZone,
}: CameraPanelProps) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    onCameraReadyChange?.(true);
    onTelemetryChange?.({
      isPreviewVisible: true,
      facing: 'front',
      mode: 'web-placeholder',
      previewWidth: 360,
      previewHeight: 220,
    });
  }, [onCameraReadyChange, onTelemetryChange]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>Webプレビューではカメラを簡易表示</Text>
        <Text style={styles.body}>
          実機のiOS/Androidではインカメラを表示します。Webでは画面確認用に
          プレースホルダーを表示しています。
        </Text>
        <View style={styles.webPreview}>
          <Text style={styles.webPreviewTitle}>Camera Preview Placeholder</Text>
          <Text style={styles.webPreviewBody}>
            ここにインカメラ映像が表示されます
          </Text>
          <ZoneOverlay predictedZone={predictedZone} guideZone={guideZone} />
        </View>
      </View>
    );
  }

  return (
    <NativeCameraPanel
      onCameraReadyChange={onCameraReadyChange}
      onTelemetryChange={onTelemetryChange}
      predictedZone={predictedZone}
      guideZone={guideZone}
    />
  );
}

function NativeCameraPanel({
  onCameraReadyChange,
  onTelemetryChange,
  predictedZone,
  guideZone,
}: CameraPanelProps) {
  const { CameraView, useCameraPermissions } =
    require('expo-camera') as typeof import('expo-camera');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      onCameraReadyChange?.(false);
      onTelemetryChange?.({
        isPreviewVisible: false,
        facing: 'front',
        mode: 'native-preview',
      });
      return;
    }

    if (!permission.granted) {
      onCameraReadyChange?.(false);
      onTelemetryChange?.({
        isPreviewVisible: false,
        facing: 'front',
        mode: 'native-preview',
      });
    }
  }, [onCameraReadyChange, onTelemetryChange, permission]);

  if (!permission) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>カメラを準備しています...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>インカメラの許可が必要です</Text>
        <Text style={styles.body}>
          カメラ映像は端末内のプレビュー表示のみに使用し、保存しません。
        </Text>
        <PrimaryButton label="カメラを許可" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="front"
        onCameraReady={() => {
          onCameraReadyChange?.(true);
          onTelemetryChange?.({
            isPreviewVisible: true,
            facing: 'front',
            mode: 'native-preview',
            previewWidth: 360,
            previewHeight: 280,
          });
        }}
      />
      <ZoneOverlay predictedZone={predictedZone} guideZone={guideZone} />
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>インカメラ表示</Text>
        <Text style={styles.overlayBody}>
          画面で姿勢を確認しながら、下のボタンで部位を記録します。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#0e3852',
  },
  camera: {
    height: 280,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(7, 34, 49, 0.55)',
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  overlayBody: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#d8f3ff',
  },
  zoneOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    gap: 8,
  },
  overlayMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  overlayMetaText: {
    backgroundColor: 'rgba(7, 34, 49, 0.72)',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  overlayMetaPill: {
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  overlayMetaPillAligned: {
    backgroundColor: 'rgba(60, 179, 113, 0.92)',
  },
  overlayMetaPillMismatch: {
    backgroundColor: 'rgba(244, 165, 36, 0.94)',
  },
  overlayMetaPillAlignedSoft: {
    backgroundColor: 'rgba(60, 179, 113, 0.28)',
  },
  overlayMetaPillMismatchSoft: {
    backgroundColor: 'rgba(244, 165, 36, 0.26)',
  },
  overlayMetaTextStrong: {
    backgroundColor: 'transparent',
    color: '#ffffff',
  },
  statusBanner: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  statusBannerAligned: {
    backgroundColor: 'rgba(60, 179, 113, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(178, 255, 212, 0.65)',
  },
  statusBannerMismatch: {
    backgroundColor: 'rgba(244, 165, 36, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 168, 0.68)',
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneCell: {
    width: '31%',
    minWidth: 82,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(7, 34, 49, 0.36)',
    borderWidth: 1,
    borderColor: 'rgba(216, 243, 255, 0.25)',
  },
  zoneCellGuide: {
    backgroundColor: 'rgba(10, 63, 92, 0.88)',
    borderColor: '#7fd8ff',
  },
  zoneCellPredicted: {
    backgroundColor: 'rgba(46, 157, 214, 0.72)',
    borderColor: '#9fe3ff',
  },
  zoneCellBoth: {
    backgroundColor: 'rgba(60, 179, 113, 0.76)',
    borderColor: '#b2ffd4',
  },
  zoneCellText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#e9f8ff',
  },
  zoneCellTextActive: {
    color: '#ffffff',
  },
  zoneCellTextGuide: {
    color: '#ffffff',
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  webPreview: {
    minHeight: 220,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9fd5ed',
    backgroundColor: '#edf8fd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  webPreviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  webPreviewBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});

function ZoneOverlay({
  predictedZone,
  guideZone,
}: {
  predictedZone?: BrushZone;
  guideZone?: BrushZone;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const isAligned = Boolean(predictedZone && guideZone && predictedZone === guideZone);
  const isMismatch = Boolean(predictedZone && guideZone && predictedZone !== guideZone);

  useEffect(() => {
    if (!predictedZone) {
      pulse.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [predictedZone, pulse]);

  const animatedScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const animatedOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.84],
  });

  return (
    <View style={styles.zoneOverlay}>
      <View style={styles.overlayMetaRow}>
        <Animated.View
          style={[
            styles.overlayMetaPill,
            isAligned && styles.overlayMetaPillAligned,
            isMismatch && styles.overlayMetaPillMismatch,
            predictedZone && {
              transform: [{ scale: animatedScale }],
              opacity: animatedOpacity,
            },
          ]}
        >
          <Text
            style={[
              styles.overlayMetaText,
              (isAligned || isMismatch) && styles.overlayMetaTextStrong,
            ]}
          >
            AI: {predictedZone ? getZoneShortLabel(predictedZone) : '未推定'}
          </Text>
        </Animated.View>
        <View
          style={[
            styles.overlayMetaPill,
            isAligned && styles.overlayMetaPillAlignedSoft,
            isMismatch && styles.overlayMetaPillMismatchSoft,
          ]}
        >
          <Text
            style={[
              styles.overlayMetaText,
              (isAligned || isMismatch) && styles.overlayMetaTextStrong,
            ]}
          >
            ガイド: {guideZone ? getZoneShortLabel(guideZone) : '-'}
          </Text>
        </View>
      </View>
      {predictedZone && guideZone ? (
        <View
          style={[
            styles.statusBanner,
            isAligned ? styles.statusBannerAligned : styles.statusBannerMismatch,
          ]}
        >
          <Text style={styles.statusBannerText}>
            {isAligned ? 'AI推定とガイドが一致しています' : 'AI推定とガイドにズレがあります'}
          </Text>
        </View>
      ) : null}
      <View style={styles.zoneGrid}>
        {BRUSH_ZONES.map((zone) => {
          const isPredicted = zone.value === predictedZone;
          const isGuide = zone.value === guideZone;
          const isBoth = isPredicted && isGuide;

          return (
            <Animated.View
              key={zone.value}
              style={[
                styles.zoneCell,
                isGuide && styles.zoneCellGuide,
                isPredicted && styles.zoneCellPredicted,
                isBoth && styles.zoneCellBoth,
                isPredicted && {
                  transform: [{ scale: animatedScale }],
                  opacity: animatedOpacity,
                },
              ]}
            >
              <Text
                style={[
                  styles.zoneCellText,
                  (isGuide || isPredicted) && styles.zoneCellTextActive,
                  isGuide && styles.zoneCellTextGuide,
                ]}
              >
                {zone.label}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function getZoneShortLabel(zone: BrushZone) {
  return BRUSH_ZONES.find((item) => item.value === zone)?.label ?? zone;
}
