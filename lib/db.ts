import { PrismaClient } from "@prisma/client";
import { join } from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Resolve the SQLite database path to an absolute location so it works
// regardless of the current working directory (Next.js build vs. start, Docker,
// serverless). We honour DATABASE_URL when it points at an absolute path or a
// non-file source (Postgres/MySQL); for relative `file:` URLs we anchor them to
// the project root.
function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (!fromEnv) return `file:${join(process.cwd(), "prisma", "dev.db")}`;

  if (fromEnv.startsWith("file:") && !fromEnv.startsWith("file:/")) {
    // relative file: URL — anchor to cwd
    const rel = fromEnv.slice("file:".length);
    return `file:${join(process.cwd(), rel)}`;
  }
  return fromEnv;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
