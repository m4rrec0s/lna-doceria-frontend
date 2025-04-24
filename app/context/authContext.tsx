"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { User } from "../types/user";
import { LoadingDots } from "../components/LoadingDots";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedUserJson =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedToken && storedUserJson) {
      setToken(storedToken);
      setUser(JSON.parse(storedUserJson));
    }
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "https://lna-doceria-backend.vercel.app/login",
        {
          email,
          password,
        }
      );
      const { token, user } = response.data;

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (!isInitialized) {
    return (
      <section className="flex justify-center items-center h-full">
        <LoadingDots />
      </section>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
