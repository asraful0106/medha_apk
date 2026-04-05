/**
 * ============================================================
 *  @/app/(tabs)/_layout.tsx
 * ============================================================
 */

import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome5,
  FontAwesome6,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { moderateScale } from "react-native-size-matters";

import {
  AdaptiveNavigation,
  BREAKPOINTS,
  NavItem,
} from "@/src/components/AdaptiveNavigation";
import { NAV_CONFIG, TITLE_CONFIG } from "@/src/constants/navTitleConfig";

// Routes that should NOT show the tab bar on mobile
const HIDDEN_ON_MOBILE = ["setting", "profile"];

export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;

  // ─────────────────────────────────────────────────────────────
  // NAV ITEMS (memoized for performance)
  // ─────────────────────────────────────────────────────────────
  const NAV_ITEMS: NavItem[] = useMemo(
    () => [
      {
        routeName: "index",
        label: t("indexs.home"),
        icon: ({ color, size }) => (
          <Feather name="home" color={color} size={size} />
        ),
      },
      {
        routeName: "rank",
        label: t("indexs.rank"),
        icon: ({ color, size }) => (
          <FontAwesome6 name="ranking-star" color={color} size={size} />
        ),
      },
      {
        routeName: "content",
        label: t("indexs.content"),
        icon: ({ color, size }) => (
          <Entypo name="folder-video" color={color} size={size} />
        ),
      },
      {
        routeName: "course",
        label: t("indexs.courses"),
        icon: ({ color, size }) => (
          <FontAwesome5 name="chalkboard-teacher" color={color} size={size} />
        ),
      },
    ],
    [t],
  );

  const EXTRA_NAV_ITEMS: NavItem[] = useMemo(
    () => [
      {
        routeName: "setting",
        label: t("indexs.setting"),
        icon: ({ color, size }) => (
          <AntDesign name="align-right" color={color} size={size} />
        ),
      },
      {
        routeName: "profile",
        label: t("indexs.profile"),
        avatarProps: {
          imageUrl: "https://asraful-alom.com/uploads/asraful.jpg",
          borderColor: "#f97316",
          size: moderateScale(16),
          borderWidth: moderateScale(1),
        },
      },
    ],
    [t],
  );

  // Only show extra items on tablet
  const extraNavItems = isTablet ? EXTRA_NAV_ITEMS : [];

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => {
          const currentRoute = props.state.routes[props.state.index]?.name;

          // Hide tab bar completely on mobile for specific screens
          if (!isTablet && HIDDEN_ON_MOBILE.includes(currentRoute)) {
            return null;
          }

          return (
            <AdaptiveNavigation
              {...props}
              navItems={NAV_ITEMS}
              extraNavItems={extraNavItems}
              config={NAV_CONFIG}
              titleBarHeight={TITLE_CONFIG.TitleHeight}
            />
          );
        }}
      >
        <Tabs.Screen name="index" options={{ title: t("indexs.home") }} />
        <Tabs.Screen name="rank" options={{ title: t("indexs.rank") }} />
        <Tabs.Screen name="content" options={{ title: t("indexs.content") }} />
        <Tabs.Screen name="course" options={{ title: t("indexs.courses") }} />
        <Tabs.Screen name="profile" options={{ title: t("indexs.profile") }} />
        <Tabs.Screen name="setting" options={{ title: t("indexs.setting") }} />
      </Tabs>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
