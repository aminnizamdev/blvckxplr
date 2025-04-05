
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, WifiOff, Wifi, AlertCircle } from 'lucide-react';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  label: string;
  className?: string;
  showTooltip?: boolean;
  lastConnected?: Date | null;
  reconnectAttempts?: number;
}

const StatusIndicator = ({ 
  status, 
  label, 
  className,
  showTooltip = true,
  lastConnected = null,
  reconnectAttempts = 0
}: StatusIndicatorProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi size={14} className="mr-1.5 text-green-500" />;
      case 'disconnected':
        return <WifiOff size={14} className="mr-1.5 text-red-500" />;
      case 'connecting':
        return <Clock size={14} className="mr-1.5 text-yellow-500 animate-pulse" />;
    }
  };
  
  // Format time since last connection
  const getTimeSinceLastConnected = () => {
    if (!lastConnected) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastConnected.getTime();
    
    if (diffMs < 1000) return 'Just now';
    if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    return `${Math.floor(diffMs / 3600000)}h ago`;
  };
  
  const content = (
    <div className={cn(
      "connection-status rounded-full px-2 py-1 text-xs flex items-center",
      status === 'connected' && "bg-green-500/10 text-green-500 border border-green-500/20",
      status === 'disconnected' && "bg-red-500/10 text-red-500 border border-red-500/20",
      status === 'connecting' && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
      className
    )}>
      {getStatusIcon()}
      <span>{label}</span>
      {status === 'connecting' && reconnectAttempts > 0 && (
        <span className="ml-1 text-xs opacity-70">({reconnectAttempts})</span>
      )}
    </div>
  );
  
  if (!showTooltip) return content;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-xs font-medium">
              {label} is {status}
              {status === 'connecting' && '...'}
            </p>
            
            {status === 'disconnected' && lastConnected && (
              <p className="text-xs flex items-center text-muted-foreground">
                <AlertCircle size={12} className="mr-1" />
                Last connected: {getTimeSinceLastConnected()}
              </p>
            )}
            
            {status === 'connecting' && reconnectAttempts > 0 && (
              <p className="text-xs text-yellow-500">
                Reconnection attempt: {reconnectAttempts}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusIndicator;
