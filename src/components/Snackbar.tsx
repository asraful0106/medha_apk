// @/src/components/Snackbar.tsx
//
// Modern, highly reusable Snackbar.
// Supports: default | success | error | warning | info variants.
// Driven by both props API (existing) AND an imperative singleton API.
//
// Imperative usage (recommended — no prop drilling):
//   import { SnackbarService } from "@/src/components/Snackbar";
//   SnackbarService.show({ message: "Printer connected!", variant: "success" });
//   SnackbarService.show({ message: "Failed to print.", variant: "error" });
//
// Props usage (backward-compatible with existing usage):
//   <Snackbar visible={visible} message="Text copied!" onDismiss={...} />

import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { StyledText } from "./StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

// ── Variant config ────────────────────────────────────────────────────────────

export type SnackbarVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info";

const VARIANT_STYLES: Record<
  SnackbarVariant,
  {
    bg: string;
    text: string;
    icon: string;
    iconColor: string;
    actionColor: string;
  }
> = {
  default: {
    bg: "#111827",
    text: "#F9FAFB",
    icon: "chatbubble-ellipses-outline",
    iconColor: "#9CA3AF",
    actionColor: "#E5E7EB",
  },
  success: {
    bg: "#14532D",
    text: "#F0FDF4",
    icon: "checkmark-circle",
    iconColor: "#4ADE80",
    actionColor: "#86EFAC",
  },
  error: {
    bg: "#450A0A",
    text: "#FEF2F2",
    icon: "alert-circle",
    iconColor: "#F87171",
    actionColor: "#FCA5A5",
  },
  warning: {
    bg: "#431407",
    text: "#FFFBEB",
    icon: "warning",
    iconColor: "#FBBF24",
    actionColor: "#FDE68A",
  },
  info: {
    bg: "#0C1A2E",
    text: "#EFF6FF",
    icon: "information-circle",
    iconColor: "#60A5FA",
    actionColor: "#93C5FD",
  },
};

// ── Imperative singleton API ──────────────────────────────────────────────────

export interface SnackbarOptions {
  message: string;
  variant?: SnackbarVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  bottomOffset?: number;
}

type TriggerFn = (opts: SnackbarOptions) => void;
let _trigger: TriggerFn | null = null;

export const SnackbarService = {
  show(opts: SnackbarOptions) {
    _trigger?.(opts);
  },
};

// ── Provider (mount once near your app root, above CustomAlertProvider) ───────
//
// The snackbar is rendered as an absolutely-positioned view that is a direct
// child of the provider's fragment — NOT inside a Modal. This means it never
// captures touches that fall outside the snackbar pill itself, so scrolling,
// tapping buttons, and navigating all work normally while a snackbar is shown.

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<SnackbarOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const queueRef = useRef<SnackbarOptions[]>([]);
  const showingRef = useRef(false);

  const showNext = (nextOpts: SnackbarOptions) => {
    showingRef.current = true;
    setOpts(nextOpts);
    setVisible(true);
  };

  useEffect(() => {
    _trigger = (newOpts: SnackbarOptions) => {
      if (showingRef.current) {
        queueRef.current.push(newOpts);
        setVisible(false);
      } else {
        showNext(newOpts);
      }
    };
    return () => {
      _trigger = null;
    };
  }, []);

  const handleDismiss = () => {
    showingRef.current = false;
    setVisible(false);
    setOpts(null);
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setTimeout(() => showNext(next), 120);
    }
  };

  return (
    // The outer View must be a positioned container so the absolutely-placed
    // snackbar overlay can measure against the full screen, not just the
    // provider's layout box.
    <View style={providerStyles.root}>
      {children}
      {opts && (
        <SnackbarCore
          visible={visible}
          message={opts.message}
          variant={opts.variant ?? "default"}
          duration={opts.duration ?? 2800}
          actionLabel={opts.actionLabel}
          onAction={opts.onAction}
          bottomOffset={opts.bottomOffset ?? 24}
          onDismiss={handleDismiss}
        />
      )}
    </View>
  );
}

const providerStyles = StyleSheet.create({
  // flex:1 + overflow:hidden keeps the snackbar clipped to the screen.
  // pointerEvents is not set here — we want children to receive all touches.
  root: {
    flex: 1,
  },
});

// ── Core animated component ───────────────────────────────────────────────────
//
// Rendered as a plain absolute-positioned view — no Modal. The outer wrapper
// uses pointerEvents="box-none" so only the snackbar pill itself is touchable;
// everything behind it (scrolls, buttons, navigation) works normally.

interface SnackbarCoreProps {
  visible: boolean;
  message: string;
  variant: SnackbarVariant;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
  bottomOffset: number;
  onDismiss: () => void;
}

function SnackbarCore({
  visible,
  message,
  variant,
  duration,
  actionLabel,
  onAction,
  bottomOffset,
  onDismiss,
}: SnackbarCoreProps) {
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissingRef = useRef(false);

  const vs = VARIANT_STYLES[variant];

  const animateIn = () => {
    dismissingRef.current = false;
    translateY.setValue(60);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (cb?: () => void) => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 60,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) cb?.();
    });
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (visible) {
      setMounted(true);
      animateIn();
      timerRef.current = setTimeout(() => {
        animateOut(() => {
          setMounted(false);
          onDismiss();
        });
      }, duration);
    } else if (mounted) {
      animateOut(() => setMounted(false));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  const effectiveOnAction =
    onAction ??
    (() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      animateOut(() => {
        setMounted(false);
        onDismiss();
      });
    });

  return (
    // box-none: this View itself is NOT touchable, but its children ARE.
    // Everything behind the snackbar — scrolls, taps, gestures — passes
    // straight through the transparent area around the pill.
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { bottom: 0 }]}
    >
      <View
        pointerEvents="box-none"
        style={[coreStyles.container, { bottom: bottomOffset }]}
      >
        <Animated.View
          style={[
            coreStyles.snackbar,
            { backgroundColor: vs.bg, opacity, transform: [{ translateY }] },
          ]}
        >
          {/* Left icon */}
          <Ionicons
            name={vs.icon as any}
            size={moderateScale(16)}
            color={vs.iconColor}
            style={{ marginRight: moderateScale(8), flexShrink: 0 }}
          />

          {/* Message */}
          <StyledText
            style={[coreStyles.message, { color: vs.text }]}
            numberOfLines={2}
          >
            {message}
          </StyledText>

          {/* Dismiss / action button */}
          <Pressable
            onPress={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              animateOut(() => {
                setMounted(false);
                onAction?.();
                onDismiss();
              });
            }}
            hitSlop={12}
            style={{ marginLeft: moderateScale(8) }}
          >
            <StyledText
              style={[coreStyles.actionText, { color: vs.actionColor }]}
            >
              {actionLabel ?? "✕"}
            </StyledText>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ── Legacy props-driven component (backward-compatible) ───────────────────────

interface SnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  backgroundColor?: string;
  textColor?: string;
  actionColor?: string;
  actionLabel?: string;
  bottomOffset?: number;
  variant?: SnackbarVariant;
}

const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  onDismiss,
  duration = 2500,
  backgroundColor,
  textColor,
  actionColor,
  actionLabel = "✕",
  bottomOffset = 24,
  variant = "default",
}) => {
  const vs = VARIANT_STYLES[variant];
  return (
    <SnackbarCore
      visible={visible}
      message={message}
      variant={variant}
      duration={duration}
      actionLabel={actionLabel}
      bottomOffset={bottomOffset}
      onDismiss={onDismiss}
    />
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const coreStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: moderateScale(16),
    right: moderateScale(16),
    alignItems: "center",
  },
  snackbar: {
    width: "100%",
    maxWidth: 480,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(11),
    flexDirection: "row",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  message: {
    flex: 1,
    fontSize: moderateScale(12, 0.3),
    lineHeight: moderateScale(17),
  },
  actionText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "700",
  },
});

export default Snackbar;
