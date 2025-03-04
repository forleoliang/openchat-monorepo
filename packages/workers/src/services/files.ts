import dao from "@/dao";
import { getDB } from "@/db";
import type { NewFile } from "@/models/files";

async function createFile(env: Env, newFile: NewFile) {
	return dao.files.createFile(getDB(env), newFile);
}

async function getFile(env: Env, fileId: string) {
	return dao.files.getFileById(getDB(env), fileId);
}

async function deleteFile(env: Env, fileId: string) {
	return dao.files.deleteFile(getDB(env), fileId);
}

async function listFiles(env: Env, userId: string) {
	return dao.files.listFiles(getDB(env), { userId });
}

export default {
	createFile,
	getFile,
	deleteFile,
	listFiles,
};
