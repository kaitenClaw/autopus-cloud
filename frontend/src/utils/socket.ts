import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || '/';

class SocketClient {
  private socket: Socket | null = null;

  public connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      withCredentials: true,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.io');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket.io connection error:', error);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  public off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  public emit(event: string, data: any) {
    if (!this.socket) this.connect();
    this.socket?.emit(event, data);
  }
}

export const socketClient = new SocketClient();
