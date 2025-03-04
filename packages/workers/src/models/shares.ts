import { pgTable, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const shares = pgTable("shares", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	conversationId: text().notNull(),
	userId: text().notNull(),
	lastMessageId: text().notNull(),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type Share = typeof shares.$inferSelect;
export type NewShare = typeof shares.$inferInsert;
