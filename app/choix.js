import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  Card,
} from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HomeChoiceScreen = () => {
  const router = useRouter();

  const handleSellerChoice = () => {
    router.push('/vendeurs/signup'); // Redirection vers la page d'inscription vendeur
  };

  const handleBuyerChoice = () => {
    router.push('/clients/signup'); // Redirection vers la page d'inscription client
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <Layout style={styles.header} level="1">
          <Ionicons name="cart-outline" size={70} color="#38B2AC" />
          <Text category="h4" style={styles.headerTitle}>
            Welcome
          </Text>
          <Text category="p2" style={styles.headerSubtitle}>
            Choose your journey
          </Text>
        </Layout>

        {/* Cards Container */}
        <Layout style={styles.cardsContainer}>
          {/* Seller Card */}
          <Card
            style={styles.card}
            onPress={handleSellerChoice}
            status="primary"
          >
            <View style={styles.cardContent}>
              <Ionicons name="storefront-outline" size={40} color="#38B2AC" />
              <Text category="h6" style={styles.cardTitle}>
                Je souhaite vendre
              </Text>
              <Text category="p2" style={styles.cardSubtitle}>
                Créez votre boutique et commencez à vendre dès aujourd’hui
              </Text>
            </View>
          </Card>

          {/* Buyer Card */}
          <Card
            style={styles.card}
            onPress={handleBuyerChoice}
            status="primary"
          >
            <View style={styles.cardContent}>
              <Ionicons name="bag-handle-outline" size={40} color="#38B2AC" />
              <Text category="h6" style={styles.cardTitle}>
                Je souhaite acheter
              </Text>
              <Text category="p2" style={styles.cardSubtitle}>
                Découvrez des produits et achetez en toute simplicité
              </Text>
            </View>
          </Card>
        </Layout>
      </Layout>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: '#2D3748',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#718096',
    marginTop: 8,
    fontSize: 14,
  },
  cardsContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
  card: {
    borderRadius: 12,
    marginBottom: 30, // Espacement clair entre les cartes
    backgroundColor: '#F7FAFC',
    borderColor: '#38B2AC',
    borderWidth: 1,
    shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    height: 180, // Hauteur fixe pour uniformité
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
    height: '100%', // Assure que le contenu remplit la carte
    justifyContent: 'center', // Centre verticalement le contenu
  },
  cardTitle: {
    color: '#2D3748',
    fontWeight: '700',
    marginTop: 10,
  },
  cardSubtitle: {
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    paddingHorizontal: 10, // Ajout de padding pour éviter que le texte ne touche les bords
  },
});

export default HomeChoiceScreen;