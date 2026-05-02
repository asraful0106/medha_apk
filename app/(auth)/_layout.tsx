// app/(auth)/_layout.tsx
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";

/**
 * Auth layout — wraps all unauthenticated screens.
 * If a user is already authenticated and email-verified,
 * redirect them away to the main app.
 */
export default function AuthLayout() {
  const { isAuthenticated, isEmailVerified } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isEmailVerified) {
      router.replace("/(tab)");
    }
  }, [isAuthenticated, isEmailVerified]);

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="email-verify-otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-otp" />
      <Stack.Screen name="new-password" />
    </Stack>
  );
}
