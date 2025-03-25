import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const DeliveryScreen = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // États
  const [selectedOption, setSelectedOption] = useState(null);
  const [customAddress, setCustomAddress] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [customSuggestions, setCustomSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Simulation d'une API pour récupérer les options de livraison
  const fetchDeliveryOptions = async () => {
    try {
      setLoading(true);
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { id: '1', type: 'Domicile', address: '12 Rue des Lilas, 75001 Paris', details: 'Livraison à votre porte' },
            { id: '2', type: 'Point relais', address: 'Relay Shop - 45 Avenue du Général, 75003 Paris', details: 'Ouvert de 9h à 19h' },
            { id: '3', type: 'Domicile', address: '78 Boulevard Saint-Michel, 75005 Paris', details: 'Livraison à votre porte' },
            { id: '4', type: 'Point relais', address: 'Locker Station - 22 Rue de Rivoli, 75004 Paris', details: 'Disponible 24/7' },
            { id: '5', type: 'Domicile', address: '15 Avenue des Champs-Élysées, 75008 Paris', details: 'Livraison à votre porte' },
          ]);
        }, 1000);
      });
      setDeliveryOptions(response);
      setError(null);
    } catch (err) {
      console.error('Erreur API:', err);
      setError('Impossible de charger les options de livraison');
    } finally {
      setLoading(false);
    }
  };

  // Simulation d'une API pour les suggestions d'adresses personnalisées
  const fetchCustomSuggestions = async (query) => {
    if (!query.trim()) {
      setCustomSuggestions([]);
      return;
    }
    try {
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { id: `${Date.now()}-1`, address: `${query}, 75001 Paris`, type: 'Domicile', details: 'Livraison à votre porte' },
            { id: `${Date.now()}-2`, address: `${query}, 75003 Paris`, type: 'Domicile', details: 'Livraison à votre porte' },
            { id: `${Date.now()}-3`, address: `${query} - Point Relais`, type: 'Point relais', details: 'Ouvert de 9h à 19h' },
          ]);
        }, 500);
      });
      setCustomSuggestions(response);
    } catch (err) {
      console.error('Erreur suggestions:', err);
      setCustomSuggestions([]);
    }
  };

  useEffect(() => {
    fetchDeliveryOptions();
  }, []);

  // Mettre à jour les suggestions quand customAddress change
  useEffect(() => {
    fetchCustomSuggestions(customAddress);
    setIsDropdownVisible(customAddress.trim().length > 0);
  }, [customAddress]);

  const handleSelectSuggestion = (suggestion) => {
    setDeliveryOptions(prev => [...prev, suggestion]);
    setSelectedOption(suggestion);
    setCustomAddress('');
    setIsDropdownVisible(false);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      console.log('Lieu de livraison confirmé:', selectedOption);
      router.push('clients/PaymentScreen');
    } else {
      console.log('Aucun lieu de livraison sélectionné');
    }
  };

  const renderDeliveryOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        selectedOption?.id === option.id && styles.optionCardSelected,
      ]}
      onPress={() => setSelectedOption(option)}
      activeOpacity={0.8}
    >
      <View style={styles.optionContent}>
        <Icon
          name={option.type === 'Domicile' ? 'home' : 'map-pin'}
          size={24}
          color={selectedOption?.id === option.id ? '#2ecc71' : '#666'}
          style={styles.optionIcon}
        />
        <View style={styles.optionDetails}>
          <Text style={styles.optionType}>{option.type}</Text>
          <Text style={styles.optionAddress}>{option.address}</Text>
          <Text style={styles.optionInfo}>{option.details}</Text>
        </View>
        {selectedOption?.id === option.id && (
          <Icon name="check" size={20} color="#2ecc71" style={styles.checkIcon} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSuggestion = (suggestion) => (
    <TouchableOpacity
      key={suggestion.id}
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion.address}</Text>
      <Text style={styles.suggestionSubText}>{suggestion.type}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: width * 0.04 }]}
        showsVerticalScrollIndicator={true}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { fontSize: width > 600 ? 28 : 24 }]}>
          Choisir un lieu de livraison
        </Text>

        {/* Champ personnalisé avec liste déroulante */}
        <View style={styles.customAddressSection}>
          <Text style={styles.sectionTitle}>Adresse personnalisée</Text>
          <View style={styles.customAddressInputContainer}>
            <TextInput
              style={styles.customAddressInput}
              placeholder="Entrez ou cherchez une adresse..."
              value={customAddress}
              onChangeText={setCustomAddress}
              placeholderTextColor="#666"
              onFocus={() => setIsDropdownVisible(true)}
            />
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          </View>
          {isDropdownVisible && customSuggestions.length > 0 && (
            <View style={styles.dropdown}>
              {customSuggestions.map(renderSuggestion)}
            </View>
          )}
        </View>

        {/* Liste des options de livraison */}
        <View style={styles.optionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#2ecc71" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : deliveryOptions.length > 0 ? (
            deliveryOptions.map(renderDeliveryOption)
          ) : (
            <Text style={styles.noResultsText}>Aucune option disponible</Text>
          )}
        </View>

        {/* Bouton de confirmation */}
        <TouchableOpacity
          style={[styles.confirmButton, !selectedOption && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!selectedOption}
        >
          <LinearGradient
            colors={selectedOption ? ['#2ecc71', '#27ae60'] : ['#ccc', '#bbb']}
            style={styles.buttonGradient}
          >
            <Icon
              name="truck"
              size={22}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', label: 'Home', route: '/clients/home' },
          { icon: 'search', label: 'Search', route: '/clients/shops' },
          { icon: 'shopping-cart', label: 'Cart', route: '/clients/cart' },
          { icon: 'user', label: 'Profile', route: '/clients/profile' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Icon name={item.icon} size={24} color="#2ecc71" />
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
  },
  pageTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  customAddressSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  customAddressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  customAddressInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    position: 'absolute',
    right: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    elevation: 5,
    zIndex: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionSubText: {
    fontSize: 12,
    color: '#666',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionDetails: {
    flex: 1,
  },
  optionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  optionAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  optionInfo: {
    fontSize: 12,
    color: '#999',
  },
  checkIcon: {
    marginLeft: 10,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
  },
  confirmButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    marginBottom: 20,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 50,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: '#2ecc71',
    marginTop: 4,
  },
});

export default DeliveryScreen;