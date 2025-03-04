import { eq } from "drizzle-orm";
import { type NewUser, type User, users } from "@/models/users";
import type { Database } from "@/db";

async function getUserById(db: Database, id: string) {
	const user = await db.query.users.findFirst({
		columns: {
			password: false,
		},
		where(fields, operators) {
			return operators.eq(fields.id, id);
		},
	});
	return user;
}

async function getUserByEmail(db: Database, email: string) {
	const user = await db.query.users.findFirst({
		columns: {
			password: false,
		},
		where(fields, operators) {
			return operators.eq(fields.email, email);
		},
	});
	return user;
}

async function getUserByUsername(db: Database, username: string) {
	const user = await db.query.users.findFirst({
		columns: {
			password: false,
		},
		where(fields, operators) {
			return operators.eq(fields.username, username);
		},
	});
	return user;
}

async function getUserWithPasswordByEmail(db: Database, email: string) {
	const user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.email, email);
		},
	});
	return user;
}

async function getUserWithPasswordByUsername(db: Database, username: string) {
	const user = await db.query.users.findFirst({
		where(fields, operators) {
			return operators.eq(fields.username, username);
		},
	});
	return user;
}

async function createUser(db: Database, user: NewUser) {
	const results = await db.insert(users).values(user).returning();
	return results[0];
}

async function updateUser(db: Database, id: string, user: Partial<User>) {
	const results = await db
		.update(users)
		.set(user)
		.where(eq(users.id, id))
		.returning();
	return results[0];
}

export default {
	getUserById,
	getUserByEmail,
	getUserByUsername,
	getUserWithPasswordByEmail,
	getUserWithPasswordByUsername,
	createUser,
	updateUser,
};
