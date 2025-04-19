
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Get user profile using token
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('foodix_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      // Save token
      localStorage.setItem('token', response.token);
      localStorage.setItem('foodix_token', response.token);
      
      // Get user profile with token
      await fetchUserProfile();
      
      // Routing logic based on user role
      if (user?.role === 'main_admin') {
        toast({
          title: "Logged in as Main Admin!",
          description: `Welcome back, ${user.name}!`,
        });
        window.location.href = '/main-admin';
      } else if (user?.role === 'restaurant') {
        toast({
          title: "Logged in as Restaurant Owner!",
          description: `Welcome back, ${user.name}!`,
        });
        window.location.href = '/admin';
      } else if (user?.role === 'delivery' || user?.role === 'driver') {
        toast({
          title: "Logged in as Delivery Driver!",
          description: `Welcome back, ${user.name}!`,
        });
        window.location.href = '/delivery';
      } else {
        toast({
          title: "Logged in successfully!",
          description: `Welcome back, ${user?.name || 'User'}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        username: name,
        email,
        password,
        role
      });
      
      // Save token
      localStorage.setItem('token', response.token);
      localStorage.setItem('foodix_token', response.token);
      
      await fetchUserProfile();
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('foodix_token');
    toast({
      title: "Logged out successfully!",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
