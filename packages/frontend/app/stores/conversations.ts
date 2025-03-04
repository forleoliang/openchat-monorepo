import { create } from "zustand";
import type { Conversation } from "~/types";

interface ConversationsState {
	conversations: Conversation[];
	setConversations: (conversations: Conversation[]) => void;
	addConversation: (conversation: Conversation) => void;
	removeConversation: (conversationId: string) => void;
	renameConversation: (conversationId: string, newTitle: string) => void;
}

export const useConversationsStore = create<ConversationsState>()((set) => ({
	conversations: [],
	setConversations: (conversations: Conversation[]) => set({ conversations }),
	addConversation: (conversation: Conversation) =>
		set((state) => ({ conversations: [conversation, ...state.conversations] })),
	removeConversation: (conversationId: string) =>
		set((state) => ({
			conversations: state.conversations.filter((c) => c.id !== conversationId),
		})),
	renameConversation: (conversationId: string, newTitle: string) =>
		set((state) => ({
			conversations: state.conversations.map((c) =>
				c.id === conversationId ? { ...c, title: newTitle } : c,
			),
		})),
}));
