import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  clearSessionExpiredToast: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string, role: string, department?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const defaultUser: User = {
  id: 2,
  email: 'dr.nazim@niet.ac.in',
  full_name: 'Dr. Mohd. Nazim, MD',
  role: 'doctor',
  department: 'Cardiology',
  is_active: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('aegis_token') || 'demo-jwt-token');
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('aegis_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    const handleExpiry = () => {
      logout();
      setSessionExpired(true);
    };

    window.addEventListener('aegis:session-expired', handleExpiry);
    return () => window.removeEventListener('aegis:session-expired', handleExpiry);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.post<{ access_token: string; refresh_token: string; user: User }>('/auth/login', {
        email,
        password: pass,
      });
      localStorage.setItem('aegis_token', data.access_token);
      localStorage.setItem('aegis_refresh_token', data.refresh_token);
      localStorage.setItem('aegis_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      setSessionExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    pass: string,
    fullName: string,
    userRole: string,
    department: string = 'General Medicine'
  ) => {
    setIsLoading(true);
    try {
      const newUser = await api.post<User>('/auth/register', {
        email,
        password: pass,
        full_name: fullName,
        role: userRole.toLowerCase(),
        department,
      });
      // After registration, auto-login
      await login(email, pass);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_refresh_token');
    localStorage.removeItem('aegis_user');
    setToken(null);
    setUser(null);
  };

  const clearSessionExpiredToast = () => {
    setSessionExpired(false);
  };

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const data = await api.post<{ access_token: string; refresh_token: string; user: User }>(
        `/auth/demo-switch/${targetRole}`
      );
      localStorage.setItem('aegis_token', data.access_token);
      localStorage.setItem('aegis_refresh_token', data.refresh_token);
      localStorage.setItem('aegis_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      setSessionExpired(false);
    } catch {
      // Local fallback
      const roleMockUsers: Record<UserRole, User> = {
        admin: {
          id: 1,
          email: 'admin@niet.ac.in',
          full_name: 'Administrator - NIET AI Labs',
          role: 'admin',
          department: 'Hospital Operations',
          is_active: true,
        },
        doctor: {
          id: 2,
          email: 'dr.nazim@niet.ac.in',
          full_name: 'Dr. Mohd. Nazim, MD',
          role: 'doctor',
          department: 'Cardiology',
          is_active: true,
        },
        staff: {
          id: 3,
          email: 'nurse.priya@niet.ac.in',
          full_name: 'Priya Sharma, RN',
          role: 'staff',
          department: 'Emergency',
          is_active: true,
        },
      };
      const fallbackUser = roleMockUsers[targetRole];
      setUser(fallbackUser);
      localStorage.setItem('aegis_user', JSON.stringify(fallbackUser));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: (user?.role?.toLowerCase() as UserRole) || 'doctor',
        isAuthenticated: !!user,
        isLoading,
        sessionExpired,
        clearSessionExpiredToast,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
