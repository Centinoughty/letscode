import { create } from "zustand";
import { api } from "@/api/axios";
import { Collaborator } from "@/types/Collaborator";

interface Workspace {
  id: string;
  name: string;
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  editWorkspace: (workspaceId: string, name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    const { isLoading } = useWorkspaceStore.getState();

    if (isLoading) {
      return;
    }

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
      console.log(error);
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
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },

  editWorkspace: async (workspaceId: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: updatedWorkspace, status } = await api.patch(
        `/workspace/${workspaceId}`,
        { name },
      );

      if (status === 200) {
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId
              ? { ...workspace, ...updatedWorkspace.workspace }
              : workspace,
          ),
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.log(error);
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
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },
}));
