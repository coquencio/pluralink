import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { bookingService } from '../../services/booking.service';
import { Booking } from '../../types/booking.types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';

type ProviderDashboardScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'ProviderDashboard'
>;

const ProviderDashboardScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProviderDashboardScreenNavigationProp>();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Manage your bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookings yet</Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            style={styles.bookingCard}
            onPress={() =>
              navigation.navigate('BookingDetails', { bookingId: booking.id })
            }
          >
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingService}>
                {booking.service?.name || 'Service'}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) },
                ]}
              >
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>
            <Text style={styles.bookingClient}>
              Client: {booking.client?.user?.first_name}{' '}
              {booking.client?.user?.last_name}
            </Text>
            <Text style={styles.bookingDate}>
              {formatDate(booking.date)} at {formatTime(booking.start_time)}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingService: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProviderDashboardScreen;

