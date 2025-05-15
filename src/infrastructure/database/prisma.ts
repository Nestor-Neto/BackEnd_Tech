import { PrismaClient } from '@prisma/client';

// Configuração do Prisma Client
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.0'
    }
  },
  log: process.env.NODE_ENV === 'test' ? [] : ['query', 'error', 'warn']
});

// Função para limpar o banco de dados (útil para testes)
export async function cleanDatabase() {
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      );
    }
  }
} 