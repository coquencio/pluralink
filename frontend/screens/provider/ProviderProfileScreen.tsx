import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { providerService } from '../../services/provider.service';
import { ServiceProvider } from '../../types/user.types';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../context/AuthContext';

type ProviderProfileScreenRouteProp = {
  params: {
    providerId: number;
  };
};

type ProviderProfileScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'ProviderProfile'
>;

const ProviderProfileScreen: React.FC = () => {
  const route = useRoute<ProviderProfileScreenRouteProp>();
  const navigation = useNavigation<ProviderProfileScreenNavigationProp>();
  const { user } = useAuth();
  const { providerId } = route.params;
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  const loadProvider = async () => {
    try {
      const data = await providerService.getProvider(providerId);
      setProvider(data);
    } catch (error) {
      console.error('Failed to load provider:', error);
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

  if (!provider) {
    return (
      <View style={styles.container}>
        <Text>Provider not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.businessName}>{provider.business_name}</Text>
        {provider.description && (
          <Text style={styles.description}>{provider.description}</Text>
        )}
        {provider.city && (
          <Text style={styles.location}>
            {provider.city}, {provider.state}
          </Text>
        )}
      </View>

      {provider.services && provider.services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {provider.services.map((service) => (
            <View key={service.id} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>${service.price}</Text>
              <Text style={styles.serviceDuration}>{service.duration} min</Text>
            </View>
          ))}
        </View>
      )}

      {user?.role === 'client' && provider.services && provider.services.length > 0 && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate('Booking', {
              providerId: provider.id,
              serviceId: provider.services![0].id,
            })
          }
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
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
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceName: {
    fontSize: 16,
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProviderProfileScreen;

