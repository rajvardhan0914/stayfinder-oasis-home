import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { toast } from 'sonner';
import { useAuth } from './auth';

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  rating: number;
  reviews: any[];
  owner: {
    firstName: string;
    lastName: string;
  };
}

interface FavoritesContextType {
  favorites: Property[];
  isLoading: boolean;
  addToFavorites: (propertyId: string) => Promise<void>;
  removeFromFavorites: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]); // Clear favorites on logout
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/favorites');
      setFavorites(response.data); // response.data is an array of property objects
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (propertyId: string) => {
    try {
      const response = await api.post(`/users/favorites/${propertyId}`);
      // The backend returns the updated favorites array (property objects)
      setFavorites(response.data);
      toast.success("Property has been added to your favorites.");
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error("Failed to add to favorites. Please try again.");
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    try {
      const response = await api.delete(`/users/favorites/${propertyId}`);
      // The backend returns the updated favorites array (property objects)
      setFavorites(response.data);
      toast.success("Property has been removed from your favorites.");
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error("Failed to remove from favorites. Please try again.");
    }
  };

  const isFavorite = (propertyId: string) => favorites.some(fav => fav._id === propertyId);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      addToFavorites,
      removeFromFavorites,
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}; 