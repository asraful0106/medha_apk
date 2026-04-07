import Avatar from "@/src/components/Avatar";
import CustomTitleBar from "@/src/components/CustomTitleBar";
import { StyledText } from "@/src/components/StyledText";
import {
  BREAKPOINTS,
  NAV_CONFIG,
  TITLE_CONFIG,
} from "@/src/constants/navTitleConfig";
import { useTheme } from "@/src/hooks/theme/ThemeContext";
import { AntDesign, Feather } from "@expo/vector-icons";
import { PlatformPressable } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { NotificationIndicator } from "./NotificationIndicator";
import { CalendarTaskIndicator } from "./CalendarTaskIndicator";
import { UniversityInfoButton } from "./UniversityInfoButton";

interface TCommonTyitleBar {
  mobileTitle?: string;
}

export default function CommonTitleBar(extraProps: TCommonTyitleBar) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;

  // On tablet, content must be pushed right (or left, depending on railSide)
  // to avoid being obscured by the absolutely-positioned rail.
  const railWidth = NAV_CONFIG.railWidth as number;
  const railSide = NAV_CONFIG.railSide ?? "left";
  return (
    <>
      {/* ── Title Bar ── spans full screen width on both layouts */}
      <CustomTitleBar
        // On tablet: remove horizontal padding so the logo container can
        // manually match the rail width and sit flush with the rail below.
        showBorder={isTablet ? true : false}
        paddingHorizontal={isTablet ? 0 : undefined}
        height={isTablet ? undefined : moderateScale(40)}
        leftPart={
          isTablet ? (
            <View
              style={{
                flexDirection: "row",
                gap: moderateScale(2),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  position: "relative",
                  width: railWidth,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{
                    width: moderateScale(25),
                    height: moderateScale(25),
                    resizeMode: "contain",
                  }}
                  source={require("@/assets/images/icon.png")}
                />

                <StyledText
                  style={{
                    position: "absolute",
                    left: isTablet ? "45%" : "50%",
                    bottom: isTablet ? "40%" : "50%",
                    marginLeft: moderateScale(12),
                    color: colors.textPrimary,
                    fontSize: isTablet
                      ? moderateScale(15, 0.01)
                      : TITLE_CONFIG.HeaderFontSize,
                    fontWeight: "bold",
                    width: moderateScale(55),
                  }}
                >
                  {t("app.medha")}
                </StyledText>
              </View>
            </View>
          ) : (
            // Mobile: plain app-name text
            <View>
              {extraProps?.mobileTitle ? (
                <PlatformPressable onPress={() => router.back()}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: moderateScale(5),
                    }}
                  >
                    <Feather
                      name="arrow-left"
                      size={moderateScale(24)}
                      color={colors.textPrimary}
                    />
                    <StyledText
                      style={{
                        color: colors.textPrimary,
                        fontSize: TITLE_CONFIG.HeaderFontSize,
                        fontWeight: "bold",
                      }}
                    >
                      {extraProps.mobileTitle}
                    </StyledText>
                  </View>
                </PlatformPressable>
              ) : (
                <StyledText
                  style={{
                    color: colors.textPrimary,
                    fontSize: TITLE_CONFIG.HeaderFontSize,
                    fontWeight: "bold",
                  }}
                >
                  {t("app.medha")}
                </StyledText>
              )}
            </View>
          )
        }
        rightPart={
          // Mobile
          !isTablet ? (
            <View
              style={{
                flexDirection: "row",
                gap: moderateScale(10),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UniversityInfoButton size={0.85} />
              <CalendarTaskIndicator count={2} size={0.85} />
              <NotificationIndicator count={12} size={0.85} />
              {/* <PrinterStatusIndicator
                size={0.85}
                onPress={() => router.push({ pathname: "/(tab)/setting" })}
              /> */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(tab)/profile" })}
              >
                <Avatar
                  borderWidth={moderateScale(1)}
                  size={moderateScale(25)}
                  imageUrl={"https://asraful-alom.com/uploads/asraful.jpg"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(tab)/setting" })}
              >
                <AntDesign
                  name="align-right"
                  size={moderateScale(24)}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            // Tablet
            <View
              style={{
                flexDirection: "row",
                gap: moderateScale(10),
                alignItems: "center",
                justifyContent: "center",
                marginRight: moderateScale(10),
              }}
            >
              <UniversityInfoButton size={0.85} />
              <CalendarTaskIndicator count={2} size={0.85} />
              <NotificationIndicator count={12} size={0.85} />
            </View>
          )
        }
      />
    </>
  );
}
