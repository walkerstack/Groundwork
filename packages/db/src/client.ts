import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   console.log("TRUE");

  //   const connectionString = process.env.DATABASE_URL ?? "";
  //   const adapter = new PrismaPg({ connectionString });
  //   return new PrismaClient({
  //     adapter,
  //     log:
  //       process.env.NODE_ENV === "development"
  //         ? ["query", "error", "warn"]
  //         : ["error"],
  //   });
  // }

  // Supabase pooled connection string (must use Supavisor)
  const connectionString = process.env.DATABASE_URL ?? "";

  const url = new URL(connectionString);
  if (url.hostname === "localhost") {
    // Disable SSL for local connections
    neonConfig.useSecureWebSocket = false;
    // WebSocket proxy is hosted on `4000` locally, so add port. Does not work in production.
    neonConfig.wsProxy = (host) => `${host}:4000/v2`;
  }

  // Only Neon hosts support this -- non-deterministic errors otherwise
  neonConfig.pipelineConnect = false;

  // So it can also work in Node.js
  neonConfig.webSocketConstructor = WebSocket;

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // return new PrismaClient({
  //   log:
  //     process.env.NODE_ENV === "development"
  //       ? ["query", "error", "warn"]
  //       : ["error"],
  // });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
