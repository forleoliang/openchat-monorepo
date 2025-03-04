import dao from "@/dao";
import { getDB } from "@/db";
import type { NewRefreshToken } from "@/models/refresh-tokens";

async function createRefreshToken(env: Env, newRefreshToken: NewRefreshToken) {
	return await dao.refreshTokens.createRefreshToken(
		getDB(env),
		newRefreshToken,
	);
}

async function getRefreshTokenByToken(env: Env, token: string) {
	return await dao.refreshTokens.getRefreshTokenByToken(getDB(env), token);
}

async function deleteRefreshToken(env: Env, token: string) {
	await dao.refreshTokens.deleteRefreshToken(getDB(env), token);
}

async function deleteAllUserRefreshTokens(env: Env, userId: string) {
	await dao.refreshTokens.deleteAllUserRefreshTokens(getDB(env), userId);
}

export default {
	createRefreshToken,
	getRefreshTokenByToken,
	deleteRefreshToken,
	deleteAllUserRefreshTokens,
};
