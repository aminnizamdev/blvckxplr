
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
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 15; // Increased to handle more retries for Pyth
  private baseReconnectInterval: number;
  private isClosing: boolean = false;
  private stableConnectionTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime: number = 0;
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 5; // Increased to be more tolerant
  private pingSuccess: boolean = false;
  // Add backoff tracking for specific error types
  private backoffActivated: boolean = false;
  private backoffResetTimeout: NodeJS.Timeout | null = null;

  constructor(url: string, handlers: WebSocketHandler, reconnectInterval: number = 5000) {
    this.url = url;
    this.handlers = handlers;
    this.reconnectInterval = reconnectInterval;
    this.baseReconnectInterval = reconnectInterval;
    
    // Special handling for Pyth connection - longer timeouts and special reconnection strategy
    if (url === PYTH_WS) {
      this.maxReconnectAttempts = 20;
      this.reconnectInterval = 8000; // Longer initial reconnect interval for Pyth
      this.baseReconnectInterval = 8000;
    }
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

      // Increased timeout for Pyth connection
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.log(`Connection attempt to ${this.url} timed out after ${this.url === PYTH_WS ? '15' : '10'} seconds`);
          this.ws.close();
          this.isConnecting = false;
          this.reconnect();
        }
      }, this.url === PYTH_WS ? 15000 : 10000); // Extended timeout for Pyth

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset reconnect attempts
        this.consecutiveErrors = 0; // Reset error counter
        console.log(`Connected to ${this.url}`);
        
        // For Pyth connection, use a longer stability check
        const stabilityDelay = this.url === PYTH_WS ? 1000 : 500;
        
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        this.stableConnectionTimeout = setTimeout(() => {
          // For Pyth, use a more robust heartbeat mechanism
          if (this.url === PYTH_WS) {
            this.startPythHeartbeat();
          } else {
            this.startHeartbeat();
          }
          
          // Only trigger onOpen if we haven't immediately closed
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.handlers.onOpen?.();
          }
        }, stabilityDelay);
      };

      this.ws.onmessage = (event) => {
        try {
          // Update last pong time on any message
          this.lastPongTime = Date.now();
          this.pingSuccess = true;
          
          // For Pyth connections, reset the consecutive errors counter on successful message
          if (this.url === PYTH_WS) {
            this.consecutiveErrors = 0;
            this.backoffActivated = false;
            
            // Reset the backoff after a successful period of stability
            if (this.backoffResetTimeout) {
              clearTimeout(this.backoffResetTimeout);
            }
            
            this.backoffResetTimeout = setTimeout(() => {
              this.reconnectAttempts = 0;
            }, 60000); // Reset reconnect attempts counter after 1 minute of stability
          }
          
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
        
        if (this.url === PYTH_WS) {
          this.stopPythHeartbeat();
        } else {
          this.stopHeartbeat();
        }
        
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        console.log(`Disconnected from ${this.url} with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
        this.handlers.onClose?.();
        
        // Special handling for Pyth connection
        if (this.url === PYTH_WS && event.code !== 1000) {
          // If we're receiving frequent close events, activate backoff
          this.backoffActivated = true;
        }
        
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
        
        // Special handling for Pyth connection errors
        if (this.url === PYTH_WS) {
          this.backoffActivated = true;
        }
        
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

  // Special heartbeat for Pyth network
  private startPythHeartbeat(): void {
    this.stopPythHeartbeat(); // Clear any existing interval
    
    this.lastPongTime = Date.now(); // Reset pong time
    
    // Send ping every 20 seconds for Pyth (slower to reduce load)
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          // Check if too much time has passed since last pong
          const now = Date.now();
          if (now - this.lastPongTime > 60000) { // 60 seconds timeout for Pyth
            console.log(`No response for ${(now - this.lastPongTime) / 1000}s from ${this.url}, reconnecting...`);
            this.resetConnection();
            return;
          }
          
          // Send Pyth-specific ping format
          this.ws.send(JSON.stringify({
            type: "heartbeat"
          }));
          
          console.log(`Sent heartbeat to ${this.url}`);
          
          // Check connection stability after sending ping
          setTimeout(() => {
            if (!this.pingSuccess) {
              console.log(`Heartbeat to ${this.url} did not get a response, reconnecting...`);
              this.resetConnection();
            }
            this.pingSuccess = false; // Reset for next ping
          }, 8000); // Wait 8 seconds for response from Pyth
          
        } catch (error) {
          console.error(`Error sending heartbeat to ${this.url}:`, error);
          this.resetConnection();
        }
      } else {
        console.log(`Cannot send heartbeat to ${this.url} - WebSocket is not open`);
        this.resetConnection();
      }
    }, 20000); // 20 second interval for Pyth
  }

  private stopPythHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
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
    
    // Specialized backoff for Pyth connection
    let delay;
    if (this.url === PYTH_WS && this.backoffActivated) {
      // More aggressive exponential backoff for problematic Pyth connections
      delay = Math.min(
        this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts),
        60000 // Maximum 1 minute delay for Pyth
      );
    } else {
      // Regular exponential backoff for other connections
      delay = Math.min(
        this.baseReconnectInterval * Math.pow(1.5, this.reconnectAttempts),
        30000 // Maximum 30 second delay
      );
    }
    
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
    
    if (this.backoffResetTimeout) {
      clearTimeout(this.backoffResetTimeout);
    }
    
    if (this.url === PYTH_WS) {
      this.stopPythHeartbeat();
    } else {
      this.stopHeartbeat();
    }
    
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
    // Only reset attempts for non-Pyth or if backoff isn't activated
    if (this.url !== PYTH_WS || !this.backoffActivated) {
      this.reconnectAttempts = 0;
    }
    this.consecutiveErrors = 0;
    setTimeout(() => {
      this.connect();
    }, 1000); // Small delay before reconnecting
  }

  public isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
