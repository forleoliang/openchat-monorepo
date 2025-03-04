import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "src/models/*.ts",
	out: "drizzle/migrations",
	casing: "snake_case",
	dbCredentials: {
		url: "postgresql://openchat:password_123456@localhost:5432/openchat",
	},
});
