// @/src/pages/auth/components/ResendTimer.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/src/hooks/theme/ThemeContext";

interface ResendTimerProps {
  onResend: () => Promise<void>;
  initialSeconds?: number;
}

export default function ResendTimer({
  onResend,
  initialSeconds = 180,
}: ResendTimerProps) {
  const { colors } = useTheme();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleResend = useCallback(async () => {
    if (seconds > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setSeconds(initialSeconds);
    } finally {
      setIsResending(false);
    }
  }, [seconds, isResending, onResend, initialSeconds]);

  const canResend = seconds === 0 && !isResending;

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.textThird }]}>
        Didn't receive the code?{" "}
      </Text>
      <TouchableOpacity onPress={handleResend} disabled={!canResend}>
        <Text
          style={[
            styles.resendText,
            {
              color: canResend ? colors.primaryColor : colors.textDisabled,
            },
          ]}
        >
          {isResending
            ? "Sending..."
            : seconds > 0
              ? `Resend in ${seconds}s`
              : "Resend"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  text: {
    fontSize: moderateScale(13),
    fontFamily: "SansFlex",
  },
  resendText: {
    fontSize: moderateScale(13),
    fontFamily: "SansFlex",
    fontWeight: "600",
  },
});
