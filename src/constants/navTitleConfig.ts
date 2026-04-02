// ─────────────────────────────────────────────────────────────
// NAV CONFIG

import { moderateScale } from "react-native-size-matters";
import { NavConfig } from "../components/AdaptiveNavigation";

export interface TitleConfig {
  iconSize?: number;
  TitleHeight?: number;
  HeaderFontSize?: number;
}

// ─────────────────────────────────────────────────────────────
export const NAV_CONFIG: NavConfig = {
  iconSize: moderateScale(16, 0.01),
  barHeight: moderateScale(50),
  railWidth: moderateScale(50),
  railSide: "left",
  showLabelsOnMobile: true,
  showLabelsOnTablet: true,
};

// ─────────────────────────────────────────────────────────────
export const TITLE_CONFIG: TitleConfig = {
  iconSize: moderateScale(16),
  TitleHeight: moderateScale(30, 0.01),
  HeaderFontSize: moderateScale(20, 0.01),
};

// ─────────────────────────────────────────────────────────────
// 📐 BREAKPOINTS
// ─────────────────────────────────────────────────────────────
export const BREAKPOINTS = {
  tablet: 768,
} as const;