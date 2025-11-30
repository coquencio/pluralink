import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { bookingService } from '../../services/booking.service';
import { providerService } from '../../services/provider.service';
import { ServiceProvider } from '../../types/user.types';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type BookingScreenRouteProp = {
  params: {
    providerId: number;
    serviceId: number;
  };
};

type BookingScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Booking'>;

const BookingScreen: React.FC = () => {
  const route = useRoute<BookingScreenRouteProp>();
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const { providerId, serviceId } = route.params;
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  const loadProvider = async () => {
    try {
      const data = await providerService.getProvider(providerId);
      setProvider(data);
    } catch (error) {
      console.error('Failed to load provider:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const booking = await bookingService.createBooking({
        provider_id: providerId,
        service_id: serviceId,
        date: selectedDate,
        start_time: selectedTime,
        notes,
      });
      Alert.alert('Success', 'Booking created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('BookingDetails', { bookingId: booking.id }),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!provider) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const selectedService = provider.services?.find((s) => s.id === serviceId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Appointment</Text>
        <Text style={styles.providerName}>{provider.business_name}</Text>
        {selectedService && (
          <Text style={styles.serviceName}>{selectedService.name}</Text>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />

        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          value={selectedTime}
          onChangeText={setSelectedTime}
        />

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special requests..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  providerName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 16,
    color: '#999',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;

