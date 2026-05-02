// @/src/pages/auth/components/AuthInput.tsx
import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, error, leftIcon, isPassword, style, ...rest }, ref) => {
    const { colors } = useTheme();
    const [showPass, setShowPass] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        <Text style={[styles.label, { color: colors.textThird }]}>{label}</Text>
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: error
                ? colors.error
                : isFocused
                  ? colors.primaryColor
                  : colors.border,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                flex: 1,
              },
              style,
            ]}
            placeholderTextColor={colors.textDisabled}
            secureTextEntry={isPassword && !showPass}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            {...rest}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setShowPass((p) => !p)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={showPass ? "eye" : "eye-off"}
                size={moderateScale(18)}
                color={colors.textThird}
              />
            </TouchableOpacity>
          )}
        </View>
        {!!error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

AuthInput.displayName = "AuthInput";

export default AuthInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: verticalScale(14),
  },
  label: {
    fontSize: moderateScale(12),
    fontFamily: "SansFlex",
    marginBottom: verticalScale(6),
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(14),
    height: verticalScale(48),
  },
  leftIcon: {
    marginRight: scale(10),
  },
  input: {
    fontSize: moderateScale(14),
    fontFamily: "SansFlex",
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: scale(4),
  },
  errorText: {
    fontSize: moderateScale(11),
    fontFamily: "SansFlex",
    marginTop: verticalScale(4),
    marginLeft: scale(4),
  },
});
