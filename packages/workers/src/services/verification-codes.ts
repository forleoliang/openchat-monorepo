import dao from "@/dao";
import { getDB } from "@/db";
import type { NewVerificationCode } from "@/models/verification-codes";

async function createVerificationCode(
	env: Env,
	newVerificationCode: NewVerificationCode,
) {
	return dao.verificationCodes.createVerificationCode(
		getDB(env),
		newVerificationCode,
	);
}

async function getActiveVerificationCode(
	env: Env,
	email: string,
	code: string,
	type: "signup" | "signin" | "reset_password",
) {
	return dao.verificationCodes.getActiveVerificationCode(
		getDB(env),
		email,
		code,
		type,
	);
}

async function markVerificationCodeAsUsed(env: Env, verificationId: string) {
	return dao.verificationCodes.markVerificationCodeAsUsed(
		getDB(env),
		verificationId,
	);
}

export default {
	createVerificationCode,
	getActiveVerificationCode,
	markVerificationCodeAsUsed,
};
