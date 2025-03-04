import type { SearchResult, File } from "@/types";
import { pgTable, text, jsonb, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const messages = pgTable(
	"messages",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		userId: text().notNull(),
		conversationId: text().notNull(),
		role: text().notNull(),
		message: text().notNull(),
		files: jsonb().$type<File[]>(),
		generatedImageUrls: text().array(),
		searchResults: jsonb().$type<SearchResult[]>(),
		createdAt: text()
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		updatedAt: text()
			.notNull()
			.$defaultFn(() => new Date().toISOString())
			.$onUpdate(() => new Date().toISOString()),
	},
	(table) => [index("messages_role_idx").on(table.role)],
);

export type NewMessage = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;
