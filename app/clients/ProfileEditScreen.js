// ProfileEditScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavigation from './components/BottomNavigation';

const ProfileEditScreen = () => {
  const router = useRouter();

  // État initial avec des données d'exemple
  const [userInfo, setUserInfo] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    address: '123 Rue Principale',
    city: 'Paris',
    postalCode: '75001',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Gestion des changements dans les champs
  const handleChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Simulation de sauvegarde des modifications
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Succès', 'Vos informations ont été mises à jour avec succès !');
      router.push('/clients/profile'); // Redirection vers la page de profil après sauvegarde
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour des informations. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Modifier le Profil</Text>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={userInfo.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Entrez votre nom"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userInfo.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Entrez votre email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={userInfo.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="Entrez votre numéro"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              value={userInfo.address}
              onChangeText={(text) => handleChange('address', text)}
              placeholder="Entrez votre adresse"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              value={userInfo.city}
              onChangeText={(text) => handleChange('city', text)}
              placeholder="Entrez votre ville"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Code postal</Text>
            <TextInput
              style={styles.input}
              value={userInfo.postalCode}
              onChangeText={(text) => handleChange('postalCode', text)}
              placeholder="Entrez votre code postal"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.push('/clients/profile')}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'left',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espace pour BottomNavigation
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#38A169',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#95C9A6',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#38A169',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#38A169',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileEditScreen;