import { eq } from "drizzle-orm";
import { type NewFile, files } from "@/models/files";
import type { Database } from "@/db";

async function getFileById(db: Database, id: string) {
	const file = await db.query.files.findFirst({
		where(fields, operators) {
			return operators.eq(fields.id, id);
		},
	});
	return file;
}

async function createFile(db: Database, file: NewFile) {
	const [result] = await db.insert(files).values(file).returning();
	return result;
}

async function deleteFile(db: Database, id: string) {
	await db.delete(files).where(eq(files.id, id));
}

async function listFiles(
	db: Database,
	options: {
		userId: string;
	},
) {
	const files = await db.query.files.findMany({
		where(fields, operators) {
			return operators.eq(fields.userId, options.userId);
		},
	});
	return files;
}

export default {
	getFileById,
	createFile,
	deleteFile,
	listFiles,
};
