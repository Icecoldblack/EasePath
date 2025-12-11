import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  picture: string;
  googleId?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);

  const login = (userData: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', token);
    // Also store email separately for extension sync
    localStorage.setItem('easepath_user_email', userData.email);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('easepath_user_email');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, getToken }}>
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
