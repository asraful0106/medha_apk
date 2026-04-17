// @/src/pages/underMaintenance/UnderMaintenance.tsx
import React, { useEffect } from "react";
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
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { moderateScale, ScaledSheet } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { StyledText } from "@/src/components/StyledText";
import Svg, { Path, Circle } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

interface Props {
  estimatedTime?: string; // e.g. "2 hours" or "Jan 20, 2025"
  onBack?: () => void;
}

// ─── Gear SVG (pure RN View-based, no lottie) ───────────────────────────────
function GearIcon({
  size = 24,
  color = "#000",
  style,
}: {
  size?: number;
  color?: string;
  style?: object;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="12"
        r="3"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

// ─── Wrench SVG ──────────────────────────────────────────────────────────────
function WrenchIcon({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Handle */}
      <View
        style={{
          position: "absolute",
          width: size * 0.18,
          height: size * 0.65,
          backgroundColor: color,
          borderRadius: size * 0.09,
          bottom: size * 0.04,
          transform: [{ rotate: "45deg" }],
        }}
      />
      {/* Head ring */}
      <View
        style={{
          position: "absolute",
          top: size * 0.04,
          left: size * 0.04,
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: size * 0.21,
          borderWidth: size * 0.1,
          borderColor: color,
        }}
      />
    </View>
  );
}

export default function UnderMaintenanceScreen({
  estimatedTime,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // ─── Shared values ──────────────────────────────────────────────────────────
  const orb1Scale = useSharedValue(1);
  const orb1Opacity = useSharedValue(0.1);
  const orb2Scale = useSharedValue(1);
  const orb2Opacity = useSharedValue(0.07);
  const orb3Scale = useSharedValue(1);

  // Gear rotations
  const gear1Rot = useSharedValue(0);
  const gear2Rot = useSharedValue(0);
  const gear3Rot = useSharedValue(0);

  // Wrench swing
  const wrenchRot = useSharedValue(-24);

  // Progress bar
  const progressX = useSharedValue(-SCREEN_W * 0.7);

  // Floating container
  const floatY = useSharedValue(0);

  // Entrance animations
  const badgeOpacity = useSharedValue(0);
  const badgeY = useSharedValue(-12);
  const iconGroupOpacity = useSharedValue(0);
  const iconGroupScale = useSharedValue(0.75);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(22);
  const subOpacity = useSharedValue(0);
  const subY = useSharedValue(16);
  const progressOpacity = useSharedValue(0);
  const progressY = useSharedValue(14);
  const pillOpacity = useSharedValue(0);
  const pillY = useSharedValue(12);
  const backOpacity = useSharedValue(0);

  // Warning strip animation
  const stripX = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    const sin = Easing.inOut(Easing.sin);

    // ── Ambient orbs ──────────────────────────────────────────────────────────
    orb1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3800, easing: sin }),
        withTiming(1.0, { duration: 3800, easing: sin }),
      ),
      -1,
      true,
    );
    orb1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.16, { duration: 3800, easing: sin }),
        withTiming(0.06, { duration: 3800, easing: sin }),
      ),
      -1,
      true,
    );
    orb2Scale.value = withDelay(
      1900,
      withRepeat(
        withSequence(
          withTiming(1.25, { duration: 4400, easing: sin }),
          withTiming(1.0, { duration: 4400, easing: sin }),
        ),
        -1,
        true,
      ),
    );
    orb2Opacity.value = withDelay(
      1900,
      withRepeat(
        withSequence(
          withTiming(0.12, { duration: 4400, easing: sin }),
          withTiming(0.04, { duration: 4400, easing: sin }),
        ),
        -1,
        true,
      ),
    );
    orb3Scale.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 3200, easing: sin }),
          withTiming(1.0, { duration: 3200, easing: sin }),
        ),
        -1,
        true,
      ),
    );

    // ── Gear rotations (large = slow CW, medium = fast CCW, small = CW) ───────
    gear1Rot.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
    gear2Rot.value = withRepeat(
      withTiming(-360, { duration: 5200, easing: Easing.linear }),
      -1,
      false,
    );
    gear3Rot.value = withRepeat(
      withTiming(360, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );

    // ── Wrench swing ──────────────────────────────────────────────────────────
    wrenchRot.value = withRepeat(
      withSequence(
        withTiming(24, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(-24, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    // ── Progress shimmer bar ───────────────────────────────────────────────────
    progressX.value = withRepeat(
      withTiming(SCREEN_W * 0.8, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );

    // ── Float icon group ─────────────────────────────────────────────────────
    floatY.value = withRepeat(
      withSequence(
        withTiming(-9, { duration: 2600, easing: sin }),
        withTiming(0, { duration: 2600, easing: sin }),
      ),
      -1,
      true,
    );

    // ── Warning strip scroll ──────────────────────────────────────────────────
    stripX.value = withRepeat(
      withTiming(-240, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );

    // ── Entrance cascade ─────────────────────────────────────────────────────
    badgeOpacity.value = withDelay(
      180,
      withTiming(1, { duration: 500, easing: ease }),
    );
    badgeY.value = withDelay(
      180,
      withTiming(0, { duration: 500, easing: ease }),
    );

    iconGroupOpacity.value = withDelay(
      340,
      withTiming(1, { duration: 560, easing: ease }),
    );
    iconGroupScale.value = withDelay(
      340,
      withSpring(1, { damping: 14, stiffness: 130 }),
    );

    titleOpacity.value = withDelay(
      620,
      withTiming(1, { duration: 500, easing: ease }),
    );
    titleY.value = withDelay(
      620,
      withTiming(0, { duration: 500, easing: ease }),
    );

    subOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 480, easing: ease }),
    );
    subY.value = withDelay(800, withTiming(0, { duration: 480, easing: ease }));

    progressOpacity.value = withDelay(
      980,
      withTiming(1, { duration: 460, easing: ease }),
    );
    progressY.value = withDelay(
      980,
      withTiming(0, { duration: 460, easing: ease }),
    );

    pillOpacity.value = withDelay(
      1160,
      withTiming(1, { duration: 440, easing: ease }),
    );
    pillY.value = withDelay(
      1160,
      withTiming(0, { duration: 440, easing: ease }),
    );

    backOpacity.value = withDelay(
      1380,
      withTiming(1, { duration: 420, easing: ease }),
    );
  }, []);

  // ─── Animated styles ────────────────────────────────────────────────────────
  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb1Scale.value }],
    opacity: orb1Opacity.value,
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb2Scale.value }],
    opacity: orb2Opacity.value,
  }));
  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb3Scale.value }],
    opacity: 0.06,
  }));

  const gear1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gear1Rot.value}deg` }],
  }));
  const gear2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gear2Rot.value}deg` }],
  }));
  const gear3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gear3Rot.value}deg` }],
  }));
  const wrenchStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wrenchRot.value}deg` }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));
  const progressShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressX.value }],
  }));
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stripX.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }));
  const iconGroupStyle = useAnimatedStyle(() => ({
    opacity: iconGroupOpacity.value,
    transform: [{ scale: iconGroupScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subY.value }],
  }));
  const progressWrapStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
    transform: [{ translateY: progressY.value }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateY: pillY.value }],
  }));
  const backStyle = useAnimatedStyle(() => ({ opacity: backOpacity.value }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Ambient orbs ──────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.orb1,
          orb1Style,
          { backgroundColor: colors.maintenanceOrbA },
        ]}
      />
      <Animated.View
        style={[
          styles.orb2,
          orb2Style,
          { backgroundColor: colors.maintenanceOrbB },
        ]}
      />
      <Animated.View
        style={[
          styles.orb3,
          orb3Style,
          { backgroundColor: colors.maintenanceOrbC },
        ]}
      />

      {/* ── Diagonal warning strip ────────────────────────────────────────────── */}
      <View style={styles.stripContainer} pointerEvents="none">
        <Animated.View style={[styles.stripRow, stripStyle]}>
          {Array.from({ length: 14 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stripBlock,
                {
                  backgroundColor:
                    i % 2 === 0
                      ? colors.maintenanceStripeA
                      : colors.maintenanceStripeB,
                },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      {/* ── Grid overlay ──────────────────────────────────────────────────────── */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[styles.gridLine, { borderColor: colors.border + "22" }]}
          />
        ))}
      </View>

      {/* ── Badge ─────────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.badge,
          badgeStyle,
          {
            backgroundColor: colors.maintenanceBadgeBg,
            borderColor: colors.maintenanceBadgeBorder,
          },
        ]}
      >
        {/* Pulsing dot */}
        <View
          style={[styles.badgeDot, { backgroundColor: colors.maintenanceDot }]}
        />
        <StyledText
          style={[styles.badgeText, { color: colors.maintenanceDot }]}
        >
          {t("maintenance.badge")}
        </StyledText>
      </Animated.View>

      {/* ── Gear + Wrench illustration ────────────────────────────────────────── */}
      <Animated.View style={[styles.iconGroup, iconGroupStyle, floatStyle]}>
        {/* Large gear (back) */}
        <Animated.View style={[styles.gearLarge, gear1Style]}>
          <GearIcon
            size={moderateScale(100)}
            color={colors.maintenanceGearPrimary}
          />
        </Animated.View>

        {/* Medium gear (front right) */}
        <Animated.View style={[styles.gearMedium, gear2Style]}>
          <GearIcon
            size={moderateScale(62)}
            color={colors.maintenanceGearSecondary}
          />
        </Animated.View>

        {/* Small gear (front left) */}
        <Animated.View style={[styles.gearSmall, gear3Style]}>
          <GearIcon
            size={moderateScale(36)}
            color={colors.maintenanceGearTertiary}
          />
        </Animated.View>

        {/* Wrench on top */}
        <Animated.View style={[styles.wrenchWrap, wrenchStyle]}>
          <WrenchIcon
            size={moderateScale(46)}
            color={colors.maintenanceWrench}
          />
        </Animated.View>

        {/* Glow ring */}
        <View
          style={[
            styles.glowRing,
            {
              borderColor: colors.maintenanceDot + "40",
              backgroundColor: colors.maintenanceDot + "0D",
            },
          ]}
        />
      </Animated.View>

      {/* ── Title ─────────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.titleWrap, titleStyle]}>
        <StyledText style={[styles.title, { color: colors.textPrimary }]}>
          {t("maintenance.title")}
        </StyledText>
      </Animated.View>

      {/* ── Subtitle ──────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.subtitleWrap, subStyle]}>
        <StyledText style={[styles.subtitle, { color: colors.textThird }]}>
          {t("maintenance.subtitle")}
        </StyledText>
      </Animated.View>

      {/* ── Progress bar ──────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.progressOuter, progressWrapStyle]}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.progressBarTrack },
          ]}
        >
          {/* Static fill ~55% */}
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.maintenanceDot, width: "55%" },
            ]}
          />
          {/* Shimmer */}
          <Animated.View
            style={[styles.progressShimmer, progressShimmerStyle]}
          />
        </View>
        <View style={styles.progressLabels}>
          <StyledText
            style={[styles.progressLabel, { color: colors.textThird }]}
          >
            {t("maintenance.progressLabel")}
          </StyledText>
          <StyledText
            style={[styles.progressPct, { color: colors.maintenanceDot }]}
          >
            55%
          </StyledText>
        </View>
      </Animated.View>

      {/* ── ETA Pill ──────────────────────────────────────────────────────────── */}
      {estimatedTime && (
        <Animated.View
          style={[
            styles.etaPill,
            pillStyle,
            {
              backgroundColor: colors.backgroundThird,
              borderColor: colors.cardBorderColor,
            },
          ]}
        >
          <StyledText style={styles.etaEmoji}>⏱</StyledText>
          <StyledText style={[styles.etaLabel, { color: colors.textThird }]}>
            {t("maintenance.eta")}
          </StyledText>
          <StyledText
            style={[styles.etaValue, { color: colors.maintenanceDot }]}
          >
            {estimatedTime}
          </StyledText>
        </Animated.View>
      )}

      {/* ── Back link ─────────────────────────────────────────────────────────── */}
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

  // ── Ambient orbs ─────────────────────────────────────────────────────────────
  orb1: {
    position: "absolute",
    top: moderateScale(-100),
    right: moderateScale(-70),
    width: moderateScale(340),
    height: moderateScale(340),
    borderRadius: moderateScale(170),
  },
  orb2: {
    position: "absolute",
    bottom: moderateScale(-80),
    left: moderateScale(-90),
    width: moderateScale(300),
    height: moderateScale(300),
    borderRadius: moderateScale(150),
  },
  orb3: {
    position: "absolute",
    top: "45%",
    right: moderateScale(-60),
    width: moderateScale(180),
    height: moderateScale(180),
    borderRadius: moderateScale(90),
  },

  // ── Warning stripe ───────────────────────────────────────────────────────────
  stripContainer: {
    position: "absolute",
    top: moderateScale(56),
    left: 0,
    right: 0,
    height: moderateScale(14),
    overflow: "hidden",
    opacity: 0.28,
    transform: [{ skewX: "-12deg" }],
  },
  stripRow: {
    flexDirection: "row",
    width: moderateScale(800),
  },
  stripBlock: {
    width: moderateScale(34),
    height: moderateScale(14),
  },

  // ── Grid overlay ─────────────────────────────────────────────────────────────
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  gridLine: {
    flex: 1,
    borderRightWidth: 1,
  },

  // ── Badge ────────────────────────────────────────────────────────────────────
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: moderateScale(24),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
    gap: moderateScale(7),
    marginBottom: moderateScale(28),
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
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

  // ── Icon group ───────────────────────────────────────────────────────────────
  iconGroup: {
    width: moderateScale(180),
    height: moderateScale(180),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(32),
    zIndex: 2,
  },
  glowRing: {
    position: "absolute",
    width: moderateScale(180),
    height: moderateScale(180),
    borderRadius: moderateScale(90),
    borderWidth: moderateScale(1.5),
  },
  gearLarge: {
    position: "absolute",
    top: moderateScale(28),
    left: moderateScale(22),
  },
  gearMedium: {
    position: "absolute",
    bottom: moderateScale(14),
    right: moderateScale(16),
  },
  gearSmall: {
    position: "absolute",
    top: moderateScale(18),
    right: moderateScale(22),
  },
  wrenchWrap: {
    position: "absolute",
    top: moderateScale(8),
    left: moderateScale(10),
  },

  // ── Title ────────────────────────────────────────────────────────────────────
  titleWrap: {
    alignItems: "center",
    zIndex: 2,
    marginBottom: moderateScale(10),
  },
  title: {
    fontSize: moderateScale(26, 0.3),
    fontWeight: "800",
    letterSpacing: moderateScale(0.3),
    textAlign: "center",
    lineHeight: moderateScale(34),
  },

  // ── Subtitle ─────────────────────────────────────────────────────────────────
  subtitleWrap: {
    alignItems: "center",
    zIndex: 2,
    paddingHorizontal: moderateScale(8),
    marginBottom: moderateScale(24),
  },
  subtitle: {
    fontSize: moderateScale(13, 0.3),
    textAlign: "center",
    lineHeight: moderateScale(22),
    maxWidth: moderateScale(290),
  },

  // ── Progress bar ─────────────────────────────────────────────────────────────
  progressOuter: {
    width: "100%",
    maxWidth: moderateScale(300),
    zIndex: 2,
    marginBottom: moderateScale(16),
  },
  progressTrack: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: moderateScale(4),
  },
  progressShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: moderateScale(60),
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: moderateScale(4),
    left: -moderateScale(60),
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: moderateScale(6),
  },
  progressLabel: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "500",
  },
  progressPct: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "700",
  },

  // ── ETA Pill ──────────────────────────────────────────────────────────────────
  etaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginTop: moderateScale(6),
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(7),
    zIndex: 2,
  },
  etaEmoji: { fontSize: moderateScale(12, 0.3) },
  etaLabel: { fontSize: moderateScale(11, 0.3), fontWeight: "500" },
  etaValue: { fontSize: moderateScale(11, 0.3), fontWeight: "700" },

  // ── Back link ─────────────────────────────────────────────────────────────────
  backBtn: {
    marginTop: moderateScale(28),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    zIndex: 2,
  },
  backText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "500",
  },
});
