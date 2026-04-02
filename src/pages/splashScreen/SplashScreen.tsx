import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const tagY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.sequence([
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
    ]).start(onFinish);
  }, []);

  return (
    <View style={styles.container}>
      {/* lost space Lottie */}
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
        LUMIS
      </Animated.Text>

      <Animated.Text
        style={[
          styles.tagline,
          { opacity: tagOpacity, transform: [{ translateY: tagY }] },
        ]}
      >
        YOUR DAILY LIGHT
      </Animated.Text>

      {/*lodaing Lottie */}
      <LottieView
        source={require("@/assets/animations/loading.json")}
        autoPlay
        loop
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05080F",
    alignItems: "center",
    justifyContent: "center",
  },
  rings: {
    width: 220,
    height: 20,
    marginBottom: 28,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 12,
    color: "#000000",
    zIndex: 999
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 6,
    color: "#E8B84B",
    marginTop: 10,
    fontFamily: "System",
  },
  loader: {
    position: "absolute",
    bottom: 80,
    width: 200,
    height: 100,
  },
});
