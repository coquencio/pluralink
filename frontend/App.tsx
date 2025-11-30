import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AppNavigator } from './navigation/AppNavigator';
import { searchService } from './services/search.service';

const AppContent: React.FC = () => {
  const { setCategories } = useApp();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categories = await searchService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  return <AppNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AppProvider>
    </AuthProvider>
  );
}

