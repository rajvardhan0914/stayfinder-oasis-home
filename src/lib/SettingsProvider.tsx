import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import i18n from '../i18n';
import { useAuth } from './auth';
import api from './api';

// This interface should match the one in Personal.tsx
interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: string;
      showEmail: boolean;
      showPhone: boolean;
    };
  };
}

interface Settings {
  language: string;
  currency: string;
}

interface SettingsContextType {
  formData: UserProfile | null;
  setFormData: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  convertCurrency: (amount: number) => string;
  settings: Settings;
  updateLanguage: (language: string) => void;
  updateCurrency: (currency: string) => void;
}

const defaultSettings: Settings = {
  language: 'en',
  currency: 'INR',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// All currency values are based on an assumed database value in INR
const exchangeRatesFromINR = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings>(() => {
    // Get saved settings from localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsed };
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    return defaultSettings;
  });

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data } = await api.get('/users/profile');
          if (data.dateOfBirth) {
            data.dateOfBirth = data.dateOfBirth.slice(0, 10);
          }
          setFormData(data);
          if (data.preferences) {
            setSettings(prevSettings => ({
              ...prevSettings,
              language: data.preferences.language || prevSettings.language,
              currency: data.preferences.currency || prevSettings.currency,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      } else {
        setFormData(null);
        // Optionally reset settings to default when user logs out
        // setSettings(defaultSettings);
      }
    };
    fetchProfile();
  }, [user]);

  // Save settings to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // Sync i18n language with settings.language
  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const convertCurrency = useCallback((amount: number) => {
    // Always use INR
    const rate = 1;
    const symbol = '₹';
    const convertedAmount = amount * rate;
    return `${symbol}${convertedAmount.toFixed(2)}`;
  }, []);

  const updateLanguage = useCallback((language: string) => {
    setSettings(prev => ({ ...prev, language }));
    if (user) {
      const newPreferences = { ...formData?.preferences, language };
      api.put('/users/profile', { preferences: newPreferences });
    }
  }, [user, formData]);

  const updateCurrency = useCallback((currency: string) => {
    setSettings(prev => ({ ...prev, currency }));
    if (user) {
      const newPreferences = { ...formData?.preferences, currency };
      api.put('/users/profile', { preferences: newPreferences });
    }
  }, [user, formData]);

  const value = useMemo(() => ({ 
    formData, 
    setFormData, 
    convertCurrency, 
    settings, 
    updateLanguage, 
    updateCurrency, 
  }), [formData, settings, convertCurrency, updateLanguage, updateCurrency]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 