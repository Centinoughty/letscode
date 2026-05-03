import { api } from "@/api/axios";
import { create } from "zustand";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  isLoading: false,
  error: null,

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

  deleteWorkspace: async (workspaceId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { status } = await api.delete(`/workspace/${workspaceId}`);

      if (status === 200) {
        set((state) => ({
          workspaces: state.workspaces.filter((ws) => ws.id !== workspaceId),
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },
}));
