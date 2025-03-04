import { type NewMessage, type Message, messages } from "@/models/messages";
import type { Database } from "@/db";
import { eq } from "drizzle-orm";

async function createMessage(db: Database, message: NewMessage) {
	const results = await db.insert(messages).values(message).returning();
	return results[0];
}

async function listMessages(
	db: Database,
	userId: string,
	conversationId: string,
) {
	const items = await db.query.messages.findMany({
		where(fields, operators) {
			return operators.and(
				operators.eq(fields.userId, userId),
				operators.eq(fields.conversationId, conversationId),
			);
		},
		orderBy(fields, order) {
			return order.asc(fields.id);
		},
	});
	return items;
}

async function listChatMessages(
	db: Database,
	userId: string,
	conversationId: string,
) {
	const items = await db.query.messages.findMany({
		where(fields, operators) {
			return operators.and(
				operators.eq(fields.conversationId, conversationId),
				operators.eq(fields.userId, userId),
			);
		},
		orderBy(fields, order) {
			return order.asc(fields.id);
		},
	});
	return items;
}

async function updateMessage(db: Database, message: Message) {
	const results = await db
		.update(messages)
		.set(message)
		.where(eq(messages.id, message.id))
		.returning();
	return results[0];
}

async function deleteConversationMessages(
	db: Database,
	conversationId: string,
) {
	await db.delete(messages).where(eq(messages.conversationId, conversationId));
}

export default {
	createMessage,
	listMessages,
	listChatMessages,
	updateMessage,
	deleteConversationMessages,
};
