// @/src/components/LoadingOverlay.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Modal,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { StyledText } from "@/src/components/StyledText";

// ─── Singleton controller ─────────────────────────────────────────────────────

type VoidFn = () => void;
let _show: VoidFn | null = null;
let _hide: VoidFn | null = null;

export const LoadingOverlay = {
  show() {
    _show?.();
  },
  hide() {
    _hide?.();
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeartbeatConfig {
  /** Pulse + ripple color. Default: "#6366F1" */
  color?: string;
  /**
   * What to render inside the dot — pick ONE:
   *   letter : single character e.g. "M"
   *   icon   : any React element e.g. <Ionicons name="heart" size={16} color="#fff" />
   *   image  : local require() or { uri } e.g. require("@/assets/logo.png")
   */
  letter?: string;
  icon?: React.ReactElement;
  image?: ImageSourcePropType;
  /** Beats per minute. Default: 60 */
  bpm?: number;
  /** Dot diameter in dp. Default: moderateScale(36) */
  size?: number;
}

interface LoadingOverlayProps extends HeartbeatConfig {
  /** Bind directly to a store's isLoading */
  visible?: boolean;
  /** true = dark scrim + card. false = fully transparent. Default: true */
  backdrop?: boolean;

  /** true =  card. false = no card. Default: true */
  card?: boolean;
}

// ─── Provider (imperative API) ────────────────────────────────────────────────

export function LoadingOverlayProvider({
  children,
  ...heartbeatProps
}: { children: React.ReactNode } & HeartbeatConfig) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    _show = () => setActive(true);
    _hide = () => setActive(false);
    return () => {
      _show = null;
      _hide = null;
    };
  }, []);

  return (
    <>
      {children}
      {active && <SpinnerModal backdrop {...heartbeatProps} />}
    </>
  );
}

// ─── Controlled (prop-driven) ─────────────────────────────────────────────────

export function LoadingScreen({
  visible = false,
  backdrop = true,
  ...rest
}: LoadingOverlayProps) {
  if (!visible) return null;
  return <SpinnerModal backdrop={backdrop} {...rest} />;
}

// ─── Core modal ───────────────────────────────────────────────────────────────

function SpinnerModal({
  backdrop = true,
  card = true,
  color = "#6366F1",
  letter,
  icon,
  image,
  bpm = 60,
  size,
}: LoadingOverlayProps) {
  const dotSize = size ?? moderateScale(36);
  const beatMs = Math.round(60000 / bpm);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.52)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.22,
            duration: beatMs * 0.18,
            easing: Easing.out(Easing.back(3)),
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 1.7,
            duration: beatMs * 0.32,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: beatMs * 0.32,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: beatMs * 0.18,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0.22,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(beatMs * 0.64),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [bpm]);

  const heartbeat = (
    <Heartbeat
      dotSize={dotSize}
      color={color}
      letter={letter}
      icon={icon}
      image={image}
      scaleAnim={scaleAnim}
      rippleAnim={rippleAnim}
      rippleOpacity={rippleOpacity}
    />
  );

  return (
    <Modal visible transparent statusBarTranslucent animationType="none">
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
            backgroundColor: backdrop ? "rgba(0,0,0,0.45)" : "transparent",
          },
        ]}
      >
        {backdrop ? <View style={card ? styles.card : {}}>{heartbeat}</View> : heartbeat}
      </Animated.View>
    </Modal>
  );
}

// ─── Heartbeat visual ─────────────────────────────────────────────────────────

interface HeartbeatVisualProps {
  dotSize: number;
  color: string;
  letter?: string;
  icon?: React.ReactElement;
  image?: ImageSourcePropType;
  scaleAnim: Animated.Value;
  rippleAnim: Animated.Value;
  rippleOpacity: Animated.Value;
}

function Heartbeat({
  dotSize,
  color,
  letter,
  icon,
  image,
  scaleAnim,
  rippleAnim,
  rippleOpacity,
}: HeartbeatVisualProps) {
  const rippleSize = dotSize * 1.7;
  const imageSize = Math.round(dotSize * 0.58);
  const letterSize = Math.round(dotSize * 0.42);

  // Resolve what to render inside the dot — image wins over icon wins over letter
  const inner = image ? (
    <Image
      source={image}
      style={{
        width: imageSize,
        height: imageSize,
        borderRadius: imageSize / 2,
        resizeMode: "cover",
      }}
    />
  ) : icon ? (
    icon
  ) : letter ? (
    <StyledText style={[styles.letter, { fontSize: letterSize }]}>
      {letter.charAt(0).toUpperCase()}
    </StyledText>
  ) : null;

  return (
    <View
      style={{
        width: rippleSize,
        height: rippleSize,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ripple */}
      <Animated.View
        style={[
          styles.absolute,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            opacity: rippleOpacity,
            transform: [{ scale: rippleAnim }],
          },
        ]}
      />

      {/* Dot */}
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {inner}
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_SIZE = moderateScale(112);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: moderateScale(22),
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
  },
  absolute: {
    position: "absolute",
  },
  dot: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    color: "#ffffff",
    fontWeight: "600",
    includeFontPadding: false,
  },
});
/*

// Letter
<LoadingScreen visible={isLoading} letter="M" color="#0F6E56" />

// Any icon component
<LoadingScreen
  visible={isLoading}
  icon={<Ionicons name="flash" size={moderateScale(16)} color="#fff" />}
  color="#6366F1"
/>

// Local image / logo
<LoadingScreen
  visible={isLoading}
  image={require("@/assets/images/logo.png")}
  color="#D85A30"
/>

// Remote image
<LoadingScreen
  visible={isLoading}
  image={{ uri: "https://example.com/logo.png" }}
  color="#185FA5"
/>

// Transparent backdrop (no scrim, no card)
<LoadingScreen
  visible={isLoading}
  backdrop={false}
  image={require("@/assets/images/logo.png")}
  color="#fff"
/>

// Imperative with defaults set at provider level
// app/_layout.tsx
<LoadingOverlayProvider
  color="#6366F1"
  image={require("@/assets/images/logo.png")}
  bpm={65}
>
  {children}
</LoadingOverlayProvider>

// then anywhere:
LoadingOverlay.show();
await doWork();
LoadingOverlay.hide();
*/
