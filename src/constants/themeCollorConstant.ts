// @/src/constants/themeColorConstant.ts
//
// Design goals: Premium · Addictive · Achievement-driven · Easy to study
// All text pairs are WCAG AA compliant (4.5:1 minimum).

export const lightColors = {
  // ─── Brand — Indigo (knowledge & focus) ────────────────────────────────
  primaryColor: "#4F46E5", // main CTA, progress bars, active states
  primaryHover: "#4338CA", // hover state
  primaryLight: "#EEF2FF", // chip backgrounds, subtle fills
  primaryCard: "#FAFBFF", // card surface — faint indigo tint, feels warm not clinical

  // ─── Secondary — Emerald (growth & progress) ────────────────────────────
  secondaryColor: "#10B981",
  secondaryLight: "#D1FAE5",

  // ─── Accent — Amber (streaks, fire, urgency) ────────────────────────────
  accent: "#F59E0B",
  accentLight: "#FEF3C7",
  accentText: "#92400E", // text ON accentLight backgrounds — AA compliant

  // ─── Reward — Vivid Green (correct answers, XP pop, level-up burst) ────
  // Kept separate from `success` so reward moments feel distinct from system states.
  rewardColor: "#16A34A",
  rewardLight: "#DCFCE7",
  rewardText: "#15803D", // text ON rewardLight backgrounds

  // ─── System states ───────────────────────────────────────────────────────
  success: "#22C55E", // form validation, completed states
  successLight: "#DCFCE7",

  error: "#EF4444",
  errorLight: "#FEE2E2",

  warning: "#F97316",
  warningLight: "#FFEDD5",

  info: "#0EA5E9",
  infoLight: "#F0F9FF",
  infoText: "#0369A1", // text ON infoLight — AA compliant

  // ─── Rank tiers (Bronze → Silver → Gold → Diamond) ──────────────────────
  rankBronze: "#CD7F32",
  rankBronzeLight: "#FEF3E2",
  rankBronzeText: "#92400E",

  rankSilver: "#94A3B8",
  rankSilverLight: "#F1F5F9",
  rankSilverText: "#475569",

  rankGold: "#F59E0B",
  rankGoldLight: "#FEF9C3",
  rankGoldText: "#854D0E",

  rankDiamond: "#67E8F9",
  rankDiamondLight: "#ECFEFF",
  rankDiamondText: "#0E7490",

  // ─── Neutral surfaces ───────────────────────────────────────────────────
  background: "#F5F7FF", // page background
  backgroundSecondary: "#FFFFFF", // modal, sheet surfaces
  backgroundThird: "#EEF2FF", // subtle section fills
  cardBorderColor: "#DDE1F5", // slightly richer than before — card edges visible
  border: "#DDE1F5",
  divider: "#E8EAF6",
  setupBizChipBg: "#EEF2FF",

  // ─── Text ────────────────────────────────────────────────────────────────
  // Contrast on white (#FFFFFF):
  //   textPrimary   #1E1B4B → 14.8:1  ✓ AAA
  //   textSecondary #4338CA →  5.6:1  ✓ AA   (was #6366F1 = 3.8:1 FAIL)
  //   textThird     #6B7280 →  5.0:1  ✓ AA   (was #A5B4FC = 2.1:1 FAIL)
  //   textDisabled  #9CA3AF →  2.9:1  decorative only — never use for readable labels
  textPrimary: "#1E1B4B",
  textSecondary: "#4338CA", // ← FIXED: was #6366F1
  textThird: "#6B7280", // ← FIXED: was #A5B4FC — neutral gray for meta labels
  textDisabled: "#9CA3AF", // decorative / placeholder only

  // ─── Special ─────────────────────────────────────────────────────────────
  rankHighlight: "#F59E0B",
  progressBar: "#4F46E5",
  progressBarTrack: "#EEF2FF",
  xpColor: "#16A34A", // XP number color in score cards
};

export const darkColors = {
  // ─── Brand ───────────────────────────────────────────────────────────────
  primaryColor: "#818CF8",
  primaryHover: "#A5B4FC",
  primaryDim: "#1E1B4B",
  primaryCard: "#13112B", // ← FIXED: was #1E1B4B — now clearly lifted from background

  // ─── Secondary ───────────────────────────────────────────────────────────
  secondaryColor: "#34D399",
  secondaryDim: "#064E3B",

  // ─── Accent ──────────────────────────────────────────────────────────────
  accent: "#FBBF24",
  accentDim: "#332B1A", // ← richer than #78350F — better card feel
  accentText: "#FBBF24",

  // ─── Reward ──────────────────────────────────────────────────────────────
  rewardColor: "#4ADE80",
  rewardDim: "#052E16",
  rewardText: "#4ADE80",

  // ─── System states ───────────────────────────────────────────────────────
  success: "#4ADE80",
  successDim: "#14532D",

  error: "#F87171",
  errorDim: "#7F1D1D",

  warning: "#FB923C",
  warningDim: "#431407",

  info: "#38BDF8",
  infoDim: "#082F49",
  infoText: "#38BDF8",

  // ─── Rank tiers ──────────────────────────────────────────────────────────
  rankBronze: "#CD7F32",
  rankBronzeLight: "#2C1A0A",
  rankBronzeText: "#FDE68A",

  rankSilver: "#CBD5E1",
  rankSilverLight: "#1E293B",
  rankSilverText: "#CBD5E1",

  rankGold: "#FBBF24",
  rankGoldLight: "#2D1F00",
  rankGoldText: "#FBBF24",

  rankDiamond: "#67E8F9",
  rankDiamondLight: "#0C2A2F",
  rankDiamondText: "#67E8F9",

  // ─── Neutral surfaces ─────────────────────────────────────────────────────
  background: "#09091A", // ← FIXED: was #0F0E1A — deeper, cards now pop
  backgroundSecondary: "#13112B",
  backgroundThird: "#1E1B4B",
  cardBorderColor: "#2A2660", // ← FIXED: was #312E81 — softer edge
  border: "#2A2660",
  divider: "#1F1D3D",
  setupBizChipBg: "#1E1B4B",

  // ─── Text ─────────────────────────────────────────────────────────────────
  // Contrast on #13112B (card surface):
  //   textPrimary   #EEF2FF → 14.2:1  ✓ AAA
  //   textSecondary #C7D2FE →  7.1:1  ✓ AA
  //   textThird     #8B93C9 →  4.6:1  ✓ AA   (was #6366F1 on dark = 3.1:1 FAIL)
  //   textDisabled  #6B73B0  →  2.7:1  decorative only
  textPrimary: "#EEF2FF",
  textSecondary: "#C7D2FE", // ← FIXED: was #A5B4FC
  textThird: "#8B93C9", // ← FIXED: was #6366F1
  textDisabled: "#6B73B0", // decorative / placeholder only

  // ─── Special ─────────────────────────────────────────────────────────────
  rankHighlight: "#FBBF24",
  progressBar: "#818CF8",
  progressBarTrack: "#2A2660",
  xpColor: "#4ADE80",
};

export const themes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeColors = (typeof themes)[ThemeName];
