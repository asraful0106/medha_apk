// @/src/pages/auth/emailVerify/EmailVerifyOTP.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import AuthScreenWrapper from "../components/AuthScreenWrapper";
import OtpInput from "../components/OtpInput";
import AuthButton from "../components/AuthButton";
import ResendTimer from "../components/ResendTimer";

export default function EmailVerifyOTP() {
  const { colors } = useTheme();
  const {
    user,
    requestEmailOtp,
    verifyEmailOtp,
    confirmEmailVerified,
    isLoading,
  } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();

  const hasRequestedOtp = useRef(false);

  // Request OTP only once — better mounting logic
  useEffect(() => {
    if (hasRequestedOtp.current) return;

    hasRequestedOtp.current = true;

    console.log("📧 Requesting email OTP on mount");
    requestEmailOtp().catch((err) => {
      console.warn("Failed to request initial OTP:", err);
      // Don't reset flag on error so user can still use Resend
    });

    // Do NOT reset flag on unmount
    return () => {
      // Only clean up if component is unmounted without success
      // But we keep the flag to prevent duplicate requests during navigation
    };
  }, [requestEmailOtp]);

const handleVerify = async () => {
  if (otp.length !== 6) {
    setOtpError("Please enter the 6-digit code");
    return;
  }
  setOtpError(undefined);

  try {
    await verifyEmailOtp(otp);
    // Check store error after each call
    const storeError = useAuthStore.getState().error;
    if (storeError) {
      setOtpError(storeError.message || "OTP verification failed");
      setOtp("");
      return; // ← don't proceed
    }

    await confirmEmailVerified();
    const storeError2 = useAuthStore.getState().error;
    if (storeError2) {
      setOtpError(storeError2.message || "Email confirmation failed");
      return;
    }

    // Don't navigate here — let RootAuthGuard handle it
    // router.replace("/(tab)");  ← REMOVE THIS
  } catch (err: any) {
    setOtpError(err.message || "Invalid or expired OTP");
    setOtp("");
  }
};

  const email = user?.email ?? "your email";

  return (
    <AuthScreenWrapper
      title={`Verify your\nemail 📬`}
      subtitle={`We sent a 6-digit code to\n${email}`}
      showBack
    >
      <View style={styles.otpSection}>
        <OtpInput value={otp} onChange={setOtp} hasError={!!otpError} />
        {!!otpError && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {otpError}
          </Text>
        )}
      </View>

      <AuthButton
        title="Verify Email"
        onPress={handleVerify}
        loading={isLoading}
        disabled={otp.length !== 6}
        style={{ marginTop: verticalScale(24) }}
      />

      <ResendTimer initialSeconds={180} onResend={requestEmailOtp} />

      <Text style={[styles.hint, { color: colors.textDisabled }]}>
        Check your spam folder if you don't see it.
      </Text>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  otpSection: {
    marginBottom: verticalScale(8),
  },
  errorText: {
    fontSize: moderateScale(12),
    fontFamily: "SansFlex",
    textAlign: "center",
    marginTop: verticalScale(10),
  },
  hint: {
    fontSize: moderateScale(12),
    fontFamily: "SansFlex",
    textAlign: "center",
    marginTop: verticalScale(16),
  },
});
