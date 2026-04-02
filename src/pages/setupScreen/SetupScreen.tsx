// @/src/screens/setup/SetupBusinessScreen.tsx
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { ThemeColors } from "@/src/constants/themeCollorConstant";
import { LanguageCode } from "@/src/constants/languages";
import { StyledText } from "@/src/components/StyledText";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useLanguage } from "@/src/hooks/language/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SetupAppScreenProps {
  onComplete: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// PreferencesStep — language pill grid + dark/light theme cards
// ─────────────────────────────────────────────────────────────────────────────
const LANGUAGES: { code: LanguageCode; native: string; flag: string }[] = [
  { code: "en", native: "English", flag: "🇬🇧" },
  { code: "bn", native: "বাংলা", flag: "🇧🇩" },
];

function PreferencesStep({ colors }: { colors: ThemeColors }) {
  const { t } = useTranslation();
  const { changeTheme, themeName } = useTheme();
  const { lang, changeLanguage } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isDark = themeName === "dark";

  return (
    <>
      {/* ── Language ─────────────────────────────────── */}
      <StyledText style={styles.prefSectionLabel}>
        {t("setup.preferences.languageLabel")}
      </StyledText>
      <View style={styles.langRow}>
        {LANGUAGES.map((l) => {
          const active = lang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.langPill, active && styles.langPillActive]}
              onPress={() => changeLanguage(l.code)}
              activeOpacity={0.75}
            >
              <StyledText style={styles.langPillFlag}>{l.flag}</StyledText>
              <StyledText
                style={[
                  styles.langPillStyledText,
                  active && styles.langPillStyledTextActive,
                ]}
              >
                {l.native}
              </StyledText>
              {active && <StyledText style={styles.langCheckmark}>✓</StyledText>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Theme ────────────────────────────────────── */}
      <StyledText style={[styles.prefSectionLabel, { marginTop: 20 }]}>
        {t("setup.preferences.themeLabel")}
      </StyledText>
      <View style={styles.themeRow}>
        {/* Light card */}
        <TouchableOpacity
          style={[
            styles.themeCard,
            styles.themeCardLight,
            !isDark && styles.themeCardActive,
          ]}
          onPress={() => changeTheme("light")}
          activeOpacity={0.8}
        >
          <View style={styles.themePreviewLight}>
            <View style={styles.themePreviewIndigoBar} />
            <View style={styles.themePreviewLightLine} />
            <View style={[styles.themePreviewLightLine, { width: "60%" }]} />
          </View>
          <View style={styles.themeCardFooter}>
            <StyledText style={styles.themeCardLabelLight}>
              {t("setup.preferences.themeLight")}
            </StyledText>
            {!isDark && (
              <View style={styles.themeActiveDot}>
                <StyledText style={styles.themeActiveDotStyledText}>✓</StyledText>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Dark card */}
        <TouchableOpacity
          style={[
            styles.themeCard,
            styles.themeCardDark,
            isDark && styles.themeCardActive,
          ]}
          onPress={() => changeTheme("dark")}
          activeOpacity={0.8}
        >
          <View style={styles.themePreviewDark}>
            <View style={styles.themePreviewIndigoBar} />
            <View style={styles.themePreviewDarkLine} />
            <View style={[styles.themePreviewDarkLine, { width: "60%" }]} />
          </View>
          <View style={styles.themeCardFooter}>
            <StyledText style={styles.themeCardLabelDark}>
              {t("setup.preferences.themeDark")}
            </StyledText>
            {isDark && (
              <View style={styles.themeActiveDot}>
                <StyledText style={styles.themeActiveDotStyledText}>✓</StyledText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function SetupAppScreen({ onComplete }: SetupAppScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Entry-animation on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand mark */}
        <View style={styles.brandMark}>
          <View style={styles.brandIcon}>
            <StyledText style={styles.brandIconStyledText}>🎓</StyledText>
          </View>
          <StyledText style={styles.appName}>Medha</StyledText>
          <StyledText style={styles.appTagline}>{t("setup.tagline")}</StyledText>
        </View>

        {/* Animated preferences card */}
        <Animated.View
          style={[
            styles.contentCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <StyledText style={styles.stepLabel}>{t("setup.badge")}</StyledText>
          <StyledText style={styles.title}>{t("setup.preferences.title")}</StyledText>
          <StyledText style={styles.subtitle}>{t("setup.preferences.subtitle")}</StyledText>

          <PreferencesStep colors={colors} />

          {/* CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <StyledText style={styles.primaryBtnStyledText}>{t("setup.getStarted")}</StyledText>
            <StyledText style={styles.primaryBtnArrow}>→</StyledText>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer hint */}
        <StyledText style={styles.hint}>{t("setup.hint")}</StyledText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  ScaledSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      alignItems: "center",
      paddingHorizontal: "24@ms0.3",
      paddingTop: "64@ms0.3",
      paddingBottom: "40@ms0.3",
    },
 
    // ── Brand ──────────────────────────────────────────────
    brandMark: {
      marginBottom: "28@ms0.3",
      alignItems: "center",
      gap: "6@ms0.3",
    },
    brandIcon: {
      width: "72@ms0.3",
      height: "72@ms0.3",
      borderRadius: "22@ms0.3",
      backgroundColor: colors.backgroundThird,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.cardBorderColor,
      marginBottom: "4@ms0.3",
    },
    brandIconStyledText: {
      fontSize: "34@ms0.3",
    },
    appName: {
      fontSize: "28@ms0.3",
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    appTagline: {
      fontSize: "13@ms0.3",
      color: colors.textSecondary,
      StyledTextAlign: "center",
    },
 
    // ── Card ───────────────────────────────────────────────
    contentCard: {
      width: "100%",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: "18@ms0.3",
      borderWidth: 1,
      borderColor: colors.cardBorderColor,
      padding: "22@ms0.3",
      marginBottom: "16@ms0.3",
    },
    stepLabel: {
      fontSize: "11@ms0.3",
      fontWeight: "600",
      color: colors.primaryColor,
      letterSpacing: 1.2,
      StyledTextTransform: "uppercase",
      marginBottom: "6@ms0.3",
    },
    title: {
      fontSize: "21@ms0.3",
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: "5@ms0.3",
      lineHeight: "28@ms0.3",
    },
    subtitle: {
      fontSize: "13@ms0.3",
      color: colors.textSecondary,
      lineHeight: "19@ms0.3",
      marginBottom: "20@ms0.3",
    },
 
    // ── Preferences: section labels ────────────────────────
    prefSectionLabel: {
      fontSize: "11@ms0.3",
      fontWeight: "600",
      color: colors.textSecondary,
      letterSpacing: 0.8,
      StyledTextTransform: "uppercase",
      marginBottom: "10@ms0.3",
    },
 
    // ── Language pills ─────────────────────────────────────
    langRow: {
      flexDirection: "row",
      gap: "10@ms0.3",
    },
    langPill: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: "6@ms0.3",
      paddingVertical: "13@ms0.3",
      borderRadius: "10@ms0.3",
      borderWidth: 1.5,
      borderColor: colors.cardBorderColor,
      backgroundColor: colors.background,
    },
    langPillActive: {
      borderColor: colors.primaryColor,
      backgroundColor: colors.setupBizChipBg,
    },
    langPillFlag: {
      fontSize: "16@ms0.3",
    },
    langPillStyledText: {
      fontSize: "14@ms0.3",
      fontWeight: "500",
      color: colors.textPrimary,
    },
    langPillStyledTextActive: {
      color: colors.primaryColor,
      fontWeight: "700",
    },
    langCheckmark: {
      fontSize: "12@ms0.3",
      color: colors.primaryColor,
      fontWeight: "700",
    },
 
    // ── Theme cards ────────────────────────────────────────
    themeRow: {
      flexDirection: "row",
      gap: "10@ms0.3",
    },
    themeCard: {
      flex: 1,
      borderRadius: "12@ms0.3",
      borderWidth: 1.5,
      borderColor: colors.cardBorderColor,
      overflow: "hidden",
    },
    themeCardActive: {
      borderColor: colors.primaryColor,
    },
    themeCardLight: {
      backgroundColor: "#F5F7FF",
    },
    themeCardDark: {
      backgroundColor: "#1E1B4B", // darkColors.primaryCard
    },
 
    // Mini screen preview
    themePreviewLight: {
      height: "58@ms0.3",
      backgroundColor: "#FFFFFF",
      padding: "8@ms0.3",
      gap: "6@ms0.3",
    },
    themePreviewDark: {
      height: "58@ms0.3",
      backgroundColor: "#0F0E1A",
      padding: "8@ms0.3",
      gap: "6@ms0.3",
    },
    themePreviewIndigoBar: {
      height: "8@ms0.3",
      borderRadius: "4@ms0.3",
      backgroundColor: colors.primaryColor, // tracks theme — light: #4F46E5, dark: #818CF8
      width: "50%",
    },
    themePreviewLightLine: {
      height: "5@ms0.3",
      borderRadius: "3@ms0.3",
      backgroundColor: "#E0E3F5",
      width: "80%",
    },
    themePreviewDarkLine: {
      height: "5@ms0.3",
      borderRadius: "3@ms0.3",
      backgroundColor: "#312E81",
      width: "80%",
    },
 
    themeCardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: "10@ms0.3",
      paddingVertical: "8@ms0.3",
    },
    themeCardLabelLight: {
      fontSize: "12@ms0.3",
      fontWeight: "600",
      color: "#1E1B4B", // lightColors.StyledTextPrimary
    },
    themeCardLabelDark: {
      fontSize: "12@ms0.3",
      fontWeight: "600",
      color: "#A5B4FC",
    },
    themeActiveDot: {
      width: "17@ms0.3",
      height: "17@ms0.3",
      borderRadius: "9@ms0.3",
      backgroundColor: colors.primaryColor,
      alignItems: "center",
      justifyContent: "center",
    },
    themeActiveDotStyledText: {
      fontSize: "9@ms0.3",
      color: "#FFFFFF",
      fontWeight: "700",
    },
 
    // ── Primary button ─────────────────────────────────────
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryColor,
      borderRadius: "12@ms0.3",
      paddingVertical: "15@ms0.3",
      gap: "8@ms0.3",
      marginTop: "24@ms0.3",
    },
    primaryBtnStyledText: {
      fontSize: "15@ms0.3",
      fontWeight: "700",
      color: "#FFFFFF",
    },
    primaryBtnArrow: {
      fontSize: "15@ms0.3",
      fontWeight: "700",
      color: "#FFFFFF",
    },
 
    // ── Hint footer ────────────────────────────────────────
    hint: {
      fontSize: "12@ms0.3",
      color: colors.textThird,
      StyledTextAlign: "center",
      lineHeight: "18@ms0.3",
      paddingHorizontal: "8@ms0.3",
    },
  });
 