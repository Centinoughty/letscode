import { api } from "@/api/axios";
import { create } from "zustand";

interface Code {
  id: string;
  name: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardState {
  codes: Code[];
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;

  fetchCodes: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;

  createCode: (name: string, language: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
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

      console.log(codeRes);
      if (status === 200) {
        set({
          codes: codeRes.codes,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: workspaceRes, status } = await api.get("/workspace");

      console.log(workspaceRes);
      if (status === 200) {
        set({
          workspaces: workspaceRes.workspaces,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },

  createCode: async (name: string, language: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.post("/code", { name, language });

      if (status === 201) {
        const newCode = data.code;
        set((state) => ({
          codes: [newCode, ...state.codes],
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },

  createWorkspace: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, status } = await api.post("/workspace", { name });

      if (status === 201) {
        const newWorkspace = data.workspace;
        set((state) => ({
          workspaces: [newWorkspace, ...state.workspaces],
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },
}));
