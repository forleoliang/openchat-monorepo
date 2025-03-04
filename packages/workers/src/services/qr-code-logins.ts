import dao from "@/dao";
import { getDB } from "@/db";
import type { NewQrCodeLogin } from "@/models/qr-code-logins";
import { generateQrCodeContent } from "@/utils/qr-code";

async function createQrCodeLogin(env: Env) {
	const expiresIn = 5 * 60; // 5 minutes
	const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
	const content = await generateQrCodeContent();

	const newQrCodeLogin: NewQrCodeLogin = {
		content,
		status: "PENDING",
		expiresAt,
	};

	const qrCodeLogin = await dao.qrCodeLogins.createQrCodeLogin(
		getDB(env),
		newQrCodeLogin,
	);

	return {
		qrCodeId: qrCodeLogin.id,
		content: qrCodeLogin.content,
		expiresIn,
	};
}

async function getQrCodeLoginById(env: Env, id: string) {
	return dao.qrCodeLogins.getQrCodeLoginById(getDB(env), id);
}

async function updateQrCodeLoginStatus(
	env: Env,
	id: string,
	status: string,
	userId?: string,
) {
	return dao.qrCodeLogins.updateQrCodeLoginStatus(
		getDB(env),
		id,
		status,
		userId,
	);
}

async function cleanupQrCodeLogins(env: Env) {
	// 删除过期的二维码
	await dao.qrCodeLogins.deleteExpiredQrCodeLogins(getDB(env));
	// 清理 30 天前的历史记录
	await dao.qrCodeLogins.cleanupOldQrCodeLogins(getDB(env));
}

export default {
	createQrCodeLogin,
	getQrCodeLoginById,
	updateQrCodeLoginStatus,
	cleanupQrCodeLogins,
};
