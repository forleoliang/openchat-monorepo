import type { NewMessage, Message } from "@/models/messages";
import { getDB } from "@/db";
import dao from "@/dao";

async function createMessage(env: Env, newMessage: NewMessage) {
	return dao.messages.createMessage(getDB(env), newMessage);
}

async function listMessages(env: Env, userId: string, conversationId: string) {
	return dao.messages.listMessages(getDB(env), userId, conversationId);
}

async function updateMessage(env: Env, message: Message) {
	return dao.messages.updateMessage(getDB(env), message);
}

export default {
	createMessage,
	listMessages,
	updateMessage,
};
