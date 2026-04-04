// @/src/components/CustomAlert.tsx
//
// Production-grade, fully reusable alert system.
// Supports: info | success | warning | danger | confirm variants.
// Driven by a singleton imperative API so any file can call it
// without prop-drilling, just like the native Alert.alert().
//
// Usage:
//   import { CustomAlert } from "@/src/components/CustomAlert";
//
//   // Simple
//   CustomAlert.show({ title: "Done!", message: "Printer connected.", variant: "success" });
//
//   // With actions
//   CustomAlert.show({
//     title: "Remove Printer",
//     message: "Remove Counter 1 from saved printers?",
//     variant: "danger",
//     actions: [
//       { label: "Cancel", style: "cancel" },
//       { label: "Remove", style: "destructive", onPress: () => doRemove() },
//     ],
//   });

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { StyledText } from "@/src/components/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertVariant =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "confirm";

export interface AlertAction {
  label: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertConfig {
  title: string;
  message?: string;
  variant?: AlertVariant;
  actions?: AlertAction[];
  /** If true, tapping the backdrop dismisses the alert. Default: true for info/success, false for confirm/danger */
  dismissOnBackdrop?: boolean;
}

// ── Singleton controller (imperative API) ─────────────────────────────────────

type ShowFn = (config: AlertConfig) => void;
type HideFn = () => void;

let _show: ShowFn | null = null;
let _hide: HideFn | null = null;

export const CustomAlert = {
  show(config: AlertConfig) {
    _show?.(config);
  },
  hide() {
    _hide?.();
  },
};

// ── Variant config ────────────────────────────────────────────────────────────

const VARIANTS: Record<
  AlertVariant,
  { icon: string; iconColor: string; accentLight: string; accentDark: string }
> = {
  info: {
    icon: "information-circle",
    iconColor: "#3B82F6",
    accentLight: "#EFF6FF",
    accentDark: "#1E3A5F",
  },
  success: {
    icon: "checkmark-circle",
    iconColor: "#16A34A",
    accentLight: "#F0FDF4",
    accentDark: "#052E16",
  },
  warning: {
    icon: "warning",
    iconColor: "#D97706",
    accentLight: "#FFFBEB",
    accentDark: "#2D1B00",
  },
  danger: {
    icon: "alert-circle",
    iconColor: "#DC2626",
    accentLight: "#FEF2F2",
    accentDark: "#3B0E0E",
  },
  confirm: {
    icon: "help-circle",
    iconColor: "#7C3AED",
    accentLight: "#F5F3FF",
    accentDark: "#1E1040",
  },
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function CustomAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors, themeName } = useTheme();
  const isDark = themeName === "dark";

  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [mounted, setMounted] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Register singleton handles
  useEffect(() => {
    _show = (cfg: AlertConfig) => {
      setConfig(cfg);
      setMounted(true);
      setVisible(true);
    };
    _hide = () => animateOut();
    return () => {
      _show = null;
      _hide = null;
    };
  }, []);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animateOut = useCallback((cb?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setVisible(false);
        setMounted(false);
        cb?.();
      }
    });
  }, []);

  const handleAction = useCallback(
    (action?: AlertAction) => {
      animateOut(() => {
        action?.onPress?.();
      });
    },
    [animateOut],
  );

  const handleBackdrop = useCallback(() => {
    if (!config) return;
    const variant = config.variant ?? "info";
    const canDismiss =
      config.dismissOnBackdrop ??
      (variant === "info" || variant === "success" || variant === "warning");
    if (canDismiss) animateOut();
  }, [config, animateOut]);

  if (!mounted || !config) return <>{children}</>;

  const variant = config.variant ?? "info";
  const variantCfg = VARIANTS[variant];
  const accent = isDark ? variantCfg.accentDark : variantCfg.accentLight;

  const actions: AlertAction[] = config.actions ?? [
    { label: "OK", style: "default" },
  ];

  const cancelAction = actions.find((a) => a.style === "cancel");
  const destructiveAction = actions.find((a) => a.style === "destructive");
  const defaultActions = actions.filter(
    (a) => a.style !== "cancel" && a.style !== "destructive",
  );

  const bgCard = colors.primaryCard;
  const textMain = colors.textPrimary;
  const textSub = colors.textSecondary;
  const border = colors.cardBorderColor;

  return (
    <>
      {children}
      <Modal
        visible={mounted}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => animateOut()}
      >
        {/* Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.55)",
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdrop} />
        </Animated.View>

        {/* Card */}
        <View style={styles.centeredView} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: bgCard,
                borderColor: border,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Icon header */}
            <View style={[styles.iconWrap, { backgroundColor: accent }]}>
              <Ionicons
                name={variantCfg.icon as any}
                size={moderateScale(28)}
                color={variantCfg.iconColor}
              />
            </View>

            {/* Text */}
            <StyledText style={[styles.title, { color: textMain }]}>
              {config.title}
            </StyledText>
            {config.message ? (
              <StyledText style={[styles.message, { color: textSub }]}>
                {config.message}
              </StyledText>
            ) : null}

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: border }]} />

            {/* Actions */}
            <View style={styles.actionsWrap}>
              {/* Cancel — full width if alone, else left */}
              {cancelAction && (
                <TouchableOpacity
                  onPress={() => handleAction(cancelAction)}
                  activeOpacity={0.7}
                  style={[
                    styles.btn,
                    styles.btnCancel,
                    { borderColor: border },
                    !destructiveAction &&
                      !defaultActions.length &&
                      styles.btnFull,
                  ]}
                >
                  <StyledText style={[styles.btnText, { color: textSub }]}>
                    {cancelAction.label}
                  </StyledText>
                </TouchableOpacity>
              )}

              {/* Destructive */}
              {destructiveAction && (
                <TouchableOpacity
                  onPress={() => handleAction(destructiveAction)}
                  activeOpacity={0.7}
                  style={[styles.btn, styles.btnDestructive]}
                >
                  <StyledText style={[styles.btnText, { color: "#FFFFFF" }]}>
                    {destructiveAction.label}
                  </StyledText>
                </TouchableOpacity>
              )}

              {/* Default actions */}
              {defaultActions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleAction(action)}
                  activeOpacity={0.75}
                  style={[
                    styles.btn,
                    styles.btnDefault,
                    { backgroundColor: variantCfg.iconColor },
                    defaultActions.length === 1 &&
                      !cancelAction &&
                      !destructiveAction &&
                      styles.btnFull,
                  ]}
                >
                  <StyledText style={[styles.btnText, { color: "#FFFFFF" }]}>
                    {action.label}
                  </StyledText>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_W * 0.88, 360);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(24),
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: moderateScale(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  iconWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: moderateScale(14),
  },
  title: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(6),
  },
  message: {
    fontSize: moderateScale(13, 0.3),
    textAlign: "center",
    paddingHorizontal: moderateScale(20),
    lineHeight: moderateScale(19),
    marginBottom: moderateScale(18),
  },
  divider: {
    height: 1,
    opacity: 0.6,
  },
  actionsWrap: {
    flexDirection: "row",
    minHeight: moderateScale(48),
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScale(13),
    paddingHorizontal: moderateScale(8),
  },
  btnFull: {
    flex: 1,
  },
  btnCancel: {
    borderRightWidth: 0.5,
  },
  btnDestructive: {
    backgroundColor: "#DC2626",
  },
  btnDefault: {
    // backgroundColor set inline
  },
  btnText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "600",
  },
});
