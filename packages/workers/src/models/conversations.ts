import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const conversations = pgTable("conversations", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	userId: text().notNull(),
	title: text().notNull().default(""),
	starred: boolean().notNull().default(false),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
