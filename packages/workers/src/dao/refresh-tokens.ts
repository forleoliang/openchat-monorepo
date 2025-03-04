import { eq } from "drizzle-orm";
import { refreshTokens, type NewRefreshToken } from "@/models/refresh-tokens";
import { users } from "@/models/users";
import type { Database } from "@/db";

async function createRefreshToken(db: Database, data: NewRefreshToken) {
	const result = await db.insert(refreshTokens).values(data).returning();
	return result[0];
}

async function getRefreshTokenByToken(db: Database, token: string) {
	const result = await db
		.select()
		.from(refreshTokens)
		.where(eq(refreshTokens.token, token));

	return result[0] || null;
}

async function getRefreshTokenWithUserByToken(db: Database, token: string) {
	const result = await db
		.select()
		.from(refreshTokens)
		.where(eq(refreshTokens.token, token))
		.leftJoin(users, eq(refreshTokens.userId, users.id));

	if (result.length === 0) {
		return null;
	}

	return {
		refreshToken: result[0].refresh_tokens,
		user: result[0].users,
	};
}

async function deleteRefreshToken(db: Database, token: string) {
	await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}

async function deleteAllUserRefreshTokens(db: Database, userId: string) {
	await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

export default {
	createRefreshToken,
	getRefreshTokenByToken,
	getRefreshTokenWithUserByToken,
	deleteRefreshToken,
	deleteAllUserRefreshTokens,
};
