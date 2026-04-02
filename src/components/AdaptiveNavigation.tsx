/**
 * ============================================================
 * AdaptiveNavigation.tsx  (v4 — Avatar support + extraNavItems)
 * ============================================================
 * A fully reusable, device-adaptive navigation component built
 * for React Native + Expo Router projects.
 *
 * ✅ Mobile  → Bottom tab bar (horizontal)
 * ✅ Tablet  → Side rail (vertical, left or right side)
 * ✅ Tablet  → Rail correctly starts BELOW the CustomTitleBar
 * ✅ Scroll  → Animated hide/show via Animated.Value props
 * ✅ Theme   → Full dark/light support via color tokens
 * ✅ RTL     → Safe-area aware
 * ✅ A11y    → Proper accessibilityLabel & accessibilityState
 * ✅ Custom  → Plug in any icon set, any routes
 * ✅ Avatar  → Per-item Avatar support via `avatarUrl` or `avatarProps`
 * ✅ Extra   → extraNavItems pinned to bottom of tablet rail
 *
 * AVATAR USAGE
 * ────────────
 * You can replace `icon` with an avatar in two ways:
 *
 * 1. Quick — just pass a URL:
 *    { routeName: "profile", avatarUrl: "https://..." }
 *
 * 2. Full control — pass any Avatar props:
 *    { routeName: "profile", avatarProps: { imageUrl: "...", borderColor: "#f00" } }
 *
 * `icon` is now optional when either `avatarUrl` or `avatarProps` is provided.
 * If both `icon` and avatar props are present, the avatar takes precedence.
 *
 * EXTRA NAV ITEMS (tablet only)
 * ──────────────────────────────
 * Pass `extraNavItems` to render a second group pinned to the bottom of the rail.
 * Control render order with `config.reverseExtraNavItems`.
 *
 * USAGE
 * ─────
 * <AdaptiveNavigation
 *   {...props}
 *   navItems={NAV_ITEMS}
 *   extraNavItems={EXTRA_ITEMS}
 *   config={{ reverseExtraNavItems: true }}
 *   titleBarHeight={TITLE_CONFIG.TitleHeight}
 * />
 *
 * ============================================================
 */

import Avatar from "@/src/components/Avatar"; // ← adjust path to your Avatar component
import { ThemeColors } from "@/src/constants/themeCollorConstant";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useLinkBuilder } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { BREAKPOINTS } from "../constants/navTitleConfig";
import { useTheme } from "../hooks/theme/ThemeContext";

// ─────────────────────────────────────────────────────────────
// 🗂  NAV ITEM DEFINITION
// ─────────────────────────────────────────────────────────────

/**
 * Props forwarded directly to the <Avatar> component when using avatar mode.
 * Mirrors Avatar's own props minus `size` (which is derived from NavConfig.iconSize).
 */
export interface NavItemAvatarProps {
  imageUrl?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  size?: number;
}

export interface NavItem {
  /** Must match the Expo Router screen file name (e.g. "index", "customers") */
  routeName: string;

  /** Display label. Falls back to screen title or route name. */
  label?: string;

  /**
   * Icon renderer. Receives color, size, and focused state.
   * Example: ({ color, size }) => <Feather name="home" color={color} size={size} />
   *
   * Optional when `avatarUrl` or `avatarProps` is provided —
   * in that case the Avatar is rendered instead.
   */
  icon?: (props: {
    color: string;
    size: number;
    focused: boolean;
  }) => React.ReactNode;

  /**
   * Shorthand: just pass an image URL to render an Avatar for this item.
   * If `avatarProps` is also provided, it takes precedence over this field.
   */
  avatarUrl?: string;

  /**
   * Full Avatar configuration. When present, an <Avatar> is rendered
   * instead of the `icon` function, regardless of whether `icon` is defined.
   * `size` is always sourced from `NavConfig.iconSize` to stay consistent.
   */
  avatarProps?: NavItemAvatarProps;

  /**
   * Optional deep-link override path.
   * If provided, navigation uses this path instead of the route name.
   */
  overridePath?: string;
}

// ─────────────────────────────────────────────────────────────
// ⚙️  CONFIGURATION
// ─────────────────────────────────────────────────────────────
export interface NavConfig {
  /** Icon size in dp. Default: 24 */
  iconSize?: number;

  /** Rail width in dp (tablet). Default: 80 */
  railWidth?: number;

  /** Bar height in dp (mobile). Default: 60 */
  barHeight?: number;

  /** Which side to place the rail on (tablet). Default: "left" */
  railSide?: "left" | "right";

  /** Show text labels on mobile bottom bar. Default: true */
  showLabelsOnMobile?: boolean;

  /** Show text labels on tablet rail. Default: false */
  showLabelsOnTablet?: boolean;

  /** Reverse the render order of extraNavItems. Default: false */
  reverseExtraNavItems?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 🧩 MAIN COMPONENT PROPS
// ─────────────────────────────────────────────────────────────
export interface AdaptiveNavigationProps extends BottomTabBarProps {
  navItems: NavItem[];
  config?: NavConfig;

  /**
   * Extra nav items rendered ONLY on tablet, pinned to the bottom of the rail.
   * Useful for settings, logout, profile, or other secondary actions.
   * Control render order with `config.reverseExtraNavItems`.
   */
  extraNavItems?: NavItem[];

  /**
   * Height of the CustomTitleBar in dp.
   * The rail top offset is set to this value so the rail starts
   * BELOW the title bar on tablet.
   * If not provided, the rail starts from the very top of the safe area.
   */
  titleBarHeight?: number;

  /**
   * Animated.Value for vertical translation (mobile bottom bar hide).
   * Comes from useScrollVisibility → navBarTranslateY.
   * If not provided, the nav bar never hides.
   */
  translateY?: Animated.Value;

  /**
   * Animated.Value for horizontal translation (tablet rail hide).
   * Comes from useScrollVisibility → navBarTranslateX.
   * If not provided, the rail never hides.
   */
  translateX?: Animated.Value;
}

// ─────────────────────────────────────────────────────────────
// 🧩 MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function AdaptiveNavigation({
  state,
  descriptors,
  navigation,
  navItems,
  config = {},
  extraNavItems,
  titleBarHeight,
  translateY,
  translateX,
}: AdaptiveNavigationProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { buildHref } = useLinkBuilder();

  const {
    iconSize = 24,
    railWidth = 80,
    barHeight = 60,
    railSide = "left",
    showLabelsOnMobile = true,
    showLabelsOnTablet = false,
    reverseExtraNavItems = false,
  } = config;

  const isTablet = width >= BREAKPOINTS.tablet;

  // ── Active extra item tracking ─────────────────────────────
  // extraNavItems are not registered Expo Router tabs, so isFocused can't
  // be derived from state.index. We track the active extra route manually.
  const [activeExtraRoute, setActiveExtraRoute] = useState<string | null>(null);

  // ── Safe-area padding ──────────────────────────────────────
  const bottomPad = !isTablet && insets.bottom > 17 ? insets.bottom : 0;
  const railTopOffset = isTablet ? insets.top + (titleBarHeight ?? 0) : 0;

  const styles = useMemo(
    () =>
      createStyles(
        colors,
        isTablet,
        railSide,
        railWidth,
        barHeight,
        railTopOffset,
      ),
    [colors, isTablet, railSide, railWidth, barHeight, railTopOffset],
  );

  // ── Animated transform ─────────────────────────────────────
  const animatedTransform = useMemo(() => {
    if (isTablet && translateX) return [{ translateX }];
    if (!isTablet && translateY) return [{ translateY }];
    return undefined;
  }, [isTablet, translateY, translateX]);

  // ── Tab press handlers ─────────────────────────────────────
  const makeOnPress = useCallback(
    (
      routeName: string,
      routeKey: string,
      routeParams: object | undefined,
      isFocused: boolean,
      overridePath?: string,
    ) =>
      () => {
        // Pressing a primary tab always deactivates any active extra item
        setActiveExtraRoute(null);

        const event = navigation.emit({
          type: "tabPress",
          target: routeKey,
          canPreventDefault: true,
        });
        if (event.defaultPrevented) return;
        if (overridePath) return;
        if (!isFocused) navigation.navigate(routeName, routeParams);
      },
    [navigation],
  );

  const makeOnLongPress = useCallback(
    (routeKey: string) => () => {
      navigation.emit({ type: "tabLongPress", target: routeKey });
    },
    [navigation],
  );

  // ── Extra items (resolved + optionally reversed) ───────────
  const resolvedExtraItems = useMemo(() => {
    if (!isTablet || !extraNavItems?.length) return [];
    return reverseExtraNavItems ? [...extraNavItems].reverse() : extraNavItems;
  }, [isTablet, extraNavItems, reverseExtraNavItems]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        styles.wrapper,
        !isTablet && { paddingBottom: bottomPad },
        animatedTransform ? { transform: animatedTransform } : undefined,
      ]}
    >
      {/* ── Primary nav items (top / mobile group) ── */}
      <View style={isTablet ? styles.topGroup : styles.mobileGroup}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const navItem = navItems.find((n) => n.routeName === route.name);
          if (!navItem) return null;

          const label =
            navItem.label ??
            (typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name));

          const iconColor = isFocused
            ? colors.navigation.active
            : colors.navigation.inactive;
          const labelColor = isFocused
            ? colors.navigation.active
            : colors.navigation.inactive;

          const showLabel = isTablet ? showLabelsOnTablet : showLabelsOnMobile;

          return (
            <NavTab
              key={route.name}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
              onPress={makeOnPress(
                route.name,
                route.key,
                route.params as object | undefined,
                isFocused,
                navItem.overridePath,
              )}
              onLongPress={makeOnLongPress(route.key)}
              href={navItem.overridePath ?? buildHref(route.name, route.params)}
              isFocused={isFocused}
              isTablet={isTablet}
              iconColor={iconColor}
              iconSize={iconSize}
              labelColor={labelColor}
              label={label}
              showLabel={showLabel}
              navItem={navItem}
              pillColor={colors.navigation.activePill}
              styles={styles}
            />
          );
        })}
      </View>

      {/* ── Extra nav items (tablet-only, pinned to bottom) ── */}
      {isTablet && resolvedExtraItems.length > 0 && (
        <View style={styles.bottomGroup}>
          {resolvedExtraItems.map((navItem) => {
            const isExtraFocused = activeExtraRoute === navItem.routeName;
            return (
              <NavTab
                key={navItem.routeName}
                accessibilityRole="tab"
                accessibilityState={isExtraFocused ? { selected: true } : {}}
                accessibilityLabel={navItem.label ?? navItem.routeName}
                isFocused={isExtraFocused}
                isTablet={isTablet}
                iconColor={
                  isExtraFocused
                    ? colors.navigation.active
                    : colors.navigation.inactive
                }
                iconSize={iconSize}
                labelColor={
                  isExtraFocused
                    ? colors.navigation.active
                    : colors.navigation.inactive
                }
                label={navItem.label ?? navItem.routeName}
                showLabel={showLabelsOnTablet}
                navItem={navItem}
                pillColor={colors.navigation.activePill}
                styles={styles}
                onPress={() => {
                  setActiveExtraRoute(navItem.routeName);
                  navigation.navigate(navItem.routeName);
                }}
                onLongPress={() => {}}
              />
            );
          })}
        </View>
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// 🏷  NAV TAB
// ─────────────────────────────────────────────────────────────
interface NavTabProps {
  isFocused: boolean;
  isTablet: boolean;
  iconColor: string;
  iconSize: number;
  labelColor: string;
  label: string;
  showLabel: boolean;
  navItem: NavItem;
  pillColor: string;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
  onLongPress: () => void;
  href?: string;
  accessibilityRole: "tab";
  accessibilityState: { selected?: boolean };
  accessibilityLabel: string;
  testID?: string;
}

function NavTab({
  isFocused,
  isTablet,
  iconColor,
  iconSize,
  labelColor,
  label,
  showLabel,
  navItem,
  pillColor,
  styles,
  onPress,
  onLongPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  testID,
}: NavTabProps) {
  // ── Resolve what to render as the icon ────────────────────
  // Priority: avatarProps > avatarUrl > icon function
  const renderIcon = () => {
    // 1. Full avatarProps object provided
    if (navItem.avatarProps) {
      return (
        <Avatar
          {...navItem.avatarProps}
          size={navItem.avatarProps.size ?? iconSize}
          // Highlight the border when focused using the active pill color
          borderColor={
            isFocused
              ? (navItem.avatarProps.borderColor ?? pillColor)
              : (navItem.avatarProps.borderColor ?? "transparent")
          }
        />
      );
    }

    // 2. Shorthand avatarUrl provided
    if (navItem.avatarUrl) {
      return (
        <Avatar
          imageUrl={navItem.avatarUrl}
          size={iconSize}
          borderColor={isFocused ? pillColor : "transparent"}
        />
      );
    }

    // 3. Standard icon function
    if (navItem.icon) {
      return navItem.icon({
        color: iconColor,
        size: iconSize,
        focused: isFocused,
      });
    }

    // 4. Nothing configured — render nothing (shouldn't happen in practice)
    return null;
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [
        styles.tab,
        isTablet && styles.tabRail,
        pressed && styles.tabPressed,
      ]}
    >
      {isFocused && (
        <View
          style={[
            styles.pill,
            isTablet ? styles.pillRail : styles.pillBar,
            { backgroundColor: pillColor },
          ]}
        />
      )}

      <View style={styles.iconWrap}>{renderIcon()}</View>

      {showLabel && (
        <Text
          style={[styles.label, { color: labelColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────
// 🎨 STYLES
// ─────────────────────────────────────────────────────────────
function createStyles(
  colors: ThemeColors,
  isTablet: boolean,
  railSide: "left" | "right",
  railWidth: number,
  barHeight: number,
  railTopOffset: number,
) {
  return StyleSheet.create({
    wrapper: {
      ...(isTablet
        ? {
            position: "absolute",
            top: railTopOffset,
            bottom: 0,
            [railSide]: 0,
            width: railWidth,
            flexDirection: "column",
            alignItems: "center",
            // space-between pushes topGroup to top and bottomGroup to bottom
            justifyContent: "space-between",
            backgroundColor: colors.navigation.background,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderLeftWidth:
              railSide === "right" ? StyleSheet.hairlineWidth : 0,
            borderRightWidth:
              railSide === "left" ? StyleSheet.hairlineWidth : 0,
            borderColor: colors.navigation.border,
            ...Platform.select({
              ios: {},
              android: {},
            }),
            paddingTop: moderateScale(8),
          }
        : {
            height: barHeight,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            backgroundColor: colors.navigation.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.navigation.border,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
              },
              android: { elevation: 8 },
            }),
          }),
    } as ViewStyle,

    // ── Group containers ──────────────────────────────────────

    /** Primary items — top of rail on tablet, full row on mobile */
    topGroup: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    } as ViewStyle,

    /** Same as topGroup but named for clarity on mobile */
    mobileGroup: {
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
      justifyContent: "space-around",
      width: "100%",
    } as ViewStyle,

    /** Extra items — pinned to the bottom of the rail (tablet only) */
    bottomGroup: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      paddingBottom: moderateScale(12),
    } as ViewStyle,

    // ── Tab item ──────────────────────────────────────────────

    tab: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      paddingVertical: 6,
      paddingHorizontal: 4,
      flex: 1,
    } as ViewStyle,

    tabRail: {
      flex: 0,
      width: "100%",
      paddingVertical: 14,
    } as ViewStyle,

    tabPressed: { opacity: 0.7 } as ViewStyle,

    // ── Active pill indicator ─────────────────────────────────

    pill: {
      position: "absolute",
      borderRadius: 100,
    } as ViewStyle,

    /** Mobile: thin underline at the bottom of the active tab */
    pillBar: {
      bottom: 0,
      left: "15%",
      right: "15%",
      height: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    } as ViewStyle,

    /** Tablet: full background pill behind the icon */
    pillRail: {
      top: 4,
      left: 8,
      right: 8,
      bottom: 4,
      borderRadius: 12,
    } as ViewStyle,

    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    } as ViewStyle,

    label: {
      fontSize: moderateScale(10, 0.01),
      marginTop: 3,
      fontWeight: "500",
      letterSpacing: 0.2,
      zIndex: 1,
    } as TextStyle,
  });
}

// ─────────────────────────────────────────────────────────────
// 📦 RE-EXPORTS
// ─────────────────────────────────────────────────────────────
export { BREAKPOINTS };
