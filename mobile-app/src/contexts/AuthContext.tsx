import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useLoginMutation } from '../services/api';
import Toast from 'react-native-toast-message';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // reflects either bootstrapping or active login
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [triggerLogin, { isLoading: isLoggingIn }] = useLoginMutation();

  useEffect(() => {
    void checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (accessToken) {
        setUser({ id: '1', email: 'Jim.okonma@gmail.com' }); // minimal bootstrap
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await triggerLogin({ email, password }).unwrap();
      if (data) {
        const { accessToken, refreshToken } = data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        setUser({ id: '1', email });
        Toast.show({ type: 'success', text1: 'Welcome to Doovo!', text2: 'You have successfully logged in' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Invalid email or password' });
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      Toast.show({ type: 'info', text1: 'Logged Out', text2: 'You have been successfully logged out' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isBootstrapping || isLoggingIn,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
