import dao from "@/dao";
import { getDB } from "@/db";
import type { User, NewUser } from "@/models/users";

async function createUser(env: Env, newUser: NewUser) {
	return dao.users.createUser(getDB(env), newUser);
}

async function getUser(env: Env, userId: string) {
	return dao.users.getUserById(getDB(env), userId);
}

async function getUserByEmail(env: Env, email: string) {
	return dao.users.getUserByEmail(getDB(env), email);
}

async function getUserWithPasswordByEmail(env: Env, email: string) {
	return dao.users.getUserWithPasswordByEmail(getDB(env), email);
}

async function listUsers(env: Env) {
	throw new Error("listUsers is not implemented");
}

async function deleteUser(env: Env, userId: string) {
	throw new Error("deleteUser is not implemented");
}

async function updateUser(env: Env, userId: string, update: Partial<User>) {
	return dao.users.updateUser(getDB(env), userId, update);
}

export default {
	createUser,
	getUser,
	getUserByEmail,
	getUserWithPasswordByEmail,
	listUsers,
	deleteUser,
	updateUser,
};
