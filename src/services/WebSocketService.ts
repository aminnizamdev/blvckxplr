
// WebSocket connection constants
export const PUMP_WS = "wss://pumpportal.fun/api/data";
export const PYTH_WS = "wss://hermes.pyth.network/ws";
export const SOL_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

// WebSocket connection status
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

// WebSocket message handlers
export interface WebSocketHandler {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

// WebSocket connection class
export class WebSocketConnection {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: WebSocketHandler;
  private reconnectInterval: number;
  private isConnecting: boolean = false;
  private shouldReconnect: boolean = true;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(url: string, handlers: WebSocketHandler, reconnectInterval: number = 5000) {
    this.url = url;
    this.handlers = handlers;
    this.reconnectInterval = reconnectInterval;
  }

  public connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
    
    this.isConnecting = true;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      console.log(`Connected to ${this.url}`);
      this.handlers.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.onMessage?.(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      console.log(`Disconnected from ${this.url}`);
      this.handlers.onClose?.();
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error(`WebSocket error for ${this.url}:`, error);
      this.handlers.onError?.(error);
      this.isConnecting = false;
      // Error usually triggers onclose too, but just in case:
      if (this.ws?.readyState !== WebSocket.CLOSED) {
        this.ws?.close();
      }
    };
  }

  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn("Cannot send: WebSocket is not open");
    }
  }

  private reconnect(): void {
    if (!this.shouldReconnect) return;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect to ${this.url}...`);
      this.connect();
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
