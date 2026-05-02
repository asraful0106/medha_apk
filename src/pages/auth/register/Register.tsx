// @/src/pages/auth/register/Register.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import AuthScreenWrapper from "../components/AuthScreenWrapper";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

// ─── Validators ────────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;
// At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Register() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const setField = (key: keyof FormState) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!emailRegex.test(form.email.trim())) e.email = "Enter a valid email";
    if (!phoneRegex.test(form.phone.trim()))
      e.phone = "Enter a valid phone number (e.g. +8801XXXXXXXXX)";
    if (!passwordRegex.test(form.password))
      e.password =
        "Min 8 chars with uppercase, lowercase, number & special char";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      // After registration, navigate to email verification OTP
      router.replace("/(auth)/email-verify-otp");
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message || "Something went wrong");
    }
  };

  return (
    <AuthScreenWrapper
      title="Create your\naccount ✨"
      subtitle="Join Medha and start learning smarter."
      showBack
      onBack={() => router.replace("/(auth)/login")}
    >
      {/* Name row */}
      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          <AuthInput
            label="First Name"
            placeholder="John"
            value={form.first_name}
            onChangeText={setField("first_name")}
            error={errors.first_name}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AuthInput
            ref={lastNameRef}
            label="Last Name"
            placeholder="Doe"
            value={form.last_name}
            onChangeText={setField("last_name")}
            error={errors.last_name}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>
      </View>

      <AuthInput
        ref={emailRef}
        label="Email Address"
        placeholder="you@example.com"
        value={form.email}
        onChangeText={setField("email")}
        keyboardType="email-address"
        error={errors.email}
        leftIcon={
          <Feather
            name="mail"
            size={moderateScale(16)}
            color={colors.textThird}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        blurOnSubmit={false}
      />

      <AuthInput
        ref={phoneRef}
        label="Phone Number"
        placeholder="+8801XXXXXXXXX"
        value={form.phone}
        onChangeText={setField("phone")}
        keyboardType="phone-pad"
        error={errors.phone}
        leftIcon={
          <Feather
            name="phone"
            size={moderateScale(16)}
            color={colors.textThird}
          />
        }
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
      />

      <AuthInput
        ref={passwordRef}
        label="Password"
        placeholder="••••••••"
        value={form.password}
        onChangeText={setField("password")}
        isPassword
        error={errors.password}
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

      <AuthInput
        ref={confirmRef}
        label="Confirm Password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChangeText={setField("confirmPassword")}
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
        onSubmitEditing={handleRegister}
      />

      <AuthButton
        title="Create Account"
        onPress={handleRegister}
        loading={isLoading}
        style={{ marginTop: verticalScale(8) }}
      />

      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: colors.textThird }]}>
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text style={[styles.loginLink, { color: colors.primaryColor }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(24),
  },
  loginText: {
    fontSize: moderateScale(14),
    fontFamily: "SansFlex",
  },
  loginLink: {
    fontSize: moderateScale(14),
    fontFamily: "SansFlex",
    fontWeight: "700",
  },
});
