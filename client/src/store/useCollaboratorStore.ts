import { create } from "zustand";
import { api } from "@/api/axios";
import { CollabRole } from "@/types/CollabRole";

interface AddCollabPayload {
  codeId: string;
  collabEmails: string[];
  collabRole: CollabRole;
}

interface CollabStore {
  isLoading: boolean;
  error: string | null;

  addCollaborators: (payload: AddCollabPayload) => Promise<void>;
}

export const useCollaboratorStore = create<CollabStore>((set) => ({
  isLoading: false,
  error: null,

  addCollaborators: async ({ codeId, collabEmails, collabRole }) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/collaborator/${codeId}/add`, {
        collabEmails,
        collabRole,
      });
    } catch (error) {
      console.log(error);
      set({ error: "error" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
