import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome, {user?.first_name || 'User'}!
        </Text>
        <Text style={styles.subtitle}>
          {user?.role === 'provider'
            ? 'Manage your bookings and availability'
            : 'Find and book services near you'}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionTitle}>Search Services</Text>
          <Text style={styles.actionDescription}>
            Find service providers near you
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.actionTitle}>My Bookings</Text>
          <Text style={styles.actionDescription}>
            View and manage your appointments
          </Text>
        </TouchableOpacity>

        {user?.role === 'provider' && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProviderDashboard')}
          >
            <Text style={styles.actionTitle}>Dashboard</Text>
            <Text style={styles.actionDescription}>
              Manage your business and bookings
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    padding: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;

