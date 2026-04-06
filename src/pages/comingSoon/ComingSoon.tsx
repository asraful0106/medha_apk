// @/src/pages/comingSoon/ComingSoon.tsx
import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Platform, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  useAnimatedProps,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { moderateScale, ScaledSheet } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { StyledText } from "@/src/components/StyledText";

const { width: SCREEN_W } = Dimensions.get("window");

interface Props {
  featureName?: string;
  expectedDate?: string;
  onNotify?: () => void;
  onBack?: () => void;
}

export default function ComingSoonScreen({
  featureName,
  expectedDate,
  onNotify,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // ─── Shared values ───────────────────────────────────────────────────────────
  // Ambient orbs
  const orb1Scale = useSharedValue(1);
  const orb1Opacity = useSharedValue(0.12);
  const orb2Scale = useSharedValue(1);
  const orb2Opacity = useSharedValue(0.08);

  // Ring pulse around lottie
  const ringScale = useSharedValue(0.85);
  const ringOpacity = useSharedValue(0);

  // Entrance
  const badgeOpacity = useSharedValue(0);
  const badgeY = useSharedValue(-10);
  const lottieScale = useSharedValue(0.78);
  const lottieOp = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const subOpacity = useSharedValue(0);
  const subY = useSharedValue(16);
  const pillOpacity = useSharedValue(0);
  const pillY = useSharedValue(12);
  const btnOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.86);
  const backOpacity = useSharedValue(0);

  // Floating lottie wrapper
  const floatY = useSharedValue(0);

  // Dots
  const dot0 = useSharedValue(0.55);
  const dot1 = useSharedValue(0.55);
  const dot2 = useSharedValue(0.55);

  // Button press
  const btnPressScale = useSharedValue(1);

  useEffect(() => {
    // Orb 1 breathing
    orb1Scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    orb1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.18, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.08, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Orb 2 breathing (offset phase)
    orb2Scale.value = withDelay(
      1700,
      withRepeat(
        withSequence(
          withTiming(1.22, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    orb2Opacity.value = withDelay(
      1700,
      withRepeat(
        withSequence(
          withTiming(0.13, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.05, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );

    // Expanding ring
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2600, easing: Easing.out(Easing.quad) }),
        withTiming(0.85, { duration: 0 }),
      ),
      -1,
      false,
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.22, { duration: 200 }),
        withTiming(0, { duration: 2400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    // Floating lottie
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Bouncing dots
    [dot0, dot1, dot2].forEach((v, i) => {
      v.value = withDelay(
        i * 220,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.4, {
              duration: 700,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      );
    });

    // Entrance cascade
    const ease = Easing.out(Easing.cubic);

    // Badge
    badgeOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: ease }),
    );
    badgeY.value = withDelay(
      200,
      withTiming(0, { duration: 500, easing: ease }),
    );

    // Lottie
    lottieOp.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: ease }),
    );
    lottieScale.value = withDelay(
      300,
      withSpring(1, { damping: 13, stiffness: 140 }),
    );

    // Title
    titleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 520, easing: ease }),
    );
    titleY.value = withDelay(
      600,
      withTiming(0, { duration: 520, easing: ease }),
    );

    // Subtitle
    subOpacity.value = withDelay(
      780,
      withTiming(1, { duration: 500, easing: ease }),
    );
    subY.value = withDelay(780, withTiming(0, { duration: 500, easing: ease }));

    // Pill / ETA
    pillOpacity.value = withDelay(
      960,
      withTiming(1, { duration: 480, easing: ease }),
    );
    pillY.value = withDelay(
      960,
      withTiming(0, { duration: 480, easing: ease }),
    );

    // Button
    btnOpacity.value = withDelay(
      1140,
      withTiming(1, { duration: 480, easing: ease }),
    );
    btnScale.value = withDelay(
      1140,
      withSpring(1, { damping: 14, stiffness: 160 }),
    );

    // Back link
    backOpacity.value = withDelay(
      1360,
      withTiming(1, { duration: 420, easing: ease }),
    );
  }, []);

  // ─── Animated styles ─────────────────────────────────────────────────────────
  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb1Scale.value }],
    opacity: orb1Opacity.value,
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb2Scale.value }],
    opacity: orb2Opacity.value,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }));
  const lottieWrapStyle = useAnimatedStyle(() => ({
    opacity: lottieOp.value,
    transform: [{ scale: lottieScale.value }, { translateY: floatY.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subY.value }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateY: pillY.value }],
  }));
  const btnContainerStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ scale: btnScale.value }],
  }));
  const btnPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnPressScale.value }],
  }));
  const backStyle = useAnimatedStyle(() => ({ opacity: backOpacity.value }));

  const dot0Style = useAnimatedStyle(() => ({ opacity: dot0.value }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dotStyles = [dot0Style, dot1Style, dot2Style];

  const handlePressIn = () => {
    btnPressScale.value = withSpring(0.95, { damping: 18, stiffness: 260 });
  };
  const handlePressOut = () => {
    btnPressScale.value = withSpring(1, { damping: 18, stiffness: 260 });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Ambient orbs ─────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.orb1,
          orb1Style,
          { backgroundColor: colors.primaryColor },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.orb2,
          orb2Style,
          { backgroundColor: colors.secondaryColor },
        ]}
        pointerEvents="none"
      />

      {/* ── Subtle grid overlay ───────────────────────────────────────────── */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridLine,
              { borderColor: colors.border, opacity: 0.35 },
            ]}
          />
        ))}
      </View>

      {/* ── Badge ─────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.badge,
          badgeStyle,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.cardBorderColor,
          },
        ]}
      >
        <View
          style={[styles.badgePulse, { backgroundColor: colors.primaryColor }]}
        />
        <View
          style={[styles.badgeDot, { backgroundColor: colors.primaryColor }]}
        />
        <StyledText style={[styles.badgeText, { color: colors.primaryColor }]}>
          {t("comingSoon.badge")}
        </StyledText>
      </Animated.View>

      {/* ── Lottie with ring ──────────────────────────────────────────────── */}
      <View style={styles.lottieContainer}>
        {/* Expanding ring pulse */}
        <Animated.View
          style={[styles.ring, ringStyle, { borderColor: colors.primaryColor }]}
          pointerEvents="none"
        />
        {/* Soft ring (static) */}
        <View
          style={[
            styles.ringStatic,
            {
              borderColor: colors.cardBorderColor,
              backgroundColor: colors.backgroundSecondary,
            },
          ]}
        />
        <Animated.View style={[styles.lottieWrap, lottieWrapStyle]}>
          <LottieView
            source={require("@/assets/animations/coming_soon.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        </Animated.View>
      </View>

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.titleWrap, titleStyle]}>
        <StyledText style={[styles.title, { color: colors.textPrimary }]}>
          {featureName ?? t("comingSoon.title")}
        </StyledText>
      </Animated.View>

      {/* ── Dot separator ─────────────────────────────────────────────────── */}
      <View style={styles.dotsRow}>
        {dotStyles.map((ds, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, ds, { backgroundColor: colors.primaryColor }]}
          />
        ))}
      </View>

      {/* ── Subtitle ──────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.subtitleWrap, subStyle]}>
        <StyledText style={[styles.subtitle, { color: colors.textThird }]}>
          {t("comingSoon.subtitle")}
        </StyledText>
      </Animated.View>

      {/* ── ETA pill ──────────────────────────────────────────────────────── */}
      {expectedDate && (
        <Animated.View
          style={[
            styles.datePill,
            pillStyle,
            {
              backgroundColor: colors.backgroundThird,
              borderColor: colors.cardBorderColor,
            },
          ]}
        >
          <StyledText style={styles.datePillEmoji}>🗓</StyledText>
          <StyledText style={[styles.dateLabel, { color: colors.textThird }]}>
            {t("comingSoon.eta")}
          </StyledText>
          <StyledText
            style={[styles.dateValue, { color: colors.primaryColor }]}
          >
            {expectedDate}
          </StyledText>
        </Animated.View>
      )}

      {/* ── CTA Button ────────────────────────────────────────────────────── */}
      {/* <Animated.View style={[styles.btnOuter, btnContainerStyle]}>
        <Animated.View style={btnPressStyle}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primaryColor }]}
            onPress={onNotify}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <StyledText style={styles.buttonText}>
              {t("comingSoon.notify")}
            </StyledText>
            <View style={styles.buttonArrow}>
              <StyledText style={styles.buttonArrowText}>→</StyledText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View> */}

      {/* ── Back link ─────────────────────────────────────────────────────── */}
      {onBack && (
        <Animated.View style={backStyle}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.65}
          >
            <StyledText style={[styles.backText, { color: colors.textThird }]}>
              ← {t("common.back")}
            </StyledText>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(24),
  },

  // ── Ambient orbs ───────────────────────────────────────────────────────────
  orb1: {
    position: "absolute",
    top: moderateScale(-80),
    right: moderateScale(-60),
    width: moderateScale(300),
    height: moderateScale(300),
    borderRadius: moderateScale(150),
  },
  orb2: {
    position: "absolute",
    bottom: moderateScale(-60),
    left: moderateScale(-80),
    width: moderateScale(260),
    height: moderateScale(260),
    borderRadius: moderateScale(130),
  },

  // ── Grid ───────────────────────────────────────────────────────────────────
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    pointerEvents: "none",
  },
  gridLine: {
    flex: 1,
    borderRightWidth: 1,
  },

  // ── Badge ──────────────────────────────────────────────────────────────────
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: moderateScale(24),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
    gap: moderateScale(7),
    marginVertical: moderateScale(28),
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  badgePulse: {
    position: "absolute",
    left: moderateScale(11),
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(5),
    opacity: 0.25,
  },
  badgeDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
  },
  badgeText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "700",
    letterSpacing: moderateScale(2.2),
    textTransform: "uppercase",
  },

  // ── Lottie ─────────────────────────────────────────────────────────────────
  lottieContainer: {
    width: moderateScale(220),
    height: moderateScale(220),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(28),
    zIndex: 2,
  },
  ring: {
    position: "absolute",
    width: moderateScale(220),
    height: moderateScale(220),
    borderRadius: moderateScale(110),
    borderWidth: moderateScale(1.5),
  },
  ringStatic: {
    position: "absolute",
    width: moderateScale(188),
    height: moderateScale(188),
    borderRadius: moderateScale(94),
    borderWidth: moderateScale(1),
  },
  lottieWrap: {
    width: moderateScale(164),
    height: moderateScale(164),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  lottie: { width: "100%", height: "100%" },

  // ── Title ──────────────────────────────────────────────────────────────────
  titleWrap: {
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    fontSize: moderateScale(26, 0.3),
    fontWeight: "800",
    letterSpacing: moderateScale(0.4),
    textAlign: "center",
    lineHeight: moderateScale(34),
  },

  // ── Dots ───────────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    gap: moderateScale(6),
    marginTop: moderateScale(14),
    marginBottom: moderateScale(14),
    zIndex: 2,
  },
  dot: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(3),
  },

  // ── Subtitle ───────────────────────────────────────────────────────────────
  subtitleWrap: {
    alignItems: "center",
    zIndex: 2,
    paddingHorizontal: moderateScale(8),
  },
  subtitle: {
    fontSize: moderateScale(13, 0.3),
    textAlign: "center",
    lineHeight: moderateScale(22),
    maxWidth: moderateScale(290),
  },

  // ── ETA pill ───────────────────────────────────────────────────────────────
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginTop: moderateScale(14),
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
    zIndex: 2,
  },
  datePillEmoji: {
    fontSize: moderateScale(12, 0.3),
  },
  dateLabel: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "500",
  },
  dateValue: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
  },

  // ── Button ─────────────────────────────────────────────────────────────────
  btnOuter: {
    marginTop: moderateScale(28),
    zIndex: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(16),
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(36),
    gap: moderateScale(10),
    minWidth: moderateScale(240),
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  buttonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: moderateScale(0.4),
  },
  buttonArrow: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonArrowText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "700",
  },

  // ── Back ───────────────────────────────────────────────────────────────────
  backBtn: {
    marginTop: moderateScale(16),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    zIndex: 2,
  },
  backText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "500",
  },
});
