// @/src/pages/auth/components/AuthScreenWrapper.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Feather } from "@expo/vector-icons";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

interface AuthScreenWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AuthScreenWrapper({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
}: AuthScreenWrapperProps) {
  const { colors, config } = useTheme();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    // <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
    //   <StatusBar
    //     barStyle={config.style === "dark" ? "light-content" : "dark-content"}
    //     backgroundColor={colors.background}
    //   />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={verticalScale(20)}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={[
                styles.backBtn,
                { backgroundColor: colors.backgroundThird },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name="arrow-left"
                size={moderateScale(18)}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}

          {/* Brand */}
          <View style={styles.brand}>
            <View
              style={[
                styles.brandDot,
                { backgroundColor: colors.primaryColor },
              ]}
            />
            <Text style={[styles.brandText, { color: colors.primaryColor }]}>
              {t("app.MEDHA")}
            </Text>
          </View>
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textThird }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </KeyboardAwareScrollView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(32),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  backBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  brandDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  brandText: {
    fontSize: moderateScale(16),
    fontFamily: "SansFlex",
    fontWeight: "700",
    letterSpacing: 2,
  },
  titleBlock: {
    marginBottom: verticalScale(32),
  },
  title: {
    fontSize: moderateScale(28),
    fontFamily: "SansFlex",
    fontWeight: "700",
    lineHeight: moderateScale(34),
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: "SansFlex",
    lineHeight: moderateScale(20),
  },
  content: {
    flex: 1,
  },
});
