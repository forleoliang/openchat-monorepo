import { pgTable, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	userId: text()
		.notNull()
		.references(() => users.id),
	token: text().notNull().unique(),
	expiresAt: text().notNull(),
	deviceInfo: text(),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
