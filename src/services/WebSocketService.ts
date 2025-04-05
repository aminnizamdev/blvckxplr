
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
  // Add a backoff mechanism to prevent rapid reconnection attempts
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private baseReconnectInterval: number;
  // Add a flag to prevent multiple close event handlers firing
  private isClosing: boolean = false;
  // Add a connection stable timeout to prevent rapid connect/disconnect cycles
  private stableConnectionTimeout: NodeJS.Timeout | null = null;

  constructor(url: string, handlers: WebSocketHandler, reconnectInterval: number = 5000) {
    this.url = url;
    this.handlers = handlers;
    this.reconnectInterval = reconnectInterval;
    this.baseReconnectInterval = reconnectInterval;
  }

  public connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
    
    this.isConnecting = true;
    this.isClosing = false;
    
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        console.log(`Connected to ${this.url}`);
        
        // Set a timeout to ensure the connection is stable before reporting it as connected
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        this.stableConnectionTimeout = setTimeout(() => {
          this.handlers.onOpen?.();
        }, 500); // Wait for 500ms to ensure connection is stable
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlers.onMessage?.(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        // Prevent multiple close handlers from firing
        if (this.isClosing) return;
        
        this.isClosing = true;
        this.isConnecting = false;
        
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        console.log(`Disconnected from ${this.url} with code: ${event.code}, reason: ${event.reason}`);
        this.handlers.onClose?.();
        
        // Only attempt to reconnect if not a clean close (code 1000)
        // and the client isn't deliberately disconnecting
        if (this.shouldReconnect && event.code !== 1000) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for ${this.url}:`, error);
        this.handlers.onError?.(error);
        this.isConnecting = false;
        
        // Don't close here, as onclose will be called automatically
      };
    } catch (error) {
      console.error(`Failed to create WebSocket for ${this.url}:`, error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn("Cannot send: WebSocket is not open");
    }
  }

  private reconnect(): void {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached for ${this.url}`);
        this.shouldReconnect = false;
      }
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Exponential backoff for reconnection attempts
    const delay = Math.min(
      this.baseReconnectInterval * Math.pow(1.5, this.reconnectAttempts),
      30000 // Maximum 30 second delay
    );
    
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect to ${this.url} in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.stableConnectionTimeout) {
      clearTimeout(this.stableConnectionTimeout);
    }
    
    if (this.ws) {
      // Use a proper close code for clean disconnection
      this.isClosing = true;
      this.ws.close(1000, "Normal closure");
      this.ws = null;
    }
  }

  public resetConnection(): void {
    this.disconnect();
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.connect();
  }

  public isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
