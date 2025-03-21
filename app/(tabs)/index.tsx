import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const WelcomeScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require('@/assets/images/product2.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.85)"]}
          style={styles.overlayGradient}
        >
          <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <Text style={styles.title}>
                <Text style={styles.titleHighlight}>Drive</Text>.re
              </Text>
              <Text style={styles.subtitle}>
                Commandez auprès des meilleurs vendeurs, en un clin d'œil.
              </Text>

              <View style={styles.buttonContainer}>
                <Link href="../clients/onboarding" asChild>
                  <TouchableOpacity style={styles.button}>
                    <LinearGradient
                      colors={["#00c4cc", "#0288d1"]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialIcons name="shopping-cart" size={22} color="#fff" />
                      <Text style={styles.buttonText}>Je souhaite acheter</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>

                <Link href="../deliverer/home" asChild>
                  <TouchableOpacity style={styles.button}>
                    <LinearGradient
                      colors={["#00c4cc", "#0288d1"]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialIcons name="shopping-cart" size={22} color="#fff" />
                      <Text style={styles.buttonText}>Je souhaite livrer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>

                <Link href="../sellers/onboarding" asChild>
                  <TouchableOpacity style={styles.button}>
                    <LinearGradient
                      colors={["#ff8f00", "#ff5722"]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialIcons name="store" size={22} color="#fff" />
                      <Text style={styles.buttonText}>Je souhaite vendre</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>

            <Text style={styles.footerText}>Simplifiez vos achats et ventes dès aujourd'hui.</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlayGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 25,
  },
  content: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 60,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 15,
  },
  titleHighlight: {
    color: "#ff5722",
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 20,
    color: "#ddd",
    textAlign: "center",
    marginVertical: 15,
    maxWidth: 320,
    lineHeight: 28,
    fontWeight: "300",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
  },
  button: {
    borderRadius: 15,
    marginVertical: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
});