"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.PrismaService = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: env_1.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
exports.PrismaService = PrismaService;
exports.prisma = new PrismaService();
