import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { providerService } from '../../services/provider.service';
import { Availability, CreateAvailabilityRequest } from '../../types/provider.types';
import { DAYS_OF_WEEK } from '../../utils/constants';

const AvailabilityScreen: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateAvailabilityRequest>({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
  });

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      const data = await providerService.getMyAvailabilities();
      setAvailabilities(data);
    } catch (error) {
      console.error('Failed to load availabilities:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await providerService.createAvailability(formData);
      Alert.alert('Success', 'Availability created successfully');
      setShowForm(false);
      loadAvailabilities();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create availability');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Availability</Text>
        <Text style={styles.subtitle}>Set your available time slots</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.addButtonText}>
          {showForm ? 'Cancel' : '+ Add Availability'}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.label}>Day of Week</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DAYS_OF_WEEK.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  formData.day_of_week === index && styles.dayButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, day_of_week: index })}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    formData.day_of_week === index && styles.dayButtonTextActive,
                  ]}
                >
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Start Time</Text>
          <TextInput
            style={styles.input}
            value={formData.start_time}
            onChangeText={(text) => setFormData({ ...formData, start_time: text })}
            placeholder="HH:MM"
          />

          <Text style={styles.label}>End Time</Text>
          <TextInput
            style={styles.input}
            value={formData.end_time}
            onChangeText={(text) => setFormData({ ...formData, end_time: text })}
            placeholder="HH:MM"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
            <Text style={styles.submitButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      {availabilities.map((availability) => (
        <View key={availability.id} style={styles.availabilityCard}>
          <Text style={styles.availabilityDay}>
            {DAYS_OF_WEEK[availability.day_of_week]}
          </Text>
          <Text style={styles.availabilityTime}>
            {availability.start_time} - {availability.end_time}
          </Text>
          <Text style={styles.availabilityStatus}>
            {availability.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      ))}
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
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  dayButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  availabilityCard: {
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
  availabilityDay: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  availabilityTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  availabilityStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default AvailabilityScreen;

