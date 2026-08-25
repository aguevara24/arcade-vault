"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  name: string;
}

interface UserContextValue {
  user: User | null;
  login: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("av_user") || "null");
      setUser(stored);
    } catch {
      setUser(null);
    }
  }, []);

  const login = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("av_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("av_user");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("av_user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
