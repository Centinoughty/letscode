import { api } from "@/api/axios";
import { create } from "zustand";

interface Code {
  id: string;
  file: {
    id: string;
    name: string;
    ext: string | null;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface Workspace {
  id: string;
  root: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface DashboardState {
  codes: Code[];
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;

  fetchCodes: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  codes: [],
  workspaces: [],
  isLoading: false,
  error: null,

  fetchCodes: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: codeRes, status } = await api.get("/code");

      set({
        codes: codeRes.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: workspaceRes, status } = await api.get("/workspace");

      set({
        workspaces: workspaceRes.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },
}));
