import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from '../types/api.types';

interface AppContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <AppContext.Provider
      value={{
        categories,
        setCategories,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

