import { api } from "@/api/axios";
import axios from "axios";
import { create } from "zustand";
import { useCodeStore } from "./useCodeStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

interface User {
  name?: string;
  email: string;
  avatar?: string;
  is_google: boolean;
  is_verified: boolean;
  is_admin: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthChecked: boolean;

  errorFrom: string | null;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;

  getUser: () => Promise<void>;
  editProfile: (name: string) => Promise<void>;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthChecked: false,
  error: null,
  errorFrom: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true,
        error: null,
      });
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      set({
        error: message,
        isLoading: false,
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
        errorFrom: "login",
      });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post("auth/register", {
        name,
        email,
        password,
      });

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true,
        error: null,
        errorFrom: "register",
      });
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      set({
        error: message,
        isLoading: false,
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
      });
    }
  },

  loginWithGoogle: async (code: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post("/auth/google", { code });

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true,
        error: null,
      });
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      set({
        error: message,
        isLoading: false,
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
        errorFrom: "google",
      });
    }
  },

  getUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.get("/user/me");

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecked: true,
        error: null,
      });
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      set({
        error: message,
        isLoading: false,
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
      });
    }
  },

  editProfile: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.patch("/user/me", { name });

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false, isAuthChecked: true });

    try {
      await api.post("/auth/logout");

      useCodeStore.getState().reset();
      useWorkspaceStore.getState().reset();
    } catch (error) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }

      set({
        error: message,
        isLoading: false,
        user: null,
        isAuthenticated: false,
        isAuthChecked: true,
      });
    }
  },
}));
