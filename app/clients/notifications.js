import React, { useState } from 'react';
import { StyleSheet, StatusBar, FlatList, View } from 'react-native';
import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Layout,
  Text,
  Card,
  Button,
} from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NotificationsScreen = () => {
  const router = useRouter();

  // Exemple de données de notifications (vous pouvez les remplacer par une API)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Commande Confirmée',
      description: 'Votre commande #1234 a été confirmée avec succès.',
      icon: 'checkmark-circle-outline',
      date: '28 Mars 2025, 14:30',
    },
    {
      id: '2',
      title: 'Nouveau Message',
      description: 'Vous avez reçu un message de Sophie.',
      icon: 'chatbubble-outline',
      date: '28 Mars 2025, 10:15',
    },
    {
      id: '3',
      title: 'Mise à jour disponible',
      description: 'Une nouvelle version de l’app est disponible.',
      icon: 'alert-circle-outline',
      date: '27 Mars 2025, 09:00',
    },
  ]);

  // Rendu de chaque notification
  const renderNotification = ({ item }) => (
    <Card style={styles.notificationCard}>
      <View style={styles.notificationContent}>
        <Ionicons name={item.icon} size={30} color="#38B2AC" style={styles.notificationIcon} />
        <View style={styles.notificationText}>
          <Text category="s1" style={styles.notificationTitle}>
            {item.title}
          </Text>
          <Text category="p2" appearance="hint">
            {item.description}
          </Text>
          <Text category="c1" appearance="hint" style={styles.notificationDate}>
            {item.date}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <Layout style={styles.header} level="1">
          <Ionicons name="notifications-outline" size={70} color="#38B2AC" />
          <Text category="h4" style={styles.headerTitle}>
            Notifications
          </Text>
          <Text category="p2" style={styles.headerSubtitle}>
            Vos dernières mises à jour
          </Text>
        </Layout>

        {/* Liste des notifications */}
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          style={styles.notificationList}
          ListEmptyComponent={
            <Text category="p1" appearance="hint" style={styles.emptyText}>
              Aucune notification pour le moment.
            </Text>
          }
        />

        {/* Bouton Retour */}
        <Button
          style={styles.backButton}
          onPress={() => router.back()}
          accessoryLeft={() => <Ionicons name="arrow-back-outline" size={24} color="#FFF" />}
        >
          Retour
        </Button>
      </Layout>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
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
  notificationList: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
  },
  notificationCard: {
    marginBottom: 15,
    borderRadius: 10,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    padding: 10,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    color: '#2D3748',
    fontWeight: '600',
  },
  notificationDate: {
    marginTop: 5,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#38B2AC',
    borderColor: '#38B2AC',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#38B2AC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default NotificationsScreen;