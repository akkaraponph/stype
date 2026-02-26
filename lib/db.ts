/**
 * Prisma client for API routes. Uses driver adapter for Cloudflare Workers compatibility.
 * Create per-request in edge; reuse in Node dev if desired.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export function getPrisma(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export type { PrismaClient };
