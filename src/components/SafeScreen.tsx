/**
 * ============================================================
 * SafeScreen.tsx  (v2 — adaptive safe area)
 * ============================================================
 * A fully reusable safe-area wrapper that adapts to device type.
 *
 * ✅ Mobile  → Handles top/left/right safe area edges
 * ✅ Tablet  → Handles only top safe area (rail handles sides)
 * ✅ Custom  → Pass extra style, contentStyle, or override edges
 *
 * PROPS
 * ─────
 * children        — Screen content
 * style           — Style applied to the SafeAreaView wrapper
 * contentStyle    — Style applied to the inner content View
 * edges           — Override safe-area edges (auto-detected by default)
 * isTablet        — Override tablet detection (auto-detected by default)
 * ============================================================
 */

import { useTheme } from "@/src/hooks/theme/ThemeContext";
import React from "react";
import { StyleProp, View, ViewStyle, useWindowDimensions } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { BREAKPOINTS } from "../constants/navTitleConfig";

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────
interface SafeScreenProps {
  /** Screen content */
  children: React.ReactNode;

  /** Style on the SafeAreaView itself */
  style?: StyleProp<ViewStyle>;

  /**
   * Style on the inner content wrapper View.
   * Useful for adding padding or margin to offset the nav rail.
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Override which edges to inset.
   * Defaults to ["top","left","right"] on mobile,
   * and ["top"] on tablet (rail handles the side).
   */
  edges?: Edge[];

  /**
   * Override tablet detection.
   * If undefined, auto-detected from window width using BREAKPOINTS.tablet.
   */
  isTablet?: boolean;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function SafeScreen({
  children,
  style,
  contentStyle,
  edges,
  isTablet: isTabletProp,
}: SafeScreenProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isTablet = isTabletProp ?? width >= BREAKPOINTS.tablet;

  // On tablet: only top edge — the nav rail sits absolutely on the side
  // and handles its own safe area. Handling left/right here would double-inset.
  // On mobile: top + sides (bottom is handled by the tab bar itself).
  const resolvedEdges: Edge[] =
    edges ?? (isTablet ? ["top"] : ["top", "left", "right"]);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.bodyBackground }, style]}
      edges={resolvedEdges}
    >
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}
