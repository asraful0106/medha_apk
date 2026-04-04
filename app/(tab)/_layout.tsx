/**
 * ============================================================
 *  @/app/(tabs)/_layout.tsx
 * ============================================================
 * The layout manages tab navigation only.
 * CustomTitleBar lives inside each screen, NOT here.
 *
 * KEY CHANGE: Hide tab bar on mobile for "setting" and "profile" routes.
 * Since we use a custom tabBar, we must handle this inside the
 * tabBar render prop — tabBarStyle/tabBarButton won't work here.
 * ============================================================
 */

import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, useWindowDimensions } from "react-native";

import {
  AdaptiveNavigation,
  BREAKPOINTS,
  NavItem,
} from "@/src/components/AdaptiveNavigation";
import { NAV_CONFIG, TITLE_CONFIG } from "@/src/constants/navTitleConfig";
import { moderateScale } from "react-native-size-matters";

// ─────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    routeName: "index",
    label: "Home",
    icon: ({ color, size }) => (
      <Feather name="home" color={color} size={size} />
    ),
  },
  {
    routeName: "rank",
    label: "Rank",
    icon: ({ color, size }) => (
      <FontAwesome6 name="ranking-star" color={color} size={size} />
    ),
  },
  {
    routeName: "content",
    label: "Content",
    icon: ({ color, size }) => (
      <Entypo name="folder-video" color={color} size={size} />
    ),
  },
  {
    routeName: "course",
    label: "Course",
    icon: ({ color, size }) => (
      <FontAwesome5 name="chalkboard-teacher" color={color} size={size} />
    ),
  },
];

const EXTRA_NAV_ITEMS: NavItem[] = [
  {
    routeName: "setting",
    label: "Settings",
    icon: ({ color, size }) => (
      <AntDesign name="align-right" color={color} size={size} />
    ),
  },
  {
    routeName: "profile",
    label: "Profile",
    avatarProps: {
      imageUrl: "https://asraful-alom.com/uploads/asraful.jpg",
      borderColor: "#f97316",
      size: moderateScale(16),
      borderWidth: moderateScale(1),
    },
  },
];

// Routes that should NOT show the tab bar on mobile
const HIDDEN_ON_MOBILE = ["setting", "profile"];

// ─────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;

  // On mobile, don't include setting/profile in the nav bar items
  const extraNavItems = isTablet ? EXTRA_NAV_ITEMS : [];

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => {
          // On mobile, hide the tab bar entirely for setting/profile routes
          const currentRoute = props.state.routes[props.state.index]?.name;

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
        <Tabs.Screen
          name="index"
          options={{ headerShown: false, title: t("indexs.home") }}
        />
        <Tabs.Screen
          name="rank"
          options={{ headerShown: false, title: t("indexs.rank") }}
        />
        <Tabs.Screen
          name="content"
          options={{ headerShown: false, title: t("indexs.content") }}
        />
        <Tabs.Screen
          name="course"
          options={{ headerShown: false, title: t("indexs.courses") }}
        />
        <Tabs.Screen
          name="profile"
          options={{ headerShown: false, title: t("indexs.profile") }}
        />
        <Tabs.Screen
          name="setting"
          options={{ headerShown: false, title: t("indexs.setting") }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
