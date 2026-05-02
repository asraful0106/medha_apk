// @/src/pages/auth/components/OtpInput.tsx
import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Pressable, Platform } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  hasError = false,
}: OtpInputProps) {
  const { colors } = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(length, " ").split("").slice(0, length);

  const focusAt = (i: number) => {
    inputs.current[i]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    // only accept single digit
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const arr = value.padEnd(length, "").split("").slice(0, length);
    arr[index] = digit;
    const next = arr.join("").trimEnd();
    onChange(next);
    if (digit && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      const arr = value.padEnd(length, "").split("").slice(0, length);
      if (arr[index] && arr[index].trim()) {
        arr[index] = "";
        onChange(arr.join("").trimEnd());
      } else if (index > 0) {
        arr[index - 1] = "";
        onChange(arr.join("").trimEnd());
        focusAt(index - 1);
      }
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const isFilled = i < value.length;
        const isFocusedTarget = i === Math.min(value.length, length - 1);

        return (
          <Pressable
            key={i}
            onPress={() => focusAt(i)}
            style={styles.pressable}
          >
            <View
              style={[
                styles.box,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: hasError
                    ? colors.error
                    : isFilled
                      ? colors.primaryColor
                      : colors.border,
                  borderWidth: isFilled ? 2 : 1.5,
                },
              ]}
            >
              <TextInput
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                style={[styles.digit, { color: colors.textPrimary }]}
                keyboardType="number-pad"
                maxLength={1}
                value={digits[i]?.trim() || ""}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                caretHidden
                selectTextOnFocus
                contextMenuHidden
                textContentType="oneTimeCode"
                autoComplete={i === 0 ? "sms-otp" : "off"}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(8),
  },
  pressable: {
    flex: 1,
  },
  box: {
    height: verticalScale(56),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: moderateScale(22),
    fontFamily: "SansFlex",
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
    paddingVertical: 0,
  },
});
