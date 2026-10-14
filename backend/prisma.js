const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const client =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = client;
}

module.exports = client;