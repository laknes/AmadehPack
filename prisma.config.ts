import { defineConfig } from "prisma/config";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/amadeh_pack?schema=public";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
});
