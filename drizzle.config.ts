import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const config = defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});

export default config;

