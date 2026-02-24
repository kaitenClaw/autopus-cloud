import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '@prisma/client';

interface SocketUser {
  userId: string;
  role?: UserRole;
}

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

    // JWT Authentication Middleware
    this.io.use((socket: any, next: any) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketUser;
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: any) => {
      const user = socket.user as SocketUser;
      console.log(`🔌 Socket connected: ${socket.id} (User: ${user.userId})`);

      // Join user-specific room for targeted messages
      socket.join(user.userId);

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id} (User: ${user.userId})`);
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
