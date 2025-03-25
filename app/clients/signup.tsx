import {
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
    KeyboardAvoidingView,
    Platform,
  } from "react-native";
  import React, { useEffect, useRef, useState } from "react";
  import { Link, Stack, useRouter } from "expo-router";
  import { LinearGradient } from "expo-linear-gradient";
  import { MaterialIcons } from "@expo/vector-icons";
  
  const BuyerSignUpScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);
  
    const handleSignUp = () => {
      // Logique d'inscription ici (ex. : appel API)
      //console.log("Name:", name, "Email:", email, "Password:", password);
      router.push("/clients/home"); // Redirection après inscription (exemple)
    };
  
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
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.container}
            >
              {/* Icône de retour */}
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
  
              {/* Contenu principal */}
              <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.title}>
                  <Text style={styles.titleHighlight}>Drive</Text>.re
                </Text>
                <Text style={styles.subtitle}>Inscrivez-vous pour commencer à acheter</Text>
  
                {/* Champs de formulaire */}
                <View style={styles.formContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="person" size={20} color="#ddd" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nom"
                      placeholderTextColor="#bbb"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="email" size={20} color="#ddd" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#bbb"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="lock" size={20} color="#ddd" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Mot de passe"
                      placeholderTextColor="#bbb"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
  
                  {/* Bouton d'inscription */}
                  <TouchableOpacity style={styles.button} onPress={handleSignUp}>
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
                </View>
  
                {/* Lien vers connexion */}
                <Text style={styles.footerText}>
                  Déjà un compte ?{" "}
                  <Link href="/signin" style={styles.link}>
                    Connectez-vous
                  </Link>
                </Text>
              </Animated.View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </ImageBackground>
      </>
    );
  };
  
  export default BuyerSignUpScreen;
  
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
      width: "100%",
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
    formContainer: {
      width: "100%",
      maxWidth: 400,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 12,
      marginVertical: 10,
      paddingHorizontal: 15,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      color: "#fff",
      fontSize: 16,
    },
    button: {
      borderRadius: 15,
      marginVertical: 15,
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
    },
    link: {
      color: "#ff5722",
      fontWeight: "600",
    },
  });