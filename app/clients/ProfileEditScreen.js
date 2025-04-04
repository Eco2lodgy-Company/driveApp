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
import Icon from 'react-native-vector-icons/Feather';
import BottomNavigation from './components/BottomNavigation';

const ProfileEditScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    address: '123 Rue Principale',
    city: 'Paris',
    postalCode: '75001',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Succès', 'Vos informations ont été mises à jour avec succès !');
      router.push('/clients/profile');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour des informations. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/clients/profile')}
          >
            <Icon name="chevron-left" size={24} color="#4A5568" />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier le profil</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {[
            { label: 'Nom complet', field: 'name', icon: 'user', type: 'default' },
            { label: 'Email', field: 'email', icon: 'mail', type: 'email-address' },
            { label: 'Téléphone', field: 'phone', icon: 'phone', type: 'phone-pad' },
            { label: 'Adresse', field: 'address', icon: 'map-pin', type: 'default' },
            { label: 'Ville', field: 'city', icon: 'map', type: 'default' },
            { label: 'Code postal', field: 'postalCode', icon: 'hash', type: 'numeric' },
          ].map((item, index) => (
            <View key={index} style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Icon name={item.icon} size={16} color="#718096" style={styles.inputIcon} />
                <Text style={styles.label}>{item.label}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={userInfo[item.field]}
                onChangeText={(text) => handleChange(item.field, text)}
                placeholder={`Entrez votre ${item.label.toLowerCase()}`}
                placeholderTextColor="#A0AEC0"
                keyboardType={item.type}
                autoCapitalize={item.field === 'name' ? 'words' : 'none'}
              />
            </View>
          ))}
        </View>

        {/* Boutons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="save" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Enregistrer les modifications</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.push('/clients/profile')}
          >
            <Icon name="x" size={18} color="#E53E3E" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#1A202C',
  },
  buttonsContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#38A169',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#E53E3E',
  },
});

export default ProfileEditScreen;