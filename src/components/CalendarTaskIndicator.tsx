// @/src/components/CalendarTaskIndicator.tsx
//
// Titlebar calendar icon with a pending-task count badge.
// Badge is hidden entirely when count is 0.
//
// ── Usage ────────────────────────────────────────────────────────────────────
//   <CalendarTaskIndicator count={2} />
//   <CalendarTaskIndicator count={0} />                  // badge hidden
//   <CalendarTaskIndicator count={99} />                 // shows "99"
//   <CalendarTaskIndicator count={120} />                // shows "99+"
//   <CalendarTaskIndicator size={0.8} onPress={…} />
//   <CalendarTaskIndicator colors={colors} count={4} />

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import type { ThemeColors } from "@/src/constants/themeCollorConstant";

// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarTaskIndicatorProps {
  /** Pending task count. Badge hidden when 0. */
  count: number;
  onPress?: () => void;
  /**
   * Scale multiplier — any positive number.
   * 0.5 = small · 1 = default · 2 = large
   */
  size?: number;
  colors?: ThemeColors;
}

// ── Slow breathing glow emitted from badge when tasks are pending ─────────────

function BadgeGlow({ color, dotSize }: { color: string; dotSize: number }) {
  const alpha = useRef(new Animated.Value(0.5)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(alpha, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 2.4,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(alpha, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
        opacity: alpha,
        transform: [{ scale }],
      }}
    />
  );
}

// ── Task count badge ──────────────────────────────────────────────────────────

interface BadgeProps {
  count: number;
  bg: string;
  borderBg: string;
  pulse: boolean;
  badgeSize: number;
  badgeBorder: number;
  fontSize: number;
}

function Badge({
  count,
  bg,
  borderBg,
  pulse,
  badgeSize,
  badgeBorder,
  fontSize,
}: BadgeProps) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: count > 0 ? 1 : 0,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [count > 0]);

  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);
  const pillW =
    label.length > 2
      ? badgeSize * 1.55
      : label.length > 1
        ? badgeSize * 1.3
        : badgeSize;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -(badgeBorder + 1),
        right: -(badgeBorder + 1),
        width: pillW + badgeBorder * 2,
        height: badgeSize + badgeBorder * 2,
        borderRadius: (badgeSize + badgeBorder * 2) / 2,
        backgroundColor: borderBg,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale }],
      }}
    >
      {pulse && <BadgeGlow color={bg} dotSize={pillW} />}
      <View
        style={{
          width: pillW,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 2,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize,
            fontWeight: "700",
            letterSpacing: -0.2,
            lineHeight: fontSize * 1.15,
            includeFontPadding: false,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CalendarTaskIndicator({
  count,
  onPress,
  size = 1,
  colors: colorsProp,
}: CalendarTaskIndicatorProps) {
  const { colors: themeColors } = useTheme();
  const colors = colorsProp ?? themeColors;

  const hasTasks = count > 0;

  // Scale all tokens from the size multiplier
  const s = (base: number) => moderateScale(base * size, 0.3);

  const avatarSz = s(32);
  const iconSz = s(17);
  const badgeSz = s(14);
  const badgeBorder = Math.max(1, s(1.8));
  const badgeFontSz = s(8);

  // Palette — drawn exclusively from themeCollorConstant
  const iconColor = hasTasks ? colors.calendarText : colors.textThird;
  const avatarBg = hasTasks ? colors.calendarBg : colors.backgroundSecondary;
  const avatarBdr = hasTasks ? colors.calendarBorder : colors.border;
  const badgeBg = colors.calendarText;
  const ringBg = colors.backgroundSecondary;

  // Pop-in / pop-out when hasTasks changes
  const avatarScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(avatarScale, {
        toValue: 1.12,
        tension: 300,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 200,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasTasks, count]);

  // Subtle bounce when count increases
  const bounceY = useRef(new Animated.Value(0)).current;
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      Animated.sequence([
        Animated.timing(bounceY, {
          toValue: -4,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(bounceY, {
          toValue: 0,
          tension: 300,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCount.current = count;
  }, [count]);

  const content = (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale: avatarScale }, { translateY: bounceY }] },
      ]}
    >
      {/* Avatar */}
      <View
        style={{
          width: avatarSz,
          height: avatarSz,
          borderRadius: avatarSz * 0.28,
          backgroundColor: avatarBg,
          borderWidth: 1,
          borderColor: avatarBdr,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={hasTasks ? "calendar-clock" : "calendar-outline"}
          size={iconSz}
          color={iconColor}
        />
      </View>

      {/* Badge */}
      <Badge
        count={count}
        bg={badgeBg}
        borderBg={ringBg}
        pulse={hasTasks}
        badgeSize={badgeSz}
        badgeBorder={badgeBorder}
        fontSize={badgeFontSz}
      />
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      android_ripple={{
        color: badgeBg + "20",
        borderless: false,
        radius: 60,
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignSelf: "center",
  },
});
