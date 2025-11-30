import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'client' as 'provider' | 'client',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Pluralink today</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.first_name}
        onChangeText={(text) => setFormData({ ...formData, first_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.last_name}
        onChangeText={(text) => setFormData({ ...formData, last_name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Phone (Optional)"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>I am a:</Text>
        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'client' && styles.roleButtonActive,
          ]}
          onPress={() => setFormData({ ...formData, role: 'client' })}
        >
          <Text
            style={[
              styles.roleButtonText,
              formData.role === 'client' && styles.roleButtonTextActive,
            ]}
          >
            Client
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'provider' && styles.roleButtonActive,
          ]}
          onPress={() => setFormData({ ...formData, role: 'provider' })}
        >
          <Text
            style={[
              styles.roleButtonText,
              formData.role === 'provider' && styles.roleButtonTextActive,
            ]}
          >
            Service Provider
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 15,
  },
  roleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default RegisterScreen;

