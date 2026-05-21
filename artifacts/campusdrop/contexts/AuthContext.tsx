import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "student" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  plateNumber?: string;
  approved?: boolean;
  rating: number;
  totalRides: number;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  plateNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "@campusdrop:currentUser";
const USERS_KEY = "@campusdrop:users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((stored) => { if (stored) setUser(JSON.parse(stored)); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const users: Array<User & { password: string }> = stored ? JSON.parse(stored) : [];
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error("Invalid email or password");
    const { password: _pw, ...userData } = found;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const users: Array<User & { password: string }> = stored ? JSON.parse(stored) : [];
    if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const newUser: User & { password: string } = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.password,
      plateNumber: data.plateNumber,
      approved: data.role === "driver" ? true : undefined,
      rating: 5.0,
      totalRides: 0,
    };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const { password: _pw, ...userData } = newUser;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);

    const stored = await AsyncStorage.getItem(USERS_KEY);
    const users: Array<User & { password: string }> = stored ? JSON.parse(stored) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
