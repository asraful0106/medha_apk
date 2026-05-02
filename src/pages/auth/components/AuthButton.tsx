// @/src/pages/auth/components/AuthButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
}

export default function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: AuthButtonProps) {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const bg = isDisabled
    ? colors.disabledButton.bg
    : variant === "ghost"
      ? "transparent"
      : variant === "secondary"
        ? colors.activeButton.secondary.bg
        : colors.activeButton.primary.bg;

  const textColor = isDisabled
    ? colors.disabledButton.text
    : variant === "ghost"
      ? colors.primaryColor
      : variant === "secondary"
        ? colors.activeButton.secondary.text
        : colors.activeButton.primary.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderColor:
            variant === "ghost" ? colors.primaryColor : "transparent",
          borderWidth: variant === "ghost" ? 1.5 : 0,
          shadowColor:
            variant === "primary"
              ? colors.activeButton.primary.shadow
              : "transparent",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: verticalScale(50),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: moderateScale(15),
    fontFamily: "SansFlex",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
