import { pgTable, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const users = pgTable("users", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	email: text().notNull().unique(),
	username: text().notNull().unique(),
	password: text().notNull(),
	avatar: text().notNull().default(""),
	emailVerifiedAt: text(),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
