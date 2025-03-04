import { pgTable, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const verificationCodes = pgTable("verification_codes", {
	id: text()
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	code: text().notNull(),
	type: text().notNull(),
	email: text().notNull(),
	expiresAt: text().notNull(),
	usedAt: text(),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert;
