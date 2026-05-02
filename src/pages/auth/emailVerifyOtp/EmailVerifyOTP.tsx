// @/src/pages/auth/emailVerify/EmailVerifyOTP.tsx
import React, { useState, useEffect } from "react";
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

  // Request OTP on mount
  useEffect(() => {
    requestEmailOtp().catch(() => {
      // Silently fail — user can resend
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError(undefined);

    try {
      // Step 1: verify OTP → get emailVerifyToken
      await verifyEmailOtp(otp);
      // Step 2: call verify-email to finalize
      await confirmEmailVerified();
      // Success → go to app
      router.replace("/(tab)");
    } catch (err: any) {
      setOtpError(err.message || "Invalid or expired OTP");
      setOtp("");
    }
  };

  const email = user?.email ?? "your email";

  return (
    <AuthScreenWrapper
      title="Verify your\nemail 📬"
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

      <ResendTimer onResend={requestEmailOtp} />

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
 