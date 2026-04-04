/**
 * ============================================================
 * CustomTitleBar.tsx  (v3 — fully reusable & adaptive)
 * ============================================================
 * A flexible title bar that renders at the top of the screen,
 * above both the nav rail (tablet) and the bottom bar (mobile).
 *
 * TABLET LAYOUT CONTRACT
 * ──────────────────────
 * On tablet, the title bar spans the FULL width of the screen
 * (including behind the nav rail). The nav rail is offset by
 * `titleBarHeight` via the `titleBarHeight` prop in AdaptiveNavigation.
 *
 * You do NOT need to add left/right margin to this component —
 * it intentionally spans the full width so it looks like a
 * proper app header. You may choose to offset the content
 * *inside* the title bar (leftPart/rightPart) for visual alignment.
 *
 * MOBILE LAYOUT CONTRACT
 * ──────────────────────
 * On mobile, the title bar appears above the screen content and
 * above the bottom tab bar. It also spans full width.
 *
 * PROPS
 * ─────
 * translateY      — Animated.Value for scroll-hide (from useScrollVisibility)
 * leftPart        — Node rendered on the left side (logo, app name, etc.)
 * rightPart       — Node rendered on the right side (actions, avatar, etc.)
 * height          — Override height. Defaults to TITLE_CONFIG.TitleHeight.
 * backgroundColor — Override background color. Defaults to colors.bodyBackground.
 * paddingHorizontal — Override horizontal padding. Default: 15 (scaled).
 * showBorder      — Show a bottom border. Default: true.
 * style           — Extra style applied to the container.
 *
 * USAGE
 * ─────
 * Basic:
 *   <CustomTitleBar
 *     leftPart={<Text>My App</Text>}
 *     rightPart={<SettingsButton />}
 *   />
 *
 * With scroll-hide:
 *   const { titleBarTranslate } = useScrollVisibility(isTablet);
 *   <CustomTitleBar
 *     translateY={titleBarTranslate}
 *     leftPart={<Text>My App</Text>}
 *   />
 *
 * ============================================================
 */

import { ThemeColors } from "@/src/constants/themeCollorConstant";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import React, { useMemo } from "react";
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { TITLE_CONFIG } from "../constants/navTitleConfig";

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────
export interface CustomTitleBarProps {
  /**
   * Animated.Value for vertical translation (scroll-hide).
   * Pass `titleBarTranslate` from useScrollVisibility.
   * If omitted, the title bar is always visible.
   */
  translateY?: Animated.Value;

  /** Content rendered on the left side (logo, app name, back button, etc.) */
  leftPart?: React.ReactNode;

  /** Content rendered on the right side (icons, avatar, menu button, etc.) */
  rightPart?: React.ReactNode;

  /**
   * Override the bar height.
   * Defaults to TITLE_CONFIG.TitleHeight from navTitleConfig.ts.
   */
  height?: number;

  /**
   * Override the background color.
   * Defaults to colors.bodyBackground from the current theme.
   */
  backgroundColor?: string;

  /**
   * Override horizontal padding.
   * Default: moderateScale(15).
   */
  paddingHorizontal?: number;

  /**
   * Show a bottom border line.
   * Useful for visual separation from content.
   * Default: false.
   */
  showBorder?: boolean;

  /** Extra styles applied to the animated container. */
  style?: StyleProp<ViewStyle>;

  paddingVertical ?: number;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CustomTitleBar({
  translateY,
  leftPart,
  rightPart,
  height,
  backgroundColor,
  paddingHorizontal,
  paddingVertical,
  showBorder = true,
  style,
}: CustomTitleBarProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      createStyles(
        colors,
        height,
        backgroundColor,
        paddingHorizontal,
        showBorder,
      ),
    [colors, height, backgroundColor, paddingHorizontal, showBorder],
  );

  return (
    <Animated.View
      style={[
        styles.container,
        translateY ? { transform: [{ translateY }] } : undefined,
        style,
        {
          paddingVertical: paddingVertical ? paddingVertical : 0
        }
      ]}
    >
      {/* Left section — logo, title, back button */}
      <View style={styles.left}>{leftPart}</View>

      {/* Right section — actions, avatar, menu */}
      <View style={styles.right}>{rightPart}</View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
function createStyles(
  colors: ThemeColors,
  height?: number,
  bgColor?: string,
  hPadding?: number,
  showBorder?: boolean,
) {
  return StyleSheet.create({
    container: {
      height: height ?? TITLE_CONFIG.TitleHeight,
      // When paddingHorizontal is explicitly 0 (tablet logo mode), honour it fully.
      paddingHorizontal: hPadding ?? moderateScale(15),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: bgColor ?? colors.background,
      // Bottom border — on by default for visual separation from content/rail
      borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: colors.titleBarBorder,
    } as ViewStyle,

    left: {
      flexDirection: "row",
      alignItems: "center",
      // flex:1 makes the left section fill remaining space on mobile (text title).
      // On tablet we pass paddingHorizontal=0 and a fixed-width logo container,
      // so flex:1 would stretch it — we keep it but it's harmless since the logo
      // container has an explicit width that controls its own visual alignment.
      flex: 1,
    } as ViewStyle,

    right: {
      flexDirection: "row",
      alignItems: "center",
    } as ViewStyle,
  });
}
