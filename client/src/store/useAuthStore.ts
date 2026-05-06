import { api } from "@/api/axios";
import { create } from "zustand";

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
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.post("/auth/login", {
        email,
        password,
      });

      set({ isLoading: false });

      if (status == 200) {
        set({
          user: data.user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.post("auth/register", {
        name,
        email,
        password,
      });

      set({ isLoading: false });

      if (status == 201) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },

  loginWithGoogle: async (code: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.post("/auth/google", { code });

      set({ isLoading: false });

      if (status === 200) {
        set({
          user: data.user,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },

  getUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.get("/user/me");

      set({ isLoading: false });

      if (status === 200) {
        set({
          user: data.user,
          error: null,
        });
      }
    } catch (error) {
      console.log(error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  editProfile: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.patch("/user/me");

      set({ isLoading: false });

      if (status === 200) {
        set({
          user: data.user,
          error: null,
        });
      }
    } catch (error) {
      console.log(error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log(error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
