import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';

export class SocketService {
  private static instance: SocketService;
  private io: SocketServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(server: HttpServer): void {
    this.io = new SocketServer(server, {
      cors: {
        origin: env.ALLOWED_ORIGINS.split(','),
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: any) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  public emit(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  public emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      // In the future, we can use socket.join(userId) on connection
      // and emit to that room specifically.
      this.io.to(userId).emit(event, data);
    }
  }
}

export const socketService = SocketService.getInstance();
