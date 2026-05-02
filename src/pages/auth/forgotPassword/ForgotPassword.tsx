// @/src/pages/auth/forgotPassword/ForgotPassword.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import AuthScreenWrapper from "../components/AuthScreenWrapper";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { colors } = useTheme();
  const { requestPasswordReset, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  const validate = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await requestPasswordReset(email.trim());
      router.push("/(auth)/reset-otp");
    } catch (err: any) {
      // API always returns success-looking response for security
      // but may throw rate-limit errors
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <AuthScreenWrapper
      title="Forgot your\npassword? 🔑"
      subtitle="Enter your registered email and we'll send a reset code."
      showBack
      onBack={() => router.replace("/(auth)/login")}
    >
      <AuthInput
        label="Email Address"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (emailError) setEmailError(undefined);
        }}
        keyboardType="email-address"
        error={emailError}
        leftIcon={
          <Feather
            name="mail"
            size={moderateScale(16)}
            color={colors.textThird}
          />
        }
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.infoLight, borderColor: colors.info },
        ]}
      >
        <Feather name="info" size={moderateScale(14)} color={colors.info} />
        <Text style={[styles.infoText, { color: colors.infoText }]}>
          For security, we send a code regardless of whether the email is
          registered.
        </Text>
      </View>

      <AuthButton
        title="Send Reset Code"
        onPress={handleSubmit}
        loading={isLoading}
        style={{ marginTop: verticalScale(24) }}
      />

      <AuthButton
        title="Back to Login"
        onPress={() => router.replace("/(auth)/login")}
        variant="ghost"
        style={{ marginTop: verticalScale(12) }}
      />
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: verticalScale(4),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(12),
    fontFamily: "SansFlex",
    lineHeight: moderateScale(18),
  },
});
 