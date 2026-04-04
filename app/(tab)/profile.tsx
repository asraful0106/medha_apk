/**
 * @/app/(tabs)/profile.tsx
 */

import CommonTitleBar from "@/src/components/CommonTitleBar";
import SafeScreen from "@/src/components/SafeScreen";
import { BREAKPOINTS, NAV_CONFIG } from "@/src/constants/navTitleConfig";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import Profile from "@/src/pages/profile/Profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function profile() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;

  // On tablet, content must be pushed right (or left, depending on railSide)
  // to avoid being obscured by the absolutely-positioned rail.
  const railWidth = NAV_CONFIG.railWidth as number;
  const railSide = NAV_CONFIG.railSide ?? "left";

  return (
    <SafeScreen>
      <CommonTitleBar mobileTitle="Profile" />
      {/* ── Content ── offset by rail width on the correct side (tablet only) */}
      <View
        style={{
          flex: 1,
          // Push content away from the rail side on tablet so it's not hidden.
          // On mobile there's no rail so no offset needed.
          marginLeft: isTablet && railSide === "left" ? railWidth : 0,
          marginRight: isTablet && railSide === "right" ? railWidth : 0,
          padding: moderateScale(10),
        }}
      >
        <Profile />
      </View>
    </SafeScreen>
  );
}
