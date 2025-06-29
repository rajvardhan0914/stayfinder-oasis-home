import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "./api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'host' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      try {
        if (token) {
          await refreshUserProfile();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Token might be invalid, so clear it
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      
      // Fetch full profile after login
      await refreshUserProfile();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem("token", token);
      
      // Fetch full profile after registration
      await refreshUserProfile();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        await api.put("/users/profile", userData);
        await refreshUserProfile();
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 