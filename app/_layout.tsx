// @/app/_layout.tsx
import { ThemeProvider } from "@/src/hooks/theme/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { LanguageProvider } from "@/src/hooks/language/LanguageContext";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomAlertProvider } from "@/src/components/CustomAlert";
import { SnackbarProvider } from "@/src/components/Snackbar";
import { soundService } from "@/src/services/soundService";
import SetupAppScreen from "@/src/pages/setupScreen/SetupScreen";
import SplashScreen from "@/src/pages/splashScreen/SplashScreen";

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

  const [fontsLoaded, fontError] = useFonts({
    SansFlex: require("../assets/fonts/SansFlex.ttf"),
    NotoSerifBengali: require("../assets/fonts/NotoSerifBengali.ttf"),
    Noto: require("../assets/fonts/Noto.ttf"),
  });

  useEffect(() => {
    soundService.init();
  }, []);

  const isAppReady = Boolean(fontsLoaded && !fontError);
  if (!isAppReady) return null;

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
  const [ isSplashFinish, setIsSplashFinish ] = useState<boolean>(false);

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

  // Normal app flow
  return (
    <>
      <SplashScreen onFinish={() => setIsSplashFinish(true)}/>
      {/* <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="(othersPage)" />
      </Stack>
      <StatusBar style={config.style} backgroundColor={colors.background} /> */}
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
