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
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
    process.exit(1);
}
exports.env = _env.data;
