// @/src/pages/auth/login/Login.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import { CustomAlert, AlertVariant } from "@/src/components/CustomAlert";
import AuthScreenWrapper from "../components/AuthScreenWrapper";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { consoleDev } from "@/src/utils/consoleDev";
import { TApiErrorResponse } from "@/src/interfaces/apiResponse";
import { useTranslation } from "react-i18next";

// ─── Error code → alert config ─────────────────────────────────────────────
// Maps every known server error code to a human-friendly title + variant.
// Falls back gracefully for any unknown code.
const ERROR_CODE_MAP: Record<string, { title: string; variant: AlertVariant }> =
  {
    AUTH_INVALID_CREDENTIALS: {
      title: "Incorrect Credentials",
      variant: "danger",
    },
    AUTH_USER_BLOCKED: {
      title: "Account Suspended",
      variant: "danger",
    },
    BAD_REQUEST: {
      title: "Invalid Request",
      variant: "warning",
    },
    CLIENT_ERROR: {
      title: "Connection Error",
      variant: "warning",
    },
  };

function showLoginAlert(error: TApiErrorResponse) {
  const mapped = ERROR_CODE_MAP[error.code] ?? {
    title: "Login Failed",
    variant: "danger" as AlertVariant,
  };

  CustomAlert.show({
    title: mapped.title,
    message: error.message,
    variant: mapped.variant,
    // Blocked accounts get a single "OK" — no retry implied
    actions:
      error.code === "AUTH_USER_BLOCKED"
        ? [{ label: "OK", style: "default" }]
        : [{ label: "Try Again", style: "default" }],
  });
}

// ─── Validators ────────────────────────────────────────────────────────────
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password: string) {
  return password.length >= 8;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Login() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { login, isLoading, user } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const passwordRef = useRef<TextInput>(null);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = t("login.email_is_required");
    else if (!validateEmail(email)) e.email = t("login.enter_a_valid_email");
    if (!password) e.password = t("login.password_is_required");
    else if (!validatePassword(password))
      e.password = t("login.password_must_be_at_least_8_characters");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email.trim(), password);

      // login() resolves normally for both success AND server-side errors.
      // Check the store snapshot to know which happened.
      const storeError = useAuthStore.getState().error;
      if (storeError) {
        showLoginAlert(storeError);
        return;
      }

      // No error in store → successful login
      // After successful login in authStore.login()
      if (user?.isEmailVerified) {
        router.replace("/(tab)");
      } else {
        router.replace("/(auth)/email-verify-otp");
      }
      // router.replace("/(tab)");
    } catch (err: any) {
      // Only network / timeout errors throw — the store also holds the error
      // object, so read from there to keep the alert consistent.
      consoleDev.log({ comingFrom: "Login.tsx", line: 96 }, err);
      const storeError = useAuthStore.getState().error;
      if (storeError) {
        showLoginAlert(storeError);
      } else {
        // Absolute fallback (should not normally reach here)
        CustomAlert.show({
          title: "Connection Error",
          message:
            err.message || t("errors.something_went_wrong_please_try_again"),
          variant: "warning",
        });
      }
    }
  };

  return (
    <AuthScreenWrapper
      title={`${t("login.welcome_back")} 👋`}
      subtitle={t("login.sign_in_to_conitnue_your_learning_journey")}
    >
      <AuthInput
        label={t("login.email_address")}
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
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
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="blurAndSubmit"
      />

      <AuthInput
        ref={passwordRef}
        label={t("login.password")}
        placeholder="••••••••"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errors.password)
            setErrors((e) => ({ ...e, password: undefined }));
        }}
        isPassword
        error={errors.password}
        leftIcon={
          <Feather
            name="lock"
            size={moderateScale(16)}
            color={colors.textThird}
          />
        }
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />

      {/* Forgot password */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/forgot-password")}
        style={styles.forgotRow}
      >
        <Text style={[styles.forgotText, { color: colors.primaryColor }]}>
          {t("login.forget_password")}
        </Text>
      </TouchableOpacity>

      <AuthButton
        title="Sign In"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.loginBtn}
      />

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View
          style={[styles.dividerLine, { backgroundColor: colors.divider }]}
        />
        <Text style={[styles.dividerText, { color: colors.textDisabled }]}>
          {t("login.or")}
        </Text>
        <View
          style={[styles.dividerLine, { backgroundColor: colors.divider }]}
        />
      </View>

      {/* Register */}
      <View style={styles.registerRow}>
        <Text style={[styles.registerText, { color: colors.textThird }]}>
          {t("login.dont_have_an_account")}{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={[styles.registerLink, { color: colors.primaryColor }]}>
            {t("login.sign_up")}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: verticalScale(-6),
    marginBottom: verticalScale(24),
  },
  forgotText: {
    fontSize: moderateScale(13),
    fontFamily: "SansFlex",
    fontWeight: "600",
  },
  loginBtn: {
    marginTop: verticalScale(4),
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(24),
    gap: scale(12),
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: moderateScale(12),
    fontFamily: "SansFlex",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: moderateScale(14),
    fontFamily: "SansFlex",
  },
  registerLink: {
    fontSize: moderateScale(14),
    fontFamily: "SansFlex",
    fontWeight: "700",
  },
});
