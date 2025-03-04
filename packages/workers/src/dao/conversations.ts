import { eq, and } from "drizzle-orm";
import {
	type Conversation,
	type NewConversation,
	conversations,
} from "@/models/conversations";
import type { Database } from "@/db";

export async function createConversation(
	db: Database,
	conversation: NewConversation,
) {
	const results = await db
		.insert(conversations)
		.values(conversation)
		.returning();
	return results[0];
}

async function getConversation(
	db: Database,
	userId: string,
	conversationId: string,
) {
	return db.query.conversations.findFirst({
		where(fields, operators) {
			return operators.and(
				operators.eq(fields.id, conversationId),
				operators.eq(fields.userId, userId),
			);
		},
	});
}

async function listConversations(db: Database, userId: string) {
	return await db.query.conversations.findMany({
		where(fields, operators) {
			return operators.eq(fields.userId, userId);
		},
		orderBy(fields, order) {
			return order.desc(fields.id);
		},
	});
}

async function deleteConversation(
	db: Database,
	userId: string,
	conversationId: string,
) {
	return db
		.delete(conversations)
		.where(
			and(
				eq(conversations.userId, userId),
				eq(conversations.id, conversationId),
			),
		);
}

async function updateConversation(
	db: Database,
	userId: string,
	conversationId: string,
	conversation: Partial<Conversation>,
) {
	conversation.id = conversationId;
	conversation.userId = userId;
	const results = await db
		.update(conversations)
		.set(conversation)
		.where(
			and(
				eq(conversations.id, conversationId),
				eq(conversations.userId, userId),
			),
		)
		.returning();
	return results[0];
}

export default {
	createConversation,
	listConversations,
	getConversation,
	deleteConversation,
	updateConversation,
};
