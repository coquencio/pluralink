import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { searchService } from '../../services/search.service';
import { providerService } from '../../services/provider.service';
import { ServiceProvider } from '../../types/user.types';
import { Category } from '../../types/api.types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';

type SearchScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Search'>;

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<SearchScreenNavigationProp>();

  useEffect(() => {
    loadCategories();
    loadProviders();
  }, []);

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await searchService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProviders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await searchService.searchProviders(params);
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProvider = ({ item }: { item: ServiceProvider }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => navigation.navigate('ProviderProfile', { providerId: item.id })}
    >
      <Text style={styles.providerName}>{item.business_name}</Text>
      {item.description && (
        <Text style={styles.providerDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      {item.city && (
        <Text style={styles.providerLocation}>
          {item.city}, {item.state}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === null && styles.categoryChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadProviders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  providerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  providerLocation: {
    fontSize: 12,
    color: '#999',
  },
});

export default SearchScreen;

