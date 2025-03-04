import { and, eq, lt } from "drizzle-orm";
import { type NewQrCodeLogin, qrCodeLogins } from "@/models/qr-code-logins";
import type { Database } from "@/db";

async function getQrCodeLoginById(db: Database, id: string) {
	const qrCodeLogin = await db.query.qrCodeLogins.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id);
		},
	});
	return qrCodeLogin;
}

async function createQrCodeLogin(db: Database, qrCodeLogin: NewQrCodeLogin) {
	const [result] = await db
		.insert(qrCodeLogins)
		.values(qrCodeLogin)
		.returning();
	return result;
}

async function updateQrCodeLoginStatus(
	db: Database,
	id: string,
	status: string,
	userId?: string,
) {
	const now = new Date().toISOString();
	const updateData: Partial<NewQrCodeLogin> = {
		status,
		updatedAt: now,
		userId,
	};

	if (status === "SCANNED") {
		updateData.scannedAt = now;
	} else if (status === "CONFIRMED" && userId) {
		updateData.confirmedAt = now;
		updateData.userId = userId;
	}

	const [result] = await db
		.update(qrCodeLogins)
		.set(updateData)
		.where(eq(qrCodeLogins.id, id))
		.returning();
	return result;
}

async function deleteExpiredQrCodeLogins(db: Database) {
	const now = new Date().toISOString();
	await db
		.delete(qrCodeLogins)
		.where(
			and(eq(qrCodeLogins.status, "PENDING"), lt(qrCodeLogins.expiresAt, now)),
		);
}

async function cleanupOldQrCodeLogins(db: Database) {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	const cutoffDate = thirtyDaysAgo.toISOString();

	await db.delete(qrCodeLogins).where(lt(qrCodeLogins.createdAt, cutoffDate));
}

export default {
	getQrCodeLoginById,
	createQrCodeLogin,
	updateQrCodeLoginStatus,
	deleteExpiredQrCodeLogins,
	cleanupOldQrCodeLogins,
};
