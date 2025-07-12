import { io, Socket } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL;
class SocketService {
  private static instance: SocketService;
  public socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(apiUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    this.setupEventListeners();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Disconnected from WebSocket server:", reason);
      this.handleReconnect();
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Attempting to reconnect in ${delay}ms...`);

      setTimeout(() => {
        this.reconnectAttempts++;
        this.socket?.connect();
      }, delay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  public emit(event: string, ...args: any[]): void {
    this.socket?.emit(event, ...args);
  }
}

export const socketService = SocketService.getInstance();
