"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const socket_service_1 = require("./services/socket.service");
const HOST = '0.0.0.0';
const server = app_1.default.listen(env_1.env.PORT, HOST, () => {
    console.log(`🚀 Server ready at http://${HOST}:${env_1.env.PORT}`);
    console.log(`🌍 Environment: ${env_1.env.NODE_ENV}`);
});
// Initialize Socket.io
socket_service_1.socketService.initialize(server);
async function gracefulShutdown(signal) {
    console.log(`\n${signal} signal received: closing HTTP server`);
    server.close(async () => {
        console.log('HTTP server closed');
        try {
            await prisma_1.prisma.$disconnect();
            console.log('Database connection closed');
            process.exit(0);
        }
        catch (err) {
            console.error('Error during database disconnection:', err);
            process.exit(1);
        }
    });
    // Force shutdown after 10s
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
