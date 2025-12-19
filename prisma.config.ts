<<<<<<< HEAD
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	engine: "classic",
	datasource: {
		url: env("DATABASE_URL"),
	},
});
>>>>>>> 5f4758b (resolve conflicts and add DATABASE_URL to prisma schema)
