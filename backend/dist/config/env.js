"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    PORT: zod_1.z.string().default('3000').transform(Number),
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    ADMIN_EMAILS: zod_1.z.string().optional().default(''),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_URL: zod_1.z.string().default('https://dashboard.autopus.cloud'),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1, 'GOOGLE_CLIENT_ID is required for OAuth validation'),
    LITELLM_MASTER_KEY: zod_1.z.string().optional().default('vertex-proxy'),
    LITELLM_HOST: zod_1.z.string().optional().default('localhost'),
    LITELLM_PORT: zod_1.z.string().optional().default('4000'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
    process.exit(1);
}
exports.env = _env.data;
