import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { bookingService } from '../../services/booking.service';
import { Booking } from '../../types/booking.types';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';

type BookingDetailsScreenRouteProp = {
  params: {
    bookingId: number;
  };
};

type BookingDetailsScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'BookingDetails'
>;

const BookingDetailsScreen: React.FC = () => {
  const route = useRoute<BookingDetailsScreenRouteProp>();
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const { user } = useAuth();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const data = await bookingService.getBooking(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Failed to load booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Details</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status) },
          ]}
        >
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service</Text>
        <Text style={styles.sectionText}>{booking.service?.name}</Text>
        <Text style={styles.sectionSubtext}>
          ${booking.service?.price} • {booking.service?.duration} minutes
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date & Time</Text>
        <Text style={styles.sectionText}>
          {formatDate(booking.date)} at {formatTime(booking.start_time)}
        </Text>
        <Text style={styles.sectionSubtext}>
          Duration: {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
        </Text>
      </View>

      {user?.role === 'client' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider</Text>
          <Text style={styles.sectionText}>
            {booking.provider?.business_name}
          </Text>
          {booking.provider?.city && (
            <Text style={styles.sectionSubtext}>
              {booking.provider.city}, {booking.provider.state}
            </Text>
          )}
        </View>
      )}

      {user?.role === 'provider' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.sectionText}>
            {booking.client?.user?.first_name} {booking.client?.user?.last_name}
          </Text>
          {booking.client?.user?.email && (
            <Text style={styles.sectionSubtext}>
              {booking.client.user.email}
            </Text>
          )}
        </View>
      )}

      {booking.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.sectionText}>{booking.notes}</Text>
        </View>
      )}

      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'completed' && !booking.review && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('Review', { bookingId: booking.id })}
        >
          <Text style={styles.reviewButtonText}>Leave a Review</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  sectionText: {
    fontSize: 18,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    padding: 20,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingDetailsScreen;

