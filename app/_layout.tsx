// @/app/_layout.tsx
import { ThemeProvider } from "@/src/hooks/theme/ThemeContext";
import {
  Stack,
  router,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { LanguageProvider } from "@/src/hooks/language/LanguageContext";
import { useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import { CustomAlertProvider } from "@/src/components/CustomAlert";
import { SnackbarProvider } from "@/src/components/Snackbar";
import { soundService } from "@/src/services/soundService";

import SetupAppScreen from "@/src/pages/setupScreen/SetupScreen";
import SplashScreen from "@/src/pages/splashScreen/SplashScreen";
import UnderMaintenanceScreen from "@/src/pages/underMaintenance/UnderMaintenance";

import { useAuthStore } from "@/src/store/authStore";
import { useAppReady } from "@/src/hooks/useAppReady";
import { LoadingOverlayProvider } from "@/src/components/LoadingOverlay";

// Constants
const SETUP_DONE_KEY = "medha_setup_done";
const SPLASH_MIN_DURATION_MS = 1800;

function useSetupRequired() {
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);

  const checkSetup = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(SETUP_DONE_KEY);
      setSetupRequired(value === null);
    } catch (err) {
      console.error("[useSetupRequired] Failed:", err);
      setSetupRequired(true);
    }
  }, []);

  const markSetupDone = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SETUP_DONE_KEY, "1");
      setSetupRequired(false);
    } catch (err) {
      console.error("[useSetupRequired] Mark done failed:", err);
      setSetupRequired(false);
    }
  }, []);

  useEffect(() => {
    checkSetup();
  }, [checkSetup]);

  return { setupRequired, markSetupDone };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AppShell
// ─────────────────────────────────────────────────────────────────────────────
function AppShell() {
  const { colors, config } = useTheme();
  const { isReady: isAppReady } = useAppReady();
  const { setupRequired, markSetupDone } = useSetupRequired();

  const [fontsLoaded, fontError] = useFonts({
    SansFlex: require("../assets/fonts/SansFlex.ttf"),
    NotoSerifBengali: require("../assets/fonts/NotoSerifBengali.ttf"),
    Noto: require("../assets/fonts/Noto.ttf"),
  });

  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false);
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setMinSplashTimePassed(true),
      SPLASH_MIN_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, []);

  const phase = (() => {
    if (
      !fontsLoaded ||
      fontError ||
      !isAppReady ||
      !minSplashTimePassed ||
      !splashAnimationDone ||
      setupRequired === null
    ) {
      return "splash";
    }
    if (setupRequired) return "setup";
    if (false) return "maintenance"; // Toggle for maintenance mode
    return "app";
  })();

  const statusBar = (
    <StatusBar style={config.style} backgroundColor={colors.background} />
  );

  if (phase === "splash") {
    return (
      <>
        <SplashScreen onFinish={() => setSplashAnimationDone(true)} />
        {statusBar}
      </>
    );
  }

  if (phase === "setup") {
    return (
      <>
        <SetupAppScreen onComplete={markSetupDone} />
        {statusBar}
      </>
    );
  }

  if (phase === "maintenance") {
    return (
      <>
        <UnderMaintenanceScreen />
        {statusBar}
      </>
    );
  }

  // Final App Phase — Protected Entry Point
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="(othersPage)" />
      </Stack>

      {statusBar}
      <RootAuthGuard />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT LEVEL AUTH GUARD — Most Reliable Way
// ─────────────────────────────────────────────────────────────────────────────
function RootAuthGuard() {
  const { isHydrated, isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Reset decision when auth state changes significantly
  const hasDecided = useRef(false);

  useEffect(() => {
    if (!isHydrated || !rootNavigationState?.key) {
      return;
    }

    const isInAuthGroup = segments[0] === "(auth)";
    const currentScreen = segments[1];

    // ─── Not authenticated ─────────────────────
    if (!isAuthenticated) {
      if (!isInAuthGroup) {
        console.log("🔒 Not authenticated → redirect to login");
        router.replace("/(auth)/login");
        hasDecided.current = true;
      }
      return;
    }

    // ─── Authenticated but email NOT verified ─────
    if (user && !user.isEmailVerified) {
      const shouldBeInVerify =
        isInAuthGroup && currentScreen === "email-verify-otp";

      if (!shouldBeInVerify) {
        console.log("📧 Email not verified → redirect to email-verify-otp");
        router.replace("/(auth)/email-verify-otp");
      }
      return;
    }

    // ─── Fully authenticated (email verified) ─────
    if (isInAuthGroup) {
      console.log("✅ Fully authenticated → redirect to tab");
      router.replace("/(tab)");
    }

    hasDecided.current = true; // Only mark as decided when we're in the correct final state
  }, [
    isHydrated,
    isAuthenticated,
    user?.isEmailVerified,
    segments,
    rootNavigationState?.key,
  ]);

  // Show loader until hydrated
  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SnackbarProvider>
          <LoadingOverlayProvider>
            <CustomAlertProvider>
              <AppShell />
            </CustomAlertProvider>
          </LoadingOverlayProvider>
        </SnackbarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
