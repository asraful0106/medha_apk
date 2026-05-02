// @/src/pages/auth/newPassword/NewPassword.tsx
import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, TextInput } from "react-native";
import { router } from "expo-router";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import AuthScreenWrapper from "../components/AuthScreenWrapper";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

interface Errors {
  newPassword?: string;
  confirmPassword?: string;
}

export default function NewPassword() {
  const { colors } = useTheme();
  const { resetPassword, isLoading } = useAuthStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const confirmRef = useRef<TextInput>(null);

  const validate = () => {
    const e: Errors = {};
    if (!passwordRegex.test(newPassword))
      e.newPassword =
        "Min 8 chars with uppercase, lowercase, number & special char";
    if (newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Password strength
  const getStrength = (
    pw: string,
  ): { level: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[@$!%*?&#^]/.test(pw)) score++;

    if (score <= 2) return { level: score, label: "Weak", color: colors.error };
    if (score <= 3)
      return { level: score, label: "Fair", color: colors.warning };
    if (score <= 4)
      return { level: score, label: "Good", color: colors.accent };
    return { level: score, label: "Strong", color: colors.success };
  };

  const strength = newPassword.length > 0 ? getStrength(newPassword) : null;

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await resetPassword(newPassword, confirmPassword);
      Alert.alert(
        "Password Reset",
        "Your password has been updated successfully. Please sign in.",
        [{ text: "Sign In", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <AuthScreenWrapper
      title="Set new\npassword 🔒"
      subtitle="Choose a strong password to protect your account."
      showBack
      onBack={() => router.replace("/(auth)/reset-otp")}
    >
      <AuthInput
        label="New Password"
        placeholder="••••••••"
        value={newPassword}
        onChangeText={(t) => {
          setNewPassword(t);
          if (errors.newPassword)
            setErrors((e) => ({ ...e, newPassword: undefined }));
        }}
        isPassword
        error={errors.newPassword}
        leftIcon={
          <Feather
            name="lock"
            size={moderateScale(16)}
            color={colors.textThird}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        blurOnSubmit={false}
      />

      {/* Strength meter */}
      {strength && (
        <View style={styles.strengthWrapper}>
          <View style={styles.strengthBars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      i <= strength.level ? strength.color : colors.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: strength.color }]}>
            {strength.label}
          </Text>
        </View>
      )}

      <AuthInput
        ref={confirmRef}
        label="Confirm Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={(t) => {
          setConfirmPassword(t);
          if (errors.confirmPassword)
            setErrors((e) => ({ ...e, confirmPassword: undefined }));
        }}
        isPassword
        error={errors.confirmPassword}
        leftIcon={
          <Feather
            name="shield"
            size={moderateScale(16)}
            color={colors.textThird}
          />
        }
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <AuthButton
        title="Reset Password"
        onPress={handleSubmit}
        loading={isLoading}
        style={{ marginTop: verticalScale(8) }}
      />
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  strengthWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: verticalScale(-8),
    marginBottom: verticalScale(12),
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: moderateScale(11),
    fontFamily: "SansFlex",
    fontWeight: "600",
    minWidth: 44,
    textAlign: "right",
  },
});
