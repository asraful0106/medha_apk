// @/app/_layout.tsx
import { ThemeProvider } from "@/src/hooks/theme/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import {
  LanguageProvider,
  useLanguage,
} from "@/src/hooks/language/LanguageContext";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomAlertProvider } from "@/src/components/CustomAlert";
import { SnackbarProvider } from "@/src/components/Snackbar";
import { soundService } from "@/src/services/soundService";
import SetupAppScreen from "@/src/pages/setupScreen/SetupScreen";
import SplashScreen from "@/src/pages/splashScreen/SplashScreen";
import UnderMaintenanceScreen from "@/src/pages/underMaintenance/UnderMaintenance";

// ─────────────────────────────────────────────────────────────────────────────
// Constant
// ─────────────────────────────────────────────────────────────────────────────
const SETUP_DONE_KEY = "medha_setup_done";

// ─────────────────────────────────────────────────────────────────────────────
// Hook: reads AsyncStorage to decide whether first-time setup is needed.
// ─────────────────────────────────────────────────────────────────────────────
function useSetupRequired() {
  // null = still loading, true = needs setup, false = already done
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);

  const checkSetup = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(SETUP_DONE_KEY);
      setSetupRequired(value === null);
    } catch (err) {
      console.error("[useSetupRequired] AsyncStorage read failed:", err);
      // Default to showing setup on error so the user can configure their preferences
      setSetupRequired(true);
    }
  }, []);

  const markSetupDone = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SETUP_DONE_KEY, "1");
      setSetupRequired(false);
    } catch (err) {
      console.error("[useSetupRequired] AsyncStorage write failed:", err);
    }
  }, []);

  useEffect(() => {
    checkSetup();
  }, [checkSetup]);

  return { setupRequired, markSetupDone };
}

// ─────────────────────────────────────────────────────────────────────────────
// AppShell — rendered once fonts are loaded
// ─────────────────────────────────────────────────────────────────────────────
function AppShell() {
  const { colors, config } = useTheme();
  const { isHydrated } = useLanguage();

  const [fontsLoaded, fontError] = useFonts({
    SansFlex: require("../assets/fonts/SansFlex.ttf"),
    NotoSerifBengali: require("../assets/fonts/NotoSerifBengali.ttf"),
    Noto: require("../assets/fonts/Noto.ttf"),
  });

  // ✅ Minimum splash time (2s)
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Optional: log font errors
  useEffect(() => {
    if (fontError) {
      console.warn("Font loading error:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    soundService.init();
  }, []);

  const isAppReady = Boolean(isHydrated && fontsLoaded && !fontError);

  const [isSplashAnimationFinised, setIsSplashAnimationFinised] =
    useState<boolean>(false);

  const canRenderApp = isAppReady && minTimePassed && isSplashAnimationFinised;

  // ✅ Show custom splash until ready AND 2s elapsed
  if (!canRenderApp) {
    return (
      <>
        <SplashScreen onFinish={() => setIsSplashAnimationFinised(true)} />
        <StatusBar style={config.style} backgroundColor={colors.background} />
      </>
    );
  }

  return <SetupGate colors={colors} config={config} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SetupGate — shows the preferences onboarding screen on first launch,
//             then routes to the main navigator.
// ─────────────────────────────────────────────────────────────────────────────
interface SetupGateProps {
  colors: ReturnType<typeof useTheme>["colors"];
  config: ReturnType<typeof useTheme>["config"];
}

function SetupGate({ colors, config }: SetupGateProps) {
  const { setupRequired, markSetupDone } = useSetupRequired();

  // Still reading AsyncStorage
  if (setupRequired === null) return null;

  // Show preferences onboarding on first launch
  if (setupRequired) {
    return (
      <>
        <SetupAppScreen onComplete={markSetupDone} />
        <StatusBar style={config.style} backgroundColor={colors.background} />
      </>
    );
  }

  // Under Maintainence
  if (false) {
    return (
      <>
        <UnderMaintenanceScreen />
        <StatusBar style={config.style} backgroundColor={colors.background} />
      </>
    );
  }

  // Normal app flow
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="(othersPage)" />
      </Stack>
      <StatusBar style={config.style} backgroundColor={colors.background} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root layout
// ─────────────────────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SnackbarProvider>
          <CustomAlertProvider>
            <AppShell />
          </CustomAlertProvider>
        </SnackbarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
