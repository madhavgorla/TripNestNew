import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  loginWithGoogle: (payload?: { email?: string; fullName?: string; avatarUrl?: string }) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tripnest_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('tripnest_token') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If token exists, load me
    if (token) {
      api.getCurrentUser()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('tripnest_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.accessToken);
        localStorage.setItem('tripnest_token', res.data.accessToken);
        localStorage.setItem('tripnest_user', JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.accessToken);
        localStorage.setItem('tripnest_token', res.data.accessToken);
        localStorage.setItem('tripnest_user', JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload?: { email?: string; fullName?: string; avatarUrl?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.accessToken);
        localStorage.setItem('tripnest_token', res.data.accessToken);
        localStorage.setItem('tripnest_user', JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tripnest_token');
    localStorage.removeItem('tripnest_user');
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    let updatedUser: User = { ...user, role: newRole };
    if (newRole === 'ADMIN') {
      updatedUser = {
        ...updatedUser,
        id: 'usr-admin',
        fullName: 'TripNest Admin',
        email: 'admin@tripnest.com',
      };
    } else if (newRole === 'GROUP_ADMIN') {
      updatedUser = {
        ...updatedUser,
        id: 'usr-2',
        fullName: 'Madhav Sharma',
        email: 'madhav@tripnest.com',
      };
    } else {
      updatedUser = {
        ...updatedUser,
        id: 'usr-1',
        fullName: 'Lara Croft',
        email: 'lara@tripnest.com',
      };
    }
    setUser(updatedUser);
    localStorage.setItem('tripnest_token', `jwt_token_${updatedUser.id}`);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginWithGoogle, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
