import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NamespaceState {
  topK: number;
  rerankLimit: number;
  systemPrompt: string | null;
  temperature: number;
}

interface ChatState {
  namespaces: Record<string, NamespaceState>;
}

interface ChatActions {
  getNamespace: (namespaceId: string) => NamespaceState;
  setSystemPrompt: (namespaceId: string, systemPrompt: string | null) => void;
  setTemperature: (namespaceId: string, temperature: number) => void;
  setTopK: (namespaceId: string, topK: number) => void;
  setRerankLimit: (namespaceId: string, rerankLimit: number) => void;
  reset: (namespaceId: string) => NamespaceState;
}

type ChatSettings = ChatState & ChatActions;

const defaultState: NamespaceState = {
  topK: 15,
  rerankLimit: 5,
  systemPrompt: null,
  temperature: 0,
};

const updateNamespace = (
  state: ChatSettings,
  namespaceId: string,
  update: Partial<NamespaceState>,
) =>
  ({
    namespaces: {
      ...state.namespaces,
      [namespaceId]: {
        ...state.namespaces[namespaceId],
        ...(update as NamespaceState),
      },
    },
  }) satisfies ChatState;

export const useChatSettings = create<ChatSettings>()(
  persist(
    (set, get) => ({
      namespaces: {},
      getNamespace: (namespaceId: string) => {
        const state = get();
        return state.namespaces[namespaceId] ?? defaultState;
      },
      setTopK: (namespaceId: string, topK: number) =>
        set((state) => updateNamespace(state, namespaceId, { topK })),
      setRerankLimit: (namespaceId: string, rerankLimit: number) =>
        set((state) => updateNamespace(state, namespaceId, { rerankLimit })),
      setSystemPrompt: (namespaceId: string, systemPrompt: string | null) =>
        set((state) => updateNamespace(state, namespaceId, { systemPrompt })),
      setTemperature: (namespaceId: string, temperature: number) =>
        set((state) => updateNamespace(state, namespaceId, { temperature })),
      reset: (namespaceId: string) => {
        set((state) => updateNamespace(state, namespaceId, defaultState));
        return defaultState;
      },
    }),
    {
      name: "chat-settings",
    },
  ),
);
