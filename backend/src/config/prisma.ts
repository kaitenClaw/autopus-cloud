import { PrismaClient } from '@prisma/client';
import { env } from './env';

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export const prisma = new PrismaService();
