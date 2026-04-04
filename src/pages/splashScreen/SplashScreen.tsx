import React, { useRef, useEffect } from "react";
import { View, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { moderateScale, ScaledSheet } from "react-native-size-matters";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const { t } = useTranslation();

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const tagY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(tagY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1400),
    ]);

    animation.start(onFinish);

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Lottie */}
      <LottieView
        source={require("@/assets/animations/lost_space.json")}
        autoPlay
        loop
        style={styles.rings}
      />

      <Animated.Text
        style={[
          styles.appName,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        {t("app.MEDHA")}
      </Animated.Text>

      <Animated.Text
        style={[
          styles.tagline,
          { opacity: tagOpacity, transform: [{ translateY: tagY }] },
        ]}
      >
        {t("app.TAGLINE")}
      </Animated.Text>

      {/* Bottom Loader */}
      <LottieView
        source={require("@/assets/animations/loading.json")}
        autoPlay
        loop
        style={styles.loader}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rings: {
    width: moderateScale(220),
    height: moderateScale(220),
    marginBottom: moderateScale(28),
  },
  appName: {
    fontSize: moderateScale(32, 0.01),
    fontWeight: "700",
    letterSpacing: moderateScale(12),
    color: "#1E1B4B",

    width: "100%",
    textAlign: "center",
  },
  tagline: {
    fontSize: moderateScale(11, 0.01),
    letterSpacing: moderateScale(6),
    color: "#4F46E5",
    marginTop: moderateScale(10),

    width: "100%",
    textAlign: "center",
  },
  loader: {
    position: "absolute",
    bottom: moderateScale(80),
    width: moderateScale(200),
    height: moderateScale(100),
  },
});
