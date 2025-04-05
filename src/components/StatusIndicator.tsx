
import React from 'react';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  label: string;
  className?: string;
}

const StatusIndicator = ({ status, label, className }: StatusIndicatorProps) => {
  return (
    <div className={cn("connection-status", className)}>
      <div className={cn(
        "status-dot",
        status === 'connected' && "status-connected",
        status === 'disconnected' && "status-disconnected",
        status === 'connecting' && "status-connecting",
      )} />
      <span>{label}: {status}</span>
    </div>
  );
};

export default StatusIndicator;
