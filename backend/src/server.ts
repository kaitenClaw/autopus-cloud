import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { socketService } from './services/socket.service';

const HOST = '0.0.0.0';

const server = app.listen(env.PORT, HOST, () => {
  console.log(`🚀 Server ready at http://${HOST}:${env.PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Initialize Socket.io
socketService.initialize(server);

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} signal received: closing HTTP server`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
      process.exit(0);
    } catch (err) {
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
