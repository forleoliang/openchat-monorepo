import { relations } from "drizzle-orm";
import { conversations } from "./conversations";
import { messages } from "./messages";
import { users } from "./users";
import { shares } from "./shares";
import { verificationCodes } from "./verification-codes";
import { refreshTokens } from "./refresh-tokens";
import { files } from "./files";
import { qrCodeLogins } from "./qr-code-logins";

export const userRelations = relations(users, ({ many }) => ({
	conversations: many(conversations),
	messages: many(messages),
	refreshTokens: many(refreshTokens),
	files: many(files),
	qrCodeLogins: many(qrCodeLogins),
}));

export const conversationRelations = relations(
	conversations,
	({ one, many }) => ({
		shares: many(shares),
		messages: many(messages),
		user: one(users, {
			fields: [conversations.userId],
			references: [users.id],
		}),
	}),
);

export const messageRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
	user: one(users, {
		fields: [messages.userId],
		references: [users.id],
	}),
}));

export const shareRelations = relations(shares, ({ one }) => ({
	conversation: one(conversations, {
		fields: [shares.conversationId],
		references: [conversations.id],
	}),
	user: one(users, {
		fields: [shares.userId],
		references: [users.id],
	}),
}));

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id],
	}),
}));

export const fileRelations = relations(files, ({ one }) => ({
	user: one(users, {
		fields: [files.userId],
		references: [users.id],
	}),
}));

export const qrCodeLoginRelations = relations(qrCodeLogins, ({ one }) => ({
	user: one(users, {
		fields: [qrCodeLogins.userId],
		references: [users.id],
	}),
}));

export {
	conversations,
	messages,
	users,
	shares,
	verificationCodes,
	refreshTokens,
	files,
	qrCodeLogins,
};
