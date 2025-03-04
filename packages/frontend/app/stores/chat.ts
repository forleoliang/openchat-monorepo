import { create } from "zustand";

export const DEFAULT_CONVERSATION_ID = "default";

interface ChatState {
	activeConversationId: string;
	setActiveConversationId: (id: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
	activeConversationId: DEFAULT_CONVERSATION_ID,
	setActiveConversationId: (id: string) => set({ activeConversationId: id }),
}));
