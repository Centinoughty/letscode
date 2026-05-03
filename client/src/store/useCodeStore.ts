import { api } from "@/api/axios";
import { create } from "zustand";

interface Code {
  id: string;
  name: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface CodeState {
  codes: Code[];
  isLoading: boolean;
  error: string | null;

  fetchCodes: () => Promise<void>;
  createCode: (name: string, language: string) => Promise<void>;
  editCode: (codeId: string, name: string) => Promise<void>;
  deleteCode: (codeId: string) => Promise<void>;
}

export const useCodeStore = create<CodeState>((set) => ({
  codes: [],
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

  editCode: async (codeId: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: updatedCode, status } = await api.patch(`/code/${codeId}`, {
        name,
      });

      if (status === 200) {
        set((state) => ({
          codes: state.codes.map((code) =>
            code.id === codeId ? { ...code, ...updatedCode.code } : code,
          ),
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },

  deleteCode: async (codeId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { status } = await api.delete(`/code/${codeId}`);

      if (status === 200) {
        set((state) => ({
          codes: state.codes.filter((ws) => ws.id !== codeId),
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      set({ error: "error", isLoading: false });
    }
  },
}));
