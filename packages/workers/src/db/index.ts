import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/models";

export function getDB(env: Env) {
	return drizzle({
		client: postgres(env.HYPERDRIVE.connectionString, {
			max: 5,
			fetch_types: false,
		}),
		schema,
		casing: "snake_case",
	});
}

export type Database = ReturnType<typeof getDB>;
