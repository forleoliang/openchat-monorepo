import { pgTable, text, bigint } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const files = pgTable("files", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	url: text().notNull(),
	mimeType: text().notNull(),
	fileName: text().notNull(),
	size: bigint({ mode: "bigint" }).notNull(),
	userId: text().notNull(),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
