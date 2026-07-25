import { create } from "zustand";
import { api } from "@/api/axios";
import { Collaborator } from "@/types/Collaborator";

interface Code {
  id: string;
  name: string;
  language: string;
  content?: string;
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
}

interface CodeState {
  codes: Code[];

  hasFetched: boolean;
  isLoading: boolean;
  error: string | null;

  fetchCodes: () => Promise<void>;

  getCode: (codeId: string) => Promise<Code | null>;
  createCode: (name: string, language: string) => Promise<void>;
  editCode: (codeId: string, name: string) => Promise<void>;
  deleteCode: (codeId: string) => Promise<void>;
  runCode: (
    codeId: string,
    code: string,
    stdin: string,
  ) => Promise<{ stdout: string; stderr: string }>;

  reset: () => void;
}

export const useCodeStore = create<CodeState>((set) => ({
  codes: [],
  hasFetched: false,
  isLoading: false,
  error: null,

  fetchCodes: async () => {
    const { hasFetched, isLoading } = useCodeStore.getState();

    if (hasFetched || isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data: codeRes, status } = await api.get("/code");

      if (status === 200) {
        set({
          codes: codeRes.codes,
          isLoading: false,
          hasFetched: true,
        });
      }
    } catch (error) {
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },

  getCode: async (codeId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.get(`/code/${codeId}`);

      set({ isLoading: false });
      return data.code;
    } catch (error) {
      console.log(error);
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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      set({ error: "error", isLoading: false });
    }
  },

  runCode: async (codeId: string, code: string, stdin: string) => {
    try {
      const { data, status } = await api.post(`/code/${codeId}/run`, {
        stdin,
        code,
      });

      if (status === 200) {
        return {
          stdout: data.stdout ?? "",
          stderr: data.stderr ?? "",
        };
      }
    } catch (error) {
      console.log(error);
    }

    return {
      stdout: "",
      stderr: "Execution failed",
    };
  },

  reset: () => {
    set({
      codes: [],
      hasFetched: false,
      isLoading: false,
      error: null,
    });
  },
}));
