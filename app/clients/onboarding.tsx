import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { Link, Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const BuyerWelcomeScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

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
              source={require('@/assets/images/client2.jpg')}
              style={styles.background}
              resizeMode="cover"
            >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.85)"]}
          style={styles.overlayGradient}
        >
          <View style={styles.container}>
            {/* Icône de retour */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Contenu principal pour les acheteurs */}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <Text style={styles.title}>
                <Text style={styles.titleHighlight}>Drive</Text>.re
              </Text>
              <Text style={styles.subtitle}>
                Commandez facilement auprès des meilleurs vendeurs.
              </Text>

              {/* Boutons S'inscrire et Se connecter */}
              <View style={styles.buttonContainer}>
                <Link href="/clients/signup" asChild>
                  <TouchableOpacity style={styles.button}>
                    <LinearGradient
                      colors={["#ff8f00", "#ff5722"]} // Orange pour s'inscrire
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialIcons name="person-add" size={22} color="#fff" />
                      <Text style={styles.buttonText}>S'inscrire</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
                <Link href="/clients/login" asChild>
                  <TouchableOpacity style={styles.button}>
                    <LinearGradient
                      colors={["#00c4cc", "#0288d1"]} // Bleu pour se connecter
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialIcons name="login" size={22} color="#fff" />
                      <Text style={styles.buttonText}>Se connecter</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>

            {/* Slogan adapté */}
            <Text style={styles.footerText}>Achetez malin, où que vous soyez.</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
};

export default BuyerWelcomeScreen;

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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    padding: 10,
    zIndex: 10,
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