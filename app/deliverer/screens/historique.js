import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

const HistoriqueLivraisonsScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [filter, setFilter] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');

  const livraisons = [
    {
      id: 'LIV001',
      boutique: 'Boutique A',
      adresseBoutique: '123 Rue de Paris',
      adresseLivraison: '456 Avenue des Champs',
      composition: ['Livre', 'Cahier', 'Stylo'],
      date: '2025-03-16',
      statut: 'livré',
      revenu: 25.50
    },
    {
      id: 'LIV002',
      boutique: 'Boutique B',
      adresseBoutique: '789 Rue de Lyon',
      adresseLivraison: '101 Boulevard de Marseille',
      composition: ['Ordinateur', 'Souris'],
      date: '2025-03-15',
      statut: 'livré',
      revenu: 45.75
    },
    {
      id: 'LIV003',
      boutique: 'Boutique C',
      adresseBoutique: '321 Rue du Nord',
      adresseLivraison: '654 Rue du Sud',
      composition: ['Vêtements'],
      date: '2025-03-14',
      statut: 'annulé',
      revenu: 0
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filteredLivraisons = livraisons.filter(livraison => {
    const matchesFilter = filter === 'tous' || livraison.statut === filter;
    const matchesSearch = 
      livraison.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      livraison.boutique.toLowerCase().includes(searchQuery.toLowerCase()) ||
      livraison.adresseLivraison.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderLivraison = ({ item }) => (
    <View style={styles.livraisonCard}>
      <View style={styles.livraisonIcon}>
        <Icon name="truck" size={20} color="#6B7280" />
      </View>
      <View style={styles.livraisonDetails}>
        <Text style={styles.livraisonId}>#{item.id}</Text>
        <Text style={styles.livraisonAdresse}>{item.adresseLivraison}</Text>
        <Text style={styles.livraisonDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={[
          styles.livraisonStatut,
          { color: item.statut === 'livré' ? '#10B981' : '#F44336' }
        ]}>
          {item.statut.charAt(0).toUpperCase() + item.statut.slice(1)}
        </Text>
        <Text style={styles.livraisonRevenu}>${item.revenu.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        }],
      }]}>
        <LinearGradient
          colors={['#fff', '#F9FAFB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Historique Livraisons</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => alert('Profil')}
            >
              <Icon name="user" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.filtersContainer, { opacity: fadeAnim }]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher (ID, boutique, adresse...)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'tous' && styles.activeFilter]}
              onPress={() => setFilter('tous')}
            >
              <Text style={styles.filterText}>Tous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'livré' && styles.activeFilter]}
              onPress={() => setFilter('livré')}
            >
              <Text style={styles.filterText}>Livrées</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'annulé' && styles.activeFilter]}
              onPress={() => setFilter('annulé')}
            >
              <Text style={styles.filterText}>Annulées</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>
            {filteredLivraisons.length} livraison(s) trouvée(s)
          </Text>
          <FlatList
            data={filteredLivraisons}
            renderItem={renderLivraison}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucune livraison trouvée</Text>
            }
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  profileButton: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    color: '#111827',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  livraisonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  livraisonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  livraisonDetails: {
    flex: 1,
  },
  livraisonId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  livraisonAdresse: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  livraisonDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  livraisonStatut: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  livraisonRevenu: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
});

export default HistoriqueLivraisonsScreen;