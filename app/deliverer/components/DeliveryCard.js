import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, DollarSign } from 'lucide-react-native';

export default function DeliveryCard({ delivery, onAccept, onCancel }) {
  return (
    <TouchableOpacity style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.restaurantName}>{delivery.restaurant}</Text>
        <Text style={[
          styles.statusBadge,
          delivery.status === 'available' ? styles.statusAvailable : styles.statusInProgress
        ]}>
          {delivery.status === 'available' ? 'Disponible' : 'En cours'}
        </Text>
      </View>

      <View style={styles.deliveryInfo}>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#8E8E93" />
          <Text style={styles.infoText}>{delivery.destination} • {delivery.distance}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color="#8E8E93" />
          <Text style={styles.infoText}>{delivery.time}</Text>
        </View>
        <View style={styles.infoRow}>
          <DollarSign size={16} color="#8E8E93" />
          <Text style={styles.infoText}>{delivery.price}</Text>
        </View>
      </View>

      {delivery.status === 'available' ? (
        <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(delivery)}>
          <Text style={styles.acceptButtonText}>Accepter la livraison</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(delivery)}>
          <Text style={styles.cancelButtonText}>Annuler la livraison</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  statusAvailable: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusInProgress: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  deliveryInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#8E8E93',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});