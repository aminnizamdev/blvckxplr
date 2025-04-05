
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
  private maxReconnectAttempts: number = 10; // Increased from 5 to 10
  private baseReconnectInterval: number;
  // Add a flag to prevent multiple close event handlers firing
  private isClosing: boolean = false;
  // Add a connection stable timeout to prevent rapid connect/disconnect cycles
  private stableConnectionTimeout: NodeJS.Timeout | null = null;
  // Track ping/pong for heartbeat
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime: number = 0;
  // Track consecutive errors
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 3;
  // Track connection stability with ping success
  private pingSuccess: boolean = false;

  constructor(url: string, handlers: WebSocketHandler, reconnectInterval: number = 5000) {
    this.url = url;
    this.handlers = handlers;
    this.reconnectInterval = reconnectInterval;
    this.baseReconnectInterval = reconnectInterval;
  }

  public connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      console.log(`Already connected or connecting to ${this.url}`);
      return;
    }
    
    this.isConnecting = true;
    this.isClosing = false;
    
    try {
      console.log(`Attempting to connect to ${this.url}`);
      this.ws = new WebSocket(this.url);

      // Set a timeout to abort connection attempt if it takes too long
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.log(`Connection attempt to ${this.url} timed out after 10 seconds`);
          this.ws.close();
          this.isConnecting = false;
          this.reconnect();
        }
      }, 10000); // 10 second timeout for connection

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        this.consecutiveErrors = 0; // Reset error counter on successful connection
        console.log(`Connected to ${this.url}`);
        
        // Set a timeout to ensure the connection is stable before reporting it as connected
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        this.stableConnectionTimeout = setTimeout(() => {
          // Start heartbeat ping
          this.startHeartbeat();
          
          // Only trigger onOpen if we haven't immediately closed
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.handlers.onOpen?.();
          }
        }, 500); // Wait for 500ms to ensure connection is stable
      };

      this.ws.onmessage = (event) => {
        try {
          // Update last pong time on any message
          this.lastPongTime = Date.now();
          this.pingSuccess = true;
          
          // Try to parse as JSON, but don't fail if it's not JSON
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            // If not JSON, use raw data
            data = event.data;
          }
          
          this.handlers.onMessage?.(data);
        } catch (error) {
          console.error(`Failed to process WebSocket message from ${this.url}:`, error);
          this.consecutiveErrors++;
          
          if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
            console.log(`Too many consecutive errors (${this.consecutiveErrors}), resetting connection to ${this.url}`);
            this.resetConnection();
          }
        }
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        
        // Prevent multiple close handlers from firing
        if (this.isClosing) return;
        
        this.isClosing = true;
        this.isConnecting = false;
        this.stopHeartbeat();
        
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        console.log(`Disconnected from ${this.url} with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
        this.handlers.onClose?.();
        
        // Only attempt to reconnect if not a clean close (code 1000)
        // and the client isn't deliberately disconnecting
        if (this.shouldReconnect && event.code !== 1000) {
          console.log(`Will attempt to reconnect to ${this.url}`);
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for ${this.url}:`, error);
        
        this.consecutiveErrors++;
        
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          console.log(`Too many consecutive errors (${this.consecutiveErrors}), resetting connection`);
          // This will eventually trigger onclose which will handle reconnection
          this.resetConnection();
        }
        
        this.handlers.onError?.(error);
        // Don't set isConnecting = false here, as onclose will be called automatically
      };
    } catch (error) {
      console.error(`Failed to create WebSocket for ${this.url}:`, error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing interval
    
    this.lastPongTime = Date.now(); // Reset pong time
    
    // Send ping every 30 seconds
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          // Check if too much time has passed since last pong
          const now = Date.now();
          if (now - this.lastPongTime > 45000) { // 45 seconds timeout
            console.log(`No response for ${(now - this.lastPongTime) / 1000}s from ${this.url}, reconnecting...`);
            this.resetConnection();
            return;
          }
          
          // Send ping - using a simple empty message that's compatible with most WebSocket servers
          this.ws.send('{"type":"ping"}');
          console.log(`Sent ping to ${this.url}`);
          
          // Check connection stability after sending ping
          setTimeout(() => {
            if (!this.pingSuccess) {
              console.log(`Ping to ${this.url} did not get a response, reconnecting...`);
              this.resetConnection();
            }
            this.pingSuccess = false; // Reset for next ping
          }, 5000); // Wait 5 seconds for response
          
        } catch (error) {
          console.error(`Error sending ping to ${this.url}:`, error);
          this.resetConnection();
        }
      } else {
        console.log(`Cannot send ping to ${this.url} - WebSocket is not open`);
        this.resetConnection();
      }
    }, 30000); // 30 second interval
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      } catch (error) {
        console.error(`Error sending data to ${this.url}:`, error);
        this.consecutiveErrors++;
        
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          console.log(`Too many consecutive send errors (${this.consecutiveErrors}), resetting connection`);
          this.resetConnection();
        }
      }
    } else {
      console.warn(`Cannot send to ${this.url}: WebSocket is not open (state: ${this.ws?.readyState})`);
      this.reconnect();
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
    
    this.stopHeartbeat();
    
    if (this.ws) {
      // Use a proper close code for clean disconnection
      this.isClosing = true;
      try {
        this.ws.close(1000, "Normal closure");
      } catch (e) {
        console.error(`Error closing WebSocket for ${this.url}:`, e);
      }
      this.ws = null;
    }
  }

  public resetConnection(): void {
    console.log(`Resetting connection to ${this.url}`);
    this.disconnect();
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.consecutiveErrors = 0;
    setTimeout(() => {
      this.connect();
    }, 1000); // Small delay before reconnecting
  }

  public isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
