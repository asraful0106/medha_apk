// @/src/components/UniversityInfoButton.tsx
//
// Titlebar button that navigates to the university & exam info screen.
// No badge or indicator — pure navigation affordance.
//
// ── Usage ────────────────────────────────────────────────────────────────────
//   <UniversityInfoButton onPress={() => router.push("/university-info")} />
//   <UniversityInfoButton size={0.8} onPress={…} />
//   <UniversityInfoButton colors={colors} onPress={…} />

import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import type { ThemeColors } from "@/src/constants/themeCollorConstant";

// ─────────────────────────────────────────────────────────────────────────────

export interface UniversityInfoButtonProps {
  onPress?: () => void;
  /**
   * Scale multiplier — any positive number.
   * 0.5 = small · 1 = default · 2 = large
   */
  size?: number;
  colors?: ThemeColors;
}

// ── Main component ────────────────────────────────────────────────────────────

export function UniversityInfoButton({
  onPress,
  size = 1,
  colors: colorsProp,
}: UniversityInfoButtonProps) {
  const { colors: themeColors } = useTheme();
  const colors = colorsProp ?? themeColors;

  // Scale all tokens from the size multiplier
  const s = (base: number) => moderateScale(base * size, 0.3);

  const avatarSz = s(32);
  const iconSz = s(17);

  // Palette — drawn exclusively from themeCollorConstant
  const avatarBg = colors.primaryLight;
  const avatarBdr = colors.cardSecondaryBorder;
  const iconColor = colors.primaryColor;

  // Mount animation — fade + scale in
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 180,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      android_ripple={{
        color: iconColor + "20",
        borderless: false,
        radius: 60,
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      <Animated.View
        style={[
          styles.avatar,
          {
            width: avatarSz,
            height: avatarSz,
            borderRadius: avatarSz * 0.28,
            backgroundColor: avatarBg,
            borderColor: avatarBdr,
            opacity: fade,
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialCommunityIcons
          name="school-outline"
          size={iconSz}
          color={iconColor}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
