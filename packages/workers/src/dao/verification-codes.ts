import { eq } from "drizzle-orm";
import {
	type NewVerificationCode,
	verificationCodes,
} from "@/models/verification-codes";
import type { Database } from "@/db";

async function createVerificationCode(db: Database, code: NewVerificationCode) {
	const results = await db.insert(verificationCodes).values(code).returning();
	return results[0];
}

async function getActiveVerificationCode(
	db: Database,
	email: string,
	code: string,
	type: "signup" | "signin" | "reset_password",
) {
	const now = new Date().toISOString();
	const verificationCode = await db.query.verificationCodes.findFirst({
		where(fields, operators) {
			return operators.and(
				operators.eq(fields.email, email),
				operators.eq(fields.code, code),
				operators.eq(fields.type, type),
				operators.isNull(fields.usedAt),
				operators.gt(fields.expiresAt, now),
			);
		},
	});
	return verificationCode;
}

async function markVerificationCodeAsUsed(db: Database, id: string) {
	const results = await db
		.update(verificationCodes)
		.set({ usedAt: new Date().toISOString() })
		.where(eq(verificationCodes.id, id))
		.returning();
	return results[0];
}

export default {
	createVerificationCode,
	getActiveVerificationCode,
	markVerificationCodeAsUsed,
};
