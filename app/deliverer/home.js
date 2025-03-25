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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

const LivraisonsScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const stats = {
    revenuJournee: 245.75, // Revenu de la journée
    livraisonsEnAttente: 3, // Nombre de livraisons en attente
  };

  const livraisons = [
    {
      id: 'LIV001',
      boutique: 'Boutique A',
      adresseBoutique: '123 Rue de Paris',
      adresseLivraison: '456 Avenue des Champs',
      composition: ['Livre', 'Cahier', 'Stylo'],
      date: 'Aujourd’hui',
    },
    {
      id: 'LIV002',
      boutique: 'Boutique B',
      adresseBoutique: '789 Rue de Lyon',
      adresseLivraison: '101 Boulevard de Marseille',
      composition: ['Ordinateur', 'Souris'],
      date: 'Hier',
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

  const handlePrendreLivraison = () => {
    alert(`Vous avez pris la livraison #${selectedLivraison.id}`);
    setModalVisible(false);
  };

  const handleLaisserLivraison = () => {
    alert(`Vous avez laissé la livraison #${selectedLivraison.id}`);
    setModalVisible(false);
  };

  const renderLivraison = ({ item }) => (
    <TouchableOpacity
      style={styles.livraisonCard}
      onPress={() => {
        setSelectedLivraison(item);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.livraisonIcon}>
        <Icon name="truck" size={20} color="#6B7280" />
      </View>
      <View style={styles.livraisonDetails}>
        <Text style={styles.livraisonId}>#{item.id}</Text>
        <Text style={styles.livraisonAdresse}>{item.adresseLivraison}</Text>
        <Text style={styles.livraisonDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Livraisons</Text>
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
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${stats.revenuJournee.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Revenu de la journée</Text>
            <Icon name="dollar-sign" size={20} color="#10B981" style={styles.statIcon} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.livraisonsEnAttente}</Text>
            <Text style={styles.statLabel}>En attente</Text>
            <Icon name="clock" size={20} color="#F59E0B" style={styles.statIcon} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Livraisons disponibles</Text>
          <FlatList
            data={livraisons}
            renderItem={renderLivraison}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Détails de la livraison #{selectedLivraison?.id}</Text>

            {/* Lieu de la boutique */}
            <View style={styles.infoSection}>
              <Icon name="shopping-bag" size={18} color="#4CAF50" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Boutique</Text>
                <Text style={styles.infoText}>{selectedLivraison?.boutique}</Text>
                <Text style={styles.infoSubText}>{selectedLivraison?.adresseBoutique}</Text>
              </View>
            </View>

            {/* Lieu de livraison */}
            <View style={styles.infoSection}>
              <Icon name="map-pin" size={18} color="#F59E0B" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Lieu de livraison</Text>
                <Text style={styles.infoText}>{selectedLivraison?.adresseLivraison}</Text>
              </View>
            </View>

            {/* Composition du colis */}
            <View style={styles.infoSection}>
              <Icon name="package" size={18} color="#3B82F6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Composition du colis</Text>
                {selectedLivraison?.composition.map((item, index) => (
                  <Text key={index} style={styles.infoSubText}>- {item}</Text>
                ))}
              </View>
            </View>

            {/* Boutons Prendre/Laisser */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.takeButton]}
                onPress={handlePrendreLivraison}
              >
                <Text style={styles.buttonText}>Prendre la livraison</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.leaveButton]}
                onPress={handleLaisserLivraison}
              >
                <Text style={styles.buttonText}>Laisser la livraison</Text>
              </TouchableOpacity>
            </View>

            {/* Bouton Fermer */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statIcon: {
    marginTop: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  infoSubText: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  takeButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LivraisonsScreen;