
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, WifiOff, Wifi } from 'lucide-react';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  label: string;
  className?: string;
  showTooltip?: boolean;
}

const StatusIndicator = ({ 
  status, 
  label, 
  className,
  showTooltip = true 
}: StatusIndicatorProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi size={12} className="mr-1.5 text-green-500" />;
      case 'disconnected':
        return <WifiOff size={12} className="mr-1.5 text-red-500" />;
      case 'connecting':
        return <Clock size={12} className="mr-1.5 text-yellow-500 animate-pulse" />;
    }
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
          <p className="text-xs">
            {label} is {status}
            {status === 'connecting' && '...'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusIndicator;
