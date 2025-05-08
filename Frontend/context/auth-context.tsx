"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  register: (data: RegisterRequest) => Promise<boolean>;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthResponse {
  user: User;
  token: string;
}

// Liste des permissions par rôle
const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    "dashboard:view",
    "dashboard:edit",
    "reports:view",
    "reports:edit",
    "inventory:view",
    "inventory:edit",
    "expenses:view",
    "expenses:edit",
    "employees:view",
    "employees:edit",
    "settings:view",
    "settings:edit",
    "pumps:view",
    "pumps:edit",
    "prices:view",
    "prices:edit",
  ],
  super_admin: ["reports:view", "dashboard:view"],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Fetch current user from API on mount
  useEffect(() => {
    const fetchMe = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem("token");

        console.log("Stored token:", storedToken);
        if (!storedToken) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setIsLoading(false);
    };
    fetchMe();
  }, []);

  // Login using API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data); // fallback for old API
        setToken(data.token);
        localStorage.setItem("token", data.accessToken);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  // Register using API
  const register = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 201) {
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  // Logout by clearing user and token
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    // Optionally call a logout endpoint if implemented
    // fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    router.push("/login");
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, hasPermission, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};
