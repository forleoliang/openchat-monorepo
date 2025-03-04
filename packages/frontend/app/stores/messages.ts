import { create } from "zustand";
import type { Message } from "~/types";

interface MessagesState {
	messagesMap: Record<string, Message[]>;
	setMessages: (conversationId: string, messages: Message[]) => void;
	addMessage: (conversationId: string, message: Message) => void;
	addMessages: (conversationId: string, messages: Message[]) => void;
	removeMessage: (conversationId: string, messageId: string) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
	messagesMap: {},
	setMessages: (conversationId: string, messages: Message[]) =>
		set((state) => ({
			messagesMap: {
				...state.messagesMap,
				[conversationId]: messages,
			},
		})),
	addMessage: (conversationId: string, message: Message) =>
		set((state) => ({
			messagesMap: {
				...state.messagesMap,
				[conversationId]: [
					...(state.messagesMap[conversationId] || []),
					message,
				],
			},
		})),
	addMessages: (conversationId: string, messages: Message[]) =>
		set((state) => ({
			messagesMap: {
				...state.messagesMap,
				[conversationId]: [
					...(state.messagesMap[conversationId] || []),
					...messages,
				],
			},
		})),
	removeMessage: (conversationId: string, messageId: string) =>
		set((state) => ({
			messagesMap: {
				...state.messagesMap,
				[conversationId]: state.messagesMap[conversationId].filter(
					(m) => m.id !== messageId,
				),
			},
		})),
}));
