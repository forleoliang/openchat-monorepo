import dao from "@/dao";
import { getDB } from "@/db";
import type { Conversation, NewConversation } from "@/models/conversations";

async function createConversation(env: Env, newConversation: NewConversation) {
	return dao.conversations.createConversation(getDB(env), newConversation);
}

async function getConversation(
	env: Env,
	userId: string,
	conversationId: string,
) {
	return dao.conversations.getConversation(getDB(env), userId, conversationId);
}

async function listConversations(env: Env, userId: string) {
	return dao.conversations.listConversations(getDB(env), userId);
}

async function deleteConversation(
	env: Env,
	userId: string,
	conversationId: string,
) {
	await dao.conversations.deleteConversation(
		getDB(env),
		userId,
		conversationId,
	);
	await dao.messages.deleteConversationMessages(getDB(env), conversationId);
}

async function updateConversation(
	env: Env,
	userId: string,
	conversationId: string,
	update: Partial<Conversation>,
) {
	return dao.conversations.updateConversation(
		getDB(env),
		userId,
		conversationId,
		update,
	);
}

export default {
	createConversation,
	getConversation,
	listConversations,
	deleteConversation,
	updateConversation,
};
