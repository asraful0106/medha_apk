// @/src/components/NotificationIndicator.tsx
//
// Titlebar notification bell with animated unread-count badge.
// Badge is hidden entirely when count is 0.
//
// ── Usage ────────────────────────────────────────────────────────────────────
//   <NotificationIndicator count={3} />
//   <NotificationIndicator count={0} />                  // badge hidden
//   <NotificationIndicator count={99} />                 // shows "99"
//   <NotificationIndicator count={120} />                // shows "99+"
//   <NotificationIndicator size={0.8} onPress={…} />
//   <NotificationIndicator colors={colors} count={5} />

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

export interface NotificationIndicatorProps {
  /** Unread notification count. Badge hidden when 0. */
  count: number;
  onPress?: () => void;
  /**
   * Scale multiplier — any positive number.
   * 0.5 = small · 1 = default · 2 = large
   */
  size?: number;
  colors?: ThemeColors;
}

// ── Ripple pulse emitted from the badge when count > 0 ───────────────────────

function BadgePulse({ color, dotSize }: { color: string; dotSize: number }) {
  const ring = useRef(new Animated.Value(0)).current;
  const alpha = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(alpha, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ring, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(alpha, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(600),
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
        transform: [
          {
            scale: ring.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 2.8],
            }),
          },
        ],
      }}
    />
  );
}

// ── Unread badge pill ─────────────────────────────────────────────────────────

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
  // Widen pill for multi-char labels
  const pillW =
    label.length > 2
      ? badgeSize * 1.55
      : label.length > 1
        ? badgeSize * 1.3
        : badgeSize;

  return (
    // White "ring" border — clips the badge cleanly off the avatar corner
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
      {pulse && <BadgePulse color={bg} dotSize={pillW} />}
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

export function NotificationIndicator({
  count,
  onPress,
  size = 1,
  colors: colorsProp,
}: NotificationIndicatorProps) {
  const { colors: themeColors } = useTheme();
  const colors = colorsProp ?? themeColors;

  const hasUnread = count > 0;

  // Scale all tokens from the size multiplier
  const s = (base: number) => moderateScale(base * size, 0.3);

  const avatarSz = s(32);
  const iconSz = s(17);
  const badgeSz = s(14);
  const badgeBorder = Math.max(1, s(1.8));
  const badgeFontSz = s(8);

  // Palette — drawn exclusively from themeCollorConstant
  const iconColor = hasUnread ? colors.notifDot : colors.textThird;
  const avatarBg = hasUnread
    ? colors.notificationBg
    : colors.backgroundSecondary;
  const avatarBdr = hasUnread ? colors.notificationBorder : colors.border;
  const badgeBg = colors.notifDot;
  const ringBg = colors.backgroundSecondary;

  // Pop-in / pop-out when hasUnread changes
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
  }, [hasUnread, count]);

  // Gentle shake when a new notification arrives
  const shakeX = useRef(new Animated.Value(0)).current;
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      Animated.sequence([
        Animated.timing(shakeX, {
          toValue: -3,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 3,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: -2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 0,
          duration: 40,
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
        { transform: [{ scale: avatarScale }, { translateX: shakeX }] },
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
          name={hasUnread ? "bell-badge" : "bell-outline"}
          size={iconSz}
          color={iconColor}
        />
      </View>

      {/* Badge */}
      <Badge
        count={count}
        bg={badgeBg}
        borderBg={ringBg}
        pulse={hasUnread}
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
