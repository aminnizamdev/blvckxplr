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

// Message queue for buffering websocket messages
interface QueuedMessage {
  data: any;
  timestamp: number;
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
  private maxReconnectAttempts: number = 30; // Increased from previous 20 for more resilience
  private baseReconnectInterval: number;
  private isClosing: boolean = false;
  private stableConnectionTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime: number = 0;
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 5;
  private pingSuccess: boolean = false;
  // Message queue to prevent blocking the main thread
  private messageQueue: QueuedMessage[] = [];
  private isProcessingQueue: boolean = false;
  private queueProcessInterval: NodeJS.Timeout | null = null;
  // Maximum number of messages to process in one batch
  private maxQueueProcessingBatch: number = 30; // Increased from previous 20
  // Maximum queue size
  private maxQueueSize: number = 1000; // Increased queue size
  // Connection health metrics
  private connectionHealth: number = 0;
  private lastMessageReceived: number = 0;
  private isPythConnection: boolean = false;

  constructor(url: string, handlers: WebSocketHandler, reconnectInterval: number = 5000) {
    this.url = url;
    this.handlers = handlers;
    this.reconnectInterval = reconnectInterval;
    this.baseReconnectInterval = reconnectInterval;
    this.isPythConnection = url === PYTH_WS;
    
    // Special handling for Pyth connection
    if (this.isPythConnection) {
      this.maxReconnectAttempts = 30;
      this.reconnectInterval = 5000;
      this.baseReconnectInterval = 5000;
      this.maxQueueSize = 1500; // Even larger queue for Pyth
    }
    
    console.log(`WebSocket initialized for ${url} with reconnect interval ${reconnectInterval}ms`);
  }

  public connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      console.log(`Already connected or connecting to ${this.url}`);
      return;
    }
    
    this.isConnecting = true;
    this.isClosing = false;
    this.lastMessageReceived = Date.now();
    
    try {
      console.log(`Attempting to connect to ${this.url}`);
      this.ws = new WebSocket(this.url);

      // Connection timeout - longer for Pyth
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.log(`Connection attempt to ${this.url} timed out after ${this.isPythConnection ? '15' : '10'} seconds`);
          this.ws.close();
          this.isConnecting = false;
          this.reconnect();
        }
      }, this.isPythConnection ? 15000 : 10000); // Increased timeouts

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset reconnect attempts
        this.consecutiveErrors = 0; // Reset error counter
        this.connectionHealth = 100; // Full health on successful connection
        console.log(`Connected to ${this.url}`);
        
        // Allow a short delay for connection to stabilize
        const stabilityDelay = this.isPythConnection ? 1500 : 1000;
        
        if (this.stableConnectionTimeout) {
          clearTimeout(this.stableConnectionTimeout);
        }
        
        this.stableConnectionTimeout = setTimeout(() => {
          this.startHeartbeat();
          this.startQueueProcessing();
          
          // Only trigger onOpen if we haven't immediately closed
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.handlers.onOpen?.();
          }
        }, stabilityDelay);
      };

      this.ws.onmessage = (event) => {
        try {
          // Update last message received time
          this.lastMessageReceived = Date.now();
          this.lastPongTime = Date.now();
          this.pingSuccess = true;
          this.connectionHealth = Math.min(100, this.connectionHealth + 5); // Improve health on message
          
          // Reset error counters on successful message
          this.consecutiveErrors = 0;
          
          // Try to parse as JSON, but don't fail if it's not JSON
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            // If not JSON, use raw data
            data = event.data;
          }
          
          // Queue the message instead of processing immediately
          this.queueMessage(data);
        } catch (error) {
          console.error(`Failed to process WebSocket message from ${this.url}:`, error);
          this.consecutiveErrors++;
          this.connectionHealth = Math.max(0, this.connectionHealth - 15); // Decrease health on error
          
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
        
        // Stop queue processing
        this.stopQueueProcessing();
        
        console.log(`Disconnected from ${this.url} with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
        this.connectionHealth = 0; // Zero health on disconnect
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
        this.connectionHealth = Math.max(0, this.connectionHealth - 25); // Big health decrease on error
        
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

  private queueMessage(data: any): void {
    // Add the message to the queue with a timestamp
    this.messageQueue.push({
      data,
      timestamp: Date.now()
    });
    
    // If queue gets too large, remove oldest messages
    if (this.messageQueue.length > this.maxQueueSize) {
      // Keep only most recent messages
      const toRemove = this.messageQueue.length - this.maxQueueSize;
      this.messageQueue = this.messageQueue.slice(toRemove);
      console.warn(`Message queue for ${this.url} exceeded size limit. Trimmed ${toRemove} oldest messages.`);
    }
  }
  
  private startQueueProcessing(): void {
    // Clear any existing interval
    this.stopQueueProcessing();
    
    // Process the queue at regular intervals - faster for Pyth
    const interval = this.isPythConnection ? 25 : 50;
    
    this.queueProcessInterval = setInterval(() => {
      this.processQueue();
    }, interval);
  }
  
  private stopQueueProcessing(): void {
    if (this.queueProcessInterval) {
      clearInterval(this.queueProcessInterval);
      this.queueProcessInterval = null;
    }
    this.isProcessingQueue = false;
  }
  
  private processQueue(): void {
    // If already processing or no messages, skip
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    try {
      // Dynamic batch size based on queue length
      const batchSize = Math.min(
        this.messageQueue.length,
        Math.max(5, Math.min(this.maxQueueProcessingBatch, Math.ceil(this.messageQueue.length / 5)))
      );
      
      for (let i = 0; i < batchSize; i++) {
        const message = this.messageQueue.shift();
        if (message) {
          this.handlers.onMessage?.(message.data);
        }
      }
    } catch (error) {
      console.error(`Error processing message queue for ${this.url}:`, error);
      this.connectionHealth = Math.max(0, this.connectionHealth - 10);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing interval
    
    this.lastPongTime = Date.now(); // Reset pong time
    
    // Send ping every 20 seconds for Pyth, 30 seconds for others
    const pingInterval = this.isPythConnection ? 20000 : 30000; 
    
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          // Check if too much time has passed since last pong
          const now = Date.now();
          const elapsed = now - this.lastPongTime;
          const timeoutLimit = this.isPythConnection ? 30000 : 45000;
          
          if (elapsed > timeoutLimit) {
            console.log(`No response for ${elapsed/1000}s from ${this.url}, reconnecting...`);
            this.resetConnection();
            return;
          }
          
          // Adjust connection health based on time since last message
          this.connectionHealth = Math.max(0, this.connectionHealth - Math.floor(elapsed / 5000));
          
          // Send the appropriate ping format
          if (this.isPythConnection) {
            this.ws.send(JSON.stringify({ type: "heartbeat" }));
          } else {
            this.ws.send(JSON.stringify({ type: "ping" }));
          }
          
          console.log(`Sent heartbeat to ${this.url}`);
          
          // Check connection stability after sending ping
          setTimeout(() => {
            if (!this.pingSuccess) {
              console.log(`Heartbeat to ${this.url} did not get a response, reconnecting...`);
              this.resetConnection();
            }
            this.pingSuccess = false; // Reset for next ping
          }, this.isPythConnection ? 10000 : 15000);
          
        } catch (error) {
          console.error(`Error sending heartbeat to ${this.url}:`, error);
          this.resetConnection();
        }
      } else {
        console.log(`Cannot send heartbeat to ${this.url} - WebSocket is not open`);
        this.resetConnection();
      }
    }, pingInterval);
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
        this.connectionHealth = Math.max(0, this.connectionHealth - 15);
        
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
    
    // Improved exponential backoff with jitter
    const baseFactor = this.isPythConnection ? 1.5 : 1.3;
    const baseDelay = this.baseReconnectInterval;
    const exponentialPart = Math.pow(baseFactor, Math.min(this.reconnectAttempts, 10));
    const maxDelay = this.isPythConnection ? 30000 : 20000;
    
    // Calculate delay with exponential backoff
    let delay = Math.min(baseDelay * exponentialPart, maxDelay);
    
    // Add jitter (± 15%) to prevent reconnection storms
    const jitter = 0.3 * delay * (Math.random() - 0.5);
    delay = Math.max(1000, Math.floor(delay + jitter));
    
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
    
    // Stop message queue processing
    this.stopQueueProcessing();
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
    
    // Improved reset strategy that's gentler with reconnection attempts
    if (this.reconnectAttempts > 5) {
      this.reconnectAttempts = Math.floor(this.reconnectAttempts / 2);
    } else {
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
  
  // Get number of queued messages - useful for debugging
  public getQueueStatus(): {length: number, processing: boolean} {
    return {
      length: this.messageQueue.length,
      processing: this.isProcessingQueue
    };
  }
  
  // Enhanced connection health check - returns a score from 0-100
  public getConnectionHealth(): number {
    if (!this.isOpen()) return 0;
    return Math.round(this.connectionHealth);
  }
  
  // Check time since last message
  public getLastMessageAge(): number {
    return Date.now() - this.lastMessageReceived;
  }
}
