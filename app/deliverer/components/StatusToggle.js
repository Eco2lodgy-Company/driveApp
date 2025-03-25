import { View, Text, StyleSheet, Switch } from 'react-native';

export default function StatusToggle({ isActive, onToggle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status: {isActive ? 'En service' : 'Au repos'}
      </Text>
      <Switch
        value={isActive}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isActive ? '#007AFF' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
});