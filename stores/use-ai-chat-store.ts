import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { persist } from "zustand/middleware";

interface AiChatSession {
    session_id: string;
    session_name: string;
    timestamp: string;
}

interface AiChatStore {
    sessionId: string;
    sessionName: string;
    sessions: AiChatSession[];
    isLoading: boolean;
    isNewSession: boolean;
    setSessionId: (id: string) => void;
    setSessionName: (name: string) => void;
    startNewChat: () => void;
    addSession: (sessionId: string, sessionName: string) => void;
    fetchSessions: () => Promise<void>;
    clearStore: () => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
    sessionId: uuidv4(),
    sessionName: "",
    sessions: [],
    isLoading: true,
    isNewSession: false,
    setSessionId: (id: string) => set({ sessionId: id, isNewSession: false }),
    setSessionName: (name: string) => set({ sessionName: name }),
    startNewChat: () => set({ sessionId: uuidv4(), sessionName: "", isNewSession: true }),
    addSession: (sessionId: string, sessionName: string) => {
        set((state) => ({
            sessions: [
                {
                    session_id: sessionId,
                    session_name: sessionName,
                    timestamp: new Date().toISOString(),
                },
                ...state.sessions,
            ],
        }));
    },
    fetchSessions: async () => {
        try {
            const response = await fetch("/api/chat/sessions");
            if (!response.ok) throw new Error("Failed to fetch sessions");
            const data = await response.json();
            set({ sessions: data, isLoading: false });
        } catch (error) {
            console.error("Error fetching chat sessions:", error);
            set({ isLoading: false });
        }
    },
    clearStore: () =>
        set({
            sessionId: uuidv4(),
            sessionName: "",
            sessions: [],
            isLoading: true,
        }),
}));
