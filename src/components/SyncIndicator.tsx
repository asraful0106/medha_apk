// @/src/components/SyncIndicator.tsx
//
// Compact title-bar sync indicator.
//
// States:
//   synced   — all clear, subtle green pulse dot
//   pending  — animated spinning arc + count badge
//   failed   — red warning icon + count badge
//   loading  — faint grey dot
//
// Usage in a title bar:
//   <SyncIndicator onPress={() => navigation.navigate("SyncStatus")} />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { StyledText } from "@/src/components/StyledText";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useSyncStatus } from "@/src/context/SyncContext";

interface Props {
  onPress?: () => void;
  /** Show a text label next to the indicator. Default false. */
  showLabel?: boolean;
}

const SyncIndicator: React.FC<Props> = ({ onPress, showLabel = false }) => {
  const { colors } = useTheme();
  const { pendingCount, failedCount, isLoading } = useSyncStatus();

  // ── Animation values ──────────────────────────────────────────────────────
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const hasFailed = failedCount > 0;
  const hasPending = pendingCount > 0;
  const isSynced = !hasFailed && !hasPending && !isLoading;

  // Spin animation for pending state
  useEffect(() => {
    if (hasPending && !hasFailed) {
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.current.start();
    } else {
      spinLoop.current?.stop();
      spinAnim.setValue(0);
    }
    return () => spinLoop.current?.stop();
  }, [hasPending, hasFailed]);

  // Pulse animation for synced state
  useEffect(() => {
    if (isSynced) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [isSynced]);

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const spinDeg = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ── Derived display values ────────────────────────────────────────────────

  const badgeCount = hasFailed ? failedCount : pendingCount;
  const badgeColor = hasFailed ? "#EF4444" : colors.primaryColor;
  const dotColor = hasFailed
    ? "#EF4444"
    : hasPending
      ? colors.primaryColor
      : isSynced
        ? "#22C55E"
        : colors.thirdTextColor;

  const label = isLoading
    ? ""
    : hasFailed
      ? `${failedCount} failed`
      : hasPending
        ? `${pendingCount} pending`
        : "Synced";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.container}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {/* Indicator graphic */}
        <View style={styles.iconWrap}>
          {/* Outer pulse ring — only in synced state */}
          {isSynced && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: "#22C55E",
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.6, 0],
                  }),
                },
              ]}
            />
          )}

          {/* Spinning arc — pending state */}
          {hasPending && !hasFailed && (
            <Animated.View
              style={[
                styles.spinRing,
                {
                  borderTopColor: colors.primaryColor,
                  borderRightColor: colors.primaryColor + "30",
                  borderBottomColor: colors.primaryColor + "30",
                  borderLeftColor: colors.primaryColor + "30",
                  transform: [{ rotate: spinDeg }],
                },
              ]}
            />
          )}

          {/* Center dot */}
          <View
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                // Slightly larger when failed for emphasis
                width: hasFailed ? moderateScale(9) : moderateScale(7),
                height: hasFailed ? moderateScale(9) : moderateScale(7),
                borderRadius: hasFailed
                  ? moderateScale(4.5)
                  : moderateScale(3.5),
              },
            ]}
          />
        </View>

        {/* Badge — only when there are pending or failed items */}
        {!isLoading && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <StyledText style={styles.badgeText}>
              {badgeCount > 99 ? "99+" : String(badgeCount)}
            </StyledText>
          </View>
        )}

        {/* Optional label */}
        {showLabel && !isLoading && (
          <StyledText
            style={[
              styles.label,
              { color: hasFailed ? "#EF4444" : colors.secondaryTextColor },
            ]}
          >
            {label}
          </StyledText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const SIZE = moderateScale(22);
const DOT = moderateScale(7);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  iconWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
  },
  spinRing: {
    position: "absolute",
    width: SIZE - 2,
    height: SIZE - 2,
    borderRadius: (SIZE - 2) / 2,
    borderWidth: 2,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  badge: {
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(4),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -moderateScale(6),
    marginTop: -moderateScale(10),
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontSize: moderateScale(8, 0.3),
    fontWeight: "800",
    lineHeight: moderateScale(10),
  },
  label: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "500",
  },
});

export default SyncIndicator;
