import { defineConfig } from "prisma/config";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");

if (!databaseUrl || (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://"))) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/amadeh_pack?schema=public";
} else {
  process.env.DATABASE_URL = databaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
});
