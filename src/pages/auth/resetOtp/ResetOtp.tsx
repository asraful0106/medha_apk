// @/src/pages/auth/forgotPassword/ResetOtp.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import AuthScreenWrapper from "../components/AuthScreenWrapper";
import OtpInput from "../components/OtpInput";
import AuthButton from "../components/AuthButton";
import ResendTimer from "../components/ResendTimer";

export default function ResetOtp() {
  const { colors } = useTheme();
  const { flowEmail, verifyResetCode, requestPasswordReset, isLoading } =
    useAuthStore();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError(undefined);

    try {
      await verifyResetCode(otp);
      router.push("/(auth)/new-password");
    } catch (err: any) {
      setOtpError(err.message || "Invalid or expired code");
      setOtp("");
    }
  };

  const handleResend = async () => {
    await requestPasswordReset(flowEmail);
  };

  const maskedEmail = flowEmail
    ? flowEmail.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c,
      )
    : "your email";

  return (
    <AuthScreenWrapper
      title="Enter the\nreset code 🔐"
      subtitle={`We sent a 6-digit code to\n${maskedEmail}`}
      showBack
      onBack={() => router.replace("/(auth)/forgot-password")}
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
        title="Verify Code"
        onPress={handleVerify}
        loading={isLoading}
        disabled={otp.length !== 6}
        style={{ marginTop: verticalScale(24) }}
      />

      <ResendTimer onResend={handleResend} />
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
});
